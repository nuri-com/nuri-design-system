# N+41 · A3 — carve `@nuri/prototype` (the post-flip re-cut)

**Status**: SHIPPED on `feat/n41-prototype-carve` (base `main` @ `3e1530a` · N+40). Realizes
[convergence](./convergence.md) **phase 2 · A3** ([package-migration](./package-migration.md)) and
[decision 68](../decisionlog.md)'s 6-package split. **Pure re-plumbing — behaviour-preserving**
(the carved namespace CSS regenerates byte-identical; `spec`'s `build/*` stays byte-identical; the
RN snapshots do not move). **No decision opened** — dec 2 was already flipped for the namespace
layer at [§74](../decisionlog.md); this only MOVES the web mechanism out of `@nuri/spec`.

## The frame — what A3 is, post-flip

The original A3 plan ([convergence §4](./convergence.md)) was pre-flip: carve the JS mechanism but
**keep the namespace CSS in `spec`** (it was the dec-2 SoT the pipeline read · moving it would
invert the DAG · "option iii"). [N+38 · the flip](./N+38-L3c-flip.md) changed the ground: the
namespace CSS became **generated** from the TS SoTs. So the re-cut moves **both** the web mechanism
**and** the namespace-CSS generation to `@nuri/prototype` — post-flip, prototype OWNS its emitter
(convergence §5 · "each library owns the emitter for its own surface"). `@nuri/spec` keeps the
**data**: the descriptors, the axis SoTs, the token pipeline, the icon registry.

## What shipped

1. **The `@nuri/prototype` workspace** (`package.json` · `README.md`) — `private` · `type: module`
   · `dependencies: @nuri/spec` · `devDependencies: postcss` (the 4 namespace tests parse with it;
   the emitters are dep-free node). `npm install` wired `node_modules/@nuri/prototype` (a
   conservative non-RN add · lockfile +14/−0 · the RN dual-version tree untouched).

2. **The web mechanism moved** (`git mv` · history preserved):
   - `factory/` ← `lib/runtime/factory.js` + `reset.css`
   - `primitives/` ← the 11 element `.js` (box · stack · pressable · typography · view · icon ·
     screen · scroll · separator · spacer · scope) + their 7 element `.css`
   - `recipes/` ← the 3 factory-backed recipes (button · icon-avatar · topbar)
   - `demo/` ← `nuri-demo` (`lib/docs/demo/*`)
   - `legacy/` ← `spec/legacy/` (the frozen pre-axes mechanism)

3. **The namespace-CSS generation moved** — `pipeline/` ← `css-preview.js` + the 4 parsers
   (`namespace · palette · interactive · typography`-css.js) + the 4 freshness tests + the 4
   browser computed-check HTMLs. The **5 generated outputs** moved to `styles/<ns>.css` (flat ·
   was `lib/components/<ns>/<ns>.css`). The generator now:
   - resolves `spec`'s **5 axis SoTs** via `import.meta.resolve('@nuri/spec/<sot>')` (the exports
     map · the declared cross-package data contract);
   - reads `spec`'s generated `styles/tokens-semantic.css` (the scale vocab) via the spec package
     root the resolved SoTs anchor;
   - writes `prototype/styles/<ns>.css`;
   - is wired into **`npm run build -w @nuri/prototype`** (its own build · `package.json`
     scripts.build = `node pipeline/css-preview.js`).

4. **`@nuri/spec` exports + 1 internal couple.** `package.json` exports +3 — `./palette-surface` ·
   `./interactive-effects` · `./typography-axis` (the bespoke axis SoTs · TRANSITIONAL pure-data ·
   joining the N+39 `./resolve-map` + `./property-spelling`) so prototype's emitter resolves them.
   The **shared TS-strip** (`dimension-css.js#stripTypes`) is CO-LOCATED in prototype
   (`pipeline/parsers/strip.js` · a verbatim copy) — spec keeps its own for the token flip; the
   byte-identical re-emit guard keeps them honest. The 2 value-oracle tests reach spec's internal
   colour resolver (`semantic.js`) + token CSS via cross-package **relative** paths (the `icon.js`
   precedent · build-free · NOT a declared export). `icon.js` reads spec's `icons.js` (the registry
   · Slice-6 data · STAYS in spec) the same way.

5. **`spec`'s orchestrator slimmed** (`tokens-parser.js` · build-output-NEUTRAL):
   - removed the **namespace-CSS slice** (`flipNamespaceCss` · the generator moved);
   - removed the **Slice-4 `@layer tokens` walk** — its targets (`lib/components/<ns>.css`) moved,
     and it only fed the build LOG (the TokenPath union derives from `classifiedGroups` · Slice 5,
     not the walk). The resolver it exercised (`resolveComponentValue`) stays covered by
     `tokens-parser.test.js` on synthetic input (reframed at N+38) · the re-exports stay (the test API).
   - Slice 8 (`derivePalette`) was already re-sourced to read the TS SoTs at N+40, so nothing in
     spec's build still reads the namespace CSS → `build/*` byte-identical.

6. **Repoints** — 15 live pages (`../../lib/…` → `../../../prototype/…`, **type-aware**: namespace
   CSS → `styles/`, element CSS + primitive JS → `primitives/`, recipes → `recipes/`, factory →
   `factory/`, demo → `demo/`) + the 4 computed-check HTMLs (namespace CSS → local `../styles/`,
   token CSS → cross-package `../../spec/styles/`). The recipes import their descriptor twin from
   `../../spec/build/descriptors/<name>.js` (browser-relative · build-free · no import map).

7. **CI** — a 4th `gates.yml` job `prototype`: `npm test` (the 4 namespace freshness/value guards)
   + `npm run build` + `git diff --exit-code packages/prototype/styles/` (re-emit ≡ committed). The
   operator adds it to branch-protection required checks.

## The cross-package mechanism (the principled split)

- **Declared data (the 5 axis SoTs)** → resolved via the `@nuri/spec` **exports map**
  (`import.meta.resolve` · node 20.6+ · honours `exports`). This is why §4's 3 exports were added —
  they have exactly one consumer: prototype's emitter.
- **Spec internals (the colour resolver `semantic.js` · the token CSS · the icon registry)** →
  cross-package **relative** paths (`../../spec/…`). Not a public contract; the `icon.js` precedent
  (a browser-relative cross-package import · brief-endorsed · build-free).

DAG: **`prototype → spec` only** (`spec` references `prototype` in comments/`tokens-parser` notes
only · never reads it).

## The provenance-header re-path (coordinator adjustment · the N+39 discipline)

The 5 generated `styles/<ns>.css` carry a provenance header. Kept byte-identical through the move,
those headers cited the **pre-carve** reality (`pipeline/css-preview.js` · "wired into npm run build
(`pipeline/tokens-parser.js` · the namespace-CSS slice)" · `lib/runtime/factory.js` · the
`lib/components/<ns>.css` output). The coordinator called the re-path (not the defer): the EMITTED-
header templates in the 4 prototype emitters now cite the post-carve homes
(`prototype/pipeline/css-preview.js` · "npm run build -w @nuri/prototype (its own build)" ·
`prototype/factory/factory.js` · `prototype/styles/<ns>.css`); the SoT references stay
spec-qualified (`packages/spec/pipeline/<sot>.ts`). Also corrected the palette header's pre-N+40-
stale "asserts against THIS generated CSS" → "against the same SURFACE SoT (re-sourced at N+40)".
**The gate is the N+39 framing**: the `@layer rules` stay **byte-identical** to pre-carve (proven —
every changed line is inside the `/* */` provenance block); ONLY the header lines change; the 4
freshness tests still pass (re-emit ≡ committed).

## The build-order invariant (coordinator adjustment · recorded)

`npm run build --workspaces` runs in **discovery order** (`prototype` before `spec` · alphabetical),
NOT topologically as [convergence §5](./convergence.md) implied. **Benign today** — prototype's
namespace CSS depends only on spec's scale **KEYS** (`--nuri-{space,size,radius}-<leaf>` names ·
structurally stable), not the values; reading the committed `tokens-semantic.css` before spec re-
flips it is byte-identical, and CI is per-job. **The latent footgun**: a phase-4 token-vocab change
(adding/removing a scale leaf) needs `spec` built first, or a second `prototype` pass. The fix
(root `build` runs spec-first explicitly) is **deferred** — not worth the double-build while the
dependency is keys-only. Recorded in `convergence.md §5` + here.

## Verification (the gates · all green)

- **Render gate** (`pages/playground/demo.html` · the rendered surface · visual-feedback-first) —
  served from the repo root, rendered through the carved `@nuri/prototype`: all 9 custom elements
  defined (recipes self-import their primitives + the factory cross-package · console CLEAN), the
  factory de-collapsed the button (`button.nuri-interactive.nuri-stack.nuri-box.nuri-palette`),
  4 icon SVGs (the cross-package `icons.js` works), computed styles exact (solid md: accent-solid bg
  `rgb(18,17,11)` · 48px · radius 6px · padding 18px). **Dark + lilac re-resolves live** (solid +
  avatar → `rgb(190,170,255)`). Visually ≡ pre-carve (the CSS rules are byte-identical).
- `npm run build -w @nuri/prototype` → `git diff packages/prototype/styles/` **header-only** (rules
  byte-identical · the N+39 discipline) · `npm test -w @nuri/prototype` **23/23**.
- `npm run build -w @nuri/spec` → `git diff packages/spec/build/` **byte-identical** ·
  `npm test -w @nuri/spec` **48/48** (71 conserved · the 4 namespace tests = 23 subtests moved to
  prototype).
- `npm test -w @nuri/rn` **27 + 7 snapshots** · **tsc 0** for `@nuri/rn` + `@nuri/expo-demo` (the
  carve is web-only · rn + expo-demo untouched).
- Root `npm run build --workspaces` → both byte-identical (see the build-order invariant).

## Known / deferred (LOG-only · accepted)

- **The factory no-harness gap** stays open (a committed test of `buildComponent` · the load-bearing
  sole renderer since N+27) → a follow / A6. The 4 namespace freshness tests + the render gate cover
  the CSS side, not the factory walker.
- **`scope/README.md` stayed in `spec`** (only `scope.js` moved) — keeps `implementation-guide.html`'s
  doc-link valid + the README is docs (→ `@nuri/doc` at A4). `implementation-guide.html` +
  `principles.html` were NOT repointed (prose doc-links to source files, not live loads ·
  `principles.html`'s `button.css` link was already broken at the flip · a doc-hygiene tail).
- **`strip.js` duplication** (prototype's copy of spec's `stripTypes`) — accepted (each library owns
  its emitter · the byte-identical guard keeps them honest). Collapses if a shared build-util home
  ever lands.
- **The fidelity first-bump backlog** is unchanged (R1.5 axis defaults · stringly `center` ·
  `subtle` · topbar inset/title-type · icon-avatar `fill`).

## Next

The carve leaves coherent folders. Remaining convergence: **A4 `@nuri/doc`** (the SSG · `website/` +
`spec/pages/` + `spec/lib/docs/`) · **A5 `@nuri/playground`** (the bench) · **A6 codegen surfaces**
(the RN barrel + WC registrations + the factory harness) · then **phase 4** (`spec → pure data` ·
the icon simplification · the token-vocab flip · where the build-order fix lands) and **phase 5**
(the ledger purge). See [`convergence.md`](./convergence.md) · [`package-migration.md`](./package-migration.md).
