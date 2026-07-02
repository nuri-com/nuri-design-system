/* ══════════════════════════════════════════════════════════════════
 * NURI · RUNTIME · THE BYTE-IDENTICAL COLOUR GUARD (SEED-4 · the named signal)
 * ──────────────────────────────────────────────────────────────────
 * The load-bearing proof that the Option-B colour rework (resolve ONCE at the
 * provider · debt-register SEED-4) is a FAITHFUL RENAME, not a behaviour change:
 * the provider payload `buildNuriTheme(accent, mode)` — its `surface`, resolved
 * `chrome` slots, `text`, `border`, and address fields — must equal,
 * byte-for-byte across EVERY (accent × mode) pair, the value the old
 * per-render `buildNuriTheme` + `runtimeTokens` ceremony produced.
 *
 * The old builders are DELETED, so the reference here is an INDEPENDENT oracle:
 * the expected hexes are re-derived straight from the raw token SoTs (accentTokens
 * / chrome / space / size / radius) with the settled variant→role mapping inlined
 * — NOT from generated/data/palette.ts and NOT from runtime/theme-payload.ts's builder. That
 * independence is what makes this guard BIND: mutate one cell of the palette
 * mapping (e.g. solid.bg → a different ref) and the payload diverges from this
 * oracle → RED. GREEN ⇒ the mapping-once collapse reproduces the pre-SEED-4 hexes
 * exactly, so the ceremony (resolveColor · RUNTIME_GROUPS · resolveAccentSlice ·
 * runtimeTokens · the per-component rebuild) was pure indirection, safe to delete.
 * (The render-smoke + recipe snapshots staying byte-identical is the companion
 * end-to-end proof.)
 * ══════════════════════════════════════════════════════════════════ */

import { buildNuriTheme } from '../runtime/theme-payload';
import { accent as accentTokens, chrome } from '../generated/data/tokens';
import type { Accent, Theme } from '../contract';

// Derive the matrix from the token SoTs, so a new accent (or mode) is covered
// automatically — the guard can never silently under-test the (accent × mode) grid.
const ACCENTS = Object.keys(accentTokens) as Accent[];
const MODES = Object.keys(chrome) as Theme[];

// Collapse one accent role's flat-or-{light,dark} value to its mode hex — the
// SAME collapse the builder does, RESTATED here so the oracle reads the contract
// (accentTokens) directly, not the factory's own resolution.
const acc = (a: Accent, role: keyof (typeof accentTokens)[Accent], mode: Theme): string => {
  const v = accentTokens[a][role] as string | { light: string; dark: string };
  return typeof v === 'string' ? v : v[mode];
};

// The settled variant→role mapping (the global theme POLICY · generated/
// palette.ts · EXPECTED_PALETTE in docs-drift Guard E), inlined INDEPENDENTLY so
// a drift in the mapping fails this guard rather than sailing through.
const expectedSurface = (a: Accent, mode: Theme) => {
  const c = chrome[mode];
  return {
    solid: { bg: acc(a, 'solid', mode), fg: acc(a, 'onSolid', mode), fgMuted: undefined, pressedBg: acc(a, 'solidPressed', mode) },
    soft: { bg: c.bgStrong, fg: c.textPrimary, fgMuted: c.textMuted, pressedBg: c.bgPressed },
    ghost: { bg: 'transparent', fg: c.textPrimary, fgMuted: c.textMuted, pressedBg: c.bgSubtle },
    subtle: { bg: undefined, fg: c.borderStrong, fgMuted: undefined, pressedBg: undefined },
  };
};

const expectedChromeSlots = (mode: Theme) => {
  const c = chrome[mode];
  return {
    canvas: { bg: c.bgCanvas, fg: c.textPrimary, fgMuted: c.textMuted },
    subtle: { bg: c.bgSubtle, fg: c.textPrimary, fgMuted: c.textMuted },
    strong: { bg: c.bgStrong, fg: c.textPrimary, fgMuted: c.textMuted },
  };
};

describe('SEED-4 · the provider payload is byte-identical to the pre-rework colour resolution', () => {
  for (const a of ACCENTS) {
    for (const mode of MODES) {
      test(`payload(${a}, ${mode}) · resolved semantic roles`, () => {
        const p = buildNuriTheme(a, mode);

        // The resolved surface (the variant→role mapping applied ONCE) === the
        // independent oracle. `toEqual` compares undefined bg/fgMuted verbatim.
        expect(p.surface).toEqual(expectedSurface(a, mode));

        // The resolved chrome slots (canvas/subtle/strong).
        expect(p.chrome).toEqual(expectedChromeSlots(mode));

        // The Address scalars ride the payload (orthogonal single-axis override).
        expect(p.mode).toBe(mode);
        expect(p.accent).toBe(a);

        // The chrome text/border roles are the raw chrome leaves, verbatim.
        expect(p.text).toEqual({ primary: chrome[mode].textPrimary, muted: chrome[mode].textMuted, onInverse: chrome[mode].textOnInverse });
        expect(p.border).toEqual({ subtle: chrome[mode].borderSubtle, default: chrome[mode].borderDefault, strong: chrome[mode].borderStrong });
      });
    }
  }

  // The neutral-inverts-with-mode invariant (the N+15 lesson · a spot check that
  // the collapse honours the two-layer table's {light,dark} arm).
  test('neutral.solid inverts across mode (the collapse is real)', () => {
    expect(buildNuriTheme('neutral', 'light').surface.solid.bg).toBe('#12110b');
    expect(buildNuriTheme('neutral', 'dark').surface.solid.bg).toBe('#fffdf2');
  });
});
