# Convergence — the plan to finish the refactor

> **What this is.** The **spine**: the bounded path out of the week-long refactor, and the line
> that separates *finishing the refactor* from *building the catalog*. It is the authoritative
> **current plan** — it supersedes the sprawling `roadmap/index.md` Current-state stack as the
> forward record (which is purged against THIS doc at phase 5). The **stable target** stays in
> [`docs/package-architecture.md`](../docs/package-architecture.md) (the 6 packages) +
> [`docs/target-architecture.md`](../docs/target-architecture.md) (the projection model); the
> **session sequence** stays in [`roadmap/package-migration.md`](./package-migration.md) (A3→B2).
> This doc adds what those don't: the **exit definition**, the **archive + rebuild-on-demand**
> stance, the **icon simplification**, the **generation/propagation model**, and the **ledger purge**.

## 1. The frame — two things, not one

The week of churn conflated two efforts. Separating them is the way out:

- **The refactor** — the *structure*: the package split, generation going live, `spec` becoming pure
  data, the pre-axes debt archived. **Finishable**, and nearly done.
- **The catalog** — *writing components*. Ongoing **product work**, incremental, **after** the exit.
  Not part of the refactor.

**The refactor ends when the structure is coherent — not when every component is rebuilt.**

## 2. The exit definition

The refactor is **done** when:

1. the **6-package structure** is real (`spec` · `prototype` · `rn` · `doc` · `playground` · `expo-demo`);
2. `@nuri/spec` is **pure data** — registry + token vocabulary + schema + SVG + a generic icon descriptor · **no deps · no scripts**;
3. **generation is live** — the generated CSS/surfaces are the source; the hand CSS/recipe oracle is **deleted**;
4. the **pre-axes debt is archived** out of the active tree (✓ phase 1);
5. the **ledgers are purged** to a lean current set matching the architecture docs.

After that, building/rebuilding components is normal forward work (one descriptor at a time), **not the refactor**.

## 3. Target structure (the stable reference)

| package | role | holds |
|---|---|---|
| **`@nuri/spec`** | SoT · TS · **no deps** | descriptor registry · token vocabulary · schema · **SVG folder + generic icon descriptor** |
| **`@nuri/prototype`** | library · build-free web | the web **factory** · the **primitives** · the CSS (generated, post-flip) · `nuri-demo` |
| **`@nuri/rn`** | library · RN-native | the engine + the generated barrel |
| **`@nuri/doc` · `@nuri/playground` · `@nuri/expo-demo`** | consumers | the SSG site · the build-free bench · the RN example |

DAG: `prototype → spec` · `rn → spec` · `doc/playground → prototype` · `expo-demo → rn`.

## 4. The phases

**Phase 1 ✓ — legacy archive (N+36).** The pre-axes hand recipes + their pages + compositions quarantined
to `packages/spec/legacy/`; the active tree is exactly **{primitives + the 3 descriptor recipes}**
(button · icon-avatar · topbar). Reversible · dec-2 untouched. `my-vault` = the rebuild spec.

**Phase 2 — the package carve** (§9-independent · reversible under dec-2 · [`package-migration.md`](./package-migration.md) A3–A6):
- **A3 ✓ ([N+41](./N+41-prototype-carve.md)) · carve `@nuri/prototype`** — moved the web mechanism (factory +
  primitives + the 3 factory-backed recipes + `nuri-demo` + `reset.css`) out of `spec/lib`. **Post-flip re-cut**:
  because phase 3 already made the namespace CSS GENERATED, it MOVED to `prototype/styles/` **and the generation
  moved with it** (`prototype` owns its emitter · reads `spec`'s TS SoTs cross-package via the exports map · §5) —
  superseding the pre-flip "namespace CSS STAYS in `spec` · option iii" plan (that held only until the flip). The
  carved CSS regenerates byte-identical; the factory now lives where a DOM-emulator dev-dep is legitimate. The
  factory **harness** (the no-harness gap) stays open → A6 / a follow.
- **factory harness** — close the no-harness gap (a committed test of `buildComponent` · in `prototype`) **before**
  the factory becomes the sole renderer.
- **A4 `@nuri/doc`** (SSG · `website/` + `spec/pages/` + `spec/lib/docs/`) · **A5 `@nuri/playground`** (the bench)
  · **A6 codegen surfaces** (the RN barrel + WC registrations · §9-independent).

**Phase 3 — the dec-2 flip ✓ LANDED ([N+38](./N+38-L3c-flip.md) · [decision 74](../decisionlog.md))** (§9 · **the one
irreversible step**): the namespace CSS is now GENERATED from the TS SoT **in place over `lib/components/<ns>/<ns>.css`**
(NOT into `prototype` — the A3 carve was HELD · the flip is cleaner in spec, where CSS + pipeline + factory all live ·
the carve is post-flip), wired into `npm run build`. The 3 descriptor **recipe CSS retired** (redundant with the
namespace projection — the factory renders via `data-*` + namespace CSS) + their JS is factory-backed; the hand CSS +
the B1 descriptor parity oracle deleted; the factory is the sole web renderer. **decision 2 reversed for the namespace
layer** (the token cascade — incl. the [decision 63](../decisionlog.md) self-scope — was preserved at [§72](../decisionlog.md);
the namespace flip is computed-equivalent, verified by the per-axis browser checks · 132 checks · 0 fails). See [`cascade.md`](../docs/cascade.md).

**Phase 4 — `spec` → pure data.** The CSS now generated (phase 3), `spec` keeps only data. Fold in the **icon
simplification** (a vendored **SVG folder + one generic icon descriptor** · drops the `@phosphor-icons/core`
dep) and move the codegen out of `spec` (drops `postcss` + the scripts) → **`spec` reaches `no deps`**.

**Phase 5 — ledger purge.** With the structure coherent, archive the historical `decisionlog`/`roadmap` churn
into a history record, consolidate `MEMORY.md` (it is stale + over-limit), and keep a lean current ledger that
matches the architecture docs. Decisions stay immutable — superseded ones move to an archive, the live ledger
describes the arrived state. Input = the convergence record (this doc) + the N+36 archived list.

**← EXIT here.** Phases 1–5 = the refactor. Phase 6 is forward product work.

**Phase 6 (post-exit) — rebuild the catalog.** Author new descriptors from the axes model, one at a time, only
for what the wallet needs, with `my-vault` (frozen in `legacy/`) as the spec. Each rebuild = a normal session.

## 5. Generation / propagation model

**No `@nuri/codegen` package.** Generation splits by **output**: each library owns the emitter for its own
surface and reads `spec`'s data; `spec` owns the shared mapping **tables** (as data) so nothing duplicates.
A data change in `spec` propagates via one root `npm run build --workspaces`: `prototype` regenerates
its CSS, `rn` its barrel, `doc` its markdown — **artifacts committed**, runtimes build-free/native, CI guards
`re-emit ≡ committed`. (Finalized at the flip, when `spec` becomes the data source; recorded here as the working
decision · supersedes `package-architecture.md §7`'s open codegen-home.)

> **Build-order invariant (N+41 · the A3 carve).** npm runs `--workspaces` scripts in **discovery order**
> (`prototype` before `spec` · alphabetical), NOT topologically as the line above implies. **Benign today**:
> `prototype`'s namespace CSS depends only on `spec`'s scale **KEYS** (the `--nuri-{space,size,radius}-<leaf>`
> leaf NAMES · structurally stable · `readScaleVocab`), not the values — so reading the committed
> `tokens-semantic.css` before `spec` re-flips it yields byte-identical output, and CI is per-job (`spec`'s job
> guards the token CSS freshness `prototype` reads). **The latent footgun**: a token-vocab change (phase 4 ·
> adding/removing a scale leaf) requires `spec` built **first**, or a second `prototype` pass. Fix when it bites
> — make the root `build` run `@nuri/spec` before `@nuri/prototype` explicitly (deferred · not worth the
> double-build while the dependency is keys-only).

## 6. What this supersedes

This is the forward plan of record. `roadmap/index.md`'s Current-state stack stays as the as-built history but
is **not** the plan; `package-migration.md` (A3→B2) is the session sequence this references; the architecture
docs are the stable target. At **phase 5** the redundant/duplicative planning docs collapse into this spine +
the architecture docs.
