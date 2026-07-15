---
title: Text Field
layout: default
nav_order: 7
---

<!-- GENERATED · DO NOT EDIT BY HAND · source: packages/rn/generated/components/text-field.ts
     emitter: packages/doc/pipeline/docs.js · re-emit: `npm run build -w @nuri/doc` -->

# Text Field

Visible `TextFieldLabel` composition remains the norm for form fields. A compact control such as topbar search may omit the label only when it supplies `accessibilityLabel`; development builds warn once when neither naming channel is authored. Native TextField is native-authoritative while typing: controlled `value` echoes acknowledge native edits instead of overwriting the buffer frame by frame. Use `sanitize` only for minimal synchronous character normalization; the function must be referentially stable, inexpensive, and non-throwing. Prefer `maxLength` for length limits because it requires no corrective write, and use `disabled`—not the non-public React Native `editable` prop—to block editing. A sanitizer write can cancel an active IME composition, so verify required keyboards. External rewrites racing a keystroke are user/native-first and may diverge visually for one frame; a later parent commit can request the rewrite again. A target string still present in the bounded pending-emit history is intentionally treated as an echo, the unavoidable ambiguity of the value-only API. Clear by setting the controlled `value` to `""`; it uses the same rewrite path, and no `clear()` handle is exposed. Avoid programmatic writes into focused secure fields. Render-path memoization is separate performance work: it may reduce latency but cannot correct controlled-input ordering. Use a `TextFieldHandle` ref for consumer-owned focus policy. Inputs belong in `<Modal mode="full">`; autofocus when the form subtree mounts, without waiting for the enter animation. For validation, call `ref.current?.focus()` from the invalid branch of the submit handler. The handle exposes only `focus()` and `blur()`—never the raw native input.

## API

### Text Field Props

| Prop | Required | Type | Notes |
| --- | --- | --- | --- |
| `size` | no | `'md' | 'lg'` | style axis |
| `accent` | no | `'neutral' | 'lilac' | 'orange'` | theme scope |
| `value` | no | `string` | input behaviour |
| `onChangeText` | no | `(text: string) => void` | input behaviour |
| `placeholder` | no | `string` | input behaviour |
| `inputMode` | no | `'text' | 'decimal' | 'numeric' | 'tel' | 'email' | 'url' | 'search'` | input behaviour |
| `secureTextEntry` | no | `boolean` | input behaviour |
| `autoCapitalize` | no | `'none' | 'sentences' | 'words' | 'characters'` | input behaviour |
| `sanitize` | no | `(text: string) => string` | input behaviour |
| `maxLength` | no | `number` | input behaviour |
| `disabled` | no | `boolean` | input behaviour |
| `onFocus` | no | `() => void` | input behaviour |
| `onBlur` | no | `() => void` | input behaviour |
| `accessibilityLabel` | no | `string` | input behaviour |
| `children` | no | `React.ReactNode` | composition children |

### Text Field Label Props

| Prop | Required | Type | Notes |
| --- | --- | --- | --- |
| `children` | no | `string` | slot content |

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
