/* ══════════════════════════════════════════════════════════════════
 * NURI · TYPOGRAPHY AXIS · SOURCE OF TRUTH (TS) · N+35 · L3.1b · decision 70 / 67 / 73
 * ──────────────────────────────────────────────────────────────────
 * The `typography` axis of the cascade (L3 · the THIRD and LAST
 * bespoke axis · decision 73 corrected dec 70: typography is bespoke, not agnostic),
 * authored ONCE in TS. typography is the prose funnel: a thin wrapper that carries
 * declarative, prop-based authoring (muted tone + block alignment) over the
 * foundation type scale.
 *
 * The axis data is neutral wrapper intent:
 *   · `element` — the stable wrapper host id.
 *   · `muted.role` — the semantic text role the muted wrapper resolves to.
 *   · `align.values` — the authored alignment vocabulary.
 *
 * The web projection owns selector and declaration spelling (`data-muted`,
 * `color: var(...)`, `display`, `text-align`). RN maps typography directly through
 * `typeStyle` and Text style at its boundary.
 *
 * Consumed by the pipeline through the shared TS data loader (loadAxis ·
 * packages/prototype/pipeline/parsers/typography-css.js). Base: decision 2
 * (reversed at L3c, not here) · 37 · 42 · 53 · 59 · 65.3 §6 · 67 · 70 · 73 ·
 * the L3.1 reversible-shadow discipline.
 * ══════════════════════════════════════════════════════════════════ */

type TypographyAxis = {
  element: string;
  muted: { role: 'text-muted' };
  align: { values: readonly ['start', 'center', 'end'] };
};

export const axis = {
  element: 'nuri-typography',
  muted: { role: 'text-muted' },
  align: { values: ['start', 'center', 'end'] },
} as const satisfies TypographyAxis;
