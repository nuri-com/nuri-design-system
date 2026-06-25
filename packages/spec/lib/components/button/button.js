/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · BUTTON · CUSTOM ELEMENT (factory-backed · decision 74 · the L3c flip)
 *
 * <nuri-button> is now a THIN registration over the web factory (the L3c flip · N+38 ·
 * decision 67/74): connectedCallback reads its attributes, calls buildComponent with the
 * FROZEN composition-button descriptor (build/descriptors/composition-button.js · the
 * authored SoT · decision 69), and mounts the de-collapsed `nuri-*` tree inside itself —
 * <nuri-pressable> → the inner native <button> styled ENTIRELY by the generated namespace
 * CSS (box ⊕ stack ⊕ palette ⊕ interactive · lib/components/{box,stack,palette,interactive}
 * /*.css) + the label <nuri-typography>. The hand recipe rendering (the inner <button> +
 * .nuri-button--<variant>/<size> classes + the recipe button.css) RETIRED here. The factory
 * is the sole web renderer for the three frozen descriptors; decision 2 is reversed for the
 * namespace layer.
 *
 * The page MUST also load the primitive element scripts the factory tree upgrades into
 * (pressable.js + typography.js · IIFE · defer) and link lib/runtime/reset.css (the native-
 * <button> UA normalization · the §9 plumbing seed). factory.js + the descriptor twin arrive
 * via this module's imports (no separate <script> · this file is type="module").
 *
 * Public API UNCHANGED — <nuri-button variant size accent disabled>Label</nuri-button>:
 *   variant → "soft" (default) | "solid" | "ghost"     · size → "md" (default) | "sm" | "lg"
 *   accent  → inherited from the cascade unless set (Tier-2 self-scope · threaded as a prop)
 *   disabled → reflected to the factory's interactive host (interactive.css dims + de-presses)
 *
 * Defaults note (R1.5): the recipe defaults (variant=soft · size=md) are passed to
 * buildComponent EXPLICITLY — an unset axis otherwise falls back to the descriptor's FIRST
 * value (variant→solid · the createNuriComponent defaultByAxis mirror), which would change
 * the public default. The descriptor-default gap stays a known finding (NOT fixed here).
 * ────────────────────────────────────────────────────────────── */

import { buildComponent } from '../../runtime/factory.js';
import { compositionButtonDescriptor } from '../../../build/descriptors/composition-button.js';
// Self-import the primitive element defs the factory tree upgrades into (idempotent ·
// each primitive guards its own define · a page's classic <script> tag coexists). So a
// page only needs to load THIS module + link the namespace CSS — no separate primitive
// <script> tags.
import '../pressable/pressable.js';
import '../typography/typography.js';

const ATTRS = ['variant', 'size', 'accent', 'disabled'];

class NuriButton extends HTMLElement {
  static get observedAttributes() {
    return ATTRS;
  }

  #label = null;
  #built = false;

  connectedCallback() {
    if (this.#built) return;
    // Capture the authored text label BEFORE the factory tree replaces the children
    // (buildComponent routes `children` to the lone non-root part — the label).
    this.#label = this.textContent.trim();
    this.#render();
    this.#built = true;
  }

  attributeChangedCallback() {
    // Re-render on a live attribute change (variant/size/accent/disabled). The factory
    // tree is rebuilt from the captured label — the prototype mirror does not preserve
    // the inner button across changes (that is the RN factory's production concern).
    if (this.#built) this.#render();
  }

  #render() {
    // Recipe defaults (variant=soft · size=md) passed EXPLICITLY — see the header note.
    const selection = {
      variant: this.getAttribute('variant') || 'soft',
      size: this.getAttribute('size') || 'md',
    };
    const props = { children: this.#label, disabled: this.hasAttribute('disabled') };
    const accent = this.getAttribute('accent');
    if (accent) props.accent = accent; // Tier-2 self-scope (threaded to the merged node)

    this.replaceChildren(buildComponent(compositionButtonDescriptor, selection, props));
  }
}

customElements.define('nuri-button', NuriButton);
