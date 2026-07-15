/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · MODAL-PANEL · GENERATED RN API ADAPTER · DO NOT EDIT BY HAND
 *
 * The exact public export for `modal-panel` (Path C component-API). `{Name}Props`
 * is emitted from the descriptor's `api` (packages/spec/components/modal-panel.ts);
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
import { modalPanelDescriptor } from '@nuri/spec/descriptors/modal-panel';
import { recipes } from '../data/recipes';
import { scopedByAccent } from '../../primitives/shared';
import type { Accent } from '../data/tokens';

export type ModalPanelProps = {
  mode?: 'sheet' | 'full';
  accent?: Accent;
  children?: React.ReactNode;
};

type ModalPanelPart = 'root';

const modalPanelDisplayName = nuriNames('modal-panel').rn;

const ModalPanelInner: React.FC<ModalPanelProps> = (props) => {
  const selection: Record<string, string> = {
    "mode": props.mode ?? "sheet",
  };
  const content: Partial<Record<ModalPanelPart, React.ReactNode>> = {};
  if (props.children !== undefined) content["root"] = props.children;
  const behaviour: NuriBehaviour<ModalPanelPart> = {};

  return renderDescriptorInstance({
    descriptor: modalPanelDescriptor,
    recipe: recipes["modal-panel"],
    displayName: modalPanelDisplayName,
    selection,
    content,
    behaviour,
  });
};
ModalPanelInner.displayName = `${modalPanelDisplayName}Inner`;

export const ModalPanel = scopedByAccent(ModalPanelInner);
ModalPanel.displayName = modalPanelDisplayName;
