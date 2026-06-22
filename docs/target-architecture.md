# Nuri · Target Architecture · The Catalog-Generation Model

> **What this is.** A **target-state** architecture record — the shape the system tends toward,
> described as if already arrived. It is deliberately **not** a refactoring plan and **not** gated:
> the audit gates (decision 2 / §9) and the P11 sequencing belong to the roadmap *derived* from this
> target, not to the target itself. Read every "is" below as "is, at the target"; the delta against
> today's codebase is the roadmap's subject, not this document's.
>
> **Lineage.** Extends [`north-star.md`](./north-star.md) and [decision 66](../decisionlog.md)'s
> generation thesis, and rests on [decision 64](../decisionlog.md)'s primitive/recipe taxonomy — the
> central boundary of this document *is* that taxonomy, re-read as the line between what is generated
> and what is hand-written.
>
> **Sequencing + resolver refinements** (design session 2026-06-22 · [decision 67](../decisionlog.md)):
> the per-target resolver registry, the runtime/build-time split, the order of work (RN refactor first →
> web primitives → web factory → §9), and the `button.css` "vestige" are the **derived roadmap** this
> doc defers — they live in [`roadmap/factory-rewrite.md`](../roadmap/factory-rewrite.md). Two points
> sharpened there correct this doc where they differ: **the runtime web mirror is a *consumer* of the
> descriptor (decision 2 STANDS); only the build-time CSS resolver is §9** (§5 below is right that the
> two webs are distinct — the refinement names the mirror's resolver as *runtime*, not §9).

---

## 1. The thesis

**The component catalog has a single source of truth in TypeScript, from which each platform is
generated. Beneath the catalog sits a thin, hand-written layer of platform primitives — but even
there, the *vocabulary* is data; only the *mechanism* that applies it to the native runtime is
hand-written.**

This is two claims, and the precision between them is the whole design:

- **The catalog is generated from one source.** Every recipe — Button, IconAvatar, Topbar, and
  everything that is *a composition of primitives via the five namespaces* — exists in exactly one
  place a human edits: a TypeScript descriptor, registered once. From that source, codegen derives
  the artifacts each platform consumes. This is where "single SoT" is a hard rule.
- **The primitives are a thin hand-written layer — but the data/mechanism line cuts through them.**
  A primitive (`nuri-stack`, `nuri-box`, `nuri-pressable`, a scroll wrapper, a bottom-sheet binding)
  is the point where the system touches the native runtime, so it has a hand-written implementation
  per platform. But what it *accepts* — the token vocabulary for `gap`, `padding`, `radius`, the
  scales, the accents, the colours — is **data, single-sourced, generated**, identical to everything
  above it. Only *how it applies that vocabulary to the native runtime* is hand-written.

The shape:

```
        ┌─────────────────────────────────────────────────────┐
        │  VOCABULARY — data · single SoT · generated         │
        │  tokens · scales · accents · colours · the 5 NS      │
        │  value vocabularies                                  │
        │  (add a colour / accent / space step = edit DATA)    │
        └──────────────────────┬──────────────────────────────┘
                               │ consumed by EVERYTHING below
        ┌──────────────────────┴──────────────────────────────┐
        │  THE CATALOG — recipes · single SoT · GENERATED      │
        │                                                      │
        │  descriptor registry { Button, IconAvatar, … }       │
        │  each: anatomy + axes + namespace composition        │
        └──────────────────────┬──────────────────────────────┘
                               │  codegen (on SoT change)
              ┌────────────────┴────────────────┐
              ▼                                  ▼
      ┌───────────────┐                  ┌───────────────┐
      │ RN factory    │                  │ WC mirror     │
      │ surface       │                  │ surface       │
      │ (@nuri/factory│                  │ (nuri-* recipe│
      │  barrel)      │                  │  elements)    │
      └───────┬───────┘                  └───────┬───────┘
              │ composes                         │ composes
              ▼                                  ▼
      ┌───────────────┐                  ┌───────────────┐
      │ RN primitives │                  │ web primitives│
      │ View · Text · │                  │ nuri-stack ·  │
      │ Pressable ·   │                  │ nuri-box ·    │
      │ sheet pkg     │                  │ nuri-pressable│
      │ (native +     │                  │ (hand-written │
      │  thin manual) │                  │  · vocab=data)│
      └───────────────┘                  └───────────────┘
              ▲                                  ▲
              └──── the MECHANISM is hand-written, per platform;
                    the VOCABULARY it applies is data, shared, generated
```

The catalog is one source projected to two platforms. The primitives are a hand-written substrate the
catalog composes — thin, basic, stable, and the *only* hand-written code in the system, confined to
the mechanism of applying a shared data vocabulary to a native runtime.

---

## 2. Why the web exists — a faithful prototyping mirror, not a production platform

The single most clarifying fact about the target, and the one that determines the projection model:
**the web is not a co-equal production platform. It is a fidelity tool for prototyping, whose
fidelity is *toward RN*.**

The web-component catalog (`<nuri-button>`, composed from `<nuri-text>` / `<nuri-pressable>`
primitives) exists so that a view can be **composed here** — in a chat artifact, build-free —
iterated with the operator, and when approved, **translated into RN JSX as a copy-paste** handed to
an agent in Claude Code. The web is the bench; RN is production. This is the north-star's WC→RN
translate path (move 2 · decision 21), and it is not a feature — it is the *reason the web side
exists at all*.

This reframes the entire drift question. The mirror is not a *divergent projection* of the source —
it is **the same catalog anatomy expressed in a parallel runtime, named to mirror RN one-to-one**:

- `el: 'view'` → `<nuri-view>` → `<View>`
- `el: 'text'` → `<nuri-text>` → `<Text>`
- `el: 'pressable'`-ish → `<nuri-pressable>` → `<Pressable>`

Because the primitives are `nuri-*` custom elements (not raw `<span>`/`<div>`), the anatomy is
**preserved with a namespace prefix, not collapsed and re-mapped**. There is no element-mapping
dictionary to maintain — there is a prefix. `<span>` (if used) is an *internal implementation detail*
of `<nuri-text>`, invisible to composition and to translation. So the WC→RN translation is close to a
find-replace: strip the `nuri-` prefix, capitalize, fix up handlers. It is a reliable mechanical
operation **not because a clever generator does a hard translation well, but because there is no hard
translation** — the two trees are the same tree with parallel labels.

This is why decision 65.2 ("web is one node · `el` un-derivable from CSS") **does not apply to the
mirror**. That statement describes a *production, cascade-based* web — the CSS that §9 would generate
as a collapsed, web-native node. The mirror is a different artifact with a different purpose: custom
elements that *imitate RN*, anatomy intact. The two "webs" must not be conflated (see §5).

---

## 3. The SoT — the descriptor registry (the catalog's source)

### 3.1 One registry, one registration per recipe

The catalog's source of truth is a **registry**: a TS structure naming every recipe once, each entry
carrying everything platform-agnostic about it — its anatomy (the part tree + `el` per part), its
typed axes, and its five-namespace composition (`stack · box · typography · palette · interactive`,
in semantic names · the frozen schema · decision 64's "a recipe is a pure composition of curated
primitive namespaces, zero raw style"). A recipe is *registered* by appearing here. There is no
second place — no per-platform re-declaration, no hand-written barrel re-listing the components.

The registry is the natural endpoint of today's `DESCRIPTOR_COMPONENTS` (`{ name, source, kind,
fgPart }`, one row per component) — already a single list, already what the pipeline iterates. At the
target it carries the authored descriptor itself, not a pointer to CSS to derive it from.

### 3.2 "Registered in the SoT" ≠ "a line in the barrel"

The conceptual hinge of the catalog half. The naïve reading of "single source" collapses here, so it
is worth stating sharply.

Registration is a **fact declared in the SoT** — *this recipe exists, with these axes and this
anatomy*. The platform surfaces (the RN export barrel, the WC element set) are **projections of that
fact**, emitted by codegen. They are not sources, so listing a component in them is not a second
declaration — it is the *same* declaration, re-serialized for a platform.

The distinction that makes this coherent: a **value** (an axis vocabulary, an anatomy, a registry
entry) lives in the SoT and is projected freely. A **module symbol** (the `export const Button` an RN
consumer writes `import { Button }` against) is a *compile-time identity in a target platform* — it
cannot be produced by a runtime operation, only **written as source**. So the RN barrel's
`export const Button = …` lines are real and irreducible: there is no runtime construct that
manufactures module symbols from a collection — an array fuses the per-component types into one, a
loop inherits the fused type, a function returns values not symbols, a namespace-object then needs
destructuring that re-names each component by hand. The target's answer is not to *eliminate* the
lines but to **generate them**: codegen writes the textual, per-component `export` declarations —
types intact (the descriptor's typed axes `A` survive because each line names its concrete descriptor
in its own textual position), zero hand-authoring.

The line is the floor; *who writes it* is the lever; at the target, the writer is the generator. This
is why the target has codegen and not a clever runtime: the floor — N distinct materializations, N
module symbols — is not a typing problem dissolved by the right generic, it is what a module *is*.
Codegen writes the form a human would otherwise write by hand, mechanically, from the registry.

---

## 4. The two layers — the data/mechanism line

The defining structure of the target. Decision 64 splits the system into **recipes** (the catalog)
and **primitives** (the substrate). At the target, that line is also the **generated / hand-written**
line — but a second, finer line runs *through* the primitives, and getting both right is the thesis.

### 4.1 The catalog — recipes — fully generated, single SoT

Everything that is *a composition of primitives via the five namespaces* is a recipe, lives in the
registry, and is generated to each platform. This is the growing, changing part of the system, and it
has one source. Adding or changing a recipe is a one-place edit to the registry; codegen reprojects.

### 4.2 The primitives — hand-written substrate — but vocabulary is still data

A primitive is where the catalog meets the native runtime: `nuri-stack` / `nuri-box` /
`nuri-pressable` on web, `View` / `Text` / `Pressable` on RN, plus thin manual bindings for the basic
native pieces (a scroll wrapper; a bottom-sheet that on RN wraps an external package and is *passed
the style*). These have a hand-written implementation per platform — and that is correct, not a
concession: they are the things that *touch the native layer* and cannot be abstracted away without
losing fidelity.

But "hand-written primitive" does **not** mean "outside the SoT", and this is the correction that
keeps the thesis honest. A primitive has two parts with two natures:

- **The vocabulary it accepts — DATA, single SoT, generated.** The values `gap` / `padding` /
  `radius` can take — `xs|sm|md|lg|xl`, the `size` scale, the radii, the accents, the colours — are
  **tokens**, single-sourced from the emit (`SpaceLeaf`, `SizeLeaf`, `RadiusLeaf` are already
  `keyof typeof size` and kin · derived, not authored). Adding a colour, an accent, a space step is a
  change to the **data** — it propagates to catalog *and* primitives alike, because both consume the
  same emitted vocabulary. **Nobody edits primitive code to add a value.**
- **The mechanism that applies it — hand-written, per platform.** What is authored in a primitive is
  only the *translation of the vocabulary to the native runtime*: that `gap` maps to flexbox `gap`,
  that `nuri-box` renders a node carrying those custom properties, that `nuri-pressable` wraps a
  Pressable. The *how-it-applies*, never the *what-values-exist*.

So the data/behaviour split of decision 65 — "behaviour is the factory's, never data" — recurs
*inside* the primitive: **the vocabulary a primitive accepts is data (SoT); the way it realizes that
vocabulary at the native runtime is mechanism (hand-written, per platform).** The only change that
requires touching hand-written code is adding a *new kind of primitive* (a new way of touching the
native layer) or changing *how* a primitive applies a namespace — changing the **mechanism**, never
the **vocabulary**.

### 4.3 The bottom-sheet — the model for every native-wrapping primitive

The clearest case, because it shows the seam exactly. On RN a bottom-sheet/modal is an **external
package**; the system does not generate it — but it is **passed the style**, and that style is derived
from the namespaces. So the contact point with the SoT is the *style payload*, not the component. This
is the general pattern for any primitive wrapping something native or third-party: **the primitive is
hand-written, the style interface into it is derived from the SoT.** It mirrors the `fg`-by-scope seam
the factory already threads by hand (RN has no `currentColor`, so the factory passes the resolved
foreground down) — a platform-specific suture that *consumes* SoT data without *being generated* by
it.

---

## 5. The projections — what is generated, from where

At the target the catalog is projected to **two platforms from the registry**, over a hand-written
primitive layer, with a **third, separate, gated** web artifact that is a different thing entirely.

| Projection | From | Over | Purpose |
|------------|------|------|---------|
| **RN factory surface** | registry | RN primitives (native + thin manual) | production — what the RN team imports |
| **WC mirror surface** | registry | web primitives (`nuri-*`, hand-written) | prototyping — compose here, translate to RN |
| **CSS (production web)** | registry · **§9 · gated** | — (cascade-native, collapsed node) | a *possible future* web-shipping artifact |

The first two are **peers and structurally non-divergent in the catalog**: the same recipe anatomy,
emitted over two parallel primitive sets, named to mirror each other 1:1. The drift that matters —
between the RN catalog and the web mirror — is **structurally absent in the anatomy**, because both
are the same registry reprojected; they can differ only in what a `nuri-*` element does *internally*
versus its RN counterpart (how web vs RN implements a press), and that difference is invisible to
composition and irrelevant to translation.

The third, **CSS-for-production**, is the *other* web — the cascade-collapsed node of decision 65.2,
the "genuinely new piece" of §9. It is a separate axis with its own audit gate, and under the
prototyping-mirror model it may **not be in the near target at all** ("CSS can be built" most likely
means the *mirror's* styles are compiled, while *composition* stays build-free — not that a separate
production-CSS projection exists yet). The target names it to keep it distinct from the mirror, not to
commit to it.

### 5.1 The honest non-drift guarantee

The north-star's "trustworthy by construction" needs one precise correction at the target:

> **The catalog cannot drift between RN and the web mirror, because both are the same source
> reprojected and share anatomy + API 1:1.** What *is* hand-written — the primitive mechanism, per
> platform — can differ between platforms, but that difference is *internal to a primitive* and
> *outside the translation contract*: you translate the composition tree (the part that cannot
> drift), not the primitive's native implementation.

Weaker than "nothing is hand-written, so nothing can drift" in one spot — the primitive mechanisms
*are* hand-written, per platform. But stronger where it counts for the prototyping workflow: the thing
you translate — the composition tree — is *literally the same tree* on both sides. Drift is abolished
in the catalog and contained to the primitive mechanism, which is thin, basic, and stable.

---

## 6. The factory — fixed, agnostic, never a projection

The RN factory is the **engine** the RN projection's output runs on. It is a **fixed library**, and a
central invariant is that it stays fixed: **adding, removing, or changing a recipe never edits the
factory.**

Two agnosticisms, both true of the engine today and both *protected* (not built) by the target:

- **Component-agnostic.** One function (`createNuriComponent`) builds every recipe. No per-component
  branch anywhere in the engine; it walks the descriptor's anatomy and renders each part by its `el`.
  *Which* recipe it is, is data it reads, never code it contains.
- **Axis-agnostic.** The typed named-prop surface is *derived from the descriptor's axes*
  (`NuriComponentProps<A> = { [K in keyof A]?: A[K] } & NuriBaseProps`), so a new axis becomes a new
  prop with zero engine change. The factory never names an axis.

### 6.1 The resolver is agnostic the same way — a namespace registry

The engine's resolver — the part mapping the five namespaces onto the platform — is, at the target,
**dispatch-driven, not branch-driven**: a **registry of namespace resolvers**, one per namespace,
dispatched by namespace key. Adding a sixth namespace is *registering a resolver*, not editing a
`switch` in the resolver core. The factory does not know how the namespaces are decomposed into
resolvers — it hands the resolver a typed `NS` and receives a resolved node.

The exhaustiveness guarantee is preserved by *typing* the registry as a total map over the namespace
keys (`{ [K in keyof NS]: Resolver }`), so a namespace added to the schema without a registered
resolver is a **compile error**, not a silent gap. Agnosticism does not cost the safety property — the
type system enforces one resolver per declared namespace.

*(Refined — [`roadmap/factory-rewrite.md`](../roadmap/factory-rewrite.md): the registry is **per
target** — `{ rn, web, css } × namespace`. The agnostic namespaces (box/stack/typography) delegate to
ONE shared mapping table; only palette/interactive are bespoke per target. RN+web resolvers are
runtime, the CSS resolver is build-time [§9].)*

### 6.2 The factory/projection boundary, stated exactly

The asymmetry the whole model rests on:

> **Codegen produces the export *surface*. The engine is a *library*. The surface calls the library;
> the library never enumerates the surface.**

- The **surface** (the generated barrel) names the recipes — N `export const` lines, one per registry
  entry, written by codegen. It changes when the registry changes.
- The **engine** (`createNuriComponent`, the resolver, the theme runtime) is hand-maintained library
  code that knows nothing about *which* recipes exist. It changes only when the *mechanism* changes —
  a new namespace, a new `el` kind, a new interaction channel — never when a recipe is added.

So `@nuri/factory` contains **both kinds of file**: the fixed engine (authored, reviewed like code)
and the generated surface (emitted, reviewed like build output — ideally regenerated and trusted, the
way the descriptors themselves are).

---

## 7. The execution model — codegen as the pipeline's spine

At the target, **codegen runs on every SoT change** and is the only thing that touches the platform
surfaces.

```
  authored (a human edits)              generated (codegen emits)
  ────────────────────────              ─────────────────────────
  the token/vocabulary source    ──►    (flows into all of the below)
  the descriptor registry        ──►    RN factory surface  (@nuri/factory barrel)
  the engine library             ──►    WC mirror surface   (nuri-* recipe elements)
  the primitive implementations          (CSS-for-production · §9 · gated · maybe-later)
  (per platform · mechanism only)

  authored-but-not-codegen-input:
    · the engine library (the fixed RN substrate the surface imports)
    · the primitive mechanism (the thin per-platform native bindings)
  authored-and-IS-codegen-input:
    · the descriptor registry (the catalog source)
    · the token/vocabulary source (flows to catalog AND primitives)
```

- **Codegen is idempotent and deterministic** — same registry in, byte-identical surfaces out — so a
  generated surface is safe to treat as build output (committed or not is a roadmap choice; the target
  only requires it is *generated*, never authored). Deterministic ordering (append-stable) keeps diffs
  from touching unrelated `export` lines on every regen.
- A recipe change is a **one-place edit**: change the registry, run codegen, both platform surfaces
  update together. A vocabulary change (a colour, an accent) is a one-place edit to the **token
  source**, and propagates to catalog *and* primitives without touching either as code. There is no
  parallel artifact to keep in sync by hand — only projections.

---

## 8. Tradeoffs and known limits

A target document is stronger for naming its costs; these are the ones the roadmap should expect, not
discover mid-way.

### 8.1 Runtime cost — build-time indirection is free; the one runtime cost is deferred by design

The indirections the target *introduces* — codegen, the registry, the resolver dispatch map — are
**build-time**; runtime is unaffected. The generated barrel produces the identical `export const`
lines you would hand-write; the resolver registry is a map-dispatch where a `switch` was, the same
cost class in V8. So "the indirections add runtime weight" is **false** — they do not.

There is exactly one runtime cost in the engine, and the target's position on it is **deliberately to
not address it yet**, because the target product does not generate it at a measurable scale. The cost:
the factory's `Pressable` resolves the pressed-state style on every press — a `pressed` render-prop
calls `flattenPart` per state change, and `flattenPart` re-runs the resolution pipeline (merge
namespaces → resolve → palette-against-theme) with no memoization. This is intrinsically runtime
(pressed state depends on an event, so it cannot be pre-resolved at build time), and it is real — but
its magnitude is a function of *how many interactive elements are pressed how often*, and that is a
product question, not an architecture one. The pathological case is a dense grid of interactive
elements pressed in rapid succession (e.g. during a scroll); a wallet's screens — a transaction list
tapped one row at a time to navigate, an amount keypad, a method sheet, a recipient form — are the
opposite: few interactive elements, discrete and infrequent presses. At that scale the re-resolution
is never measurable.

The target therefore commits to a **non-decision**: do not memoize, do not materialize, do not change
the engine for this. If a future surface emerges that *does* press densely (an animated interactive
grid), the mitigation is **local and deferred** — memoize `flattenPart` per (selection × state) cell,
which is finite and enumerable, applied at that surface, requiring nothing decided here today. Naming
the cost and declining to pre-optimize it is the same discipline that keeps interaction *behaviour*
out of the descriptor (decision 65): a cost you have not profiled, on a product that does not generate
it, is not a cost to engineer against. (Note for whoever profiles it later: `toUnistylesRecipe` is
**tooling/parity only**, not in the render path — `flattenPart` is the sole hot path, so the lever, if
ever needed, is memoizing `flattenPart`, not unifying the two readers or materializing recipes.)

> **A path considered and deliberately not taken.** One could eliminate this cost by emitting, at
> build time, a full per-recipe *recipe* — pre-merged axis cells (removing the runtime merge) plus
> `compoundVariants` for the pressed state (derived from the `interactive` opt-in, as
> `toUnistylesRecipe` already does), consumable both as a JS lookup table and natively by an opt-in
> styling runtime (Unistyles). It is an elegant move and it would dissolve the JS-vs-runtime split
> into one emitted form. But it **re-reads decision 65** (interaction behaviour moves from
> runtime-derived to derived-then-emitted), it **grows combinatorially** with interactive axes, and it
> **costs the parity oracle** (`toUnistylesRecipe` cannot be both the render path and its own
> independent check). At the target product's scale, paying those three costs to remove a cost the
> product does not have is a bad trade. The form is recorded here so a future system that *does* have
> the cost can reach for it — as a decision taken then, deliberately, not as a default assumed now.

### 8.2 The primitive mechanism is hand-written, per platform — drift is contained, not abolished

The honest statement of §5.1, repeated as a limit. The catalog cannot drift; the **primitive
mechanism can**, between platforms, because it is authored per platform. A `nuri-pressable`'s web
press behaviour and a `Pressable`'s RN press behaviour are independent hand-written implementations.
This is contained (the primitives are few, basic, stable, and the divergence is *internal* and
*outside the translation contract*) but it is real: "trustworthy by construction" holds for the
composition tree, not for the primitive internals. The roadmap should treat the primitive layer as
hand-maintained code with the testing that implies, even though the catalog above it is generated.

### 8.3 Debugging across generation — provenance is unsolved

A non-runtime cost, real on any generated system. When an RN component renders wrong, the engineer
reads a *generated* `export const` in `@nuri/factory`, and must trace back to the registry, then to
the generator, to tell whether it is the data or the projection. §6.2's "ideally not reviewed —
regenerated and trusted" is good for trust and hostile to debugging: an artifact nobody reads is one
nobody knows how to read when it breaks. The target does not specify a **sourcemap / provenance**
layer linking a projected artifact back to the registry row that produced it. On a two-projection
system this becomes a dominant maintenance cost as the catalog grows; the roadmap should treat
provenance as a first-class concern, not an afterthought.

### 8.4 The schema as a narrow waist under multi-consumer pressure

The registry/schema is read by multiple generators (RN, WC, and eventually §9's CSS). Every consumer
constrains the schema's shape, and the schema is `FROZEN · Guard F` precisely to resist this. Keeping
the **primitives out of the registry** is what protects the waist: scroll-view and bottom-sheet shape
pressure is absorbed by the *primitive* layer, not the schema, so the five namespaces stay clean. And
because the **vocabulary lives entirely in the emitted tokens**, adding a colour or accent does *not*
pressure the schema at all — it is a data change. The waist is stressed only by new *mechanisms* (a
sixth namespace, a new `el` kind), which are rare by design. The limit to name: the target does not
say **who owns schema evolution** when a future projection genuinely needs a shape the disjoint
five-namespace model does not provide. That governance question is deferred, and the roadmap inherits
it.

---

## 9. What the target deliberately does **not** decide

Out of scope on purpose — roadmap, not architecture:

- **Authoring direction today.** The target assumes the descriptor is authored and platforms are
  generated. Whether the codebase has *arrived* there — and the §9 audit gating CSS-from-descriptor —
  is the roadmap's subject. The descriptor is *already* the machine-spec regardless of authoring
  direction, so the RN barrel and the WC mirror do **not** wait for §9; only production-CSS does.
- **Sequencing.** Which projection lands first, whether barrel generation precedes any CSS inversion
  (it can), how the arcs order.
- **Packaging / versioning / external consumption** (the only-git wall, the subtree mirror) —
  orthogonal to the projection model. *(Update: the workspace **layout** is now resolved —
  [`package-architecture.md`](./package-architecture.md) · [decision 68](../decisionlog.md): six packages
  on two axes. Versioning / external consumption stays deferred.)*
- **Where codegen physically runs** (which package owns each generator, build wiring). *(Still open · a
  `@nuri/codegen` package vs per-library build scripts — see [`package-architecture.md`](./package-architecture.md) §7.)*

The target commits to exactly this: **one authored TS catalog source; vocabulary as data everywhere;
a thin hand-written primitive layer whose mechanism (not vocabulary) is per-platform; the factory a
fixed agnostic engine; each platform surface a generated projection.** Everything about *getting
there* is the next document.

---

## 10. One-paragraph summary

The component catalog has a single TypeScript source — a descriptor registry where each recipe is
registered once as anatomy + axes + a five-namespace composition. Codegen projects that catalog, on
every change, into two platform surfaces: the RN factory barrel (production) and the web-component
mirror (`nuri-*` elements, a prototyping bench whose anatomy mirrors RN 1:1 so a composed view
translates to RN JSX as a near find-replace). Beneath the catalog is a thin hand-written primitive
layer — `nuri-stack` / `nuri-box` / `nuri-pressable`, native bindings, a style-passed bottom-sheet —
where only the *mechanism* of applying values to the native runtime is authored; the *vocabulary*
(tokens, scales, accents, colours) is data, single-sourced, shared with the catalog, so adding a
colour or accent edits data, never code. The factory is a fixed engine, component- and axis-agnostic
by construction (derived prop surface + typed resolver registry); codegen produces the *surface* it
exposes, never the engine. The barrel's `export` lines are irreducible — a module symbol cannot be
manufactured at runtime — so the target does not eliminate them; it generates them. Drift is abolished
in the catalog (one source, reprojected) and contained to the primitive mechanism (hand-written, thin,
outside the translation contract). Production-CSS (§9) is a separate, gated, maybe-later axis — the
*other* web — and is kept distinct from the mirror.
