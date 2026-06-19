# Nuri · North Star

> **What this is.** The long-term direction for Nuri, captured 2026-06-19. The **monorepo
> structure + the intra-repo gate are LOCKED** ([decision 65.7](../decisionlog.md)); everything
> else here is **direction, not a commitment** — each piece is sequenced as its own arc, built
> when a consumer needs it ([P11](../pages/principles.html#p11-parsimony)). This file informs
> sequencing; it does not pre-authorize work.

Nuri matures from a single-repo agent-spec into a **versioned, multi-package design system** that
ships a **frozen contract** + a **certified RN factory** to a real RN team, only-git.

## The shape — one npm-workspaces monorepo, a DAG rooted at `spec`

```
spec        SoT · lib/ (web CSS + custom-elements · CSS is SoT · dec 2) · pipeline/ · build/ (frozen · Guard F)
 ├─ factory      the bare certified RN engine: theme runtime + createNuriComponent + ergonomic 1:1 components
 │   └─ expo-demo    the example app the RN team copies (consumes factory)
 ├─ website      docs generated MECHANICALLY from the data (token/API/anatomy) · stories via <nuri-demo>
 └─ playground   build-free prototyping · at HEAD = the next (untagged) version
```

- **The theme provider lives in `factory`** (the RN token-resolution runtime the factory requires).
  The web's parallel "theme runtime" is the CSS cascade + `data-*` scoping, which lives in `spec`.
- **The RN team imports only `@nuri/factory`** (`NuriThemeProvider` · the ergonomic components ·
  `createNuriComponent`); `@nuri/spec` arrives transitively. `@nuri/factory@vN` is render-gated
  against `@nuri/spec@vN` — the certified factory pulled as one thing.

## The four moves (direction · each its own arc)

1. **`build/` = the versioned spec package** for the RN consumer + the frozen factory. *(The
   versioning machinery lands at its first real bump — Digital-cash · 65.6 · P11.)*
2. **The web-components = their own package** (a dist · same versioning) with the **playground in
   its own workspace** — in sync with RN *or* prototyping ahead at HEAD.
3. **The dense hand-written docs site dies → generated from the data.** The staleness comes from
   docs being **hand-written**, not from lacking a build: the fix is **read the data**, not add a
   build. The descriptor already carries anatomy + axes/API + token mappings; data-driven widgets
   (`<nuri-api>` / `<nuri-anatomy>`, the pattern of `lib/docs/tokens.js`) render it **build-free**.
   **Zero-build survives** — it migrates from "the whole site" to **the playground + the docs
   render**. An SSG is **optional** (pre-render for load/SEO) — and *what Nuri IS* #2 (agent-first ·
   humans-cold not primary) makes that value low, so the build-free data-driven path is the fit.
4. **"Stories" = the examples** — composing the real components (the existing build-free
   `<nuri-demo>`: `<template>` → live preview + code from one source · can't drift).

## The deferred unlock — §9 source-inversion (revisits decision 2)

The vision's "everything from the data" hinges on inverting the source: **author the
variants-model · generate web-CSS + docs from it** ([`resolver-model.md` §9](./resolver-model.md) ·
revisits [decision 2](../decisionlog.md)). Today CSS is SoT and the descriptor is **derived** (the
65.1 bootstrap). Note the **decoupling**: generating **docs** from the descriptor does **not** wait
for §9 (the descriptor is already the machine-spec, even when CSS-derived); §9 is the **separate,
bigger** unlock for the **web-package** side (author data → generate CSS). §9 stays **OPEN ·
audit-gated** (M2/M5: does inline-CSS-var rendering preserve the decision-63 cascade fix · does an
off-the-shelf compiler already do the generation).

## External consumption — the only-git wall

npm cannot natively git-install a single subdirectory/workspace package by version (RFC #462 is an
unshipped, different-case discussion). So the RN team consuming **one clean `@nuri/factory`
only-git** needs either a **git subtree-split mirror** (an auto-generated read-only repo) or to
consume the **whole monorepo at a tag**. Neither is a registry publish (only-git holds). Build the
mirror when external consumption is real (P11).

## Migration sequence (LOCKED structure · 65.7 · handed off separately)

**Progress (2026-06-19):** M1 `@nuri/spec` carve-out ✓ ([65.8](../decisionlog.md)) · M2 absorb `expodsdemo` →
`@nuri/factory` + `@nuri/expo-demo` ✓ ([65.9](../decisionlog.md)) · **M3 the intra-repo gate ✓ — [`gates.yml`](../.github/workflows/gates.yml)
now runs three per-workspace jobs (`spec` · `factory` · `expo-demo`); the `factory` render-smoke gates `@nuri/spec/build`
INTRA-REPO, so a contract change that breaks the RN render fails CI by construction · R7 CLOSED** ([65.10](../decisionlog.md)).
Next: **M4** retire `button-matrix`. The locked sequence:

`skeleton workspaces` (nuri → `spec` + scaffolds) → `absorb expodsdemo` (`factory` + `expo-demo` ·
the snapshot → `workspace:*`) → `intra-repo gate` (per-workspace matrix in `gates.yml` · the
`factory` render-smoke gates `spec/build` · **= R7 closed**) → `retire button-matrix` (trivial, same
repo) → then the north-star arcs (`website` doc-gen · §9 · the external mirror) and **Digital-cash**.

## What this supersedes

The **cross-repo seam** (R2 · the version-cut pre-push hook / GitHub-Actions checkout of a separate
public `expodsdemo`) is **dropped** — the monorepo makes the gate intra-repo (65.7 · R7 dissolves).
R1/R1.5's factory + 1:1 API + render-smoke **carry over** into the `factory` workspace.
