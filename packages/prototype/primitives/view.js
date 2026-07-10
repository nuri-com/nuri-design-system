/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · VIEW · CUSTOM ELEMENT
 *   (the merged-node host · factory-rewrite S4 · decision 67 · hand-authorable @③)
 *
 * <nuri-view> is the generic view host — the web mirror of RN <View>
 * (the el:'view' case in rn/runtime/renderer.tsx · the N+26 el→primitive
 * lock · STATIC by structure since amendment 65.13: the pressable host is
 * its own El, so el:'view' is always the static case, no interactive
 * derivation). It is the static counterpart of <nuri-pressable>: where
 * the pressable owns an inner interactive <button>, the view IS the
 * painting node itself.
 *
 * THE ELEMENT IS THE MERGED NODE (B1.5 §4.2 · palette.css). It carries
 * the resolved box ⊕ stack ⊕ palette classes + geometry/colour data-*
 * DIRECTLY — there is no inner element. Two consumers paint it:
 *
 *   1. THE WEB FACTORY (factory/factory.js · renderStaticView) applies the
 *      merged classes + data-* programmatically, WITHOUT public attrs — the
 *      catalog-component path (IconAvatar circle · Topbar chrome row).
 *   2. THE HAND AUTHOR writes the PUBLIC attrs (`aspect-ratio` · `radius` ·
 *      `variant` · `direction` · `gap` · …) and this element self-derives the
 *      SAME classes + data-* — the playground card path (`<nuri-view
 *      aspect-ratio="card" radius="lg" variant="subtle">`), the web twin of
 *      the RN `View` primitive (#102 · primitives.tsx). flat attrs = box ∪
 *      stack ∪ palette, the mirror of the RN flat-prop surface.
 *
 * ⚠ THE DUAL-MODE (the named risk · the icon.js:70 host-pinned-vs-self-derive
 * precedent). #sync SELF-DERIVES only from this element's OWN public attrs.
 * A factory-painted node carries NO public attr (the factory sets data-* +
 * classes directly), so #sync must NOT run on it — else it would clobber the
 * factory merge and break every catalog-rendered View. The latch below
 * (#managed) only ever flips on a node a hand author touched; a factory node
 * never carries a public attr, so it stays unmanaged and untouched.
 *
 * NO SECOND MECHANISM. The class + data-* spelling is the factory's own
 * `mergeAttrs` (decision 74 · exported for exactly this kind of apply-to-host
 * reuse) — this element BUCKETS its attrs into the box/stack/palette namespace
 * map and hands it to `mergeAttrs`, so the emitted `.nuri-box .nuri-stack
 * .nuri-palette` + `data-{kebab}` are byte-identical to the factory's. The CSS
 * (box.css / stack.css / palette.css) dispatches unchanged; this file adds an
 * attr READER, not new styling. The boolean/enum NORMALIZATION (wrap → 'true',
 * bare `fill` → 'grow') preserves the stack namespace's authoring semantics.
 *
 * @layer host default lives in view.css (the RN <View> Yoga box · flex column,
 * flex-shrink:0). accent self-scope (Tier-2 · decision 27/62) rides the token
 * cascade via data-accent, mirrored here from the `accent` attr exactly as the
 * factory mirrors it from ctx.base.accent.
 *
 * Loaded as an ES module (it imports the factory's mergeAttrs); the recipes /
 * pages reference it as `<script type="module">` or via the recipe self-imports.
 * ────────────────────────────────────────────────────────────── */

import { mergeAttrs } from '../factory/factory.js';

// The PUBLIC attr surface = box ∪ stack ∪ palette ∪ effect (kebab) — the hand-authorable
// mirror of the RN View props. The
// parity gate (primitives-parity.test.ts) reads these namespace literals and asserts
// their union ≡ the schema namespace keys (kebab) — a CHECKED projection, not a
// trusted hand list (contract §3.2). `as` is NOT here: <nuri-view> IS the painting
// node (no inner host element to override).
const BOX_ATTRS = [
  'width', 'height', 'min-height', 'min-width',
  'padding', 'padding-x', 'padding-y', 'padding-start', 'padding-end', 'padding-top', 'padding-bottom',
  'radius', 'radius-top', 'aspect-ratio',
];
const STACK_ATTRS = ['direction', 'align', 'justify', 'gap', 'wrap', 'fill', 'distribute'];
const PALETTE_ATTRS = ['variant', 'accent', 'muted', 'chrome'];
const EFFECT_ATTRS = ['elevation'];
const ATTRS = [...BOX_ATTRS, ...STACK_ATTRS, ...PALETTE_ATTRS, ...EFFECT_ATTRS];

// The full vocabulary of data-* keys this element manages (so a CHANGE/REMOVAL
// of a public attr re-derives cleanly without touching anything the factory owns
// — only relevant once #managed, i.e. on a hand-authored node). box/stack keys
// are 1:1 kebab → `data-{attr}`; palette emits variant/chrome/accent (muted is
// dropped on web · the web palette has no `data-muted` · memory: web-palette-no-muted).
const MANAGED_DATA = [
  ...BOX_ATTRS.map((a) => `data-${a}`),
  ...STACK_ATTRS.map((a) => `data-${a}`),
  ...EFFECT_ATTRS.map((a) => `data-${a}`),
  'data-variant', 'data-chrome', 'data-accent',
];

// fill · enum grow | grow-shrink | even (the stack namespace normalization · B1.5 §3):
// a bare `fill` (or `fill="grow"`) means grow; `grow-shrink` / `even` pass through;
// anything else present defaults to grow. The factory never emits bare fill (its
// descriptors are explicit), so this normalization is the hand-author's alone.
const normalizeFill = (v) => (v === 'grow-shrink' ? 'grow-shrink' : v === 'even' ? 'even' : 'grow');

class NuriView extends HTMLElement {
  static get observedAttributes() {
    return ATTRS;
  }

  // The dual-mode latch (the named risk): flips true the first time this node
  // carries a public attr — i.e. a hand author painted it. A factory-painted
  // node never carries a public attr, so it stays false and #sync is a no-op,
  // leaving the factory's classes + data-* untouched.
  #managed = false;
  #distributeObserver = null;

  connectedCallback() {
    this.#sync();
    this.#syncDistribute();
  }

  attributeChangedCallback() {
    if (this.isConnected) this.#sync();
    if (this.isConnected) this.#syncDistribute();
  }

  disconnectedCallback() {
    if (this.#distributeObserver) { this.#distributeObserver.disconnect(); this.#distributeObserver = null; }
  }

  // distribute="even" · the parent-side even split. Web cannot reach the real flex
  // item THROUGH a display:contents component host (nuri-button) with a `> *`
  // combinator — the flex would land on the boxless host. So wrap each direct ELEMENT
  // child in a real `.nuri-stack` box that the `[data-distribute="even"] > *` rule
  // sizes to an equal share (flex 1 1 0); the child then stretches to fill it. The RN
  // twin wraps each child in a flex View — the symmetric projection of one intent.
  // Idempotent + childList-observed: added children get wrapped, toggling off unwraps.
  #syncDistribute() {
    if (this.#distributeObserver) this.#distributeObserver.disconnect();
    if (this.getAttribute('distribute') === 'even') {
      for (const child of [...this.children]) {
        if (child.dataset.nuriDistributeWrapper !== undefined) continue; // already wrapped
        const w = document.createElement('div');
        w.className = 'nuri-stack';
        w.dataset.nuriDistributeWrapper = '';
        this.insertBefore(w, child);
        w.appendChild(child);
      }
      if (!this.#distributeObserver) this.#distributeObserver = new MutationObserver(() => this.#syncDistribute());
      this.#distributeObserver.observe(this, { childList: true });
    } else {
      for (const w of [...this.children]) {
        if (w.dataset.nuriDistributeWrapper === undefined) continue;
        while (w.firstChild) this.insertBefore(w.firstChild, w);
        w.remove();
      }
      this.#distributeObserver = null;
    }
  }

  // Self-derive the merged-node classes + data-* from this element's OWN public
  // attrs, via the factory's mergeAttrs (no second mechanism). Guarded by the
  // dual-mode latch so it never runs on a factory-painted node.
  #sync() {
    const hasPublic = ATTRS.some((a) => this.hasAttribute(a));
    if (!this.#managed && !hasPublic) return; // factory-painted or bare → don't clobber
    this.#managed = true;

    const { classes, data } = mergeAttrs(this.#readNS());

    // accent self-scope (Tier-2 · decision 27/62) — the factory mirrors `accent`
    // to data-accent directly on the node; mergeAttrs leaves accent to the host,
    // so apply it here with the same spelling.
    const accent = this.getAttribute('accent');
    if (accent) data['data-accent'] = accent;

    // namespace classes — toggle the three so removing a namespace's last attr
    // drops its class (safe: only a #managed, hand-authored node reaches here).
    for (const c of ['nuri-box', 'nuri-stack', 'nuri-palette', 'nuri-effect']) {
      this.classList.toggle(c, classes.includes(c));
    }
    // data-* — set the derived keys, drop the managed-but-absent ones.
    for (const key of MANAGED_DATA) {
      if (key in data) this.setAttribute(key, data[key]);
      else this.removeAttribute(key);
    }
  }

  // Bucket the present public attrs into the namespace map mergeAttrs consumes.
  // Keys stay kebab — mergeAttrs's camelToKebab is the identity on an already-kebab
  // key, so the emitted data-* spelling is identical to the factory's (e.g.
  // 'aspect-ratio' → data-aspect-ratio). The only non-passthrough values are the
  // stack booleans/enums normalized to the stack.css vocabulary (wrap, fill).
  #readNS() {
    const ns = {};

    const box = {};
    for (const a of BOX_ATTRS) if (this.hasAttribute(a)) box[a] = this.getAttribute(a);
    if (Object.keys(box).length) ns.box = box;

    const stack = {};
    for (const a of STACK_ATTRS) {
      if (!this.hasAttribute(a)) continue;
      if (a === 'wrap') stack.wrap = true; // boolean attr → mergeAttrs emits data-wrap='true'
      else if (a === 'fill') stack.fill = normalizeFill(this.getAttribute('fill'));
      else stack[a] = this.getAttribute(a);
    }
    if (Object.keys(stack).length) ns.stack = stack;

    const palette = {};
    for (const a of PALETTE_ATTRS) if (this.hasAttribute(a)) palette[a] = this.getAttribute(a);
    if (Object.keys(palette).length) ns.palette = palette;

    const effect = {};
    for (const a of EFFECT_ATTRS) if (this.hasAttribute(a)) effect[a] = this.getAttribute(a);
    if (Object.keys(effect).length) ns.effect = effect;

    return ns;
  }
}

// Idempotent define (decision 74) — the factory-backed recipes self-import this
// primitive, so a page's <script type="module"> tag for it coexists with that import.
if (!customElements.get('nuri-view')) customElements.define('nuri-view', NuriView);
