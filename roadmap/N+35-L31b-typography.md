# Session N+35 · L3.1b · generate the typography namespace CSS from a TS SoT (the third / last bespoke axis · reversible shadow)

**Status**: shipped on `feat/n35-l31b-typography-namespace-css` (base `main` @ `f6da8c9`) ([decision 70](../decisionlog.md)'s cascade · [decision 67](../decisionlog.md) / [decision 73](../decisionlog.md) the bespoke axes · [`docs/cascade.md`](../docs/cascade.md) L3). The L3.1 / palette / interactive reversible-shadow discipline ([`roadmap/N+33-L3b-palette.md`](./N+33-L3b-palette.md) · [`roadmap/N+34-L3b-interactive.md`](./N+34-L3b-interactive.md)) applied to **typography** — the THIRD and LAST bespoke axis. A new pipeline emitter generates the typography namespace CSS from a hand-authored TS axis; a committed harness proves it structurally + computed-style EQUIVALENT to the hand `lib/components/typography/typography.css`. **This finishes the L3 axis shadows** — all 5 axes (box · stack · palette · interactive · typography) are now shadow-proven.
**Type**: **L3 · bespoke axis 3** (palette was L3b·1 · interactive was L3b·2 · box/stack were L3.1 · the token cascade was N+31/N+32 · L4 descriptors were B1). **REVERSIBLE SHADOW · SHADOW ONLY** — generates to `build/css-preview/typography.css`, proven ≡ the hand CSS (the parity oracle · [decision 2](../decisionlog.md) STANDS for the namespace layer), flips/retires NOTHING: the live web factory + pages still load the hand CSS, the recipe layer (L3c) is untouched, the **RN factory** (the `typeKey` expansion via `typeStyle` · [resolve.ts](../packages/rn/factory/resolve.ts)) + `typography.js` are untouched, `tokens-*.css` (L2) + the type-scale foundation (`styles/typography.css`) are untouched. **No decision opened** (decision 70 already locks the model · the dec-2 reversal + the SoT flip are L3c · exactly the L3.1 / palette / interactive posture). **VISUAL-ADJACENT** — the proof includes a real-browser computed-style check (the preview MCP), with the muted-dark scope cell + the load-bearing display-order cell as its anchors.

---

## The two ways typography diverges from palette/interactive

1. **The ELEMENT + a SHELL.** palette/interactive are MERGED-NODE (the `.nuri-<ns>` class lands on the painting node · no element, no shell). typography is a real `<nuri-typography>` **custom element** with a SHELL (the `display:inline` base + the `:not(:defined)` pre-upgrade skeleton) — like **box/stack** (`display:contents` wrappers · [`namespace-css.js`](../packages/spec/pipeline/parsers/namespace-css.js) `SHELLS`), NOT like palette. So every selector is the ELEMENT `nuri-typography…` (no leading dot), and the emit carries the shell the merged-node axes lack.
2. **The ORDER recurs on `display`.** The interactive Guard-D order-sensitivity transfers (the brief §6): `display` is set by the base (`inline` · (0,0,1)), `:not(:defined)` (`inline` · (0,1,1)), and the 3 `[align]` rules (`block` · (0,1,1)). The base loses to align by SPECIFICITY (fine). But `:not(:defined)` and `[align]` are **EQUAL specificity (0,1,1)** — a pre-upgrade aligned node (`<nuri-typography align="start">` before the element upgrades) matches BOTH, so `display` resolves by **SOURCE ORDER**. The hand emits `:not(:defined)` (the shell) BEFORE `[align]` (the dispatch) so `block` wins → text-align takes effect even before `typography.js` upgrades the element. The emitter must preserve that order; Guard D proves it.

## The scope line — the type SCALE is OUT (the critical sub-decision · the brief §5)

The typography axis ([decision 73](../decisionlog.md)'s `{size, emphasis, muted, align}`) splits on web; this slice does **only the wrapper**:

| half | what | where | this slice |
|---|---|---|---|
| **the wrapper** | `{muted, align}` | the shell + the muted/align dispatch (`lib/components/typography/typography.css`) | **IN** · authored as the TS axis |
| **the type SCALE** | `{size, emphasis}` | the 12 `.nuri-type-{step}` / `--em` utilities → `--nuri-type-*` primitives (`styles/typography.css`) + `typography.js` / the factory at runtime | **OUT** · an L1/L2 TOKEN layer ([decision 71](../decisionlog.md) / [72](../decisionlog.md) left it untouched · CSS-SoT · a separate later token flip — like dimensions/colour) |

So the SoT authors **NO `--nuri-type-*` and NO `.nuri-type-{step}`** — only the wrapper's shell + `[data-muted]` + `[align]`. The type-scale token flip is a later token-layer slice, not this.

## The emit — the inverse-spelling of the wrapper's intent

| | RN (the existing consumer) | web (this session) |
|---|---|---|
| reads | the merged-node `typography` axis (`typeKey` · the type-STEP ref · [resolve.ts](../packages/rn/factory/resolve.ts) `typeStyle`) | the **typography AXIS** ([`pipeline/typography-axis.ts`](../packages/spec/pipeline/typography-axis.ts) · the bespoke SoT) |
| emits | a Text style: `muted → color` · `align → style.textAlign` ([decision 59](../decisionlog.md) · N+11) + the type-step font-size/line-height/weight | `nuri-typography[data-muted] { color }` + `nuri-typography[align="v"] { display:block; text-align:v }` + the shell |
| spelling | the resolved `theme.text.*` / type values | the `var(--nuri-text-muted)` token + the `block`/`text-align` literals verbatim · `nuri-typography` + the attr gate |

typography is **bespoke-but-single-sourced** ([decision 67](../decisionlog.md) / [73](../decisionlog.md)): NOT a member of the agnostic Field table (`resolve-map.ts` · box/stack) — `resolve.ts` treats it as a type-STEP ref, not a ViewStyle prop. So this slice did **not** touch `namespace-css.js`; typography gets its own small emitter, like palette/interactive.

## What shipped (ship list · as built · palette/interactive-parallel)

1. **`packages/spec/pipeline/typography-axis.ts`** (new · the bespoke SoT) — `{ element: 'nuri-typography', dispatch: Rule[] }`, where `Rule = { name, attr, decls: [prop, value][] }`. The `dispatch` = `muted` (`[data-muted]` presence) + the 3 `align` rules (`[align="v"]` equality), enumerated (pure data · the emitter is a serializer). Authored beside `palette-surface.ts`/`interactive-effects.ts`. Strip-trivial (single-line `type` aliases + the trailing `as const satisfies`, no imports).
2. **`packages/spec/pipeline/parsers/typography-css.js`** (new · the bespoke emit) — `emitTypographyCss(axis)` → the provenance header + empty `@layer tokens` (mirrors hand · the wrapper reuses the foundation `--nuri-type-*`) + `@layer rules` { the **SHELL** (base · `:not(:defined)`) THEN the dispatch (muted · align in array order) }. Plus `loadAxis` (the type-strip + `data:`-URL import · reusing [`dimension-css.js#stripTypes`](../packages/spec/pipeline/parsers/dimension-css.js)), `ruleForDispatch`. **HAS a shell** (unlike palette/interactive · the box/stack precedent) — the emitter owns it (mirrored from hand · parametrized by the SoT's `element`).
3. **`packages/spec/build/css-preview/typography.css`** (new · the committed shadow) — generated, committed (the harness guards it). Provenance header marks it SHADOW · DO NOT REPOINT.
4. **`packages/spec/pipeline/css-preview.js`** (extended · the runner) — a `generateTypography()` bespoke call alongside `generatePalette()`/`generateInteractive()` + the `NS_SPECS` loop (typography is NOT an NS_SPEC); `main()` now writes `box`/`stack`/`palette`/`interactive`/`typography`. **STANDALONE — NOT wired into `npm run build`**. Run on demand: `node pipeline/css-preview.js`.
5. **`packages/spec/pipeline/typography-css.test.js`** (new · the parity harness · `node --test` · folds into `npm test`) — four guards / five `test()`s (§ below).
6. **`packages/spec/pipeline/typography-css-computed-check.html`** (new · the browser harness) — loads the token CSS + the generated and hand typography CSS, compares `getComputedStyle` across the muted scope + the display order. NATIVE only (no proxy · below). NOT a CI gate (no browser in CI).
7. **roadmap** — this retro + `index.md`.

## The wrapper rule set & the SoT-vs-shell line (the sub-decision · surfaced)

The rule set, exactly the hand `typography.css` (all on the `nuri-typography` ELEMENT):

| part | selector | declaration(s) | owner |
|---|---|---|---|
| shell base | `nuri-typography` | `display: inline` | **EMITTER** |
| shell skeleton | `nuri-typography:not(:defined)` | `display: inline` | **EMITTER** |
| muted | `nuri-typography[data-muted]` | `color: var(--nuri-text-muted)` | the SoT |
| align·start | `nuri-typography[align="start"]` | `display: block` · `text-align: start` | the SoT |
| align·center | `nuri-typography[align="center"]` | `display: block` · `text-align: center` | the SoT |
| align·end | `nuri-typography[align="end"]` | `display: block` · `text-align: end` | the SoT |

**The SoT-vs-shell line** (the brief's named sub-decision · the analogue of palette's "SoT shape"): the element BASE + the `:not(:defined)` SKELETON are the **SHELL** — the emitter owns them (mirrored from the hand CSS · the box/stack `SHELLS` precedent · parametrized by the SoT's `element`), NOT the SoT. The SoT carries the **dispatch only** (`element` + muted + align). This is the box/stack split (shell = emitter-owned · the field/dispatch = the table), NOT palette/interactive's no-shell merged-node model — because typography is a real element wrapper.

**The two attr FORMS** (the SoT must spell each · the brief §4): `muted → [data-muted]` is a REFLECTED boolean attr ([decision 53](../decisionlog.md) · `typography.js` writes `data-muted` from the `muted` prop, CSS owns the colour · a PRESENCE gate); `align → [align="v"]` is a PLAIN prop-driven HTML attr ([decision 59](../decisionlog.md) · NO JS reflection · survives `#sync`, which only rewrites `className` + `data-muted` · an EQUALITY gate). The SoT spells each verbatim; the emitter passes `attr` through.

## The four guards (the L3.1 / palette / interactive pattern · adapted)

- **A · STRUCTURAL ≡ + the element-wrapper model** — generated and hand carry the same `@layer rules` (same selector set · same declaration set per selector · order-insensitive · comments excepted) AND every selector is the `nuri-typography` ELEMENT (the regex `^nuri-typography(?:[:[]|$)` · NOT a `.nuri-typography` class · the one place typography diverges from palette/interactive's class check) AND the shell IS present (the base + `:not(:defined)` · the wrapper has a shell, unlike merged-node). **NECESSARY, NOT sufficient** (`display` is set at equal specificity → Guard D covers order). The empty `@layer tokens` is mirrored.
- **B · RE-EMIT FRESHNESS** — the committed `build/css-preview/typography.css` == the emitter's current output.
- **C · RESOLVED-VALUE** — the muted token `var(--nuri-text-muted)` is a THEME-cascaded chrome token (light/dark · re-resolves under `[data-theme]` · accent-INVARIANT), so it is scope-dependent like palette's colours. Reuse the **colour-cascade walk** (`resolveSemanticCrossProduct` · the `colour-semantic.test.js` / palette oracle · NOT the L3.1 `buildVarMap` keep-last, which would grab the dark value) indexed at the DEFAULT `[neutral][light]` scope. Two tests: (1) **bottoms-out** — the muted paint resolves to a real hex (no dangling token) and the display/text-align values are literals (`inline`/`block`/`start`/`center`/`end`) [counts: exactly 1 var + 8 literal decls]; (2) **oracle** — the muted token resolves to a RESTATED design value (`--nuri-text-muted` @ neutral/light = cream-11-light = **`#666455`** · not read from the CSS under test) + an accent-invariance assert (`lilac/light` = `#666455` too). The dark value (`#b7b4a4`) is the browser check's job (the scope-dependent palette posture).
- **D · ORDER-SOUNDNESS** (the centerpiece · the interactive pattern, here on `display`) — two legs, both structural: **(a)** for EVERY property set by >1 selector (`display`: 5 setters · `text-align`: 3), the generated SOURCE ORDER of those selectors == the hand oracle's (so the array-order emit reproduces the hand's load-bearing precedence — shell before align); **(b)** the display pair specifically — the `:not(:defined)` skeleton (`inline`) emitted BEFORE all 3 `[align]` rules (`block`), both **EQUAL specificity** (so order, not specificity, decides → the order IS load-bearing · a `specificityB` that correctly scores `:not(:defined)` = (0,1,1) per CSS Selectors L4: `:not(` contributes nothing, its `:defined` argument does), and both co-match a pre-upgrade aligned node (the conflict is real). Plus: the base (`(0,0,1)`) is dominated by `[align]` by specificity (a defined aligned node is block regardless of order).

(Guard C is two `test()` calls — bottoms-out + oracle — so the suite reports **5** typography guards: A · B · C×2 · D.)

## Verification — gates green

- **spec** `npm test -w @nuri/spec` → **70/70** (65 + the 5 new typography guards); `npm run build -w @nuri/spec` + `git diff packages/spec/build/` → **only the new `build/css-preview/typography.css`** (every pre-existing artifact byte-identical · the runner is NOT in the build · the foundation `styles/typography.css` untouched).
- **rn** `npm test -w @nuri/rn` → **27/27 + 7 snapshots** · `npm run typecheck -w @nuri/rn` → **0**. Inert by construction (no consumer / no `typeStyle` touched), confirmed.
- **Harness proven non-tautological** (both mutations reverted): (1) **reordering** the emit (dispatch before the shell · align before `:not(:defined)`) + regenerating so the shadow stayed fresh → ONLY **Guard D** failed (leg a · "source order … differs from the hand oracle"), while **A + B + C stayed correctly green** — proving Guard A's order-insensitive ≡ genuinely cannot catch the order, so Guard D is necessary; (2) a **bogus token** (`--nuri-text-bogus`, not regenerated) failed **Guard A** (decl ≠ hand) + **B** (stale shadow) + **C** (dangling token · no hex / oracle mismatch) while **Guard D stayed green** (order unaffected).
- **Computed-style (real browser · preview MCP · `nuri-docs` :8766)**: **7 cells · 20 checks · 0 fails · console clean** — generated ≡ hand AND generated ≡ the restated design oracle. **NATIVE only** — no proxy needed (the contrast with interactive's `:active` cell): `:not(:defined)` is a REAL pre-upgrade state, so the page just never registers the element and every `<nuri-typography>` is genuinely un-upgraded; the `[align]`/`[data-muted]` attribute selectors apply to it directly, exercising the EXACT generated bytes. **THE scope anchor**: `<nuri-typography data-muted>` under a `[data-theme=dark]` ancestor resolves `color` to **`rgb(183, 180, 164)`** (`#b7b4a4` = cream-11-dark · the value the node harness deferred); the accent cell proves text-muted is accent-INVARIANT (chrome · `rgb(102, 100, 85)` under `[data-accent=lilac]` too). **THE ★ order cell**: a pre-upgrade `<nuri-typography align="start">` resolves `display` to **`block`** (the `[align]` rule, emitted later at equal specificity, wins by SOURCE ORDER → text-align takes effect even before `typography.js` upgrades); the **contrast cell** (no align) resolves to **`inline`** — proving `:not(:defined)` genuinely sets inline, so the align `block` is a real source-order override, not an always-block default.
- **Scope held**: the type-scale foundation (`styles/typography.css` · `--nuri-type-*`) + the `size`/`emphasis` realization · `resolve-map.ts` · the RN factory (`typeStyle`) · `typography.js` · the recipe layer · the pages · `tokens-*.css` **untouched**; nothing live repointed. The 2 operator-local files (`.claude/launch.json`, `prompts/coordinator.md`) kept out of every commit.

## Judgment calls / sub-decisions (surfaced · operator-confirm if load-bearing)

- **The SoT shape** (above · the brief's named sub-decision) — `{ element, dispatch: { name, attr, decls }[] }`, a single `axis` object (mirrors palette's single `surface` export · one thing to load + validate). The align family is **enumerated** (3 explicit rules · not a value-template) to keep the SoT pure data and the emitter a serializer — the interactive precedent (each effect verbatim). The two attr forms (`[data-muted]` presence vs `[align="v"]` equality) are spelled in the SoT, passed through by the emitter.
- **The SoT-vs-shell split** (above) — the shell (base + `:not(:defined)`) is **emitter-owned** (the box/stack `SHELLS` precedent · NOT the SoT), parametrized by the SoT's `element` name (so the element name single-sources both the shell and the dispatch selectors · no duplication). This is the box/stack model (typography is a real element wrapper), NOT palette/interactive's no-shell.
- **Guard C = the colour-cascade walk** (not the interactive bottoms-out-at-a-hex shortcut) — typography's one var ref is theme-cascaded, so it gets palette's rigorous `resolveSemanticCrossProduct` indexed at `[neutral][light]`, giving a precise node-level oracle (`#666455`) AND deferring the dark value to the browser. The exact palette posture.
- **The browser order cell = NATIVE** (no proxy · the contrast with interactive) — `:not(:defined)` is a real pre-upgrade state (don't register the element), so the equal-specificity display conflict is resolved by the real engine on the exact generated bytes, no `:active`-style rewrite needed.
- **Harness helpers = COPIED, not extracted** — `layerRuleMap`/`declSig`/`orderedDecls`/`propSelectorOrder` duplicated from `interactive-css.test.js` (the conservative, reversible shadow choice · the prior files stay untouched · extraction is an L3c cleanup). `specificityB` is ADAPTED (the `:not(:defined)` correction · CSS Selectors L4 · the prior copy counted both colons).
- **`typography-axis.ts` homing = in-`pipeline/`** — beside `palette-surface.ts`/`interactive-effects.ts`/`dimensions.ts`/`colours.ts` (the SoT-in-`pipeline/` convention · relocated at the carve · the [decision 68](../decisionlog.md) `rn → spec` DAG).

## Carry-forwards (L3c / later · LOG-only · do NOT fix here · P11)

- **The type-scale token flip** — `{size, emphasis}` / the foundation `--nuri-type-*` / `.nuri-type-{step}` → TS is a later TOKEN-layer slice (like dimensions N+31 / colour N+32), NOT this. The typography AXIS splits cleanly: `{muted, align}` → this wrapper emit · `{size, emphasis}` → the foundation + factory (untouched).
- **The property-spelling registry** ([decision 73](../decisionlog.md) cl. 2) — typography's `color`/`display`/`text-align` are direct, mechanism-divergent props (no logical→physical remap); single-sourcing the scattered RN↔web↔css spelling is L3c/final, not now.
- **The L3.1 Guard-D shorthand/logical-longhand gap + the web-factory no-harness gap** — L3c prerequisites, UNRELATED to typography (no shorthand/logical families here · the props are direct). Stay open; close when the hand oracle retires.
- **`@nuri/spec` has no tsconfig** — like the other SoTs, `typography-axis.ts` is type-STRIPPED, not gate-compiled, so its `as const satisfies` is author-time only.

## Next

- **web-factory harness** — close the no-harness gap BEFORE the factory becomes the sole web renderer (the load-bearing L3c prerequisite). All 5 axis shadows are now proven, so this is the next real step.
- **L3c (the flip)** — wire the generated axis CSS live · retire the recipe layer · the factory = the sole web renderer · repoint the pages · re-source `build/palette.ts` · the property-spelling registry · close the L3.1 Guard-D gap (the hand oracle retires here). **[decision 2](../decisionlog.md) fully reverses for the namespace layer.** Gated on these shadows + the harness.
- **final** — home the axis SoTs (`resolve-map.ts` · `palette-surface.ts` · `interactive-effects.ts` · `typography-axis.ts`) into `@nuri/spec` (the [decision 68](../decisionlog.md) `rn → spec` DAG).

See [`docs/cascade.md`](../docs/cascade.md) · [`roadmap/N+34-L3b-interactive.md`](./N+34-L3b-interactive.md) · [`roadmap/N+33-L3b-palette.md`](./N+33-L3b-palette.md) · [`roadmap/N+30-L3.1.md`](./N+30-L3.1.md) · [`decisionlog.md` §70 / §67 / §73 / §2](../decisionlog.md) · [`roadmap/index.md`](./index.md).
