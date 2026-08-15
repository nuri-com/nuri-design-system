---
title: Bleed
layout: default
nav_order: 11.1
---

<!-- GENERATED · DO NOT EDIT BY HAND · source: packages/rn/primitives/Bleed.tsx
     emitter: packages/doc/pipeline/docs.js · re-emit: `npm run build -w @nuri/doc` -->

# Bleed

`Bleed` / `<nuri-bleed>` creates controlled negative space around exactly one child. It has no paint or other layout axes of its own; its fixed lift paints the contained child above siblings, while the containing box keeps the complete interactive child inside native hit-test bounds.

## API

| Prop | Required | Type | Notes |
| --- | --- | --- | --- |
| `top` | no | `'xs' | 'sm' | 'md' | 'lg' | 'xl'` | negative space |
| `bottom` | no | `'xs' | 'sm' | 'md' | 'lg' | 'xl'` | negative space |
| `x` | no | `'xs' | 'sm' | 'md' | 'lg' | 'xl'` | negative space |
| `y` | no | `'xs' | 'sm' | 'md' | 'lg' | 'xl'` | negative space |
| `children` | yes | `React.ReactElement` | exactly one host child |

## Contract

`top`, `bottom`, `x`, and `y` resolve space-scale leaves to negative margins on both projections. There is no `all`, `start`, `end`, authorable z-order, or multi-child form.

Lift and measured-box containment are internal promises: authors choose only the negative-space leaves.

## Pattern: Move seam

The admitted Move pattern places a 48px (`height="lg"`) control row inside `Bleed top="xl" bottom="xl"`. The ±24px margins reduce that row to zero flow height. A parent stack `gap="2xs"` then appears **twice**—once above and once below the zero-height row—so 2 × 2px produces the 4px seam and centres the disc on the boundary.

> The current Stack gap contract does not expose `2xs`. The executable Move reference remains intentionally blocked instead of widening Stack in this Bleed-only change.
