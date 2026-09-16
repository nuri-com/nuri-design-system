// Guardrail + smoke tests for the gen-ui app.
// Run: node --test packages/gen-ui/app/app.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { jargonViolations, helpersPerScreen } from './guard.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

test('user-visible copy contains no session/connect_wallet/request_id/idempotency/schema jargon', () => {
  assert.deepEqual(jargonViolations(), []);
});

test('every screen has at most one helper text', () => {
  for (const [screen, count] of Object.entries(helpersPerScreen())) {
    assert.ok(count <= 1, `${screen} has ${count} helper texts`);
  }
});

test('serve.js serves /app and /api/call answers live', async (t) => {
  const port = 4397;
  const srv = spawn(process.execPath, [join(ROOT, 'serve.js')], {
    env: { ...process.env, PORT: String(port), NO_OPEN: '1' },
    stdio: 'ignore',
  });
  t.after(() => srv.kill());
  const base = `http://localhost:${port}`;

  // wait for listen
  let up = false;
  for (let i = 0; i < 50 && !up; i++) {
    up = await fetch(`${base}/app`).then((r) => r.ok).catch(() => false);
    if (!up) await new Promise((r) => setTimeout(r, 100));
  }
  assert.ok(up, 'server did not start');

  const app = await fetch(`${base}/app`);
  assert.equal(app.status, 200);
  assert.match(await app.text(), /ds-root/);

  const call = await fetch(`${base}/api/call`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'get_account_status', arguments: {} }),
    signal: AbortSignal.timeout(20000),
  });
  assert.equal(call.status, 200);
  assert.match(call.headers.get('content-type'), /text\/html/);
  assert.ok((await call.text()).length > 0);
});
