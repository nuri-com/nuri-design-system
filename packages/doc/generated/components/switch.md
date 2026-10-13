---
title: Switch
layout: default
nav_order: 26
---

<!-- GENERATED · DO NOT EDIT BY HAND · source: packages/rn/generated/components/switch.ts
     emitter: packages/doc/pipeline/docs.js · re-emit: `npm run build -w @nuri/doc` -->

# Switch

`Switch` is the binary setting toggle: one 60×36 pill whose thumb parks at the end when `checked` and at the start otherwise. The on track paints the accent solid; the off track paints the accent-invariant `chrome.inverse-muted`; the thumb is always `chrome.canvas`, so it lifts off either track. It is controlled and dumb: `checked` is the consumer's value and `onPress` is where the consumer flips it — no `value`/`onValueChange`, no uncontrolled mode. It announces as a switch with its checked state on both targets and carries no press-down effect (the thumb snap on release is the feedback). It has no visible text, so pass an `accessibilityLabel` — or prefer `ListSwitch` where a label row is the real control.

## API

| Prop | Required | Type | Notes |
| --- | --- | --- | --- |
| `accent` | no | `'neutral' | 'lilac' | 'orange'` | theme scope |
| `onPress` | no | `() => void` | pressable behaviour |
| `disabled` | no | `boolean` | pressable behaviour |
| `accessibilityLabel` | no | `string` | pressable behaviour |
| `checked` | no | `boolean` | state axis |

> `children` is not accepted (`children?: never`).
