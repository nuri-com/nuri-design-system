---
title: Typography
layout: default
nav_order: 5
---

<!-- GENERATED · DO NOT EDIT BY HAND · source: packages/spec/pipeline/typography-axis.ts
     emitter: packages/doc/pipeline/docs.js · re-emit: `npm run build -w @nuri/doc` -->

# Typography

The bespoke **typography** axis — the `nuri-typography` wrapper: declarative muted-tone + block alignment over the foundation type scale.

## Wrapper

| Channel | Selector | Declarations |
| --- | --- | --- |
| `muted` | `nuri-typography[data-muted]` | `color: var(--nuri-text-muted)` |
| `alignStart` | `nuri-typography[align="start"]` | `display: block`<br>`text-align: start` |
| `alignCenter` | `nuri-typography[align="center"]` | `display: block`<br>`text-align: center` |
| `alignEnd` | `nuri-typography[align="end"]` | `display: block`<br>`text-align: end` |

> The `nuri-typography` element is the prose **wrapper** — declarative muted-tone +
> block alignment. The type **scale** (`size` · `emphasis` · the `--nuri-type-*`
> utilities) is a Foundations doc, not this axis.
