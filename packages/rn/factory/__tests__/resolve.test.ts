/* ══════════════════════════════════════════════════════════════════
 * NURI · FACTORY · RESOLUTION TESTS (pure · no RN runtime)
 * ──────────────────────────────────────────────────────────────────
 * Proves the generic RUNTIME resolver consumes the frozen contract correctly:
 *   · the baseline theme resolves to the §11 shape from the live tokens;
 *   · the three descriptors resolve onto concrete (selection × state) cells
 *     (flattenPart · geometry + the §12 fg-by-scope + interactive transients);
 *   · load-bearing values are spot-asserted against the token emit;
 *   · typeStyle's size × emphasis de-fusion is computed-equivalent.
 * All values are re-derived from the token emit (accentTokens / chrome / size /
 * space / radius / interactionTokens) — never hardcoded — so a token change
 * re-derives instead of silently passing.
 *
 * The build-time BAKE of the same geometry (generated/recipes.ts · Arc 2) and
 * its byte-for-byte equivalence to this runtime resolver live in the sibling
 * geometry-bake.test.ts (the oracle guard). flattenPart is the oracle's reference.
 * ══════════════════════════════════════════════════════════════════ */

import { buildNuriTheme, INTERACTION_BASELINE } from '../theme';
import { typeStyle } from '../../theme';
import { flattenPart, resolveAnatomy } from '../resolve';
import {
  buttonDescriptor,
  iconAvatarDescriptor,
  topbarDescriptor,
  size,
  space,
  radius,
  ratio,
  typeScale,
  emphasisWeight,
  interaction as interactionTokens,
} from '../../contract';
import { accent as accentTokens, chrome } from '../../generated/tokens';
import type { Accent, Theme, Descriptor, Part } from '../../contract';

// accentTokens is now accent-MAJOR two-layer (N+59 · Slice 3b·1 · projection model
// §3): a role is a flat hex (theme-invariant · the P4-frozen brand) or a {light,dark}
// pair (theme-adapting). Resolve a role for a mode — the SAME collapse buildNuriTheme
// does, RESTATED here so the spot-asserts read the token emit (accentTokens) directly,
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

describe('Button — the richest descriptor (every namespace + interactive · via flattenPart)', () => {
  const theme = buildNuriTheme('lilac', 'light');
  const rootCell = (variant: string, size_: string, state = {}) =>
    flattenPart(buttonDescriptor, theme, 'root', { variant, size: size_ }, state);

  test('root base = the stack composition (row · center · center) + the size box geometry', () => {
    const style = rootCell('soft', 'md').style;
    expect(style.flexDirection).toBe('row');
    expect(style.alignItems).toBe('center');
    expect(style.justifyContent).toBe('center');
    // md → minHeight lg · paddingX lg · radius full (decision 41)
    expect(style.minHeight).toBe(size.lg);
    expect(style.paddingHorizontal).toBe(space.lg);
    expect(style.borderRadius).toBe(radius.full);
  });

  test('variant → backgroundColor (palette · spot-assert)', () => {
    expect(rootCell('solid', 'md').style.backgroundColor).toBe(acc('lilac', 'solid', 'light'));
    expect(rootCell('soft', 'md').style.backgroundColor).toBe(chrome.light.bgStrong);
    expect(rootCell('ghost', 'md').style.backgroundColor).toBe('transparent');
  });

  test('size → box geometry patches (sm/md/lg · decision 41)', () => {
    const geom = (s: string) => {
      const { minHeight, paddingHorizontal, borderRadius } = rootCell('soft', s).style as Record<string, unknown>;
      return { minHeight, paddingHorizontal, borderRadius };
    };
    expect(geom('sm')).toEqual({ minHeight: size.md, paddingHorizontal: space.md, borderRadius: radius.full });
    expect(geom('md')).toEqual({ minHeight: size.lg, paddingHorizontal: space.lg, borderRadius: radius.full });
    expect(geom('lg')).toEqual({ minHeight: size.xl, paddingHorizontal: space.xl, borderRadius: radius.full });
  });

  test('interactive transients — pressed colour per variant + scale + disabled opacity', () => {
    expect(rootCell('solid', 'md', { pressed: true }).style.backgroundColor).toBe(acc('lilac', 'solidPressed', 'light'));
    expect(rootCell('soft', 'md', { pressed: true }).style.backgroundColor).toBe(chrome.light.bgPressed);
    expect(rootCell('ghost', 'md', { pressed: true }).style.backgroundColor).toBe(chrome.light.bgSubtle);
    expect(rootCell('solid', 'md', { pressed: true }).style.transform).toEqual([{ scale: interactionTokens.pressScale }]);
    expect(rootCell('solid', 'md', { disabled: true }).style.opacity).toBe(interactionTokens.disabledOpacity);
  });

  test('foreground flows by SCOPE — the variant fg is a node channel, NOT in the label patch (§12 · F-BOX-FG-1)', () => {
    // the root PROVIDES the surface fg per variant (scope-published · not a style patch)
    expect(rootCell('solid', 'md').node.fg).toBe(acc('lilac', 'onSolid', 'light'));
    expect(rootCell('soft', 'md').node.fg).toBe(chrome.light.textPrimary);
    expect(rootCell('ghost', 'md').node.fg).toBe(chrome.light.textPrimary);
    // the label part carries ONLY typography — no colour patch, no own fg.
    const label = flattenPart(buttonDescriptor, theme, 'label', { size: 'md' }, {});
    expect(label.style).toEqual({});
    expect(label.node.fg).toBeUndefined();
  });

  test('label type tracks size — orthogonal {size, emphasis} (decision 55 · de-fused 77)', () => {
    const type = (s: string) => flattenPart(buttonDescriptor, theme, 'label', { size: s }, {}).node.type;
    // The fused `smEm`/`mdEm` is gone — each value is the two orthogonal inputs.
    // Button is emphasis across all sizes; lg reuses md's step (decision 41/55).
    expect(type('sm')).toEqual({ size: 'sm', emphasis: true });
    expect(type('md')).toEqual({ size: 'md', emphasis: true });
    expect(type('lg')).toEqual({ size: 'md', emphasis: true });
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

describe('IconAvatar — same resolver, static, the subtle role (via flattenPart)', () => {
  const theme = buildNuriTheme('lilac', 'light');
  const root = (variant: string) => flattenPart(iconAvatarDescriptor, theme, 'root', { variant }, {});

  test('fixed-circle base (box width/height/radius:full · invariant)', () => {
    const style = root('soft').style as Record<string, unknown>;
    expect(style.alignItems).toBe('center');
    expect(style.justifyContent).toBe('center');
    expect(style.width).toBe(size.lg);
    expect(style.height).toBe(size.lg);
    expect(style.borderRadius).toBe(radius.full);
  });

  test('variant fills (solid/soft/ghost) + the FG-ONLY subtle finding', () => {
    expect(root('solid').style.backgroundColor).toBe(acc('lilac', 'solid', 'light'));
    expect(root('soft').style.backgroundColor).toBe(chrome.light.bgStrong);
    expect(root('ghost').style.backgroundColor).toBe('transparent');
    // subtle contributes NO background patch (fg-only) — its fg comes by scope.
    expect(root('subtle').style.backgroundColor).toBeUndefined();
    expect(root('subtle').node.fg).toBe(chrome.light.borderStrong);
  });

  test('static — no interactive transients (pressed cell === resting geometry + colour)', () => {
    expect(root('soft').node.interactive).toBeUndefined();
    expect(flattenPart(iconAvatarDescriptor, theme, 'root', { variant: 'soft' }, { pressed: true }).style)
      .toEqual(root('soft').style);
  });

  test('icon part is a glyph leaf sized through the box axis', () => {
    const icon = flattenPart(iconAvatarDescriptor, theme, 'icon', {}, {});
    expect(icon.style).toEqual({ width: size.sm, height: size.sm });
  });
});

describe('Topbar — same resolver, the COMPOUND slot regions (true centring · via flattenPart)', () => {
  const theme = buildNuriTheme('lilac', 'light');
  const part = (p: string) => flattenPart(topbarDescriptor, theme, p as Part, {}, {});

  test('open root base = row chrome surface (stack + box + palette.chrome)', () => {
    const root = part('root');
    expect(root.style).toEqual({
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.sm,
      height: size.xl,
      paddingStart: space.lg,
      paddingEnd: space.lg,
      backgroundColor: chrome.light.bgCanvas,
    });
    // chrome fg is invariant (base), delivered by scope.
    expect(root.node.fg).toBe(chrome.light.textPrimary);
  });

  test('leading edge = stack fill even (flex 1 1 0 + min-width 0 · the equal-share edge)', () => {
    expect(part('leading').style).toEqual({
      flexDirection: 'row',
      alignItems: 'center',
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 0,
      minWidth: 0,
    });
  });

  test('trailing edge = the same even share, content end-justified', () => {
    expect(part('trailing').style).toEqual({
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 0,
      minWidth: 0,
    });
  });

  test('center is NATURAL (flex:none · no fill) so it lands dead-centre between the even edges', () => {
    const center = part('center').style as { flexGrow?: number };
    expect(center).toEqual({ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' });
    expect(center.flexGrow).toBeUndefined();
  });
});

describe('genericity + the resolved geometry (three descriptors, ONE resolver)', () => {
  test('anatomy shapes', () => {
    expect(resolveAnatomy(buttonDescriptor)).toMatchObject({ name: 'root', el: 'view', open: false });
    expect(resolveAnatomy(iconAvatarDescriptor).children[0]).toMatchObject({ name: 'icon', el: 'icon' });
    expect(resolveAnatomy(topbarDescriptor)).toMatchObject({ name: 'root', open: true });
  });

  // box `aspectRatio` (the box-aspect-ratio slice) — the RN render-path proof for the
  // `ratio`-scale field. A minimal ad-hoc descriptor carries box{aspectRatio:'card'}
  // on root; flattenPart resolves it through SCALES.ratio → the RN ViewStyle. ⚠ THE
  // NAMED RISK: the value must be the BARE number 1.586 (ratio.card), NOT a '1.586px'
  // string — RN/Yoga aspectRatio is unitless. typeof-number asserted.
  test('box aspectRatio — resolves to { aspectRatio: ratio.card } as a bare number (no px · the named risk)', () => {
    const theme = buildNuriTheme('neutral', 'light');
    const ratioBox: Descriptor<Record<string, never>> = {
      structure: { anatomy: { el: 'view' }, base: { root: { box: { aspectRatio: 'card' } } } },
      // `api` REQUIRED (Path C · Phase 1) · factory-ignored · minimal for typecheck.
      api: { axes: [], slots: {} },
    };
    const style = flattenPart(ratioBox, theme, 'root', {}, {}).style;
    expect(style).toEqual({ aspectRatio: ratio.card });
    expect(style.aspectRatio).toBe(1.586);
    expect(typeof style.aspectRatio).toBe('number'); // unitless · not '1.586px'
  });

  test('flattenPart concrete cell — Button solid/md pressed (the render path anchor)', () => {
    const theme = buildNuriTheme('lilac', 'light');
    const pressed = flattenPart(buttonDescriptor, theme, 'root', { variant: 'solid', size: 'md' }, { pressed: true }).style;
    expect(pressed).toEqual({
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: size.lg,
      paddingHorizontal: space.lg,
      borderRadius: radius.full,
      backgroundColor: acc('lilac', 'solidPressed', 'light'),
      transform: [{ scale: interactionTokens.pressScale }],
    });
  });
});
