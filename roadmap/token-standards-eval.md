# Token-standards evaluation — the frame-check before the colour slice

**Status**: evaluation spike (N+31-adjacent · **no production code ships**). Answers the operator's
*"are we reinventing the token layer?"* before the colour slice — the big hand-roll. Grounding
prototype: [`scratch/token-standards/`](../scratch/token-standards/) (throwaway · gitignored).
**Base**: [decision 2 / 2.1](../decisionlog.md#2-pipeline-strategy--pattern-c--n1) (Pattern C ·
the SD deferral) · [decision 70](../decisionlog.md#70-the-cascade--one-ts-sot-two-projections--the-9-model--n29) /
[71](../decisionlog.md#71-9--decision-2-reversed-for-the-dimension-layer-executing-decision-70--the-first-real-flip--n31) ·
[`docs/cascade.md`](../docs/cascade.md).

---

## 1 · Recommendation (the lead)

**The token layer's *shape* is reinvented; its *transform* is not. Fix the shape — adopt the DTCG
representation — and keep the bespoke transform, with Style Dictionary pre-armed for the day a third
target lands.** Three moves:

| # | Move | Why | Cost |
|---|---|---|---|
| **1** | **Adopt the DTCG shape** as the authoring form: `name → $value (literal \| {alias})`, group-level `$type`. Kills the `PxValue` union + `PX_SCALE` array + `DimLeaf` double. | The actual pain is a *shape* problem. DTCG is the W3C-standard answer, and Nuri **already emits a subset of it** ([`build/tokens.json`](../packages/spec/build/tokens.json)). | **Low** — a `dimensions.ts` reshape; proven to reproduce both projections (§6). |
| **2** | **Keep the transform bespoke** — the ~130-line emitter + the [N+31 harness](../packages/spec/pipeline/dimension-cascade.test.js). | The flat projection a tool gives for free is the *cheap* part. Nuri's real value — the **[decision 63](../decisionlog.md#63-accenttheme-self-scope-cascade-clobber--descendant-combinator-dark-blocks-4b6b--web-css-only--n15) accent×theme cascade** + the **clean `tokens.ts` RN contract** — is bespoke in *any* world (§6, Part B). | **Zero** — it already exists, tested, value-preserving. |
| **3** | **Pre-arm Style Dictionary; adopt it on the third-target trigger** (native iOS/Android · Figma/Tokens-Studio sync · external token publishing). The DTCG source from move 1 feeds SD with zero rework. | This is **[decision 2.1](../decisionlog.md#21-amendment--n55) re-validated under the inversion** — SD amortizes only across N≥3 targets; Nuri has 2. | **Deferred** — no work now; a one-line trigger in the ledger. |

**This is "borrow the model," not "stay bespoke" and not "adopt a tool."** The genuinely-open
question — steelmanned by running real Style Dictionary on Nuri's real tokens (§6) — resolves to:
borrow the **format** (high value, low cost, half-done already), decline the **tool** (negative ROI
until a third target), because the format is where the reinvention is and the tool's value is
amortization Nuri can't yet bank.

**For N+31 specifically:** **reshape `dimensions.ts` to the uniform form and land it before the
colour slice** (§7) — so the one shape is established at the easy (no-cascade) layer first, and the
colour matrix inherits it rather than inventing a second encoding.

---

## 2 · Scope — what's reinvented vs what's genuinely Nuri

The evaluation is the **token layer only** — L1 primitives + L2 semantic scales → CSS + RN. Explicitly
**not reopened** (these are Nuri, by design, and no standard supplies them):

- the **components / factory / namespace** machinery (decisions 64–67) — the agnostic `Field` table + bespoke palette/interactive axes;
- the **web+RN 1:1 parity** model (RISKS R1, decision 21) — no token tool addresses props/behaviour parity;
- the **docs-as-spec / docs-gen** pipeline (decision 33, the descriptor→Markdown emitter).

Within the token layer, the finding splits cleanly: **the *shape* is reinvented** (hand-rolled
`PxValue`/`PX_SCALE`/`DimLeaf` where a one-line standard exists); **the *transform* is not** (the
part that overlaps a standard tool is trivial; the part that matters is irreducibly Nuri's cascade).

---

## 3 · Prior-art map (concrete shapes · current docs, June 2026)

### 3.1 DTCG / W3C Design Tokens Format Module — **the format** ✅ borrow this

First **stable** release **2025.10** (2025-10-28; a W3C Community Group report, not a Standard). It is a
**JSON interchange format, not a tool** — it standardises how tokens are *written*, and explicitly
leaves CSS/RN emission to *"translation tools."* (Verified against the spec directly.)

```jsonc
{
  "px": {                                   // a GROUP — $type inherits to children
    "$type": "dimension",
    "36": { "$value": { "value": 36, "unit": "px" } }   // primitive · 2025.10 OBJECT form
  },
  "size": {
    "$type": "dimension",
    "md": { "$value": "{px.36}" }            // ALIAS · curly-brace ref → resolves to the target's $value
  }
}
```

- **`name → $value`** where `$value` is a **literal** *or* a **`{group.token}` reference**. `$type`
  inherits from the nearest parent group. This is *exactly* the shape Nuri's `dimensions.ts` open-codes.
- **2025.10 made `dimension` and `color` `$value`s OBJECTS** (`{value,unit}`; `{colorSpace,components,hex}`) —
  unit required even at 0; older `"16px"`/`"#fff"` strings are no longer spec-valid (tools tolerate them
  for back-compat). The ecosystem is **mid-migration** (a real signal — see §6, Part B).
- New **Resolver Module** standardises *multi-context* theming (light/dark sets/modifiers) — the
  standardised analogue of Nuri's `(accent × theme)` matrix. Tooling support is nascent.
- **Web/RN projection: out of scope** — the spec only fixes vocabulary + unit meaning (`px`→`dp`/`pt`, `rem`→`sp`).
- Nuri **already emits DTCG**: `build/tokens.json` is a 216-leaf colour tree of `{ $type, $value }` —
  but the **legacy hex-string** form, **colour-only** (dimensions never reach it). So the shape is *half-adopted as an output*; move 1 makes it the *input*.

### 3.2 Style Dictionary — **the transform** ⏸ defer to the third-target trigger

Build-time Node tool: one source (legacy *or* DTCG) → N platform files via **transforms** (mutate
name/value) + **formats** (serialise). Ran **v4.4.0** locally (npm-resolved; v5.x exists, identical
surface API). Maintained by **Tokens Studio** (handed off from Amazon, 2023). **DTCG-native since v4.**

```js
// sd.config — two platforms, ONE source tree
platforms: {
  css: { transformGroup: 'css', prefix: 'nuri',
         files: [{ format: 'css/variables', options: { outputReferences: true } }] },  // var() preserved
  rn:  { transformGroup: 'react-native',                                                // [name/camel, color/css, size/object]
         files: [{ format: 'javascript/esm' }] },
}
```
```css
/* web output */               :root { --nuri-px-36: 36px; --nuri-size-md: var(--nuri-px-36); }
```
```js
/* RN output — size/object struct, NOT a bare number */
size: { md: { value: { original:"36px", number:36, decimal:0.36, scale:576 }, /*+ name, path, attributes…*/ } }
```

This is **literally Nuri's original Pattern C** ([decision 2](../decisionlog.md#2-pipeline-strategy--pattern-c--n1):
*"custom parser → tokens.json (DTCG), Style Dictionary → RN"*), which **[decision 2.1](../decisionlog.md#21-amendment--n55)
already deferred** — *"conditional on a second target platform; for RN-only the cascade-aware resolver is terminal."* §6/§7 re-validate that call under the inversion.

### 3.3 vanilla-extract Sprinkles — **model-learning only** ❌ web-only

Zero-runtime CSS-in-TS. **No React Native** (Discussion #575 open for years; only an unmaintained
community fork bridges RN) → **disqualified** for a web+RN system. Worth *stealing* for L3 axes:

```ts
defineProperties({
  conditions: { mobile: {}, dark: { selector: '[data-theme=dark] &' } },
  properties: { paddingTop: vars.space, gap: vars.space },   // a SCALE *is* the value-domain — no separate union
  shorthands: { padding: ['paddingTop','paddingBottom', /*…*/] },  // a named multi-property axis
})
```
The model — **typed scale as the property's value-domain**, **conditions** as the multi-target multiplier,
**shorthands** as semantic axes — is the right pattern for the L3 `Field` table (and validates that
`SpaceLeaf` should *derive from* the scale, per [`docs/cascade.md`](../docs/cascade.md)).

### 3.4 Tamagui — **model-learning only** ❌ whole framework

A universal UI framework + optimising compiler + `styled()` factory. Adoption = lock-in that collides
head-on with Nuri's *own* factory/namespace (genuinely Nuri). But its core mechanism is **exactly
Nuri's "two projections" thesis**, and validates it: every value is a **`Variable`** carrying *both*
`.val` (raw → RN) and `.variable` (CSS-var string → web); the platform branch happens at **resolution**,
not authoring. Two-tier: **tokens** (primitives) + **themes** (semantic, reference tokens). Steal the
*idea* (one value, two projections), not the framework.

### 3.5 Unistyles v3 — **wrong layer** ❌ a runtime consumer

RN-first runtime styling (C++/Nitro; RN-Web for web, not standalone CSS). Theme shape is
**developer-defined**, with **no reference/alias concept** — it is a *consumer* of resolved tokens, not
a token source/transform/format. Already Nuri's chosen RN stylesheet target ([decision 7](../decisionlog.md));
orthogonal to this question.

---

## 4 · Constraint mapping

Scored against Nuri's real constraints: **web+RN parity** · **agent-first / docs-as-spec** (dec 21) ·
**zero-build web** (#3 · *relaxed* by dec 70/68 — the web token CSS is now *generated*; only the
browser-resolves-`var()` *iteration* property is load-bearing) · **existing investment**.

| | web+RN parity | agent-first / terse | zero-build (relaxed) | existing investment | verdict |
|---|---|---|---|---|---|
| **DTCG shape** | ✓ target-agnostic | ~ structure is clean; 2025.10 *objects* are verbose | ✓ N/A (a format) | ✓ already emitted (subset) · low migration | **Borrow** |
| **Style Dictionary** | ✓ proven (§6) | ✗ build dep + config + verbose output | ~ build-time, but dec 70 already accepts generated CSS; `var()` output still resolves in-browser | ✗ now (dep + 2 custom formats duplicate bespoke value) · ✓ at N≥3 targets | **Defer · trigger** |
| **Sprinkles** | ✗✗ web-only | ✓ typed scales | ✗ bundler-coupled | ✗ | **Steal model** |
| **Tamagui** | ✓ universal | ✗✗ framework lock-in | ✗ compiler | ✗✗ collides w/ Nuri factory | **Steal model** |
| **Unistyles** | ~ RN(+RN-Web) | ~ dev-defined | n/a runtime | already the RN target | **Orthogonal** |

The historical blocker for Style Dictionary — *"a build step breaks web zero-build"* — **is gone**
(dec 70 generates the token CSS at build; the iteration property survives regardless). So SD is deferred
on **ROI**, not on the old zero-build fear. That is the honest, updated picture.

---

## 5 · The uniform representation — `name → value | reference`

The shape that kills the array / union / `PxValue` double, **independent of build-vs-borrow**. Shown on
Nuri's real dimension tokens.

**Today** ([`pipeline/dimensions.ts`](../packages/spec/pipeline/dimensions.ts)) — one idea, three encodings:
```ts
export type PxValue = 2 | 4 | 6 | 12 | … | 90;          // ① the union
export const PX_SCALE: PxValue[] = [2, 4, 6, 12, …, 90]; // ② the array — the SAME 12 names, restated
export type DimLeaf = { px: PxValue } | { literal: string };          // ③ a stringly literal arm
export const SPACE: Record<string, DimLeaf> = { none: { literal: '0' }, '2xs': { px: 2 }, … };
```

**Reshaped** — the DTCG shape, in TS (the [`docs/cascade.md`](../docs/cascade.md) "TS SoT" north-star is preserved):
```ts
// L1 · primitives. The KEYS are the scale (no array). The TYPE derives (no union).
export const px = { 2:2, 4:4, 6:6, 12:12, 18:18, 24:24, 28:28, 36:36, 48:48, 60:60, 72:72, 90:90 } as const;
export type Px = keyof typeof px;                         //  2 | 4 | … | 90  — derived, authored once

// a leaf is the universal token shape: a reference OR a structured literal (no stringly form).
type Leaf = { ref: Px } | { value: number; unit: 'px' };

// L2 · name → leaf. The axis vocab (`SpaceLeaf`) derives via `keyof typeof space`.
export const space = {
  none: { value: 0, unit: 'px' },                         // sentinel literal (decision 32)
  '2xs': { ref: 2 }, xs: { ref: 4 }, sm: { ref: 6 }, md: { ref: 12 }, lg: { ref: 18 }, xl: { ref: 24 }, '2xl': { ref: 36 },
} as const satisfies Record<string, Leaf>;
export const radius = {
  sm: { ref: 6 }, md: { ref: 12 }, lg: { ref: 18 }, full: { value: 9999, unit: 'px' },   // pill sentinel (36.1)
} as const satisfies Record<string, Leaf>;
```
- ① union → **derived** `keyof typeof px`. ② array → **gone** (`Object.keys(px)` *is* the scale). ③
  stringly `{literal:'9999px'}` → **structured** `{value,unit}`. `value == name` (decision 32) becomes a
  one-line **assertion**, not a restatement.
- The `{ref} | {value,unit}` union is **not** a smell — it *is* "value | reference," the universal shape.
- The emitter change is trivial: `leafRhs` becomes `'ref' in leaf ? var(--nuri-px-${leaf.ref}) : (leaf.value===0 ? '0' : `${leaf.value}px`)`.
- The **DTCG-JSON twin** of this exact tree is [`scratch/token-standards/tokens.dimensions.json`](../scratch/token-standards/tokens.dimensions.json) — the form you would hand to Style Dictionary the day move 3 fires, at zero source rework.

---

## 6 · The grounding prototype (empirical · real tokens)

Throwaway, in [`scratch/token-standards/`](../scratch/token-standards/). Antidote to abstract planning.

**Part A — the uniform shape + a ~40-line transform reproduces BOTH projections, exactly.**
`tokens.dimensions.json` (the shape above) → `transform.mjs` → compared to the *committed* artifacts:
```
(a) WEB CSS  · 31/31 declarations match styles/tokens-{primitive,semantic}.css
               (px → `Npx`; references → `var(--nuri-px-N)` — the cascade preserved; 0 → unitless)
(b) RN       · 19/19 numerics match build/tokens.ts (space/size/radius singletons, aliases resolved)
✅ one DTCG-shaped source reproduces both projections — the dimension layer needs no framework.
```

**Part B — the steelman: REAL Style Dictionary (v4.4.0) on the same tokens.**
```
(a) WEB CSS  · 30/31 byte-identical RHS + 1 semantically-equal (`--nuri-space-none: 0px` vs Nuri `0`),
               0 genuinely different. `outputReferences:true` preserved the `var()` cascade exactly.
               → stock SD reproduces the flat dimension web layer essentially perfectly.
(b) RN       · structurally UNLIKE Nuri: the `size/object` struct `{original,number,decimal,scale}`
               wrapped in token metadata — not the clean `export const size = { md: 36 }`.
               Matching `tokens.ts` needs a CUSTOM format + value-transform.
(✗) DTCG-2025.10 `{value,unit}` object → CRASHES SD's stock `size/object` transform
    ("Invalid Number … not a valid number"). Real, dated, mid-migration friction.
```

**Where SD stops — and why it's the whole point.** SD gives the *flat* projection (px scale, `var()`
refs) for free — but that is the part Nuri's ~130-line emitter does in a few lines anyway. The part SD
does **not** do for free:
1. the **[decision 63](../decisionlog.md#63-accenttheme-self-scope-cascade-clobber--descendant-combinator-dark-blocks-4b6b--web-css-only--n15) accent×theme self-scope cascade** (the `#4b/#6b` descendant-combinator dark blocks) — **no stock format emits it**; you write a custom format = the bespoke cascade logic, hosted inside SD's plugin API;
2. the **clean `tokens.ts` RN contract** — a custom format + value-transform.

So "adopt SD" = take a dependency + config surface **and still write the two custom formats that carry
all of Nuri's actual value**. Net-negative **until** a third target makes the dependency amortise. The
dimension layer (this slice) is precisely where SD looks *best* and adds *least* — it is flat, and flat
is the free part.

---

## 7 · Build-vs-borrow, decided — and what N+31 becomes

**Borrow the format, keep the transform, pre-arm the tool** (§1). The reasoning, end to end:

- **The reinvention is the shape, and it's cheap to fix** → adopt DTCG (move 1). Nuri is half-there already.
- **The transform is not reinvention** → the SD-overlapping part is trivial; the valuable part (cascade,
  RN contract) is bespoke in either world. Keeping the working emitter + harness is the low-risk choice.
- **SD's value is real but unbanked** → it amortises across targets Nuri doesn't have. Arm it (the DTCG
  source makes adoption a config file, later), trigger it on the third target. This is **[decision 2.1](../decisionlog.md#21-amendment--n55)
  restated for the post-inversion world**: then *"SD adds nothing over the cascade resolver (RN-only)"*; now
  *"SD does the flat part for free but the cascade + RN contract are bespoke regardless; bank it at N≥3 targets."*

**N+31** — as built it is **correct** (gates green, value-preserving); the critique is *only* the SoT shape.
Recommendation: **reshape `dimensions.ts` to §5's form and land it as part of (or immediately after) N+31,
before the colour slice.** Rationale:
- the colour slice will define the `(accent × theme)` **matrix** shape — establish the **one** uniform shape
  at the easy, cascade-free dimension layer *first*, so colour inherits it instead of inventing a second encoding;
- the reshape is small and **de-risked by the prototype** (it provably reproduces both projections);
- it also closes the `SpaceLeaf`/`RadiusLeaf` "hardcoded vs derive" double that [`docs/cascade.md`](../docs/cascade.md) already flags.

*(Alternative — land N+31 as-is, reshape at the colour slice — is viable but pays interest: the colour
matrix gets authored against the old encoding and is reshaped twice. Not recommended.)*

**The colour slice, forewarned.** Author the primitives + the `(accent × theme)` matrix in the **same**
`name → value | reference` shape. DTCG's heavy 2025.10 **`color` object** (`{colorSpace,components,hex}`) is
**not** worth adopting wholesale for an agent-first SoT — borrow the *structure* (named tokens, group `$type`,
`{alias}` refs), keep values terse (hex). The matrix's **cascade emit** (the `#4b/#6b` self-scope) is the one
genuinely-novel, genuinely-Nuri transform — it stays bespoke and spike-gated (resolver-model §10 M2/M5), exactly
as [decision 70](../decisionlog.md#70-the-cascade--one-ts-sot-two-projections--the-9-model--n29) frames it.

---

## 8 · What this does NOT reopen

- **Decision 70's cascade model** stands — this informs the *token representation* inside it, nothing more.
- **Decision 2's reversal** (CSS→TS SoT) stands — DTCG is the *shape* of the TS SoT, not a return to CSS-SoT.
- **The factory / namespace / parity / docs-gen** — genuinely Nuri (§2); untouched.
- **No production code** changed. The only artifact that may land is this doc (a normal PR, if recorded);
  the prototype is throwaway.

## Lineage

[decision 2 / 2.1](../decisionlog.md#2-pipeline-strategy--pattern-c--n1) (Pattern C · the SD deferral — **re-validated**) ·
[63](../decisionlog.md#63-accenttheme-self-scope-cascade-clobber--descendant-combinator-dark-blocks-4b6b--web-css-only--n15) (the bespoke cascade · the part no tool supplies) ·
[70](../decisionlog.md#70-the-cascade--one-ts-sot-two-projections--the-9-model--n29) / [71](../decisionlog.md#71-9--decision-2-reversed-for-the-dimension-layer-executing-decision-70--the-first-real-flip--n31) (the inversion this informs) ·
[`docs/cascade.md`](../docs/cascade.md) (the north-star) ·
[`roadmap/N+31-dimension-cascade.md`](./N+31-dimension-cascade.md) (the slice held pending this) ·
prototype: [`scratch/token-standards/`](../scratch/token-standards/).
