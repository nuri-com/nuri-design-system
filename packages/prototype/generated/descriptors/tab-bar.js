/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT DESCRIPTOR · TAB-BAR · BROWSER ESM · GENERATED · DO NOT EDIT BY HAND
 *
 * The browser-ESM twin of build/descriptors/tab-bar.ts — IDENTICAL data,
 * the authored source type-stripped (no `import type`, no axes type, no
 * `: Descriptor<…>` annotation). A browser can `import { tabBarDescriptor }`
 * from it at runtime with NO build step — the runtime web factory
 * (lib/runtime/factory.js · decision 67) consumes it to render a de-collapsed
 * nuri-* tree, preserving the zero-build composition property (decision 66 ·
 * what Nuri IS #3).
 *
 * Source · pipeline/descriptors/tab-bar.ts (the AUTHORED SoT · §9 step 1 ·
 * decision 69 · N+29 B1). Emitter · pipeline/tokens-parser.js — `npm run build`.
 * Committed (decision 35) · the `git diff --exit-code build/` gate covers it.
 * NEVER hand-edit build/ — edit the authored source above.
 * ────────────────────────────────────────────────────────────── */

export const tabBarDescriptor = {
  structure: {
    // OPEN root (accepts the Tab children as positional content · §7) with NO named
    // parts — the factory renders an open container's positional children directly.
    anatomy: {
      el: 'view',
      open: true,
    },
    base: {
      // The chrome row: a full-height stretch row (each item fills the bar height ·
      // the column is tappable), over the canvas surface. The item children carry
      // the `even` flex that equalizes the columns. `minHeight:'xl'` is the
      // bottom-bar chrome FLOOR (the legacy 54 row · a min, not a hard cap, so the
      // bar GROWS rather than compressing its items); `paddingBottom` lifts the
      // icon-over-label content off the screen's bottom edge so the labels keep air
      // from the gesture/home-indicator zone. The DYNAMIC per-device safe-area inset
      // is STILL the consuming app's (added on top · the brief's boundary) — this is
      // the bar's intrinsic bottom breathing room, not the device inset.
      root: {
        stack: { direction: 'row', align: 'stretch' },
        box: { minHeight: 'xl', paddingBottom: 'md' },
        palette: { chrome: 'canvas' },
      },
    },
  },
};
