# Session N+19 · M1 · the monorepo skeleton + `@nuri/spec` carve-out

**Status**: shipped · gates green at the new paths · docs site regression-confirmed byte-identical (preview MCP) · PR pending.
**Type**: **structural move** — the first migration step of [decision 65.7](../decisionlog.md) (the npm-workspaces monorepo). No spec CONTENT change; the repo becomes a workspace root and the radix `@nuri/spec` is carved on the EXISTING green web/pipeline code, BEFORE any RN toolchain enters (M2 absorbs `expodsdemo`). As-built recorded in [decision **65.8**](../decisionlog.md).
**Branch**: `feat/n19-m1-spec-carveout` (based on `main`).
**Ship**: `packages/spec/` (`git mv lib pipeline build styles pages` · history preserved) · `packages/spec/package.json` (new · `@nuri/spec`) · root `package.json` (rewritten → `workspaces: ["packages/*"]` + thin scripts) · root `index.html` (redirect repointed) · `.github/workflows/gates.yml` (job stays `gates` · now workspace-scoped to `@nuri/spec`) · `docs/migration-tests/button-matrix/` (`_shared.tsx` + `tsconfig.json` + harness `index.html` repointed) · `packages/spec/pipeline/docs-drift.test.js` (one referrer path-fix · `MONOREPO_ROOT`) · operational docs (`AGENTS.md` · `llms.txt` · `README.md` · `prompts/working-session.md` · `prompts/coordinator.md`) · `decisionlog.md` §65.8 · `docs/RISKS.md` R7.

---

## What M1 did

Restructured nuri into an **npm-workspaces monorepo** and carved the **radix `@nuri/spec`** package — proving the workspace plumbing + per-workspace gates on KNOWN-GREEN code, de-risking the layout from the M2 RN-toolchain import.

`lib/ + pipeline/ + build/ + styles/ + pages/` moved **as one block** into `packages/spec/`. Because they moved together, their **inter-relative paths survive untouched**: the pipeline computes `REPO_ROOT = pipeline/..` (now = the spec package) and still finds `styles/`/`lib/` and emits `build/`; the 33 pages still resolve `../../lib/*.css` / `../../styles/*` (the `../../` now lands in `packages/spec/`, which holds `lib`+`styles`). Only **external** referrers changed.

```
packages/spec/      @nuri/spec — the radix (CSS SoT + pipeline + frozen build/)
  package.json      @nuri/spec · build+test scripts · devDeps (hoisted)
  styles/ lib/ pipeline/ build/ pages/   (moved intact · byte-identical)
package.json        workspace ROOT · private · workspaces:["packages/*"] · thin scripts
index.html          redirect → packages/spec/pages/foundations/colour/primitive.html
docs/ roadmap/ skills/ prompts/ decisionlog.md llms.txt AGENTS.md   (stay at root)
playground/         README-only · reserved · stays at root (not yet a workspace)
```

The 65.7 target is 5 workspaces; M1 built **only `spec`** — no empty scaffolds for `factory`/`expo-demo`/`website`/`playground` (P11 · they land as each is built · M2+).

## The discriminator held (the brief's tripwire)

> *"If a moved file's CONTENT changes (beyond new package.json/gates and referrer path-fixes), something is wrong — `lib/styles/build/pages` are byte-identical modulo location."*

It held. No content change to `lib`/`styles`/`build`; the pages' **render is byte-identical** — only cross-doc link `href`s were repointed (a referrer path-fix · see "Closeout audit" below). Proof:
- **`git diff --exit-code packages/spec/build/` clean** — the emit is byte-identical at the new path (the pipeline ran from `packages/spec/` and produced the same bytes).
- **docs site renders byte-identical** — root redirect resolves end-to-end to the moved landing page; the Button page upgrades 20 `<nuri-button>` + 10 `<nuri-demo>`, CSS tokens resolve live (lilac solid `rgb(190,170,255)`), console clean; every relative asset resolves 200 at the new depth.

The in-tree edits to moved files were **all referrer path-fixes** (the brief's allowed exception · render unchanged):
- `pipeline/docs-drift.test.js`: Guards A/B/C cross-check the spec's pages/build against the repo-level entry-point docs (`llms.txt`, `README.md`), which **correctly stay at the monorepo root**. The test now resolves those two via a new `MONOREPO_ROOT` (two levels above the spec package). (`REPO_ROOT` keeps rooting the spec package, matching the orchestrator.)
- **155 cross-doc `<a href>` links across 27 docs pages** (caught by the closeout audit · see below) — the pages moved 2 levels deeper while the docs they cite stayed at root, so each link gained `+2 ../`. Asset/intra-spec links (`lib`/`styles`/`build`/sibling pages) moved WITH the pages and were left untouched.

## Resolved naming + mechanics (→ [decision 65.8](../decisionlog.md))

npm workspaces · inter-dep protocol `"*"` not `"workspace:*"` (corrects the 65.7 shorthand) · `packages/` not `apps/` · `@nuri/*` scope · **`build/` stays `build/`** (dist rename rejected · exports-hidden) · the `exports` SHAPE is noted in `@nuri/spec`'s package.json but **VALIDATION deferred to M2** (no importer yet) · `pages/` + playground stay in `spec` · `website`/playground-split/`apps/*` deferred.

## Gate results (CI-equivalent, run locally)

| gate | command | result |
|---|---|---|
| install | `npm ci` (workspace-aware) | exit 0 · `@nuri/spec` symlinked · toolchain hoisted |
| drift guards | `npm test -w @nuri/spec` | **25/25** |
| emit | `npm run build -w @nuri/spec` | clean |
| committed emit | `git diff --exit-code packages/spec/build/` | clean (byte-identical) |
| migration mirror | `npx tsc -p docs/migration-tests/button-matrix/tsconfig.json` | exit 0 |

## Branch protection — no Settings action (deferred to M3)

The gate job **keeps its `gates` name** in M1 (decision B) — it stays a single workspace-scoped job (now running only the `@nuri/spec` gates, NOT a matrix), so the existing branch-protection required check is **unchanged**. The rename to a per-workspace matrix (and the required-check reconfiguration) lands at **M3** with the `factory` render-smoke job. No GitHub Pages source/Settings change was needed either (Pages root-serves; the root `index.html` redirect repoints to the deeper path). **No operator Settings action for this PR.**

## Known doc-debt (scoped out · deliberate · for a later touch)

Per the brief, only the LIVE operational docs + functional refs were repointed; **historical records were left intact** ("don't rewrite the ledger"). These still reference pre-move root-relative paths and update when next touched:
- **`skills/*`** — `add-component.md` etc. say `lib/components/<name>/` / `pages/...`. Not in the M1 doc set; the spec-authoring surface is now under `packages/spec/`. Update at the next skills touch (likely M2+).
- **`docs/migration-tests/button-matrix/FRICTIONS.md`** — historical friction log; `../../../lib|pages|pipeline` links now dangle. Retires with `button-matrix` at M4.
- **`docs/` design docs + `docs/north-star.md` + `roadmap/*` retros** — historical/direction docs with relative `../pages|lib|build` links. Left as the record of their writing (same posture as the decisionlog ledger).

## Closeout audit — findings folded

A read-only general-purpose audit ran on the staged tree. Findings:
- **Bug (FIXED)**: 27 docs pages had cross-doc `<a href>` links (`decisionlog.md`/`AGENTS.md`/`docs/`/`roadmap/`/`skills/`/`prompts/` · 155 total) that 404'd after the move — the pages dropped 2 levels deeper while those targets stayed at root. Repointed `+2 ../`; **all 155 verified to resolve 200** end-to-end at every page depth. `scope.html` also carried a **pre-existing** depth bug (its decisionlog links sat one level too shallow · dangling before the move too), corrected to the true depth. The byte-identical-render check had missed these — broken `<a href>` don't error until clicked; the audit's cross-file pass caught them. (This is why the audit exists.)
- **Drift (KNOWN · not chased, per operator)**: `docs/RISKS.md`'s historical R1/R5 body still has `../lib|pages|pipeline` links that dangle — same posture as the other historical docs (`skills/*`, button-matrix `FRICTIONS.md`, the `docs/` design docs): left as the record of their writing; update when next touched.
- **Clean (verified)**: no double-prefixes; decision-B consistency (the gate job stays `gates`) across all 7 files; functional referrers correct; README tree + Guard-checked phrases (`runtime-set leaf · 38 members` · the 8 component names) intact; §65.8 citation chain resolves.

## Handoff — structure proven · next is M2

The workspace structure + per-workspace gates are proven on known-green code. **M2** absorbs `expodsdemo` as `factory` + `expo-demo` (`DesignSystemSpec/` snapshot → `"@nuri/spec": "*"`), brings the RN toolchain (cost #1 of 65.7) against this proven structure, and lands + validates `@nuri/spec`'s `exports` map (the factory is its first importer). **M3** = the per-workspace CI matrix (the `factory` render-smoke gates `spec/build` · **R7 closes**). **M4** retires `button-matrix`.

### For the coordinator (at merge)
- Re-run the five gates above on the branch; confirm `packages/spec/build/` diff clean + the docs-site render.
- No branch-protection change for M1 — the gate job keeps its `gates` name (the rename is deferred to M3).
- Reconcile shared-ledger conflicts (`roadmap/index.md` · `decisionlog.md` · `docs/RISKS.md`) by merging `main` into the branch.
