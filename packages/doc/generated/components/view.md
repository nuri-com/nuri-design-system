---
title: View
layout: default
nav_order: 11
---

<!-- GENERATED · DO NOT EDIT BY HAND · source: packages/rn/primitives/View.tsx
     emitter: packages/doc/pipeline/docs.js · re-emit: `npm run build -w @nuri/doc` -->

# View

Column layout uses `<View>` with the schema default direction; rows use `direction="row"`.

## API

| Prop | Required | Type | Notes |
| --- | --- | --- | --- |
| `width` | no | `'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'` | style axis |
| `height` | no | `'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'` | style axis |
| `minHeight` | no | `'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'` | style axis |
| `minWidth` | no | `'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'` | style axis |
| `padding` | no | `'xs' | 'sm' | 'md' | 'lg' | 'xl'` | style axis |
| `paddingX` | no | `'xs' | 'sm' | 'md' | 'lg' | 'xl'` | style axis |
| `paddingY` | no | `'xs' | 'sm' | 'md' | 'lg' | 'xl'` | style axis |
| `paddingStart` | no | `'xs' | 'sm' | 'md' | 'lg' | 'xl'` | style axis |
| `paddingEnd` | no | `'xs' | 'sm' | 'md' | 'lg' | 'xl'` | style axis |
| `paddingTop` | no | `'xs' | 'sm' | 'md' | 'lg' | 'xl'` | style axis |
| `paddingBottom` | no | `'xs' | 'sm' | 'md' | 'lg' | 'xl'` | style axis |
| `radius` | no | `'sm' | 'md' | 'lg' | 'full'` | style axis |
| `radiusTop` | no | `'sm' | 'md' | 'lg' | 'full'` | style axis |
| `aspectRatio` | no | `'square' | 'card'` | style axis |
| `direction` | no | `'row' | 'column'` | style axis |
| `align` | no | `'start' | 'center' | 'end' | 'stretch' | 'baseline'` | style axis |
| `justify` | no | `'start' | 'center' | 'end' | 'between' | 'around'` | style axis |
| `gap` | no | `'xs' | 'sm' | 'md' | 'lg' | 'xl'` | style axis |
| `wrap` | no | `boolean` | style axis |
| `fill` | no | `'grow' | 'grow-shrink' | 'even' | 'hug'` | style axis |
| `distribute` | no | `'even'` | component prop |
| `variant` | no | `'solid' | 'soft' | 'ghost' | 'subtle' | 'outline'` | style axis |
| `accent` | no | `'neutral' | 'lilac' | 'orange'` | theme scope |
| `muted` | no | `boolean` | style axis |
| `chrome` | no | `'canvas' | 'subtle' | 'strong' | 'transparent'` | style axis |
| `elevation` | no | `'none' | 'raised'` | style axis |
| `children` | no | `React.ReactNode` | default content slot |
| `testID` | no | `string` | native test hook |
| `onLayout` | no | `(event: LayoutChangeEvent) => void` | RN-only native layout event |
| `ref` | no | `React.Ref<React.ElementRef<typeof RNView>>` | RN-only native host ref |
