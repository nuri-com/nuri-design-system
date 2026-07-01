---
title: Stack
layout: default
nav_order: 1
---

<!-- GENERATED · DO NOT EDIT BY HAND · source: packages/spec/axes/resolve-map.ts · property-spelling.ts
     emitter: packages/doc/pipeline/docs.js · re-emit: `npm run build -w @nuri/doc` -->

# Stack

The agnostic **stack** namespace — flexbox layout (direction · alignment · gap · wrap · fill) as a Field table: one mapping, both targets.

## Fields

| Input | Web | RN | Value |
| --- | --- | --- | --- |
| `direction` | `flex-direction` | `flexDirection` | passthrough |
| `align` | `align-items` | `alignItems` | `start` → `flex-start`<br>`center` → `center`<br>`end` → `flex-end`<br>`stretch` → `stretch`<br>`baseline` → `baseline` |
| `justify` | `justify-content` | `justifyContent` | `start` → `flex-start`<br>`center` → `center`<br>`end` → `flex-end`<br>`between` → `space-between`<br>`around` → `space-around` |
| `gap` | `gap` | `gap` | `space` scale |
| `wrap` | `flex-wrap` | `flexWrap` | `wrap` / `nowrap` |
| `fill` | `flex` | — | `grow` → `grow: 1` · `shrink: 0`<br>`grow-shrink` → `grow: 1` · `shrink: 1` · `minInline: 0`<br>`even` → `grow: 1` · `shrink: 1` · `basis: 0` · `minInline: 0` |

> **`fill`** is the mechanism-divergent `expand` arm (decision 73 cl.2) — not a
> property-spelling entry: web is the `flex` shorthand, RN a multi-prop `ViewStyle`
> set (the per-value expansion in the Value column).
