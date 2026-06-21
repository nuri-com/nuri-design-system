---
title: Topbar
layout: default
nav_order: 3
---

<!-- GENERATED · DO NOT EDIT BY HAND · source: build/descriptors/topbar.ts
     emitter: pipeline/parsers/docs.js · re-emit: `npm run build -w @nuri/spec` -->

# Topbar

## Example

{% include demo/topbar.html %}

## API

| Axis | Values |
| --- | --- |
| `center` | `false` · `true` |

## Anatomy

- **root** · `view` · `open`
  - **content** · `view`

## Base

| Part | Namespace | Token | Resolves to |
| --- | --- | --- | --- |
| `root` | `stack` | **direction** `row`<br>**align** `center`<br>**gap** `space.sm` | —<br>—<br>`6px` |
| `root` | `box` | **height** `size.lg`<br>**paddingStart** `space.lg`<br>**paddingEnd** `space.lg` | `48px`<br>`18px`<br>`18px` |
| `root` | `palette` | **bg** `chrome.bgCanvas`<br>**fg** `chrome.textPrimary`<br>**muted** `chrome.textMuted` | <span class="nuri-doc-swatch" style="background:var(--nuri-bg-canvas)"></span> `#fffdf2`<br><span class="nuri-doc-swatch" style="background:var(--nuri-text-primary)"></span> `#222013`<br><span class="nuri-doc-swatch" style="background:var(--nuri-text-muted)"></span> `#666455` |
| `content` | `stack` | **fill** `grow-shrink` | — |

## Token map

| Axis | Value | Part | Namespace | Token | Resolves to |
| --- | --- | --- | --- | --- | --- |
| `center` | `true` | `content` | `stack` | **align** `center`<br>**justify** `center` | —<br>— |
