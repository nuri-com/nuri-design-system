/* ══════════════════════════════════════════════════════════════════
 * NURI · WEB · distribute="even" child-wrapping (jsdom · node --test)
 * ──────────────────────────────────────────────────────────────────
 * The DOM half of the parent-side even split. Web has no `> *` reach THROUGH a
 * display:contents component host, so the layout primitives WRAP each direct
 * child in a real `.nuri-stack` box the `[data-distribute="even"] > *` rule sizes
 * (the CSS half is pinned in pipeline/css-preview.test.js). This exercises the
 * `#syncDistribute` add + remove paths in view.js and stack.js — the wrap on
 * connect, and the unwrap when `distribute` is flipped off. Computed flex is NOT
 * assertable in jsdom (no stylesheet application), so this asserts the STRUCTURE;
 * the CSS test proves the `> *` rule that sizes the wrappers.
 * ══════════════════════════════════════════════════════════════════ */
import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

// jsdom globals installed BEFORE the primitive modules evaluate (they `extends
// HTMLElement` + `customElements.define` at module-eval time).
const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' });
for (const key of ['window', 'document', 'customElements', 'HTMLElement', 'MutationObserver', 'Node', 'CustomEvent']) {
  globalThis[key] = key === 'window' ? dom.window : dom.window[key];
}
await import('../primitives/view.js');  // registers <nuri-view>
await import('../primitives/stack.js'); // registers <nuri-stack>

const mount = (el) => { dom.window.document.body.appendChild(el); return el; };
const isWrapper = (el) => el.dataset.nuriDistributeWrapper !== undefined;
const makeChildren = (host, labels) => {
  for (const label of labels) {
    const b = host.ownerDocument.createElement('button');
    b.textContent = label;
    host.appendChild(b);
  }
};

test('<nuri-view distribute="even"> wraps EACH direct child in a `.nuri-stack` [data-nuri-distribute-wrapper] box', () => {
  const v = document.createElement('nuri-view');
  v.setAttribute('direction', 'row');
  v.setAttribute('distribute', 'even');
  makeChildren(v, ['A', 'Bee', 'Charlie']);
  mount(v); // connectedCallback → #sync + #syncDistribute (wraps synchronously)

  const wrappers = [...v.children];
  assert.equal(wrappers.length, 3, 'one wrapper per direct child');
  for (const w of wrappers) {
    assert.ok(isWrapper(w), 'each direct child is a distribute wrapper');
    assert.ok(w.classList.contains('nuri-stack'), 'the wrapper is a real `.nuri-stack` box (what the `> *` rule sizes)');
    assert.equal(w.children.length, 1, 'the wrapper holds exactly the one original child');
    assert.equal(w.firstElementChild.tagName, 'BUTTON');
  }
  // the row host itself carries the gate the CSS keys on
  assert.equal(v.getAttribute('data-distribute'), 'even', 'the host advertises data-distribute for the `> *` combinator');
});

test('flipping distribute OFF UNWRAPS — the original children return as direct children', () => {
  const v = document.createElement('nuri-view');
  v.setAttribute('distribute', 'even');
  makeChildren(v, ['One', 'Two']);
  mount(v);
  assert.ok([...v.children].every(isWrapper), 'wrapped while distribute is on');

  v.removeAttribute('distribute'); // attributeChangedCallback → #syncDistribute (off → unwrap)

  const kids = [...v.children];
  assert.equal(kids.length, 2, 'the two originals are back as direct children');
  assert.ok(kids.every((k) => !isWrapper(k)), 'no distribute wrappers remain');
  assert.deepEqual(kids.map((k) => [k.tagName, k.textContent]), [['BUTTON', 'One'], ['BUTTON', 'Two']]);
});

test('<nuri-stack distribute="even"> wraps each child of its #inner host too (the other primitive)', () => {
  const s = document.createElement('nuri-stack');
  s.setAttribute('direction', 'row');
  s.setAttribute('distribute', 'even');
  makeChildren(s, ['x', 'y', 'z']);
  mount(s); // connectedCallback moves children into #inner, then #syncDistribute wraps them

  const inner = s.querySelector('.nuri-stack'); // the #inner host (class set in #sync)
  assert.ok(inner, 'nuri-stack builds its inner host');
  const wrappers = [...inner.children];
  assert.equal(wrappers.length, 3, 'one wrapper per child inside #inner');
  assert.ok(wrappers.every(isWrapper), 'each #inner child is wrapped');
  assert.ok(wrappers.every((w) => w.firstElementChild?.tagName === 'BUTTON'), 'each wrapper holds its original child');
});
