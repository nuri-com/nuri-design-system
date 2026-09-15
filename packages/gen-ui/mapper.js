#!/usr/bin/env node
// Mapper: MCP tool inputSchema (JSON Schema) -> gen-ui tree, and form values -> tools/call args.
// Components come from catalog.json only.

// JSON Schema property -> catalog component
function fieldComponent(name, prop, required) {
  if (prop.enum) return { component: 'Dropdown', options: prop.enum };
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
  return propName.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// Field classification from description cues
function fieldClass(prop) {
  const d = prop.description || '';
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
    class: fieldClass(prop),
    helper: prop.description,
    collapseAfter: 80,
    required: required.has(propName),
    ...fieldComponent(propName, prop, required.has(propName)),
  }));
  return {
    component: 'Card',
    props: { title: title || name },
    children: [
      ...(tool.description
        ? [{ component: 'Paragraph', props: { text: tool.description, collapseAfter: 80 } }]
        : []),
      ...fields,
      { component: 'Button', props: { label: title || name, onPress: `submit:${name}` } },
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
  console.log('tools/call args:', JSON.stringify(valuesToArgs(values, FIXTURE.inputSchema)));
}
