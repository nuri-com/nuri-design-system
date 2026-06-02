> **Coordinator provenance note — imported evidence, read this first.**
>
> **What.** A verbatim, frozen snapshot of the Expo consumer's feedback log — the
> primary source behind the **R-EXPO work queue** in
> [`roadmap/index.md`](../../roadmap/index.md). R-EXPO is the actionable
> *synthesis*; this file is the *evidence* it was distilled from, kept so the
> queue stays auditable against the source rather than taken on trust.
>
> **Source.** `SPEC-FEEDBACK.md` from the Expo demo (`expodsdemo` · a separate
> consumer codebase), as received **2026-06-02** — independently verified by an
> external reviewer who ran `npm ci` / `tsc --noEmit` / `expo export --platform
> web` clean at demo commit `757011d`. A second independent review corroborated
> the same findings. Those two reviews are coordinator-side notes, not transcribed
> here; their one net-new item (the Topbar centre-`<Text>` native-fragility) is
> folded into **R-EXPO-2c** and the [decision 46.2 consumption
> note](../../decisionlog.md#462-amendment--n84--topbar-is-now-font-bearing-for-its-title).
>
> **Frozen, not mirrored.** A point-in-time archive, *not* a live mirror of the
> demo repo — do not sync it. If new feedback arrives, add a new dated file beside
> it. (Mirroring their evolving doc would recreate exactly the drift trap F-DEMO-5
> is about.)
>
> **Scope.** Importing the consumer's feedback is *not* doing Expo / RN-package
> work in this repo — it preserves the input that drives this repo's queue. We act
> on the findings here; we do not build the RN package here.
>
> **Known stale pointer (preserved verbatim, not edited).** P-CONTROL-1's evidence
> cites `src/screens/PhaseOneDemo.tsx`; that screen was later renamed to
> `MyVault.tsx` in the demo, so the path is stale — the finding itself stands. Left
> unedited below to keep this an honest record of what was received.

---

# SPEC-FEEDBACK · Nuri DS ← Expo consumer (first real render)

This log is the highest-value deliverable back to the Nuri DS team. This
Expo demo is the **first time the spec's RN side is actually rendered** (the
migration-tests are type-only · `noEmit`, never run — see
`docs/migration-tests/button-matrix/_shared.tsx` header and FRICTIONS.md
"What the matrix DID NOT exercise"). Every gap, wrong prop, or behavioural
surprise found while building real components against the contract lands
here.

Format per finding: **component · severity · what's missing/wrong · evidence · proposed fix**.

Legend — severity: 🔴 blocks faithful render · 🟡 forces a workaround · 🟢 papercut/nit · ✅ positive control (contract held).

---

## F-DEMO-1 · Button · 🟡 · `children: string` has no slot for an icon, but My-vault needs one

- **What**: `Button` (`button.tsx`) types `children: string` — "label only — no slot
  for icons; Button is text-only today". But the target screen `pages/playground/my-vault.html`
  (lines 187–189) composes a Button with an **icon child** (the Apple-Pay action):
  ```html
  <nuri-button variant="solid" size="lg">
    <nuri-stack direction="row" gap="xs" align="center">Buy Bitcoin with<nuri-icon name="apple-logo" size="sm" fill></nuri-icon>Pay</nuri-stack>
  </nuri-button>
  ```
  The web `<nuri-button>` is a **slot** (arbitrary children, icon inherits `color: currentColor`);
  the RN `Button` is text-only. So the playground screen the spec ships **cannot be built
  with the RN Button as specified**.
- **Evidence**: `button.tsx:54` (`children: string`) vs `my-vault.html:187-189` (icon child).
- **Compounding (RN-specific)**: even if children were widened to `ReactNode`, RN `<Text>`
  colour does **not** inherit into a nested `<Icon>`/`<View>` (same mechanism as F-BOX-FG-1),
  so an in-button icon must be handed the label colour explicitly. The web's `currentColor`
  inheritance has no RN analogue.
- **Proposed fix**: give RN `Button` a `leading?`/`trailing?` icon slot (typed `IconName`), or
  widen `children` to `ReactNode` AND have Button expose its resolved label colour to descendants
  (render-prop or context) so an icon child can paint itself. Either way the icon-colour coupling
  must be made explicit in the contract, not left to `currentColor`.

## F-DEMO-2 · Button · 🟡 · mirror bakes `flex: 1` into the base style — overfit to the matrix, breaks column layout

- **What**: `button.tsx` `styles.base` sets `flex: 1`. The web source of truth `button.css`
  styles `.nuri-button` as `display: inline-flex` with a `min-height` and **no flex-grow** —
  i.e. content-width, natural height. The `flex: 1` in the mirror exists only to make the
  button-matrix's `direction="row"` demo distribute equal widths.
- **Why it bites**: My-vault stacks the two action buttons in a `direction="column"` stack.
  In RN, `flex: 1` on a column child grows it on the **main (vertical)** axis, so both buttons
  would balloon and fight the `grow="2"` spacer — nothing like the web, where the buttons are
  natural-height and the column's default cross-axis stretch gives them full width.
- **Evidence**: `button.tsx:170` (`flex: 1`) vs `button.css:147,189` (`display: inline-flex`,
  no grow); `my-vault.html:186-189` (buttons in a column stack).
- **Resolution here**: ported `Button` **without** `flex: 1` — content-sized, relying on the
  parent column's default `alignItems: 'stretch'` for full width (matches web inline-flex in a
  row, full-width in a column). The matrix's equal-width row is a demo aesthetic, not the contract.
- **Proposed fix**: drop `flex: 1` from the Button mirror's base (or move it to the matrix demo's
  call site). A leaf control shouldn't hardcode flex-grow.

## P-CONTROL-1 · theming runtime · ✅ · contract holds for light × dark × neutral inversion (FIRST real render)

- **What**: the `{ mode, accent }` single-context model + `useRuntimeTokens` + `resolveToken`
  render correctly in **both** light and dark — the matrix never tested this ("the matrix renders
  light only" · FRICTIONS.md "What the matrix DID NOT exercise"). Verified live in Expo Web.
- **The N+15 inversion holds**: a `accent="neutral"` solid Button reads **black** (`accent.solid`
  `#12110b`) in light and **white** (`#fffdf2`) in dark — it inverts. Lilac stays **frozen**
  (`#beaaff`) across both themes (P4 bright-family asymmetry). This is the exact behaviour the spec
  predicted for the swap IconButton; confirmed on a real render for the first time.
- **Tiers 1/2/3 all work**: ambient (lilac), self-scope (`accent` prop), and subtree
  (`NuriScope` merge-on-override) all resolve correctly — F-SCOPE-1 closure validated at runtime,
  not just under `tsc`.
- **Evidence**: Phase-1 demo screenshots (light + dark), `src/screens/PhaseOneDemo.tsx`.

## F-DEMO-3 · Scroll · 🟡 · a bare `ScrollView{flex:1}` won't let a `Box fill` child fill the viewport (latent — never rendered)

- **What**: `scroll.tsx` is `<ScrollView style={{ flex: 1 }}>`, and its header says padding/fill go
  on a `<Box fill>` CHILD as "the contentContainerStyle analogue (Box fill == {flexGrow:1})". But on
  a real device that does **not** work: RN's `ScrollView` lays children out in a separate
  **content container** that is content-sized by default, so a `flexGrow:1` child has no free space
  to grow into. My-vault relies on `grow` spacers pushing the total/actions down to fill the screen —
  with the bare ScrollView they'd collapse to content height and sit at the top.
- **Why latent**: the migration test is type-only (`noEmit`, never renders), so the runtime
  flex behaviour was never observed.
- **Evidence**: `scroll.tsx` (no `contentContainerStyle`); `my-vault.html:144-193` (`<nuri-scroll>` →
  `<nuri-box fill>` → grow spacers). Web works because the web `<nuri-scroll>` is itself `flex:1`
  (definite height) and the box is `flex:1 0 auto` inside it; RN's content container is a separate
  box that needs its own grow.
- **Resolution here**: `Scroll` sets `contentContainerStyle={{ flexGrow: 1 }}` by default (overridable).
  This is the faithful RN realization of the web's definite-height scroll + filling box.
- **Proposed fix**: the Scroll mirror should set `contentContainerStyle={{ flexGrow: 1 }}` (or document
  that consumers must), else every `Box fill` inside a Scroll silently fails to fill on device.

## F-DEMO-4 · Separator · 🟡 · `alignSelf:'stretch'` collapses to zero width in a ROW (latent — matrix only used a column)

- **What**: `separator.tsx` styles the hairline with `height:1` + `alignSelf:'stretch'`. The web
  `separator.css` uses `inline-size: 100%` — axis-ABSOLUTE horizontal — so the line flanks correctly
  whether it sits in a column (between stacked rows) or a **row**. `alignSelf:'stretch'` is
  axis-RELATIVE (fills the CROSS axis): full-width in a column, but **zero width in a row** (cross
  axis is vertical there, and the explicit `height:1` wins). My-vault's swap affordance
  (`my-vault.html:157-161`) flanks the swap button with two separators **in a row** — with the mirror
  they vanish.
- **Why latent**: the button-matrix only used Separator in a column (`app.tsx` Row J), so the row
  collapse never surfaced under the type-only test.
- **Evidence**: `separator.tsx` (`alignSelf:'stretch'`) vs `separator.css` (`inline-size: 100%`);
  `my-vault.html:157-161` (separators in a `direction="row"` stack).
- **Resolution here**: `width: '100%'` + `flexShrink: 1` — the faithful translation of `inline-size:100%`:
  full width in a column, and shrinks to share the row's free space alongside the button (keeps 1px height).
- **Proposed fix**: the Separator mirror should use `width:'100%'` + `flexShrink:1` (not
  `alignSelf:'stretch'`) so a horizontal hairline survives a row container.

## P-CONTROL-2 · icon renderer + a11y deltas · ✅ · behave exactly as budgeted (FIRST real render)

- **F-ICON-RN-1 closed, for real**: every glyph (`question`, `gear`, `arrows-down-up`, `caret-right`,
  `apple-logo`, the TabBar `vault`/`coin-vertical`/`clock`) renders via `react-native-svg`'s `SvgXml`
  over the emitted `build/icons.ts` strings, on web. The "one registry, two readers" model holds at
  runtime — the migration test only proved it under `tsc` with a type shim.
- **a11y deltas emit as the spec predicts** (verified via the live accessibility tree):
  - **F-ARIA-LABEL-1**: icon-only controls expose accessible names — `button: "Help"`,
    `button: "Settings"`, `button: "Swap Bitcoin and Euro"` (explicit `label` wins).
  - **F-LISTITEM-ROLE-1**: the activation `List` is `role=list` holding `button` rows — no `listitem`
    role; membership reads from the container, exactly as budgeted.
  - **F-TABBAR-ROLE-1**: the TabBar is a generic labelled "Vault navigation" holding `tab` items —
    no `nav` landmark / `aria-current`; the documented RN approximation.
- **Evidence**: My-vault accessibility snapshot + light/dark screenshots.

## F-DEMO-5 · prop vocabularies · 🟢 · the build emits TOKENS but not the curated PROP vocab → RN hand-types it (systemic drift risk)

- **What**: the DS build emits token *scales* (`build/tokens.ts`: `space` 8 leaves · `size` 7 ·
  `radius` 4 · the `type` scale; `build/icons.ts`: `IconName`) and per-component numerics/paths —
  but it does **not** emit the curated **prop vocabularies** the components expose. Those
  subsets/enums are design decisions that live only in the web CSS attribute selectors
  (`[data-gap]`, `[data-background]`, `[data-variant]`, …); the layout primitives skip-emit
  (decision 36/37), so there is no build artifact to derive the prop union from. The mirrors
  hand-typed them; this consumer copied them faithfully. Correct — but every one is a **drift
  risk**: add / rename / remove a leaf or variant in the spec and the RN union silently goes stale
  (no compile error, unlike `TokenPath`).
- **The full pattern** (every hand-typed prop union in this consumer the build doesn't emit):
  - **Curated SUBSETS of an emitted scale** — `SpaceLeaf = xs|sm|md|lg|xl` (5 of the 8 `space`
    leaves · Stack `gap`, Box `padding*`, Spacer `size`); Separator `ySpace = none|xs|sm|md|lg|xl`
    (6 · excludes 2xs/2xl); Topbar `Inset = xs|sm|lg`; Icon `size = md|sm`.
  - **Full enums equal to an emitted scale's keys** (derivable as `keyof`) — Box `BoxRadius =
    sm|md|lg|full`; List `Density = sm|md|lg` (mirrors `list.density{Sm,Md,Lg}MinHeight`); Button
    `ButtonSize = lg|md|sm` (mirrors `button.{lg,md,sm}*`).
  - **Pure semantic enums with no build scale at all** — Box `BoxBackground =
    canvas|subtle|strong|accent-solid|accent-subtle` (→ chrome/accent paths); Button `ButtonVariant
    = solid|soft`; IconButton `IconButtonVariant = solid|soft|ghost`; Spacer `grow = 1|2|3|4`.
  - **Structural/flex vocab** (lower-stakes, still hand-typed) — Stack `direction|align|justify`,
    Typography `align`, Spacer/TypographyStack `direction`.
- **Contrast — where the build DOES emit the vocab, RN derives it safely (zero drift)**:
  `TypeSize`/`TypeKey`, `IconName`/`IconWeight`, `Accent`/`Theme`. These are the proof the pattern
  is fixable: emit the vocab → derive the type → a spec change breaks the RN compile.
- **Proposed spec fix**: have the pipeline **emit the curated prop vocabularies** (the layout space
  subset; the per-component `background`/`radius`/`variant`/`density`/`size` enums) as build
  artifacts — e.g. `build/prop-vocab.ts` or fields on the per-component files — so the RN side
  imports and derives them instead of hand-typing. Then a leaf/variant change breaks the RN compile
  (the same machine-checked guarantee `TokenPath` already gives token paths) instead of drifting.
- **Deliberately NOT patched locally** (per the follow-up): the consumer keeps the faithful
  hand-typed copies so the gap stays visible and the real fix flows down from the build. (A free
  *partial* local mitigation exists for the subset cases — e.g. `type SpaceLeaf = Exclude<keyof
  typeof space, 'none' | '2xs' | '2xl'>` tracks leaf add/remove from the build, though the exclusion
  set stays hand-maintained — a half-fix; left unapplied on purpose.)
- **Evidence**: `src/nuri/theme.tsx` (`SpaceLeaf`), `components/{Box,Button,IconButton,Spacer,List,Separator,Topbar,Icon}.tsx`
  (the unions above) vs `build/tokens.ts` + `build/components/*.ts` (no prop-vocab exports).

## F-DEMO-6 · Topbar · 🟡 · empty side region not collapsed → phantom gap (violates DECIDED amendment 46.3)

- **What**: an empty `<TopbarStart>` (or `<TopbarEnd>`) still contributes a slot to the row's
  `gap: space.sm`, nudging the title inward by ~6px even though the region is empty. The My-vault
  topbar — title + `<TopbarEnd>` only, no start — shows exactly this phantom inset.
- **Already decided in the spec**: `decisionlog.md` **amendment 46.3 (N+11)** — "an empty side
  region collapses (no phantom gap)" — fixes the web via `topbar.css:148`:
  `nuri-topbar:not([data-center])[data-leading="empty"] .nuri-topbar__start { display: none; }`
  (collapse the empty side OUT of flow, but ONLY in the non-`center` layout; `center` keeps the
  regions to balance the centre). The amendment's **RN-parity note** is explicit:
  *"The RN Topbar must mirror this — don't render an empty side `View` in the non-center layout, or
  the row's `gap` re-introduces the phantom inset."* It even names this exact screen: *"the My-vault
  topbar — title + end only — hit exactly this."*
- **The gap**: the RN Topbar mirror (`docs/migration-tests/button-matrix/topbar.tsx`) **always**
  renders all three region Views (so `center` can balance with `flex:1` sides) and never collapses
  the empty one in the non-center case — so it does **not** honor 46.3's RN-parity note. This
  consumer's `Topbar` faithfully copied that structure and inherited the phantom gap.
- **Deliberately NOT patched locally** (per the follow-up): the consumer stays faithful to the
  mirror. The fix belongs in the **DS repo's RN Topbar mirror** — conditionally skip the empty side
  `View` when `!center` (the RN analogue of the web `display:none`), keep both sides when `center`.
  Consumers then inherit the collapse.
- **Measured (live My-vault render, mobile viewport)**: the topbar row has `paddingLeft: 18px`
  (`space.lg`) + `columnGap: 6px` (`space.sm`) and renders **3 region children with widths
  `[0, 339, 0]`** — the leading region is present at **0px** but still eats a gap slot, so the title
  sits at **24px** from the row's left edge (`18 + 0 + 6`) instead of the 18px the 46.3 collapse
  yields. Empirical confirmation of the phantom `space.sm` inset.
- **Related (same region-layout code · a separate latent bug, also upstream)**: the side regions use
  `flex: sideFlex` (= `flex: 0` in non-center), and RN's `flex: 0` sets `flexBasis: 0` — so the
  TRAILING region also measures **0px** (the `[…, 0]` above) and its two icon buttons **overflow**
  the collapsed box, rendering correctly only because the box sits at the right edge. The web sizes
  non-center side regions to their content, so it reserves the trailing width; the RN `flex:0` does
  not, so a longer title could grow the centre under the icons and overlap them. The intended RN
  shape is `flexGrow: sideFlex` (basis `auto`), not `flex: sideFlex`. Logged, not patched.
- **Evidence**: `src/nuri/components/Topbar.tsx` (renders `startNode`/`endNode` Views
  unconditionally; `flex: sideFlex` on the side regions) + the live measurement above; web reference
  `lib/components/topbar/topbar.css:148` + `decisionlog.md:2529` (amendment 46.3 + RN-parity note).

---

## Summary · what the first real render produced

| ID | Component | Severity | One-line |
|----|-----------|----------|----------|
| F-DEMO-1 | Button | 🟡 | `children:string` can't host the My-vault Apple-Pay icon (web slot); composed from primitives + logged. |
| F-DEMO-2 | Button | 🟡 | mirror's `flex:1` overfits the matrix row demo; breaks column layout. Ported without it (web is `inline-flex`). |
| F-DEMO-3 | Scroll | 🟡 | bare `ScrollView{flex:1}` won't let a `Box fill` child fill; needs `contentContainerStyle.flexGrow:1`. |
| F-DEMO-4 | Separator | 🟡 | `alignSelf:'stretch'` collapses in a ROW (the swap affordance); web is `inline-size:100%`. Fixed with `width:'100%'`+`flexShrink:1`. |
| F-DEMO-5 | prop vocab | 🟢 | build emits TOKENS but not the curated PROP vocab (SpaceLeaf · Box background/radius · variant enums · …) → RN hand-types it, drifts. Emit the vocab. *(upstream · not patched)* |
| F-DEMO-6 | Topbar | 🟡 | empty side region not collapsed → phantom gap; violates DECIDED amendment 46.3 (RN-parity note). Fix in the DS RN mirror. *(upstream · not patched)* |
| P-CONTROL-1 | theming | ✅ | light × dark × neutral-solid INVERSION all hold (matrix was light-only). |
| P-CONTROL-2 | Icon + a11y | ✅ | SvgXml renderer + F-ARIA-LABEL-1 / F-LISTITEM-ROLE-1 / F-TABBAR-ROLE-1 behave as budgeted. |

**Headline for the DS team**: the contract is sound — every token path, the single-context theming
model, the scope tiers, the icon registry, and the budgeted behavioural deltas all held up on the
first real render. The six findings fall in three buckets, all **upstream** (none are consumer bugs):

- **Mirror styling-structure artifacts invisible to the type-only test** (F-DEMO-1..4 · `noEmit`,
  never rendered): three RN flex/layout realities (Scroll fill, Separator orientation, Button grow)
  and one genuine contract gap (Button has no icon slot). Localized to a component's RN translation.
- **A build-emit gap** (F-DEMO-5): the pipeline emits token scales but not the curated *prop*
  vocabularies, so RN hand-types them and they can drift. The fix adds emit, not re-derivation.
- **A regression against a decided amendment** (F-DEMO-6): the RN Topbar mirror doesn't honor
  amendment 46.3's RN-parity note (empty-side collapse), so the phantom gap it was written to kill
  reappears on RN.

F-DEMO-5 and F-DEMO-6 are logged but **deliberately not patched in this consumer** — the consumer
stays a faithful mirror of the spec, and the fix flows down when the DS repo addresses it.
