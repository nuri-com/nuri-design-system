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
  interaction as interactionTokens,
} from '../../contract';

describe('baseline theme (resolver-model §11)', () => {
  const theme = buildNuriTheme('lilac', 'light');

  test('surface roles resolve from build/palette.ts against the live slice', () => {
    expect(theme.surface.solid.bg).toBe(accentTokens.lilac.light.solid);
    expect(theme.surface.solid.fg).toBe(accentTokens.lilac.light.onSolid);
    expect(theme.surface.solid.pressedBg).toBe(accentTokens.lilac.light.solidPressed);

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
    expect(buildNuriTheme('neutral', 'light').surface.solid.bg).toBe(accentTokens.neutral.light.solid); // #12110b
    expect(buildNuriTheme('neutral', 'dark').surface.solid.bg).toBe(accentTokens.neutral.dark.solid); // #fffdf2
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
    expect(r.root.variants.variant.solid).toEqual({ backgroundColor: accentTokens.lilac.light.solid });
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
        { variant: 'solid', pressed: true, styles: { backgroundColor: accentTokens.lilac.light.solidPressed } },
        { variant: 'soft', pressed: true, styles: { backgroundColor: chrome.light.bgPressed } },
        { variant: 'ghost', pressed: true, styles: { backgroundColor: chrome.light.bgSubtle } },
        { pressed: true, styles: { transform: [{ scale: interactionTokens.pressScale }] } },
        { disabled: true, styles: { opacity: interactionTokens.disabledOpacity } },
      ]),
    );
  });

  test('foreground flows by SCOPE — the variant fg is a channel, NOT in the label patch (§12 · F-BOX-FG-1)', () => {
    expect(r.root.foreground?.variants?.variant).toEqual({
      solid: accentTokens.lilac.light.onSolid,
      soft: chrome.light.textPrimary,
      ghost: chrome.light.textPrimary,
    });
    // the label part carries ONLY typography — no colour patch.
    expect(r.label.base).toEqual({});
    expect(r.label.foreground).toBeUndefined();
  });

  test('label type tracks size (sm→smEm, md/lg→mdEm · decision 55)', () => {
    expect(r.label.el).toBe('text');
    expect(r.label.typeStep?.variants?.size).toEqual({ sm: 'smEm', md: 'mdEm', lg: 'mdEm' });
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
    expect(r.root.variants.variant.solid).toEqual({ backgroundColor: accentTokens.lilac.light.solid });
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
      backgroundColor: accentTokens.lilac.light.solidPressed,
      transform: [{ scale: interactionTokens.pressScale }],
    });
  });
});
