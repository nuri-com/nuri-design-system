---
title: Tab Bar Item
layout: default
nav_order: 8
---

<!-- GENERATED · DO NOT EDIT BY HAND · source: packages/rn/generated/components/tab-bar-item.ts
     emitter: packages/doc/pipeline/docs.js · re-emit: `npm run build -w @nuri/doc` -->

# Tab Bar Item

## API

### TabBarItemProps

| Prop | Required | Type | Notes |
| --- | --- | --- | --- |
| `accent` | no | `'neutral' | 'lilac' | 'orange'` | theme scope |
| `onPress` | no | `() => void` | pressable behaviour |
| `accessibilityLabel` | no | `string` | pressable behaviour |
| `selected` | no | `boolean` | state axis |
| `children` | no | `React.ReactNode` | composition children |

### TabBarItemIconProps

| Prop | Required | Type | Notes |
| --- | --- | --- | --- |
| `name` | yes | `IconName` | scalar icon name |

> `children` is not accepted (`children?: never`).

### TabBarItemLabelProps

| Prop | Required | Type | Notes |
| --- | --- | --- | --- |
| `children` | no | `React.ReactNode` | slot content |
