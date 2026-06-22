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
     1. `packages/spec/lib/components/<name>/<name>.css` (new) — single file with
        `@layer tokens` + `@layer rules`; selector
        `:root, [data-accent], [data-theme]`.
     2. `packages/spec/lib/components/<name>/<name>.js` (new) — custom element
        wrapping native, `display: contents`, defer-loaded.
     3. `packages/spec/pages/components/<name>.html` (new) — follow
        [skills/add-component.md](../skills/add-component.md)
        section order. -->

## Anti-goals

<!-- FIXED · defaults that apply to every session -->

- **No speculative additions** · don't add tokens, components,
  skills, or pages anticipating future need. Ship what the brief
  asks. Speculative-reserved entries require explicit registry
  listing + one-line justification ([P11](../packages/spec/pages/principles.html#p11-parsimony) ·
  [decision 30](../decisionlog.md#30-primitive-parsimony--no-speculative-additions--n571)).

<!-- VARIABLE FILL · session-specific anti-goals -->

<!-- What NOT to do. Things easy to drift into. Examples:
     - "No new decisions in this session — restructure only."
     - "Do not change `packages/spec/build/tokens.ts` shape; only the emitter
       internals."
     - "No new pages beyond <name>; if scope expands, surface it
       in roadmap/index.md 'Open questions' and stop." -->

## Definition of done

<!-- Concrete, testable. Examples:
     - "`npm test -w @nuri/spec` passes (all green · the count drifts — don't pin it)"
     - "`npm test -w @nuri/rn` passes (the render-smoke) · tsc 0"
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
   skills / decision-log / roadmap exceed the actual `packages/spec/styles/` +
   `packages/spec/lib/` source.
2. **Agent-first workflow** — no Figma. Operator prompts → agent
   composes → translate ([decision 21](../decisionlog.md#21-consumer-model--three-agent-personas--operator--n3)).
3. **Web zero-build composition** — docs site renders without a
   build step. The Node pipeline in `packages/spec/build/` is opt-in
   (`npm run build -w @nuri/spec`) for the RN sync workstream only.
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
  `git worktree add -b <branch> "$MAIN-<short>" origin/main`, then run
  `npm install` **inside** the new worktree. (Under npm workspaces —
  [decision 65.7](../decisionlog.md) — the install wires `node_modules/@nuri/*`
  to *that worktree's* `packages/*`. The old `ln -s "$MAIN/node_modules"
  node_modules` shortcut is WRONG now: it cross-links `@nuri/spec` to the MAIN
  tree and breaks `@nuri/rn`'s resolution of its sibling.)
- **CI** — [`.github/workflows/gates.yml`](../.github/workflows/gates.yml)
  runs on every PR + push-to-`main` as three per-workspace jobs: **`spec`**
  (`npm ci` · `npm test -w @nuri/spec` all-green · `npm run build -w @nuri/spec` ·
  `git diff --exit-code packages/spec/build/`) · **`rn`** (`npm test -w
  @nuri/rn` — the render-smoke that gates `packages/spec/build/` intra-repo ·
  `npm run typecheck -w @nuri/rn`) · **`expo-demo`** (`npm run typecheck -w
  @nuri/expo-demo`). Branch protection requires all three green to merge; PRs are
  **squash-merged** ([decision 65.10](../decisionlog.md)).
- **`packages/spec/build/` is committed** ([decision 35](../decisionlog.md#35-pipeline-sources-vs-build-outputs-physically-separated--pipeline-source-build-generated-only--n604)).
  If you touched anything the pipeline emits, run `npm run build -w @nuri/spec`
  and commit the result — the `git diff --exit-code packages/spec/build/` gate
  fails a stale emit.
- **Close** — gates green → commit (with a `Co-Authored-By` trailer) → push →
  open PR into `main`. `gh` is **not installed**, so the **operator** opens
  the PR via the `pull/new/<branch>` link git prints on push, and clicks
  merge. The **coordinator reviews the PR** — do NOT self-merge — and
  reconciles any shared-doc conflict (`roadmap/index.md`, sometimes
  `decisionlog.md` / `docs/RISKS.md`) by merging `main` into the lagging branch.

## Close sequence (FIXED · in this exact order)

1. **Build the ship-list.**
2. **If the session has a rendered surface — visual feedback FIRST, before any
   audit or gate.** Render the work in the preview MCP and self-review the
   *actual rendered result* (screenshots + DOM / computed-style inspection),
   not the code in the abstract. Fix obvious visual / interaction defects you
   can see. *(Non-visual sessions — pipeline / emit / guards / docs, e.g. the
   post-migration arcs — skip this: there is nothing to render. The proof is
   the gates, especially the `@nuri/rn` render-smoke.)*
3. **Operator checkpoint — STOP and ask.** When the work is ready, present it
   to the operator and request feedback — the *rendered result* for a visual
   session, the *diff + ship-list* for a non-visual one. Do NOT run the audit,
   the gates, or closeout until the operator has responded; incorporate their
   feedback first.
4. **Only after the operator's feedback:** run the gates (`npm test -w @nuri/spec`,
   `npm run build -w @nuri/spec`, `git diff --exit-code packages/spec/build/`,
   `npm test -w @nuri/rn`, `npm run typecheck -w @nuri/rn`,
   `npm run typecheck -w @nuri/expo-demo`),
   then run [`skills/close-out-session.md`](../skills/close-out-session.md) —
   spawn the general-purpose audit subagent
   ([`prompts/closeout-audit.md`](./closeout-audit.md)) and refresh
   `roadmap/N+X.md` + `roadmap/index.md` + `docs/RISKS.md`.
5. **Commit → push → open PR (never self-merge).** With the gates green,
   commit the work (`Co-Authored-By` trailer; include the `npm run build -w @nuri/spec` emit
   if the pipeline output changed), push the branch, and have the **operator**
   open the PR into protected `main` via the `pull/new/<branch>` link. CI
   re-runs the gates; the **coordinator reviews the PR** (does NOT self-merge —
   `gh` is absent and `main` is protected), and the **operator clicks
   squash-merge** once `gates` is green. See `## Git workflow` above.
