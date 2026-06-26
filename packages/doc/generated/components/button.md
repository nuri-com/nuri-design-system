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

| Part | Namespace | Token | Resolves to |
| --- | --- | --- | --- |
| `root` | `stack` | **direction** `row`<br>**align** `center`<br>**justify** `center` | —<br>—<br>— |
| `root` | `interactive` | `pressColor`<br>`pressScale`<br>`disabledOpacity` | —<br>—<br>— |

## Token map

| Axis | Value | Part | Namespace | Token | Resolves to |
| --- | --- | --- | --- | --- | --- |
| `variant` | `solid` | `root` | `palette` | **bg** `accent.solid`<br>**fg** `accent.onSolid`<br>**pressed** `accent.solidPressed` | <span class="nuri-doc-swatch" style="background:var(--nuri-accent-solid)"></span> `#12110b`<br><span class="nuri-doc-swatch" style="background:var(--nuri-accent-on-solid)"></span> `#f0eee3`<br><span class="nuri-doc-swatch" style="background:var(--nuri-accent-solid-pressed)"></span> `#242319` |
| `variant` | `soft` | `root` | `palette` | **bg** `chrome.bgStrong`<br>**fg** `chrome.textPrimary`<br>**muted** `chrome.textMuted`<br>**pressed** `chrome.bgPressed` | <span class="nuri-doc-swatch" style="background:var(--nuri-bg-strong)"></span> `#f3f1e2`<br><span class="nuri-doc-swatch" style="background:var(--nuri-text-primary)"></span> `#222013`<br><span class="nuri-doc-swatch" style="background:var(--nuri-text-muted)"></span> `#666455`<br><span class="nuri-doc-swatch" style="background:var(--nuri-bg-pressed)"></span> `#ece9da` |
| `variant` | `ghost` | `root` | `palette` | **bg** `transparent`<br>**fg** `chrome.textPrimary`<br>**muted** `chrome.textMuted`<br>**pressed** `chrome.bgSubtle` | <span class="nuri-doc-swatch" style="background:transparent"></span><br><span class="nuri-doc-swatch" style="background:var(--nuri-text-primary)"></span> `#222013`<br><span class="nuri-doc-swatch" style="background:var(--nuri-text-muted)"></span> `#666455`<br><span class="nuri-doc-swatch" style="background:var(--nuri-bg-subtle)"></span> `#fbf9ee` |
| `size` | `sm` | `root` | `box` | **minHeight** `size.md`<br>**paddingX** `space.md`<br>**radius** `radius.sm` | `36px`<br>`12px`<br>`6px` |
| `size` | `sm` | `label` | `typography` | **size** `smEm` | **fontSize** `15`<br>**lineHeight** `1.33`<br>**weight** `600`<br>**letterSpacing** `-0.01` |
| `size` | `md` | `root` | `box` | **minHeight** `size.lg`<br>**paddingX** `space.lg`<br>**radius** `radius.sm` | `48px`<br>`18px`<br>`6px` |
| `size` | `md` | `label` | `typography` | **size** `mdEm` | **fontSize** `17`<br>**lineHeight** `1.29`<br>**weight** `600`<br>**letterSpacing** `-0.02` |
| `size` | `lg` | `root` | `box` | **minHeight** `size.xl`<br>**paddingX** `space.xl`<br>**radius** `radius.md` | `60px`<br>`24px`<br>`12px` |
| `size` | `lg` | `label` | `typography` | **size** `mdEm` | **fontSize** `17`<br>**lineHeight** `1.29`<br>**weight** `600`<br>**letterSpacing** `-0.02` |
