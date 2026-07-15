---
title: Topbar
layout: default
nav_order: 10
---

<!-- GENERATED · DO NOT EDIT BY HAND · source: packages/rn/generated/components/topbar.ts
     emitter: packages/doc/pipeline/docs.js · re-emit: `npm run build -w @nuri/doc` -->

# Topbar

`layout="centered"` preserves a true optical centre by giving the leading and trailing regions equal shares. Use `layout="fluid"` for a leading action plus flexible primary content: `TopbarContent` grows through the remaining width, while `TopbarTitle` supplies the standard `lg` emphasized title with enforced one-line tail truncation. Bare children remain trailing actions.

## API

### Topbar Props

| Prop | Required | Type | Notes |
| --- | --- | --- | --- |
| `surface` | no | `'canvas' | 'transparent'` | component prop |
| `layout` | no | `'centered' | 'fluid'` | component prop |
| `accent` | no | `'neutral' | 'lilac' | 'orange'` | theme scope |
| `children` | no | `React.ReactNode` | default content slot |

### Topbar Leading Props

| Prop | Required | Type | Notes |
| --- | --- | --- | --- |
| `children` | no | `React.ReactNode` | slot content |

### Topbar Center Props

| Prop | Required | Type | Notes |
| --- | --- | --- | --- |
| `children` | no | `React.ReactNode` | slot content |

### Topbar Content Props

| Prop | Required | Type | Notes |
| --- | --- | --- | --- |
| `children` | no | `React.ReactNode` | slot content |

### Topbar Trailing Props

| Prop | Required | Type | Notes |
| --- | --- | --- | --- |
| `children` | no | `React.ReactNode` | slot content |

### Topbar Title Props

| Prop | Required | Type | Notes |
| --- | --- | --- | --- |
| `children` | no | `React.ReactNode` | slot content |
