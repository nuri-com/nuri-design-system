/* ──────────────────────────────────────────────────────────────
 * NURI · TOKENS · GENERATED · DO NOT EDIT BY HAND
 *
 * Source · styles/tokens-primitive.css + styles/tokens-semantic.css
 * Emitter · pipeline/tokens-parser.js — run `npm run build`
 *
 * Contains ONLY runtime sets (decision 34 · N+6.0.3): every set
 * whose value depends on consumer context (theme · accent · …)
 * lives here. Context-invariant primitive vocabulary is
 * pipeline-inlined into per-component files at
 * build/components/<name>.ts; the discriminated union of every
 * runtime-set leaf path lives at build/token-paths.ts.
 *
 * Shape is classify-by-cascade (decision 28 · N+5.5): each
 * export's nesting depth = the dimensions its source CSS var
 * spans across [data-<dim>=…] selectors. Groups in this build:
 *  · chrome (theme): bgCanvas, bgSubtle, bgStrong, bgPressed, bgInverse, bgInverseMuted, textPrimary, textMuted, textOnInverse, borderSubtle, borderDefault, borderStrong, focusRing
 *  · accent (accent × theme): fg, solid, solidPressed, onSolid, bgSubtle, bgSubtlePressed
 *  · space (singleton): none, 2xs, xs, sm, md, lg, xl, 2xl
 *  · size (singleton): xs, sm, md, lg, xl, 2xl, 3xl
 *  · radius (singleton): sm, md, lg, full
 *
 * The semantic-cascade walker resolves each token to a literal
 * per (accent × theme) by walking the cascade blocks of
 * tokens-semantic.css and chasing the var() chain through the
 * primitives at the build's selected --neutral scope (decision 31
 * · default cream; pass --neutral=<scale> to pipeline/tokens-parser.js
 * to switch).
 * ────────────────────────────────────────────────────────────── */

export type Accent = 'neutral' | 'lilac';
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

// ── accent · accent × theme ──
export const accent: Record<Accent, Record<Theme, {
  fg: string;
  solid: string;
  solidPressed: string;
  onSolid: string;
  bgSubtle: string;
  bgSubtlePressed: string;
}>> = {
  neutral: {
    light: {
      fg:               '#222013',
      solid:            '#12110b',
      solidPressed:     '#242319',
      onSolid:          '#f0eee3',
      bgSubtle:         '#f3f1e2',
      bgSubtlePressed:  '#ece9da',
    },
    dark: {
      fg:               '#f0eee3',
      solid:            '#fffdf2',
      solidPressed:     '#f3f1e2',
      onSolid:          '#222013',
      bgSubtle:         '#242319',
      bgSubtlePressed:  '#2c2a1e',
    },
  },
  lilac: {
    light: {
      fg:               '#381b6a',
      solid:            '#beaaff',
      solidPressed:     '#b39ff3',
      onSolid:          '#381b6a',
      bgSubtle:         '#f3f0ff',
      bgSubtlePressed:  '#ebe3ff',
    },
    dark: {
      fg:               '#e3ddfa',
      solid:            '#beaaff',
      solidPressed:     '#b39ff3',
      onSolid:          '#381b6a',
      bgSubtle:         '#282040',
      bgSubtlePressed:  '#342756',
    },
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
  sm:     28,
  md:     36,
  lg:     48,
  xl:     60,
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

/* ── type · 6 steps × {regular, em} · directly-accessed namespace (decision 54) ──
 *
 * Source · styles/tokens-primitive.css --nuri-type-* (the SAME
 * primitives the web reads through the .nuri-type-* utility classes
 * in styles/typography.css · zero-build). One source, two readers
 * (the icon model · decision 48). NOT a runtime/TokenPath set.
 *
 * fontSize px (rem×16) · lineHeight UNITLESS ratio (verbatim) ·
 * letterSpacing em number (verbatim) · fontWeight the resolved weight
 * literal. lineHeight + letterSpacing stay RELATIVE so they scale with
 * fontSize / OS fontScale; the consumer's typeStyle(key) helper does
 * the × fontSize relative→absolute conversion (do NOT raw-spread
 * type[key] — lineHeight 1.29 would read as ~1px). Every value is
 * verbatim from the source primitives — enforced by the sync test. */
export type TypeSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '3xl';
export type TypeWeight = '400' | '600';
export type TypeStep = {
  fontSize: number;
  lineHeight: number;
  fontWeight: TypeWeight;
  letterSpacing: number;
};

export const type: Record<TypeSize | `${TypeSize}Em`, TypeStep> = {
  xs: { fontSize: 13, lineHeight: 1.38, fontWeight: '400', letterSpacing: 0 },
  xsEm: { fontSize: 13, lineHeight: 1.38, fontWeight: '600', letterSpacing: 0 },
  sm: { fontSize: 15, lineHeight: 1.33, fontWeight: '400', letterSpacing: -0.01 },
  smEm: { fontSize: 15, lineHeight: 1.33, fontWeight: '600', letterSpacing: -0.01 },
  md: { fontSize: 17, lineHeight: 1.29, fontWeight: '400', letterSpacing: -0.02 },
  mdEm: { fontSize: 17, lineHeight: 1.29, fontWeight: '600', letterSpacing: -0.02 },
  lg: { fontSize: 22, lineHeight: 1.27, fontWeight: '400', letterSpacing: -0.015 },
  lgEm: { fontSize: 22, lineHeight: 1.27, fontWeight: '600', letterSpacing: -0.015 },
  xl: { fontSize: 30, lineHeight: 1.2, fontWeight: '400', letterSpacing: -0.015 },
  xlEm: { fontSize: 30, lineHeight: 1.2, fontWeight: '600', letterSpacing: -0.015 },
  '3xl': { fontSize: 57, lineHeight: 1.19, fontWeight: '400', letterSpacing: -0.02 },
  '3xlEm': { fontSize: 57, lineHeight: 1.19, fontWeight: '600', letterSpacing: -0.02 },
};
