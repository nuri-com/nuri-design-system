/* ──────────────────────────────────────────────────────────────
 * NURI · TOKENS · GENERATED · DO NOT EDIT BY HAND
 *
 * Source · packages/spec/tokens/colours.ts (chrome · accent · ref→hex) + packages/spec/tokens/dimensions.ts (space · size · radius · ratio · border)
 * Emitter · scripts/tokens-parser.js — run `npm run build`
 *
 * Contains the RN projection's generated token tables: runtime-capable
 * colour slices (chrome · accent), static dimensions (space · size · radius
 * · ratio · border), and the direct type scale. The discriminated union of generated
 * token leaf paths lives beside this file in generated/data/token-paths.ts.
 *
 * Shape is classify-by-cascade (decision 28 · N+5.5): each
 * export's nesting depth = the dimensions its source CSS var
 * spans across [data-<dim>=…] selectors. Groups in this build:
 *  · chrome (theme): bgCanvas, bgSubtle, bgStrong, bgPressed, bgInverse, bgInverseMuted, textPrimary, textMuted, textOnInverse, borderSubtle, borderDefault, borderStrong, focusRing
 *  · accent (accent-major · two-layer (flat | {light,dark})): fg, solid, solidPressed, onSolid, bgSubtle, bgSubtlePressed
 *  · space (singleton): none, 2xs, xs, sm, md, lg, xl, 2xl
 *  · size (singleton): xs, sm, md, lg, xl, 2xl, 3xl
 *  · radius (singleton): sm, md, lg, full
 *  · ratio (singleton): square, card
 *  · border (singleton): 1
 *
 * COLOUR is re-sourced from packages/spec/tokens/colours.ts (N+59 · Slice 3b·1 ·
 * projection model §3 · decision 80): chrome + accent are flattened
 * ref→hex straight from the SoT (NO CSS round-trip). Colour is LAYERED
 * SUBSTITUTION — accent is accent-MAJOR two-layer (a role is a flat hex
 * or a {light,dark} pair · the runtime composes chrome[mode] ⊕
 * accent[accent][mode]), NOT a materialized (accent × theme) cross-
 * product. space/size/radius/ratio/border are flattened straight from
 * packages/spec/tokens/dimensions.ts (N+60 · Slice 3b·2a) — the RN value arm reads
 * no CSS now. Colour refs resolve through the build's selected --neutral
 * scope (decision 31 · default cream; pass --neutral=<scale> to
 * scripts/tokens-parser.js to switch).
 * ────────────────────────────────────────────────────────────── */

export type Accent = 'neutral' | 'lilac' | 'orange';
export type Theme = 'light' | 'dark';

// ── chrome · theme ──
export const chrome: Record<Theme, {
  bgCanvas: string;
  bgSubtle: string;
  bgStrong: string;
  bgPressed: string;
  bgInverse: string;
  bgInverseMuted: string;
  textPrimary: string;
  textMuted: string;
  textOnInverse: string;
  borderSubtle: string;
  borderDefault: string;
  borderStrong: string;
  focusRing: string;
}> = {
  light: {
    bgCanvas:        '#fffdf2',
    bgSubtle:        '#fbf9ee',
    bgStrong:        '#f3f1e2',
    bgPressed:       '#ece9da',
    bgInverse:       '#12110b',
    bgInverseMuted:  '#666455',
    textPrimary:     '#222013',
    textMuted:       '#666455',
    textOnInverse:   '#f0eee3',
    borderSubtle:    '#dddac9',
    borderDefault:   '#d2cfbf',
    borderStrong:    '#bfbcac',
    focusRing:       '#ae91ff',
  },
  dark: {
    bgCanvas:        '#12110b',
    bgSubtle:        '#1a1913',
    bgStrong:        '#242319',
    bgPressed:       '#2c2a1e',
    bgInverse:       '#fffdf2',
    bgInverseMuted:  '#b7b4a4',
    textPrimary:     '#f0eee3',
    textMuted:       '#b7b4a4',
    textOnInverse:   '#222013',
    borderSubtle:    '#3d3b2e',
    borderDefault:   '#4b483b',
    borderStrong:    '#636153',
    focusRing:       '#6c58a3',
  },
};

// ── accent · accent-major · two-layer (flat | {light,dark}) ──
export const accent: Record<Accent, {
  fg: string | { light: string; dark: string };
  solid: string | { light: string; dark: string };
  solidPressed: string | { light: string; dark: string };
  onSolid: string | { light: string; dark: string };
  bgSubtle: string | { light: string; dark: string };
  bgSubtlePressed: string | { light: string; dark: string };
}> = {
  neutral: {
    fg:               { light: '#222013', dark: '#f0eee3' },
    solid:            { light: '#12110b', dark: '#fffdf2' },
    solidPressed:     { light: '#242319', dark: '#f3f1e2' },
    onSolid:          { light: '#f0eee3', dark: '#222013' },
    bgSubtle:         { light: '#f3f1e2', dark: '#242319' },
    bgSubtlePressed:  { light: '#ece9da', dark: '#2c2a1e' },
  },
  lilac: {
    fg:               { light: '#381b6a', dark: '#e3ddfa' },
    solid:            '#beaaff',
    solidPressed:     '#b39ff3',
    onSolid:          '#381b6a',
    bgSubtle:         { light: '#f3f0ff', dark: '#282040' },
    bgSubtlePressed:  { light: '#ebe3ff', dark: '#342756' },
  },
  orange: {
    fg:               { light: '#5e280f', dark: '#f9d6c8' },
    solid:            '#ff8c5a',
    solidPressed:     '#f3814f',
    onSolid:          '#5e280f',
    bgSubtle:         { light: '#ffe9dd', dark: '#361a0e' },
    bgSubtlePressed:  { light: '#ffd8c2', dark: '#4b1b04' },
  },
};

// ── space · singleton ──
export const space: {
  none: number;
  '2xs': number;
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
} = {
  none:   0,
  '2xs':  2,
  xs:     4,
  sm:     6,
  md:     12,
  lg:     18,
  xl:     24,
  '2xl':  36,
};

// ── size · singleton ──
export const size: {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
  '3xl': number;
} = {
  xs:     18,
  sm:     24,
  md:     36,
  lg:     48,
  xl:     54,
  '2xl':  72,
  '3xl':  90,
};

// ── radius · singleton ──
export const radius: {
  sm: number;
  md: number;
  lg: number;
  full: number;
} = {
  sm:    6,
  md:    12,
  lg:    18,
  full:  9999,
};

// ── ratio · singleton ──
export const ratio: {
  square: number;
  card: number;
} = {
  square:  1,
  card:    1.586,
};

// ── border · singleton ──
export const border: {
  '1': number;
} = {
  '1':  1,
};

/* ── type · 6 size composites + emphasisWeight · directly-accessed namespace (decision 54 · de-fused 77) ──
 *
 * Source · styles/tokens-primitive.css --nuri-type-* (the SAME
 * primitives the web reads through styles/typography.css · zero-build).
 * One source, two readers (the icon model · decision 48). NOT a runtime/
 * TokenPath set.
 *
 * fontSize px (rem×16) · lineHeight UNITLESS ratio (verbatim) ·
 * letterSpacing em number (verbatim) · fontWeight the resolved REGULAR
 * weight literal. lineHeight + letterSpacing stay RELATIVE so they scale
 * with fontSize / OS fontScale; the consumer's typeStyle(size, emphasis)
 * helper does the × fontSize relative→absolute conversion (do NOT raw-spread
 * type[size] — lineHeight 1.29 would read as ~1px). EMPHASIS is ORTHOGONAL
 * (decision 77 · the N+45 de-fusion · uniform 400→600): the single
 * emphasisWeight override below, applied by typeStyle's 2nd arg (RN) / the
 * source-order-last [data-type-emphasis] rule (web). Every value is verbatim
 * from the source primitives — enforced by the sync test. */
export type TypeSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '3xl';
export type TypeWeight = '400' | '600';
export type TypeStep = {
  fontSize: number;
  lineHeight: number;
  fontWeight: TypeWeight;
  letterSpacing: number;
};

export const type: Record<TypeSize, TypeStep> = {
  xs: { fontSize: 13, lineHeight: 1.38, fontWeight: '400', letterSpacing: 0 },
  sm: { fontSize: 14.5, lineHeight: 1.33, fontWeight: '400', letterSpacing: -0.01 },
  md: { fontSize: 17, lineHeight: 1.29, fontWeight: '400', letterSpacing: -0.02 },
  lg: { fontSize: 22, lineHeight: 1.27, fontWeight: '400', letterSpacing: -0.015 },
  xl: { fontSize: 30, lineHeight: 1.2, fontWeight: '400', letterSpacing: -0.015 },
  '3xl': { fontSize: 57, lineHeight: 1.19, fontWeight: '400', letterSpacing: -0.02 },
};

// emphasis · the orthogonal regular→semibold weight override (decision 77 ·
// uniform across every size · P11). typeStyle(size, true) swaps fontWeight to
// this; web realizes it as the source-order-last [data-type-emphasis] rule.
export const emphasisWeight: TypeWeight = '600';
