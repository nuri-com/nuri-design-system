---
title: NuriRoot
layout: default
nav_order: 23
---

<!-- GENERATED · DO NOT EDIT BY HAND · source: packages/rn/root.tsx
     emitter: packages/doc/pipeline/docs.js · re-emit: `npm run build -w @nuri/doc` -->

# NuriRoot

`NuriRoot` composes `NuriThemeProvider` → `OverlayProvider` → the canvas `View` → `NuriSafeAreaProvider` → `ToastProvider` in contractual order. The overlay shares the active theme while staying above safe-area padding, so its outlet covers the whole window; the toast reads the safe-area environment and bakes the top inset into its registered node. The DS View owns canvas background and foreground scope. Insets remain consumer-resolved plain numbers, and omitted edges default to `0`. This is provider composition, not a behavior controller: `NuriThemeProvider`, `OverlayProvider`, `NuriSafeAreaProvider`, and `ToastProvider` remain public for supported piecemeal assembly.

## API

| Prop | Required | Type | Notes |
| --- | --- | --- | --- |
| `mode` | no | `'light' | 'dark'` | theme selection; defaults to light |
| `accent` | no | `'neutral' | 'lilac' | 'orange'` | theme selection; defaults to lilac |
| `safeArea` | no | `{ top?: number; bottom?: number }` | consumer-resolved inset numbers |
| `children` | yes | `React.ReactNode` | default content slot |
