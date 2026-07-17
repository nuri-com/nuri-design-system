# Working on Nuri

Router for the **spec-authoring agent** — the persona that modifies Nuri itself (the spec data, the
codegen, the projections, the docs). Read [`README.md`](./README.md) first: it is the operational source
of truth (what Nuri is, the package shape, how resolution works, how to build it, the common tasks). This
file is the short orientation; the README is the manual.

If something here conflicts with the code, the code wins — fix this file, don't work around it.

---

## The structure (data-only · see the README for detail)

`@nuri/spec` is **pure data** — no code, no generated output:

```
@nuri/spec/
  tokens/       dimensions · colours · typography      (the token SoTs)
  axes/         resolve-map · palette-surface · interactive-effects ·
                typography-axis · property-spelling · interaction
  components/   button · icon-avatar · icon-button · modal-panel · tab-bar ·
                tab-bar-item · topbar · schema       (the descriptors + the frozen schema)
  icons/        *.svg                                   (the icon SoT)
```

Every other package is a **projection** that owns its resolution:

- `@nuri/rn` — **production** (the RN projection · `generated/` = the resolved contract (`data/` + `components/`) · `runtime/` engine + `primitives/` + the provider).
- `@nuri/prototype` — the **web** projection (prototyping + the doc-surface components · `generated/` token CSS + descriptor twins).
- `@nuri/doc` — the documentation site (generates Markdown from spec data + the projections).
- `@nuri/playground` — the local bench.
- `scripts/` — the **codegen**: reads spec's TS SoTs, writes each projection's `generated/` output.

## How to author (the data only)

- **Admission first for shared contract:** the DS repository is the slow shared core. Fast learning
  normally lives in consumer repos; the DS playground/prototype may host bounded DS-owned non-contract
  experiments, but there is no fast lane for public DS growth. Use the
  [design-system admission policy](./docs/design-system-admission.md): the lightweight maintenance form
  is for Corrections, internal maintenance, and bounded Experiments; the contract-admission form is for
  Contractions, Extensions, and Mixed public/observable contract changes. The consumer/product owner
  supplies need evidence; an independent named human DS architect admits a specific contract. Project
  `Ready`, not a form label, is the manual-pilot authorization boundary.
- **Tokens / accents:** edit the SoT in `tokens/` (`dimensions` · `colours` · `typography`), regenerate.
- **Axes:** a box/stack/palette/interactive/typography axis is a data table in `axes/`.
- **Components:** author a descriptor in `components/` — a composition of the axis namespaces in semantic
  names. The factory resolves it (RN) / the CSS does (web). This is the **product work** (the catalog).
- The descriptor **schema is frozen** (`components/schema.ts` · `docs-drift` Guard F). A schema change is a
  deliberate, versioned contract change — never an accident.

## The discipline

- **Never hand-edit `generated/`.** Change the SoT and run the codegen; the re-emit gate fails a stale commit.
- **Build:** `node scripts/tokens-parser.js` (root `npm run build`). **Drift:** `node --test scripts/*.test.js`
  (root `npm test`).
- **The 5 CI gates** ([`gates.yml`](./.github/workflows/gates.yml), all required): `spec` · `prototype` ·
  `doc` · `rn` (render-smoke + tsc) · `expo-demo` (tsc). The `rn` render-smoke renders the contract, so a
  contract change that breaks RN fails CI by construction.
- Green gates do **not** prove architecture, ownership, recurrence, or admission. They prove only the
  behavior/drift they compare; Expo demo evidence verifies compatibility/behavior only and is not
  app-feature incubation. The admission policy remains the control for shared-core growth or
  contraction.
- Every change ships on a branch via PR into protected `main`.

## What the gates do NOT prove (the register's durable lesson)

The 5 gates prove **behaviour** (render-smoke · tsc) and **drift** (re-emit ≡ committed) — **never
architecture**. Agnosticism, naming coherence, type-surface honesty, resolution timing, and guard
completeness are gate-invisible: code violating all five still renders correctly and re-emits
faithfully. They are defended by the landed anti-rot guards (spec-agnosticism · naming ·
no-unused-exports · rn-token-escape-hatch · the recipes/geometry-bake oracle) plus adversarial
review — a guard proves only what it COMPARES, so review the comparison surface, not just the
guard's existence. Ledger hygiene is a process rule, not a gate: the PR that ships a fix flips the
corresponding register/status line in the SAME PR (a stale ledger manufactures phantom work). The
full gate-blind-spot map lives in [`docs/archive/debt-register.md`](./docs/archive/debt-register.md) §2.

---

## Skills

There are **no skills yet** — the old `skills/` procedures all described the pre-refactor structure
(`lib/components/`, `pages/`, `pipeline/`) and were deleted at the Phase 5 purge. The one procedure worth
re-authoring,
**`add-component`** (the catalog procedure for the data-only descriptor shape), is written at **Phase 6
start** — when the catalog work begins.

---

The *why* behind how things got here lives in the **archived** historical record
([`decisionlog.md`](./decisionlog.md) · [`roadmap/`](./roadmap/)) — immutable, not an operational
reference. The live risk register is [`docs/RISKS.md`](./docs/RISKS.md).
