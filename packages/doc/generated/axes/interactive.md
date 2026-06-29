---
title: Interactive
layout: default
nav_order: 4
---

<!-- GENERATED · DO NOT EDIT BY HAND · source: packages/spec/axes/interactive-effects.ts
     emitter: packages/doc/pipeline/docs.js · re-emit: `npm run build -w @nuri/doc` -->

# Interactive

The bespoke **interactive** axis — interaction decomposed into independent opt-ins (`pressColor` · `pressScale` · `disabledOpacity`), each one source realized on both targets: RN in production, web for prototyping and these docs. The `nuri-interactive` **chrome** below (affordance · focus · the disabled guard) is web-only realization support, not part of the axis.

## Effects

| Input | Web | RN | Value |
| --- | --- | --- | --- |
| `pressColor` | → palette (`:active` bg swap) | `backgroundColor ← pressedBg` | opt-in · `[data-press-color]` |
| `pressScale` | `.nuri-interactive[data-press-scale]:active` → `transform: scale(var(--nuri-interaction-press-scale))` | `transform: [{ scale }] ← interaction.pressScale` | opt-in · `[data-press-scale]` |
| `disabledOpacity` | `.nuri-interactive:disabled, .nuri-interactive[aria-disabled="true"]` → `opacity: var(--nuri-interaction-disabled-opacity)` | `opacity ← interaction.disabledOpacity` | automatic |

## Chrome

| Channel | Selector | Declarations |
| --- | --- | --- |
| `affordance` | `.nuri-interactive` | `cursor: pointer`<br>`transition: background-color var(--nuri-duration-fast) ease, transform var(--nuri-duration-fast) ease` |
| `focus` | `.nuri-interactive:focus-visible` | `outline: 2px solid var(--nuri-focus-ring)`<br>`outline-offset: 2px` |
| `disabledGuard` | `.nuri-interactive[aria-disabled="true"]:active` | `transform: none` |

> The `nuri-interactive` chrome is **web-only** realization support (cursor + transition
> affordance · the focus ring · the disabled-state guard) — no agnostic input, no RN
> analog, so it is not part of the `Effects` axis above.

> `pressScale` and `disabledGuard` both set `transform` at equal specificity, so source order
> decides: `disabledGuard` is emitted last, so a disabled control reverts the press-scale
> (never scales).
