/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · ICON-AVATAR · CUSTOM ELEMENT (factory-backed · decision 74 · the L3c flip)
 *
 * <nuri-icon-avatar> is now a THIN registration over the web factory (decision 67/74):
 * connectedCallback reads its attributes, calls buildComponent with the FROZEN icon-avatar
 * descriptor (build/descriptors/icon-avatar.js · the authored SoT · decision 69), and mounts
 * the de-collapsed tree inside itself — <nuri-view> (the static circle · box ⊕ stack ⊕ palette
 * styled by the generated namespace CSS) wrapping a <nuri-icon> glyph. The hand recipe (the
 * inner <span class="nuri-icon-avatar--<variant>"> + the recipe icon-avatar.css) RETIRED here.
 *
 * The page MUST also load the primitive element scripts the factory tree upgrades into —
 * view.js (the static <nuri-view> host · IIFE · defer) + icon.js (the glyph · module) — and
 * link the namespace CSS (box/stack/palette). factory.js + the descriptor twin arrive via this
 * module's imports (this file is type="module").
 *
 * DECORATIVE (decision 50): the host is aria-hidden, not focusable, carries no role. Public
 * API: <nuri-icon-avatar name variant accent></nuri-icon-avatar> — variant solid (default per
 * the recipe) | soft | ghost | subtle; size LOCKED (lg circle / md glyph). accent → Tier-2
 * self-scope (threaded as a prop).
 *
 * KNOWN GAP (the post-A3 icon arc · NOT fixed here · brief anti-goal): the recipe's `fill`
 * attribute (the filled glyph weight) is NOT threaded — the factory's renderIcon emits only
 * the routed glyph NAME (size/weight are the deferred icon arc's). No active page (demo.html)
 * uses `fill`; it is a first-bump-backlog fidelity gap alongside topbar inset/title-type.
 * ────────────────────────────────────────────────────────────── */

import { buildComponent } from '../../runtime/factory.js';
import { iconAvatarDescriptor } from '../../../build/descriptors/icon-avatar.js';
// Self-import the primitive element defs the factory tree upgrades into (idempotent).
import '../view/view.js';
import '../icon/icon.js';

const ATTRS = ['name', 'variant', 'accent'];

class NuriIconAvatar extends HTMLElement {
  static get observedAttributes() {
    return ATTRS;
  }

  #built = false;

  connectedCallback() {
    if (this.#built) return;
    // Decorative · the whole element is hidden from AT (decision 50).
    this.setAttribute('aria-hidden', 'true');
    this.#render();
    this.#built = true;
  }

  attributeChangedCallback() {
    if (this.#built) this.#render();
  }

  #render() {
    // Recipe default (variant=soft) passed EXPLICITLY — buildComponent otherwise falls
    // back to the descriptor's FIRST value (variant→solid · R1.5).
    const selection = { variant: this.getAttribute('variant') || 'soft' };
    const props = { name: this.getAttribute('name') || '' };
    const accent = this.getAttribute('accent');
    if (accent) props.accent = accent; // Tier-2 self-scope (data-accent on the merged node)

    this.replaceChildren(buildComponent(iconAvatarDescriptor, selection, props));
  }
}

customElements.define('nuri-icon-avatar', NuriIconAvatar);
