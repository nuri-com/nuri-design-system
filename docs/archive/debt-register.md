# Nuri · the architectural-debt register

> **CLOSED 2026-07-02 — every entry resolved (#107–#126). Archived; the durable lesson lives in
> AGENTS.md.**

> An honest, adversarial inventory of the inconsistencies, leaks, workarounds and rot the **5 CI
> gates cannot catch**. The gates check *behaviour* (render-smoke, tsc) and *drift* (re-emit ≡
> committed); they do **not** check architectural consistency — agnosticism, naming coherence,
> type-honesty, dead code, duplication. That gap is why this document exists.
>
> **Posture.** Every entry is either PROVEN-justified (file:line + a real reason the invariant
> doesn't apply) or called DEBT. Default to DEBT when unsure. A code comment that *defends* a thing
> is the rationalization, not the justification — several entries below carry elaborate defending
> headers and are still DEBT.
>
> Authored read-only (audit session · 2026-06-30). No source changed; the only write is this doc.
> Authoritative current state = `README.md` + the code; this register is the snapshot at audit time.

Severity legend: **S3** = bites the production target / correctness / a11y · **S2** = misleads
authors or hides drift surface · **S1** = cosmetic / low-blast-radius.

---

## 1 · The register

### Seed re-verifications (the four coordinator-found seeds)

#### SEED-1 — `@nuri/spec` carries WEB realization · **RESOLVED (SEED-1a/1b)** · S2

- **Status (2026-07-01):** fixed for the interactive axis. `packages/spec/axes/interactive-effects.ts`
  now carries only agnostic `opts` (`trigger` · `gate` · RN realization vocabulary). The prototype
  projection owns the browser rules/chrome/order in `packages/prototype/pipeline/parsers/interactive-css.js`,
  and docs consume that projection-owned table instead of reading web data from spec. A narrow
  `interactive-css.test.js` guard now rejects `webChrome`/`webOrder`, selector fragments, CSS vars, and
  declaration strings in the spec file.
- **Status (SEED-1b follow-up):** the broad agnosticism lint now lives at
  `scripts/spec-agnosticism.test.js`. It strips comments, scans `packages/spec/**`, skips SVG icon
  sources, and names explicit allowlists for the property-spelling registry, the current interactive
  RN realization vocabulary, and the public `BoxNS.minWidth` input key. `typography-axis.ts` no longer
  carries selector/declaration data; the prototype typography emitter owns that web projection.
- **Original location:** `packages/spec/axes/interactive-effects.ts:123-149` (`webChrome`), `:91-119`
  (`opts[*].web`), `:155` (`webOrder`).
- **What:** The agnostic spec axis embeds literal **web CSS** as data:
  `['cursor','pointer']` (:130), `['transition','background-color var(--nuri-duration-fast) ease, transform …']`
  (:131), `['outline','2px solid var(--nuri-focus-ring)']` (:138), `['outline-offset','2px']` (:139),
  `['transform','scale(var(--nuri-interaction-press-scale))']` (:105), `['transform','none']` (:147),
  plus the CSS-cascade-order list `webOrder` and the structured selector `on:[{state:':active'}]`.
- **Invariant violated:** README ("`@nuri/spec` is **pure data** — no code, no dependencies, **no
  target realization**"). Every *other* axis keeps web realization in the projection: `box.css` /
  `stack.css` / `palette.css` are generated *by the prototype* from the agnostic `resolve-map`
  /`palette-surface` tables. interactive-effects is the lone axis that ships its own web CSS.
- **Cause:** the N+44 de-dup (one-SoT-two-projections) pulled the web realization **up into spec**
  to kill drift between three readers, instead of keeping the agnostic opt-in in spec and the web
  CSS in the web projection.
- **Why it's still DEBT (the adversarial call):** the file's header (`:9-32`) defends this as "the
  one-SoT invariant." That argument justifies *single-sourcing the mapping* — it does **not** justify
  *where the web half lives*. The drift it prevents could equally be prevented by spec carrying only
  the agnostic `(gate · trigger · rn)` triple and the **web projection** owning the cursor/outline/
  transition/`@layer`-order realization (it already owns `box.css` et al.). The comment is the
  rationalization; the invariant is still violated.
- **Fix (cause-level):** split the file. Keep `opts` (the 3 agnostic opt-ins: gate · trigger · rn)
  in `@nuri/spec`. Relocate `webChrome` + `webOrder` + each `opts[*].web` into the prototype's web
  emitter (`packages/prototype/pipeline/parsers/interactive-css.js`), which already walks them.
  Dependency note: touches the web emitter + the strip pipeline (SEED-1b) + the doc strip.

#### SEED-1b — the type-strip / `data:`-URL import workaround · **RESOLVED** · S2

- **Status (2026-07-01):** resolved by `scripts/ts-data-loader.js`, a shared build-time helper that
  uses the TypeScript compiler API (`transpileModule`) and imports the emitted ESM through the existing
  `data:text/javascript` boundary. Root codegen, prototype pipeline tests/build, and doc generation now
  load TS data through that helper; the old regex `stripTypes` / `stripTsData` / bespoke
  `stripFieldTable` loaders are gone. The root package now declares `typescript` as a devDependency
  because `scripts/` imports it directly.
- **Result:** spec SoT comments no longer impose the single-line/no-import/comma-free authoring
  contract. Runtime validation stayed at the caller boundaries (`px`, `surface`, `STACK_FIELDS`,
  `PROPERTY_SPELLING`, etc.), so a malformed import still fails loudly.

#### SEED-2 — component file / descriptor / export / type names derive from the public name · **RESOLVED** · S2

- **Status (2026-07-01):** resolved by PR #110 (`dc70fb0`). The old source/public split was removed:
  `composition-button` is now `button`, `tab` is now `tab-bar-item`, and every descriptor roster entry
  is the public kebab name.
- **Proof:** `packages/spec/components/button.ts` and `packages/spec/components/tab-bar-item.ts` exist;
  `DESCRIPTOR_COMPONENTS` carries one-column `{ name }` entries; the authored files export the
  derived descriptor identifiers (`buttonDescriptor`, `tabBarItemDescriptor`); RN generated bindings
  and web recipes call `nuriNames('<roster-name>')`; and `scripts/naming.test.js` passes.
- **Guard:** `scripts/naming.test.js` pins basename/export/subpath/twin/recipe coherence, asserts every
  `nuriNames(x)` site names a roster component on both targets, and keeps the drift/doc rosters aligned
  with `DESCRIPTOR_COMPONENTS`.
- **Former issue:** two descriptors used source names that differed from their public component names
  (`composition-button` → `button`, `tab` → `tab-bar-item`), with `source`/`public` overrides and
  parallel hand-restated names hiding drift.

#### SEED-3 — per-descriptor prop surface replaces the old universal `NuriBaseProps` soup · **RESOLVED (Path C component API)** · S3

- **Status (2026-07-01):** resolved before this register entry was updated. The public catalog
  components now come from generated per-descriptor adapters in `packages/rn/generated/components/*`.
  Their prop types are emitted from each descriptor's `api`, so component-specific props stay on the
  component that declares them: `Button` has no scalar `icon`/`selected`, `IconButton` requires
  `icon` and forbids children, `TabBarItem` alone gets the `selected` bridge, and non-interactive
  descriptors do not receive press props.
- **Proof:** `packages/rn/type-tests/component-types.test-d.tsx` uses `@ts-expect-error` fixtures to
  pin the exact public surfaces under `npm run typecheck -w @nuri/rn`; the generated adapters normalize
  props into `renderDescriptorInstance`, whose renderer no longer owns a universal `NuriBaseProps`
  surface.
- **Former issue:** the old shared base prop type allowed props like `icon`, `prefix`, `suffix`,
  `label`, and `selected` on components that ignored them at runtime.

#### SEED-4 — the RN theme colour-resolution indirection · **RESOLVED** · S2

- **Status (2026-07-02):** resolved in two steps. First, the colour provider/path had already landed in
  the settled Option-B shape: `packages/rn/generated/palette.ts` emits structural refs `{ group, leaf }`,
  `packages/rn/factory/theme.ts` builds one resolved `ThemePayload` per `(accent, mode)`, and
  `packages/rn/factory/resolve.ts` reads semantic roles from `theme.surface[...]` / `theme.chrome[...]`.
  The old `resolveColor`, `RUNTIME_GROUPS`, `resolveAccentSlice`, and per-node
  `buildNuriTheme(ns.accent, mode)` paths were gone before this register entry was closed.
- **This slice:** removed the remaining public RN token escape hatch: `ThemePayload.slices`,
  `RuntimeTokens`, `useRuntimeTokens()`, `resolveToken()`, `useToken()`, `ColourTokenPath`, and the public
  `TokenPath` export. It also closed the raw colour-table leak by removing public `chrome` and
  `accentTokens` exports from the RN barrel. The Expo demo now consumes semantic resolved roles
  (`useNuriTheme().text.muted`, `useNuriTheme().chrome.canvas.bg`) instead of raw token paths or raw
  colour token tables.
- **Proof:** `packages/rn/factory/__tests__/colour-payload-identity.test.ts` still binds
  `surface`, `chrome`, `mode`, `accent`, `text`, and `border` to an independent oracle derived from the
  token SoTs and settled variant-to-role mapping. `scripts/rn-token-escape-hatch.test.js` fails if the
  public RN/demo code regrows `useToken`, `resolveToken`, `useRuntimeTokens`, `RuntimeTokens`, or
  `ColourTokenPath`; if the RN barrel exports raw `chrome`/`accentTokens`; if the Expo demo imports those
  raw colour tables from `@nuri/rn`; and separately asserts `ThemePayload` stays free of raw slices.
- **Residual intentional shape:** generated `packages/rn/generated/palette.ts` may still import the
  generated `TokenPath` type internally to prove each structural colour ref corresponds to a real
  colour token path. That type no longer leaves the public RN barrel.

---

### Beyond the seeds

#### D1 — the entire CSS-parity-oracle apparatus in `descriptors.js` is dead · **RESOLVED** · S2

- **Status (2026-07-01):** resolved by PR #109 (`75c313e`). The dead CSS-parity oracle was pruned and
  `scripts/no-unused-exports.test.js` was added so unused codegen-surface exports cannot silently
  regrow.
- **Proof:** the old oracle symbols (`deriveDescriptor`, `deriveButton`, `deriveIconAvatar`,
  `emitDescriptorTs`) are absent from live code except comments/test prose; `scripts/parsers/descriptors.js`
  is now the authored-source passthrough surface only (`DESCRIPTOR_COMPONENTS`, `exportNameFor`,
  `descriptorBody`, `emitDescriptorJsFromSource`); and `scripts/tokens-parser.js` no longer imports or
  re-exports dead descriptor functions.
- **Guard:** `node --test scripts/no-unused-exports.test.js` passes, and the guard is included in the
  root `node --test scripts/*.test.js` drift suite.
- **Former issue:** the retired oracle re-derived descriptors from CSS/HTML inputs that no longer
  existed, while its exports remained reachable enough to look alive.

#### D2 — orphaned registry fields `kind` / `fgPart` · **RESOLVED** · S1

- **Status (2026-07-01):** resolved with D1 in PR #109 (`75c313e`).
- **Proof:** `DESCRIPTOR_COMPONENTS` now carries only `{ name }`; the `kind`/`fgPart` fields were
  removed with the oracle, and the only remaining mentions are explanatory comments/test prose and this
  historical register text.
- **Former issue:** `kind` and `fgPart` were read only by the dead derivers, making the registry look
  like it still drove a CSS derivation.

#### D3 — committed generated descriptor twins carry STALE provenance headers · **RESOLVED (minor-tail-cleanup)** · S2

- **Status (2026-07-01):** resolved for the live generated surfaces. Descriptor twin headers,
  RN generated token/palette/icon/interaction headers, prototype namespace CSS headers, and the
  in-place token CSS provenance comments now point at `packages/spec/{tokens,axes,components}`,
  `packages/{rn,prototype}/generated`, `packages/prototype/factory`, and `scripts/…` paths. The
  fixes live in the emitters, followed by `npm run build`; generated diffs are prose-only.
- **Location:** emitter `scripts/parsers/descriptors.js:630-673` (`passthroughHeaderTs`/`Js`); output
  e.g. `packages/prototype/generated/descriptors/composition-button.js:4,12-14`.
- **What:** the committed twin's header says *"The browser-ESM twin of **build/descriptors/**
  composition-button.ts"*, *"Source · **pipeline/descriptors/**composition-button.ts"*, *"the runtime
  web factory (**lib/runtime/factory.js**)"*, *"the `git diff --exit-code **build/**` gate covers it."*
  **None of those paths exist** post-infra-exit: the authored source is
  `packages/spec/components/composition-button.ts`, the twin is
  `packages/prototype/generated/descriptors/…`, the web factory is
  `packages/prototype/factory/factory.js`. (Same class of stale comment in `axes/interaction.ts:11-13`,
  but that's a SoT comment, not committed generated output.)
- **Invariant violated:** generated output should be self-describing and accurate.
- **Why the re-emit gate is BLIND to it (the meta-point):** the `spec` gate asserts *committed ≡
  emitter output* (`gates.yml:62`). The committed file matches the emitter — but the **emitter's
  header strings are themselves stale**, so the gate is satisfied by construction. The drift gate
  guarantees "generated matches generator," never "the generator's prose is true."
- **Cause:** the infra-exit relocated everything but never updated the emitter's hard-coded header
  literals.
- **Fix (cause-level):** update the `passthroughHeader*` literals to the real paths and regenerate.

#### D4 — RN `decorative` a11y parity · **RESOLVED (RN renderer catch-up)** · S3

- **Status (2026-07-01):** resolved before this register entry was updated. RN now reads
  `descriptor.decorative` in `packages/rn/factory/createNuriComponent.tsx` and applies the platform
  hide pair on the root host: `accessibilityElementsHidden` +
  `importantForAccessibility="no-hide-descendants"`.
- **Proof:** `packages/rn/factory/__tests__/render-smoke.test.tsx` asserts the positive
  `IconAvatar` case and the negative `Button` case, and the committed RN snapshot carries the hide
  pair only on the decorative root.
- **Former issue:** `IconAvatar` was `decorative:true`, web applied `aria-hidden`, but the production
  RN projection ignored the descriptor field.

#### D5 — a parallel, test-only descriptor→style resolution path · **RESOLVED (2026-07-01 · #112)** · S2

- **Status (2026-07-01 · #112):** resolved by PROMOTION, exactly the register's preferred fix (a).
  The test-only Unistyles-shaped engine (`toUnistylesRecipe`/`recipeFor`/`buildPartRecipe` and the
  `PartRecipe`/`ComponentRecipe`/`CompoundVariant` types) was DELETED; its precompute was PROMOTED
  into the build-time geometry bake `scripts/parsers/recipes.js` (`buildGeometryRecipe`), reshaped
  COLOUR-FREE — the baked artifact carries no backgroundColor/fg/pressedBg/hex; colour stays the
  Arc-1 runtime path (`resolvePalette` against the theme context). There is no parallel engine left:
  the bake emits `packages/rn/generated/recipes.ts` and the factory loads it (D11).
- **Proof:** `rg "buildPartRecipe|recipeFor|toUnistylesRecipe" packages scripts` finds only
  historical comments; `packages/rn/factory/__tests__/geometry-bake.test.ts` binds the baked emit to
  the TS runtime resolver (full style + node oracle over the catalog) and `scripts/recipes.test.js`
  pins the generator's generality on synthetic descriptor shapes.
- **Former issue:** the render path used `flattenPart` while the Unistyles-shaped recipe path was a
  **second** full descriptor→style engine whose only callers were the snapshot tests — a maintained
  parallel structure with its own drift surface, exercised only by snapshots, whose `{base, variants}`
  form was simultaneously the build-time-static slice the README promised and the runtime path
  re-derived every render (D11's other half).

#### D6 — `resolve-map.ts` `FILL` hardcodes RN property spellings in `@nuri/spec` · **RESOLVED** · S2

- **Status (2026-07-01):** resolved. `packages/spec/axes/resolve-map.ts` now models `fill` cases as
  neutral intents (`grow`, `shrink`, optional `basis`, optional `minInline`). RN spells those locally
  in `packages/rn/factory/resolve.ts` and the build-time bake mirrors that in
  `scripts/parsers/recipes.js`; web derives `flex` + `min-inline-size` in
  `packages/prototype/pipeline/parsers/namespace-css.js`.
- **Proof:** the generated namespace CSS, RN baked recipes, and RN snapshots remain byte-identical.
  The stack axis doc now intentionally shows the neutral fill intent instead of RN property fragments.

#### D7 — the component roster + public names are coherently guarded · **RESOLVED** · S2

- **Status (2026-07-01):** resolved with SEED-2 in PR #110 (`dc70fb0`). The registry is now one-column
  `{ name }`, so there is no source/public split, and `BROWSER_DESCRIPTOR_COMPONENTS` derives from
  `DESCRIPTOR_COMPONENTS` instead of restating the list.
- **Proof:** `scripts/naming.test.js` exists and passes. It asserts source basenames, exports subpaths,
  generated descriptor twins, web recipes, RN generated bindings, `nuriNames(...)` call sites, the
  drift-guard roster, and the doc roster all agree with `DESCRIPTOR_COMPONENTS`.
- **Former issue:** component names and public names were hand-restated across the descriptor registry,
  codegen/browser rosters, drift/doc rosters, RN bindings, and web recipes, with only partial
  cross-checking.

#### D8 — descriptor `defaults` typing · **RESOLVED (Path C component API)** · S1

- **Status (2026-07-01):** resolved. `packages/spec/components/schema.ts` now types defaults as
  `{ [Axis in keyof A]?: A[Axis] }`, so a default key must be one of the descriptor's axes and the
  value must be one of that axis's values. The frozen schema pin in `scripts/docs-drift.test.js` moved
  with the deliberate contract tightening.
- **Proof:** `packages/rn/factory/__tests__/render-smoke.test.tsx` includes compile-time
  `@ts-expect-error` assertions for both a bad default value and an unknown default key.
- **Former issue:** `defaults?: Partial<Record<string, string>>` accepted misspelled keys and
  impossible values, letting bad descriptor defaults typecheck.

#### D9 — `NuriIcon` hardcodes a `'#000'` colour fallback in a colour-by-scope system · **RESOLVED (minor-tail-cleanup)** · S1

- **Status (2026-07-01):** resolved. `NuriIcon` now reads `useNuriTheme()` and falls back to
  `theme.text.primary` only when an explicit `color` prop is absent. The render smoke suite mounts
  standalone `<NuriIcon>` under `NuriThemeProvider mode="dark"` and asserts the rendered `SvgXml`
  colour is `#f0eee3`, not `#000`.
- **Location:** `packages/rn/factory/NuriIcon.tsx:40` (`color={color ?? '#000'}`).
- **What:** when the scope foreground is undefined the production glyph paints literal black, not a
  theme token. Everywhere else colour flows from the resolved theme (§12). A raw `#000` is a small
  theme-bypass.
- **Verdict:** DEBT but low blast radius — in practice the factory always threads a resolved fg
  (`createNuriComponent.tsx:221-225`), so the fallback is rarely hit; standalone `<NuriIcon>` is the
  exposure. **Confidence: medium** (didn't trace every standalone caller).
- **Fix:** default to a chrome text token, or require `color` and let the standalone caller pass it.

#### D10 — `Scroll` primitive may drop RN content-sizing · **RESOLVED (minor-tail-cleanup)** · S1

- **Status (2026-07-01):** confirmed and patched. The pre-change render snapshot for
  `<Screen><Scroll>…</Scroll></Screen>` showed `RCTScrollView` with only `style={{ flex: 1 }}` and no
  `contentContainerStyle`. `Scroll` now passes `contentContainerStyle={SCROLL_CONTENT_STYLE}` with
  `{ flexGrow: 1 }`, and the RN render smoke asserts it on the `ScrollView`.
- **Location:** `packages/rn/factory/primitives.tsx:240-244` — `Scroll` renders
  `<RNScrollView style={SCREEN_STYLE}>` (`{flex:1}`) with **no** `contentContainerStyle`.
- **What:** `docs/RISKS.md` (R-EXPO-4) records that an RN scroll surface needs
  `contentContainerStyle.flexGrow:1` for content sizing (the old mirror's back-port). The new
  hand-authorable `Scroll` sets only the outer `style`. This *might* re-introduce the R-EXPO-4 gap.
- **Verdict:** flagged honestly as **low confidence** — this is a *runtime-correctness* hunch, not a
  proven architectural inconsistency, and I did not render it. Needs a device/render check before it's
  promoted to DEBT. Listed so it isn't swept under the rug, not asserted as fact.
- **Fix (if confirmed):** add `contentContainerStyle={{ flexGrow: 1 }}` to `Scroll`.

#### Tail tidy — top-level `NuriTheme.space/size/radius` · **RESOLVED (minor-tail-cleanup)** · S1

- **Status (2026-07-01):** resolved. The requested grep found no live `theme.space`, `theme.size`, or
  `theme.radius` consumers outside `packages/rn/factory/theme.ts`. The top-level fields and contract
  imports were removed from `NuriTheme` / `ThemePayload` / `buildNuriTheme`; static scales remain
  exported from `packages/rn/contract.ts` and are still used directly by open primitives and resolvers.

#### D11 — the RN factory resolves the STATIC namespaces at runtime, contradicting the documented build-time-static design · **RESOLVED (2026-07-01 · #112)** · S2

> Surfaced by operator review (the resolver-architecture question), alongside SEED-4. Where SEED-4 is
> about *colour* resolution doing too much, D11 is about *everything else* being resolved at the wrong
> time. They're the two halves of the same "the RN resolution architecture doesn't match the documented
> design" picture.

- **Status (2026-07-01 · #112):** resolved along the register's fix direction. Codegen bakes the
  static namespaces at build: `scripts/parsers/recipes.js` emits
  `packages/rn/generated/recipes.ts` (box/stack as concrete ViewStyle · typography/interactive as
  raw mergeable partials, colour-free), and closed descriptors render through
  `flattenBakedPart` — `createNuriComponent.tsx` requires `recipe` at the type level AND throws at
  runtime without one. `flattenPart` survives as the test-only oracle, excluded from the public
  barrel; the open primitives intentionally stay runtime-resolved (open props · shared appliers).
  Runtime merges only the theme colour (`palette`) + state transients (`interactive`) on top, with
  typography's `typeStyle`/fontScale seam (P11) kept intact — the README's promised zero-runtime
  static slice, delivered.
- **Proof:** `packages/rn/factory/__tests__/geometry-bake.test.ts` (the full-surface style + node
  oracle over the catalog, binding the baked emit to the TS runtime resolver) +
  `scripts/recipes.test.js` (the synthetic-shape generator guard, pinning variant-level interactive
  and emphasis-only typography generality the catalog doesn't exercise).
- **Former issue:** the factory resolved **every** namespace at runtime, on every render (and again
  on every press via the Pressable render-prop), while web honoured the design with generated
  build-time CSS — the two projections diverged on *when* resolution happens, and the build-time
  `{base, variants}` form already existed as the test-only `toUnistylesRecipe` precompute (D5) and
  was discarded. An architecture-fidelity + perf finding, not a correctness bug.

---

## 2 · The gate-blind-spot map

The 5 gates (`.github/workflows/gates.yml`): **spec** (`node --test scripts/*.test.js` + build +
`git diff --exit-code` the generated homes), **prototype** (namespace-CSS freshness/value + re-emit),
**doc** (Guard G doc-gen drift + re-emit), **rn** (render-smoke + `tsc`), **expo-demo** (`tsc`). They
prove two things only: **behaviour** (the descriptors render; the types compile) and **drift**
(committed generated output ≡ what the generator emits now). Everything below is *structurally
invisible* to them.

| Blind class | Why the gates miss it | Entries | Cheap guard that would close it |
|---|---|---|---|
| **Spec agnosticism** | Target realization in spec is *valid data that emits correctly* — re-emit + render-smoke both stay green. | SEED-1/D6 class now guarded | **Landed:** `scripts/spec-agnosticism.test.js` scans comment-stripped `packages/spec/**` for CSS selector/var/declaration payloads and RN ViewStyle keys, with explicit allowlists for the property-spelling registry, interactive RN realization vocabulary, and the public `BoxNS.minWidth` input. |
| **Naming coherence** | Guard D pins descriptor *shape/axes/parts*, never *names*; `nuriNames` derives correctly from whatever string it's *handed*. The hand-authored input strings are now guarded separately. | SEED-2/D7 (resolved 2026-07-01) | **Landed:** `scripts/naming.test.js` asserts file basename/export/subpath/twin/recipe coherence, every `nuriNames(x)` site names a roster entry on both targets, and drift/doc rosters agree with `DESCRIPTOR_COMPONENTS`. |
| **Type-surface honesty** | tsc passes — optional props that are ignored, and a `Partial<Record<string,string>>` hole, are all *type-valid*. | SEED-3 / D8 (resolved 2026-07-01) | **Landed:** generated per-descriptor RN adapters emit exact prop types from descriptor `api`; `Descriptor.defaults` is keyed/value-constrained by the descriptor axes; `@ts-expect-error` type fixtures pin both. |
| **Dead code** | An uninvoked export breaks nothing; the re-emit path doesn't touch it. | D1/D2 (resolved 2026-07-01) | **Landed:** `scripts/no-unused-exports.test.js` roots the live codegen surfaces and fails unrooted exports/dead closures. |
| **Duplication / parallel structure** | Multiple hand-lists that *happen* to agree pass; only explicit cross-checks catch drift. | D5 resolved 2026-07-01 (#112); D7 resolved 2026-07-01 | **Landed:** the descriptor roster is one build-side list with naming/doc/drift guards, and D5's RN precompute/runtime duplication closed at #112 — the precompute was promoted to the single shipped artifact. |
| **Generated-doc accuracy** | The re-emit gate proves committed ≡ generator output; it **cannot** see that the generator's header *strings* name dead paths. | D3 (resolved 2026-07-01) | A check that paths cited in generated headers resolve on disk would prevent recurrence. |
| **Cross-projection parity** | The render-smoke renders but asserts no a11y props; expo-demo tsc accepts an ignored optional field. | D4 (resolved 2026-07-01) | **Landed:** RN renderer applies the decorative hide pair on root hosts and render-smoke asserts both the positive `IconAvatar` case and the non-decorative `Button` case. |
| **Wrong abstraction / redundant layer / resolution-at-the-wrong-time** | Redundant or mistimed resolution emits the *same output* — render-smoke renders identical pixels, the re-emit gate sees a faithful generator. No gate measures *when* resolution happens or whether the promised zero-runtime path exists. Over-engineering and runtime-vs-build placement are invisible to behaviour + drift. | SEED-4 resolved 2026-07-02; D5 + D11 resolved 2026-07-01 (#112) | **Landed:** the RN colour payload identity guard binds the resolved semantic payload, `scripts/rn-token-escape-hatch.test.js` prevents the public token hatch from regrowing, and the shipped static-style artifact check exists — `geometry-bake.test.ts` binds `generated/recipes.ts` to the runtime resolver (full style + node oracle) with the spec gate's re-emit covering the artifact, and `scripts/recipes.test.js` pins generator generality. |

The meta-finding: the gates form a tight **behaviour + drift** net and a near-zero **consistency**
net. Every seed and every D-entry lives in the consistency gap. The cheapest high-leverage additions
were the **agnosticism lint** (now landed for SEED-1/D6 recurrence) and the **no-unused-exports
pass** (landed with D1/D2 and stops the next refactor leaving rot).

---

## 3 · Severity-ranked fix sequencing

Ordered by blast radius × independence. Each is a candidate working-session brief.

1. **D4 · RN `decorative` a11y wiring** — **RESOLVED (2026-07-01).** RN now applies the root hide
   pair for decorative descriptors and render-smoke pins both directions.
2. **SEED-3 + D8 · per-descriptor prop surface + typed defaults** — **RESOLVED (2026-07-01).**
   Generated RN adapters expose exact descriptor-declared props, type fixtures prevent regressions,
   and `defaults` is keyed/value-constrained by descriptor axes.
3. **D1 + D2 · delete the dead oracle** — **RESOLVED (2026-07-01).** PR #109 (`75c313e`) pruned the
   CSS-parity oracle, removed `kind`/`fgPart`, dropped the orphan descriptor imports/re-exports, and
   added the no-unused-exports guard.
4. **SEED-2 + D7 · the naming/roster unification** — **RESOLVED (2026-07-01).** PR #110 (`dc70fb0`)
   renamed the source descriptors to the public kebab names, removed `public`/`source`, made the roster
   one-column, and added the naming guard.
5. **SEED-1b + D6 · remaining spec agnosticism** — **RESOLVED (2026-07-01).** Regex TS-data loaders
   were replaced with the shared TypeScript transform, `fill` is neutral and spelled per projection,
   typography wrapper web realization moved to the prototype emitter, and the broad agnosticism lint
   landed.
6. **SEED-4 · theme colour-resolution indirection** — **RESOLVED (2026-07-02).** The provider/path had
   already moved to structural palette refs + one resolved payload per `(accent, mode)`; this slice
   removed the remaining public token escape hatch and added a regrowth guard.
7. **D11 + D5 · RN build-time-static resolution** — **RESOLVED (2026-07-01 · #112).** Codegen bakes
   the static box/stack/typography/interactive namespaces into `packages/rn/generated/recipes.ts`
   (`scripts/parsers/recipes.js` · the PROMOTED `toUnistylesRecipe` precompute, reshaped colour-free);
   the factory renders closed descriptors through `flattenBakedPart` (recipe required at type level +
   runtime throw), `flattenPart` survives as the test-only oracle, typography's `typeStyle`/fontScale
   seam (P11) stays intact, and the open primitives stay runtime. Byte-identical render proven by the
   geometry-bake oracle + unchanged snapshots; generator generality pinned by `scripts/recipes.test.js`.

---

## 4 · Confidence + coverage

**Swept (high confidence):**
- All of `packages/spec/` — every `axes/*.ts`, `components/*.ts`, `tokens/*.ts` read in full
  (agnosticism, naming, type honesty). Cross-checked by a dedicated agnosticism sweep agent.
- The RN factory in full — `createNuriComponent.tsx`, `resolve.ts`, `theme.ts`, `theme.tsx` (the
  runtime), `primitives.tsx`, `NuriIcon.tsx`, `index.ts` (the four seeds + type honesty + the parallel
  recipe path + the colour-resolution path).
- **Honest miss, corrected (×2):** my first pass rated SEED-4 (theme.ts) S1 "least-bad — a type mirror."
  Operator review pushed on it; tracing the *runtime* path showed (SEED-4) a redundant colour-resolution
  layer and (D11) the *whole* static resolution happening at runtime against the README's documented
  build-time-static design — the discarded `toUnistylesRecipe` precompute (D5) being the proof the
  build-time form already exists. Both are S2 and both came from **review, not the sweep**. Recorded
  plainly: my resolver-architecture read was the weakest part of the original register, and the two
  deepest RN findings (the colour indirection · the resolution-time mismatch) were operator-surfaced.
  The lesson for the coverage claim: the RN factory's *resolution architecture* (not just its files)
  warranted a design-level pass I under-did first time.
- `scripts/parsers/descriptors.js` in full + the dead-code question (the oracle's death **proven**:
  no invocation, inputs deleted, Guard D's own comment confirming retirement).
- The one-generator-per-artifact invariant — verified by a dedicated codegen agent across
  `scripts/` + the prototype pipeline: **holds** (every generated artifact has exactly one emitter; no
  artifact double-emitted; no hand-edited file under a `generated/` dir). This is a *clean* result,
  recorded so the register isn't only negatives.
- The 5 gates (`gates.yml`) and the doc staging (`stage.mjs`) — confirmed `doc/assets/nuri/` is
  **gitignored regenerated output**, NOT a committed duplication (a candidate finding ruled out).

**NOT reached / lower confidence (honest gaps):**
- The web projection internals: `packages/prototype/factory/factory.js` (only the `decorative` +
  `applyHostNS`/`harvestSlots` regions read), the six web recipes line-by-line, and
  `packages/prototype/pipeline/parsers/*.js` (the web emitters) — sampled, not exhaustively audited.
  A second agnosticism/naming offender could hide in the web emitters.
- The doc package (`packages/doc/pipeline/*`) beyond `stage.mjs` + `package.json` — not audited for
  its own duplication/naming debt.
- `scripts/parsers/*.js` other than `descriptors.js`/`components.js` — the codegen agent reported
  `readComponentTokens`/`emitComponentTs` (`components.js`) as exported-but-test-only (a *minor*
  dead-ish tail, already documented in-repo); the remaining parsers were not read in full by me.
- The frozen `packages/prototype/legacy/` catalog (switch / list family / nav-item / tabs) — out of
  scope; it's deliberately-frozen pre-catalog source, not live debt.
- `packages/expo-demo/` screens and runtime behaviour — not audited (the D4/D10 RN-runtime claims are
  reasoned from code + RISKS.md, **not** from a device render).
- RISKS.md (1138 lines) — read for role + the F-DECORATIVE-1 / R-EXPO-4 references that back D4/D10;
  not mined exhaustively for other latent admissions.

This register is **representative, not exhaustive.** The seeds are re-verified with proof; the broad
sweep covered the highest-risk surfaces (spec + the RN production factory + the descriptor codegen);
the web emitters and the doc pipeline are the most likely homes for additional findings of the same
classes (agnosticism, naming, duplication) and warrant a follow-up pass.
