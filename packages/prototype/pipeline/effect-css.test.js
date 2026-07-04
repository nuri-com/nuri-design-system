/* ──────────────────────────────────────────────────────────────
 * NURI · EFFECT CSS FRESHNESS
 * ────────────────────────────────────────────────────────────── */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { generateEffect } from './css-preview.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = resolve(__dirname, '..');

test('effect.css re-emits from the web projection effect realization', async () => {
  const generated = await generateEffect();
  assert.equal(generated.ns, 'effect');
  assert.equal(
    readFileSync(resolve(PKG_ROOT, 'styles/effect.css'), 'utf8'),
    generated.css,
    'packages/prototype/styles/effect.css is stale — re-run `npm run build`.',
  );
});
