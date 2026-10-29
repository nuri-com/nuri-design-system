---
title: Button
layout: default
nav_order: 1
---

<!-- GENERATED · DO NOT EDIT BY HAND · source: packages/rn/generated/components/button.ts
     emitter: packages/doc/pipeline/docs.js · re-emit: `npm run build -w @nuri/doc` -->

# Button

`variant="ghost"` is the lowest emphasis (tertiary), below `solid` and the default `soft`: no fill at rest, `text-primary` text and a `bg-subtle` wash when pressed. It keeps each size's height and padding, so its hit area matches `solid` and `soft`. Use it for an action inside content, where a fill would compete with that content. It is never a screen's main action or its only one. `accent` does not paint ghost: the prop is accepted and has no effect, as on `IconButton`.

## API

### Button Props

| Prop | Required | Type | Notes |
| --- | --- | --- | --- |
| `variant` | no | `'solid' | 'soft' | 'ghost'` | style axis |
| `size` | no | `'sm' | 'lg'` | style axis |
| `fill` | no | `'natural' | 'even' | 'hug'` | style axis |
| `accent` | no | `'neutral' | 'lilac' | 'orange'` | theme scope |
| `onPress` | no | `() => void` | pressable behaviour |
| `disabled` | no | `boolean` | pressable behaviour |
| `accessibilityLabel` | no | `string` | pressable behaviour |
| `children` | no | `React.ReactNode` | default content slot |

### Button Text Props

| Prop | Required | Type | Notes |
| --- | --- | --- | --- |
| `children` | no | `React.ReactNode` | slot content |

### Button Icon Props

| Prop | Required | Type | Notes |
| --- | --- | --- | --- |
| `name` | yes | `IconName` | scalar icon name |

> `children` is not accepted (`children?: never`).
