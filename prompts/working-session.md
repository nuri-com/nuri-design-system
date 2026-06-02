# Working session briefing

<!-- VARIABLE FILL -->

# Session N+X · <short title>

<!-- 2-3 sentences: what the session ships, why it's worth a session,
     what the previous session left open that motivates this one. -->

## READ FIRST

<!-- Files the working agent MUST read before starting. Always
     include decisionlog.md + roadmap/index.md + AGENTS.md as a
     baseline; add session-specific reads (e.g., a previous
     N+X.md retrospective, RISKS sections that apply, the
     canonical reference file for the surface being touched). -->

- [`decisionlog.md`](../decisionlog.md) — locked decisions (cite by #, don't re-litigate)
- [`roadmap/index.md`](../roadmap/index.md) — current state + what's next
- [`AGENTS.md`](../AGENTS.md) — hard rules + skill router
- <!-- session-specific READs -->

## Approach

<!-- Strategy hint, sequencing, why this order. Examples:
     - "Bottom-up: extract first, trim second. Old file stays as
       source until new file is verified."
     - "Mechanical pass: no creative decisions, copy verbatim."
     - "Start with the test, then make it pass." -->

## Ship list

<!-- Numbered, file-precise, verifiable. Example:
     1. `lib/components/<name>/<name>.css` (new) — single file with
        `@layer tokens` + `@layer rules`; selector
        `:root, [data-accent], [data-theme]`.
     2. `lib/components/<name>/<name>.js` (new) — custom element
        wrapping native, `display: contents`, defer-loaded.
     3. `pages/components/<name>.html` (new) — follow
        [skills/add-component.md](../skills/add-component.md)
        section order. -->

## Anti-goals

<!-- FIXED · defaults that apply to every session -->

- **No speculative additions** · don't add tokens, components,
  skills, or pages anticipating future need. Ship what the brief
  asks. Speculative-reserved entries require explicit registry
  listing + one-line justification ([P11](../pages/principles.html#p11-parsimony) ·
  [decision 30](../decisionlog.md#30-primitive-parsimony--no-speculative-additions--n571)).

<!-- VARIABLE FILL · session-specific anti-goals -->

<!-- What NOT to do. Things easy to drift into. Examples:
     - "No new decisions in this session — restructure only."
     - "Do not change `build/tokens.ts` shape; only the emitter
       internals."
     - "No new pages beyond <name>; if scope expands, surface it
       in roadmap/index.md 'Open questions' and stop." -->

## Definition of done

<!-- Concrete, testable. Examples:
     - "`npm test` passes (22/22)"
     - "`npx tsc -p docs/migration-tests/<pair>/tsconfig.json` exits 0"
     - "Page renders, console clean, theme/accent toggles re-resolve"
     - "Closeout audit ran; findings surfaced in roadmap/index.md" -->

## Why N+X.Y not N+X+1 (only if this is a bridge session)

<!-- One paragraph explaining why this is a `.5` / `.6` etc. session
     and not the next main session. Bridge sessions typically:
     - Land prereqs the next main session needs.
     - Are smaller than a main session.
     - Don't introduce new architectural decisions. -->

<!-- FIXED -->

## Context (for the agent reading cold)

You are working on Nuri, a mobile-first design system for Expo ·
React Native. The four distinguishing choices:

1. **Doc-to-code ratio is HIGH on purpose** — tokens / principles /
   skills / decision-log / roadmap exceed the actual `styles/` +
   `lib/` source.
2. **Agent-first workflow** — no Figma. Operator prompts → agent
   composes → translate ([decision 21](../decisionlog.md#21-consumer-model--three-agent-personas--operator--n3)).
3. **Web zero-build composition** — docs site renders without a
   build step. The Node pipeline in `build/` is opt-in
   (`npm run build`) for the RN sync workstream only.
4. **1:1 API match at props layer** — web `<nuri-button>` matches
   RN `<Button>` 1:1 at props. Behaviour is budgeted per-component
   ([RISKS R1](../docs/RISKS.md#r1--webrn-api-11--props-parity--behavioural-parity)).

Locked decisions live in [`decisionlog.md`](../decisionlog.md); do
not re-litigate. Open risks live in [`docs/RISKS.md`](../docs/RISKS.md).
Per-skill procedures live in [`skills/`](../skills/) — pick the one
that matches what you're doing. The session router is
[`roadmap/index.md`](../roadmap/index.md).

When in doubt: code wins, then `decisionlog.md`, then this prompt.

## Git workflow (FIXED)

The repo is git + GitHub + CI + branch-protected `main`. Never commit to
`main`; every session ships on a branch and lands via PR. Remote is **SSH**
(`git@github.com:nuri-com/nuri-design-system.git`) — HTTPS has no token; the
docs site is live off `main`.

- **Start (single session)** — branch off the freshly-fetched main:
  `git fetch origin && git checkout -b <type>/<slug> origin/main`
  (`docs/…` · `fix/…` · `feat/…`).
- **Start (parallel session)** — concurrent sessions each take their own
  worktree, so the file trees are disjoint and the work is truly parallel:
  `git worktree add -b <branch> "$MAIN-<short>" origin/main` + (inside the new
  worktree) `ln -s "$MAIN/node_modules" node_modules`.
- **CI** — [`.github/workflows/gates.yml`](../.github/workflows/gates.yml)
  (job `gates`) runs on every PR + push-to-`main`: `npm ci` · `npm test`
  (22/22) · `npm run build` · `git diff --exit-code build/` · `npx tsc -p
  docs/migration-tests/<pair>/tsconfig.json`. Branch protection requires
  `gates` green to merge; PRs are **squash-merged**.
- **`build/` is committed** ([decision 35](../decisionlog.md#35-pipeline-sources-vs-build-outputs-physically-separated--pipeline-source-build-generated-only--n604)).
  If you touched anything the pipeline emits, run `npm run build` and commit
  the result — the `git diff --exit-code build/` gate fails a stale emit.
- **Close** — gates green → commit (with a `Co-Authored-By` trailer) → push →
  open PR into `main`. `gh` is **not installed**, so the **operator** opens
  the PR via the `pull/new/<branch>` link git prints on push, and clicks
  merge. The **coordinator reviews the PR** — do NOT self-merge — and
  reconciles any shared-doc conflict (`roadmap/index.md`, sometimes
  `decisionlog.md` / `docs/RISKS.md`) by merging `main` into the lagging branch.

## Close sequence (FIXED · in this exact order)

1. **Build the ship-list.**
2. **Visual feedback FIRST — before any audit or gate.** Render the work in
   the preview MCP and self-review the *actual rendered result* (screenshots
   + DOM / computed-style inspection), not the code in the abstract. Fix
   obvious visual / interaction defects you can see.
3. **Operator checkpoint — STOP and ask.** When the work is visually ready,
   present the rendered result to the operator and request design feedback.
   Do NOT run the audit, the gates, or closeout until the operator has
   responded; incorporate their feedback first.
4. **Only after the operator's feedback:** run the gates (`npm test` 22/22,
   `npm run build`, `git diff --exit-code build/`,
   `npx tsc -p docs/migration-tests/<pair>/tsconfig.json`),
   then run [`skills/close-out-session.md`](../skills/close-out-session.md) —
   spawn the general-purpose audit subagent
   ([`prompts/closeout-audit.md`](./closeout-audit.md)) and refresh
   `roadmap/N+X.md` + `roadmap/index.md` + `docs/RISKS.md`.
5. **Commit → push → open PR (never self-merge).** With the gates green,
   commit the work (`Co-Authored-By` trailer; include the `npm run build` emit
   if the pipeline output changed), push the branch, and have the **operator**
   open the PR into protected `main` via the `pull/new/<branch>` link. CI
   re-runs the gates; the **coordinator** reviews the PR and squash-merges once
   `gates` is green. See `## Git workflow` above.
