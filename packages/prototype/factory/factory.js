/* ──────────────────────────────────────────────────────────────
 * NURI · WEB FACTORY · buildComponent (the runtime web mirror · decision 67 · S3/S4)
 *
 * The browser analogue of the RN factory (packages/rn/createNuriComponent
 * + resolve.ts). Given a FROZEN descriptor + an axis selection it returns a
 * de-collapsed `nuri-*` DOM tree styled ENTIRELY by the existing hand-authored
 * @layer CSS — option A (operator-chosen · decision 67): the web emit is
 * field → data-* / namespace-class on the merged node; the namespace CSS
 * (box.css / stack.css / palette.css / interactive.css) resolves it. NO inline
 * styles, NO build step, NO resolve-map.ts import (the factory styles via the
 * namespace CSS, not the table — which now lives in @nuri/spec, RN-free · N+39).
 * The factory is a descriptor CONSUMER, exactly like the RN factory.
 *
 * It MIRRORS the RN merge semantics (resolve.ts), it does NOT import them
 * (that file is RN-coupled · pulls ViewStyle). Hand-written here:
 *   · resolveAnatomy   — walk the descriptor anatomy into a render tree
 *   · mergeNS          — base ⊕ each selected-axis patch, per namespace (later wins)
 *   · mergedNSForPart  — collect base + the selected variant maps for one part
 * The walker is generic (component-/axis-agnostic · the engine is fixed); the
 * surface it walks is the generated descriptor.
 *
 * THE el → web-primitive map (the N+26 lock · roadmap/N+26.md · ALL BUILT @S4):
 *   view + interactive → <nuri-pressable>     (the RN <Pressable> case)
 *   view (static)      → <nuri-view>           (the RN static <View> · the element IS the merged node)
 *   text               → <nuri-typography>     (REUSE · text parts are single-NS)
 *   icon               → <nuri-icon name=X>    (glyph leaf · name routed · fg by currentColor)
 * S3 shipped the BUTTON slice (view+interactive + text). S4 generalizes the
 * SAME engine to IconAvatar (static view + icon child) + Topbar (open static
 * view + a static-view content pivot) — `open` needs NO branch (the RN oracle's
 * renderPart does not branch on it: a view renders own-content + child parts
 * regardless; `open` only marks that the host accepts positional children, which
 * the own-content append already serves). An unknown el hits the renderPart
 * default throw — the web analogue of the RN factory's assertNever (R7).
 *
 * THE MERGED NODE (B1.5 §4.2 · the faithful web analogue of RN's single
 * <View style>): box ⊕ stack ⊕ palette ⊕ interactive co-exist on ONE node —
 * the inner <button> the <nuri-pressable> owns. `nuri-pressable` sets that
 * button's className ONCE (`.nuri-interactive`) and never rewrites it (the N+26
 * contract), so the factory MERGES `nuri-box nuri-stack nuri-palette` + the
 * geometry/colour data-* onto the same button with no clobber. The button is
 * created lazily in the pressable's connectedCallback, so the merge is DEFERRED
 * until it exists (a one-shot MutationObserver · applied before first paint).
 * For a STATIC view (no interactive · IconAvatar / Topbar) the merged node is
 * the <nuri-view> ELEMENT ITSELF — no inner element, so the classes + data-*
 * land directly and synchronously, no MutationObserver.
 *
 * INTERACTIVE (decision 65.4 · a structured per-part opt-in, not a boolean · the gate
 * attr is SoT-derived · N+44 · the host attr = opts[key].gate via camelToKebab):
 *   pressScale → the host's `press-scale` attr  (→ data-press-scale gate)
 *   pressColor → the host's `press-color` attr  (→ data-press-color gate · palette swaps bg on :active)
 *   disabledOpacity → AUTOMATIC (gate 'auto' · interactive.css dims a disabled .nuri-interactive)
 *
 * FOREGROUND flows by SCOPE (§12 · F-BOX-FG-1) — palette sets BOTH bg AND fg
 * (`color`) on the merged node; the `<nuri-typography>` label INHERITS that
 * color (the type utility sets no color of its own). The factory threads NO fg.
 *
 * USAGE (the smoke mounts the output · the factory is a function · paths from a recipe):
 *   import { buildComponent } from '../factory/factory.js';
 *   import { compositionButtonDescriptor } from '../../spec/build/descriptors/composition-button.js';
 *   container.appendChild(
 *     buildComponent(compositionButtonDescriptor, { variant: 'solid', size: 'md' }, { children: 'Pay' }),
 *   );
 *
 * An unset axis resolves to descriptor.defaults[axis] (R1.5 · N+50 · now IN the
 * contract — Button→soft), else the axis's FIRST value. The web factory + the
 * RN createNuriComponent read the SAME `defaults`, so <nuri-button> and <Button>
 * default identically (the parity gap the recipes patched at the binding CLOSED).
 *
 * defineNuriComponent (below) is the generic custom-element registration over
 * buildComponent — the web twin of createNuriComponent (the recipes are now a
 * single line · the hand HTMLElement wrappers retired · N+50 · decision 65).
 * ────────────────────────────────────────────────────────────── */

// The canonical namespace merge order (resolve.ts NS_ORDER · load-bearing: the
// merge inserts keys in THIS order). The web emit reads stack/box/palette as
// merged-node classes+data-*; typography is the label el; interactive is the
// pressable opt-in.
const NS_ORDER = ['stack', 'box', 'typography', 'palette', 'interactive'];

// camelCase descriptor field → kebab-case data-* attr (the box/stack vocab:
// minHeight → data-min-height · paddingX → data-padding-x · direction stays).
const camelToKebab = (s) => s.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());

// The GATED interactive opt-ins (decision 65.4 · 74 · the N+44 single-source) — the
// opts whose SoT `gate` is an author attribute (gate !== 'auto'). The factory sets the
// host attr derived from the opt key via camelToKebab (pressScale → press-scale ·
// pressColor → press-color); the attr STRING is NOT hardcoded here — it equals the
// SoT's opts[key].gate (@nuri/spec/interactive-effects), pinned by the interactive-gate
// guard (pipeline/interactive-css.test.js · the factory is browser-runtime · cannot
// import the .ts SoT). disabledOpacity is AUTOMATIC (gate 'auto' · the native `disabled`
// dims via interactive.css) → not gated. A new gated opt fails the guard until listed
// here — the single-source seam, no second copy of the opt→attr mapping.
export const INTERACTIVE_GATES = ['pressScale', 'pressColor'];

// ── merge: base ⊕ each selected axis patch, per namespace (resolve.ts mergeNS) ──
// later wins; each present namespace is shallow-merged in NS_ORDER.
function mergeNS(list) {
  const out = {};
  for (const ns of list) {
    for (const key of NS_ORDER) {
      const patch = ns[key];
      if (patch) out[key] = { ...out[key], ...patch };
    }
  }
  return out;
}

// The merged NS for one part = base[part] ⊕ each selected variant's [part]
// (resolve.ts mergedNSForPart). Axis order = descriptor.variants key order.
// EXPORTED (decision 74) so a recipe element that styles EXISTING host nodes
// rather than mounting a fresh tree (nuri-topbar · the apply-NS-to-host path ·
// it has positional children the open-view factory can't place) can read the
// descriptor's per-part namespaces the same way buildComponent does.
export function mergedNSForPart(descriptor, selection, part) {
  const maps = [];
  const baseNS = descriptor.structure.base && descriptor.structure.base[part];
  if (baseNS) maps.push(baseNS);
  if (descriptor.variants) {
    for (const axis of Object.keys(descriptor.variants)) {
      const value = selection[axis];
      if (value === undefined) continue;
      const valueMap = descriptor.variants[axis][value];
      const partNS = valueMap && valueMap[part];
      if (partNS) maps.push(partNS);
    }
  }
  return mergeNS(maps);
}

// ── anatomy → a render tree (resolve.ts resolveAnatomy) ──
function resolveAnatomy(descriptor) {
  const walk = (name, a) => ({
    name,
    el: a.el,
    open: !!a.open,
    children: a.parts ? Object.keys(a.parts).map((c) => walk(c, a.parts[c])) : [],
  });
  return walk('root', descriptor.structure.anatomy);
}

// ── the agnostic namespaces (box · stack · palette) → merged-node classes+data-* ──
// The web emit of option A: each present agnostic namespace contributes its
// class + its fields as data-* (the box/stack/palette CSS dispatches on them).
// interactive + typography are handled by their own el-hosts, not here.
// EXPORTED (decision 74) for the apply-NS-to-host path (nuri-topbar) — the same
// field → class + data-* spelling buildComponent applies to a merged node.
export function mergeAttrs(ns) {
  const classes = [];
  const data = {};
  const dispatch = (nsObj) => {
    for (const [k, v] of Object.entries(nsObj)) {
      if (typeof v === 'boolean') {
        if (v) data[`data-${camelToKebab(k)}`] = 'true'; // box.center / stack.wrap convention
      } else {
        data[`data-${camelToKebab(k)}`] = v;
      }
    }
  };
  if (ns.stack) { classes.push('nuri-stack'); dispatch(ns.stack); }
  if (ns.box) { classes.push('nuri-box'); dispatch(ns.box); }
  if (ns.palette) {
    classes.push('nuri-palette');
    // The palette SURFACE dispatch keys (palette.css): variant XOR chrome. fg
    // rides along by contract; accent/muted are not Button's (palette.accent is
    // unused by the three frozen descriptors · S4 if ever).
    if (ns.palette.variant !== undefined) data['data-variant'] = ns.palette.variant;
    if (ns.palette.chrome !== undefined) data['data-chrome'] = ns.palette.chrome;
  }
  return { classes, data };
}

// Defer the box/stack/palette merge onto the inner <button> the pressable owns.
// The button is created in the pressable's connectedCallback (on mount), so we
// apply NOW if it already exists, else watch the host's childList for it (a
// one-shot · microtask · lands before first paint). The pressable never
// rewrites the button's className (N+26), so the merge is permanent.
function applyToInteractiveHost(host, merge) {
  const apply = () => {
    const btn = host.querySelector('button.nuri-interactive');
    if (!btn) return false;
    if (merge.classes.length) btn.classList.add(...merge.classes);
    for (const [k, v] of Object.entries(merge.data)) btn.setAttribute(k, v);
    return true;
  };
  if (apply()) return;
  const obs = new MutationObserver(() => {
    if (apply()) obs.disconnect();
  });
  obs.observe(host, { childList: true });
}

// ── render one anatomy node → its nuri-* element (the el → web-primitive map) ──
function renderPart(node, ctx) {
  const ns = mergedNSForPart(ctx.descriptor, ctx.selection, node.name);
  switch (node.el) {
    case 'view':
      // interactive view → <nuri-pressable> (S3); static view → <nuri-view> (S4).
      return ns.interactive ? renderInteractiveView(node, ns, ctx) : renderStaticView(node, ns, ctx);
    case 'text':
      return renderText(node, ns, ctx);
    case 'icon':
      return renderIcon(node, ns, ctx);
    default:
      // The web analogue of the RN factory's assertNever (R7): an el outside the
      // frozen vocabulary is a hard error, never a silent mis-render.
      throw new Error(`[nuri-factory] unhandled el '${node.el}' (part '${node.name}')`);
  }
}

// view + interactive → <nuri-pressable> + the merged inner <button>.
function renderInteractiveView(node, ns, ctx) {
  const host = document.createElement('nuri-pressable');

  // interactive opt-in → the pressable's gate attrs (decision 65.4 · N+26): for each
  // GATED opt that is on, set the host attr derived from the opt key (= opts[key].gate ·
  // single-sourced via INTERACTIVE_GATES + the guard · no hardcoded attr string here).
  // disabledOpacity is automatic (interactive.css dims a disabled host).
  for (const key of INTERACTIVE_GATES) {
    if (ns.interactive[key]) host.setAttribute(camelToKebab(key), '');
  }

  // instance / base props (the createNuriComponent NuriBaseProps mirror).
  if (ctx.base.disabled) host.setAttribute('disabled', '');
  if (ctx.base.accent) host.setAttribute('accent', ctx.base.accent); // Tier-2 self-scope
  if (ctx.base.accessibilityLabel) host.setAttribute('accessibility-label', ctx.base.accessibilityLabel);

  // children parts + this part's own routed content (appended to the host; the
  // pressable moves them INTO the inner <button> on connect).
  const own = ctx.content[node.name];
  if (own != null) host.append(own);
  // A leaf child may render NOTHING (an absent optional flank · renderPart → null).
  for (const child of node.children) {
    const childEl = renderPart(child, ctx);
    if (childEl) host.appendChild(childEl);
  }

  // box ⊕ stack ⊕ palette → merged onto the inner <button> (deferred).
  applyToInteractiveHost(host, mergeAttrs(ns));
  return host;
}

// view (static) → <nuri-view> · the element IS the merged node (no inner
// element, no interactive, no deferral · the simple counterpart of the
// pressable). box ⊕ stack ⊕ palette land directly; the @layer CSS resolves it.
// IconAvatar's circle (box+stack+palette) and Topbar's chrome row + content
// pivot are all static views. `open` carries no extra branch — own content +
// child parts render the same whether the host accepts positional children.
function renderStaticView(node, ns, ctx) {
  const host = document.createElement('nuri-view');

  // box ⊕ stack ⊕ palette → applied DIRECTLY (the element is the painting node;
  // mergeAttrs handles palette variant XOR chrome — IconAvatar uses variant,
  // Topbar uses chrome:canvas).
  const { classes, data } = mergeAttrs(ns);
  if (classes.length) host.classList.add(...classes);
  for (const [k, v] of Object.entries(data)) host.setAttribute(k, v);

  // accent self-scope (Tier-2 · decision 27/62) — mirror to data-accent on this
  // node so the token cascade re-resolves accent tokens here only (the
  // icon-avatar.js inner-span mechanism; the node IS the surface).
  if (ctx.base.accent) host.setAttribute('data-accent', ctx.base.accent);

  // own content (an `open` host's positional children · ctx.content[root]) then
  // the child parts — the RN renderPart order (own content keyed before kids).
  const own = ctx.content[node.name];
  if (own != null) host.append(own);
  // A leaf child may render NOTHING (an absent optional flank · renderPart → null).
  for (const child of node.children) {
    const childEl = renderPart(child, ctx);
    if (childEl) host.appendChild(childEl);
  }
  return host;
}

// text → <nuri-typography size emphasis> (the label · single-namespace). The
// descriptor's typography carries two ORTHOGONAL inputs now (decision 77 · the
// N+45 de-fusion): `size` + the `emphasis` boolean — passed straight to the
// element (no fused `mdEm` round-trip · expandTypeStep retired).
function renderText(node, ns, ctx) {
  const own = ctx.content[node.name];
  if (own == null) return null; // optional flank with no text → render nothing (the bare-collapse)
  const el = document.createElement('nuri-typography');
  const t = ns.typography;
  if (t) {
    if (t.size !== undefined) el.setAttribute('size', t.size);
    if (t.emphasis) el.setAttribute('emphasis', '');
  }
  // A text part may ALSO carry box/stack/palette (e.g. an icon-button flank's edge
  // padding · box{paddingStart}) — merge them as classes + data-* (the same
  // merged-node treatment renderIcon uses · the RN text node gets these via
  // flat.style). typography stays its own attrs above.
  const { classes, data } = mergeAttrs(ns);
  if (classes.length) el.classList.add(...classes);
  for (const [k, v] of Object.entries(data)) el.setAttribute(k, v);
  el.append(own); // the string label
  return el;
}

// icon → <nuri-icon name=X> · the glyph leaf (IconAvatar's icon part). fg flows
// by SCOPE — the parent view's palette sets `color`, and <nuri-icon>'s SVG
// (fill="currentColor") inherits it (the same mechanism as the typography label;
// this is how `subtle`'s fg-only variant tints the glyph). SIZE rides the SHARED
// box axis (N+51 · the icon-arc close): the descriptor's icon part carries a `box`
// ({width,height} · size leaves), applied here as nuri-box + data-width/data-height
// — box.css sizes the glyph (inline-size/block-size). The <nuri-icon> element
// RESPECTS a host-pinned box (it only self-derives box from its own `size` prop),
// so the descriptor value drives. Without a box the element falls to size=md.
function renderIcon(node, ns, ctx) {
  const name = ctx.content[node.name];
  if (name == null) return null; // no glyph routed → render nothing (the bare-collapse)
  const el = document.createElement('nuri-icon');
  el.setAttribute('name', String(name));
  const { classes, data } = mergeAttrs(ns);
  if (classes.length) el.classList.add(...classes);
  for (const [k, v] of Object.entries(data)) el.setAttribute(k, v);
  return el;
}

/**
 * buildComponent · descriptor + selection → a de-collapsed nuri-* tree.
 *
 * @param descriptor a frozen component descriptor (build/descriptors/*.js)
 * @param selection  axis → value (e.g. { variant:'solid', size:'md' }); an
 *                   unset axis falls back to the descriptor's FIRST value
 *                   (the createNuriComponent defaultByAxis mirror · R1.5).
 * @param props      instance/base props { children, name, disabled, accent,
 *                   accessibilityLabel, content } — `children` routes to the
 *                   lone non-root part (Button → label · Topbar → content pivot);
 *                   `name` routes the glyph to an `icon` primary part
 *                   (IconAvatar), like the RN factory's primary-part routing.
 * @returns the root nuri-* HTMLElement (the smoke mounts it).
 */
export function buildComponent(descriptor, selection = {}, props = {}) {
  const anatomy = resolveAnatomy(descriptor);

  // per-axis default = the descriptor's `defaults[axis]` (R1.5 · N+50 · now IN
  // the contract — Button=soft), else the axis's FIRST value (the generic
  // fallback). The SAME source createNuriComponent's defaultByAxis reads, so an
  // unset axis resolves identically on both platforms (the parity close).
  const sel = {};
  if (descriptor.variants) {
    for (const axis of Object.keys(descriptor.variants)) {
      const provided = selection[axis];
      sel[axis] =
        typeof provided === 'string'
          ? provided
          : (descriptor.defaults && descriptor.defaults[axis]) ?? Object.keys(descriptor.variants[axis])[0];
    }
  }

  // `children` → the PRIMARY content part (the lone non-root part), unless
  // `content` already set it (the createNuriComponent routing). For an `icon`
  // primary part (IconAvatar) the routed content is the glyph NAME instead —
  // <nuri-icon-avatar name=X> routes `name`, not children (the recipe's API).
  const primary = anatomy.children.length === 1 ? anatomy.children[0] : undefined;
  const content = { ...props.content };
  if (primary && content[primary.name] === undefined) {
    if (props.children !== undefined) content[primary.name] = props.children;
    else if (props.name !== undefined && primary.el === 'icon') content[primary.name] = props.name;
  }
  // Ergonomic per-part props (prefix/icon/suffix · the icon-button's three-part
  // anatomy has no lone primary) → the content map BY PART NAME. On web each is a
  // STRING (the text flank · or the glyph NAME for an `icon` leaf); an unset prop
  // leaves the part absent → its leaf renders nothing (the bare-collapse · the RN
  // createNuriComponent mirror). A single-primary component is unaffected.
  for (const child of anatomy.children) {
    if (content[child.name] === undefined && props[child.name] !== undefined) {
      content[child.name] = props[child.name];
    }
  }

  return renderPart(anatomy, { descriptor, selection: sel, content, base: props });
}

/**
 * defineNuriComponent · descriptor + tag name → a registered custom element.
 *
 * The web TWIN of createNuriComponent (the generic RN factory · decision 65 ·
 * 65.5 "X-wired" — ONE factory, schema-driven, zero per-component code). Where
 * the RN factory returns a typed React component, this defines a custom element
 * over `buildComponent`: the SAME API derivation (axes → attributes), the SAME
 * defaults source (descriptor.defaults · R1.5 · N+50), the SAME children/name →
 * primary-part routing. A recipe is now a single registration line — the hand
 * `HTMLElement` wrapper (observedAttributes · connectedCallback · attr→selection
 * · define) is gone (N+50 · the no-hand-data close).
 *
 * DERIVED, never hand-passed:
 *   · observedAttributes = the axis names ∪ `accent` (Tier-2 self-scope) ∪
 *     `disabled` (iff the root is interactive) ∪ `name` (iff the primary part
 *     is an `icon` leaf). Nothing component-specific is enumerated here.
 *   · the per-axis DEFAULT comes from descriptor.defaults (buildComponent reads
 *     it) — the element passes ONLY the attributes the author set, never a default.
 *   · the text label of a `text` primary part is captured from textContent
 *     before the factory tree replaces it (Button → label routing).
 *   · DECORATIVE (decision 50) → aria-hidden from descriptor.decorative, not a
 *     hand attr (IconAvatar).
 *
 * @param descriptor a frozen component descriptor (build/descriptors/*.js)
 * @param tagName    the custom-element tag (e.g. 'nuri-button')
 */
export function defineNuriComponent(descriptor, tagName) {
  const axisNames = descriptor.variants ? Object.keys(descriptor.variants) : [];
  const anatomy = resolveAnatomy(descriptor);
  // The lone non-root part receives the routed content (createNuriComponent's
  // primaryPart): a `text` el captures the label · an `icon` el routes `name`.
  const primary = anatomy.children.length === 1 ? anatomy.children[0] : undefined;
  const textPrimary = !!primary && primary.el === 'text';
  const iconPrimary = !!primary && primary.el === 'icon';
  // ERGONOMIC per-part attributes — a non-root part that is NOT the lone primary
  // gets an attribute named after it (prefix/icon/suffix · the icon-button's
  // three-part anatomy · createNuriComponent's prefix/suffix/icon props). For a
  // single-primary component this set is empty (the primary took children/name).
  const nonPrimaryParts = anatomy.children.filter((c) => c !== primary).map((c) => c.name);
  // Interactive iff the root opts in (the `disabled` reflection is generic to any
  // interactive component · button has it, icon-avatar does not).
  const interactive = !!(descriptor.structure.base && descriptor.structure.base.root && descriptor.structure.base.root.interactive);

  const observed = [...axisNames, 'accent'];
  if (interactive) observed.push('disabled');
  if (iconPrimary) observed.push('name');
  observed.push(...nonPrimaryParts);
  // a11y name — an interactive control WITHOUT a text primary (the icon-anchored
  // icon-button) needs an explicit accessible name when bare; flanked, the visible
  // text IS the name (the factory honours both). A text-labelled control (Button)
  // derives its name from the label, so it does NOT observe aria-label.
  if (interactive && !textPrimary) observed.push('aria-label');

  class NuriElement extends HTMLElement {
    static get observedAttributes() {
      return observed;
    }

    #label = null;
    #built = false;

    connectedCallback() {
      if (this.#built) return;
      // Decorative · the whole element is hidden from AT (decision 50) — from DATA.
      if (descriptor.decorative) this.setAttribute('aria-hidden', 'true');
      // Capture the authored label BEFORE the factory tree replaces the children
      // (buildComponent routes `children` to the lone non-root text part).
      if (textPrimary) this.#label = this.textContent.trim();
      this.#render();
      this.#built = true;
    }

    attributeChangedCallback() {
      // Re-render on a live attribute change. The factory tree is rebuilt from the
      // captured label — the prototype mirror does not preserve the inner node
      // across changes (that is the RN factory's production concern).
      if (this.#built) this.#render();
    }

    #render() {
      // Only the attributes the author SET reach the selection — buildComponent
      // fills an unset axis from descriptor.defaults (R1.5 · no default here).
      const selection = {};
      for (const axis of axisNames) {
        const v = this.getAttribute(axis);
        if (v != null) selection[axis] = v;
      }
      const props = {};
      if (textPrimary) props.children = this.#label;
      if (iconPrimary) props.name = this.getAttribute('name') || '';
      if (interactive) props.disabled = this.hasAttribute('disabled');
      const accent = this.getAttribute('accent');
      if (accent) props.accent = accent; // Tier-2 self-scope (threaded to the merged node)
      // Ergonomic per-part attributes (prefix/icon/suffix) → props BY PART NAME;
      // buildComponent routes them into the content map (a STRING flank / glyph
      // name). An absent attr leaves the part out → its leaf renders nothing.
      for (const p of nonPrimaryParts) {
        const v = this.getAttribute(p);
        if (v != null) props[p] = v;
      }
      // aria-label → the a11y accessible name (the factory sets it on the
      // interactive host · nuri-pressable mirrors it to the inner button's
      // aria-label · F-ARIA-LABEL-1). Only observed for an icon-anchored control.
      if (interactive && !textPrimary) {
        const ariaLabel = this.getAttribute('aria-label');
        if (ariaLabel != null) props.accessibilityLabel = ariaLabel;
      }

      this.replaceChildren(buildComponent(descriptor, selection, props));
    }
  }

  customElements.define(tagName, NuriElement);
  return NuriElement;
}
