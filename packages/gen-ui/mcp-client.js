#!/usr/bin/env node
// Minimal MCP JSON-RPC-over-HTTP client: --list and --call <tool> [json-args]
const URL = process.env.MCP_URL || 'https://paymentrequired.com/mcp';

let nextId = 1;

async function rpc(method, params) {
  const res = await fetch(URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' },
    body: JSON.stringify({ jsonrpc: '2.0', id: nextId++, method, params }),
  });
  const text = await res.text();
  // Handle SSE framing if server responds with event-stream
  const jsonLine = text
    .split('\n')
    .filter((l) => l.startsWith('data:'))
    .map((l) => l.slice(5).trim())
    .pop();
  const msg = JSON.parse(jsonLine || text);
  if (msg.error) throw new Error(`RPC ${msg.error.code}: ${msg.error.message}`);
  return msg.result;
}

async function main() {
  const [, , cmd, ...rest] = process.argv;
  if (cmd === '--list') {
    const { tools } = await rpc('tools/list');
    for (const t of tools) console.log(`${t.name}\t${t.title || ''}`);
    console.error(`(${tools.length} tools)`);
  } else if (cmd === '--call') {
    const [name, argsJson] = rest;
    const result = await rpc('tools/call', { name, arguments: argsJson ? JSON.parse(argsJson) : {} });
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.error('usage: mcp-client.js --list | --call <tool> [json-args]');
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
