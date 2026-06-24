# Session N+31 · the dimension cascade → TS SoT (the first real flip)

**Status**: shipped on `feat/n31-dimension-cascade` ([decision 70](../decisionlog.md) · [`docs/cascade.md`](../docs/cascade.md) · the token-layer flip). The `--nuri-px-36 → --nuri-size-md → 36px` chain is now sourced **from TS**: the px scale + the space/size/radius semantics are authored once in [`pipeline/dimensions.ts`](../packages/spec/pipeline/dimensions.ts) and the build *writes them into* `styles/tokens-{primitive,semantic}.css`, instead of reading them out.
**Type**: the **first irreversible-class flip** ([decision 2](../decisionlog.md) reversed for the **dimension layer only** · L4 descriptors were B1 · the L3.1 namespace CSS was a shadow spike). The easy one by design — the dimension scales are all flat `:root` (**no accent×theme cascade**), so the [decision 63](../decisionlog.md) `#4b/#6b` / §10 M2/M5 concern does not apply here; that is the **colour** slice (next). **REVERSIBLE until the gate was green; now committed as generated.**

---

## What flipped (the chain, end to end)

| layer | before (CSS-SoT) | after (TS-SoT) |
|---|---|---|
| L1 px primitives | `--nuri-px-36: 36px;` hand-authored | `PX_SCALE` in [`dimensions.ts`](../packages/spec/pipeline/dimensions.ts) (value == name · decision 32) → emitted |
| L2 space/size/radius | `--nuri-size-md: var(--nuri-px-36);` hand-authored | `SIZE.md = { px: 36 }` → emitted as `var(--nuri-px-36)` (the reference structure px←semantic **is** the cascade) |
| the two literals | `--nuri-space-none: 0;` · `--nuri-radius-full: 9999px;` | `{ literal: '0' }` · `{ literal: '9999px' }` (the sentinels outside the px scale by design · decision 32 / 36.1) |

`build/tokens.ts` (the RN contract · the space/size/radius singletons resolved to numerics) and every other `build/*` artifact are **byte-identical** — the flip moved the *source*, not a value.

## The mechanism — in-place passthrough (the S1 choice)

Two sub-decisions were surfaced and **operator-confirmed at the checkpoint**:

- **(S1) File mechanism = passthrough-hybrid (in-place).** Keep the two files; regenerate ONLY the dimension declarations in place; pass every non-dimension byte through verbatim. **Zero page repointing** (the ~15 pages, `website/stage.mjs`, and the pipeline reads all keep the same two paths). The trade — `styles/` now holds a generated region (muddier provenance) — is accepted; the clean physical split (`tokens-dimension.css`) is a later L3c-style cleanup. *(vs. physical split — clean provenance, but repoints pages + stage + reads.)*
- **(S2) tokens.ts path = minimal.** Generate the CSS from the SoT; the existing parser keeps reading the (now generated) CSS → the whole pipeline downstream is unchanged → `build/*` byte-identical with the smallest diff. *(vs. the eventual ideal — TS → both projections directly · a bigger `semantic.js` change · deferred.)*

The emit is postcss-surgical: parse the CSS, set each dimension declaration's value from the SoT, restringify. postcss preserves raws, so setting a value to its current value round-trips **byte-identical** (verified). The flip is genuine — the build *drives* those values (a hand-edit to a px value is overwritten on the next `npm run build`), and the harness fails loudly if the CSS and the SoT disagree.

## What shipped (ship list · as built)

1. **`packages/spec/pipeline/dimensions.ts`** (new · the SoT) — `PX_SCALE` (12 leaves) + `SPACE`/`SIZE`/`RADIUS` (8/7/4) as `{ px } | { literal }`. Authored to be trivially type-strippable (single-line `export type …;` + `const X: T =` only · no imports).
2. **`packages/spec/pipeline/parsers/dimension-css.js`** (new · the emitter) — `loadDimensions` (type-strip + `data:`-URL import · node 20 can't import a `.ts` · the descriptor-twin / L3.1 technique), `primitiveDimMap`/`semanticDimMap`/`leafRhs` (SoT → `{ cssVar → RHS }`), `rewriteDimensionDecls` (the in-place surgical rewrite + the **two-way drift guard** — the SoT and the CSS must own exactly the same leaves in each family), `flipDimensionCss` (read → rewrite → write both files).
3. **`packages/spec/pipeline/tokens-parser.js`** (wired) — **Slice 0** runs `flipDimensionCss` BEFORE every downstream slice reads the CSS. The build now writes `styles/` (the S1 trade · commented).
4. **`packages/spec/pipeline/dimension-cascade.test.js`** (new · the parity harness · folds into `npm test` · 8 guards):
   - **A · structural ≡** — the SoT's `{ cssVar → RHS }` map equals the committed CSS's (declaration maps · px ← primitive, space/size/radius ← semantic).
   - **B · re-emit freshness** — re-running the in-place emit on the committed CSS is byte-identical (the CSS is the SoT's fresh output · the L3.1 Guard-B posture).
   - **C · independent scale oracle** — the design numbers are RESTATED in the test (not read from CSS or the SoT) and every leaf is resolved through the px chain to its final value **two ways** (through the SoT AND through the live CSS `var()` chain). The substantive guard — if the SoT and CSS both held a wrong value, A/B pass but C fails.
   - **D · the lock** — the reserved radius PRIMITIVES (`--nuri-radius-{none,xs,xl,2xl}` · `tokens-primitive.css` · hand · P11) are present and NOT owned by the SoT.
5. **`styles/tokens-{primitive,semantic}.css`** — 4 provenance comments mark the generated regions (decision 35 consistency · the only `styles/` byte change · **no value or var moved**).
6. **roadmap** — this retro + `index.md` (incl. the re-order note).

## Verification — gates green

- **spec** `npm test -w @nuri/spec` → **41/41** (33 + the 8 new dimension-cascade guards); `npm run build -w @nuri/spec` + `git diff --exit-code packages/spec/build/` → **byte-identical** (the load-bearing gate · proves the dimension values are unchanged through the whole pipeline incl. RN's `tokens.ts`). `styles/` diff = the 4 provenance comments only (no declaration value moved).
- **rn** `npm test -w @nuri/rn` → **27/27 + 7 snapshots** · `npm run typecheck -w @nuri/rn` → **0** (the RN contract `build/tokens.ts` is byte-identical · the inversion is invisible to the consumer).
- **expo-demo** `npm run typecheck -w @nuri/expo-demo` → **0**.
- **Harness proven non-tautological**: a wrong value (`size.md 36→48`) diverges the re-emit (Guard B teeth); a SoT leaf absent from the CSS, an orphan CSS decl, and a malformed leaf each throw the drift/exhaustiveness guards. Confirmed in-memory.
- **Scope held**: no accent×theme cascade touched · `--nuri-border-*` / the reserved radius primitives / the type scale / fonts / every colour untouched · the namespace CSS (box/stack) + the L3.1 shadow + the recipe CSS + the web factory untouched · no page repointed.

## Judgment calls

- **The SoT is `.ts`, loaded type-stripped** (not `.js`) — the cascade north-star is "one **TS** source of truth"; the strip + `data:`-URL technique is already proven (descriptor twins · L3.1). The file is authored to keep the strip trivial (a loud sanity check guards a strip regression).
- **`styles/` is marked, not left silent** — decision 35 marks all generated content "GENERATED · DO NOT EDIT". The dimension declarations are now generated, so 4 concise provenance comments document the S1 hybrid's generated region at the point of use (and prevent the silent-overwrite footgun). The trade: `styles/` is no longer byte-identical to pre-flip, but it is **value-identical** (the bar) and `build/*` is byte-identical (the load-bearing gate · comments aren't parsed into values).
- **The drift guard is two-way** — the SoT must own *exactly* the dimension leaves the CSS declares, in each family, so adding a px primitive to one but not the other fails the build rather than diverging silently. The reserved radius primitives stay out of the SoT's families (Guard D) so the family split is explicit.
- **Slice 0 writes `styles/` during `npm run build`** — the most direct reading of "wire the emit so tokens-*.css is generated". The CI `git diff` gate is `build/`-scoped; `styles/` freshness is gated by the harness (`npm test`), which is the right place for it.

## Carry-forward (LOG-only · do NOT fix here · P11)

- **The L3c Guard-D shorthand/logical-longhand soundness gap stays OPEN** (the L3.1 carry-forward · unrelated to this slice · closes when the namespace hand-CSS oracle retires).
- **The clean physical split** (a generated `tokens-dimension.css` · clean provenance · the S1 alternative) is the deferred L3c-style cleanup.
- **The styles/ freshness CI gate** — today only the harness (`npm test`) enforces committed-`styles/` == SoT; the `git diff` gate is `build/`-scoped. A `git diff packages/spec/styles/` step would belt-and-braces it; deferred (the harness covers it).

## The re-order (sequencing · not a model change · decision 70 stands)

The remaining token-SoT flip is re-sequenced into **two vertical slices by subject** — **dimensions** (L1 px + L2 space/size/radius · this slice ✓) → **colour** (the colour primitives + the L2 accent×theme matrix · the [decision 63](../decisionlog.md) cascade · §10 M2/M5 · next) — superseding the L3.1 retro's "Next: L3b" immediate-next. This is **sequencing only**: [decision 70](../decisionlog.md)'s cascade model is unchanged, and the L3 namespace flip (L3b · L3.1b · L3c) remains on the map. The dimension vertical was chosen first precisely because it has **no cascade** — the lowest-risk place to make the first real flip.

## Next

- **The colour vertical** — author the colour primitives + the `(accent × theme)` matrix in TS; generate the token-cascade CSS (the `#4b/#6b` self-scope · decision 63 preserved · the genuinely-templated emit · gated on `resolver-model.md` §10 M2/M5). The harder slice (the cascade); the dimension slice de-risked the mechanism.
- **L3b / L3.1b / L3c** — the namespace/axis flip (palette + interactive bespoke · typography's table form · retire the recipe layer · close the Guard-D gap), per the L3.1 handoff.

See [`docs/cascade.md`](../docs/cascade.md) · [`decisionlog.md` §70 / §2 / §63](../decisionlog.md) · [`roadmap/N+30-L3.1.md`](./N+30-L3.1.md) · [`roadmap/index.md`](./index.md).
