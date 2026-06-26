---
title: Icon Avatar
layout: default
nav_order: 2
---

<!-- GENERATED · DO NOT EDIT BY HAND · source: packages/spec/build/descriptors/icon-avatar.ts
     emitter: packages/doc/pipeline/docs.js · re-emit: `npm run build -w @nuri/doc` -->

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

| Part | Namespace | Token | Resolves to |
| --- | --- | --- | --- |
| `root` | `stack` | **align** `center`<br>**justify** `center` | —<br>— |
| `root` | `box` | **width** `size.lg`<br>**height** `size.lg`<br>**radius** `radius.full` | `48px`<br>`48px`<br>`9999px` |

## Token map

| Axis | Value | Part | Namespace | Token | Resolves to |
| --- | --- | --- | --- | --- | --- |
| `variant` | `solid` | `root` | `palette` | **bg** `accent.solid`<br>**fg** `accent.onSolid`<br>**pressed** `accent.solidPressed` | <span class="nuri-doc-swatch" style="background:var(--nuri-accent-solid)"></span> `#12110b`<br><span class="nuri-doc-swatch" style="background:var(--nuri-accent-on-solid)"></span> `#f0eee3`<br><span class="nuri-doc-swatch" style="background:var(--nuri-accent-solid-pressed)"></span> `#242319` |
| `variant` | `soft` | `root` | `palette` | **bg** `chrome.bgStrong`<br>**fg** `chrome.textPrimary`<br>**muted** `chrome.textMuted`<br>**pressed** `chrome.bgPressed` | <span class="nuri-doc-swatch" style="background:var(--nuri-bg-strong)"></span> `#f3f1e2`<br><span class="nuri-doc-swatch" style="background:var(--nuri-text-primary)"></span> `#222013`<br><span class="nuri-doc-swatch" style="background:var(--nuri-text-muted)"></span> `#666455`<br><span class="nuri-doc-swatch" style="background:var(--nuri-bg-pressed)"></span> `#ece9da` |
| `variant` | `ghost` | `root` | `palette` | **bg** `transparent`<br>**fg** `chrome.textPrimary`<br>**muted** `chrome.textMuted`<br>**pressed** `chrome.bgSubtle` | <span class="nuri-doc-swatch" style="background:transparent"></span><br><span class="nuri-doc-swatch" style="background:var(--nuri-text-primary)"></span> `#222013`<br><span class="nuri-doc-swatch" style="background:var(--nuri-text-muted)"></span> `#666455`<br><span class="nuri-doc-swatch" style="background:var(--nuri-bg-subtle)"></span> `#fbf9ee` |
| `variant` | `subtle` | `root` | `palette` | **fg** `chrome.borderStrong` | <span class="nuri-doc-swatch" style="background:var(--nuri-border-strong)"></span> `#bfbcac` |
