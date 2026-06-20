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

**Arc status (2026-06-20).** Arc **(1) `website` doc-gen is STARTED** — N+22 increment 1
([`N+22.md`](./N+22.md)) landed the mechanism end-to-end for **Button** (the in-pipeline emitter →
generated MD → Jekyll/just-the-docs → hydrating `<nuri-demo>`). No row shrinks yet: increment 1 ADDS a
generated page alongside the hand-written ones — rows **#2** and **#3(b)** shrink only as the emitter
generalizes to all components (the human pages retire incrementally; **their `data-spec="parts"`
anatomy STAYS** as the descriptor STRUCTURE source · Guard D · decision 24.1 — so the pages are
trimmed, never deleted wholesale).

| # | Contradicted assertion | Location(s) | The new position (decision 66) | Resolving arc | now |
|---|---|---|---|---|---|
| 1 | **"CSS is SoT" / "Source of truth = the CSS files"** | `docs/north-star.md:15,48` · `README.md:13` · `llms.txt` (the "Source of truth" footer + the per-component "8 files" line) · `packages/spec/package.json` `description` | **§9 inverts the source** — author the descriptor → generate the CSS (`descriptor → CSS` direct · revisits decision 2). **Audit-gated · NOT decided** — CSS-is-SoT **STANDS** until the §9 arc ratifies the reversal | (4) §9 source-inversion | **flagged** (north-star · README:13); the rest `table` — do **not** rewrite the prose |
| 2 | **"Component pages serve four readers, *including migration*"** (rule 18 · decision 24) | `AGENTS.md` rule 18 · `AGENTS.md` audience-boundary table (the `migration` row) | The **migration reader is dead** (its workflow was `button-matrix` · retired M4); the four-reader *framing* dies when the doc-gen obsoletes the hand-written pages. **The decision-24.1 `data-*` anatomy SURVIVES** — it is now a descriptor-generation source (Guard D) | (1) `website` doc-gen | **flagged** (rule 18) — only the framing is stale; the `data-*` half is live |
| 3 | **`build/components/*` residuals** (the 8 FILES + Guard B are **RETIRED** ✓ N+21 · Smell-1 / dec 66 arc #0 · baseline relocated to `build/interaction.ts`) — what's left: **(a) code** the 3 emitted-file header echoes (`build/{tokens,token-paths,palette}.ts` headers still name `build/components/<name>.ts`, emitted via `parsers/{semantic,components,palette}.js`) + the now-vestigial per-component `@layer` walk (`tokens-parser.js` Slice 4) and its dead resolver (`readComponentTokens`/`resolveComponentValue`/`emitComponentTs` in `parsers/components.js`); **(b) prose** the `pages/components/*.html` `build/components` + `button-matrix` mentions | **(a)** `pipeline/parsers/{semantic,components,palette}.js` + `tokens-parser.js` · **(b)** `pages/components/{tabs,switch,tab-bar,…}.html` | **(a)** remove the dead walk + de-stale the 3 headers (**header-only re-emit · gate-green**; ⚠ `emitTokenPathsTs` MUST stay — it still emits `token-paths.ts`) · **(b)** the prose dies with the hand-written pages | **(a) Smell-1.1** · **(b) (1) `website` doc-gen** | **shrunk** (N+21) — files + Guard B gone; residuals `table` (resolve at the arc) |
| 4 | **"Doc-to-code ratio is HIGH *on purpose*"** (what Nuri IS #1) | `prompts/coordinator.md:52` · `prompts/working-session.md:85` | The **meta-slim revises it** — the high ratio was the *exploratory phase's* cold-start tool, not a permanent identity (the spec's FORM moves prose → data · the ratio falls out) | (5) meta-slim (last phase) | `table` — last phase · no in-place flag yet |
| 5 | **Playground = "a separate composition area"** (a DS docs surface · decision 57) | `decisionlog.md` decision 57 (amended by **57.2** · ledger) · `README.md` (`playground/` "RESERVED for view-composition") · `docs/north-star.md` (the playground line · reframed this session) | The playground is a **consumer TOOL, not DS content** (57.2 · **LOCKED**); a composed screen (`my-vault`) is a **demo of the tool, not DS spec**. It may externalize | (3) composing-boundary | `table` — 57.2 is the in-ledger record; the externalization arc acts on it |

**Not stale (checked · leave alone).** "Web zero-build composition" (the spec pages still render
build-free · 65.7's iteration property) · "the Node pipeline is opt-in for the RN sync workstream"
(still true) · the historical retros (`roadmap/N+*`) and the ledger's historical sections (the
immutable record · don't-rewrite). This map covers only the **live** prose decision 66 contradicts —
not every historical mention.
