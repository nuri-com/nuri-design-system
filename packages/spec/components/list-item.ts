/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT DESCRIPTOR · LIST-ITEM · AUTHORED SOURCE
 *
 * The NON-PRESSABLE row of the LIST FAMILY (`list` · `list-action` ·
 * `list-switch` · `list-item` · `list-separator`). Decision 84 reserved the name
 * for this row; nuri-com/nuri-design-system#240 admitted it. A read-only fact in
 * a list: a muted label over a value, with an optional muted suffix on the
 * value's line ("You send" over "₿ 22 450 € 21.17"). It is never an action: no
 * press, focus, wash, chevron, selection, copy or reveal, and the slots are text
 * only. Each text is read on its own, in screen order (the single-element
 * reading is a later request).
 *
 * THE ORDER IS THE AUTHOR'S. The three singular slots render in the order they
 * are written, through the shared classifier (composition/classify.js), both
 * between the two lines (the review sheet writes the label first) and inside
 * the value's line (value first, then suffix). `text` is required. The `content`
 * column and the `line` row are internal anatomy: the leaf slots auto-route into
 * them, so authors never write wrappers. `text` and `textMuted` are list-action's
 * words, singular here (list-action's are `multiple`).
 *
 * THE 60 FLOOR IS A RECORDED EXCEPTION to the 72 list-row rhythm (operator
 * ruling 2026-10-14 · #240 choice 5). Here the author-placed `list-separator`s
 * (decision 49) complete the rhythm: a 60 row plus the separator's 6 above and
 * 6 below its hairline, so rows come every 73, with 13.9 between the text and
 * each hairline. The geometry holds inside `nuri-list`, between separators; the
 * screen adds 6 above and below the list; the row is never mixed with
 * `list-action` (85 against 73) in one list. Lines are 3 apart (`xs`), where
 * list-action and list-switch keep 0.
 *
 * The value truncates first (`fill: 'shrink'`); the suffix never shrinks
 * (`fill: 'hug'`), the same on both targets, so it is for short text: a
 * handle, an amount, an expiry. Identifiers are abbreviated by the author with
 * the ellipsis in the middle ("bc1q…5mdq"), never mono in this row.
 *
 * PURE DATA (no theme thunk · 65.3 §7): structure { anatomy, base } in SEMANTIC
 * names; the platform-native engine resolves them.
 * ────────────────────────────────────────────────────────────── */

import type { Descriptor } from './schema';

type ListItemAxes = {};

export const listItemDescriptor: Descriptor<ListItemAxes> = {
  structure: {
    anatomy: {
      el: 'view',
      parts: {
        content: {
          el: 'view',
          parts: {
            textMuted: { el: 'text' },
            line: { el: 'view', parts: { text: { el: 'text' }, textSuffix: { el: 'text' } } },
          },
        },
      },
    },
    base: {
      // Sides ≡ list-action (md), so the text lines up with list-separator's
      // hairline. 60 tall (`xl`) with 6 above and below: list-separator's 6 + 6
      // make up the rest, so rows follow each other every 73 (#240 choice 5).
      root: {
        stack: { direction: 'row', align: 'center', gap: 'md' },
        box: { paddingX: 'md', paddingY: 'sm', minHeight: 'xl' },
      },
      // The lines stack in the order the author writes them; 3 between (choice 2).
      content: {
        stack: { direction: 'column', align: 'stretch', justify: 'center', gap: 'xs', fill: 'grow-shrink' },
      },
      // The label.
      textMuted: { typography: { size: 'sm', align: 'start', flow: 'truncate', lines: 1 }, palette: { muted: true } },
      line: { stack: { direction: 'row', align: 'center', gap: 'xs' } },
      // The value: md emphasis, one line; it truncates first when the line is too long.
      text: {
        stack: { fill: 'shrink' },
        typography: { size: 'md', emphasis: true, align: 'start', flow: 'truncate', lines: 1 },
      },
      // Next to the value, 3 after it: "₿ 4 802 € 4.53". It never shrinks, on either target.
      textSuffix: {
        stack: { fill: 'hug' },
        typography: { size: 'md', align: 'start', flow: 'truncate', lines: 1 },
        palette: { muted: true },
      },
    },
  },
  api: {
    // No axis: the order is the author's. No behaviour: the row is not a control.
    axes: [],
    slots: {
      textMuted: { part: 'textMuted', kind: 'text', component: true },
      text: { part: 'text', kind: 'text', component: true, required: true },
      textSuffix: { part: 'textSuffix', kind: 'text', component: true },
    },
  },
};
