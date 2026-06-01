/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · LIST-INTERACTIVE-ITEM · CUSTOM ELEMENT  (decision 52 · N+8)
 *
 * The declarative pressable WRAPPER around a presentational
 * <nuri-list-item>. It does the ONE structural thing that fixes the
 * N+7 screen-reader double-read: it wraps the authored content in an
 * inner role="button" element so the content IS the accessible name
 * (read once) — replacing the old press overlay that copied the row
 * text into an aria-label (announced twice · decision 51 → 52).
 *
 *   <nuri-list-interactive-item onpress="goTo('/card')">
 *     <nuri-list-item>…</nuri-list-item>
 *   </nuri-list-interactive-item>
 *
 * On upgrade:
 *   1. host          → role="listitem"
 *   2. authored kids → moved into <div class="…__action" role="button"
 *                      tabindex="0">  (REPARENTING — intentional here,
 *                      the opposite of list-item · the actionable
 *                      element WRAPS the content)
 *   3. nested list-item → role="presentation" (a listitem must not
 *                      nest inside the role=button; the host already
 *                      carries listitem)
 *
 * NAV-AGNOSTIC (decision 52): activation only FIRES a `press` —
 * routing is the author's concern. Pointer click, Enter (keydown),
 * and Space (keyup, with scroll suppressed on keydown) all dispatch a
 * bubbling `press` CustomEvent. An inline `onpress="…"` attribute is
 * compiled into a `press` listener, mirroring how the browser compiles
 * native on* handlers — so the declarative authoring in the mocks
 * works without lit-html / JSX.
 *
 * The wrapper exists for API mapping in docs HTML — it does NOT port
 * to RN as an element; RN generates a Pressable from the same prop
 * names (accessibilityRole="button", wash from the emitted token ·
 * RISKS R1).
 * ────────────────────────────────────────────────────────────── */

(() => {
  const ACTION_CLASS = 'nuri-list-interactive-item__action';
  const isSpace = (e) => e.key === ' ' || e.key === 'Spacebar';

  class NuriListInteractiveItem extends HTMLElement {
    #action = null;

    connectedCallback() {
      if (!this.hasAttribute('role')) this.setAttribute('role', 'listitem');
      this.#compose();
      this.#wire();
    }

    #compose() {
      // Idempotent — skip if already wrapped (re-connect / move).
      if (this.querySelector(`:scope > .${ACTION_CLASS}`)) {
        this.#action = this.querySelector(`:scope > .${ACTION_CLASS}`);
        return;
      }

      const action = document.createElement('div');
      action.className = ACTION_CLASS;
      action.setAttribute('role', 'button');
      action.tabIndex = 0;

      // Move all authored children into the action wrapper so the
      // actionable element WRAPS the content (the content IS the
      // accessible name · decision 52).
      while (this.firstChild) action.appendChild(this.firstChild);
      this.appendChild(action);
      this.#action = action;

      // Demote a composed <nuri-list-item> from listitem to
      // presentation — the host already carries listitem, and a
      // listitem must not nest inside the role=button.
      const item = action.querySelector(':scope > nuri-list-item');
      if (item) item.setAttribute('role', 'presentation');
    }

    #wire() {
      const action = this.#action;

      action.addEventListener('click', () => this.#activate());

      action.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.#activate();
        } else if (isSpace(e)) {
          e.preventDefault();           // suppress page scroll
          action.dataset.pressed = '';   // press feedback while held
        }
      });

      action.addEventListener('keyup', (e) => {
        if (isSpace(e)) {
          e.preventDefault();
          delete action.dataset.pressed;
          this.#activate();
        }
      });

      // Compile an inline onpress="" into a `press` listener, mirroring
      // the browser's native on* handler compilation. Keeps the element
      // nav-agnostic — it only fires a press; routing is the handler.
      const inline = this.getAttribute('onpress');
      if (inline) {
        const handler = new Function('event', inline);
        this.addEventListener('press', (e) => handler.call(this, e));
      }
    }

    #activate() {
      this.dispatchEvent(new CustomEvent('press', { bubbles: true }));
    }
  }

  customElements.define('nuri-list-interactive-item', NuriListInteractiveItem);
})();
