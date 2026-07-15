---
title: Modal
layout: default
nav_order: 21
---

<!-- GENERATED · DO NOT EDIT BY HAND · source: packages/rn/primitives/Modal.tsx
     emitter: packages/doc/pipeline/docs.js · re-emit: `npm run build -w @nuri/doc` -->

# Modal

## API

| Prop | Required | Type | Notes |
| --- | --- | --- | --- |
| `open` | no | `boolean` | modal behaviour |
| `mode` | yes | `'sheet' | 'full'` | presentation mode |
| `scrim` | no | `'none' | 'dim'` | sheet-mode behaviour |
| `dismissible` | no | `boolean` | modal behaviour |
| `onOpenChange` | no | `(open: boolean) => void` | modal behaviour |
| `onOpenComplete` | no | `() => void` | post-enter lifecycle |
| `children` | no | `React.ReactNode` | default content slot |
