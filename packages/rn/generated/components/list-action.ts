/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · LIST-ACTION · GENERATED RN API ADAPTER · DO NOT EDIT BY HAND
 *
 * The exact public export for `list-action` (Path C component-API). `{Name}Props`
 * is emitted from the descriptor's `api` (packages/spec/components/list-action.ts);
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
import { listActionDescriptor } from '@nuri/spec/descriptors/list-action';
import { recipes } from '../data/recipes';
import type { ImageSourcePropType } from 'react-native';
import type { Accent } from '../data/tokens';
import type { IconName } from '../data/icons';
import { IconAvatar } from './icon-avatar';

export type ListActionProps = {
  onPress?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  children?: React.ReactNode;
};

type ListActionPart = 'root' | 'leadingAvatar' | 'content' | 'text' | 'textMuted' | 'trailing' | 'trailingText' | 'trailingTextMuted' | 'trailIcon';

const listActionDisplayName = nuriNames('list-action').rn;
const componentRegistry = {
  "icon-avatar": IconAvatar as React.ComponentType<Record<string, unknown>>,
};
export type ListActionLeadingAvatarProps = {
  name?: IconName;
  variant?: 'solid' | 'soft' | 'ghost' | 'subtle' | 'outline';
  accent?: Accent;
  source?: ImageSourcePropType;
  children?: never;
};
export const ListActionLeadingAvatar = createNuriSlot<ListActionLeadingAvatarProps>("leadingAvatar", `${listActionDisplayName}LeadingAvatar`, 'name', listActionDisplayName);
export type ListActionTextProps = {
  children?: React.ReactNode;
};
export const ListActionText = createNuriSlot<ListActionTextProps>("text", `${listActionDisplayName}Text`, 'children', listActionDisplayName);
export type ListActionTextMutedProps = {
  children?: React.ReactNode;
};
export const ListActionTextMuted = createNuriSlot<ListActionTextMutedProps>("textMuted", `${listActionDisplayName}TextMuted`, 'children', listActionDisplayName);
export type ListActionTrailingTextProps = {
  children?: React.ReactNode;
};
export const ListActionTrailingText = createNuriSlot<ListActionTrailingTextProps>("trailingText", `${listActionDisplayName}TrailingText`, 'children', listActionDisplayName);
export type ListActionTrailingTextMutedProps = {
  children?: React.ReactNode;
};
export const ListActionTrailingTextMuted = createNuriSlot<ListActionTrailingTextMutedProps>("trailingTextMuted", `${listActionDisplayName}TrailingTextMuted`, 'children', listActionDisplayName);
export type ListActionTrailIconProps = {
  name: IconName;
  children?: never;
};
export const ListActionTrailIcon = createNuriSlot<ListActionTrailIconProps>("trailIcon", `${listActionDisplayName}TrailIcon`, 'name', listActionDisplayName);

const ListActionInner: React.FC<ListActionProps> = (props) => {
  const selection: Record<string, string> = {
  };
  const content: Partial<Record<ListActionPart, React.ReactNode>> = {};
  const composition: Partial<Record<ListActionPart, NuriCompositionEntry<ListActionPart>[]>> = {};
  const harvestedComposition = harvestNuriComposition<ListActionPart>(props.children, undefined, listActionDisplayName);
  if (harvestedComposition.hasSlots) {
    composition.root = harvestedComposition.items;
  }
  const behaviour: NuriBehaviour<ListActionPart> = {};
  behaviour.pressable = {
    target: "root",
    onPress: props.onPress,
    disabled: props.disabled,
    accessibilityLabel: props.accessibilityLabel,
  };

  return renderDescriptorInstance({
    descriptor: listActionDescriptor,
    recipe: recipes["list-action"],
    displayName: listActionDisplayName,
    selection,
    content,
    composition,
    components: componentRegistry,
    behaviour,
  });
};
ListActionInner.displayName = `${listActionDisplayName}Inner`;

export const ListAction: React.FC<ListActionProps> = ListActionInner;
