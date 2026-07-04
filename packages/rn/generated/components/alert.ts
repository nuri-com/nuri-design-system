/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · ALERT · GENERATED RN API ADAPTER · DO NOT EDIT BY HAND
 *
 * The exact public export for `alert` (Path C component-API). `{Name}Props`
 * is emitted from the descriptor's `api` (packages/spec/components/alert.ts);
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
import { alertDescriptor } from '@nuri/spec/descriptors/alert';
import { recipes } from '../data/recipes';
import { NuriScope } from '../../theme';
import type { Accent } from '../data/tokens';
import type { IconName } from '../data/icons';

export type AlertProps = {
  variant?: 'soft' | 'ghost';
  accent?: Accent;
  children?: React.ReactNode;
};

type AlertPart = 'root' | 'iconWrap' | 'icon' | 'message';

const alertDisplayName = nuriNames('alert').rn;
export type AlertIconProps = {
  name: IconName;
  children?: never;
};
export const AlertIcon = createNuriSlot<AlertIconProps>("icon", `${alertDisplayName}Icon`, 'name', alertDisplayName);

const AlertInner: React.FC<AlertProps> = (props) => {
  const selection: Record<string, string> = {
    "variant": props.variant ?? "soft",
  };
  const content: Partial<Record<AlertPart, React.ReactNode>> = {};
  const composition: Partial<Record<AlertPart, NuriCompositionEntry<AlertPart>[]>> = {};
  const harvestedComposition = harvestNuriComposition<AlertPart>(props.children, "root", alertDisplayName);
  if (harvestedComposition.hasSlots) {
    composition.root = harvestedComposition.items;
  }
  if (!harvestedComposition.hasSlots && props.children !== undefined) content["root"] = props.children;
  const behaviour: NuriBehaviour<AlertPart> = {};

  return renderDescriptorInstance({
    descriptor: alertDescriptor,
    recipe: recipes["alert"],
    displayName: alertDisplayName,
    selection,
    content,
    composition,
    behaviour,
  });
};
AlertInner.displayName = `${alertDisplayName}Inner`;

export const Alert: React.FC<AlertProps> = (props) =>
  props.accent !== undefined
    ? React.createElement(NuriScope, { accent: props.accent, children: React.createElement(AlertInner, props) })
    : React.createElement(AlertInner, props);
Alert.displayName = alertDisplayName;
