/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · BUTTON · GENERATED RN API ADAPTER · DO NOT EDIT BY HAND
 *
 * The exact public export for `button` (Path C component-API). `{Name}Props`
 * is emitted from the descriptor's `api` (packages/spec/components/button.ts);
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
import { buttonDescriptor } from '@nuri/spec/descriptors/button';
import { recipes } from '../data/recipes';
import { scopedByAccent } from '../../primitives/shared';
import type { Accent } from '../data/tokens';
import type { IconName } from '../data/icons';

export type ButtonProps = {
  variant?: 'solid' | 'soft';
  size?: 'sm' | 'lg';
  fill?: 'natural' | 'even' | 'hug';
  accent?: Accent;
  onPress?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  children?: React.ReactNode;
};

type ButtonPart = 'root' | 'label' | 'icon';

const buttonDisplayName = nuriNames('button').rn;
export type ButtonTextProps = {
  children?: React.ReactNode;
};
export const ButtonText = createNuriSlot<ButtonTextProps>("label", `${buttonDisplayName}Text`, 'children', buttonDisplayName);
export type ButtonIconProps = {
  name: IconName;
  children?: never;
};
export const ButtonIcon = createNuriSlot<ButtonIconProps>("icon", `${buttonDisplayName}Icon`, 'name', buttonDisplayName);

const ButtonInner: React.FC<ButtonProps> = (props) => {
  const selection: Record<string, string> = {
    "variant": props.variant ?? "soft",
    "size": props.size ?? "lg",
    "fill": props.fill ?? "natural",
  };
  const content: Partial<Record<ButtonPart, React.ReactNode>> = {};
  const composition: Partial<Record<ButtonPart, NuriCompositionEntry<ButtonPart>[]>> = {};
  const harvestedComposition = harvestNuriComposition<ButtonPart>(props.children, "label", buttonDisplayName);
  if (harvestedComposition.hasSlots) {
    composition.root = harvestedComposition.items;
  }
  if (!harvestedComposition.hasSlots && props.children !== undefined) content["label"] = props.children;
  const behaviour: NuriBehaviour<ButtonPart> = {};
  behaviour.pressable = {
    target: "root",
    onPress: props.onPress,
    disabled: props.disabled,
    accessibilityLabel: props.accessibilityLabel,
  };

  return renderDescriptorInstance({
    descriptor: buttonDescriptor,
    recipe: recipes["button"],
    displayName: buttonDisplayName,
    selection,
    content,
    composition,
    behaviour,
  });
};
ButtonInner.displayName = `${buttonDisplayName}Inner`;

export const Button = scopedByAccent(ButtonInner);
Button.displayName = buttonDisplayName;
