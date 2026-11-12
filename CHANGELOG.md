# Changelog

Version context: package 0.0.1 (unchanged). Updated 2026-09-20 by Emin / Hermes.
New session log; archived decisionlog.md and roadmap history remain immutable.

## 2026-09-20 — [DECISION] Proposal-only typography requests — Emin / Hermes

- `763939d15c294bc94bfacd45f60aaf573deb640a`: proposed mixed-weight field identity + regular feedback, tracking nuri-com/nuri-design-system#219 and nuri-com/nuri-expo#1412. Pending independent admission; not implemented, Ready, merged or released.
- `6bcf4e16a19a4c62606d70439a8765da30f6f0ac`: prior, separate italic proposal in DRAFT nuri-com/nuri-design-system#218, tracking #217. SHA belongs to that PR's branch, not this branch ancestry. Pending independent admission; not implemented, merged or released. Logged retrospectively without changing that proposal or claiming delivery.
- Verified unchanged upstream baseline: `022845e6c25107b0f4632e2bee256fe06e79f995`. Existing Text accepts nested emphasis; TextFieldLabel remains string-only and its default descriptor truncates. No runtime/API/generated changes in this session.

Checks for field-label proposal: spec-agnosticism/naming 4 passed; doc build passed;
doc tests 3 passed; generated doc output unchanged. Used existing local tooling via
ignored node_modules symlink. This is not proof of locked npm ci or all five CI gates.
Prior italic PR records the baseline missing @nuri/gen-ui@0.0.1 lockfile issue;
no dependency/lockfile repair is part of these proposals.
