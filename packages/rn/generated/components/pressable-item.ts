/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · PRESSABLE-ITEM · GENERATED RN API ADAPTER · DO NOT EDIT BY HAND
 *
 * The exact public export for `pressable-item` (Path C component-API). `{Name}Props`
 * is emitted from the descriptor's `api` (packages/spec/components/pressable-item.ts);
 * the component adapter normalizes public props into selection, content,
 * behaviour, and accent scope before calling the shared descriptor renderer.
 *
 * Source · the authored descriptor `api`+`variants`. Emitter · scripts/parsers/
 * components-api.js — run `npm run build`. Committed (decision 35) · the re-emit
 * `git diff --exit-code` gate covers it. NEVER hand-edit — edit the descriptor's `api`.
 * ────────────────────────────────────────────────────────────── */

import * as React from 'react';
import { nuriNames, renderDescriptorInstance, createNuriSlot, harvestNuriComposition } from '../../runtime/renderer';
import type { NuriBehaviour, NuriCompositionEntry } from '../../runtime/renderer';
import { pressableItemDescriptor } from '@nuri/spec/descriptors/pressable-item';
import { recipes } from '../data/recipes';
import { NuriScope } from '../../theme';
import type { Accent } from '../data/tokens';
import type { IconName } from '../data/icons';

export type PressableItemProps = {
  accent?: Accent;
  onPress?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  children?: React.ReactNode;
};

type PressableItemPart = 'root' | 'leadingAvatar' | 'leadingIcon' | 'content' | 'text' | 'textMuted' | 'trailing' | 'trailingText' | 'trailingTextMuted' | 'trailIcon';

const pressableItemDisplayName = nuriNames('pressable-item').rn;
export const PressableItemContent = createNuriSlot("content", `${pressableItemDisplayName}Content`, 'children', pressableItemDisplayName);
export const PressableItemTrailing = createNuriSlot("trailing", `${pressableItemDisplayName}Trailing`, 'children', pressableItemDisplayName);
export type PressableItemLeadingAvatarProps = {
  name: IconName;
  children?: never;
};
export const PressableItemLeadingAvatar = createNuriSlot<PressableItemLeadingAvatarProps>("leadingIcon", `${pressableItemDisplayName}LeadingAvatar`, 'name', pressableItemDisplayName);
export type PressableItemTextProps = {
  children?: React.ReactNode;
};
export const PressableItemText = createNuriSlot<PressableItemTextProps>("text", `${pressableItemDisplayName}Text`, 'children', pressableItemDisplayName);
export type PressableItemTextMutedProps = {
  children?: React.ReactNode;
};
export const PressableItemTextMuted = createNuriSlot<PressableItemTextMutedProps>("textMuted", `${pressableItemDisplayName}TextMuted`, 'children', pressableItemDisplayName);
export type PressableItemTrailingTextProps = {
  children?: React.ReactNode;
};
export const PressableItemTrailingText = createNuriSlot<PressableItemTrailingTextProps>("trailingText", `${pressableItemDisplayName}TrailingText`, 'children', pressableItemDisplayName);
export type PressableItemTrailingTextMutedProps = {
  children?: React.ReactNode;
};
export const PressableItemTrailingTextMuted = createNuriSlot<PressableItemTrailingTextMutedProps>("trailingTextMuted", `${pressableItemDisplayName}TrailingTextMuted`, 'children', pressableItemDisplayName);
export type PressableItemTrailIconProps = {
  name: IconName;
  children?: never;
};
export const PressableItemTrailIcon = createNuriSlot<PressableItemTrailIconProps>("trailIcon", `${pressableItemDisplayName}TrailIcon`, 'name', pressableItemDisplayName);

const PressableItemInner: React.FC<PressableItemProps> = (props) => {
  const selection: Record<string, string> = {
  };
  const content: Partial<Record<PressableItemPart, React.ReactNode>> = {};
  const composition: Partial<Record<PressableItemPart, NuriCompositionEntry<PressableItemPart>[]>> = {};
  const harvestedComposition = harvestNuriComposition<PressableItemPart>(props.children, undefined, pressableItemDisplayName);
  if (harvestedComposition.hasSlots) {
    composition.root = harvestedComposition.items;
  }
  const behaviour: NuriBehaviour<PressableItemPart> = {};
  behaviour.pressable = {
    target: "root",
    onPress: props.onPress,
    disabled: props.disabled,
    accessibilityLabel: props.accessibilityLabel,
  };

  return renderDescriptorInstance({
    descriptor: pressableItemDescriptor,
    recipe: recipes["pressable-item"],
    displayName: pressableItemDisplayName,
    selection,
    content,
    composition,
    behaviour,
  });
};
PressableItemInner.displayName = `${pressableItemDisplayName}Inner`;

export const PressableItem: React.FC<PressableItemProps> = (props) =>
  props.accent !== undefined
    ? React.createElement(NuriScope, { accent: props.accent, children: React.createElement(PressableItemInner, props) })
    : React.createElement(PressableItemInner, props);
PressableItem.displayName = pressableItemDisplayName;
