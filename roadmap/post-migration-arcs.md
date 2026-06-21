# Post-migration arcs — coordinator handoff (decision 66 · arc #1 in progress)

> **How to use this file.** VARIABLE FILL (First task + Context drop) for a NEW **coordinator**
> session. **Spawn from [`prompts/coordinator.md`](../prompts/coordinator.md)** — read its FIXED
> briefing + READ-FIRST set first; this adds the arc-specific task. Continues the decision-66 arc
> sequence: the migration is COMPLETE, **arc #0 (Smell-1)** and **arc #1 increment 1 (website doc-gen ·
> Button)** are MERGED.
>
> **Prerequisite — re-verify the baseline** (`main` after the N+23 merge of `feat/website-increment-2` ·
> increment 2 · the counts below are UNCHANGED — Guard G was EXTENDED to 3 pages, not added):
> - `npm test -w @nuri/spec` → **26/26** (Guard G · the doc re-emit teeth · now covers all 3 generated pages)
> - `npm test -w @nuri/factory` → **27/27 + 7 snapshots**
> - `npx tsc -p packages/factory/tsconfig.json --noEmit` → **0** · same for `packages/expo-demo` → **0**
> - `npm run build -w @nuri/spec` then `git diff --exit-code packages/spec/build/` → **clean**
>   (`build/docs/*.md` is now part of the committed, re-emit-byte-identical output · decision 35).

## First task

Coordinate the **`website` doc-gen arc (#1) continuation** ([decision **66**](../decisionlog.md) · the
generation thesis applied to docs). *As coordinator* (plan · brief · review diffs; **do not execute**).
**Resolve the open design calls WITH THE OPERATOR FIRST**, then brief — same posture as every prior arc.

**Where arc #1 stands:**
- ✅ **increment 1 (N+22 · merged #42 · [`roadmap/N+22.md`](./N+22.md)):** the doc-gen mechanism is
  proven **end-to-end for Button** — the in-pipeline emitter `packages/spec/pipeline/parsers/docs.js`
  (Slice 9 · **read-only on the descriptor · NOT §9 · spec-only, no prose**) → `build/docs/button.md`
  (committed · new **Guard G** re-emit teeth) → the `website/` Jekyll/just-the-docs shell → the
  `.github/workflows/pages.yml` Pages-Actions deploy. **DRY:** only the Jekyll shell + the AUTHORED
  `<nuri-demo>` partial + `stage.mjs` are committed; the runtime assets + the generated MD are
  gitignored staged copies of the SoT (`packages/spec/{lib,styles,build}`).
- ✅ **increment 2 (N+23 · [`roadmap/N+23.md`](./N+23.md)):** the emitter **GENERALIZED** Button → all
  three `DESCRIPTOR_COMPONENTS` (button · icon-avatar · topbar → the full descriptor-backed nav) + every
  token-map cell **ENRICHED** with its resolved value (the **2-column** `Token | Resolves to` · geometry px
  · the type composite · a live `var()` swatch + the default-scope hex · em-dash on literals/flags · the
  swatch-var DERIVED from the classified groups · the scope ANCHORED to neutral·cream·light so swatch==hex).
  **Still read-only · NOT §9 · the 3 hand pages NOT retired** (Guard D · the retire-gate is OPEN, below).

**Coordinator lean for the START — increment 3: the retire-gate decision (a/b/c), THEN the axis-driven
selects** (STUB · operator refines). The generalized emitter surfaced the substance the operator must now
settle: **when is a generated page "covering enough" to retire its hand-written counterpart?** It is gated
on the two derivable-spec gaps the docs now make visible — **no default-per-axis** (≡ the R1.5 finding · the
API table can't mark `soft`/`md` defaults) + **axes ⊂ the element props** (`accent`/`disabled` are not
composition axes → absent from the generated API → narrower than the hand pages). **The a/b/c options to
resolve WITH THE OPERATOR FIRST:** (a) **accept the narrower descriptor-faithful surface** and retire on it
(the hand pages lose their accent/disabled/default prose) · (b) **GROW the frozen contract** to carry
defaults + extra props (a **Guard-F schema change** · versioned · ties to the Digital-cash first-bump) ·
(c) a **hybrid** — retire the derivable half, keep a thin hand-written prose stub for accent/disabled. Only
after the retire-gate: the **axis-driven `<nuri-demo>` selects** (per-prop selects derived from the
descriptor's axes → retires the authored demo partials · the operator's story endgame). The **`@layer`
font live-check** stays HELD (verify on the live themed render · don't apply blind).

## Context drop

### Read first for this arc (on top of coordinator.md's READ-FIRST)
- [`roadmap/N+22.md`](./N+22.md) — the increment-1 as-built: the emitter pattern · the kramdown finding
  (default block-HTML passthrough via `_includes/` · **no fallback needed**) · the `stage.mjs` SoT-copy
  asset model · **the derivable-spec GAPS** (the design substance of increment 2).
- [`decisionlog.md`](../decisionlog.md) **§66** (the arc sequence) + its **N+22 As-built note** (the
  reusable patterns) · **§2** (CSS is SoT · **STANDS** · doc-gen is read-only · **NOT §9**) · §65/65.3
  (the descriptor = the frozen machine-spec the emitter reads) · **§57.2** (the demo is a consumer
  STORY · authored, not generated · the one LOCKED decision) · **§24.1** (the `data-part` page anatomy =
  the descriptor STRUCTURE source · **Guard D** · stays as the hand pages retire) · §35 (build/ committed
  · `build/docs/` included) · §10 (`<nuri-demo>`) · §48 (one source, two readers).
- [`docs/north-star.md`](../docs/north-star.md) move 3 (the doc-gen mechanism · just-the-docs).
- [`roadmap/post-migration-cleanup.md`](./post-migration-cleanup.md) — the **LIVING stale-map**; rows
  **#2** (the four-reader framing) + **#3(b)** (the `pages/components/*` prose) shrink as the emitter
  generalizes and the hand pages retire.
- `packages/spec/pipeline/parsers/docs.js` + `tokens-parser.js` (Slice 9) + the `website/` dir — the
  increment-1 artifacts to generalize.

### The discipline (load-bearing · don't break)
- **Decision 2 STANDS.** The doc-gen is **READ-ONLY** on the descriptor — emit docs FROM it, **never
  generate CSS from it**. §9 (`descriptor → CSS`) is a SEPARATE, audit-gated, **NOT-decided** arc. Do
  **not** let website work drift into §9.
- **Only 57.2 is locked.** Everything else is direction / per-arc (P11).
- **The hand-written `pages/components/*.html` STAY until covered.** Their `data-part` anatomy is the
  descriptor STRUCTURE source (Guard D · decision 24.1). Retire **INCREMENTALLY**, never wholesale — and
  weigh what their prose carries that the generated page does NOT (see the gaps below).
- **Spec-only docs · no prose (DRY).** Prose, if ever, = an optional hand-written README, never
  duplicated. No prose-as-data.
- **Ledger append-only · branch-BEFORE-commit · exclude `.claude/launch.json`** (+ the local
  `nuri-website` launch config). NB: both prior working sessions worked on `main`'s tree and branched at
  commit — re-state "branch before any commit" in every brief.

### Open design calls to resolve FIRST (increment 2 · generalize the emitter)
1. **The derivable-spec gaps (the real substance · found at N+22).** The descriptor carries **no
   default-per-axis** (≡ the **R1.5 "no default-per-axis in the frozen contract"** finding · the API
   table can't mark `soft`/`md` as defaults) AND the **axes ⊂ the element props** (`accent` scope-override
   + `disabled` state are NOT composition axes → absent from the generated API · **narrower than the old
   hand pages**). **Decide WITH THE OPERATOR:** does the generated doc accept the narrower, descriptor-
   faithful surface for now, or does the frozen contract GROW to carry defaults / extra props (a Guard-F
   schema change · ties to the Digital-cash first-bump agenda)? **Do not pre-empt** — this is the gate on
   how aggressively the hand pages can retire.
2. **The hand-page retirement criterion** — when is a generated page "covering enough" to retire its
   hand-written counterpart (which loses the accent/disabled/default prose)? Follows from #1.
3. **The nav structure** (just-the-docs front-matter `nav_order`/`parent`) as the catalog grows — the
   Components group + ordering. `parsers/docs.js` has a `NAV_ORDER` stub today (Button=1).
4. **The `@layer` font live-check** (HELD from N+22) — verify on the live themed render; the fix, if it
   manifests, is a small **unlayered** override in `website/_includes/head_custom.html` (unlayered beats
   `@layer`). Don't apply blind.

### Grounding — the codebase truths (on top of coordinator.md's)
- **The emitter is generic over namespaces already** (`compositionRows` walks any part × namespace ·
  `parsers/docs.js`), so generalizing to all components is mostly: extend `DOC_COMPONENTS` (today
  `['composition-button']`) to the full `DESCRIPTOR_COMPONENTS` set + handle the per-component demo
  partials + the nav. Read-only, byte-stable, leaf-validated against the scales.
- **The website is DRY by construction** — `stage.mjs` copies assets + generated MD from the SoT at
  build; `website/.gitignore` excludes the copies. Only the shell + the authored demos + `stage.mjs` are
  committed. The `pages.yml` deploy is **separate from `gates.yml`** (non-gating · the 3 merge gates are
  unchanged).
- **The factory has 3 ergonomic components** (Button/IconAvatar/Topbar · the descriptors at
  `build/descriptors/*`); the full `DESCRIPTOR_COMPONENTS` walk also covers the skip-emit primitives.
- Gates = the 3 per-workspace CI jobs (`spec`/`factory`/`expo-demo`); branch protection requires those
  3 names; PRs squash-merge.

### Parked / deferred (don't build on direction alone)
- **Smell-1.1** — the dead-code tail (the now-vestigial per-component `@layer` walk in `tokens-parser.js`
  Slice 4 + the 3 emitted-file header echoes that still name `build/components/<name>.ts` · header-only
  re-emit · gate-green · ⚠ `emitTokenPathsTs` MUST stay). Tracked in stale-map row #3(a).
- **The axis-driven `<nuri-demo>` selects** — after the emitter generalizes; per-prop selects derived
  from the descriptor's axes → retires the hand-authored demo partials (the operator's story endgame).
- **The doc-debt** — the guidance docs hardcode the spec test count (`25/25` → now **26**; de-hardcode,
  don't chase it) · the `prompts/coordinator.md` + `prompts/working-session.md` "docs site is live off
  main" line is true again but now via `pages.yml`/Actions, not `.nojekyll` root-serve. Fold into the
  first session that touches those docs.
- **NuriElement / palettizable-primitives** (decision 66 · outside dec-64's taxonomy · resolved only if
  the playground reveals a real composition limit · P11).

### Working model (git + review)
- Branches → PR → **coordinator reviews the diff** (re-run gates first-hand · the discriminator · no
  history rewrite) → **operator opens the PR** (`gh` absent · via the `pull/new/` link) +
  **squash-merges** → **coordinator moves `main`** (`git fetch` · `checkout main` · `merge --ff-only` ·
  `git branch -D <branch>`). Both prior sessions reached the operator-checkpoint cleanly + escalated the
  right judgment calls; the coordinator review caught what the sessions' own sweeps missed (Smell-1's
  broken doc-links · N+22's tree-wide ref sweep). **Verify load-bearing findings against the code.**
- `.claude/launch.json` is a pre-existing local mod — exclude it from every commit.
- **Memory**: `[[relocation-cross-repo-setup]]` is current through N+22 (the index line carries the
  arc-#1 state + the next pointer + the doc-debt note).

### Pending operator action (non-blocking)
- **Settings → Pages → Source = GitHub Actions** (if not yet done) — `pages.yml` is inert until then; it
  deploys the generated site on push-to-`main`.
- **Verify the live deploy** — the **Actions** tab (the "pages" workflow run · green?), then the live URL
  `https://nuri-com.github.io/nuri-design-system/` (Button under `/components/`), + the `@layer` font
  check (open call #4).
- **`expodsdemo` end-of-life** — archive (read-only · GitHub) when convenient.
