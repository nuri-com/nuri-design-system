/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · SWITCH · CUSTOM ELEMENT
 * <nuri-switch> is a binary on/off toggle — a standalone parametric
 * pill, NOT a Box composition (decision 44 · N+6.5). It owns
 * component-tokens (switch.css) rather than dispatching on semantic
 * vocabulary, because its track/knob palette is a small fixed set.
 *
 * The wrapper exists for API mapping in docs HTML — it does NOT port
 * to RN. The RN consumer is generated separately (same prop names,
 * different mechanism · RISKS R1).
 *
 * Markup
 *   <nuri-switch></nuri-switch>                          · off
 *   <nuri-switch checked></nuri-switch>                  · on
 *   <nuri-switch checked accent="lilac"></nuri-switch>   · self-scope accent
 *   <nuri-switch disabled></nuri-switch>
 *
 * Defaults
 *   checked  → false (off)
 *   accent   → inherited from CSS cascade
 *
 * A11y (F-CHECKED-STATE-1)
 *   The inner control is a native <button role="switch"> whose
 *   aria-checked mirrors the `checked` attribute. AT announces
 *   "switch, on/off". Toggling is reflected back to the host
 *   `checked` attribute so the DOM stays the source of truth.
 *
 * Accent override · Tier 2 self-scope
 *   When `accent` is set, it is mirrored as data-accent on the inner
 *   <button> so accent tokens resolve for that switch only.
 * ────────────────────────────────────────────────────────────── */

(() => {
  const ATTRS = ['checked', 'disabled', 'accent'];

  class NuriSwitch extends HTMLElement {
    static get observedAttributes() {
      return ATTRS;
    }

    #btn = null;
    #knob = null;

    connectedCallback() {
      if (this.#btn) return;

      // First-time mount: build the native switch button + its knob.
      // Listeners stay alive across attribute changes (#sync never
      // tears the subtree down).
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('role', 'switch');
      const knob = document.createElement('span');
      knob.className = 'nuri-switch__knob';
      btn.appendChild(knob);
      this.appendChild(btn);
      this.#btn = btn;
      this.#knob = knob;

      // Click toggles the HOST `checked` attribute; attributeChangedCallback
      // re-syncs aria-checked. The DOM attribute is the source of truth.
      btn.addEventListener('click', () => {
        if (this.hasAttribute('disabled')) return;
        this.toggleAttribute('checked');
      });

      this.#sync();
    }

    attributeChangedCallback() {
      if (this.#btn) this.#sync();
    }

    #sync() {
      const isChecked = this.hasAttribute('checked');
      const isDisabled = this.hasAttribute('disabled');
      const accent = this.getAttribute('accent');

      this.#btn.className = 'nuri-switch';
      this.#btn.setAttribute('aria-checked', isChecked ? 'true' : 'false');

      // Tier 2 self-scope: mirror `accent` to data-accent on the inner
      // button so accent tokens resolve with that override.
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

  customElements.define('nuri-switch', NuriSwitch);
})();
