---
title: Select Trigger
layout: default
nav_order: 25
---

<!-- GENERATED · DO NOT EDIT BY HAND · source: packages/rn/generated/components/select-trigger.ts
     emitter: packages/doc/pipeline/docs.js · re-emit: `npm run build -w @nuri/doc` -->

# Select Trigger

`SelectTrigger` is the cluster-sized inline disclosure control; use `SelectField` when the label must remain outside field chrome. `variant="ghost"` is transparent at rest and washes to `chrome.bg-subtle`; `variant="pill"` rests on `chrome.bg-subtle` and washes to `chrome.bg-strong`. Both variants keep one 48px-minimum, full-radius press target with no press scale. Keep at least `space.md` (12px) between the trigger bounds and every independent target; compositions must constrain or reposition long values instead of allowing overlap. Keep the static prompt in `accessibilityLabel` and the current selection in `accessibilityValue`; the component emits only `onPress`, and consumers own dialog, open, and selection state.

## API

### Select Trigger Props

| Prop | Required | Type | Notes |
| --- | --- | --- | --- |
| `variant` | no | `'ghost' | 'pill'` | style axis |
| `accent` | no | `'neutral' | 'lilac' | 'orange'` | theme scope |
| `onPress` | no | `() => void` | pressable behaviour |
| `disabled` | no | `boolean` | pressable behaviour |
| `accessibilityLabel` | no | `string` | pressable behaviour |
| `accessibilityValue` | no | `string` | pressable behaviour |
| `children` | no | `React.ReactNode` | composition children |

### Select Trigger Label Props

| Prop | Required | Type | Notes |
| --- | --- | --- | --- |
| `children` | yes | `React.ReactNode` | slot content |

### Select Trigger Avatar Props

| Prop | Required | Type | Notes |
| --- | --- | --- | --- |
| `name` | no | `IconName` | scalar icon name |
| `variant` | no | `'solid' | 'soft' | 'ghost' | 'subtle' | 'outline'` | delegated component prop |
| `accent` | no | `'neutral' | 'lilac' | 'orange'` | delegated component prop |
| `source` | no | `ImageSourcePropType` | image source |

> `children` is not accepted (`children?: never`).

### Select Trigger Value Props

| Prop | Required | Type | Notes |
| --- | --- | --- | --- |
| `children` | yes | `React.ReactNode` | slot content |

### Select Trigger Chevron Props

| Prop | Required | Type | Notes |
| --- | --- | --- | --- |
| `name` | yes | `IconName` | scalar icon name |

> `children` is not accepted (`children?: never`).
