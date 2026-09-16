// MCP session layer: lazy connect, captures session from tool results,
// auto-injects it into later calls, never exposes it.
const URL = process.env.MCP_URL || 'https://paymentrequired.com/mcp';

let nextId = 1;
let session = null; // private: never leaves this module
let connected = null; // in-flight connect promise
const listeners = new Set();

function emit(state) {
  for (const cb of listeners) cb(state);
}

export function onState(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

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

export function connect() {
  return (connected ??= (async () => {
    const { tools } = await rpc('tools/list');
    emit({ connected: true, tools: tools.map((t) => t.name) });
    return tools;
  })().catch((e) => {
    connected = null;
    emit({ connected: false, error: e.message });
    throw e;
  }));
}

// Extract structured payload from a tool result.
function payload(result) {
  if (result?.structuredContent) return result.structuredContent;
  const text = (result?.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('\n');
  try {
    return JSON.parse(text);
  } catch {
    return { text };
  }
}

export async function call(name, args = {}) {
  await connect();
  const withSession = session && !('session' in args) ? { ...args, session } : args;
  const result = await rpc('tools/call', { name, arguments: withSession });
  const data = payload(result);
  if (typeof data?.session === 'string' && data.session !== session) {
    session = data.session; // captured, injected, hidden
  }
  const { session: _drop, ...rest } = data; // strip session from what callers see
  return { ...result, data: rest };
}
