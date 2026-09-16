#!/usr/bin/env node
// Mapper: MCP tool inputSchema (JSON Schema) -> gen-ui tree, and form values -> tools/call args.
// Components come from catalog.json only.

// snake_case / SCREAMING_CASE / kebab -> Title Case label
function humanize(s) {
  return String(s).replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// Generic keyword -> icon key map
const ICON_KEYWORDS = [
  [/send|transfer|payout|pay/i, 'send'],
  [/receive|request|top.?up|deposit|add/i, 'receive'],
  [/user|person|recipient|contact|customer/i, 'person'],
  [/card/i, 'card'],
  [/bank|iban|account/i, 'bank'],
  [/search|lookup|find/i, 'search'],
  [/setting|config|preference/i, 'settings'],
  [/delete|remove|cancel/i, 'trash'],
  [/edit|update|change/i, 'edit'],
  [/history|list|transaction|activity/i, 'list'],
  [/warning|alert|urgent|instant/i, 'alert'],
  [/check|confirm|verify|success|done/i, 'check'],
  [/info|help|about|detail/i, 'info'],
  [/lock|secure|auth|login|password/i, 'lock'],
  [/time|schedule|date|calendar/i, 'calendar'],
];

function iconFor(text) {
  for (const [re, icon] of ICON_KEYWORDS) if (re.test(text)) return icon;
  return undefined;
}

// Status keyword -> color group
const STATUS_COLORS = [
  [/success|complete|done|paid|active|ok|approved|confirmed/i, 'success'],
  [/pending|process|wait|review|hold|progress/i, 'warn'],
  [/fail|error|reject|declin|cancel|expired|blocked/i, 'error'],
  [/info|new|draft|open|created|unknown/i, 'info'],
];

function statusColor(text) {
  for (const [re, color] of STATUS_COLORS) if (re.test(text)) return color;
  return 'info';
}

// JSON Schema property -> catalog component
function fieldComponent(name, prop, required) {
  if (prop.enum) {
    const status = /status|state/i.test(name);
    return {
      component: 'Dropdown',
      options: prop.enum.map((v) => ({
        value: v,
        label: humanize(v),
        ...(iconFor(v) ? { icon: iconFor(v) } : {}),
        ...(status ? { color: statusColor(v) } : {}),
      })),
    };
  }
  switch (prop.type) {
    case 'number':
    case 'integer':
      if (/amount|sum|price|value/i.test(name)) return { component: 'AmountInput' };
      return { component: 'InputField', keyboardType: 'numeric' };
    case 'boolean':
      return { component: 'Switch' };
    default: {
      const f = { component: 'InputField', keyboardType: 'default' };
      if (/email/i.test(name) || prop.format === 'email') f.keyboardType = 'email-address';
      return f;
    }
  }
}

// Human label: first sentence of description, else snake_case -> Title Case
function fieldLabel(propName, prop) {
  const desc = (prop.description || '').split(/(?<=[.!?])\s/)[0]?.trim();
  if (desc) return desc;
  return humanize(propName);
}

// Field classification from name and description cues
function fieldClass(name, prop) {
  const d = prop.description || '';
  if (/status|state/i.test(name)) return 'status';
  if (/amount|sum|price|total|currency/i.test(name)) return 'amount';
  if (/earlier result|earlier reference|previous result|reference id/i.test(d)) return 'auto';
  if (/leave out|unless/i.test(d)) return 'advanced';
  return 'normal';
}

// inputSchema -> UI tree: Card > fields... > submit Button
export function schemaToTree(tool) {
  const { name, title, inputSchema = {} } = tool;
  const required = new Set(inputSchema.required || []);
  const fields = Object.entries(inputSchema.properties || {}).map(([propName, prop]) => ({
    key: propName,
    label: fieldLabel(propName, prop),
    class: fieldClass(propName, prop),
    helper: prop.description,
    collapseAfter: 80,
    required: required.has(propName),
    ...fieldComponent(propName, prop, required.has(propName)),
  }));

  // Group amount + currency fields into one class:'amount' field group
  const grouped = [];
  const amountKey = fields.find((f) => f.class === 'amount' && /amount|sum|price|total|value/i.test(f.key))?.key;
  const currencyKey = fields.find((f) => /currency/i.test(f.key))?.key;
  for (const f of fields) {
    if (f.key === amountKey && currencyKey && currencyKey !== amountKey) {
      const cur = fields.find((x) => x.key === currencyKey);
      grouped.push({ ...f, class: 'amount', currency: { key: cur.key, options: cur.options, label: cur.label } });
    } else if (f.key === currencyKey && amountKey) {
      continue; // merged into amount group
    } else {
      grouped.push(f);
    }
  }

  const icon = iconFor(name) || iconFor(title || '');
  return {
    component: 'Card',
    props: { title: title || name, ...(icon ? { icon } : {}) },
    children: [
      ...(tool.description
        ? [{ component: 'Paragraph', props: { text: tool.description, collapseAfter: 80 } }]
        : []),
      ...grouped,
      { component: 'Button', props: { label: title || name, icon, onPress: `submit:${name}` } },
    ],
  };
}

// Raw form values (strings) -> typed tools/call arguments per schema
export function valuesToArgs(values, inputSchema = {}) {
  const props = inputSchema.properties || {};
  const args = {};
  for (const [key, raw] of Object.entries(values)) {
    if (raw === undefined || raw === '') continue;
    const type = props[key]?.type;
    if (type === 'number' || type === 'integer') args[key] = Number(raw);
    else if (type === 'boolean') args[key] = raw === true || raw === 'true';
    else args[key] = raw;
  }
  return args;
}

const FIXTURE = {
  name: 'payouts',
  title: 'Send money to a saved recipient',
  description: 'Create a payout to a recipient you have paid before. SEPA arrives in 1-2 business days.',
  inputSchema: {
    type: 'object',
    properties: {
      recipient_id: { type: 'string', description: 'Reference to an earlier result of a saved recipient lookup.' },
      amount: { type: 'number', description: 'How much do you want to send? Amount in EUR.' },
      currency: { type: 'string', enum: ['eur', 'usd', 'gbp'], description: 'Currency of the amount.' },
      transfer_status: { type: 'string', enum: ['pending_review', 'completed', 'failed'], description: 'Current status.' },
      reference: { type: 'string', description: 'Payment reference shown to the recipient.' },
      urgent: { type: 'boolean', description: 'Leave out unless you need an instant payout.' },
      note_for_recipient: { type: 'string' },
      method: { type: 'string', title: 'Method', enum: ['sepa', 'instant', 'swift'], description: 'Payout method' },
    },
    required: ['recipient_id', 'amount'],
  },
};

if (typeof process !== 'undefined' && process.argv?.includes('--demo')) {
  const tree = schemaToTree(FIXTURE);
  console.log('UI tree:');
  console.log(JSON.stringify(tree, null, 2));
  const values = { recipient_id: 'rec_42', amount: '19.99', reference: 'invoice 7', urgent: 'true' };
  console.log('\nForm values:', JSON.stringify(values));
  values.currency = 'eur';
  console.log('tools/call args:', JSON.stringify(valuesToArgs(values, FIXTURE.inputSchema)));
}
