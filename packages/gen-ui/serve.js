#!/usr/bin/env node
// Demo server: static files + MCP proxy. `npm run demo` starts it and opens the browser.
// GET  /                      demo page
// GET  /api/tools             tools/list (proxied)
// POST /api/call {name,arguments}  tools/call -> gen-ui tree -> rendered HTML
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec } from 'node:child_process';
import { toolResponseToTree } from './response-mapper.js';
import { renderNode } from './renderer.js';

const MCP_URL = process.env.MCP_URL || 'https://paymentrequired.com/mcp';
const PORT = process.env.PORT || 4173;
const ROOT = dirname(fileURLToPath(import.meta.url));

let nextId = 1;
async function rpc(method, params) {
  const res = await fetch(MCP_URL, {
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

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf' };

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  try {
    if (url.pathname === '/api/tools') {
      const { tools } = await rpc('tools/list');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(tools));
    }
    if (url.pathname === '/api/call' && req.method === 'POST') {
      let body = '';
      for await (const chunk of req) body += chunk;
      const { name, arguments: args } = JSON.parse(body || '{}');
      const result = await rpc('tools/call', { name, arguments: args || {} });
      const tree = toolResponseToTree(name, result);
      res.writeHead(200, { 'Content-Type': 'text/html' });
      return res.end(renderNode(tree));
    }
    // static
    const rel = url.pathname === '/' ? 'demo/index.html' : url.pathname === '/app' ? 'app/index.html' : url.pathname.replace(/^\/+/, '');
    const DS = join(ROOT, '..', '..', 'ds-bundle');
    const file = url.pathname.startsWith('/prototype/')
      ? join(ROOT, '..', 'prototype', rel.slice('prototype/'.length))
      : url.pathname.startsWith('/ds/')
      ? join(DS, rel.slice('ds/'.length))
      : join(ROOT, rel);
    if (!file.startsWith(ROOT) && !file.startsWith(join(ROOT, '..', 'prototype')) && !file.startsWith(DS)) throw new Error('forbidden');
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' });
    res.end(data);
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end(e.message);
  }
});

server.listen(PORT, () => {
  const demoUrl = `http://localhost:${PORT}/`;
  console.log(`gen-ui demo: ${demoUrl}  (MCP: ${MCP_URL})`);
  if (!process.env.NO_OPEN) exec(`open "${demoUrl}"`);
});
