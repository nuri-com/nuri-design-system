/* ──────────────────────────────────────────────────────────────
 * NURI · WEB FACTORY · HARNESS (jsdom · node --test · N+50)
 *
 * The factory's first committed teeth. Since the L3c flip (N+38 · decision 74)
 * buildComponent is the SOLE live web renderer for the three frozen descriptors,
 * and defineNuriComponent (N+50) is the generic registration over it — yet
 * neither had a test (the named no-harness gap · §74). This closes it: render
 * Button + IconAvatar through the REAL recipes (the factory + the primitives +
 * the descriptor twins, end to end) under jsdom and assert the de-collapsed
 * `nuri-*` tree — the namespace classes + data-*, the DEFAULTS resolved FROM the
 * descriptor (R1.5 · N+50 · the heart of this slice), the routed label/glyph, the
 * disabled reflection, and the decorative aria-hidden. A final synthetic
 * descriptor proves the genericity claim: a NEW merged-node component is a
 * descriptor + one defineNuriComponent line, zero hand code.
 *
 * jsdom globals are installed BEFORE the custom-element modules load (their
 * classes `extends HTMLElement` at module-eval time), so every import here is
 * DYNAMIC, after the global wiring below.
 * ────────────────────────────────────────────────────────────── */

import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

// ── jsdom globals · installed before any custom-element module evaluates ──
const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' });
for (const key of ['window', 'document', 'customElements', 'HTMLElement', 'MutationObserver', 'Node', 'CustomEvent']) {
  globalThis[key] = key === 'window' ? dom.window : dom.window[key];
}

// The REAL recipes — each registers its tag via defineNuriComponent and self-imports
// the primitives the factory tree upgrades into (pressable/typography · view/icon).
await import('../recipes/button.js');
await import('../recipes/icon-avatar.js');
// The factory + the descriptor twins, for the buildComponent-direct assertions
// (same cached module instances the recipes use).
const { buildComponent, defineNuriComponent } = await import('../factory/factory.js');
const { compositionButtonDescriptor } = await import('../generated/descriptors/composition-button.js');
const { iconAvatarDescriptor } = await import('../generated/descriptors/icon-avatar.js');

// The merge onto the interactive inner <button> is deferred by a MutationObserver
// (factory.js applyToInteractiveHost · it lands once the pressable creates the
// button on connect). A macrotask turn flushes it before we assert.
const tick = () => new Promise((r) => setTimeout(r, 0));
function mount(el) {
  dom.window.document.body.appendChild(el);
  return el;
}
const classesOf = (el) => [...el.classList].sort();

// ══════════════════════════════════════════════════════════════════
// A · buildComponent · IconAvatar — static merged node + DEFAULT from data
// ══════════════════════════════════════════════════════════════════
test('A · buildComponent(IconAvatar) · static nuri-view · variant DEFAULTS to soft from descriptor.defaults', () => {
  // No selection passed — the unset `variant` must resolve to descriptor.defaults
  // (soft), NOT the variant-order first value (solid · the old first-value gap).
  const el = buildComponent(iconAvatarDescriptor, {}, { name: 'apple' });

  assert.equal(el.tagName.toLowerCase(), 'nuri-view', 'static view → the element IS the merged node');
  assert.deepEqual(classesOf(el), ['nuri-box', 'nuri-palette', 'nuri-stack'], 'the three agnostic namespace classes merge onto the node');
  assert.equal(el.getAttribute('data-variant'), 'soft', 'R1.5: the default resolves to soft FROM the descriptor, not the first value solid');
  // base box geometry (lg circle · full radius) lands as data-*.
  assert.equal(el.getAttribute('data-width'), 'lg');
  assert.equal(el.getAttribute('data-height'), 'lg');
  assert.equal(el.getAttribute('data-radius'), 'full');
  // the glyph leaf is routed by `name` (icon primary part).
  const icon = el.querySelector('nuri-icon');
  assert.ok(icon, 'the icon primary part renders a nuri-icon leaf');
  assert.equal(icon.getAttribute('name'), 'apple', 'name routes to the glyph leaf');
});

test('A2 · buildComponent(IconAvatar) · an EXPLICIT variant wins over the default', () => {
  const el = buildComponent(iconAvatarDescriptor, { variant: 'subtle' }, { name: 'card' });
  assert.equal(el.getAttribute('data-variant'), 'subtle', 'an explicit axis value is passed straight through');
});

// ══════════════════════════════════════════════════════════════════
// B · buildComponent · Button — interactive merged node + label + DEFAULTS
// ══════════════════════════════════════════════════════════════════
test('B · buildComponent(Button) · de-collapsed pressable tree · variant+size DEFAULT from data · label routed', async () => {
  const el = mount(buildComponent(compositionButtonDescriptor, {}, { children: 'Pay' }));

  assert.equal(el.tagName.toLowerCase(), 'nuri-pressable', 'interactive view → nuri-pressable host');
  await tick(); // let the pressable create its inner button + the deferred merge land

  const btn = el.querySelector('button.nuri-interactive');
  assert.ok(btn, 'the pressable owns the inner native <button class="nuri-interactive">');
  assert.deepEqual(classesOf(btn), ['nuri-box', 'nuri-interactive', 'nuri-palette', 'nuri-stack'], 'box ⊕ stack ⊕ palette merge onto the SAME interactive button');

  // R1.5 · the defaults resolve FROM the descriptor: variant→soft (not solid),
  // size→md (not the order-first sm). md box geometry = minHeight lg · paddingX lg · radius full.
  assert.equal(btn.getAttribute('data-variant'), 'soft', 'variant defaults to soft from data');
  assert.equal(btn.getAttribute('data-min-height'), 'lg', 'size defaults to md from data (minHeight lg)');
  assert.equal(btn.getAttribute('data-padding-x'), 'lg');
  assert.equal(btn.getAttribute('data-radius'), 'full');

  // the label part (text) is routed from `children` → nuri-typography, moved into the button.
  const label = btn.querySelector('nuri-typography');
  assert.ok(label, 'the label renders a nuri-typography inside the button');
  assert.equal(label.textContent, 'Pay', 'children routes to the label');
  assert.equal(label.getAttribute('size'), 'md', 'the md type step from the size default');
  assert.equal(label.hasAttribute('emphasis'), true, 'the de-fused emphasis flag rides along');
});

// ══════════════════════════════════════════════════════════════════
// C · defineNuriComponent · the registered elements (API derivation · reflection)
// ══════════════════════════════════════════════════════════════════
test('C · observedAttributes are DERIVED from the descriptor (axes ∪ accent ∪ disabled? ∪ name?)', () => {
  // Button: interactive + text primary → variant·size·accent·disabled (NO name).
  assert.deepEqual(
    [...customElements.get('nuri-button').observedAttributes].sort(),
    ['accent', 'disabled', 'size', 'variant'],
    'button observes its axes + accent + disabled (interactive), not name',
  );
  // IconAvatar: static + icon primary → variant·accent·name (NO disabled, NO size).
  assert.deepEqual(
    [...customElements.get('nuri-icon-avatar').observedAttributes].sort(),
    ['accent', 'name', 'variant'],
    'icon-avatar observes its axis + accent + name (icon primary), not disabled',
  );
});

test('C2 · <nuri-button disabled> · disabled reflects to the interactive host · default variant from data', async () => {
  const b = dom.window.document.createElement('nuri-button');
  b.textContent = 'Go';
  b.setAttribute('disabled', '');
  mount(b);
  await tick();

  const btn = b.querySelector('button.nuri-interactive');
  assert.ok(btn, 'the registered element mounts the factory tree');
  assert.equal(btn.hasAttribute('disabled'), true, 'disabled reflects to the native button (generic to any interactive component)');
  assert.equal(btn.getAttribute('data-variant'), 'soft', 'no variant attr → the descriptor default (soft) · no hand default at the binding');
  assert.equal(b.hasAttribute('aria-hidden'), false, 'a non-decorative component is NOT aria-hidden');
});

test('C3 · <nuri-icon-avatar> · DECORATIVE aria-hidden comes from descriptor.decorative', () => {
  const a = dom.window.document.createElement('nuri-icon-avatar');
  a.setAttribute('name', 'apple');
  mount(a);
  assert.equal(a.getAttribute('aria-hidden'), 'true', 'decorative:true in the descriptor → aria-hidden, not a hand attr');
  const view = a.querySelector('nuri-view');
  assert.equal(view.getAttribute('data-variant'), 'soft', 'the default variant resolves from data');
});

// ══════════════════════════════════════════════════════════════════
// D · genericity · a NEW merged-node component = a descriptor + one line
// ══════════════════════════════════════════════════════════════════
test('D · defineNuriComponent is component-agnostic · a fresh descriptor needs ZERO hand code', () => {
  // A synthetic static descriptor never seen by the factory: a tone axis (default
  // = the SECOND value, to prove the default is read from data not order), a text
  // primary, and decorative. ONE registration line is the whole binding.
  const syntheticDescriptor = {
    structure: { anatomy: { el: 'view', parts: { label: { el: 'text' } } }, base: { root: { stack: { align: 'center' } } } },
    variants: { tone: { a: { root: { palette: { variant: 'solid' } } }, b: { root: { palette: { variant: 'soft' } } } } },
    defaults: { tone: 'b' },
    decorative: true,
  };
  defineNuriComponent(syntheticDescriptor, 'nuri-harness-x');

  assert.deepEqual([...customElements.get('nuri-harness-x').observedAttributes].sort(), ['accent', 'tone'], 'derived API: the axis + accent, nothing component-specific');

  const x = dom.window.document.createElement('nuri-harness-x');
  x.textContent = 'Hi';
  mount(x);

  assert.equal(x.getAttribute('aria-hidden'), 'true', 'decorative honoured generically');
  const view = x.querySelector('nuri-view');
  assert.equal(view.getAttribute('data-variant'), 'soft', 'tone defaults to b (the second value) — read from data, not order');
  const label = view.querySelector('nuri-typography');
  assert.equal(label.textContent, 'Hi', 'children routes to the lone text part generically');
});
