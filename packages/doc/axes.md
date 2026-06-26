---
title: Axes
layout: default
nav_order: 2
has_children: true
---

# Axes

The 5 namespace axes — **stack · box · palette · interactive · typography** — the
system's spine. A component is a composition of these disjoint namespaces (the
schema's waist · decision 65.3 §6); the descriptor names them, the platform-native
factory resolves them.

Each page is **generated** from the axis's single TS source of truth in `@nuri/spec`
on every build by `@nuri/doc`'s doc-gen (`pipeline/build.js`) — so the reference
**cannot drift** from the engine (the generation thesis · decision 66 · 75).

The taxonomy is **2 agnostic + 3 bespoke** (decision 73): `stack` · `box` share one
Field-table mapping (input → CSS / RN property + value source); `palette` ·
`interactive` · `typography` each render their own SoT's shape (the colour role table ·
the interaction effect set · the `nuri-typography` wrapper dispatch). The token
**scales** the axes reference (`space` · `size` · `radius` · the type scale) resolve in
the Foundations docs.
