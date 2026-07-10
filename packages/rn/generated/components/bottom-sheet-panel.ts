/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · BOTTOM-SHEET-PANEL · GENERATED RN API ADAPTER · DO NOT EDIT BY HAND
 *
 * The exact public export for `bottom-sheet-panel` (Path C component-API). `{Name}Props`
 * is emitted from the descriptor's `api` (packages/spec/components/bottom-sheet-panel.ts);
 * the component adapter normalizes public props into selection, content,
 * behaviour, and optional accent scope before calling the shared descriptor renderer.
 *
 * Source · the authored descriptor `api`+`variants`. Emitter · scripts/parsers/
 * components-api.js — run `npm run build`. Committed (decision 35) · the re-emit
 * `git diff --exit-code` gate covers it. NEVER hand-edit — edit the descriptor's `api`.
 * ────────────────────────────────────────────────────────────── */

import * as React from 'react';
import { nuriNames, renderDescriptorInstance } from '../../runtime/renderer';
import type { NuriBehaviour } from '../../runtime/renderer';
import { bottomSheetPanelDescriptor } from '@nuri/spec/descriptors/bottom-sheet-panel';
import { recipes } from '../data/recipes';
import { scopedByAccent } from '../../primitives/shared';
import type { Accent } from '../data/tokens';

export type BottomSheetPanelProps = {
  accent?: Accent;
  children?: React.ReactNode;
};

type BottomSheetPanelPart = 'root';

const bottomSheetPanelDisplayName = nuriNames('bottom-sheet-panel').rn;

const BottomSheetPanelInner: React.FC<BottomSheetPanelProps> = (props) => {
  const selection: Record<string, string> = {
  };
  const content: Partial<Record<BottomSheetPanelPart, React.ReactNode>> = {};
  if (props.children !== undefined) content["root"] = props.children;
  const behaviour: NuriBehaviour<BottomSheetPanelPart> = {};

  return renderDescriptorInstance({
    descriptor: bottomSheetPanelDescriptor,
    recipe: recipes["bottom-sheet-panel"],
    displayName: bottomSheetPanelDisplayName,
    selection,
    content,
    behaviour,
  });
};
BottomSheetPanelInner.displayName = `${bottomSheetPanelDisplayName}Inner`;

export const BottomSheetPanel = scopedByAccent(BottomSheetPanelInner);
BottomSheetPanel.displayName = bottomSheetPanelDisplayName;
