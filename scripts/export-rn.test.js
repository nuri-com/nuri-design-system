import { test } from 'node:test';
import assert from 'node:assert/strict';

import { FORBIDDEN, rewriteSpecImports, findForbiddenSpecifiers } from './export-rn.mjs';

// The pre-fix gate predicate, kept here to PROVE the new cases are red against
// the old code: it only inspected import/export-prefixed lines.
const oldGateFlags = (src) =>
  src.split('\n').some((line) => /^\s*(import|export)\b/.test(line) && FORBIDDEN.test(line));

// A minimal spec-exports map + layout, mirroring the real exporter's inputs.
const specMap = new Map([['@nuri/spec/colours', 'tokens/colours.ts']]);
const internalDir = '/vendor/internal';
const file = '/vendor/internal/rn/tokens/theme.ts';

test('case 1 · inline import() of @nuri/spec is rewritten to a relative path', () => {
  const src = "const c = await import('@nuri/spec/colours');\n";
  const { src: out, changed } = rewriteSpecImports(src, { file, specMap, internalDir });

  assert.equal(changed, true);
  assert.doesNotMatch(out, /@nuri\//, 'no @nuri/ specifier may survive the rewrite');
  assert.match(out, /import\((['"])\.\.?\/[^'"]*colours\1\)/, 'a relative path replaced it');

  // Red pre-fix: the old rewrite only matched `from '…'`, leaving import() untouched.
});

test('case 1b · static `from` import of @nuri/spec is still rewritten', () => {
  const src = "import { light } from '@nuri/spec/colours';\n";
  const { src: out, changed } = rewriteSpecImports(src, { file, specMap, internalDir });

  assert.equal(changed, true);
  assert.doesNotMatch(out, /@nuri\//);
  assert.match(out, /from (['"])\.\.?\/[^'"]*colours\1/);
});

test('rewrite throws when a @nuri/spec subpath is not in the exports map', () => {
  assert.throws(
    () => rewriteSpecImports("import x from '@nuri/spec/unknown';", { file, specMap, internalDir }),
    /has no entry in the spec exports map/,
  );
});

test('case 2 · inline import() of a forbidden anim lib is flagged by the gate', () => {
  const src = "const sheet = import('@gorhom/bottom-sheet');\n";

  assert.deepEqual(findForbiddenSpecifiers(src), ['@gorhom/bottom-sheet']);
  assert.equal(oldGateFlags(src), false, 'confirmed red: the old line-prefix gate missed it');
});

test('case 2b · multi-line `from` continuation to @nuri/spec is flagged by the gate', () => {
  const src = ['import {', '  light,', '} from "@nuri/spec/colours";', ''].join('\n');

  assert.deepEqual(findForbiddenSpecifiers(src), ['@nuri/spec/colours']);
  assert.equal(oldGateFlags(src), false, 'confirmed red: the forbidden name sat on a continuation line');
});

test('case 2c · require() of a forbidden lib is flagged by the gate', () => {
  const src = "const r = require('react-native-reanimated');\n";
  assert.deepEqual(findForbiddenSpecifiers(src), ['react-native-reanimated']);
});

test('case 3 · a comment mentioning a forbidden name is NOT flagged (no false positive)', () => {
  const src = [
    '// historically this file imports from @nuri/spec/colours directly',
    '/* @gorhom/bottom-sheet is the native engine; see docs */',
    "import { View } from 'react-native';",
    '',
  ].join('\n');

  assert.deepEqual(findForbiddenSpecifiers(src), [], 'prose mentioning a forbidden name must not fail the gate');
});

test('allowed externals survive the gate', () => {
  const src = [
    "import { View } from 'react-native';",
    "import Svg from 'react-native-svg';",
    "import React from 'react';",
  ].join('\n');
  assert.deepEqual(findForbiddenSpecifiers(src), []);
});

test('case 4 · a plain-JS spec target ships its adjacent .d.ts companion (full run)', async () => {
  // Regression: the spec-copy closure follows IMPORTS, but a .d.ts companion is
  // discovered by tsc via ADJACENCY — no import names it. alpha.6's classifier
  // (composition/classify.js + classify.d.ts) shipped typeless until the
  // consumer's pull script patched around it (design-system-probe PR #3).
  const { execFileSync } = await import('node:child_process');
  const { mkdtempSync, rmSync, existsSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const out = mkdtempSync(join(tmpdir(), 'export-rn-dts-'));
  try {
    execFileSync('node', ['scripts/export-rn.mjs', out], { stdio: 'pipe' });
    assert.ok(existsSync(join(out, 'internal', 'spec', 'composition', 'classify.js')), 'runtime .js exported');
    assert.ok(
      existsSync(join(out, 'internal', 'spec', 'composition', 'classify.d.ts')),
      'the adjacent .d.ts companion must ship with a plain-JS spec target',
    );
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});
