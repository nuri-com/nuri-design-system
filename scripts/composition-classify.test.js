import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { classifyComposition } from '../packages/spec/composition/classify.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SOURCE = resolve(__dirname, '../packages/spec/composition/classify.js');
const TWIN = resolve(__dirname, '../packages/prototype/generated/composition-classify.js');

const leaf = (name) => ({ name, el: 'text', children: [] });
const host = (name, children = []) => ({ name, el: 'view', children });
const classify = (node, entries, overrides = {}) => classifyComposition(node, entries, {
  ambientContent: {},
  isHostEl: (el) => el === 'view' || el === 'pressable',
  isMultiPart: () => false,
  errorPrefix: '[test]',
  ...overrides,
});

test('classifies own/direct/group/static entries and preserves authored order', () => {
  const input = leaf('input');
  input.el = 'input';
  const node = host('root', [leaf('leading'), input, host('region', [leaf('nested')]), leaf('trailing')]);
  const own = { part: 'root', content: 'own' };
  const nestedA = { part: 'nested', content: 'a' };
  const direct = { part: 'trailing', content: 'tail' };
  const nestedB = { part: 'nested', content: 'b' };

  const result = classify(node, [own, nestedA, direct, nestedB], { inputTarget: 'input' });

  assert.deepEqual(result.ordered.map((item) => item.kind), ['own', 'static', 'group', 'direct']);
  assert.equal(result.ordered[0].entry, own);
  assert.equal(result.ordered[2].part, 'region');
  assert.deepEqual(result.grouped.get('region').entries, [nestedA, nestedB]);
  assert.equal(result.ordered[3].entry, direct);
});

test('inserts the static input sibling at its anatomy position', () => {
  const node = host('root', [leaf('before'), host('input-shell', [leaf('input')]), leaf('after')]);
  const result = classify(node, [
    { part: 'after', content: 'A' },
    { part: 'before', content: 'B' },
  ], { inputTarget: 'input' });

  assert.deepEqual(
    result.ordered.map((item) => item.kind === 'direct' ? item.entry.part : item.child.name),
    ['input-shell', 'after', 'before'],
  );
});

test('throws with the injected prefix when a singular part is targeted twice', () => {
  const node = host('root', [leaf('item')]);
  assert.throws(
    () => classify(node, [{ part: 'item' }, { part: 'item' }], { errorPrefix: 'nuri-factory:' }),
    /nuri-factory: slot targeting part 'item' is singular — it appears 2 times under 'root'/,
  );
});

test('allows repeated targets only through the injected multiple policy', () => {
  const node = host('root', [leaf('item')]);
  const result = classify(node, [{ part: 'item' }, { part: 'item' }], { isMultiPart: (part) => part === 'item' });
  assert.deepEqual(result.ordered.map((item) => item.entry.part), ['item', 'item']);
});

test('lifts label composition into ambient content without overwriting authored ambient content', () => {
  const node = host('root', [leaf('label')]);
  const lifted = classify(node, [{ part: 'label', content: 'Composition label' }], {
    ambientContent: { untouched: 'yes' },
    labelPart: 'label',
  });
  assert.deepEqual(lifted.ambientContent, { untouched: 'yes', label: 'Composition label' });

  const preserved = classify(node, [{ part: 'label', content: 'Composition label' }], {
    ambientContent: { label: 'Ambient label' },
    labelPart: 'label',
  });
  assert.equal(preserved.ambientContent.label, 'Ambient label');
});

test('generated browser classifier is a fresh verbatim copy below its header', async () => {
  const [source, twin] = await Promise.all([readFile(SOURCE, 'utf8'), readFile(TWIN, 'utf8')]);
  const split = twin.indexOf('\n\n');
  assert.notEqual(split, -1, 'generated classifier is missing its header separator');
  assert.match(twin.slice(0, split), /GENERATED · DO NOT EDIT BY HAND/);
  assert.equal(twin.slice(split + 2), source, 'generated composition classifier is stale — run `npm run build`');
});
