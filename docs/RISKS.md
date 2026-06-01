# Risks · Nuri

**Date drafted**: 2026-05-27 (during N+3 philosophy brainstorm)
**Last updated**: 2026-06-01 (N+13 close · migration-test reconciliation
— the RN mirrors now IMPLEMENT decision 27's single `NuriThemeContext`
(`{ mode, accent }`) + composite `NuriScope` with merge-on-override,
replacing the two per-dimension contexts the examples carried before ·
**F-SCOPE-1 now CLOSED** [decision 62 · n=1 confirmation] · spec
[scope page + README] and examples now describe each other with zero
residual gap · D1–D4 faithful drift adds [Box `background`/`radius`,
Button `size`, Tab `disabled`, IconButton emitted-token deref] with
friction-deltas logged · prior N+6.9 note: List building blocks batch 1
[Separator decision 49 + IconAvatar decision 50] · new **F-DECORATIVE-1** ·
F-ICON-RN-1 / F-LAYOUT-1 / F-TOKEN-1 remain CLOSED/retired)
**Status**: Living document. Sister to [`decisionlog.md`](../decisionlog.md) and
[`roadmap/index.md`](../roadmap/index.md). Updated each session as risks
resolve or new ones emerge.

This file enumerates the open risks in Nuri's design and process. Each
risk names a specific failure mode visible from the project's own
choices, not generic project-management hazards. Each has a
mitigation path linked to current or future work.

The risks are deliberately ordered by leverage of mitigation — R1 + R2
+ R5 carry the most downstream cost if left open; R6 is acknowledged
but lowest priority.

---

## R1 · "Web↔RN API 1:1" — props parity ≠ behavioural parity

**Failure mode**. The thesis "web component API 1:1 with RN component →
translation is cosmetic syntax" holds at the props layer (`variant`,
`accent`, `disabled`) but breaks at the behaviour layer. Web and RN
diverge on:

- **Layout** · no CSS Grid in RN. Flexbox `gap` is recent and uneven
  across RN versions. A composition using grid-template on web does
  not translate.
- **Touch** · `:active` fires on press/click; `Pressable` has explicit
  `onPressIn`/`onPressOut` with different cancellation semantics
  (scroll cancellation, press-in delay).
- **Text** · `numberOfLines` truncation differs from CSS `line-clamp`;
  line-height inheritance and text wrapping are not bit-identical.
- **Accessibility** · web `<button>` ships role + keyboard navigation
  + focus ring by default. RN `Pressable` requires explicit
  `accessibilityRole`, `accessible`, focus state.

**Why it matters**. The rhetorical claim "cosmetic syntax translation"
sets an expectation that the first behaviourally complex component
will break loudly. The illusion's collapse is more disruptive than
naming the gap up front.

**Mitigation**.
- Reframe "1:1" as "props 1:1, behaviour budgeted per-component"
- For each component, document the behavioural delta explicitly in
  the page (focus, accessibility, gesture, text behaviour)
- Sequence components by behavioural simplicity first (Tag,
  IconButton, Card) before complex ones (Sheet, AmountInput)
- ✓ **Frictions captured (N+4)** at
  [`docs/migration-tests/button-matrix/FRICTIONS.md`](./migration-tests/button-matrix/FRICTIONS.md)
  — 8 entries from the Button-only matrix, including 2 behavioural
  deltas (F-PRESSED-1, F-FOCUS-1) and 1 positive control (F-SCOPE-2,
  Tier 2 self-scope IS 1:1 modulo runtime). Scratch file dissolves
  into this register at the next session unless N+5 confirms a
  pattern that warrants its own principle.

**Frictions list · N+4 (Button matrix, 8 buttons, lilac/neutral · light)**

For each, format is: gap · where · workaround · fix proposed · target.
Full version in
[`docs/migration-tests/button-matrix/FRICTIONS.md`](./migration-tests/button-matrix/FRICTIONS.md).

- **F-PRESSED-1** · `:active` ↔ Pressable `pressed` is the same role
  played by different mechanisms · button.css uses CSS pseudo-class
  + `transform: scale()`; RN uses render-prop signature
  `style={({ pressed }) => …}` + manual transform · workaround: render-prop
  in `index.tsx` · proposed: a "Behavioural delta" section on the
  Button docs page (decision 24 already names anatomy + token-map
  as wiring spec; the delta section is the third surface for the
  migration agent) · ✓ **shipped N+6.4** · the Behavioural-delta
  section landed under
  [amendment 24.1](../decisionlog.md#241-amendment--n64--behavioural-delta-section),
  backfilled to Button and forward to IconButton — both pages now
  carry an `F-PRESSED-1` row stating the `:active`/`scale()` ↔
  `Pressable pressed` render-prop delta. (Slipped from the proposed
  N+5 target to N+6.4, the n=2 confirmation point.)

- **F-FOCUS-1** · `:focus-visible` outline is web-only · RN has no
  DOM focus model · workaround: `accessibilityRole="button"` +
  `accessibilityState` substitute the behaviour; the visual ring is
  intentionally absent · ✓ **shipped N+6.4** · documented in the
  Behavioural-delta section on Button + IconButton (the cleanest
  "props 1:1, behaviour diverges" example).

- **F-SCOPE-1** · ✓ **CLOSED · N+13**
  ([decision 62](../decisionlog.md#62-nurithemecontext-implemented--the-single-orthogonal-theming-context-lands-in-the-migration-test--n13)) ·
  Tier 3 (`<nuri-scope multi-dim>`) → one Context
  provider per dimension on RN · linear nesting cost · workaround:
  `AccentProvider` alone in the matrix (one dim) · proposed: pipeline
  emits `<NuriScope accent={…} mode={…}>` composite that nests
  internally — preserves the web-side ergonomics. Trade-off vs pure
  per-dim providers. · **N+5.5 update**: directional decision 27
  picks the composite (single `NuriThemeContext` with
  merge-on-override semantics; one entry per dimension). Spec'd in
  [`lib/components/scope/README.md`](../lib/components/scope/README.md).
  Target at the time: **n=1 confirmation at the next multi-dim
  migration test** (N+6+) before promoting to "shipped" — met in N+13
  (see resolution below).
  · **N+12a**: the reader-facing consolidation now lives at
  [`pages/components/scope.html`](../pages/components/scope.html)
  (web cascade mechanism + RN `NuriThemeContext` spec + cascade↔context
  delta in one page · linked "start here" from the impl-guide migration
  section). This R1 entry remains the SSOT for the friction code; the
  page points back here rather than restating the budget.
  · **N+13 resolution**: the migration mirrors now IMPLEMENT decision
  27's locked shape — `_shared.tsx` exposes a SINGLE `NuriThemeContext`
  (`{ mode, accent }`) + the composite `NuriScope` with merge-on-override,
  replacing the two per-dimension contexts (`AccentContext` + `ThemeContext`)
  the examples carried before (the shape decision 27 had REJECTED). Every
  mirror reads one `useContext(NuriThemeContext)`; the Tier-3 demo is
  `<NuriScope accent="neutral">` (accent flips, mode inherits — the
  merge-on-override exercise). The single context carries two dimensions, so
  this is the **n=1 confirmation** decision 27 awaited; the composite-vs-
  per-dimension question closes in the composite's favour. `density` /
  `neutral` remain reserved (not context entries · P11) until their web
  tokens ship; full beyond-two-dim confirmation reactivates then. The spec
  (scope page + README) and the examples now describe each other with **zero
  residual gap**.

- **F-LAYOUT-1** · ✓ **retired in N+6.2** ·
  [`lib/components/stack/`](../lib/components/stack/) +
  [`lib/components/box/`](../lib/components/box/) ship as the first
  two layout primitives under
  [decision 37](../decisionlog.md#37-layout-primitives-consume-semantic-vocabulary-via-prop--no-component-token-aliasing--n62).
  Both sides of the
  [migration-test pair](./migration-tests/button-matrix/index.tsx)
  composed their layout via the new primitives — web side uses
  `<nuri-stack>` + `<nuri-box>` (replacing `.playground-row-group`
  + `.playground-row` page-local styles); RN side defines local
  `<Stack>` + `<Box>` components sharing the prop API 1:1 (the
  long-term RN spec home is now an Open question in
  `roadmap/index.md`). Pattern locked: `direction` / `gap` / `align`
  / `justify` / `wrap` / `as` on Stack; `padding` / `padding-x` /
  `padding-y` + 4 edge-specific / `center` / `as` on Box; both
  consume the 5-leaf subset (`xs/sm/md/lg/xl`) of the semantic space
  vocabulary. The Tier-1 layout-primitive pattern (no
  component-token aliasing · attribute-dispatch CSS) is now
  evidence for the P3 mechanical-enforcement Open question in
  `roadmap/index.md` (the carve-out shape is "empty `@layer tokens`
  → exempt from P3 grep").

- **F-TOKEN-1** · ✓ **retired in N+5** · `build/tokens.ts` is now
  machine-generated by [`pipeline/tokens-parser.js`](../pipeline/tokens-parser.js)
  via the new semantic walker in
  [`pipeline/parsers/semantic.js`](../pipeline/parsers/semantic.js). All 18
  semantic tokens × 2 accents × 2 themes resolve through the var()
  chain to primitive literals and ALL 18 are exposed as exports
  (6 accent-keyed + 12 chrome — the N+5 continuation closed the
  emit-boundary silent-drop). The migration pair's `import
  '../../../build/tokens'` is unchanged (drop-in shape preserved).
  Cross-product round-trip + P4 asymmetry + export-completeness
  tests live at
  [`pipeline/tokens-parser.test.js`](../pipeline/tokens-parser.test.js).
  Side finding: the hand-rolled `tokens.ts` had `lilac-8` marked
  "bright frozen" but only `lilac-9` and `lilac-10` are frozen —
  the generated file corrects dark focus-ring to `#6c58a3`. See R2
  status for the broader pipeline picture.

- **F-SCOPE-2** · Tier 2 self-scope IS 1:1 (positive control) ·
  `<nuri-button accent="neutral">` ↔ `<Button accent="neutral">`,
  both override ambient · n/a · keep in scope when re-evaluating R1
  so the catalogue doesn't skew pessimistic. · **target: n/a**.

- **F-SCOPE-3** · Tier-2 self-scope under an opposite-theme ancestor ·
  ✓ **web cascade clobber FIXED · N+15** ([decision 63](../decisionlog.md#63-accentxtheme-self-scope-cascade-clobber--descendant-combinator-dark-blocks-4b6b--web-css-only--n15)).
  A self-scoped `data-accent` element sets accent but NOT theme, so inside
  a dark scope it re-declared the LIGHT accent value and clobbered the
  inherited dark (swap IconButton went dark-on-dark · invisible). Fixed
  web-side with descendant-combinator dark blocks
  (`[data-theme="dark"] [data-accent="X"]`) that re-assert the dark value
  when a dark ANCESTOR exists. **RN is immune** (single
  `NuriThemeContext` · `tokens[accent][mode]` · no cascade) — this is a
  **positive control for the RN model**, like F-SCOPE-2. **Residual
  limitation (revisit-trigger):** a descendant combinator matches ANY
  dark ancestor, not the NEAREST theme — a self-scoped accent in a LIGHT
  scope nested in a DARK scope resolves DARK (wrong). No consumer nests
  opposite themes around a self-scoped accent today (playground scopes
  one theme per device frame), so accepted per P11. · **target: revisit
  if a nested-opposite-theme consumer lands; the per-element-theme · RN
  single-context model is the clean fix there.**

- **F-DISABLED-1** · `[disabled]` ↔ `disabled` prop is trivial 1:1 ·
  only delta is `cursor: not-allowed` (web-only) · n/a · ✓ **shipped
  N+6.4** · cursor-divergence recorded in the Behavioural-delta
  section on Button + IconButton. IconButton additionally sets
  `pointer-events: none` on its disabled inner button.

- **F-FONT-1** · `font-family: inherit` doesn't propagate through
  `Pressable` on RN · RN side relies on platform default in the
  matrix · proposed: pipeline emits `fontFamily` from primitive
  token; generated Button declares it explicitly. · **target:
  typography-tokens pipeline slice** (TBD). · **N+6.7 widened the
  surface**: TypographyStack is the first component whose *size /
  weight / line-height* must reach RN, and the primitive `type` set is
  **pipelineInline** ([decision 34](../decisionlog.md#34-per-component-files--tokenpath-union--set-policy--pipeline-emit-shape--n603))
  — so `build/tokens.ts` exposes **no runtime font namespace** to
  dereference. The RN
  [`TYPOGRAPHY_SIZES`](./migration-tests/button-matrix/index.tsx)
  record therefore **hand-declares** the px metrics from the
  `--nuri-type-*` primitives (lg=22 / md=17 / sm=15 · em 600 / regular
  400 · line-heights 1.27/1.29/1.33), while **colour** resolves cleanly
  from the runtime `chrome` set exactly as the web `[data-muted]`
  dispatch does (muted → `textMuted`, else `textPrimary`). The colour
  half is pipeline-derived 1:1; the metric half is a **hand-maintained
  parity guard** — the same gap F-FONT-1 names, now realised at a real
  component. The eventual typography-token pipeline slice (emitting a
  runtime `type` namespace) would retire the hand-declaration; until
  then the metric table is the single declared mapping read both sides.
  · **N+8.2 update** ([decision 53](../decisionlog.md#53-typographystack--element-eliminated--muted-on-typography--n82)):
  the former `TypographyStackElement` + its `level` → `data-level`
  colour dispatch were **eliminated**; the stack now composes plain
  `<nuri-typography>` lines and colour dispatches off the new `muted`
  boolean (`[data-muted]`). The hand-declared metric gap this risk names
  is unchanged — it moves from `TYPOGRAPHY_STACK_LEVELS` to
  `TYPOGRAPHY_SIZES` but stays hand-maintained until the type-emit slice
  (N+8.3 · reverse of [decision 34](../decisionlog.md#34-per-component-files--tokenpath-union--set-policy--pipeline-emit-shape--n603)).
  · **N+8.3 update — metric half RESOLVED** ([decision 54](../decisionlog.md#54-type-scale-emitted-as-a-directly-accessed-namespace--one-source-two-readers--n83)):
  the type scale is now an EMITTED, directly-accessed `type` namespace in
  `build/tokens.ts` (one source, two readers · the icon model). RN
  dereferences it via the `typeStyle(key)` helper and the hand-declared
  `TYPOGRAPHY_SIZES` record is **removed** — so the **size / weight /
  line-height / tracking** half of this gap is closed and machine-guarded
  (a drift test re-derives every value from the `--nuri-type-*` source).
  **The original F-FONT-1 core — `fontFamily` — is still OPEN**: the emit
  carries no `fontFamily` (RN still falls back to the platform default), so
  the custom-font-propagation gap stands. Remaining sub-thread: **Button +
  Tab still alias their own per-component font tokens** rather than reading
  the shared scale — consolidation is N+8.4 (Topbar owns no font tokens ·
  not in scope).
  · **N+8.4 update — per-component duplication RESOLVED** ([decision 55](../decisionlog.md#55-component-owned-labels-source-type-from-the-shared-scale--button--tab--topbar--n84)):
  Button + Tab dropped their per-component font tokens and now source label
  type directly from the shared `--nuri-type-*` scale (Button lg/md =
  type-md-em, sm = type-sm-em; Tab = type-sm-em · all four attributes),
  fixing a latent RN Tab bug (borrowed `button.mdFontSize` 17px → correct
  15px). **The earlier "Topbar owns no font tokens · not in scope" note is
  superseded**: N+8.4 deliberately made Topbar font-bearing for its title
  (centre region carries lg-em from the scale · bare text inherits ·
  [amendment 46.2](../decisionlog.md#462-amendment--n84--topbar-is-now-font-bearing-for-its-title))
  while it still owns zero `--nuri-topbar-*` tokens. `fontFamily` remains
  the sole OPEN strand of F-FONT-1.
  · **N+8.4 disposition — `fontFamily` is DELIBERATELY PARKED, not debt**
  (operator · 2026-05-31): the current split is **intentional design**, not
  an unconsolidated gap. Web uses a **test font** on purpose — it lets the
  docs site preview how the iOS / Android system fonts will render; RN uses
  the **platform system font**. There is no shared `--nuri-type-family`
  token by design. **Gate for revisiting** (P11 · evidence-gated · no
  speculative token): when a real component needs the **mono** family,
  decide then how `fontFamily` should flow (join the `type` emit composite
  vs a standalone primitive). Until that consumer exists, leave the
  web-test-font / RN-system-font split as-is.

- **F-ICON-RN-1** · ✓ **CLOSED · N+6.8**
  ([decision 48](../decisionlog.md#48-typed-buildiconsts-emit--svgxml-over-the-shared-registry--one-registry-two-readers--n68)) ·
  the `<nuri-icon>` web element inlines an SVG string keyed by `name`
  (registry-based JS dispatch ·
  [decision 38](../decisionlog.md#38-icon-component--phosphor-source--nuri-icon-name-nuri-facade--2-size--fill--registry-based-js-dispatch--n63)) ·
  the RN equivalent had to dereference the **same registry** against a
  platform SVG renderer, with identical weight-coupling (md→regular ·
  sm→bold · any+fill→fill). Open + deliberately sidestepped four
  sessions (N+6.4 minted IconButton as the first real consumer; N+6.5
  Switch, N+6.6 Topbar, N+6.7 TypographyStack each shipped without a
  glyph renderer, carrying the debt forward unchanged to keep the
  Icon funnel narrow — exactly two consumers, IconButton the single
  funnel). **No partial renderer ever shipped** — the migration test
  carried an honest `View` placeholder rather than masking the gap.
  **Resolution (this session).** The pipeline now emits a **typed
  `build/icons.ts`** from `lib/components/icon/icons.js` (the SSOT ·
  17 glyphs × {regular, bold, fill}), drift-guarded by a sync test.
  The RN `Icon` re-wraps the registry path in the phosphor
  `viewBox="0 0 256 256"` shell and feeds it to `react-native-svg`'s
  `SvgXml` (`currentColor` → the `color` prop); IconButton now
  **composes** that real `Icon`, replacing its `View` stub — the RN
  analogue of the web funnel. **One registry string, two readers**
  (web inline + RN `SvgXml`); **no** SVGR / per-glyph `<Path>` codegen
  (that would fork the glyph source and break the single-registry
  invariant decision 38 rests on). `react-native-svg` is **not** a
  dependency — a local type shim declares only the `SvgXml` surface
  the Icon consumes; the proof is type-only (`tsc` exit 0 · spec repo,
  no RN runtime). When a real RN build lands, delete the shim and add
  the package; the Icon source is written against that exact prop
  surface, so the swap is mechanical. See
  [`docs/migration-tests/button-matrix/index.tsx`](./migration-tests/button-matrix/index.tsx).
  **N+6.9 update.** IconAvatar
  ([decision 50](../decisionlog.md#50-iconavatar--static-decorative-twin-of-iconbutton--composes-icon-directly--skip-emit--avatar-name-reserved--n69))
  is the **first new direct `<nuri-icon>` consumer after this closure** —
  the funnel is no longer IconButton-only. It composes the resolved Icon
  (web `<nuri-icon size="md">` · RN `<Icon size="md" fill>`) exactly as
  IconButton does, the practical proof that decision 48's glyph path
  generalises beyond the original consumer. Still type-only until a real
  RN build lands.

- **F-ARIA-LABEL-1** · an icon-only control has no text node, so an
  accessible name is **required**, not optional · web: IconButton
  auto-derives `aria-label` from the kebab `name` (`gear` → "gear",
  `arrows-down-up` → "arrows down up") unless an explicit `label`
  attribute overrides it; the inner `<nuri-icon>` is `aria-hidden` ·
  RN: the same derivation must produce `accessibilityLabel` on the
  `Pressable` (RN has no DOM `aria-label`; the prop name differs and
  there is no automatic fallback to a text child because there is no
  text child) · proposed: the RN IconButton replicates the
  derive-from-`name`-unless-`label` logic in JS, since neither
  platform's primitive supplies it for free · ✓ documented in
  IconButton's Behavioural-delta section ·
  [decision 40](../decisionlog.md#40-iconbutton-is-single-size-locked--md48px--n64) ·
  **the RN IconButton landed in the migration test (N+6.8, with
  F-ICON-RN-1 now CLOSED); this derive-from-`name` logic is already
  present on the RN `Pressable` there. Enforced when a real RN build
  consumes it.**

- **F-TOUCH-TARGET-1** · IconButton is locked to a 48×48px circle
  ([decision 40](../decisionlog.md#40-iconbutton-is-single-size-locked--md48px--n64)) ·
  web: the 48px box is the tappable area directly (the `<button>` is
  the hit target) · RN: 48px clears the iOS HIG 44pt / Android 48dp
  minimum, but RN touchables often need an explicit `hitSlop` when a
  *visual* shrinks below the target — not an issue at 48px today, but
  the constraint must travel with the component so a future dense
  variant can't silently drop below the floor · proposed: encode the
  48px floor as the comfortable-target invariant in the RN
  IconButton; any future `sm` icon-button uses `hitSlop` to preserve
  the touch area · ✓ documented in IconButton's Behavioural-delta
  section · **target: docs-only now; enforced when a second
  icon-button size is proposed.**

- **F-DECORATIVE-1** · IconAvatar is **purely decorative** — an icon on
  a coloured circle that sits beside a visible text label the row owns,
  so it carries **no** accessible name and must be hidden from the a11y
  tree ([decision 50](../decisionlog.md#50-iconavatar--static-decorative-twin-of-iconbutton--composes-icon-directly--skip-emit--avatar-name-reserved--n69))
  · web: a single host `aria-hidden="true"` removes the whole subtree
  (the inner `<nuri-icon>` is already `aria-hidden`) · RN: there is no
  single `aria-hidden` — hiding a decorative subtree needs **both**
  `accessibilityElementsHidden={true}` (iOS) **and**
  `importantForAccessibility="no-hide-descendants"` (Android), the
  platform-split idiom · proposed: the RN IconAvatar sets both props
  together as the decorative-hide pair (already present in the migration
  test) · this is the **inverse** of F-ARIA-LABEL-1 (IconButton *needs*
  a derived name; IconAvatar *suppresses* one) · ✓ documented in
  IconAvatar's Behavioural-delta section · **not a renderer gap — a
  per-platform attribute pair · target: alongside a real RN build.**

- **F-CHECKED-STATE-1** · Switch carries a boolean on/off state, the
  first Nuri control whose *primary* delta is a persisted value rather
  than a transient interaction · web: a native `<button role="switch"
  aria-checked>` (deliberately **not** `<input type="checkbox">` ·
  [decision 44](../decisionlog.md#44-switch--standalone-parametric-pill--owns-component-tokens--button-roleswitch-not-checkbox--n65)) ·
  the `checked` attribute drives `aria-checked` and the knob-travel
  transform; the track colour flips `bg-inverse-muted` → `accent.solid`
  · RN: the same boolean maps to an `accessibilityRole="switch"` +
  `accessibilityState={{checked}}` on a `Pressable` (RN has no
  checkbox primitive and no `aria-checked`; the state object is the
  carrier), and the knob position is an animated `translateX` rather
  than a CSS transform · proposed: the RN Switch owns the `checked`
  boolean as controlled state, mirrors it into `accessibilityState`,
  and animates the knob with `Animated`/Reanimated — the web `:active`
  press-scale (knob 0.92) becomes a `Pressable` `pressed` scale · ✓
  documented in Switch's Behavioural-delta section · **target:
  alongside the RN Switch.**

- **F-SELECTED-VALUE-1** · Tabs is the first Nuri **multi-element
  compound** with shared state: a `<nuri-tabs value>` controller owns
  the selected value, and N `<nuri-tab value>` options read it to
  decide their active styling · web: the controller writes the active
  value to a DOM attribute and the options dispatch their own value on
  press; selection is plain attribute state, no framework · RN: the
  same shared state must travel through React context or a controlled
  `value`/`onChange` pair on a parent `<Tabs>` (RN has no DOM-attribute
  channel between sibling components), with each `<Tab>` consuming the
  context to compute `accessibilityState={{selected}}` and its active
  fill · proposed: the RN Tabs exposes a controlled `value`/`onChange`
  contract and threads the selected value via context; the active tab
  reuses the Button `solid` look the web option composes · ✓
  documented in Tabs' Behavioural-delta section ·
  [decision 43](../decisionlog.md#43-tabs--first-multi-element-compound--first-box-composition-consumer--n65) ·
  **target: alongside the RN Tabs.**

- **F-KEYBOARD-NAV-1** · the WAI-ARIA Tabs pattern expects arrow-key
  roving focus across the tablist (←/→ move selection, Home/End jump
  to ends) · web: N+6.5 ships the **baseline** only — each tab is a
  focusable button reachable by Tab key and activated by click/Enter;
  arrow-key roving is **deliberately deferred** (decision 43
  anti-scope) so the compound's shared-state mechanism could land
  first without the focus-management surface · RN: arrow-key roving is
  largely moot on touch (no physical arrows), but the eventual RN Tabs
  must still expose correct `accessibilityRole="tab"` /
  `"tablist"` and a selected-state announcement; keyboard roving
  matters only for RN-web / external-keyboard contexts · proposed: add
  the web roving-focus handler (and the matching RN keyboard handling
  for RN-web) when a real consumer needs full keyboard parity ·
  ✓ documented in Tabs' Behavioural-delta section as an open delta ·
  **target: a focus-management slice when keyboard parity is
  demonstrated as needed (evidence-gated).**

- **F-LISTITEM-ROLE-1** · ListItem is the first Nuri component whose web
  a11y role has **no RN `accessibilityRole` counterpart** · web: the row
  host carries `role="listitem"` inside the `<nuri-list role="list">`,
  the standard list-membership semantics · RN: `AccessibilityRole` has
  `list` but **no** `listitem` member (the type literally omits it), so
  the RN row cannot announce list membership the way web does · workaround
  (already in the migration test): the interactive RN row is a single
  `Pressable accessibilityRole="button"` and the non-interactive row is a
  plain `<View>` with **no** role — the `listitem` semantics web gets for
  free are simply unavailable on RN · this is an **honest platform gap**,
  not a renderer bug or a fixable derivation (unlike F-ARIA-LABEL-1's
  derive-a-name) · ✓ documented in the index.tsx comment +
  [decision 51](../decisionlog.md#51-list--listitem--family-capstone--one-row-shape-slots-not-use-case-variants--density-owns-row-rhythm--interactive-press-overlay--skip-emit--n7)
  · **target: revisit if RN/RN-web adds a `listitem` role; until then the
  gap travels with the component as documented.** (F-FOCUS-1 also recurs
  here — the interactive row's web `:focus-visible` ring has no RN
  `Pressable` analogue, the same web-only-focus delta already catalogued.)

- **F-TABBAR-ROLE-1** · TabBar (the icon-only bottom **destination
  switcher** · N+9) is a navigation surface whose correct web a11y model
  has **no 1:1 RN `accessibilityRole` counterpart** · web: the bar is a
  `<nav aria-label>` landmark of native `<button>` destinations, and the
  selected destination carries `aria-current="page"` — the model that is
  correct for a mobile destination switcher **without presupposing a
  router**, and deliberately **distinct from Tabs' `role="tablist"`**
  (which describes an *in-page panel switcher*, not navigation) · RN:
  `AccessibilityRole` has no member that pairs with web's
  `<nav>`/`aria-current` for a destination bar — there is no `navigation`
  landmark role and no `current`-state analogue — so the RN mirror
  **approximates** with `accessibilityRole="tab"` +
  `accessibilityState={{selected}}` per item (the closest available
  shape, which **over-claims tablist semantics** the web side
  intentionally avoids) · workaround (already in the migration test): the
  RN `TabBar` is a `<View accessibilityLabel>` and each `TabBarItem` is a
  `Pressable accessibilityRole="tab"` with the selected state; props +
  selection behaviour stay **1:1** with the web compound · this is an
  **honest platform gap** like F-LISTITEM-ROLE-1, not a fixable
  derivation — the web's `nav`/`aria-current` correctness is simply
  unavailable on RN · the icon-only items reuse **F-ARIA-LABEL-1** for
  their accessible name (`label || name`) and the shared-state mechanism
  reuses **F-SELECTED-VALUE-1** (the Tabs controller pattern) · ✓
  documented in TabBar's Behavioural-delta section + the index.tsx
  comment ·
  [decision 56](../decisionlog.md#56-tabbar--icon-only-bottom-destination-switcher--distinct-from-tabs--emit-bar-height--direct-semantic-items--n9)
  · **target: revisit if RN/RN-web adds a navigation/`current` role; until
  then the gap travels with the component as documented. When the
  consuming app's router lands, a link-based item (`<a href>` web /
  navigation action RN) becomes the natural upgrade.**

- **F-BOX-FG-1** · Box `background="accent-solid"` · the web
  `box.css` pairs the solid-accent background with
  `color: var(--nuri-accent-on-solid)` so nested text reads on the
  solid fill; the RN Box surface sets only `backgroundColor` and does
  NOT cascade a foreground colour (RN `<Text>` doesn't inherit through
  a `<View>`) · workaround in the migration test (N+13 · D1): callers
  set text colour explicitly on the nested `<Text>`; Box stays a
  background-only surface · this is the same `font-family: inherit`
  family of RN-text-non-inheritance F-FONT-1 names, realised for
  colour · ✓ documented in the `box.tsx` header ·
  **target: revisit if Box grows a managed-foreground variant; until
  then the foreground is the caller's responsibility.**

- **F-TAB-DISABLED-1** · Tab `disabled` · web `tabs.js` renders a
  non-selectable muted option with `aria-disabled`; the RN Tab mirror
  (N+13 · D3) maps this to a non-pressable Pressable
  (`disabled={disabled}`) + muted opacity (reusing the shared
  `--nuri-interaction-disabled-opacity` primitive · honest, drift-free)
  + `accessibilityState={{ disabled }}` · props stay 1:1; the only
  delta is the web `cursor`/`:focus-visible` pair that has no RN
  analogue (the same F-DISABLED-1 / F-FOCUS-1 web-only deltas already
  catalogued) · ✓ documented in the `tabs.tsx` header ·
  **target: n/a — clean 1:1 modulo the already-named cursor/focus
  web-only deltas.**

**Status**: **partially mitigated**. 19 frictions named with
concrete locations, workarounds and proposals. F-TOKEN-1 retired
in N+5 (semantic-cascade pipeline slice). F-LAYOUT-1 retired in
N+6.2 (Stack + Box layout primitives ship under
[decision 37](../decisionlog.md#37-layout-primitives-consume-semantic-vocabulary-via-prop--no-component-token-aliasing--n62)
· empty-emit case extends the per-component pipeline contract).
F-SCOPE-1 gained a directional decision in N+5.5 (decision 27 ·
orthogonal merge-on-override Context) and **CLOSED in N+13** (decision
62) — the migration mirrors now implement the single `NuriThemeContext`
+ composite `NuriScope`, the n=1 confirmation it awaited. The
Behavioural-delta section (amendment 24.1) shipped in N+6.4 and
**extended to Switch + Tabs in N+6.5** — the three clean inherited
deltas (F-PRESSED-1, F-FOCUS-1, F-DISABLED-1) plus three new
component-specific deltas: **F-CHECKED-STATE-1** (Switch · the first
control whose primary delta is a *persisted* boolean, not a transient
interaction), **F-SELECTED-VALUE-1** (Tabs · the first multi-element
compound with shared selection state), and **F-KEYBOARD-NAV-1** (Tabs
· arrow-key roving deferred · evidence-gated). At n=4 documented
controls (Button · IconButton · Switch · Tabs) the per-component delta
template now generalises across transient *and* stateful *and*
compound surfaces — the original R1 mitigation proposal, broadly
realised. **F-ICON-RN-1 is now CLOSED (N+6.8)** — N+6.4 made it
maximally concrete (IconButton is the first real consumer); the
operator deferred the RN renderer across four sessions (N+6.4–N+6.7,
no partial renderer ever shipped), then paid it down in N+6.8 along
the direction refined at N+6.6: the pipeline emits a typed
`build/icons.ts` from the SSOT registry (drift-guarded), the RN `Icon`
feeds the registry string to `react-native-svg`'s `SvgXml`, and
IconButton composes that real Icon (one registry, two readers · no
SVGR/per-glyph codegen · `react-native-svg` is not a dependency, local
type shim only · proof type-only). The remaining open RN-side
frictions (F-ARIA-LABEL-1's RN side, F-CHECKED-STATE-1's RN side,
F-SELECTED-VALUE-1's RN side, F-FONT-1) all converge on the same
unbuilt RN-runtime implementation. The web-side props-1:1 /
behaviour-budgeted framing is now confirmed at n=4; a real RN build
must land before the remaining frictions become fully locked decisions
(precommitment guardrail). **N+7 added F-LISTITEM-ROLE-1** (List +
ListItem · the first web a11y role — `listitem` — with **no** RN
`accessibilityRole` counterpart, an honest platform gap rather than a
derivable one), confirming the budget extends to *list-composition*
surfaces; the interactive row's press wash ports cleanly (`Pressable`
`pressed`) while its `listitem` role and `:focus-visible` ring do not.
**N+9 added F-TABBAR-ROLE-1** (TabBar · the icon-only bottom
destination switcher · the first **navigation** surface whose correct
web role — `<nav>` + `aria-current` — has **no** RN counterpart),
extending the honest-platform-gap pattern from *list membership* to
*navigation/current-destination* semantics; the RN mirror approximates
with `tab`/`selected` while keeping props + selection 1:1, and reuses
F-ARIA-LABEL-1 (icon-only name) + F-SELECTED-VALUE-1 (shared state)
rather than minting new mechanisms.
**N+11 extended the props-1:1 / behaviour-budgeted framing to the layout
SCAFFOLD** — `Screen` (`View {flex:1}`), `Scroll` (`ScrollView` · scrolling is a
COMPONENT in RN, not a `View` style, the cleanest possible R1 confirmation that
some web concerns are RN components), `Spacer` (grow/`flex:n`/fixed), plus Box +
Stack `fill` and Typography `align`. All six were added to the migration-test
mirror and `tsc` stays exit 0, so the props layer holds. Two budgeted mechanism
deltas surfaced: (a) **F-TEXTALIGN-RTL** — web `align` is logical
`text-align: start|end` (RTL-aware) but RN `textAlign` has no logical start/end,
so the mirror maps to physical left/right (LTR); RTL flip via `I18nManager` is
logged, not solved; (b) **Box `fill` mechanism delta** — on web Box is
`display:block` so `fill` must also switch it to a flex column, whereas an RN
`<View>` is already a column, so the RN side needs only the grow part. Both keep
props 1:1; only the mechanism differs — exactly the budget R1 already names.

---

## R2 · Pipeline schema validated late — schema risk is highest NOW

**Failure mode**. The CSS → DTCG → Style Dictionary → RN pipeline is
assumed but not built. `roadmap/index.md` defers it until "3–4 components in
the repo." But schema risks materialise *earlier*:

- Style Dictionary may not resolve all reference patterns Nuri uses
  (alpha tokens, layered `@layer tokens` component tokens, nested
  `var()` chains across the semantic cascade)
- W3C DTCG `$type` for typography composite tokens is still evolving
  in spec; current rendering choices may not match the locked spec
- Unistyles-RN may expect a different output shape than Style
  Dictionary's default `js` formatter emits

Each of these is cheaper to find with one foundation (colour primitive
— the simplest type) round-tripped end-to-end than after 4 components
have committed to the assumed schema.

**Why it matters**. The docs expose DTCG target names. The more pages
commit to those names, the more painful any schema rework. Token
naming decisions today are downstream of an unvalidated assumption.

**Mitigation**.
- ✓ **Thin slice shipped (N+3.5)** — colour primitive only, CSS →
  DTCG JSON via `pipeline/tokens-parser.js` (postcss), round-trip
  value-equality test via `node --test pipeline/tokens-parser.test.js`.
  216 tokens round-trip clean (N+5.7 cleanup retired 3). Schema lock-in for the colour layer:
  nested DTCG (`color.<scale>.<step>.<theme>` for themed scales;
  `color.<base>.alpha.<step>` for alpha; `color.<name>.<step>` for
  status), `{$type, $value}` per leaf.
- ✓ **Semantic-cascade slice shipped (N+5, two passes)** —
  `pipeline/tokens-parser.js` split into
  `pipeline/parsers/{primitive,semantic}.js`. The semantic walker reads the 6
  cascade blocks of `styles/tokens-semantic.css`, applies the
  AGENTS.md cascade-ordering rules (port of
  `lib/docs/tokens.js#findReference`), and resolves the var() chain
  through the build's selected `--neutral` scope (cream default since
  N+5.8 · decision 31). `build/tokens.ts` is now
  machine-generated for the (accent × theme) cross-product —
  replaces the N+4 hand-rolled stand-in (F-TOKEN-1 retired). Pass 1
  shipped the cascade walker + cross-product resolution + the first
  5 tests; pass 2 (this continuation) closed the emit boundary:
  `ACCENT_TOKEN_EXPORTS` now covers all 6 accent-keyed tokens
  (`accentFg`, `accentSolid`, `accentSolidPressed`, `accentOnSolid`,
  `accentBgSubtle`, `accentBgSubtlePressed`) and
  `CHROME_TOKEN_EXPORTS` all 12 chrome tokens (3 bg + bgSubtle +
  bgInverse + 3 text + 3 border + focusRing). All 18 declared
  semantic vars now have a tokens.ts export. A 6th test enforces
  this: every cssVar from `collectSemanticVars` must appear in
  exactly one of the two export lists — the silent-drop drift
  class is closed at the boundary, not just in the oracle table.
  The 5 pass-1 tests still cover the 18 × 4 cross-product via a
  hand-derived oracle, P4 bright-vs-saturated asymmetry, the
  selector-specificity port, the var()-chain resolver, and a
  textual drop-in contract on the generated file. Side benefit
  (pass 1): the slice caught a real drift in the hand-rolled
  values — lilac-8 was marked "bright frozen" but only
  lilac-9/lilac-10 are; dark focus-ring is now correctly
  `#6c58a3` instead of `#ae91ff`.
- *conditional* · Style Dictionary slice now gated on a second
  target platform per decision 2's N+5.5 amendment. The custom
  emitter at `pipeline/parsers/semantic.js` is terminal for RN-only;
  N+5.5 also refactored it to classify-by-cascade (decision 28) so
  the shape derives from the source CSS structure, not from a
  hardcoded list. SD re-enters scope if iOS / Android / Figma sync
  joins.
- *open* · Validate Unistyles consumption — the migration pair's
  typecheck contract is one confirmation; a real Expo render is the
  other. Pulled forward of "3-4 components" because N+4 already
  validates the (web ↔ RN typecheck) drop-in path.

**Status**: **primitives + semantic + per-component-CSS-walk
mitigated (all 18 tokens exported · no silent drops · shape derives
from cascade · component numerics now flow from live CSS into
`build/components/<name>.ts`) · Style Dictionary now conditional
(decision 2 amendment) · Unistyles consumption pending**. Colour-
primitive and semantic-layer schema risk is now low (N+3.5 + N+5 +
N+5.5 together: N+5.5 closes the "hardcoded export list drifts from
cascade" sub-risk by removing the list — the emitter classifies
each var by which `[data-*]` blocks declare it). The component-
token-drift sub-risk (F-FONT-1: hand-maintained `buttonBase`
constants outliving primitive renames) is now closed at N+6.0.3
([decision 34](./../decisionlog.md#34-per-component-files--tokenpath-union--set-policy--pipeline-emit-shape--n603))
— `pipeline/parsers/components.js` walks each component CSS's `@layer
tokens` block and emits literals + TokenPath strings per the
`SET_POLICY` registry; the pre-N+6.0.3 `BUTTON_BASE` block in the
emitter is gone. The remaining unknown sits on Unistyles runtime
ingestion + adaptive themes against the new shape (runtime sets in
`tokens.ts` + per-component files for component anatomy + TokenPath
union for type-checked references + a `resolveToken(tokens, path)`
consumer helper).

---

## R3 · No verification beyond human review — silent drift not caught

**Failure mode**. Outputs (web components, token values, docs) are
reviewed by the operator's eyeball. This works at current scale but
cannot catch:

- **Token round-trip drift** · does `--nuri-color-gray-1-light = #f8f8f8`
  survive CSS → DTCG → JS as `#f8f8f8`? Alpha channels preserved?
  Reference chains resolved to the literal values Style Dictionary's
  `js` formatter would emit?
- **API contract drift** · web component's prop names and types match
  the (future) RN component's? A prop that exists on web but not RN
  lets prototypes work that can never ship.
- **Migration smoke** · an RN component generated from current spec —
  does it actually render in Expo without runtime errors?
- **Cross-page consistency** · when shared widgets in `shell.css`
  are extended, do all consuming pages still render correctly? Today
  caught only by manual smoke-test cycle.

**Why it matters**. The first silent drift will cost more to debug
than the test would have cost to write. "Agent generates + human
reviews" is the entire verification story today.

**Mitigation**.
- ✓ **Token round-trip test shipped (N+3.5)** alongside the pipeline
  thin slice — `pipeline/tokens-parser.test.js`, `node:test`, 6
  assertions including value-equality for every `--nuri-color-*`
  declaration. Catches the first silent-drift class for the colour
  primitive layer.
- *open* · API contract test when a component has both a web and
  an RN implementation. Not blocking until then.
- *open* · Headless smoke-test: open each docs page, assert zero
  `[NuriTokens]`/`[NuriDemo]` console warnings. Doable in N+4.
- *open* · Visual regression: out of scope for low volume. Revisit
  at 5+ components.

**Status**: partially mitigated. One automated test now exists (token
round-trip for the colour layer). Page-level + API-level verification
still relies on the operator's eyeball.

---

## R4 · Build-free prototyping vs build-resolved RN runtime — divergence path

**Failure mode**. Web side uses CSS vars directly — references resolve
at runtime via the cascade, FOUC-prone, deep `var()` chains work. RN
side will consume Style Dictionary's JS output — references resolved
at build, no runtime cascade.

A prototype that works on web can fail on RN because:

- Deep `var()` chains that the cascade walks happily but Style
  Dictionary's resolver doesn't flatten
- Runtime token mutation (changing `data-accent` live) that web
  supports natively but RN supports only via Unistyles adaptive themes
- Reference cycles that no-op on web but fail Style Dictionary
- Undefined references that fall through to `unset` on web but error
  in build

The user explicitly named "build-free prototyping → can become a
Claude chat artifact" as a goal. Choosing build-free is fine, but it
accepts this divergence.

**Why it matters**. A prototype validates that an interaction is
*possible*; if it's possible only because of CSS cascade behaviour,
the prototype's success is misleading.

**Mitigation**.
- Choose the position explicitly (today it's implicit): web stays
  CSS-var-direct, RN consumes built output, divergence is accepted
- Add a lint that runs in CI flagging: var-chain depth above a
  threshold, reference cycles, undefined references, runtime-only
  patterns
- Document the constraints in `pages/principles.html` so the
  composing agent knows what to avoid
- Long-term option: a "prototype build" pass that runs the lint and
  emits a warning report before the operator accepts a composition

**Status**: open. Position is implicit; making it explicit and writing
the lint is N+3 or N+3.5 work.

---

## R5 · Thesis not validated end-to-end (the meta-risk)

**Failure mode**. Nuri's entire design rests on the thesis that
*agent-composed web prototypes translate to RN by mechanical
translation*. This thesis has not been tested. No screen has been
built in Nuri and then migrated to Expo. All current decisions (token
shapes, component templates, docs structure, principles split,
governance model) are downstream of an assumption that has not been
observed to hold.

The longer the system invests in infrastructure (docs widgets,
foundation templates, skill router, principles page, demo widget,
shell, token parser) before this validation, the more expensive a
"thesis needs adjusting" finding becomes.

**Why it matters**. An end-to-end migration test of one screen is the
cheapest answer to a question whose wrong answer invalidates months
of work.

**Mitigation**.
- Pick the simplest target-app screen (a sub-screen — Buy Bitcoin
  flow's amount entry, or a card listing)
- Compose it in Nuri with current components (Button + ad-hoc layout
  if Stack/HStack don't exist yet)
- Translate to Expo by hand or with an agent
- The gaps observed are the real prioritisation data for N+4–N+8

**Status**: **partially validated (N+4)**.

The N+4 session pivoted from a full sub-screen to a **button matrix**
(`docs/migration-tests/button-matrix/`) on the reasoning that faking
Card/Stack/Heading only to "discover" they're missing is wasted
signal — those gaps are known a-priori. Instead the matrix
exhaustively stresses the surfaces that DO exist (Button + Scope
+ tokens) across the cross-product of variant × accent × state ×
scope-tier (8 instances, lilac / neutral, light theme).

**What N+4 validated, narrowly:**

- ✓ Props-layer 1:1 holds for Button. `variant`, `accent`,
  `disabled` translate verbatim from `<nuri-button>` to RN `<Button>`
  (F-SCOPE-2 + F-DISABLED-1 are positive controls).
- ✓ Tier 2 self-scope (per-button `accent` prop) is even
  behaviourally 1:1, modulo runtime mechanism (CSS cascade ↔
  React Context fallback chain).
- ✓ Tier 3 subtree-scope works on RN via React Context Provider,
  exactly as the AGENTS.md mapping table predicts. The matrix
  proves the mechanism; F-SCOPE-1 captures the multi-dim cost.
- ✓ Decision 9 (component-token re-resolution on every scope
  boundary) is empirically validated by the web matrix: Tier 2 and
  Tier 3 both produce the neutral colour, confirming the cascade
  re-resolves at the scope element rather than freezing at `:root`.
- ✓ The hand-rolled `tokens.ts` (decision b1) compiles cleanly
  under `tsc --jsx react-native` (typecheck contract green; no
  Expo runtime). Mirrors what Style Dictionary's `js` formatter
  would emit per P10.

**What N+4 did NOT validate (explicit unknowns)**:

- Pressed-state visual swap under real touch · only static
  proof via `style={({ pressed }) => …}` shape. Real validation
  needs Expo at N+5 or N+6.
- Multi-dimensional Tier 3 scope · only `accent` exercised.
  F-SCOPE-1's proposal stays theoretical until a second dim joins.
- Dark theme · `tokens.ts` has dark values but matrix renders
  light. Bright-family asymmetry (P4) not exercised.
- Layout primitives · F-LAYOUT-1 documents that BOTH sides hand-rolled
  flex — the missing-Stack friction is symmetric, not RN-specific.
- Anything that depends on a component Nuri doesn't ship yet
  (Card / Stack / Input / Icon).

**What this changes for downstream work**:

- N+5 shipped the semantic-cascade pipeline slice (F-TOKEN-1
  retired). N+6 is now informed by F-LAYOUT-1 (Stack is the
  highest-friction missing surface) and chooses between Path A
  (Layout primitives) and Path B (Second component). See
  roadmap/index.md "What's next".
- R1 mitigation gains a concrete next step: a "Behavioural delta"
  section on the Button docs page (F-PRESSED-1, F-FOCUS-1,
  F-DISABLED-1's cursor divergence).
- Precommitment guardrail respected: nothing here promotes to
  locked decision. The matrix is n=1. N+5 must re-validate or
  contradict before any of these calcify.

The remaining work to fully close R5 is a second-component
translation (N+5) and a real-touch RN render (N+5 or N+6 with
Expo). The thesis "props 1:1, behaviour budgeted per-component"
holds at the depth N+4 reached; the budget for behaviour is
concretely 2-4 deltas per leaf component based on Button alone.

---

## R6 · Personas framing committed before tested (lower priority)

**Failure mode**. Decisions 21–25 (codified during N+3 brainstorm)
commit Nuri's docs surfaces to a three-agent-persona + operator model.
In practice today this is one human + one agent acting in all three
roles. The framing might be over-engineered for current state, and
the docs surface might over-segment for personas that don't yet exist
as distinct entities.

**Why it matters**. If the personas turn out to merge in practice
(same agent does composing and migrating, or operator and composing
agent collapse), separate surfaces are friction not clarity. The cost
isn't catastrophic — just unused docs structure.

**Mitigation**.
- Re-evaluate at N+5, after 2 components and 1 screen migration. Do
  the personas behave distinctly in practice or merge into one?
- If merge: collapse `principles.html` into AGENTS.md or home
- If distinct: keep the split as locked in N+3

**Status**: open. Acknowledged trade-off. Codifying now buys clarity
but accepts a re-evaluation cost.

---

## How to update this file

Each session, before closing (run the
[`skills/close-out-session.md`](../skills/close-out-session.md) procedure):

1. Re-read each risk
2. Move resolved risks to a **Closed** section at the bottom — don't
   delete. The reasoning is valuable for future sessions and
   prevents re-litigating
3. Add new risks discovered, with the same shape (failure mode · why
   it matters · mitigation · status)
4. Update mitigation status if mitigation work shipped
5. The closeout audit (general-purpose sub-agent, read-only) will
   flag R-status fields that don't match reality — fix in the same
   pass as decision drift

Only add risks with a named failure mode visible from the project's
own choices. Hypothetical or generic risks (e.g., "what if the team
grows") don't belong here.

---

## Closed risks

*(none yet)*
