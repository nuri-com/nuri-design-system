---
title: Typography
layout: default
nav_order: 5
---

<!-- GENERATED · DO NOT EDIT BY HAND · source: packages/rn/generated/data/tokens.ts · packages/prototype/generated/styles/typography.css · packages/rn/theme.tsx · packages/spec/axes/typography-axis.ts
     emitter: packages/doc/pipeline/docs.js · re-emit: `npm run build -w @nuri/doc` -->

# Typography

The bespoke **typography** axis — two orthogonal inputs (decision 77): **`size`**, a foundation type-step, and **`emphasis`**, a boolean weight override. Both realize on either target (web a `data-*` attribute · RN `typeStyle`); each step’s resolved composite (font-size · line-height · weight · tracking) lives in the type **scale** (Foundations). The `nuri-typography` **wrapper** below is a separate **web-only** prose helper — muted tone + block alignment for authored content, with no RN analog.

## Size

| Input | Web | RN | Value |
| --- | --- | --- | --- |
| `xs` | `[data-type-style="xs"]` | `typeStyle('xs')` | `type` scale |
| `sm` | `[data-type-style="sm"]` | `typeStyle('sm')` | `type` scale |
| `md` | `[data-type-style="md"]` | `typeStyle('md')` | `type` scale |
| `lg` | `[data-type-style="lg"]` | `typeStyle('lg')` | `type` scale |
| `xl` | `[data-type-style="xl"]` | `typeStyle('xl')` | `type` scale |
| `3xl` | `[data-type-style="3xl"]` | `typeStyle('3xl')` | `type` scale |

## Emphasis

| Input | Web | RN | Value |
| --- | --- | --- | --- |
| `emphasis` | `[data-type-emphasis]` | `typeStyle(size, true)` | semibold |

## Wrapper

| Channel | Selector | Declarations |
| --- | --- | --- |
| `muted` | `nuri-typography[data-muted]` | `color: var(--nuri-text-muted)` |
| `alignStart` | `nuri-typography[align="start"]` | `display: block`<br>`text-align: start` |
| `alignCenter` | `nuri-typography[align="center"]` | `display: block`<br>`text-align: center` |
| `alignEnd` | `nuri-typography[align="end"]` | `display: block`<br>`text-align: end` |
| `truncate1` | `nuri-typography[flow="truncate"][lines="1"]` | `display: -webkit-box`<br>`-webkit-box-orient: vertical`<br>`-webkit-line-clamp: 1`<br>`overflow: hidden`<br>`text-overflow: ellipsis` |
| `truncate2` | `nuri-typography[flow="truncate"][lines="2"]` | `display: -webkit-box`<br>`-webkit-box-orient: vertical`<br>`-webkit-line-clamp: 2`<br>`overflow: hidden`<br>`text-overflow: ellipsis` |
| `truncate3` | `nuri-typography[flow="truncate"][lines="3"]` | `display: -webkit-box`<br>`-webkit-box-orient: vertical`<br>`-webkit-line-clamp: 3`<br>`overflow: hidden`<br>`text-overflow: ellipsis` |

> The `nuri-typography` element is a **web-only** prose wrapper (muted tone + block
> alignment · no RN analog). It is not part of the `size`/`emphasis` axis above.
