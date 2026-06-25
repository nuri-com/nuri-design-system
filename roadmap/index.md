# Nuri · Roadmap

Session router. Each entry links to its detail file.

## Remaining road (the plan · N+33)

The token-SoT inversion is DONE (descriptors B1 · dimensions [§71](../decisionlog.md) · colour [§72](../decisionlog.md)). The **L3 namespace flip** is DONE (L3c flipped it live · [N+38](./N+38-L3c-flip.md) · [decision 74](../decisionlog.md)) — box/stack ([N+30](./N+30-L3.1.md) shadow) + palette ([N+33](./N+33-L3b-palette.md) shadow) + interactive ([N+34](./N+34-L3b-interactive.md) shadow) + typography ([N+35](./N+35-L31b-typography.md) shadow) proven — **all 5 axis shadows are now DONE**. The axis taxonomy is **2 agnostic (`stack` · `box`) + 3 bespoke (`typography` · `palette` · `interactive`)** ([decision 73](../decisionlog.md) · corrects decision 70's "3 agnostic").

**The L3 axis shadows** ✓ COMPLETE (reversible · each proves an emit ≡ the hand CSS):
- **L3b·2 · `interactive`** ✓ shadow proven ([N+34](./N+34-L3b-interactive.md)) — the second bespoke axis (the gated `:active`/`:disabled`/`:focus` effects · the equal-specificity `transform` order proven in the node harness AND the real browser, not just static computed-style).
- **L3.1b · `typography`** ✓ shadow proven ([N+35](./N+35-L31b-typography.md)) — the third / LAST bespoke axis (the palette/interactive pattern · [decision 73](../decisionlog.md) · its own SoT + emitter · the WRAPPER `{muted, align}` only — a real `<nuri-typography>` element with a SHELL, unlike merged-node palette/interactive · the interactive order-sensitivity recurs on `display`). The type SCALE `{size, emphasis}` (`--nuri-type-*`) stays CSS-SoT (a later token flip).

**The flip ✓ LANDED ([N+38](./N+38-L3c-flip.md) · [decision 74](../decisionlog.md)):** the generated axis CSS is live (regenerated in place by `npm run build`) · the 3 descriptor recipes' CSS retired + their JS is factory-backed · the factory is the sole web renderer · the pages repointed · the L3.1 Guard-D gap closed (new Guard E) · the web-factory render gate is `demo.html` + the per-axis computed-checks (132 checks · 0 fails). **[decision 2](../decisionlog.md) is reversed for the namespace layer — the refactor's SUBSTANCE is DONE.**

**What remains (organizational + the long tail · parked):**
- **final** — home the axis SoTs (`resolve-map.ts` [left transitional in `@nuri/rn` at the flip] · `palette-surface.ts` · `interactive-effects.ts` · `typography-axis.ts`) into `@nuri/spec` (the [decision 68](../decisionlog.md) `rn → spec` DAG) · extract the **property-spelling registry** ([decision 73](../decisionlog.md) cl. 2) · re-source `build/palette.ts` from the TS table.

**After the inversion (parked · separate arcs):** the **package carve** ([decision 68](../decisionlog.md)'s 6 packages · now near-mechanical — L3c leaves coherent folders) · the remaining **token residues** (type-scale · `--nuri-border-*` · fonts → TS) · the **descriptor arc** (descriptors for the other ~16 hand-composed components → their recipe CSS retires · "everything is a composition of axes") · the **fidelity first-bump** (R1.5 defaults · stringly-boolean axes · `subtle` · topbar title-type).

## Current state

N+38 · **L3c · the flip (decision 2 reverses for the namespace layer · the recipe layer retires)** — the one irreversible step of [decision 70](../decisionlog.md)'s cascade and the END of the refactor's SUBSTANCE (on branch `feat/n38-l3c-flip` · base `main` @ `0dfa4d2` · [decision 74](../decisionlog.md) · as-built [`N+38-L3c-flip.md`](./N+38-L3c-flip.md)). The 5 namespace-CSS shadows (N+30→N+35 · all proven ≡ hand) went LIVE: [`pipeline/css-preview.js`](../packages/spec/pipeline/css-preview.js) gained `flipNamespaceCss` — wired into `npm run build` via a new namespace-CSS slice in [`tokens-parser.js`](../packages/spec/pipeline/tokens-parser.js) (after the Slice-0 token flips it reads for the scale vocab · before Slice 8) — it regenerates `lib/components/{box,stack,palette,interactive,typography}/<ns>.css` **IN PLACE**; the hand namespace CSS retired (the generator is the SOLE source) and `build/css-preview/` (the shadow dir) was deleted. The 3 recipe ELEMENTS are now **FACTORY-BACKED** ([`lib/runtime/factory.js`](../packages/spec/lib/runtime/factory.js) · the S3/S4 engine · now the SOLE web renderer): `button`/`icon-avatar` = thin `connectedCallback → buildComponent → mount` modules (self-importing their primitive deps · idempotent define-guards on `pressable`/`view`/`typography`); `topbar` = **apply-NS-to-host** (operator-chosen · the open-view factory can't place leading/pivot/trailing positional children, so it applies the descriptor's namespaces to the existing `<nuri-topbar>`/`<nuri-topbar-content>` via the factory's now-exported `mergedNSForPart`+`mergeAttrs`). The recipe CSS (`button`/`icon-avatar`/`topbar`) DELETED; `reset.css` linked where the factory button mounts; the active pages repointed (recipe-CSS dropped · recipe JS module-ized · namespace CSS ensured). **[decision 2](../decisionlog.md) reverses for the namespace layer** (git-recoverable · §74). The **B1 descriptor parity oracle RETIRED** (Guard D's `deriveDescriptor(CSS)≡authored` · no recipe CSS to derive from · exactly the "until B2 generates the CSS" boundary [decision 69](../decisionlog.md) named — the descriptor is now the sole SoT, kept honest by Guard F + the authored-IR pins); the 4 shadow tests → re-emit ≡ committed; Slice 8's `derivePalette` recipe-CSS cross-checks (A/B/C) dropped (redundant with `palette.css`+`typography.css` · `build/palette.ts` cells byte-identical); the **L3.1 Guard-D shorthand/longhand gap CLOSED** (new Guard E · the box padding source-order precedence · the hand oracle that masked it is gone). **`resolve-map.ts` left transitional** (in `@nuri/rn` · read cross-package · relocation deferred to `final`). KNOWN GAPS (first-bump backlog · accepted): topbar `inset`/title-type · icon-avatar `fill` (the render gate exercises NONE) · a dead-code tail (the per-component `@layer tokens` resolver · cleanup deferred). Gates green LOCALLY: **spec 71/71** · **rn 27/27 + 7 snapshots** · **rn + expo tsc 0** · `git diff packages/spec/build/` = only the 5 regenerated namespace CSS + the `build/palette.ts` header comment (every other artifact byte-identical). Render gate ([`demo.html`](../packages/spec/pages/playground/demo.html) · preview MCP · `nuri-docs` :8766): all 3 descriptors (Button 3×3 · IconAvatars · Topbar) + the primitive card render via the **factory + generated namespace CSS** · **console clean** (all 7 custom elements defined · no double-define) · light/dark × neutral/lilac re-resolve · visually ≡ pre-flip. The 4 per-axis browser computed-checks repointed to the live `lib/components` CSS · **42 cells · 132 checks · 0 fails**. The git opener: the A3 carve (N+37 · uncommitted on `feat/n37-prototype-carve`, which had moved `factory.js`+recipes OUT of spec and blocked the flip) was committed to its branch (`88da5d3` · recoverable) so the flip could land clean in spec. **The refactor's SUBSTANCE is DONE** — decision 2 is reversed for the token + descriptor + namespace layers; what remains is organizational (the carve · `final`) + the long tail. See [`roadmap/N+38-L3c-flip.md`](./N+38-L3c-flip.md) · [`decisionlog.md` §74 / §70 / §2](../decisionlog.md).

N+36 · **legacy archive + minimal demo bench (convergence phase 1)** — quarantine the pre-axes hand recipes so the active tree is exactly **{primitives + the 3 descriptor recipes}** (button · icon-avatar · topbar) and everything else is frozen (on branch `feat/n36-legacy-archive` · base `main` @ `773554e` · [PR #64](https://github.com/nuri-com/nuri-design-system/pull/64) · [decision §64](../decisionlog.md) the open-primitive / closed-recipe taxonomy · as-built [`N+36-legacy-archive.md`](./N+36-legacy-archive.md)). **`git mv` (100% renames · history preserved)** the **9 pre-axes hand recipes** (icon-button · list · list-item · list-interactive-item · nav-item · switch · tab-bar · tabs · typography-stack) + their **7 doc pages** + the **2 playground compositions** (my-vault · composition-prototype) → [`packages/spec/legacy/`](../packages/spec/legacy/) (frozen · not gated · not doc-genned · not a dependency · `legacy/README.md` · relocates into `@nuri/prototype` at the carve · [package-architecture §3.2/§3.5](../docs/package-architecture.md) · **my-vault = the rebuild spec**). New [`pages/playground/demo.html`](../packages/spec/pages/playground/demo.html) = the **active-set-only bench** (Topbar · Button variants×sizes · IconAvatars · a box+stack+typography+icon card · a live theme/accent toggle · the future **factory-parity bench at the flip**). **REVERSIBLE · [decision 2](../decisionlog.md) UNTOUCHED · no decision opened · nothing live.** Active-reference sweep (NO emitter / generation / pipeline-logic touched): the `COMPONENTS` `@layer tokens` walk trimmed **21→12** (**build-output-NEUTRAL** — the walk feeds only the build LOG; the TokenPath union derives from `classifiedGroups`, not the walk · proven by byte-identical `build/`) · removed the icon-button / tab-bar `resolveComponentValue` dispatch sub-tests (Button already covers every dispatch KIND) · the nav ([`shell.js`](../packages/spec/lib/docs/shell.js)) · [`llms.txt`](../llms.txt) · the playground index card (my-vault→demo) · 3 prose cross-links (separator / icon-avatar / button) · the dead loaders in palette.html / topbar.html. **Topbar does NOT bake icon-button** (leading/trailing are positional slotted children · §64) → archiving breaks neither the topbar component nor its descriptor (`build/descriptors/topbar.ts` byte-identical). Gates green LOCALLY + on CI (#64): **spec 70/70** · `git diff --exit-code packages/spec/build/` **byte-identical** · **rn 27/27 + 7 snapshots** · **rn + expo-demo tsc 0** · `grep -rl 'legacy/' packages/spec/{pipeline,lib,styles,pages,build}` = **0**. Visual checkpoint (preview MCP · `nuri-docs` :8766): demo.html renders the 3 descriptors + the primitive card · **console clean** · the Dark+Lilac toggle re-resolves the semantic cascade. **Backlog (this session · LOG-only · P11)**: topbar.html / palette.html stay active but their archived-component demos render **inert** (the dead loaders are gone, the markup left · no gate / `legacy/` impact) — re-home onto active components (doc-cleanup). **Next** (re-sequences the N+33 *Remaining road* plan above — the §9-independent extraction now lands FIRST · [package-architecture §6](../docs/package-architecture.md)): the **`@nuri/prototype` carve** (factory + web primitives + CSS + demo out of `spec`) → then the **dec-2 flip** (generated CSS live · the factory the sole renderer · retire the 3 descriptor recipes) → **`spec` → pure data** (icon = SVG folder + a generic descriptor · the pipeline to its per-library home) → the **ledger purge** (input = the archived list). See [`roadmap/N+36-legacy-archive.md`](./N+36-legacy-archive.md) · [`docs/package-architecture.md` §3 / §6](../docs/package-architecture.md) · [`decisionlog.md` §64 / §2](../decisionlog.md).

N+35 · **L3.1b · generate the typography namespace CSS from a TS SoT (the third / LAST bespoke axis · reversible shadow)** — the L3.1 / palette / interactive shadow discipline applied to **typography**, finishing the L3 axis shadows (on branch `feat/n35-l31b-typography-namespace-css` · base `main` @ `f6da8c9` · [decision 70](../decisionlog.md)'s cascade · [decision 67](../decisionlog.md) / [decision 73](../decisionlog.md) the bespoke axes · [`docs/cascade.md`](../docs/cascade.md) L3 · as-built [`N+35-L31b-typography.md`](./N+35-L31b-typography.md)). A new emitter ([`pipeline/parsers/typography-css.js`](../packages/spec/pipeline/parsers/typography-css.js)) consumes a hand-authored TS **axis** ([`pipeline/typography-axis.ts`](../packages/spec/pipeline/typography-axis.ts) · the bespoke SoT) and generates the `nuri-typography` ELEMENT dispatch CSS — the shell (`display:inline` base + the `:not(:defined)` skeleton) + `nuri-typography[data-muted] { color }` + `nuri-typography[align="v"] { display:block; text-align:v }`. Generates to a SHADOW [`build/css-preview/typography.css`](../packages/spec/build/css-preview/typography.css); a committed harness ([`pipeline/typography-css.test.js`](../packages/spec/pipeline/typography-css.test.js)) proves it **EQUIVALENT to the hand [`lib/components/typography/typography.css`](../packages/spec/lib/components/typography/typography.css)** (the parity oracle). **REVERSIBLE SHADOW · SHADOW ONLY** — flips/retires NOTHING: the live web factory + pages still load the hand CSS, the recipe layer (L3c) untouched, the **RN factory (`typeStyle`)** + `typography.js` untouched, `tokens-*.css` (L2) + the type-scale foundation (`styles/typography.css`) untouched, nothing repointed. **[decision 2](../decisionlog.md) STANDS · no decision opened** (decision 70 locks the model · the dec-2 reversal + the SoT flip are L3c · the L3.1 / palette / interactive posture). **THE SCOPE LINE (the critical sub-decision · the brief §5)**: the typography axis splits — `{muted, align}` → THIS wrapper emit; **`{size, emphasis}` → the type SCALE** (`styles/typography.css` · the `.nuri-type-{step}` utilities → `--nuri-type-*` primitives) + `typography.js` at runtime — an L1/L2 TOKEN layer still CSS-SoT ([decision 71](../decisionlog.md)/[72](../decisionlog.md) · **a separate later token flip · OUT of scope** · the SoT authors NO `--nuri-type-*` / `.nuri-type-{step}`). **typography is bespoke-but-single-sourced** ([decision 67](../decisionlog.md) / [73](../decisionlog.md)) — NOT a Field-table member (`resolve.ts` treats it as a type-STEP ref, not a ViewStyle prop), so this did NOT touch `namespace-css.js`; its own small emitter, like palette/interactive. **TWO ways typography diverges from palette/interactive**: (1) **the ELEMENT + a SHELL** — palette/interactive are MERGED-NODE (the `.nuri-<ns>` class on the painting node · no element/shell); typography is a real `<nuri-typography>` element with a SHELL (base + `:not(:defined)`) like box/stack — so every selector is the ELEMENT `nuri-typography…` (no leading dot) and the emit carries the shell (emitter-owned · mirrored from hand · parametrized by the SoT's `element` · the box/stack `SHELLS` precedent); (2) **the ORDER recurs on `display`** — `display` is set by the base (`inline`·(0,0,1)), `:not(:defined)` (`inline`·(0,1,1)), and the 3 `[align]` (`block`·(0,1,1)); base loses to align by SPECIFICITY, but `:not(:defined)` vs `[align]` are **EQUAL specificity (0,1,1)** → a pre-upgrade aligned node matches BOTH, so `display` resolves by SOURCE ORDER; the emit is shell-FIRST so `[align]`'s `block` wins (text-align takes effect even before `typography.js` upgrades). **The SoT shape** (the surfaced sub-decision): a single `axis = { element, dispatch: { name, attr, decls }[] }` object (mirrors palette's single `surface` export); the align family ENUMERATED (3 explicit rules · the emitter a serializer · the interactive precedent); the two attr FORMS spelled in the SoT — `[data-muted]` PRESENCE (a reflected attr · [decision 53](../decisionlog.md)) vs `[align="v"]` EQUALITY (a plain prop-driven HTML attr · [decision 59](../decisionlog.md) · no JS reflection). **The SoT-vs-shell line**: the shell (base + `:not(:defined)`) is EMITTER-owned (NOT the SoT · the box/stack split), the dispatch (muted + align) is the SoT. **Four guards / five `test()`s** (the L3.1 / palette / interactive pattern · adapted): **A** structural ≡ + the ELEMENT-wrapper shape (`^nuri-typography(?:[:[]|$)` · NOT a `.nuri-` class · the shell IS present) · **B** re-emit freshness · **C** resolved-value — the muted token `var(--nuri-text-muted)` is THEME-cascaded chrome (light/dark · accent-INVARIANT · scope-dependent like palette), so reuse the **colour-cascade walk** (`resolveSemanticCrossProduct` · NOT keep-last) at `[neutral][light]`: two tests — bottoms-out (exactly 1 var + 8 literal decls) + a restated design oracle (`--nuri-text-muted` @ neutral/light = cream-11-light **`#666455`** · accent-invariant), the dark value (`#b7b4a4`) deferred to the browser · **D** order-soundness (the centerpiece · the interactive pattern, here on `display`): (a) for every property set by >1 selector (`display`:5 · `text-align`:3) the generated source order == the hand oracle's; (b) the display pair — `:not(:defined)` (`inline`) before all 3 `[align]` (`block`), EQUAL specificity (a `specificityB` that correctly scores `:not(:defined)`=(0,1,1) per CSS Selectors L4 · `:not(` contributes nothing, its `:defined` arg does), both co-matching a pre-upgrade aligned node + base dominated by specificity. **Proven non-tautological** (both reverted): reordering the emit (dispatch before shell · regenerated so the shadow stayed fresh) → ONLY **Guard D** bit (A+B+C correctly green · proving A's order-insensitive ≡ cannot catch order); a bogus token (`--nuri-text-bogus`, not regenerated) bit **A + B + C** (D green · order unaffected). **Computed-style (real browser · preview MCP · `nuri-docs` :8766)**: **7 cells · 20 checks · 0 fails · console clean** — generated ≡ hand AND ≡ the restated oracle. **NATIVE only** — no proxy needed (the contrast with interactive's `:active`): `:not(:defined)` is a REAL pre-upgrade state (the page never registers the element), so the equal-specificity display conflict resolves on the EXACT generated bytes. **THE scope anchor**: `<nuri-typography data-muted>` under a `[data-theme=dark]` ancestor → `color` **`rgb(183, 180, 164)`** (`#b7b4a4` · the deferred dark value · the accent cell proves invariance: `rgb(102, 100, 85)` under `[data-accent=lilac]` too). **THE ★ order cell**: a pre-upgrade `<nuri-typography align="start">` → `display` **`block`** (the `[align]` rule wins by SOURCE ORDER); the **contrast cell** (no align) → **`inline`** (proving `:not(:defined)` genuinely sets inline, so align's `block` is a real source-order override). `loadAxis` reuses [`dimension-css.js#stripTypes`](../packages/spec/pipeline/parsers/dimension-css.js) (one strip impl · [decision 48](../decisionlog.md)). Gates green LOCALLY: **spec 70/70** (65 + 5 new) · `git diff packages/spec/build/` = **only the new `build/css-preview/typography.css`** (every pre-existing artifact byte-identical · the runner is NOT in `npm run build` · the foundation `styles/typography.css` untouched) · **rn 27/27 + 7 snapshots** · **tsc 0/0** (inert — no consumer / no `typeStyle` touched). **Sub-decisions surfaced** (operator-confirm if load-bearing): the scope line (the type SCALE is OUT · above) · the SoT shape (above) · the SoT-vs-shell split (shell = emitter-owned · the box/stack model) · Guard C = the colour-cascade walk (not the interactive bottoms-out shortcut · the muted token is theme-cascaded) · the browser order cell = NATIVE (no proxy · `:not(:defined)` is real) · harness helpers COPIED not extracted (`specificityB` ADAPTED for `:not(:defined)`) · `typography-axis.ts` homed in `pipeline/` beside palette/interactive/dimensions/colours. **Carry-forward (L3c / later · LOG-only · P11)**: the **type-scale token flip** (`{size, emphasis}` / `--nuri-type-*` → TS · a later TOKEN slice like dimensions/colour · NOT this) · the property-spelling registry ([decision 73](../decisionlog.md) cl. 2 · typography's direct mechanism-divergent props) · the L3.1 Guard-D shorthand/longhand gap + the web-factory no-harness gap stay open (UNRELATED · typography has no shorthand/logical families) · `@nuri/spec` has no tsconfig so the `as const satisfies` is author-time only. **All 5 axis shadows are now DONE.** Next: **web-factory harness** (close the no-harness gap before the factory is sole renderer · the load-bearing L3c prerequisite) · **L3c** (the flip — wire the generated axis CSS live · retire the recipe layer · the factory as sole web renderer · [decision 2](../decisionlog.md) fully reverses for the namespace layer). See [`roadmap/N+35-L31b-typography.md`](./N+35-L31b-typography.md) · [`roadmap/N+34-L3b-interactive.md`](./N+34-L3b-interactive.md) · [`docs/cascade.md`](../docs/cascade.md) · [`decisionlog.md` §70 / §67 / §73 / §2](../decisionlog.md).

N+34 · **L3b·2 · generate the interactive namespace CSS from a TS SoT (the second bespoke axis · reversible shadow)** — the L3.1 / palette shadow discipline applied to **interactive** (on branch `feat/l3b-interactive-namespace-css` · base `main` @ `c1d291a` · [decision 70](../decisionlog.md)'s cascade · [decision 67](../decisionlog.md) / [decision 73](../decisionlog.md) the bespoke axes · [`docs/cascade.md`](../docs/cascade.md) L3 · as-built [`N+34-L3b-interactive.md`](./N+34-L3b-interactive.md)). A new emitter ([`pipeline/parsers/interactive-css.js`](../packages/spec/pipeline/parsers/interactive-css.js)) consumes a hand-authored TS **EFFECT set** ([`pipeline/interactive-effects.ts`](../packages/spec/pipeline/interactive-effects.ts) · the bespoke SoT) and generates the `.nuri-interactive[gate]:state` dispatch CSS — the **inverse-spelling of `flattenPart`** ([resolve.ts](../packages/rn/factory/resolve.ts)): the RN path realizes the opt-in as STATE PATCHES (`state.pressed && interactive.pressScale → style.transform = scale`), this writes the pseudo-class rules the cascade resolves. Generates to a SHADOW [`build/css-preview/interactive.css`](../packages/spec/build/css-preview/interactive.css); a committed harness ([`pipeline/interactive-css.test.js`](../packages/spec/pipeline/interactive-css.test.js)) proves it **EQUIVALENT to the hand [`lib/components/interactive/interactive.css`](../packages/spec/lib/components/interactive/interactive.css)** (the parity oracle). **REVERSIBLE SHADOW · SHADOW ONLY** — flips/retires NOTHING: the live web factory + pages still load the hand CSS, the recipe layer (L3c) untouched, the **RN factory (`flattenPart`)** untouched, `tokens-*.css` (L2) untouched, nothing repointed. **[decision 2](../decisionlog.md) STANDS · no decision opened** (decision 70 locks the model · the dec-2 reversal + the SoT flip are L3c · the L3.1 / palette posture). **One structural note vs palette**: interactive is **not a SoT today** — there is NO `build/interactive.ts` and `interactive.css` emits NOTHING into the build (the `COMPONENTS` walk excludes it · the `pressable.css` precedent); it is pure web realization + the RN `flattenPart` transients, so there is **no `build/*.ts` to re-source** (unlike palette's `build/palette.ts`). **interactive is bespoke-but-single-sourced** ([decision 67](../decisionlog.md) / [73](../decisionlog.md)) — NOT a Field-table member, so this did NOT touch `namespace-css.js`. **The SoT shape** (the surfaced sub-decision): the 5-effect set `{ name, on: SelectorPart[], decls: [prop, value][] }`, `SelectorPart = { attr?, state? }` (the gate `[data-press-scale]`/`[aria-disabled="true"]` + the pseudo `:active`/`:focus-visible`/`:disabled`); `disabledOpacity`'s two-selector comma rule falls out of `on` being a list. **The SoT-vs-shell line** (the thinnest axis): the SoT carries the decls VERBATIM (no value transform — unlike palette's role→`var()` or dimensions' `{ref}`→`var()`; the interaction constants are consumed directly · [decision 45](../decisionlog.md)), so the emitter's only "derivation" is the SELECTOR ASSEMBLY. **NO shell** (merged-node · no `<nuri-interactive>` element · the class lands on the node); empty `@layer tokens` mirrored. **pressColor NOT emitted here** (it is PALETTE's `:active` bg swap · `palette.css` · the clean §6 split). **THE LOAD-BEARING ORDER** (the centerpiece · the brief §5): `transform` is set by BOTH pressScale (`[data-press-scale]:active`) AND disabledGuard (`[aria-disabled="true"]:active`) at **EQUAL specificity (0,3,0)** — a `[data-press-scale][aria-disabled="true"]:active` node matches both, so the cascade resolves by SOURCE ORDER; pressScale MUST emit before disabledGuard so `transform: none` wins (a disabled control never scales). This is the L3.1 Guard-D order-sensitivity gap, **here LIVE not latent** (palette had no equal-specificity same-property pair → its structural ≡ was a complete proof; interactive's is necessary but NOT sufficient). **Five guards** (the L3.1 / palette pattern): **A** structural ≡ + the merged-node `.nuri-interactive`-class shape (`declSig` whitespace-normalizes · the hand `transition` wraps two lines) · **B** re-emit freshness · **C** resolved-value — SIMPLER than palette (the `--nuri-interaction-*` / `--nuri-duration-fast` refs are `:root` constants → `buildVarMap` keep-last is FINE, no colour-cascade walk), two tests: every embedded var ref bottoms out (EXTRACTED from compound values — `transition`/`outline`/`scale()` — the one delta from palette's pure-`var(--x)` paints) + the scope-invariant constants resolve to a restated oracle (`120ms`/`0.97`/`0.4`; `focus-ring` is light/dark → bottoms-out-at-a-hex only, the exact value is the browser's) · **D** order-soundness (the centerpiece · palette's Guard D does NOT transfer): (a) for every property set by >1 selector, the generated source order == the hand oracle's; (b) the transform pair — exactly two rules, `scale()` FIRST + `none` SECOND, equal-specificity (so order, not specificity, decides), both co-matching the conflict node. **Proven non-tautological**: reordering the SoT (disabledGuard before pressScale) bit D + B while A + C stayed correctly green (the order guard catches what order-insensitive ≡ cannot); a bogus token ref bit C + A + B while D stayed green; both reverted. **Computed-style (real browser · preview MCP · `nuri-docs` :8766)**: **6 cells · 16 checks · 0 fails · console clean** — generated ≡ hand AND ≡ the restated oracle. Two passes: NATIVE (the real un-rewritten CSS · affordance `cursor: pointer` · `disabledOpacity` via a real `<button disabled>` + `[aria-disabled="true"]` → `opacity: 0.4`) + PROXY (`:active`/`:focus-visible` via a documented specificity-preserving rewrite `:active → [data-x-active]` · identical on gen + hand · so the equal-specificity order resolution is faithfully measured). **THE ★ order cell**: a `[data-press-scale][aria-disabled="true"]` node in `:active` resolves `transform` to **`none`** (disabledGuard wins by source order); the **contrast cell** (press-scale, NOT disabled) resolves to **`matrix(0.97, 0, 0, 0.97, 0, 0)`** — proving the scale applies and `none` is genuinely the disabled-guard overriding it (a transition-settle wait reads the TARGET, not a mid-interpolation frame · zero CSS mutation); the focus cell resolves `outline: 2px solid rgb(174, 145, 255)` (lilac-8-light). `loadEffects` reuses [`dimension-css.js#stripTypes`](../packages/spec/pipeline/parsers/dimension-css.js) (one strip impl · [decision 48](../decisionlog.md)). Gates green LOCALLY: **spec 65/65** (60 + 5 new) · `git diff packages/spec/build/` = **only the new `build/css-preview/interactive.css`** (every pre-existing artifact byte-identical · the runner is NOT in `npm run build`) · **rn 27/27 + 7 snapshots** · **tsc 0/0** · **expo-demo tsc 0** (inert — no consumer / no `flattenPart` touched). **Sub-decisions surfaced** (operator-confirm if load-bearing): the SoT shape (above) · the order-guard approach = **BOTH** (the node order guard [the CI gate · airtight by CSS-cascade semantics] AND the browser computed-style cell [the gold standard]) · the browser `:active` **proxy** (a faithful, specificity-/order-preserving device · the native pass anchors the rest on the exact bytes) · harness helpers (`layerRuleMap`/`declSig`) COPIED not extracted (new `orderedDecls`/`propSelectorOrder`/`specificityB` are interactive-local · the order guard needs source order + specificity) · `interactive-effects.ts` homed in `pipeline/` beside palette/dimensions/colours (relocated at the carve). **Carry-forward (L3c · LOG-only · P11)**: the property-spelling registry ([decision 73](../decisionlog.md) cl. 2 · interactive's mechanism-divergent props) · the L3.1 Guard-D shorthand/longhand gap + the web-factory no-harness gap stay open (UNRELATED · interactive has no shorthand/logical families) · `@nuri/spec` has no tsconfig so the `as const satisfies` is author-time only · NO `build/interactive.ts` to re-source (the L3c flip makes the SoT live + retires the hand CSS). Next: **L3.1b** (typography · the last bespoke axis) · **web-factory harness** · **L3c** (the flip). See [`roadmap/N+34-L3b-interactive.md`](./N+34-L3b-interactive.md) · [`roadmap/N+33-L3b-palette.md`](./N+33-L3b-palette.md) · [`docs/cascade.md`](../docs/cascade.md) · [`decisionlog.md` §70 / §67 / §73 / §2](../decisionlog.md).

N+33 · **L3b·1 · generate the palette namespace CSS from a TS SoT (the first bespoke axis · reversible shadow)** — the L3.1 shadow discipline applied to **palette** (on branch `feat/l3b-palette-namespace-css` · [decision 70](../decisionlog.md)'s cascade · [decision 67](../decisionlog.md) the bespoke axes · [`docs/cascade.md`](../docs/cascade.md) L3 · as-built [`N+33-L3b-palette.md`](./N+33-L3b-palette.md)). A new emitter ([`pipeline/parsers/palette-css.js`](../packages/spec/pipeline/parsers/palette-css.js)) consumes a hand-authored TS **SURFACE role table** ([`pipeline/palette-surface.ts`](../packages/spec/pipeline/palette-surface.ts) · the bespoke SoT) and generates the palette `[data-*]` dispatch CSS — the **inverse-spelling of `resolvePalette`** ([resolve.ts](../packages/rn/factory/resolve.ts)): the rest pair `.nuri-palette[data-variant|chrome="v"] { background; color }` + the pressed `[data-press-color]:active` bg swap. Generates to a SHADOW [`build/css-preview/palette.css`](../packages/spec/build/css-preview/palette.css); a committed harness ([`pipeline/palette-css.test.js`](../packages/spec/pipeline/palette-css.test.js)) proves it **EQUIVALENT to the hand [`lib/components/palette/palette.css`](../packages/spec/lib/components/palette/palette.css)** (the parity oracle). **REVERSIBLE SHADOW · SHADOW ONLY** — flips/retires NOTHING: the live web factory + pages still load the hand CSS, the recipe layer (L3c) untouched, `build/palette.ts` still derived from the hand CSS ([`palette.js`](../packages/spec/pipeline/parsers/palette.js) · byte-identical), `tokens-*.css` (L2) untouched, nothing repointed. **[decision 2](../decisionlog.md) STANDS · no decision opened** (decision 70 locks the model · the dec-2 reversal + the SoT flip are L3c · exactly the L3.1 posture). **palette is bespoke-but-single-sourced** ([decision 67](../decisionlog.md)) — NOT a Field-table member, so this did NOT touch `namespace-css.js`; the kitchen-sink (forcing it into the generic table) declined. **The SoT shape** (the surfaced sub-decision): `variant → { bg?, fg, pressed? }` + `chrome → { bg?, fg }`, a paint = bare L2 role NAME (→ `var(--nuri-<role>)`) `| { literal }` (the `transparent` exception · the `dimensions.ts` ref-vs-literal split); the THREE irregularities modelled by SHAPE — fg-only `subtle` → optional `bg` (decision 50) · no-pressed chrome+subtle → optional `pressed` · ghost's transparent → `{ literal }`. **NO shell** (palette is MERGED-NODE · no `<nuri-palette>` element, no `:not(:defined)`, no base rule — the class lands on the painting node); empty `@layer tokens` mirrored. **No logical→physical, no shorthand/longhand overlap** (`background` shorthand + `color` are DIRECT, disjoint) → **Guard A structural ≡ IS the complete computed-style proof** (the box-padding gap that dogs L3.1's Guard D does not exist here). The accent×theme cascade rides the EXISTING `[data-accent]` scope (the [decision 63](../decisionlog.md) `#4b/#6b` self-scope in `tokens-semantic.css` · N+32 · **NOT reproduced**). **Five guards** (the L3.1 pattern · **two ADAPTED** per the brief): **A** structural ≡ + the merged-node `.nuri-palette`-class shape · **B** re-emit freshness · **C** resolved-value — L3.1's `buildVarMap` keep-the-last-decl is WRONG for the cascaded colour vars (it'd grab dark/lilac), so this reuses the `colour-semantic.test.js` live-cascade walk indexed at the DEFAULT scope `[neutral][light]` (every paint bottoms out at a real hex + the transparent literal + a restated design oracle) · **D** order-soundness — L3.1's "one data-attr per property" does NOT transfer (`background` is dispatched by variant AND chrome AND rest-vs-pressed), so the real argument is asserted: (a) every rest rule keys on one `[data-variant|chrome]` attr (variant XOR chrome → at most one paints a node) + (b) each pressed rule is a STRICT specificity superset ((0,4,0) > (0,2,0) → wins by specificity, not order). **Proven non-tautological**: a role swap bit A/B/C-oracle (bottoms-out + D stayed correctly green); a broken pressed selector bit D; both reverted. **Computed-style (real browser · preview MCP · `nuri-docs` :8766)**: **9 cells · 34 checks · 0 fails** — generated ≡ hand AND ≡ the restated cream/lilac oracle across default/dark-ancestor/lilac scopes, anchored by **the dec-63 self-scope** (`[data-variant=solid][data-accent=neutral]` under a `[data-theme=dark]` ANCESTOR → `--nuri-accent-solid` resolves **cream-1-light `rgb(255,253,242)`** · the swap CTA paints cream on dark · matching N+32). `loadSurface` reuses [`dimension-css.js#stripTypes`](../packages/spec/pipeline/parsers/dimension-css.js) (one strip impl · [decision 48](../decisionlog.md) · the descriptor-twin / L3.1 / N+31 / C1 / C2 data:-URL technique). Gates green LOCALLY: **spec 60/60** (55 + 5 new) · `git diff packages/spec/build/` = **only the new `build/css-preview/palette.css`** (every pre-existing artifact byte-identical incl. `palette.ts` + `tokens.ts` · the runner is NOT in `npm run build`) · **rn 27/27 + 7 snapshots** · **tsc 0/0** · **expo-demo tsc 0**. **Sub-decisions surfaced** (operator-confirm if load-bearing): the SoT shape (above) · `palette-surface.ts` homed in `pipeline/` beside dimensions/colours (relocated at the carve · no cross-package shim — authored fresh, unlike L3.1's `resolve-map.ts`) · harness helpers (`layerRuleMap`/`declSig`) COPIED not extracted (the L3.1 file untouched · extraction is an L3c cleanup). **Carry-forward (L3c · LOG-only · P11)**: re-source `build/palette.ts` from the TS table (the L2→L3 composition proof) · `@nuri/spec` has no tsconfig so `palette-surface.ts`'s `as const satisfies` is author-time-only (like the dimension/colour SoTs) · the L3.1 Guard-D shorthand/longhand gap + the web-factory no-harness gap stay open (UNRELATED · palette has no shorthand/logical families). Next: **L3b·2** (`interactive` · the pseudo-state axis) · **L3.1b** (typography) · **L3c** (the flip — retire the recipe layer · the factory as sole web renderer · re-source `build/palette.ts`). See [`roadmap/N+33-L3b-palette.md`](./N+33-L3b-palette.md) · [`docs/cascade.md`](../docs/cascade.md) · [`decisionlog.md` §70 / §67 / §63 / §2](../decisionlog.md).

N+32 · **the colour vertical → TS SoT (C1 primitives + C2 the accent×theme cascade · the colour flip is COMPLETE)** — the colour layer now matches the dimension layer: authored ONCE in [`pipeline/colours.ts`](../packages/spec/pipeline/colours.ts), the build WRITES `styles/tokens-{primitive,semantic}.css` (C1 on `feat/n32-colour-cascade` · C2 stacked on `feat/n33-colour-cascade-c2` · [decision 70](../decisionlog.md) / [§72](../decisionlog.md) · as-built [`N+32-colour-cascade.md`](./N+32-colour-cascade.md)). **[decision 2](../decisionlog.md) is now fully reversed for colour.** **C1** = the flat catalog (the 7 neutral scales + lilac + alpha · the gray→cream neutral resolution · the runtime `[data-neutral]` switcher retired) — the easy half (`build/*` byte-identical · cream was already the RN default since [decision 31](../decisionlog.md)). **C2** = the **last genuinely-templated transform in the plan**: the `chrome` (theme-only · 13 tokens × {light,dark}) + `accent` (accent×theme · 6 × {neutral,lilac} × {light,dark}) matrix is authored via the `{ ref: 'scale.step.theme' }` arm, and [`parsers/semantic-css.js`](../packages/spec/pipeline/parsers/semantic-css.js) GENERATES the 8-block cascade — including the [decision 63](../decisionlog.md) `#4b/#6b` descendant-combinator self-scope **no stock token tool emits**. The emitter is the **inverse of the parser's `findWinningDecl`**: a dark block redeclares only where `dark.ref ≠ light.ref`, so neutral redeclares all 6 and lilac's **P4-FROZEN** brand tokens fall out as the partial blocks 6/6b (P4 emerges from the data · not special-cased). **NOT byte-identical** (the cascade is regenerated · terser · the Format-B matrix moved to the SoT · [decision 33](../decisionlog.md)'s intent preserved, its location follows the source) **but it resolves to the SAME (accent × theme) cross-product → `build/tokens.ts` (the RN flat `tokens[accent][mode]` contract · no cascade, no #4b/#6b · decisions [27](../decisionlog.md)/[62](../decisionlog.md)/[63](../decisionlog.md)) byte-identical** — the load-bearing gate. **Committed harness** [`colour-semantic.test.js`](../packages/spec/pipeline/colour-semantic.test.js) (7 guards · **proven non-tautological** — a dropped INVERSE bites 5): **A** structural ≡ + the cascade-shape pin (the P4 omission) · **B** re-splice freshness · **C** the **independent cream/lilac matrix oracle** resolved two ways (the SoT AND the live CSS cascade walk · incl. the dec-63 dark cell) · **D** the #4b/#6b self-scope + the descendant-combinator known-limitation form. The **real-engine dec-63 anchor** [`colour-semantic-computed-check.html`](../packages/spec/pipeline/colour-semantic-computed-check.html) (6/6 cells · run via the preview tooling): a self-scoped `[data-accent=neutral]` under a `[data-theme=dark]` **ANCESTOR** resolves `--nuri-accent-solid` to **cream-1-light `rgb(255,253,242)`** (the IconButton dark-on-dark fix · matches the #4 combined control); the known-limitation (a light scope nested in a dark scope → resolves dark) reproduced exactly. **decision 63 preserved faithfully** (the nearest-vs-any-ancestor limitation STAYS · not redesigned). The C1 carry-forward cleaned (`semantic.js#buildPrimitiveMap` → `:root`-only · the vestigial `neutral` param + inert `[data-neutral]` branches retired). Gates green LOCALLY: **spec 55/55** (48 + 7 new) · `git diff --exit-code packages/spec/build/` **byte-identical** · **rn 27/27 + 7 snapshots** · **tsc 0/0** · **expo-demo tsc 0**. **Spike-before-delete** (decision 70 discipline): generated ≡ hand proven (resolved · all 38 semantic vars × accent × theme) BEFORE the in-place flip landed. Next: **the L3 namespace flip** (L3b/L3.1b/L3c · the agnostic stack/box/typography axes → generated namespace CSS + retire the recipe layer) — the templated token-cascade transforms (dimensions + colour) are now DONE. See [`roadmap/N+32-colour-cascade.md`](./N+32-colour-cascade.md) · [`docs/cascade.md`](../docs/cascade.md) · [`decisionlog.md` §72 / §70 / §63 / §2](../decisionlog.md).

N+31 · **the dimension cascade → TS SoT (the first real flip)** — the `--nuri-px-36 → --nuri-size-md → 36px` chain is now sourced FROM TS (on branch `feat/n31-dimension-cascade` · [decision 70](../decisionlog.md) · [`docs/cascade.md`](../docs/cascade.md) the token-layer flip · as-built [`N+31-dimension-cascade.md`](./N+31-dimension-cascade.md)). The **first irreversible-class flip** — [decision 2](../decisionlog.md) (CSS is SoT) is **REVERSED for the dimension layer ONLY** (L4 descriptors were B1 · the L3.1 namespace CSS was a shadow). The easy one by design: the dimension scales are all **flat `:root`** (no accent×theme cascade), so the [decision 63](../decisionlog.md) `#4b/#6b` / §10 M2/M5 concern does not apply — that is the **colour** slice. The px scale (12 · value==name · decision 32) + the space/size/radius semantics (8/7/4 · the reference structure px←semantic IS the cascade · the `0`/`9999px` literal sentinels outside the px scale · decision 36 / 36.1) are authored ONCE in [`pipeline/dimensions.ts`](../packages/spec/pipeline/dimensions.ts), and a new **Slice 0** ([`tokens-parser.js`](../packages/spec/pipeline/tokens-parser.js)) WRITES them into `styles/tokens-{primitive,semantic}.css` (the [`dimension-css.js`](../packages/spec/pipeline/parsers/dimension-css.js) emitter · postcss-surgical · byte-identical for unchanged values) before every downstream slice reads them. **Sub-decisions** (surfaced · operator-confirmed): **(S1) passthrough-hybrid in-place** — keep the two files, regenerate only the dimension decls, pass non-dimension bytes through verbatim → **zero page repointing** (the ~15 pages / `stage.mjs` / the pipeline reads keep the same paths · the trade: `styles/` holds a generated region · the clean physical split is a later L3c cleanup); **(S2) minimal** — generate the CSS, the parser keeps reading it → `build/*` byte-identical with the smallest diff. The flip is genuine: the build DRIVES the values (a hand-edit is overwritten on the next build) and a two-way drift guard fails the build if the SoT and the CSS disagree on which leaves exist. **Committed parity harness** ([`dimension-cascade.test.js`](../packages/spec/pipeline/dimension-cascade.test.js) · 8 guards · **proven non-tautological** — a wrong value diverges the re-emit, a missing/orphan/malformed leaf throws): **A** structural ≡ (SoT map ≡ committed CSS map) · **B** re-emit freshness (byte-identical) · **C** the **independent scale oracle** (the design numbers RESTATED in the test · every leaf resolved through the px chain to its final value two ways — through the SoT AND the live CSS `var()` chain · the L3.1 Guard-C pattern · the substantive guard) · **D** the lock (the reserved radius PRIMITIVES `--nuri-radius-{none,xs,xl,2xl}` present + NOT owned by the SoT). The SoT is `.ts` (the cascade north-star · loaded type-stripped via a `data:`-URL · node 20 can't import a `.ts` · the descriptor-twin / L3.1 technique); `styles/` carries 4 provenance comments marking the generated regions (decision 35 · the only `styles/` byte change · **no value or var moved**). Gates green LOCALLY: **spec 41/41** (33 + 8 new) · `git diff --exit-code packages/spec/build/` **byte-identical** (the load-bearing gate · proves the dimension values unchanged through the whole pipeline incl. RN's `tokens.ts`) · **rn 27/27 + 7 snapshots** (the contract `build/tokens.ts` byte-identical · the inversion invisible to the consumer) · **tsc 0/0** · **expo-demo tsc 0**. **Scope held**: no accent×theme cascade · `--nuri-border-*` / reserved radius primitives / the type scale / fonts / colours / the namespace CSS + L3.1 shadow + recipe CSS + the web factory all untouched. **The re-order** (sequencing · NOT a model change · decision 70 STANDS): the remaining token-SoT flip is re-sequenced into **two vertical slices by subject** — **dimensions ✓** (this slice) → **colour** (the colour primitives + the accent×theme matrix · decision 63 · §10 M2/M5 · next) — **superseding the L3.1 retro's "Next: L3b"** immediate-next; the L3 namespace flip (L3b/L3.1b/L3c) stays on the map. **Carry-forward (LOG-only · P11)**: the L3c Guard-D shorthand/logical-longhand gap stays OPEN (unrelated · closes when the namespace hand-CSS oracle retires) · the clean physical split (`tokens-dimension.css`) deferred · a `git diff packages/spec/styles/` CI step would belt-and-braces the harness-gated `styles/` freshness (deferred). The dec-2 state transition is recorded in the ledger at **[decision 71](../decisionlog.md)** (mirroring dec 69 for descriptors · L3.1 opened no decision because it was a shadow · this flip actually reverses dec 2). Next: **the colour vertical** (the cascade spike · the harder slice — this one de-risked the mechanism) · then **L3b/L3.1b/L3c**. See [`roadmap/N+31-dimension-cascade.md`](./N+31-dimension-cascade.md) · [`docs/cascade.md`](../docs/cascade.md) · [`decisionlog.md` §71 / §70 / §2 / §63](../decisionlog.md).

N+30 · **L3.1 · generate the agnostic namespace CSS from the Field table (the reversible spike)** — the web emit S1 promised, built at last (on branch `feat/n30-l3.1-namespace-css` · [decision 70](../decisionlog.md) · [`docs/cascade.md`](../docs/cascade.md) L3 step · as-built [`N+30-L3.1.md`](./N+30-L3.1.md)). A new pipeline emitter ([`pipeline/parsers/namespace-css.js`](../packages/spec/pipeline/parsers/namespace-css.js)) consumes the **same** Field table the RN applier consumes ([`resolve-map.ts`](../packages/rn/factory/resolve-map.ts) · `STACK_FIELDS`/`BOX_FIELDS`) and emits the `[data-*]` dispatch CSS — the **inverse-spelling of `applyFields`** ([resolve.ts](../packages/rn/factory/resolve.ts)): RN writes `ViewStyle[prop]=value`, the web writes `.nuri-<ns>[data-<kebab key>="<v>"] { <web prop>: <web value> }`. Generates **box + stack** (the clearly-tabular agnostic two) to a SHADOW location [`build/css-preview/{box,stack}.css`](../packages/spec/build/css-preview/box.css); a committed harness ([`pipeline/css-preview.test.js`](../packages/spec/pipeline/css-preview.test.js)) proves them **EQUIVALENT to the hand `lib/components/{box,stack}/*.css`** (the parity oracle). **REVERSIBLE SPIKE · SHADOW ONLY** — flips/retires NOTHING: the live web factory + pages still load the hand CSS, the recipe layer (L3c) untouched, `tokens-*.css` (L2) untouched, `resolve-map.ts` read-only, nothing repointed. **[decision 2](../decisionlog.md) STANDS · no decision opened** (decision 70 locks the model). **The payload — the web spelling layer** (the concrete L3-flip TODO · each a cascade.md-named gap): (1) the RN-physical→web-logical remap is **broader than the doc's one example** — sizing (`width→inline-size` …) + every padding edge go logical (9 remaps); (2) value vocab — `size`/`radius` **DERIVE** from the scale (the SizeLeaf model), `space` is the curated `SpaceLeaf` subset (the "double declaration to remove" · still an erased type), `direction` is literal vocab; (3) the `expand` arm (`fill`) needs per-target web spelling (RN `{flexGrow,flexShrink}` ≠ web `flex: 1 0 auto` + logical `min-inline-size`). **Sub-decisions** (surfaced · operator-confirmed): table homing = **in-place** (read cross-package + type-stripped via a `data:`-URL shim · the L3 flip relocates it to `@nuri/spec` · the decision-68 DAG) · typography **deferred to L3.1b** (not a Field-table namespace — `resolve.ts` handles it bespoke as a type-step ref). **Four guards** (A structural ≡ · B re-emit freshness · C resolved-value spot-check · D order-irrelevance) · **proven non-tautological** (a perturbed emitter failed A/B/C/D for box, stack green). **Computed-style (real browser · preview MCP)**: **20 cells · 60 checks · 0 fails** — generated ≡ hand AND ≡ the pixel oracle (confirms logical→physical: `inline-size`→width=36px · `padding-inline`→left/right=24px · `flex: 1 0 auto`→1/0/auto). Gates green LOCALLY: **spec 33/33** (26 + 7 new) · `git diff packages/spec/build/` = **only the new `build/css-preview/` dir** (every pre-existing artifact byte-identical · the runner is NOT in `npm run build`) · **rn 27/27 + 7 snapshots** · **tsc 0/0** · **expo-demo tsc 0**. **Carry-forward (L3c · LOG-only · P11)**: a **Guard D soundness gap** on shorthand/logical-longhand families — D compares property STRINGS, so `padding` (shorthand) + `padding-inline-start` (logical longhand) read as disjoint though both cascade onto `padding-left`; co-occurrence (a supported edge>axis>uniform case) is order-sensitive at equal specificity and **neither harness exercises it**. Parity holds today only because the generated `BOX_FIELDS` order coincidentally preserves the hand precedence; latent while the hand CSS is the oracle, **must close at L3c** when the oracle retires (options a/b/c in [`N+30-L3.1.md`](./N+30-L3.1.md)). Next: **L3b** (palette/interactive · bespoke) · **L3.1b** (typography's table form) · **L3c** (the flip — retire the recipe layer · the factory as sole web renderer · close the Guard D gap). See [`roadmap/N+30-L3.1.md`](./N+30-L3.1.md) · [`docs/cascade.md`](../docs/cascade.md) · [`decisionlog.md` §70](../decisionlog.md).

N+29 · **B1 · author the descriptor SoT in TS — `@nuri/spec` is now the descriptor source of truth** — the first §9 step (on branch `feat/n29-b1-descriptor-ts-sot` · [decision 69](../decisionlog.md) · Phase B · as-built [`N+29-B1.md`](./N+29-B1.md)). The three frozen descriptors (composition-button / icon-avatar / topbar) stop being CSS-derived and become **hand-authored TS** at [`packages/spec/pipeline/descriptors/*.ts`](../packages/spec/pipeline/descriptors/composition-button.ts) (the SoT · beside the already-authored `schema.ts`); `build/descriptors/*` is emitted by **verbatim passthrough** (the `./schema` import resolves in both the pipeline + build locations · no rewrite) → **byte-identical DATA · provenance header only**. **§9 STEP 1 · REVERSIBLE by design** (operator-ratified · [decision 69](../decisionlog.md)): decision 2 (CSS is SoT) is reversed **for the descriptor layer ONLY**; the hand CSS is **retained as the live parity oracle** (`deriveDescriptor` repurposed PRODUCER→cross-check · Guard D asserts `deriveDescriptor(CSS,HTML) ≡ the authored data` · `descriptorBody()` strips headers so only DATA compares · proven **non-tautological** by a perturb-and-rebuild test that still failed) → the descriptor has **two agreeing sources**; irreversibility lands at B2 (CSS deletion). **Layer B (the token vocabulary · `styles/tokens-*.css` incl. the decision-63 #4b/#6b cascade) is RING-FENCED — untouched · CSS-SoT · NO CSS generated** (that's B2). **Faithful inversion** — descriptor DATA unchanged (no R1.5 default / real-boolean `center` / `subtle` / topbar title-type fix · first-bump backlog). Slice 7 reads no CSS (dead `PAGES_DIR` gone); **Slice 9 + Guard G read the SoT** via the browser-ESM twin (node 20 can't `import` a `.ts`) → `deriveDescriptor` survives **solely** as the oracle (Guard F untouched · Guard G re-sourced). **Judgment calls (coordinator-endorsed)**: removed `emitDescriptorJs(ir)` (dead post-inversion · P11 · the brief's "keep it" was wrong) · anchored `descriptorBody` on the line-start `import type … from './schema';` statement (a bare `indexOf` trips on the header text · caught on the first build). **Consumers untouched** (`@nuri/rn` `contract.ts` + `@nuri/spec` `exports`) — the inversion is transparent. Gates green LOCALLY: **spec 26/26** · `git diff packages/spec/build/` **header-only** (every DATA body byte-identical · `build/docs/*` byte-identical) · **rn 27/27 + 7 snapshots** (the intra-repo contract gate — the byte-identical descriptors still drive the RN factory through the **unchanged** exports map) · **tsc 0/0**. **Scope reconciliation**: `package-migration.md`'s B1 row ("descriptor registry **+ token vocabulary**") narrowed to the audited **Layer-A** scope (descriptors only) · the token-vocabulary inversion moved to **B2** (coupled to CSS generation · decision 63 stays CSS until then) · the §9 "one irreversible step" framing refined to the audit's **B1 (reversible) / B2 (irreversible)** split. Next: **B2** (build-time `descriptor → CSS` · author the token vocab in TS · delete the hand CSS / retire the oracle · the irreversible step · gated on `resolver-model.md` §10 M2/M5). See [`roadmap/N+29-B1.md`](./N+29-B1.md) · [`roadmap/package-migration.md`](./package-migration.md) · [`decisionlog.md` §69](../decisionlog.md).

N+28 · **A2.5 · collapse the RN dual-version tree — NON-VIABLE *and* UNNECESSARY (finding)** — a §9-independent infra precursor to A3 (on branch `chore/collapse-rn-dual-tree` · [decision 68](../decisionlog.md) · Phase A · as-built [`N+28-A2.5.md`](./N+28-A2.5.md)). The session set out to collapse the orphaned root `react@19.2.6` / `react-native@0.80.3` dual tree once so the package-ADDING carves (A3+) would `npm install` churn-free; the investigation proved the collapse **impossible in-place**, **non-viable via the only mechanism that works**, **and unnecessary**. **The brief's premise was wrong**: "a plain `npm install` collapses on npm 10.8.2" was inferred from A1's *rename* (which forces an ideal-tree rebuild) — a plain install never rebuilds → no-op (the M4 finding still holds). **In-place is impossible** (5 attempts): `npm install` / `--package-lock-only` / `--force` all no-op · `npm dedupe` ERESOLVEs on jest-expo's `react-native@"*"` peer vs the orphan `0.80.3` · `rm package-lock.json && npm install` re-serializes the existing tree · the root `override` (the M4 "option (b)", now unblocked) is **inert in-place** (npm won't apply a new override to a satisfiable lockfile). **The only mechanism — a from-scratch regen** (`rm -rf node_modules package-lock.json && npm install`, the anti-goal) — was operator-approved as a **verify-then-revert** experiment: it **collapses cleanly + without the override** (nothing declares the orphan · lockfile 12444→9526 · operator refinement #2 confirmed), **but** a fresh resolution is a **whole-tree refresh** — **63 transitive deps drift** (`metro 0.82→0.83` [needs node ≥20.19.4 · env is 20.19.3] · `@types/node 25→26` · **`lodash` dropped**) — that **breaks the canary** (`npm test -w @nuri/rn` won't start · jest-expo's preset resolution fails although jest-expo is present+intact · **the M4 breakage reproduced** · the whole-tree drift is the blocker, **not** node). **Reverted** per the operator's gate-fail rule (lockfile byte-identical · `npm ci` · canary **27/27 + 7** green again). **The sharpening probe** (operator-added at the checkpoint): a throwaway non-RN stub workspace (dep `@nuri/spec` only · the A3+ carve shape) + `npm install` → **+11 / −0** lockfile diff, **RN tree untouched**, orphan intact → **a non-RN add is conservative**. **Net: the dual tree is a harmless vestige** — the carves (A3/A4/A5 · build-free web · zero RN deps) just `npm install`; only an RN-package **structural** change (a rename like A1) forces a collapse-and-drift rebuild needing manual lockfile care. **Option 2 shipped** (doc-only · no lockfile/code change): this finding + the **false-premise correction everywhere** (the memory lockfile-gotcha · [`jest.config.js`](../packages/rn/jest.config.js) / [`metro.config.js`](../packages/expo-demo/metro.config.js) / [`decisionlog §65.11`](../decisionlog.md) comments — the collapse ATTEMPTED + found non-viable, not "untaken"); the override + lockfile reverted; the jest/Metro single-React/RN workarounds **RETAINED** (still load-bearing). **Anti-goals**: no surgical lockfile edit (the orphan is structural · fiddly · uncertain) · no node-bump chase (the regen stays a 63-pkg whole-tree refresh even on 20.19.4 — the drift is the blocker). Gates = the `main` baseline: **rn 27/27 + 7 snapshots** · **spec 26/26** · **tsc 0/0** · `build/` byte-identical. Next: **A3** carve `@nuri/prototype` (the carves are now confirmed churn-free). See [`roadmap/N+28-A2.5.md`](./N+28-A2.5.md) · [`roadmap/package-migration.md`](./package-migration.md) · [`decisionlog.md` §65.11](../decisionlog.md).

N+28 · **A2 (= factory-rewrite S4) · web factory generalize · build `nuri-view`** — the runtime web mirror's engine is now GENERIC across all three frozen descriptors (on branch `feat/factory-s4-generalize` · [decision 67](../decisionlog.md) S4 · [decision 68](../decisionlog.md) Phase A · A2 · as-built [`N+28-A2.md`](./N+28-A2.md)). **ENGINE-ONLY** (operator-scoped · option A): S3 proved Button; S4 extends the SAME `buildComponent` engine ([`lib/runtime/factory.js`](../packages/spec/lib/runtime/factory.js)) to **icon-avatar** + **topbar** + builds the one missing primitive **`nuri-view`** ([`lib/components/view/view.{js,css}`](../packages/spec/lib/components/view/view.js)) — the hand recipes STAY (retirement split out → **A6** · decision 68). `renderPart` becomes a **switch** over `el`: `view`+interactive → `<nuri-pressable>` (S3) · static `view` → **`<nuri-view>`** (the merged-node host · the element IS the painting node · no inner el · ≠ `nuri-box` · RN `<View>`'s Yoga defaults `display:flex; flex-direction:column; flex-shrink:0`) · `text` → `<nuri-typography>` · `icon` → `<nuri-icon name=X>` (the `name` instance prop routed · fg by `currentColor`) · a **default throw** (the web `assertNever` · R7). `open` needs NO branch (own-content + child parts render regardless · the RN oracle). The `.js` descriptor emit un-gated — `BROWSER_DESCRIPTOR_COMPONENTS` widened to all three → [`build/descriptors/{icon-avatar,topbar}.js`](../packages/spec/build/descriptors/icon-avatar.js) (additive · data byte-identical to the `.ts` · `emitDescriptorJs` already generic from S3 · a pure P11 un-gate). **VISUAL** (the close-step · preview-MCP · throwaway smoke · never committed): factory ≡ live recipes at EXPLICIT axis values under the build-canonical scope (`data-neutral=cream`) — icon-avatar **9/9 computed cells** {solid,soft,ghost,subtle} (bg·fg·width·height·radius·align·justify·display·flex-shrink · all trace to [`build/docs/icon-avatar.md`](../packages/spec/build/docs/icon-avatar.md) · solid `#12110b`/`#f0eee3` · subtle fg-only `#bfbcac`) · the icon inherits fg by `currentColor` (incl. subtle) · accent self-scope re-resolves lilac `#beaaff` · topbar chrome `#fffdf2` + grow-shrink pivot + center + the open container's leading slot (trace to [`build/docs/topbar.md`](../packages/spec/build/docs/topbar.md)) · Button (S3) unchanged · **console clean**. **Two checkpoint course-corrections (operator-directed)**: (1) **flex-shrink → FIXED** — `nuri-view` gains `flex-shrink:0` (the RN `<View>`/Yoga default · web defaults 1), closing the icon-avatar gap; verified the RN "explicit fill beats the default" model holds via existing `@layer` specificity (`.nuri-stack[data-fill]` 0,2,0 > the element rule 0,0,1 — the grow-shrink pivot still shrinks while the fill-less circle/chrome stay rigid). (2) **topbar title-type → SURFACED accurately** as a **descriptor-fidelity gap** (NOT fixed · NOT A6 plumbing): the lg-em title is NOT in the SoT (the descriptor's `content` carries no typography) → hand-duplicated in [`topbar.js`](../packages/spec/lib/components/topbar/topbar.js) (bare-string auto-type) AND [`expo-demo/src/screens/Demo.tsx:31`](../packages/expo-demo/src/screens/Demo.tsx) (`typeStyle('lgEm')`); **neither factory can generate it** (the RN factory is not buggy — it faithfully renders an incomplete descriptor); the clean fix is a topbar-descriptor DESIGN decision (a typed `title` part vs the bare-string-conditional convenience) — **DEFERRED to the first-bump backlog** with R1.5's no-default-per-axis · the stringly-boolean axes · `subtle` fg-only. **Byte-identical `build/`**: the only changes are the 2 additive `.js` twins + a 1-line header re-emit on `composition-button.js` (the durable-phrasing closeout fix · the closeout audit caught the S3→S4 comment drift); `view.{js,css}` are NOT in the `COMPONENTS` walk → never read. **NOT §9 · decision 2 STANDS · RN untouched.** Gates green LOCALLY: **spec 26/26** · `git diff packages/spec/build/` byte-identical (+ the additive twins) · **rn 27/27 + 7 snapshots** · **tsc 0/0** · **expo-demo tsc 0**. **Open question** (audit-surfaced · don't block): the generalized factory has no committed web regression harness — proven via the ad-hoc preview smoke only (consistent with S3); a committed factory-vs-recipe parity page would lock the gain (→ A6, when the factory becomes the `<nuri-*>` backing). Next: **A6** (recipe retirement · the factory backs `<nuri-*>` · the R1.5 default decision) · the topbar title-type design decision · the A3+ migration carves · **§9**. See [`roadmap/N+28-A2.md`](./N+28-A2.md) · [`roadmap/factory-rewrite.md`](./factory-rewrite.md) · [`decisionlog.md` §67](../decisionlog.md).

N+28 · **A1 · `factory → rn` rename** — the first §9-independent step of the package migration (on branch `refactor/a1-factory-to-rn` · [decision 68](../decisionlog.md) · Phase A · as-built [`N+28-A1.md`](./N+28-A1.md)). A **PURE RENAME** of the production RN library `@nuri/factory` → `@nuri/rn` + its dir (`git mv` · history preserved) + every LIVE reference + the CI job (`factory:`→`rn:`) — **no internal restructure, no behaviour change** (the inner `factory/` engine dir · resolve-map · theme · descriptors untouched; snapshots byte-identical). The judgment running through the sweep: the renamed **artifact** changes (`@nuri/factory` specifier · `packages/factory` path · the `factory` CI job), the **"factory" engine concept** stays (`createNuriComponent` · the web factory · "behaviour is the factory's" · the inner `factory/` dir · `lib/runtime/factory.js`) — dec 68: "factory is now a concept in *both* libraries"; immutable history (the M2-era name) stays. **The finding** *(⚠ corrected by A2.5 — RENAME-specific; a plain `npm install` no-ops, see the A2.5 entry atop Current state)*: `npm install` (npm 10.8.2) **collapses the deliberately-retained dual-version react-native tree** *(via the rename forcing an ideal-tree rebuild)* (root `0.80.3`→`0.81.5` · ~1500-line churn · "don't-force-it" per [N+19-M4](./N+19-M4.md)) → since only the committed lockfile matters (CI's `npm ci` rebuilds from it), the lockfile is a **mechanical `factory`→`rn` string rename** (48/48 balanced · every ref is the workspace/path · no unrelated `factory` dep · dual tree preserved · `npm ci` rebuilds root-`0.80.3`+nested-`0.81.5`; operator-confirmed). **Scope corrections at the checkpoint** (operator): the brief mis-fenced two LIVE `docs/` design docs — `target-architecture.md` (4 refs → `@nuri/rn`) + `roadmap/post-migration-arcs.md` L12-13 (stale gate-commands) — now swept; `prompts/working-session.md` (live gate-commands) added; **principle**: `docs/` design docs are LIVE, only `package-architecture.md` is untouchable (already `@nuri/rn` + marker), frozen = `decisionlog` + `roadmap/N+*` retros + past index entries (so RISKS L22/1046/1110 stay `@nuri/factory` — tense-frozen M2/N+19 records). **38 files · 105/105 balanced.** Gates green LOCALLY: **rn 27/27 + 7 snapshots byte-identical · tsc 0** · **expo-demo tsc 0** (resolves `@nuri/rn`→`@nuri/spec`) · **spec 26/26** · `git diff packages/spec/build/` **byte-identical**. **OPERATOR ACTION at merge** (required-check · M3 precedent B): `main` protection `spec`+`factory`+`expo-demo` → **remove `factory`, add `rn`** once the PR's `rn` job is green. Next: **A2 · S4** (web factory → icon-avatar/topbar · build `nuri-view` · retire the hand recipes). See [`roadmap/N+28-A1.md`](./N+28-A1.md) · [`roadmap/package-migration.md`](./package-migration.md) · [`decisionlog.md` §68](../decisionlog.md).

N+28 · **the workspace package architecture** — docs-only direction record (merged · #49 · [decision 68](../decisionlog.md) · the lock for [`docs/package-architecture.md`](../docs/package-architecture.md)). Resolves the *packaging* decision 67's target deferred (§9.4). **Six packages on two axes** — role (SoT · library · consumer) × publishing (TS · build-free · SSG · RN-native): **`@nuri/spec`** (SoT · TS) · **`@nuri/prototype`** (was `@nuri/web` · the build-free web library + `nuri-demo`) · **`@nuri/rn`** (was `@nuri/factory`) · **`@nuri/doc`** (SSG site) · **`@nuri/playground`** (build-free bench) · **`@nuri/expo-demo`** (RN app). DAG: `prototype/rn → spec` · `doc/playground → prototype` · `expo-demo → rn` (**no consumer→consumer edge** — `nuri-demo` lives in the shared `prototype`). **Key calls**: `web → prototype` (the web is a prototyping mirror, not production · target §2/§5 · `rn` keeps its name) · `nuri-demo` in `prototype` (the shared library · kills the `doc→playground` edge + the `website/assets` copy) · **`doc` (SSG) ⟂ `prototype` (build-free)** (the deploy-lifecycle boundary defends build-free from the SSG toolchain). **The publishing axis is load-bearing** + doubles as the repo's organizing principle. **§9 coupling**: `@nuri/spec = TS SoT` is the *post-§9* graph (reverses decision 2 · audit-gated · NOT decided) → the migration splits: the **§9-independent** platform/consumer extractions (rename `rn` · carve `prototype` · extract `doc`/`playground` · `nuri-demo→prototype`) land first under decision 2; the **spec purification** (author descriptors+tokens in TS · generate the CSS) lands with §9. **Subsumes** the N+27 design⟂plumbing workstream (now a within-`prototype` sub-concern). **Deferred** (target §9.3/§9.4): where codegen physically runs (`pipeline/` stays put for now) · versioning. **Docs-only · no code · gates unaffected.** Next: **Phase A** of the migration — the §9-independent extractions, **A1 `factory → rn`** first ([`roadmap/package-migration.md`](./package-migration.md) · the session sequence + sizing). See [`docs/package-architecture.md`](../docs/package-architecture.md) · [`roadmap/package-migration.md`](./package-migration.md) · [`decisionlog.md` §68](../decisionlog.md).

N+27 · **factory-rewrite S3 · the web factory · de-collapse Button (option A)** — the runtime web mirror's first real slice (on branch `feat/factory-s3-web-factory` · [decision 67](../decisionlog.md) · S3 · as-built [`N+27.md`](./N+27.md)). A browser web-factory ([`lib/runtime/factory.js`](../packages/spec/lib/runtime/factory.js) · `buildComponent(descriptor, selection, props)`) **de-collapses the frozen Button descriptor** into `<nuri-pressable><nuri-typography>` and styles it from the descriptor via `data-*` — **option A** (operator-chosen): the web emit is `field→data-{kebab}` + the namespace class, **REUSING the hand `@layer` CSS as the styler** (the mapping already lives in `box.css`/`stack.css`/`palette.css` · **NOT a `resolve-map.ts` consumer** · the table stays RN-only · **no inline styles**). A GENERIC anatomy walker that **mirrors** ([`resolve.ts`](../packages/factory/factory/resolve.ts) `mergeNS`/`mergedNSForPart`/`resolveAnatomy` + [`createNuriComponent.tsx`](../packages/factory/factory/createNuriComponent.tsx) first-value fallback + primary-part `children` routing) — **hand-written, NOT imported** (RN-coupled · pulls `ViewStyle`). The N+26 el→primitive lock: `view`+`interactive`→`<nuri-pressable>` · `text`→`<nuri-typography>` (the `view`(static)/`icon` arms throw a clear "S4"). **The merged node** (the faithful web analogue of RN's single `<View style>`): `box ⊕ stack ⊕ palette` merge onto the pressable's inner `<button class="nuri-interactive">` — created lazily on connect, so the merge is **DEFERRED** via a one-shot `MutationObserver` (microtask · before paint · the set-once className survives · N+26 contract); `pressColor`/`pressScale`→ the host's gate attrs · `disabledOpacity` automatic · fg flows by SCOPE (palette sets `color`, the label inherits). **Browser-ESM descriptor twin** ([`build/descriptors/composition-button.js`](../packages/spec/build/descriptors/composition-button.js) · `emitDescriptorJs` in [`descriptors.js`](../packages/spec/pipeline/parsers/descriptors.js) · **additive · committed** · decision 35 · **Button-gated** `BROWSER_DESCRIPTOR_COMPONENTS` · icon-avatar/topbar→S4 · P11): **data byte-identical** to the `.ts` (same IR · same renderers · minus the TS apparatus), so a browser `import`s the descriptor at runtime with **no build step** (zero-build). **Checkpoint course-correction — `reset.css`** ([`lib/runtime/reset.css`](../packages/spec/lib/runtime/reset.css) · new · hand-written): visual-first caught the factory button wearing the native `<button>` UA chrome (2px border · bezel · 1px padding-block) — `.nuri-interactive` never normalized its host like `.nuri-button`'s base does. First pass folded the reset into `interactive.css`; **the operator vetoed** (the namespace CSS is the §9 generation target · a hand-authored reset must not mix into a to-be-generated file) → reverted `interactive.css`, moved the reset to its own hand-written file (`border:0`·`padding:0`·`appearance:none`·`user-select:none`·`font:inherit` · `@layer rules` so `box`'s `[data-padding-x]` specificity wins the inline axis while the reset zeroes the UA block) · also fixes the latent S2 bare-pressable bezel. **The split is now principled: generated namespace CSS = token-derived · `reset.css` = hand-written browser-normalization** (the §9 boundary). **VISUAL** (the close-step): preview-MCP equivalence proof (throwaway page · **never committed**) — factory Button beside `<nuri-button>` across **variant×size×accent(lilac/neutral)×disabled** at EXPLICIT axis values → **14/14 computed-style cells match** (bg·fg·min-height·padding inline+block·border·appearance·user-select·radius·font·box-sizing) · **pixel-parity screenshot** · the merged-node `.matches()` the press-scale / pressed-bg-swap / focus-ring selectors (the SAME proven `interactive.css`/`palette.css` rules · tokens resolve) · values **trace to** [`build/docs/button.md`](../packages/spec/build/docs/button.md) (`accent=neutral` solid `#12110b`/`#f0eee3`) · **console clean**. **Known R1.5 difference (surfaced, NOT fixed)**: the descriptor carries no per-axis default → the factory falls back to the FIRST value (`variant`→`solid`) while `<nuri-button>` defaults to `soft`; compared at explicit values. **Byte-identical `build/`**: the lone change is the additive `composition-button.js`; `reset.css` (+ the unchanged `interactive.css`) are never read by the build (`COMPONENTS` walk excludes them). **NOT §9 · decision 2 (CSS is SoT) STANDS** (the web factory is a descriptor CONSUMER, like RN). Gates green LOCALLY: **spec 26/26** · `git diff packages/spec/build/` **byte-identical** (only the additive `.js`) · **factory 27/27 + 7 snapshots** (RN untouched) · **tsc 0/0**. Next: **S4** (generalize the factory to IconAvatar/Topbar · build `nuri-view` · emit the `.js` for the other two descriptors · retire the hand `button.js`/`icon-avatar.js`/`topbar.js`) → **§9** (build-time `descriptor → CSS` · audit-gated · reverses dec 2 · must preserve `reset.css`). See [`roadmap/N+27.md`](./N+27.md) · [`roadmap/factory-rewrite.md`](./factory-rewrite.md) · [`decisionlog.md` §67](../decisionlog.md).

N+26 · **factory-rewrite S2 · web primitive `nuri-pressable` + el→primitive lock** — the web-primitive substrate the S3 web-factory will emit (on branch `feat/factory-s2-web-primitives` · [decision 67](../decisionlog.md) · S2 · as-built [`N+26.md`](./N+26.md)). **Web-only**, disjoint from the descriptor / factory / pipeline. Ships the **one missing el-host** — **`nuri-pressable`** ([`lib/components/pressable/pressable.js`](../packages/spec/lib/components/pressable/pressable.js)), the web mirror of RN `<Pressable>` ([`createNuriComponent.tsx:104`](../packages/factory/factory/createNuriComponent.tsx) · the `el:'view'`+`interactive` case) — the **generic extraction of the inline native `<button>` `button.js` hard-codes**: it creates a `<button type="button">`, moves children inside, never tears it down on re-sync (button.js's pattern · consumer listeners survive), but applies the **generic `.nuri-interactive` namespace** ([`interactive.css`](../packages/spec/lib/components/interactive/interactive.css) · decision 65.3 §6 / 65.4), **not** the `.nuri-button` recipe. The interactive vocab is exposed as `data-*` gates (the box/stack pattern): `press-scale`→`data-press-scale` · `press-color`→`data-press-color` · `disabled`→native `disabled` · `accent`→`data-accent` (Tier-2 self-scope · 27/62) · `accessibility-label`→`aria-label`. `className` is set ONCE (never rewritten) so S3 can merge `nuri-box nuri-stack nuri-palette` onto the same host with no clobber (the merged-node model · the opposite of `typography.js`'s wholesale rewrite). [`pressable.css`](../packages/spec/lib/components/pressable/pressable.css) = `nuri-pressable{display:contents}` (the [`button.css:134`](../packages/spec/lib/components/button/button.css) wrapper precedent) + an empty `@layer tokens` (the `interactive.css` / decision-37 skip-emit convention). **The el→web-primitive lock** (decision-67 scope · **no new decision** · the [`N+26.md`](./N+26.md) table): `view`+`interactive`→**`nuri-pressable`** ✓built · `view`→**`nuri-view`** (dedicated · **≠ `nuri-box`** · built at **S4** · shape locked here) · `text`→**reuse `nuri-typography`** (no `nuri-text`) · `icon`→`nuri-icon` exists · `screen`/`scroll` exist (decision 58). **Scope narrower than the roadmap S2 row** (verified first-hand: 3 of the 4 listed primitives already exist). **1:1 RN `<Pressable>` confirmed** (children / `disabled` / `accessibility-label`→`accessibilityLabel` / native click≈`onPress`). **VISUAL** (the close-step's visual-first): preview-MCP smoke of 6 states (throwaway page · **never committed**, deleted at closeout) — renders · `display:contents` wrapper · `:active` scale + `:focus-visible` ring rules **select** the merged-node DOM · disabled **opacity 0.4** + no scale + native click **blocked** · accent self-scope **re-resolves** `--nuri-accent-solid` `#111111`→`#beaaff` · press-color (merged w/ palette · S3 sim) bg-swap **selects** · native click **bubbles** to host ≈ `onPress` · **console clean**. **Byte-identical `build/`**: `tokens-parser.js`'s `COMPONENTS` walk-list ([line 187](../packages/spec/pipeline/tokens-parser.js)) is **hardcoded, not a glob**, and excludes `interactive` AND `pressable` → the build never reads `pressable.css` (same reason `interactive.css` emits nothing). **NOT §9 · decision 2 (CSS is SoT) STANDS** · web-only · no RN/factory/descriptor/schema/pipeline change. Gates green LOCALLY: **spec 26/26** · `git diff packages/spec/build/` **byte-identical** · **factory 27/27 + 7 snapshots** (web-only · imported by neither suite) · **tsc 0/0**. Next: **S3** (the web-factory slice · consumes S1's [`resolve-map.ts`](../packages/factory/factory/resolve-map.ts) table + this session's `nuri-pressable` · de-collapses Button styling box⊕stack⊕palette from the descriptor) → **S4** (generalize + build `nuri-view` + retire the hand recipes) → **§9** (build-time `descriptor → CSS` · audit-gated). See [`roadmap/N+26.md`](./N+26.md) · [`roadmap/factory-rewrite.md`](./factory-rewrite.md) · [`decisionlog.md` §67](../decisionlog.md).

N+25 · **factory-rewrite S1 · RN resolver → data-driven** — the foundation of the [decision 67](../decisionlog.md) arc (on branch `feat/factory-s1-rn-resolver` · as-built [`N+25.md`](./N+25.md)). A **pure, byte-identical** refactor of the RN factory resolver — **RN only**. The agnostic namespace→style mapping (the old `resolveBox`/`resolveStack` walls of `if (ns.x) s.y = scale[ns.x]`) becomes **DATA** in a new [`resolve-map.ts`](../packages/factory/factory/resolve-map.ts) (`STACK_FIELDS`/`BOX_FIELDS` · `Record<keyof StackNS|BoxNS, Field>` → total over the namespace · `Field` = a tagged union `scale|keyword|literal|flag|expand`), consumed by ONE generic RN applier `applyFields` (iterates the **TABLE** order, not the input's → byte-identical prop emit · `default → assertNever` = field-kind exhaustiveness). `resolveNS`'s `switch`+`assertNever` becomes a **per-target resolver registry** (`RESOLVERS = { rn } satisfies Partial<Record<'rn'|'web'|'css', TargetResolvers>>` · shaped for the S2/S3/§9 columns · **RN-only populated** · no speculative emit); `mergeNS` generalized over a canonical `NS_ORDER` (+ a type-level completeness check). **`palette`/`interactive`/`typography` move into the registry shape with logic VERBATIM** (bespoke mechanism · decision 65 · `resolvePalette` untouched). **The design choice (operator-confirmed)**: the **value-sources are the shared contract; the property SPELLING is the per-target emit's business** — `prop`/`cases` stay RN-spelled (`flexDirection`·`paddingHorizontal`·`borderRadius`), so S3 **ADDS a web emit that consumes the SAME table** (+ a camelCase→kebab + logical-pad name translation), it does NOT fork the table (the canonical-now alternative declined · front-loads a rename map · no oracle · P11). **Exhaustiveness demonstrated to bite** — and caught a real defect: the mapped type was homomorphic and inherited NS's optional `?` (totality silently did NOT bite) → fixed with `-?`; verified `error TS2741: Property 'box' is missing` with a resolver removed. `flattenPart`/`buildPartRecipe`/`toUnistylesRecipe`/`resolveAnatomy`/all exports **unchanged** — the parity oracle stays an INDEPENDENT second reader (not fused). **NON-VISUAL** (resolver internals · the visual close-step skipped · proof = the snapshots + parity). **Factory-internal · NOT §9 · decision 2 STANDS.** Gates green LOCALLY: **factory 27/27 + 7 snapshots byte-identical** (none rewritten) · **tsc 0/0** · **spec 26/26** · `git diff packages/spec/build/` clean (spec untouched). Next: **S2** (parallelizable web primitives) · **S3** (the web-factory slice consumes `resolve-map.ts`). See [`roadmap/N+25.md`](./N+25.md) · [`roadmap/factory-rewrite.md`](./factory-rewrite.md) · [`decisionlog.md` §67](../decisionlog.md).

N+24 · **catalog-generation target + the factory-rewrite sequence** — docs-only direction record ([decision 67](../decisionlog.md) · the lineage of 66). Fixes the target architecture the generation thesis tends toward ([`docs/target-architecture.md`](../docs/target-architecture.md)) + the build sequence ([`roadmap/factory-rewrite.md`](./factory-rewrite.md)). **Target**: the catalog has ONE TS source (the descriptor registry); **codegen projects it** to the **RN factory** (production) + a **WC mirror** (`nuri-*` custom elements · prototyping bench · anatomy mirrors RN 1:1 → compose-here-translate-to-RN · decision 21); a thin hand-written primitive layer where **vocabulary = data** (shared with the catalog) and only the **mechanism** is per-platform. **Resolver** becomes a **per-target registry** (`{ rn, web, css } × namespace` · total-typed): the agnostic namespaces (box/stack/typography) delegate to ONE **shared mapping table**, `palette`/`interactive` stay bespoke mechanism (theme/fg-by-scope · the Pressable *how* · behaviour is the factory's · decision 65). **RN + web resolvers are RUNTIME** (the mirror preserves zero-build) · **the CSS resolver is BUILD-TIME = §9**. **Sequence**: **S1** RN resolver → data-driven (the foundation · oracle-gated byte-identical refactor) → **S2** web primitives (`nuri-pressable/text/screen/scroll` · parallelizable) → **S3** web-factory slice (de-collapse Button · runtime-styled from the descriptor) → **S4** generalize + retire the hand `*.js` recipes → **§9** the build-time CSS resolver (separate · audit-gated). ~4 sessions to the runtime mirror, then §9. **Decision 2 (CSS is SoT) STANDS through S1–S4** — the runtime mirror is a descriptor *consumer* (like RN); **only §9 reverses it** (`descriptor → CSS` · audit-gated · NOT decided · the `resolver-model.md` §9/§10 checks). `button.css` becomes the build-time derivation-source "vestige" at S4, which §9 resolves. **Docs-only · no code · gates unaffected.** Next: **S1** — the RN-resolver-refactor brief (the safe foundation under the factory snapshot/parity oracle). See [`docs/target-architecture.md`](../docs/target-architecture.md) · [`roadmap/factory-rewrite.md`](./factory-rewrite.md) · [`decisionlog.md` §67](../decisionlog.md).

N+23 · **website arc · increment 2** — generalize the doc emitter to 3 pages + token-map value/swatch enrichment (on branch `feat/website-increment-2` · **decision 66 arc #1 · increment 2** · as-built [`N+23.md`](./N+23.md)). The doc-gen **generalized from Button to all three `DESCRIPTOR_COMPONENTS`** (button · icon-avatar · topbar → the full descriptor-backed nav · `DOC_COMPONENTS` widened · `NAV_ORDER` 1·2·3) and every "Resolves to" cell now carries the **resolved value** beside the token path. **Token-map → 6 columns** (a `Token` column [the composition] + a `Resolves to` column [the concrete value]): **geometry** → the resolved px (`size.md`→`36px`) · **typography** → the expanded composite (`fontSize`·`lineHeight`·`weight`·`letterSpacing` · one field/line) · **colour** → a **live `var()` swatch + the default-scope hex** per channel (`accent.solid`→▪`#12110b`; `transparent` ghost bg = a bordered empty square) · **em-dash** on a literal/flag (no token→value indirection · which incidentally marks *which* parts of a composition are themeable). The **2-column split is operator-driven** (supersedes the inline format the brief specified) + needs [`.main-content td{vertical-align:top}`](../website/_includes/head_custom.html) (the N+22 deferred table polish · now **load-bearing**) + the **scope-anchor** (a 6-line `head_custom.html` script pins the generated docs to the build-canonical scope **neutral·cream·light** — `state.js` defaults the web docs to the old preview site's brand A/B [lilac/gray], so the live swatch would NOT coincide with the neutral/cream hex; anchored → **swatch == hex** at `:root`; the per-`<nuri-demo>` story keeps its OWN nested scope · operator confirmed keep-neutral-canonical). **path → CSS var is DERIVED from the SoT** (the classified groups · the same leaf→cssVar map the cascade emits · NOT hand-kebabed: `accent.solid`→`--nuri-accent-solid` keeps its prefix, `chrome.bgStrong`→`--nuri-bg-strong` chrome **drops** it) + dangle-check (a path that can't resolve **throws** · decision 48); the value-bearing inputs flow through ONE builder `buildDocTokenInputs` the orchestrator (Slice 9) **and** Guard G both call (byte-identical re-emit). **NOT §9 · descriptor/schema intact · read-only** (decision 2 STANDS). **Retired NOTHING** — the 3 hand-written `pages/components/*.html` STAY (Guard D · decision 24.1 · the structure source); the **retire-gate** (when is a generated page "covering enough" to retire its hand counterpart · gated on the derivable-spec gaps: **no default-per-axis** [≡ R1.5] + **axes ⊂ props**) stays **OPEN** — the **a/b/c** options (a · accept the narrower descriptor-faithful surface · b · GROW the frozen contract to carry defaults+props [a Guard-F change] · c · a hybrid prose stub) are the next session's first decision. The two **R1.5 first-bump findings now SURFACE in the generated docs** (faithful · deferred): topbar `center`·`false`·`true` (stringly-typed boolean axis · `center=false`→no token-map rows) · icon-avatar's `subtle` fg-only variant. **Authored demos** (`website/_includes/demo/{icon-avatar,topbar}.html` · decision 57.2) + **runtime staging** (`stage.mjs` + `head_custom.html` extended to Icon/IconAvatar/IconButton/Topbar · the topbar demo's controls + the shared glyph runtime · **accepted divergences** from the literal ship list · necessary for the DoD). **Guard G** extended to the 3 pages + per-page contract pins (2-column rows · docs-drift stays **6** guards). Gates green LOCALLY: **spec 26/26** (Guard G re-pinned 2-col · count unchanged) · `build/` = `button.md` enriched + `icon-avatar.md`/`topbar.md` new (additive · `tokens.ts`/`descriptors/*`/`palette.ts` byte-identical) · **factory 27/27 + 7 snapshots** · **tsc 0/0**. Plus the local visual proof (preview MCP · no Jekyll): the kramdown spike (the inline `<span>` swatch survives a `<td>` verbatim) + **all 26 swatches coincide with their printed hexes** (0 mismatches · numeric check · they re-theme live) · the 3 demos hydrate · console clean. **CSS untouched** (decision 2 STANDS · §9 not taken). **Operator action**: unchanged (Settings → Pages → GitHub Actions · the `@layer` font live-check **HELD** post-deploy). Next: **resolve the retire-gate (a/b/c)** → **the axis-driven `<nuri-demo>` selects** (retire the authored demos · the story endgame) → the remaining arcs → **Digital-cash**. See [`roadmap/N+23.md`](./N+23.md) · [`decisionlog.md` §66](../decisionlog.md) · [`docs/north-star.md`](../docs/north-star.md).

N+22 · **website arc · increment 1** — revive the docs site, **generated** (on branch `feat/website-increment-1` · **decision 66 arc #1 · increment 1** · as-built [`N+22.md`](./N+22.md)). The first REAL delivery of the `website` doc-gen ([north-star move 3](../docs/north-star.md) · the generation thesis applied to docs), a thin end-to-end vertical slice for **Button only**: descriptor → generated Markdown → kramdown → live `<nuri-demo>` + data tables. New emitter [`pipeline/parsers/docs.js`](../packages/spec/pipeline/parsers/docs.js) `emitDocPage(ir, {palette, tokens})` (wired as **Slice 9** · Button-only) renders the descriptor IR as a just-the-docs page — front-matter + **API**(axes) + **Anatomy**(el tree) + **Base**(stack + the `interactive` opt-ins) + **Token map**(per axis-value → token paths · `variant`→`palette.ts` derefs · `size`→scale leaves · one attribute/line). **READ-ONLY on the descriptor — NOT §9 · decision 2 STANDS** (we read the frozen machine-spec to EMIT docs; we do NOT generate CSS from it); **SPEC ONLY, no prose**; `tokens` is an emit-time leaf-validation guard (never reaches the bytes). Emits committed [`build/docs/button.md`](../packages/spec/build/docs/button.md) (decision 35 · re-emits byte-identical · new **Guard G** in [`docs-drift.test.js`](../packages/spec/pipeline/docs-drift.test.js) · docs-drift 5→6). The `<nuri-demo>` STORY is **authored** ([`website/_includes/demo/button.html`](../website/_includes/demo/button.html) · **decision 57.2** · "composing isn't DS work" · the "+" in move 3's "generated data + stories"), pulled in via an `## Example` include slot. The [`website/`](../website/) Jekyll/just-the-docs shell + **`stage.mjs`** (the SoT-copy asset model — `build/docs/*.md` + the runtime assets copied into the site at build · **gitignored staged copies · only the shell SOURCE committed · no drift, no duplication**) + [`pages.yml`](../.github/workflows/pages.yml) (a **separate, non-gating** Pages-on-Actions deploy). **Both de-risk probes hold**: generator faithful (byte-stable · Guard G + the `git diff` gate · matches the descriptor + `palette.ts` cell-for-cell); `<nuri-demo>` survives kramdown **verbatim** (default block-HTML passthrough via the `_includes` partial · **NO `{::nomarkdown}` fallback needed**) AND hydrates (preview-MCP: live `<nuri-button>` + the toolbar re-themes the scope). **Local-render caveat**: system Ruby 2.6 < Jekyll 4's floor, so the local proof is the kramdown spike + the preview-MCP hydration; the **full just-the-docs themed render is the Pages deploy**. **Derivable-spec gap found**: the descriptor carries no **default-per-axis** (≡ the R1.5 first-bump finding) — the API table can't mark `soft`/`md` defaults. Gates green LOCALLY: **spec 26/26** (docs-drift 5→6 · Guard G +1) · `build/` = `build/docs/button.md` only (additive · `tokens.ts`/`descriptors/*`/`palette.ts` byte-identical) · **factory 27/27 + 7 snapshots** · **tsc 0/0**. **CSS untouched** (decision 2 STANDS · §9 not taken); frozen descriptors / token data / the factory untouched. **Operator action (one-time)**: Settings → Pages → Source = **GitHub Actions** (flips off the legacy `.nojekyll` root site · until then `pages.yml` is inert). Next: **generalize the emitter** to all components (→ the full nav · retires the hand-written `pages/components/*.html` HUMAN docs incrementally · their `data-part` anatomy stays as the descriptor STRUCTURE source · Guard D) · **the axis-driven `<nuri-demo>` selects** (→ retire the authored demos · the story endgame) · the **post-deploy `@layer` font live-check** (HELD · do NOT apply blind on local Ruby) → the remaining arcs → **Digital-cash**. See [`roadmap/N+22.md`](./N+22.md) · [`decisionlog.md` §66](../decisionlog.md) · [`docs/north-star.md`](../docs/north-star.md).

N+21 · **Smell-1** — relocate the interaction baseline · retire `build/components/` (on branch `fix/smell-1-interaction-emit` · **decision 66 arc #0** · as-built [`N+21.md`](./N+21.md) + the [decision 45.1 amendment](../decisionlog.md)). The **first post-migration cleanup arc**. The decision-45 cross-component constants (`pressScale: 0.97` / `disabledOpacity: 0.4`) were mis-emitted — pipeline-inlined into per-component files (`build/components/{button,icon-button}.ts`) with the factory reaching into `button` for a non-button value (the **R1 "no transversal interaction emit"** finding). N+21 gives the family its own **transversal emit** `build/interaction.ts` (`pipeline/parsers/interaction.js` · read from the `--nuri-interaction-*` primitives · not hardcoded), `@nuri/spec` exports `./interaction`, the factory theme reads it **directly**, and the dead `build/components/` dir (8 files · read only by the retired `button-matrix` mirror) is **retired** (Guard B retired with it). The **R1 finding is CLOSED** ([`docs/RISKS.md`](../docs/RISKS.md) · Closed). **Substance done, NOT 100% closed**: a **Smell-1.1** dead-code tail is deferred — the now-vestigial per-component `@layer` walk + the 3 emitted-file header echoes still naming `build/components/<name>.ts` (header-only re-emit · gate-green · [`post-migration-cleanup.md`](./post-migration-cleanup.md) row #3). **CSS untouched** (decision 2 STANDS · §9 not taken); `build/tokens.ts` / `token-paths.ts` / `descriptors/*` / `palette.ts` byte-identical. Gates green LOCALLY: **spec 25/25** (docs-drift 6→5 · tokens-parser 19→20) · **factory 27/27 + 7 snapshots** · **tsc 0/0** · `build/` = 8 deletions + `interaction.ts`. Next: **Smell-1.1**, then the arcs — (1) `website` doc-gen → … → **Digital-cash** (the 3 remaining R1/R1.5 findings are its first-bump agenda). See [`roadmap/N+21.md`](./N+21.md) · [`decisionlog.md` §45.1 / §66](../decisionlog.md).

N+20 · post-migration direction — **decision 66 · the generation thesis** (docs-only · the pivot doc · decision **66** + amendment **57.2**). The N+19 monorepo migration is COMPLETE (M1→M4); this session records the direction it opens — **a direction-record, not a build**. The through-line is the **generation thesis** — *generate from the SoT*, extended layer by layer: **components** ✓ (the factory · decision 65) → **docs** (the `website` doc-gen) → **web-CSS** (§9) → **meta** (the slim). **The arc sequence**: (0) **Smell-1 cleanup** (retire the dead `build/components/*` · relocate the mis-homed interaction baseline) · (1) `website` doc-gen · (2) WC→RN playground tab · (3) the composing-boundary [**LOCKED · 57.2**] · (4) §9 source-inversion [direction · **audit-gated · NOT decided**] · (5) meta-slim [last phase]. **The one LOCKED decision — "composing isn't DS work" (amendment 57.2 · sharpens 21)**: composing a screen is the *consumer's* job (build-free · the playground or a chat artifact → 1:1 RN JSX handed to the RN project), so the **playground is a consumer TOOL, not DS content** (may externalize) and `my-vault` is a **demo of the tool, not DS spec**. **The re-openings (pending / per-arc · NOT silently reversed)**: **decision 2** (CSS is SoT) → §9 reverses it via **`descriptor → CSS` direct** · **audit-gated · NOT decided here** (decision 2 STANDS until the §9 arc) · **decisions 21 + 57** → amended by 57.2 (above) · **decision 24** (four readers incl. migration) → the migration reader is dead (button-matrix · M4) + the doc-gen obsoletes the hand-written pages (the dec-24.1 `data-*` anatomy survives as a descriptor source · the *framing* dies) · **what Nuri IS #1** (doc-to-code ratio HIGH) → the meta-slim revises it (the exploratory phase's tool, not a permanent identity). **Firm call — Smell-1**: post-M4 only `build/components/button.ts` is live (the factory pins `INTERACTION_BASELINE` to its decision-45 cross-component `pressScale`/`disabledOpacity` — mis-homed → relocate); the 7 others have no `exports` entry / no importer → retire (a cleanup arc · #0 · one of the four R1/R1.5 Digital-cash first-bump findings). **Parked**: NuriElement (outside decision 64's taxonomy) · the palettizable-primitives alternative (`nuri-stack`/`nuri-box` carrying the disjoint palette+box namespaces · U3 preserved) may obviate it (resolved when the playground reveals a real composition limit · P11). A **LIVING stale-map** ([`roadmap/post-migration-cleanup.md`](./post-migration-cleanup.md)) tracks the contradicted in-code prose (NOT in the immutable ledger · it shrinks as the arcs land) + the 3 in-place flags (the "CSS is SoT" lines · `AGENTS.md` rule 18 · the `build/components` refs). **Docs-only · no code · no cleanups** (the arcs do those). Gates unaffected: **spec 25/25 · factory 27/27 · `build/` byte-identical**. Next: the arcs, each P11-gated as a consumer appears → **Digital-cash**. See [`decisionlog.md` §66](../decisionlog.md) · [`docs/north-star.md`](../docs/north-star.md).

N+19 · M4 · `button-matrix` retired — **the monorepo migration is COMPLETE** (on branch · decision **65.11** · as-built [`N+19-M4.md`](./N+19-M4.md)) — the last migration step of 65.7. M3 made the `@nuri/factory` render-smoke the LIVE in-repo contract gate, so the type-only `button-matrix` mirror that gated the props-1:1 thesis since N+4 is now **redundant** (65.5's "retire LAST, after the proven-green replacement · no validation gap" condition met). **Deleted**: `docs/migration-tests/button-matrix/` (the whole dir) · the `spec` job's migration-tsc step in [`gates.yml`](../.github/workflows/gates.yml) · the root `typecheck:migration` script · `@nuri/spec`'s button-matrix-only RN devDeps (`react`/`react-native`/`@types/react`/`@types/react-native`/`typescript` — VERIFIED spec's pure-`node` pipeline imports none; `@phosphor-icons/core`+`postcss` kept). **The jest/Metro simplification — ATTEMPTED, workarounds RETAINED (the finding)**: removing the pins did NOT collapse the dual-version tree under npm's conservative re-dedupe — the orphaned `react@19.2.6`+`react-native@0.80.3` root hoists persist (the Expo ecosystem's floating `*` peers dedupe against them). VERIFIED removing the jest `moduleNameMapper` reproduces `__fbBatchedBridgeConfig`; `expo --web` + render-smoke stay green with them **kept** (comments repointed off the now-false button-matrix rationale). Two future collapses noted, not taken: a from-scratch lockfile regen (collapses but broke `jest-expo`/`lodash` · rejected as a CI lockfile) and the M2-rejected `override` (now **unblocked** — its reason, the migration tsc's RN 0.80.3, is void). **Sweep (LIVE only)**: `prompts/migration-test.md` deleted + README row · `working-session.md`/`AGENTS.md` rule 22 repointed · `docs/RISKS.md` R1/R3/R5 repointed to the factory render-smoke · `llms.txt`/`.gitignore`/`north-star.md`/`README.md`/`playground/README.md` · the docs-site's 22 dead `button-matrix` links de-linked to prose (the migration-persona prose left for the `website` arc · P11). Historical retros + the ledger left intact (don't-rewrite). **CI + cleanup only · no package feature code.** Gates green LOCALLY: **spec 25/25 · factory 27/27 + tsc 0 · expo-demo tsc 0 · `build/` byte-identical · `expo --web` renders, console clean**. **No branch-protection change** (the three job names unchanged). Next: the **north-star arcs** (`website` doc-gen · §9 · the external mirror) → **Digital-cash** (the four R1/R1.5 findings are its first-bump agenda). See [`roadmap/N+19-M4.md`](./N+19-M4.md) · [`decisionlog.md` §65.11](../decisionlog.md).

N+19 · M3 · the intra-repo gate — per-workspace CI · **R7 CLOSED** (on branch · decision **65.10** · as-built [`N+19-M3.md`](./N+19-M3.md)) — **the payoff of 65.7: the X-wired gate goes INTRA-REPO.** [`gates.yml`](../.github/workflows/gates.yml)'s single `gates` job is reshaped into **three parallel per-workspace jobs**: **`spec`** (= the old job · `@nuri/spec` test 25/25 · build byte-identical · the `button-matrix` migration tsc · stays gating here, retires M4) · **`factory`** (**THE intra-repo contract gate** — `npm test -w @nuri/factory` is the `react-test-renderer` render-smoke 27/27, which imports `@nuri/spec`'s frozen descriptors+tokens through the exports map and **RENDERS** them, so a `packages/spec/build/*` change that breaks the RN render fails CI **by construction** · plus the exports-boundary tsc) · **`expo-demo`** (the reference example tsc against `@nuri/factory`). **R7 CLOSED** — the failure mode (a contract change merges green while breaking the RN render, caught only in a separate repo) is closed by construction; R7 is **moved** to the Closed section of [`docs/RISKS.md`](../docs/RISKS.md) (reasoning preserved · move-don't-delete), **R2** was already dropped at the pivot (65.7), **R3/`button-matrix`** retires at M4. **Install-scoping verified**: `npm ci -w @nuri/<job>` does NOT scope (npm ci rebuilds the whole lockfile tree · `react-native@0.81.5` resolves identically in both install plans), so each job runs full `npm ci` — 65.7's RN-free-spec-CI optimization is **DEFERRED** (the zero-build *iteration* property is unaffected). **CI + docs only · no package code change.** Gates green LOCALLY: **spec 25/25 · factory 27/27 + tsc 0 · expo-demo tsc 0 · `build/` byte-identical · migration tsc 0**. **Operator action** (decision B · the one Settings touch · reconfigured ONCE at M3): branch-protection required check `gates` → **`spec` + `factory` + `expo-demo`** (the workflow stays named `gates`, but the required-check contexts are now the three job names). Next: **M4** retire `button-matrix` (+ the root's type-only RN pins → lets the M2 jest mapper simplify) → north-star arcs → Digital-cash. See [`roadmap/N+19-M3.md`](./N+19-M3.md) · [`decisionlog.md` §65.10](../decisionlog.md).

N+19 · M2 · absorb `expodsdemo` → `@nuri/factory` + `@nuri/expo-demo` · land the exports map (PR pending) — **the RN side comes home** (decision **65.7** M2 · as-built **[65.9](../decisionlog.md)**). `expodsdemo`'s factory + demo are **clean-copied** (NOT git-subtree · provenance: R1 `fa78e13` + R1.5 `aef962a` · its `DesignSystemSpec/build/` was **byte-identical** to `packages/spec/build/`, so the factory's value-asserting tests + snapshots pass unchanged against `@nuri/spec`) into two workspaces: **`@nuri/factory`** (the bare certified RN engine — the theme runtime + `createNuriComponent` + the ergonomic 1:1 Button/IconAvatar/Topbar · `contract.ts` is the **single seam**, its 9 imports rewritten `../../DesignSystemSpec/build/*` → `@nuri/spec/*`, every other file's relative imports byte-identical) and **`@nuri/expo-demo`** (the consumable example app · 3 imports rewritten to `@nuri/factory`). **`@nuri/spec`'s `exports` map LANDED + VALIDATED** (the M1-deferred item · §65.8): the 9 factory-face subpaths (`./tokens` · `./token-paths` · `./icons` · `./palette` · `./components/button` · `./descriptors/{schema,composition-button,icon-avatar,topbar}`) → the frozen `build/*.ts`; `pipeline/lib/styles/pages` stay internal; `build/` stays exports-hidden. The factory is the spec's first importer — its **`tsc` 0 through the map** validates the boundary. The **RN toolchain entered the repo** (cost #1 of 65.7 · accepted). **Four factory/app-LOCAL integration fixes** (`@nuri/spec` + the root's type-only pins untouched · "let them coexist"): jest `transformIgnorePatterns` +`@nuri/spec`; jest+Metro **single-React/single-RN** redirects (the workspace install splits `react@19.1.0`/`react-native@0.81.5` runtime [nested] from the root's type-only `19.2.6`/`0.80.3` → `useContext` null + `__fbBatchedBridgeConfig` + blank `#root`; a global dedupe override was REJECTED — the migration tsc needs the root's RN 0.80.3); `metro.config.js` (NEW · monorepo watchFolders + nodeModulesPaths); TS `bundler` (inherited) + explicit `types`. Plus: `typescript` standardized on `^6.0.3`; `expo` pinned `^54.0.0` (else babel-preset-expo's `*` peer floats it to 56 → jest crash). Gates green LOCALLY: **factory 27/27 · 7 snapshots · factory tsc 0 · expo-demo tsc 0 · `@nuri/spec` 25/25 · `build/` byte-identical · migration tsc 0**; the demo renders intra-repo (Expo Web · light+dark · NuriScope neutral override inverting cream · console clean). **`gates.yml` UNCHANGED** (decision B — the per-workspace matrix + R7 closure + branch-protection reshape land ONCE at M3); no operator Settings action. Next: **M3** intra-repo gate (the factory render-smoke gates `@nuri/spec/build` · **R7 closes**) → **M4** retire `button-matrix` (+ the root's type-only RN pins, which lets the M2 jest mapper simplify). See [`roadmap/N+19-M2.md`](./N+19-M2.md) · [`decisionlog.md` §65.9](../decisionlog.md).

N+19 · M1 · monorepo skeleton + `@nuri/spec` carve-out (PR pending) — **the repo is now an npm-workspaces monorepo; the radix `@nuri/spec` is carved** (decision **65.7** M1 · as-built **[65.8](../decisionlog.md)**). `lib/ + pipeline/ + build/ + styles/ + pages/` moved **as one block** into `packages/spec/` (`git mv` · history preserved · their inter-relative paths survive), so the docs site renders **byte-identical** from its new path and the emit is **byte-identical** at `packages/spec/build/` — **the discriminator held** (no CONTENT change to lib/styles/build/pages · only external referrers repointed). Root `package.json` → `workspaces: ["packages/*"]` + thin delegating scripts; `@nuri/spec` is `private` · `type:module` · build/test scripts + all devDeps (workspace-hoisted) · **NO `exports` map yet** (deferred to M2, its first importer). Gates green at the new paths: **test 25/25** · `npm run build -w @nuri/spec` clean · `git diff --exit-code packages/spec/build/` clean · migration tsc 0 (button-matrix kept RELATIVE on `../../../packages/spec/build/*` · retires M4). `gates.yml` → the job **stays named `gates`** (now workspace-scoped to `@nuri/spec` · single job · M3 → per-workspace matrix); **no branch-protection change** (the rename is deferred to M3 · no Pages Settings change either — root `index.html` redirect repointed to the deeper path). Resolved naming (65.8): npm `"*"` not `workspace:*` · `packages/` not `apps/` · `@nuri/*` scope · `build/` stays `build/` (exports-hidden) · pages/playground stay in `spec` · website/playground-split/`apps/*` deferred. Operational docs repointed (`AGENTS.md` · `llms.txt` · `README.md` · `prompts/working-session.md` · `prompts/coordinator.md`); historical records left intact (skills + button-matrix FRICTIONS + design-docs flagged as later doc-debt · don't-rewrite-the-ledger posture). Built **only `spec`** — no speculative scaffolds (P11). Next: **M2** absorb `expodsdemo` (`factory` + `expo-demo` · the `exports` map + RN toolchain against the proven structure) → **M3** intra-repo gate (**R7 closes**) → **M4** retire `button-matrix`. See [`roadmap/N+19-skeleton.md`](./N+19-skeleton.md) · [`decisionlog.md` §65.8](../decisionlog.md).

N+19 · monorepo pivot (decision **65.7** · 2026-06-19) — **the repo becomes an npm-workspaces monorepo · 65.5's monorepo rejection REVERSED**. The relocation's cross-repo direction (R2 · a version-cut gate against a separate public `expodsdemo` · R7) is **superseded**: rather than wire a cross-repo seam, the repo **absorbs the consumer as workspaces** and the X-wired gate becomes **intra-repo**. 65.5 rejected the monorepo *"only if the repo ever ships an RN package"* — the north-star ([`docs/north-star.md`](../docs/north-star.md)) makes that the plan, and **per-workspace CI** keeps the RN toolchain out of the web gates (zero-build is an *iteration* property · preserved regardless of a sibling `node_modules`). Layout = a DAG rooted at **`spec`** (lib+pipeline+build · the frozen SoT) → **`factory`** (the bare certified RN engine · **the theme provider lives here**) → **`expo-demo`** · plus **`website`** (docs generated mechanically from the data · stories via the build-free `<nuri-demo>`) + **`playground`** (build-free · at HEAD = the next version). The RN team imports only `@nuri/factory` (render-gated against `@nuri/spec@vN` — the certified factory). R1/R1.5 **carry over** into `factory`; **R2 dropped · R3 trivial · R7 dissolves**. Two accepted costs: the repo is no longer "pure web"; external only-git consumption of one `@nuri/factory` needs a subtree-split mirror (npm can't git-install a workspace subdir · RFC #462 unshipped). **No code yet** — decision + direction captured; migration handed off ([`roadmap/N+19-monorepo.md`](./N+19-monorepo.md) · skeleton → absorb `expodsdemo` → intra-repo gate → retire `button-matrix` → north-star arcs → Digital-cash). See [`decisionlog.md` §65.7](../decisionlog.md) · [`docs/north-star.md`](../docs/north-star.md).

N+19 · R1.5 (expodsdemo PR #3 · `aef962a`) — **the consumable factory example** (the relocation's consumer side · X-wired · **65.5**). `expodsdemo` pivots from migration-demo to **the clean factory example the nuri RN team copies**: the migration era retired (`DesignSystemSpec/` → `build/` only · the 15 hand-written components + the parity test + MyVault deleted · **net −41,825 lines**), and the **1:1 typed consumer API** lands — `createNuriComponent<A>` returns `FC<{[K in keyof A]?: A[K]} & base>`, so the descriptor's typed axes become NAMED props (`<Button variant="solid" size="md">Buy</Button>` ≅ `<nuri-button …>` · *what Nuri IS #4*), `children` → the primary content part, first-axis-value fallback, all derived from `descriptor.variants` + the anatomy (**zero per-component code**). A demo (`Demo.tsx`) renders the ergonomic Button/IconAvatar/Topbar under `NuriThemeProvider` (mode/accent · 27/62) + a `NuriScope` override (63) in light/dark (verified Expo Web · 0 console). **Two findings** (the first-bump agenda): no default-per-axis in the frozen contract (factory → first value; the web default differs); boolean axes stringly-typed (`center="true"`, not `center`). Gates green (test **27/27** · tsc 0). Coordinator-reviewed at merge (gates re-run · cleanup + API + genericity verified first-hand · nuri `build/` untouched · Guard F). Next: **R2** (the gating seam). See [`roadmap/N+19-R1.5.md`](./N+19-R1.5.md).

N+19 · R1 (expodsdemo PR #2 · `fa78e13`) — **the descriptor-consumption flow** (the relocation begins · X-wired · **65.5** · R7). The frozen contract (`build/descriptors/*`) proven **consumable end-to-end** on RN through ONE generic, schema-driven factory: `createNuriComponent` walks the anatomy + resolves the five namespaces (`assertNever`) into RN — behaviour stays factory code (65); the SAME function builds all three descriptors (**genericity**, no per-component branching). `react-test-renderer` render-smoke + committed snapshots; **parity proven** — factory resolved-styles == the hand-written `Button` across the variant×size×accent×mode matrix (the `button-matrix` parity, now RENDERED · the proof relocates · 65.5). The theme runtime (`NuriThemeProvider`/`resolveToken`/`typeStyle`) is reused; the engine is custom, **Unistyles-SHAPED** (decision 7 · no Unistyles dependency). **Two findings**: no transversal interaction emit (per-component; the factory pins to the embeds); `subtle` fg-only vs the §11 sketch. Built ALONGSIDE the hand-written mirrors (the live anchor · retired in R1.5). Gates green (test **51/51** · tsc 0). Coordinator-reviewed at merge (gates re-run · snapshot byte-identical to nuri `build/` · parity genuine · nuri `build/` untouched · Guard F). Next: **R1.5**. See [`roadmap/N+19-R1.md`](./N+19-R1.md).

N+19 · B3 (#30) — **the contract freeze** (decision 65 step 5 · ratified **65.6**). The descriptor contract shape — `Descriptor = { structure:{anatomy,base}, variants? }` over the five namespaces, in its final B2c·2 composition form — is now an **enforced freeze**. New **Guard F** ([`pipeline/docs-drift.test.js`](../pipeline/docs-drift.test.js) · the operator-chosen **runtime structural pin** · mechanism B over the compile-time `AssertEqual` mirror A): a legible `FROZEN_SCHEMA` spec pins all **19 exported schema types** — the namespace field vocabularies **+ value-types**, the leaf vocabs, the `Part`/`El`/`NS`/`PartAnatomy`/`PartMap`/`Descriptor`/`Axes`/`Variants` envelope — and asserts `schema.ts` declares exactly that; a field added/removed/renamed/**retyped** or a union member moved **breaks the build** (*"an enforced freeze, not honorary"*). Verified to **bite** (6 perturbation classes + restore byte-identical · and `tsc` does NOT catch an unused-field *declaration*, so F adds coverage the typecheck lacks). **Locks the cross-repo TYPE; per-component axes/values stay free** (Guard D keeps those faithful to CSS · **D = instances · F = the shape**). FROZEN header + versioning intent in source + emit (a post-freeze change = update the pin + a 65 amendment · the negotiation machinery deferred to its first bump · P11); `AGENTS.md` hard-rule 21 extended. Gates green (test **25/25** · build header-only · tsc 0). Next: **RN relocation** (X-wired · 65.5). See [`roadmap/N+19-B3.md`](./N+19-B3.md).

N+19 · B2c·2 (#28) — **descriptor re-emit · raw-style schema → pure namespace composition** (65.3 §7 · supersedes 65.2 · ratified **65.4/65.5**). The emitted component descriptor moves from the theme-thunk raw-style schema to **pure data** `{ structure:{ anatomy, base }, variants? }` — a composition of the five disjoint namespaces (stack · box · typography · palette · interactive) in **semantic names** the platform-native engine resolves, **zero raw style**. Dropped: the `(theme) =>` thunk · `ViewStyle`/`TextStyle` · `$parts` · `compoundVariants` · `Surface`/`Theme` · the RN import (schema now imports only `./tokens`). **`base` is per-part** (`PartMap`) so the Topbar pivot's `stack{fill:'grow-shrink'}` lives in `base.content`; **`PartAnatomy` is purely structural** (`el`/`open`/`parts` · no styling slot · the anatomy-vs-base load-bearing marker deferred · B1.5 §4.1). **`interactive` is a structured per-part opt-in** `{ pressColor?, pressScale?, disabledOpacity? }` on `base.root` (values engine-derived · **no compounds** — the press transition is the factory's, not data · decision 65); the **variant→fg drops** out of the patch (follows by scope · F-BOX-FG-1 · the factory threads it). The three descriptors match [`composition-model.md`](../docs/composition-model.md) §8 cell-for-cell; the emitter (`pipeline/parsers/descriptors.js`) derives the form from the `@layer` CSS + page anatomy and still validates funnel/scale/interaction-baseline (**Guard D** reworked · teeth re-confirmed · 7/7 perturbations throw). **Only `build/descriptors/*` changed** (`palette.ts`/`tokens.ts`/`components/*` byte-identical). Gates green (test **24/24** · build idempotent · tsc 0). Next: **B3** freeze. See [`roadmap/N+19-B2c2.md`](./N+19-B2c2.md).

N+19 · B2c·1 (#27) — **the `interactive` namespace web channels** (65.3 §6 · the B2b-deferred pressed dispatch · ratified **65.4**). Ships the web realization of **`interactive`** — a **structured per-part opt-in**, not a boolean (the effects are proven independent on `main`: Button = pressColor+pressScale+disabledOpacity · `list-interactive-item` = pressColor-only [dec 52] · `tab-bar` = pressScale-only [dec 56]). New [`lib/components/interactive/interactive.css`](../lib/components/interactive/interactive.css) (empty `@layer tokens` · skip-emit · decision 37): `.nuri-interactive` base affordance (cursor · transition · `:focus-visible` ring) + gated `[data-press-scale]:active` scale + the disabled-opacity, values mirroring `button.css` (the SoT witness · interaction constants consumed direct · decision 45). [`palette.css`](../lib/components/palette/palette.css) gains the **pressed `:active` bg swap** (the B2b-deferred row · gated `[data-press-color]` so a static surface never matches `:active`): solid→`accent-solid-pressed` · soft→`bg-pressed` · ghost→`bg-subtle`. **Guard E extended** — the pressed rows asserted cell-for-cell vs `button.css` `:active` ≡ the `pressedBg` column (stray-rule rejection extended, **not** weakened). **box.css untouched** (geometry-only · the transient is interactive's). RN data-ready (`resolvePalette` carries `pressedBg`; the scale/opacity/Pressable wiring is the factory's). Gates green (test **24/24** · build byte-identical · tsc 0 · visual checkpoint: merged node presses pixel-identical to Button · static chrome no `:active` swap). **Carry to the relocation**: the factory must block the palette bg-swap when disabled (the CSS layer reverts scale + dims opacity only). See [`roadmap/N+19-B2c1.md`](./N+19-B2c1.md).

N+19 · U3 (#25) — **Box → purely geometric** (the disjointness cleanup · amendments **42.1** + **60.1**, operator-ratified at merge). Box sheds its two non-geometric props so a node = **box ⊕ stack ⊕ palette with zero attribute overlap** (operator-locked): **`background` removed** → palette owns all colour (the chrome backgrounds ≙ palette's **chrome** slot · `accent-solid` ≙ **`variant=solid`** with the complete bg+fg pair the decision-42 coupling only approximated · **`accent-subtle` dropped slotless**, the `accent.bgSubtle` tokens retained); **`fill` removed** → stack's `grow|grow-shrink` enum carries flex-grow (§6 `flexGrow → stack`). **`radius` stays** (geometry). Consumers migrated to the **merged class-layer node** (the canonical multi-namespace form · B1.5 §4.2): `tabs.js` tablist = a plain `<div class="nuri-box nuri-palette" data-chrome="strong" data-radius="md" data-padding="xs">` (NO `<nuri-box>` element — pixel-identical, verified in-browser: bg/radius/padding/color ≡ pre-change) + `tabs.tsx` resolves `chrome=strong` via `resolvePalette` onto one `<View>`; `my-vault` fill = `class="nuri-box nuri-stack" data-fill="grow"`; `screen.html`/`box.html` surfaces → the class layer. New [`pages/components/palette.html`](../pages/components/palette.html) (the colour story · 7 sections) + `llms.txt` + shell nav. **F-BOX-FG-1** Box case retired (colour ownership now palette end-to-end · engine B2b · delivery B2c). Gates green (test **24/24** · tsc 0 · build byte-identical · zero console errors). Next: **B2c** (re-emit + factory + mirror rewire + `interactive`). See [`roadmap/N+19-U3.md`](./N+19-U3.md).

N+19 · B2b (U2) — **the palette engine** (the colour namespace · 65.3 §6 · the second B2 foundation build · no decision). **The contract rule (operator-settled): a palette surface resolves its COMPLETE pair — bg AND fg — explicitly** (no ambient · no inheritance semantics · no fg React-context; the "ambient" of the B1.5 prototype was a harness delivery trick, not the system — the CSS SoT declares fg per variant, `button.css:164–176` / `topbar.css:87–88`). Ships three readers of ONE table `{variant solid|soft|ghost|subtle ⊕ chrome canvas|subtle|strong} → {bg · fg · fgMuted · pressedBg}`: (1) **emitted mapping** [`build/palette.ts`](../build/palette.ts) (pipeline slice `pipeline/parsers/palette.js` · TokenPath-typed · accent×theme-GENERIC, decision-34 indirection · emitted ONCE, 65.2 surface-as-data · ghost.bg = literal `transparent`, the ghostBg convention); (2) **web dispatch** [`lib/components/palette/palette.css`](../lib/components/palette/palette.css) — class+`data-*` on the painting node (merged-node · B1.5 §4.2 · **NO element, NO JS** — element P11-deferred · empty `@layer tokens`, decision 37 · accent rides the existing `data-accent` scope · **pressed dispatch deferred to B2c** with the `interactive` flag, `pressedBg` is data-only · muted stays Typography's dispatch); (3) **RN resolver** `palette.tsx` `resolvePalette(ns, ctx, state)` (typecheck-only · decision-65 boundary), with the existing colour funnels **delegating to it** as the P11 first consumers (`button.tsx` `variantStyle`/`labelColor` · `icon-avatar.tsx` incl. fg-only `subtle` — same TokenPaths in → same colours out · **prop unions untouched**). **Guard E** (`docs-drift.test.js` + build-time): author-in-emitter asserted cell-for-cell against the CSS SoT (button.css aliases · icon-avatar subtle · topbar's chrome pair · typography muted · palette.css's own rows with stray-rule rejection) + re-emit ≡ committed + **the operator table pinned in the test**; chrome subtle/strong (no live recipe witness yet): fg slot-uniform ≡ canvas, bg tied via classifier — deliberately NOT witnessed against box.css's `data-background` (U3's deprecation target). RESERVED mapped-not-built (decision 30): `outline` · `border` · `onSolid.muted`; **`accent-subtle` gets NO palette slot** (fate = U3's migration table). Gates green (test **24/24** incl. Guard E · tsc 0 · build: existing emit byte-identical, `build/palette.ts` sole addition · 7/7 in-browser probe rows ≡ table · box/stack disjointness confirmed). Next: **B2c**. See [`roadmap/N+19-B2b.md`](./N+19-B2b.md).

N+19 · B2a (U1) closed (#23) — **box + stack geometry primitives** (the first of the [B1.5](./N+19-B1.5.md) §2 extension list · foundation build · no decision). **box** gains sizing props **`width`/`height`/`minHeight`** (geometry only · NO colour · 65.3 §6) dispatched exactly like decision-42 `background`/`radius` (attribute → `data-*` → `@layer rules` · `@layer tokens` stays empty · decision 37); web uses the logical `inline-size`/`block-size`/`min-block-size`, value vocab = the **full** semantic size scale `--nuri-size-*` (xs..3xl · the whole coherent leaf set, like `RADII`) with a `SIZES` enum + `console.warn` guard. **stack** `fill` boolean → enum **`grow | grow-shrink`** (`grow` = today's `flex:1 0 auto` · `grow-shrink` = `flex:1 1 auto` + `min-inline-size:0` · the Topbar content-pivot); **decision-60 back-compat preserved** (bare `fill`/`fill="grow"` = grow · the lone consumer unaffected). RN mirrors 1:1 (`box.tsx` `width/height/minHeight: SizeLeaf` → `size[…]` · new `SizeLeaf = keyof typeof size` in `_shared.tsx` · `stack.tsx` `fill: boolean|'grow'|'grow-shrink'`; the web `min-inline-size:0` seam is a no-op on RN/Yoga — noted, no knob). **`box.background` untouched** (its removal is U3) · **no new tokens · `build/` byte-identical · skip-emit intact**. Gates green (test 23/23 · tsc 0 · build byte-identical · in-browser computed-style sanity). Runs in PARALLEL with U2 (palette). See [`roadmap/N+19-B2a.md`](./N+19-B2a.md).

N+19 · B2 — **build phase ([`roadmap/N+19-B2.md`](./N+19-B2.md) · B2a #23 · B2b #24 · U3 #25 · B2c·1 #27 · B2c·2 #28 · B3 #30 · next RN relocation)**: turns the validated composition model (65.3) into the emitted → Expo-consumed contract (**X-wired** · 65.5 · the in-repo factory-draft + mirror path retired). Board: **B2a** ✓ box/stack geometry · **B2b** ✓ the `palette` engine · **U3** ✓ Box → purely geometric (a node = box ⊕ stack ⊕ palette · zero attribute overlap) · **B2c** (handoff [`N+19-B2c.md`](./N+19-B2c.md)) decomposed: **·1** interactive-channels ✓ (#27) · **·2** re-emit + schema ✓ (#28) · **B3** ✓ contract freeze (schema-shape guard · Guard F · 65.6 · #30) → **RN relocation** (coordinator handoff [`N+19-relocation.md`](./N+19-relocation.md) · amendment **65.5**) decomposed: **R1** ✓ the descriptor-consumption flow (generic factory + render-smoke · expodsdemo #2) · **R1.5** ✓ the consumable example (1:1 typed consumer API + demo · migration era retired · expodsdemo #3) → **monorepo pivot** (decision **65.7** · 65.5 REVERSED · the gate moves **intra-repo** · R2 dropped · R7 dissolves) → migration ([`N+19-monorepo.md`](./N+19-monorepo.md) · skeleton → absorb `expodsdemo` as `factory`+`expo-demo` → intra-repo gate → retire `button-matrix`) → north-star arcs ([`docs/north-star.md`](../docs/north-star.md)) → Digital-cash (first post-freeze consumer · the four R1/R1.5 findings are its agenda). The factory becomes the in-repo `factory` workspace (65.7 · supersedes 65.5's "Expo consumer's, not in-repo"). See [`roadmap/N+19-B2.md`](./N+19-B2.md).

N+19 · B1.5 closed (#21) — composition-model validation (playground prototype) · **[decision 65.3](../decisionlog.md) VALIDATED**. The three recipes (Button · IconAvatar · Topbar) compose to **pixel-parity** with the live components from the curated primitive namespaces alone — `stack` · `box` · `typography` · `palette` + the `interactive` flag — with **zero raw style** (audited · `offenders: []` · `box.background` used 0×), proven in-browser (visual + computed-style · all IDENTICAL). Ships [`pages/playground/composition-prototype.html`](../pages/playground/composition-prototype.html) (live-vs-composed across variants / sizes / states) + the report [`roadmap/N+19-B1.5.md`](./N+19-B1.5.md) — the **B2 extension list**, the **CSS→composition mapping** (`@layer` value → namespace prop), and the **model strains**. Two boundary strains **resolved with the operator at the checkpoint**: (1) **box owns no colour** — `palette` owns all colour incl. the chrome slot; decision 42's `box.background` is superseded *for composition* (a Box-API deprecation flagged as a follow-on · live consumer Tabs · B2/P11); (2) **inline-vs-block dissolves** — RN is flex-only (no inline/block), so a recipe root is a plain `flex` node blockified by its flex parent (no stack `inline` knob · measured: live `inline-flex` ≡ composed `flex` at equal widths). Extensions B2 ships (rebuilt recipes as consumers · P11): **box** sizing (`width`/`height`/`minHeight`) + `transform` + `opacity` (geometry only) · **stack** `fill`→`grow|grow-shrink` · the **palette** engine (all colour · no primitive today) · the **interactive** flag (factory) · the factory's **one-merged-node** realization (the `display:contents` wrapper can't merge or inline-augment · report §4.2). **No re-emit · `build/` byte-identical · no new decision** (65.3 affirmed). Gates green (test 23/23 · build byte-identical · tsc 0). See [`roadmap/N+19-B1.5.md`](./N+19-B1.5.md).

N+19 · composition model — **design-base landed (no code session yet · [`docs/composition-model.md`](../docs/composition-model.md) §6–9 · amendment 65.3)**: the R-EXPO-6 descriptor schema is refined from raw-style patches (65.2) to a **composition of curated primitive namespaces** — the shared cross-repo authoring language. A recipe = 100% composition (zero raw style) over five disjoint namespaces — `stack`(flexbox) · `box`(sizing/padding/radii/border-w/transform/opacity) · `typography`(font) · `palette`(all color from `{variant, accent, muted, interactive}`) · the `interactive` flag — with two layers (composition primitive fixes *anatomy* + overridable defaults · recipe *locks the design* · decision 64) and the data model `Descriptor = {structure:{anatomy, base}, variants}`. `surface → palette`. CSS stays SoT (the 65.1 bootstrap · §9 source-flip deferred); the contract is **authorable** (Expo composes in it; bottom-up promotion), not only emitted. **Supersedes 65.2's raw-style `$parts` schema** (B1's pipeline / values / part-targeting insight carry forward; the emitted *form* is reworked). Validated by **B1.5** (closed · see the entry above — 65.3 VALIDATED). See [`docs/composition-model.md`](../docs/composition-model.md).

N+19 · B1 closed (#18): **the emitted
component descriptor — R-EXPO-6 vertical slice 1/3** ([decision 65](../decisionlog.md) · **amendment
65.2**). The build now emits a per-component **descriptor** — the frozen cross-repo contract instance
— additively under [`build/descriptors/`](../build/descriptors/): the canonical **schema** (a theme
thunk `(theme) => ({ variants, compoundVariants? })` · the CVA core + part-addressable `$parts` + the
one semantic `typeStep` ref · hand-maintained source
[`pipeline/descriptors/schema.ts`](../pipeline/descriptors/schema.ts)) + the baseline **Theme** shape
(surface-as-data · reuses the emitted scale types · decision 48), and one descriptor each for
**Button** (`composition-button` · recipe + `label`/icon parts · the asymmetric size×{radius,type} ·
5 compounds · includes `ghost` → forces the RN union to add it · F-DEMO-5), **IconAvatar** (static ·
`subtle` · no compounds), **Topbar** (layout primitive · `center` → 100% on `$parts.content`). The
emitter ([`pipeline/parsers/descriptors.js`](../pipeline/parsers/descriptors.js)) reads BOTH sources
(decision 65 · one source, two readers): the `@layer` CSS for the mapping half (the 65.1 bootstrap ·
realizes the spike `derive-button.ts`) + the page `data-part` anatomy for the structure/parts half
(decision 24.1) — `button.html` gains the `label` part it previously hid (the web is one node). A 4th
drift guard (`docs-drift.test.js` D) re-derives each descriptor from its sources so a renamed/removed
part / variant / token breaks the build + test (the TokenPath discipline · ship item 6). **Additive**
— `tokens.ts` / `components/*.ts` byte-identical; the descriptor is new files only. Schema validated
by the variants-model spike (preserved at [`variants-model-spike.md`](../docs/variants-model-spike.md)).
**NOT** the RN factory / mirror-rewire / freeze — those are **B2** (the Expo team's factory boundary ·
mirror derive) and **B3** (the schema-guard freeze). Gates green (test 23/23 · `build/` additive +
existing emit byte-identical · tsc 0). See [`roadmap/N+19-B1.md`](./N+19-B1.md).

N+18 closed (#15): **Topbar → content-pivot open primitive**
(**amendment 46.4** · **decision 64**). Topbar drops JS region-reparenting and becomes an OPEN
primitive on the **content-pivot** anatomy — a named `<nuri-topbar-content>` layout pivot
(`flex:1`) + **positional** leading/trailing siblings (anything before the pivot is leading, after
is trailing). **Deleted**: the reparenting (`querySelector`/`createElement`/`appendChild`), the
`data-leading/-trailing` occupancy detection, the `display:none` empty-side collapse, and the
`<nuri-topbar-start>`/`<nuri-topbar-end>` defs. **Kept**: `center` + declarative per-edge `inset`
(default `lg` · override `xs|sm|lg` · never auto-by-type). The bare-text title **REUSES Typography**
(the `.nuri-type-lg--em` utility on web / `<Typography size="lg" emphasis>` on RN · the single
text-style owner · decision 53), **never** a hand-applied `--nuri-type-*` block (supersedes 46.2's
font-bearing `.nuri-topbar__center`); a non-text centre passes through untyped. This **resolves
R-EXPO-2 a/b/c** (= SPEC-FEEDBACK `F-DEMO-6`) **structurally**: (a) no phantom gap — a positional
empty side is absent; (b) no collapsed trailing — controls are self-sized, no `flex:0` side region;
(c) the non-text centre is not `<Text>`-wrapped. **center** centres the content WITHIN the pivot —
pixel-perfect for symmetric sides (the segmented switch · the common centred shape), ~7px off for
asymmetric sides (the action bar · the equal-flex side wrappers are gone); the operator chose
**ship as-is** (true-centre for asymmetric action bars → a future `screen-header`/`action-bar`
recipe · P11). RN mirror 1:1 (`topbar.tsx` · `TopbarContent` pivot · height corrected
`size.xl`→`size.lg` to match web). The playground consumer (`lib/playground/shell.js`) migrated to
the positional API (operator-approved). **Skip-emit · `build/` byte-identical · no new decision.**
Web-first → RN mirror → re-validated vs the 8-shape gallery (preview MCP). Gates green (test 22/22 ·
build byte-identical · tsc 0). Runs in PARALLEL with Session A (List/NavItem · amendment 52.2) on
disjoint files. See [`roadmap/N+18.md`](./N+18.md).

N+17 closed (#14): **List family → content-pivot + scalar NavItem** (amendment 52.2 ·
the List half of [decision 64](../decisionlog.md#64-composition-model--open-primitives--closed-recipes--naming-taxonomy--text-single-owner--n17)).
Mechanical implementation of a decided contract — **no new decision · no emit-shape change ·
`build/` byte-identical**. (1) **ListItem** is now an OPEN primitive on the content-pivot:
`<nuri-list-item-content>` (`flex:1; min-inline-size:0`) is the only wrapped region; leading /
trailing are **positional siblings** around it. **Deleted** the `<nuri-list-item-leading>` /
`<nuri-list-item-trailing>` element defs + CSS and the bare-text `margin-inline-start:auto` patch
— the pivot's `flex:1` pushes trailing by construction. This aligns web to the already-validated
RN shape, and the pivot maps to a `<View>` (never a `<Text>`), structurally avoiding the
R-EXPO-2c class. (2) **NavItem** is now a CLOSED scalar recipe — `text` / `icon?` (→ leading
IconAvatar) / `variant?` / `accent?` / `onpress` (required); the children-distribution `while`-loop
is gone; caret always-present, muted via `.nuri-nav-item__caret` (decision 38). (3) RN mirrors
match 1:1 (`ListItemContent` + positional children · scalar `NavItem`); `app.tsx` demos updated;
tsc 0. (4) Pages updated to the content-pivot + scalar shape; **behavioural-delta sections** added
to both List pages (the only interactive component pages lacking one · amendment 24.1) surfacing
the **irreconcilable** a11y gaps `F-LISTITEM-ROLE-1` + `F-FOCUS-1`. **The `flex:1` STOP**: the
operator flagged that the content-pivot's structural flex values are hand-mirrored in `list.tsx`
(not machine-checked); the coordinator decided **NOT to emit** them — they are structural
invariants (like `flex-direction:row`), Topbar's content-pivot shares them but is skip-emit, and
the systemic fix is **R-EXPO-6** (Open Question #2). They stay hand-mirrored (correct, not debt ·
known-deferred). **No Topbar** (amendment 46.4 is a separate decision-64 session). Closeout audit
clean (0 Bugs · 0 actionable Drift). Gates green (test 22/22 · build byte-identical · tsc 0). See
[`roadmap/N+17.md`](./N+17.md).

N+16 closed (#11): **RN mirror layout back-ports** (R-EXPO-3/4/5). The first real
Expo render (SPEC-FEEDBACK `F-DEMO-2/3/4`) surfaced three RN-layout realities the
TYPE-ONLY migration mirrors structurally couldn't catch; this session back-ported the
consumer's **already-validated** fixes into the canonical mirrors — a **mechanical
conformance pass**, no new decisions (same posture as N+14's sbavature). (1) **Button**
drops its base `flex: 1` — the web `.nuri-button` is `display: inline-flex` with no
flex-grow, so a leaf control stays content-sized; full width in a column comes from the
parent's default `alignItems: 'stretch'` (F-DEMO-2). (2) **Scroll** now defaults
`contentContainerStyle={{ flexGrow: 1 }}` (overridable) — a `ScrollView`'s content
container is content-sized by default, so a `Box fill` child had no slack to grow into;
growing the content container is the faithful RN realization of the web's
definite-height flex-column scroll (F-DEMO-3 · [decision 60](../decisionlog.md#60-box--stack-fill--grow-to-fill-a-flex-parent--the-scrollview-contentcontainer-pattern--n11)).
(3) **Separator** becomes axis-ABSOLUTE (`width: '100%'` + `flexShrink: 1`, was
`alignSelf: 'stretch'`) — stretch fills the CROSS axis, so it collapsed to 0 width in a
ROW; the web is `inline-size: 100%` (F-DEMO-4). Each mirror now matches **both** its web
SoT and the consumer's resolution; the `scroll.tsx`/`separator.tsx` headers (which
described the OLD buggy behaviour) were rewritten. **Topbar (R-EXPO-2) deliberately
EXCLUDED** — a larger migration issue under separate investigation. **Type-only mirrors**
(`noEmit`) → green `tsc` proves TYPES, not layout; the render validation is the Expo
consumer (out of scope here). No `lib/` / `pipeline/` / `build/` touched (web already
correct · `build/` byte-identical · SPEC-FEEDBACK snapshot left frozen). Closeout audit
clean. Gates green (test 22/22 · build · no `build/` diff · tsc 0). See
[`roadmap/N+16.md`](./N+16.md).

N+15 closed (#7): **accent×theme self-scope cascade fix**. A pre-existing
cascade bug — a Tier-2 component that self-scopes its accent (sets `data-accent`
on its inner element, NOT `data-theme`) showed the **LIGHT** accent value inside a
**dark** ancestor scope, so the playground My-vault dark frame rendered the swap
IconButton (`solid`/`neutral`) and the IconAvatars **dark-on-dark (invisible)**.
Root cause: the dark accent overrides were **compound** selectors
(`[data-accent="X"][data-theme="dark"]`) needing both attributes on the **same**
element, but a self-scope only carries `data-accent` while `data-theme` lives on an
ancestor — so the light base block clobbered the inherited dark values and the dark
block never re-matched. Fix (approach A · **parser-transparent**): two
**descendant-combinator** dark blocks — `[data-theme="dark"] [data-accent="X"]`
(**#4b** neutral · all 6 adapting tokens · **#6b** lilac · the 3 adapting tokens,
P4 frozen brand triple intentionally omitted) — so an ancestor's dark theme
re-applies the dark accent to a self-scoped descendant. Candidate **B**
(accent-as-pointer indirection) **rejected**: it breaks `classify-by-cascade` and
the `build/tokens.ts` emit is the RN deliverable. #4b/#6b mirror the existing dark
cell values → **emit byte-identical**. Documented **known limitation** (a
descendant combinator matches ANY dark ancestor, not the NEAREST theme · a
nested light-in-dark self-scope resolves dark) accepted per **P11** as a
revisit-trigger (**F-SCOPE-3**); no current consumer nests opposite themes. The RN
single-context model (decisions 27/62) is **immune** (positive control). Web-CSS-
only · RN mirrors untouched. Gates green (test 22/22 · build byte-identical ·
tsc 0) ([decision 63](../decisionlog.md)). See [`roadmap/N+15.md`](./N+15.md).

N+14 closed (#6): **migration-conformance fixes**. A read-only conformance audit
(triage-only · not merged) found the button-matrix migration test **FAITHFUL** to
both specs (0 CODE-DEVIATES · 0 CONCEPT-MISMATCH · theming model matches the
shipped-shape block verbatim) — only 3 doc/code sbavature plus one operator-gated
sourcing question. This session fixed exactly those, no new decision: (1) the
impl-guide cascade cell that called density/neutral *"Optional in `NuriThemeValue`"*
now reads **"reserved · not fields today"** (matching the page's own shipped-shape
block + `scope.html`); (2) the Tier-2 self-scope **skeleton** was rewritten to match
the live `button.tsx` (per-size `GEOMETRY`/`LABEL_KEY` · `typeStyle` label · no
nonexistent `styles.label`); (3) `list.tsx` `DensityContext` → **`RowDensityContext`**
(+ comment) to clear the name collision with the reserved scope `density` dimension;
(4) at the checkpoint the operator chose to source IconAvatar geometry from the
**shared semantic scale** (`resolveToken('size.lg'/'radius.full')`) — mirroring the
web `.nuri-icon-avatar` which consumes `var(--nuri-size-lg)`/`var(--nuri-radius-full)`
directly and does NOT alias icon-button's tokens — removing the lone RN hardcode
**without** coupling to `iconButton.*` and **without** amending decision 50. Closeout
audit clean (0 Bugs · 0 Drift). Gates green (test 22/22 · build · no `build/` diff ·
tsc 0). See [`roadmap/N+14.md`](./N+14.md).

N+13 closed (#5): **migration-test reconciliation**. The N+12a docs-freshness
pass shipped `pages/components/scope.html` prescribing a SINGLE `NuriThemeContext`,
and N+12b split the `button-matrix` monolith one-file-per-component — which exposed
that the RN mirrors still carried the **two per-dimension contexts** (`AccentContext`
+ `ThemeContext`) decision 27 had **REJECTED**. N+13 closes that spec↔example gap:
`_shared.tsx` now exposes one `NuriThemeContext` (`{ mode, accent }`) + a composite
**`NuriScope`** with merge-on-override, every mirror reads one `useContext`, and the
Tier-3 demo is `<NuriScope accent="neutral">` (accent flips, mode inherits). Two
live dimensions = the **n=1 confirmation** decision 27 awaited, so **F-SCOPE-1 is
CLOSED** ([decision 62](../decisionlog.md#62-nurithemecontext-implemented--the-single-orthogonal-theming-context-lands-in-the-migration-test--n13)).
The three N+12b-logged drifts landed as faithful-to-web adds (**D1** Box
`background`/`radius` · **D2** Button `size` · **D3** Tab `disabled` · **D4**
IconButton emit-deref) with **F-BOX-FG-1** + **F-TAB-DISABLED-1** logged. The scope
page, `scope/README.md`, and impl-guide now describe EXACTLY what the examples do
(zero residual gap); `density`/`neutral` stay reserved (P11) until their web tokens
ship. Gates green (test 22/22 · build · no `build/` diff · tsc 0). See
[`roadmap/N+13.md`](./N+13.md).

N+11 closed: the **layout scaffold** — building the My-vault wallet screen
point-by-point (operator-driven) exposed the layout-API gaps a real screen needs,
and each was closed in the DS rather than papered over with page-local CSS. The
vault body is now **100% DS composition** (zero page-local `<style>`). Shipped:
three new layout primitives — **`<nuri-screen>`** (full-height column),
**`<nuri-scroll>`** (grow + overflow · scrolling is a COMPONENT in RN, never a
`View` style, which is *why* it is its own primitive · decision 58), and
**`<nuri-spacer>`** (grow / fixed `size` / proportional `grow` · decisions
59/61) — plus three new props: **Box `fill` + Stack `fill`** (`flex:1 0 auto` ·
the RN `contentContainerStyle` flexGrow pattern · decision 60) and **Typography
`align`** (decision 59). The navigator owns the safe-area, so the **TabBar is a
SIBLING of Screen**, not a child, and the primitives stay inset-agnostic
([decision 58](../decisionlog.md#58-screen--scroll)). Fixes: Topbar shell →
`size.lg` + empty-side-region collapse (amendment 46.3); IconButton
`flex-shrink:0`; playground pins `data-accent="lilac"` + shell renders on neutral
gray (amendment 57.1); a pinned **Playground** CTA footer in the DS sidebar. All
new web API mirrored in the RN parity spec (`tsc` exit 0) and documented on DS
pages. Gates green (test 19/19 · build · tsc 0). See
[`roadmap/N+11.md`](./N+11.md).

N+10 closed: the **Playground** — a SEPARATE docs area where real screen
compositions render live inside device frames, making the agent-first loop's
"composes" step visible ([decision 21](../decisionlog.md#21-consumer-model--three-agent-personas--operator--n3)).
A simpler sibling of the DS `<nuri-shell>` ([`lib/playground/`](../lib/playground/) +
[`pages/playground/`](../pages/playground/)): **`<nuri-playground-shell>`** builds
a card grid (index) or a horizontal-scroll row of device-framed views (document).
A **fixed light + cream surface** — pages pin `<html data-theme="light"
data-neutral="cream">` without `NuriState.set`. The first document, **My vault**,
is the wallet home screen composed ENTIRELY from shipped components (+ raw-HTML
balance rows / swap overlay / € total that are *logged* missing-component
candidates, not built). **No new component, token, or glyph.**
(1) **`<nuri-demo>` gains two opt-ins** — a `device` control (preview inside a
phone frame + a device picker · opt-in, so DS pages are unaffected) and a
`layout` prop (`widget` default | `board`: 560px · no radius · single right
border · `height:100%` · toolbar BETWEEN preview and code · the preview is the
resizable region, tall by default so the code starts below the fold · both panes
scroll).
(2) **4 device presets × 4 platform chrome kits** — the SCREEN owns the real
logical dimensions (`inline-size` + `aspect-ratio`) and the black frame
`fit-content`-wraps it ADDING the bezel (so dimensions are never eaten); a
`PLATFORM_CHROME` map composes status glyphs (iOS/Android), top cutout
(island/punch/none) and bottom control (pill/buttons/none) — JS structure, CSS
paint ([decision 42](../decisionlog.md#42-box-gains-background--radius-props--attribute-dispatch-surface-vocabulary--evidence-gated-promotion--n65)).
iPhone 17e + Pixel read iPhone-modern (island + pill); Android is distinct
(punch-hole + 3 transparent buttons); SE is home-button era (no cutout · thick
black forehead/chin). Switching device re-skins chrome in place WITHOUT
rebuilding the viewport.
(3) **Scoped device theming** — in device mode the themeable `<nuri-scope>` wraps
ONLY the phone screen, so the controls re-theme just the device content; the card
chrome stays in the fixed light+cream context and the code pane is forced dark.
(4) **Cross-cutting cascade fixes** (the reusable part) — to let a NESTED scope
re-resolve neutral/font, the `[data-neutral]` + `[data-font]` overrides drop
their `:root` prefix, semantic block 1 gains `[data-theme="light"]` (symmetric
with the dark block · scoped neutral was a no-op in light before), and a
themeable scope now carries `accent` alongside `theme` (the compound
`[data-accent][data-theme="dark"]` selector needs both on the same element, else
the brand reverts to neutral in dark). The parser's `primitiveSelectorMatches`
gains the bare `[data-neutral]` form to keep the single build scope
([decision 31](../decisionlog.md#31-default-neutral-scale--cream--cli-parameter---neutral=scale--n58)).
(5) **Playground topbar = the DS `<nuri-topbar center>`** — ghost `caret-left`
back icon-button · `<nuri-typography size="sm" emphasis>` title · soft `sm`
"Design system" button (text only); native-`<button>` nav wired with
click→`location.assign`.
[Decision 57](../decisionlog.md#57-playground--a-separate-composition-area--nuri-demo-device-frames--board-layout--scoped-device-theming--attribute-only-data-neutraldata-fontdata-themelight--n10)
locks it. Gates green: `npm test` 19/19 (test 7 restored by the parser parity
fix), `npm run build` clean (no COMPONENTS/emit change), `tsc` exit 0. See
[`roadmap/N+10.md`](./N+10.md).

N+9 closed: **TabBar** — the icon-only BOTTOM navigation bar, the app-level
destination switcher behind the My-vault / Coin / Activity screens. A compound
of two light-DOM custom elements: **`<nuri-tab-bar>`** (the controller · owns
the selected `value`) + **`<nuri-tab-bar-item>`** (one icon-only destination),
sharing a single piece of state. It mirrors
[Tabs](../decisionlog.md#43-tabs--first-multi-element-compound--first-box-composition-consumer--n65)'
value/active **mechanics** (controller owns `value`, children mirror `active`,
authored items reparent into a built container) but shares **none** of its
semantics — TabBar is navigation chrome rendered as a `<nav>` of native
`<button>`s with `aria-current="page"` on the selected one, **router-agnostic**
and distinct from a tablist (**F-TABBAR-ROLE-1**; RN approximates with
`accessibilityRole="tab"` + `selected`).
(1) **EMITs one baked structural token** — `--nuri-tab-bar-height:
var(--nuri-size-xl)` mirrors Topbar's chrome row so top and bottom chrome share
one rhythm; emitted to `build/components/tab-bar.ts` as `tabBar.height:
'size.xl'` for web↔RN parity. The first chrome primitive to bake a single
structural token (vs the skip-emit Topbar / IconAvatar).
(2) **Items are direct-semantic** — the per-item treatment reads the shared
chrome + interaction vocabulary directly in `@layer rules` (the IconAvatar /
Topbar precedent · [decision 50](../decisionlog.md#50-iconavatar--static-decorative-twin-of-iconbutton--composes-icon-directly--skip-emit--avatar-name-reserved--n69)),
NOT via per-item component tokens. Operator-locked spec: selected =
**fill + text-primary**, not-selected = **regular + border-strong**, pressed
(transient) = **text-muted + press-scale**, NO background change. Icon weight
flips via the `fill` attribute ([decision 38](../decisionlog.md#38-icon-component--phosphor-source--nuri-icon-name-nuri-facade--2-size--fill--registry-based-js-dispatch--n63)).
(3) **Chrome-only** — selection reads text-primary (never accent); switching
`[data-accent]` leaves the bar unchanged. (4) **Full-width** `inline-size:
100%` (operator-chosen at the checkpoint, since the `display:contents` host
otherwise shrink-wraps); **no** `position:fixed` / safe-area inset / top border
(routing + viewport pinning belong to the consuming app · P11). (5) Reuses
Button's press-scale ([decision 45](../decisionlog.md#45-interaction-family-primitives--cross-component-design-constants----nuri-interaction---n65-post-close-coordinator-polish)),
F-ARIA-LABEL-1, F-SELECTED-VALUE-1. **Zero new tokens** beyond the one emitted
height alias.
[Decision 56](../decisionlog.md#56-tabbar--icon-only-bottom-destination-switcher--distinct-from-tabs--emit-bar-height--direct-semantic-items--n9)
locks it. Gates green: `npm test` 19/19 (added a tab-bar emit guard), `npm run
build` clean (tab-bar · 1 decl · 1 TokenPath ref), `tsc` exit 0. See
[`roadmap/N+9.md`](./N+9.md).

N+8.4 closed: the **per-component font-token consolidation** N+8.3 deferred —
applying [decision 54](../decisionlog.md#54-type-scale-emitted-as-a-directly-accessed-namespace--one-source-two-readers--n83)'s
element-vs-values rule (the `<nuri-typography>` element is for author
content; **component-owned labels style themselves but draw their type
VALUES from the one shared `--nuri-type-*` scale**) to the three
font-bearing components.
(1) **Button** drops `--nuri-button-{lg,md,sm}-font-size` +
`--nuri-button-font-weight`; each size block references the scale directly
(lg + md = **type-md-em**, sm = **type-sm-em**) pulling **all four
attributes** — size · line-height · letter-spacing · weight. The emit
(`build/components/button.ts`) no longer carries `fontSize`/`fontWeight`;
RN reads `typeStyle('mdEm')`.
(2) **Tab** drops `--nuri-tab-font-size` + `--nuri-tab-font-weight` →
**type-sm-em** (mirrors Button sm); the RN Tab's borrowed `button.mdFontSize`
(a latent 17px bug) is corrected to `typeStyle('smEm')` (15px).
(3) **Topbar becomes font-bearing** — the centre region carries a default
**lg-em** title type from the scale, so **bare title text inherits** it (no
`<nuri-typography>`, no per-text wrapper). `topbar.html` demos converted
from `<nuri-typography>` to bare text and the orphaned typography includes
removed; RN wraps the centre in one `<Text style={typeStyle('lgEm')}>`.
This **amends [decision 46](../decisionlog.md#46-compositional-chrome-shell-via-named-light-dom-wrappers--n66)**
([46.2](../decisionlog.md#462-amendment--n84--topbar-is-now-font-bearing-for-its-title)) —
Topbar still owns **zero `--nuri-topbar-*` tokens** (skip-emit intact); the
N+8.3 "Topbar owns no font tokens · not an exception" framing is
**superseded**.
(4) **CSS approach** — `button.html`/`tabs.html` don't load
`typography.css`, so the brief's `.nuri-type-*` utility class would no-op
there; each component references the `--nuri-type-*` **primitives directly**
in `@layer rules` (same single source · self-contained · operator-approved
at the visual checkpoint).
(5) **Line-height** — Button/Tab retired their bespoke `line-height: 1.2`;
the operator chose **align-to-scale** (md 1.29 · sm 1.33 + the scale's
letter-spacing) over a preserved 1.2 override. **No new tokens added**
([P11](../pages/principles.html#p11-parsimony)). Gates green: `npm test`
19/19 (byte-check now asserts the retired Button font fields **absent**),
`npm run build` clean, `tsc` exit 0.
[Decision 55](../decisionlog.md#55-component-owned-labels-source-type-from-the-shared-scale--button--tab--topbar--n84)
locks it. See [`roadmap/N+8.4.md`](./N+8.4.md).

N+8.3 closed: the **type scale becomes a first-class emitted namespace** —
closing the gap N+8.2 left open. [Decision 34](../decisionlog.md#34-per-component-files--tokenpath-union--set-policy--pipeline-emit-shape--n603)
had classed the `type` primitive set as **`pipelineInline`** (in the CSS
the web reads, but with no `tokens.ts` namespace), so RN **hand-declared**
the metrics — a parallel copy that could drift from the `--nuri-type-*`
source.
(1) **`pipeline/parsers/type.js` emits a `type` namespace** into
[`build/tokens.ts`](../build/tokens.ts) from the `--nuri-type-*` primitives
in [`styles/tokens-primitive.css`](../styles/tokens-primitive.css) — a
**directly-accessed, context-invariant** composite (like `icons`), NOT a
cascade-resolved runtime/TokenPath set. Per step `xs · sm · md · lg · xl ·
3xl`, both `type.{size}` and `type.{size}Em`, each `{ fontSize, lineHeight,
fontWeight, letterSpacing }`. This is the *one source, two readers* model
of [decision 48](../decisionlog.md#48-typed-buildiconsts-emit--svgxml-over-the-shared-registry--one-registry-two-readers--n68).
(2) **`fontSize` → px** (rem ×16); **`lineHeight` → unitless ratio** and
**`letterSpacing` → em number**, both **verbatim / relative**. RN's
lineHeight/letterSpacing are absolute dp that don't scale with `fontSize`
or the OS `fontScale`, so baking them absolute would clip at large
accessibility sizes and break web↔RN *spacing-that-scales* parity. The
single relative→absolute conversion lives in the consumer-side
`typeStyle(key)` helper — the future `* fontScale` point for Dynamic Type
(P11 · not now).
(3) **A drift guard** (`tokens-parser.test.js`) re-derives every value from
the source with its own helpers and byte-matches the emit (coverage +
per-step deepEqual + on-disk includes).
(4) **RN `Typography` dereferences the emit** — the hand-declared
`TYPOGRAPHY_SIZES` map is gone; `TypographyStack` composes unchanged. The
**web is UNCHANGED** (`.nuri-type-*` classes still read `--nuri-type-*`
directly · zero-build · CSS not regenerated).
[Decision 54](../decisionlog.md#54-type-scale-emitted-as-a-directly-accessed-namespace--one-source-two-readers--n83)
locks it and marks decision 34's `type`-pipelineInline clause
**superseded in part**. **Follow-up → N+8.4: Button + Tab still carry
duplicated font tokens** — consolidating them onto the shared scale (per
decision 54's element-vs-values rule) is the next session (Topbar reviewed
and found to own no font tokens — a layout shell, not an exception). See
[`roadmap/N+8.3.md`](./N+8.3.md).

N+8.2 closed: a **structural cleanup** that reversed the confusing half of
[decision 47](../decisionlog.md#47-typographystack-family--contextual-text-hierarchy-primitive--level-carried-by-the-element--n67).
(1) **`<nuri-typography-stack-element>` is eliminated.** The two-element
TypographyStack compound (a flex container holding `-element level="1..5"`
lines that mapped a contextual sub-scale to type utilities + a `data-level`
colour dispatch) collapses to **one** element. The
[`<nuri-typography-stack>`](../lib/components/typography-stack/) flex-rhythm
container **survives** (column `2xs` / row `xs` gap · still skip-emit) but
now lays out plain [`<nuri-typography>`](../lib/components/typography/)
children — no sub-scale, no per-element colour dispatch.
(2) **`<nuri-typography>` gains a `muted` boolean** → text colour
`var(--nuri-text-muted)` (absent → `currentColor`/primary). JS reflects
`data-muted`; CSS owns the colour ([decision 42](../decisionlog.md#42-box-gains-background--radius-props--attribute-dispatch-surface-vocabulary--evidence-gated-promotion--n65)
attribute-dispatch). It is a **boolean, not a `tone` enum** — no
`tone="primary|muted|accent"` floodgate ([P11](../pages/principles.html#p11-parsimony) ·
the same restraint as Icon having no tone · decision 38). `size` + `emphasis`
unchanged; Typography stays skip-emit.
(3) The old 5-level scale is **dropped** — and (after operator review at
the visual checkpoint) deliberately **not** replaced by a guidance table:
a size/emphasis/muted-per-step doctrine would be invented advice with no
shipped consumer ([P11](../pages/principles.html#p11-parsimony) ·
[decision 30](../decisionlog.md#30-primitive-parsimony--no-speculative-additions--n571)),
so it is deferred until the type-scale principles are documented. The
stack imposes no scale; the author composes `size` + `emphasis` + `muted`
per line directly. Components now **compose
`<nuri-typography>`** rather than applying raw `.nuri-type-*` utilities:
`list-base.html`'s anatomy row and [`<nuri-nav-item>`](../lib/components/nav-item/)'s
label both swap to composed Typography lines (the anatomy's leading
icon-avatar is kept). [Decision 53](../decisionlog.md#53-typographystack--element-eliminated--muted-on-typography--n82)
locks it and marks decision 47's `-element` half **superseded**. The RN
mirror is **structural-only** (`docs/migration-tests/button-matrix/index.tsx`
drops `TypographyStackElement` + `TYPOGRAPHY_STACK_LEVELS`, adds a
`Typography` FC with `size`/`emphasis`/`muted` + `TypographyStack` wrapping
it) — **the type-value emit (reverse decision 34) is N+8.3, NOT here**.
Both Typography + TypographyStack stay skip-emit. See
[`roadmap/N+8.2.md`](./N+8.2.md).

N+8.1 closed: a **fix session** that reverted two N+8 over-reaches surfaced
in review.
(1) The press wash reverts from the **`chrome.bgSubtleXFade` gradient** back
to a flat **`chrome.bgSubtle`** fill — a CSS gradient cannot cross to RN as a
`backgroundColor` (R1 parity). Full-bleed is now a **counter-margin** on the
action box (`margin-inline: calc(-1 * space-md)` re-inset by equal
`padding-inline`), not a fade. The `--nuri-bg-subtle-x-fade` token and the
parser's composite-gradient resolution are removed — **no semantic token
carries a gradient RHS** anymore.
(2) **`<nuri-list>` loses its `gap`** (an N+8 addition that contradicted
decision 51's "no gap"). Inter-row breathing room moves onto
[`<nuri-separator>`](../lib/components/separator/) via a new **`y-space`**
prop (default `sm`, accepts `none`) — a `margin-block` that keeps the line at
1px (amendment 49.1). The semantic space scale gains a **`--nuri-space-none`**
(= 0) leaf. Separator stays **skip-emit** ([amendment 52.1](../decisionlog.md#521-amendment--n81)).
See [`roadmap/N+8.1.md`](./N+8.1.md).

N+8 closed: the List family was **refactored** along three axes and the
system gained its **first recipe**.
(1) **Interactivity moved OUT of `list-item`** into a declarative
WRAPPER, [`<nuri-list-interactive-item>`](../lib/components/list-interactive-item/),
that wraps the row in a `role="button"` action box — **the content IS the
button's accessible name** (read once · the structural fix for N+7's
overlay double-read). `list-item` reverts to purely presentational
(`role="listitem"`, no inline padding so content sits flush with
full-width Separators, plus a trailing `margin-inline-start:auto` pin so
the trailing book-end reaches the row end even behind a bare-text content
node).
(2) The **first recipe**, [`<nuri-nav-item>`](../lib/components/nav-item/)
— a named composition `list-interactive-item ∘ list-item ∘ auto-caret`
built by cloning a native `<template>` (NOT lit-html / JSX / imperative
DOM); skip-emit; an optional `<nuri-list-item-leading>` is hoisted into
the composed row.
(3) The family's fixed values **flip to EMIT** (`list`, `list-item`,
`list-interactive-item` write `build/components/*.ts`; `nav-item` stays
skip-emit), so web↔RN parity is machine-checked.
The press treatment resolved: the A/B `scale` experiment was **removed**;
the pressed wash shipped as the **`chrome.bgSubtleXFade`** gradient token —
since **reverted to flat `chrome.bgSubtle` + counter-margin at N+8.1** (see
above)
([decision 52](../decisionlog.md#52-list-family-refactor--primitiveinteractiverecipe-split--wrap-not-overlay-a11y-fix--emit-fixed-values--first-recipe-nav-item--n8)).
Docs: List became a nav **section** with **Base** + **Navigation Item**
sub-pages (`list.html` retired).
`npm test` **18/18** · `npx tsc` **exit 0**. See [`roadmap/N+8.md`](./N+8.md).

N+6.9 closed: List building blocks (batch 1) landed — **Separator** +
**IconAvatar** (neither builds List/ListItem yet).
**Separator** ([`lib/components/separator/`](../lib/components/separator/))
ships as a prop-free `<nuri-separator>`: a generic, author-placed **1px
hairline** (`background: var(--nuri-border-subtle)` · `block-size: 1px` ·
horizontal-only) painted directly on the host, `role="separator"` +
`aria-orientation="horizontal"`, no radius/margin/variant/inset. It
**closes the long-deferred Stack-`divider` question by reframing**: a
divider is just a separator the author drops between rows — not a Stack
prop, not a `<nuri-divider>` component
([decision 49](../decisionlog.md#49-separator--standalone-generic-1px-display-primitive--author-placed--horizontal-only--n69)).
**IconAvatar** ([`lib/components/icon-avatar/`](../lib/components/icon-avatar/))
ships as `<nuri-icon-avatar name [variant] [accent] [fill]>` — the
**static decorative twin of IconButton** (icon on a coloured circle ·
`size-lg` 48px · `radius-full` · the same geometry as IconButton) and
the **second direct `<nuri-icon>`
consumer** (now allowed because N+6.8 closed F-ICON-RN-1). It consumes
the **same** semantic surface vocabulary IconButton uses
(solid→`accent-solid`/`on-solid` · soft→`bg-strong`/`text-primary` ·
ghost→transparent/`text-primary`) plus an avatar-only
`subtle`→transparent/`border-strong` (lowest-emphasis glyph · no
IconButton counterpart) **directly** in `@layer rules`, with
zero interactivity, no `disabled`/`onPress`/`label`, host
`aria-hidden="true"`
([decision 50](../decisionlog.md#50-iconavatar--static-decorative-twin-of-iconbutton--composes-icon-directly--skip-emit--avatar-name-reserved--n69)).
Both are **skip-emit** (empty `@layer tokens` · zero new tokens · no
`build/components/{separator,icon-avatar}.ts`); the **Avatar** name stays
reserved for a future polymorphic primitive. `npm test` **18/18** ·
`npx tsc` **exit 0**. See [`roadmap/N+6.9.md`](./N+6.9.md).

N+6.8 closed: Icon RN renderer landed · **F-ICON-RN-1 CLOSED**.
The shared icon registry
([`lib/components/icon/icons.js`](../lib/components/icon/icons.js) ·
the SSOT · 17 glyphs × {regular, bold, fill}) is now emitted **once**
as a typed [`build/icons.ts`](../build/icons.ts) (`IconName` union +
`IconWeight` + `icons: Record<IconName, Record<IconWeight, string>>`),
and the RN side renders it through `react-native-svg`'s `SvgXml` over
the verbatim path string. **One registry, two readers** — the web
inlines `icons.js` directly, RN reads the typed emit. IconButton now
**composes** a real `Icon` (weight coupling md→regular / sm→bold /
any+fill→fill · `fill` passthrough now live) in place of its honest
`<View>` stub — the RN analogue of the web `<nuri-icon-button>` →
`<nuri-icon>` funnel. **No** SVGR / per-glyph codegen (that would fork
the glyph source and break the single-registry invariant
[decision 38](../decisionlog.md#38-icon-component--phosphor-source--nuri-icon-name-nuri-facade--2-size--fill--registry-based-js-dispatch--n63));
**no** `react-native-svg` dependency (a local type shim declares only
the `SvgXml` surface · proof is type-only · spec repo, no RN runtime).
[Decision 48](../decisionlog.md#48-typed-buildiconsts-emit--svgxml-over-the-shared-registry--one-registry-two-readers--n68)
locks it. No new web component, no new tokens, no new glyphs — a bridge
session paying down the highest-leverage RN-side debt deferred across
N+6.4–N+6.7.

Pipeline: a new Slice 5 (emitter at
[`pipeline/parsers/icons.js`](../pipeline/parsers/icons.js)) emits
`build/icons.ts` from `icons.js` with a byte-stable, drift-guarded
mirror. `npm test` **18/18** (the new icons single-source guard:
17 names × 3 weights · on-disk emit === `emitIconsTs(ICONS)` ·
every path equals `icons.js`). `npx tsc -p
docs/migration-tests/button-matrix/tsconfig.json` **exit 0** — the RN
Icon + IconButton composition typecheck against the typed registry and
the local `SvgXml` shim. `build/components/` still holds the same four
files (button · icon-button · switch · tabs — Icon is a registry emit,
not a token classifier, so no `build/components/icon.ts`). See
[`roadmap/N+6.8.md`](./N+6.8.md).

N+6.7 closed: TypographyStack family landed.
**TypographyStack** ([`lib/components/typography-stack/`](../lib/components/typography-stack/))
ships as `<nuri-typography-stack [direction]>` +
`<nuri-typography-stack-element level="1..5">` — the **text-hierarchy
primitive** and the **third light-DOM child-element compound** (after
Tabs and Topbar). A flex container (column default · `gap space.2xs` ·
`[direction="row"]` flips to `align-items:baseline` · `gap space.xs`)
holding styled lines that declare a **contextual `level` (1..5)**, not
an absolute size. Each level maps to an existing `.nuri-type-*` utility
class (size + emphasis · SSOT `styles/typography.css`) and dispatches a
chrome text colour off `data-level` (levels 1–4 → `--nuri-text-primary`,
5 → `--nuri-text-muted`) — [decision 47](../decisionlog.md#47-typographystack-family--contextual-text-hierarchy-primitive--level-carried-by-the-element--n67).
`level` lives on the *-element*, **not** on `<nuri-typography>` (it
would collide with `size` and leak contextual hierarchy into a
context-free primitive). As a layout primitive its `@layer tokens`
block is **empty** (no `--nuri-typography-stack-*` tokens · the
[decision 37](../decisionlog.md#37-layout-primitives-consume-semantic-vocabulary-via-prop--no-component-token-aliasing--n62)
pattern · colour attribute-dispatched per decision 42, never computed
in JS); the pipeline skips its per-component emit (no
`build/components/typography-stack.ts`). **Zero new tokens · Typography
untouched** (no `level`/`tone` · the stack composes the existing
utilities). The two inter-level rhythm values (column `2xs` · row `xs`)
were surfaced for operator review at close and **signed off as-is
(2026-05-29)** — mechanism and values both now locked.

Pipeline: `typography-stack` joins `COMPONENTS` (now
`['button','stack','box','icon','icon-button','switch','tabs','topbar','typography','typography-stack']`);
`build/components/` still holds **four** files (button · icon-button ·
switch · tabs — TypographyStack emits none). `npm test` **17/17** (no
new test · layout primitive · no guardrail surface). `npx tsc -p
docs/migration-tests/button-matrix/tsconfig.json` exit 0 —
TypographyStack ships as a **complete** RN translation (font metrics
hand-declared from the pipelineInline `type` primitives · colour from
the runtime `chrome` set · one level table read identically both sides
· RISKS R1). **F-ICON-RN-1 carried forward unchanged** — the stack
composes only text utilities + chrome colour, no glyph, so the renderer
debt was neither advanced nor deepened. See
[`roadmap/N+6.7.md`](./N+6.7.md).

N+6.6 closed: Topbar + IconButton `fill` passthrough landed.
**Topbar** ([`lib/components/topbar/`](../lib/components/topbar/))
ships as `<nuri-topbar>` + `<nuri-topbar-start>` / `<nuri-topbar-end>`
(the region wrappers + JS reparenting were later **retired** → the
content-pivot open primitive · **amendment 46.4** · N+18 · see Current
state) — the **first compositional chrome shell** and the **second
light-DOM child-reparenting compound** (after Tabs). A three-region layout
(`[leading] · children · [trailing]`) driven by a **single structural
boolean, `center`** — **slots, not use-case variants**
([decision 46](../decisionlog.md#46-compositional-chrome-shell-via-named-light-dom-wrappers--n66)).
As a layout primitive its `@layer tokens` block stays **empty** (no
`--nuri-topbar-*` tokens · the
[decision 37](../decisionlog.md#37-layout-primitives-consume-semantic-vocabulary-via-prop--no-component-token-aliasing--n62)
pattern · all styling consumes semantic tokens directly · edge
padding **attribute-dispatched** per decision 42, never computed in
JS). The pipeline skips its per-component emit (no
`build/components/topbar.ts`). **IconButton** gains a `fill` boolean
that forwards the filled glyph weight to its inner `<nuri-icon>`
([amendment 40.1](../decisionlog.md#401-amendment--n66--fill-weight-passthrough))
— a pure passthrough · single-size lock unchanged · consumer-driven
by Topbar's filled close affordance, which keeps Topbar composing
Icon **only** through IconButton (no new direct `<nuri-icon>`
consumer).

Pipeline: `topbar` joins `COMPONENTS` (now
`['button','stack','box','icon','icon-button','switch','tabs','topbar','typography']`);
`build/components/` still holds **four** files (button · icon-button ·
switch · tabs — Topbar emits none). `npm test` **17/17** (no new
test · layout primitive · no guardrail surface). `npx tsc -p
docs/migration-tests/button-matrix/tsconfig.json` exit 0 — Topbar
ships as a **complete** RN translation (it composes the IconButton
stub, doesn't depend on a real Icon renderer).

**F-ICON-RN-1 stays OPEN — now sidestepped three sessions deep, but
its renderer direction was refined.** Topbar composes Icon only
through IconButton, so the direct-Icon consumer count held at two and
the renderer debt carried forward unchanged (no partial RN renderer).
The refinement: when the renderer lands it should feed the **shared
registry SVG string** into `react-native-svg` `SvgXml` + a typed
`build/icons.ts` emit (one registry · two readers · **no** SVGR /
per-glyph codegen). See [`roadmap/N+6.6.md`](./N+6.6.md).

N+6.5 closed: Switch + Tabs + Box surface props landed.
**Switch** ([`lib/components/switch/`](../lib/components/switch/))
ships as `<nuri-switch checked disabled accent>` — the **first
stateful standalone control** and a parametric pill (60×36 track ·
28×28 knob) that, unlike the layout primitives, **owns
`--nuri-switch-*` component-tokens**
([decision 44](../decisionlog.md#44-switch--standalone-parametric-pill--owns-component-tokens--button-roleswitch-not-checkbox--n65)).
Built on a native `<button role="switch" aria-checked>` —
**deliberately not** `<input type="checkbox">`. The OFF track is
backed by a new semantic leaf **`--nuri-bg-inverse-muted`** (chrome ·
neutral-11), auto-discovered by classify-by-cascade (semantic count
36 → 37).

**Tabs** ([`lib/components/tabs/`](../lib/components/tabs/)) ships as
the compound `<nuri-tabs value>` + `<nuri-tab value disabled>` — the
**first multi-element component with shared state** and the **first
Box-composition consumer**
([decision 43](../decisionlog.md#43-tabs--first-multi-element-compound--first-box-composition-consumer--n65)).
One directory, one IIFE defining both custom elements; the controller
owns the selected `value` as a DOM attribute, each option reads it.
The tablist surface is a composed `<nuri-box background="strong"
radius="md" padding="xs">`. Pipeline emits only the exact
`--nuri-tabs-` prefix (the single `gap` → `space.2xs`); the
per-option `--nuri-tab-*` tokens are web-CSS-only by design. A11y:
Tab-key + click/Enter baseline; arrow-key roving deferred
(`F-KEYBOARD-NAV-1`).

**Box** gains `background` (5-enum) + `radius` (4-enum) props under
[decision 42](../decisionlog.md#42-box-gains-background--radius-props--attribute-dispatch-surface-vocabulary--evidence-gated-promotion--n65),
dispatched by `[data-background]` / `[data-radius]` selectors in
`@layer rules` — `@layer tokens` **stays empty** (still a layout
primitive · the [decision 37](../decisionlog.md#37-layout-primitives-consume-semantic-vocabulary-via-prop--no-component-token-aliasing--n62)
pattern · `accent-solid` is the one coupled case, setting both
`background` and `color`). This **closes the N+6.2 evidence-gated
Open question** — Tabs is the real consumer that needed a filled,
rounded container; `max-width` stays deferred (decision 42
anti-scope).

The **Behavioural-delta section** extends to Switch + Tabs with three
new component-specific frictions: **F-CHECKED-STATE-1** (Switch · the
first persisted-boolean delta), **F-SELECTED-VALUE-1** (Tabs · the
first shared-selection-state delta), **F-KEYBOARD-NAV-1** (Tabs ·
arrow-key roving deferred). At n=4 documented controls (Button ·
IconButton · Switch · Tabs) the template now spans transient,
stateful, and compound surfaces.

Pipeline: `switch` + `tabs` join `COMPONENTS` (now
`['button','stack','box','icon','icon-button','switch','tabs']`);
`build/components/` holds **four** files (`switch.ts` 9 decls ·
`tabs.ts` 1 decl new · `button.ts` · `icon-button.ts`). `npm test`
**17/17** (no new test). `npx tsc -p
docs/migration-tests/button-matrix/tsconfig.json` exit 0 — Switch +
Tabs ship as **complete** RN translations (not stubs · neither
consumes Icon).

**F-ICON-RN-1 stays OPEN — now deliberately sidestepped two sessions
deep.** N+6.5's three deliverables are all non-Icon-consuming, so the
Icon RN renderer debt was carried forward unchanged (an operator pick
to grow the stateful/compound surface first · **no partial RN
renderer shipped in either N+6.4 or N+6.5**). See
[`roadmap/N+6.5.md`](./N+6.5.md).

N+6.4 closed: IconButton + ghost + Button size matrix landed.
**IconButton** ([`lib/components/icon-button/`](../lib/components/icon-button/))
ships as `<nuri-icon-button name variant accent label disabled>` —
the **first real consumer of Icon**, a fixed 48×48px circle wrapping
a single `md` `<nuri-icon>`. It is **single-size-locked** under
[decision 40](../decisionlog.md#40-iconbutton-is-single-size-locked--md48px--n64)
(no `size` prop · 48px = the comfortable touch target ·
`F-TOUCH-TARGET-1`) and auto-derives `aria-label` from `name`
(`F-ARIA-LABEL-1`).

A new **ghost** variant joins `solid`/`soft` on **both** Button and
IconButton — a cross-component chrome-less tertiary under
[decision 39](../decisionlog.md#39-ghost-variant-joins-solidsoft-as-a-cross-component-chrome-less-tertiary--n64):
`transparent` → `bg-subtle` on `:active`, fg `text-primary` (never
accent), no border any state. Defined once per component
(`--nuri-button-ghost-*` / `--nuri-icon-button-ghost-*`) with an
identical contract.

**Button** gains a three-size matrix (`lg`/`md`/`sm`) under
[decision 41](../decisionlog.md#41-button-three-size-matrix--asymmetric-typeradius-coupling--default-shifts-to-md--n64),
with an **asymmetric** coupling: type breaks at the md/sm boundary
(lg+md share `type-md`=17px; sm drops to `type-sm`=15px), radius
breaks at the lg/md boundary (lg=`radius.md`=12px; md+sm=`radius.sm`
=6px). The default shifts from implicit-largest to explicit **`md`**
(48px) — no backward-compat shim, no autofix sweep.

Component pages gain a fifth section — **Behavioural delta**
([amendment 24.1](../decisionlog.md#241-amendment--n64--behavioural-delta-section))
— a friction-code-keyed table (web behaviour · RN behaviour · the
delta the migration agent must honour). Backfilled to Button,
forward to IconButton; **not** added to Stack/Box/Icon (empty delta).

Pipeline: `icon-button` joins `COMPONENTS` (now
`['button','stack','box','icon','icon-button']`); a new
`exportNameFor` helper in
[`pipeline/parsers/components.js`](../pipeline/parsers/components.js)
camelCases the export name (`icon-button` → `iconButton`) so the
generated `build/components/icon-button.ts` is a valid module.
`build/components/` now holds **two** files (`button.ts` regenerated
with per-size + ghost tokens · `icon-button.ts` new). `npm test`
**17/17** (test 16 oracle rewritten · IconButton folded in · no new
test). `npx tsc -p docs/migration-tests/button-matrix/tsconfig.json`
exit 0.

**F-ICON-RN-1 stays OPEN** — the Icon RN renderer was
operator-deferred this session; **no partial RN renderer shipped**.
The migration test models IconButton as a type-only interface + a
`View` stub that references the friction; the debt is surfaced in
RISKS.md, the migration stub, and IconButton's Roadmap so it can't
be lost. See [`roadmap/N+6.4.md`](./N+6.4.md).

N+6.3 closed: iconography landed. **Icon**
([`lib/components/icon/`](../lib/components/icon/)) ships as the
first visual atom — `<nuri-icon name size fill>`, a thin Nuri
facade over a hand-curated registry
([`icons.js`](../lib/components/icon/icons.js)) of 17 phosphor
glyph keys × 3 weights (51 SVG path strings).
[Decision 38](../decisionlog.md#38-icon-component--phosphor-source--nuri-icon-name-nuri-facade--2-size--fill--registry-based-js-dispatch--n63)
locks the pattern: **registry-based JS dispatch** (prop → registry
key lookup → inline SVG) as the sibling to
[decision 37](../decisionlog.md#37-layout-primitives-consume-semantic-vocabulary-via-prop--no-component-token-aliasing--n62)'s
attribute-dispatch — used when the vocabulary is an enum of named
assets the CSS cascade can't select on.

API · operator-locked: `name` (required · registry key · warns
`[NuriIcon] unknown name "<value>"` on miss), `size` (`md` default
| `sm`), `fill` (boolean). **Weight is coupled, not a prop**:
md→regular, sm→bold, any+fill→fill — Nuri never exposes raw
phosphor weights. **Colour is `currentColor` only** — no
tone/accent/color prop; the icon inherits its parent's text colour.
Size reuses the existing
[decision 36](../decisionlog.md#36-semantic-spacing--sizing-vocabularies--77-t-shirt-scale--cascade-invariant--n61)
`--nuri-size-*` vocabulary as a 2-leaf subset (md→`--nuri-size-sm`
= 28px, sm→`--nuri-size-xs` = 18px) — **no new `--nuri-icon-size-*`
family**; the size is dispatched via `data-size` attribute
selector in [`icon.css`](../lib/components/icon/icon.css)'s
`@layer rules` (the decision 37 co-pattern).

Pipeline: `icon` joins the `COMPONENTS` registry array in
[`pipeline/tokens-parser.js`](../pipeline/tokens-parser.js)
(now `['button', 'stack', 'box', 'icon']`). Icon's `@layer tokens`
block is **empty** (it has no component-token aliasing — same as
Stack/Box), so it rides the empty-emit branch from decision 37: no
`build/components/icon.ts` ships. The skip-log message generalised
from "layout-primitive" to the pattern-neutral "empty `@layer
tokens`" since the empty case is no longer layout-specific.
`build/components/` still contains only `button.ts`.

Iconography ships as a **foundation** page
([`pages/foundations/iconography.html`](../pages/foundations/iconography.html)
· it establishes the icon vocabulary), so it omits the
Variants/States/Theming sections per the
[decision 19](../decisionlog.md#19-foundation-template-variants-in-service-of-one-structure--n2)
section-flexibility precedent. The 17-glyph catalog, both sizes,
the fill toggle, the props API, and the token mapping all render;
the NAV gains an "Iconography" link under Foundations in
[`lib/docs/shell.js`](../lib/docs/shell.js).
`@phosphor-icons/core` is a devDependency (provenance + future
re-extraction · NOT a runtime import). No RN renderer ships —
F-ICON-RN-1 logs the deferral, targeted at N+6.4 when IconButton
lands as the first real icon consumer.

`npm test` 17/17 unchanged (the empty-emit path is a build
behaviour, not a guardrail surface). `npm run build` emits the
same 4 build files: 216 colour primitives + 36 semantic leaves + 1
component file (button · 13 decls · 9 TokenPath refs) + 1 TokenPath
union (36 members); the build log now includes a third "empty
`@layer tokens` · no per-component file emitted" line for icon
(alongside stack + box). `npx tsc -p
docs/migration-tests/button-matrix/tsconfig.json` exit 0 (the
migration consumer is untouched this session). Zero
`var(--nuri-icon-*)` references anywhere in `lib/components/`.

N+6.2 closed: layout primitives landed. **Stack**
([`lib/components/stack/`](../lib/components/stack/)) and **Box**
([`lib/components/box/`](../lib/components/box/)) ship as the
first two members of a new component class —
[decision 37](../decisionlog.md#37-layout-primitives-consume-semantic-vocabulary-via-prop--no-component-token-aliasing--n62)
locks the pattern: layout primitives consume the
[decision 36](../decisionlog.md#36-semantic-spacing--sizing-vocabularies--77-t-shirt-scale--cascade-invariant--n61)
semantic vocabulary **via prop**, NOT via component-token
aliasing. The `@layer tokens` block stays empty on both;
attribute-selector CSS in `@layer rules` dispatches `gap="md"` →
`var(--nuri-space-md)` directly. No `--nuri-stack-gap-md` /
`--nuri-box-padding-md` alias — they'd be "useless indirection"
(operator framing).

API surface · operator-locked: Stack ships
`direction`/`gap`/`align`/`justify`/`wrap`/`as`; Box ships
`padding`/`padding-x`/`padding-y` + 4 edge-specific +
`center`/`as`. Padding-style props accept the 5-leaf subset
(`xs/sm/md/lg/xl`) of the 7-leaf semantic space scale —
operator pick that keeps choice manageable without sacrificing
real flexibility; `2xs` + `2xl` stay available ad-hoc via
direct `tokens.space.*`.

Pipeline gained the **empty `@layer tokens` case** — the
per-component emit contract from
[decision 34](../decisionlog.md#34-per-component-files--tokenpath-union--set-policy--pipeline-emit-shape--n603)
extends with a third branch: zero declarations → skip the emit
step, log the skip. `COMPONENTS` array in
[`pipeline/tokens-parser.js`](../pipeline/tokens-parser.js) is
now `['button', 'stack', 'box']` — single registry — but only
`button.ts` is generated under
[`build/components/`](../build/components/); stack.ts and box.ts
deliberately don't ship. Zero edits to
[`pipeline/parsers/components.js`](../pipeline/parsers/components.js)
— the skip lives at the orchestrator.

Two new component pages
([`pages/components/stack.html`](../pages/components/stack.html)
+ [`pages/components/box.html`](../pages/components/box.html))
adapt the canonical
[decision 24](../decisionlog.md#24-component-pages-serve-four-readers-including-migration--n3)
4-reader template, omitting the Variants / States / Theming
sections (layout primitives have none of those axes) per
[decision 19](../decisionlog.md#19-foundation-template-variants-in-service-of-one-structure--n2)
template-flexibility precedent. Spec card + hero + API + anatomy
+ token-mapping + live demos + roadmap stay.

A new NAV group **Components · Layout** lists Stack + Box
alongside the existing Actions / Inputs / Display / Navigation
/ Data / Overlays groups in
[`lib/docs/shell.js`](../lib/docs/shell.js).

**F-LAYOUT-1 retired.** The single highest-friction missing
surface since N+4 ([`docs/RISKS.md`](../docs/RISKS.md) R1) closes
structurally. Both sides of the
[migration-test pair](../docs/migration-tests/button-matrix/index.tsx)
retired their hand-rolled VStack/HStack styles — the web side
composes `<nuri-stack>` + `<nuri-box>` directly; the RN side
defines local `<Stack>` + `<Box>` modules sharing the prop API
1:1 (RN spec home for layout primitives is a new Open question
pending n≥2 RN-component-spec consumers). The retirement is
documented in both `FRICTIONS.md` (the scratch file) and
`RISKS.md` (under R1's frictions list).

`npm test` 17/17 unchanged (no new tests; the empty-emit path
is a build behaviour, not a guardrail surface yet). `npm run
build` emits the same 4 build files as N+6.1.1: 216 colour
primitives + 36 semantic leaves + 1 component file (button · 13
decls · 9 TokenPath refs) + 1 TokenPath union (36 members); the
build log now includes two new "layout-primitive · no per-
component file emitted" lines for stack + box. `npx tsc -p
docs/migration-tests/button-matrix/tsconfig.json` exit 0
against the Stack/Box-refactored consumer.

N+6.1.1 (prior bridge) closed: dimension foundation completeness. The semantic
radius vocabulary landed as the third sibling under the semantic
dimension family
([amendment 36.1](../decisionlog.md#361-amendment--n611) extending
[decision 36](../decisionlog.md#36-semantic-spacing--sizing-vocabularies--77-t-shirt-scale--cascade-invariant--n61)):
4 leaves (`radius.sm = 6`, `radius.md = 12`, `radius.lg = 18`,
`radius.full = 9999px` — the last is the first semantic dimension
leaf without `--nuri-px-N` alias backing · a sentinel value the
browser clamps to `min(width/2, height/2)` for pill / circle
shapes · post-close polish of the original `100%` lock that
ellipsed rectangular `.nuri-tag` boxes). Pre-N+6.0 primitive
`--nuri-radius-{sm,md,lg,full}` declarations retired from
[`styles/tokens-primitive.css`](../styles/tokens-primitive.css);
the semantic layer reuses the same names with new values, so chrome
consumers (shell.css · demo.css · control.css · button.html ·
exploration.html) re-resolve through cascade to the new values — a
small visual softening (sm: 4→6, md: 8→12, lg: 12→18).

Auto-promotion fired identically to N+6.1: SET_POLICY gained a
third runtime entry; GROUP_NAMES' empty-signature array gained a
third entry; the per-component emitter detected
[`button.css`](../lib/components/button/button.css)'s
`var(--nuri-radius-md)` reference (refactored from
`var(--nuri-radius-lg)` · value-matching leaf · zero visual diff)
now resolves through the runtime set, so
[`button.ts`](../build/components/button.ts) `radius` flipped from
literal `12` to `'radius.md' as const satisfies TokenPath`.
**Zero edits to
[`pipeline/parsers/components.js`](../pipeline/parsers/components.js).**
The runtime emit gained per-leaf type inference (still kept
post-polish for future cascade-invariant vocabularies with genuine
mixed-literal leaves) — today all radius leaves type as `number`
post-polish (sm/md/lg from `--nuri-px-N` chain · full from the
`9999px` literal post px-strip in the per-component emitter).

All four dimension foundation pages now live nested under
[`pages/foundations/dimension/`](../pages/foundations/dimension/),
symmetric with the colour family: primitive (new · the
`--nuri-px-N` direct-pixel scale), spacing (moved from
top-level), sizing (moved from top-level), radius (new). NAV in
[`lib/docs/shell.js`](../lib/docs/shell.js) shows the "Dimension"
section header with 4 nested children (Primitive first, then the
three semantic vocabularies). The migration-test consumer at
[`docs/migration-tests/button-matrix/index.tsx`](../docs/migration-tests/button-matrix/index.tsx)
extends the consumer-side static-vs-dynamic split established at
N+6.1 — `borderRadius` joins `minHeight` + `paddingHorizontal` in
the render-time inline style array. The `string | number` resolver
return (from N+6.1) accommodates the mixed-literal radius leaves
without further type changes. Latent N+6.1 drift caught + fixed
in pass: [`pages/principles.html`](../pages/principles.html) P9
dimension row gained `--nuri-space-*` + `--nuri-size-*` (the
N+6.1 audit had missed them — fresh-agent blind spot, not
continuation-agent-specific).

`npm test` 17/17 (test 7 oracle gained 4 radius entries; test 16
moved `radius` from `expectedLiterals` to `expectedPaths` and
updated `resolveComponentValue` deep-equal; test 15 swapped
`primitiveSetFor` cite from `--nuri-radius-lg` (now semantic) to
`--nuri-radius-xl` (stays primitive)). `npm run build` emits 216
colour primitives + 36 semantic leaves (18 cascade-varying chrome
+ accent · chrome leaves fan out × 2 themes · accent leaves fan
out × 2 themes × 2 accents · + 18 cascade-invariant space + size
+ radius singletons) + 1 component file (button · 13 decls · 9
TokenPath refs · was 8) + 1 TokenPath union (36 members · was 32).
`npx tsc -p docs/migration-tests/button-matrix/tsconfig.json`
exit 0 against the updated consumer pattern.

This session is the **first non-fresh-agent continuation since
N+5.5** — same agent as N+6.1 picked up the follow-up to save
onboarding cost on a tight same-domain extension. Outcome: clean
ship, no broken patterns. The pattern (fresh for new directions ·
same agent for tight extensions of the prior session's patterns)
is documented in [`roadmap/N+6.1.1.md`](./N+6.1.1.md) for a
future coordinator to inherit.

N+6.1 (prior bridge) closed: semantic spacing + sizing vocabularies landed.
Two new T-shirt-scale dimension families ship at the semantic
layer — `--nuri-space-{2xs, xs, sm, md, lg, xl, 2xl}` (2–36 px ·
between-element values) and `--nuri-size-{xs, sm, md, lg, xl,
2xl, 3xl}` (18–90 px · element dimensions) — each leaf aliasing
the [decision 32](../decisionlog.md#32-primitive-scale-uses-direct-pixel-naming---nuri-px-n--n60)
`--nuri-px-N` primitive layer. The deferred `--nuri-px-90` lands
alongside as the primitive backing `size.3xl`. All 14 semantic
leaves ship in the same session per the
[P11](../pages/principles.html#p11-parsimony) "vocabulary IS the
design surface" exception (same precedent that ships 12-step
Radix scales complete; partial scales would silently change the
meaning of an existing T-shirt choice). [Decision 36](../decisionlog.md#36-semantic-spacing--sizing-vocabularies--77-t-shirt-scale--cascade-invariant--n61)
locks the vocabulary + the SET_POLICY auto-promotion mechanism +
the consumer-side static-vs-dynamic split.

`SET_POLICY` placeholders for `semantic.space` + `semantic.size`
(left commented at [N+6.0.3](./N+6.0.3.md)) flipped to active
`{ runtime: true, pipelineInline: false }`; the classifier gained
one structural extension (GROUP_NAMES now supports array-valued
entries under a shared signature with namingPrefix as
discriminator) so two cascade-invariant vocabularies coexist
without colliding under the empty signature `''`.
[`build/tokens.ts`](../build/tokens.ts) gained two new namespaced
exports (`export const space:` + `export const size:`) emitting
JS numbers (12 / 18 / 24 / …) — the emitter now converts
dimension `12px` → number `12` and quotes digit-starting
T-shirt keys (`'2xs'` / `'2xl'` / `'3xl'`).
[`build/token-paths.ts`](../build/token-paths.ts) grew 14 union
members mechanically (18 chrome + accent + 14 dimension = 32
leaves). The auto-promotion fired:
[`build/components/button.ts`](../build/components/button.ts)
`minHeight` flipped from literal `60` to
`'size.xl' as const satisfies TokenPath`; `paddingX` flipped from
literal `18` to `'space.lg' as const satisfies TokenPath`. **Zero
edits to `pipeline/parsers/components.js`.**

[`lib/components/button/button.css`](../lib/components/button/button.css)
refactored at the two N+6.0 placeholder sites (lines 65–66) —
`var(--nuri-px-60)` → `var(--nuri-size-xl)`,
`var(--nuri-px-18)` → `var(--nuri-space-lg)`. P3 / hard rule 1
(components consume semantic, never primitive) restored; the
N+6.0 temporary exemption retired.

Two new foundation pages: [`pages/foundations/dimension/spacing.html`](../pages/foundations/dimension/spacing.html)
+ [`pages/foundations/dimension/sizing.html`](../pages/foundations/dimension/sizing.html),
each following the canonical 4-section template (spec card +
approach prose + token table + roadmap). NAV gains a "Dimension"
non-clickable section header (mirrors the "Colour" pattern) with
Spacing + Sizing nested children. The migration-test consumer at
[`docs/migration-tests/button-matrix/index.tsx`](../docs/migration-tests/button-matrix/index.tsx)
updated to handle the consumer-side static-vs-dynamic split:
`borderRadius` stays in `StyleSheet.create` (still a literal);
`minHeight` + `paddingHorizontal` moved to a render-time inline
style object that dereferences through `resolveToken(tokens, ...)`.
The `RuntimeTokens` type widened to include `space` + `size`; the
resolver return narrows from `string` to `string | number`.

`npm test` 17/17 (test 7 oracle gained 14 entries; test 12 regex
broadened to accept quoted T-shirt keys + numeric values; test 16
moved minHeight + paddingX from `expectedLiterals` to
`expectedPaths` and added `radius` + `paddingX` to the
`resolveComponentValue` deep-equal checks). `npm run build` emits
216 colour primitives + 32 semantic leaves (18 cascade-varying
chrome + accent × 2 themes × 2 accents + 14 cascade-invariant
space + size singletons) + 1 component file (button · 13 decls ·
8 TokenPath refs · was 6) + 1 TokenPath union (32 members · was
18). `npx tsc -p docs/migration-tests/button-matrix/tsconfig.json`
exit 0 against the updated consumer pattern.

N+6.0.4 (prior bridge) closed: pipeline sources vs build outputs physically
separated. The 5 source files (previously at
`build/parsers/{primitive,semantic,components}.js` +
`build/tokens-parser.js` + `build/tokens-parser.test.js`) moved
into a sibling [`pipeline/`](../pipeline) tree; `build/` now holds
**only** generated outputs ([`build/tokens.json`](../build/tokens.json),
[`build/tokens.ts`](../build/tokens.ts),
[`build/components/button.ts`](../build/components/button.ts),
[`build/token-paths.ts`](../build/token-paths.ts)). The four output
paths stay byte-identical post-rebuild except for the source-path
string in the generated header comments
(`Emitter · build/tokens-parser.js` → `pipeline/tokens-parser.js`);
the migration pair's three `'../../../build/*'` imports are
unchanged. The invariant is now structural: anything under
`build/` is regenerable by `npm run build`, anything under
`pipeline/` is hand-maintained.
[Decision 35](../decisionlog.md#35-pipeline-sources-vs-build-outputs-physically-separated--pipeline-source-build-generated-only--n604)
locks the separation; the long-standing "`build/` mixes pipeline
sources and outputs" Open question that has sat here since N+5 is
resolved (the candidate it explicitly listed). Decision 26 (the
`lib/components/` vs `lib/docs/` physical-separation-by-lifecycle
precedent · N+3.5) gains a one-sentence forward-pointer to
decision 35. Future hardening (a pre-commit hook or CI check
enforcing the invariant; `.gitignore` for `build/*` once the
output platform locks) is documented in decision 35 and deferred.
No CSS edits, no new tokens, no new components, no behaviour
change in the pipeline; `package.json` build + test scripts
re-pointed at `pipeline/`. `npm test` 17/17 unchanged; `npm run
build` emits the same four files at the same output paths;
`tsc` exit 0.

N+6.0.3 (prior bridge) closed: pipeline emit shape reworked. `build/tokens.ts` now
ships **runtime sets only** (chrome + accent today — the
context-dependent vocabulary the classify-by-cascade emitter
discovers from `[data-*]` blocks); per-component numerics moved out
of the emitter into [`build/components/button.ts`](../build/components/button.ts)
(the only component file today); the discriminated union of every
runtime-set leaf lives at [`build/token-paths.ts`](../build/token-paths.ts).
The pre-N+6.0.3 hardcoded `BUTTON_BASE` constants block (which held
`minHeight: 56` / `paddingX: 16` long after the [N+6.0](./N+6.0.md)
primitive rename moved CSS to `--nuri-px-{60,18}`) is **structurally
killed** — `button.ts` now reads from the live CSS source on every
build (`minHeight: 60` / `paddingX: 18` matches the source). A
**set-policy registry** at [`pipeline/parsers/semantic.js`](../pipeline/parsers/semantic.js)
(`SET_POLICY`) is the single declarative extension point: every set
carries `cascadeVarying` (mechanically derived) + `runtime` +
`pipelineInline` flags; an **auto-rule** forces cascade-varying sets
to runtime; orphans / auto-rule violations / missing entries throw
at the classifier.
[Decision 34](../decisionlog.md#34-per-component-files--tokenpath-union--set-policy--pipeline-emit-shape--n603)
locks the public-emit contract on top of decision 28's classifier
internals. A ~10-line `resolveToken(tokens, path)` sketch in
[`docs/migration-tests/button-matrix/index.tsx`](../docs/migration-tests/button-matrix/index.tsx)
demonstrates the consumer-side dereference (production
implementations belong in the consuming app; the Nuri spec
describes the contract, not the runtime). No CSS edits, no new
tokens, no new components; `npm test` 17/17 (`SET_POLICY mechanism`
+ `per-component emit` named tests added); `npm run build`
216 + 18 × 2 × 2 + 1 component file (13 decls, 6 TokenPath refs) +
1 TokenPath union; `tsc` exit 0 against the new shape.

N+6.0.2 (prior bridge) closed: `pages/foundations/colour/semantic.html` documents
the full resolution matrix of every semantic token **structurally**
instead of interactively — 5 → 6 sections (accent split into
`accent-neutral` + `accent-lilac`), 5 → 7 columns when the page
opts in (DTCG · CSS var · **Reference Light** · **Light** ·
**Reference Dark** · **Dark** · Type — the reference itself can
change per theme, so one Reference column would lose half the
matrix), inline accent select widget + its page-local JS deleted,
inline swatch chip moved from the DTCG name cell into each
Reference cell (one chip per cascade context, carrying explicit
`data-theme` + `data-accent` so each chip resolves its `var()`
under the right cascade), prose rewritten to drop the "toggle the
theme switch" instruction, set indicator simplified to `Set · core`.
[`lib/docs/tokens.js`](../lib/docs/tokens.js) `parseSemantics()`
gains a `bothThemes: true` opt-in (populates
`referenceLight + referenceDark + valueLight + valueDark` against
the requested accent); `renderTable()` gains a
`showBothModes: true` opt-in paired with `accent` (emits 7 columns
+ dual chips). Both opt-ins are **strictly additive** —
`primitive.html`, `button.html`, and `exploration.html` keep their
single-`Value` 5-col render with the chip in the DTCG cell, zero
call-site change.
[Decision 20](../decisionlog.md#20-token-table-format-unified-across-every-page--n2)
gains an
[amendment 20.1](../decisionlog.md#201-amendment--n602)
locking the dual-value-column allowance dependency-driven (identical
trigger to
[decision 33](../decisionlog.md#33-semantic-token-docs--format-b-verbose-dual-mode-for-context-dependent-tokens--n601)
— structurally documented matrix → multiple value columns; single-
context view → single `Value`). Future density / font dimensions
extend the same `showAll*` option family. No CSS edits, no value
changes; `npm test` 15/15; `npm run build` 216 + 18 × 2 × 2
unchanged; `tsc` exit 0.

N+6.0.1.1 (prior bridge) closed: 3-surface skill-routed enforcement cascade for
[decision 33](../decisionlog.md#33-semantic-token-docs--format-b-verbose-dual-mode-for-context-dependent-tokens--n601)
(Format B verbose dual-mode for context-dependent semantic tokens).
The N+6.0.1 session locked the convention in `decisionlog.md` and
applied it across `styles/tokens-semantic.css`; this session
propagates the rule to the spec-authoring surfaces so the next
agent inherits the convention via the skill rather than hunting
the decisionlog. [`skills/modify-tokens.md`](../skills/modify-tokens.md)
Semantic bullet, [`skills/add-accent.md`](../skills/add-accent.md)
per-family cascade step, and
[`skills/close-out-session.md`](../skills/close-out-session.md)
audit-asks each carry a tailored Format B cross-ref. Decision 33
gains a **Procedural enforcement cascade** section listing the 3
surfaces and contrasting against decision 30's trans-surface
5-layer cascade — surface-localized vs trans-surface is now a
documented judgment call for future enforcement-cascade sessions.
Explicitly NOT extended this session: AGENTS.md hard-rules,
`prompts/working-session.md` FIXED defaults, `skills/add-component.md`,
`skills/add-foundation.md` (decision 33's trigger fires only when
modifying `tokens-semantic.css`; adding cross-refs to those
surfaces would be false-positive). No CSS edits, no value changes;
`npm test` 15/15; `npm run build` emits 216 + 18 unchanged.

N+6.0.1 (prior bridge) closed: `styles/tokens-semantic.css` documents every
context-dependent semantic token (one that varies across
{theme, scope, accent, …}) with a **Format B inline comment** at
its canonical declaration block showing the full resolution
matrix; non-canonical blocks carry a terse 1-line cross-ref back
to the canonical instead of duplicating the matrix. All 18 tokens
that ship today (12 chrome + 6 accent) are dependency-dependent,
so all 18 carry Format B. Canonical assignment: chrome + neutral
accent → block 1 (`:root`); lilac accent → block 5
(`[data-accent="lilac"]`). The N+6.0 coordinator-polish narrative
comments at the 4 neutral blocks are retrofitted to canonical
Format B (insight preserved, distributed). All 6 cascade-block
headers refreshed; block 6 header explains the P4 intentional
omissions for frozen lilac tokens.
[Decision 33](../decisionlog.md#33-semantic-token-docs--format-b-verbose-dual-mode-for-context-dependent-tokens--n601)
locks the convention dependency-driven (varies-across-context →
Format B; invariant → terse role description). P4's "See" row in
`pages/principles.html` now cross-links decision 33 so agents
reading the principle find the implementation surface. No code
changes; no value changes; `npm test` 15/15; `npm run build`
emits 216 + 18 unchanged.

N+6.0 (prior bridge) closed: primitive dimension scale renamed
from indexed (`--nuri-size-{0..12}`) to direct-pixel
(`--nuri-px-N`, where N is the literal pixel value). Eleven values
ship — `--nuri-px-{2, 4, 6, 12, 18, 24, 28, 36, 48, 60, 72}` —
each consumed by ≥ 1 site post-migration (parsimony · P11). Two
hardcoded touch-target escapes retired: `styles/shell.css` ×3 of
44px → `var(--nuri-px-48)`, `lib/components/button/button.css`
56px → `var(--nuri-px-60)`.
[Decision 32](../decisionlog.md#32-primitive-scale-uses-direct-pixel-naming---nuri-px-n--n60)
locks the naming convention + the per-row migration mapping. The
`--nuri-size-*` prefix is reserved for the semantic sizing layer
arriving in N+6.1 (`xs · sm · md · lg · xl · 2xl · 3xl`); both
parsers' `TYPE_PREFIXES` keep a defensive `--nuri-size-` entry so
semantic-layer dimensions classify correctly at the moment they
land. `--nuri-px-90` deferred to N+6.1 (no current consumer; P11).
The N+5.7.1 parsimony lock fired automatically; no speculative
additions landed.

N+5.8 (prior bridge) closed: cream-default neutral parameterization.
The Node pipeline emits per a `--neutral=<scale>` CLI flag on
`pipeline/tokens-parser.js`; default = `cream` (warmer baseline
matching brand content tone); allowed scales = the 6 Radix neutrals
+ `gray` (kept as explicit option).
[Decision 31](../decisionlog.md#31-default-neutral-scale--cream--cli-parameter---neutral=scale--n58)
locks the default + CLI surface; the 6 alternatives stay in the
primitive layer via the [P11](../pages/principles.html#p11-parsimony)
exception (already in `RESERVED_COLOR_SCALES` since N+5.7). The
exploration page's web-side `data-neutral` switcher continues to
A/B-test alternatives at preview time without rebuilding; the CLI
flag controls only what `build/tokens.ts` emits for RN consumption.
Oracle re-derived hand-verified against `tokens-primitive.css`'s
cream block — not copied from parser output (the N+4 lilac-8 drift
lesson).

N+5.7.1 (prior bridge) closed: parsimony lock landed. The "ship
what's consumed" rule that N+5.7's cleanup pass validated
empirically (n=5 distinct drift instances) is now promoted to
philosophical foundation and procedural lock —
[P11](../pages/principles.html#p11-parsimony) captures the WHY in
`pages/principles.html`,
[decision 30](../decisionlog.md#30-primitive-parsimony--no-speculative-additions--n571)
captures the procedural lock in `decisionlog.md`, and a 5-layer
enforcement cascade ([AGENTS.md hard-rule 20](../AGENTS.md), the
[working-session FIXED anti-goal default](../prompts/working-session.md),
5 skill files, and the [close-out-session audit-asks](../skills/close-out-session.md))
makes the rule visible at every authoring touchpoint.
Primitive-layer drift is now mechanically caught at CI (N+5.7's
guardrail) AND upstream-prevented at every spec-authoring surface
(N+5.7.1's cascade); components / skills / pages get the upstream
protection only.

N+5.7 (prior bridge) closed: primitive cleanup landed. 45
audit-confirmed drift tokens deleted from
`styles/tokens-primitive.css` (12 orphan font-sizes, 10
line-heights, 20 shadows, 3 status placeholders); 2 docs-chrome
shadow hovers refactored to border-color emphasis.
[Decision 29](../decisionlog.md#29-line-height-is-unitless-proportional-not-absolute--n57)
locks line-height as unitless proportional; [amendment 27.1](../decisionlog.md#271-amendment--n57)
codifies font dimension as web-only. The guardrail test
(`every primitive token is consumed or explicitly reserved` in
`pipeline/tokens-parser.test.js`) catches future primitive
drift at the test boundary: every `--nuri-*` must be consumed
(direct `var()` or via an alias chain) or explicitly speculative-
reserved by name / scale.

N+5.6 (prior bridge) closed the doc restructure: HANDOFF (~800
lines) + ROADMAP (~520) + AGENTS (~600) split into focused files
([`decisionlog.md`](../decisionlog.md),
[`skills/`](../skills/), [`roadmap/`](.), [`prompts/`](../prompts/),
[`pages/implementation-guide.html`](../pages/implementation-guide.html));
per-session READ FIRST cost dropped from ~1900 lines to ~300.

Closeout audit ran (general-purpose sub-agent per
[skills/close-out-session.md](../skills/close-out-session.md)): 4
bugs (stale HANDOFF/ROADMAP cross-refs in
`pages/foundations/colour/primitive.html`,
`pages/foundations/colour/semantic.html`, `pipeline/parsers/semantic.js`,
`docs/RISKS.md`) + 1 drift (`pages/principles.html` decisionlog
cross-refs missing GFM anchors). All five applied in-pass; `npm test`
14/14 stays green; `npx tsc -p docs/migration-tests/button-matrix/tsconfig.json`
exits 0.

Architecturally we are at the close of N+6.1.1: the semantic
layer exposes a complete dimension vocabulary (space + size +
radius · 18 leaves total · T-shirt scale · cascade-invariant) —
space + size locked at [decision 36](../decisionlog.md#36-semantic-spacing--sizing-vocabularies--77-t-shirt-scale--cascade-invariant--n61)
at N+6.1, radius added at [amendment 36.1](../decisionlog.md#361-amendment--n611)
at N+6.1.1 — sitting on top of the
[decision 32](../decisionlog.md#32-primitive-scale-uses-direct-pixel-naming---nuri-px-n--n60)
direct-pixel primitive layer. The auto-promotion mechanism from
[decision 34](../decisionlog.md#34-per-component-files--tokenpath-union--set-policy--pipeline-emit-shape--n603)
flipped all three of button.css's dimension references
(minHeight · paddingX · radius) to TokenPath strings without
pipeline edits; the consumer-side static-vs-dynamic split
surfaced as the natural cost (resolved at the migration pair as
the reference pattern). The pipeline's source files live under
[`pipeline/`](../pipeline) (hand-maintained) and emit four output
files under [`build/`](../build) (100% generated · never
hand-edited · the physical-separation invariant locked at
[decision 35](../decisionlog.md#35-pipeline-sources-vs-build-outputs-physically-separated--pipeline-source-build-generated-only--n604)).
The three TS surfaces for the RN consumer — `build/tokens.ts`
(runtime sets only · monolite namespaced) + `build/components/<name>.ts`
(one file per component · today: `button.ts`) +
`build/token-paths.ts` (discriminated union over every runtime-set
leaf) — stay under the public-emit contract locked at
[decision 34](../decisionlog.md#34-per-component-files--tokenpath-union--set-policy--pipeline-emit-shape--n603).
The classifier internals stay at
[decision 28](../decisionlog.md#28-emitter-shape-derives-from-cascade-structure-not-from-a-hardcoded-list--n55)
(classify-by-cascade); decision 34 layers an orchestrator-level emit
contract on top + adds a `SET_POLICY` registry (cascade-varying →
auto-rule runtime; context-invariant → operator pick between runtime
and pipeline-inlined). `tokens.ts` neutral scope stays build-time
parameterizable
([decision 31](../decisionlog.md#31-default-neutral-scale--cream--cli-parameter---neutral=scale--n58)
· `--neutral=<scale>` CLI flag, default `cream`); the primitive
dimension scale stays direct-pixel
([decision 32](../decisionlog.md#32-primitive-scale-uses-direct-pixel-naming---nuri-px-n--n60)
· `--nuri-px-N` = N px literal); the semantic-token source documents
per-declaration with Format B at the canonical block
([decision 33](../decisionlog.md#33-semantic-token-docs--format-b-verbose-dual-mode-for-context-dependent-tokens--n601)
· dependency-driven · 18 tokens carry the matrix today); the RN
theme-provider direction is locked to orthogonal merge-on-override
Context
([decision 27](../decisionlog.md#27-theme-provider--custom-orthogonal-not-cross-product-registry--n55),
spec-only); line-height is locked unitless
([decision 29](../decisionlog.md#29-line-height-is-unitless-proportional-not-absolute--n57));
font dimension is web-only ([amendment 27.1](../decisionlog.md#271-amendment--n57));
the spec layer is parsimony-locked at primitive (mechanical · test
17) and upstream (procedural · P11 + decision 30 + 5-layer cascade);
the semantic dimension vocabulary (space + size + radius · 7+7+4
leaves · all shipped at the same session as the namespace per the
P11 "vocabulary IS the design surface" exception) is locked at
[decision 36](../decisionlog.md#36-semantic-spacing--sizing-vocabularies--77-t-shirt-scale--cascade-invariant--n61)
+ [amendment 36.1](../decisionlog.md#361-amendment--n611).
`npm test` is 17/17; `npm run build` emits 216 colour primitives at
the chosen neutral scale (default cream) + 36 semantic leaves (18
chrome + accent × 2 × 2 + 18 dimension singletons) + 1 component
file (button, 13 decls, 9 TokenPath refs) + 1 TokenPath union
(36 members). The migration pair typechecks against the new
`{ button, TokenPath, accent, chrome, space, size, radius,
resolveToken sketch }` shape (the consumer's `RuntimeTokens`
widens to include the three new namespaces; the resolver's return
widens from `string` to `string | number` to cover both colour
leaves and dimension leaves; the resolver-widening stays in place
for future cascade-invariant vocabularies that may ship genuine
mixed-literal leaves, though post-N+6.1.1-polish the radius
namespace is uniformly `number` (full = 9999 after px-strip)); web
`index.html`
unchanged. **F-TOKEN-1 still retired.** F-FONT-1 retired as a
structural drift class (component numerics now flow from live CSS,
not a hand-maintained constants block). F-LAYOUT-1 is the single
highest-friction missing surface (lands as N+6.2; the semantic
dimension vocabulary Stack/HStack/VStack consume is now in place
+ documented across 4 nested foundation pages).

## What's next · Session N+9 (candidate) · the first icon-consuming display component, now that the List family is refactored and recipe-capable

N+8 **refactored** the List family (decision 52): interactivity moved into
the `<nuri-list-interactive-item>` WRAPPER, the family flipped to EMIT, and
the system gained its **first recipe** (`<nuri-nav-item>`). The recipe
mechanism — a named composition over primitives via `<template>` clone —
is now proven, so the **second candidate recipe (`activity-item`)** and
the first icon-consuming display component are the open threads.

N+7 had shipped the **List family capstone** (List + ListItem · decision
51) — the row primitive that composes the N+6.9 building blocks (Separator
· IconAvatar) plus TypographyStack into ONE slotted `[leading] · content ·
[trailing]` shape. With N+8's refactor the family is **complete and
recipe-capable**; the next brief turns to the first icon-consuming display
component.

The **settings-row-with-Switch** shape (an interactive control *inside* a
row) remains **deferred** — it is cross-platform-gated (web can nest a
real `<nuri-switch>` in the trailing slot; RN's row-`Pressable` and an
inner `Switch` contend for the same press) and waits for a brief that
resolves that interaction model. ListItem ships interactive-row-as-button
only; a control-in-a-row is explicitly out of N+7 scope.

N+6.8 paid down the Icon RN renderer (F-ICON-RN-1 CLOSED · typed
`build/icons.ts` emit + `SvgXml` over the shared registry · IconButton
composes a real glyph). With the glyph path working both sides, the
icon-consuming components are no longer blocked. After N+7 the **List
family thread is closed** (TypographyStack · Separator · IconAvatar all
assembled into List + ListItem), leaving the next operator brief one
clear thread:

- **The List family TypographyStack enabled is now DONE** (N+7 ·
  decision 51). TypographyStack was built as the **line-hierarchy
  primitive** that **List · ListItem · Separator** compose for
  transaction rows, fee summaries, and Cancel/Save bars (decision 47);
  N+7 assembled exactly that, reusing the now-four-times-proven light-DOM
  compound mechanism (Tabs · Topbar · TypographyStack · ListItem). The
  basic ListItem stayed icon-free (composes IconAvatar, not Icon
  directly), so it landed as a clean component-surface step as predicted.
- **The first icon-consuming display component** (now the leading
  candidate). With the renderer closed, **SegmentedControl · TabBar · Tag**
  (`<nuri-tag status="draft">`) are unblocked on the RN side — each
  composes Icon, and the migration test can finally prove a *real* glyph
  through the IconButton/Icon funnel rather than a stub. A good first
  proof that the closed renderer holds up under a fresh consumer.

Lean: either is defensible now that the renderer no longer gates the
icon-bearing components. The **List family** is the lowest-risk
component step (composes the proven TypographyStack, can stay
icon-free); the first **icon-consuming display component** is the
higher-value validation that decision 48's glyph path generalises
beyond IconButton. No deferral pressure either way — the four-session
Icon debt is settled.

Deferred sub-threads (unchanged · land alongside if a real consumer
surfaces):

- **`outline` variant** — N+6.4 added `ghost` but explicitly left
  `outline` (a bordered tertiary) as a separate future variant
  (decision 39 anti-scope). It lands when a real consumer needs a
  bordered-but-fill-less action.
- **Divider** — ✓ **RESOLVED in N+6.9** (reframed, not built). Shipped
  as the standalone [`<nuri-separator>`](../pages/components/separator.html)
  generic 1px hairline rather than a Stack `divider` prop or a
  `<nuri-divider>` component ([decision 49](../decisionlog.md#49-separator--standalone-generic-1px-display-primitive--author-placed--horizontal-only--n69)).

## Sessions

| # | Status | Title | File |
|---|---|---|---|
| N+1 | ✓ closed | Foundation methodology | [→](./N+1.md) |
| N+2 | ✓ closed | Foundation pages canonicalization | [→](./N+2.md) |
| N+3 | ✓ closed | Philosophy alignment + skill router + page elimination | [→](./N+3.md) |
| N+3.5 | ✓ closed (bridge) | Pipeline thin slice + DRY hygiene | [→](./N+3.5.md) |
| N+4 | ✓ closed | Thesis validation · button-matrix translation | [→](./N+4.md) |
| N+5 | ✓ closed | Semantic-cascade pipeline slice (F-TOKEN-1) | [→](./N+5.md) |
| N+5.5 | ✓ closed (bridge) | Orthogonal theme provider + classify-by-cascade emitter | [→](./N+5.5.md) |
| N+5.6 | ✓ closed (bridge) | Doc restructure · monolith → granular | [→](./N+5.6.md) |
| N+5.7 | ✓ closed (bridge) | Primitive cleanup · drift removal + line-height proportional lock + font web-only polish | [→](./N+5.7.md) |
| N+5.7.1 | ✓ closed (bridge) | Parsimony lock · P11 + decision 30 + 5-layer enforcement cascade | [→](./N+5.7.1.md) |
| N+5.8 | ✓ closed (bridge) | Cream-default neutral parameterization · `--neutral=<scale>` CLI flag | [→](./N+5.8.md) |
| N+6.0 | ✓ closed (bridge) | Primitive rename · `--nuri-size-N` → `--nuri-px-N` direct-pixel scale | [→](./N+6.0.md) |
| N+6.0.1 | ✓ closed (bridge) | Semantic docs · Format B verbose dual-mode for context-dependent tokens + decision 33 lock | [→](./N+6.0.1.md) |
| N+6.0.1.1 | ✓ closed (bridge) | Decision 33 enforcement cascade · 3-surface cross-ref propagation | [→](./N+6.0.1.1.md) |
| N+6.0.2 | ✓ closed (bridge) | semantic.html dual-mode docs refactor · per-accent split + side-by-side themes + amendment 20.1 | [→](./N+6.0.2.md) |
| N+6.0.3 | ✓ closed (bridge) | POC pipeline rework · per-component files + SET_POLICY + TokenPath union + decision 34 lock | [→](./N+6.0.3.md) |
| N+6.0.4 | ✓ closed (bridge) | Pipeline sources vs build outputs physically separated · `pipeline/` source + `build/` generated-only + decision 35 lock | [→](./N+6.0.4.md) |
| N+6.1 | ✓ closed | Semantic spacing + sizing layers · button.css refactor · foundations · decision 36 lock | [→](./N+6.1.md) |
| N+6.1.1 | ✓ closed (bridge) | Dimension foundation completeness · primitive + radius pages · nesting reorg · amendment 36.1 lock | [→](./N+6.1.1.md) |
| N+6.2 | ✓ closed | Layout primitives (Stack + Box) consuming N+6.1 + 36.1 semantic dimension vocabulary · decision 37 lock · F-LAYOUT-1 retired | [→](./N+6.2.md) |
| N+6.3 | ✓ closed | Iconography · `<nuri-icon name size fill>` over a 17-glyph phosphor registry · decision 38 lock (registry-based JS dispatch) · F-ICON-RN-1 added | [→](./N+6.3.md) |
| N+6.4 | ✓ closed | IconButton (first real Icon consumer · single-size) · ghost variant (decision 39 · cross-component) · Button 3-size matrix (decision 41) · Behavioural-delta section (amendment 24.1) · F-ICON-RN-1 still OPEN | [→](./N+6.4.md) |
| N+6.5 | ✓ closed | Switch (first stateful standalone control · decision 44 · `button role=switch`) · Tabs (first multi-element compound + first Box-composition consumer · decision 43) · Box `background`+`radius` props (decision 42 · closes N+6.2 gate) · `--nuri-bg-inverse-muted` · F-CHECKED-STATE-1 + F-SELECTED-VALUE-1 + F-KEYBOARD-NAV-1 · F-ICON-RN-1 sidestepped 2nd session | [→](./N+6.5.md) |
| N+6.6 | ✓ closed | Topbar (first compositional chrome shell · second light-DOM child-reparenting compound · single `center` boolean · slots not use-case variants · empty `@layer tokens` · decision 46) · IconButton `fill` passthrough (amendment 40.1) · F-ICON-RN-1 sidestepped 3rd session · renderer direction refined (SvgXml over shared registry · no per-glyph codegen) | [→](./N+6.6.md) |
| N+6.7 | ✓ closed | TypographyStack family (text-hierarchy primitive · third light-DOM child-element compound · `<nuri-typography-stack>` + `-element level=1..5` · contextual level not absolute size · level on -element not Typography · empty `@layer tokens` · zero new tokens · decision 47) · inter-level rhythm values (column 2xs · row xs) operator-confirmed · F-ICON-RN-1 carried forward unchanged | [→](./N+6.7.md) |
| N+6.8 | ✓ closed (bridge) | Icon RN renderer · **F-ICON-RN-1 CLOSED** · typed `build/icons.ts` emit from the SSOT registry (17×3 · drift-guarded) · RN Icon over `react-native-svg` `SvgXml` · IconButton composes a real glyph · one registry two readers · no SVGR/per-glyph codegen · no rn-svg dependency (local type shim · type-only proof) · decision 48 | [→](./N+6.8.md) |
| N+6.9 | ✓ closed | List building blocks (batch 1) · Separator (standalone generic 1px hairline · author-placed · horizontal-only · skip-emit · closes Stack-`divider` by reframing · decision 49) · IconAvatar (static decorative twin of IconButton · composes `<nuri-icon>` directly · second Icon consumer · solid/soft/ghost mirror IconButton + avatar-only `subtle`→border-strong · skip-emit · Avatar name reserved · decision 50) · both zero new tokens · neither builds List/ListItem | [→](./N+6.9.md) |
| N+7 | ✓ closed | List family **capstone** · List (`role=list` flex column · no `gap` prop · `density` sm/md/lg→child `min-block-size` size-xl/2xl/3xl · targets `nuri-list-item` only so Separators stay 1px) · ListItem (**ONE slotted row shape** `[leading]·content·[trailing]` in document order · no reparenting · composes Separator/IconAvatar/TypographyStack/Icon as-is · `interactive`→full-row press overlay `role=button`+tabindex+Enter/Space+aria-label · `z-index` wash without `:has()` · nav-agnostic · no href/native-button/disabled/hover) · both skip-emit · zero new tokens · decision 51 · settings-row-with-Switch deferred (cross-platform-gated) | [→](./N+7.md) |
| N+8 | ✓ closed | List family **REFACTOR** · interactivity OUT of `list-item` into a declarative WRAPPER (`<nuri-list-interactive-item>` · WRAPS content in `role=button` so content IS the accessible name · structural fix for N+7's overlay double-read) · `list-item` reverts to presentational (no inline padding · trailing `margin-inline-start:auto` pin for bare-text rows) · **first RECIPE** `<nuri-nav-item>` (named composition via `<template>` clone · skip-emit · optional leading hoisted into the composed row) · family flips skip-emit→**EMIT** (`list`/`list-item`/`list-interactive-item` emit · `nav-item` skip-emit) · new `chrome.bgSubtleXFade` press wash (centred-plateau gradient · scale experiment removed) · docs split into Base + Navigation Item · decision 52 | [→](./N+8.md) |
| N+8.1 | ✓ closed | List **fix session** · revert press wash `chrome.bgSubtleXFade` gradient → flat `chrome.bgSubtle` (gradient can't cross to RN `backgroundColor` · R1) made full-bleed by a **counter-margin** on the action box · delete `--nuri-bg-subtle-x-fade` token + parser composite-gradient support (no semantic token has a gradient RHS) · remove `<nuri-list>` `gap` (decision 51 "no gap" holds) · **Separator gains `y-space`** (margin-block · default `sm` · accepts `none` · line stays 1px · amendment 49.1) as the inter-row rhythm · new `--nuri-space-none` (= 0) leaf · Separator stays skip-emit · amendment 52.1 | [→](./N+8.1.md) |
| N+8.2 | ✓ closed | TypographyStack **structural cleanup** · eliminate `<nuri-typography-stack-element>` (collapse 2-element compound → 1 · drop `level` sub-scale + `data-level` colour dispatch) · `<nuri-typography-stack>` flex-rhythm container survives (column 2xs · row xs · skip-emit) now laying out plain `<nuri-typography>` · **`<nuri-typography>` gains `muted` boolean** → `text-muted` (decision 42 attribute-dispatch · boolean NOT a `tone` enum · P11) · old 5-level scale **dropped** (replacement guidance table reviewed + deliberately not shipped · invented advice deferred until type-scale principles land · P11/decision 30) · components compose `<nuri-typography>` not raw `.nuri-type-*` (nav-item label · list-base anatomy row · leading icon-avatar kept) · RN mirror **structural-only** (drop `TypographyStackElement`+`TYPOGRAPHY_STACK_LEVELS` · add `Typography` FC) · type-emit reversal of decision 34 deferred to N+8.3 · both stay skip-emit · decision 53 amends/supersedes decision 47 `-element` half | [→](./N+8.2.md) |
| N+8.3 | ✓ closed | Type scale **EMITTED** as a directly-accessed namespace (reverses decision 34's `type`-pipelineInline clause) · `pipeline/parsers/type.js` emits `type.{size}` + `type.{size}Em` (xs/sm/md/lg/xl/3xl · `{ fontSize, lineHeight, fontWeight, letterSpacing }`) into `build/tokens.ts` from `--nuri-type-*` — directly-accessed like `icons`, NOT a cascade/TokenPath set · *one source, two readers* (decision 48) · `fontSize`→px, `lineHeight`→unitless ratio + `letterSpacing`→em both **verbatim/relative** (RN dp don't scale w/ fontScale · web↔RN spacing-that-scales parity · a11y) · single relative→absolute conversion in consumer `typeStyle(key)` helper (future `* fontScale` point · P11) · independent-re-derivation **drift guard** in tokens-parser.test.js · RN `Typography` dereferences emit (**`TYPOGRAPHY_SIZES` removed**) · **web UNCHANGED** (zero-build · CSS not regenerated) · decision 54 · **follow-up N+8.4: Button + Tab font-token consolidation** (Topbar owns no font tokens · not in scope) | [→](./N+8.3.md) |
| N+8.4 | ✓ closed | **Component-owned labels source type from the shared scale** (decision 55 · applies decision 54's element-vs-values rule) — Button drops `--nuri-button-*-font-size`/weight (lg/md = type-md-em · sm = type-sm-em · all 4 attrs) · Tab drops `--nuri-tab-font-*` → type-sm-em (fixes latent RN 17px→15px bug) · **Topbar becomes font-bearing**: centre region carries default lg-em · bare title text inherits (no `<nuri-typography>` · amends decision 46 → [46.2](../decisionlog.md#462-amendment--n84--topbar-is-now-font-bearing-for-its-title)) yet still owns zero `--nuri-topbar-*` tokens · CSS refs `--nuri-type-*` **primitives-direct** (button/tabs pages don't load typography.css) · line-height **align-to-scale** (1.29/1.33 · operator-chosen over bespoke 1.2) · **no new tokens** (P11) · gates green (test 19/19 · build · tsc 0) | [→](./N+8.4.md) |
| N+9 | ✓ closed | **TabBar** · icon-only BOTTOM destination switcher (My-vault / Coin / Activity) · compound `<nuri-tab-bar>` (controller · owns `value`) + `<nuri-tab-bar-item>` (icon-only target) sharing one selection · mirrors Tabs' value/active **mechanics** but DISTINCT semantics — navigation chrome `<nav>`+`<button>`+`aria-current="page"`, router-agnostic, NOT a tablist (F-TABBAR-ROLE-1) · **EMITs one baked token** `--nuri-tab-bar-height: size.xl` (shares Topbar's chrome rhythm · first chrome primitive to bake a single structural token) · items **direct-semantic** (selected text-primary+fill · rest border-strong+regular · pressed text-muted+press-scale · NO bg change · zero per-item tokens · IconAvatar/Topbar precedent) · chrome-only (accent has no effect) · `inline-size:100%` full-width (operator-chosen at checkpoint) · no position:fixed/safe-area/top-border (P11) · reuses Button press-scale (decision 45) + F-ARIA-LABEL-1 + F-SELECTED-VALUE-1 · **zero new tokens** · decision 56 · gates green (test 19/19 · build · tsc 0) | [→](./N+9.md) |
| N+10 | ✓ closed | **Playground** · a SEPARATE composition area (`<nuri-playground-shell>` · simpler sibling of `<nuri-shell>` · card grid / horizontal device-frame row) · `<nuri-demo>` gains a `device` control + `board` layout · 4 device presets × 4 platform chrome kits (screen owns the logical dimensions · JS structure / CSS paint) · scoped-device theming (scope wraps only the phone screen) · cross-cutting token-cascade fixes ([data-neutral]/[data-font]/[data-theme="light"] → attribute-only · accent-travels-with-theme) · **My vault** first document (existing parts only · no new component/token/glyph) · decision 57 · gates green (test 19/19 · build · tsc 0) | [→](./N+10.md) |
| N+11 | ✓ closed | **Layout scaffold** · `<nuri-screen>` (full-height column) + `<nuri-scroll>` (grow + overflow · scrolling is a COMPONENT in RN, not a View style → its own primitive · decision 58) + `<nuri-spacer>` (grow / fixed `size` / proportional `grow` · decisions 59/61) · Box+Stack **`fill`** (`flex:1 0 auto` · RN contentContainerStyle flexGrow · decision 60) · Typography **`align`** (text-align · decision 59) · **TabBar is a SIBLING of Screen** (navigator owns the safe-area · primitives inset-agnostic) · fixes: Topbar `size.lg` + empty-side-region collapse (46.3) · IconButton `flex-shrink:0` · playground accent pin (lilac) + shell neutral-gray (57.1) · DS sidebar pinned **Playground** CTA · My-vault now **100% DS composition** (zero page-local CSS) · RN mirror + DS docs · gates green (test 19/19 · build · tsc 0) | [→](./N+11.md) |
| N+11+ | planned | Second playground document (Coin / Activity behind the TabBar) — the second consumer that evidence-gates the LOGGED BalanceRow / AmountDisplay / swap-overlay candidates · revisit the deferred general `grow` prop · resolve F-TEXTALIGN-RTL if an RTL consumer appears | — |
| N+12a | ✓ closed | **Docs freshness + Scope page + drift guards** · de-rotted the agent-facing entry points against the **live build** (not the stale prior audit): `principles.html` P10/P11 (Style Dictionary **bypassed** · terminal emitter `pipeline/parsers/semantic.js` → `build/components/<name>.ts` · decisions 2.1/7.1/34 · behavioural-delta "planned"→**shipped** per 24.1) · `README.md` + `llms.txt` counts (38 semantic leaves · 8 component files · 17 glyphs · 5 build assets incl. `build/icons.ts` · 18 component pages) · **new `pages/components/scope.html`** consolidating the web cascade mechanism + RN `NuriThemeContext` spec + cascade↔context delta (NAV "Theming" group · "start here" link from impl-guide §3 · `scope/README.md` 672→**336** math fix) · **`pipeline/docs-drift.test.js`** (sibling · 3 CI guards: page-tree⊂llms.txt · build/components⊂README∩impl-guide · doc counts==live build) · gates green (test **19/19 + 3 drift** · build · tsc 0) | — |
| N+12b | ✓ closed | **Migration-test split** · the 1961-line `button-matrix/index.tsx` monolith → **one file per component** (shared scaffolding in `_shared.tsx` · demos in `app.tsx` · `index.tsx` retired to a thin re-export) · each mirror **verified against its CURRENT web API** while moved (not a mechanical lift) · 3 pre-existing drifts **logged not fixed** (D1 Box bg/radius · D2 Button size · D3 Tab disabled) + D4 IconButton emit-deref noted · dir name + tsconfig path UNCHANGED (CI gate stable) · gates green (tsc 0 · test 19/19 + 3 drift · no `build/` diff) | [→](./N+12b.md) |
| N+14 | ✓ closed (#6) | **Migration-conformance fixes** · the read-only conformance audit found the button-matrix test **FAITHFUL** (0 CODE-DEVIATES · 0 CONCEPT-MISMATCH) — only 3 doc/code sbavature + 1 operator-gated sourcing question, all fixed here with **no new decision** · (1) impl-guide cascade cell density/neutral *"Optional"* → **"reserved · not fields"** (matches the page's shipped-shape block + `scope.html`) · (2) Tier-2 **skeleton** rewritten to match live `button.tsx` (per-size `GEOMETRY`/`LABEL_KEY` · `typeStyle` label · drops nonexistent `styles.label` · dec 41/55) · (3) `list.tsx` `DensityContext` → **`RowDensityContext`** (+ comment · clears the name collision with the reserved scope `density` dimension) · (4) operator-chosen at checkpoint: IconAvatar geometry sources the **shared semantic scale** (`resolveToken('size.lg'/'radius.full')`) mirroring the web `var(--nuri-size-lg)`/`var(--nuri-radius-full)` direct consumption — removes the lone RN hardcode **without** coupling to `iconButton.*` and **without** amending decision 50 · closeout audit clean · gates green (test 22/22 · build · no `build/` diff · tsc 0) | [→](./N+14.md) |
| N+13 | ✓ closed (#5) | **Migration-test reconciliation** · closes the spec↔example contradiction the split surfaced — the mirrors now **IMPLEMENT** decision 27's single `NuriThemeContext` (`{ mode, accent }`) + composite `NuriScope` (merge-on-override), replacing the two per-dimension contexts (decision 27 had REJECTED) · **F-SCOPE-1 CLOSED** (n=1 confirmation · **decision 62**) · **D1–D4 faithful adds** honoring existing decisions (Box `background`/`radius` dec 42 · Button `size` dec 41 · Tab `disabled` dec 42/43 · IconButton emit-deref dec 52) with **F-BOX-FG-1** + **F-TAB-DISABLED-1** logged · scope page + `scope/README.md` + impl-guide now describe EXACTLY what the examples do (zero residual gap) · impl-guide split pointer + deep-link fixes (retired `index.tsx` → `button.tsx`) · `density`/`neutral` stay reserved (P11) · gates green (test 22/22 · build · no `build/` diff · tsc 0) | [→](./N+13.md) |
| N+15 | ✓ closed (#7) | **accent×theme self-scope cascade fix** · a Tier-2 self-scope (inner `data-accent`, no `data-theme`) rendered the **LIGHT** accent inside a **DARK** ancestor (playground My-vault dark: swap IconButton + IconAvatars dark-on-dark/invisible) · root cause: dark accent overrides were **compound** selectors `[data-accent="X"][data-theme="dark"]` needing both attrs on one element, but a self-scope carries only `data-accent` · fix (approach A · parser-transparent): two **descendant-combinator** dark blocks `[data-theme="dark"] [data-accent="X"]` (**#4b** neutral · **#6b** lilac · P4 brand triple omitted) → emit **byte-identical** · candidate B (accent-as-pointer) **rejected** (breaks classify-by-cascade) · documented known limitation **F-SCOPE-3** (a descendant combinator matches ANY dark ancestor · P11 revisit-trigger · no consumer nests opposite themes) · RN single-context model **immune** (positive control) · web-CSS-only · decision 63 · gates green (test 22/22 · build byte-identical · tsc 0) | [→](./N+15.md) |
| N+16 | ✓ closed (#11) | **RN mirror layout back-ports** (R-EXPO-3/4/5 · = SPEC-FEEDBACK F-DEMO-2/3/4) · **mechanical conformance pass, no new decision** (N+14 posture) — back-port the consumer's already-validated fixes into the canonical TYPE-ONLY mirrors · (1) **Button** drops base `flex: 1` (web `.nuri-button` is `inline-flex`, no grow → content-sized leaf; full width in a column from parent `alignItems:'stretch'` · F-DEMO-2) · (2) **Scroll** defaults `contentContainerStyle={{flexGrow:1}}` overridable (a ScrollView content container is content-sized → a `Box fill` child had no slack; the faithful RN realization of the web definite-height flex-column scroll · F-DEMO-3 · decision 60) · (3) **Separator** axis-ABSOLUTE `width:'100%'`+`flexShrink:1` (was `alignSelf:'stretch'` = cross-axis-relative → 0 width in a ROW; web is `inline-size:100%` · F-DEMO-4) · `scroll.tsx`/`separator.tsx` headers rewritten (described OLD behaviour) · **Topbar (R-EXPO-2) EXCLUDED** (larger migration issue · separate investigation) · type-only (`noEmit`) → tsc proves types not layout (render validation = Expo consumer) · no `lib/`/`pipeline/`/`build/` touch · closeout audit clean · gates green (test 22/22 · build byte-identical · tsc 0) | [→](./N+16.md) |
| N+18 | gates green · **PR ready (A merged · #15 pred.)** | **Topbar → content-pivot open primitive** (amendment 46.4 · decision 64) · drops JS region-reparenting → a `<nuri-topbar-content>` pivot (`flex:1`) + **positional** leading/trailing siblings · **deletes** the reparenting + `data-leading/-trailing` occupancy + `display:none` empty-side collapse + `<nuri-topbar-start>`/`<nuri-topbar-end>` · keeps `center` + declarative per-edge `inset` (default `lg` · never auto-by-type) · bare-text title **REUSES Typography** (`.nuri-type-lg--em` utility / `<Typography size="lg" emphasis>` · single text-style owner · supersedes 46.2's hand-applied font) · non-text centre passes through · **resolves R-EXPO-2 a/b/c** (= F-DEMO-6) structurally (no phantom gap · no collapsed trailing · non-text not `<Text>`-wrapped) · **center** centres in the pivot (symmetric=true / asymmetric ~7px · operator: ship as-is · true-centre → future recipe) · RN mirror 1:1 (height `size.xl`→`size.lg` to match web) · page + playground (`shell.js` · `my-vault.html`) consumers migrated · **skip-emit · `build/` byte-identical · no new decision** · runs PARALLEL with Session A (List · 52.2) on disjoint files · gates green (test 22/22 · build byte-identical · tsc 0) | [→](./N+18.md) |
| N+17 | ✓ closed (#14) | **List family → content-pivot + scalar NavItem** (amendment 52.2 · the List half of **decision 64**) · **mechanical implementation of a decided contract, no new decision · no emit-shape change · `build/` byte-identical** · (1) **ListItem** → OPEN primitive on the content-pivot: `<nuri-list-item-content>` (`flex:1; min-inline-size:0`) is the only wrapped region; leading/trailing are **positional siblings** · **deleted** the `<nuri-list-item-leading>`/`-trailing>` element defs + CSS and the bare-text `margin-inline-start:auto` patch (pivot `flex:1` pushes trailing by construction) · aligns web to the validated RN shape; pivot maps to `<View>` never `<Text>` (avoids R-EXPO-2c) · (2) **NavItem** → CLOSED scalar recipe `text`/`icon?`(→leading IconAvatar)/`variant?`/`accent?`/`onpress` (required) · children-distribution loop gone · caret always-present, muted via `.nuri-nav-item__caret` (dec 38) · arbitrary leading drops to the ListItem primitive (escalation rule) · (3) RN mirrors 1:1 (`ListItemContent` + positional children · scalar `NavItem` · `onPress` required) · app.tsx demos updated · tsc 0 · (4) pages → content-pivot + scalar; **behavioural-delta sections** added to both List pages (only interactive pages lacking one · amendment 24.1) surfacing the irreconcilable `F-LISTITEM-ROLE-1` + `F-FOCUS-1` · **flex:1 STOP**: coordinator decided **NOT to emit** `flex:1`/`min-inline-size:0` (structural invariants like `flex-direction:row`; Topbar content-pivot shares them but is skip-emit; systemic fix is **R-EXPO-6**) → stay hand-mirrored (correct · known-deferred) · **No Topbar** (amendment 46.4 separate) · closeout audit clean · gates green (test 22/22 · build byte-identical · tsc 0) | [→](./N+17.md) |

## Expo consumption feedback · R-EXPO work queue

**Source.** The spec was consumed by a real RN+Expo demo (a separate codebase,
`expodsdemo/` · the repo snapshot lives there under `DesignSystemSpec/`). The
demo's single seam imports the real `build/*` emit (decision 35), so it exercises
the contract — not a re-hardcode. **Two independent external audits converged** on
the same findings: the demo team's `SPEC-FEEDBACK.md` (6 `F-DEMO-*` findings + 2
positive controls) and a separate consumer-code review (which added the Topbar
`<Text>` item). The thesis held on the FIRST real render — token paths,
single-context theming (decisions 27/62), scope tiers, the N+15 neutral inversion,
icon `SvgXml`, and the budgeted a11y deltas all confirmed at runtime (positive
controls). This **takes the repo off "waiting-for-Expo-feedback" pause**: the
consumer experiment is owned elsewhere — we act on the findings here, we do **not**
build the RN package in this repo. The original feedback is preserved verbatim as a
frozen, dated snapshot —
[`docs/consumer-feedback/SPEC-FEEDBACK-2026-06-02.md`](../docs/consumer-feedback/SPEC-FEEDBACK-2026-06-02.md)
— so this queue stays auditable against the source (R-EXPO is the synthesis; that
file is the evidence).

**Why the type-only test missed these.** The `button-matrix` migration test is
TYPE-ONLY (`noEmit`, never renders), so `tsc` is green while RN runtime layout
(flex grow/basis, ScrollView content sizing, `<Text>` child validity) is
unexercised. 4 of the 6 findings are exactly that blind spot — see
[`docs/RISKS.md`](../docs/RISKS.md) R5 (the Expo consumer is now the render smoke
path) and R1.

Prioritized DS work queue (codes map 1:1 to the demo's `F-DEMO-*`):

- 🔴 **R-EXPO-1 · Button needs an icon slot (= F-DEMO-1) — CONTRACT gap, needs a
  DECISION.** Web `<nuri-button>` is slot-like; the RN mirror types
  `children: string` (text-only · `button.tsx:54`). The spec's own My-vault puts an
  icon in a Button (Apple-Pay row). Decide the shape — a `leading?`/`trailing?` icon
  slot, or widen `children` — and how the label colour reaches a nested `<Icon>` (RN
  `<Text>` colour does not inherit into a child `<Icon>`; no `currentColor` analogue
  · same family as F-BOX-FG-1). → **Open question** (below).
- ✅ **R-EXPO-2 · Topbar cluster (= F-DEMO-6). · RESOLVED N+18 (decision 64 · amendment 46.4)**
  Resolved **structurally** by the content-pivot refactor — not a patch of the old reparenting
  mirror. Topbar became an OPEN primitive on the content-pivot anatomy: a `<nuri-topbar-content>`
  pivot (`flex:1`) + **positional** leading/trailing siblings, web↔RN identical. (a) **no phantom
  gap** — a positional empty side is absent, so nothing reserves a `gap` slot (the amendment 46.3
  violation is moot); (b) **no collapsed trailing** — leading/trailing are self-sized positional
  controls, never a `flex:0` (basis-0) side region (the old `flex: sideFlex` bug has no surface);
  (c) **non-text centre not `<Text>`-wrapped** — the lg-em title applies to BARE TEXT only via a
  composed Typography, a non-text centre passes through. The blanket `<Text>`-wrap is gone and
  amendment 46.2's hand-applied font is superseded (see its re-decided note). The web
  `lib/components/topbar/*`, the page, and the playground consumers migrated alongside; `build/`
  byte-identical.
- ✅ **R-EXPO-3 · Remove `flex: 1` from the RN Button base (= F-DEMO-2). · landed N+16 (#11)**
  `docs/migration-tests/button-matrix/button.tsx` (`styles.base`) hardcoded
  grow; the web button is `inline-flex` (no grow), so a leaf control should not grow
  to fill its row. **Resolved**: `flex: 1` dropped — full width in a column now comes
  from the parent Stack's default `alignItems: 'stretch'` (matches web inline-flex:
  natural width in a row, full width in a column). Confirmed against the in-repo
  mirror + the `button.css` SoT.
- ✅ **R-EXPO-4 · Scroll needs `contentContainerStyle: { flexGrow: 1 }`
  (= F-DEMO-3). · landed N+16 (#11)** A `Box fill` child cannot fill a bare
  `ScrollView { flex: 1 }` on device — the content container must grow. **Resolved**:
  `Scroll` now defaults `contentContainerStyle={[{ flexGrow: 1 }, contentContainerStyle]}`
  (overridable) — the faithful RN realization of the web's definite-height flex-column
  scroll (`scroll.css` · decision 60).
- ✅ **R-EXPO-5 · Separator must be axis-absolute (= F-DEMO-4). · landed N+16 (#11)**
  In a ROW, `alignSelf: 'stretch'` collapses to 0 width; mirror the web
  `inline-size: 100%` with `width: '100%'` + `flexShrink: 1`. **Resolved**:
  `alignSelf:'stretch'` replaced with `width:'100%'` + `flexShrink:1` — the hairline
  now survives both a column and a row.
- 🟢 **R-EXPO-6 · Build emits TOKENS but not the curated PROP vocab (= F-DEMO-5) —
  pipeline enhancement. DECIDED · [decision 65](./../decisionlog.md#65-r-expo-6--the-emitted-component-descriptor-as-a-frozen-contract--complete-l3--factory-drafted-here--finalized-in-expo--n19).** `SpaceLeaf`, Box `background`/`radius`, variant enums, etc.
  live only in CSS `[data-*]` selectors (skip-emit primitives · decision 36), so the
  RN side hand-types them → silent drift (unlike the drift-guarded `TokenPath`).
  **Resolves at the COMPLETE component descriptor (L3)** — vocab + prop→token
  mappings + parts/anatomy/layout config emitted as typed `.ts`. The **descriptor is
  the frozen cross-repo contract** (owned here · schema-shape guard test · post-freeze
  changes versioned); the RN **factory** is **drafted in-repo typecheck-only** (the
  evolved migration-mirror) and **finalized in a demo Expo project** — this repo never
  ships the factory. Systemic; the biggest of the six.
  · **N+17 breadcrumb (known-deferred · do NOT one-off):** the content-pivot's
  **structural values** (`flex:1` / `min-inline-size:0` on `<nuri-list-item-content>`,
  same category as `flex-direction:row` / `align-items:center`) live only in
  `list-item.css` `@layer rules` and are **hand-mirrored** in `list.tsx`. At the N+17
  checkpoint the operator flagged this; the coordinator decided **NOT to emit** them as
  component tokens — they are pattern invariants, not tunable baked decisions, and
  Topbar's content-pivot shares the same `flex:1` while staying skip-emit (decisions
  46/37) — so a `contentFlex` token would force an incoherent asymmetry. **Resolved-by-design
  (decision 65)**: the structural values become **descriptor data** (not a per-component token).
  Still **hand-mirrored until the working session lands** (correct, not debt), exactly
  like `flex-direction:row`.

R-EXPO-3/4/5 **landed in N+16 (#11)** as mechanical conformance back-ports to the
migration-test mirrors — each brought into parity with **both** its web source-of-truth
and the consumer's validated F-DEMO resolution (the demo already carried the correct
fix). They are **type-only** mirrors (`noEmit`, never render), so the green `tsc`
proves TYPES; the layout validation is the Expo consumer render itself (out of this
repo). **R-EXPO-2 (Topbar) — pulled from N+16 as a larger migration issue — is now RESOLVED in
N+18** (decision 64 · amendment 46.4): the content-pivot refactor fixes a/b/c structurally on
both platforms (not a back-port of the old reparenting mirror), so it was the right call to defer
it from the mechanical N+16 pass. R-EXPO-1 remains gated on the open question below; **R-EXPO-6 is now DECIDED ([decision 65](./../decisionlog.md#65-r-expo-6--the-emitted-component-descriptor-as-a-frozen-contract--complete-l3--factory-drafted-here--finalized-in-expo--n19))**.

## Open questions (in flight)

- **Expo consumption · 2 contract questions (R-EXPO-1, R-EXPO-6 · 2026-06-02).**
  Surfaced by the first real RN render (see the [Expo consumption feedback ·
  R-EXPO work queue](#expo-consumption-feedback--r-expo-work-queue) above).
  (1) **Button icon-slot shape (R-EXPO-1)** — a `leading?`/`trailing?` icon slot
  vs widening `children`, plus how the label colour reaches a nested `<Icon>` (no
  RN `currentColor`). (2) **Emit the curated prop vocab (R-EXPO-6)** — should the
  pipeline emit the skip-emit prop unions (`SpaceLeaf`, Box `background`/`radius`,
  variant enums) so the RN side derives them instead of hand-typing (decision 36
  keeps them CSS-only today)? **RESOLVED by [decision 65](./../decisionlog.md#65-r-expo-6--the-emitted-component-descriptor-as-a-frozen-contract--complete-l3--factory-drafted-here--finalized-in-expo--n19)** — emit the **complete component descriptor (L3)** (vocab + prop→token
  mappings + parts/anatomy/layout), not just the vocab; the descriptor is the frozen
  cross-repo contract. (1) gates its R-EXPO fix; the other four items
  are mechanical and need no decision.
- **General `grow` prop vs Spacer-only (N+11 · decision 59).** When the
  fill/push need first surfaced (swap-row separators · value-push-right) the
  operator chose to ship **`<nuri-spacer>`** first and "see what emerges" rather
  than a general `grow` boolean on every layout primitive. Spacer + the
  container-level `fill` (decision 60) covered every N+11 case, so the general
  `grow` prop stays **deferred** — revisit only if a real layout needs per-child
  grow that neither Spacer (an empty filler) nor `fill` (a container) expresses.
- **F-TEXTALIGN-RTL · logical vs physical text alignment (N+11 · decision 59).**
  Web Typography `align` is logical `text-align: start|center|end` (RTL-aware);
  RN `textAlign` has no logical start/end, so the RN mirror maps to PHYSICAL
  left/right (the LTR case). True RTL would flip end↔left via
  `I18nManager.isRTL` / `writingDirection` — **logged, not solved** (P11). Resolve
  when an RTL consumer appears; until then the props-1:1 holds and only the
  RTL-flip behaviour is unbudgeted.

- **TypographyStack level-1 has no shipped list consumer yet (P11
  parsimony note) · ✓ RESOLVED in N+7 — deliberate scale-top, no
  displacive cost.** The level scale tops out at **level 1** (`lg`
  em); the docs demos exercise it, but the originating transaction-row /
  fee-summary list items only reach **level 2** (`md` em). N+7 shipped
  the List family (List + ListItem · decision 51) and its real row
  consumers — disclosure · transaction · summary — top out at **level 2**
  exactly as predicted; none minted a level-1 list consumer. The
  resolution is the second branch the question anticipated: level 1 stays
  a **deliberate scale-top** that ships because the scale **is** the
  design surface (the P11 "vocabulary IS the design surface" exception ·
  same precedent as the complete T-shirt + Radix scales ·
  [decision 36](../decisionlog.md#36-semantic-spacing--sizing-vocabularies--77-t-shirt-scale--cascade-invariant--n61)),
  **not** because a current consumer needs it — and carries no displacive
  cost (a future section-heading row can adopt it without a new token).
  Referenced from
  [`typography-stack.html`](../pages/components/typography-stack.html)'s
  Roadmap. **N+8.2 retires the framing itself:** the 5-level scale is
  gone — not an enforced `level="1..5"` element, and (after operator
  review) deliberately **not** a guidance table either
  ([decision 53](../decisionlog.md#53-typographystack--element-eliminated--muted-on-typography--n82)).
  "Level 1 has no consumer" is therefore moot — there is no level
  vocabulary at all; an author who wants that step simply writes
  `size="lg" emphasis`. A formal hierarchy doctrine is deferred until the
  type-scale principles are documented, at which point it can land
  grounded in principles rather than guesswork.
- **Icon RN renderer (F-ICON-RN-1) · ✓ RESOLVED in N+6.8.** The web
  `<nuri-icon>`
  ([`lib/components/icon/icon.js`](../lib/components/icon/icon.js))
  inlines an SVG string keyed by `name` from the registry
  ([`icons.js`](../lib/components/icon/icons.js)); the RN equivalent now
  dereferences the **same registry** through `react-native-svg`'s
  `SvgXml`, with identical weight-coupling (md→regular · sm→bold ·
  any+fill→fill) and `currentColor` → `color` mapping. Open and
  deliberately sidestepped four sessions (N+6.4 made it maximally
  concrete; N+6.5/6.6/6.7 each shipped non-Icon deliverables, carrying
  an honest stub rather than a partial renderer), then closed in N+6.8
  along the direction locked at N+6.6: a typed
  [`build/icons.ts`](../build/icons.ts) pipeline emit (drift-guarded)
  feeding `SvgXml` — **one registry, two readers**, **no** SVGR /
  per-glyph `<Path>` codegen, **no** `react-native-svg` dependency
  (local type shim · type-only proof). IconButton composes the real
  glyph in place of its `View` stub.
  [Decision 48](../decisionlog.md#48-typed-buildiconsts-emit--svgxml-over-the-shared-registry--one-registry-two-readers--n68)
  records it; F-ICON-RN-1 is CLOSED in
  [`docs/RISKS.md`](../docs/RISKS.md) R1 and
  [`FRICTIONS.md`](../docs/migration-tests/button-matrix/FRICTIONS.md).
  **Remaining open thread:** the renderer is proven only against the
  IconButton/Icon funnel via a type-only migration test — a *real* RN
  build (or the first icon-consuming display component) is still needed
  to exercise it at runtime.
- **Pipeline auto-import / re-extraction trigger for the icon
  registry** · Today the 51 phosphor path strings in
  [`icons.js`](../lib/components/icon/icons.js) are hand-curated,
  extracted once from `@phosphor-icons/core` by a throwaway local
  script. Open: should a future build step re-extract on
  registry-key changes (detect a new key → pull its 3 weights from
  the devDependency → write the path strings), or does the
  hand-curated edit stay the deliberate gate? Lean: keep manual
  until the registry grows past a size where hand-maintenance drifts
  (catalog governance question below is the same pressure from the
  other side). Defer; no consumer pain today.
- **Raw-weight / stroke unlock** · Icon couples weight to size+fill
  (decision 38) and deliberately does NOT expose phosphor's full
  weight set (`thin · light · regular · bold · fill · duotone`).
  If a real consumer needs a weight the coupling doesn't produce
  (e.g. `duotone` for a decorative hero glyph, or `light` for a
  large display icon), revisit the coupling — but only with a
  concrete consumer in hand (P11 · ship what's consumed). Defer
  until evidence exists; the coupling is the right default until
  then.
- **Catalog governance · growing past 17 glyphs** · The registry
  is hand-curated to exactly the 17 keys current Nuri consumers
  need, not a wholesale phosphor re-export. Open: what's the policy
  for adding the 18th glyph — who approves, what bar must a new
  consumer meet, is there a ceiling? No process today (operator
  picks per-request). Re-evaluate at the second expansion request;
  if additions become frequent the pipeline auto-import question
  above becomes the mechanical answer.

- **`--nuri-radius-{none,xs,xl,2xl}` primitive leaves without semantic
  consumers** ·
  [N+6.1.1](./N+6.1.1.md) moved sm/md/lg/full to the semantic layer
  (the original shadowed-primitive open question was **resolved** in
  the [N+6.1.1 post-close polish](./N+6.1.1.md#post-close-coordinator-polish)
  by deleting the primitive `--nuri-radius-full` and aligning the
  semantic value at `9999px`). The remaining four primitive radius
  leaves (`none=0`, `xs=2px`, `xl=16px`, `2xl=24px`) stay in
  `RESERVED_TOKENS` because no current semantic radius leaf maps to
  those values. Two are consumer-active (`--nuri-radius-xs` ×2 in
  shell.css for sub-pixel chrome) and two are pure speculative
  reservation. **Resolve when a future component or chrome edit
  consumes one of the four** — promote that leaf to semantic with a
  T-shirt name + value mapping, drop the primitive declaration, fall
  through the same auto-promotion path. No urgency; current state
  passes test 17 and parsimony.
- **P3 enforcement for component-level CSS · mechanical guardrail
  vs layout-primitive exception · UPDATED post-N+6.2 evidence** ·
  [Hard rule 1 / P3](../pages/principles.html#p3-components-consume-semantic)
  says components consume semantic tokens, never primitive. Today
  the rule is procedural (skill cross-refs · prompt anti-goals)
  rather than mechanical — a hypothetical guardrail could grep
  `lib/components/**/*.css` for `var(--nuri-px-` / `var(--nuri-color-`
  and fail the build. **N+6.2 evidence in**: layout primitives
  (Stack + Box) consume the semantic space vocabulary via prop with
  ZERO component-token alias indirection — the consumption pattern
  is "attribute-dispatch in `@layer rules`, empty `@layer tokens`"
  ([decision 37](../decisionlog.md#37-layout-primitives-consume-semantic-vocabulary-via-prop--no-component-token-aliasing--n62)).
  This IS the carve-out class the Open question flagged: a
  mechanical P3 guardrail should exempt components whose
  `@layer tokens` block is empty (they have no surface to violate
  P3 from). Re-evaluate when N+6.3+ components surface other
  patterns; today the carve-out shape is one structural rule
  ("if `@layer tokens` is empty, skip P3 grep") and zero current
  violations across both Button (component-tokens, all semantic
  references) and Stack/Box (no component-tokens).

- **RN spec home for layout primitives (and future
  non-component-token components)** · Today Stack/Box RN
  definitions live in the
  [migration-test pair](../docs/migration-tests/button-matrix/index.tsx)
  as a local module. Long-term options: peer file
  `lib/components/<name>/<name>.tsx`? Separate `lib/spec/`
  namespace? Inline TS in
  [`lib/components/<name>/<name>.css`](../lib/components/stack/stack.css)
  via a code-block comment that a future parser extracts? **The n≥2
  trigger condition is now MET** — as of N+6.7 the migration file
  co-hosts Box, Button, IconButton (stub), Switch, Tabs, Topbar, and
  TypographyStack (`TypographyStack` + `TypographyStackElement` +
  `TYPOGRAPHY_STACK_LEVELS`) RN definitions in one module, well past
  the single-consumer threshold this question was waiting on. The file
  is getting crowded, so the decision is now live rather than deferred:
  pick a home (peer `.tsx` per component · a `lib/spec/` namespace · or
  inline-TS extraction) **next session** before the migration module
  grows unwieldy. Lean: peer `lib/components/<name>/<name>.tsx` mirrors
  the existing `.css`/`.js` co-location and keeps the spec next to its
  source. No longer "defer" — "decide soon". (Each layout primitive
  added since — Topbar, TypographyStack — grows the file further; the
  TypographyStack RN also hand-declares font metrics because the
  primitive `type` set is pipelineInline, a second reason its spec
  wants a clear home.)

- **Box `maxWidth` prop · consumer evidence trigger · `background` +
  `radius` RESOLVED in N+6.5** · N+6.2 shipped layout-only Box and
  deferred all three surface props pending a real consumer. **Two of
  three landed in N+6.5**: `background` (5-enum `canvas/subtle/strong/
  accent-solid/accent-subtle`) + `radius` (4-enum `sm/md/lg/full`)
  shipped under
  [decision 42](../decisionlog.md#42-box-gains-background--radius-props--attribute-dispatch-surface-vocabulary--evidence-gated-promotion--n65)
  — the evidence gate cleared when Tabs needed a filled, rounded
  tablist surface (`<nuri-box background="strong" radius="md">`).
  **`maxWidth` stays OPEN** — it is a different shape (page-shaped rem
  values, asymmetric vs `semantic.size`'s element-shaped px values)
  and no consumer has surfaced the need (Tabs didn't need it). Promote
  it as a new semantic family TBD when the first width-constrained
  container consumer appears. Defer; no ship today.

- **Tabs keyboard roving-focus (F-KEYBOARD-NAV-1)** · N+6.5 ships
  Tabs with the **baseline** interaction only — each `<nuri-tab>` is
  a focusable button reachable by Tab key, activated by click/Enter.
  The full WAI-ARIA Tabs pattern expects arrow-key roving (←/→ move
  selection · Home/End jump to ends · single tab-stop for the
  group). Deferred under
  [decision 43](../decisionlog.md#43-tabs--first-multi-element-compound--first-box-composition-consumer--n65)
  anti-scope so the compound's shared-state mechanism could land first
  without the focus-management surface. Promote when a real consumer
  needs full keyboard parity (largely RN-web / external-keyboard
  contexts · moot on touch). Tracked as F-KEYBOARD-NAV-1 in
  [`docs/RISKS.md`](../docs/RISKS.md) R1.

- **Tabs panels (tabpanel association)** · N+6.5 Tabs is the
  selector strip only — it owns + broadcasts the selected `value` but
  does **not** render or associate tab panels (`role="tabpanel"` +
  `aria-controls`/`aria-labelledby` wiring). Today the consumer reads
  `value` and swaps its own content. Open: should Tabs grow a
  panel-association API (a `<nuri-tab-panel value>` sibling the
  controller wires up), or stay a headless selector? Lean: stay
  headless until a consumer wants the a11y wiring done for it —
  the selector/panel split keeps the compound small. Deferred under
  decision 43 anti-scope ("no tab panels"). Re-evaluate at the first
  real Tabs consumer that needs managed panels.

- **Divider component + Stack `divider` prop · ✓ RESOLVED in N+6.9
  (reframed, not built).** External-project Stack spec includes a
  `divider: boolean` that wraps a thin separator between children.
  N+6.9 **closes this by reframing it**: a divider is just a
  [`<nuri-separator>`](../pages/components/separator.html) — a
  generic, prop-free, author-placed 1px hairline — that the author
  drops between rows, **not** a Stack prop and **not** a
  `<nuri-divider>` component.
  [Decision 49](../decisionlog.md#49-separator--standalone-generic-1px-display-primitive--author-placed--horizontal-only--n69)
  records it: keeping the rule a standalone element keeps Stack pure
  (no child-wrapping JS / RN render-map), makes the divider a visible
  inspectable node, and serves non-Stack contexts too. The `divider`
  prop is **retired**, the `<nuri-divider>` name **dropped** (Separator
  subsumes both). Separator is horizontal-only; a vertical variant is
  the one deferred sub-thread (design against a real row-layout
  consumer · P11).
- **`window.NuriControl` global pattern · keep or migrate to ESM?**
  Today `lib/docs/control/control.js` exposes itself on `window`, no
  module system. Consequence: `semantic.html`'s inline accent select
  hand-authors `.nuri-control` markup because the inline script runs
  before the deferred `control.js`. Two sources of truth for the
  same markup shape — drift risk. ESM would fix it but touches
  `<script>` tags on every page. N+5 did not touch this path;
  re-evaluate at N+6 or later if another inline script hits the same
  friction.
- **`docs/migration-tests/` naming · "tests" is slightly loose** ·
  these are one-shot manual translation pairs, not CI-runnable
  tests. Re-evaluate if a second pair makes the name actively
  misleading. Alternatives floated but not picked:
  `migration-pairs/`, `migration-evidence/`.
- **Behavioural delta documentation per component** · N+4 surfaced
  the first concrete deltas (F-PRESSED-1, F-FOCUS-1, F-DISABLED-1).
  Open: new section in the component template vs per-component
  `<name>.behaviour.md`. Lean: **template section** (the Button page
  already serves four readers per [decision 24](../decisionlog.md#24-component-pages-serve-four-readers-including-migration--n3);
  a fifth section fits the existing template).
- **Tag in `<nuri-page>`**: now that `.nuri-tag` is unified visually,
  is the `data-*` semantic enough or should we move to a cleaner
  `<nuri-tag status="draft">` markup? Decision can wait — current
  pattern works fine.
- **Spec card chip background**: foundation spec card chips render
  mono 13 muted but inherit the global `.nuri-shell__main code` pill
  background only when the chip uses `<code>`. Today most spec card
  chips use `<span class="nuri-spec-card__chip">` (no `<code>` tag)
  so no background — consistent. If we ever want the chip pill, the
  decision is "add background to `.nuri-spec-card__chip`" not "wrap
  in `<code>`".

## Workstreams (no session anchor)

These tracks don't gate on the component sequence above and can be
picked up when there's bandwidth or external pressure.

### Pipeline · CSS → DTCG → RN (Pattern C)

**Three slices landed**: N+3.5 (colour primitives →
`build/tokens.json`), N+5 (semantic cascade → `build/tokens.ts`
with per-(accent × theme) literals), and N+6.0.3 (per-component
files at `build/components/<name>.ts` + TokenPath union at
`build/token-paths.ts` + the `SET_POLICY` registry that routes
each set to runtime-vs-pipeline-inlined emit per
[decision 34](../decisionlog.md#34-per-component-files--tokenpath-union--set-policy--pipeline-emit-shape--n603)).
N+5.5 refactored the emitter to classify-by-cascade
([decision 28](../decisionlog.md#28-emitter-shape-derives-from-cascade-structure-not-from-a-hardcoded-list--n55));
future dimensions are auto-discoverable. N+6.0.4 separated source
from output ([decision 35](../decisionlog.md#35-pipeline-sources-vs-build-outputs-physically-separated--pipeline-source-build-generated-only--n604)):
sources live at [`pipeline/`](../pipeline) (hand-maintained),
outputs live at [`build/`](../build) (100% generated · never
hand-edited). N+6.1 added two runtime semantic dimension namespaces
([decision 36](../decisionlog.md#36-semantic-spacing--sizing-vocabularies--77-t-shirt-scale--cascade-invariant--n61))
by uncommenting two SET_POLICY placeholders + extending the
classifier to support two cascade-invariant vocabularies sharing
the empty signature; the per-component emit auto-promoted Button's
two primitive references to TokenPath strings without pipeline
edits. Style Dictionary slice stays conditional on a second target
platform per
[decision 2.1 amendment](../decisionlog.md#21-amendment--n55)
(RN-only stays on the custom emitter). F-FONT-1 (component-token
numerics flowing from CSS, not a constants block) retired at
N+6.0.3 as a structural class. Unistyles consumption remains.
Full pipeline at 3-4 components is still the target.

Procedure: see [skills/pipeline-dtcg-export.md](../skills/pipeline-dtcg-export.md).

### Testing · token round-trip · API contract · smoke

Sequence aligned with pipeline rollout:

1. ✓ **Token round-trip test** — primitive shipped N+3.5; semantic
   cross-product + P4 asymmetry shipped N+5; classify-by-cascade
   invariants shipped N+5.5; primitive-usage guardrail shipped
   N+5.7; SET_POLICY mechanism + per-component-emit guardrails
   shipped N+6.0.3. 17 assertions total.
2. **API contract test** — when a component has both a web and an
   RN implementation. Blocking only when a second implementation
   exists.
3. **Headless smoke** — open each docs page in a headless browser,
   assert zero `[NuriTokens]` / `[NuriDemo]` console warnings.
4. **Visual regression** — deferred to 5+ components. Until then
   the smoke test + eyeball is the cheaper layer.

See [`docs/RISKS.md`](../docs/RISKS.md) R3.

### Playground + governance

Repo-level architectural decisions for how the team uses Nuri
without mutating it:

- **Playground space** · a separate workspace where team members
  experiment with compositions without touching the DS source.
  Likely a `/playground/` folder in the repo with looser conventions,
  or a separate repo that consumes Nuri as a package.
- **Governance model** · who can edit `lib/components/*` vs who can
  only consume. CODEOWNERS file. PR review requirements. The user
  has expressed: "team can use the playground but not modify the DS
  or tokens for now".
- **Repo structure** · monorepo with packages (Nuri DS + playground +
  Expo app)? Separate repos? Hybrid?

Waiting on user's thinking. The top-level `playground/` directory is
reserved for this workstream and is intentionally empty today (see
`playground/README.md`).

### Repo structure · design-SoT ⊥ plumbing separation (surfaced N+27 · SUBSUMED by decision 68)

**Folded into the package architecture** ([decision 68](../decisionlog.md) ·
[`docs/package-architecture.md`](../docs/package-architecture.md)). The "separate the hand-written
boilerplate (reset · `display:contents` wrappers · `:not(:defined)` skeletons · `box-sizing` ·
`min-width:0`) from the generated namespace CSS" concern is now a **within-`@nuri/prototype`** matter,
resolved when **§9** generates the namespace CSS from the SoT (the
[`reset.css`](../packages/spec/lib/runtime/reset.css) header is today's boundary marker). No longer a
standalone workstream — see the package-architecture migration (§6).

## Out of scope (decisions to not relitigate)

- 2-layer architecture (no Layer 1 swap, no Layer 3 fattening at system level)
- Attribute-only selectors in semantic (`[data-theme="dark"]`, NOT `:root[data-theme="dark"]`)
- Cascade ordering of the 6 semantic blocks
- Mobile-first: no `:hover` on components
- `solid` / `soft` variant names
- Default `data-accent` = `lilac`
- `<nuri-scope>` exists only on web; RN uses React Context
- Component CSS uses `@layer tokens` + `@layer rules`; primitive /
  semantic / chrome CSS files are unlayered
- Default variant on Button = `soft`
- Soft is chrome-only (no accent tint)
- Component-token selector = `:root, [data-accent], [data-theme]`
  (not `:root` alone) — see [decision 9](../decisionlog.md#9-component-token-selector-pattern--n1)
- `.nuri-tag` is one visual treatment; modifier classes are
  semantic-only — see [decision 11](../decisionlog.md#11-tag-unification--n1)
- `<nuri-demo>` `<template>` is the single source of truth for
  preview + code — see [decision 10](../decisionlog.md#10-nuri-demo-api--n1)
- Docs additions must be mechanical, not agent-improvised — every
  new page (component OR foundation) follows its template; no
  free-form layout
- Consumer model · three agent personas + operator — see
  [decision 21](../decisionlog.md#21-consumer-model--three-agent-personas--operator--n3)
- Principles split — AGENTS.md = procedure for spec-authoring agent;
  `pages/principles.html` = the WHY for everyone else — see
  [decision 22](../decisionlog.md#22-principles-split--n3)
- No entry-prose pages — `home.html` + `colour.html` overview
  deleted. NAV + README + principles.html together do the
  orientation job — see [decision 23](../decisionlog.md#23-entry-pages-eliminated--n3).
  Procedure pages serving a concrete agent persona are allowed as
  siblings — see [23.1 amendment](../decisionlog.md#231-amendment--n56).
- Component pages serve four readers including migration — anatomy
  + token-mapping = wiring spec; multi-part components need
  machine-readable `data-*` attrs — see
  [decision 24](../decisionlog.md#24-component-pages-serve-four-readers-including-migration--n3)
- Open risks tracked in [`docs/RISKS.md`](../docs/RISKS.md) — six
  named risks with failure modes + mitigation — see
  [decision 25](../decisionlog.md#25-risk-register--n3). Do not
  delete closed entries — move them to the "Closed" section so the
  reasoning survives
- Pipeline slice order · semantic before Style Dictionary · resolved
  at N+5 prep. SD now conditional per
  [decision 2.1 amendment](../decisionlog.md#21-amendment--n55).
- Out-of-scope items (decisions deferred until concrete need): Topbar
  accent toggle · Sage / orange / jade accent scales · Button/IconButton
  `outline` variant (a bordered tertiary · `ghost` shipped at N+6.4 ·
  decision 39 anti-scope) · multi-size IconButton (single-size-locked ·
  decision 40) · Status colour scales · primitive layer ships empty for the status
  family. The scale + foundation page land together in the same
  session as the first status-using component (Toast, Alert,
  StatusPill); no placeholders pre-shipped · Loading state for
  Button · Sets concept (multiple brands / densities) — see
  [`README.md`](../README.md) Status and per-page roadmap sections
  for promotion gates.

## Resume checklist (quick smoke test)

To verify the build still works on a fresh checkout:

1. Serve the repo on `http://localhost:8765` (Claude Preview MCP or
   `python3 -m http.server`).
2. Open `index.html` — should redirect to `pages/foundations/colour/primitive.html`
   (the canonical entry per [decision 23](../decisionlog.md#23-entry-pages-eliminated--n3)).
   Expected sidebar: no "Home" item; "Principles" linked at top;
   "Implementation guide" linked below Principles; "Colour" is a
   non-clickable group header with primitive/semantic/exploration as
   children; "Dimension" is a non-clickable group header with
   primitive/spacing/sizing/radius as children (decision 36 · N+6.1
   + amendment 36.1 · N+6.1.1).
3. Open `pages/principles.html`. Expected: numbered principles with
   `data-principle-id` attrs; no prose essays; cross-links to
   `decisionlog.md` / specific foundation pages.
4. Open `pages/components/button.html`. Expected:
   - h1 22 · h2 17 · p 15 muted · code 13 muted (typography v2 from
     `shell.css`, no page-local override needed)
   - Page-head has no border-bottom; first section divider is a 1px
     line edge-to-edge between spec card and the "Default" hero
   - Anatomy block shows lilac filled "Pay" button + parts table
   - Variants section shows solid + soft as **stacked** `<nuri-demo>`
     cards (single-column layout per the mobile-first template)
   - States section shows **one row per state** (label left, demo right)
     across solid + soft
   - Theming section shows three `<nuri-demo>` cards: page · subtree
     · self
   - Tokens (DTCG) table populated with `--nuri-button-*` rows, all
     with non-`unknown` type; swatches inline next to token names
   - DevTools console: zero warnings from `[NuriTokens]` or `[NuriDemo]`
5. Open `pages/foundations/colour/primitive.html` (the canonical
   foundation page · also the `index.html` redirect target).
   Expected:
   - 4-row spec card (Type · Layer · Source · Status) at top with
     `data-foundation="colour-primitive"` on the `<dl>`
   - 7 page-sections separated by horizontal dividers
   - Role legend in subtle bg + border + rounded — 2-column grid of
     12 numbered items
   - 3 token-table groups render via `lib/docs/tokens.js` (Neutral active
     × 24 rows, Lilac × 24, Black/White alpha × 12 each). Status group
     does NOT pre-ship — arrives with the first status-using component.
   - 3 roadmap items at bottom
6. Open `pages/foundations/typography.html`. Expected:
   - Spec card with `typography` type chip + atomic meta
   - "Scale" section renders 7 `.nuri-scale-card` items (xs · sm ·
     md · lg · xl · 2xl gap · 3xl). Each sample at its real font-size
     (13 · 15 · 17 · 22 · 30 · — · 57); em weights bold for ≥ lg
6a. Open `pages/foundations/dimension/primitive.html`. Expected:
    - Spec card with `dimension` type chip + 12-leaf meta
      (`2 · 4 · 6 · 12 · 18 · 24 · 28 · 36 · 48 · 60 · 72 · 90`),
      Layer=primitive, Status=stable
    - Tokens table populated with 12 rows (`px.2` → `px.90`); no
      Reference column (primitive layer has no var() chains);
      Value column shows the literal pixel values; Type column
      all `dimension`
    - DevTools console: zero warnings from `[NuriTokens]`
6b. Open `pages/foundations/dimension/spacing.html`. Expected:
    - Spec card with `dimension` type chip + 7-leaf meta
      (`2xs · xs · sm · md · lg · xl · 2xl`)
    - Tokens table populated with 7 rows (`space.2xs` →
      `space.2xl`); Reference column shows the `--nuri-px-N`
      primitive each leaf aliases; Value column shows resolved
      pixel literals (`2px`, `4px`, …, `36px`); Type column all
      `dimension`
    - DevTools console: zero warnings from `[NuriTokens]`
6c. Open `pages/foundations/dimension/sizing.html`. Expected:
    - Spec card with `dimension` type chip + 7-leaf meta
      (`xs · sm · md · lg · xl · 2xl · 3xl`)
    - Tokens table populated with 7 rows (`size.xs` →
      `size.3xl`); Reference column shows the `--nuri-px-N`
      primitive each leaf aliases; Value column shows resolved
      pixel literals (`18px`, …, `90px`); Type column all
      `dimension`
    - DevTools console: zero warnings from `[NuriTokens]`
6d. Open `pages/foundations/dimension/radius.html`. Expected:
    - Spec card with `dimension` type chip + 4-leaf meta
      (`sm · md · lg · full`)
    - Tokens table populated with 4 rows (`radius.sm` →
      `radius.full`); Reference column shows `--nuri-px-N` for
      sm/md/lg, `—` for full (no `--nuri-px-N` alias backing);
      Value column shows resolved literals (`6px`, `12px`, `18px`,
      `9999px` for full · the saturator sentinel the browser clamps
      to `min(width/2, height/2)`); Type column all `dimension`
    - DevTools console: zero warnings from `[NuriTokens]`
7. Toggle theme via topbar moon icon → primitive.html / button.html
   token tables + buttons re-resolve. `semantic.html` renders both
   accents and both themes structurally (per-accent sections × Light
   /Dark columns), so it is theme-toggle-insensitive by design
   (N+6.0.2 · [amendment 20.1](../decisionlog.md#201-amendment--n602)).
   Toggle neutral scale via topbar → exploration / primitive update.
8. Open `/docs/migration-tests/button-matrix/` (port 8766).
   Expected: a 390px mobile-viewport canvas with the title
   "Button matrix" and 4 rows of 2 buttons. Tier 1 solid is lilac,
   Tier 2 + Tier 3 solid are black (neutral · self-scope and
   subtree-scope produce the same colour —
   [decision 9](../decisionlog.md#9-component-token-selector-pattern--n1)
   confirmation). Disabled row shows reduced opacity. No console errors.
9. Run `npx tsc -p docs/migration-tests/button-matrix/tsconfig.json`
   — exit 0. The typecheck IS the deliverable; no bundling, no Expo.
   The pair's `index.tsx` imports semantic tokens from
   `../../../build/tokens` (machine-generated since N+5).
10. Open `pages/components/stack.html`. Expected:
    - Spec card with `component` type chip + "layout primitive ·
      decision 37" meta + Source row at `lib/components/stack/`
    - NAV under "Components · Layout" with Stack + Box entries;
      "Stack" is the active link
    - Live demos populated (7 `<nuri-demo>` cards across direction
      × gap × align × justify × wrap)
    - Token-mapping table groups: gap (5 leaves → space.*) · direction
      / align / justify / wrap (CSS literals · no token)
    - No Variants / States / Theming sections (layout primitives have
      none · per decision 37)
    - DevTools console: zero warnings
11. Open `pages/components/box.html`. Expected:
    - Spec card with `component` type chip + Source row at
      `lib/components/box/`
    - Live demos exercising uniform / axis / single-edge padding +
      center
    - Token-mapping table: 7 padding props × 5 leaves (all dispatch
      to space.*) + center → margin-inline: auto
    - **`background` (5-enum) + `radius` (4-enum) surface props**
      (N+6.5 · decision 42): demos show filled/rounded boxes;
      `accent-solid` box also flips text to `accent.on-solid`. Roadmap
      shows `background` + `radius` as **shipped · N+6.5**; `max-width`
      still **planned · evidence-gated**
    - DevTools console: zero warnings
12. **Post-N+6.2 layout-primitive composition check** ·
    re-open the migration test (step 8 surface) and confirm:
    `<nuri-stack>` + `<nuri-box>` elements upgrade (DevTools shows
    inner `<div>` with `data-gap` / `data-padding` attrs after
    custom-element registration), no hand-rolled
    `.playground-row-group` / `.playground-row` selectors remain in
    the page-local style block, and the visual is identical to
    pre-N+6.2 (same 390px canvas · same rows · same equal-width
    buttons via the page-local `nuri-stack[direction="row"] > div >
    nuri-button { flex: 1 1 0; }` consumer-owned stretch rule).
13. Open `pages/foundations/iconography.html`. Expected:
    - Spec card with `iconography` type chip + Source row pointing
      at `@phosphor-icons/core` + `lib/components/icon/`
    - NAV under "Foundations" with "Iconography" as the active link
    - Catalog renders all 17 glyphs (each `<nuri-icon>` upgrades to
      a `.nuri-icon` host with `data-size` + an inner `<svg>`),
      grid responsive ≤ 4-col on a 390px viewport
    - Sizes section: md (28px = `--nuri-size-sm`) vs sm (18px =
      `--nuri-size-xs`) visibly distinct; Fill section: regular vs
      solid-fill distinct
    - Token-mapping table: md → `--nuri-size-sm` / 28px ·
      sm → `--nuri-size-xs` / 18px; no `--nuri-icon-size-*` rows
    - No Variants / States / Theming sections (foundation page ·
      decision 19)
    - DevTools console: zero `[NuriIcon] unknown name` warnings
14. Open `pages/components/icon-button.html`. Expected:
    - Spec card with `component` type chip + Source row at
      `lib/components/icon-button/`; 3 variants + single md size noted
    - NAV under "Components · Actions" with "IconButton" active
    - Variants section: solid (filled lilac + glyph) · soft
      (chrome-tinted) · ghost (transparent · no border) — all 48×48px
      circles (`border-radius: 9999px`), each wrapping a real
      `<nuri-icon>` `<svg>`
    - **No Sizes section** (single-size-locked · decision 40)
    - States: 3 grids (solid/soft/ghost × default/pressed/disabled);
      disabled at reduced opacity; all circular
    - Behavioural-delta section: `F-PRESSED-1` · `F-FOCUS-1` ·
      `F-DISABLED-1` (inherited) + `F-ARIA-LABEL-1` + `F-TOUCH-TARGET-1`
    - Tokens table: `--nuri-icon-button-*` rows, all non-`unknown`
      type (incl. `--nuri-icon-button-size` → `dimension`)
    - Each rendered IconButton carries an auto-derived `aria-label`
      (from `name`) unless `label` overrides it
    - DevTools console: zero `[NuriIcon] unknown name` or
      `[NuriTokens]` warnings
15. **Post-N+6.4 Button-matrix check** · re-open
    `pages/components/button.html` and confirm the new Sizes section
    (3 cards · lg 60px/radius-md · md 48px/radius-sm default · sm
    36px/radius-sm), the ghost variant card + ghost state grid, and
    the Behavioural-delta section all render; default (un-sized)
    buttons render at **md** (48px).
16. Open `pages/components/switch.html`. Expected:
    - Spec card with `component` type chip + Source row at
      `lib/components/switch/`; no variants · single md 60×36 · 2
      parts (track + knob)
    - NAV under "Components" with "Switch" as the active link
    - States grid: 4 switches — off / on / disabled-off / disabled-on
      — each a `<button role="switch">` with correct `aria-checked`
      (off=false · on=true); the knob slides right and the track flips
      to the accent colour on ON; disabled at reduced opacity
    - Theming section: accent tints the **ON track only**
    - Behavioural-delta section: `F-CHECKED-STATE-1` (specific) +
      `F-PRESSED-1` · `F-FOCUS-1` · `F-DISABLED-1` (inherited)
    - Tokens table: `--nuri-switch-*` rows, all non-`unknown` type
      (incl. `--nuri-switch-inset` → `dimension`); the derived
      `--nuri-switch-knob-travel` is **excluded** (9 rows, not 10)
    - DevTools console: zero `[NuriTokens]` warnings
17. Open `pages/components/tabs.html`. Expected:
    - Spec card with `component` type chip + Source row at
      `lib/components/tabs/`; 2 elements (`nuri-tabs` + `nuri-tab`) ·
      no variants · 3 parts (tabs / list / tab)
    - NAV under "Components" with "Tabs" as the active link
    - Hero: a 3-tab strip; the tablist surface is a composed
      `<nuri-box>` (subtle background · md radius · xs padding ·
      `role="tablist"`); clicking a tab moves the active fill and
      updates the controller `value`
    - Two API tables (controller `value`; option `value`/`disabled`)
    - Theming section: accent tints the **active tab only**
    - Behavioural-delta section: `F-SELECTED-VALUE-1` +
      `F-KEYBOARD-NAV-1` (specific) + `F-PRESSED-1` · `F-FOCUS-1`
      (inherited)
    - Token-mapping: container group (only `tabs.gap` → `space.2xs`
      emits + the list Box surface row) + option group `--nuri-tab-*`
      web-CSS-only (DTCG "—")
    - DevTools console: zero `[NuriTokens]` warnings
18. **Post-N+6.5 RN-spec check** · run `npx tsc -p
    docs/migration-tests/button-matrix/tsconfig.json` — exit 0; the
    pair now co-hosts **complete** RN Switch + Tabs translations (not
    stubs · neither consumes Icon) alongside the type-only IconButton
    stub. Confirm `build/components/switch.ts` (`export const
    switchTokens` · 9 decls) + `build/components/tabs.ts` (`export
    const tabs` · 1 decl `gap`) exist and `npm run build` reports
    **37** semantic tokens (the `--nuri-bg-inverse-muted` leaf
    auto-discovered).
