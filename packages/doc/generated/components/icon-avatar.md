---
title: Icon Avatar
layout: default
nav_order: 4
---

<!-- GENERATED · DO NOT EDIT BY HAND · source: packages/rn/generated/components/icon-avatar.ts
     emitter: packages/doc/pipeline/docs.js · re-emit: `npm run build -w @nuri/doc` -->

# Icon Avatar

`IconAvatar` accepts exactly one of `icon` or `source`; both remain optional at the type level and a development warning catches both/neither. `source` wins when both are supplied. Size `md` is the 48px default with a 24px glyph; `sm` is the 24px compact circle with an 18px glyph. In image mode the bitmap fills the full circle and owns its translucent ring (`border-translucent` — black 10% in light, white 10% in dark); the root's variant paint is suppressed by the internal content-derived `mode` axis, so `variant` with `source` is a no-op by mechanism.

## API

| Prop | Required | Type | Notes |
| --- | --- | --- | --- |
| `variant` | no | `'solid' | 'soft' | 'ghost' | 'subtle' | 'outline'` | style axis |
| `size` | no | `'sm' | 'md'` | style axis |
| `accent` | no | `'neutral' | 'lilac' | 'orange'` | theme scope |
| `icon` | no | `IconName` | scalar icon name |
| `source` | no | `ImageSourcePropType` | image source |

> `children` is not accepted (`children?: never`).
