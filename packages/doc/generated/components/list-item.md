---
title: List Item
layout: default
nav_order: 28
---

<!-- GENERATED · DO NOT EDIT BY HAND · source: packages/rn/generated/components/list-item.ts
     emitter: packages/doc/pipeline/docs.js · re-emit: `npm run build -w @nuri/doc` -->

# List Item

`ListItem` is the read-only row of the List family: a fact in a list, never an action. It takes no press, focus, wash, chevron, selection or copy action, and screen readers read its texts one by one, in screen order. Compose `ListItemTextMuted` (the label, `sm` muted), `ListItemText` (the value, `md` emphasis, required) and `ListItemTextSuffix` (`md` muted, 3px after the value on its line). Each appears at most once, unlike the repeatable `ListActionText` and `ListActionTextMuted`. They render in the order you write them, both between the lines and inside the value's line: write the value first, then the suffix. The value truncates first and the suffix never shrinks, so keep the suffix short: a handle, an amount, an expiry. Abbreviate identifiers yourself, with the ellipsis in the middle ("bc1q…5mdq"), because the value truncates at its end. The row is 60px tall, with 12px at the sides, 6px above and below, and 3px between the lines, where `ListAction` and `ListSwitch` are 72px tall with no gap. Place `ListItem` rows inside `List` with a `ListSeparator` between each pair: the rows then come every 73px. The first and last rows have no separator outside them, so the screen adds 6px above and below the list. Do not mix `ListItem` with `ListAction` in one list.

## API

### List Item Props

| Prop | Required | Type | Notes |
| --- | --- | --- | --- |
| `children` | no | `React.ReactNode` | composition children |

### List Item Text Muted Props

| Prop | Required | Type | Notes |
| --- | --- | --- | --- |
| `children` | no | `React.ReactNode` | slot content |

### List Item Text Props

| Prop | Required | Type | Notes |
| --- | --- | --- | --- |
| `children` | yes | `React.ReactNode` | slot content |

### List Item Text Suffix Props

| Prop | Required | Type | Notes |
| --- | --- | --- | --- |
| `children` | no | `React.ReactNode` | slot content |
