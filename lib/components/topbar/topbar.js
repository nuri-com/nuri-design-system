/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · TOPBAR · CUSTOM ELEMENTS  (content-pivot · decision 46 · 64 · amendment 46.4)
 *
 * Two light-DOM elements, one IIFE:
 *   <nuri-topbar>          the shell · the flex chrome row (layout in CSS)
 *   <nuri-topbar-content>  the named layout PIVOT (flex:1 · styled in CSS)
 *
 * CONTENT-PIVOT (decision 64 · amendment 46.4): only the content is
 * wrapped, in <nuri-topbar-content>; leading / trailing are plain
 * POSITIONAL siblings around it (anything before the pivot is leading,
 * anything after is trailing). The pivot's `flex:1` pushes trailing to the
 * row end by construction, so a positional empty side contributes nothing
 * and no phantom gap arises. This REPLACES — and DELETES — the old JS
 * region-reparenting (`querySelector` + `createElement` + `appendChild` of
 * __start/__center/__end), the `data-leading/-trailing` occupancy
 * detection, and the <nuri-topbar-start>/<nuri-topbar-end> element defs.
 * No Shadow DOM, no <slot>; the row stays in document order and CSS flexes
 * it (the validated List content-pivot shape · R1).
 *
 * JS now does TWO things, both attribute dispatch (decision 42 · 46.1):
 *   1. <nuri-topbar>      reflects `center` → data-center and folds the
 *                         `inset` / `inset-start` / `inset-end` API →
 *                         data-inset-start / -end so the edge padding
 *                         flips from CSS, never JS.
 *   2. <nuri-topbar-content> applies the lg-em title type to BARE TEXT by
 *                         REUSING Typography's utility class (the single
 *                         text-style owner · decision 64 · 53) — never a
 *                         hand-applied --nuri-type-* block. A non-text
 *                         centre (a segmented control) passes through
 *                         untyped (mirrors the RN `typeof children ===
 *                         'string'` check · the R-EXPO-2c fix).
 *
 * The content pivot exists for API mapping in docs HTML — it does NOT port
 * to RN as an element; the RN consumer is generated separately (same pivot
 * shape, different mechanism · RISKS R1).
 * ────────────────────────────────────────────────────────────── */

(() => {
  /* ── Named content pivot · the layout flex:1 region ───────────── */
  class NuriTopbarContent extends HTMLElement {
    connectedCallback() {
      // Bare title text → reuse the Typography lg-em utility (the single
      // text-style owner · decision 64 · 53), so a bare title reads as a
      // heading with no per-text wrapper. A non-text centre (a segmented
      // control · any element child) passes through untyped — the analogue
      // of the RN `typeof children === 'string'` check (R-EXPO-2c). Pure
      // layout otherwise: no --nuri-type-* is ever hand-applied here.
      if (this.children.length === 0 && this.textContent.trim().length > 0) {
        this.classList.add('nuri-type-lg--em');
      }
    }
  }

  /* ── <nuri-topbar> · the shell ───────────────────────────────── */
  class NuriTopbar extends HTMLElement {
    static get observedAttributes() {
      return ['center', 'inset', 'inset-start', 'inset-end'];
    }

    connectedCallback() {
      this.#sync();
    }

    attributeChangedCallback() {
      if (this.isConnected) this.#sync();
    }

    #sync() {
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
    // attr so the base lg default takes over.
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

  customElements.define('nuri-topbar-content', NuriTopbarContent);
  customElements.define('nuri-topbar', NuriTopbar);
})();
