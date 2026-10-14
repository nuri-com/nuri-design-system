/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · LIST-SWITCH · GENERATED RN API ADAPTER · DO NOT EDIT BY HAND
 *
 * The exact public export for `list-switch` (Path C component-API). `{Name}Props`
 * is emitted from the descriptor's `api` (packages/spec/components/list-switch.ts);
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
import { listSwitchDescriptor } from '@nuri/spec/descriptors/list-switch';
import { recipes } from '../data/recipes';
import { scopedByAccent } from '../../primitives/shared';
import type { Accent } from '../data/tokens';

export type ListSwitchProps = {
  accent?: Accent;
  onPress?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  checked?: boolean;
  children?: React.ReactNode;
};

type ListSwitchPart = 'root' | 'content' | 'text' | 'textMuted' | 'track' | 'thumb';

const listSwitchDisplayName = nuriNames('list-switch').rn;
export type ListSwitchTextProps = {
  children?: React.ReactNode;
};
export const ListSwitchText = createNuriSlot<ListSwitchTextProps>("text", `${listSwitchDisplayName}Text`, 'children', listSwitchDisplayName);
export type ListSwitchTextMutedProps = {
  children?: React.ReactNode;
};
export const ListSwitchTextMuted = createNuriSlot<ListSwitchTextMutedProps>("textMuted", `${listSwitchDisplayName}TextMuted`, 'children', listSwitchDisplayName);

const ListSwitchInner: React.FC<ListSwitchProps> = (props) => {
  const selection: Record<string, string> = {
    "state": "off",
  };
  if (typeof props.checked === 'boolean') {
    selection["state"] = props.checked ? "on" : "off";
  }
  const content: Partial<Record<ListSwitchPart, React.ReactNode>> = {};
  const composition: Partial<Record<ListSwitchPart, NuriCompositionEntry<ListSwitchPart>[]>> = {};
  const harvestedComposition = harvestNuriComposition<ListSwitchPart>(props.children, undefined, listSwitchDisplayName);
  if (harvestedComposition.hasSlots) {
    composition.root = harvestedComposition.items;
  }
  const behaviour: NuriBehaviour<ListSwitchPart> = {};
  behaviour.pressable = {
    target: "root",
    role: "switch",
    checked: props.checked === true,
    onPress: props.onPress,
    disabled: props.disabled,
    accessibilityLabel: props.accessibilityLabel,
  };

  return renderDescriptorInstance({
    descriptor: listSwitchDescriptor,
    recipe: recipes["list-switch"],
    displayName: listSwitchDisplayName,
    selection,
    content,
    composition,
    behaviour,
  });
};
ListSwitchInner.displayName = `${listSwitchDisplayName}Inner`;

export const ListSwitch = scopedByAccent(ListSwitchInner);
ListSwitch.displayName = listSwitchDisplayName;
