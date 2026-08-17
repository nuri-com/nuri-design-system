---
title: Colour Semantic
layout: default
nav_order: 4
---

<!-- GENERATED · DO NOT EDIT BY HAND · source: packages/spec/tokens/colours.ts
     emitter: packages/doc/pipeline/docs.js · re-emit: `npm run build -w @nuri/doc` -->

# Colour Semantic

The colour semantics — the cascade’s L2 role matrix, composed from the [primitives](colour-primitive.html) by reference: **chrome** (theme-only · the neutral surface) and **accent** (accent × theme). Each role names a primitive (the `{ref}` cascade) and resolves to a live `var()` swatch at the page scope (the default is neutral accent · light theme). This is the full set the palette **axis** samples a slice of.

## Chrome

| Role | Cascade | Resolves to |
| --- | --- | --- |
| `bg-canvas` | `neutral.1.light` | <span class="nuri-doc-swatch" style="background:var(--nuri-bg-canvas)"></span> `#fffdf2` |
| `bg-subtle` | `neutral.2.light` | <span class="nuri-doc-swatch" style="background:var(--nuri-bg-subtle)"></span> `#fbf9ee` |
| `bg-strong` | `neutral.3.light` | <span class="nuri-doc-swatch" style="background:var(--nuri-bg-strong)"></span> `#f3f1e2` |
| `bg-pressed` | `neutral.4.light` | <span class="nuri-doc-swatch" style="background:var(--nuri-bg-pressed)"></span> `#ece9da` |
| `bg-inverse` | `neutral.1.dark` | <span class="nuri-doc-swatch" style="background:var(--nuri-bg-inverse)"></span> `#12110b` |
| `bg-inverse-muted` | `neutral.11.light` | <span class="nuri-doc-swatch" style="background:var(--nuri-bg-inverse-muted)"></span> `#666455` |
| `text-primary` | `neutral.12.light` | <span class="nuri-doc-swatch" style="background:var(--nuri-text-primary)"></span> `#222013` |
| `text-muted` | `neutral.11.light` | <span class="nuri-doc-swatch" style="background:var(--nuri-text-muted)"></span> `#666455` |
| `text-on-inverse` | `neutral.12.dark` | <span class="nuri-doc-swatch" style="background:var(--nuri-text-on-inverse)"></span> `#f0eee3` |
| `border-subtle` | `neutral.6.light` | <span class="nuri-doc-swatch" style="background:var(--nuri-border-subtle)"></span> `#dddac9` |
| `border-default` | `neutral.7.light` | <span class="nuri-doc-swatch" style="background:var(--nuri-border-default)"></span> `#d2cfbf` |
| `border-strong` | `neutral.8.light` | <span class="nuri-doc-swatch" style="background:var(--nuri-border-strong)"></span> `#bfbcac` |
| `border-translucent` | `black-alpha.2` | <span class="nuri-doc-swatch" style="background:var(--nuri-border-translucent)"></span> `rgba(0, 0, 0, 0.10)` |
| `focus-ring` | `lilac.8.light` | <span class="nuri-doc-swatch" style="background:var(--nuri-focus-ring)"></span> `#ae91ff` |

## Accent

| Role | Cascade | Resolves to |
| --- | --- | --- |
| `accent-fg` | `neutral.12.light` | <span class="nuri-doc-swatch" style="background:var(--nuri-accent-fg)"></span> `#222013` |
| `accent-solid` | `neutral.1.dark` | <span class="nuri-doc-swatch" style="background:var(--nuri-accent-solid)"></span> `#12110b` |
| `accent-solid-pressed` | `neutral.3.dark` | <span class="nuri-doc-swatch" style="background:var(--nuri-accent-solid-pressed)"></span> `#242319` |
| `accent-on-solid` | `neutral.12.dark` | <span class="nuri-doc-swatch" style="background:var(--nuri-accent-on-solid)"></span> `#f0eee3` |
| `accent-bg-subtle` | `neutral.3.light` | <span class="nuri-doc-swatch" style="background:var(--nuri-accent-bg-subtle)"></span> `#f3f1e2` |
| `accent-bg-subtle-pressed` | `neutral.4.light` | <span class="nuri-doc-swatch" style="background:var(--nuri-accent-bg-subtle-pressed)"></span> `#ece9da` |
