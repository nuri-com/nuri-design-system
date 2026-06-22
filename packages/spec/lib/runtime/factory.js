/* ──────────────────────────────────────────────────────────────
 * NURI · WEB FACTORY · buildComponent (the runtime web mirror · decision 67 · S3)
 *
 * The browser analogue of the RN factory (packages/rn/createNuriComponent
 * + resolve.ts). Given a FROZEN descriptor + an axis selection it returns a
 * de-collapsed `nuri-*` DOM tree styled ENTIRELY by the existing hand-authored
 * @layer CSS — option A (operator-chosen · decision 67): the web emit is
 * field → data-* / namespace-class on the merged node; the namespace CSS
 * (box.css / stack.css / palette.css / interactive.css) resolves it. NO inline
 * styles, NO build step, NO resolve-map.ts (that table stays RN-only · the S1
 * neutrality choice). Decision 2 (CSS is SoT) STANDS — this is NOT §9: the
 * factory is a descriptor CONSUMER, exactly like the RN factory.
 *
 * It MIRRORS the RN merge semantics (resolve.ts), it does NOT import them
 * (that file is RN-coupled · pulls ViewStyle). Hand-written here:
 *   · resolveAnatomy   — walk the descriptor anatomy into a render tree
 *   · mergeNS          — base ⊕ each selected-axis patch, per namespace (later wins)
 *   · mergedNSForPart  — collect base + the selected variant maps for one part
 * The walker is generic (component-/axis-agnostic · the engine is fixed); the
 * surface it walks is the generated descriptor.
 *
 * THE el → web-primitive map (the N+26 lock · roadmap/N+26.md):
 *   view + interactive → <nuri-pressable>   (the RN <Pressable> case)  ·  BUILT
 *   text               → <nuri-typography>  (REUSE · text parts are single-NS)
 *   view (static)      → <nuri-view>         · S4 (not built · Button has none)
 *   icon               → <nuri-icon>         · S4 (Button has none)
 * S3 is the BUTTON slice: only `view+interactive` (root) + `text` (label) are
 * exercised; the other arms throw a clear "S4" error rather than silently
 * mis-rendering.
 *
 * THE MERGED NODE (B1.5 §4.2 · the faithful web analogue of RN's single
 * <View style>): box ⊕ stack ⊕ palette ⊕ interactive co-exist on ONE node —
 * the inner <button> the <nuri-pressable> owns. `nuri-pressable` sets that
 * button's className ONCE (`.nuri-interactive`) and never rewrites it (the N+26
 * contract), so the factory MERGES `nuri-box nuri-stack nuri-palette` + the
 * geometry/colour data-* onto the same button with no clobber. The button is
 * created lazily in the pressable's connectedCallback, so the merge is DEFERRED
 * until it exists (a one-shot MutationObserver · applied before first paint).
 *
 * INTERACTIVE (decision 65.4 · a structured per-part opt-in, not a boolean):
 *   pressScale → the host's `press-scale` attr  (→ data-press-scale gate)
 *   pressColor → the host's `press-color` attr  (→ data-press-color gate · palette swaps bg on :active)
 *   disabledOpacity → AUTOMATIC (interactive.css dims a disabled .nuri-interactive)
 *
 * FOREGROUND flows by SCOPE (§12 · F-BOX-FG-1) — palette sets BOTH bg AND fg
 * (`color`) on the merged node; the `<nuri-typography>` label INHERITS that
 * color (the type utility sets no color of its own). The factory threads NO fg.
 *
 * USAGE (the smoke mounts the output · the factory is a function):
 *   import { buildComponent } from '../../lib/runtime/factory.js';
 *   import { compositionButtonDescriptor } from '../../build/descriptors/composition-button.js';
 *   container.appendChild(
 *     buildComponent(compositionButtonDescriptor, { variant: 'solid', size: 'md' }, { children: 'Pay' }),
 *   );
 *
 * Equivalence is compared at EXPLICIT axis values (the descriptor carries no
 * per-axis default · R1.5): an unset axis falls back to the descriptor's FIRST
 * value (variant→solid), whereas <nuri-button> defaults to soft. That gap is a
 * known finding, NOT fixed here.
 * ────────────────────────────────────────────────────────────── */

// The canonical namespace merge order (resolve.ts NS_ORDER · load-bearing: the
// merge inserts keys in THIS order). The web emit reads stack/box/palette as
// merged-node classes+data-*; typography is the label el; interactive is the
// pressable opt-in.
const NS_ORDER = ['stack', 'box', 'typography', 'palette', 'interactive'];

// camelCase descriptor field → kebab-case data-* attr (the box/stack vocab:
// minHeight → data-min-height · paddingX → data-padding-x · direction stays).
const camelToKebab = (s) => s.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());

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
function mergedNSForPart(descriptor, selection, part) {
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
function mergeAttrs(ns) {
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

// 'mdEm' → { size: 'md', emphasis: true } · 'sm' → { size: 'sm', emphasis: false }.
// The descriptor's typeStep is `<sizeKey>` + optional `Em` suffix (descriptors.js
// typeStepFrom); <nuri-typography size emphasis> realizes it.
function expandTypeStep(step) {
  return step.endsWith('Em')
    ? { size: step.slice(0, -2), emphasis: true }
    : { size: step, emphasis: false };
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

// ── render one anatomy node → its nuri-* element ──
function renderPart(node, ctx) {
  const ns = mergedNSForPart(ctx.descriptor, ctx.selection, node.name);

  if (node.el === 'view') {
    if (!ns.interactive) {
      // view (static) → <nuri-view>, built at S4 (Button has no static view).
      throw new Error(`[nuri-factory] static 'view' part '${node.name}' needs nuri-view (S4)`);
    }
    return renderInteractiveView(node, ns, ctx);
  }
  if (node.el === 'text') return renderText(node, ns, ctx);

  // icon (S4) / any other el — out of the S3 Button slice.
  throw new Error(`[nuri-factory] el '${node.el}' (part '${node.name}') is out of the S3 Button slice (S4)`);
}

// view + interactive → <nuri-pressable> + the merged inner <button>.
function renderInteractiveView(node, ns, ctx) {
  const host = document.createElement('nuri-pressable');

  // interactive opt-in → the pressable's gate attrs (decision 65.4 · N+26).
  if (ns.interactive.pressScale) host.setAttribute('press-scale', '');
  if (ns.interactive.pressColor) host.setAttribute('press-color', '');
  // disabledOpacity is automatic (interactive.css dims a disabled host).

  // instance / base props (the createNuriComponent NuriBaseProps mirror).
  if (ctx.base.disabled) host.setAttribute('disabled', '');
  if (ctx.base.accent) host.setAttribute('accent', ctx.base.accent); // Tier-2 self-scope
  if (ctx.base.accessibilityLabel) host.setAttribute('accessibility-label', ctx.base.accessibilityLabel);

  // children parts + this part's own routed content (appended to the host; the
  // pressable moves them INTO the inner <button> on connect).
  const own = ctx.content[node.name];
  if (own != null) host.append(own);
  for (const child of node.children) host.appendChild(renderPart(child, ctx));

  // box ⊕ stack ⊕ palette → merged onto the inner <button> (deferred).
  applyToInteractiveHost(host, mergeAttrs(ns));
  return host;
}

// text → <nuri-typography size emphasis> (the label · single-namespace).
function renderText(node, ns, ctx) {
  const el = document.createElement('nuri-typography');
  if (ns.typography && ns.typography.size !== undefined) {
    const { size, emphasis } = expandTypeStep(ns.typography.size);
    el.setAttribute('size', size);
    if (emphasis) el.setAttribute('emphasis', '');
  }
  const own = ctx.content[node.name];
  if (own != null) el.append(own); // the string label
  return el;
}

/**
 * buildComponent · descriptor + selection → a de-collapsed nuri-* tree.
 *
 * @param descriptor a frozen component descriptor (build/descriptors/*.js)
 * @param selection  axis → value (e.g. { variant:'solid', size:'md' }); an
 *                   unset axis falls back to the descriptor's FIRST value
 *                   (the createNuriComponent defaultByAxis mirror · R1.5).
 * @param props      instance/base props { children, disabled, accent,
 *                   accessibilityLabel, content } — `children` routes to the
 *                   lone non-root part (Button → label), like the RN factory.
 * @returns the root nuri-* HTMLElement (the smoke mounts it).
 */
export function buildComponent(descriptor, selection = {}, props = {}) {
  const anatomy = resolveAnatomy(descriptor);

  // first-value fallback per axis (createNuriComponent · the frozen descriptor
  // carries no per-axis default · R1.5).
  const sel = {};
  if (descriptor.variants) {
    for (const axis of Object.keys(descriptor.variants)) {
      const provided = selection[axis];
      sel[axis] = typeof provided === 'string' ? provided : Object.keys(descriptor.variants[axis])[0];
    }
  }

  // `children` → the PRIMARY content part (the lone non-root part), unless
  // `content` already set it (the createNuriComponent routing).
  const primaryPart = anatomy.children.length === 1 ? anatomy.children[0].name : undefined;
  const content = { ...props.content };
  if (props.children !== undefined && primaryPart && content[primaryPart] === undefined) {
    content[primaryPart] = props.children;
  }

  return renderPart(anatomy, { descriptor, selection: sel, content, base: props });
}
