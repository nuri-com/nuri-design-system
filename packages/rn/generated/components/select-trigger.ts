/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · SELECT-TRIGGER · GENERATED RN API ADAPTER · DO NOT EDIT BY HAND
 *
 * The exact public export for `select-trigger` (Path C component-API). `{Name}Props`
 * is emitted from the descriptor's `api` (packages/spec/components/select-trigger.ts);
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
import { selectTriggerDescriptor } from '@nuri/spec/descriptors/select-trigger';
import { recipes } from '../data/recipes';
import type { ImageSourcePropType } from 'react-native';
import { scopedByAccent } from '../../primitives/shared';
import type { Accent } from '../data/tokens';
import type { IconName } from '../data/icons';
import { IconAvatar } from './icon-avatar';

export type SelectTriggerProps = {
  variant?: 'ghost' | 'pill';
  accent?: Accent;
  onPress?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityValue?: string;
  children?: React.ReactNode;
};

type SelectTriggerPart = 'root' | 'label' | 'avatar' | 'value' | 'chevron';

const selectTriggerDisplayName = nuriNames('select-trigger').rn;
const componentRegistry = {
  "icon-avatar": IconAvatar as React.ComponentType<Record<string, unknown>>,
};
export type SelectTriggerLabelProps = {
  children: React.ReactNode;
};
export const SelectTriggerLabel = createNuriSlot<SelectTriggerLabelProps>("label", `${selectTriggerDisplayName}Label`, 'children', selectTriggerDisplayName);
export type SelectTriggerAvatarProps = {
  name?: IconName;
  variant?: 'solid' | 'soft' | 'ghost' | 'subtle' | 'outline';
  accent?: Accent;
  source?: ImageSourcePropType;
  children?: never;
};
export const SelectTriggerAvatar = createNuriSlot<SelectTriggerAvatarProps>("avatar", `${selectTriggerDisplayName}Avatar`, 'name', selectTriggerDisplayName);
export type SelectTriggerValueProps = {
  children: React.ReactNode;
};
export const SelectTriggerValue = createNuriSlot<SelectTriggerValueProps>("value", `${selectTriggerDisplayName}Value`, 'children', selectTriggerDisplayName);
export type SelectTriggerChevronProps = {
  name: IconName;
  children?: never;
};
export const SelectTriggerChevron = createNuriSlot<SelectTriggerChevronProps>("chevron", `${selectTriggerDisplayName}Chevron`, 'name', selectTriggerDisplayName);

const SelectTriggerInner: React.FC<SelectTriggerProps> = (props) => {
  const selection: Record<string, string> = {
    "variant": props.variant ?? "ghost",
  };
  const content: Partial<Record<SelectTriggerPart, React.ReactNode>> = {};
  const composition: Partial<Record<SelectTriggerPart, NuriCompositionEntry<SelectTriggerPart>[]>> = {};
  const harvestedComposition = harvestNuriComposition<SelectTriggerPart>(props.children, undefined, selectTriggerDisplayName);
  if (harvestedComposition.hasSlots) {
    composition.root = harvestedComposition.items;
  }
  if (!harvestedComposition.items.some((entry) => entry.part === "label")) {
    throw new Error(`nuri-factory: '${selectTriggerDisplayName}' requires Label`);
  }
  if (!harvestedComposition.items.some((entry) => entry.part === "value")) {
    throw new Error(`nuri-factory: '${selectTriggerDisplayName}' requires Value`);
  }
  if (!harvestedComposition.items.some((entry) => entry.part === "chevron")) {
    throw new Error(`nuri-factory: '${selectTriggerDisplayName}' requires Chevron`);
  }
  const behaviour: NuriBehaviour<SelectTriggerPart> = {};
  behaviour.pressable = {
    target: "root",
    popup: "dialog",
    onPress: props.onPress,
    disabled: props.disabled,
    accessibilityLabel: props.accessibilityLabel,
    accessibilityValue: props.accessibilityValue,
  };

  return renderDescriptorInstance({
    descriptor: selectTriggerDescriptor,
    recipe: recipes["select-trigger"],
    displayName: selectTriggerDisplayName,
    selection,
    content,
    composition,
    components: componentRegistry,
    behaviour,
  });
};
SelectTriggerInner.displayName = `${selectTriggerDisplayName}Inner`;

export const SelectTrigger = scopedByAccent(SelectTriggerInner);
SelectTrigger.displayName = selectTriggerDisplayName;
