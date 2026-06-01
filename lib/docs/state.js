/* ──────────────────────────────────────────────────────────────
 * NURI · DOCS STATE
 * Glue between localStorage (persistence) and <html data-*>
 * attributes (the live source of truth that CSS reads).
 *
 * Why this exists
 *   The docs site has a handful of global toggles — theme, neutral
 *   scale, accent, font stack — each persisted and each mirrored
 *   to a data-* attribute so the CSS cascade can react. This file
 *   centralises the three concerns:
 *     1. Reading from localStorage (with try/catch for privacy modes)
 *     2. Mirroring to <html data-*> (so [data-theme="dark"] selectors fire)
 *     3. Subscribing to changes (so pages can re-render token tables)
 *
 * Why not signals
 *   The state surface is tiny (4 enums, may grow to ~8). The DOM is
 *   already the rendering primitive — CSS reads attributes, not JS
 *   state. Adding signals would introduce a second source of truth
 *   we'd have to keep in sync. MutationObserver gives us reactivity
 *   for free, scoped to the attributes we care about.
 *
 * Loading
 *   Load SYNCHRONOUSLY (no defer) in <head> BEFORE the stylesheets.
 *   The IIFE auto-hydrates from localStorage so the first paint already
 *   has the correct data-* attrs — no FOUC.
 *
 * Adding a new toggle
 *   1. Add a spec to DEFAULT_SPECS below.
 *   2. Wire a control in the topbar (lib/docs/shell.js) that calls
 *      NuriState.set('<attr>', value).
 *   3. Optionally subscribe in pages that need to react:
 *      NuriState.subscribe('<attr>', cb).
 *
 * Public API
 *   NuriState.set(attr, value)        — mirror to DOM + persist
 *   NuriState.read(attr, fallback)    — read raw value from storage
 *   NuriState.subscribe(attrs, cb)    — observe data-* changes
 *   NuriState.hydrate(specs?)         — manual re-hydrate (rarely needed)
 * ────────────────────────────────────────────────────────────── */

(function () {
  const NS = 'nuri-';

  // Single registry of every globally-persisted toggle in the docs.
  // The attr is also used as the localStorage key suffix and the
  // data-* attribute name on <html>. Add new toggles here.
  const DEFAULT_SPECS = [
    { attr: 'theme',   fallback: 'light' },
    { attr: 'neutral', fallback: 'gray'  },
    { attr: 'accent',  fallback: 'lilac' },
    { attr: 'font',    fallback: 'ios'   },
  ];

  // Catalogue of the valid values for each toggle. Single source of truth
  // for any code that needs to enumerate options (topbar selects, exploration
  // page, future density picker, etc.). Adding a new neutral scale = edit
  // here, not in three places.
  const AVAILABLE = {
    neutral: ['gray', 'mauve', 'slate', 'sage', 'olive', 'sand', 'cream'],
    accent:  ['neutral', 'lilac'],
    theme:   ['light', 'dark'],
    // font is intentionally not here — its labels diverge from values
    // ("ios" → "iOS"), so shell.js keeps the value/label pair list.
  };

  function nsKey(attr) {
    return attr.startsWith(NS) ? attr : NS + attr;
  }

  function read(attr, fallback) {
    try {
      return localStorage.getItem(nsKey(attr)) || fallback;
    } catch (_) {
      return fallback;
    }
  }

  function write(attr, value) {
    try {
      localStorage.setItem(nsKey(attr), value);
    } catch (_) { /* private mode, file://, etc. */ }
  }

  // Mirror a value to <html data-attr> AND persist it. The order matters:
  // dataset first (so any synchronous CSS read sees the new value), then
  // localStorage (so a failed write doesn't block UI update).
  function set(attr, value) {
    document.documentElement.dataset[attr] = value;
    write(attr, value);
  }

  // Read all specs from storage, mirror to <html data-*>. Called once
  // automatically on script load; exposed for the rare case a page wants
  // to re-hydrate with a different spec list.
  function hydrate(specs) {
    const list = specs || DEFAULT_SPECS;
    const r = document.documentElement.dataset;
    for (const { attr, fallback } of list) {
      r[attr] = read(attr, fallback);
    }
  }

  // Subscribe to mutations on one or more data-* attributes of <html>.
  // `attrs` is a string or array of attribute names (without the data- prefix).
  // The callback receives (attr, value) for each change.
  // Returns an unsubscribe function.
  function subscribe(attrs, cb) {
    const list = Array.isArray(attrs) ? attrs : [attrs];
    const filter = list.map(a => 'data-' + a);
    const obs = new MutationObserver(records => {
      for (const r of records) {
        const attr = r.attributeName.replace(/^data-/, '');
        cb(attr, document.documentElement.dataset[attr]);
      }
    });
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: filter,
    });
    return () => obs.disconnect();
  }

  window.NuriState = {
    set: set,
    read: read,
    hydrate: hydrate,
    subscribe: subscribe,
    AVAILABLE: AVAILABLE,
  };

  // Auto-hydrate on script load. Must run BEFORE stylesheets parse to
  // avoid FOUC — this is why state.js is loaded synchronously in <head>.
  hydrate();
})();
