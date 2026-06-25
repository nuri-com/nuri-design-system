# The cascade — one TS source of truth, two projections

**Status**: NORTH-STAR · operator-directed (N+29 · this session's consolidation).
The single statement of *direction* (the "verso") for the SoT inversion (§9 ·
reversing [decision 2](../decisionlog.md)). It consolidates what was scattered —
and described at the **wrong altitude** — across [`resolver-model.md`](./resolver-model.md) §9,
[`target-architecture.md`](./target-architecture.md), and
[`roadmap/package-migration.md`](../roadmap/package-migration.md). Where those frame §9 as
*"descriptor → CSS"* (recipe-level), **this supersedes them**: the real inversion generates
the *token cascade* + the *namespace* CSS from a TS SoT, and the per-component **recipe CSS
retires**. Sister to `decisionlog.md`.

## The principle

ONE source of truth, in **TS**, as a strict **cascade** — four layers, each authored
**once**, each referencing **only the layer below, by name**. Every platform artifact (the
web CSS, the RN runtime) is a **projection** generated from — or consuming — that SoT.
**CSS and RN code are outputs, never sources.** That is the [decision 2](../decisionlog.md)
reversal, completed. The invariant that makes it coherent: **no value or mapping is declared
twice.**

## The four layers

```
L1  primitives   raw values — the colour ramps, the px / space / size / radius scales
        ↓  (referenced by name)
L2  semantics    roles as the (accent × theme) MATRIX — accent-solid, bg-canvas, … → primitives
        ↓
L3  axes         the 5 namespaces (palette · stack · box · typography · interactive):
                 maps of attribute-groups · each field → { property-concept, value-source } → L2 / L1 scales
        ↓
L4  descriptors  components as COMPOSITIONS of L3 axis-values (per variant / size)   ✓ done — B1 · decision 69
```

A layer never hardcodes what a lower layer owns. Concretely: the axis value-vocabularies
(`SpaceLeaf`, `RadiusLeaf`, …) **derive from the token scales** — adding a spacing token
updates the axis automatically, **no schema edit**. (Today `SizeLeaf` derives via
`keyof typeof size`, but `SpaceLeaf`/`RadiusLeaf` are hardcoded literals — a double
declaration to remove.)

## Two projections — one consumes, one is generated

| | RN — **production** | web — **prototyping** ([decision 68](../decisionlog.md)) |
|---|---|---|
| relation to the SoT | **consumes at runtime** | **generated at build time** (a fidelity projection) |
| L2 semantics | the provider carries `{accent, mode}`; resolves `tokens[accent][mode]` — a **flat lookup**, single-context, no cascade ([27/62/63](../decisionlog.md)) | the **token cascade CSS** — `[data-mode]`/`[data-accent]` blocks incl. the decision-63 `#4b/#6b` self-scope · **CSS-only** · `<nuri-scope>` sets the attrs, the cascade + plain var-inheritance resolve |
| L3 axes | `applyFields` maps the namespace → `ViewStyle` | the **namespace CSS** — the flat `[data-*]` dispatch (`box`/`stack`/`palette`/`interactive`) |
| L4 descriptors | the factory composes them | the factory composes them into **namespace-classed nodes** — `class="nuri-stack nuri-box nuri-palette" data-variant=solid …` |
| recipe / per-component CSS | — none — | **— none — (retired · redundant with the namespace projection)** |

**`<nuri-scope>` and the `nuri-*` elements are thin WC wrappers** — they mirror attributes /
compose namespace classes, for compose-and-translate-to-RN parity ([decision 21](../decisionlog.md)).
They **resolve nothing**; the generated CSS does. The web exists to *prototype* (compose →
translate to RN); production correctness lives in RN.

## The axes, precisely

- **Two agnostic axes** (`stack` · `box`) = **ONE generic structure** — a
  `Field` table (`field → { via, property-concept, value-source }`).
  [`packages/rn/factory/resolve-map.ts`](../packages/rn/factory/resolve-map.ts) already
  encodes it for RN; its own header promises *"three platforms will style from this ONE table
  — RN → ViewStyle · web → CSS · CSS → a rule — do not hand-write the same mapping three
  times."* The web/CSS emit consumes the **same table** (+ its own spelling: camelCase→kebab,
  the logical-pad remap `paddingHorizontal`→`padding-inline`). It was designed at S1, never
  executed for the web — S3 reused the hand CSS instead (Option A), which is where the model
  got lost.
- **Three bespoke axes** (`typography` · `palette` · `interactive`) = **bespoke-but-single-sourced**
  ([decision 67](../decisionlog.md) · the grouping refined by [decision 73](../decisionlog.md):
  typography is bespoke, NOT agnostic — `resolve.ts` handles it as a type-STEP ref, not a `Field`).
  typography = the type STEP (`size → typeKey`, expanded via `typeStyle` at render · the L3.1b axis);
  palette = the colour funnel (the `SURFACE` role table → bg/fg/pressed); interactive = the gated
  state effects (`:active`/`:disabled`, opt-in). **Single-sourcing is the rule, not uniformity** —
  forcing these into the generic `Field` shape is a kitchen-sink; bespoke-but-declared-once already
  satisfies the invariant.
- The axis SoT **belongs in `@nuri/spec`** (today `resolve-map.ts` is mis-homed in `@nuri/rn`
  — backwards vs the [decision 68](../decisionlog.md) `rn → spec` DAG).

## The semantic layer — the one nuance (and the source of most confusion)

L2 is the only layer whose natural form differs per target:

- The **values** are a flat `(accent × theme)` matrix in TS — `tokens[accent][theme]` — the
  SoT. It is *already* the shape of `build/tokens.ts` (today **derived** from the CSS; to
  become **authored**).
- **RN** reads the matrix directly (the flat lookup · no cascade · [decision 27/63](../decisionlog.md)).
- **Web** needs the **CSS cascade** — that *is* how CSS themes. So the cascade
  (`tokens-semantic.css` incl. `#4b/#6b`) is **generated from the matrix**: a templated,
  deterministic emit (a token's dimensionality picks its blocks; `#4b/#6b` is one fixed
  self-scope rule). **[decision 63](../decisionlog.md) is preserved — generated, not
  hand-written.** Proven by a computed-style spike across the (accent × theme × nesting)
  matrix, **not** by byte-identity (the Format-B per-token docs · [decision 33](../decisionlog.md)
  · migrate to the generated docs).

So theming **stays CSS-only on web** — no JS resolver. The cascade is the web's native
mechanism; we flip its **source** (hand → generated-from-the-matrix), not its mechanism.

## The invariant — no double declarations

Each value/mapping authored **once** (TS), referenced everywhere by **name**, every CSS / RN
artifact **generated or consumed**. The duplications this removes, that exist today:

- the axis mapping hand-written in **both** `resolve-map.ts` (RN) **and** the namespace CSS (web);
- `SpaceLeaf`/`RadiusLeaf` hardcoded in the schema **vs** the token scales they should derive from;
- the recipe CSS (`button.css` …) **restating** the namespace dispatch it could compose;
- the per-target property SPELLING (`background`/`backgroundColor` · the logical-prop remap)
  scattered across each axis emit (`namespace-css.js` · `palette-css.js` · `resolvePalette`) — to be
  single-sourced in a central **property-spelling registry** ([decision 73](../decisionlog.md) ·
  realized at L3c / `final`).

## What retires

- The **recipe / per-component CSS** (`button.css` · `icon-avatar.css` · `topbar.css`) —
  redundant with the namespace projection. `palette.css` already resolves `[data-variant]`
  directly (incl. the decision-63 self-scope) and calls component-token aliasing *"useless
  indirection."* → **"B2 = generate the recipe CSS" is obsolete.**
- The **hand recipe JS** (`button.js` …) — the factory composes the namespace nodes (the
  A6 retirement · harness-gated).
- The **hand** `tokens-semantic.css` + the **hand** namespace CSS — become **generated**.
- [decision 2](../decisionlog.md) (CSS is SoT) — **fully reversed** (CSS becomes output).

## Status & the flip (bottom-up · each gated by a spike before any delete)

- ✓ **L4 descriptors → TS** — B1 · [decision 69](../decisionlog.md) · merged (#54). The hand
  CSS is the parity oracle.
- **L3 axes** → home the `Field` table in `spec`; generate the **namespace CSS** from it; the
  RN resolver consumes the same table; **retire the recipe layer** (the factory becomes the
  web renderer · harness-gated). *The flat, low-risk generation + the visible "no recipe CSS"
  win.*
- **L1 + L2 tokens** → author the primitives + the `(accent × theme)` matrix in TS; generate
  the **token cascade CSS** (the `#4b/#6b` spike · decision-63 preserved); `build/tokens.ts`
  becomes the matrix (authored, not derived). *The one genuinely-templated emit + a
  computed-style spike.*

L4 was flipped top-down (fine — descriptors reference *names*); L1–L3 flip bottom-up. L2 and
L3 are independent (both reference names by contract), so order is flexible; recommended:
**L3 first** (easy + retires the recipe layer), then **L2** (the cascade spike). Each flip is
**reversible until its spike proves parity** — the hand source stays as the oracle until the
generated output is proven equivalent, then it is deleted (the B1 discipline).

## Lineage

[decision 2](../decisionlog.md) (CSS-SoT · reversed) · 27 / 62 / 63 (RN single-context · the
web cascade · *validated* by this inversion) · 28 (cascade-structure) · 48 (one source, N
readers) · 64 / 65 (the composition model — the axes + descriptors) · 66 (the generation
thesis) · 67 (the per-target registry `{rn, web, css} × namespace` — **this, made whole**) ·
68 (web = prototyping · the projection) · 69 (B1 · L4 done). **Supersedes** the §9 framing in
`resolver-model.md` §9 and `roadmap/package-migration.md` (recipe-level → cascade + namespace
level).
