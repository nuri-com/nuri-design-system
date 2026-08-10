# Risks · Nuri — the live register

> The lean, current risk register. Adjudicated 2026-07-02 against the post-refactor tree (#105–#126);
> the full historical register — every failure mode, friction code, and closure narrative from
> 2026-05-27 onward — is the immutable snapshot at
> [`archive/RISKS-2026-06.md`](./archive/RISKS-2026-06.md). Only add a risk with a named failure
> mode visible from the project's own choices; close it here with one line of evidence, never by
> deleting the history.

## Open

### R1 · Props parity ≠ behavioural parity (web ↔ RN)

- **Risk:** the two projections agree on props and generated style values, but **no gate renders
  web and RN side-by-side** — behavioural divergence (touch semantics, text wrapping/truncation,
  a11y roles, focus) would ship invisibly. This entry also carries R4's residual kernel: the
  projections resolve at different times (CSS cascade vs baked hex + provider), so a behavioural
  mismatch surfaces only in a render comparison, not in the value-level parity guards.
- **Current mitigation:** one data SoT with generated output on both sides; the RN render-smoke
  renders the whole catalog in CI; the geometry bake is oracle-bound to the runtime resolver; the
  irreconcilable platform gaps are budgeted per-component (the F-* friction codes — archive R1 is
  the canonical record).
- **What would close it:** a side-by-side render gate (same descriptor, both projections, compared
  output) — or the R5 product screen shipping and holding on both targets.

### R5 · The thesis is not validated on a real product screen

- **Risk:** "author once in spec, every target generated" is proven by benches (expo-demo, the
  playground) and CI renders, not by a shipped app screen. The descriptor vocabulary may still be
  missing what a real screen needs — a layout you cannot express in DS props is a real gap the
  benches won't force out.
- **Current mitigation:** the expo-demo consumes only the public RN surface (semantic resolved
  roles · no token escape hatch · guarded); playground demo screens are held to RN-translatable,
  DS-only composition.
- **What would close it:** the first real app screen shipped on the DS on RN — composed purely of
  descriptors + primitives, no page-local escape hatches.

## Closed

- **R7 · Fixed regions depend on asynchronous measurement** — closed 2026-07-17: Header/Footer geometry is
  one-pass Yoga/CSS with no measurement handshake; only Dock retains measured overlay insets. The automated
  and browser matrix plus physical Android and iOS Expo Go acceptance—including first autofocus, keyboard
  transitions, Footer pinning, safe-area restoration, and transparent Topbar under-scroll—is recorded in
  [`fixed-region-yoga-refactor.md`](./fixed-region-yoga-refactor.md) §§10 and 13.

- **R2 · pipeline schema validated late** — superseded: the CSS→DTCG→Style-Dictionary pipeline it
  worried about no longer exists; the spec is TS data, the descriptor schema is FROZEN and pinned
  (Guard F · `scripts/docs-drift.test.js`), and the drift suite + re-emit gates validate every
  change.
- **R3 · no verification beyond human review** — superseded: 5 required CI gates (spec · prototype ·
  doc · rn render-smoke + tsc · expo-demo tsc) plus the anti-rot guards (naming ·
  no-unused-exports · spec-agnosticism · rn-token-escape-hatch · recipes/geometry-bake oracle).
- **R4 · build-free web vs build-resolved RN divergence** — largely superseded (one TS SoT, both
  outputs generated, parity + bake guards); the residual behavioural-parity kernel is folded into
  R1 rather than kept as a second overlapping entry.
- **R6 · personas framing committed before tested** — historic: the three-persona docs model it
  questioned was retired with the pre-refactor docs surfaces (now under `packages/doc/archive/`);
  `AGENTS.md` routes the one live persona (the spec-authoring agent).

Full failure modes, mitigation history, and the friction-code catalogue:
[`archive/RISKS-2026-06.md`](./archive/RISKS-2026-06.md).
