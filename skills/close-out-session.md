---
name: close-out-session
description: Use this skill before ending a working session — spawn a general-purpose audit subagent, triage findings (Bugs · Drift · Smells · Clean), apply housekeeping, refresh roadmap/ + docs/RISKS.md, prepare the next-session prompt.
---

# Skill · Close out a session

Before ending a working session, run a read-only audit to catch
drift the editing agent can't see (decision-number staleness, dead
refs, comment-vs-code mismatches, citation chain errors, NAV
inconsistency). Established N+3 close-out; this is the procedure for
every future session.

1. **Spawn a `general-purpose` sub-agent for the audit.** NOT
   `Explore` — Explore is explicitly NOT for cross-file consistency
   checks (per its tool description). Brief the agent with:
   - 1-paragraph "what is Nuri"
   - The concrete diff this session shipped (new files, deleted files,
     refactors, key decisions added)
   - What to audit: dead refs · doc inconsistency · comment drift ·
     citation chain (decision IDs, principle IDs, file paths) · NAV
     consistency vs filesystem · CSS dead code · foundation-page
     visual regressions · rule-enforcement gaps
   - **Parsimony asks** (per [P11](../pages/principles.html#p11-parsimony) ·
     [decision 30](../decisionlog.md#30-primitive-parsimony--no-speculative-additions--n571)):
     - Any new file added (token, component, skill, page,
       principle, decision) that doesn't have a clear consumer in
       the session's brief?
     - Any new entry in `styles/tokens-primitive.css` that doesn't
       appear in `RESERVED_COLOR_SCALES` / `RESERVED_TOKENS` and
       has no `var()` consumer? (The guardrail test catches this
       at CI; the audit surfaces it before push.)
     - Any new principle / decision codifying something not
       currently shipped? Any new docs example referencing tokens
       or patterns that don't ship?
   - **Format B asks** (per
     [decision 33](../decisionlog.md#33-semantic-token-docs--format-b-verbose-dual-mode-for-context-dependent-tokens--n601)),
     IF the session modified `styles/tokens-semantic.css`:
     - Every new/modified token that varies across cascade
       dimensions ({theme, accent, scope, …}) carries a Format B
       canonical comment at one block + terse `(matrix in block N)`
       cross-refs at the other blocks?
     - Every token invariant across the active cascade dimensions
       carries a 1-line role description only (NOT Format B —
       dependency-driven trigger)?
   - What NOT to do: don't change anything (read-only) · don't
     re-audit locked decisions · don't push toward generic DS
     conventions (Nuri is intentional)
   - Output format: under 600 words · grouped **Bugs / Drift /
     Smells / Clean** · each finding has `file:line` + 1-sentence
     "what's wrong" + 1-sentence "suggested fix"

   See [`prompts/closeout-audit.md`](../prompts/closeout-audit.md)
   for the consumer-facing template.

2. **Triage findings.**
   - *Must-fix*: broken links, ghost class names, factually wrong
     numbers, citation chain errors.
   - *Should-fix*: doc inconsistencies between decisionlog / roadmap /
     RISKS / AGENTS / principles.html / README / llms.txt.
   - *Smells*: flag as **Open question** in `roadmap/index.md` if
     not trivially fixable.
   - *Clean*: nothing to do, but note in the closeout that the
     auditor confirmed these areas hold.

3. **Apply housekeeping** in batches by file. After each batch,
   verify via preview MCP that nothing regressed visually + console
   stays clean.

4. **Update `roadmap/` + `docs/RISKS.md`:**
   - `roadmap/N+X.md` (this session) — mark `closed`, fill Outcome /
     Ship list / Decisions locked / Frictions surfaced / Files touched
   - `roadmap/index.md` — refresh "Current state" + "What's next" +
     "Open questions" + workstreams
   - `docs/RISKS.md` — update R-status fields for any risk this session
     mitigated or expanded

5. **Prepare the next-session prompt** that hands off cleanly.
   Include: what's locked, what's open, the hard gate (if any), and
   the suggested first action. Use
   [`prompts/working-session.md`](../prompts/working-session.md) as a
   starting template. Hand the prompt directly to the operator —
   they'll use it to kick off the next session.

The N+3 closeout audit established this procedure. Reproduce the
pattern; don't reinvent the format.
