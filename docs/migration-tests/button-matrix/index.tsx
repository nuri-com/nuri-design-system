/* ──────────────────────────────────────────────────────────────
 * PLAYGROUND · BUTTON MATRIX · RN HAND-TRANSLATION
 *
 * Pairs with index.html — the web side. This file is what the
 * thesis ("agent-composed web prototype → mechanical RN translation")
 * is actually being tested against. Hand-rolled in one pass; the
 * gaps observed went into FRICTIONS.md and ultimately RISKS.md R1
 * + R5.
 *
 * Verification contract: this file typechecks under
 *   tsc --noEmit --jsx react-native --types react-native,react
 * No bundler, no Expo runtime, no rendering — the static contract
 * IS the deliverable per the N+4 prompt.
 *
 * Cross-product preserved 1:1 from the HTML:
 *   Row A · default — page accent (lilac) inherited from context
 *   Row B · accent prop on the leaf (Tier 2 self-scope)
 *   Row C · AccentProvider wrapping the row (Tier 3 subtree-scope)
 *   Row D · disabled state
 *
 * Mechanism deltas vs the HTML version are documented in
 * FRICTIONS.md (search by ID — F-LAYOUT-1 retired in N+6.2, plus
 * F-SCOPE-1, F-PRESSED-1, F-FOCUS-1, F-TOKEN-1, F-FONT-1,
 * F-DISABLED-1).
 *
 * NOTE · this is first-draft RN, intentionally unpolished. The
 * point is to see how mechanical the translation actually is;
 * smoothing over the gaps with hand-rolled infrastructure would
 * mask the very finding N+4 is here to capture.
 *
 * N+6.2 (decision 37 · layout primitives) replaces the
 * hand-rolled F-LAYOUT-1 styles (`canvas`, `rowGroup`, `row`)
 * with `<Stack>` + `<Box>` local RN components defined below.
 * The RN spec home for layout primitives stays in this migration
 * pair pending an Open question in roadmap/index.md — peer file
 * `lib/components/<name>/<name>.tsx`? Separate `lib/spec/`
 * namespace? Decide post-N+6.2 when n≥2 RN-component specs exist.
 * ────────────────────────────────────────────────────────────── */

import * as React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StyleProp,
  ViewStyle,
} from 'react-native';

import {
  accent as accentTokens,
  chrome,
  space,
  size,
  radius,
  type as typeScale,
  TypeSize,
  Accent,
  Theme,
} from '../../../build/tokens';
import { button } from '../../../build/components/button';
import { switchTokens } from '../../../build/components/switch';
import { tabs as tabsTokens } from '../../../build/components/tabs';
import { tabBar as tabBarTokens } from '../../../build/components/tab-bar';
import { list as listTokens } from '../../../build/components/list';
import { listItem } from '../../../build/components/list-item';
import { listInteractiveItem } from '../../../build/components/list-interactive-item';
import type { TokenPath } from '../../../build/token-paths';
import { icons, IconName, IconWeight } from '../../../build/icons';
import { SvgXml } from 'react-native-svg';

// ── resolveToken · consumer-side dereference helper (decision 34) ─
// SKETCH · ~10 lines. The per-component file emits `button.solidBg`
// as the literal string `'accent.solid' as const satisfies TokenPath`;
// the consumer turns that path into a concrete value at render time
// by looking it up in the current (accent × theme) slice of the
// runtime tokens. Production consumers (Unistyles, custom Context)
// ship their own implementation; the sketch lives in the migration-
// test pair as reference, NOT in `build/` or `lib/`.
//
// N+6.1 (decision 36) added semantic spacing + sizing as cascade-
// invariant runtime sets — the dereference returns `string` for
// colour leaves (chrome / accent) and `number` for dimension leaves
// (space / size). The return type widens to `string | number` so
// the inline render-time consumer can pass the value straight into
// either a `backgroundColor` (string) or a `minHeight` (number) slot.
//
// N+6.1.1 (amendment 36.1) added semantic radius as the third
// cascade-invariant dimension namespace; it's the first runtime set
// with mixed-literal leaves (sm/md/lg = number, full = string for
// the pill/circular `100%` literal). The same `string | number`
// resolver return covers all three — `borderRadius` accepts both.
type RuntimeTokens = {
  chrome: typeof chrome.light;
  accent: typeof accentTokens.lilac.light;
  space:  typeof space;
  size:   typeof size;
  radius: typeof radius;
};
function resolveToken(tokens: RuntimeTokens, path: TokenPath): string | number {
  const [group, leaf] = path.split('.') as [keyof RuntimeTokens, string];
  return (tokens[group] as Record<string, string | number>)[leaf];
}

// ══════════════════════════════════════════════════════════════════
// LAYOUT PRIMITIVES · Stack + Box · N+6.2 · decision 37
// ──────────────────────────────────────────────────────────────────
// RN-side spec for the web <nuri-stack> + <nuri-box> custom
// elements (lib/components/stack/, lib/components/box/). Operator-
// locked API:
//
//   Stack:
//     direction?: 'column' | 'row'                          default 'column'
//     gap?:       'xs' | 'sm' | 'md' | 'lg' | 'xl'          subset of space
//     align?:     'start' | 'center' | 'end' | 'stretch' | 'baseline'
//     justify?:   'start' | 'center' | 'end' | 'between' | 'around'
//     wrap?:      boolean
//
//   Box:
//     padding?  / paddingX? / paddingY?:                    'xs' | 'sm' | 'md' | 'lg' | 'xl'
//     paddingStart? / paddingEnd?:                          'xs' | 'sm' | 'md' | 'lg' | 'xl'
//     paddingTop? / paddingBottom?:                         'xs' | 'sm' | 'md' | 'lg' | 'xl'
//     center?:    boolean
//
// No `as` prop on RN — `as` was a web concern for host element
// resolution. On RN, both Stack and Box render <View>.
//
// The `gap`/`padding*` props read against the runtime `space` set
// imported from build/tokens.ts; the 5-leaf subset matches what
// the prop accepts on the web side. No component-token aliasing
// (decision 37) — the dispatch happens at the call site by reading
// `space[gap]` directly.
// ══════════════════════════════════════════════════════════════════

type SpaceLeaf = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

type StackProps = {
  direction?: 'column' | 'row';
  gap?: SpaceLeaf;
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  wrap?: boolean;
  // fill (decision 60) → grow to fill the flex parent's main axis. RN's
  // flexBasis defaults to 'auto' and flexShrink to 0, so { flexGrow: 1,
  // flexShrink: 0 } reproduces the web `flex: 1 0 auto` (fill when short,
  // keep content height when tall so a Scroll scrolls instead of clipping).
  fill?: boolean;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

const ALIGN_MAP: Record<NonNullable<StackProps['align']>, ViewStyle['alignItems']> = {
  start:    'flex-start',
  center:   'center',
  end:      'flex-end',
  stretch:  'stretch',
  baseline: 'baseline',
};

const JUSTIFY_MAP: Record<NonNullable<StackProps['justify']>, ViewStyle['justifyContent']> = {
  start:   'flex-start',
  center:  'center',
  end:     'flex-end',
  between: 'space-between',
  around:  'space-around',
};

const Stack: React.FC<StackProps> = ({
  direction = 'column',
  gap,
  align,
  justify,
  wrap,
  fill,
  children,
  style,
}) => {
  const layout: ViewStyle = {
    flexDirection: direction,
    ...(gap ? { gap: space[gap] } : null),
    ...(align ? { alignItems: ALIGN_MAP[align] } : null),
    ...(justify ? { justifyContent: JUSTIFY_MAP[justify] } : null),
    ...(wrap ? { flexWrap: 'wrap' } : null),
    ...(fill ? { flexGrow: 1, flexShrink: 0 } : null),
  };
  return <View style={[layout, style]}>{children}</View>;
};

type BoxProps = {
  padding?: SpaceLeaf;
  paddingX?: SpaceLeaf;
  paddingY?: SpaceLeaf;
  paddingStart?: SpaceLeaf;
  paddingEnd?: SpaceLeaf;
  paddingTop?: SpaceLeaf;
  paddingBottom?: SpaceLeaf;
  center?: boolean;
  // fill (decision 60) → grow to fill the flex parent (e.g. a Scroll body),
  // so a filling child + a Spacer can push trailing content to the bottom.
  // An RN <View> is already a flex column (flexDirection defaults 'column'),
  // so unlike the web Box (display:block → must switch to flex) this only
  // needs the grow part. { flexGrow: 1, flexShrink: 0 } == web `flex: 1 0 auto`.
  fill?: boolean;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

const Box: React.FC<BoxProps> = ({
  padding,
  paddingX,
  paddingY,
  paddingStart,
  paddingEnd,
  paddingTop,
  paddingBottom,
  center,
  fill,
  children,
  style,
}) => {
  // Edge-specific wins over axis wins over uniform — same precedence
  // the CSS encodes in its selector ordering.
  const layout: ViewStyle = {
    ...(padding ? { padding: space[padding] } : null),
    ...(paddingX ? { paddingHorizontal: space[paddingX] } : null),
    ...(paddingY ? { paddingVertical: space[paddingY] } : null),
    ...(paddingStart  ? { paddingStart:  space[paddingStart]  } : null),
    ...(paddingEnd    ? { paddingEnd:    space[paddingEnd]    } : null),
    ...(paddingTop    ? { paddingTop:    space[paddingTop]    } : null),
    ...(paddingBottom ? { paddingBottom: space[paddingBottom] } : null),
    ...(center ? { marginHorizontal: 'auto' as const } : null),
    ...(fill ? { flexGrow: 1, flexShrink: 0 } : null),
  };
  return <View style={[layout, style]}>{children}</View>;
};

// ══════════════════════════════════════════════════════════════════
// SCREEN + SCROLL + SPACER · the per-screen layout scaffold · decision 58 / 59 / 61
// ──────────────────────────────────────────────────────────────────
// RN-side spec for <nuri-screen> / <nuri-scroll> / <nuri-spacer>.
//
//   Screen — the full-height column. A <View style={{ flex: 1 }}> (later
//     the themed SafeAreaProvider root). It is NOT the navigator: the
//     bottom TabBar is a SIBLING, and safe-area is owned upstream by the
//     navigator (React Navigation), so Screen stays inset-agnostic.
//
//   Scroll — the growing, scrolling body. A <ScrollView style={{ flex:1 }}>.
//     Scrolling is a COMPONENT in RN, not a View style — which is exactly
//     why it is its own primitive and `overflow` is never a Box prop (R1).
//     Padding for the content goes on a <Box fill> CHILD, which is the
//     `contentContainerStyle` analogue (Box fill == { flexGrow: 1 }).
//
//   Spacer — a flexible gap. Grow (no size) → flex: grow (a positive RN
//     `flex` IS proportional flexGrow · decision 61, so the `grow` prop maps
//     1:1). Fixed (size) → a definite width (row) / height (column) from the
//     space set. No `as`/`direction`-for-grow concern: grow follows the
//     parent's main axis; `direction` only picks which dimension a fixed
//     size fills. (`grow` was renamed from `weight` 2026-06-01 · the web
//     `weight` collided with font-weight.)
// ══════════════════════════════════════════════════════════════════

type ScreenProps = { children?: React.ReactNode; style?: StyleProp<ViewStyle> };
const Screen: React.FC<ScreenProps> = ({ children, style }) => (
  <View style={[{ flex: 1 }, style]}>{children}</View>
);

type ScrollProps = { children?: React.ReactNode; style?: StyleProp<ViewStyle> };
const Scroll: React.FC<ScrollProps> = ({ children, style }) => (
  // Thin ScrollView · flex:1 fills the slack between the Screen's pinned
  // chrome. Padding lives on a <Box fill> child (the contentContainerStyle
  // analogue), never here — so the Scroll box itself stays padding-free.
  <ScrollView style={[{ flex: 1 }, style]}>{children}</ScrollView>
);

type SpacerProps = {
  direction?: 'row' | 'column';
  size?: SpaceLeaf;
  grow?: 1 | 2 | 3 | 4;
};
const Spacer: React.FC<SpacerProps> = ({ direction = 'row', size, grow = 1 }) => {
  // Fixed (size) → a definite extent on the chosen axis, no grow.
  // Grow (no size) → flex: grow (proportional flexGrow · decision 61).
  const style: ViewStyle = size
    ? (direction === 'column' ? { height: space[size] } : { width: space[size] })
    : { flex: grow };
  return <View style={style} />;
};

// ══════════════════════════════════════════════════════════════════
// THEME + ACCENT CONTEXTS · RN analogues of Nuri's web cascade
// ──────────────────────────────────────────────────────────────────
// Web side uses <html data-theme> + <html data-accent>, with nested
// scopes via <nuri-scope> / per-element data-accent. RN has no
// cascade — we model the same two dimensions as React Context.
// One provider per dimension; per AGENTS.md mapping table:
//   data-accent page-level / <nuri-scope accent=...>  →  AccentProvider
//   data-theme  page-level / <nuri-scope mode=...>    →  ThemeProvider
//
// Default values mirror the web defaults: theme 'light', accent 'lilac'.
// ══════════════════════════════════════════════════════════════════
const AccentContext = React.createContext<Accent>('lilac');
const ThemeContext = React.createContext<Theme>('light');

// Tier 3 subtree-scope analogue — same shape as the web
// <nuri-scope accent="...">; nest providers for multi-dimension
// scope (the web does it on one element, RN needs one per dim —
// see FRICTIONS.md F-SCOPE-1).
const AccentProvider: React.FC<{ value: Accent; children: React.ReactNode }> = ({
  value,
  children,
}) => <AccentContext.Provider value={value}>{children}</AccentContext.Provider>;

// ══════════════════════════════════════════════════════════════════
// BUTTON · the RN side of <nuri-button>
// ──────────────────────────────────────────────────────────────────
// API contract mirrors button.js (the web custom-element):
//   variant?: 'solid' | 'soft'         default 'soft'
//   accent?:  'lilac'  | 'neutral'     overrides ambient context
//   disabled?: boolean
//   onPress?: () => void
//   children: string (label only — no slot for icons; Button is text-only today)
//
// Behavioural deltas the web side hides (see FRICTIONS.md):
//   - Pressed state · web fires :active automatically via CSS; here
//     Pressable's `pressed` render-prop drives the variant swap
//     manually. The transform + bg swap happen via inline style.
//   - No focus ring · RN has no DOM focus model; the web's
//     `:focus-visible` outline doesn't translate. Accessibility
//     props compensate; the visual ring is web-only.
//   - No cursor · disabled buttons can't show `not-allowed` cursor;
//     opacity + accessibilityState carry the affordance.
// ══════════════════════════════════════════════════════════════════
type ButtonProps = {
  variant?: 'solid' | 'soft';
  accent?: Accent;
  disabled?: boolean;
  onPress?: () => void;
  children: string;
};

const Button: React.FC<ButtonProps> = ({
  variant = 'soft',
  accent: accentProp,
  disabled,
  onPress,
  children,
}) => {
  // Tier 2 self-scope · `accent` prop wins over ambient context.
  // Mirrors button.js #sync: if prop set, mirror to data-accent on
  // the inner button; if absent, inherit. Here we read context as
  // the inherit path.
  const ambientAccent = React.useContext(AccentContext);
  const accent: Accent = accentProp ?? ambientAccent;

  const theme = React.useContext(ThemeContext);

  // N+6.1 consumer-side static-vs-dynamic split (decision 36 ·
  // amendment 36.1 · N+6.1.1): `minHeight` + `paddingHorizontal` +
  // `borderRadius` all reference runtime sets (size / space /
  // radius), so their values aren't known at module load and can't
  // live in StyleSheet.create. Resolve at render time through
  // resolveToken against the live `tokens` slice (which for these
  // three leaves doesn't actually need theme/accent — space + size
  // + radius are cascade-invariant today — but the dereference
  // contract stays uniform across every TokenPath leaf). Production
  // consumers (Unistyles, custom Context) handle the split more
  // elegantly; the migration-test makes the consumer cost honest.
  //
  // borderRadius accepts `number | string`; resolveToken returns
  // `string | number` to cover both colour leaves (chrome / accent ·
  // string) and dimension leaves (space / size / radius · number
  // today · post-N+6.1.1-polish radius.full = 9999 is also number
  // after px-strip in the per-component emitter). The widening
  // stays in place for future cascade-invariant vocabularies that
  // may ship genuine mixed-literal leaves (e.g. a duration scale
  // with `instant: 0` + `infinite: 'forever'`).
  const tokens: RuntimeTokens = {
    chrome: chrome[theme],
    accent: accentTokens[accent][theme],
    space,
    size,
    radius,
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        styles.base,
        {
          minHeight:         resolveToken(tokens, button.mdMinHeight) as number,
          paddingHorizontal: resolveToken(tokens, button.mdPaddingX)  as number,
          borderRadius:      resolveToken(tokens, button.mdRadius)    as number,
        },
        variantStyle(variant, accent, theme, pressed),
        pressed && !disabled && { transform: [{ scale: button.pressScale }] },
        disabled && { opacity: button.disabledOpacity },
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: labelColor(variant, accent, theme) },
        ]}
      >
        {children}
      </Text>
    </Pressable>
  );
};

// ── Variant + accent + pressed → background colour ────────────────
// Web equivalent: button.css `.nuri-button--{variant}` + `:active`
// override. Here we compute the literal each render. Faster than
// computing a memoised StyleSheet because tier+accent+pressed
// combinatorics blow up the cache (3 tiers × 2 accents × 2 variants
// × 2 pressed = 24 entries); inline saves the bookkeeping.
//
// TokenPath consumption (decision 34 · N+6.0.3): `button.solidBg`
// etc. emit as the literal string `'accent.solid' as const satisfies
// TokenPath`; resolveToken dereferences against the live (accent ×
// theme) slice of the runtime tokens.
function variantStyle(
  variant: 'solid' | 'soft',
  accent: Accent,
  theme: Theme,
  pressed: boolean,
): StyleProp<ViewStyle> {
  const tokens: RuntimeTokens = {
    chrome: chrome[theme], accent: accentTokens[accent][theme], space, size, radius,
  };
  if (variant === 'solid') {
    return {
      backgroundColor: resolveToken(tokens, pressed ? button.solidBgPressed : button.solidBg) as string,
    };
  }
  // soft · chrome-only, accent-invariant (P7)
  return {
    backgroundColor: resolveToken(tokens, pressed ? button.softBgPressed : button.softBg) as string,
  };
}

function labelColor(variant: 'solid' | 'soft', accent: Accent, theme: Theme): string {
  const tokens: RuntimeTokens = {
    chrome: chrome[theme], accent: accentTokens[accent][theme], space, size, radius,
  };
  return resolveToken(tokens, variant === 'solid' ? button.solidFg : button.softFg) as string;
}

// ══════════════════════════════════════════════════════════════════
// ICON · the RN side of <nuri-icon> · N+6.3 spec · N+6.8 renderer
// ──────────────────────────────────────────────────────────────────
// API contract mirrors icon.js (the web custom-element · decision 38):
//   name:   IconName  (registry key · the typed union from build/icons)
//   size?:  'md' | 'sm'                         default 'md'
//   fill?:  boolean                             presence forces fill weight
//   color?: string    (currentColor analogue · defaults to ambient text)
//
// ONE registry, TWO readers (decision 48): the web inlines icons.js
// directly; this RN side dereferences the SAME path strings — emitted
// once as the typed build/icons.ts — through react-native-svg's
// SvgXml. NOT SVGR, NOT per-glyph <Path> codegen (that would fork the
// glyph source · breaks the single-registry invariant decision 38
// rests on).
//
// Weight coupling is identical to the web (decision 38) — NOT a prop:
//   md  + no fill → regular
//   sm  + no fill → bold
//   any + fill    → fill
//
// Box dimensions mirror icon.css (the semantic size subset · decision
// 38): md → size.sm (28px) · sm → size.xs (18px). currentColor maps to
// the `color` prop; default is the ambient text colour (chrome
// text-primary), the RN analogue of the web's `currentColor` inherit.
// ══════════════════════════════════════════════════════════════════
type IconProps = {
  name: IconName;
  size?: 'md' | 'sm';
  fill?: boolean;
  color?: string;
};

// md → size.sm (28px) · sm → size.xs (18px) — the icon.css box subset.
const ICON_DIMENSION: Record<NonNullable<IconProps['size']>, number> = {
  md: size.sm,
  sm: size.xs,
};

const Icon: React.FC<IconProps> = ({ name, size: iconSize = 'md', fill, color }) => {
  const theme = React.useContext(ThemeContext);
  // Weight coupling (decision 38) · identical to icon.js #render.
  const weight: IconWeight = fill ? 'fill' : iconSize === 'sm' ? 'bold' : 'regular';
  // Re-wrap the registry path in the phosphor viewBox grid — the same
  // <svg> shell icon.js builds — and feed it to SvgXml. fill=currentColor
  // resolves to the `color` prop (SvgXml's currentColor channel).
  const xml =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" ` +
    `fill="currentColor">${icons[name][weight]}</svg>`;
  const dimension = ICON_DIMENSION[iconSize];
  return (
    <SvgXml
      xml={xml}
      width={dimension}
      height={dimension}
      color={color ?? chrome[theme].textPrimary}
    />
  );
};

// ══════════════════════════════════════════════════════════════════
// ICON-BUTTON · the RN side of <nuri-icon-button> · N+6.4
// ──────────────────────────────────────────────────────────────────
// API contract mirrors icon-button.js (the web custom-element):
//   name:      IconName  (registry key · the typed union from build/icons · N+6.8)
//   variant?:  'solid' | 'soft' | 'ghost'   default 'soft' (decision 39 adds ghost)
//   accent?:   Accent                       overrides ambient context
//   disabled?: boolean
//   label?:    string  (explicit a11y name; else derived from `name` · F-ARIA-LABEL-1)
//   onPress?:  () => void
//   — NO `size` prop · single-size-locked md=48px (decision 40)
//   — NO text children · icon-only
//
// ✓ F-ICON-RN-1 CLOSED · N+6.8 (decision 48)
// ──────────────────────────────────────────────────────────────────
// The Icon RN renderer landed this session: the `Icon` component above
// dereferences the shared registry (build/icons.ts) through SvgXml.
// IconButton now COMPOSES Icon — the RN analogue of the web funnel
// where <nuri-icon-button> wraps a <nuri-icon> (decision 38 · 40). The
// glyph slot is a real `<Icon>`, no longer an honest-placeholder
// `<View>`. `name` is the typed IconName union (a bad key is now a
// compile error, not a runtime warn); `fill` is live, routing the
// filled glyph weight through Icon (amendment 40.1).
// ══════════════════════════════════════════════════════════════════
type IconButtonProps = {
  name: IconName;
  variant?: 'solid' | 'soft' | 'ghost';
  accent?: Accent;
  disabled?: boolean;
  label?: string;
  onPress?: () => void;
  // N+6.6 · decision 40.1 amendment · selects the filled glyph weight.
  // Live (N+6.8): passed straight to the composed Icon to pick the fill
  // weight; the prop surface stays 1:1 with the web side.
  fill?: boolean;
};

// Ghost extends the variant→bg map with a chrome-only, accent-invariant
// transparent rest state (decision 39). `ghostBg` emits as the literal
// string 'transparent' (NOT a TokenPath), so it bypasses resolveToken.
function iconButtonBg(
  variant: NonNullable<IconButtonProps['variant']>,
  accent: Accent,
  theme: Theme,
  pressed: boolean,
): string {
  const tokens: RuntimeTokens = {
    chrome: chrome[theme], accent: accentTokens[accent][theme], space, size, radius,
  };
  if (variant === 'ghost') {
    // rest = transparent literal; pressed = chrome subtle wash.
    return pressed ? (resolveToken(tokens, button.ghostBgPressed) as string) : button.ghostBg;
  }
  if (variant === 'solid') {
    return resolveToken(tokens, pressed ? button.solidBgPressed : button.solidBg) as string;
  }
  return resolveToken(tokens, pressed ? button.softBgPressed : button.softBg) as string;
}

// Glyph colour per variant — the foreground twin of iconButtonBg, reusing
// the button.*Fg tokens (the same funnel the web .nuri-icon-button shares
// with .nuri-button · decision 39/40). solid → accent.onSolid; soft/ghost
// → chrome.textPrimary. Fed to Icon's `color` (its currentColor channel).
function iconButtonFg(
  variant: NonNullable<IconButtonProps['variant']>,
  accent: Accent,
  theme: Theme,
): string {
  const tokens: RuntimeTokens = {
    chrome: chrome[theme], accent: accentTokens[accent][theme], space, size, radius,
  };
  if (variant === 'solid') return resolveToken(tokens, button.solidFg) as string;
  if (variant === 'ghost') return resolveToken(tokens, button.ghostFg) as string;
  return resolveToken(tokens, button.softFg) as string;
}

const IconButton: React.FC<IconButtonProps> = ({
  name,
  variant = 'soft',
  accent: accentProp,
  disabled,
  label,
  onPress,
  // N+6.6 · amendment 40.1 · live as of N+6.8 (decision 48): routed to
  // the composed Icon below to select the filled glyph weight, 1:1 with
  // the web side.
  fill,
}) => {
  const ambientAccent = React.useContext(AccentContext);
  const accent: Accent = accentProp ?? ambientAccent;
  const theme = React.useContext(ThemeContext);

  // Single-size-locked md (decision 40): the circular hit area is the
  // md size token; radius.full makes it a circle.
  const dimension = size.lg; // md icon-button = 48px (size.lg primitive)

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      // F-ARIA-LABEL-1 · icon-only ⇒ an accessible name is REQUIRED.
      // Explicit `label` wins; else derive from the kebab `name`.
      accessibilityLabel={label ?? name.replace(/-/g, ' ')}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        {
          width:           dimension,
          height:          dimension,
          borderRadius:    radius.full, // circular · radius.full (9999) · matches the web .nuri-icon-button border-radius
          alignItems:      'center',
          justifyContent:  'center',
          backgroundColor: iconButtonBg(variant, accent, theme, pressed),
        },
        pressed && !disabled && { transform: [{ scale: button.pressScale }] },
        disabled && { opacity: button.disabledOpacity },
      ]}
    >
      {/* F-ICON-RN-1 CLOSED · N+6.8 (decision 48) · the glyph is a real
          Icon dereferencing the shared registry. md-locked (decision 40),
          so Icon's default md → regular weight; `fill` picks the filled
          weight. color = the per-variant foreground token. */}
      <Icon name={name} fill={fill} color={iconButtonFg(variant, accent, theme)} />
    </Pressable>
  );
};

// ══════════════════════════════════════════════════════════════════
// SWITCH · the RN side of <nuri-switch> · N+6.5 · decision 44
// ──────────────────────────────────────────────────────────────────
// API contract mirrors switch.js (the web custom-element):
//   checked?:  boolean                      default false
//   accent?:   Accent                       overrides ambient context
//   disabled?: boolean
//   onChange?: (checked: boolean) => void
//   — NO `size` prop · single-size-locked (60×36 · decision 44)
//
// Unlike IconButton, Switch has NO blocked dependency (no Icon
// renderer needed), so this is a COMPLETE RN translation, not a
// stub. It consumes the generated switchTokens end-to-end — the
// geometry leaves (trackWidth/Height, knobSize, inset) resolve to
// `number`, the colour leaves (trackOffBg/OnBg, knobBg) resolve to
// `string` via the same resolveToken contract Button uses. The knob
// travel is the one derived value the web keeps as a CSS calc()
// (out of the emitted token surface); here it's the same arithmetic
// computed inline.
//
// Behavioural deltas vs the web (see FRICTIONS.md):
//   - Track flip · web swaps bg via [aria-checked] CSS; here the
//     `checked` prop drives the inline backgroundColor + the knob's
//     translateX. No CSS transition — RN would need Animated; the
//     migration draft omits motion (the web's transition is a
//     progressive enhancement the contract doesn't require).
//   - Press squash · web fires :active on the track; here Pressable's
//     `pressed` render-prop scales the knob manually.
// ══════════════════════════════════════════════════════════════════
type SwitchProps = {
  checked?: boolean;
  accent?: Accent;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
};

const Switch: React.FC<SwitchProps> = ({
  checked = false,
  accent: accentProp,
  disabled,
  onChange,
}) => {
  const ambientAccent = React.useContext(AccentContext);
  const accent: Accent = accentProp ?? ambientAccent;
  const theme = React.useContext(ThemeContext);

  const tokens: RuntimeTokens = {
    chrome: chrome[theme],
    accent: accentTokens[accent][theme],
    space,
    size,
    radius,
  };

  // Geometry leaves resolve to numbers; travel = track − knob − 2·inset
  // (the derived value the web keeps as a CSS calc, off the token surface).
  const trackWidth  = resolveToken(tokens, switchTokens.trackWidth) as number;
  const trackHeight = resolveToken(tokens, switchTokens.trackHeight) as number;
  const knobSize    = resolveToken(tokens, switchTokens.knobSize) as number;
  const inset       = resolveToken(tokens, switchTokens.inset) as number;
  const travel      = trackWidth - knobSize - 2 * inset;

  const trackColor = checked
    ? (resolveToken(tokens, switchTokens.trackOnBg) as string)
    : (resolveToken(tokens, switchTokens.trackOffBg) as string);
  const knobColor = resolveToken(tokens, switchTokens.knobBg) as string;

  return (
    <Pressable
      onPress={() => onChange?.(!checked)}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked: !!checked, disabled: !!disabled }}
      style={({ pressed }) => [
        {
          width:           trackWidth,
          height:          trackHeight,
          borderRadius:    radius.full,
          padding:         inset,
          justifyContent:  'center',
          backgroundColor: trackColor,
        },
        disabled && { opacity: switchTokens.disabledOpacity },
        pressed && !disabled && null,
      ]}
    >
      {({ pressed }) => (
        <View
          style={[
            {
              width:           knobSize,
              height:          knobSize,
              borderRadius:    radius.full,
              backgroundColor: knobColor,
              transform: [
                { translateX: checked ? travel : 0 },
                ...(pressed && !disabled ? [{ scale: switchTokens.knobPressScale }] : []),
              ],
            },
          ]}
        />
      )}
    </Pressable>
  );
};

// ══════════════════════════════════════════════════════════════════
// TABS · the RN side of <nuri-tabs> + <nuri-tab> · N+6.5 · decision 43
// ──────────────────────────────────────────────────────────────────
// API contract mirrors tabs.js (the compound web custom-elements):
//   Tabs:
//     value:     string                      controlled selected value
//     onChange?: (value: string) => void
//     children:  Tab elements
//   Tab:
//     value:     string
//     children:  string (label)
//
// COMPLETE translation, not a stub. The container surface is the RN
// Box (background + radius + padding — the same composition the web
// <nuri-tabs> does, decision 42 evidence). The inter-tab gap reads
// the generated tabsTokens.gap (a `space.2xs` TokenPath → number).
//
// The per-OPTION shape tokens (--nuri-tab-*) are web-CSS-only by
// design (the emitter only reads the exact `--nuri-tabs-` prefix), so
// the RN Tab reads the SAME semantic vocabulary directly: size.md
// (min height), space.md (padding-x), radius.sm (corners), text.muted
// (rest fg), accent.solid / accent.on-solid (active fill/fg). This
// mirrors the CSS file's "RN renders its option shape from the same
// semantic vocabulary on its own side" note.
//
// Selection state lives in Tabs (mirrors the web controller owning
// `value`); Tab is presentational, told its active state by the
// parent — passed here via React.cloneElement (RN's analogue of the
// web controller toggling the `active` attribute).
//
// Roving arrow-key navigation is deferred on both sides
// (F-KEYBOARD-NAV-1).
// ══════════════════════════════════════════════════════════════════
type TabProps = {
  value: string;
  children: string;
  // Injected by Tabs (not author-set): the controller's selection +
  // change pipe. Optional so a bare <Tab> still typechecks.
  active?: boolean;
  onSelect?: (value: string) => void;
};

const Tab: React.FC<TabProps> = ({ value, children, active, onSelect }) => {
  const theme = React.useContext(ThemeContext);
  const accent = React.useContext(AccentContext);
  const tokens: RuntimeTokens = {
    chrome: chrome[theme], accent: accentTokens[accent][theme], space, size, radius,
  };

  const restFg   = resolveToken(tokens, 'chrome.textMuted' as const satisfies TokenPath) as string;
  const activeBg = resolveToken(tokens, 'accent.solid' as const satisfies TokenPath) as string;
  const activeFg = resolveToken(tokens, 'accent.onSolid' as const satisfies TokenPath) as string;

  return (
    <Pressable
      onPress={() => onSelect?.(value)}
      accessibilityRole="tab"
      accessibilityState={{ selected: !!active }}
      style={({ pressed }) => [
        {
          flex:            1,
          minHeight:       size.md,
          paddingHorizontal: space.md,
          borderRadius:    radius.sm,
          alignItems:      'center',
          justifyContent:  'center',
          backgroundColor: active ? activeBg : 'transparent',
        },
        pressed && { transform: [{ scale: 0.97 }] },
      ]}
    >
      <Text
        style={{
          ...typeStyle('smEm'),
          color: active ? activeFg : restFg,
        }}
      >
        {children}
      </Text>
    </Pressable>
  );
};

type TabsProps = {
  value: string;
  onChange?: (value: string) => void;
  children: React.ReactElement<TabProps> | React.ReactElement<TabProps>[];
};

const Tabs: React.FC<TabsProps> = ({ value, onChange, children }) => {
  const theme = React.useContext(ThemeContext);
  const accent = React.useContext(AccentContext);
  const tokens: RuntimeTokens = {
    chrome: chrome[theme], accent: accentTokens[accent][theme], space, size, radius,
  };
  // gap is the generated tabsTokens.gap TokenPath ('space.2xs') → number.
  const gap = resolveToken(tokens, tabsTokens.gap) as number;

  // Container surface via the RN Box (background + radius + padding) —
  // the same composition the web <nuri-tabs> performs (decision 42).
  return (
    <Box
      paddingX="xs"
      paddingY="xs"
      style={{ backgroundColor: chrome[theme].bgStrong, borderRadius: radius.md }}
    >
      <View style={{ flexDirection: 'row', gap }}>
        {React.Children.map(children, (child) =>
          React.cloneElement(child, {
            active: child.props.value === value,
            onSelect: onChange,
          }),
        )}
      </View>
    </Box>
  );
};

// ══════════════════════════════════════════════════════════════════
// TAB-BAR · the RN side of <nuri-tab-bar> + <nuri-tab-bar-item> · N+9 · decision 56
// ──────────────────────────────────────────────────────────────────
// API contract mirrors tab-bar.js (the compound web custom-elements):
//   TabBar:
//     value:     string                      controlled selected value
//     onChange?: (value: string) => void
//     label?:    string                      nav landmark accessible name
//     children:  TabBarItem elements
//   TabBarItem:
//     value:     string
//     name:      IconName                    glyph (typed registry key)
//     label?:    string                      accessible name (else from name)
//
// COMPLETE translation, not a stub. The icon-only BOTTOM destination
// switcher — DISTINCT from Tabs (the in-page segmented control). It
// mirrors Tabs' shared-state mechanism exactly: selection lives in
// TabBar (the controller owns `value`); each item is presentational,
// told its active state via React.cloneElement (the RN analogue of the
// web controller toggling the `active` attribute) — see
// F-SELECTED-VALUE-1.
//
// EMIT (decision 52): the ONE baked structural decision is the bar
// height, dereferenced from the generated tabBarTokens.height
// (`size.xl` TokenPath → number) — the same chrome-row leaf Topbar
// uses. Everything else is direct-semantic consumption (NO per-item
// component tokens · the IconAvatar / Topbar precedent): selected →
// chrome.textPrimary + filled glyph, rest → chrome.borderStrong +
// regular glyph, pressed → chrome.textMuted + Button's press-scale
// (button.pressScale · the shared --nuri-interaction-press-scale).
// Pressed is transient and does NOT alter the glyph weight, mirroring
// the CSS (`:active` shifts colour + scale only).
//
// A11y · F-TABBAR-ROLE-1 (the TabBar-specific friction). The web side
// is the CORRECT destination-switcher model — a <nav aria-label> of
// native <button>s, the selected one carrying aria-current="page",
// router-agnostic and distinct from Tabs' role="tablist". RN has NO
// accessibilityRole that maps 1:1 to that <nav>/aria-current pairing
// for a destination bar, so this mirror APPROXIMATES with
// accessibilityRole="tab" + accessibilityState={{ selected }} (the
// closest available shape, which over-claims tablist semantics). The
// accessible name follows F-ARIA-LABEL-1 (icon-only → label || name).
// ══════════════════════════════════════════════════════════════════
type TabBarItemProps = {
  value: string;
  name: IconName;
  label?: string;
  // Injected by TabBar (not author-set): the controller's selection +
  // change pipe. Optional so a bare <TabBarItem> still typechecks.
  active?: boolean;
  onSelect?: (value: string) => void;
};

const TabBarItem: React.FC<TabBarItemProps> = ({ value, name, label, active, onSelect }) => {
  const theme = React.useContext(ThemeContext);
  const chromeSlice = chrome[theme];

  // Direct-semantic item colours (no per-item token · decision 56).
  const restFg     = chromeSlice.borderStrong; // not selected · recedes
  const selectedFg = chromeSlice.textPrimary;  // selected · NOT accent
  const pressedFg  = chromeSlice.textMuted;    // pressed · transient

  return (
    <Pressable
      onPress={() => onSelect?.(value)}
      // F-TABBAR-ROLE-1 · RN approximation of web's <nav>/aria-current.
      accessibilityRole="tab"
      accessibilityState={{ selected: !!active }}
      // F-ARIA-LABEL-1 · icon-only target needs an accessible name.
      accessibilityLabel={label ?? name.replace(/-/g, ' ')}
      style={({ pressed }) => [
        {
          flex:           1,
          alignSelf:      'stretch',
          alignItems:     'center',
          justifyContent: 'center',
        },
        // Reuses Button's press-scale constant (button.pressScale =
        // the shared --nuri-interaction-press-scale · decision 45).
        pressed && { transform: [{ scale: button.pressScale }] },
      ]}
    >
      {({ pressed }) => (
        <Icon
          name={name}
          size="md"
          // Selected → filled weight; rest → regular. Pressed leaves the
          // weight untouched (colour + scale only), 1:1 with the CSS.
          fill={!!active}
          color={pressed ? pressedFg : active ? selectedFg : restFg}
        />
      )}
    </Pressable>
  );
};

type TabBarProps = {
  value: string;
  onChange?: (value: string) => void;
  label?: string;
  children: React.ReactElement<TabBarItemProps> | React.ReactElement<TabBarItemProps>[];
};

const TabBar: React.FC<TabBarProps> = ({ value, onChange, label, children }) => {
  const theme = React.useContext(ThemeContext);
  const tokens: RuntimeTokens = {
    chrome: chrome[theme], accent: accentTokens.lilac[theme], space, size, radius,
  };
  // The ONE baked token: bar height = tabBarTokens.height ('size.xl') → number.
  const height = resolveToken(tokens, tabBarTokens.height) as number;

  return (
    <View
      // RN has no <nav> landmark; the accessibilityLabel carries the
      // navigation name. (Role parity gap · F-TABBAR-ROLE-1.)
      accessibilityLabel={label}
      style={{
        flexDirection:   'row',
        alignItems:      'stretch',
        height,
        backgroundColor: chrome[theme].bgCanvas,
      }}
    >
      {React.Children.map(children, (child) =>
        React.cloneElement(child, {
          active: child.props.value === value,
          onSelect: onChange,
        }),
      )}
    </View>
  );
};

// ══════════════════════════════════════════════════════════════════
// TOPBAR · the RN side of <nuri-topbar> + wrappers · N+6.6 · decision 46
// ──────────────────────────────────────────────────────────────────
// API contract mirrors topbar.js (the light-DOM compound shell):
//   Topbar:
//     center?:   boolean                      default false
//     inset? · insetStart? · insetEnd?: 'xs'|'sm'|'lg'  edge-padding
//                override (decision 46.1) · default auto from structure
//     children:  TopbarStart? · centre nodes · TopbarEnd?
//   TopbarStart / TopbarEnd:
//     children:  the leading / trailing region content (optional)
//
// COMPLETE translation of the LAYOUT. It composes IconButton for any
// icon affordances (now glyph-live as of N+6.8 · F-ICON-RN-1 CLOSED) —
// Topbar adds NO new *direct* Icon consumer, so it kept the single
// funnel narrow while the renderer debt was still open (see RISKS).
// Like Tabs, the shell inspects
// its children for the named region element types and routes them;
// everything else is the centre (the web reparents authored children
// into three region containers — RN's analogue is this child split).
//
// Topbar is a LAYOUT PRIMITIVE (decision 46) — no component-token
// aliasing. It reads the semantic chrome vocabulary directly:
// size.xl (height), chrome.bgCanvas (surface), chrome.textPrimary
// (composed text colour — RN has no inherited `color`, so the title
// carries it), space.sm (gap), space.xs / space.sm / space.lg (edge
// padding · base → occupancy → center → inset · decision 46.1).
//
// Edge-padding occupancy + center are computed here from structure,
// the RN analogue of the web's data-leading / data-trailing /
// data-center attribute dispatch (decision 42 · the web computes it
// in CSS, never JS; RN has no CSS so the split happens at the call
// site, off the token surface — same values either way).
// ══════════════════════════════════════════════════════════════════
type TopbarRegionProps = { children?: React.ReactNode };

// Region markers · presentational pass-throughs. The web wrappers are
// display:contents markers the controller reads; on RN they exist as
// distinct component identities so Topbar can route them by `type`.
const TopbarStart: React.FC<TopbarRegionProps> = ({ children }) => <>{children}</>;
const TopbarEnd: React.FC<TopbarRegionProps> = ({ children }) => <>{children}</>;

type Inset = 'xs' | 'sm' | 'lg';
type TopbarProps = {
  center?: boolean;
  // Edge-padding override · mirrors the web inset API (decision 46.1).
  // `inset` is the symmetric shorthand; insetStart / insetEnd win per
  // edge. Declared once, read identically here and in CSS — no
  // per-platform heuristic.
  inset?: Inset;
  insetStart?: Inset;
  insetEnd?: Inset;
  children?: React.ReactNode;
};

const Topbar: React.FC<TopbarProps> = ({
  center = false,
  inset,
  insetStart,
  insetEnd,
  children,
}) => {
  const theme = React.useContext(ThemeContext);
  const chromeSlice = chrome[theme];

  // Route the named region markers; everything else is the centre —
  // the RN analogue of the web reparenting into start / centre / end.
  let startNode: React.ReactNode = null;
  let endNode: React.ReactNode = null;
  const centreNodes: React.ReactNode[] = [];
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child)) {
      if (child.type === TopbarStart) { startNode = child; return; }
      if (child.type === TopbarEnd)   { endNode = child; return; }
    }
    centreNodes.push(child);
  });

  const leadingFilled = startNode != null;
  const trailingFilled = endNode != null;

  // Edge padding · base → occupancy → center → inset, the exact order
  // the CSS layers it (decision 46.1). Occupancy: a filled edge hugs
  // its control (sm), an empty edge gives content room (lg). center
  // mode defaults to a tight symmetric xs gutter; the explicit inset
  // override (per edge, `inset` shorthand folded in) wins last.
  const startInset = insetStart ?? inset;
  const endInset = insetEnd ?? inset;
  const paddingStart = startInset
    ? space[startInset]
    : center
      ? space.xs
      : leadingFilled
        ? space.sm
        : space.lg;
  const paddingEnd = endInset
    ? space[endInset]
    : center
      ? space.xs
      : trailingFilled
        ? space.sm
        : space.lg;

  // center=true → equal side regions (flex:1) keep the centre optically
  // centred regardless of side widths; default → centre absorbs slack.
  const sideFlex = center ? 1 : 0;

  return (
    <View
      accessibilityRole="header"
      style={{
        flexDirection:   'row',
        alignItems:      'center',
        height:          size.xl,
        backgroundColor: chromeSlice.bgCanvas,
        gap:             space.sm,
        paddingStart,
        paddingEnd,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, flex: sideFlex }}>
        {startNode}
      </View>
      <View
        style={{
          flexDirection:  'row',
          alignItems:     'center',
          gap:            space.sm,
          flexGrow:       center ? 0 : 1,
          flexShrink:     1,
          justifyContent: center ? 'center' : 'flex-start',
        }}
      >
        {/* Default title type · lg-em from the shared scale (decision
            54/55). RN can't propagate text style through a View, so the
            centre carries a Text layer that bare title text inherits —
            the analogue of the web .nuri-topbar__center type block. The
            wrapper is in the COMPONENT (generic), not per-title in the
            demo. */}
        <Text style={{ ...typeStyle('lgEm'), color: chromeSlice.textPrimary }}>
          {centreNodes}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, flex: sideFlex, justifyContent: 'flex-end' }}>
        {endNode}
      </View>
    </View>
  );
};

// ══════════════════════════════════════════════════════════════════
// TYPOGRAPHY · the RN side of <nuri-typography> · decision 53 (was N+6.7)
// ──────────────────────────────────────────────────────────────────
// API contract mirrors typography.js:
//   Typography:
//     size?:     'xs'|'sm'|'md'|'lg'|'xl'|'3xl'   default 'md'
//     emphasis?: boolean                          regular → semibold
//     muted?:    boolean                          text-primary → text-muted
//     children:  the line
//
// Decision 53 ELIMINATED the former TypographyStackElement + its `level`
// sub-scale: it collided with Typography's `size` and added indirection.
// TypographyStack now wraps plain Typography lines whose size / emphasis
// / muted carry the hierarchy (the 5-step scale was DROPPED, not replaced
// by a guidance table — the author composes the props per line directly;
// a hierarchy doctrine is deferred until the type-scale principles land).
//
// The size + weight metrics are dereferenced from the emitted `type`
// namespace (build/tokens.ts · decision 54) — the SAME --nuri-type-*
// primitives the web reads through the .nuri-type-* utility classes
// (styles/typography.css). ONE source, TWO readers (the icon model ·
// decision 48): the hand-declared TYPOGRAPHY_SIZES that mirrored those
// values is gone — RN now reads a machine-checked source.
//
// The emit keeps lineHeight (a unitless ratio) and letterSpacing (an em
// number) RELATIVE, because RN's lineHeight / letterSpacing are absolute
// dp that do NOT scale with fontSize or the OS fontScale — baking either
// to absolute would clip at large accessibility text sizes and break the
// web↔RN scaling parity (the web scales both natively · decision 54). The
// relative→absolute conversion lives in ONE place: `typeStyle(key)`. That
// is also where a `* fontScale` multiply lands when Dynamic Type ships
// (P11 · not now). Consumers use `style={typeStyle(key)}` — never a raw
// `{...type[key]}` spread (lineHeight 1.29 would read as ~1px).
//
// The COLOUR IS on the runtime surface: a default line is text-primary,
// a `muted` line is text-muted — both from the chrome[theme] slice,
// exactly like the web `nuri-typography[data-muted]` dispatch repaints
// under [data-theme] (decision 42 / 53). (RN has no `currentColor`, so
// the web default-inherits-currentColor maps to text-primary here.)
// ══════════════════════════════════════════════════════════════════
type TypeKey = TypeSize | `${TypeSize}Em`;

// The single relative→absolute conversion for the emitted type scale
// (decision 54). Resolves the absolute dp RN needs from the relative
// source values; the one place a `* fontScale` multiply will go when
// Dynamic Type lands. Consistent with the resolveToken sketch (decision 21).
function typeStyle(key: TypeKey) {
  const t = typeScale[key];
  return {
    fontSize: t.fontSize,
    lineHeight: t.fontSize * t.lineHeight,
    letterSpacing: t.fontSize * t.letterSpacing,
    fontWeight: t.fontWeight,
  };
}

type TypographyProps = {
  size?: TypeSize;
  emphasis?: boolean;
  muted?: boolean;
  align?: 'start' | 'center' | 'end';
  children: React.ReactNode;
};

// Web `align` is logical `text-align: start|center|end` (RTL-aware). RN's
// `textAlign` has NO logical start/end — it is auto|left|right|center|justify
// — so we map to PHYSICAL left/right (the LTR case · decision 59). True RTL
// would flip end↔left via I18nManager.isRTL / writingDirection; logged as a
// friction, not solved here (P11).
const TEXT_ALIGN_MAP: Record<NonNullable<TypographyProps['align']>, 'left' | 'center' | 'right'> = {
  start:  'left',
  center: 'center',
  end:    'right',
};

const Typography: React.FC<TypographyProps> = ({
  size = 'md',
  emphasis = false,
  muted = false,
  align,
  children,
}) => {
  const theme = React.useContext(ThemeContext);
  const key: TypeKey = emphasis ? `${size}Em` : size;
  // `muted` (boolean · decision 53) → text-muted; otherwise text-primary,
  // both from the runtime chrome slice (the RN analogue of the web
  // [data-muted] colour dispatch · decision 42).
  const color = muted ? chrome[theme].textMuted : chrome[theme].textPrimary;
  return (
    <Text style={{ ...typeStyle(key), color, ...(align ? { textAlign: TEXT_ALIGN_MAP[align] } : null) }}>
      {children}
    </Text>
  );
};

type TypographyStackProps = {
  direction?: 'column' | 'row';
  children?: React.ReactNode;
};

const TypographyStack: React.FC<TypographyStackProps> = ({ direction = 'column', children }) => (
  // Single-element rhythm container (decision 53): it wraps Typography
  // lines and owns ONLY the inter-line rhythm (decision 47) — column →
  // tight 2xs leading; row → wider xs gutter + baseline alignment so
  // mixed-size lines share a text baseline. Gap is owned, not a prop.
  <View
    style={{
      flexDirection: direction,
      gap: direction === 'row' ? space.xs : space['2xs'],
      ...(direction === 'row' ? { alignItems: 'baseline' as const } : null),
    }}
  >
    {children}
  </View>
);

// ══════════════════════════════════════════════════════════════════
// SEPARATOR · the RN side of <nuri-separator> · N+6.9 · decision 49
// ──────────────────────────────────────────────────────────────────
// A generic 1px hairline — author-placed. Mirrors separator.css: a
// 1px-tall View, stretched on the cross axis, filled with the theme's
// border-subtle chrome token. Horizontal only (decision 49). Structural
// divider · accessibilityRole="none" (the web role="separator" has no
// exact RN peer, and a non-focusable rule adds no AT semantics beyond
// the visual break).
//
// ONE prop: `ySpace` (amendment 49.1 · N+8.1) — the vertical breathing
// room above/below the line, over `none` + `xs–xl` (default 'sm';
// 2xs/2xl excluded, matching Stack `gap`). It is a `marginVertical`, NOT a thicker
// fill: the visible hairline stays exactly 1px at every value (mirrors
// the web `margin-block` dispatch). This is the List family's inter-row
// rhythm now that <List> is gap-free (decision 51 · 52 · N+8.1).
// ══════════════════════════════════════════════════════════════════
type SeparatorProps = {
  ySpace?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
};

const Separator: React.FC<SeparatorProps> = ({ ySpace = 'sm' }) => {
  const theme = React.useContext(ThemeContext);
  return (
    <View
      accessibilityRole="none"
      style={{
        height:          1,
        alignSelf:       'stretch',
        marginVertical:  space[ySpace],
        backgroundColor: chrome[theme].borderSubtle,
      }}
    />
  );
};

// ══════════════════════════════════════════════════════════════════
// ICON-AVATAR · the RN side of <nuri-icon-avatar> · N+6.9 · decision 50
// ──────────────────────────────────────────────────────────────────
// API contract mirrors icon-avatar.js (the web custom-element):
//   name:     IconName  (registry key · the typed union from build/icons)
//   variant?: 'solid' | 'soft' | 'ghost'   default 'soft'
//   accent?:  Accent                       overrides ambient context
//   fill?:    boolean
//   — NO disabled / label / onPress · NO size prop (single-locked)
//
// The static, DECORATIVE twin of IconButton: a circular View filled per
// the SAME variant→surface map IconButton uses for solid/soft/ghost,
// REST state only (no pressed/disabled). Those three reuse the
// iconButtonBg/iconButtonFg funnel — proving "same resolveToken surface"
// literally, not by copy. IconAvatar ALSO carries an avatar-only `subtle`
// variant (transparent bg · glyph in chrome.borderStrong) with no
// IconButton counterpart — an actionable control never wants a
// near-invisible glyph (decision 50). Composes the real Icon: IconAvatar
// is the FIRST NEW consumer to ship against the resolved Icon
// (F-ICON-RN-1 closed · N+6.8 · decision 48), no shim. Single-size-locked
// size.lg (48px) circle · size="md" (28px) glyph — IconAvatar mirrors
// IconButton's geometry leaf-for-leaf (its exact twin).
//
// Decorative ⇒ hidden from AT entirely (accessibilityElementsHidden +
// importantForAccessibility). There is NO accessible name to derive —
// the adjacent text label is the content (contrast IconButton's
// F-ARIA-LABEL-1 · decision 50).
// ══════════════════════════════════════════════════════════════════
type IconAvatarVariant = 'solid' | 'soft' | 'ghost' | 'subtle';

type IconAvatarProps = {
  name: IconName;
  variant?: IconAvatarVariant;
  accent?: Accent;
  fill?: boolean;
};

const IconAvatar: React.FC<IconAvatarProps> = ({
  name,
  variant = 'soft',
  accent: accentProp,
  fill,
}) => {
  const ambientAccent = React.useContext(AccentContext);
  const accent: Accent = accentProp ?? ambientAccent;
  const theme = React.useContext(ThemeContext);

  // solid/soft/ghost reuse IconButton's REST-state funnel (pressed=false)
  // so the shared matrix can never drift. `subtle` is avatar-only:
  // transparent surface, glyph painted in chrome.borderStrong (the same
  // semantic the web .nuri-icon-avatar--subtle consumes).
  const bg = variant === 'subtle' ? 'transparent' : iconButtonBg(variant, accent, theme, false);
  const fg = variant === 'subtle' ? chrome[theme].borderStrong : iconButtonFg(variant, accent, theme);

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        width:           size.lg, // 48px · single-size lock · decision 50 · same as IconButton
        height:          size.lg,
        borderRadius:    radius.full,
        alignItems:      'center',
        justifyContent:  'center',
        backgroundColor: bg,
      }}
    >
      <Icon name={name} size="md" fill={fill} color={fg} />
    </View>
  );
};

// ══════════════════════════════════════════════════════════════════
// LIST FAMILY · primitive / interactive / recipe split · N+8 · decision 52
// ──────────────────────────────────────────────────────────────────
// The N+8 refactor splits the family into THREE clean roles, mirroring
// the web custom elements one-for-one:
//
//   List                   <nuri-list>                  container · role=list
//   ListItem               <nuri-list-item>             PRESENTATIONAL row
//   InteractiveListItem    <nuri-list-interactive-item> pressable WRAPPER
//   NavItem                <nuri-nav-item>              RECIPE (composition)
//
// EMIT, not hardcode (decision 52). Every fixed value below dereferences
// an emitted component token via resolveToken — the SAME machine-checked
// contract Button / Switch / Tabs use — instead of re-typing the space /
// size leaf by hand:
//
//   List       density → list.densitySmMinHeight  (= 'size.xl'  · TokenPath)
//   ListItem   guard   → listItem.paddingBlock     (= 'space.md')
//              gutter  → listItem.gap              (= 'space.md')
//              (NO inline padding · operator checkpoint N+8 — the row is
//               edge-to-edge so content aligns with full-width Separators;
//               the container supplies the outer margin)
//   Interactive wash   → listInteractiveItem.washPressed (= 'chrome.bgSubtle')
//              radius  → listInteractiveItem.radius        (= 'radius.lg')
//
// PRESS WASH IS A FLAT FILL (decision 52 · revised N+8.1): washPressed
// resolves to the flat `chrome.bgSubtle` semantic colour — a plain
// `backgroundColor` that crosses to RN cleanly (R1). The N+8 close briefly
// trialled a `chrome.bgSubtleXFade` horizontal gradient so a full-bleed box
// could read as inset without a counter-margin; that broke parity (RN cannot
// paint a gradient via `backgroundColor`) and was reverted. Full-bleed is now
// achieved by a COUNTER-MARGIN on the press box (negative marginHorizontal +
// equal paddingHorizontal · = `space.md`), not by fading the colour. The
// single press treatment carries no content `scale` (the A/B experiment is gone).
//
// PRESENTATIONAL ListItem (decision 52): the row carries NO interactivity
// — no `interactive` prop, no Pressable, no wash. It is a plain row.
// Interactivity is COMPOSED AROUND it by InteractiveListItem, exactly
// as the web wrapper wraps <nuri-list-item>. This is the structural a11y
// fix: the Pressable WRAPS the content, so the content is the button's
// accessible name (read once) — no copied aria-label, no double-read
// (the N+7 defect · decision 51 → 52).
//
// A11y deltas (R1): F-LISTITEM-ROLE-1 — RN's AccessibilityRole has `list`
// (on the container) but no `listitem` peer, so rows get no explicit row
// role; membership reads from the `list` container. F-FOCUS-1 — no focus
// ring on RN (no keyboard-focus distinction on touch).
//
// FULL-BLEED BY COUNTER-MARGIN: InteractiveListItem's Pressable wraps the
// WHOLE presentational row and bleeds its flat wash past the row edges via a
// negative marginHorizontal (= -space.md) re-inset by an equal paddingHorizontal,
// so content stays flush with the full-width Separators while the wash extends
// into the container's padding — the RN analogue of the web action box's
// counter-margin (decision 52 · revised N+8.1).
// ══════════════════════════════════════════════════════════════════
type Density = 'sm' | 'md' | 'lg';

// density → the emitted List min-height TokenPath (decision 52 · EMIT).
// resolveToken dereferences against the live size slice at render time,
// the RN analogue of the web `nuri-list[density] nuri-list-item` selector.
const DENSITY_TOKEN: Record<Density, TokenPath> = {
  sm: listTokens.densitySmMinHeight, // 'size.xl'  · 60
  md: listTokens.densityMdMinHeight, // 'size.2xl' · 72 · default
  lg: listTokens.densityLgMinHeight, // 'size.3xl' · 90
};

const DensityContext = React.createContext<Density>('md');

// Render-time runtime-token slice (accent × theme) for resolveToken.
function useRuntimeTokens(): RuntimeTokens {
  const ambientAccent = React.useContext(AccentContext);
  const theme = React.useContext(ThemeContext);
  return {
    chrome: chrome[theme],
    accent: accentTokens[ambientAccent][theme],
    space,
    size,
    radius,
  };
}

type ListProps = {
  density?: Density;
  children?: React.ReactNode;
};

const List: React.FC<ListProps> = ({ density = 'md', children }) => (
  // role="list" container. No gap (decision 51) — rhythm is the row
  // min-height + author Separators. density projects onto rows via
  // context, NOT a per-row prop (the container owns the decision).
  <DensityContext.Provider value={density}>
    <View accessibilityRole="list">{children}</View>
  </DensityContext.Provider>
);

type ListItemProps = {
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  children?: React.ReactNode;
};

// Presentational row — NO interactivity (decision 52). Inset, block
// guard, and inter-part gutter all dereference emitted listItem tokens.
const ListItem: React.FC<ListItemProps> = ({ leading, trailing, children }) => {
  const tokens = useRuntimeTokens();
  const density = React.useContext(DensityContext);

  const rowStyle: ViewStyle = {
    minHeight:         resolveToken(tokens, DENSITY_TOKEN[density])   as number,
    flexDirection:     'row',
    alignItems:        'center',
    gap:               resolveToken(tokens, listItem.gap)            as number,
    paddingVertical:   resolveToken(tokens, listItem.paddingBlock)   as number,
  };

  return (
    <View style={rowStyle}>
      {leading != null ? <View>{leading}</View> : null}
      <View style={{ flex: 1, minWidth: 0 }}>{children}</View>
      {trailing != null ? <View>{trailing}</View> : null}
    </View>
  );
};

type InteractiveListItemProps = ListItemProps & {
  onPress?: () => void;
};

// Pressable WRAPPER around a presentational ListItem (decision 52). The
// Pressable WRAPS the content so the content IS the button's accessible
// name (read once · the N+7 double-read fix). Wash + radius dereference
// the emitted listInteractiveItem tokens. NO focus ring (F-FOCUS-1).
//
// washPressed resolves to the flat `chrome.bgSubtle` colour (revised N+8.1 ·
// the x-fade gradient was reverted), so it crosses to RN cleanly as a plain
// backgroundColor. Full-bleed comes from the COUNTER-MARGIN: a negative
// marginHorizontal (= -space.md) re-inset by an equal paddingHorizontal, so
// the flat wash bleeds past the row edges while content stays flush with the
// Separators. The single press treatment carries no content scale.
const InteractiveListItem: React.FC<InteractiveListItemProps> = ({
  onPress, leading, trailing, children,
}) => {
  const tokens = useRuntimeTokens();
  const washPressed = resolveToken(tokens, listInteractiveItem.washPressed) as string;
  const itemRadius  = resolveToken(tokens, listInteractiveItem.radius)      as number;
  const bleed       = space.md;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        {
          borderRadius:      itemRadius,
          marginHorizontal:  -bleed,
          paddingHorizontal: bleed,
        },
        pressed ? { backgroundColor: washPressed } : null,
      ]}
    >
      <ListItem leading={leading} trailing={trailing}>{children}</ListItem>
    </Pressable>
  );
};

type NavItemProps = {
  onPress?: () => void;
  leading?: React.ReactNode;
  children?: React.ReactNode;
};

// RECIPE (decision 52) — a named composition over the primitives:
// InteractiveListItem ∘ ListItem ∘ auto-filled muted caret. NO recipe
// tokens of its own (web nav-item is skip-emit); every value comes from
// the primitives it composes. The caret is muted via the chrome
// border-strong semantic (the RN analogue of the web trailing's
// `color: var(--nuri-border-strong)` → Icon inherits currentColor · NO
// `muted` prop on Icon · decision 38). Label composes <Typography
// size="md" emphasis> (decision 53 · the RN analogue of the web recipe
// composing <nuri-typography size="md" emphasis>).
//
// OPTIONAL LEADING: forwarded straight to the composed row's leading
// book-end (the RN analogue of the web's hoisted <nuri-list-item-leading>
// child) — e.g. a leading IconAvatar on a settings row.
const NavItem: React.FC<NavItemProps> = ({ onPress, leading, children }) => {
  const tokens = useRuntimeTokens();
  const caretColor = resolveToken(
    tokens, 'chrome.borderStrong' as const satisfies TokenPath,
  ) as string;

  return (
    <InteractiveListItem
      onPress={onPress}
      leading={leading}
      trailing={<Icon name="caret-right" size="md" color={caretColor} />}
    >
      <Typography size="md" emphasis>{children}</Typography>
    </InteractiveListItem>
  );
};

// ══════════════════════════════════════════════════════════════════
// STYLE SHEET · base styles
// ──────────────────────────────────────────────────────────────────
// N+6.2 retires the F-LAYOUT-1 hand-rolled rowGroup / row styles —
// the App body composes <Stack> + <Box> directly. What remains here
// is the Button-internal base + label styling that pre-dates the
// layout primitive landing.
// ══════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  // Button base (variant-agnostic). N+6.4 (decision 41) made radius a
  // per-size runtime set: `mdRadius` now emits a TokenPath string, so
  // borderRadius can no longer live here (StyleSheet.create evaluates
  // at module load, before any mode × accent context exists). All
  // three size-coupled leaves — minHeight, paddingHorizontal,
  // borderRadius — now resolve inline in the render-time style array
  // through the live tokens slice. Only the geometry-invariant flex
  // bits remain in the static sheet.
  base: {
    alignItems:       'center',
    justifyContent:   'center',
    flexDirection:    'row',
    flex:             1,
  },
  // Label type sources from the shared scale (decision 54/55), not
  // per-component button.* fields. Button is md-only here and semibold
  // → mdEm. This adopts the scale's md line-height (1.29); the former
  // bespoke value was 1.2 (see N+8.4 line-height checkpoint).
  label: {
    ...typeStyle('mdEm'),
  },

  headerTitle: {
    fontSize:   22,
    fontWeight: '600',
    color:      chrome.light.textPrimary,
  },
  headerSub: {
    fontSize: 13,
    color:    chrome.light.textMuted,
  },

  rowLabel: {
    fontSize:    12,
    color:       chrome.light.textMuted,
    fontFamily: 'monospace',
  },

  // Body text for the Separator / IconAvatar faux-list rows (N+6.9).
  cellText: {
    fontSize: 14,
    color:    chrome.light.textPrimary,
  },
});

// ══════════════════════════════════════════════════════════════════
// APP · 4 rows, 8 buttons, mirrors the HTML row-for-row
// ──────────────────────────────────────────────────────────────────
// Layout composition uses <Stack> + <Box> (decision 37 · N+6.2)
// instead of the pre-N+6.2 hand-rolled flex styles. The canvas is
// a Box with uniform padding="xl"; the page is a Stack gap="xl" of
// (header, four row-groups); each row-group is a Stack gap="sm" of
// (label, row); each row is a Stack direction="row" gap="md" of
// buttons. F-LAYOUT-1 retired.
// ══════════════════════════════════════════════════════════════════
// Stateful demo wrappers — App's body is a pure expression with no
// hook slot, so the controlled state for Switch + Tabs lives here.
const SwitchDemo: React.FC<{ accent?: Accent; disabled?: boolean; initial?: boolean }> = ({
  accent,
  disabled,
  initial = false,
}) => {
  const [on, setOn] = React.useState(initial);
  return <Switch checked={on} accent={accent} disabled={disabled} onChange={setOn} />;
};

const TabsDemo: React.FC = () => {
  const [value, setValue] = React.useState('overview');
  return (
    <Tabs value={value} onChange={setValue}>
      <Tab value="overview">Overview</Tab>
      <Tab value="activity">Activity</Tab>
      <Tab value="assets">Assets</Tab>
    </Tabs>
  );
};

const TopbarDemo: React.FC = () => {
  // Title type + color now come from the Topbar centre region itself
  // (decision 46 amended · decision 55) — the demo passes bare title
  // text and the component supplies lg-em from the shared scale.
  return (
    <Stack gap="md">
      {/* default · left-aligned · back chevron + settings */}
      <Topbar>
        <TopbarStart>
          <IconButton name="caret-left" variant="ghost" label="Back" />
        </TopbarStart>
        Account
        <TopbarEnd>
          <IconButton name="gear" variant="ghost" label="Settings" />
        </TopbarEnd>
      </Topbar>

      {/* center · Cancel / Edit / Save action bar (decision 46) · the
          roomy centred bar opts out of the xs default with inset="lg" */}
      <Topbar center inset="lg">
        <TopbarStart>
          <Button variant="soft">Cancel</Button>
        </TopbarStart>
        Edit
        <TopbarEnd>
          <Button variant="solid">Save</Button>
        </TopbarEnd>
      </Topbar>

      {/* close · ghost-fill IconButton (decision 40.1 passthrough) */}
      <Topbar>
        Receive
        <TopbarEnd>
          <IconButton name="x-circle" variant="ghost" fill label="Close" />
        </TopbarEnd>
      </Topbar>
    </Stack>
  );
};

const TabBarDemo: React.FC = () => {
  const [value, setValue] = React.useState('vault');
  return (
    <TabBar value={value} onChange={setValue} label="Primary">
      <TabBarItem value="vault" name="vault" label="My vault" />
      <TabBarItem value="coin" name="coin-vertical" label="Coin" />
      <TabBarItem value="activity" name="clock" label="Activity" />
    </TabBar>
  );
};

const App: React.FC = () => (
  <SafeAreaView style={{ flex: 1, backgroundColor: chrome.light.bgCanvas }}>
    <ScrollView>
      <Box
        padding="xl"
        style={{ width: 390, backgroundColor: chrome.light.bgCanvas }}
      >
        <Stack gap="xl">
          <Stack gap="xs">
            <Text style={styles.headerTitle}>Button matrix</Text>
            <Text style={styles.headerSub}>
              variant × accent × state × scope-tier · 8 instances
            </Text>
          </Stack>

          {/* ── Row A · Tier 1 · ambient context default (lilac) ── */}
          <Stack gap="sm">
            <Text style={styles.rowLabel}>Tier 1 · ambient accent (lilac)</Text>
            <Stack direction="row" gap="md">
              <Button variant="solid">Pay</Button>
              <Button variant="soft">Cancel</Button>
            </Stack>
          </Stack>

          {/* ── Row B · Tier 2 · self-scope via `accent` prop ───── */}
          <Stack gap="sm">
            <Text style={styles.rowLabel}>Tier 2 · self-scope · accent="neutral"</Text>
            <Stack direction="row" gap="md">
              <Button variant="solid" accent="neutral">Pay</Button>
              <Button variant="soft" accent="neutral">Cancel</Button>
            </Stack>
          </Stack>

          {/* ── Row C · Tier 3 · subtree-scope via AccentProvider ─ */}
          <Stack gap="sm">
            <Text style={styles.rowLabel}>Tier 3 · subtree-scope · AccentProvider</Text>
            <Stack direction="row" gap="md">
              <AccentProvider value="neutral">
                <Button variant="solid">Pay</Button>
                <Button variant="soft">Cancel</Button>
              </AccentProvider>
            </Stack>
          </Stack>

          {/* ── Row D · State · disabled ─────────────────────────── */}
          <Stack gap="sm">
            <Text style={styles.rowLabel}>State · disabled · ambient accent (lilac)</Text>
            <Stack direction="row" gap="md">
              <Button variant="solid" disabled>Pay</Button>
              <Button variant="soft" disabled>Cancel</Button>
            </Stack>
          </Stack>

          {/* ── Row E · IconButton · N+6.8 · F-ICON-RN-1 CLOSED ──── */}
          {/* Single-size-locked md (decision 40); ghost joins solid/soft */}
          {/* as the cross-component tertiary (decision 39). Glyphs are  */}
          {/* real Icons over the shared registry (decision 48).         */}
          <Stack gap="sm">
            <Text style={styles.rowLabel}>IconButton · md-locked · solid / soft / ghost · glyphs live</Text>
            <Stack direction="row" gap="md">
              <IconButton name="plus" variant="solid" label="Add item" />
              <IconButton name="gear" variant="soft" />
              <IconButton name="x-circle" variant="ghost" label="Dismiss" />
              <IconButton name="scan" variant="solid" accent="neutral" disabled />
            </Stack>
          </Stack>

          {/* ── Row F · Switch · N+6.5 · complete RN translation ──── */}
          {/* off / on / on+neutral self-scope / disabled. Consumes the */}
          {/* generated switchTokens end-to-end (no Icon blocker).      */}
          <Stack gap="sm">
            <Text style={styles.rowLabel}>Switch · 60×36 · off / on / accent="neutral" / disabled</Text>
            <Stack direction="row" gap="md" align="center">
              <SwitchDemo />
              <SwitchDemo initial />
              <SwitchDemo initial accent="neutral" />
              <SwitchDemo initial disabled />
            </Stack>
          </Stack>

          {/* ── Row G · Tabs · N+6.5 · compound · Box-composed surface ─ */}
          {/* Controlled single-select; tablist surface is the RN Box.   */}
          <Stack gap="sm">
            <Text style={styles.rowLabel}>Tabs · compound · Box-composed surface · 3 options</Text>
            <TabsDemo />
          </Stack>

          {/* ── Row H · Topbar · N+6.6 · compositional chrome shell ── */}
          {/* default left-aligned · center action bar · ghost-fill close. */}
          {/* Composes IconButton (glyph-live · N+6.8) — no new direct Icon consumer. */}
          <Stack gap="sm">
            <Text style={styles.rowLabel}>Topbar · default / center action bar / ghost-fill close · composes IconButton</Text>
            <TopbarDemo />
          </Stack>

          {/* ── Row H.1 · TabBar · N+9 · icon-only bottom destination switcher ── */}
          {/* Controlled single-select; DISTINCT from Tabs. Selected item   */}
          {/* reads in text-primary with a filled glyph (chrome-only, NOT   */}
          {/* accent). Role gap vs web's <nav>/aria-current is F-TABBAR-ROLE-1. */}
          <Stack gap="sm">
            <Text style={styles.rowLabel}>TabBar · compound · icon-only bottom destination switcher · 3 items · composes Icon</Text>
            <TabBarDemo />
          </Stack>

          {/* ── Row I · TypographyStack · decision 53 · text-hierarchy ─────── */}
          {/* column primary→muted pairing · row baseline label+value · the   */}
          {/* hierarchy guidance steps composed as Typography size/emphasis/   */}
          {/* muted props (no -element / level · decision 53).                 */}
          <Stack gap="sm">
            <Text style={styles.rowLabel}>TypographyStack · column / row label+value / hierarchy guidance · composes Typography both sides</Text>
            <Stack direction="row" gap="xl" align="start">
              <TypographyStack>
                <Typography size="md" emphasis>Coffee Roasters</Typography>
                <Typography size="sm" muted>26 May at 11:34 AM</Typography>
              </TypographyStack>
              <TypographyStack direction="row">
                <Typography size="sm" muted>Amount</Typography>
                <Typography size="md" emphasis>€42.00</Typography>
              </TypographyStack>
              <TypographyStack>
                <Typography size="lg" emphasis>Step 1</Typography>
                <Typography size="md" emphasis>Step 2</Typography>
                <Typography size="sm" emphasis>Step 3</Typography>
                <Typography size="sm">Step 4</Typography>
                <Typography size="sm" muted>Step 5</Typography>
              </TypographyStack>
            </Stack>
          </Stack>

          {/* ── Row J · Separator · N+6.9 · decision 49 ──────────── */}
          {/* Prop-free 1px hairline, author-placed between rows —    */}
          {/* closes the Stack `divider` question (a divider is just  */}
          {/* a Separator the author drops in, not a Stack prop).     */}
          <Stack gap="sm">
            <Text style={styles.rowLabel}>Separator · 1px hairline · author-placed between rows</Text>
            <Stack gap="sm">
              <Text style={styles.cellText}>Groceries</Text>
              <Separator />
              <Text style={styles.cellText}>Rent</Text>
              <Separator />
              <Text style={styles.cellText}>Utilities</Text>
            </Stack>
          </Stack>

          {/* ── Row K · IconAvatar · N+6.9 · decision 50 ─────────── */}
          {/* Decorative twin of IconButton; first NEW consumer of    */}
          {/* the resolved Icon (F-ICON-RN-1 closed · N+6.8). Leads a  */}
          {/* labelled activity row; Separator rules between them.    */}
          <Stack gap="sm">
            <Text style={styles.rowLabel}>IconAvatar · 48px · solid / soft / ghost / subtle · decorative · leads a labelled row</Text>
            <Stack gap="sm">
              <Stack direction="row" gap="sm" align="center">
                <IconAvatar name="clock" variant="soft" />
                <Text style={styles.cellText}>Reminder · rent due Friday</Text>
              </Stack>
              <Separator />
              <Stack direction="row" gap="sm" align="center">
                <IconAvatar name="vault" variant="solid" />
                <Text style={styles.cellText}>You planted a new goal</Text>
              </Stack>
              <Separator />
              <Stack direction="row" gap="sm" align="center">
                <IconAvatar name="gear" variant="ghost" fill />
                <Text style={styles.cellText}>Profile updated</Text>
              </Stack>
              <Separator />
              <Stack direction="row" gap="sm" align="center">
                <IconAvatar name="clock" variant="subtle" />
                <Text style={styles.cellText}>Archived last month</Text>
              </Stack>
            </Stack>
          </Stack>

          {/* ── Row L · List + ListItem · N+7 · decision 51 ───────── */}
          {/* The family capstone: ONE row shape — [leading] · content  */}
          {/* · [trailing] — composed via children, not use-case        */}
          {/* variants. Disclosure (content + caret, interactive),      */}
          {/* Transaction (leading avatar + content + amount,           */}
          {/* interactive), Summary (content + value, non-interactive). */}
          {/* density projects row min-height; Separators stay 1px.     */}
          <Stack gap="sm">
            <Text style={styles.rowLabel}>List family · primitive ListItem · InteractiveListItem wrapper · NavItem recipe · density sm→lg · decision 52</Text>

            {/* NavItem · the recipe · auto-filled muted caret + md-em label */}
            <List>
              <NavItem onPress={() => {}}>Linked accounts</NavItem>
              <Separator />
              <NavItem onPress={() => {}}>Currency</NavItem>
            </List>

            {/* InteractiveListItem · pressable wrapper · custom content + caret */}
            <List>
              <InteractiveListItem
                onPress={() => {}}
                trailing={<Icon name="caret-right" size="md" color={chrome.light.borderStrong} />}
              >
                <TypographyStack>
                  <Typography size="md" emphasis>Currency</Typography>
                  <Typography size="sm" muted>GBP £</Typography>
                </TypographyStack>
              </InteractiveListItem>
            </List>

            {/* transaction · interactive · leading avatar + content + trailing amount */}
            <List>
              <InteractiveListItem
                onPress={() => {}}
                leading={<IconAvatar name="arrow-up" variant="soft" />}
                trailing={
                  <TypographyStack>
                    <Typography size="md" emphasis>−£24.00</Typography>
                    <Typography size="sm" muted>Complete</Typography>
                  </TypographyStack>
                }
              >
                <TypographyStack>
                  <Typography size="md" emphasis>Sent to Alex</Typography>
                  <Typography size="sm" muted>26 May at 11:34 AM</Typography>
                </TypographyStack>
              </InteractiveListItem>
            </List>

            {/* summary · PRESENTATIONAL ListItem · content + trailing value */}
            <List>
              <ListItem
                trailing={
                  <TypographyStack>
                    <Typography size="lg" emphasis>£201.20</Typography>
                  </TypographyStack>
                }
              >
                <TypographyStack>
                  <Typography size="md" emphasis>Total</Typography>
                </TypographyStack>
              </ListItem>
            </List>

            {/* density · sm (60px) · separators stay 1px · NavItem recipe */}
            <List density="sm">
              <NavItem onPress={() => {}}>Security</NavItem>
              <Separator />
              <NavItem onPress={() => {}}>Privacy</NavItem>
            </List>
          </Stack>
        </Stack>
      </Box>
    </ScrollView>
  </SafeAreaView>
);

export default App;
