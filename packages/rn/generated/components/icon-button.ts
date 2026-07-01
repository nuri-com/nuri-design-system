/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · ICON-BUTTON · GENERATED RN API ADAPTER · DO NOT EDIT BY HAND
 *
 * The exact public export for `icon-button` (Path C component-API). `{Name}Props`
 * is emitted from the descriptor's `api` (packages/spec/components/icon-button.ts);
 * the component adapter normalizes public props into selection, content,
 * behaviour, and accent scope before calling the shared descriptor renderer.
 *
 * Source · the authored descriptor `api`+`variants`. Emitter · scripts/parsers/
 * components-api.js — run `npm run build`. Committed (decision 35) · the re-emit
 * `git diff --exit-code` gate covers it. NEVER hand-edit — edit the descriptor's `api`.
 * ────────────────────────────────────────────────────────────── */

import * as React from 'react';
import { nuriNames, renderDescriptorInstance } from '../../factory/createNuriComponent';
import type { NuriBehaviour } from '../../factory/createNuriComponent';
import { iconButtonDescriptor } from '@nuri/spec/descriptors/icon-button';
import { recipes } from '../recipes';
import type { Part } from '../../contract';
import { NuriScope } from '../../theme';
import type { Accent } from '../tokens';
import type { IconName } from '../icons';

export type IconButtonProps = {
  variant?: 'solid' | 'soft' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  accent?: Accent;
  onPress?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  icon: IconName;
  children?: never;
};

const iconButtonDisplayName = nuriNames('icon-button').rn;

const IconButtonInner: React.FC<IconButtonProps> = (props) => {
  const selection: Record<string, string> = {
    "variant": props.variant ?? "soft",
    "size": props.size ?? "md",
  };
  const content: Partial<Record<Part, React.ReactNode>> = {};
  if (props.icon !== undefined) content["icon"] = props.icon;
  const behaviour: NuriBehaviour = {};
  behaviour.pressable = {
    target: "root",
    onPress: props.onPress,
    disabled: props.disabled,
    accessibilityLabel: props.accessibilityLabel,
  };

  return renderDescriptorInstance({
    descriptor: iconButtonDescriptor,
    recipe: recipes["icon-button"],
    displayName: iconButtonDisplayName,
    selection,
    content,
    behaviour,
  });
};
IconButtonInner.displayName = `${iconButtonDisplayName}Inner`;

export const IconButton: React.FC<IconButtonProps> = (props) =>
  props.accent !== undefined
    ? React.createElement(NuriScope, { accent: props.accent, children: React.createElement(IconButtonInner, props) })
    : React.createElement(IconButtonInner, props);
IconButton.displayName = iconButtonDisplayName;
