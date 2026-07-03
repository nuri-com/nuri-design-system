/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT DESCRIPTOR · LIST · AUTHORED SOURCE
 *
 * The open host for the LIST FAMILY (`list` · `list-action` ·
 * `list-separator`). It names no row parts: rows and separators are positional
 * siblings authored by the consumer, matching the tab-bar/tab-bar-item family
 * shape. The screen content column owns page layout; the list owns the small
 * horizontal breathing room around its rows.
 * ────────────────────────────────────────────────────────────── */

import type { Descriptor } from './schema';

type ListAxes = {};

export const listDescriptor: Descriptor<ListAxes> = {
  structure: {
    anatomy: {
      el: 'view',
      open: true,
    },
    base: {
      root: {
        stack: { direction: 'column', align: 'stretch' },
        box: { paddingX: 'sm' },
      },
    },
  },
  api: {
    axes: [],
    themeScope: { accent: true },
    slots: {
      default: { part: 'root', kind: 'children', default: true, multiple: true },
    },
  },
};
