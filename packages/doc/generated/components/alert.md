---
title: Alert
layout: default
nav_order: 2
---

<!-- GENERATED · DO NOT EDIT BY HAND · source: packages/rn/generated/components/alert.ts
     emitter: packages/doc/pipeline/docs.js · re-emit: `npm run build -w @nuri/doc` -->

# Alert

## API

### AlertProps

| Prop | Required | Type | Notes |
| --- | --- | --- | --- |
| `variant` | no | `'soft' | 'ghost'` | style axis |
| `accent` | no | `'neutral' | 'lilac' | 'orange'` | theme scope |
| `children` | no | `React.ReactNode` | default content slot |

### AlertIconProps

| Prop | Required | Type | Notes |
| --- | --- | --- | --- |
| `name` | yes | `IconName` | scalar icon name |

> `children` is not accepted (`children?: never`).

### AlertButtonProps

| Prop | Required | Type | Notes |
| --- | --- | --- | --- |
| `children` | no | `React.ReactNode` | slot content |
| `disabled` | no | `boolean` | pressable behaviour |
| `onPress` | no | `() => void` | pressable behaviour |
| `accessibilityLabel` | no | `string` | pressable behaviour |
