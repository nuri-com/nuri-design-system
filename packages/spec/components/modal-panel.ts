/* ───────────────────────────────────────────────────────────
 * NURI · COMPONENT DESCRIPTOR · MODAL PANEL · AUTHORED SOURCE
 *
 * One stable surface anatomy for both blocking presentations. `mode` changes
 * presentation geometry and chrome, never identity: consumers can move a live
 * subtree between sheet and full mode without remounting its content.
 * ────────────────────────────────────────────────────────── */

import type { Descriptor } from './schema';

type ModalPanelAxes = {
  mode: 'sheet' | 'full';
};

export const modalPanelDescriptor: Descriptor<ModalPanelAxes> = {
  structure: {
    anatomy: {
      el: 'view',
      open: true,
    },
    base: {
      root: {
        stack: { direction: 'column', align: 'stretch' },
        palette: { chrome: 'canvas' },
      },
    },
  },
  variants: {
    mode: {
      sheet: {
        root: {
          box: { radiusTop: 'lg' },
          effect: { elevation: 'raised' },
        },
      },
      full: {
        root: {
          stack: { fill: 'grow-shrink' },
        },
      },
    },
  },
  defaults: { mode: 'sheet' },
  api: {
    axes: ['mode'],
    themeScope: { accent: true },
    slots: {
      default: { part: 'root', kind: 'children', default: true, multiple: true },
    },
  },
};
