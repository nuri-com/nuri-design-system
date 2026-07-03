/* ──────────────────────────────────────────────────────────────
 * NURI · WEB FACTORY · COMPOSITION-ENVELOPE (jsdom · node --test)
 *
 * The PERMANENT synthetic matrix for the nested-composition contract
 * (decision 83) — {view root · pressable root} ×
 * {depth-1 typed slots · depth-2 typed slots · region + bare mixed content ·
 *  repeated `multiple` slot · repeated singular slot · region/loose mixed
 *  targeting · foreign component's marker · wrong-region marker · bare
 *  children with no default sink}.
 *
 * SYNTHETIC descriptors on purpose — the catalog is a subset, and catalog-only
 * coverage reads as proof it isn't (the verify-guard-completeness lesson).
 * MIRRORED cell-for-cell by packages/rn/__tests__/composition-envelope.test.tsx:
 * every cell asserts the SAME structure or the SAME named error (matched by
 * message body) on both engines. The machinery under test is
 * factory.js#appendComposition + #harvestComposition (the grouping walker —
 * edit in lockstep with the RN renderer's appendCompositionEntries).
 * ────────────────────────────────────────────────────────────── */

import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

// ── jsdom globals · installed before any custom-element module evaluates ──
const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' });
for (const key of ['window', 'document', 'customElements', 'HTMLElement', 'MutationObserver', 'Node', 'CustomEvent']) {
  globalThis[key] = key === 'window' ? dom.window : dom.window[key];
}

// The primitives the factory trees upgrade into, then the factory itself.
await import('../primitives/pressable.js');
await import('../primitives/view.js');
await import('../primitives/typography.js');
await import('../primitives/icon.js');
const { defineNuriComponent } = await import('./factory.js');

const tick = () => new Promise((r) => setTimeout(r, 0));
function mount(el) {
  dom.window.document.body.appendChild(el);
  return el;
}

// jsdom reports a connectedCallback exception on the window `error` event
// instead of propagating it out of appendChild — capture + assert the NAMED
// message (the same patterns the RN mirror asserts via expect(...).toThrow).
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
  assert.ok(caught, 'the invalid composition must fail with a named error');
  assert.match(caught.message, pattern);
}

// ── The synthetic envelope descriptor: depth-1 typed leaves (`leaf` multiple ·
// `badge` singular icon) + a depth-2 region subtree (`panel` region carrying
// `label` multiple · `note` singular). No default:true sink on purpose (the
// bare-children cell). Parameterized on the ROOT host element.
const envelopeDescriptor = (rootEl) => ({
  structure: {
    anatomy: {
      el: rootEl,
      parts: {
        leaf: { el: 'text' },
        badge: { el: 'icon' },
        panel: { el: 'view', parts: { label: { el: 'text' }, note: { el: 'text' } } },
      },
    },
    base: {
      root: {
        stack: { direction: 'row', gap: 'md' },
        ...(rootEl === 'pressable' ? { interactive: { pressColor: true } } : {}),
      },
      panel: { stack: { direction: 'column' } },
      leaf: { typography: { size: 'md' } },
      label: { typography: { size: 'md' } },
      note: { typography: { size: 'sm' } },
    },
  },
  api: {
    axes: [],
    themeScope: { accent: true },
    ...(rootEl === 'pressable' ? { behaviour: { pressable: { target: 'root', props: ['onPress'] } } } : {}),
    slots: {
      leaf: { part: 'leaf', kind: 'text', component: true, multiple: true },
      badge: { part: 'badge', kind: 'icon-name', component: true },
      panel: { part: 'panel', kind: 'region' },
      label: { part: 'label', kind: 'text', component: true, multiple: true },
      note: { part: 'note', kind: 'text', component: true },
    },
  },
});

defineNuriComponent(envelopeDescriptor('view'), 'nuri-env-view');
defineNuriComponent(envelopeDescriptor('pressable'), 'nuri-env-press');
// The FOREIGN component whose registered marker crosses into the envelope
// hosts (its `label` PART NAME collides with the envelope's on purpose — the
// tag/owner scoping, not part-name luck, must reject it).
defineNuriComponent(
  {
    structure: { anatomy: { el: 'view', parts: { label: { el: 'text' } } }, base: { root: {} } },
    api: { axes: [], slots: { label: { part: 'label', kind: 'text', component: true } } },
  },
  'nuri-env-foreign',
);

// The two matrix roots. `painted` resolves the root painting node once the
// tree has mounted (the pressable moves children into its inner button).
const ROOTS = [
  { name: 'view root', tag: 'nuri-env-view', painted: (host) => host.querySelector('nuri-view') },
  { name: 'pressable root', tag: 'nuri-env-press', painted: (host) => host.querySelector('button.nuri-interactive') },
];

const leafSequence = (node) =>
  [...node.children].map((child) => {
    const tag = child.tagName.toLowerCase();
    return tag === 'nuri-icon' ? `icon:${child.getAttribute('name')}` : `${tag === 'nuri-view' ? 'panel' : 'text'}:${child.textContent}`;
  });

for (const root of ROOTS) {
  test(`envelope · ${root.name} · depth-1 typed slots render in authored order`, async () => {
    const el = dom.window.document.createElement(root.tag);
    el.innerHTML = `<${root.tag}-leaf>Alpha</${root.tag}-leaf><${root.tag}-badge name="apple"></${root.tag}-badge>`;
    mount(el);
    await tick();
    const painted = root.painted(el);
    assert.ok(painted, 'the root painting node mounts');
    assert.deepEqual(leafSequence(painted), ['text:Alpha', 'icon:apple']);
  });

  test(`envelope · ${root.name} · depth-2 typed slot routes through its ancestor region`, async () => {
    const el = dom.window.document.createElement(root.tag);
    el.innerHTML = `<${root.tag}-label>Deep</${root.tag}-label>`;
    mount(el);
    await tick();
    const painted = root.painted(el);
    assert.deepEqual(leafSequence(painted), ['panel:Deep'], 'the panel ancestor renders ONCE, wrapping the leaf');
    const texts = [...painted.querySelectorAll('nuri-typography')];
    assert.deepEqual(texts.map((t) => t.textContent), ['Deep']);
  });

  test(`envelope · ${root.name} · region + bare mixed content keeps order, bare stays region content`, async () => {
    const el = dom.window.document.createElement(root.tag);
    el.innerHTML = `<${root.tag}-panel>before<${root.tag}-label>Deep</${root.tag}-label>after</${root.tag}-panel>`;
    mount(el);
    await tick();
    const painted = root.painted(el);
    assert.equal(painted.children.length, 1, 'the panel renders exactly once');
    const panel = painted.children[0];
    const sequence = [...panel.childNodes].map((n) =>
      n.nodeType === 3 ? `#text:${n.textContent}` : `${n.tagName.toLowerCase()}:${n.textContent}`,
    );
    assert.deepEqual(sequence, ['#text:before', 'nuri-typography:Deep', '#text:after']);
  });

  test(`envelope · ${root.name} · a multiple:true slot repeats as a SEQUENCE at both depths`, async () => {
    const el = dom.window.document.createElement(root.tag);
    el.innerHTML = [
      `<${root.tag}-leaf>One</${root.tag}-leaf><${root.tag}-leaf>Two</${root.tag}-leaf>`,
      `<${root.tag}-label>L1</${root.tag}-label><${root.tag}-label>L2</${root.tag}-label>`,
    ].join('');
    mount(el);
    await tick();
    const painted = root.painted(el);
    assert.deepEqual(leafSequence(painted), ['text:One', 'text:Two', 'panel:L1L2']);
    const panelTexts = [...painted.children[2].querySelectorAll('nuri-typography')];
    assert.deepEqual(panelTexts.map((t) => t.textContent), ['L1', 'L2'], 'TWO leaf instances — never one concatenated leaf');
  });

  test(`envelope · ${root.name} · a repeated SINGULAR slot fails named (nested text)`, () => {
    const el = dom.window.document.createElement(root.tag);
    el.innerHTML = `<${root.tag}-note>N1</${root.tag}-note><${root.tag}-note>N2</${root.tag}-note>`;
    mountExpectingNamedError(el, /slot targeting part 'note' is singular — it appears 2 times under 'panel'/);
  });

  test(`envelope · ${root.name} · a repeated SINGULAR slot fails named (depth-1 icon)`, () => {
    const el = dom.window.document.createElement(root.tag);
    el.innerHTML = `<${root.tag}-badge name="apple"></${root.tag}-badge><${root.tag}-badge name="card"></${root.tag}-badge>`;
    mountExpectingNamedError(el, /slot targeting part 'badge' is singular — it appears 2 times under 'root'/);
  });

  test(`envelope · ${root.name} · a region marker mixed with a loose slot for the same region fails named`, () => {
    const el = dom.window.document.createElement(root.tag);
    el.innerHTML = `<${root.tag}-panel><${root.tag}-label>A</${root.tag}-label></${root.tag}-panel><${root.tag}-label>B</${root.tag}-label>`;
    mountExpectingNamedError(el, /slot targeting part 'panel' is singular — it appears 2 times under 'root'/);
  });

  test(`envelope · ${root.name} · a FOREIGN component's marker fails named`, () => {
    const el = dom.window.document.createElement(root.tag);
    el.innerHTML = `<${root.tag}-panel><nuri-env-foreign-label>X</nuri-env-foreign-label></${root.tag}-panel>`;
    mountExpectingNamedError(el, /foreign slot marker '<nuri-env-foreign-label>'/);
  });

  test(`envelope · ${root.name} · a FOREIGN marker with no local marker present still fails named`, () => {
    const el = dom.window.document.createElement(root.tag);
    el.innerHTML = '<nuri-env-foreign-label>X</nuri-env-foreign-label>';
    mountExpectingNamedError(el, /foreign slot marker '<nuri-env-foreign-label>'/);
  });

  test(`envelope · ${root.name} · a typed slot targeting a part OUTSIDE its region fails named`, () => {
    const el = dom.window.document.createElement(root.tag);
    el.innerHTML = `<${root.tag}-panel><${root.tag}-leaf>X</${root.tag}-leaf></${root.tag}-panel>`;
    mountExpectingNamedError(el, /composition entry targets 'leaf', which is not under 'panel'/);
  });

  test(`envelope · ${root.name} · bare children with NO default sink fail named`, () => {
    const el = dom.window.document.createElement(root.tag);
    el.textContent = 'plain';
    mountExpectingNamedError(el, /has no default content slot/);
  });
}
