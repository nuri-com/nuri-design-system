# Session N+32 · the colour vertical → TS SoT · C1 (the colour primitives + the cream lock)

**Status**: C1 shipped on `feat/n32-colour-cascade` ([decision 70](../decisionlog.md) · [`docs/cascade.md`](../docs/cascade.md) · the token-layer flip · the colour vertical). The colour PRIMITIVE catalog — the 7 candidate neutral scales + lilac + the alpha scales — is now sourced **from TS**: authored once in [`pipeline/colours.ts`](../packages/spec/pipeline/colours.ts) and the build *writes the `--nuri-color-*` values into* `styles/tokens-primitive.css`, instead of reading them out. **Awaiting the operator's on-branch review + the C2 brief** (the semantic accent×theme matrix).
**Type**: the **second real flip** ([decision 2](../decisionlog.md) reversed for the **colour-primitive layer**, after the dimension layer at [N+31](./N+31-dimension-cascade.md)). C1 is the **flat catalog** half — like the dimension layer it is a pure `:root` value emit with **no accent×theme cascade**, so the [decision 63](../decisionlog.md) `#4b/#6b` / §10 M2/M5 concern does not apply here. The cascade is **C2** (the genuinely-templated emit · the one novel transform). **REVERSIBLE until the gate was green** (the hand CSS was the oracle); now committed as generated.

---

## What flipped (C1 · the chain, end to end)

| layer | before (CSS-SoT) | after (TS-SoT) |
|---|---|---|
| L1 colour · raw scales | `--nuri-color-cream-1-light: #fffdf2;` hand-authored (7 neutrals + lilac · 12 × {light,dark}) + alpha (12 · theme-invariant) | the `neutralScales` / `lilac` / `blackAlpha` / `whiteAlpha` objects in [`colours.ts`](../packages/spec/pipeline/colours.ts) (DTCG terse · `{ value: '#fffdf2' }`) → emitted in place |
| the neutral resolution | **8 `[data-neutral="…"]` switcher blocks** (the runtime A/B · gray default at `:root`) | **ONE `:root` block** · `--nuri-color-neutral-N-θ → var(--nuri-color-<active>-N-θ)`, the active scale baked from `--neutral` (default **cream**) |

`build/tokens.ts` (the RN contract) and **every `build/*` artifact are byte-identical** — the RN/build path already resolved cream since [decision 31](../decisionlog.md) (N+5.8 · `DEFAULT_NEUTRAL = cream`), and `readPrimitives` skips the `var()` aliases so `tokens.json` never saw the switcher. **cream ≠ gray is therefore a WEB-CSS-ONLY value change** (the old `:root` default was gray); the system goes warm in the browser, the contract is unchanged.

## The mechanism — in-place passthrough (the dimension S1 twin)

The colour emit ([`pipeline/parsers/colour-css.js`](../packages/spec/pipeline/parsers/colour-css.js)) is the exact analog of the N+31 [`dimension-css.js`](../packages/spec/pipeline/parsers/dimension-css.js): parse `tokens-primitive.css`, set every `--nuri-color-*` declaration's value from the SoT, restringify — postcss preserves raws, so a value-to-itself round-trips **byte-identical** (verified · the same property the dimension flip relies on). One in-place rewrite covers **both** colour sub-families:
- the **raw catalog** (216 leaves · 7 neutrals + lilac + alpha) — byte-identical (same hex from the SoT);
- the **neutral resolution** (24 aliases) — the active scale (`--neutral`) baked into the single `:root` block.

The **structural** part (collapsing the 8 switcher blocks → one `:root` block) is a one-time committed edit (postcss surgery · round-trip-verified); the emit then drives the *values* (a hand-edit to a colour value is overwritten on the next `npm run build`), and the **two-way drift guard** fails the build loudly if the SoT and the CSS don't own exactly the same `--nuri-color-*` leaves. The semantic accent×theme cascade (`tokens-semantic.css` · the [decision 63](../decisionlog.md) `#4b/#6b`) is **not touched** — that is C2.

## What shipped (C1 ship list · as built)

1. **`packages/spec/pipeline/colours.ts`** (new · the SoT) — the DTCG terse `name → { value }` shape inherited from `dimensions.ts`: `neutralScales` (7 · `as const satisfies Record<string, Scale>`), `lilac` (`satisfies Scale`), `blackAlpha`/`whiteAlpha` (`satisfies Record<string, ColorLeaf>`). Trivially type-strippable (single-line `type` aliases · named types only in `satisfies` so no inner `;` trips the stripper · no imports). The `{ ref }` arm is **deferred to C2** (the semantic matrix · P11 · no speculative arm).
2. **`packages/spec/pipeline/parsers/colour-css.js`** (new · the emitter) — `loadColours` (reuses `stripTypes` from `dimension-css.js` · one strip impl), `primitiveColourMap` (the raw catalog), `neutralResolutionMap` (neutral-N → `var(--nuri-color-<active>-N-θ)` · parameterized by `--neutral`), `colourPrimitiveMap` (the union), `rewriteColourDecls` (the in-place surgical rewrite + the two-way drift guard), `flipColourCss` (read → rewrite → write · `tokens-primitive.css` only).
3. **`packages/spec/pipeline/tokens-parser.js`** (wired) — **Slice 0** runs `flipColourCss` right after the dimension flip, before every downstream slice reads the CSS, with the parsed `--neutral`.
4. **`packages/spec/styles/tokens-primitive.css`** — the 8 `[data-neutral]` blocks collapsed to one `:root` neutral-resolution block (cream); 3 provenance comments mark the generated colour regions + the switcher retirement (decision 35 consistency). The raw colour **values are unchanged**; only the neutral resolution moved gray → cream.
5. **`packages/spec/pipeline/colour-cascade.test.js`** (new · the parity harness · folds into `npm test` · 7 guards):
   - **A · structural ≡** — the SoT's `{ cssVar → RHS }` map (catalog ∪ cream-resolved aliases) equals the committed CSS's; plus the SoT neutral-scale set ≡ `semantic.js` `NEUTRAL_SCALES`.
   - **B · re-emit freshness** — re-running the in-place colour emit on the committed CSS is byte-identical (the L3.1/N+31 Guard-B posture).
   - **C · cream oracle (independent)** — the 24 cream hex are RESTATED in the test and the neutral resolution is chased **two ways** (through the SoT AND the live CSS `var()` chain) to that oracle. The substantive guard · the brief's cream lock.
   - **D · the lock** — the frozen brand + alpha values are unmoved (lilac-9 · alpha · restated); the colour SoT owns **nothing** in `tokens-semantic.css` and the dec-63 `#4b/#6b` selectors are present (the C1/C2 boundary · the cascade untouched).
6. **`packages/spec/pipeline/tokens-parser.test.js`** — `'gray'` joined `RESERVED_COLOR_SCALES` (it was reachable only through the retired gray alias edge); the switcher comment refreshed. Stale "data-neutral switcher" prose updated in `parsers/semantic.js` (×3) + `parsers/primitive.js`.
7. **roadmap** — this C1 record + `index.md`.

## Verification — gates green

- **spec** `npm test -w @nuri/spec` → **48/48** (41 prior + the 7 new colour-cascade guards); `npm run build -w @nuri/spec` + `git diff --exit-code packages/spec/build/` → **byte-identical** (the load-bearing gate · proves the colour value-change is WEB-CSS-only · `tokens.ts` was already cream). `styles/tokens-primitive.css` diff = the switcher collapse (−182/+37) + the gray→cream neutral resolution + the provenance comments (no raw-leaf drift · verified).
- **rn** `npm test -w @nuri/rn` → **27/27 + 7 snapshots** · `npm run typecheck -w @nuri/rn` → **0** (the contract is byte-identical · the flip is invisible to the consumer).
- **expo-demo** `npm run typecheck -w @nuri/expo-demo` → **0**.
- **Harness proven non-tautological** (in-memory): a wrong cream value diverges Guard A; an extra SoT leaf / an orphan CSS decl each throw the two-way drift guard; a wrong baked neutral (sage) fails Guard C's cream chase.
- **Real-browser computed-style (the cream lock + dec-63 · session-time gold standard)**, served from the live spec CSS:
  - `--nuri-color-neutral-1-light` resolves to **cream `rgb(255,253,242)`** at `:root` (was gray `rgb(252,252,252)`) — the web value change.
  - the **decision-63 self-scope**: a self-scoped `accent="neutral"` under a dark ancestor (no `data-neutral` pin) resolves `--nuri-accent-solid` to **cream-1-light `rgb(255,253,242)`** (dark-correct · NOT dark-on-dark), matching the block-4 combo control exactly; the light-context inverse resolves cream-1-dark `rgb(18,17,11)`. The cascade is preserved and composes with the new cream default.
  - the **My-vault playground renders right in cream** (the mockup is warm, the lilac brand button intact · screenshot at the checkpoint).
- **`--neutral=` honored build-time**: `npm run build -- --neutral=sage` repoints the web `:root` resolution to sage (the whole web system rebuilds sage · verified); the default cream build restores byte-identical.

## Judgment calls (C1)

- **`tokens.ts` stays byte-identical (the brief anticipated a value change).** The brief framed "RN tokens.ts → cream" as a value change gated on cream-correctness not byte-identity. In fact the RN/build path went cream at [decision 31](../decisionlog.md) (N+5.8); only the WEB `:root` default was still gray. So C1's value change is **web-CSS-only** and `build/*` is byte-identical — and the CI `git diff build/` gate passes cleanly (stronger than the brief assumed).
- **The structural collapse is a committed edit; the emit drives values.** The 8→1 block change can't be a pure value passthrough, so it is a one-time postcss surgery (round-trip-verified · byte-identical except the removed blocks + renamed selector). The emit then owns the values + the drift guard.
- **`semantic.js` is comment-only.** The retired switcher leaves two now-inert `[data-neutral]` branches in `primitiveSelectorMatches` and a vestigial `neutral` param in `buildPrimitiveMap`. Per the brief ("leave the cascade untouched") these are **kept (commented as inert · cleanup-candidate)** rather than refactored — zero risk to the byte-identical gate. A clean follow-up (fold into C2 when `semantic.js` is in scope).

## Flagged for the operator's review (the on-branch checkpoint)

- **The playground shell chrome now renders cream** (`bg-subtle` = cream-2-light `rgb(251,249,238)`, was gray `~#f9f9f9`). `lib/playground/shell.js` still sets `data-neutral="gray"` on the shell host to render the chrome on a grey reference so the cream mockup "pops" (decision 57.1) — that is now **inert** (no gray switcher block). The black device bezel still separates the mockup (it reads fine), but the gray-reference intent is gone. **Decision for you**: accept cream chrome, or restore the grey reference via a different mechanism (e.g. the shell references `--nuri-color-gray-*` directly, or keeps a single `[data-neutral="gray"]` block). Out of scope for C1 (shell.js untouched).
- **The device-frame "Neutral" picker is now a dead control** (the runtime switcher it drove is retired). Cleanup (likely with the shell decision above).
- **The dec-2-for-colour ledger entry is pending you.** N+31 recorded the dec-2 state transition for the dimension layer at [decisionlog §71](../decisionlog.md); C1 partially reverses dec-2 for the colour-PRIMITIVE layer (the semantic cascade stays CSS-SoT until C2). I did **not** unilaterally write a decisionlog entry — per the precedent that the dec-2 transition is the operator's to record (and C2 completes the colour flip). Recommend the ledger entry land with C2, or now if you prefer.
- **`website/assets/nuri/styles/` is stale** (still the 8-block switcher · gray default). It is a separately-staged copy (`website/stage.mjs` · not gated by C1); restage when the docs site is next published.

## Next — C2 (the semantic accent×theme matrix · the novel emit)

Author the chrome (theme-only) + accent (accent×theme) matrix in TS, referencing the neutral/lilac primitives via the `{ ref }` arm; generate the cascade CSS — blocks 1→6 + the `#4b/#6b` self-scope descendant blocks (the genuinely-templated emit · no stock tool does it · [decision 63](../decisionlog.md) preserved exactly, including the known nearest-vs-any-ancestor limitation). Gated on the computed-style dec-63 anchor (a self-scoped `[data-accent=neutral]` under a `[data-theme=dark]` ancestor resolves the DARK value · the cream cells match the hand cascade · `tokens.ts` stays the flat `{accent}{mode}` matrix — RN single-context · decisions 27/62/63). The C1 harness grows the cascade guards; the dimension + colour-primitive slices de-risked the mechanism.

See [`docs/cascade.md`](../docs/cascade.md) · [`decisionlog.md` §70 / §63 / §31 / §2](../decisionlog.md) · [`roadmap/N+31-dimension-cascade.md`](./N+31-dimension-cascade.md) · [`roadmap/token-standards-eval.md` §7](./token-standards-eval.md) · [`roadmap/index.md`](./index.md).
