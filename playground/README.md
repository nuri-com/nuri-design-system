# Playground · reserved

This directory is **reserved** for the future view-composition
workstream — the workspace where the team (or an agent on the
team's behalf) composes views with the Nuri web DS without
modifying it. See [`roadmap/index.md`](../roadmap/index.md)
"Workstreams" → "Playground + governance" for the governance +
repo-structure questions that gate this.

It is **intentionally empty** today. Adding files here is gated on
the workstream landing — at minimum (a) the conventions for what
counts as "composing with the DS", (b) the repo-structure decision
(in-repo vs monorepo vs separate), and (c) the CODEOWNERS posture
("team can use, not modify"). None of those are locked yet.

## If you arrived here looking for the N+4 button-matrix

It was **retired at M4** ([decision 65.11](../decisionlog.md)). The N+4
thesis-validation pair (web HTML + RN hand-translation + frictions) once lived
at `docs/migration-tests/button-matrix/`; it proved the props-1:1 thesis and
was removed once the [`@nuri/rn`](../packages/rn/)
`react-test-renderer` render-smoke became the live intra-repo contract gate (it
RENDERS the frozen descriptors on RN in CI · [decision 65.10](../decisionlog.md)).
The frictions it captured live on in [`docs/RISKS.md`](../docs/RISKS.md) R1.

The brief history: the pair briefly sat at `playground/button-matrix/` (the
N+4 prompt used "playground" loosely) before the operator moved it to
`docs/migration-tests/`, resolving the conflict with the established
view-composition meaning of "playground". Its semantic tokens were hand-rolled
at N+4 and are **machine-generated since N+5** (F-TOKEN-1 · now at
[`packages/spec/build/tokens.ts`](../packages/spec/build/tokens.ts) · see
[`docs/RISKS.md`](../docs/RISKS.md)).

## Do not add files here yet

Until the view-composition workstream is in motion, this dir
deliberately stays empty. If you have a translation pair, it
belongs under `docs/migration-tests/<name>/`. If you have a
composition example for the DS, file an issue / surface the open
question first — the conventions don't exist yet to absorb it.
