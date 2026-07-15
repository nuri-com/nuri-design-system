---
title: Icon Avatar
layout: default
nav_order: 4
---

<!-- GENERATED · DO NOT EDIT BY HAND · source: packages/rn/generated/components/icon-avatar.ts
     emitter: packages/doc/pipeline/docs.js · re-emit: `npm run build -w @nuri/doc` -->

# Icon Avatar

`IconAvatar` accepts exactly one of `icon` or `source`; both remain optional at the type level and a development warning catches both/neither. `source` wins when both are supplied. Size `md` is the 48px default and `sm` is 36px; the glyph remains 24px at either size. In image mode the image fills the circle and owns its hairline ring; `variant` still paints the occluded root, so `variant="outline"` with `source` is a no-op by convention.

## API

| Prop | Required | Type | Notes |
| --- | --- | --- | --- |
| `variant` | no | `'solid' | 'soft' | 'ghost' | 'subtle' | 'outline'` | style axis |
| `size` | no | `'sm' | 'md'` | style axis |
| `accent` | no | `'neutral' | 'lilac' | 'orange'` | theme scope |
| `icon` | no | `IconName` | scalar icon name |
| `source` | no | `ImageSourcePropType` | image source |

> `children` is not accepted (`children?: never`).
