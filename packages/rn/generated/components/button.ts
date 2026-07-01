/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · BUTTON · GENERATED RN API ADAPTER · DO NOT EDIT BY HAND
 *
 * The exact public export for `button` (Path C · Phase 3). `{Name}Props`
 * is emitted from the descriptor's `api` (packages/spec/components/button.ts);
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
import { buttonDescriptor } from '@nuri/spec/descriptors/button';
import { recipes } from '../recipes';
import type { Part } from '../../contract';
import { NuriScope } from '../../theme';
import type { Accent } from '../tokens';

export type ButtonProps = {
  variant?: 'solid' | 'soft' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  accent?: Accent;
  onPress?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  children?: React.ReactNode;
};

const buttonDisplayName = nuriNames('button').rn;

const ButtonInner: React.FC<ButtonProps> = (props) => {
  const selection: Record<string, string> = {
    "variant": props.variant ?? "soft",
    "size": props.size ?? "md",
  };
  const content: Partial<Record<Part, React.ReactNode>> = {};
  if (props.children !== undefined) content["label"] = props.children;
  const behaviour: NuriBehaviour = {};
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
    behaviour,
  });
};
ButtonInner.displayName = `${buttonDisplayName}Inner`;

export const Button: React.FC<ButtonProps> = (props) =>
  props.accent !== undefined
    ? React.createElement(NuriScope, { accent: props.accent, children: React.createElement(ButtonInner, props) })
    : React.createElement(ButtonInner, props);
Button.displayName = buttonDisplayName;
