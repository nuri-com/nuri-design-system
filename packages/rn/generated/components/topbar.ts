/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · TOPBAR · GENERATED RN API ADAPTER · DO NOT EDIT BY HAND
 *
 * The exact public export for `topbar` (Path C component-API). `{Name}Props`
 * is emitted from the descriptor's `api` (packages/spec/components/topbar.ts);
 * the component adapter normalizes public props into selection, content,
 * behaviour, and accent scope before calling the shared descriptor renderer.
 *
 * Source · the authored descriptor `api`+`variants`. Emitter · scripts/parsers/
 * components-api.js — run `npm run build`. Committed (decision 35) · the re-emit
 * `git diff --exit-code` gate covers it. NEVER hand-edit — edit the descriptor's `api`.
 * ────────────────────────────────────────────────────────────── */

import * as React from 'react';
import { nuriNames, renderDescriptorInstance, createNuriSlot, harvestNuriSlots } from '../../runtime/renderer';
import type { NuriBehaviour } from '../../runtime/renderer';
import { topbarDescriptor } from '@nuri/spec/descriptors/topbar';
import { recipes } from '../data/recipes';
import { NuriScope } from '../../theme';
import type { Accent } from '../data/tokens';

export type TopbarProps = {
  accent?: Accent;
  children?: React.ReactNode;
};

type TopbarPart = 'root' | 'leading' | 'center' | 'trailing';

const topbarDisplayName = nuriNames('topbar').rn;
export const TopbarLeading = createNuriSlot("leading", `${topbarDisplayName}Leading`);
export const TopbarCenter = createNuriSlot("center", `${topbarDisplayName}Center`);
export const TopbarTrailing = createNuriSlot("trailing", `${topbarDisplayName}Trailing`);

const TopbarInner: React.FC<TopbarProps> = (props) => {
  const selection: Record<string, string> = {
  };
  const content: Partial<Record<TopbarPart, React.ReactNode>> = {};
  const harvested = harvestNuriSlots<TopbarPart>(props.children, "trailing");
  if (harvested["leading"] !== undefined) content["leading"] = harvested["leading"];
  if (harvested["center"] !== undefined) content["center"] = harvested["center"];
  if (harvested["trailing"] !== undefined) content["trailing"] = harvested["trailing"];
  const behaviour: NuriBehaviour<TopbarPart> = {};

  return renderDescriptorInstance({
    descriptor: topbarDescriptor,
    recipe: recipes["topbar"],
    displayName: topbarDisplayName,
    selection,
    content,
    behaviour,
  });
};
TopbarInner.displayName = `${topbarDisplayName}Inner`;

export const Topbar: React.FC<TopbarProps> = (props) =>
  props.accent !== undefined
    ? React.createElement(NuriScope, { accent: props.accent, children: React.createElement(TopbarInner, props) })
    : React.createElement(TopbarInner, props);
Topbar.displayName = topbarDisplayName;
