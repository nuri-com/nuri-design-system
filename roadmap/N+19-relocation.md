# N+19 · RN relocation (X-wired) → Digital-cash — coordinator handoff

> **How to use this file.** It is the **VARIABLE FILL** (First task + Context drop) for a new
> **coordinator** session. **Spawn from [`prompts/coordinator.md`](../prompts/coordinator.md)** — the
> FIXED briefing (role · git coordination · *what Nuri IS* · **READ FIRST** · anti-goals · *working with
> the operator*). Read coordinator.md **and its READ-FIRST set first**; this file adds the arc-specific
> task on top. Same shape as [`N+19-B2c.md`](./N+19-B2c.md), which handed off the B2c integration — **now
> done** (the contract is emitted + frozen); this hands off the **consumption side**.
>
> **Prerequisite — the contract is FROZEN.** B3 (#30 · amendment 65.6) landed; everything through B3 is on
> `main` (`02016dc` · #31). Re-verify the baseline: **`npm test` 25/25** · `npx tsc -p
> docs/migration-tests/button-matrix/tsconfig.json` **0** · `git diff --exit-code build/` **clean**.

## First task

Coordinate the **RN relocation** (decision **65.5** · "X-wired") and then **Digital-cash**. *As the
coordinator* (you plan, brief working agents, review diffs; **you do not execute** · coordinator.md).

- **Resolve the open design call FIRST with the operator** (the **seam mechanism · R7**) **before** briefing
  — same posture as the B2c design calls. The seam must **GATE** (block a contract change here unless
  `expodsdemo` consumes it green); a non-blocking/async check degrades X-wired to X-lite (the "eyeballed,
  not machine-checked" smell merely relocated · R7).
- **Ground the seam design in `expodsdemo`'s real shape** — how it consumes `build/*` today (it consumes
  `build/tokens` for the My-vault compose · R5; it does **not** yet consume `build/descriptors/*`), and
  whether it can run a **headless render in CI** (or only typecheck). Repo: `github.com/darioaschero/expodsdemo`.
- **Sequence** (below): seam design → wire `expodsdemo` (build its descriptor-factory there · cross-repo ·
  operator-owned) → **retire `button-matrix` LAST** (only after `expodsdemo` is the proven-green consumer
  of the frozen descriptor) → **Digital-cash** (the first post-freeze consumer · the forcing case for the
  first *versioned* bump).

## Context drop

### Read first for this arc (on top of coordinator.md's READ-FIRST)
- `decisionlog.md`: **65** (the contract = frozen data · the factory boundary: *"never ship the factory
  here"*) · **65.1** (the SHAPE is the foundation · source-agnostic freeze) · **65.3 §6/§7** (the
  composition model · the five namespaces · the data model) · **65.4** (the `interactive` structured
  per-part opt-in) · **65.5 — X-WIRED · the heart of this arc** (the RN proof relocates to `expodsdemo`
  CI-wired · the in-repo factory-draft + `button-matrix` are retired LAST · the in-repo structural test
  dissolves · the monorepo is rejected unless the repo ships RN itself) · **65.6** (the contract is
  FROZEN · Guard F).
- [`docs/RISKS.md`](../docs/RISKS.md): **R7** (the cross-repo gating seam — *must block, not async* · the
  open risk THIS arc closes · names the seam-mechanism choice) · **R1/R3/R5** (the props-1:1 / render
  thesis · the machine-check is relocating from the in-repo type-only mirror to `expodsdemo`'s CI) · the
  **Last-updated breadcrumb** (the B2c·1+·2 close + the X-wired reversal).
- [`docs/composition-model.md`](../docs/composition-model.md) **§6–9** (the validated model) + **§7's
  B2c·2 refinement note** (`base` is per-part `PartMap` · `interactive` is a structured opt-in).
- [`roadmap/N+19-B2c.md`](./N+19-B2c.md) (the prior arc handoff — the B2c integration, now done) + the
  session docs [`N+19-B2c1.md`](./N+19-B2c1.md) · [`N+19-B2c2.md`](./N+19-B2c2.md) · [`N+19-B3.md`](./N+19-B3.md).
- **The frozen contract** (what `expodsdemo` consumes): `pipeline/descriptors/schema.ts` (the shape ·
  Guard F locks it · carries the FROZEN header) · `build/descriptors/{schema,composition-button,icon-avatar,topbar}.ts`
  (the emitted instances) · `pipeline/docs-drift.test.js` (Guards **A–F** · F = the schema-shape freeze).

### What landed this session (the B2c integration + the freeze · all on `main`)
- **B2c·1 (#27)** — the **`interactive` namespace web channels**: new `lib/components/interactive/interactive.css`
  (the structured per-part opt-in · `.nuri-interactive` + independent `data-*` gates · affordance +
  press-scale + disabled-opacity) + `palette.css` pressed `:active` (the B2b-deferred row · gated
  `[data-press-color]`) + **Guard E** extended. Ratified **65.4**.
- **B2c·2 (#28)** — the **descriptor re-emit**: raw-style schema (65.2) → **pure-data composition form**
  (65.3 §7 · `{ structure:{anatomy,base}, variants? }` · no theme thunk · the five namespaces in semantic
  names) · the three descriptors === composition-model §8 · **Guard D** reworked (teeth 7/7). `base` is
  per-part; `PartAnatomy` purely structural; `interactive` opt-in on `base.root`; variant→fg drops (scope).
- **B2c closeout (#29)** — index/board · **65.4** (interactive opt-in) + **65.5** (X-wired) · RISKS **R7** +
  breadcrumb · composition-model §7 reconciled.
- **B3 (#30)** — the **contract FREEZE**: **Guard F** (runtime structural pin · operator-chosen mechanism
  **B** over the compile-time `AssertEqual` mirror **A**) pins all **19 exported schema types** (field
  vocabularies + value-types · leaf vocabs · the `Descriptor`/`PartAnatomy`/`PartMap`/`Part`/`El`/`NS`/`Axes`/`Variants`
  envelope) and asserts the source declares exactly that. **Verified to bite** (6 perturbation classes +
  byte-identical restore · `tsc` does NOT catch an unused-field declaration → F adds real coverage).
  `AGENTS.md` hard-rule 21 extended. Ratified **65.6**.
- **B3 closeout (#31)** — index/board **B3 ✓** · **65.6**.

### The open design call to resolve FIRST (the seam · R7)
How does `expodsdemo` consume `build/*` such that a contract change **here** is gated on `expodsdemo` green?
Three mechanisms (R7):
| | mechanism | gating | cost |
|---|---|---|---|
| 1 | **versioned package** (this repo emits `build/*` as a package · `expodsdemo` depends on it) | soft (consumes on its own schedule, unless this repo's CI also runs against the unpublished `build/`) | publish + version-bump ceremony |
| 2 | **git submodule** (`expodsdemo` includes `build/` · a change bumps the ref) | medium | submodule ergonomics |
| 3 | **CI cross-repo** (a job *in this repo* that checks out `expodsdemo`, points it at the candidate `build/*`, runs its typecheck + render, and **blocks the merge** if red) | **hard** | CI plumbing (cross-repo checkout + a blocking status check) |

**Coordinator lean: (3)** — a `gates.yml` job that exercises `expodsdemo` against the candidate `build/*`
and blocks. It is the tightest gating (X-wired's whole promise) done the simplest way to make *blocking*
(it is just another gate). Package/submodule/checkout for sharing `build/*` is the sub-detail. **But the
choice depends on `expodsdemo`'s real shape** (consumption + whether it can headless-render in CI) — settle
that grounding question with the operator before locking.

### The reshaped tail + sequencing
1. **Seam design** (operator design pass · R7 · the gate mechanism · grounded in `expodsdemo`).
2. **Wire `expodsdemo`** — build the **descriptor-consuming factory** there (it consumes `build/tokens`
   today, NOT `build/descriptors/*`) — 65's *"production factory finalized in Expo"*, now the **only** one —
   + the gating seam. Cross-repo / operator-owned; the coordinator briefs + reviews.
3. **Retire `button-matrix` LAST** (in-repo) — only after `expodsdemo` is the proven-green consumer of the
   **frozen** descriptor (no validation gap · 65.5/65.6). At retire: the gates' `tsc` step **retargets**
   from the RN mirrors to a contract-only tsconfig (schema + descriptors stay type-checked); update
   references (`docs/RISKS.md` R1/R3/R5 · `decisionlog.md` · `.github/workflows/gates.yml` · `AGENTS.md`).
4. **Digital-cash** — the first post-freeze consumer (new anatomy: numeric keypad / amount display),
   rendered in `expodsdemo` — a clean fit or the **first versioned contract bump** (the versioning
   machinery, deferred · P11 · 65.6, lands here).

### Lessons / state to carry
- **X-wired is the spine**: the repo = the contract (emitted descriptors + the frozen schema guard); the RN
  proof is **external** (`expodsdemo`), the in-repo factory-draft + structural-equivalence test are **not
  built** (reversed from the original decision-65 plan · 65.5). Don't re-introduce an in-repo factory.
- **`button-matrix` STAYS gating** until the relocation retires it (the type-only mirror is the weaker gate
  until `expodsdemo`'s render replaces it · retire LAST · no validation gap).
- **Follow-on · stale comments**: `schema.ts` / `descriptors.js` **body comments** still cite the in-repo
  "B2c·3 factory" (superseded by 65.5) — left out-of-diff at B3; **sweep at the relocation's narrative
  reconciliation**.
- **The versioning machinery is deferred** to its first bump (Digital-cash · 65.6) — don't build it speculatively (P11).
- **Be adversarial** — the operator caught the bare-boolean `interactive` flag (→ the structured opt-in,
  65.4) and drove the X-wired reversal from a "dead code smells" instinct. Trust the smell; find the holes.
- **Ledger discipline**: the coordinator owns `index.md` / `decisionlog.md` / `docs/RISKS.md` at merge;
  working agents write their `roadmap/N+19-*.md` session doc but **NOT** `index.md`. The pattern this
  session used: impl PR (working agent) → **coordinator closeout PR** bundling index + decisions (e.g.
  #29 bundled 65.4/65.5; #31 bundled 65.6).
- **Git**: the **operator** runs working sessions + opens/merges PRs (`gh` absent · `main` protected · SSH
  remote `git@github.com:nuri-com/nuri-design-system.git`). The coordinator **reviews the diff on the
  branch + re-runs the gates** before approving, then records the ledger at merge. Working agents hit a
  **visual/operator checkpoint** before closeout (their AskUserQuestion comes to the operator, who relays
  to the coordinator for the diff review).

### Board + housekeeping
- Board: **B2a ✓ · B2b ✓ · U3 ✓ · B2c·1 ✓ · B2c·2 ✓ · B3 ✓ (CONTRACT FROZEN)** → **RN relocation** (seam
  R7 · `expodsdemo` factory · retire `button-matrix` last) → **Digital-cash**.
- Baseline: `npm test` **25/25** · `tsc` 0 · `build/` clean · `main` at `02016dc` (#31).
- Branches **clean** (only `main`; `docs/b2-handoff` was verified superseded + pruned this session).
- This handoff ships as its own small PR (`docs/relocation-handoff`); merge it before spawning the new
  coordinator session.
