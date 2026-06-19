# N+19 · the monorepo migration — coordinator handoff

> **How to use this file.** It is the **VARIABLE FILL** (First task + Context drop) for a new
> **coordinator** session. **Spawn from [`prompts/coordinator.md`](../prompts/coordinator.md)** — the
> FIXED briefing (role · git coordination · *what Nuri IS* · **READ FIRST** · anti-goals · working with
> the operator). Read coordinator.md **and its READ-FIRST set first**; this file adds the arc-specific
> task on top. Same shape as [`N+19-relocation.md`](./N+19-relocation.md) (the prior arc — the RN
> relocation · R1/R1.5 shipped, then the approach pivoted).
>
> **Prerequisite — the pivot is RATIFIED.** [Decision **65.7**](../decisionlog.md) (the monorepo
> reversal of 65.5) + [`docs/north-star.md`](../docs/north-star.md) are on `main`. Re-verify the
> baseline: **`npm test` 25/25** · `npx tsc -p docs/migration-tests/button-matrix/tsconfig.json` **0** ·
> `git diff --exit-code build/` **clean**.

## First task

Coordinate the **monorepo migration** (decision **65.7**) — restructure the nuri repo into an
**npm-workspaces monorepo** and absorb `expodsdemo` as workspaces, so the X-wired gate becomes
**intra-repo**. *As the coordinator* (you plan, brief, review diffs; **you do not execute**).

- **Resolve the open design calls FIRST with the operator** (below) **before** briefing — same posture
  as every prior arc. The migration touches the whole repo layout + the gates; settle the mechanics
  before any working session.
- **Sequence** (65.7 · north-star): **skeleton workspaces** (carve `spec`, scaffold the rest · gates
  stay green) → **absorb `expodsdemo`** (`factory` + `expo-demo` · the `DesignSystemSpec/` snapshot →
  `"@nuri/spec": "workspace:*"`) → **intra-repo gate** (per-workspace CI matrix · the `factory`
  render-smoke gates `spec/build` · **closes R7**) → **retire `button-matrix`** (trivial · same repo) →
  then the north-star arcs (`website` doc-gen · §9 · the external mirror) → **Digital-cash**.

## Context drop

### Read first for this arc (on top of coordinator.md's READ-FIRST)
- `decisionlog.md`: **65.7** (THE pivot · the 5-workspace layout · the theme provider in `factory` · the
  intra-repo gate · the two accepted costs · R2 dropped) · **65.5** (what it reverses · the named
  condition now met) · **65.6** (the freeze the `spec` package carries).
- [`docs/north-star.md`](../docs/north-star.md) — the direction (the DAG · the four moves · §9 as the
  deferred unlock · the only-git wall · the migration sequence). The **structure** is locked (65.7); the
  **rest is direction** — don't over-build (P11).
- [`docs/RISKS.md`](../docs/RISKS.md): **R7** (dissolving — the gate moves intra-repo) · R1/R3/R5 (the
  props-1:1 / render machine-check moves to the `factory` workspace).
- [`roadmap/N+19-R1.md`](./N+19-R1.md) · [`N+19-R1.5.md`](./N+19-R1.5.md) — what carries over: the
  generic factory + the 1:1 typed API + the render-smoke (in `expodsdemo` today · they MOVE into
  `factory`). The four consumability findings = the first-versioned-bump agenda.
- **`expodsdemo`** at `/Users/darioaschero/Documents/dev/expodsdemo` (public · `darioaschero/expodsdemo`)
  — `src/nuri/factory/` → `factory`; `src/screens/` (Demo) → `expo-demo`; `src/nuri/theme.tsx` → the
  theme runtime in `factory`. (The cross-repo working model in memory `[[relocation-cross-repo-setup]]`
  is SUPERSEDED — the consumer is being absorbed.)

### The open design calls to resolve FIRST (with the operator)
1. **Workspace tool** — npm workspaces (operator's lean · RFC #462 context · shipped, simplest) vs
   pnpm/yarn. The gate + the only-git story were reasoned on npm workspaces; confirm.
2. **Absorbing `expodsdemo`** — `git subtree` (preserves its history · #1/#2/#3 land in the monorepo log)
   vs a clean copy. R1/R1.5's provenance is on record in nuri's ledger either way.
3. **The `spec` boundary** — exactly what `spec` exports as a workspace package (`build/descriptors` +
   `build/tokens` + the schema types · and how `factory` imports them across the workspace).
4. **The first session's scope** — coordinator lean: **skeleton + `spec` carve-out, gates green,
   BEFORE absorbing the RN side** (prove the workspace structure on the existing code first; absorb
   `factory`/`expo-demo` second). De-risks the RN toolchain entering before the structure is proven.

### What carries over / what's dropped (don't re-derive)
- **Carries over**: the `factory` (generic `createNuriComponent` + resolve + the Unistyles-shaped theme
  runtime), the **1:1 typed consumer API** (`<Button variant size>`), the `react-test-renderer`
  render-smoke + snapshots — all built in `expodsdemo` (R1/R1.5), moving into the `factory` workspace.
- **Dropped**: **R2** (the cross-repo seam · the version-cut pre-push hook / cross-repo CI checkout) is
  superseded — the gate is intra-repo (a per-workspace job). Don't design the cross-repo seam.
- **Trivial now**: **R3** — `button-matrix` retires once the `factory` render-smoke gates in-repo (same
  repo · no cross-repo "proven-green" wait). At retire: retarget the gates' `tsc`, update refs (RISKS
  R1/R3/R5 · decisionlog · `gates.yml` · `AGENTS.md`).

### The two accepted costs (ratified · 65.7 — hold them, don't re-litigate)
1. The repo is **no longer pure-web** — an RN workspace lives in it; root `npm install` pulls RN
   (mitigated by scoped installs + per-workspace CI · the zero-build *iteration* property survives).
2. **External only-git consumption of one `@nuri/factory`** needs a **subtree-split mirror** (auto-gen
   read-only repo) or whole-monorepo-at-a-tag — npm can't git-install a workspace subdir (RFC #462
   unshipped). Build the mirror when external consumption is real (P11).

### Board + housekeeping
- Board: **R1 ✓ · R1.5 ✓ → monorepo pivot (65.7) ✓** → migration (skeleton → absorb → intra-repo gate
  → retire `button-matrix`) → north-star arcs → Digital-cash.
- Baseline: `npm test` **25/25** · tsc 0 · `build/` clean · `main` post-pivot.
- Both repos clean (only `main` each). `expodsdemo` is being absorbed — coordinate its end-of-life
  (archive vs leave as the pre-monorepo record) at the absorb step.
- This handoff ships in the pivot closeout PR; the migration runs as fresh working sessions after.
