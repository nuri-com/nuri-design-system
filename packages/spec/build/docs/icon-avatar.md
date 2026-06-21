---
title: Icon Avatar
layout: default
nav_order: 2
---

<!-- GENERATED · DO NOT EDIT BY HAND · source: build/descriptors/icon-avatar.ts
     emitter: pipeline/parsers/docs.js · re-emit: `npm run build -w @nuri/spec` -->

# Icon Avatar

## Example

{% include demo/icon-avatar.html %}

## API

| Axis | Values |
| --- | --- |
| `variant` | `solid` · `soft` · `ghost` · `subtle` |

## Anatomy

- **root** · `view`
  - **icon** · `icon`

## Base

| Part | Namespace | Resolves to |
| --- | --- | --- |
| `root` | `stack` | **align** `center`<br>**justify** `center` |
| `root` | `box` | **width** `size.lg` `48px`<br>**height** `size.lg` `48px`<br>**radius** `radius.full` `9999px` |

## Token map

| Axis | Value | Part | Namespace | Resolves to |
| --- | --- | --- | --- | --- |
| `variant` | `solid` | `root` | `palette` | **bg** `accent.solid` <span class="nuri-doc-swatch" style="background:var(--nuri-accent-solid)"></span> `#12110b`<br>**fg** `accent.onSolid` <span class="nuri-doc-swatch" style="background:var(--nuri-accent-on-solid)"></span> `#f0eee3`<br>**pressed** `accent.solidPressed` <span class="nuri-doc-swatch" style="background:var(--nuri-accent-solid-pressed)"></span> `#242319` |
| `variant` | `soft` | `root` | `palette` | **bg** `chrome.bgStrong` <span class="nuri-doc-swatch" style="background:var(--nuri-bg-strong)"></span> `#f3f1e2`<br>**fg** `chrome.textPrimary` <span class="nuri-doc-swatch" style="background:var(--nuri-text-primary)"></span> `#222013`<br>**muted** `chrome.textMuted` <span class="nuri-doc-swatch" style="background:var(--nuri-text-muted)"></span> `#666455`<br>**pressed** `chrome.bgPressed` <span class="nuri-doc-swatch" style="background:var(--nuri-bg-pressed)"></span> `#ece9da` |
| `variant` | `ghost` | `root` | `palette` | **bg** `transparent` <span class="nuri-doc-swatch" style="background:transparent"></span><br>**fg** `chrome.textPrimary` <span class="nuri-doc-swatch" style="background:var(--nuri-text-primary)"></span> `#222013`<br>**muted** `chrome.textMuted` <span class="nuri-doc-swatch" style="background:var(--nuri-text-muted)"></span> `#666455`<br>**pressed** `chrome.bgSubtle` <span class="nuri-doc-swatch" style="background:var(--nuri-bg-subtle)"></span> `#fbf9ee` |
| `variant` | `subtle` | `root` | `palette` | **fg** `chrome.borderStrong` <span class="nuri-doc-swatch" style="background:var(--nuri-border-strong)"></span> `#bfbcac` |
