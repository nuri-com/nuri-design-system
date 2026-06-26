---
title: Interactive
layout: default
nav_order: 4
---

<!-- GENERATED · DO NOT EDIT BY HAND · source: packages/spec/pipeline/interactive-effects.ts
     emitter: packages/doc/pipeline/docs.js · re-emit: `npm run build -w @nuri/doc` -->

# Interactive

The bespoke **interactive** axis — interaction decomposed into independent effects (affordance · focus · press-scale · disabled), each its own gate.

## Effects

| Effect | Selector | Declarations | Gate |
| --- | --- | --- | --- |
| `affordance` | `.nuri-interactive` | `cursor: pointer`<br>`transition: background-color var(--nuri-duration-fast) ease, transform var(--nuri-duration-fast) ease` | automatic |
| `focus` | `.nuri-interactive:focus-visible` | `outline: 2px solid var(--nuri-focus-ring)`<br>`outline-offset: 2px` | automatic |
| `pressScale` | `.nuri-interactive[data-press-scale]:active` | `transform: scale(var(--nuri-interaction-press-scale))` | opt-in · `[data-press-scale]` |
| `disabledGuard` | `.nuri-interactive[aria-disabled="true"]:active` | `transform: none` | automatic |
| `disabledOpacity` | `.nuri-interactive:disabled, .nuri-interactive[aria-disabled="true"]` | `opacity: var(--nuri-interaction-disabled-opacity)` | automatic |

> ⚠ **Order is load-bearing.** `pressScale` and `disabledGuard` both set `transform` at
> equal specificity, so the cascade resolves it by **source order** — the row order
> above is that order: `pressScale` is emitted first, so `disabledGuard`’s `transform: none`
> wins and a disabled control reverts the press-scale (never scales).
