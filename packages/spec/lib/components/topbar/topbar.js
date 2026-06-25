/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · TOPBAR · CUSTOM ELEMENTS (factory-backed · apply-NS-to-host · decision 74)
 *
 * <nuri-topbar> is a LAYOUT SHELL holding POSITIONAL children (leading · the content pivot ·
 * trailing). The factory's open-view model can't place leading/pivot/trailing (it appends own
 * content then child parts — it can't put trailing AFTER the pivot), so topbar takes the
 * APPLY-NS-TO-HOST path (operator-chosen at the L3c checkpoint), NOT buildComponent:
 *   · <nuri-topbar>         — reads the descriptor's base.root namespaces (stack ⊕ box ⊕
 *                             palette · the chrome row) and applies them as the namespace
 *                             classes + data-* TO ITSELF. The authored positional children
 *                             stay exactly where they are (no reparent) and flex as siblings.
 *   · <nuri-topbar-content> — the parent applies base.content (stack{fill:grow-shrink}) +,
 *                             when `center`, the center variant's patch (align/justify center).
 * Both read the FROZEN topbar descriptor (build/descriptors/topbar.js · the authored SoT)
 * via the factory's exported mergedNSForPart + mergeAttrs — the SAME field → class+data-*
 * spelling buildComponent applies to a merged node, so the shell is styled by the generated
 * namespace CSS (lib/components/{box,stack,palette}/*.css) exactly as a factory node would be.
 * The hand recipe (the recipe topbar.css `nuri-topbar`/`nuri-topbar-content` rules + the
 * inset/title-type JS) RETIRED here.
 *
 * KNOWN GAPS (first-bump backlog · NOT in the descriptor · accepted at the L3c checkpoint):
 *   · `inset` / `inset-start` / `inset-end` — the recipe's edge-padding override is NOT a
 *     descriptor axis, so it is dropped (pages using it — components/topbar.html — render with
 *     the descriptor's default padding-start/end:lg · no crash · a doc-page degradation).
 *   · the bare-text title lg-em auto-type — NOT in the descriptor; a bare <nuri-topbar-content>
 *     text title renders at the inherited size. demo.html wraps its title in an explicit
 *     <nuri-typography size=md emphasis>, so the render gate is unaffected.
 *
 * The page links the namespace CSS (box/stack/palette); the positional buttons inside are
 * factory-backed <nuri-button> (which bring pressable.js + reset.css). factory.js + the
 * descriptor twin arrive via this module's imports (this file is type="module").
 * ────────────────────────────────────────────────────────────── */

import { mergedNSForPart, mergeAttrs } from '../../runtime/factory.js';
import { topbarDescriptor } from '../../../build/descriptors/topbar.js';
// Self-import the typography primitive (idempotent) — a topbar's bare/typography title
// is a <nuri-typography>; the positional buttons self-import pressable themselves.
import '../typography/typography.js';

// Apply a merged namespace map (stack ⊕ box ⊕ palette) to an EXISTING element as the
// namespace classes + data-* — the factory's merged-node spelling, but onto a host node
// instead of a freshly-created one (mergeAttrs is the shared inverse-spelling).
function applyNS(el, nsMap) {
  const { classes, data } = mergeAttrs(nsMap);
  if (classes.length) el.classList.add(...classes);
  for (const [k, v] of Object.entries(data)) el.setAttribute(k, v);
}

class NuriTopbar extends HTMLElement {
  // `center` is the only descriptor axis (inset is NOT · a known gap · see the header).
  static get observedAttributes() {
    return ['center'];
  }

  connectedCallback() {
    this.#sync();
  }

  attributeChangedCallback() {
    if (this.isConnected) this.#sync();
  }

  #sync() {
    const selection = { center: this.hasAttribute('center') ? 'true' : 'false' };
    // root NS → the shell (this element IS the chrome row · box ⊕ stack ⊕ palette).
    applyNS(this, mergedNSForPart(topbarDescriptor, selection, 'root'));
    // content NS → the pivot child (stack{fill} + the center variant's align/justify).
    const pivot = this.querySelector('nuri-topbar-content');
    if (pivot) applyNS(pivot, mergedNSForPart(topbarDescriptor, selection, 'content'));
  }
}

// The named content pivot — a marker element the shell styles (no own logic; the bare-text
// lg-em title-type the recipe applied here is a known gap · see the header). Defined so the
// element is a recognized custom element rather than HTMLUnknownElement.
class NuriTopbarContent extends HTMLElement {}

customElements.define('nuri-topbar-content', NuriTopbarContent);
customElements.define('nuri-topbar', NuriTopbar);
