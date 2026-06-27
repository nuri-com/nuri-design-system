---
title: Foundations
layout: default
nav_order: 1
has_children: true
---

# Foundations

The token vocabulary — **colour · dimension · typography** — the cascade's base: the L1
primitives (raw hexes · direct pixels · the type scale) and the L2 semantics the axes
reference by name (`space` scale · `type` scale · the accent × theme colour matrix).

Each page is **generated** from `@nuri/spec`'s token source of truth on every build by
`@nuri/doc`'s doc-gen (`pipeline/build.js`) — so the reference **cannot drift** from the
engine (the generation thesis · decision 66 · 75). Tokens are **target-neutral** (a px, a
hex — identical in RN production and web prototyping), so the pages are agnostic
resolving-value tables: input → the `{ref}` cascade → the resolved value (+ a swatch).

Colour and dimension are **TS-authored** (flipped at N+31 / N+32); the type **scale** stays
**CSS-authored** (`styles/typography.css`) — the honest asymmetry the typography page's
provenance header records. (Iconography is a registry, not a cascade layer, so it is not a
token foundation — see the [Components](components.html).)
