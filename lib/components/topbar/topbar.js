/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · TOPBAR · CUSTOM ELEMENTS  (compound · decision 46)
 *
 * Three elements, one IIFE, mirroring the Tabs light-DOM compound
 * (decision 43): the controller reparents its authored children into
 * built region containers — no Shadow DOM, no <slot>.
 *
 *   <nuri-topbar [center]>   the shell · builds the 3-region flex row
 *   <nuri-topbar-start>      leading region marker (optional)
 *   <nuri-topbar-end>        trailing region marker (optional)
 *
 * Layout split (region rhythm + edge padding) lives entirely in
 * topbar.css. JS only: reparent into start / centre / end regions,
 * reflect `center` → data-center, reflect leading/trailing occupancy →
 * data-leading / data-trailing, and fold the `inset` / `inset-start` /
 * `inset-end` API → data-inset-start / -end so the edge padding flips
 * from CSS (attribute dispatch · decision 42 · 46.1 · never compute
 * padding in JS).
 *
 * The wrappers exist for API mapping in docs HTML — they do NOT port
 * to RN. The RN consumer is generated separately (RISKS R1).
 * ────────────────────────────────────────────────────────────── */

(() => {
  /* ── Region markers · invisible (display:contents in CSS) ─────── */
  class NuriTopbarStart extends HTMLElement {}
  class NuriTopbarEnd extends HTMLElement {}

  /* ── <nuri-topbar> · the shell ───────────────────────────────── */
  class NuriTopbar extends HTMLElement {
    static get observedAttributes() {
      return ['center', 'inset', 'inset-start', 'inset-end'];
    }

    #built = false;

    connectedCallback() {
      if (this.#built) return;
      this.#built = true;

      // Identify the named side regions; everything else is the
      // centre. Snapshot childNodes BEFORE moving anything, since
      // appendChild mutates the live list.
      const startEl = this.querySelector(':scope > nuri-topbar-start');
      const endEl = this.querySelector(':scope > nuri-topbar-end');
      const centreNodes = [...this.childNodes].filter(
        (node) => node !== startEl && node !== endEl,
      );

      const start = document.createElement('div');
      start.className = 'nuri-topbar__start';
      const centre = document.createElement('div');
      centre.className = 'nuri-topbar__center';
      const end = document.createElement('div');
      end.className = 'nuri-topbar__end';

      if (startEl) start.appendChild(startEl);
      for (const node of centreNodes) centre.appendChild(node);
      if (endEl) end.appendChild(endEl);

      this.append(start, centre, end);

      // Occupancy → edge-padding dispatch (CSS reads data-leading /
      // data-trailing). A region is "filled" when its marker carries
      // any element or non-whitespace text.
      const occupied = (el) =>
        !!el && (el.children.length > 0 || el.textContent.trim().length > 0);
      this.dataset.leading = occupied(startEl) ? 'filled' : 'empty';
      this.dataset.trailing = occupied(endEl) ? 'filled' : 'empty';

      this.#syncCenter();
      this.#syncInset();
    }

    attributeChangedCallback() {
      if (!this.#built) return;
      this.#syncCenter();
      this.#syncInset();
    }

    #syncCenter() {
      if (this.hasAttribute('center')) {
        this.dataset.center = '';
      } else {
        delete this.dataset.center;
      }
    }

    // Reflect the inset API → data-inset-start / data-inset-end so the
    // edge-padding dispatch in topbar.css can pick the value (decision
    // 46.1 · never compute padding in JS). `inset` is the symmetric
    // shorthand; a per-edge `inset-start` / `inset-end` overrides it on
    // that side. Only xs|sm|lg are honoured; anything else clears the
    // attr so the occupancy / center default takes over.
    #syncInset() {
      const shorthand = this.getAttribute('inset');
      const reflect = (attr, dataKey) => {
        const raw = this.getAttribute(attr) ?? shorthand;
        if (raw === 'xs' || raw === 'sm' || raw === 'lg') {
          this.dataset[dataKey] = raw;
        } else {
          delete this.dataset[dataKey];
        }
      };
      reflect('inset-start', 'insetStart');
      reflect('inset-end', 'insetEnd');
    }
  }

  customElements.define('nuri-topbar-start', NuriTopbarStart);
  customElements.define('nuri-topbar-end', NuriTopbarEnd);
  customElements.define('nuri-topbar', NuriTopbar);
})();
