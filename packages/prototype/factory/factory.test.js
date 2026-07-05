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
await import('../recipes/list.js');
await import('../recipes/list-action.js');
await import('../recipes/alert.js');
await import('../recipes/text-field.js');
await import('../primitives/scroll.js');
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

test('primitive Scroll · dock insets reflect onto the content-inset path', () => {
  const scroll = document.createElement('nuri-scroll');
  scroll.setAttribute('inset-top', 'dock');
  scroll.setAttribute('inset-bottom', 'dock');
  const child = document.createElement('span');
  child.textContent = 'Last row';
  scroll.append(child);

  mount(scroll);

  const inner = scroll.querySelector(':scope > .nuri-scroll');
  assert.equal(inner.dataset.insetTop, 'dock');
  assert.equal(inner.dataset.insetBottom, 'dock');
  const content = inner.querySelector(':scope > .nuri-scroll__content');
  assert.ok(content);
  assert.equal(content.firstElementChild, child);
});

// jsdom reports a connectedCallback exception on the window `error` event
// instead of propagating it out of appendChild — capture it and assert the
// NAMED message (the web half of the paired mixed-content contract tests).
function mountExpectingNamedError(el, pattern) {
  let caught = null;
  const onError = (event) => {
    caught = event.error ?? new Error(event.message);
    event.preventDefault();
  };
  dom.window.addEventListener('error', onError);
  try {
    dom.window.document.body.appendChild(el);
  } finally {
    dom.window.removeEventListener('error', onError);
  }
  assert.ok(caught, 'an invalid composition must fail with a named error');
  assert.match(caught.message, pattern);
}

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
  // size→lg (the large control · sm/lg scale). lg box geometry = minHeight xl · paddingX xl · radius full.
  assert.equal(btn.getAttribute('data-variant'), 'soft', 'variant defaults to soft from data');
  assert.equal(btn.getAttribute('data-min-height'), 'xl', 'size defaults to lg from data (minHeight xl)');
  assert.equal(btn.getAttribute('data-padding-x'), 'xl');
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

test('B5 · <nuri-list-action> direct typed slots route through their ancestor regions', async () => {
  assert.ok(customElements.get('nuri-list-action'), 'ListAction web twin is registered');

  const row = dom.window.document.createElement('nuri-list-action');
  row.innerHTML = [
    '<nuri-list-action-leading-avatar name="bank"></nuri-list-action-leading-avatar>',
    '<nuri-list-action-text>Bank account</nuri-list-action-text>',
    '<nuri-list-action-text-muted>Personal</nuri-list-action-text-muted>',
    '<nuri-list-action-trailing-text>12.00 €</nuri-list-action-trailing-text>',
    '<nuri-list-action-trailing-text-muted>3433 Sats</nuri-list-action-trailing-text-muted>',
    '<nuri-list-action-trail-icon name="chevron-right"></nuri-list-action-trail-icon>',
  ].join('');
  mount(row);
  await tick();

  const btn = row.querySelector('button.nuri-interactive');
  assert.ok(btn, 'the registered element mounts the pressable tree');
  assert.deepEqual([...btn.children].map((child) => child.tagName.toLowerCase()), ['nuri-icon-avatar', 'nuri-view', 'nuri-view', 'nuri-icon']);
  assert.equal(btn.children[0].querySelector('nuri-icon')?.getAttribute('name'), 'bank', 'leading avatar delegates to the real icon-avatar');
  assert.deepEqual([...btn.children[1].querySelectorAll('nuri-typography')].map((el) => el.textContent), ['Bank account', 'Personal']);
  assert.deepEqual([...btn.children[2].querySelectorAll('nuri-typography')].map((el) => el.textContent), ['12.00 €', '3433 Sats']);
  assert.equal(btn.children[3].getAttribute('name'), 'chevron-right');
});

test('B5b · <nuri-list-action> variant defaults to outline and can route solid to the avatar', async () => {
  const outline = dom.window.document.createElement('nuri-list-action');
  outline.innerHTML = '<nuri-list-action-leading-avatar name="bank"></nuri-list-action-leading-avatar><nuri-list-action-text>Bank</nuri-list-action-text>';
  mount(outline);
  await tick();
  const outlineAvatar = outline.querySelector('button.nuri-interactive > nuri-icon-avatar nuri-view');
  assert.equal(outlineAvatar?.getAttribute('data-variant'), 'outline', 'default variant routes to leading avatar');

  const solid = dom.window.document.createElement('nuri-list-action');
  solid.setAttribute('variant', 'solid');
  solid.setAttribute('accent', 'orange');
  solid.innerHTML = '<nuri-list-action-leading-avatar name="arrow-up"></nuri-list-action-leading-avatar><nuri-list-action-text>Orange</nuri-list-action-text>';
  mount(solid);
  await tick();
  const solidAvatar = solid.querySelector('button.nuri-interactive > nuri-icon-avatar nuri-view');
  const solidButton = solid.querySelector('button.nuri-interactive');
  assert.equal(solidAvatar?.getAttribute('data-variant'), 'solid', 'explicit variant routes to leading avatar');
  assert.equal(solidButton?.getAttribute('data-accent'), 'orange', 'accent scope lands on the row painting node');
});

test('B5d · <nuri-list-action> leading avatar uses the real icon-avatar element contract', async () => {
  const row = dom.window.document.createElement('nuri-list-action');
  row.setAttribute('variant', 'solid');
  row.innerHTML = '<nuri-list-action-leading-avatar name="bank"></nuri-list-action-leading-avatar>';
  mount(row);
  await tick();

  const avatar = row.querySelector('button.nuri-interactive > nuri-icon-avatar');
  assert.ok(avatar, 'the row renders the catalog icon-avatar, not a rebuilt primitive clone');
  assert.equal(avatar.getAttribute('variant'), 'solid', 'the row axis maps to the delegated component prop');
  assert.equal(avatar.getAttribute('icon'), 'bank', 'the slot glyph maps to the delegated component prop');
  assert.equal(avatar.querySelector('nuri-view')?.getAttribute('data-variant'), 'solid', 'the delegated component renders its own surface');
});

test('B5c · <nuri-list> preserves list-action children with shared nuri-list-* slot prefixes', async () => {
  const list = dom.window.document.createElement('nuri-list');
  list.innerHTML = [
    '<nuri-list-action aria-label="Bank">',
    '<nuri-list-action-leading-avatar name="bank"></nuri-list-action-leading-avatar>',
    '<nuri-list-action-text>Bank account</nuri-list-action-text>',
    '</nuri-list-action>',
    '<nuri-list-separator></nuri-list-separator>',
    '<nuri-list-action aria-label="Card">',
    '<nuri-list-action-leading-avatar name="card"></nuri-list-action-leading-avatar>',
    '<nuri-list-action-text>Credit card</nuri-list-action-text>',
    '</nuri-list-action>',
  ].join('');
  mount(list);
  await tick();

  assert.equal(list.classList.contains('nuri-stack'), true, 'the open list host is its own painting node');
  assert.equal(list.getAttribute('data-padding-x'), 'sm', 'the list owns sm horizontal breathing room');
  assert.equal(list.hasAttribute('data-padding-y'), false, 'the list does not add vertical padding');
  const rows = [...list.children].filter((child) => child.tagName.toLowerCase() === 'nuri-list-action');
  assert.equal(rows.length, 2, 'list keeps the row elements as positional children');
  assert.equal(list.querySelector('nuri-list-separator nuri-separator')?.getAttribute('y-space'), 'sm', 'list separator owns sm vertical rhythm');
  assert.deepEqual([...list.querySelectorAll('nuri-typography')].map((el) => el.textContent), ['Bank account', 'Credit card']);
  assert.deepEqual([...list.querySelectorAll('nuri-icon')].map((el) => el.getAttribute('name')), ['bank', 'card']);
});

// ── The mixed-content / repetition contract (decision 83) — PAIRED with the RN
// render-smoke tests (packages/rn/__tests__/render-smoke.test.tsx · the
// ListAction contract block): both engines resolve the same authored
// composition to the same structure, or fail with the same named error.
test('B6 · <nuri-list-action> · bare region children stay the region\'s own content, order preserved', async () => {
  const row = dom.window.document.createElement('nuri-list-action');
  row.innerHTML = '<nuri-list-action-content>before<nuri-list-action-text>Bank account</nuri-list-action-text>after</nuri-list-action-content>';
  mount(row);
  await tick();

  const btn = row.querySelector('button.nuri-interactive');
  assert.ok(btn, 'the row mounts');
  assert.equal(btn.children.length, 1, 'the content region renders exactly ONCE');
  const region = btn.children[0];
  assert.equal(region.tagName.toLowerCase(), 'nuri-view');
  const sequence = [...region.childNodes].map((n) =>
    n.nodeType === 3 ? `#text:${n.textContent}` : `${n.tagName.toLowerCase()}:${n.textContent}`,
  );
  assert.deepEqual(
    sequence,
    ['#text:before', 'nuri-typography:Bank account', '#text:after'],
    'bare children mix with typed slots in authored order, inside the region',
  );
});

test('B7 · a typed slot targeting a part OUTSIDE its region fails named', () => {
  const row = dom.window.document.createElement('nuri-list-action');
  row.innerHTML = '<nuri-list-action-content><nuri-list-action-trailing-text>Wrong</nuri-list-action-trailing-text></nuri-list-action-content>';
  mountExpectingNamedError(row, /composition entry targets 'trailingText', which is not under 'content'/);
});

test('B8 · a multiple:true slot repeats as a SEQUENCE of leaf instances', async () => {
  const row = dom.window.document.createElement('nuri-list-action');
  row.innerHTML = '<nuri-list-action-text>First line</nuri-list-action-text><nuri-list-action-text>Second line</nuri-list-action-text>';
  mount(row);
  await tick();

  const btn = row.querySelector('button.nuri-interactive');
  assert.equal(btn.children.length, 1, 'ONE content region hosts the sequence');
  const texts = [...btn.children[0].querySelectorAll('nuri-typography')];
  assert.deepEqual(
    texts.map((el) => el.textContent),
    ['First line', 'Second line'],
    'TWO leaf instances — never one concatenated leaf',
  );
});

test('B9 · a repeated SINGULAR icon slot fails named', () => {
  const row = dom.window.document.createElement('nuri-list-action');
  row.innerHTML = '<nuri-list-action-leading-avatar name="arrow-up"></nuri-list-action-leading-avatar><nuri-list-action-leading-avatar name="arrow-down"></nuri-list-action-leading-avatar>';
  mountExpectingNamedError(row, /slot targeting part 'leadingAvatar' is singular — it appears 2 times under 'root'/);
});

test('B10 · bare children with NO default sink fail named', () => {
  const row = dom.window.document.createElement('nuri-list-action');
  row.textContent = 'Send money';
  mountExpectingNamedError(row, /'nuri-list-action' has no default content slot/);
});

test('B11 · a FOREIGN component\'s slot marker fails named', () => {
  const row = dom.window.document.createElement('nuri-list-action');
  row.innerHTML = '<nuri-list-action-content><nuri-button-text>Wrong</nuri-button-text></nuri-list-action-content>';
  mountExpectingNamedError(row, /foreign slot marker '<nuri-button-text>' — not a 'nuri-list-action' slot/);
});

// ══════════════════════════════════════════════════════════════════
// C · defineNuriComponent · the registered elements (API derivation · reflection)
// ══════════════════════════════════════════════════════════════════
test('C · observedAttributes are DERIVED from the descriptor (axes ∪ accent ∪ disabled? ∪ icon?)', () => {
  // Button: interactive + text primary + pressable accessibilityLabel → variant·size·fill·accent·disabled·aria-label (NO icon).
  assert.deepEqual(
    [...customElements.get('nuri-button').observedAttributes].sort(),
    ['accent', 'aria-label', 'disabled', 'fill', 'size', 'variant'],
    'button observes its axes (variant·size·fill) + accent + disabled (interactive) + aria-label (pressable API), not icon',
  );
  // IconAvatar: static + icon part → variant·accent·icon (the component `icon` prop ·
  // NOT `name`, which is the primitive <nuri-icon>'s attr · NO disabled, NO size).
  assert.deepEqual(
    [...customElements.get('nuri-icon-avatar').observedAttributes].sort(),
    ['accent', 'icon', 'variant'],
    'icon-avatar observes its axis + accent + icon (the glyph part), not disabled',
  );
});

test('C1b · <nuri-button>Go</nuri-button> · a BARE label survives the composition harvest (the pre-scan)', async () => {
  // The registered-element route (NOT buildComponent-direct): the element has
  // component slots, so harvestComposition runs first — with no marker present
  // it must return null WITHOUT consuming the bare text node, so the legacy
  // `#label = textContent` capture still sees 'Go'.
  const b = dom.window.document.createElement('nuri-button');
  b.textContent = 'Go';
  mount(b);
  await tick();

  const label = b.querySelector('nuri-typography');
  assert.ok(label, 'the bare label renders a nuri-typography');
  assert.equal(label.textContent, 'Go', 'the bare text label is captured, not destroyed by the harvest');
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
  assert.equal(btn.hasAttribute('data-press-scale'), false, 'disabled native button does not advertise the press-scale gate');
  assert.equal(btn.hasAttribute('data-press-color'), false, 'disabled native button does not advertise the press-colour gate');
  assert.equal(btn.getAttribute('data-variant'), 'soft', 'no variant attr → the descriptor default (soft) · no hand default at the binding');
  assert.equal(b.hasAttribute('aria-hidden'), false, 'a non-decorative component is NOT aria-hidden');
});

test('C2b · <nuri-button aria-label> · public accessible-name override reaches the native button', async () => {
  const b = dom.window.document.createElement('nuri-button');
  b.textContent = 'Pay';
  b.setAttribute('aria-label', 'Pay now');
  mount(b);
  await tick();

  const btn = b.querySelector('button.nuri-interactive');
  assert.ok(btn, 'the registered element mounts the factory tree');
  assert.equal(btn.getAttribute('aria-label'), 'Pay now', 'public aria-label maps to the inner native button');
  assert.equal(b.querySelector('nuri-typography')?.textContent, 'Pay', 'visible text remains the fallback label content');
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

test('C4 · <nuri-alert-button disabled> delegates to the real button through component-ref mapping', async () => {
  const alert = dom.window.document.createElement('nuri-alert');
  alert.innerHTML = [
    '<nuri-alert-icon name="warning-circle"></nuri-alert-icon>',
    'Total balance insufficient',
    '<nuri-alert-button disabled aria-label="Top up funds">Top up</nuri-alert-button>',
  ].join('');
  mount(alert);
  await tick();

  const action = alert.querySelector('nuri-alert > nuri-view > nuri-button');
  assert.ok(action, 'the action slot renders the real nuri-button element');
  assert.equal(action.getAttribute('variant'), 'solid', 'variant is pinned by descriptor mapping');
  assert.equal(action.getAttribute('size'), 'sm', 'size is pinned by descriptor mapping');
  assert.equal(action.getAttribute('aria-label'), 'Top up funds', 'slot aria-label normalizes to the delegated Button public attr');
  const btn = action.querySelector('button.nuri-interactive');
  assert.equal(btn?.hasAttribute('disabled'), true, 'disabled forwards through the generic slot-prop mapping');
  assert.equal(btn?.getAttribute('aria-label'), 'Top up funds', 'the delegated Button forwards the accessible name to its native button');
  assert.equal(action.querySelector('nuri-typography')?.textContent, 'Top up', 'children forward to the delegated button label');
});

test('C5 · <nuri-text-field> input props reach the native input and label names it', async () => {
  assert.ok(customElements.get('nuri-text-field'), 'TextField web twin is registered');
  assert.deepEqual(
    [...customElements.get('nuri-text-field').observedAttributes].sort(),
    ['accent', 'aria-label', 'disabled', 'input-mode', 'placeholder', 'secure-text-entry', 'value'],
    'TextField observes its input allowlist attrs plus accent',
  );

  const field = dom.window.document.createElement('nuri-text-field');
  field.setAttribute('value', 'DE12');
  field.setAttribute('placeholder', 'DE...');
  field.setAttribute('input-mode', 'numeric');
  field.innerHTML = '<nuri-text-field-label>IBAN</nuri-text-field-label>';
  mount(field);
  await tick();

  const box = field.querySelector('nuri-view[data-nuri-focus-target]');
  assert.ok(box, 'the descriptor-declared box is marked as the input focus target');
  assert.equal(box.getAttribute('data-height'), 'xl', 'the field box uses the box height axis at 54px');
  assert.equal(box.hasAttribute('data-min-height'), false, 'the field box height is explicit, not a min-height fallback');
  const input = field.querySelector('nuri-input > input');
  assert.ok(input, 'TextField renders a real native input');
  assert.equal(input.value, 'DE12');
  assert.equal(input.getAttribute('placeholder'), 'DE...');
  assert.equal(input.getAttribute('inputmode'), 'numeric');
  assert.equal(input.getAttribute('aria-label'), 'IBAN', 'plain label content names the native input');
});

test('C6 · <nuri-text-field> secure/disabled/button delegation and aria-label override', async () => {
  const field = dom.window.document.createElement('nuri-text-field');
  field.setAttribute('secure-text-entry', '');
  field.setAttribute('disabled', '');
  field.setAttribute('aria-label', 'Account number');
  field.innerHTML = [
    '<nuri-text-field-label>IBAN</nuri-text-field-label>',
    '<nuri-text-field-button aria-label="Paste name">Paste</nuri-text-field-button>',
    '<nuri-text-field-icon-button name="eye-hidden" aria-label="Hide account number"></nuri-text-field-icon-button>',
  ].join('');
  mount(field);
  await tick();

  const input = field.querySelector('nuri-input > input');
  assert.equal(input?.getAttribute('type'), 'password');
  assert.equal(input?.disabled, true);
  assert.equal(input?.getAttribute('aria-label'), 'Account number');
  const action = field.querySelector('nuri-button');
  assert.ok(action, 'TextFieldButton delegates to the real nuri-button element');
  assert.equal(action.getAttribute('variant'), 'soft');
  assert.equal(action.getAttribute('size'), 'sm');
  assert.equal(action.getAttribute('aria-label'), 'Paste name');
  assert.equal(action.querySelector('nuri-typography')?.textContent, 'Paste');
  const iconAction = field.querySelector('nuri-icon-button');
  assert.ok(iconAction, 'TextFieldIconButton delegates to the real nuri-icon-button element');
  assert.equal(iconAction.getAttribute('variant'), 'ghost');
  assert.equal(iconAction.getAttribute('size'), 'md');
  assert.equal(iconAction.getAttribute('icon'), 'eye-hidden');
  assert.equal(iconAction.getAttribute('aria-label'), 'Hide account number');
});

test('C7 · <nuri-text-field> native input event calls onChangeText property handler', async () => {
  const field = dom.window.document.createElement('nuri-text-field');
  const seen = [];
  field.onChangeText = (value) => seen.push(value);
  field.innerHTML = '<nuri-text-field-label>First name</nuri-text-field-label>';
  mount(field);
  await tick();

  const input = field.querySelector('nuri-input > input');
  input.value = 'Ada';
  input.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
  assert.deepEqual(seen, ['Ada']);
});

test('C6b · <nuri-text-field-icon-button> requires aria-label before delegating an icon-only button', () => {
  const field = dom.window.document.createElement('nuri-text-field');
  field.innerHTML = [
    '<nuri-text-field-label>Recovery code</nuri-text-field-label>',
    '<nuri-text-field-icon-button name="eye-hidden"></nuri-text-field-icon-button>',
  ].join('');

  mountExpectingNamedError(field, /<nuri-text-field-icon-button>' requires aria-label/);
});

test('C7b · <nuri-text-field> input focus owns the field focus state', async () => {
  const field = dom.window.document.createElement('nuri-text-field');
  const seen = [];
  field.onFocus = () => seen.push('focus');
  field.onBlur = () => seen.push('blur');
  field.innerHTML = [
    '<nuri-text-field-label>First name</nuri-text-field-label>',
    '<nuri-text-field-button>Paste</nuri-text-field-button>',
  ].join('');
  mount(field);
  await tick();

  const box = field.querySelector('nuri-view[data-nuri-focus-target]');
  const input = field.querySelector('nuri-input > input');
  const actionButton = field.querySelector('nuri-button button.nuri-interactive');
  assert.ok(box, 'the field box is the descriptor-declared focus target');
  assert.ok(input, 'TextField renders a native input');
  assert.ok(actionButton, 'TextFieldButton delegates to a native Button focus target');

  input.dispatchEvent(new dom.window.Event('focus'));
  assert.equal(box.hasAttribute('data-nuri-input-focused'), true, 'input focus marks the field box focused');
  assert.deepEqual(seen, ['focus'], 'public onFocus fires from native input focus');

  input.dispatchEvent(new dom.window.Event('blur'));
  assert.equal(box.hasAttribute('data-nuri-input-focused'), false, 'input blur clears the field box focused state');
  assert.deepEqual(seen, ['focus', 'blur'], 'public onBlur fires from native input blur');

  actionButton.dispatchEvent(new dom.window.Event('focus'));
  assert.equal(box.hasAttribute('data-nuri-input-focused'), false, 'action Button focus does not mark the input-owned field focus state');
});

test('C8 · <nuri-text-field> missing required label fails named', () => {
  const field = dom.window.document.createElement('nuri-text-field');
  mountExpectingNamedError(field, /'nuri-text-field' requires label/);
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
  assert.equal(btn.hasAttribute('data-press-scale'), true, 'icon-button opts into the tactile press scale');
  assert.equal(btn.hasAttribute('data-press-color'), true, 'icon-button opts into the pressed colour wash');

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
  assert.equal(btn.hasAttribute('data-press-scale'), false, 'disabled icon-button drops the press-scale gate on the native button');
  assert.equal(btn.hasAttribute('data-press-color'), false, 'disabled icon-button drops the press-colour gate on the native button');
  const kids = [...btn.children];
  assert.deepEqual(kids.map((k) => k.tagName.toLowerCase()), ['nuri-icon'], 'just the glyph');
  // the VALUE path (registered element · #113): the `icon` attribute routes the glyph
  // NAME onto the inner primitive <nuri-icon name>, not just a bare present leaf.
  assert.equal(kids[0].getAttribute('name'), 'apple', 'the `icon` attr routes the glyph name onto <nuri-icon>');
  assert.equal(btn.getAttribute('aria-label'), 'Apple Pay', 'icon-button still forwards public aria-label');
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

test('text flow · descriptor typography projects to nuri-typography attrs', () => {
  const descriptor = {
    structure: {
      anatomy: { el: 'view', parts: { label: { el: 'text' }, note: { el: 'text' } } },
      base: {
        label: { typography: { size: 'md', flow: 'truncate', lines: 1 } },
        note: { typography: { size: 'sm', flow: 'wrap' } },
      },
    },
    api: { axes: [], themeScope: { accent: true }, slots: {} },
  };

  const el = buildComponent(descriptor, {}, { content: { label: 'Truncated label', note: 'Wrapped note' } });
  const [label, note] = [...el.querySelectorAll('nuri-typography')];

  assert.equal(label.getAttribute('flow'), 'truncate');
  assert.equal(label.getAttribute('lines'), '1');
  assert.equal(note.getAttribute('flow'), 'wrap');
  assert.equal(note.hasAttribute('lines'), false);
});

test('D2 · aria-label support derives from the pressable API, even for a text-primary descriptor', async () => {
  const syntheticPressableDescriptor = {
    structure: {
      anatomy: { el: 'pressable', parts: { label: { el: 'text' } } },
      base: { root: { stack: { align: 'center' }, interactive: { pressColor: true } } },
    },
    api: {
      axes: [],
      themeScope: { accent: true },
      behaviour: { pressable: { target: 'root', props: ['accessibilityLabel'] } },
      slots: { default: { part: 'label', kind: 'text', default: true } },
    },
  };
  defineNuriComponent(syntheticPressableDescriptor, 'nuri-a11y-text-primary-x');

  assert.deepEqual(
    [...customElements.get('nuri-a11y-text-primary-x').observedAttributes].sort(),
    ['accent', 'aria-label', 'disabled'],
    'aria-label is observed because the descriptor pressable API declares accessibilityLabel',
  );

  const x = dom.window.document.createElement('nuri-a11y-text-primary-x');
  x.textContent = 'Transfer';
  x.setAttribute('aria-label', 'Transfer money');
  mount(x);
  await tick();

  const btn = x.querySelector('button.nuri-interactive');
  assert.equal(btn?.getAttribute('aria-label'), 'Transfer money', 'the descriptor-driven accessible name reaches the native button');
  assert.equal(btn?.querySelector('nuri-typography')?.textContent, 'Transfer', 'visible text remains rendered');
});
