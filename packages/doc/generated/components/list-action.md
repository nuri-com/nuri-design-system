---
title: List Action
layout: default
nav_order: 6
---

<!-- GENERATED · DO NOT EDIT BY HAND · source: packages/rn/generated/components/list-action.ts
     emitter: packages/doc/pipeline/docs.js · re-emit: `npm run build -w @nuri/doc` -->

# List Action

`ListActionLeadingAvatar` forwards `IconAvatar` props: `name` (as `icon`), `variant` (default `outline`), `accent`, `source`, `initials`, `accessory` and `accessorySurface`. Person rows use `initials` with a rail `accessory`; the initials paint `soft` even though the row defaults the avatar to `outline`. The avatar is decorative, so the row names the rail in its text or in `accessibilityLabel` ("Emil Berg, Nuri user, @emil").

## API

### List Action Props

| Prop | Required | Type | Notes |
| --- | --- | --- | --- |
| `onPress` | no | `() => void` | pressable behaviour |
| `disabled` | no | `boolean` | pressable behaviour |
| `accessibilityLabel` | no | `string` | pressable behaviour |
| `children` | no | `React.ReactNode` | composition children |

### List Action Leading Avatar Props

| Prop | Required | Type | Notes |
| --- | --- | --- | --- |
| `name` | no | `IconName` | scalar icon name |
| `variant` | no | `'solid' | 'soft' | 'ghost' | 'subtle' | 'outline'` | delegated component prop |
| `accent` | no | `'neutral' | 'lilac' | 'orange'` | delegated component prop |
| `source` | no | `ImageSourcePropType` | image source |
| `initials` | no | `string` | scalar initials text |
| `accessory` | no | `IconName` | scalar icon name; md only |
| `accessorySurface` | no | `'canvas' | 'inverse'` | style axis; md only |

> `children` is not accepted (`children?: never`).

### List Action Text Props

| Prop | Required | Type | Notes |
| --- | --- | --- | --- |
| `children` | no | `React.ReactNode` | slot content |

### List Action Text Muted Props

| Prop | Required | Type | Notes |
| --- | --- | --- | --- |
| `children` | no | `React.ReactNode` | slot content |

### List Action Trailing Text Props

| Prop | Required | Type | Notes |
| --- | --- | --- | --- |
| `children` | no | `React.ReactNode` | slot content |

### List Action Trailing Text Muted Props

| Prop | Required | Type | Notes |
| --- | --- | --- | --- |
| `children` | no | `React.ReactNode` | slot content |

### List Action Trail Icon Props

| Prop | Required | Type | Notes |
| --- | --- | --- | --- |
| `name` | yes | `IconName` | scalar icon name |

> `children` is not accepted (`children?: never`).
