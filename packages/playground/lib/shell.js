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
 * Topbar (both modes): the DS <nuri-topbar> — a leading ghost back icon-button
 * (documents only · returns to the index) and a small em title (the document
 * name, or "Playground" on the index). Empty edge regions preserve structural
 * centring. The body is a horizontal-scroll container for a document (so a
 * document can grow to N views) or a card grid for the index.
 *
 * Defer-loaded so the authored children are parsed before connectedCallback
 * reparents them into the built <main>.
 * ────────────────────────────────────────────────────────────── */

(() => {
  const SCRIPT_URL = new URL(import.meta.url);
  // shell.js lives at packages/playground/lib/shell.js. One level up → the
  // playground package root (its pages live under pages/).
  const PKG = new URL('../', SCRIPT_URL).href;

  const INDEX_HREF = `${PKG}pages/index.html`;

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
      topbar.className = 'nuri-pg__topbar';
      topbar.innerHTML = this.#topbarInner(doc, isDocument);

      // The icon-button is a native <button> (no href), so wire navigation by
      // hand. The compound factory HARVESTS + CLONES the region sub-elements'
      // children into the built tree, so a listener bound to an authored node
      // would be lost — use EVENT DELEGATION on the host instead (clicks on the
      // rendered clone bubble up to <nuri-topbar>, and data-pg-nav survives).
      topbar.addEventListener('click', (e) => {
        const nav = e.target.closest && e.target.closest('[data-pg-nav]');
        if (!nav) return;
        if (nav.getAttribute('data-pg-nav') === 'index') window.location.href = INDEX_HREF;
      });

      return topbar;
    }

    #topbarInner(doc, isDocument) {
      // The compound slot layout (the topbar-slots slice · the factory's
      // compound-component capability): the three typed region sub-elements —
      // leading (a back affordance · documents only) · center (the title · small
      // + em via a composed <nuri-typography>) · trailing (intentionally empty).
      // True centring is structural (the even-flex edges), so both empty regions
      // remain present and the title lands dead-centre — no `center` attribute.
      const back = isDocument
        ? `<nuri-icon-button name="caret-left" variant="ghost" label="Back to playground" data-pg-nav="index"></nuri-icon-button>`
        : '';
      const leading = `<nuri-topbar-leading>${back}</nuri-topbar-leading>`;

      const title = isDocument ? doc : 'Playground';
      const center = `<nuri-topbar-center><nuri-typography size="sm" emphasis>${title}</nuri-typography></nuri-topbar-center>`;

      const trailing = '<nuri-topbar-trailing></nuri-topbar-trailing>';

      return `${leading}${center}${trailing}`;
    }
  }

  customElements.define('nuri-playground-shell', NuriPlaygroundShell);
})();
