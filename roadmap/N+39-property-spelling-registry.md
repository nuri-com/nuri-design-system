# N+39 · final · the property-spelling registry + resolve-map → spec (RN-free)

**Status**: SHIPPED on `feat/n39-property-spelling-registry` (base `main` @ `85a8ddd`). Realizes
[decision 73](../decisionlog.md) clause 2 — the first step of `final` per [decision 74](../decisionlog.md)'s
"Next". Convergence: phase 2/4 (the `spec`-homing of the axis SoTs · the `rn → spec` DAG).
**Pure re-plumbing — behaviour-preserving** (the generated namespace CSS regenerates byte-identical;
the RN snapshots do not move). **No decision opened** (dec 2 untouched — the namespace layer was
already flipped at N+38; this only moves data + single-sources the spelling).

## The problem this closes

After the N+38 flip, the live `spec` build read its box/stack axis SoT (`resolve-map.ts`) **from
`@nuri/rn`** — the `rn → spec` DAG running backwards (the table was left transitional in rn at the
flip · §74). And the per-target property SPELLING was scattered: `resolve-map.ts`'s RN-spelled `prop`
+ `namespace-css.js`'s `LOGICAL_OVERRIDES`/`webProp` (the RN↔CSS name divergence written twice). The
session fixes both: a single shared spelling registry, and `resolve-map.ts` de-coupled from
`react-native` so it lands in dep-free `spec`.

## What shipped

1. **The registry — [`packages/spec/pipeline/property-spelling.ts`](../packages/spec/pipeline/property-spelling.ts)
   (new).** `PROPERTY_SPELLING`: canonical id → `{ rn, css }` for the 16 box/stack name-mappable
   properties (5 stack: `flexDirection`/`alignItems`/`justifyContent`/`gap`/`flexWrap` · 11 box:
   `inlineSize`/`blockSize`/`minBlockSize`/`padding`/`paddingInline`/`paddingBlock`/the 4 edges/
   `borderRadius`). **The canonical vocabulary** is the CSS-LOGICAL concept, camelCased (the
   de-RN-ification dec 73 cl.2 names): so `css` = the id kebab-cased (`paddingInline` →
   `padding-inline`) and `rn` carries RN's PHYSICAL de-logicalization (`paddingInline` → RN's
   `paddingHorizontal` · `inlineSize` → `width`). Both stored EXPLICITLY (the literal SoT, not
   `css = kebab(id)` derivation). Canonical ids are the registry's OWN keys (`keyof typeof` ·
   typed · typo-safe). Authored in the strip-trivial `as const satisfies <named type>` style
   (like `palette-surface.ts`) so the shared `stripTypes` loads it; `rn` is a plain `string`
   (spec stays RN-free).

2. **`resolve-map.ts` RN-free + relocated** (`git mv packages/rn/factory/ → packages/spec/pipeline/`,
   100% rename). `prop: keyof ViewStyle` → `prop: CanonicalId`; **dropped `import type { ViewStyle }
   from 'react-native'`**. `StackNS`/`BoxNS` now sourced intra-spec from `./descriptors/schema`
   (the sub-decision · they were always defined in the schema · `contract.ts` only re-exported
   them). The `expand`/`FILL` divergent cases **kept their multi-prop shape** (typed
   `Record<string, string | number>`, RN-free) — a MECHANISM difference, not a name, so NOT a
   registry entry (dec 73 cl.2). Its own bespoke `stripTypes` (in `namespace-css.js`) still loads
   it unchanged (the tagged-union + typed-const style · the expand-case type inlined so no strip
   change was needed).

3. **Both consumers read the registry's per-target spelling.**
   - **RN** ([`resolve.ts`](../packages/rn/factory/resolve.ts) · `applyFields`): `set(f.prop, …)`
     → `set(rnProp(f.prop), …)` where `rnProp = (id) => PROPERTY_SPELLING[id].rn as keyof ViewStyle`
     — THE rn boundary that casts the RN-free string back to a ViewStyle key (the RN snapshots are
     the oracle that keeps it honest). Imports now `@nuri/spec/resolve-map` + `@nuri/spec/property-spelling`.
   - **web** ([`namespace-css.js`](../packages/spec/pipeline/parsers/namespace-css.js)): `webProp(field.prop)`
     → `registry[field.prop].css`. **Deleted `LOGICAL_OVERRIDES` + `webProp`** (the ad-hoc
     re-spelling); `kebab` KEPT (it still spells the data-ATTR names, e.g. `paddingX`→`data-padding-x`
     — NOT a property spelling). New `loadRegistry` (the shared `dimension-css.js#stripTypes`, like
     `loadSurface`/`loadEffects`/`loadAxis`); `registry` threaded through `emitNamespaceCss` →
     `rulesForField`. `css-preview.js` loads it and points `RESOLVE_MAP` at `pipeline/resolve-map.ts`.

4. **The exports map** ([`packages/spec/package.json`](../packages/spec/package.json)) — two
   TRANSITIONAL subpaths: `@nuri/spec/resolve-map` → `pipeline/resolve-map.ts` ·
   `@nuri/spec/property-spelling` → `pipeline/property-spelling.ts`. They expose PURE DATA (only
   `import type`, no node/codegen deps · safe for the RN bundle) — `pipeline/` was "internal", so
   this is the sanctioned transitional exposure for the `rn → spec` DAG. The external names are
   dir-agnostic, so the convergence-phase-4 codegen-vs-data re-home changes only the map's RHS,
   not rn's import path.

5. **Comment hygiene** — the now-false "mis-homed in @nuri/rn" / "table stays RN-only" claims
   corrected in `css-preview.js`, `namespace-css.js` (header + module docstring), and
   `factory.js` (which also shed some pre-existing N+38-stale "decision 2 STANDS · NOT §9" text
   in the touched lines).

## Behaviour-preservation (the proof)

Every `canonical → rn` reproduces the old `prop` exactly; every `canonical → css` reproduces the
old `webProp(prop)` exactly (verified entry-by-entry across all 16). So:
- **`npm run build -w @nuri/spec`** → `git diff packages/spec/build/` **byte-identical** + every CSS
  RULE in `lib/components/{box,stack}/<ns>.css` byte-identical (the ONLY diff is one provenance-header
  line, re-pathed to the relocated SoT · the coordinator follow below). The namespace rules
  regenerating unchanged IS the proof the spelling did not diverge on the web side.
- **RN snapshots** (`resolve.test.ts` · 7 snapshots) **do not move** — the proof for the RN side
  (the emitted `ViewStyle` key order + values unchanged · `applyFields` iterates the table order,
  `rnProp` is an identity-preserving rename).

The dual oracle (generated CSS + RN snapshots) is exactly what makes this de-RN-ification safe NOW
(the S1 deferral's "no oracle, no second consumer" objection · dec 73 cl.2): both emits exist and
both are gated.

## Gates (green LOCALLY)

- **spec 71/71** · `npm run build -w @nuri/spec` → `git diff packages/spec/build/` byte-identical · box.css/
  stack.css **rules byte-identical** (only the provenance header re-pathed · 1 line each). Guard C (the
  resolved-value spot-check) exercises the registry's `.css` values
  (`inline-size`/`padding-inline`/`flex-direction`/…) end-to-end.
- **rn 27/27 + 7 snapshots** byte-identical · **tsc 0** (the cross-package `rn → @nuri/spec` resolve-map
  + property-spelling imports type-check under `moduleResolution: bundler`; the `rnProp` cast at the
  boundary; Metro/jest bundle the data files).
- **expo-demo tsc 0**.
- **DAG fixed**: `css-preview.js` reads `pipeline/resolve-map.ts` (intra-spec) · `resolve.ts` imports
  `@nuri/spec/resolve-map` (`rn → spec`).

## Resolved in review (#67)

- **The emitted box/stack provenance header** — FIXED on this branch (the coordinator follow). It
  cited the deleted `packages/rn/factory/resolve-map.ts`; the emitter's header string was re-pathed
  to `packages/spec/pipeline/resolve-map.ts` + the namespace CSS regenerated. The
  behaviour-preservation gate is **RESTATED not weakened** — the only box.css/stack.css diff is that
  one header line; every CSS RULE byte-identical, `build/` byte-identical, spec 71/71, RN snapshots
  unmoved. (Initially deferred to keep the gate a strictly empty diff; the coordinator correctly
  called it a wart on the very session that did the move.)

## Deferred / known (LOG-only · accepted)

- **The other 3 axis SoTs do NOT adopt the registry this session** (`palette-surface.ts` /
  `interactive-effects.ts` / `typography-axis.ts`) — they are already in `spec` (not RN-coupled),
  so they reference the registry in a FOLLOW (the dec-73-cl.2 "single-source the spelling" applied
  to the bespoke axes · out of scope here). Note `final`'s "home the axis SoTs into spec" is
  effectively COMPLETE — only `resolve-map.ts` was ever in rn; the bespoke three were authored in
  `pipeline/` from the start.
- **`border` / `outline`** (decision 30 · mapped-not-built) are NOT pre-added to the registry
  (P11 · no consumer yet) — they join as the registry's first new consumer when an axis needs them.
- **A `web` runtime column** is not added (`{ rn, css }` only) — box/stack dispatch by data-attr,
  so the web runtime needs no per-property inline spelling; a `web` column joins if a future axis
  applies inline web styles.

## Next (the remaining `final` / convergence)

The registry now exists + `resolve-map` is homed. Remaining `final`/carve work:
- the registry's **adoption by the bespoke axis emits** (palette/interactive/typography · the
  spelling single-sourcing follow);
- **re-source `build/palette.ts`** from `palette-surface.ts` (the L2→L3 composition · §74 / index
  "Remaining road");
- the **package carve** (decision 68 · 6 packages · now near-mechanical) + the codegen-vs-data
  home re-org (convergence phase 4 · where the transitional exports subpaths re-home).

See [`decisionlog.md` §73 / §74](../decisionlog.md) · [`roadmap/convergence.md`](./convergence.md) ·
[`roadmap/N+38-L3c-flip.md`](./N+38-L3c-flip.md).
