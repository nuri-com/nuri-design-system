---
title: Topbar
layout: default
nav_order: 3
---

<!-- GENERATED · DO NOT EDIT BY HAND · source: packages/spec/components/topbar.ts
     emitter: packages/doc/pipeline/docs.js · re-emit: `npm run build -w @nuri/doc` -->

# Topbar

## Example

{% include demo/topbar.html %}

## API

| Axis | Values |
| --- | --- |

## Anatomy

- **root** · `view` · `open`
  - **leading** · `view`
  - **center** · `view`
  - **trailing** · `view`

## Base

| Part | Namespace | Token | Resolves to |
| --- | --- | --- | --- |
| `root` | `stack` | **direction** `row`<br>**align** `center`<br>**gap** `space.sm` | —<br>—<br>`6px` |
| `root` | `box` | **height** `size.lg`<br>**paddingStart** `space.lg`<br>**paddingEnd** `space.lg` | `48px`<br>`18px`<br>`18px` |
| `root` | `palette` | **bg** `chrome.bgCanvas`<br>**fg** `chrome.textPrimary`<br>**muted** `chrome.textMuted` | <span class="nuri-doc-swatch" style="background:var(--nuri-bg-canvas)"></span> `#fffdf2`<br><span class="nuri-doc-swatch" style="background:var(--nuri-text-primary)"></span> `#222013`<br><span class="nuri-doc-swatch" style="background:var(--nuri-text-muted)"></span> `#666455` |
| `leading` | `stack` | **direction** `row`<br>**align** `center`<br>**fill** `even` | —<br>—<br>— |
| `center` | `stack` | **direction** `row`<br>**align** `center`<br>**justify** `center` | —<br>—<br>— |
| `trailing` | `stack` | **direction** `row`<br>**align** `center`<br>**justify** `end`<br>**fill** `even` | —<br>—<br>—<br>— |

## Token map

| Axis | Value | Part | Namespace | Token | Resolves to |
| --- | --- | --- | --- | --- | --- |
