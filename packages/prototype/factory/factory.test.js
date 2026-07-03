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
await import('../recipes/icon-button.js');
await import('../recipes/pressable-item.js');
// The factory + the descriptor twins, for the buildComponent-direct assertions
// (same cached module instances the recipes use).
const { buildComponent, defineNuriComponent } = await import('../factory/factory.js');
const { buttonDescriptor } = await import('../generated/descriptors/button.js');
const { iconAvatarDescriptor } = await import('../generated/descriptors/icon-avatar.js');
const { iconButtonDescriptor } = await import('../generated/descriptors/icon-button.js');

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
  const el = buildComponent(iconAvatarDescriptor, {}, { icon: 'apple' });

  assert.equal(el.tagName.toLowerCase(), 'nuri-view', 'static view → the element IS the merged node');
  assert.deepEqual(classesOf(el), ['nuri-box', 'nuri-palette', 'nuri-stack'], 'the three agnostic namespace classes merge onto the node');
  assert.equal(el.getAttribute('data-variant'), 'soft', 'R1.5: the default resolves to soft FROM the descriptor, not the first value solid');
  // base box geometry (lg circle · full radius) lands as data-*.
  assert.equal(el.getAttribute('data-width'), 'lg');
  assert.equal(el.getAttribute('data-height'), 'lg');
  assert.equal(el.getAttribute('data-radius'), 'full');
  // the glyph leaf is routed by the `icon` part name (the component `icon` prop · the
  // primitive <nuri-icon> leaf below carries `name`).
  const icon = el.querySelector('nuri-icon');
  assert.ok(icon, 'the icon primary part renders a nuri-icon leaf');
  assert.equal(icon.getAttribute('name'), 'apple', 'the routed glyph name lands on the <nuri-icon> leaf');
});

test('A2 · buildComponent(IconAvatar) · an EXPLICIT variant wins over the default', () => {
  const el = buildComponent(iconAvatarDescriptor, { variant: 'subtle' }, { icon: 'card' });
  assert.equal(el.getAttribute('data-variant'), 'subtle', 'an explicit axis value is passed straight through');
});

// ══════════════════════════════════════════════════════════════════
// B · buildComponent · Button — interactive merged node + label + DEFAULTS
// ══════════════════════════════════════════════════════════════════
test('B · buildComponent(Button) · de-collapsed pressable tree · variant+size DEFAULT from data · label routed', async () => {
  const el = mount(buildComponent(buttonDescriptor, {}, { children: 'Pay' }));

  assert.equal(el.tagName.toLowerCase(), 'nuri-pressable', "el:'pressable' root → nuri-pressable host");
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

test('B2 · <nuri-button> composed slots · text/icon/text render in authored order', async () => {
  assert.ok(customElements.get('nuri-button-text'), 'ButtonText web twin is registered');
  assert.ok(customElements.get('nuri-button-icon'), 'ButtonIcon web twin is registered');

  const b = dom.window.document.createElement('nuri-button');
  b.setAttribute('variant', 'solid');
  b.innerHTML = '<nuri-button-text>Buy Bitcoin</nuri-button-text><nuri-button-icon name="apple"></nuri-button-icon><nuri-button-text>Pay</nuri-button-text>';
  mount(b);
  await tick();

  const btn = b.querySelector('button.nuri-interactive');
  assert.ok(btn, 'the registered element mounts the pressable tree');
  const sequence = [...btn.children].map((child) => {
    const tag = child.tagName.toLowerCase();
    return tag === 'nuri-icon' ? `${tag}:${child.getAttribute('name')}` : `${tag}:${child.textContent}`;
  });
  assert.deepEqual(sequence, ['nuri-typography:Buy Bitcoin', 'nuri-icon:apple', 'nuri-typography:Pay']);
  assert.equal(btn.hasAttribute('disabled'), false, 'disabled remains on the root Button only when declared, never on slot leaves');
});

test('B3 · nested composition preserves the ancestor containers', async () => {
  const nestedDescriptor = {
    structure: {
      anatomy: {
        el: 'pressable',
        parts: {
          leading: { el: 'view', parts: { glyph: { el: 'icon' } } },
          content: { el: 'view', parts: { label: { el: 'text' }, detail: { el: 'text' } } },
        },
      },
      base: {
        root: {
          stack: { direction: 'row', align: 'center', gap: 'md' },
          palette: { variant: 'ghost' },
          interactive: { pressColor: true },
        },
        leading: { stack: { align: 'center', justify: 'center' }, box: { width: 'lg', height: 'lg' } },
        content: { stack: { direction: 'column', fill: 'grow' } },
        label: { typography: { size: 'md', emphasis: true } },
        detail: { typography: { size: 'sm' }, palette: { muted: true } },
      },
    },
    api: { axes: [], themeScope: { accent: true }, behaviour: { pressable: { target: 'root', props: ['onPress'] } }, slots: {} },
  };

  const el = mount(buildComponent(nestedDescriptor, {}, {
    composition: {
      root: [
        { part: 'glyph', content: 'bank' },
        { part: 'label', content: 'Bank account' },
        { part: 'detail', content: 'Personal' },
      ],
    },
  }));
  await tick();

  const btn = el.querySelector('button.nuri-interactive');
  assert.ok(btn, 'the nested synthetic renders an interactive button');
  const topLevel = [...btn.children].map((child) => child.tagName.toLowerCase());
  assert.deepEqual(topLevel, ['nuri-view', 'nuri-view'], 'nested leaves sharing an ancestor route through that ancestor once');

  const [leading, content] = btn.children;
  assert.equal(leading.getAttribute('data-width'), 'lg', 'the leading ancestor container is preserved');
  assert.equal(leading.querySelector('nuri-icon')?.getAttribute('name'), 'bank', 'the glyph renders inside leading');
  const texts = [...content.querySelectorAll('nuri-typography')];
  assert.equal(texts[0]?.textContent, 'Bank account', 'the label renders inside content');
  const detail = texts.find((el) => el.textContent === 'Personal');
  assert.equal(detail?.textContent, 'Personal', 'the detail renders inside content');
  assert.equal(detail?.hasAttribute('data-muted'), true, 'muted text projects to typography data-muted');
});

test('B4 · defineNuriComponent harvests component slots nested inside region slots', async () => {
  const nestedDescriptor = {
    structure: {
      anatomy: {
        el: 'pressable',
        parts: {
          leading: { el: 'view', parts: { glyph: { el: 'icon' } } },
          content: { el: 'view', parts: { label: { el: 'text' }, detail: { el: 'text' } } },
        },
      },
      base: {
        root: {
          stack: { direction: 'row', align: 'center', gap: 'md' },
          palette: { variant: 'ghost' },
          interactive: { pressColor: true },
        },
        leading: { stack: { align: 'center', justify: 'center' }, box: { width: 'lg', height: 'lg' } },
        content: { stack: { direction: 'column', fill: 'grow' } },
        label: { typography: { size: 'md', emphasis: true } },
        detail: { typography: { size: 'sm' }, palette: { muted: true } },
      },
    },
    api: {
      axes: [],
      themeScope: { accent: true },
      behaviour: { pressable: { target: 'root', props: ['onPress', 'accessibilityLabel'] } },
      slots: {
        leading: { part: 'glyph', kind: 'icon-name', component: true },
        content: { part: 'content', kind: 'region' },
        text: { part: 'label', kind: 'text', component: true },
        detail: { part: 'detail', kind: 'text', component: true },
      },
    },
  };
  defineNuriComponent(nestedDescriptor, 'nuri-nested-region-x');

  const row = dom.window.document.createElement('nuri-nested-region-x');
  row.innerHTML = [
    '<nuri-nested-region-x-leading name="bank"></nuri-nested-region-x-leading>',
    '<nuri-nested-region-x-content>',
    '<nuri-nested-region-x-text>Bank account</nuri-nested-region-x-text>',
    '<nuri-nested-region-x-detail>Personal</nuri-nested-region-x-detail>',
    '</nuri-nested-region-x-content>',
  ].join('');
  mount(row);
  await tick();

  const btn = row.querySelector('button.nuri-interactive');
  assert.ok(btn, 'the registered element mounts the pressable tree');
  assert.deepEqual([...btn.children].map((child) => child.tagName.toLowerCase()), ['nuri-view', 'nuri-view']);
  assert.equal(btn.querySelector('nuri-icon')?.getAttribute('name'), 'bank');
  assert.deepEqual([...btn.querySelectorAll('nuri-typography')].map((el) => el.textContent), ['Bank account', 'Personal']);
});

test('B5 · <nuri-pressable-item> direct typed slots route through their ancestor regions', async () => {
  assert.ok(customElements.get('nuri-pressable-item'), 'PressableItem web twin is registered');

  const row = dom.window.document.createElement('nuri-pressable-item');
  row.innerHTML = [
    '<nuri-pressable-item-leading-avatar name="bank"></nuri-pressable-item-leading-avatar>',
    '<nuri-pressable-item-text>Bank account</nuri-pressable-item-text>',
    '<nuri-pressable-item-text-muted>Personal</nuri-pressable-item-text-muted>',
    '<nuri-pressable-item-trailing-text>12.00 €</nuri-pressable-item-trailing-text>',
    '<nuri-pressable-item-trailing-text-muted>3433 Sats</nuri-pressable-item-trailing-text-muted>',
    '<nuri-pressable-item-trail-icon name="chevron-right"></nuri-pressable-item-trail-icon>',
  ].join('');
  mount(row);
  await tick();

  const btn = row.querySelector('button.nuri-interactive');
  assert.ok(btn, 'the registered element mounts the pressable tree');
  assert.deepEqual([...btn.children].map((child) => child.tagName.toLowerCase()), ['nuri-view', 'nuri-view', 'nuri-view', 'nuri-icon']);
  assert.equal(btn.children[0].querySelector('nuri-icon')?.getAttribute('name'), 'bank', 'leading avatar wraps the glyph');
  assert.deepEqual([...btn.children[1].querySelectorAll('nuri-typography')].map((el) => el.textContent), ['Bank account', 'Personal']);
  assert.deepEqual([...btn.children[2].querySelectorAll('nuri-typography')].map((el) => el.textContent), ['12.00 €', '3433 Sats']);
  assert.equal(btn.children[3].getAttribute('name'), 'chevron-right');
});

// ══════════════════════════════════════════════════════════════════
// C · defineNuriComponent · the registered elements (API derivation · reflection)
// ══════════════════════════════════════════════════════════════════
test('C · observedAttributes are DERIVED from the descriptor (axes ∪ accent ∪ disabled? ∪ icon?)', () => {
  // Button: interactive + text primary → variant·size·accent·disabled (NO icon).
  assert.deepEqual(
    [...customElements.get('nuri-button').observedAttributes].sort(),
    ['accent', 'disabled', 'size', 'variant'],
    'button observes its axes + accent + disabled (interactive), not icon',
  );
  // IconAvatar: static + icon part → variant·accent·icon (the component `icon` prop ·
  // NOT `name`, which is the primitive <nuri-icon>'s attr · NO disabled, NO size).
  assert.deepEqual(
    [...customElements.get('nuri-icon-avatar').observedAttributes].sort(),
    ['accent', 'icon', 'variant'],
    'icon-avatar observes its axis + accent + icon (the glyph part), not disabled',
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
  a.setAttribute('icon', 'apple');
  mount(a);
  assert.equal(a.getAttribute('aria-hidden'), 'true', 'decorative:true in the descriptor → aria-hidden, not a hand attr');
  const view = a.querySelector('nuri-view');
  assert.equal(view.getAttribute('data-variant'), 'soft', 'the default variant resolves from data');
  // the VALUE path (registered element · #113): the `icon` attribute routes the glyph
  // NAME onto the inner primitive <nuri-icon name> (not just presence/aria/defaults).
  const icon = a.querySelector('nuri-icon');
  assert.ok(icon, 'the glyph leaf renders');
  assert.equal(icon.getAttribute('name'), 'apple', 'the `icon` attr routes the glyph name onto <nuri-icon>');
});

// ══════════════════════════════════════════════════════════════════
// E · icon-button (P11) — the icon-ONLY glyph circle · the `icon` scalar
// shorthand routes into the lone `icon` part · the square-floor geometry · a11y
// ══════════════════════════════════════════════════════════════════
test('E · buildComponent(icon-button) · the icon-only circle — just the glyph · square floor · aria-label', async () => {
  const el = mount(buildComponent(iconButtonDescriptor, { variant: 'solid', size: 'md' }, { icon: 'apple', accessibilityLabel: 'Buy Bitcoin' }));
  assert.equal(el.tagName.toLowerCase(), 'nuri-pressable', "el:'pressable' root → nuri-pressable host");
  await tick();

  const btn = el.querySelector('button.nuri-interactive');
  assert.ok(btn, 'the pressable owns the inner interactive button');
  // md box: minHeight lg (coherent w/ Button) + minWidth lg (the square floor) +
  // a SMALL sm ring (paddingX) + radius full + solid.
  assert.equal(btn.getAttribute('data-min-height'), 'lg', 'size md → minHeight lg (coherent w/ Button)');
  assert.equal(btn.getAttribute('data-min-width'), 'lg', 'the square floor · minWidth = minHeight');
  assert.equal(btn.getAttribute('data-padding-x'), 'md', 'the icon edge ring (md/lg → md · paddingX diverges from Button by design)');
  assert.equal(btn.getAttribute('data-radius'), 'full');
  assert.equal(btn.getAttribute('data-variant'), 'solid');

  // ONLY the glyph renders — the lone `icon` part, no text nodes at all.
  const kids = [...btn.children];
  assert.deepEqual(kids.map((k) => k.tagName.toLowerCase()), ['nuri-icon'], 'icon-only → just the glyph');
  assert.equal(btn.querySelectorAll('nuri-typography').length, 0, 'no text nodes at all');
  assert.equal(kids[0].getAttribute('name'), 'apple', 'icon name routes to the glyph leaf');
  // a11y: the icon-only control carries its accessible name on the inner button.
  assert.equal(btn.getAttribute('aria-label'), 'Buy Bitcoin', 'the accessible name rides aria-label on the focusable button (F-ARIA-LABEL-1)');
});

test('E2 · buildComponent(icon-button) · sm · the square-floor geometry + the glyph size leaf', async () => {
  const el = mount(buildComponent(iconButtonDescriptor, { size: 'sm' }, { icon: 'bitcoin', accessibilityLabel: 'Buy Bitcoin' }));
  await tick();
  const btn = el.querySelector('button.nuri-interactive');

  const kids = [...btn.children];
  assert.deepEqual(kids.map((k) => k.tagName.toLowerCase()), ['nuri-icon'], 'just the glyph');
  // the square floor squares the control: sm → minWidth md (= minHeight md),
  // a small sm ring; the glyph centres (border-box absorbs the ring).
  assert.equal(btn.getAttribute('data-min-height'), 'md', 'sm → minHeight md');
  assert.equal(btn.getAttribute('data-min-width'), 'md', 'sm → minWidth md (the square floor · = minHeight)');
  assert.equal(btn.getAttribute('data-padding-x'), 'sm', 'the small icon ring');
  // sm icon glyph = the xs size leaf (18px · the icon-arc shared box axis).
  assert.equal(kids[0].getAttribute('data-width'), 'xs');
});

test('E3 · defineNuriComponent(icon-button) · observedAttributes derive the icon-only + a11y surface', () => {
  // axes (variant·size) ∪ accent ∪ disabled (interactive) ∪ the lone `icon` part
  // ∪ aria-label (interactive, no text primary).
  assert.deepEqual(
    [...customElements.get('nuri-icon-button').observedAttributes].sort(),
    ['accent', 'aria-label', 'disabled', 'icon', 'size', 'variant'],
    'the icon-only API: axes + accent + disabled + icon + aria-label',
  );
});

test('E4 · <nuri-icon-button> · the registered element renders the glyph + reflects disabled', async () => {
  const ib = dom.window.document.createElement('nuri-icon-button');
  ib.setAttribute('icon', 'apple');
  ib.setAttribute('aria-label', 'Apple Pay');
  ib.setAttribute('disabled', '');
  mount(ib);
  await tick();

  const btn = ib.querySelector('button.nuri-interactive');
  assert.ok(btn, 'the registered element mounts the factory tree');
  assert.equal(btn.hasAttribute('disabled'), true, 'disabled reflects to the native button');
  const kids = [...btn.children];
  assert.deepEqual(kids.map((k) => k.tagName.toLowerCase()), ['nuri-icon'], 'just the glyph');
  // the VALUE path (registered element · #113): the `icon` attribute routes the glyph
  // NAME onto the inner primitive <nuri-icon name>, not just a bare present leaf.
  assert.equal(kids[0].getAttribute('name'), 'apple', 'the `icon` attr routes the glyph name onto <nuri-icon>');
  assert.equal(btn.getAttribute('data-variant'), 'soft', 'the descriptor default (soft) with no variant attr');
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
    api: { axes: ['tone'], themeScope: { accent: true }, slots: { default: { part: 'label', kind: 'text', default: true } } },
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
