# Nuri · North Star

> **What this is.** The long-term direction for Nuri, captured 2026-06-19. The **monorepo
> structure + the intra-repo gate are LOCKED** ([decision 65.7](../decisionlog.md)); everything
> else here is **direction, not a commitment** — each piece is sequenced as its own arc, built
> when a consumer needs it ([P11](../pages/principles.html#p11-parsimony)). This file informs
> sequencing; it does not pre-authorize work.
>
> **Extended 2026-06-20 · [decision 66](../decisionlog.md):** the post-migration arcs + the
> generation thesis; **"composing isn't DS work"** is locked (57.2). See *The post-migration
> arcs* below — it extends this direction, it does not contradict it.

Nuri matures from a single-repo agent-spec into a **versioned, multi-package design system** that
ships a **frozen contract** + a **certified RN factory** to a real RN team, only-git.

## The shape — one npm-workspaces monorepo, a DAG rooted at `spec`

```
spec        SoT · lib/ (web CSS + custom-elements · CSS is SoT · dec 2 · §9 revisits · dec 66) · pipeline/ · build/ (frozen · Guard F)
 ├─ factory      the bare certified RN engine: theme runtime + createNuriComponent + ergonomic 1:1 components
 │   └─ expo-demo    the example app the RN team copies (consumes factory)
 ├─ website      docs generated MECHANICALLY from the data (token/API/anatomy) · stories via <nuri-demo>
 └─ playground   build-free prototyping · the consumer composition TOOL (57.2) · at HEAD = next version
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
revisits [decision 2](../decisionlog.md)). Today CSS is SoT (§9 will revisit · dec 66) and the descriptor is **derived** (the
65.1 bootstrap). Note the **decoupling**: generating **docs** from the descriptor does **not** wait
for §9 (the descriptor is already the machine-spec, even when CSS-derived); §9 is the **separate,
bigger** unlock for the **web-package** side (author data → generate CSS). §9 stays **OPEN ·
audit-gated** (M2/M5: does inline-CSS-var rendering preserve the decision-63 cascade fix · does an
off-the-shelf compiler already do the generation).

## The post-migration arcs — the generation thesis (decision 66)

The migration (M1→M4) is done; [decision 66](../decisionlog.md) records the direction it opens as a
sequence of arcs. The through-line is the **generation thesis**: *generate from the SoT*, extended
layer by layer — **components** ✓ (the factory) → **docs** (the `website` doc-gen) → **web-CSS** (§9)
→ **meta** (the slim). Only **"composing isn't DS work"** is locked ([decision 57.2](../decisionlog.md));
the rest is direction, each arc P11-gated.

**The arc sequence** — (0) Smell-1 cleanup (retire the dead `build/components/*` · relocate the
mis-homed interaction baseline) · (1) `website` doc-gen · (2) WC→RN playground tab · (3) the
composing-boundary [locked · 57.2] · (4) §9 source-inversion [audit-gated] · (5) meta-slim [last
phase]. Order is dependency / priority, not a timeline.

**Composing isn't DS work — the playground is a consumer TOOL** ([decision 57.2](../decisionlog.md)).
The DS ships primitives + recipes; *composing a screen* is the consumer's job, done build-free (the
playground or a chat artifact) and handed to the RN project as 1:1 JSX. So the `playground` workspace
is the **consumer's composition tool** (it may externalize), and any composed screen in the repo
(`my-vault`) is a **demo of the tool, not DS spec** — this sharpens the "playground / prototyping"
line in *The shape* above.

**Doc-gen mechanism (move 3, concrete) — `website` = just-the-docs (Jekyll).** Generated Markdown
from the data (token / API / anatomy) + **stories via the build-free `<nuri-demo>`** (`<template>` →
live preview + code from one source · [decision 10](../decisionlog.md)). **De-risk spike (FLAG before
committing):** prove `<nuri-demo>` survives kramdown — the Markdown processor must pass the
`<template>` child **verbatim** (HTML-in-Markdown can mangle it); fallbacks if it doesn't are a Jekyll
`_includes/` raw-HTML partial or a `{::nomarkdown}` block. (The repo serves `.nojekyll` today;
`website` as its own workspace can opt into Jekyll without touching the spec pages.)

**The WC→RN tab (move 2 + decision 21's "translate", concrete).** The playground gains a **translate**
tab: **one source — the `<nuri-demo>` `<template>`** — emitted in **two serializations** (the
web-components markup it already is · the equivalent RN JSX). This makes decision 21's third loop step
("operator prompts → agent composes → translate") a feature, not a manual hand-off.

**§9 source-inversion — `descriptor → CSS` direct** (revisits decision 2 · direction · audit-gated).
Stated positively: author the variants-model (the frozen descriptor *shape*) as the SoT and
**generate the web-CSS from it directly**, in this repo's own pipeline (today's 65.1 bootstrap runs
the other way: CSS → descriptor). The justification is the **two-factory framing**: one frozen
descriptor feeds **two generators** — the RN factory (descriptor → RN · exists) and the web-CSS
generator (descriptor → CSS · the §9 "genuinely new piece, ours"). Neither platform is hand-authored,
so the web↔RN handoff is **trustworthy by construction** — they cannot drift. §9 stays **audit-gated**
(does inline-CSS-var rendering preserve the [decision 63](../decisionlog.md) cascade fix · does an
off-the-shelf compiler already do the generation) and **is decided at its own arc, not here**; decision
2 STANDS until then.

**The meta-slim endgame** (last phase · direction). *What Nuri IS* #1 — "doc-to-code ratio HIGH on
purpose" — was the **exploratory phase's** cold-start tool, not a permanent identity. As the system
stabilizes, the spec's FORM moves prose → data: `llms.txt` retires (the data is the manifest), the
decision-log becomes an **archive, not the entry-point**, and a few stable conventions freeze. The
high ratio falls out, by design.

**Parked (explore-later).** **NuriElement** (an anatomy-less element) sits *outside* [decision
64](../decisionlog.md)'s primitive / recipe taxonomy; the **palettizable-primitives** alternative
(today's `nuri-stack` / `nuri-box` carrying the disjoint `palette` + `box` namespaces · U3 preserved)
may obviate it. Resolved when the playground reveals a real composition limit — not before (P11).

## External consumption — the only-git wall

npm cannot natively git-install a single subdirectory/workspace package by version (RFC #462 is an
unshipped, different-case discussion). So the RN team consuming **one clean `@nuri/factory`
only-git** needs either a **git subtree-split mirror** (an auto-generated read-only repo) or to
consume the **whole monorepo at a tag**. Neither is a registry publish (only-git holds). Build the
mirror when external consumption is real (P11).

## Migration sequence (LOCKED structure · 65.7 · handed off separately)

**Progress (2026-06-20):** M1 `@nuri/spec` carve-out ✓ ([65.8](../decisionlog.md)) · M2 absorb `expodsdemo` →
`@nuri/factory` + `@nuri/expo-demo` ✓ ([65.9](../decisionlog.md)) · **M3 the intra-repo gate ✓ — [`gates.yml`](../.github/workflows/gates.yml)
now runs three per-workspace jobs (`spec` · `factory` · `expo-demo`); the `factory` render-smoke gates `@nuri/spec/build`
INTRA-REPO, so a contract change that breaks the RN render fails CI by construction · R7 CLOSED** ([65.10](../decisionlog.md)) ·
**M4 retire `button-matrix` ✓ — the type-only migration mirror + its CI tsc are gone; the `factory` render-smoke is the
sole contract gate** ([65.11](../decisionlog.md)). **The migration is COMPLETE.** Next: the north-star arcs (`website`
doc-gen · §9 · the external mirror) and **Digital-cash**. The locked sequence:

`skeleton workspaces` (nuri → `spec` + scaffolds) → `absorb expodsdemo` (`factory` + `expo-demo` ·
the snapshot → `workspace:*`) → `intra-repo gate` (per-workspace matrix in `gates.yml` · the
`factory` render-smoke gates `spec/build` · **= R7 closed**) → `retire button-matrix` ✓ (done · M4) →
then the north-star arcs (`website` doc-gen · §9 · the external mirror) and **Digital-cash**.

## What this supersedes

The **cross-repo seam** (R2 · the version-cut pre-push hook / GitHub-Actions checkout of a separate
public `expodsdemo`) is **dropped** — the monorepo makes the gate intra-repo (65.7 · R7 dissolves).
R1/R1.5's factory + 1:1 API + render-smoke **carry over** into the `factory` workspace.
