---
title: Text Field
layout: default
nav_order: 7
---

<!-- GENERATED · DO NOT EDIT BY HAND · source: packages/rn/generated/components/text-field.ts
     emitter: packages/doc/pipeline/docs.js · re-emit: `npm run build -w @nuri/doc` -->

# Text Field

Use a `TextFieldHandle` ref for consumer-owned focus policy. Focus after a sheet enters with `<BottomSheet onOpenChange={(open) => open && ref.current?.focus()}>`; for validation, call `ref.current?.focus()` from the invalid branch of the submit handler. The handle exposes only `focus()` and `blur()`—never the raw native input.

## API

### Text Field Props

| Prop | Required | Type | Notes |
| --- | --- | --- | --- |
| `accent` | no | `'neutral' | 'lilac' | 'orange'` | theme scope |
| `value` | no | `string` | input behaviour |
| `onChangeText` | no | `(text: string) => void` | input behaviour |
| `placeholder` | no | `string` | input behaviour |
| `inputMode` | no | `'text' | 'decimal' | 'numeric' | 'tel' | 'email' | 'url' | 'search'` | input behaviour |
| `secureTextEntry` | no | `boolean` | input behaviour |
| `disabled` | no | `boolean` | input behaviour |
| `onFocus` | no | `() => void` | input behaviour |
| `onBlur` | no | `() => void` | input behaviour |
| `accessibilityLabel` | no | `string` | input behaviour |
| `children` | no | `React.ReactNode` | composition children |

### Text Field Label Props

| Prop | Required | Type | Notes |
| --- | --- | --- | --- |
| `children` | yes | `string` | slot content |

### Text Field Button Props

| Prop | Required | Type | Notes |
| --- | --- | --- | --- |
| `children` | no | `React.ReactNode` | slot content |
| `onPress` | no | `() => void` | pressable behaviour |
| `disabled` | no | `boolean` | pressable behaviour |
| `accessibilityLabel` | no | `string` | pressable behaviour |

### Text Field Icon Button Props

| Prop | Required | Type | Notes |
| --- | --- | --- | --- |
| `name` | yes | `IconName` | scalar icon name |
| `onPress` | no | `() => void` | pressable behaviour |
| `disabled` | no | `boolean` | pressable behaviour |
| `accessibilityLabel` | yes | `string` | pressable behaviour |

> `children` is not accepted (`children?: never`).
