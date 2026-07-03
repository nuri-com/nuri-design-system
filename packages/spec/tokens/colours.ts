/* ══════════════════════════════════════════════════════════════════
 * NURI · COLOUR PRIMITIVES · SOURCE OF TRUTH (TS) · N+32 C1 · decision 70
 * ──────────────────────────────────────────────────────────────────
 * The colour PRIMITIVE layer of the cascade (L1 colour), the
 * SECOND real flip after the dimension vertical (N+31): decision 2 (CSS is the
 * source of truth) is REVERSED for the colour-primitive layer ONLY — these raw
 * values are no longer read out of styles/tokens-primitive.css, they are WRITTEN
 * INTO it (pipeline/parsers/colour-css.js · the dimension-css.js analog · the
 * Slice-0 in-place passthrough emit). The SEMANTIC accent×theme matrix (the
 * chrome + accent cascade · the decision-63 #4b/#6b self-scope) stays the CSS SoT
 * — that is C2, the genuinely-templated emit; this slice is the flat catalog.
 *
 * The shape is the DTCG model inherited from dimensions.ts — `name → value`
 * (the token-standards eval · roadmap/token-standards-eval.md §7): a colour leaf
 * is a terse literal `{ value: '#fcfcfc' }`. The semantic matrix (C2 · chrome /
 * accent) references a primitive by a BARE `'scale.step.theme'` string (N+55 ·
 * decision 80 · the uniform rule: a bare string IS a reference, `{ value }` is a
 * literal) — so a leaf is only ever a literal and there is no `{ ref }` arm. (cf.
 * dimensions.ts `Leaf = { ref } | { value, unit }`, whose px refs are still wrapped.)
 *
 * ── neutral = cream (the build param · decision 31 · N+5.8) ──────────
 * All 7 candidate neutral scales (gray/mauve/slate/sage/olive/sand/cream) live
 * here as DATA so the build can pick one with --neutral=<scale> (DEFAULT_NEUTRAL
 * = cream · pipeline/parsers/semantic.js). The chosen scale is resolved INTO a
 * single `:root` --nuri-color-neutral-* block by the emitter (build-time), NOT
 * stored here — it is parameterized by the flag, so it cannot be static data.
 * The runtime [data-neutral] switcher (the 8 alias blocks) is RETIRED at C1:
 * build-time selection only (the brief · the anti-goal). cream ≠ gray is a
 * deliberate VALUE change for the WEB CSS default (the RN/tokens.ts path already
 * resolved cream since decision 31, so build/* stays byte-identical · the change
 * is web-only).
 *
 * Consumed by the node pipeline through the shared TS data loader (loadColours ·
 * scripts/parsers/colour-css.js). Base: decision 2 (reversed here for L1 colour) ·
 * 31 (cream default · the --neutral flag) · 63 (the cascade · ring-fenced to C2) ·
 * 70 (the cascade model) · the token-standards eval (the DTCG shape).
 * ══════════════════════════════════════════════════════════════════ */

// A colour PRIMITIVE leaf — a literal `{ value: '#fcfcfc' }` (DTCG `value` · the
// token-standards eval). The ramps (neutralScales / lilac / the alpha overlays) hold
// these. The semantic roles (chrome / accent below) reference a primitive by a BARE
// `'scale.step.theme'` string (a RefPair · N+55 · decision 80 · the uniform rule: a
// bare string IS a reference, `{ value }` is a literal) — so a leaf is only ever a
// literal, and `ColorLeaf` carries the single `{ value }` arm (the `{ ref }` wrapper
// is gone end-to-end · the model fully landed).
type ColorLeaf = { value: string };
// A Radix 12-step scale: each step exposes its light + dark primitive in parallel
// (the semantic layer composes mode × accent on top · the cascade below).
type ThemedLeaf = { light: ColorLeaf; dark: ColorLeaf };
type Scale = Record<string, ThemedLeaf>;

// L1 · the 7 candidate neutral scales. cream is the active default (decision 31);
// the other six stay as build-time --neutral=<scale> options (reserved per P11 ·
// RESERVED_COLOR_SCALES in the guardrail test). The keys MUST equal semantic.js
// NEUTRAL_SCALES (asserted in colour-cascade.test.js).
export const neutralScales = {
  gray: {
    1:  { light: { value: '#fcfcfc' }, dark: { value: '#111111' } },
    2:  { light: { value: '#f9f9f9' }, dark: { value: '#191919' } },
    3:  { light: { value: '#f0f0f0' }, dark: { value: '#222222' } },
    4:  { light: { value: '#e8e8e8' }, dark: { value: '#2a2a2a' } },
    5:  { light: { value: '#e0e0e0' }, dark: { value: '#313131' } },
    6:  { light: { value: '#d9d9d9' }, dark: { value: '#3a3a3a' } },
    7:  { light: { value: '#cecece' }, dark: { value: '#484848' } },
    8:  { light: { value: '#bbbbbb' }, dark: { value: '#606060' } },
    9:  { light: { value: '#8d8d8d' }, dark: { value: '#6e6e6e' } },
    10: { light: { value: '#838383' }, dark: { value: '#7b7b7b' } },
    11: { light: { value: '#646464' }, dark: { value: '#b4b4b4' } },
    12: { light: { value: '#202020' }, dark: { value: '#eeeeee' } },
  },
  mauve: {
    1:  { light: { value: '#fdfcfd' }, dark: { value: '#121113' } },
    2:  { light: { value: '#faf9fb' }, dark: { value: '#1a191b' } },
    3:  { light: { value: '#f2eff3' }, dark: { value: '#232225' } },
    4:  { light: { value: '#eae7ec' }, dark: { value: '#2b292d' } },
    5:  { light: { value: '#e3dfe6' }, dark: { value: '#323035' } },
    6:  { light: { value: '#dbd8e0' }, dark: { value: '#3c393f' } },
    7:  { light: { value: '#d0cdd7' }, dark: { value: '#49474e' } },
    8:  { light: { value: '#bcbac7' }, dark: { value: '#625f69' } },
    9:  { light: { value: '#8e8c99' }, dark: { value: '#6f6d78' } },
    10: { light: { value: '#84828e' }, dark: { value: '#7c7a85' } },
    11: { light: { value: '#65636d' }, dark: { value: '#b5b2bc' } },
    12: { light: { value: '#211f26' }, dark: { value: '#eeeef0' } },
  },
  slate: {
    1:  { light: { value: '#fcfcfd' }, dark: { value: '#111113' } },
    2:  { light: { value: '#f9f9fb' }, dark: { value: '#18191b' } },
    3:  { light: { value: '#f0f0f3' }, dark: { value: '#212225' } },
    4:  { light: { value: '#e8e8ec' }, dark: { value: '#272a2d' } },
    5:  { light: { value: '#e0e1e6' }, dark: { value: '#2e3135' } },
    6:  { light: { value: '#d9d9e0' }, dark: { value: '#363a3f' } },
    7:  { light: { value: '#cdced6' }, dark: { value: '#43484e' } },
    8:  { light: { value: '#b9bbc6' }, dark: { value: '#5a6169' } },
    9:  { light: { value: '#8b8d98' }, dark: { value: '#696e77' } },
    10: { light: { value: '#80838d' }, dark: { value: '#777b84' } },
    11: { light: { value: '#60646c' }, dark: { value: '#b0b4ba' } },
    12: { light: { value: '#1c2024' }, dark: { value: '#edeef0' } },
  },
  sage: {
    1:  { light: { value: '#fbfdfc' }, dark: { value: '#101211' } },
    2:  { light: { value: '#f7f9f8' }, dark: { value: '#171918' } },
    3:  { light: { value: '#eef1f0' }, dark: { value: '#202221' } },
    4:  { light: { value: '#e6e9e8' }, dark: { value: '#272a29' } },
    5:  { light: { value: '#dfe2e0' }, dark: { value: '#2e3130' } },
    6:  { light: { value: '#d7dad9' }, dark: { value: '#373b39' } },
    7:  { light: { value: '#cbcfcd' }, dark: { value: '#444947' } },
    8:  { light: { value: '#b8bcba' }, dark: { value: '#5b625f' } },
    9:  { light: { value: '#868e8b' }, dark: { value: '#63706b' } },
    10: { light: { value: '#7c8481' }, dark: { value: '#717d79' } },
    11: { light: { value: '#5f6563' }, dark: { value: '#adb5b2' } },
    12: { light: { value: '#1a211e' }, dark: { value: '#eceeed' } },
  },
  olive: {
    1:  { light: { value: '#fcfdfc' }, dark: { value: '#111210' } },
    2:  { light: { value: '#f8faf8' }, dark: { value: '#181917' } },
    3:  { light: { value: '#eff1ef' }, dark: { value: '#212220' } },
    4:  { light: { value: '#e7e9e7' }, dark: { value: '#282a27' } },
    5:  { light: { value: '#dfe2df' }, dark: { value: '#2f312e' } },
    6:  { light: { value: '#d7dad7' }, dark: { value: '#383a36' } },
    7:  { light: { value: '#cccfcc' }, dark: { value: '#454843' } },
    8:  { light: { value: '#b9bcb8' }, dark: { value: '#5c625b' } },
    9:  { light: { value: '#898e87' }, dark: { value: '#687066' } },
    10: { light: { value: '#7f847d' }, dark: { value: '#767d74' } },
    11: { light: { value: '#60655f' }, dark: { value: '#afb5ad' } },
    12: { light: { value: '#1d211c' }, dark: { value: '#eceeec' } },
  },
  sand: {
    1:  { light: { value: '#fdfdfc' }, dark: { value: '#111110' } },
    2:  { light: { value: '#f9f9f8' }, dark: { value: '#191918' } },
    3:  { light: { value: '#f1f0ef' }, dark: { value: '#222221' } },
    4:  { light: { value: '#e9e8e6' }, dark: { value: '#2a2a28' } },
    5:  { light: { value: '#e2e1de' }, dark: { value: '#31312e' } },
    6:  { light: { value: '#dad9d6' }, dark: { value: '#3b3a37' } },
    7:  { light: { value: '#cfceca' }, dark: { value: '#494844' } },
    8:  { light: { value: '#bcbbb5' }, dark: { value: '#62605b' } },
    9:  { light: { value: '#8d8d86' }, dark: { value: '#6f6d66' } },
    10: { light: { value: '#82827c' }, dark: { value: '#7c7b74' } },
    11: { light: { value: '#63635e' }, dark: { value: '#b5b3ad' } },
    12: { light: { value: '#21201c' }, dark: { value: '#eeeeec' } },
  },
  cream: {
    1:  { light: { value: '#fffdf2' }, dark: { value: '#12110b' } },
    2:  { light: { value: '#fbf9ee' }, dark: { value: '#1a1913' } },
    3:  { light: { value: '#f3f1e2' }, dark: { value: '#242319' } },
    4:  { light: { value: '#ece9da' }, dark: { value: '#2c2a1e' } },
    5:  { light: { value: '#e5e2d1' }, dark: { value: '#343124' } },
    6:  { light: { value: '#dddac9' }, dark: { value: '#3d3b2e' } },
    7:  { light: { value: '#d2cfbf' }, dark: { value: '#4b483b' } },
    8:  { light: { value: '#bfbcac' }, dark: { value: '#636153' } },
    9:  { light: { value: '#8f8c7d' }, dark: { value: '#706d5f' } },
    10: { light: { value: '#858273' }, dark: { value: '#7e7b6c' } },
    11: { light: { value: '#666455' }, dark: { value: '#b7b4a4' } },
    12: { light: { value: '#222013' }, dark: { value: '#f0eee3' } },
  },
} as const satisfies Record<string, Scale>;

// L1 · lilac · the brand scale (Radix custom from #BEAAFF). Steps 9 & 10 are
// identical light/dark — the brand keeps its identity across themes (the bright
// scale · self-documenting duplication · cf. the CSS comment). Distinct role from
// the neutrals: the accent family references it (focus-ring, the lilac accent).
export const lilac = {
  1:  { light: { value: '#fcfcff' }, dark: { value: '#120f1a' } },
  2:  { light: { value: '#faf8ff' }, dark: { value: '#191523' } },
  3:  { light: { value: '#f3f0ff' }, dark: { value: '#282040' } },
  4:  { light: { value: '#ebe3ff' }, dark: { value: '#342756' } },
  5:  { light: { value: '#e2d6ff' }, dark: { value: '#3e2f63' } },
  6:  { light: { value: '#d6c6ff' }, dark: { value: '#493a71' } },
  7:  { light: { value: '#c4b0ff' }, dark: { value: '#584785' } },
  8:  { light: { value: '#ae91ff' }, dark: { value: '#6c58a3' } },
  9:  { light: { value: '#beaaff' }, dark: { value: '#beaaff' } },
  10: { light: { value: '#b39ff3' }, dark: { value: '#b39ff3' } },
  11: { light: { value: '#6f47c0' }, dark: { value: '#bba7fc' } },
  12: { light: { value: '#381b6a' }, dark: { value: '#e3ddfa' } },
} as const satisfies Scale;

// L1 · orange · the second accent scale (Radix custom from #ff8c5a · N+56 · slice 2).
// Same shape as lilac: steps 9 & 10 are identical light/dark — the brand fill keeps
// its identity across themes (the bright scale · self-documenting duplication). Adding
// this ramp + accent.orange below + 'orange' in ACCENTS (parsers/semantic.js) is the
// WHOLE accent add — the emitters loop the accent data (no per-accent edit · the N+55
// reshape + the N+56 generify).
export const orange = {
  1:  { light: { value: '#fffcfb' }, dark: { value: '#15100d' } },
  2:  { light: { value: '#fff5f0' }, dark: { value: '#1e1512' } },
  3:  { light: { value: '#ffe9dd' }, dark: { value: '#361a0e' } },
  4:  { light: { value: '#ffd8c2' }, dark: { value: '#4b1b04' } },
  5:  { light: { value: '#ffc9ae' }, dark: { value: '#5a2308' } },
  6:  { light: { value: '#ffb996' }, dark: { value: '#693015' } },
  7:  { light: { value: '#ffa37a' }, dark: { value: '#814024' } },
  8:  { light: { value: '#fb8856' }, dark: { value: '#a6532f' } },
  9:  { light: { value: '#ff8c5a' }, dark: { value: '#ff8c5a' } },  // brand · theme-invariant
  10: { light: { value: '#f3814f' }, dark: { value: '#f3814f' } },  // brand · theme-invariant
  11: { light: { value: '#c45621' }, dark: { value: '#ff9664' } },
  12: { light: { value: '#5e280f' }, dark: { value: '#f9d6c8' } },
} as const satisfies Scale;

// L1 · alpha overlays · theme-invariant by nature (opacity over a base is
// independent of theme · NO -light/-dark suffix). Emitted as
// --nuri-color-{black,white}-alpha-N. rgba spelled EXACTLY as the CSS (spaces
// after commas · 2-digit decimals) so the in-place emit round-trips byte-identical.
export const blackAlpha = {
  1:  { value: 'rgba(0, 0, 0, 0.05)' },
  2:  { value: 'rgba(0, 0, 0, 0.10)' },
  3:  { value: 'rgba(0, 0, 0, 0.15)' },
  4:  { value: 'rgba(0, 0, 0, 0.20)' },
  5:  { value: 'rgba(0, 0, 0, 0.30)' },
  6:  { value: 'rgba(0, 0, 0, 0.40)' },
  7:  { value: 'rgba(0, 0, 0, 0.50)' },
  8:  { value: 'rgba(0, 0, 0, 0.60)' },
  9:  { value: 'rgba(0, 0, 0, 0.70)' },
  10: { value: 'rgba(0, 0, 0, 0.80)' },
  11: { value: 'rgba(0, 0, 0, 0.90)' },
  12: { value: 'rgba(0, 0, 0, 0.95)' },
} as const satisfies Record<string, ColorLeaf>;

export const whiteAlpha = {
  1:  { value: 'rgba(255, 255, 255, 0.05)' },
  2:  { value: 'rgba(255, 255, 255, 0.10)' },
  3:  { value: 'rgba(255, 255, 255, 0.15)' },
  4:  { value: 'rgba(255, 255, 255, 0.20)' },
  5:  { value: 'rgba(255, 255, 255, 0.30)' },
  6:  { value: 'rgba(255, 255, 255, 0.40)' },
  7:  { value: 'rgba(255, 255, 255, 0.50)' },
  8:  { value: 'rgba(255, 255, 255, 0.60)' },
  9:  { value: 'rgba(255, 255, 255, 0.70)' },
  10: { value: 'rgba(255, 255, 255, 0.80)' },
  11: { value: 'rgba(255, 255, 255, 0.90)' },
  12: { value: 'rgba(255, 255, 255, 0.95)' },
} as const satisfies Record<string, ColorLeaf>;


/* ══════════════════════════════════════════════════════════════════
 * L2 · THE SEMANTIC ACCENT×THEME MATRIX (N+32 C2 · decision 70 · the cascade)
 * ──────────────────────────────────────────────────────────────────
 * The role-based tokens components actually consume, composed by referencing the
 * L1 primitives above via the `{ ref }` arm. This IS the resolution matrix that
 * the Format-B comments in styles/tokens-semantic.css used to carry (decision 33):
 * the matrix now lives HERE, in the SoT, and the cascade CSS is GENERATED from it
 * (pipeline/parsers/semantic-css.js · the genuinely-templated emit · the dec-63
 * #4b/#6b self-scope). decision 2 reverses for the colour SEMANTIC layer (after
 * the primitives at C1) — so it is now fully reversed for colour.
 *
 * Two attributes drive the cascade in the WEB projection (data-theme · data-accent);
 * the RN projection (decisions 27/62/63) reads ONE {mode, accent} context and looks
 * up the flat tokens[accent][mode] matrix — no cascade, no #4b/#6b. Both are
 * projections of THIS data.
 *
 * `neutral` in a ref is the ABSTRACT pointer (--nuri-color-neutral-N-θ · resolved
 * to cream by default in tokens-primitive.css · --neutral= switchable) — the
 * semantic layer never names cream directly. `lilac` is the brand scale.
 *
 * ── The two asymmetries the matrix encodes (read the cells) ──────────
 *   INVERSE (neutral · saturated)  · solid / solid-pressed / on-solid reference the
 *     OPPOSITE theme's step (light→…-dark, dark→…-light): a near-black CTA in light,
 *     a near-white CTA in dark. Visible as light.ref ≠ dark.ref pointing across.
 *   FROZEN · P4 (lilac · bright)   · solid / solid-pressed / on-solid keep the brand
 *     fill across themes (light.ref === dark.ref → e.g. both lilac.9.light). The
 *     emitter reads light===dark as "frozen" and OMITS the dark override → that is
 *     exactly why the generated blocks 6 / 6b are PARTIAL (only the 3 theme-adapting
 *     lilac tokens · fg / bg-subtle / bg-subtle-pressed). No special-casing in the
 *     emitter — P4 falls out of the data.
 * ══════════════════════════════════════════════════════════════════ */

// A semantic ref PAIR — the light/dark primitive refs a theme-paired role points at.
// A ref is a BARE `'scale.step.theme'` string (N+55 · decision 80 · the uniform rule:
// a bare string IS a reference, `{ value }` is a literal). chrome is ALWAYS a pair
// (theme-only · every role adapts light↔dark); an accent role is a pair when it adapts,
// else a flat string (see AccentRole below).
type RefPair = { light: string; dark: string };

// chrome · theme-only · accent-invariant (13 tokens × {light, dark}). The page's
// neutral surface: backgrounds, text, borders, and the always-brand focus ring.
export const chrome = {
  'bg-canvas':        { light: 'neutral.1.light',  dark: 'neutral.1.dark' },
  'bg-subtle':        { light: 'neutral.2.light',  dark: 'neutral.2.dark' },
  'bg-strong':        { light: 'neutral.3.light',  dark: 'neutral.3.dark' },
  'bg-pressed':       { light: 'neutral.4.light',  dark: 'neutral.4.dark' },
  // bg-inverse · a slice of the OTHER theme (INVERSE by design)
  'bg-inverse':       { light: 'neutral.1.dark',   dark: 'neutral.1.light' },
  'bg-inverse-muted': { light: 'neutral.11.light', dark: 'neutral.11.dark' },
  'text-primary':     { light: 'neutral.12.light', dark: 'neutral.12.dark' },
  'text-muted':       { light: 'neutral.11.light', dark: 'neutral.11.dark' },
  // text-on-inverse · text drawn on bg-inverse (INVERSE by design)
  'text-on-inverse':  { light: 'neutral.12.dark',  dark: 'neutral.12.light' },
  'border-subtle':    { light: 'neutral.6.light',  dark: 'neutral.6.dark' },
  'border-default':   { light: 'neutral.7.light',  dark: 'neutral.7.dark' },
  'border-strong':    { light: 'neutral.8.light',  dark: 'neutral.8.dark' },
  // focus-ring · always brand (lilac) regardless of accent (DS convention · pops vs any bg)
  'focus-ring':       { light: 'lilac.8.light',    dark: 'lilac.8.dark' },
} as const satisfies Record<string, RefPair>;

// accent · accent-MAJOR (each accent is ONE object · 6 roles × {light, dark}). Where
// the saturated-vs-bright asymmetry lives (INVERSE / FROZEN-P4 · see the header). A
// role is either a FLAT `string` ref — theme-INVARIANT, the one primitive serves both
// modes (the P4-frozen brand fill) — or a `{ light, dark }` PAIR — theme-ADAPTING,
// dark.ref ≠ light.ref (the INVERSE neutrals + the same-scale roles). The dark cascade
// block redeclares ONLY the pair roles (the flat ones never differ · decision 63).
//
// Reshaped accent-major (N+55 · decision 80 · the projection model §8): the accent NAMES
// are OUT of the type (`Record<string, …>`) so growing the family (slice 2) is "add one
// object," not "edit six role entries + widen the type." The role order is preserved
// (fg · solid · solid-pressed · on-solid · bg-subtle · bg-subtle-pressed) so the emitted
// cascade declarations stay byte-identical.
type AccentRole = string | RefPair;
export const accent = {
  neutral: {
    fg:                  { light: 'neutral.12.light', dark: 'neutral.12.dark' },  // same-scale
    solid:               { light: 'neutral.1.dark',   dark: 'neutral.1.light' },  // INVERSE
    'solid-pressed':     { light: 'neutral.3.dark',   dark: 'neutral.3.light' },  // INVERSE
    'on-solid':          { light: 'neutral.12.dark',  dark: 'neutral.12.light' }, // INVERSE
    'bg-subtle':         { light: 'neutral.3.light',  dark: 'neutral.3.dark' },   // same-scale
    'bg-subtle-pressed': { light: 'neutral.4.light',  dark: 'neutral.4.dark' },   // same-scale
  },
  lilac: {
    fg:                  { light: 'lilac.12.light', dark: 'lilac.12.dark' },      // theme-adapting
    solid:               'lilac.9.light',                                          // FROZEN · P4
    'solid-pressed':     'lilac.10.light',                                         // FROZEN · P4
    'on-solid':          'lilac.12.light',                                         // FROZEN · P4
    'bg-subtle':         { light: 'lilac.3.light', dark: 'lilac.3.dark' },         // theme-adapting
    'bg-subtle-pressed': { light: 'lilac.4.light', dark: 'lilac.4.dark' },         // theme-adapting
  },
  // orange · the second accent (N+56 · slice 2) — same role shape as lilac (a bright
  // brand: solid/solid-pressed/on-solid are P4-FROZEN flat strings, fg + the bg-subtle
  // pair theme-adapt). Purely additive: the emitters loop the accent table.
  orange: {
    fg:                  { light: 'orange.12.light', dark: 'orange.12.dark' },    // theme-adapting
    solid:               'orange.9.light',                                         // FROZEN · P4
    'solid-pressed':     'orange.10.light',                                        // FROZEN · P4
    'on-solid':          'orange.12.light',                                        // FROZEN · P4
    'bg-subtle':         { light: 'orange.3.light', dark: 'orange.3.dark' },       // theme-adapting
    'bg-subtle-pressed': { light: 'orange.4.light', dark: 'orange.4.dark' },       // theme-adapting
  },
} as const satisfies Record<string, Record<string, AccentRole>>;
