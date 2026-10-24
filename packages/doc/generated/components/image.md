---
title: Image
layout: default
nav_order: 14.5
---

<!-- GENERATED · DO NOT EDIT BY HAND · source: packages/rn/primitives/Image.tsx
     emitter: packages/doc/pipeline/docs.js · re-emit: `npm run build -w @nuri/doc` -->

# Image

`Image` / `<nuri-image>` is the free-standing bitmap leaf: box geometry only (no stack, palette, or interactive axes), `fit` as `cover` or `contain` (`cover` by default), and the always-on translucent blend ring that keeps light bitmaps defined on matching surfaces.

## API

| Prop | Required | Type | Notes |
| --- | --- | --- | --- |
| `width` | no | `'2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'` | style axis |
| `height` | no | `'2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'` | style axis |
| `minHeight` | no | `'2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'` | style axis |
| `minWidth` | no | `'2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'` | style axis |
| `padding` | no | `'xs' | 'sm' | 'md' | 'lg' | 'xl'` | style axis |
| `paddingX` | no | `'xs' | 'sm' | 'md' | 'lg' | 'xl'` | style axis |
| `paddingY` | no | `'xs' | 'sm' | 'md' | 'lg' | 'xl'` | style axis |
| `paddingStart` | no | `'xs' | 'sm' | 'md' | 'lg' | 'xl'` | style axis |
| `paddingEnd` | no | `'xs' | 'sm' | 'md' | 'lg' | 'xl'` | style axis |
| `paddingTop` | no | `'xs' | 'sm' | 'md' | 'lg' | 'xl'` | style axis |
| `paddingBottom` | no | `'xs' | 'sm' | 'md' | 'lg' | 'xl'` | style axis |
| `radius` | no | `'sm' | 'md' | 'lg' | 'full'` | style axis |
| `radiusTop` | no | `'sm' | 'md' | 'lg' | 'full'` | style axis |
| `aspectRatio` | no | `'square' | 'card' | 'portrait' | 'banner'` | style axis |
| `clip` | no | `boolean` | style axis |
| `source` | yes | `ImageSourcePropType` | image source |
| `fit` | no | `'cover' | 'contain'` | image fit |
| `accessibilityLabel` | no | `string` | accessible name; absent means decorative |
| `testID` | no | `string` | native test hook |
| `onLayout` | no | `(event: LayoutChangeEvent) => void` | RN-only native layout event |
| `ref` | no | `React.Ref<React.ElementRef<typeof RNImage>>` | RN-only native host ref |

## Sizing

An image's layout never follows its asset's pixel size. React Native applies a bundled static resource's intrinsic dimensions as the Image's default width and height (react-native-web does the same from the asset registry); `Image` neutralises that default, so the only sizing inputs are the box props and the row. Declare `aspectRatio` plus one dimension, or let the row stretch it (`align="stretch"`) with an `aspectRatio` so the other axis follows — the media-card photo column is `<Image aspectRatio="portrait" />` beside a growing text column inside a `clip aspectRatio="banner"` row. The web `<img>` falls back to its natural ratio only when `aspectRatio` is absent, so always pass one.

## Accessibility

Without `accessibilityLabel` (web `accessibility-label`) the image is DECORATIVE on both projections: RN `accessible={false}`, web `alt=""` with `aria-hidden`. With a label it is an announced image carrying that name. A pressable image is `<Pressable><Image /></Pressable>` — Image has no interaction channel of its own.
