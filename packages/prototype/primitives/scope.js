/* ──────────────────────────────────────────────────────────────
 * NURI · PRIMITIVE · SCOPE
 * <nuri-scope> creates a local CSS-cascade scope by mirroring its
 * attribute props onto data-* attributes on its own element. Any
 * accent-/mode-/font-consuming token nested inside resolves through
 * the new scope.
 *
 * Why "scope" and not "theme"
 *   Unistyles (the RN target) uses "theme" to mean a complete token
 *   configuration registered globally. <nuri-scope> is a different
 *   thing: a multi-dimensional CSS-cascade scope, web-only. Using a
 *   different word avoids confusion when devs read both libraries.
 *   In RN, the same semantic (subtree scope override) is expressed
 *   via React Context (e.g. <AccentProvider>), not via Unistyles.
 *
 * API
 *   <nuri-scope accent="lilac">...</nuri-scope>
 *   <nuri-scope mode="dark">...</nuri-scope>
 *   <nuri-scope accent="orange" mode="dark">...</nuri-scope>
 *   <nuri-scope font="android">...</nuri-scope>
 *
 * Attribute → data-* mapping
 *   mode    → data-theme   (translation; the CSS files use data-theme
 *                           since v0 and we keep that for now)
 *   accent  → data-accent
 *   neutral → data-neutral
 *   font    → data-font
 *   density → data-density   (future)
 *
 * Rendering
 *   `display: contents` so the element disappears from the layout
 *   tree. Children participate in the parent's layout untouched.
 *
 * Pipeline note
 *   <nuri-scope> exists only in web docs. The RN consumer code is
 *   generated separately (React Context providers). The pipeline
 *   does NOT translate <nuri-scope> 1:1 — see AGENTS.md "Component
 *   tier model" for the cross-platform story.
 * ────────────────────────────────────────────────────────────── */

(() => {
  // Only `mode` is translated (mode prop → data-theme attribute) to
  // avoid a CSS-wide rename. Every other dimension is 1:1.
  const DIMENSIONS = {
    mode:    'theme',
    accent:  'accent',
    neutral: 'neutral',
    font:    'font',
    density: 'density',
  };

  class NuriScope extends HTMLElement {
    static get observedAttributes() {
      return Object.keys(DIMENSIONS);
    }

    connectedCallback() {
      this.#applyName();
      for (const prop of NuriScope.observedAttributes) {
        this.#sync(prop);
      }
    }

    attributeChangedCallback(prop) {
      if (prop === 'name') {
        this.#applyName();
        return;
      }
      this.#sync(prop);
    }

    // Optional registry support: <nuri-scope name="rail-bitcoin">.
    // If window.NuriScopes has a registered preset, apply each of its
    // dimensions, BUT only where a direct prop isn't already set
    // (direct props win over preset).
    #applyName() {
      const presetName = this.getAttribute('name');
      if (!presetName) return;
      const preset = window.NuriScopes && window.NuriScopes.get(presetName);
      if (!preset) return;
      for (const [prop, value] of Object.entries(preset)) {
        if (this.hasAttribute(prop)) continue; // direct prop wins
        const dataKey = DIMENSIONS[prop];
        if (dataKey) this.dataset[dataKey] = value;
      }
    }

    #sync(prop) {
      const dataKey = DIMENSIONS[prop];
      if (!dataKey) return;
      const val = this.getAttribute(prop);
      if (val == null) {
        delete this.dataset[dataKey];
      } else {
        this.dataset[dataKey] = val;
      }
    }
  }

  customElements.define('nuri-scope', NuriScope);

  // Lightweight optional registry. Consumers register reusable
  // multi-dimensional presets, then use <nuri-scope name="...">.
  // Kept on window so any docs page can register without imports;
  // empty by default, no setup required for direct-prop usage.
  window.NuriScopes = window.NuriScopes || {
    presets: new Map(),
    register(name, dimensions) { this.presets.set(name, dimensions); return this; },
    get(name) { return this.presets.get(name); },
    has(name) { return this.presets.has(name); },
  };
})();
