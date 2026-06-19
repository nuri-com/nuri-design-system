/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · BUTTON · CUSTOM ELEMENT
 * <nuri-button> mirrors the RN-side API shape (variant/size/accent
 * /disabled props) while delegating to a native <button> for
 * accessibility, focus, and event handling.
 *
 * The wrapper exists for API mapping in docs HTML — it does NOT
 * port to RN (different runtime). The RN consumer code is generated
 * separately with the same prop names but a different mechanism.
 *
 * Markup
 *   <nuri-button>Pay</nuri-button>                              · default: variant=soft, size=md
 *   <nuri-button variant="solid">Pay</nuri-button>              · CTA, filled with active accent
 *   <nuri-button variant="ghost">Skip</nuri-button>             · tertiary, transparent at rest (decision 39)
 *   <nuri-button size="lg" variant="solid">Pay</nuri-button>    · primary mobile CTA (60px)
 *   <nuri-button variant="soft" accent="neutral">Cancel</nuri-button>  · cream button (Tier 2 self-scope)
 *   <nuri-button variant="solid" accent="orange">Buy Bitcoin</nuri-button>
 *   <nuri-button disabled>Pay</nuri-button>
 *
 * Defaults
 *   variant  → "soft"    quieter alternative; "solid" for CTAs, "ghost" for tertiary
 *   size     → "md"      48px inline action (decision 41); "lg" (60px) / "sm" (36px) opt-in
 *   accent   → inherited from CSS cascade (no attribute set)
 *
 * Accent override · Tier 2 self-scope
 *   When `accent` is set on <nuri-button>, the value is mirrored as
 *   data-accent on the inner <button>. Token cascade resolves accent
 *   tokens for that button only; the wrapper does NOT scope its
 *   children (Button doesn't typically have meaningful children).
 *   For subtree-wide override use <nuri-scope> (Tier 3 primitive).
 * ────────────────────────────────────────────────────────────── */

(() => {
  const ATTRS = ['variant', 'size', 'accent', 'disabled'];

  class NuriButton extends HTMLElement {
    static get observedAttributes() {
      return ATTRS;
    }

    #btn = null;

    connectedCallback() {
      if (this.#btn) return;

      // First-time mount: create inner native button, move authored
      // children inside it, then sync attributes. Subsequent attribute
      // changes only re-sync — we never tear down the inner button, so
      // any listeners the consumer attached stay alive.
      const btn = document.createElement('button');
      btn.type = 'button';
      while (this.firstChild) btn.appendChild(this.firstChild);
      this.appendChild(btn);
      this.#btn = btn;
      this.#sync();
    }

    attributeChangedCallback() {
      if (this.#btn) this.#sync();
    }

    #sync() {
      const variant = this.getAttribute('variant') || 'soft';
      const size = this.getAttribute('size') || 'md';
      const accent = this.getAttribute('accent');
      const isDisabled = this.hasAttribute('disabled');

      this.#btn.className =
        `nuri-button nuri-button--${variant} nuri-button--${size}`;

      // Tier 2 self-scope: when `accent` is explicit, mirror it to
      // data-accent on the inner button so the CSS cascade resolves
      // accent tokens with that override. When omitted, the button
      // inherits from its ancestor's data-accent (page, scope wrapper).
      if (accent) {
        this.#btn.dataset.accent = accent;
      } else {
        delete this.#btn.dataset.accent;
      }

      if (isDisabled) {
        this.#btn.setAttribute('disabled', '');
      } else {
        this.#btn.removeAttribute('disabled');
      }
    }
  }

  customElements.define('nuri-button', NuriButton);
})();
