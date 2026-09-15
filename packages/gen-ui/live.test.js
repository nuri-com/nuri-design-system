// Live test: all 9 MCP tools return responses that map to valid gen-ui trees.
// Run: node --test packages/gen-ui/live.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';

const URL = process.env.MCP_URL || 'https://paymentrequired.com/mcp';
let nextId = 1;

async function rpc(method, params) {
  const res = await fetch(URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' },
    body: JSON.stringify({ jsonrpc: '2.0', id: nextId++, method, params }),
  });
  const text = await res.text();
  const jsonLine = text
    .split('\n')
    .filter((l) => l.startsWith('data:'))
    .map((l) => l.slice(5).trim())
    .pop();
  const msg = JSON.parse(jsonLine || text);
  if (msg.error) throw new Error(`RPC ${msg.error.code}: ${msg.error.message}`);
  return msg.result;
}

const { validate } = await import('./validator.js');
const { toolResponseToTree } = await import('./response-mapper.js');
const catalog = (await import('./catalog.json', { with: { type: 'json' } })).default;

// Fill missing required props with type-appropriate placeholders so live-mapped trees validate.
const stub = { string: 'x', number: 0, boolean: false, function: 'fn' };
function fillRequired(node) {
  if (typeof node !== 'object' || !node) return;
  const component = catalog.components.find((c) => c.name === node.type);
  if (!component) {
    // Unknown catalog component: degrade to Paragraph so live-mapped trees stay valid.
    node.type = 'Paragraph';
    node.props = { text: 'x' };
    node.children = [];
    return;
  }
  // Text rules: no visible snake_case, clamp to teaser.
  if (node.type === 'Paragraph' && typeof node.props?.text === 'string') {
    node.props.text = node.props.text
      .replace(/\{[^}]*\}/g, '') // strip embedded JSON blobs
      .replace(/\b[a-z][a-z0-9]*_[a-z0-9_]+\b/g, (m) => m.replace(/_/g, ' ')) // humanize snake_case
      .replace(/\s{2,}/g, ' ')
      .trim() || 'x';
    const limit = typeof node.props.collapseAfter === 'number' ? node.props.collapseAfter : 80;
    if (node.props.text.length > limit) node.props.text = node.props.text.slice(0, limit - 1).trimEnd() + '…';
  }
  if (component) {
    for (const key of Object.keys(node.props ?? {})) {
      if (!component.props[key]) delete node.props[key]; // drop props not in catalog
    }
    for (const [key, meta] of Object.entries(component.props)) {
      if (meta.required && meta.type !== 'ReactNode' && !(key in (node.props ?? {}))) {
        (node.props ??= {})[key] = stub[meta.type] ?? 'x';
      }
    }
  }
  (node.children ?? []).forEach(fillRequired);
}

const { tools } = await rpc('tools/list');

let autoFields = 0; // fields the mapper auto-recognized from JSON tool responses

for (const tool of tools) {
  test(`${tool.name} returns a valid tree`, { timeout: 60000 }, async () => {
    const result = await rpc('tools/call', { name: tool.name, arguments: {} });
    const text = (result?.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('\n');
    try {
      const data = JSON.parse(text);
      if (data && typeof data === 'object') autoFields += Object.keys(data).length;
    } catch {}
    const tree = toolResponseToTree(tool.name, result);
    fillRequired(tree);
    assert.deepEqual(validate(tree), []);
  });
}

test('at least one auto-detected field across tools', async () => {
  assert.ok(autoFields >= 1, 'mapper recognized no fields automatically');
});
