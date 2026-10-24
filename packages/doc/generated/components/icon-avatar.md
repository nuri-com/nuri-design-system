---
title: Icon Avatar
layout: default
nav_order: 4
---

<!-- GENERATED · DO NOT EDIT BY HAND · source: packages/rn/generated/components/icon-avatar.ts
     emitter: packages/doc/pipeline/docs.js · re-emit: `npm run build -w @nuri/doc` -->

# Icon Avatar

`IconAvatar` accepts exactly one of `icon`, `source` or `initials`; all three remain optional at the type level and a development warning catches none or several. When several are supplied, `source` wins, then `initials`, then `icon`; `initials=""` counts as absent. Size `md` is the 48px default with a 24px glyph; `sm` is the 24px compact circle with an 18px glyph. In image mode the bitmap fills the full circle and owns its translucent ring (`border-translucent` — black 10% in light, white 10% in dark). `initials` are one or two letters the caller derives and capitalises: the circle paints `soft` (`bg-strong`, `text-primary`) whatever `variant` or `accent` say, and the letters use the type step's own letter-spacing (`md` 17px regular on `md`, `xs` 13px on `sm`), stay on one line and truncate at the circle's edge. On React Native the initials keep a fixed size at every OS text size, because the avatar is decorative; the row text beside it scales. In image and initials mode the internal content-derived `mode` axis overrides the root's variant paint, so `variant` with `source` or `initials` is a no-op by mechanism. `accessory` lays a rail glyph on a disc over the bottom-end corner and is specified for `md` only: a 15px glyph with 3px padding (a 21px disc), pushed out by 3px, with a 2px ring in `bg-canvas`. `accessorySurface="canvas"` (the default) paints a canvas disc with a 1px `border-subtle` hairline; `"inverse"` paints the neutral inverse disc, which stays neutral under every accent. Without `accessory`, `accessorySurface` does nothing. The ring is always `bg-canvas`, so on another surface it shows as a canvas ring. `IconAvatar` is decorative and hidden from assistive tech, accessory included: the accessory is never the only carrier of the rail, so name the rail in visible row text or in the row's `accessibilityLabel` ("Emil Berg, Nuri user, @emil"; a handle is not a name).

## API

| Prop | Required | Type | Notes |
| --- | --- | --- | --- |
| `variant` | no | `'solid' | 'soft' | 'ghost' | 'subtle' | 'outline'` | style axis |
| `size` | no | `'sm' | 'md'` | style axis |
| `accessorySurface` | no | `'canvas' | 'inverse'` | style axis; md only |
| `accent` | no | `'neutral' | 'lilac' | 'orange'` | theme scope |
| `icon` | no | `IconName` | scalar icon name |
| `source` | no | `ImageSourcePropType` | image source |
| `initials` | no | `string` | scalar initials text |
| `accessory` | no | `IconName` | scalar icon name; md only |

> `children` is not accepted (`children?: never`).
