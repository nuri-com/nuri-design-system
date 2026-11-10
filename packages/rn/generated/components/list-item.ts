/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · LIST-ITEM · GENERATED RN API ADAPTER · DO NOT EDIT BY HAND
 *
 * The exact public export for `list-item` (Path C component-API). `{Name}Props`
 * is emitted from the descriptor's `api` (packages/spec/components/list-item.ts);
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
import { listItemDescriptor } from '@nuri/spec/descriptors/list-item';
import { recipes } from '../data/recipes';

export type ListItemProps = {
  children?: React.ReactNode;
};

type ListItemPart = 'root' | 'content' | 'textMuted' | 'line' | 'text' | 'textSuffix';

const listItemDisplayName = nuriNames('list-item').rn;
export type ListItemTextMutedProps = {
  children?: React.ReactNode;
};
export const ListItemTextMuted = createNuriSlot<ListItemTextMutedProps>("textMuted", `${listItemDisplayName}TextMuted`, 'children', listItemDisplayName);
export type ListItemTextProps = {
  children: React.ReactNode;
};
export const ListItemText = createNuriSlot<ListItemTextProps>("text", `${listItemDisplayName}Text`, 'children', listItemDisplayName);
export type ListItemTextSuffixProps = {
  children?: React.ReactNode;
};
export const ListItemTextSuffix = createNuriSlot<ListItemTextSuffixProps>("textSuffix", `${listItemDisplayName}TextSuffix`, 'children', listItemDisplayName);

const ListItemInner: React.FC<ListItemProps> = (props) => {
  const selection: Record<string, string> = {
  };
  const content: Partial<Record<ListItemPart, React.ReactNode>> = {};
  const composition: Partial<Record<ListItemPart, NuriCompositionEntry<ListItemPart>[]>> = {};
  const harvestedComposition = harvestNuriComposition<ListItemPart>(props.children, undefined, listItemDisplayName);
  if (harvestedComposition.hasSlots) {
    composition.root = harvestedComposition.items;
  }
  if (!harvestedComposition.items.some((entry) => entry.part === "text")) {
    throw new Error(`nuri-factory: '${listItemDisplayName}' requires Text`);
  }
  const behaviour: NuriBehaviour<ListItemPart> = {};

  return renderDescriptorInstance({
    descriptor: listItemDescriptor,
    recipe: recipes["list-item"],
    displayName: listItemDisplayName,
    selection,
    content,
    composition,
    behaviour,
  });
};
ListItemInner.displayName = `${listItemDisplayName}Inner`;

export const ListItem: React.FC<ListItemProps> = ListItemInner;
