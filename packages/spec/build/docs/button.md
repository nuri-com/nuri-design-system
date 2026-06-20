---
title: Button
layout: default
nav_order: 1
---

<!-- GENERATED · DO NOT EDIT BY HAND · source: build/descriptors/composition-button.ts
     emitter: pipeline/parsers/docs.js · re-emit: `npm run build -w @nuri/spec` -->

# Button

## Example

{% include demo/button.html %}

## API

| Axis | Values |
| --- | --- |
| `variant` | `solid` · `soft` · `ghost` |
| `size` | `sm` · `md` · `lg` |

## Anatomy

- **root** · `view`
  - **label** · `text`

## Base

| Part | Namespace | Resolves to |
| --- | --- | --- |
| `root` | `stack` | **direction** `row`<br>**align** `center`<br>**justify** `center` |
| `root` | `interactive` | `pressColor`<br>`pressScale`<br>`disabledOpacity` |

## Token map

| Axis | Value | Part | Namespace | Resolves to |
| --- | --- | --- | --- | --- |
| `variant` | `solid` | `root` | `palette` | **bg** `accent.solid`<br>**fg** `accent.onSolid`<br>**pressed** `accent.solidPressed` |
| `variant` | `soft` | `root` | `palette` | **bg** `chrome.bgStrong`<br>**fg** `chrome.textPrimary`<br>**muted** `chrome.textMuted`<br>**pressed** `chrome.bgPressed` |
| `variant` | `ghost` | `root` | `palette` | **bg** `transparent`<br>**fg** `chrome.textPrimary`<br>**muted** `chrome.textMuted`<br>**pressed** `chrome.bgSubtle` |
| `size` | `sm` | `root` | `box` | **minHeight** `size.md`<br>**paddingX** `space.md`<br>**radius** `radius.sm` |
| `size` | `sm` | `label` | `typography` | **size** `smEm` |
| `size` | `md` | `root` | `box` | **minHeight** `size.lg`<br>**paddingX** `space.lg`<br>**radius** `radius.sm` |
| `size` | `md` | `label` | `typography` | **size** `mdEm` |
| `size` | `lg` | `root` | `box` | **minHeight** `size.xl`<br>**paddingX** `space.xl`<br>**radius** `radius.md` |
| `size` | `lg` | `label` | `typography` | **size** `mdEm` |
