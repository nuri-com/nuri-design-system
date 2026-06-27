/* ──────────────────────────────────────────────────────────────
 * NURI · PLAYGROUND · SHELL  (decision 57 · N+10)
 *
 * The playground is a SEPARATE area from the DS docs — the surface where
 * real screen compositions render live inside device frames, to validate
 * the design system on real layouts (the agent-first loop · decision 21:
 * operator prompts → agent composes → translate · this is where "composes"
 * gets seen). Its chrome is a SEPARATE, simpler sibling of the DS
 * <nuri-shell> — deliberately NOT the sidebar shell (it has no nav tree,
 * no token toggles; per-view theming lives on each <nuri-demo device …>).
 *
 *   <nuri-playground-shell>            the index — a grid of document cards
 *   <nuri-playground-shell doc="…">    a document — a horizontal-scroll row
 *                                       of device-framed views
 *
 * Topbar (both modes): the DS <nuri-topbar center> — a leading ghost back
 * icon-button (documents only · returns to the index), a small em title
 * (the document name, or "Playground" on the index), and a trailing soft
 * "Design system" button. The body is a horizontal-scroll container for a
 * document (so a document can grow to N views) or a card grid for the index.
 *
 * Defer-loaded so the authored children are parsed before connectedCallback
 * reparents them into the built <main>.
 * ────────────────────────────────────────────────────────────── */

(() => {
  const SCRIPT = document.currentScript;
  // shell.js lives at packages/playground/lib/shell.js. One level up → the
  // playground package root (its pages live under pages/); three levels up →
  // the repo root (the DS entry · the A5 carve relocated this from spec).
  const PKG = new URL('../', SCRIPT.src).href;
  const REPO_ROOT = new URL('../../../', SCRIPT.src).href;

  const INDEX_HREF = `${PKG}pages/index.html`;
  // The design-system entry — the repo root redirects to the canonical
  // foundation page (decision 23). A cross-area navigation href, not a package
  // dependency (the DAG stays playground → prototype → spec).
  const DS_HREF = `${REPO_ROOT}index.html`;

  class NuriPlaygroundShell extends HTMLElement {
    #built = false;

    connectedCallback() {
      if (this.#built) return;
      this.#built = true;

      // The playground shell chrome renders on the neutral-GRAY scale so the
      // cream (brand) mockup inside each device frame reads against a plain
      // grey reference instead of cream-on-cream (decision 57 · N+11 cosmetic).
      // BOTH attrs are needed: data-neutral swaps the primitive ramp, but the
      // SEMANTIC chrome tokens (bg-subtle / text / …) re-resolve only where the
      // [data-theme] block re-matches — so we re-assert theme HERE (same trick
      // <nuri-scope> uses) to recompute them against the gray ramp. The device
      // frame re-scopes its OWN theme+neutral (seeded cream from the page pin
      // via <nuri-scope>), so only the surrounding chrome is greyed. A page may
      // override by setting these on the host.
      if (!this.dataset.neutral) this.dataset.neutral = 'gray';
      if (!this.dataset.theme) this.dataset.theme = 'light';

      const doc = this.getAttribute('doc') || '';
      const isDocument = !!doc;

      // Build the chrome topbar (detached) — it wires its own navigation.
      const topbar = this.#buildTopbar(doc, isDocument);

      // Move the authored children (the document's views, or the index cards)
      // into the scroll / grid container BEFORE the chrome is appended, so the
      // `while (this.firstChild)` sweep doesn't pull the chrome in with them.
      const main = document.createElement('main');
      main.className = 'nuri-pg__main';
      const container = document.createElement('div');
      container.className = isDocument ? 'nuri-pg__scroll' : 'nuri-pg__grid';
      while (this.firstChild) container.appendChild(this.firstChild);
      main.appendChild(container);

      this.appendChild(topbar);
      this.appendChild(main);
    }

    #buildTopbar(doc, isDocument) {
      const topbar = document.createElement('nuri-topbar');
      topbar.setAttribute('center', '');
      topbar.className = 'nuri-pg__topbar';
      topbar.innerHTML = this.#topbarInner(doc, isDocument);

      // The DS button / icon-button are native <button>s (no href), so wire
      // navigation by hand. Listeners sit on the HOST custom elements — clicks
      // on the inner <button> bubble up, and the positional row stays in
      // document order (no reparenting · decision 64), so this works
      // regardless of upgrade timing.
      const back = topbar.querySelector('[data-pg-nav="index"]');
      if (back) back.addEventListener('click', () => { window.location.href = INDEX_HREF; });
      const ds = topbar.querySelector('[data-pg-nav="ds"]');
      if (ds) ds.addEventListener('click', () => { window.location.href = DS_HREF; });

      return topbar;
    }

    #topbarInner(doc, isDocument) {
      // Content-pivot positional layout (decision 64 · amendment 46.4):
      // leading sibling (a back affordance · documents only) · the
      // <nuri-topbar-content> pivot (title · small + em via a composed
      // <nuri-typography>, the single text-style owner) · trailing sibling
      // (the soft "Design system" button). No region wrappers.
      const leading = isDocument
        ? `<nuri-icon-button name="caret-left" variant="ghost" label="Back to playground" data-pg-nav="index"></nuri-icon-button>`
        : '';

      const title = isDocument ? doc : 'Playground';
      const content = `<nuri-topbar-content><nuri-typography size="sm" emphasis>${title}</nuri-typography></nuri-topbar-content>`;

      const trailing = `<nuri-button size="sm" variant="soft" data-pg-nav="ds">Design system</nuri-button>`;

      return `${leading}${content}${trailing}`;
    }
  }

  customElements.define('nuri-playground-shell', NuriPlaygroundShell);
})();
