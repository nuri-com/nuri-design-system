import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' });
for (const key of ['window', 'document', 'customElements', 'HTMLElement']) {
  globalThis[key] = key === 'window' ? dom.window : dom.window[key];
}

await import('../primitives/icon.js');

test('motion icon renders its composite and keeps its catalog SVG as the reduced-motion fallback', () => {
  const icon = document.createElement('nuri-icon');
  icon.setAttribute('name', 'spinner');
  document.body.appendChild(icon);

  assert.equal(icon.dataset.motion, 'ring');
  assert.equal(icon.querySelectorAll('.nuri-spinner--ring > i').length, 4);
  assert.ok(icon.querySelector('.nuri-spinner-static svg'));
});

test('static icon keeps the direct SVG fast path', () => {
  const icon = document.createElement('nuri-icon');
  icon.setAttribute('name', 'apple');
  document.body.appendChild(icon);

  assert.equal(icon.dataset.motion, undefined);
  assert.equal(icon.children.length, 1);
  assert.equal(icon.firstElementChild?.tagName.toLowerCase(), 'svg');
  assert.equal(icon.querySelector('.nuri-spinner'), null);
});

test('ripple motion icon renders two production rings', () => {
  const icon = document.createElement('nuri-icon');
  icon.setAttribute('name', 'spinner-ripple');
  document.body.appendChild(icon);

  assert.equal(icon.dataset.motion, 'ripple');
  assert.equal(icon.querySelectorAll('.nuri-spinner--ripple > i').length, 2);
  assert.ok(icon.querySelector('.nuri-spinner-static svg'));
});

test('quarter motion icon renders three clipped production arcs', () => {
  const icon = document.createElement('nuri-icon');
  icon.setAttribute('name', 'spinner-quarter');
  document.body.appendChild(icon);

  assert.equal(icon.dataset.motion, 'quarter');
  assert.equal(icon.querySelectorAll('.nuri-spinner--quarter > i').length, 3);
  assert.ok(icon.querySelector('.nuri-spinner-static svg'));
});
