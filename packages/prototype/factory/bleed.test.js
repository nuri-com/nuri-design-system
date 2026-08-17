/* Bleed custom-element contract + the explicit no-Bleed static-output guard. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' });
for (const key of ['window', 'document', 'customElements', 'HTMLElement', 'MutationObserver', 'Node', 'CustomEvent']) {
  globalThis[key] = key === 'window' ? dom.window : dom.window[key];
}

const { mergeAttrs } = await import('../factory/factory.js');
const { assertBleedChildren } = await import('../primitives/bleed.js');

test('<nuri-bleed> resolves exactly top | bottom | x | y through the factory attr path', () => {
  const bleed = document.createElement('nuri-bleed');
  bleed.setAttribute('top', 'xl');
  bleed.setAttribute('bottom', 'lg');
  bleed.setAttribute('x', 'md');
  bleed.setAttribute('y', 'sm');
  bleed.append(document.createElement('button'));
  document.body.append(bleed);

  assert.deepEqual([...bleed.classList], ['nuri-bleed']);
  assert.deepEqual(
    Object.fromEntries(['top', 'bottom', 'x', 'y'].map((attr) => [attr, bleed.getAttribute(`data-${attr}`)])),
    { top: 'xl', bottom: 'lg', x: 'md', y: 'sm' },
  );
  assert.equal(bleed.children.length, 1, 'the containing element owns the complete interactive child box');
});

test('<nuri-bleed> enforces the one-child contract', () => {
  const empty = document.createElement('nuri-bleed');
  assert.throws(() => assertBleedChildren(empty), /expects exactly one child; received 0/);

  const multiple = document.createElement('nuri-bleed');
  multiple.append(document.createElement('span'), document.createElement('span'));
  assert.throws(() => assertBleedChildren(multiple), /expects exactly one child; received 2/);
});

test('no-Bleed static composition output is byte-identical', () => {
  const output = JSON.stringify(mergeAttrs({
    stack: { direction: 'row', gap: 'md' },
    box: { paddingX: 'lg' },
    palette: { chrome: 'canvas' },
  }));
  assert.equal(
    output,
    '{"classes":["nuri-stack","nuri-box","nuri-palette"],"data":{"data-direction":"row","data-gap":"md","data-padding-x":"lg","data-chrome":"canvas"}}',
  );
});
