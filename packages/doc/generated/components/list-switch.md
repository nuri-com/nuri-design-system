---
title: List Switch
layout: default
nav_order: 27
---

<!-- GENERATED · DO NOT EDIT BY HAND · source: packages/rn/generated/components/list-switch.ts
     emitter: packages/doc/pipeline/docs.js · re-emit: `npm run build -w @nuri/doc` -->

# List Switch

`ListSwitch` is the list row whose whole row is one switch: the `ListAction` row geometry with `ListSwitchText` and `ListSwitchTextMuted` content and a trailing pill that copies the `Switch` look (pinned by a parity guard, never an embedded control). The row text names the control, the full row is the tap target — a superset of iOS Settings' pill-only target — and the row wash is the press feedback. Controlled like `Switch`: `checked` plus `onPress`; `accessibilityLabel` is optional because the row text names it.

## API

### List Switch Props

| Prop | Required | Type | Notes |
| --- | --- | --- | --- |
| `accent` | no | `'neutral' | 'lilac' | 'orange'` | theme scope |
| `onPress` | no | `() => void` | pressable behaviour |
| `disabled` | no | `boolean` | pressable behaviour |
| `accessibilityLabel` | no | `string` | pressable behaviour |
| `checked` | no | `boolean` | state axis |
| `children` | no | `React.ReactNode` | composition children |

### List Switch Text Props

| Prop | Required | Type | Notes |
| --- | --- | --- | --- |
| `children` | no | `React.ReactNode` | slot content |

### List Switch Text Muted Props

| Prop | Required | Type | Notes |
| --- | --- | --- | --- |
| `children` | no | `React.ReactNode` | slot content |
