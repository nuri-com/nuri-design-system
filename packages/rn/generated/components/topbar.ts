/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · TOPBAR · GENERATED RN API ADAPTER · DO NOT EDIT BY HAND
 *
 * The exact public export for `topbar` (Path C component-API). `{Name}Props`
 * is emitted from the descriptor's `api` (packages/spec/components/topbar.ts);
 * the component adapter normalizes public props into selection, content,
 * behaviour, and optional accent scope before calling the shared descriptor renderer.
 *
 * Source · the authored descriptor `api`+`variants`. Emitter · scripts/parsers/
 * components-api.js — run `npm run build`. Committed (decision 35) · the re-emit
 * `git diff --exit-code` gate covers it. NEVER hand-edit — edit the descriptor's `api`.
 * ────────────────────────────────────────────────────────────── */

import * as React from 'react';
import { nuriNames, renderDescriptorInstance, createNuriSlot, harvestNuriComposition } from '../../runtime/renderer';
import type { NuriBehaviour, NuriCompositionEntry } from '../../runtime/renderer';
import { topbarDescriptor } from '@nuri/spec/descriptors/topbar';
import { recipes } from '../data/recipes';
import { scopedByAccent } from '../../primitives/shared';
import type { Accent } from '../data/tokens';

export type TopbarProps = {
  surface?: 'canvas' | 'transparent';
  layout?: 'centered' | 'fluid';
  accent?: Accent;
  children?: React.ReactNode;
};

type TopbarPart = 'root' | 'leading' | 'center' | 'content' | 'title' | 'trailing';

const topbarDisplayName = nuriNames('topbar').rn;
export type TopbarLeadingProps = {
  children?: React.ReactNode;
};
export const TopbarLeading = createNuriSlot<TopbarLeadingProps>("leading", `${topbarDisplayName}Leading`, 'children', topbarDisplayName);
export type TopbarCenterProps = {
  children?: React.ReactNode;
};
export const TopbarCenter = createNuriSlot<TopbarCenterProps>("center", `${topbarDisplayName}Center`, 'children', topbarDisplayName);
export type TopbarContentProps = {
  children?: React.ReactNode;
};
export const TopbarContent = createNuriSlot<TopbarContentProps>("content", `${topbarDisplayName}Content`, 'children', topbarDisplayName);
export type TopbarTrailingProps = {
  children?: React.ReactNode;
};
export const TopbarTrailing = createNuriSlot<TopbarTrailingProps>("trailing", `${topbarDisplayName}Trailing`, 'children', topbarDisplayName);
export type TopbarTitleProps = {
  children?: React.ReactNode;
};
export const TopbarTitle = createNuriSlot<TopbarTitleProps>("title", `${topbarDisplayName}Title`, 'children', topbarDisplayName);

const TopbarInner: React.FC<TopbarProps> = (props) => {
  const selection: Record<string, string> = {
    "surface": props.surface ?? "canvas",
    "layout": props.layout ?? "centered",
  };
  const content: Partial<Record<TopbarPart, React.ReactNode>> = {};
  const composition: Partial<Record<TopbarPart, NuriCompositionEntry<TopbarPart>[]>> = {};
  const harvestedComposition = harvestNuriComposition<TopbarPart>(props.children, "trailing", topbarDisplayName);
  if (harvestedComposition.hasSlots) {
    composition.root = harvestedComposition.items;
  }
  if (!harvestedComposition.hasSlots && props.children !== undefined) content["trailing"] = props.children;
  const behaviour: NuriBehaviour<TopbarPart> = {};

  return renderDescriptorInstance({
    descriptor: topbarDescriptor,
    recipe: recipes["topbar"],
    displayName: topbarDisplayName,
    selection,
    content,
    composition,
    behaviour,
  });
};
TopbarInner.displayName = `${topbarDisplayName}Inner`;

export const Topbar = scopedByAccent(TopbarInner);
Topbar.displayName = topbarDisplayName;
