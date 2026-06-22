# Nuri · Package Architecture · the workspace layout

> **What this is.** The npm-workspace layout the system tends toward — the *packaging*
> [`target-architecture.md`](./target-architecture.md) deliberately deferred (§9.4: *"where codegen
> physically runs … deferred"* · *"packaging / versioning / external consumption … orthogonal to the
> projection model"*). A **target-state** record: read every "is" as "is, at the target." The delta
> against today + the gating live in **§6 (Migration)** and the roadmap derived from it.
>
> **Lineage.** [`target-architecture.md`](./target-architecture.md) (the projection model · the
> data/mechanism line · the 1/2/3 roles) · [decision 68](../decisionlog.md) (the lock for this doc) ·
> [decision 67](../decisionlog.md) (the factory-rewrite arc) · [decision 66](../decisionlog.md) (the
> generation thesis · build-free composition) · [decision 57.2](../decisionlog.md) (the playground is a
> consumer tool · may externalize) · [decision 2](../decisionlog.md) (CSS is SoT · STANDS until §9) ·
> the 2026-06-22 design session.
>
> **Gating (read before acting).** The `@nuri/spec = TS SoT` purification is **coupled to §9** — the
> CSS→TS inversion that **reverses decision 2** (audit-gated · NOT decided). The platform/consumer
> extractions are **§9-independent** and can land first. See §6.

---

## 1. Two organizing axes

Today `@nuri/spec` is a grab-bag (web CSS + the Node pipeline + the frozen `build/` + the docs harness +
the playground). At the target the packages fall out along **two orthogonal axes** — making both visible
is the point:

- **Role** — *what a package is in the catalog → platform pipeline*:
  - **SoT** — the single authored source (the descriptor registry + the token vocabulary).
  - **library** — a platform *projection* of the SoT (the factory engine + the primitives + the
    generated surface).
  - **consumer** — a *surface* built on a library (a docs site · a composing bench · an app).
- **Publishing / lifecycle** — *how a package is built and shipped*:
  - **TS source** (codegen input) · **build-free web** (custom elements + CSS · zero build ·
    *what Nuri IS #3*) · **SSG site** (markdown → static · just-the-docs/Jekyll → Pages) ·
    **RN-native** (Metro).

The **publishing axis is load-bearing**: it is what keeps **build-free composition** (the prototyping
property) from being entangled with the docs' SSG toolchain. They *must* be different packages, or
build-free gets a Jekyll build bolted to it.

---

## 2. The package graph

```
                        @nuri/spec            ─ SoT · TS source · (no deps)
                       ╱           ╲
              @nuri/prototype     @nuri/rn     ─ the two LIBRARIES (projections of the SoT)
               build-free web      RN-native
              ╱            ╲           ╲
       @nuri/doc   @nuri/playground   @nuri/expo-demo   ─ the CONSUMERS (surfaces over a library)
          SSG        build-free          RN app
```

`prototype → spec` · `rn → spec` · `doc → prototype` · `playground → prototype` · `expo-demo → rn`.

A clean DAG: **one SoT root**, **two library projections**, **three consumer surfaces**. **No consumer
depends on another consumer** — in particular the `doc → playground` edge we considered is *avoided*
because `nuri-demo` lives in the shared library (`prototype`), not in a leaf (§4.2).

---

## 3. The packages

| package | role · publishing | deps | contains (target) |
|---|---|---|---|
| **`@nuri/spec`** | SoT · TS source | — | the descriptor **registry** (recipes in TS) · the **token/vocabulary** (values · TS) · the frozen **schema** (Guard F) |
| **`@nuri/prototype`** *(was `@nuri/web`)* | library · **build-free web** | spec | the **web factory** (`buildComponent`) · the **web primitives** (`nuri-box/stack/pressable/typography/view`) · the **CSS** (namespace + recipe + the hand-written `reset`/boilerplate) · **`nuri-demo`** (the showcase widget) |
| **`@nuri/rn`** *(was `@nuri/factory`)* | library · **RN-native** | spec | the **engine** (`createNuriComponent` · `resolve` · `resolve-map` · theme) · the generated **ergonomic barrel** |
| **`@nuri/doc`** | consumer · **SSG** | prototype | the **docs website** — the just-the-docs shell · the **generated** markdown pages · nav · principles |
| **`@nuri/playground`** | consumer · **build-free** | prototype | the **composing bench** — `my-vault` · the playground shell · the compositions |
| **`@nuri/expo-demo`** | consumer · **RN app** | rn | the example Expo screen (R1.5 · the RN team's reference) |

### 3.1 `@nuri/spec` — the SoT (TS)

```
@nuri/spec/
├── catalog/          the descriptor registry — recipes in TS (anatomy + axes + 5-NS composition)
│   ├── button.ts  icon-avatar.ts  topbar.ts
│   └── index.ts      the registry (the natural endpoint of today's DESCRIPTOR_COMPONENTS)
├── vocabulary/       the token / scale / accent VALUES (TS data · single SoT · → catalog AND primitives)
└── schema.ts         the frozen 5-namespace schema (the waist · Guard F)
```
*Today:* the SoT is the **CSS** (decision 2); the descriptor is **derived** from it (`build/descriptors/`).
So `spec = TS SoT` is the **§9 destination** — see §6. Until then, spec holds the schema + the *emitted*
contract.

### 3.2 `@nuri/prototype` — the build-free web library

```
@nuri/prototype/
├── factory/          the web factory — buildComponent (the N+27 lib/runtime/factory.js)
├── primitives/       the web primitives — nuri-{box,stack,pressable,typography,view} (.js · the mechanism)
├── styles/           the CSS — namespace (box/stack/palette/interactive) + recipe (button…) + type utilities
│   └── reset.css …   the hand-written host normalization + boilerplate (the §9 boundary · N+27)
└── demo/             nuri-demo — the showcase widget (toolbar · live preview · code view · device frame)
```
*Build-free.* Loaded directly in the browser — no build step, ever. Consumed by `doc` (embedded in the
SSG pages) and `playground` (composed live).

### 3.3 `@nuri/rn` — the production RN library

```
@nuri/rn/  (= today's @nuri/factory · rename)
├── engine/           createNuriComponent · resolve · resolve-map · theme  (the fixed agnostic engine)
└── (generated)       the ergonomic 1:1 barrel (export const Button … · codegen-written · target §6.2)
```
*RN-native (Metro).* The production platform. Renamed `factory → rn` because "factory" is now a concept
in *both* libraries (prototype has its own); the per-platform name is clearer.

### 3.4 `@nuri/doc` — the SSG documentation site

```
@nuri/doc/
├── (the just-the-docs shell)     nav · layout · principles  (today: website/ at the repo root)
├── pages/                        the component reference pages  (today: spec/pages/*)
├── generated/                    the doc-gen markdown  (today: spec/build/docs/*.md)
└── harness/                      shell.js · control · state · tokens  (today: spec/lib/docs/ minus demo/)
```
*SSG (just-the-docs/Jekyll → Pages · `pages.yml`).* Embeds `prototype`'s build-free components at
runtime — its build pulls `prototype`'s assets instead of the hand-maintained copies in
`website/assets/` (a duplication this split removes).

### 3.5 `@nuri/playground` — the build-free composing bench

```
@nuri/playground/
├── shell.js          the bench harness   (today: spec/lib/playground/)
└── compositions/     my-vault · composition-prototype …   (today: spec/pages/playground/*)
```
*Build-free.* The compose-here-translate-to-RN bench (decision 57.2 · north-star move 2). Separated from
`prototype` by **role** (a consumer surface, not the library) so it can externalize independently.

### 3.6 `@nuri/expo-demo` — the RN example app

Unchanged but for its dependency: `→ @nuri/rn` (was `@nuri/factory`).

---

## 4. The key calls

### 4.1 `web → prototype` (the rename)

The web is **not a co-equal production platform — it is a fidelity tool for prototyping** (target §2 ·
§5: the WC mirror surface = "prototyping"). The name `web` hides that; `prototype` states it, and makes
the **`prototype` ↔ `rn`** contrast (bench ↔ production) the headline. `rn` keeps its name — it already
says what it is, and the asymmetry (purpose vs platform) usefully spotlights the distinction.

### 4.2 `nuri-demo` lives in `prototype` (the shared library, not a leaf)

`nuri-demo` is the showcase widget used by **both** `doc` (the `## Example` slots) **and** `playground`
(the `device`-frame mode · decision 57). Putting it in the shared **library** means both consumers depend
on the library — **not on each other** (no `doc → playground` edge). It is the one thing in `prototype`
without an RN counterpart — kept clearly as **tooling**, never a catalog component. The move also removes
the current hand-maintained copy in `website/assets/`.

### 4.3 `doc` (SSG) ⟂ `prototype` (build-free) — the publishing boundary

The strongest split: a **deployment-lifecycle** boundary. `doc` has a build (Jekyll) and a deploy
(Pages); `prototype`/`playground` are loaded in place with no build. Keeping them apart **defends the
build-free invariant** — merging would bolt an SSG toolchain onto build-free composition.

### 4.4 `@nuri/spec` = TS SoT — the §9 coupling

The target graph (`prototype → spec`, with `spec` the source) is the **post-§9** graph. Today (decision
2) the data flows the *other* way: the CSS is the SoT and the descriptor is derived from it. So a literal
`spec = TS SoT` **is** the §9 inversion (author descriptors + tokens in TS · generate the CSS). It is
audit-gated and **NOT decided** — see §6.

---

## 5. Where the target's 1/2/3 roles live

The roles from [`target-architecture.md`](./target-architecture.md) §4/§7 now have homes (they used to
cut across packages):

| role (target §7) | nature | package(s) |
|---|---|---|
| **SoT** — descriptor registry + vocabulary | authored TS · **codegen input** | `@nuri/spec` |
| **mechanism** — the engine + the primitives | authored · hand-written · **not** codegen input | `@nuri/rn` (engine) · `@nuri/prototype` (web primitives + reset/boilerplate) |
| **generated** — the platform surfaces + CSS | codegen **output** | the generated parts of `@nuri/rn` (barrel) + `@nuri/prototype` (CSS · §9) |

---

## 6. Migration & gating (the delta to today)

> The **session-level sequence + sizing** live in [`roadmap/package-migration.md`](../roadmap/package-migration.md)
> (the path to the target · ~9–12 sessions · the gemello of `factory-rewrite.md`).

Two halves with **different gates**:

- **§9-independent — safe under decision 2 · lands first.** Rename `factory → rn`; carve `@nuri/prototype`
  out of today's `spec/lib` (the web components + runtime + demo); extract `@nuri/doc` (consolidate
  `website/` + `spec/pages/` + `spec/lib/docs/`); extract `@nuri/playground`. The CSS stays the SoT (now
  in `prototype`) and the descriptor stays derived from it — `spec` holds the schema + the emitted
  contract. This buys the symmetry + the clean consumer split **without touching the dec-2 gate**.
- **§9-coupled — gated · NOT decided.** Purify `@nuri/spec` to a **TS** SoT (author descriptors + tokens
  in TS) and **generate** the CSS into `prototype`. This is the dec-2/§9 inversion; it clears only after
  the [`resolver-model.md`](./resolver-model.md) §9/§10 audit.

> **Note · the N+27 design⟂plumbing workstream is subsumed here.** "Separate the hand-written
> boilerplate from the generated namespace CSS" is now a **within-`prototype`** concern, resolved when §9
> generates the namespace CSS from the SoT (the `reset.css` header is today's boundary marker). It is no
> longer a standalone workstream.

---

## 7. What this does **not** decide (deferred · per target §9.3/§9.4)

- **Where codegen physically runs** — a `@nuri/codegen` package vs **per-library build scripts** (each
  library generates its own surface from `spec`). Open; the current `pipeline/` is the proto-codegen.
- **Whether `spec` emits the contract or stays pure source** — does `spec` ship the emitted
  descriptors/tokens that `prototype`/`rn` import, or does a codegen step produce them into each library?
- **Versioning / external consumption** (the only-git wall · the subtree mirror).
- **The within-`prototype` design⟂plumbing file split** — its own pass (§6 note).

---

## 8. One-paragraph summary

The repo is six npm workspaces on two axes — **role** (SoT · library · consumer) × **publishing** (TS ·
build-free · SSG · RN-native). `@nuri/spec` is the single TypeScript SoT (the descriptor registry + the
token vocabulary). It is projected to two libraries — `@nuri/prototype` (build-free web · the
prototyping mirror · holds the web factory, primitives, CSS, and the `nuri-demo` showcase) and
`@nuri/rn` (the production RN engine + barrel). Three consumers sit on top: `@nuri/doc` (the SSG docs
site), `@nuri/playground` (the build-free composing bench), and `@nuri/expo-demo` (the RN example app).
No consumer depends on another — `nuri-demo` lives in the shared `prototype` library, so `doc` and
`playground` both depend on the library, not each other. The publishing axis is load-bearing: it keeps
build-free composition out of the docs' SSG toolchain. The platform/consumer extractions are
§9-independent and land first; the `spec = TS SoT` purification (authoring in TS, generating the CSS) is
the §9 inversion of decision 2 — gated, not decided.
