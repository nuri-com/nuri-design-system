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
 * THE el → web-primitive map (the N+26 lock · roadmap/N+26.md · ALL BUILT @S4 ·
 * `pressable` promoted to a 4th `El` at amendment 65.13 — the host is structure
 * data, keyed on `el`, never sniffed off the interactive flags):
 *   pressable → <nuri-pressable>      (the RN <Pressable> case)
 *   view      → <nuri-view>           (the RN static <View> · the element IS the merged node)
 *   text      → <nuri-typography>     (REUSE · text parts are single-NS)
 *   icon      → <nuri-icon name=X>    (glyph leaf · name routed · fg by currentColor)
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
 * For a STATIC view (el:'view' · IconAvatar / Topbar) the merged node is
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
 *   import { buttonDescriptor } from '../generated/descriptors/button.js';
 *   container.appendChild(
 *     buildComponent(buttonDescriptor, { variant: 'solid', size: 'md' }, { children: 'Pay' }),
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
const NS_ORDER = ['stack', 'box', 'typography', 'palette', 'interactive', 'effect'];

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

// ── The RUNTIME host/leaf partition of `El` — the ONE annotated web hand copy ──
// schema.ts owns the totality-pinned EL_CLASS/HOST_ELS/LEAF_ELS partition (the
// PR-#132 single-sourcing); this browser-runtime module cannot import the .ts
// SoT, so this constant is the single permitted web hand site. Every value-level
// predicate over the partition in this file consumes THIS list — never a fresh
// inline `el === …` enumeration. Keep ≡ schema.ts EL_CLASS.
const HOST_ELS = ['view', 'pressable'];

// EVERY slot/region marker tag registered by ANY defineNuriComponent call. A tag
// found in a host's children that is here but is not one of the host's OWN
// markers is a FOREIGN marker — interpreted against the wrong anatomy it would
// silently mis-route, so the harvest fails named instead (the RN mirror keys the
// same policy off the marker's __nuriSlotOwner).
const NURI_SLOT_TAGS = new Set();

// A part accepts REPEATED composition entries only where the descriptor's api
// declares a slot targeting it `multiple: true` (the sequence contract —
// repeats render as a sequence of instances, never a concatenated leaf).
const isMultiPart = (descriptor, part) =>
  Object.values(descriptor.api?.slots || {}).some((slot) => slot.part === part && slot.multiple === true);

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
  if (ns.effect) { classes.push('nuri-effect'); dispatch(ns.effect); }
  return { classes, data };
}

// Apply a merged namespace map (stack ⊕ box ⊕ palette) to an EXISTING element as
// the namespace classes + data-* — the factory's merged-node spelling onto a HOST
// node instead of a freshly-created one. The compound container (the topbar-slots
// slice) IS its own root painting node (the chrome row · the apply-NS-to-host model
// the old hand recipe used · full-width via the .nuri-stack block-flex), so the
// region children flex inside it directly — no wrapper to collapse the bar width.
function applyHostNS(host, nsMap, accent) {
  const { classes, data } = mergeAttrs(nsMap);
  if (classes.length) host.classList.add(...classes);
  for (const [k, v] of Object.entries(data)) host.setAttribute(k, v);
  if (accent) host.setAttribute('data-accent', accent); // Tier-2 self-scope
}

// Harvest a compound container's authored children into per-region holders (the
// topbar-slots slice). A child that is a region sub-element (<nuri-topbar-leading>)
// contributes its OWN children to that region; any BARE child (no slot wrapper)
// collects into the default region (trailing). Nodes move into detached <template>s
// so the container's replaceChildren can't reclaim them; #render clones from there,
// so a re-render (an accent change) still has the content. Whitespace-only text
// between elements is dropped (flex-layout-irrelevant).
function harvestSlots(host, slotTagToPart, defaultSlot) {
  const slots = {};
  const holderFor = (part) => (slots[part] ??= document.createElement('template'));
  for (const child of [...host.childNodes]) {
    if (child.nodeType === 1) {
      const part = slotTagToPart[child.tagName.toLowerCase()];
      if (part) {
        const tpl = holderFor(part);
        while (child.firstChild) tpl.content.append(child.firstChild);
        continue;
      }
    }
    if (child.nodeType === 3 && !child.textContent.trim()) continue;
    if (defaultSlot) holderFor(defaultSlot).content.append(child);
  }
  return slots;
}

// Harvest ordered composition (<nuri-button-text> leaves · region sub-trees)
// into a PER-SCOPE entry map: `root` carries the host's direct entries; each
// REGION part carries the entries authored inside its marker — its typed slots
// plus its own bare content (an entry whose part IS the region · the
// mixed-content contract). The walker (appendComposition) consumes ONE scope per
// host, so a region's entries are validated against the REGION's anatomy, never
// the root's (a slot targeting a part outside its region fails named). A region
// marker leaves a content-less placeholder entry in the enclosing scope so it
// renders at its authored position. Bare children in a scope with NO fallback
// sink fail named. No marker present → null (the legacy bare text-primary
// route); the pre-scan decides that BEFORE any DOM mutation (the
// <nuri-button>Go</nuri-button> blank-label regression).
function harvestComposition(host, slotTagToSpec, fallbackPart, regionTagToPart = {}, hostTag = 'this component') {
  // PRE-SCAN before any DOM mutation: a marker is only meaningful as a DIRECT
  // child of the host (component slots and region slots alike), so one shallow
  // pass decides the route. A foreign registered marker with NO local marker
  // present fails named here (with a local marker present, collect() fails).
  let hasSlot = false;
  let foreignTag = null;
  for (const child of host.childNodes) {
    if (child.nodeType !== 1) continue;
    const tag = child.tagName.toLowerCase();
    if (slotTagToSpec[tag] || regionTagToPart[tag]) {
      hasSlot = true;
      break;
    }
    if (NURI_SLOT_TAGS.has(tag)) foreignTag = tag;
  }
  if (!hasSlot) {
    if (foreignTag) throw new Error(`[nuri-factory] foreign slot marker '<${foreignTag}>' — not a '${hostTag}' slot`);
    return null;
  }

  const byPart = {};
  const textEntry = (list, part, node) => {
    const tpl = document.createElement('template');
    tpl.content.append(node);
    list.push({ part, content: tpl });
  };

  const collect = (nodes, scopePart, fallback) => {
    const list = (byPart[scopePart] ??= []);
    for (const child of [...nodes]) {
      if (child.nodeType === 1) {
        const tag = child.tagName.toLowerCase();
        const spec = slotTagToSpec[tag];
        if (spec) {
          if (spec.kind === 'icon-name') {
            list.push({ part: spec.part, content: child.getAttribute('name') });
          } else {
            const tpl = document.createElement('template');
            while (child.firstChild) tpl.content.append(child.firstChild);
            list.push({ part: spec.part, content: tpl });
          }
          continue;
        }
        const regionPart = regionTagToPart[tag];
        if (regionPart) {
          list.push({ part: regionPart }); // the placeholder — the region's own entries live in byPart[regionPart]
          collect(child.childNodes, regionPart, regionPart);
          continue;
        }
        if (NURI_SLOT_TAGS.has(tag)) {
          throw new Error(`[nuri-factory] foreign slot marker '<${tag}>' — not a '${hostTag}' slot`);
        }
      }
      if (child.nodeType === 3 && !child.textContent.trim()) continue;
      if (child.nodeType === 8) continue; // comments are never content
      if (!fallback) {
        throw new Error(`[nuri-factory] '${hostTag}' has no default content slot — bare children must use its typed slot markers`);
      }
      textEntry(list, fallback, child);
    }
  };

  collect(host.childNodes, 'root', fallbackPart);
  return byPart;
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
      // static view → <nuri-view> (S4). The host decision is STRUCTURE data now
      // (el:'pressable' · amendment 65.13) — no interactive-flag sniff here.
      return renderStaticView(node, ns, ctx);
    case 'pressable':
      // pressable host → <nuri-pressable> (S3) — keyed on `el`, the per-descriptor
      // structural fact; the `interactive` flags still choose only the EFFECTS.
      return renderInteractiveView(node, ns, ctx);
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

function findChildPath(node, part) {
  for (const child of node.children) {
    if (child.name === part) return [child];
    const nested = findChildPath(child, part);
    if (nested) return [child, ...nested];
  }
  return null;
}

function cloneEntryContent(value) {
  const isTemplate = value && value.nodeType === 1 && value.tagName === 'TEMPLATE';
  return isTemplate ? value.content.cloneNode(true) : value;
}

function appendValue(host, value) {
  if (Array.isArray(value)) host.append(...value);
  else host.append(value);
}

// ── THE PROSE-CHILDREN RULE (web mirror · form-kit-spec §1.3) ──
// The web twin of renderer.tsx#wrapProse. A host that authors a `typography`
// style wraps its BARE TEXT-NODE children in a styled <nuri-typography> so they
// render as PROSE: the host's type style + a grow/shrink fill (nuri-stack ·
// data-fill grow-shrink) so the message FILLS + wraps while sibling parts (a
// leading icon, a trailing action) HUG their content. Colour inherits the host
// palette fg by scope (currentColor · §12). A host with NO typography NS leaves
// nodes RAW (the mixed-content contract · web tolerates loose text nodes) and
// ELEMENT children always pass through unchanged. Web tolerates a bare text node
// where RN crashes, but wraps identically so the two layouts match.
function proseWrapper(text, typographyNS) {
  const el = document.createElement('nuri-typography');
  el.setAttribute('size', typographyNS.size);
  if (typographyNS.emphasis) el.setAttribute('emphasis', '');
  el.classList.add('nuri-stack');
  el.setAttribute('data-fill', 'grow-shrink');
  el.appendChild(text);
  return el;
}
function wrapProseNodes(value, typographyNS) {
  if (!typographyNS || typographyNS.size === undefined || value == null) return value;
  if (typeof value === 'string') return proseWrapper(document.createTextNode(value), typographyNS);
  if (value.nodeType === 3) return value.textContent.trim() ? proseWrapper(document.createTextNode(value.textContent), typographyNS) : value;
  if (value.nodeType === 11) {
    // Build each wrapper from a FRESH text node, THEN replaceChild — never move
    // the original text node out of the fragment first (that would detach it and
    // replaceChild could no longer find it in its parent).
    for (const child of [...value.childNodes]) {
      if (child.nodeType === 3 && child.textContent.trim()) {
        value.replaceChild(proseWrapper(document.createTextNode(child.textContent), typographyNS), child);
      }
    }
  }
  return value;
}

// ── THE GROUPING WALKER · mirrored across engines — edit in LOCKSTEP with
// packages/rn/runtime/renderer.tsx renderHostBody#appendCompositionEntries (full
// dedup is a named follow-up). The shared contract is pinned per-cell by the
// composition-envelope suites (packages/prototype/factory/composition-envelope
// .test.js · packages/rn/__tests__/composition-envelope.test.tsx).
// Entry classification against THIS host:
//   · own    — entry.part === this host: bare content of a region scope,
//     rendered in place (bare children inside a region stay that region's own
//     content · the mixed-content contract);
//   · direct — a direct child part: ONE rendered instance per entry, in
//     authored order (repeated entries = a SEQUENCE of instances);
//   · group  — a part nested deeper: routed through its ancestor container
//     ONCE, the entries re-scoped to that ancestor via ctx.composition (the
//     ancestor's own walker re-classifies them one level down).
// Repetition policy: a part may be targeted more than once only where a
// declared slot marks it `multiple: true`; a singular part targeted twice
// (including a region marker mixed with loose slots for the same region) fails
// named — never silent concatenation, never last-wins.
function appendComposition(host, node, ctx) {
  const entries = ctx.composition && ctx.composition[node.name];
  if (!entries) return false;
  // The host's authored text style (undefined for a host with no typography) —
  // gates the prose-children wrap of this host's bare string content.
  const hostTypography = mergedNSForPart(ctx.descriptor, ctx.selection, node.name).typography;
  const grouped = new Map();
  const targets = new Map();
  const ordered = [];
  for (const [index, entry] of entries.entries()) {
    if (entry.part === node.name) {
      ordered.push({ kind: 'own', entry, index });
      continue;
    }
    const path = findChildPath(node, entry.part);
    if (!path) throw new Error(`[nuri-factory] composition entry targets '${entry.part}', which is not under '${node.name}'`);
    const childNode = path[0];
    if (path.length > 1 && HOST_ELS.includes(childNode.el)) {
      let group = grouped.get(childNode.name);
      if (!group) {
        group = { child: childNode, entries: [] };
        grouped.set(childNode.name, group);
        ordered.push({ kind: 'group', part: childNode.name });
        targets.set(childNode.name, (targets.get(childNode.name) ?? 0) + 1);
      }
      group.entries.push(entry);
      continue;
    }
    ordered.push({ kind: 'direct', child: childNode, entry, index });
    targets.set(entry.part, (targets.get(entry.part) ?? 0) + 1);
  }
  for (const [part, count] of targets) {
    if (count > 1 && !isMultiPart(ctx.descriptor, part)) {
      throw new Error(`[nuri-factory] slot targeting part '${part}' is singular — it appears ${count} times under '${node.name}'`);
    }
  }
  for (const item of ordered) {
    if (item.kind === 'own') {
      const value = wrapProseNodes(cloneEntryContent(item.entry.content), hostTypography);
      if (value != null) appendValue(host, value);
      continue;
    }
    const group = item.kind === 'group' ? grouped.get(item.part) : null;
    const childEl = item.kind === 'group' && group
      ? renderPart(group.child, { ...ctx, composition: { ...ctx.composition, [item.part]: group.entries } })
      : item.kind === 'direct'
        ? renderPart(item.child, { ...ctx, content: { ...ctx.content, [item.entry.part]: cloneEntryContent(item.entry.content) } })
        : null;
    if (childEl) host.appendChild(childEl);
  }
  return true;
}

// el:'pressable' → <nuri-pressable> + the merged inner <button>.
function renderInteractiveView(node, ns, ctx) {
  const host = document.createElement('nuri-pressable');

  // interactive opt-in → the pressable's gate attrs (decision 65.4 · N+26): for each
  // GATED opt that is on, set the host attr derived from the opt key (= opts[key].gate ·
  // single-sourced via INTERACTIVE_GATES + the guard · no hardcoded attr string here).
  // disabledOpacity is automatic (interactive.css dims a disabled host).
  // The merged map is SELECTION-DEPENDENT (a descriptor may declare `interactive`
  // only under some variant values — coherence direction 4 requires base OR a
  // variant); the HOST is not — el:'pressable' reaches here regardless, so a
  // selection that merges no interactive map renders gate-attr-free, not a crash.
  for (const key of INTERACTIVE_GATES) {
    if (ns.interactive?.[key]) host.setAttribute(camelToKebab(key), '');
  }

  // instance / base props (the createNuriComponent NuriBaseProps mirror).
  if (ctx.base.disabled) host.setAttribute('disabled', '');
  if (ctx.base.accent) host.setAttribute('accent', ctx.base.accent); // Tier-2 self-scope
  if (ctx.base.accessibilityLabel) host.setAttribute('accessibility-label', ctx.base.accessibilityLabel);

  // children parts + this part's own routed content (appended to the host; the
  // pressable moves them INTO the inner <button> on connect).
  const own = ctx.content[node.name];
  if (!appendComposition(host, node, ctx)) {
    if (own != null) appendValue(host, wrapProseNodes(own, ns.typography));
    // A leaf child may render NOTHING (an absent optional flank · renderPart → null).
    for (const child of node.children) {
      const childEl = renderPart(child, ctx);
      if (childEl) host.appendChild(childEl);
    }
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
  if (!appendComposition(host, node, ctx)) {
    if (own != null) appendValue(host, wrapProseNodes(own, ns.typography));
    // A leaf child may render NOTHING (an absent optional flank · renderPart → null).
    for (const child of node.children) {
      const childEl = renderPart(child, ctx);
      if (childEl) host.appendChild(childEl);
    }
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
  if (ns.palette?.muted) el.setAttribute('muted', '');
  // A text part may ALSO carry box/stack/palette (e.g. an icon-button flank's edge
  // padding · box{paddingStart}) — merge them as classes + data-* (the same
  // merged-node treatment renderIcon uses · the RN text node gets these via
  // flat.style). typography stays its own attrs above.
  const { classes, data } = mergeAttrs(ns);
  if (classes.length) el.classList.add(...classes);
  for (const [k, v] of Object.entries(data)) el.setAttribute(k, v);
  appendValue(el, own); // the string label
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
  // THE `selected` BOOLEAN BRIDGE (the tab-item · the RN createNuriComponent mirror):
  // a clean consumer boolean drives the 2-value `state` appearance axis (so the API
  // is `selected`, not a stringly axis attr). No-op without a `state` axis.
  if (typeof props.selected === 'boolean' && descriptor.variants && descriptor.variants.state) {
    sel.state = props.selected ? 'selected' : 'unselected';
  }

  // `children` → the declared default slot (Button's label), unless `content`
  // already set it (the generated RN adapter routing). An `icon` primary part
  // (IconAvatar / IconButton) is addressed by its declared scalar prop instead.
  const primary = anatomy.children.length === 1 ? anatomy.children[0] : undefined;
  const defaultSlotSpec = Object.values(descriptor.api?.slots || {}).find((slot) => slot.default === true);
  const content = { ...props.content };
  if (defaultSlotSpec && props.children !== undefined && content[defaultSlotSpec.part] === undefined) {
    content[defaultSlotSpec.part] = props.children;
  }
  // OPEN-POSITIONAL-CHILDREN (the TabBar · §7 · the RN createNuriComponent mirror):
  // an `open` root with no lone primary renders its POSITIONAL children directly —
  // route them to the root's own content (renderStaticView appends content.root as
  // the host's own children, before the [none] child parts). Descriptor-driven.
  else if (anatomy.open && props.children !== undefined && content.root === undefined) {
    content.root = props.children;
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

  return renderPart(anatomy, { descriptor, selection: sel, content, composition: props.composition || {}, base: props });
}

// ── THE DETERMINISTIC NAMING RULE (deterministic-naming · the web MIRROR) ──
// ONE public name (kebab-case) per component → web `nuri-{kebab}` · RN `Pascal({kebab})`.
// The recipes DERIVE their tag from the public name via `nuriNames(...).web` instead
// of hand-authoring a `nuri-*` string — so the web↔RN pair is always a pure
// kebab↔Pascal conversion. The RN factory carries the SAME rule (createNuriComponent
// nuriNames). The factory's slot tags already derive (`${tagName}-${part}`).
const pascalCase = (kebab) => kebab.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join('');
export const nuriNames = (kebab) => ({ web: `nuri-${kebab}`, rn: pascalCase(kebab) });

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
  const apiSlots = descriptor.api?.slots || {};
  const defaultSlotSpec = Object.values(apiSlots).find((spec) => spec.default === true);
  // The lone non-root part receives the routed content (createNuriComponent's
  // primaryPart): a `text` el captures the label (children/textContent) · an `icon`
  // el is addressed by its part name (the `icon` attribute · the per-part path below).
  const primary = anatomy.children.length === 1 ? anatomy.children[0] : undefined;
  const textPrimary = defaultSlotSpec?.kind === 'text';
  // Slot ROUTING is api-driven: region slots and component slots both come from
  // api.slots (their tags derive via camelToKebab(slot), matching the RN marker
  // names) — never from root-element or anatomy special cases, so a deep
  // descriptor is a data-only add whatever its root host element.
  const regionSlotEntries = Object.entries(apiSlots).filter(([, spec]) => spec.kind === 'region');
  const regionSlotTagToPart = {};
  for (const [slot, spec] of regionSlotEntries) regionSlotTagToPart[`${tagName}-${camelToKebab(slot)}`] = spec.part;
  const componentSlotEntries = Object.entries(apiSlots).filter(([, spec]) => spec.component === true);
  const componentSlotTagToSpec = {};
  for (const [slot, spec] of componentSlotEntries) componentSlotTagToSpec[`${tagName}-${camelToKebab(slot)}`] = spec;
  const hasComponentSlots = componentSlotEntries.length > 0;
  // COMPOUND capability (the topbar-slots slice): region slots WITHOUT component
  // slots — the container IS the root painting node (apply-NS-to-host) and each
  // region fills from a wholesale per-region harvest; bare children default to
  // the region declared `default: true` (Topbar → trailing · "just actions"). A
  // descriptor that ALSO declares component slots routes through the composition
  // harvest instead (its regions become validated sub-scopes).
  const isCompound = regionSlotEntries.length > 0 && !hasComponentSlots;
  const defaultRegionEntry = regionSlotEntries.find(([, spec]) => spec.default === true);
  const defaultSlot = defaultRegionEntry ? defaultRegionEntry[1].part : undefined;
  // OPEN-POSITIONAL HOST (the TabBar · §7 · descriptor-driven · the RN createNuriComponent
  // mirror): an `open` root with NO named regions and no lone primary renders its
  // authored POSITIONAL children directly inside the built root. Distinct from
  // COMPOUND (named slots): the children move in wholesale, no per-region harvest.
  const isOpenHost = !!anatomy.open && !isCompound && !primary;
  // MOUNT-A-TREE host (button / icon-button / tab-bar-item · the default #render
  // path · `replaceChildren(buildComponent(...))`): the host wraps a FRESH nuri-*
  // tree whose inner merged node carries the geometry/flex. The wrapper must be
  // layout-INVISIBLE (display:contents) so that merged node becomes the parent's
  // DIRECT flex child — else a `fill:even` item (tab-bar-item) sits a level too
  // deep and the columns bunch instead of spreading. This is GENERIC plumbing
  // for every mount-a-tree host (the data-host-tree marker + ONE reset.css rule),
  // NOT a per-component selector. The apply-NS-to-host paths (compound topbar /
  // open tab-bar) are EXCLUDED — they ARE the painting node, so they stay visible.
  const mountsTree = !isCompound && !isOpenHost;

  // ERGONOMIC per-part STRING attributes — a non-root, non-view LEAF addressed by its
  // OWN part name (prefix/suffix text flanks · and the `icon` glyph part, whether or
  // not it is the lone primary: a component with an `icon` PART takes the `icon`
  // attribute, matching the RN same-name prop — only the primitive <nuri-icon> leaf
  // uses `name`). A lone `text` primary is addressed by children/textContent instead,
  // so it is excluded. View REGIONS are slot-filled by sub-elements (not attrs). For a
  // text-primary component (Button) this set is empty.
  const perPartAttrs = Object.entries(apiSlots)
    .filter(([, spec]) => spec.kind !== 'region' && spec.default !== true && spec.component !== true)
    .map(([slot, spec]) => spec.prop || slot);
  // Interactive iff the root opts in (the `disabled` reflection is generic to any
  // interactive component · button has it, icon-avatar does not).
  const interactive = !!(descriptor.structure.base && descriptor.structure.base.root && descriptor.structure.base.root.interactive);

  const observed = [...axisNames, 'accent'];
  if (interactive) observed.push('disabled');
  observed.push(...perPartAttrs);
  // `selected` boolean ATTR → the `state` appearance axis (the tab-item · the
  // createNuriComponent boolean bridge). Observed so a live toggle re-renders.
  const hasStateAxis = !!(descriptor.variants && descriptor.variants.state);
  if (hasStateAxis) observed.push('selected');
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
    #slots = null;
    #composition = null;
    #openKids = null;
    #built = false;

    connectedCallback() {
      if (this.#built) return;
      // MOUNT-A-TREE host → layout-invisible (display:contents via the data-host-tree
      // marker + the single generic reset.css rule). The painting-node hosts (compound
      // topbar / open tab-bar) are excluded — they ARE the surface, so they stay visible.
      if (mountsTree) this.setAttribute('data-host-tree', '');
      // Decorative · the whole element is hidden from AT (decision 50) — from DATA.
      if (descriptor.decorative) this.setAttribute('aria-hidden', 'true');
      // Capture ordered composition before the factory tree replaces the
      // children. With no slot marker, keep the legacy bare text-primary route.
      if (hasComponentSlots) {
        this.#composition = harvestComposition(this, componentSlotTagToSpec, defaultSlotSpec?.part, regionSlotTagToPart, tagName);
        // A composition-only host (no default sink, no legacy label route) with
        // meaningful bare children and no marker at all cannot route them —
        // fail named rather than render an empty skeleton (the honest-children
        // contract; the RN adapter harvest throws the same error).
        if (!this.#composition && !defaultSlotSpec) {
          for (const child of this.childNodes) {
            if (child.nodeType === 3 && !child.textContent.trim()) continue;
            if (child.nodeType === 8) continue;
            throw new Error(`[nuri-factory] '${tagName}' has no default content slot — bare children must use its typed slot markers`);
          }
        }
      }
      // Capture the authored label BEFORE the factory tree replaces the children
      // (buildComponent routes `children` to the lone non-root text part).
      if (textPrimary && !this.#composition) this.#label = this.textContent.trim();
      // COMPOUND: harvest the region sub-elements + bare children BEFORE the render
      // replaces them (cloned per render · the topbar-slots slice).
      if (isCompound) this.#slots = harvestSlots(this, regionSlotTagToPart, defaultSlot);
      // OPEN HOST: capture ALL authored positional children (the Tab items) into a
      // detached <template> BEFORE the render replaces them — #render clones from it,
      // so a re-render (an accent change) still has the content (the harvestSlots
      // pattern, single bucket · no per-region split).
      if (isOpenHost) {
        const tpl = document.createElement('template');
        for (const child of [...this.childNodes]) {
          if (child.nodeType === 3 && !child.textContent.trim()) continue; // drop whitespace
          tpl.content.append(child);
        }
        this.#openKids = tpl;
      }
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
      // The harvested per-scope entry map ({ root: […], [region]: […] }) —
      // each host's walker consumes its own scope (region entries validate
      // against the region's anatomy, not the root's).
      if (this.#composition) props.composition = this.#composition;
      if (interactive) props.disabled = this.hasAttribute('disabled');
      // `selected` boolean attr → props.selected (buildComponent bridges it to the
      // `state` axis · present = selected · absent = unselected).
      if (hasStateAxis) props.selected = this.hasAttribute('selected');
      const accent = this.getAttribute('accent');
      if (accent) props.accent = accent; // Tier-2 self-scope (threaded to the merged node)
      // Ergonomic per-part attributes (prefix/suffix text · the `icon` glyph part) →
      // props BY PART NAME; buildComponent routes them into the content map (a STRING
      // flank / glyph name). An absent attr leaves the part out → its leaf renders nothing.
      for (const p of perPartAttrs) {
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

      // COMPOUND (the topbar-slots slice): the HOST is the root painting node (the
      // chrome row · apply-NS-to-host, full-width via the .nuri-stack block-flex);
      // its children are the typed REGION views (leading/center/trailing · in
      // anatomy order), each filled by its harvested slot content (cloned). This is
      // the factory's compound generation — descriptor-driven, not topbar-specific.
      if (isCompound) {
        applyHostNS(this, mergedNSForPart(descriptor, selection, 'root'), props.accent);
        const content = {};
        for (const [part, tpl] of Object.entries(this.#slots || {})) {
          content[part] = tpl.content.cloneNode(true); // a fresh fragment of clones
        }
        const ctx = { descriptor, selection, content, base: props };
        const regions = anatomy.children.map((child) => renderPart(child, ctx)).filter(Boolean);
        this.replaceChildren(...regions);
        return;
      }

      // OPEN HOST (the TabBar · §7): the HOST is the root painting node — apply the
      // root NS to it directly (the same apply-NS-to-host as compound · full-width
      // via the .nuri-stack block-flex) and place the authored POSITIONAL children
      // (the Tab items · cloned) inside it. The RN analogue is the root View
      // rendering its `content.root` children; here the host IS that View (no inner
      // <nuri-view> wrapper, so the bar row + the items' `fill:even` flex line up).
      if (isOpenHost) {
        applyHostNS(this, mergedNSForPart(descriptor, selection, 'root'), props.accent);
        const kids = this.#openKids ? this.#openKids.content.cloneNode(true) : document.createDocumentFragment();
        this.replaceChildren(kids);
        return;
      }

      this.replaceChildren(buildComponent(descriptor, selection, props));
    }
  }

  customElements.define(tagName, NuriElement);
  // Register an INERT marker element per declared region/component slot
  // (<nuri-topbar-leading> · <nuri-button-text> …). The container harvests
  // their children; they never render themselves. Guarded so a recipe
  // re-import (idempotent define) does not throw. Every marker tag is also
  // recorded in the global registry so ANOTHER component's harvest can fail
  // named on a foreign marker.
  for (const slotTag of [...Object.keys(regionSlotTagToPart), ...Object.keys(componentSlotTagToSpec)]) {
    NURI_SLOT_TAGS.add(slotTag);
    if (!customElements.get(slotTag)) customElements.define(slotTag, class extends HTMLElement {});
  }
  return NuriElement;
}
