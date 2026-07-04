---
title: Text Field
layout: default
nav_order: 6
---

<!-- GENERATED · DO NOT EDIT BY HAND · source: packages/rn/generated/components/text-field.ts
     emitter: packages/doc/pipeline/docs.js · re-emit: `npm run build -w @nuri/doc` -->

# Text Field

## API

### TextFieldProps

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

### TextFieldLabelProps

| Prop | Required | Type | Notes |
| --- | --- | --- | --- |
| `children` | yes | `string` | slot content |

### TextFieldActionProps

| Prop | Required | Type | Notes |
| --- | --- | --- | --- |
| `children` | no | `React.ReactNode` | slot content |
| `onPress` | no | `() => void` | pressable behaviour |
| `disabled` | no | `boolean` | pressable behaviour |
| `accessibilityLabel` | no | `string` | pressable behaviour |
