# Nuri · the architectural-debt register

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

#### SEED-2 — component file / descriptor / export / type names don't derive from the public name · **DEBT** · S2

- **Location:** `packages/spec/components/composition-button.ts` (export
  `compositionButtonDescriptor`, type `CompositionButtonAxes`) → public component **`button`**;
  `packages/spec/components/tab.ts` (export `tabDescriptor`, type `TabAxes`) → public component
  **`tab-bar-item`**. Registry: `scripts/parsers/descriptors.js:60` (`name:'composition-button' …
  public:'button'`), `:78` (`name:'tab' … public:'tab-bar-item'`).
- **What:** the system's stated rule is *one public kebab name → web `nuri-{kebab}` · RN
  `Pascal({kebab})`, mechanically derived* (`nuriNames`, `createNuriComponent.tsx:103-107`). But the
  **file name, the export name (`exportNameFor = camel(name)+'Descriptor'`, `descriptors.js:285`),
  and the type name (`typeNameFor`, `:288`)** all derive from the **source** name, not the public
  name. So two components carry vestigial qualifiers: `composition-` (a retired
  open-primitive-vs-recipe distinction, `descriptors.js:46-50`) and bare `tab` (should be
  `tab-bar-item`). The other five components match.
- **Invariant violated:** the mechanical-kebab↔Pascal naming rule the rest of the system enforces
  ([[ds-boundary-and-naming]]). For these two, `name ≠ public`, and nothing downstream is derived
  from `public` except `nuriNames`.
- **Cause:** `public` was bolted onto the registry as an *override* when the names diverged
  (`descriptors.js:52-58`), rather than renaming the source so `name === public` and the whole chain
  (file · export · type · web tag · RN class) derives from one string.
- **Fix (cause-level):** rename the SoT files/exports/types so `name === public`:
  `composition-button.ts → button.ts` (`buttonDescriptor` / `ButtonAxes`), `tab.ts → tab-bar-item.ts`
  (`tabBarItemDescriptor` / `TabBarItemAxes`); drop the `public` override and `source` field; update
  the RN bindings + web recipes + the three roster lists (see D7). One name, one derivation.

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

#### SEED-4 — the RN theme colour-resolution indirection · **DEBT** · S2

> Re-scoped after operator review. The original seed framed `theme.ts` as "least-bad — a hand-written
> type mirror" (S1). Tracing the *runtime* path shows the real defect is deeper: a redundant
> colour-resolution layer on top of an already-resolved token slice. Upgraded S1 → S2. The type-mirror
> observation survives as sub-point (d).

- **Location:** `packages/rn/factory/theme.ts:83` (`RUNTIME_GROUPS`), `:85-91` (`resolveColor`),
  `:97-122` (`buildSurface`/`buildChrome`), `:126-147` (`buildNuriTheme`); the runtime slice it sits
  on top of, `packages/rn/theme.tsx:151-159` (`runtimeTokens`) + `:168-171` (`resolveToken`); the
  generated mapping it consumes, `packages/rn/generated/palette.ts:32-72`; the consumer,
  `packages/rn/factory/resolve.ts:138-158` (`resolvePalette`) + the per-component rebuild at
  `createNuriComponent.tsx:279`.
- **What (traced end-to-end):** `runtimeTokens(accent, mode)` already returns a fully-resolved slice —
  `slice.accent.solid` and `slice.chrome.bgCanvas` are concrete hexes (`theme.tsx:151-159`). On top of
  that, `buildNuriTheme` runs a **second pass**: it reads the generated `palette.variant`/`palette.chrome`
  mapping (TokenPath **strings** like `'accent.solid'`, `palette.ts:35`) and dereferences each via
  `resolveColor` → `resolveToken` (`'accent.solid'.split('.')` → `slice.accent.solid`) into a parallel
  structured `NuriTheme.surface`/`.chrome`. Net: `theme.surface.solid.bg` **is** `slice.accent.solid`;
  `theme.chrome.canvas.bg` **is** `slice.chrome.bgCanvas` (a pure rename). The consumer could read the
  slice directly.
- **What is genuinely load-bearing (NOT debt):** (i) `runtimeTokens` — resolving `(accent × mode) →
  hex` *at render* is the runtime-switchable layered-substitution design, can't be baked; (ii) the
  **variant→role mapping** in `palette.ts` (`solid → {accent.solid, accent.onSolid, accent.solidPressed}`)
  — real knowledge, since the descriptor only says `palette.variant:'solid'`. The defect is the
  *resolution layer*, not these.
- **The DEBT, precisely:**
  - **(a) stringly runtime dereference for statically-known paths.** `resolveColor`/`resolveToken`
    parse `'accent.solid'` at render (`indexOf('.')`, `RUNTIME_GROUPS.has`, `split('.')`); the codegen
    already knows each path's `(group, leaf)` and could emit a typed structure indexed with zero parsing.
  - **(b) lossy emit, reconstructed by heuristic.** Spec models paint structurally
    (`Paint = string | {literal}`, `palette-surface.ts:64`); the codegen flattens it to plain strings,
    and `resolveColor` re-derives the ref-vs-literal split by sniffing for a dot + a known prefix. A
    literal containing a dot, or a role group absent from the hand-maintained `RUNTIME_GROUPS` set
    (`theme.ts:83`), breaks silently. `RUNTIME_GROUPS` is a *third* restatement of the group vocabulary
    (slice keys · TokenPath grammar · this set).
  - **(c) parallel structure rebuilt per component.** `NuriTheme.surface`/`.chrome` is the slice
    re-walked, memoized per component per (accent,mode) (`createNuriComponent.tsx:279`); `resolvePalette`
    rebuilds the **entire** theme just to read one variant for an accent self-scope (`resolve.ts:144`).
  - **(d) the original type-mirror (now a sub-point).** `SurfaceRole`/`ChromeRole`/`NuriTheme`
    (`theme.ts:46-64`) are hand-declared shapes mirroring the contract; `INTERACTION_BASELINE` is
    correctly pinned, not duplicated (`:75-78`). No *value* duplication — but the shape relies on a human
    keeping it in step. Largely dissolves if (a)-(c) are fixed.
- **Invariant violated:** single-resolution-path + "data lives once." The colour resolution exists
  twice (the slice, then the rebuilt theme), the ref/literal distinction is destroyed at emit and
  reconstructed at runtime, and the group vocabulary is restated three times.
- **Cause:** `resolveToken`/TokenPath is a deliberately *general* consumer-dereference primitive
  (decision 34, good for `useToken`); `buildNuriTheme` re-used it as the *internal engine* to rebuild a
  structured theme, instead of the factory consuming the slice + a typed mapping. The web side gets this
  for free (the CSS cascade resolves `var(--nuri-accent-solid)`); RN has no cascade, so it
  reimplemented resolution — but with one layer too many.
- **Fix direction (depth deferred to the fix-brief · operator-directed):** the factory consumes the
  resolved slice directly; the variant→role mapping becomes a **typed static index** (group+leaf known
  at build, ref/literal preserved structurally from spec); `resolveColor` + `RUNTIME_GROUPS` + the
  `NuriTheme.surface`/`.chrome` parallel structure largely dissolve. `resolveToken` stays as the public
  `useToken` primitive. Two viable depths — **full** (dissolve `buildNuriTheme`, factory reads the slice)
  vs **minimal** (keep `NuriTheme.surface` but emit the mapping typed so the string-parse/`RUNTIME_GROUPS`
  go away) — are a sizing call for the brief, not pre-decided here.

---

### Beyond the seeds

#### D1 — the entire CSS-parity-oracle apparatus in `descriptors.js` is DEAD · **DEBT** · S2

- **Location:** `scripts/parsers/descriptors.js` — `deriveDescriptor` (:449), `deriveButton` (:304),
  `deriveIconAvatar` (:389), `DERIVERS` (:441), `emitDescriptorTs` (:588), plus the render block
  `:478-602` (`renderVal`/`renderNsBlock`/`renderNsInline`/`renderPartMapInline`/`renderAnatomy`/
  `renderStructureLines`/`renderVariantsLines`/`renderAxesType`/`descriptorHeader`) and the CSS-reading
  helpers `rulesInLayer`/`aliasMap`/`resolveSemantic`/`scaleLeaf`/`assertSurface`/`assertInteraction`/
  `typeStepFrom`/`stackFromRule`/`presentValues`/`pageParts` (:114-301) and the `SURFACE`/`VARIANT_ORDER`/
  `SIZE_ORDER`/`ALIGN_IN`/`JUSTIFY_IN` tables (:91-106).
- **What / PROOF of death:** `deriveDescriptor`/`emitDescriptorTs`/`deriveButton`/`deriveIconAvatar`
  are **never invoked** anywhere (grep for `(`-with-args across `scripts/`+`packages/` returns only
  the definitions and comments). The inputs they read — `lib/components/<name>/<name>.css` and
  `pages/components/<name>.html` — **no longer exist** in the tree (the infra-exit removed `lib/`,
  `pages/`, `build/`). Guard D itself confirms it: *"The B1 PARITY ORACLE … RETIRED with the recipe
  CSS at the L3c flip (decision 74)"* (`scripts/docs-drift.test.js:269-273`); Guard D now re-emits via
  `emitDescriptorJsFromSource` + pins the shape (`docs-drift.test.js:264-301`). `tokens-parser.js:82-83,
  166-167` still **imports and re-exports** the dead functions, but never calls them.
- **Invariant violated:** dead/vestigial — retired machinery the refactor left behind, in a file
  whose header (`descriptors.js:9-12`) still bills it as *"THE PARITY ORACLE"* reading source files
  that are gone. Exactly the "rot where no one looks" the audit targets.
- **Cause:** the L3c flip (descriptor became the SoT) and the infra-exit (paths relocated) retired
  the oracle's *role* and deleted its *inputs*, but never deleted the *code*.
- **Fix (cause-level):** delete the dead oracle block + its now-orphaned imports/re-exports in
  `tokens-parser.js`. Keep only the live passthrough path (`emitDescriptorTsFromSource`/
  `emitDescriptorJsFromSource`/`descriptorBody`/`exportNameFor`/`DESCRIPTOR_COMPONENTS`). ~300 lines.

#### D2 — orphaned registry fields `kind` / `fgPart` · **DEBT** · S1 (folds into D1)

- **Location:** `scripts/parsers/descriptors.js:60-61` (`kind:'button', fgPart:'label'` /
  `kind:'iconAvatar', fgPart:'icon'`).
- **What:** `kind` is read only at `:450` (`DERIVERS[spec.kind]`) and `fgPart` only at `:374,382,427`
  — all **inside the dead derivers** (D1). No live consumer.
- **Cause / Fix:** same as D1 — remove the fields when the oracle goes. Until then they're dead data
  that makes the registry look like it still drives a CSS derivation it doesn't.

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

#### D5 — a parallel, test-only descriptor→style resolution path · **DEBT (justified-but-costly)** · S2

- **Location:** `packages/rn/factory/resolve.ts:526-549` (`toUnistylesRecipe`/`recipeFor`), `:419-524`
  (`buildPartRecipe`), and the types `PartRecipe`/`ComponentRecipe`/`CompoundVariant` (:388-413).
- **What:** the **render path** uses `flattenPart` (`createNuriComponent.tsx:139,175`). The
  Unistyles-shaped recipe path (`toUnistylesRecipe`/`recipeFor`/`buildPartRecipe`) is a **second**
  full descriptor→style engine — and its only callers are the snapshot tests
  (`packages/rn/factory/__tests__/resolve.test.ts:86,179,210,269-281`). It is re-exported from
  `index.ts:21-22` but no production consumer imports it.
- **Invariant violated:** "one resolution path." Two engines resolve the same descriptors; they share
  primitives (`resolveNS`, `INTERACTIVE_OPTS`) but `buildPartRecipe` re-implements the variant /
  foreground / typeStep / compound-interactive assembly independently of `flattenPart`.
- **Verdict:** *justified* as a stated "Unistyles-compat proof" (`resolve.ts:23-26,384-386`), but it
  is a maintained parallel structure with its own drift surface — exercised only by snapshots, so a
  divergence from the real render path would never fail a *behaviour* gate. Not dead (snapshots run),
  but carrying its weight only as a proof.
- **Cause:** the §11 Unistyles recipe shape was built as a compat demonstration alongside the render
  engine rather than as a transform *of* it.
- **Connection to D11:** this isn't only dead-ish weight — `toUnistylesRecipe`'s `{base, variants}` IS
  the build-time-static resolved form the README promises and the runtime path re-derives every render
  (D11). The highest-value resolution is to **promote** it (codegen emits it, the factory loads it)
  rather than delete it — D5 and D11 close together.
- **Fix (cause-level):** either (a) promote it to the shipped build-time-static artifact (the D11 fix),
  making it the single resolved form both the snapshot and the render path read; or (b) if it's purely a
  future-Unistyles artifact, move it out of the shipped `index.ts` surface and label it a proof. (a) is
  preferred — it resolves D5 and D11 in one stroke.

#### D6 — `resolve-map.ts` `FILL` hardcodes RN property spellings in `@nuri/spec` · **RESOLVED** · S2

- **Status (2026-07-01):** resolved. `packages/spec/axes/resolve-map.ts` now models `fill` cases as
  neutral intents (`grow`, `shrink`, optional `basis`, optional `minInline`). RN spells those locally
  in `packages/rn/factory/resolve.ts` and the build-time bake mirrors that in
  `scripts/parsers/recipes.js`; web derives `flex` + `min-inline-size` in
  `packages/prototype/pipeline/parsers/namespace-css.js`.
- **Proof:** the generated namespace CSS, RN baked recipes, and RN snapshots remain byte-identical.
  The stack axis doc now intentionally shows the neutral fill intent instead of RN property fragments.

#### D7 — the component roster + public names are hand-restated across ≥5 sites · **DEBT** · S2

- **Location:** `scripts/parsers/descriptors.js:59-80` (`DESCRIPTOR_COMPONENTS`, incl. `public:`);
  `scripts/tokens-parser.js:218` (`BROWSER_DESCRIPTOR_COMPONENTS` — a second flat list of the same 6
  names); `scripts/docs-drift.test.js:174` (`EXPECTED_DESCRIPTORS` — a third); `packages/rn/factory/index.ts:83-119`
  (six `nuriNames('button'|'tab-bar-item'|…)` calls hand-restating the public kebab);
  `packages/prototype/recipes/*.js` (six `nuriNames('…').web` calls, a fourth restatement).
- **What:** the set of components and each component's public name live in no single place. The
  `descriptors.js` comment (`:52-58`) openly concedes the runtime bindings *"restate the same kebab …
  they cannot import this build-time registry across the zero-build web boundary — and mirror this
  table."* So a new component or a renamed public name must be edited in ~5 spots, cross-checked only
  partially (Guard D iterates `DESCRIPTOR_COMPONENTS` and throws if `EXPECTED_DESCRIPTORS[name]` is
  missing; `BROWSER_DESCRIPTOR_COMPONENTS` and the recipe/binding strings are not cross-asserted).
- **Invariant violated:** single-source-of-truth / no parallel structures.
- **Cause:** the zero-build web boundary (recipes can't import a build-time JS registry) plus the
  test/codegen split forced hand-mirroring instead of one exported roster.
- **Fix (cause-level):** export ONE roster (name + public) from a single module the codegen, the test,
  and the RN bindings all import; for the zero-build web recipes, **generate** their `nuriNames(...)`
  call (or a roster JSON) so the public name is never hand-typed twice. Folds naturally into SEED-2's
  rename (make `name === public`, then the roster is one column).

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

#### D11 — the RN factory resolves the STATIC namespaces at runtime, contradicting the documented build-time-static design · **DEBT** · S2

> Surfaced by operator review (the resolver-architecture question), alongside SEED-4. Where SEED-4 is
> about *colour* resolution doing too much, D11 is about *everything else* being resolved at the wrong
> time. They're the two halves of the same "the RN resolution architecture doesn't match the documented
> design" picture.

- **The documented design:** README:50-51 — *"Build-time resolves everything resolvable; runtime selects
  only the context-variant. Box, stack, typography, interactive are 100% static. Only colour varies by
  context."* README:57-58 — the RN provider's *"Default = a static resolved slice (zero runtime, max
  perf)."* README:61-62 — web composes via the CSS cascade (the browser resolves prebuilt classes).
- **What the code actually does:** the factory resolves **every** namespace at **runtime, on every
  render**. `flattenPart` (`resolve.ts:371-382`) → `resolveNS` (`:231-245`) → `applyFields`
  (`:90-128`) walks `STACK_FIELDS`/`BOX_FIELDS` and re-derives the ViewStyle each render;
  `createNuriComponent.tsx:139` calls it per part, and the Pressable style render-prop (`:174-179`)
  calls it **again on every press**. `box`/`stack`/`typography` touch **neither theme nor state** — they
  resolve to a constant — yet they're recomputed every time. There is **no** "static resolved slice,
  zero runtime" path; the implementation has only the full runtime resolver.
- **The asymmetry (the load-bearing point):** **web honours the design** — `box.css`/`stack.css` are
  *generated CSS* (build-time), the browser just applies classes, zero runtime resolution. **RN does
  not** — it re-resolves the same static geometry/layout at render. The two projections diverge on
  *when* resolution happens, despite the README claiming build-time-static for both. Only `palette`
  (theme · accent×mode) and `interactive` (transient pressed/disabled) are *genuinely* runtime — exactly
  the two the README says "vary by context." The other three are misplaced in time.
- **The kicker — the build-time form already exists and is discarded:** `buildPartRecipe`/
  `toUnistylesRecipe` (`resolve.ts:419-540`) already compute the resolved `{ base, variants }` ViewStyle
  matrix per part — *that is the build-time-static slice the README promises* — but it's **test-only**
  (D5). The codebase literally contains the precompute and throws it away, shipping the runtime resolver
  instead. D11 and D5 are the same waste seen from two sides.
- **Invariant violated:** the README's own "build-time resolves everything resolvable · runtime selects
  only colour · zero-runtime static slice" design. The implementation resolves everything at runtime.
- **Cause:** the RN factory was built as a single generic runtime interpreter (one `flattenPart` path
  for all five namespaces · genericity was the goal · `resolve.ts:1-26`) without splitting the
  build-static portion (box/stack/typography) out to codegen, the way the web projection's CSS emit
  already does.
- **Caveats (honest scoping):** (i) **box + stack** are cleanly build-time-bakeable. (ii)
  **typography** is static *today* but `typeStyle` (`theme.tsx:192`) does the relative→absolute multiply
  and is the reserved seam for `× fontScale` / Dynamic Type (P11) — so its *metrics* bake but the final
  multiply stays runtime; bake with that seam intact. (iii) the **open primitive layer**
  (`primitives.tsx` · View/Stack/Text) is *inherently* runtime (open props, not closed descriptors) —
  the bake applies to the **closed descriptor factory components**, not the primitives. (iv) this is an
  **architecture-fidelity + perf** finding, not a correctness bug — the runtime path produces correct
  output; it just does build-knowable work at render and doesn't deliver the promised zero-runtime slice.
- **Fix direction (depth deferred to the fix-brief):** codegen precomputes the static `box`/`stack`/
  `typography` ViewStyle per (component · part · axis-selection) into an `rn/generated/` artifact (the
  same projection-output stance as `palette.ts` — RN-shaped via the `.rn` spelling column, no
  agnosticism cost); runtime merges only the theme colour (`palette`) + state transients
  (`interactive`) on top. `toUnistylesRecipe`'s existing `{base, variants}` computation is the natural
  emit source (resolving D5 in the same stroke — promote the precompute from test-only to shipped). The
  factory's runtime path shrinks to "load the baked static slice, merge colour + state."

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
| **Naming coherence** | Guard D pins descriptor *shape/axes/parts*, never *names*; `nuriNames` derives correctly from whatever string it's *handed*. The hand-authored input strings are unchecked. | SEED-2, D7 | A test asserting `file basename === public`, and that every `nuriNames(x)` site's `x` ∈ the one exported roster. |
| **Type-surface honesty** | tsc passes — optional props that are ignored, and a `Partial<Record<string,string>>` hole, are all *type-valid*. | SEED-3 / D8 (resolved 2026-07-01) | **Landed:** generated per-descriptor RN adapters emit exact prop types from descriptor `api`; `Descriptor.defaults` is keyed/value-constrained by the descriptor axes; `@ts-expect-error` type fixtures pin both. |
| **Dead code** | An uninvoked export breaks nothing; the re-emit path doesn't touch it. | D1, D2 | A "no unused exports" pass (e.g. `knip`/`ts-prune`) over `scripts/` + `packages/rn`. |
| **Duplication / parallel structure** | Multiple hand-lists that *happen* to agree pass; only the cross-checked pair (D-roster ↔ EXPECTED) throws. | D5, D7 | One exported roster; assert the parallel lists are slices of it. |
| **Generated-doc accuracy** | The re-emit gate proves committed ≡ generator output; it **cannot** see that the generator's header *strings* name dead paths. | D3 (resolved 2026-07-01) | A check that paths cited in generated headers resolve on disk would prevent recurrence. |
| **Cross-projection parity** | The render-smoke renders but asserts no a11y props; expo-demo tsc accepts an ignored optional field. | D4 (resolved 2026-07-01) | **Landed:** RN renderer applies the decorative hide pair on root hosts and render-smoke asserts both the positive `IconAvatar` case and the non-decorative `Button` case. |
| **Wrong abstraction / redundant layer / resolution-at-the-wrong-time** | Redundant or mistimed resolution emits the *same output* — render-smoke renders identical pixels, the re-emit gate sees a faithful generator. No gate measures *when* resolution happens or whether the promised zero-runtime path exists. Over-engineering and runtime-vs-build placement are invisible to behaviour + drift. | SEED-4, D5, D11 | Mostly a design judgement (no clean mechanical guard). Partial signals: assert `theme.surface[v].bg === slice` deref (proves SEED-4's layer is a rename); assert the shipped static style ≡ `toUnistylesRecipe`'s `{base,variants}` (proves D11's runtime path duplicates the discarded precompute). |

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
3. **D1 + D2 · delete the dead oracle** — S2, ~M (mechanical, ~300 lines). Remove the oracle block +
   `kind`/`fgPart` + the orphan re-exports in `tokens-parser.js`. Re-run the `spec` gate (the live
   passthrough path is untouched → byte-identical emit). Add the **no-unused-exports** guard in the
   same brief so it can't regrow. **Independent.**
4. **SEED-2 + D7 · the naming/roster unification** — S2, ~M. Rename `composition-button`→`button`,
   `tab`→`tab-bar-item` (file · export · type), drop `public`/`source`, export one roster, generate or
   single-source the `nuriNames` sites. Touches spec, the RN bindings, the web recipes, all three
   roster lists, the snapshots. **Do after D1** (D1 shrinks `descriptors.js` first, making the rename
   surface smaller). Add the **naming guard**.
5. **SEED-1b + D6 · remaining spec agnosticism** — **RESOLVED (2026-07-01).** Regex TS-data loaders
   were replaced with the shared TypeScript transform, `fill` is neutral and spelled per projection,
   typography wrapper web realization moved to the prototype emitter, and the broad agnosticism lint
   landed.
6. **SEED-4 · theme colour-resolution indirection** — S2, ~M, *depth decision-gated*. Factory consumes
   the resolved slice; variant→role mapping becomes a typed static index; `resolveColor` /
   `RUNTIME_GROUPS` / the `NuriTheme.surface`/`.chrome` rebuild dissolve. Operator picks **full** vs
   **minimal** depth at brief time. Touches `resolve.ts` + `theme.ts` + the palette emit; pairs with the
   render-smoke `theme.surface === slice` assertion. Independent of the others; do after the S3 fixes.
7. **D11 + D5 · RN build-time-static resolution** — S2, ~L, *depth decision-gated*. Codegen precomputes
   the static box/stack/typography ViewStyle (per component · part · axis-value) into an `rn/generated/`
   artifact (source: `toUnistylesRecipe`'s `{base,variants}`); the runtime resolver shrinks to "load the
   baked slice, merge palette + interactive." Delivers the README's promised zero-runtime static slice
   and **resolves D5 in the same stroke** (the discarded precompute becomes the shipped artifact). Touches
   the codegen + `resolve.ts` + the factory; keep typography's `typeStyle`/fontScale seam (P11) intact;
   the open primitives stay runtime. The largest RN-side cleanup; sequence after SEED-4 (they share
   `resolve.ts`/`theme` surface — do the colour-resolution simplification first, then the build-time bake).

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
