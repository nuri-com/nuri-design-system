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
  components/   composition-button · icon-avatar · topbar · schema  (the descriptors + the frozen schema)
  icons/        *.svg                                   (the icon SoT)
```

Every other package is a **projection** that owns its resolution:

- `@nuri/rn` — **production** (the RN projection · `generated/` = the resolved contract · `factory/` + the provider runtime).
- `@nuri/prototype` — the **web** projection (prototyping + the doc-surface components · `generated/` token CSS + descriptor twins).
- `@nuri/doc` — the documentation site (generates Markdown from spec data + the projections).
- `@nuri/playground` — the local bench.
- `scripts/` — the **codegen**: reads spec's TS SoTs, writes each projection's `generated/` output.

## How to author (the data only)

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
- Every change ships on a branch via PR into protected `main`.

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
