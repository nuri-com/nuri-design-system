/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · TAB-BAR · CUSTOM ELEMENTS  (compound · decision 56)
 *
 * Two elements, one shared piece of state, one IIFE — the icon-only
 * BOTTOM navigation bar (the app-level destination switcher):
 *   <nuri-tab-bar value="…">      controller · owns the selected value,
 *                                 the single source of truth. On mount
 *                                 it builds a <nav class="nuri-tab-bar">
 *                                 row and moves its authored
 *                                 <nuri-tab-bar-item> children into it.
 *   <nuri-tab-bar-item value=…>   one destination · renders an inner
 *                                 native <button> wrapping a single
 *                                 <nuri-icon>; reflects the controller's
 *                                 selection via an `active` attribute the
 *                                 controller sets.
 *
 * State flow (one direction, DOM-attribute-driven · mirrors Tabs
 * decision 43):
 *   tap an item → controller sets its own `value` attr
 *               → controller #syncActive() toggles `active` on each
 *                 child item → each item mirrors active → data-active +
 *                 aria-current + icon `fill` weight on its inner button.
 *
 * A11y · DESTINATION SWITCHER, not in-page tabs (F-TABBAR-ROLE-1).
 *   The bar is a <nav aria-label> of native <button> destinations; the
 *   selected button carries aria-current="page". This is the model that
 *   is correct for a mobile destination switcher WITHOUT presupposing a
 *   router — it does not claim tablist/tab semantics (those describe an
 *   in-page panel switcher, which Tabs already covers), and it does not
 *   assume the destinations are routes. The RN side has no
 *   accessibilityRole that maps 1:1 to web's <nav>/aria-current pairing
 *   for a destination bar — it approximates with accessibilityRole=
 *   "tab"/selected. Tracked as F-TABBAR-ROLE-1 (RISKS R1).
 *
 *   Each item is icon-only, so it needs an accessible name (F-ARIA-
 *   LABEL-1, the IconButton precedent · decision 38): explicit `label`
 *   wins, else it is derived from the kebab `name`. The inner
 *   <nuri-icon> is decorative (aria-hidden via Icon itself).
 *
 * The wrappers exist for API mapping in docs HTML — they do NOT port to
 * RN. The RN consumer is generated separately (RISKS R1).
 * ────────────────────────────────────────────────────────────── */

(() => {
  /* ── <nuri-tab-bar-item> · one destination ───────────────────── */
  class NuriTabBarItem extends HTMLElement {
    static get observedAttributes() {
      return ['name', 'label', 'value', 'active'];
    }

    #btn = null;
    #icon = null;

    connectedCallback() {
      if (this.#btn) return;

      // First-time mount: wrap a single <nuri-icon> in a native button.
      // The controller may relocate this element into its <nav> row
      // afterwards; the guard above keeps the button (and its glyph)
      // intact across that move.
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'nuri-tab-bar__item';

      const icon = document.createElement('nuri-icon');
      icon.setAttribute('size', 'md');
      // Seed the glyph name BEFORE the subtree enters the document so
      // <nuri-icon>'s connectedCallback resolves a real registry key on
      // first render instead of warning `unknown name "null"`. #sync
      // re-asserts it below.
      icon.setAttribute('name', this.getAttribute('name') || '');
      btn.appendChild(icon);
      this.appendChild(btn);

      this.#btn = btn;
      this.#icon = icon;
      this.#sync();
    }

    attributeChangedCallback() {
      if (this.#btn) this.#sync();
    }

    get value() {
      return this.getAttribute('value') || '';
    }

    #sync() {
      const name = this.getAttribute('name') || '';
      const label = this.getAttribute('label');
      const isActive = this.hasAttribute('active');

      this.#icon.setAttribute('name', name);

      // Selected → filled glyph weight; at rest → regular (Icon weight
      // coupling · decision 38). Pressed does NOT touch this (CSS only
      // shifts colour + scale), so the weight tracks selection alone.
      if (isActive) {
        this.#icon.setAttribute('fill', '');
      } else {
        this.#icon.removeAttribute('fill');
      }

      this.#btn.dataset.active = isActive ? 'true' : 'false';

      // Destination switcher a11y (F-TABBAR-ROLE-1): the current
      // destination is marked with aria-current="page"; others clear it.
      if (isActive) {
        this.#btn.setAttribute('aria-current', 'page');
      } else {
        this.#btn.removeAttribute('aria-current');
      }

      // F-ARIA-LABEL-1: an icon-only control needs an accessible name.
      // Explicit `label` wins; otherwise derive from the kebab `name`.
      this.#btn.setAttribute('aria-label', label || name.replace(/-/g, ' '));
    }
  }

  /* ── <nuri-tab-bar> · controller ─────────────────────────────── */
  class NuriTabBar extends HTMLElement {
    static get observedAttributes() {
      return ['value'];
    }

    #built = false;

    connectedCallback() {
      if (this.#built) return;
      this.#built = true;

      const items = [...this.querySelectorAll('nuri-tab-bar-item')];

      // Default selection: explicit `value`, else the first item's value.
      if (!this.hasAttribute('value') && items.length) {
        this.setAttribute('value', items[0].value);
      }

      // Build the navigation row and move the authored items into it.
      const nav = document.createElement('nav');
      nav.className = 'nuri-tab-bar';
      if (this.hasAttribute('label')) {
        nav.setAttribute('aria-label', this.getAttribute('label'));
      }
      for (const item of items) nav.appendChild(item);
      this.appendChild(nav);

      // Selection is a tap anywhere on an item; read the owning
      // <nuri-tab-bar-item>'s value and make it the controller's value.
      this.addEventListener('click', (e) => {
        const item = e.target.closest('nuri-tab-bar-item');
        if (!item || !this.contains(item)) return;
        this.setAttribute('value', item.value);
      });

      this.#syncActive();
    }

    attributeChangedCallback() {
      if (this.#built) this.#syncActive();
    }

    #syncActive() {
      const value = this.getAttribute('value');
      for (const item of this.querySelectorAll('nuri-tab-bar-item')) {
        item.toggleAttribute('active', item.value === value);
      }
    }
  }

  customElements.define('nuri-tab-bar-item', NuriTabBarItem);
  customElements.define('nuri-tab-bar', NuriTabBar);
})();
