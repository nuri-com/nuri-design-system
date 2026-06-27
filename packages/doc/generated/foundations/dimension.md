---
title: Dimension
layout: default
nav_order: 3
---

<!-- GENERATED · DO NOT EDIT BY HAND · source: packages/spec/pipeline/dimensions.ts
     emitter: packages/doc/pipeline/docs.js · re-emit: `npm run build -w @nuri/doc` -->

# Dimension

The dimension foundation — the L1 direct-pixel primitives (`px-N` is N pixels · decision 32) and the L2 `space` · `size` · `radius` scales that reference them. Each semantic leaf names a primitive (the cascade) or sits outside it as a literal sentinel (`space.none` · `radius.full`). One px value, both targets.

## Primitives

| Token | Value |
| --- | --- |
| `px-2` | `2px` |
| `px-4` | `4px` |
| `px-6` | `6px` |
| `px-12` | `12px` |
| `px-18` | `18px` |
| `px-24` | `24px` |
| `px-28` | `28px` |
| `px-36` | `36px` |
| `px-48` | `48px` |
| `px-60` | `60px` |
| `px-72` | `72px` |
| `px-90` | `90px` |

## Space

| Token | Cascade | Value |
| --- | --- | --- |
| `space.none` | `literal` | `0px` |
| `space.2xs` | `px-2` | `2px` |
| `space.xs` | `px-4` | `4px` |
| `space.sm` | `px-6` | `6px` |
| `space.md` | `px-12` | `12px` |
| `space.lg` | `px-18` | `18px` |
| `space.xl` | `px-24` | `24px` |
| `space.2xl` | `px-36` | `36px` |

## Size

| Token | Cascade | Value |
| --- | --- | --- |
| `size.xs` | `px-18` | `18px` |
| `size.sm` | `px-28` | `28px` |
| `size.md` | `px-36` | `36px` |
| `size.lg` | `px-48` | `48px` |
| `size.xl` | `px-60` | `60px` |
| `size.2xl` | `px-72` | `72px` |
| `size.3xl` | `px-90` | `90px` |

## Radius

| Token | Cascade | Value |
| --- | --- | --- |
| `radius.sm` | `px-6` | `6px` |
| `radius.md` | `px-12` | `12px` |
| `radius.lg` | `px-18` | `18px` |
| `radius.full` | `literal` | `9999px` |
