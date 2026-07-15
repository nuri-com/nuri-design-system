# Nuri — the project

> The concise, current front door. Everything operational points here. The *why* behind past
> decisions lives in the historical archive ([`decisionlog.md`](./decisionlog.md) ·
> [`roadmap/`](./roadmap/)) — you rarely need it; this doc + the code are the source of truth.

## What it is

Nuri is a **mobile-first design system for Expo · React Native**. RN is the **production** target; the
web side is a **prototyping + documentation** surface, not a co-equal platform. The system is built so
that **one source of data drives every target** — you author a token/axis/component once, and each
target's output is *generated* from it.

## The one rule

> **Data lives once, in `@nuri/spec`. Logic and generated output live in the projection that runs them.**

`@nuri/spec` is **pure data** — no code, no dependencies, no generated artifacts. Every consumer is a
**projection** that resolves spec's data into the form it needs and owns that resolution.

## The shape

```
@nuri/spec          PURE DATA — the source of truth
  tokens/           dimensions · colours · typography        (the token SoTs)
  axes/             resolve-map · palette-surface · interactive-effects ·
                    typography-axis · property-spelling · interaction
  components/       button · icon-avatar · icon-button · modal-panel ·
                    tab-bar · tab-bar-item · topbar · schema       (descriptors)
  icons/            *.svg                                     (the icon SoT)

@nuri/rn            PRODUCTION — the RN projection
  generated/        the resolved contract, flattened from spec at build · committed
    data/           the six data tables (tokens · palette · recipes · icons ·
                    interaction · token-paths)
    components/     the per-descriptor API adapters (Path C)
  contract.ts       imports ./generated/data/*
  runtime/          the INTERNAL engine: resolve · renderer · theme-payload builder
  primitives/       the open primitive layer (View/Text/Pressable/Screen/Scroll · NuriIcon)
  theme.tsx         NuriThemeProvider / NuriScope / the resolved theme payload
  toast.tsx         ToastProvider / useToast · imperative overlay tenant

@nuri/prototype     the WEB projection (prototyping + the doc surface's components)
  generated/        the token CSS · descriptor .js twins · token-vars · icon registry
  factory · recipes · primitives

@nuri/doc           the documentation site (just-the-docs → GitHub Pages, live off main).
                    Generates component/foundation Markdown from spec DATA + the projections.

@nuri/playground    the local bench (demo.html · factory-parity)
scripts/            the codegen — reads spec's TS SoTs, writes each projection's generated/ output
```

## How resolution works

- **Build-time resolves everything resolvable; runtime selects only the context-variant.** Box, stack,
  typography, interactive are 100% static. Only **colour** varies by context.
- **Colour = layered substitution, not a cross-product.** `accent` is *upstream* (it fills the
  accent-portion of the palette); `mode` (light/dark) is *downstream* (resolves the variant across the
  composed palette). chrome is stored once (theme-only `{light,dark}`); each accent is one object
  (roles flat where mode-invariant, `{light,dark}` where they adapt). The provider **composes**
  `(accent, mode)` at selection time — there is no materialized `(accent × theme)` table.
- **The RN provider is a contract, opt-in.** Default = a static resolved slice (zero runtime, max
  perf). Opt-in = runtime `(accent, mode)` switching (Unistyles is the intended backing, *behind* the
  contract — never leaked). `accent` is a runtime-capable selection axis (latent: semantic accents,
  e.g. a `crypto`/`fiat` toggle).
- **Two projections, one SoT:** web composes via the CSS cascade (`[data-accent]` × `[data-theme]`,
  the browser resolves); RN composes via the provider (refs flattened to hex at build).

## How to build it

- **Codegen:** `node scripts/tokens-parser.js` (root `npm run build`) — reads the spec SoTs, writes
  `@nuri/rn/generated/` + `@nuri/prototype/generated/`. The generated output is **committed**.
- **Drift guards:** `node --test scripts/*.test.js` (root `npm test`).
- **CI — 5 gates** ([`.github/workflows/gates.yml`](./.github/workflows/gates.yml), all required):
  `spec` (codegen + drift + re-emit ≡ committed) · `prototype` · `doc` · `rn` (render-smoke + tsc) ·
  `expo-demo` (tsc). The `rn` render-smoke imports the contract and renders it, so a contract change
  that breaks RN fails CI by construction.
- **Discipline:** generated output is never hand-edited — change the SoT and regenerate; the re-emit
  gate fails a stale commit. Every change ships on a branch via PR into protected `main`.

## How to work on it (common tasks)

- **Add an accent:** a ramp + one accent object + one `ACCENTS` entry in `tokens/colours.ts`. Data only.
- **Add/edit a token:** edit the SoT in `tokens/` (dimensions · colours · typography), regenerate.
- **Add a component:** author a descriptor in `components/` (a composition of the axis namespaces in
  semantic names · the factory resolves it on RN, CSS on web). This is the **product work** (the catalog).
- **An axis** (box/stack/palette/interactive/typography) is a data table in `axes/`.

## State

The infrastructure refactor is **complete** (#105–#126) — `@nuri/spec` is pure data, the two
projections own their generated output, the colour system is data-driven end-to-end, the
component-API arc landed (#114–#119 · each descriptor declares its public API and codegen emits
exact per-component adapters), and the debt register closed with every entry resolved. **The
current work is the product: the catalog** — descriptors for the components still living in
`@nuri/prototype/legacy/`, built on that clean foundation, on the principle that *everything is
axis composition*.

## Where history lives (you rarely need it)

[`decisionlog.md`](./decisionlog.md) and [`roadmap/`](./roadmap/) are the **immutable historical
record** — the *why* behind how things got here. Settled design docs and closed registers (the debt
register · the target designs · the consumer feedback · the 2026-06 risk snapshot) live in
[`docs/archive/`](./docs/archive/). They are archived: do not cite them operationally (this doc +
the code are current). [`docs/RISKS.md`](./docs/RISKS.md) is the live risk register.
