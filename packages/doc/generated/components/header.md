---
title: Header
layout: default
nav_order: 16
---

<!-- GENERATED · DO NOT EDIT BY HAND · source: packages/rn/primitives/Header.tsx
     emitter: packages/doc/pipeline/docs.js · re-emit: `npm run build -w @nuri/doc` -->

# Header

`Header` is an intrinsic structural region in the host column, so the first layout clears it without a measurement callback. Only the sibling `Scroll` scrolls; `Header` remains visible in normal flow rather than through absolute positioning. `Header` owns the painted top safe-area strip. `chrome` paints the header body, while `safeAreaChrome` may independently paint the reserved strip with an existing semantic chrome role, as in `<Header safeAreaTop chrome="transparent" safeAreaChrome="canvas">`.

## API

| Prop | Required | Type | Notes |
| --- | --- | --- | --- |
| `chrome` | no | `'canvas' | 'subtle' | 'strong' | 'transparent'` | style axis |
| `direction` | no | `'row' | 'column'` | style axis |
| `align` | no | `'start' | 'center' | 'end' | 'stretch' | 'baseline'` | style axis |
| `justify` | no | `'start' | 'center' | 'end' | 'between' | 'around'` | style axis |
| `gap` | no | `'xs' | 'sm' | 'md' | 'lg' | 'xl'` | style axis |
| `paddingX` | no | `'xs' | 'sm' | 'md' | 'lg' | 'xl'` | style axis |
| `paddingY` | no | `'xs' | 'sm' | 'md' | 'lg' | 'xl'` | style axis |
| `paddingTop` | no | `'xs' | 'sm' | 'md' | 'lg' | 'xl'` | style axis |
| `paddingBottom` | no | `'xs' | 'sm' | 'md' | 'lg' | 'xl'` | style axis |
| `safeAreaTop` | no | `boolean` | safe-area reserve |
| `safeAreaChrome` | no | `'canvas' | 'subtle' | 'strong' | 'transparent'` | safe-area chrome role |
| `children` | no | `React.ReactNode` | default content slot |
| `testID` | no | `string` | native test hook |
| `onLayout` | no | `(event: LayoutChangeEvent) => void` | RN-only native layout event |
| `ref` | no | `React.Ref<React.ElementRef<typeof RNView>>` | RN-only native host ref |
