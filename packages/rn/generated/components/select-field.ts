/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · SELECT-FIELD · GENERATED RN API ADAPTER · DO NOT EDIT BY HAND
 *
 * The exact public export for `select-field` (Path C component-API). `{Name}Props`
 * is emitted from the descriptor's `api` (packages/spec/components/select-field.ts);
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
import { selectFieldDescriptor } from '@nuri/spec/descriptors/select-field';
import { recipes } from '../data/recipes';
import type { ImageSourcePropType } from 'react-native';
import { scopedByAccent } from '../../primitives/shared';
import type { Accent } from '../data/tokens';
import type { IconName } from '../data/icons';
import { IconAvatar } from './icon-avatar';

export type SelectFieldProps = {
  size?: 'md' | 'lg';
  accent?: Accent;
  onPress?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityValue?: string;
  children?: React.ReactNode;
};

type SelectFieldPart = 'root' | 'label' | 'box' | 'avatar' | 'value' | 'chevron';

const selectFieldDisplayName = nuriNames('select-field').rn;
const componentRegistry = {
  "icon-avatar": IconAvatar as React.ComponentType<Record<string, unknown>>,
};
export type SelectFieldLabelProps = {
  children: React.ReactNode;
};
export const SelectFieldLabel = createNuriSlot<SelectFieldLabelProps>("label", `${selectFieldDisplayName}Label`, 'children', selectFieldDisplayName);
export type SelectFieldAvatarProps = {
  name?: IconName;
  variant?: 'solid' | 'soft' | 'ghost' | 'subtle' | 'outline';
  accent?: Accent;
  source?: ImageSourcePropType;
  children?: never;
};
export const SelectFieldAvatar = createNuriSlot<SelectFieldAvatarProps>("avatar", `${selectFieldDisplayName}Avatar`, 'name', selectFieldDisplayName);
export type SelectFieldValueProps = {
  children: React.ReactNode;
};
export const SelectFieldValue = createNuriSlot<SelectFieldValueProps>("value", `${selectFieldDisplayName}Value`, 'children', selectFieldDisplayName);
export type SelectFieldChevronProps = {
  name: IconName;
  children?: never;
};
export const SelectFieldChevron = createNuriSlot<SelectFieldChevronProps>("chevron", `${selectFieldDisplayName}Chevron`, 'name', selectFieldDisplayName);

const SelectFieldInner: React.FC<SelectFieldProps> = (props) => {
  const selection: Record<string, string> = {
    "size": props.size ?? "lg",
  };
  const content: Partial<Record<SelectFieldPart, React.ReactNode>> = {};
  const composition: Partial<Record<SelectFieldPart, NuriCompositionEntry<SelectFieldPart>[]>> = {};
  const harvestedComposition = harvestNuriComposition<SelectFieldPart>(props.children, undefined, selectFieldDisplayName);
  if (harvestedComposition.hasSlots) {
    composition.root = harvestedComposition.items;
  }
  if (!harvestedComposition.items.some((entry) => entry.part === "label")) {
    throw new Error(`nuri-factory: '${selectFieldDisplayName}' requires Label`);
  }
  if (!harvestedComposition.items.some((entry) => entry.part === "value")) {
    throw new Error(`nuri-factory: '${selectFieldDisplayName}' requires Value`);
  }
  const behaviour: NuriBehaviour<SelectFieldPart> = {};
  behaviour.pressable = {
    target: "box",
    popup: "dialog",
    onPress: props.onPress,
    disabled: props.disabled,
    accessibilityLabel: props.accessibilityLabel,
    accessibilityValue: props.accessibilityValue,
  };

  return renderDescriptorInstance({
    descriptor: selectFieldDescriptor,
    recipe: recipes["select-field"],
    displayName: selectFieldDisplayName,
    selection,
    content,
    composition,
    components: componentRegistry,
    behaviour,
  });
};
SelectFieldInner.displayName = `${selectFieldDisplayName}Inner`;

export const SelectField = scopedByAccent(SelectFieldInner);
SelectField.displayName = selectFieldDisplayName;
