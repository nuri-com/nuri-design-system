/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · TABS · CUSTOM ELEMENTS  (compound · decision 43)
 *
 * Two elements, one shared piece of state, one IIFE:
 *   <nuri-tabs value="…">  controller · owns the selected value, is
 *                          the single source of truth. On mount it
 *                          composes a <nuri-box> (the tablist
 *                          surface · FIRST Box composition consumer)
 *                          and a flex list, then moves its authored
 *                          <nuri-tab> children into that list.
 *   <nuri-tab  value="…">  one option · renders an inner native
 *                          <button role="tab">; reflects the
 *                          controller's selection via an `active`
 *                          attribute the controller sets.
 *
 * State flow (one direction, DOM-attribute-driven):
 *   click a tab → controller sets its own `value` attr
 *               → controller #syncActive() toggles `active` on each
 *                 child tab → each tab mirrors active → aria-selected
 *                 + data-active on its inner button.
 *
 * The wrappers exist for API mapping in docs HTML — they do NOT port
 * to RN. The RN consumer is generated separately (RISKS R1).
 *
 * A11y · the tablist <div role="tablist"> holds <button role="tab">
 *   children with aria-selected reflecting the active state. Roving
 *   arrow-key navigation is deferred (F-KEYBOARD-NAV-1) — tabs are
 *   individually focusable and activate via native button Enter/Space.
 * ────────────────────────────────────────────────────────────── */

(() => {
  /* ── <nuri-tab> · one option ─────────────────────────────────── */
  class NuriTab extends HTMLElement {
    static get observedAttributes() {
      return ['value', 'active', 'disabled'];
    }

    #btn = null;

    connectedCallback() {
      if (this.#btn) return;

      // First-time mount: wrap the authored label text in a native
      // <button role="tab">. The controller may relocate this element
      // into its flex list afterwards; the guard above keeps the
      // button (and its listeners) intact across that move.
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('role', 'tab');
      while (this.firstChild) btn.appendChild(this.firstChild);
      this.appendChild(btn);
      this.#btn = btn;
      this.#sync();
    }

    attributeChangedCallback() {
      if (this.#btn) this.#sync();
    }

    get value() {
      return this.getAttribute('value') || '';
    }

    #sync() {
      const isActive = this.hasAttribute('active');
      const isDisabled = this.hasAttribute('disabled');

      this.#btn.className = 'nuri-tab';
      this.#btn.dataset.active = isActive ? 'true' : 'false';
      this.#btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
      // Roving tabindex baseline: active tab is in the tab order, the
      // rest are reachable only by direct focus. Full arrow-key roving
      // is deferred (F-KEYBOARD-NAV-1).
      this.#btn.tabIndex = isActive ? 0 : -1;

      if (isDisabled) {
        this.#btn.setAttribute('disabled', '');
      } else {
        this.#btn.removeAttribute('disabled');
      }
    }
  }

  /* ── <nuri-tabs> · controller ────────────────────────────────── */
  class NuriTabs extends HTMLElement {
    static get observedAttributes() {
      return ['value'];
    }

    #built = false;

    connectedCallback() {
      if (this.#built) return;
      this.#built = true;

      const tabs = [...this.querySelectorAll('nuri-tab')];

      // Default selection: explicit `value`, else the first tab's value.
      if (!this.hasAttribute('value') && tabs.length) {
        this.setAttribute('value', tabs[0].value);
      }

      // Compose the tablist: a flex list (rhythm owned by tabs.css)
      // inside a Box that supplies the surface (background + radius +
      // inset padding · decision 42 evidence).
      const list = document.createElement('div');
      list.className = 'nuri-tabs__list';
      list.setAttribute('role', 'tablist');
      for (const tab of tabs) list.appendChild(tab);

      const box = document.createElement('nuri-box');
      box.setAttribute('background', 'strong');
      box.setAttribute('radius', 'md');
      box.setAttribute('padding', 'xs');
      box.appendChild(list);
      this.appendChild(box);

      // Selection is a click anywhere on a tab; read the owning
      // <nuri-tab>'s value and make it the controller's value.
      this.addEventListener('click', (e) => {
        const tab = e.target.closest('nuri-tab');
        if (!tab || tab.hasAttribute('disabled') || !this.contains(tab)) return;
        this.setAttribute('value', tab.value);
      });

      this.#syncActive();
    }

    attributeChangedCallback() {
      if (this.#built) this.#syncActive();
    }

    #syncActive() {
      const value = this.getAttribute('value');
      for (const tab of this.querySelectorAll('nuri-tab')) {
        tab.toggleAttribute('active', tab.value === value);
      }
    }
  }

  customElements.define('nuri-tab', NuriTab);
  customElements.define('nuri-tabs', NuriTabs);
})();
