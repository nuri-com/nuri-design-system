# Emit model · prop-vocab + structure · R-EXPO-6 design base

**Status**: **DECIDED** · folded into [decision 65](../decisionlog.md) (the **L3**
complete-descriptor level · operator sign-off 2026-06-04), refined by **65.1** (thin ·
source-agnostic shape · derive-from-CSS is the bootstrap) and **65.2** (the frozen schema ·
part-addressable `$parts` patches · validated by the variants-model spike). **N+19 · B1** landed
the canonical schema and emitted the descriptor for Button / IconAvatar / Topbar
([`build/descriptors/`](../build/descriptors/) · spike base preserved at
[`variants-model-spike.md`](./variants-model-spike.md)). The §2 LEVELS framing below is the
DESIGN BASE that fed the decision (the operator chose L3 up front · §2/§6) — read decision 65 for
the landing, this doc for the rationale. The §4 Expo boundary still holds: the **factory** (B2 ·
the generator) is finalized in the Expo project, never shipped here. Sister to
[`decisionlog.md`](../decisionlog.md) / [`roadmap/index.md`](../roadmap/index.md) /
[`docs/RISKS.md`](./RISKS.md).

Origin: the N+17 `flex:1` STOP. A content-pivot structural value (`flex:1` / `min-inline-size:0`)
is hand-mirrored in `list.tsx` with no machine guard. The coordinator decided NOT to one-off
emit it — it is a **symptom** of a systemic gap, and the systemic gap is this: **R-EXPO-6**.

---

## 1 · The problem (= F-DEMO-5 / R-EXPO-6)

The build emits token **values** — the scales (`build/tokens.ts`: space/size/radius/type ·
`build/icons.ts`: icon names) and per-component numerics/paths, drift-guarded as `TokenPath`.
It does **NOT** emit:

- the curated **prop vocabularies** the components expose (the enums/subsets: `SpaceLeaf`,
  Box `background`/`radius`, the `variant`/`size`/`density` enums, Spacer `grow`, …), nor
- the component **structure** (which parts exist, which prop maps to which part/value, the
  fixed layout config).

So the RN side **hand-types** all of it, with **no machine guard** → silent drift: add / rename /
remove a leaf, variant, or part and the RN union or layout goes stale, unlike `TokenPath` which
breaks the RN compile. This is the systemic risk F-DEMO-5 named; the N+17 `flex:1` is one instance.

## 2 · The lever — emit a richer descriptor, scaled in LEVELS

Pin the level **before** any pipeline code ("boundary before code").

- **L1 — prop-vocab enums.** Emit the curated unions (`SpaceLeaf` = the 5-leaf space subset;
  Box `background`/`radius`; per-component `variant`/`size`/`density`; Spacer `grow`; …). RN
  *derives* the unions instead of hand-typing → kills the F-DEMO-5 type-drift. **Smallest ·
  highest value-per-risk.**
- **L2 — + prop→value mappings.** Emit which prop value resolves to which token (`gap.md →
  space.md`; `variant.solid → {bg: accent.solid, fg: accent.onSolid}` — the variant×accent
  funnel as data).
- **L3 — + parts / anatomy + layout config.** Emit each component's parts (content-pivot,
  leading, trailing) and their fixed layout config (e.g. the Stack config a component composes)
  → the RN side could *derive the structure*, not just the values. **Largest.**

The operator's framing — *"le parti e il mapping delle varianti"* — spans **L2–L3**.

## 3 · The bridge we already have — decision 24.1

The **parts + mappings** that L2/L3 want **already exist** — as the `data-part` / `data-element` /
`data-property` / `data-token` / `data-conditions` attributes on the anatomy + token-mapping
tables of the component **pages** (the *wiring-spec* for the migration agent · decision 24.1).
So **R-EXPO-6 / L3 ≈ "promote that wiring-spec from HTML-read-by-the-agent to consumable
`.ts`."** The source exists; the work is to emit it as data instead of re-authoring it.

## 4 · Two boundaries to respect

1. **skip-emit (decisions 37 / 46).** Stack / Box / Topbar are deliberately skip-emit (zero
   component tokens; their prop vocab lives in CSS attribute selectors).
   - **L1 (vocab enums) is likely COMPATIBLE** with 37 — 37 forbade *aliasing token values*
     (`--stack-gap-md: var(--nuri-space-md)`), not emitting the *vocabulary* (the enum). The
     enum is a new artifact, not an alias.
   - **L3 (a full structure descriptor) is a RE-DECISION of skip-emit** for the layout
     primitives — it gives them an emit they currently refuse by design. Decide it explicitly;
     do not slip it in.
   - This is exactly why the N+17 `flex:1` is NOT a per-component token: Topbar's content-pivot
     shares the same `flex:1` but is skip-emit, so a `contentFlex` token would force an
     incoherent asymmetry. The flex belongs to this systemic descriptor (if L3 lands), never a
     one-off.
2. **Expo boundary (OPEN THREAD 2).** Emitting a richer descriptor = **providing the contract**
   ✓. Building the **generator** that consumes it (RN derived/generated from the descriptor) =
   RN-package work → **owned by the Expo team, NOT built here.** We emit the data; they
   generate. The migration tests stay the in-repo proof the contract is faithful — they are not
   a code generator.

## 5 · "ListItem uses Stack" — the composition angle

Composing Stack *internally* with fixed config is consistent with decision 64 (compose-
internally, not a facade · the allowed pattern). It becomes powerful once Stack's config is
**emitted** (L2–L3): a component's layout becomes data-derived rather than hand-mirrored. Part
of the R-EXPO-6 design, not N+17.

## 6 · Recommendation

- **Start at L1** (vocab enums) — high value (kills the F-DEMO-5 type-drift), low risk
  (compatible with skip-emit), derivable today.
- **Stage L2 → L3, each P11-gated**, with the explicit skip-emit re-decision + the Expo-boundary
  check. L3 (parts/anatomy → the `flex:1` and the content-pivot structure become data) is the
  endpoint that *subsumes* the N+17 hand-mirrored structural values.

## 7 · What this doc does NOT decide

The **level** (L1 / L2 / L3) is the operator's call — it sizes the decision. This doc is the
base; the decision (it will fold into `decisionlog.md`) + the session(s) follow. Until then the
structural / prop values stay **hand-mirrored** (known-deferred · recorded in `roadmap/index.md`
R-EXPO-6 + `docs/RISKS.md` R1).

**Related pending decision** (separate, smaller): **R-EXPO-1** — the Button icon-slot contract
(a `children` slot vs an `icon` prop, plus how the label colour reaches a nested `<Icon>` — RN
`<Text>` colour does not inherit into a child, no `currentColor` analogue).
