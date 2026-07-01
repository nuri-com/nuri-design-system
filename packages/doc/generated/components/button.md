---
title: Button
layout: default
nav_order: 1
---

<!-- GENERATED · DO NOT EDIT BY HAND · source: packages/rn/generated/components/button.ts
     emitter: packages/doc/pipeline/docs.js · re-emit: `npm run build -w @nuri/doc` -->

# Button

## API

### ButtonProps

| Prop | Required | Type | Notes |
| --- | --- | --- | --- |
| `variant` | no | `'solid' \| 'soft' \| 'ghost'` | style axis |
| `size` | no | `'sm' \| 'md' \| 'lg'` | style axis |
| `accent` | no | `Accent` | theme scope |
| `onPress` | no | `() => void` | pressable behaviour |
| `disabled` | no | `boolean` | pressable behaviour |
| `accessibilityLabel` | no | `string` | pressable behaviour |
| `children` | no | `React.ReactNode` | default content slot |

### ButtonTextProps

| Prop | Required | Type | Notes |
| --- | --- | --- | --- |
| `children` | no | `React.ReactNode` | slot content |

### ButtonIconProps

| Prop | Required | Type | Notes |
| --- | --- | --- | --- |
| `name` | yes | `IconName` | scalar icon name |

> `children` is not accepted (`children?: never`).
