# Button-matrix · Frictions (N+4 scratch)

Captured during the web → RN hand-translation at N+4. **Scratch file**
— the curated list with workarounds and target sessions also lives
in `docs/RISKS.md` under R1 (web↔RN behavioural parity) and R5
(thesis validation). This file is the longer-form companion. Anything
that survives a second confirmation in N+5 graduates to a locked
decision or a new principle. n=1 is not enough — see the project's
standing guidance on precommitment.

Entries follow the format in the N+4 prompt:

```
- Gap: <name>
  Where: <file:line>
  Workaround: <what I did now>
  Fix proposed: <what would resolve it>
  Target session: <N+5 | N+6 | long-term>
```

---

## F-LAYOUT-1 · No Stack / HStack / VStack primitives · ✓ retired in N+6.2

- Status: ✓ **retired in N+6.2** ·
  [`lib/components/stack/`](../../../lib/components/stack/) +
  [`lib/components/box/`](../../../lib/components/box/) ship as
  the first two layout primitives under
  [decision 37](../../../decisionlog.md#37-layout-primitives-consume-semantic-vocabulary-via-prop--no-component-token-aliasing--n62).
  The original three-component framing (Stack / HStack / VStack)
  collapsed to **one component with a `direction` prop** (operator
  pick · one fewer entry point at the cost of a less
  self-documenting JSX); padding got its own sibling primitive
  (**Box**) rather than living on Stack, keeping each primitive's
  responsibility crisp.
- Resolution: both sides of the migration-test pair now compose via
  the new primitives. Web side at
  [`index.html`](index.html) uses `<nuri-stack>` + `<nuri-box>`
  (replacing the pre-N+6.2 `.playground-row-group` + `.playground-row`
  page-local styles). RN side at
  [`index.tsx`](index.tsx) defines local `<Stack>` + `<Box>` modules
  (sharing the prop API 1:1 with the web side) and uses them to
  compose the canvas + row groups + rows. The pre-N+6.2 `canvas`
  + `rowGroup` + `row` `StyleSheet.create` entries are gone.
- Pattern locked: layout primitives have NO `@layer tokens` block
  (decision 37 · "no component-token aliasing for parametrized-
  by-prop layout"); attribute-selector CSS in `@layer rules`
  dispatches the prop value (e.g. `gap="md"`) directly to a
  `var(--nuri-space-md)` reference. The pipeline's per-component
  emitter detects the empty `@layer tokens` and skips writing
  `build/components/{stack,box}.ts` — a third branch on the
  [decision 34](../../../decisionlog.md#34-per-component-files--tokenpath-union--set-policy--pipeline-emit-shape--n603)
  emit contract.
- Gap (original): Vertical and horizontal layout containers didn't
  exist as components on either side. Both pages hand-rolled layout —
  web with raw `display: flex` + `gap`, RN with `View` +
  `flexDirection` + `columnGap`.
- Where it landed: see decision 37 in `decisionlog.md` for the full
  body; [`pages/components/stack.html`](../../../pages/components/stack.html)
  + [`pages/components/box.html`](../../../pages/components/box.html)
  for the component pages; [`roadmap/N+6.2.md`](../../../roadmap/N+6.2.md)
  for this session's retrospective.

## F-TOKEN-1 · Semantic-layer tokens not in `build/tokens.json` · ✓ resolved in N+5 · emitter refactored in N+5.5

### N+5.5 addendum

The N+5 emitter shipped a hardcoded `ACCENT_TOKEN_EXPORTS` /
`CHROME_TOKEN_EXPORTS` pair — a drift risk: future contributors
adding a semantic var without a matching list entry would
silently drop it. N+5.5 (decision 28) removed the lists; the
emitter now derives each export's shape from which `[data-<dim>=…]`
blocks declare each var. The six flat `accentX` exports collapse
into a single nested `accent` keyed by `Record<Accent, Record<Theme,
{...}>>`; the migration pair's lookups changed from
`accentSolid[a][t]` → `accent[a][t].solid` (and similar for
`accentSolidPressed`, `accentOnSolid`, `accentFg`). The completeness
invariant is reaffirmed at a higher level: not "the lists cover
every var" but "every var classifies to a known signature and
lands in tokens.ts under its expected leaf."



- Status: ✓ **resolved in N+5** · the semantic-cascade pipeline slice
  shipped across two passes. [`pipeline/tokens-parser.js`](../../../pipeline/tokens-parser.js)
  was split into [`pipeline/parsers/{primitive,semantic}.js`](../../../pipeline/parsers);
  the semantic walker reads the 6-block cascade in
  `styles/tokens-semantic.css`, chases the var() chain through the
  build's `--neutral` scope (cream-default since N+5.8 · gray at N+5
  ship), and emits per-(accent × theme) literals
  into [`build/tokens.ts`](../../../build/tokens.ts) (machine-generated,
  replaces the N+4 hand-rolled stand-in). Drop-in shape preserved —
  the matrix's `import '../../../build/tokens'` stays unchanged. The
  N+5 continuation pass also closed the emit-boundary silent-drop:
  all 18 declared semantic tokens now have a `tokens.ts` export
  (6 accent-keyed + 12 chrome), with a completeness test enforcing
  the disjoint-union invariant.
- Gap (original): The Node parser only emitted primitives (R2 status:
  "partially mitigated"). The matrix needed `accent-solid`,
  `accent-solid-pressed`, `accent-on-solid`, `bg-strong`,
  `bg-pressed`, `text-primary` — all semantic. Had to hand-resolve
  by reading `tokens-semantic.css` manually.
- Sub-finding (original): dark-theme primitives unverified by
  inspection — the N+4 hand-rolled `tokens.ts` carried best-effort
  placeholders for `gray-{1,3,4,11,12}-dark`. **Bonus catch from the
  slice**: `lilac-8` was incorrectly marked "bright frozen" in the
  hand-rolled version (only `lilac-9` and `lilac-10` are frozen). The
  generated file corrects dark focus-ring to `#6c58a3` (was `#ae91ff`).
  This is exactly the drift the slice is built to catch.
- Where it landed: [pipeline/parsers/semantic.js](../../../pipeline/parsers/semantic.js)
  · cross-product round-trip tests at [pipeline/tokens-parser.test.js](../../../pipeline/tokens-parser.test.js)
  with a hand-derived oracle covering all 18 × 4 = 72 resolutions
  and an explicit P4 asymmetry assertion · `docs/RISKS.md` R2 status
  updated to "primitives + semantic mitigated".

## F-ICON-RN-1 · No RN glyph renderer for the shared icon registry · ✓ resolved in N+6.8

- Status: ✓ **resolved in N+6.8** ·
  [decision 48](../../../decisionlog.md#48-typed-buildiconsts-emit--svgxml-over-the-shared-registry--one-registry-two-readers--n68).
  The web `<nuri-icon>` inlines an SVG path string keyed by `name`
  (registry-based JS dispatch ·
  [decision 38](../../../decisionlog.md#38-icon-component--phosphor-source--nuri-icon-name-nuri-facade--2-size--fill--registry-based-js-dispatch--n63));
  the RN side had no glyph renderer — IconButton carried an honest
  empty `<View>` stub across four sessions (N+6.4–N+6.7) rather than a
  partial renderer that would mask the gap.
- Resolution: the pipeline now emits a typed
  [`build/icons.ts`](../../../build/icons.ts) from
  [`lib/components/icon/icons.js`](../../../lib/components/icon/icons.js)
  (the SSOT · 17 glyphs × {regular, bold, fill}), drift-guarded by a
  sync subtest in
  [`pipeline/tokens-parser.test.js`](../../../pipeline/tokens-parser.test.js)
  (every emitted path string must equal `icons.js`). The RN `Icon`
  ([`index.tsx`](index.tsx)) re-wraps the registry path in the phosphor
  `viewBox="0 0 256 256"` shell and feeds it to `react-native-svg`'s
  `SvgXml` (`currentColor` → the `color` prop), with weight coupling
  identical to icon.js (md→regular · sm→bold · any+fill→fill).
  IconButton now **composes** that real `Icon` in place of the `View`
  stub — the RN analogue of the web funnel where `<nuri-icon-button>`
  wraps `<nuri-icon>`. The `fill` passthrough (amendment 40.1) is now
  live.
- Pattern locked: **one registry, two readers** (web inline + RN
  `SvgXml` over the same emitted strings) · **no** SVGR / per-glyph
  `<Path>` codegen (that would fork the glyph source into a second
  hand-maintained shape and break the single-registry invariant
  decision 38 rests on). `react-native-svg` is **not** a dependency —
  a local type shim
  ([`react-native-svg.d.ts`](react-native-svg.d.ts)) declares only the
  `SvgXml` surface the Icon consumes; the proof is type-only (`tsc`
  exit 0 · spec repo, no RN runtime). When a real RN build lands,
  delete the shim and add the package; the swap is mechanical.
- Where it landed: [decision 48](../../../decisionlog.md) for the full
  body · [`pipeline/parsers/icons.js`](../../../pipeline/parsers/icons.js)
  (the emitter) · [`roadmap/N+6.8.md`](../../../roadmap/N+6.8.md) for
  the retrospective.

## F-SCOPE-1 · Tier 3 needs one Context provider per dimension · directional decision locked in N+5.5

### N+5.5 addendum

Decision 27 (N+5.5) locks the direction: **single composite
`NuriScope` over a single `NuriThemeContext` with merge-on-override
semantics** — orthogonal, one field per dimension, no cross-product
theme registry (672 themes at 8 × 3 × 2 × 7 = the reductio for the
roadmap dimensions). Spec'd at
[`lib/components/scope/README.md`](../../../lib/components/scope/README.md);
working RN file deferred to the next migration test that actually
exercises multi-dim scope (N+6 or later). The matrix in this pair
still uses only `accent`, so the friction remains "directional
decision locked, n=1 confirmation pending."

### N+13 addendum · CLOSED

The mirrors now IMPLEMENT the locked shape: [`_shared.tsx`](_shared.tsx)
exposes a single `NuriThemeContext` (`{ mode, accent }`) + the composite
`NuriScope` with merge-on-override, replacing the two per-dimension
contexts (`AccentContext` + `ThemeContext`) this pair carried before —
the shape decision 27 had REJECTED. Every mirror reads one
`useContext(NuriThemeContext)`; the Tier-3 demo is `<NuriScope
accent="neutral">` (accent flips, mode inherits). Two live dimensions =
the n=1 confirmation; the composite-vs-per-dimension question closes in
the composite's favour. `density` / `neutral` stay reserved (not context
entries · P11) until their web tokens ship.
**F-SCOPE-1 CLOSED** ([decision 62](../../../decisionlog.md#62-nurithemecontext-implemented--the-single-orthogonal-theming-context-lands-in-the-migration-test--n13)
· [RISKS R1](../../RISKS.md) is the SSOT). The N+5.5 gap/where/fix notes
below are kept as the historical record of the friction before closure.



- Gap: Web `<nuri-scope accent="neutral" mode="dark" font="android">`
  declares all dimensions on one element. RN needs one Provider per
  dimension (`AccentProvider`, `ThemeProvider`, `FontProvider`, …).
  Nesting depth grows linearly with scope dimensions.
- Where: [docs/migration-tests/button-matrix/index.tsx:63-64](index.tsx) `AccentContext` / `ThemeContext`
  declared at module scope; [`AccentProvider`](index.tsx) is the Tier 3
  analogue at lines 70-73. Theme provider declared but no multi-dim
  usage in this matrix.
- Workaround: one context per dimension; the matrix only exercises
  accent so no nesting friction visible yet. The cost surfaces when
  a screen needs multiple scope dims at once.
- Fix proposed: pipeline emits one Provider per dimension AND a
  composite `<NuriScope>` helper that accepts multiple props and
  nests them internally — mirrors the web `<nuri-scope>` ergonomics.
  Trade-off: pure React-Context purity vs API symmetry. The latter
  matches the stated mapping in [AGENTS.md "Mapping to React Native"](../../../AGENTS.md).
- Target session: **codify after N+5** — confirmation needed that
  multi-dim scope is actually load-bearing. Currently theoretical.

## F-SCOPE-2 · Tier 2 (self-scope) IS 1:1 — confirmation

- Gap: none. `<nuri-button accent="neutral">` ↔ `<Button accent="neutral">`
  works identically at the API layer. Both override the ambient
  scope; the RN side reads from `useContext` if prop absent.
- Where: [docs/migration-tests/button-matrix/index.tsx:115](index.tsx) — `accent: Accent = accentProp ?? ambientAccent`.
- Workaround: n/a — it's a positive finding.
- Fix proposed: n/a. Worth recording because R1's "1:1 at props,
  not behaviour" gets sharpened: Tier 2 (the most common case) is
  even behaviourally 1:1 modulo the runtime difference (CSS cascade
  vs Context). The "1:1 at props" claim holds for self-scope.
- Target session: n/a (positive control — keep N+5 honest by leaving
  this in scope when re-evaluating).

## F-PRESSED-1 · `:active` vs Pressable `pressed` — different mechanism

- Gap: Web's `:active` fires automatically via the CSS pseudo-class.
  RN's `Pressable` exposes `pressed` either via render-prop or via
  `onPressIn`/`onPressOut` callbacks. To swap the background colour
  on press, the RN side passes a function to `style=`. Different
  mental model; the per-state token reference reads identically
  (`accent-solid-pressed` → `accentSolidPressed[accent][theme]`).
- Where: [docs/migration-tests/button-matrix/index.tsx:125-130](index.tsx) — `style={({ pressed }) => [...]}`.
- Workaround: use the render-prop signature of `style`. Compute
  `pressed`-branched background and transform inline.
- Fix proposed: when the RN Button component is generated by the
  pipeline, render-prop style is the canonical pattern. Document on
  Button's page (R1 mitigation: "document the behavioural delta
  explicitly per component" — the Button page should grow a
  "Behavioural delta · web ↔ RN" section).
- Target session: **N+5** if Button gets a behaviour-delta section
  added; otherwise hold for the second component as confirmation
  that the pattern generalises.

## F-FOCUS-1 · No `:focus-visible` analogue in RN

- Gap: Web `button.css` has
  `:focus-visible { outline: 2px solid var(--nuri-focus-ring); outline-offset: 2px; }`
  for keyboard focus. RN has no DOM-style focus model; the OS
  handles assistive-tech focus via `accessibilityRole` /
  `accessible`. The visual ring simply doesn't translate.
- Where: [lib/components/button/button.css:182-185](../../../lib/components/button/button.css) (web · the gap)
  · [docs/migration-tests/button-matrix/index.tsx:123-124](index.tsx) (RN · the substitution via
  `accessibilityRole="button"` + `accessibilityState`)
- Workaround: RN button uses `accessibilityRole="button"` +
  `accessibilityState={{ disabled }}`. The visual focus ring is
  web-only and intentionally absent on RN.
- Fix proposed: document on Button's page as the canonical
  behavioural delta. This is the cleanest example of "props 1:1,
  behaviour diverges" for R1 — no API change, but a visible-vs-
  invisible delta the migration agent must explain.
- Target session: **N+5** with a "Behavioural delta" section in the
  Button docs template (also relevant for F-PRESSED-1).

## F-FONT-1 · `font-family: inherit` is meaningless on RN

- Gap: Web button inherits `font-family` from `<body>` via
  `font-family: inherit`. RN has no Text inheritance — every
  `<Text>` must specify its own `fontFamily` (or inherit from a
  parent `<Text>`, which `<Pressable>` doesn't propagate).
- Where: [lib/components/button/button.css:138](../../../lib/components/button/button.css) (web · `font-family: inherit`)
  · [docs/migration-tests/button-matrix/index.tsx:192-196](index.tsx) (RN · `styles.label` has no fontFamily set,
  falls back to the platform default)
- Workaround: RN side relies on the platform default for the
  matrix's button labels. Production-shape would add explicit
  `fontFamily` derived from the `font-family-sans` token.
- Fix proposed: pipeline emits `fontFamily` token values and the
  generated RN Button declares it explicitly. Once typography
  tokens flow through the pipeline (next-next slice), this fixes
  itself.
- Target session: when typography tokens enter the pipeline (TBD).

## F-DISABLED-1 · `[disabled]` ↔ `disabled` prop · trivial 1:1

- Gap: web attribute `<nuri-button disabled>` → RN `<Button disabled>`.
  Both suppress activation, both apply opacity 0.4. Web additionally
  shows `cursor: not-allowed` (no RN analogue — cursor is web-only).
- Where: [lib/components/button/button.css:175-179](../../../lib/components/button/button.css) · [docs/migration-tests/button-matrix/index.tsx:122,129](index.tsx)
  (RN side · `disabled={disabled}` on Pressable plus `opacity`
  branch in the style array)
- Workaround: n/a — works on both sides.
- Fix proposed: record `cursor: not-allowed` as web-only divergence
  (paired with F-FOCUS-1 in the future Button behavioural-delta
  section). No code change needed.
- Target session: docs-only update at N+5 if the behavioural-delta
  pattern goes into the template.

---

## At-a-glance counts

- **8 frictions captured at N+4** · 4 implementation gaps
  (~~F-LAYOUT-1~~ ✓, ~~F-TOKEN-1~~ ✓, F-PRESSED-1, F-SCOPE-1), 2
  documentation gaps (F-FOCUS-1, F-FONT-1), 2 positive controls
  (F-SCOPE-2, F-DISABLED-1). **+1 implementation gap added later**
  (~~F-ICON-RN-1~~ ✓ · the icon registry postdates the N+4 scratch ·
  resolved N+6.8 · entry above).
- **F-TOKEN-1 resolved in N+5** · the semantic-cascade pipeline slice
  shipped; `build/tokens.ts` is now machine-generated. See R2 in
  RISKS.md and the F-TOKEN-1 entry above.
- **F-LAYOUT-1 resolved in N+6.2** · Stack + Box layout primitives
  ship under decision 37; both sides of the migration-test pair
  retired their hand-rolled flex styles. See the F-LAYOUT-1 entry
  above + `roadmap/N+6.2.md`.
- **F-ICON-RN-1 resolved in N+6.8** · typed `build/icons.ts` emit +
  RN `Icon` over `react-native-svg` `SvgXml`; IconButton composes the
  real glyph (one registry, two readers · decision 48). See the
  F-ICON-RN-1 entry above + `roadmap/N+6.8.md`.
- **2 behavioural deltas** worth documenting on Button (F-PRESSED-1,
  F-FOCUS-1, plus F-DISABLED-1's cursor as a paired note) — feed
  into R1 mitigation ("document delta per component"). Target N+6.3
  alongside the second component page.
- **1 design pivot point** (F-SCOPE-1) deferred — multi-dim scope not
  yet exercised on RN.
- **2 positive controls** (F-SCOPE-2, F-DISABLED-1) — keep around
  when re-evaluating to prevent the catalogue skewing pessimistic.

## What the matrix DID NOT exercise

- Multi-dimensional scope (theoretical · only `accent` used).
- Pressed state visual swap on RN under real touch · only static
  proof via `style={({ pressed }) =>}` shape. Real validation
  needs an Expo session at N+5 or N+6.
- Dark theme on either side · `tokens.ts` has dark values but the
  matrix renders light only.
- Bright-family asymmetry across themes · lilac is "frozen" so the
  asymmetry of P4 didn't show up. A `mode="dark"` row would
  surface it. N+5 candidate.
- Custom fonts · platform default everywhere (F-FONT-1).

These are the "unknowns surfaced as unknowns" — explicit in
FRICTIONS.md so they don't silently get filed as "validated".
