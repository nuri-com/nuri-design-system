/* ──────────────────────────────────────────────────────────────
 * NURI · @nuri/doc · FOUNDATIONS → doc IR (N+48 · A4c)
 *
 * Reshapes @nuri/spec's TOKEN SoTs (the cascade's base · L1 primitives → L2 the
 * accent×theme matrix) into the IR the doc-gen renders — the foundations-family
 * sibling of axis-ir.js (the axes) and descriptor-ir.js (the components). This
 * CLOSES decision 75's 3-family set (Components ✓ · Axes ✓ · Foundations).
 *
 * The token vocabulary is TARGET-NEUTRAL (a px value, a hex — identical on web and
 * RN), so these pages are naturally AGNOSTIC: no `Input | Web | RN | Value` grammar
 * (the axes' realization split), just RESOLVING-VALUE tables — input → the cascade
 * `{ref}` → the resolved value (+ a colour swatch). The palette-axis idiom, applied
 * to the base the axes reference by name (`space` scale · `type` scale).
 *
 * THREE subjects, THREE shapes (each builder a PURE function of its loaded-SoT data ·
 * read by build.js / Guard G via the strip.js loader · NEVER spec's pipeline code ·
 * decision 75):
 *   · dimension ← dimensions.ts + tokens — the L1 px primitives + the L2
 *                 space/size/radius scales, each leaf's `{ref}` cascade + resolved px.
 *   · colour    ← colours.ts + the role resolver — L1 primitive ramps (theme-fixed
 *                 literal swatches) + L2 semantic roles (live `var()` swatches).
 *   · typography ← tokens.type + tokens.emphasisWeight — the 6 type-step composites
 *                 + the orthogonal emphasis weight (decision 77 · the de-fused shape).
 *                 The type SCALE stays CSS-SoT (the honest asymmetry · the page reads
 *                 the resolved DATA, the provenance header cites the CSS source).
 * ────────────────────────────────────────────────────────────── */

// ── dimension ← dimensions.ts (px L1 + space/size/radius L2) + the resolved px
// (tokens · already px-suffixed by buildDocTokenInputs). The px scale: key == px
// (decision 32 · --nuri-px-N is N pixels). Each L2 leaf is `{ ref: Px }` (the
// cascade — names a primitive) OR a `{ value, unit }` literal sentinel (space.none ·
// radius.full · outside the px scale by design). Show the pointer + its resolution. ──
const DIM_SCALES = ['space', 'size', 'radius'];

export function foundationsDimensionIr(dims, tokens) {
  const primitives = Object.keys(dims.px).map((k) => ({ token: `px-${k}`, value: `${k}px` }));
  const scales = DIM_SCALES.map((name) => ({
    name,
    rows: Object.entries(dims[name]).map(([leaf, def]) => ({
      token: `${name}.${leaf}`,
      cascade: 'ref' in def ? { ref: `px-${def.ref}` } : { literal: true },
      value: tokens[name][leaf], // the resolved px (string · e.g. '12px' · buildDocTokenInputs)
    })),
  }));
  return { source: 'dimension', kind: 'dimension', primitives, scales };
}

// ── colour · TWO pages (the operator's granularity call · the archived hand split):
//   · colour-primitive ← the raw catalog: the ACTIVE cream neutral ramp + lilac
//                  (themed · light+dark literal swatches) + the black/white alpha
//                  overlays (theme-invariant · one literal swatch). Theme-FIXED →
//                  literal swatches (not live var() · these are primitives, not roles).
//                  Only cream is live (decision 31 · build-time --neutral selection ·
//                  NOT all 7 candidates).
//   · colour-semantic ← chrome (theme-only · accent-invariant) + accent (accent ×
//                  theme). Each role → its default-scope cascade ref + a LIVE var()
//                  swatch + the resolved hex (makeRoleResolver · the slice the palette
//                  AXIS samples). The SoT is accent-MAJOR (N+55 · decision 80), so the
//                  default scope is the `neutral` accent's role table; a role is a flat
//                  `string` ref or a `{light,dark}` pair (the light arm is the default
//                  scope). The accent keys are bare (`solid`); the role NAME the var
//                  registry keys is `accent-<key>` (palette-surface's spelling). chrome
//                  keys are already the full role name (`bg-canvas`).
const ALPHA_RAMPS = [['Black alpha', 'blackAlpha'], ['White alpha', 'whiteAlpha']];

export function foundationsColourPrimitiveIr(cols) {
  const themed = (rows) =>
    Object.entries(rows).map(([step, leaf]) => ({ step, light: leaf.light.value, dark: leaf.dark.value }));
  const flat = (rows) =>
    Object.entries(rows).map(([step, leaf]) => ({ step, value: leaf.value }));
  const ramps = [
    { name: 'Neutral (cream)', mode: 'themed', rows: themed(cols.neutralScales.cream) },
    { name: 'Lilac', mode: 'themed', rows: themed(cols.lilac) },
    ...ALPHA_RAMPS.map(([name, key]) => ({ name, mode: 'flat', rows: flat(cols[key]) })),
  ];
  return { source: 'colour-primitive', kind: 'colour-primitive', ramps };
}

export function foundationsColourSemanticIr(cols, roleColor) {
  // A semantic role → its row: the default-scope (neutral · light) cascade ref + the
  // live var() swatch + the default-scope hex. `roleName` maps the SoT key to the var
  // registry's role NAME; `lightRef` reads the default-scope arm's `{ref}` pointer.
  const semanticRows = (table, roleName, lightRef) =>
    Object.entries(table).map(([key, def]) => {
      const role = roleName(key);
      const { var: cssVar, hex } = roleColor(role);
      return { role, cascade: lightRef(def), var: cssVar, hex };
    });
  const semantics = [
    { name: 'Chrome', rows: semanticRows(cols.chrome, (k) => k, (def) => def.light) },
    { name: 'Accent', rows: semanticRows(cols.accent.neutral, (k) => `accent-${k}`, (def) => typeof def === 'string' ? def : def.light) },
  ];
  return { source: 'colour-semantic', kind: 'colour-semantic', semantics };
}

// ── typography ← tokens.type (the 6 size composites) + tokens.emphasisWeight (the
// orthogonal override · decision 77 · the N+45 de-fusion). Reads the resolved DATA
// projection; the SCALE stays CSS-SoT (styles/typography.css · the manifest's
// provenance header cites it · the honest asymmetry vs colour/dimension, which are
// TS-SoT post N+31/N+32). The composite is { fontSize · lineHeight · fontWeight ·
// letterSpacing } per step; emphasis is NOT a separate step (the de-fusion's point ·
// contrast the old fused `${size}Em` twins) — one weight, uniform across all sizes. ──
export function foundationsTypographyIr(tokens) {
  const steps = Object.entries(tokens.type).map(([step, t]) => ({
    step,
    fontSize: t.fontSize,
    lineHeight: t.lineHeight,
    weight: t.fontWeight,
    letterSpacing: t.letterSpacing,
  }));
  return { source: 'typography', kind: 'typography', steps, emphasisWeight: tokens.emphasisWeight };
}

// ── The foundations manifest — { source slug · nav_order · the SoT header path · the
// one-line lead · the IR builder }. @nuri/doc owns WHICH foundations it documents +
// the nav order (the cascade's three subjects · colour → dimension → typography). Each
// `build(d)` is a pure function of the loaded-SoT data bag (build.js / Guard G feed
// the same `d`). The leads honour the web/RN framing (operator note · RN production ·
// web prototyping/doc) where a lead frames realization — but tokens are target-neutral,
// so the pages are agnostic by nature.  ──
export const FOUNDATION_DOCS = [
  {
    source: 'colour-primitive',
    nav: 1,
    src: 'packages/spec/tokens/colours.ts',
    lead: 'The colour primitives — the cascade’s L1 raw catalog: the active **cream** neutral ramp (decision 31 · build-time `--neutral` selection), the **lilac** brand scale, and the black/white alpha overlays. Each is a theme-fixed literal (a hex / rgba · identical on both targets) shown as a swatch; the semantic roles that compose them live on the [Colour Semantic](colour-semantic.html) page.',
    build: (d) => foundationsColourPrimitiveIr(d.colours),
  },
  {
    source: 'colour-semantic',
    nav: 2,
    src: 'packages/spec/tokens/colours.ts',
    lead: 'The colour semantics — the cascade’s L2 role matrix, composed from the [primitives](colour-primitive.html) by reference: **chrome** (theme-only · the neutral surface) and **accent** (accent × theme). Each role names a primitive (the `{ref}` cascade) and resolves to a live `var()` swatch at the page scope (the default is neutral accent · light theme). This is the full set the palette **axis** samples a slice of.',
    build: (d) => foundationsColourSemanticIr(d.colours, d.roleColor),
  },
  {
    source: 'dimension',
    nav: 3,
    src: 'packages/spec/tokens/dimensions.ts',
    lead: 'The dimension foundation — the L1 direct-pixel primitives (`px-N` is N pixels · decision 32) and the L2 `space` · `size` · `radius` scales that reference them. Each semantic leaf names a primitive (the cascade) or sits outside it as a literal sentinel (`space.none` · `radius.full`). One px value, both targets.',
    build: (d) => foundationsDimensionIr(d.dimensions, d.tokens),
  },
  {
    source: 'typography',
    nav: 4,
    src: 'packages/rn/generated/tokens.ts · packages/prototype/generated/styles/typography.css · packages/prototype/generated/styles/tokens-primitive.css',
    lead: 'The typography foundation — the six type-scale steps (`xs`…`3xl`), each a composite of font-size · line-height · weight · letter-spacing, plus the orthogonal **emphasis** weight override (decision 77). The scale stays **CSS-authored** (`styles/typography.css` · the honest asymmetry vs colour/dimension); this page reads the resolved composite from `@nuri/spec`. RN realizes a step via `typeStyle` (production); web via the `[data-type-style]` attribute (prototyping and these docs).',
    build: (d) => foundationsTypographyIr(d.tokens),
  },
];
