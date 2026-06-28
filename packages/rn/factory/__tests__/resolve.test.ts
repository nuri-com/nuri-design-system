/* ══════════════════════════════════════════════════════════════════
 * NURI · FACTORY · RESOLUTION TESTS (pure · no RN runtime)
 * ──────────────────────────────────────────────────────────────────
 * Proves the generic engine consumes the frozen contract correctly:
 *   · the baseline theme resolves to the §11 shape from the live tokens;
 *   · the three descriptors resolve onto a Unistyles-shaped recipe
 *     (base + variants + compoundVariants + the §12 fg / type channels);
 *   · load-bearing values are spot-asserted against the token emit;
 *   · the resolved style tree is snapshotted (committed).
 * All values are re-derived from the contract (accentTokens / chrome /
 * size / space / radius / interactionTokens) — never hardcoded — so a token
 * change re-derives instead of silently passing.
 * ══════════════════════════════════════════════════════════════════ */

import { buildNuriTheme, INTERACTION_BASELINE } from '../theme';
import { typeStyle } from '../../theme';
import { recipeFor, flattenPart, resolveAnatomy } from '../resolve';
import {
  compositionButtonDescriptor,
  iconAvatarDescriptor,
  topbarDescriptor,
  accentTokens,
  chrome,
  size,
  space,
  radius,
  typeScale,
  emphasisWeight,
  interaction as interactionTokens,
} from '../../contract';
import type { Accent, Theme } from '../../contract';

// accentTokens is now accent-MAJOR two-layer (N+59 · Slice 3b·1 · projection model
// §3): a role is a flat hex (theme-invariant · the P4-frozen brand) or a {light,dark}
// pair (theme-adapting). Resolve a role for a mode — the SAME collapse runtimeTokens
// does, RESTATED here so the spot-asserts read the contract (accentTokens) directly,
// not the factory's own resolution. The resolved value is byte-identical to the old
// accentTokens[accent][mode].role cross-product cell.
const acc = (a: Accent, role: keyof (typeof accentTokens)[Accent], mode: Theme): string => {
  const v = accentTokens[a][role] as string | { light: string; dark: string };
  return typeof v === 'string' ? v : v[mode];
};

describe('baseline theme (resolver-model §11)', () => {
  const theme = buildNuriTheme('lilac', 'light');

  test('surface roles resolve from build/palette.ts against the live slice', () => {
    expect(theme.surface.solid.bg).toBe(acc('lilac', 'solid', 'light'));
    expect(theme.surface.solid.fg).toBe(acc('lilac', 'onSolid', 'light'));
    expect(theme.surface.solid.pressedBg).toBe(acc('lilac', 'solidPressed', 'light'));

    expect(theme.surface.soft.bg).toBe(chrome.light.bgStrong);
    expect(theme.surface.soft.fg).toBe(chrome.light.textPrimary);
    expect(theme.surface.soft.pressedBg).toBe(chrome.light.bgPressed);

    // ghost carries the literal 'transparent' (not a TokenPath).
    expect(theme.surface.ghost.bg).toBe('transparent');
    expect(theme.surface.ghost.pressedBg).toBe(chrome.light.bgSubtle);

    // FINDING: `subtle` is FG-ONLY in the frozen mapping (no bg). resolver-model
    // §11's sketch wrote `bg:'transparent'`; the frozen palette.ts does not.
    expect(theme.surface.subtle.bg).toBeUndefined();
    expect(theme.surface.subtle.fg).toBe(chrome.light.borderStrong);
  });

  test('chrome slot resolves (topbar canvas)', () => {
    expect(theme.chrome.canvas.bg).toBe(chrome.light.bgCanvas);
    expect(theme.chrome.canvas.fg).toBe(chrome.light.textPrimary);
  });

  test('neutral solid inverts with mode (the N+15 lesson)', () => {
    expect(buildNuriTheme('neutral', 'light').surface.solid.bg).toBe(acc('neutral', 'solid', 'light')); // #12110b
    expect(buildNuriTheme('neutral', 'dark').surface.solid.bg).toBe(acc('neutral', 'solid', 'dark')); // #fffdf2
  });

  test('interaction baseline is PINNED to the contract emit (no drift)', () => {
    // The frozen build emits a TRANSVERSAL interaction set (build/interaction.ts ·
    // Smell-1 · decision 66 arc #0); the factory reads it directly and pins to it.
    expect(INTERACTION_BASELINE.pressScale).toBe(interactionTokens.pressScale); // 0.97
    expect(INTERACTION_BASELINE.disabledOpacity).toBe(interactionTokens.disabledOpacity); // 0.4
  });
});

describe('Button — the richest descriptor (every namespace + interactive)', () => {
  const r = recipeFor(compositionButtonDescriptor, 'lilac', 'light');

  test('root base = the stack composition (row · center · center)', () => {
    expect(r.root.base).toEqual({
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    });
  });

  test('variant axis → backgroundColor patches (palette · spot-assert)', () => {
    expect(r.root.variants.variant.solid).toEqual({ backgroundColor: acc('lilac', 'solid', 'light') });
    expect(r.root.variants.variant.soft).toEqual({ backgroundColor: chrome.light.bgStrong });
    expect(r.root.variants.variant.ghost).toEqual({ backgroundColor: 'transparent' });
  });

  test('size axis → box geometry patches (sm/md/lg · decision 41)', () => {
    expect(r.root.variants.size.sm).toEqual({ minHeight: size.md, paddingHorizontal: space.md, borderRadius: radius.sm });
    expect(r.root.variants.size.md).toEqual({ minHeight: size.lg, paddingHorizontal: space.lg, borderRadius: radius.sm });
    expect(r.root.variants.size.lg).toEqual({ minHeight: size.xl, paddingHorizontal: space.xl, borderRadius: radius.md });
  });

  test('compoundVariants = the §11 array (pressed colour per variant + scale + opacity)', () => {
    expect(r.root.compoundVariants).toEqual(
      expect.arrayContaining([
        { variant: 'solid', pressed: true, styles: { backgroundColor: acc('lilac', 'solidPressed', 'light') } },
        { variant: 'soft', pressed: true, styles: { backgroundColor: chrome.light.bgPressed } },
        { variant: 'ghost', pressed: true, styles: { backgroundColor: chrome.light.bgSubtle } },
        { pressed: true, styles: { transform: [{ scale: interactionTokens.pressScale }] } },
        { disabled: true, styles: { opacity: interactionTokens.disabledOpacity } },
      ]),
    );
  });

  test('foreground flows by SCOPE — the variant fg is a channel, NOT in the label patch (§12 · F-BOX-FG-1)', () => {
    expect(r.root.foreground?.variants?.variant).toEqual({
      solid: acc('lilac', 'onSolid', 'light'),
      soft: chrome.light.textPrimary,
      ghost: chrome.light.textPrimary,
    });
    // the label part carries ONLY typography — no colour patch.
    expect(r.label.base).toEqual({});
    expect(r.label.foreground).toBeUndefined();
  });

  test('label type tracks size — orthogonal {size, emphasis} (decision 55 · de-fused 77)', () => {
    expect(r.label.el).toBe('text');
    // The fused `smEm`/`mdEm` is gone — each value is the two orthogonal inputs.
    // Button is emphasis across all sizes; lg reuses md's step (decision 41/55).
    expect(r.label.typeStep?.variants?.size).toEqual({
      sm: { size: 'sm', emphasis: true },
      md: { size: 'md', emphasis: true },
      lg: { size: 'md', emphasis: true },
    });
  });
});

// ── typeStyle · the de-fusion is COMPUTED-EQUIVALENT (decision 77 · the N+45 gate) ──
// Proves emphasis is a pure regular→semibold weight override: every (size, emphasis)
// resolves to the SAME composite the old fused typeStyle(`${size}Em`) returned — the
// values are frozen, only the API/shape de-fuses. Re-derived from the contract
// (typeScale / emphasisWeight), never hardcoded.
describe('typeStyle — size × emphasis is a pure weight override (computed-equivalence · decision 77)', () => {
  const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '3xl'] as const;

  test('emphasis swaps ONLY the weight (regular→emphasisWeight) · metrics frozen', () => {
    for (const s of SIZES) {
      const regular = typeStyle(s);
      const emphasized = typeStyle(s, true);
      // metrics identical — emphasis must not touch size / line-height / letter-spacing
      expect(emphasized.fontSize).toBe(regular.fontSize);
      expect(emphasized.lineHeight).toBe(regular.lineHeight);
      expect(emphasized.letterSpacing).toBe(regular.letterSpacing);
      // ONLY the weight changes: regular = the scale's weight; emphasis = the override
      expect(regular.fontWeight).toBe(typeScale[s].fontWeight);
      expect(emphasized.fontWeight).toBe(emphasisWeight);
    }
  });

  test('typeStyle(size, true) reproduces the old fused `${size}Em` composite exactly', () => {
    for (const s of SIZES) {
      const t = typeScale[s];
      expect(typeStyle(s, true)).toEqual({
        fontSize: t.fontSize,
        lineHeight: t.fontSize * t.lineHeight,
        letterSpacing: t.fontSize * t.letterSpacing,
        fontWeight: emphasisWeight,
      });
    }
  });
});

describe('IconAvatar — same factory, static, the subtle role', () => {
  const r = recipeFor(iconAvatarDescriptor, 'lilac', 'light');

  test('fixed-circle base (box width/height/radius:full · invariant)', () => {
    expect(r.root.base).toEqual({
      alignItems: 'center',
      justifyContent: 'center',
      width: size.lg,
      height: size.lg,
      borderRadius: radius.full,
    });
  });

  test('variant fills (solid/soft/ghost) + the FG-ONLY subtle finding', () => {
    expect(r.root.variants.variant.solid).toEqual({ backgroundColor: acc('lilac', 'solid', 'light') });
    expect(r.root.variants.variant.soft).toEqual({ backgroundColor: chrome.light.bgStrong });
    expect(r.root.variants.variant.ghost).toEqual({ backgroundColor: 'transparent' });
    // subtle contributes NO background patch (fg-only) — the consumability finding.
    expect(r.root.variants.variant.subtle).toBeUndefined();
    expect(r.root.foreground?.variants?.variant.subtle).toBe(chrome.light.borderStrong);
  });

  test('static — no interactive, no compoundVariants', () => {
    expect(r.root.compoundVariants).toEqual([]);
  });

  test('icon part is a glyph leaf', () => {
    expect(r.icon.el).toBe('icon');
  });
});

describe('Topbar — same factory, OPEN primitive, the content-pivot', () => {
  const r = recipeFor(topbarDescriptor, 'lilac', 'light');

  test('open root base = row chrome surface (stack + box + palette.chrome)', () => {
    expect(r.root.open).toBe(true);
    expect(r.root.base).toEqual({
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.sm,
      height: size.lg,
      paddingStart: space.lg,
      paddingEnd: space.lg,
      backgroundColor: chrome.light.bgCanvas,
    });
    // chrome fg is invariant (base), delivered by scope.
    expect(r.root.foreground?.base).toBe(chrome.light.textPrimary);
  });

  test('content pivot = stack fill grow-shrink (flex:1 1 auto + min-inline-size:0)', () => {
    expect(r.content.base).toEqual({ flexGrow: 1, flexShrink: 1, minWidth: 0 });
  });

  test('center axis repartitions onto the pivot (100% on content · zero on host)', () => {
    expect(r.content.variants.center.true).toEqual({ alignItems: 'center', justifyContent: 'center' });
    // center=false is the empty patch; the host gets nothing from the axis.
    expect(r.root.variants.center).toBeUndefined();
  });
});

describe('genericity + the resolved style tree (snapshots committed)', () => {
  test('three descriptors, ONE engine — anatomy shapes', () => {
    expect(resolveAnatomy(compositionButtonDescriptor)).toMatchObject({ name: 'root', el: 'view', open: false });
    expect(resolveAnatomy(iconAvatarDescriptor).children[0]).toMatchObject({ name: 'icon', el: 'icon' });
    expect(resolveAnatomy(topbarDescriptor)).toMatchObject({ name: 'root', open: true });
  });

  test('resolved Unistyles recipe — Button (lilac/light)', () => {
    expect(recipeFor(compositionButtonDescriptor, 'lilac', 'light')).toMatchSnapshot();
  });

  test('resolved Unistyles recipe — Button (neutral/dark · accent×mode)', () => {
    expect(recipeFor(compositionButtonDescriptor, 'neutral', 'dark')).toMatchSnapshot();
  });

  test('resolved Unistyles recipe — IconAvatar (lilac/light)', () => {
    expect(recipeFor(iconAvatarDescriptor, 'lilac', 'light')).toMatchSnapshot();
  });

  test('resolved Unistyles recipe — Topbar (lilac/light)', () => {
    expect(recipeFor(topbarDescriptor, 'lilac', 'light')).toMatchSnapshot();
  });

  test('flattenPart concrete cell — Button solid/md pressed (the render path)', () => {
    const theme = buildNuriTheme('lilac', 'light');
    const pressed = flattenPart(compositionButtonDescriptor, theme, 'light', 'root', { variant: 'solid', size: 'md' }, { pressed: true }).style;
    expect(pressed).toEqual({
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: size.lg,
      paddingHorizontal: space.lg,
      borderRadius: radius.sm,
      backgroundColor: acc('lilac', 'solidPressed', 'light'),
      transform: [{ scale: interactionTokens.pressScale }],
    });
  });
});
