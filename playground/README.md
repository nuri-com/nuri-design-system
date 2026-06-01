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

It is **not in this directory**. The N+4 thesis-validation pair
(web HTML + RN hand-translation + frictions) lives at
[`docs/migration-tests/button-matrix/`](../docs/migration-tests/button-matrix/).
That path is honest about what it is: evidence for [RISKS.md R1
+ R5](../docs/RISKS.md), not source for production code, and not
view composition.

The brief explanation: a mid-N+4 rename. The initial dir was
`playground/button-matrix/` because the N+4 prompt used "playground"
loosely. The operator caught the conflict with the established
view-composition meaning of "playground" and the directory moved.
The semantic tokens at [`build/tokens.ts`](../build/tokens.ts) were
hand-rolled at N+4 and are **machine-generated since N+5** (see
[`docs/RISKS.md`](../docs/RISKS.md) R2 and the F-TOKEN-1 entry in
[`docs/migration-tests/button-matrix/FRICTIONS.md`](../docs/migration-tests/button-matrix/FRICTIONS.md));
the migration pair's `index.tsx` import is unchanged across the swap.

## Do not add files here yet

Until the view-composition workstream is in motion, this dir
deliberately stays empty. If you have a translation pair, it
belongs under `docs/migration-tests/<name>/`. If you have a
composition example for the DS, file an issue / surface the open
question first — the conventions don't exist yet to absorb it.
