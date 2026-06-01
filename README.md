# Nuri

Mobile-first design system for Expo · React Native.

This repo is the **living source of truth** for tokens, foundations, and
(eventually) component documentation. The Expo app consumes a generated export.

## What's in here

```
styles/                      the CSS that IS the design system
  tokens-primitive.css       colour scales, sizes, radii, font, duration
  tokens-semantic.css        role-based tokens
  shell.css                  docs shell + shared widgets · typography v2 globals
  typography.css             .nuri-type-* utilities (chained-class selectors,
                             specificity 0,0,2) · MUST load after shell.css

lib/                         vanilla JS — physically split by migration target
                             (decision 26)
  components/                DS surfaces · migrate to RN
    scope/scope.js           <nuri-scope> Tier 3 primitive
    scope/README.md          NuriScope RN spec (decision 27 · N+5.5)
    button/
      button.css             @layer tokens + @layer rules
                             (selector :root, [data-accent], [data-theme])
      button.js              <nuri-button> custom element
  docs/                      docs-chrome · web-only · never migrates
    state.js                 localStorage ↔ data-* bridge
    shell.js                 <nuri-shell>, <nuri-page>, NAV, topbar
    tokens.js                CSS → DTCG parser + token-table renderer
                             (companion to pipeline/tokens-parser.js)
    demo/demo.{js,css}       <nuri-demo> interactive example container
    control/control.{js,css} NuriControl select-pill + icon-button factory

pipeline/                    Node pipeline · sources · hand-maintained
                             (decision 35 · N+6.0.4: pipeline = source,
                             build = generated outputs only, never
                             hand-edited)
  parsers/
    primitive.js             postcss-based · readPrimitives, buildDtcg,
                             inferType, pathFor (N+3.5)
    semantic.js              cascade walker · classifySemantic +
                             GROUP_NAMES + AXIS_REGISTRY + classifyAll
                             + SET_POLICY (N+5.5 + N+6.0.3)
    components.js            per-component @layer tokens walker · emits
                             build/components/<name>.ts (N+6.0.3)
  tokens-parser.js           orchestrator + re-export point · npm run build
  tokens-parser.test.js      node:test · 17 assertions

build/                       Generated outputs · 100% emitted by the
                             pipeline · never hand-edited
  tokens.json                216 colour primitives (DTCG-nested)
  tokens.ts                  36 semantic leaves · nested exports
                             (chrome + accent · cascade-varying ·
                             N+5.5 / N+6.0.3 · space + size ·
                             cascade-invariant · N+6.1 · decision 36
                             · + radius · cascade-invariant ·
                             N+6.1.1 · amendment 36.1)
                             (consumed by docs/migration-tests/button-matrix/)
  components/
    button.ts                per-component literals + TokenPath strings
                             (N+6.0.3 · decision 34)
  token-paths.ts             TokenPath discriminated union over every
                             runtime-set leaf · 36 members (N+6.0.3)

pages/
  principles.html            the WHY of Nuri · numbered principles (N+3)
  implementation-guide.html  HOW · web→RN migration spec (N+5.6)
  foundations/
    colour/primitive.html    REFERENCE foundation page + index.html
                             redirect target · token-driven
    colour/semantic.html     token-driven · per-accent sections × light/dark cols
    colour/exploration.html  token-driven · exploratory status
    typography.html          sample-driven · .nuri-scale-list ramp
    dimension/primitive.html token-driven · --nuri-px-N · 12 leaves (N+6.1.1)
    dimension/spacing.html   token-driven · semantic spacing T-shirt scale (N+6.1)
    dimension/sizing.html    token-driven · semantic sizing T-shirt scale (N+6.1)
    dimension/radius.html    token-driven · semantic radius T-shirt + full=9999px sentinel (N+6.1.1)
  components/
    button.html              CANONICAL TEMPLATE for component docs

decisionlog.md               immutable ledger · all locked decisions
                             (N+5.6 · was docs/HANDOFF.md "Decisions locked")

skills/                      per-skill procedure files (N+5.6)
  add-component.md           add a DS component
  add-foundation.md          add a foundation page
  add-accent.md              add an accent / colour scale
  add-principle.md           add or change a principle
  modify-tokens.md           edit tokens at any layer
  pipeline-dtcg-export.md    extend the CSS → DTCG → RN pipeline
  close-out-session.md       end a working session

roadmap/                     session router + per-session detail (N+5.6)
  index.md                   current state · what's next · workstreams
  N+X.md                     one file per session retrospective

prompts/                     reusable agent prompt templates (N+5.6)
  README.md                  index
  coordinator.md             multi-session strategic role
  working-session.md         per-session task briefing
  closeout-audit.md          audit-subagent briefing
  migration-test.md          web↔RN translation pair briefing

docs/
  RISKS.md                   open risks with named failure modes
  migration-tests/           web ↔ RN translation pairs (evidence for R5)
    button-matrix/           first translation pair (N+4)

playground/                  RESERVED for future view-composition workstream
                             (intentionally empty today)

index.html                   redirect → pages/foundations/colour/primitive.html
llms.txt                     AI-consumer manifest (links + paths only)
AGENTS.md                    skill router for spec-authoring agents
package.json                 Node deps (postcss) + build / test scripts
```

The docs site has no build step — the browser resolves `var()` references
natively. The Node pipeline in `build/` is opt-in (`npm run build`) and
exists for the React Native sync workstream.

## Quick start

Open in a browser:

```bash
open index.html
```

Or serve the folder (useful if you'll later add fetch/import):

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

### Dev cache caveat

Each page sets `Cache-Control: no-cache` via `<meta http-equiv>` so the
**document** revalidates on every navigation. But meta tags don't affect
how the browser caches **subresources** (the JS/CSS files Nuri loads) —
that depends on the dev server's response headers, which we can't
control from inside the HTML.

If you edit a `.js` or `.css` file and don't see the change in the
browser, either:

- Open DevTools → Network tab → check "Disable cache" (then keep
  DevTools open while reloading), or
- Hard-reload the page (`Cmd+Shift+R` on macOS).

When deploying, wire proper cache-control headers server-side and
remove the meta tags from the HTML pages.

## Status

Early **v0**. The token architecture is locked (two layers, mode × accent
composition). Foundations are being built one at a time.

- [x] Colour
- [x] Typography
- [x] Dimension (primitive + spacing + sizing + radius — N+6.1 / N+6.1.1)
- [x] Iconography (`<nuri-icon>` · 17-glyph phosphor registry — N+6.3)
- [ ] Elevation
- [ ] Motion

Components: Button (first reference implementation) + the Stack / Box
layout primitives (N+6.2) + the Icon visual atom (N+6.3). IconButton —
the first real icon consumer — is next (N+6.4).
See [`roadmap/index.md`](./roadmap/index.md) for the planned sequence.

## Two layers, briefly

- **`styles/tokens-primitive.css`** — flat catalogue of raw values, theme-agnostic.
  Every colour exists as both `-light` and `-dark`.
- **`styles/tokens-semantic.css`** — role-based tokens composing
  `data-theme` × `data-accent`. Components consume these.

Full architecture is documented across the
[Colour primitive](./pages/foundations/colour/primitive.html) and
[Colour semantic](./pages/foundations/colour/semantic.html) pages,
the locked rules in [`pages/principles.html`](./pages/principles.html),
and the consumer-facing summary in [`llms.txt`](./llms.txt).

## For AI agents and contributors

Two entry points, two audiences:

- **Consuming Nuri** (writing app code that uses the DS):
  read [`llms.txt`](./llms.txt).
- **Working on Nuri** (modifying tokens, adding foundations or components):
  read [`AGENTS.md`](./AGENTS.md).

Both are short and kept in sync with the code by hand. If something diverges,
the code wins — open an issue or fix the docs.

## React Native pipeline

The CSS files in `styles/` are designed to be parsed into W3C DTCG-format
tokens (`tokens.json`) and emitted as a typed `tokens.ts` for the Expo app via
Style Dictionary. Naming-prefix conventions in `tokens-primitive.css` let the
pipeline infer each token's `$type` without metadata files.

**Thin slice landed (N+3.5)** · `pipeline/tokens-parser.js` reads
`styles/tokens-primitive.css` and emits `build/tokens.json` (DTCG-nested,
216 colour tokens since N+5.7 cleanup) with a `node:test` round-trip
suite.

**Semantic cascade slice landed (N+5) · refactored to classify-by-
cascade (N+5.5)** · the parser is split into
[`pipeline/parsers/{primitive,semantic}.js`](./pipeline/parsers) with
`pipeline/tokens-parser.js` as the orchestrator. The semantic walker
reads the cascade blocks of `styles/tokens-semantic.css`, chases the
var() chain through the build's selected `--neutral` scope (default
`cream` since N+5.8 · [decision 31](./decisionlog.md#31-default-neutral-scale--cream--cli-parameter---neutral=scale--n58)),
then emits
[`build/tokens.ts`](./build/tokens.ts) (machine-generated, replaces
the N+4 hand-rolled stand-in) — but the **shape** of each export is
now derived from which `[data-<dim>=…]` blocks declare each var
(N+5.5 · decision 28). All 18 declared semantic tokens are
exposed under two nested exports: `chrome: Record<Theme, {...}>`
(12 leaves) and `accent: Record<Accent, Record<Theme, {...}>>`
(6 leaves). The hardcoded export lists are gone; future dimensions
(font / density / neutral) auto-discover when their CSS blocks
land. N+6.0.3 added two more emit surfaces (decision 34): per-
component files at [`build/components/<name>.ts`](./build/components/)
(today: `button.ts`) carry the component-token numerics directly
from the live CSS (the pre-N+6.0.3 hardcoded `BUTTON_BASE` block
is gone), and [`build/token-paths.ts`](./build/token-paths.ts)
exposes a `TokenPath` discriminated union over every runtime-set
leaf for type-checked consumer references.
`pipeline/tokens-parser.test.js` runs 17 assertions: 6 primitive
round-trip, 4 semantic cross-product (hand-derived oracle, P4
bright-vs-saturated asymmetry, `selectorMatches` port,
`resolveValue` chain walker), 4 classify-by-cascade invariants
(nested-export grep, every var classifies and lands, naming-vs-
cascade agreement, `GROUP_NAMES` exhaustive), 2 set-policy + per-
component emit guardrails (N+6.0.3), and 1 primitive-consumption
guardrail (N+5.7 — every `--nuri-*` is consumed via `var()` /
alias chain or explicitly reserved). Style Dictionary is
now conditional on a second target platform (decision 2 amendment,
N+5.5); Unistyles consumption is the remaining pipeline slice
— see [`roadmap/index.md`](./roadmap/index.md) "Pipeline" workstream.

**Thesis validation landed (N+4)** · [`docs/migration-tests/button-matrix/`](./docs/migration-tests/button-matrix/)
is the first web ↔ RN translation pair. An 8-instance Button
cross-product (variant × accent × state × scope-tier). Web side renders
in 390px viewport; RN hand-translation typechecks under `tsc --jsx
react-native --strict`. 8 frictions captured at
[`docs/migration-tests/button-matrix/FRICTIONS.md`](./docs/migration-tests/button-matrix/FRICTIONS.md)
and folded into [`docs/RISKS.md`](./docs/RISKS.md) R1 + R5; F-TOKEN-1
retired in N+5 (now machine-generated). The top-level
[`playground/`](./playground/) dir is reserved for a future
view-composition workstream and is intentionally empty today.
