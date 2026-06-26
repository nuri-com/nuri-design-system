# @nuri/prototype — the build-free web library

> The **prototyping mirror** of `@nuri/rn` (decision 68 · 67 · [`docs/package-architecture.md`](../../docs/package-architecture.md) §3.2 · [`roadmap/convergence.md`](../../roadmap/convergence.md) phase 2). Carved out of `@nuri/spec`'s `lib/` at **N+41 · A3** (the post-flip re-cut). Holds the **web mechanism**; `@nuri/spec` keeps the **data + the token pipeline**.

## What's here

| dir | holds |
|---|---|
| `factory/` | the web **factory** — `buildComponent` (descriptor + selection → a de-collapsed `nuri-*` tree styled by the namespace CSS · the runtime mirror of the RN factory · decision 67) + `reset.css` (the native-host normalization) |
| `primitives/` | the web **primitives** — `nuri-{box,stack,pressable,typography,view,icon,screen,scroll,separator,spacer}` + `scope` (the element `.js` + the per-element `.css`) |
| `recipes/` | the 3 **factory-backed recipes** — `nuri-{button,icon-avatar,topbar}` (thin registrations over the factory · they import their descriptor from `@nuri/spec` + the local factory · decision 74) |
| `demo/` | **`nuri-demo`** — the showcase widget (toolbar · live preview · the doc/playground `## Example` slot) |
| `styles/` | the **5 generated namespace CSS** — `box · stack · palette · interactive · typography` (GENERATED · committed · do not hand-edit) |
| `pipeline/` | the namespace-CSS **generator** (`css-preview.js` + `parsers/` + the 4 freshness tests) — reads `@nuri/spec`'s TS SoTs, writes `styles/` |
| `legacy/` | the **frozen** pre-axes web mechanism (archived at N+36 · not gated · rebuild-as-descriptor on demand) |

## Build-free, with one generated surface

The library is **loaded in the browser with no build step** (custom elements + CSS · *what Nuri IS #3*). The single build step is the **namespace-CSS generation** (post-flip `prototype` owns it · decision 74 · convergence §5):

```
npm run build -w @nuri/prototype     # pipeline/css-preview.js → styles/<ns>.css
```

It reads `@nuri/spec`'s axis SoTs (`resolve-map` · `property-spelling` · `palette-surface` · `interactive-effects` · `typography-axis` · via the `@nuri/spec` exports map) and `@nuri/spec`'s generated `styles/tokens-semantic.css` (the scale vocab · cross-package), and writes the 5 namespace CSS into `styles/`. The output is **committed** and CI-guarded — `re-emit ≡ committed` (`pipeline/*.test.js` · `git diff --exit-code styles/`).

## DAG

`prototype → spec` only. `prototype` reads `spec`'s data (the descriptors via the exports map · the SoTs · the token CSS) and emits its own CSS; `spec` never reads `prototype`. Consumed by `@nuri/doc` (the SSG site) and `@nuri/playground` (the bench) — neither depends on the other (`nuri-demo` lives here, in the shared library).
