# The projection model — spec is data, projections carry resolution

**Status**: DECIDED (operator-ratified · this is the concrete architecture; [`cascade.md`](./cascade.md)
is the north-star "one source, two projections" — this is its concrete, gated form). The decision
record is **[decisionlog.md §80](../decisionlog.md)**. Concretizes `cascade.md`; **supersedes** the
scattered older model docs (`resolver-model.md`, `emit-model.md`, `composition-model.md` — already
folded into decisions 64/65/70; to be collapsed in the Phase-5 doc purge).

> Read every "is" as the **arrived target**. The delta from today's tree is the slice plan at the end.

---

## 1. The one rule

> **Data lives once, in `@nuri/spec`. Logic and generated output live in the projection that runs them.**

`@nuri/spec` is **pure data** — the source of truth, nothing else: no codegen, no dependencies, no
generated artifacts, no logic. Every consumer is a **projection** that resolves spec's data into the
form it needs, and owns that resolution.

This is what makes the structure finishable: there is exactly one place to look for truth, and the
"mess" (commingled source/generated, fossil folder names) was the symptom of breaking this rule.

## 2. `@nuri/spec` — data only

```
spec/
  tokens/        dimensions · colours · typography           (the token SoTs)
  axes/          resolve-map · palette-surface ·
                 interactive-effects · typography-axis ·
                 property-spelling                           (the axis definition tables)
  components/    composition-button · icon-avatar · topbar ·
                 schema                                       (the descriptors — source only)
  icons/         *.svg                                        (the icon SoT)
```

- **No `build/`.** The resolved contract does not live here (it's a projection — see §4).
- **No `pipeline/` codegen.** The generator is root `scripts/` (build tooling · decision 79).
- **No `.js` twins, no generated CSS, no generated registries.** Those are projection output.
- **No logic.** The resolver is runtime logic → it lives in the RN projection (§4).

`tokens/`, `axes/`, `components/` are **data tables**; `icons/` is **data files**. That is the whole package.

## 3. Colour — the only context-variant token, modelled cleanly

Colour is the single axis whose value depends on consumer context (accent and mode). It is authored as:

- **Primitives — Radix-style ramps**, one per accent, each step a `{ light, dark }` pair, generated
  from a brand colour. **The primitives never leave the SoT** — they are the authoring substrate;
  no consumer ever ships them. A new accent = a new ramp + one accent object. Richer roles later
  (accent border, focus, muted) = reference another ramp step — no new data shape.
- **Semantic — accent-major.** Each accent is **one object**, every role a `ref` into its ramp,
  **flat where theme-invariant, `{light,dark}` where it adapts**:

  ```ts
  lilac: {
    solid: 'lilac.9',                          // flat — brand colour, mode-invariant
    fg:    { light: 'lilac.12', dark: 'lilac.12-dark' },  // adapts to mode
    …
  }
  ```

  Adding an accent = adding one object. (This replaces the role-major `accent[role][name]` matrix
  with names baked into the type — the shape that made accents scatter across 6 entries.)
- **Chrome — role-major, theme-only** (`chrome[role] = {light,dark}`) — chrome never varies by accent.

### Layered substitution, not a cross-product

The relationship between accent and mode is **not two orthogonal axes you multiply** — it is a
**layered substitution**, and the cross-product is precisely what this model eliminates:

- **accent is upstream** — selecting an accent *substitutes the accent-portion of the palette*
  (it fills the accent roles; chrome is untouched, since chrome never varies by accent).
- **mode is downstream** — selecting light/dark then *resolves the variant* across the whole
  composed palette: chrome's `{light,dark}` and the accent's mode-adapting roles.

So resolution is a **pipeline** (accent fills the slots → mode resolves them), never a cartesian
enumeration of `(accent × mode)`. **chrome is stored once** (`{light,dark}` per role); **each accent
is stored once** (the accent-major object, flat\|`{light,dark}`); the active palette is *composed* at
selection time. There is no `(accent × theme)` table — materializing it would duplicate chrome inside
every accent, which is the explosion the accent-major reshape (and this whole model) exists to avoid.

> ⚠ The old `build/tokens.ts` **is** that materialized cross-product ("per-(accent × theme) resolved
> literals" — chrome duplicated inside every accent). It is exactly what Slice 3 kills; the new
> resolved-semantic (§4) is small and structurally identical to the `colours.ts` SoT.

The web realizes the same pipeline via the cascade (`[data-accent]` selects the accent layer,
`[data-theme]` selects the mode layer · independent selectors, the browser composes); RN realizes it
via the provider (§6), which holds chrome and accent as **two separate layers** and composes them on
`(accent, mode)` selection — no persisted cross-product.

## 4. The two projections

Each projection is the SoT **resolved into the form that target consumes**, generated by the build,
**living in the projection package, never in spec**.

| Projection | Owner | Form | How |
|---|---|---|---|
| **Web** | `@nuri/prototype` | CSS (namespace CSS · token CSS · descriptor `.js` twins · icon registry) | refs → `var()` cascade; the **browser** resolves at runtime |
| **RN** | `@nuri/rn` | the **resolved semantic layer** — two composable layers (chrome `{light,dark}` + accent-major objects, refs→hex), mirroring the `colours.ts` SoT shape | refs flattened to hex at **build**; the **provider** composes on `(accent, mode)` at runtime |

Key consequences:

- **Primitives are never shipped.** The RN projection carries only the *resolved semantic* values
  (chrome + accent as hex), as **two layers, not a cross-product** (§3): chrome `{light,dark}` stored
  once + one object per accent. The ramps stay in spec. RN does **not** ship the ref graph or a heavy
  resolver — the `ref→hex` flatten happens at build; runtime does only **selection + composition**
  (`chrome[mode]` ⊕ `accent[name][role]` resolved at `mode`).
- **No TS→CSS→TS round-trip.** The RN resolved-semantic is flattened **directly from the TS SoT**,
  not by re-parsing generated CSS. (The old `build/tokens.ts`, generated by walking the CSS cascade,
  **dies**.)
- **The descriptor `.ts` copies die.** rn imports the **source** descriptor `.ts` directly; the build
  emits **only** the `.js` runtime twins, into prototype (their sole consumer).

## 5. Build-time vs runtime — the principle, per axis

> **Resolve at build everything resolvable; runtime does only the irreducibly context-variant selection.**

| Axis | Context-variant? | Resolution |
|---|---|---|
| **palette / colour** | yes (accent ⊕ mode) | `ref→hex` at build · runtime **composes** the chrome + accent layers on `(accent, mode)` (§3 · no `(accent × theme)` slice persisted) |
| **box / stack** | no | 100% build-time → static values |
| **typography** | no | 100% build-time → static values |
| **interactive** | no | 100% build-time → static values |

So the **provider is essentially colour-only** — the other four axes are static `StyleSheet` values
with nothing to resolve at runtime.

**Latent runtime dimensions (by design, not now):** `density` (would make dimensions variant) and OS
`fontScale` / Dynamic Type (would make typography variant). When they land they slot into the same
model — the provider gains an input, the build still resolves everything else. The architecture
extends without redesign; that is the proof it's the right shape.

## 6. The opt-in RN provider — the contract

`@nuri/rn` is **the only production code** in the system — the web projection is the prototyping +
doc surface, RN is what ships. So the provider is a **contract**, designed for substitution, not a
single implementation:

- **The contract is the API**, not the backend. Consumers depend on `provider(accent, mode) → resolved
  palette` (chrome ⊕ accent, composed per §3). How that selection is implemented is swappable.
- **Default — static, zero-runtime.** Import a single composed slice statically. Nothing to resolve at
  runtime, max performance. For consumers shipping one theme/accent.
- **Opt-in — runtime switching.** A drop-in implementation of the same contract, for consumers that
  switch `(accent, mode)` at runtime. **Unistyles** is the intended backing (cheap selection, no
  re-render) — but it lives *behind* the contract: the architecture is Unistyles-agnostic and the
  contract must never leak it, so the backend can change without touching consumers.

Build-time resolution is what *enables* this opt-in: a static consumer pays nothing because there is
nothing left to resolve, while the runtime consumer pays only selection + composition.

**accent is a runtime-capable selection axis, not a baked constant.** Today accent switching is
effectively static (resolve once; Unistyles could even resolve it at build), but the contract must
**not preclude runtime accent switching**. The latent case is *semantic accents* — e.g. a `crypto`
vs `fiat` palette toggled live — which would make accent a true runtime axis exactly like mode. The
layered model (§3) already accommodates this: accent is a selection *input*, never compiled away.

> The theme system itself is **slated for review** — this contract is the stable surface Slice 3
> lands on; it must leave the theme model *reviewable*, not freeze it.

## 7. What dies

- `@nuri/spec/build/` — the resolved contract leaves spec (RN's resolved-semantic → rn; web → prototype).
- the **TS→CSS→TS round-trip** — RN's resolved-semantic is flattened from the TS SoT directly.
- `build/descriptors/*.ts` — the verbatim `.ts` copies; rn imports source, build emits only `.js` twins.
- the fossil names (`pipeline/`, `build/`) and orphans (`lib/components/scope/` tombstone, stray
  `*.html` checks).

## 8. Slice plan (the execution spine)

Behaviour-preserving throughout — resolved values don't change; only shape, location, and where
resolution happens. Each slice is gated (byte-equivalent resolved values · the 5 CI gates).

1. **Accent reshape** — `colours.ts` role-major → accent-major (refs into ramps · flat|`{light,dark}`)
   + the RN selection provider. Generated CSS byte-identical. *(do first — before growing it)*
2. **Add the 1–2 new accents** — into the clean shape (one object + one ramp each).
3. **Spec → data-only** — kill `build/` (RN resolved-semantic → `@nuri/rn`, flattened from TS;
   web CSS + descriptor `.js` + icon registry → `@nuri/prototype`); drop descriptor `.ts` copies;
   move the resolver to rn; rename to `tokens/ axes/ components/ icons/`; delete the orphans.
   *(sub-slice: the descriptor `.ts`-copy drop is the smallest standalone first step)*
4. **── hard "infra done" line ──** → Phase 6: the catalog (the actual product).

## 9. Supersedes / relations

- **Parent:** [`cascade.md`](./cascade.md) (the north-star "one source, two projections").
- **Concretizes & gates:** [`target-architecture.md`](./target-architecture.md) (the catalog-generation target).
- **Supersedes** (fold into the Phase-5 purge): `resolver-model.md`, `emit-model.md`,
  `composition-model.md` (their decisions live in [§64/§65/§70](../decisionlog.md)).
- **Decision record:** [decisionlog.md §80](../decisionlog.md).
