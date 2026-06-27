---
title: Typography
layout: default
nav_order: 4
---

<!-- GENERATED · DO NOT EDIT BY HAND · source: packages/spec/build/tokens.ts · packages/spec/styles/typography.css · packages/spec/styles/tokens-primitive.css
     emitter: packages/doc/pipeline/docs.js · re-emit: `npm run build -w @nuri/doc` -->

# Typography

The typography foundation — the six type-scale steps (`xs`…`3xl`), each a composite of font-size · line-height · weight · letter-spacing, plus the orthogonal **emphasis** weight override (decision 77). The scale stays **CSS-authored** (`styles/typography.css` · the honest asymmetry vs colour/dimension); this page reads the resolved composite from `@nuri/spec`. RN realizes a step via `typeStyle` (production); web via the `[data-type-style]` attribute (prototyping and these docs).

## Scale

| Step | Font size (px) | Line height | Weight | Letter spacing (em) |
| --- | --- | --- | --- | --- |
| `xs` | `13` | `1.38` | `400` | `0` |
| `sm` | `15` | `1.33` | `400` | `-0.01` |
| `md` | `17` | `1.29` | `400` | `-0.02` |
| `lg` | `22` | `1.27` | `400` | `-0.015` |
| `xl` | `30` | `1.2` | `400` | `-0.015` |
| `3xl` | `57` | `1.19` | `400` | `-0.02` |

## Emphasis

> **`emphasis`** is an orthogonal boolean (decision 77 · the N+45 de-fusion): it swaps
> every step's weight to `600` (`emphasisWeight`), uniform across all six
> sizes — not a separate per-size step (contrast the old fused `${size}Em` twins). RN
> applies it via `typeStyle(size, true)`; web via the source-order-last
> `[data-type-emphasis]` rule.
