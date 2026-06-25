# Session N+33 · L3b·1 · generate the palette namespace CSS from a TS SoT (the first bespoke axis · reversible shadow)

**Status**: shipped on `feat/l3b-palette-namespace-css` ([decision 70](../decisionlog.md)'s cascade · [decision 67](../decisionlog.md) the bespoke axes · [`docs/cascade.md`](../docs/cascade.md) L3). The L3.1 reversible-shadow discipline ([`roadmap/N+30-L3.1.md`](./N+30-L3.1.md)) applied to **palette** — the FIRST bespoke axis. A new pipeline emitter generates the palette namespace CSS from a hand-authored TS SURFACE role table; a committed harness proves it structurally + computed-style EQUIVALENT to the hand `lib/components/palette/palette.css`.
**Type**: **L3 · bespoke axis 1** (L4 descriptors were B1 · the agnostic box/stack axes were L3.1 · the token cascade was N+31/N+32). **REVERSIBLE SHADOW · SHADOW ONLY** — generates to `build/css-preview/palette.css`, proven ≡ the hand CSS (the parity oracle · [decision 2](../decisionlog.md) STANDS for the namespace layer), flips/retires NOTHING: the live web factory + pages still load the hand CSS, the recipe layer (L3c) is untouched, `build/palette.ts` is still derived from the hand CSS (via [`pipeline/parsers/palette.js`](../packages/spec/pipeline/parsers/palette.js) · byte-identical), `tokens-*.css` (L2) is untouched. **No decision opened** (decision 70 already locks the model · the dec-2 reversal for the namespace layer + the SoT flip are L3c · exactly the L3.1 posture). **VISUAL-ADJACENT** — the proof includes a real-browser computed-style check (the preview MCP).

---

## The emit — the inverse-spelling of `resolvePalette`

| | RN (the existing consumer) | web (this session) |
|---|---|---|
| reads | the surface roles via `theme.surface[variant]` / `theme.chrome[chrome]` ([resolve.ts](../packages/rn/factory/resolve.ts) `resolvePalette`) | the **SURFACE role table** ([`pipeline/palette-surface.ts`](../packages/spec/pipeline/palette-surface.ts) · the bespoke SoT) |
| emits | `node.view.backgroundColor = role.bg` · `node.fg = role.fg` · `node.pressedBg` | `.nuri-palette[data-<axis>="<v>"] { background: …; color: … }` + the pressed `[data-press-color]:active` bg swap |
| spelling | the resolved `theme` colour strings | a paint → `var(--nuri-<role>)` (bare role NAME) or a `{ literal }` verbatim (transparent) · the `background` SHORTHAND + `color` |

palette is **bespoke-but-single-sourced** ([decision 67](../decisionlog.md)): NOT a member of the agnostic Field table (`resolve-map.ts` · box/stack/typography) and deliberately NOT forced into it — "single-sourcing is the rule, not uniformity". So this slice did **not** touch `namespace-css.js` (the L3.1 Field-table emitter); palette gets its own small emitter.

## What shipped (ship list · as built)

1. **`packages/spec/pipeline/palette-surface.ts`** (new · the bespoke SoT) — the SURFACE role table: `variant` → `{ bg?, fg, pressed? }` + `chrome` → `{ bg?, fg }`, each paint a bare L2 role NAME (the emit prefixes `--nuri-`) or a `{ literal }`. Authored beside `dimensions.ts`/`colours.ts` (the SoT-in-`pipeline/` convention · relocated wholesale at the carve · sub-decision below). The three irregularities are modelled by **shape** (below). Strip-trivial (only single-line `type` aliases + the trailing `as const satisfies`, no imports).
2. **`packages/spec/pipeline/parsers/palette-css.js`** (new · the bespoke emit) — `emitPaletteCss(surface)` → the provenance header + empty `@layer tokens` (mirrors hand) + `@layer rules` { the rest dispatch (variant then chrome) · the pressed swaps }. Plus `loadSurface` (the type-strip + `data:`-URL import · reusing `dimension-css.js#stripTypes`) and `paintToCss` / `rulesForSurface`. **NO shell** (palette is merged-node · no `<nuri-palette>` element, no `:not(:defined)`, no base rule).
3. **`packages/spec/build/css-preview/palette.css`** (new · the committed shadow) — generated, committed (the harness guards it · the diff is reviewable). Provenance header marks it SHADOW · DO NOT REPOINT.
4. **`packages/spec/pipeline/css-preview.js`** (extended · the runner) — a `generatePalette()` bespoke call alongside the `NS_SPECS` loop (palette is NOT an NS_SPEC); `main()` writes `box`/`stack`/`palette`. **STANDALONE — NOT wired into `npm run build`** (nothing live changes). Run on demand: `node pipeline/css-preview.js`.
5. **`packages/spec/pipeline/palette-css.test.js`** (new · the parity harness · `node --test` · folds into `npm test`) — five guards (§ below).
6. **`packages/spec/pipeline/palette-css-computed-check.html`** (new · the browser harness) — loads the token CSS + the generated and hand palette CSS, builds nested `[data-theme]`/`[data-accent]` scopes, compares `getComputedStyle` (generated ≡ hand AND generated ≡ the restated design oracle). The only check that exercises the real engine's **scope-dependent** resolution (the dec-63 self-scope) the node parser cannot model. NOT a CI gate (no browser in CI).
7. **roadmap** — this retro + `index.md`.

## The SURFACE role table & the three irregularities (the SoT shape · the sub-decision)

The table, exactly the hand `palette.css` (`variant` XOR `chrome` · one input per node):

| input | background | color | pressed (`[data-press-color]:active` → background) |
|---|---|---|---|
| variant=solid | accent-solid | accent-on-solid | accent-solid-pressed |
| variant=soft | bg-strong | text-primary | bg-pressed |
| variant=ghost | `{ literal: transparent }` | text-primary | bg-subtle |
| variant=subtle | — (fg-only) | border-strong | — |
| chrome=canvas | bg-canvas | text-primary | — |
| chrome=subtle | bg-subtle | text-primary | — |
| chrome=strong | bg-strong | text-primary | — |

A paint is `type Paint = string | { literal: string }` — a bare string is an L2 role NAME (→ `var(--nuri-<role>)`), the `{ literal }` is the verbatim CSS value. The three irregularities are modelled by SHAPE, not special-cased downstream:
- **fg-only (subtle)** → `bg` is OPTIONAL (absent ⇒ no background channel · decision 50).
- **no-pressed (chrome slot + subtle)** → `pressed` is OPTIONAL (absent ⇒ no `:active` swap).
- **ghost's transparent** → a `{ literal }` paint, **structurally distinct** from a role reference — the same `{ ref } | { value }` split `dimensions.ts` uses for px-backed vs. literal leaves. An EXPLICIT `background: transparent` (the complete-pair rule · not an absent declaration).

The accent×theme cascade is NOT here: palette only writes `var(--nuri-accent-*)` and rides the EXISTING `[data-accent]` scope — the [decision 63](../decisionlog.md) `#4b/#6b` self-scope already lives in `tokens-semantic.css` (N+32) and is NOT reproduced.

## The five guards (the L3.1 pattern · two adapted · the brief §5)

- **A · STRUCTURAL ≡ + the merged-node model** — generated and hand carry the same `@layer rules` (same selector set · same declaration set per selector · order-insensitive · comments excepted) AND every selector is the `.nuri-palette` CLASS dispatch (no element/shell rules). **For palette this IS the complete computed-style proof**: `background`/`color` are DIRECT properties — no logical→physical resolution, no shorthand/longhand family overlap (the box-padding gap that dogs L3.1's Guard D **does not exist** here) — so identical (selector → decls) ⇒ identical computed style, full stop. Reads the hand CSS independently (the oracle).
- **B · RE-EMIT FRESHNESS** — the committed `build/css-preview/palette.css` == the emitter's current output (transfers verbatim · no drift).
- **C · RESOLVED-VALUE** — **ADAPTED**. L3.1's `buildVarMap` keeps the LAST `--nuri-*` decl, which is WRONG for the accent×theme colour vars palette references (multiple cascade blocks → it would grab the dark/lilac value · the brief's flagged bug). Instead this reuses the `colour-semantic.test.js` live-cascade walk (`resolveSemanticCrossProduct`) and indexes the DEFAULT scope `[neutral][light]` explicitly: (1) every generated paint bottoms out at a real hex (no dangling role var) or is the transparent literal; (2) a curated subset matches a RESTATED design oracle (the colour-validated values · not read from the CSS under test). The SCOPE-dependent resolution is the browser harness's job.
- **D · ORDER-SOUNDNESS** — **ADAPTED**. L3.1's "one data-attr per property" check does NOT transfer: `background` is dispatched by `data-variant` AND `data-chrome` (mutually-exclusive INPUTS · variant XOR chrome) AND by rest vs the pressed `[data-press-color]:active` rule (same element · resolved by SPECIFICITY, not order). So the real argument is asserted directly: (a) every rest rule keys on exactly one `[data-variant|chrome]` attribute (so at most one paints a node · the XOR contract excludes the cross-axis co-match); (b) each pressed rule is a STRICT specificity superset of its rest rule ((0,4,0) > (0,2,0), so it wins by specificity regardless of source order). Both ⇒ rule ORDER cannot change a computed value ⇒ Guard A's order-insensitive compare is sound.

(Guard C is two `test()` calls — the bottoms-out sweep + the curated oracle — so the suite reports **5** palette guards.)

## Verification — gates green

- **spec** `npm test -w @nuri/spec` → **60/60** (55 + the 5 new palette guards); `npm run build -w @nuri/spec` + `git diff packages/spec/build/` → **only the new `build/css-preview/palette.css`** (every pre-existing artifact byte-identical, incl. `palette.ts` + `tokens.ts` · the runner is not in the build).
- **rn** `npm test -w @nuri/rn` → **27/27 + 7 snapshots** · `npm run typecheck -w @nuri/rn` → **0** · **expo-demo** `npm run typecheck -w @nuri/expo-demo` → **0**. Inert by construction (no consumer touched), confirmed.
- **Harness proven non-tautological**: (1) a role swap in the SoT (`solid` bg `accent-solid` → `bg-canvas`, still a valid role) failed Guards A + B + C-oracle while C-bottoms-out (the role resolves) and D (structure unchanged) correctly stayed green; (2) breaking the pressed selector (drop `[data-press-color]`) failed Guard D; both reverted.
- **Computed-style (real browser · preview MCP · `nuri-docs` :8766)**: **9 cells · 34 checks · 0 fails** — generated ≡ hand AND generated ≡ the restated design oracle across the default (neutral/light), dark-ancestor, and lilac-accent scopes. **The dec-63 anchor**: a `.nuri-palette[data-variant=solid][data-accent=neutral]` under a `[data-theme=dark]` ANCESTOR resolves its background to **cream-1-light `rgb(255,253,242)`** (the swap CTA paints cream on dark, NOT dark-on-dark · via the `#4b` self-scope · matching N+32). The palette projection rides the existing scope faithfully.
- **Scope held**: `resolve-map.ts`, the factory, the recipe layer, the pages, `build/palette.ts`, `pipeline/parsers/palette.js` **untouched**; the dec-63 self-scope NOT reproduced; nothing live repointed. The 2 operator-local files (`.claude/launch.json`, `prompts/coordinator.md`) kept out of every commit.

## Judgment calls / sub-decisions (surfaced · operator-confirm if load-bearing)

- **The SoT shape** (above · the brief's named sub-decision) — `Paint = string | { literal }`, with optional `bg`/`pressed`. The bare-string-role choice keeps 12 of 13 cells terse (only `ghost.bg` is wrapped) while the `{ literal }` arm keeps `transparent` structurally distinct (the `dimensions.ts` reference-vs-literal idiom · so the operator recognises the shape). The irregularities fall out of absence (optional keys), the faithful model — `subtle` genuinely has no bg rule in the hand CSS; the chrome slot genuinely has no pressed rule.
- **`palette-surface.ts` homing = in-`pipeline/`** — beside `dimensions.ts`/`colours.ts` (the SoT-in-`pipeline/` convention). cascade.md: "the axis SoT belongs in `@nuri/spec`" — the carve relocates the table (the decision-68 `rn → spec` DAG); here it is a local pipeline SoT (no cross-package shim needed — unlike L3.1's `resolve-map.ts`, palette's SoT is authored fresh in `pipeline/`).
- **Harness helpers = COPIED, not extracted** — `layerRuleMap` + `declSig` are duplicated from `css-preview.test.js` (a small copy · the brief's named sub-decision "whether to extract shared harness helpers"). The conservative, reversible choice for a shadow: the L3.1 test file stays untouched. Extracting them to a shared `pipeline/parsers/*.js` helper is a clean L3c cleanup (when the namespace harnesses consolidate), deferred.
- **loadSurface reuses `dimension-css.js#stripTypes`** (one strip impl · [decision 48](../decisionlog.md)) — the same data:-URL technique as the descriptor twins / L3.1 / N+31 / C1 / C2. palette-surface.ts is authored to keep the strip trivial (single-line aliases + `as const satisfies`).

## Carry-forwards (L3c / later · LOG-only · do NOT fix here · P11)

- **Re-source `build/palette.ts` from the TS table** (the L2→L3 composition proof) — at L3c. During this shadow `build/palette.ts` stays derived from the hand `palette.css` (byte-identical · the double-projection is deliberately out of scope).
- **`@nuri/spec` has no tsconfig** — like `dimensions.ts`/`colours.ts`, `palette-surface.ts` is type-STRIPPED, not gate-compiled, so its `as const satisfies SurfaceTable` is author-time only (caught in a TS-aware editor, not in CI). Consistent with the existing token SoTs; a `tsc` over the SoTs is a later belt-and-braces.
- **The L3.1 Guard-D shorthand/logical-longhand gap + the web-factory no-harness gap** — L3c prerequisites, UNRELATED to palette (palette has no shorthand/logical families · `background`/`color` are direct). Stay open; close when the hand oracle retires.
- **A `git diff packages/spec/build/css-preview/` CI step** would belt-and-braces the harness-gated shadow freshness (deferred · the node Guard B is the gate).

## Next

- **L3b·2** — `interactive` (the pseudo-state axis · the gated `:active`/`:disabled` effects · the second bespoke axis · [decision 67](../decisionlog.md)).
- **L3.1b** — typography's table form (the type-step expansion · does it fit a Field arm or stay bespoke).
- **L3c (the flip)** — retire the recipe layer · the factory becomes the sole web renderer · re-source `build/palette.ts` from the TS table · close the Guard-D gap + the web-factory harness gap (the hand oracle retires here). Gated on these shadows.

See [`docs/cascade.md`](../docs/cascade.md) · [`roadmap/N+30-L3.1.md`](./N+30-L3.1.md) · [`decisionlog.md` §70 / §67 / §63 / §2](../decisionlog.md) · [`roadmap/index.md`](./index.md).
