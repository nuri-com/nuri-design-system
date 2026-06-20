# Post-migration cleanup · the living stale-map

**What this is.** A LIVING map of in-code prose that [decision 66](../decisionlog.md) (the
post-migration direction) contradicts — and the arc that resolves each line. It is deliberately
**NOT** in the immutable [`decisionlog.md`](../decisionlog.md): the ledger appends and never
rewrites, but this table **shrinks** — delete a row when its arc closes the gap. Decision 66 points
here; this file points back at the fixing arc.

**The discipline (decision 66).** Only **"composing isn't DS work"** (amendment 57.2) is *decided*.
Every other row is **pending its arc** — the prose is flagged, not fixed. In particular **decision 2
(CSS is SoT) STILL HOLDS**: §9 (the reversal) is direction · audit-gated · not decided. Do **not**
"correct" a CSS-is-SoT line to "the descriptor is SoT" — that pre-empts a decision the operator
hasn't made.

**`now` legend** — `flagged` = an in-place one-line pointer to dec 66 was added this session ·
`flag` = warrants one (not yet done) · `table` = recorded here only; resolve at the arc, no in-place
flag yet (avoid noise / immutable-ledger lines / last-phase prose).

| # | Contradicted assertion | Location(s) | The new position (decision 66) | Resolving arc | now |
|---|---|---|---|---|---|
| 1 | **"CSS is SoT" / "Source of truth = the CSS files"** | `docs/north-star.md:15,48` · `README.md:13` · `llms.txt` (the "Source of truth" footer + the per-component "8 files" line) · `packages/spec/package.json` `description` | **§9 inverts the source** — author the descriptor → generate the CSS (`descriptor → CSS` direct · revisits decision 2). **Audit-gated · NOT decided** — CSS-is-SoT **STANDS** until the §9 arc ratifies the reversal | (4) §9 source-inversion | **flagged** (north-star · README:13); the rest `table` — do **not** rewrite the prose |
| 2 | **"Component pages serve four readers, *including migration*"** (rule 18 · decision 24) | `AGENTS.md` rule 18 · `AGENTS.md` audience-boundary table (the `migration` row) | The **migration reader is dead** (its workflow was `button-matrix` · retired M4); the four-reader *framing* dies when the doc-gen obsoletes the hand-written pages. **The decision-24.1 `data-*` anatomy SURVIVES** — it is now a descriptor-generation source (Guard D) | (1) `website` doc-gen | **flagged** (rule 18) — only the framing is stale; the `data-*` half is live |
| 3 | **`build/components/*` = "8 live emitted files"** | `README.md` (the `build/` tree + the "React Native pipeline" narrative) · `llms.txt` (the `build/components/<name>.ts` line · "8 files") · `pages/implementation-guide.html` (the Guard-B manifest) | Post-M4 **only `button.ts` is live** (the factory pins `INTERACTION_BASELINE` to its decision-45 cross-component `pressScale`/`disabledOpacity` — mis-homed → **relocate**); the other 7 have no `exports` entry / no importer → **retire** | (0) Smell-1 cleanup | **flagged** (README tree) — the arc removes the files + updates Guards B/C, `llms.txt`, impl-guide |
| 4 | **"Doc-to-code ratio is HIGH *on purpose*"** (what Nuri IS #1) | `prompts/coordinator.md:52` · `prompts/working-session.md:85` | The **meta-slim revises it** — the high ratio was the *exploratory phase's* cold-start tool, not a permanent identity (the spec's FORM moves prose → data · the ratio falls out) | (5) meta-slim (last phase) | `table` — last phase · no in-place flag yet |
| 5 | **Playground = "a separate composition area"** (a DS docs surface · decision 57) | `decisionlog.md` decision 57 (amended by **57.2** · ledger) · `README.md` (`playground/` "RESERVED for view-composition") · `docs/north-star.md` (the playground line · reframed this session) | The playground is a **consumer TOOL, not DS content** (57.2 · **LOCKED**); a composed screen (`my-vault`) is a **demo of the tool, not DS spec**. It may externalize | (3) composing-boundary | `table` — 57.2 is the in-ledger record; the externalization arc acts on it |

**Not stale (checked · leave alone).** "Web zero-build composition" (the spec pages still render
build-free · 65.7's iteration property) · "the Node pipeline is opt-in for the RN sync workstream"
(still true) · the historical retros (`roadmap/N+*`) and the ledger's historical sections (the
immutable record · don't-rewrite). This map covers only the **live** prose decision 66 contradicts —
not every historical mention.
