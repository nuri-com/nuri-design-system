/* ──────────────────────────────────────────────────────────────
 * NURI · BOTTOM SHEET RUNTIME · COMPONENT-SPECIFIC DATA
 *
 * Runtime-only sheet behaviour data. Panel chrome is descriptor composition
 * (`bottom-sheet-panel`); projections own its radius/elevation realization.
 * ────────────────────────────────────────────────────────────── */

export const bottomSheetChrome = {
  scrim: {
    none: 'transparent',
    dim: 'blackAlpha.7',
  },
} as const;
