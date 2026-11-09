---
title: List
layout: default
nav_order: 5
---

<!-- GENERATED · DO NOT EDIT BY HAND · source: packages/rn/generated/components/list.ts
     emitter: packages/doc/pipeline/docs.js · re-emit: `npm run build -w @nuri/doc` -->

# List

`List` holds the List family's rows as positional children: `ListAction` (a pressable row), `ListSwitch` (a row that is one switch) and `ListItem` (a read-only row), with an author-placed `ListSeparator` between two rows. Keep `ListItem` rows apart from the pressable rows: between separators, `ListItem` rows come every 73px and the pressable rows every 85px, so a mixed list breaks the rhythm.

## API

| Prop | Required | Type | Notes |
| --- | --- | --- | --- |
| `accent` | no | `'neutral' | 'lilac' | 'orange'` | theme scope |
| `children` | no | `React.ReactNode` | default content slot |
