/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT DESCRIPTOR · BOTTOM SHEET PANEL · AUTHORED SOURCE
 *
 * The descriptor-backed visual part for the bottom-sheet family. The
 * behavioural sheet host (gestures, detents, layering) is NOT a descriptor;
 * this panel is the semantic surface that receives positional children.
 *
 * Panel chrome is normal axis composition. Runtime sheet behaviour (scrim,
 * detents, gestures, layering) belongs to the structural BottomSheet primitive.
 * ────────────────────────────────────────────────────────────── */

import type { Descriptor } from './schema';

type BottomSheetPanelAxes = {};

export const bottomSheetPanelDescriptor: Descriptor<BottomSheetPanelAxes> = {
  structure: {
    anatomy: {
      el: 'view',
      open: true,
    },
    base: {
      root: {
        stack: { direction: 'column', align: 'stretch', fill: 'grow' },
        palette: { chrome: 'canvas' },
        box: { radiusTop: 'lg', paddingBottom: 'lg' },
        effect: { elevation: 'raised' },
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
