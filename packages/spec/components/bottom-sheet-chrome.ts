/* ──────────────────────────────────────────────────────────────
 * NURI · BOTTOM SHEET RUNTIME · COMPONENT-SPECIFIC DATA
 *
 * Runtime-only sheet behaviour data. Panel chrome is descriptor composition
 * (`modal-panel` in sheet mode); projections own its realization.
 * ────────────────────────────────────────────────────────────── */

export const bottomSheetChrome = {
  scrim: {
    none: 'transparent',
    dim: 'blackAlpha.7',
  },
} as const;
