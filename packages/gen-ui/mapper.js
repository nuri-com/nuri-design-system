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

// inputSchema -> UI tree: Card > fields... > submit Button
export function schemaToTree(tool) {
  const { name, title, inputSchema = {} } = tool;
  const required = new Set(inputSchema.required || []);
  const fields = Object.entries(inputSchema.properties || {}).map(([propName, prop]) => ({
    key: propName,
    label: (prop.title || propName).replace(/_/g, ' '),
    helper: prop.description,
    required: required.has(propName),
    ...fieldComponent(propName, prop, required.has(propName)),
  }));
  return {
    component: 'Card',
    props: { title: title || name },
    children: [
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
  inputSchema: {
    type: 'object',
    properties: {
      recipient_id: { type: 'string', description: 'Recipient ID' },
      amount: { type: 'number', description: 'Amount in EUR' },
      reference: { type: 'string', description: 'Payment reference' },
      urgent: { type: 'boolean', description: 'Instant payout' },
      method: { type: 'string', title: 'Method', enum: ['sepa', 'instant', 'swift'], description: 'Payout method' },
    },
    required: ['recipient_id', 'amount'],
  },
};

if (process.argv.includes('--demo')) {
  const tree = schemaToTree(FIXTURE);
  console.log('UI tree:');
  console.log(JSON.stringify(tree, null, 2));
  const values = { recipient_id: 'rec_42', amount: '19.99', reference: 'invoice 7', urgent: 'true' };
  console.log('\nForm values:', JSON.stringify(values));
  console.log('tools/call args:', JSON.stringify(valuesToArgs(values, FIXTURE.inputSchema)));
}
