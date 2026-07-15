---
title: Select Field
layout: default
nav_order: 24
---

<!-- GENERATED · DO NOT EDIT BY HAND · source: packages/rn/generated/components/select-field.ts
     emitter: packages/doc/pipeline/docs.js · re-emit: `npm run build -w @nuri/doc` -->

# Select Field

`SelectField` is a disclosure button dressed as a field, not an input or combobox. Keep the static field label in `accessibilityLabel` and the current selection in `accessibilityValue`; the web projection composes them into one name and declares `aria-haspopup="dialog"`, while React Native exposes the value through its native accessibility-value channel.

## API

### Select Field Props

| Prop | Required | Type | Notes |
| --- | --- | --- | --- |
| `size` | no | `'md' | 'lg'` | style axis |
| `accent` | no | `'neutral' | 'lilac' | 'orange'` | theme scope |
| `onPress` | no | `() => void` | pressable behaviour |
| `disabled` | no | `boolean` | pressable behaviour |
| `accessibilityLabel` | no | `string` | pressable behaviour |
| `accessibilityValue` | no | `string` | pressable behaviour |
| `children` | no | `React.ReactNode` | composition children |

### Select Field Label Props

| Prop | Required | Type | Notes |
| --- | --- | --- | --- |
| `children` | yes | `React.ReactNode` | slot content |

### Select Field Avatar Props

| Prop | Required | Type | Notes |
| --- | --- | --- | --- |
| `name` | no | `IconName` | scalar icon name |
| `variant` | no | `'solid' | 'soft' | 'ghost' | 'subtle' | 'outline'` | delegated component prop |
| `accent` | no | `'neutral' | 'lilac' | 'orange'` | delegated component prop |
| `source` | no | `ImageSourcePropType` | image source |

> `children` is not accepted (`children?: never`).

### Select Field Value Props

| Prop | Required | Type | Notes |
| --- | --- | --- | --- |
| `children` | yes | `React.ReactNode` | slot content |

### Select Field Chevron Props

| Prop | Required | Type | Notes |
| --- | --- | --- | --- |
| `name` | yes | `IconName` | scalar icon name |

> `children` is not accepted (`children?: never`).
