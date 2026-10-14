/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · SWITCH · GENERATED RN API ADAPTER · DO NOT EDIT BY HAND
 *
 * The exact public export for `switch` (Path C component-API). `{Name}Props`
 * is emitted from the descriptor's `api` (packages/spec/components/switch.ts);
 * the component adapter normalizes public props into selection, content,
 * behaviour, and optional accent scope before calling the shared descriptor renderer.
 *
 * Source · the authored descriptor `api`+`variants`. Emitter · scripts/parsers/
 * components-api.js — run `npm run build`. Committed (decision 35) · the re-emit
 * `git diff --exit-code` gate covers it. NEVER hand-edit — edit the descriptor's `api`.
 * ────────────────────────────────────────────────────────────── */

import * as React from 'react';
import { nuriNames, renderDescriptorInstance } from '../../runtime/renderer';
import type { NuriBehaviour } from '../../runtime/renderer';
import { switchDescriptor } from '@nuri/spec/descriptors/switch';
import { recipes } from '../data/recipes';
import { scopedByAccent } from '../../primitives/shared';
import type { Accent } from '../data/tokens';

export type SwitchProps = {
  accent?: Accent;
  onPress?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  checked?: boolean;
  children?: never;
};

type SwitchPart = 'root' | 'thumb';

const switchDisplayName = nuriNames('switch').rn;

const SwitchInner: React.FC<SwitchProps> = (props) => {
  const selection: Record<string, string> = {
    "state": "off",
  };
  if (typeof props.checked === 'boolean') {
    selection["state"] = props.checked ? "on" : "off";
  }
  const content: Partial<Record<SwitchPart, React.ReactNode>> = {};
  const behaviour: NuriBehaviour<SwitchPart> = {};
  behaviour.pressable = {
    target: "root",
    role: "switch",
    checked: props.checked === true,
    onPress: props.onPress,
    disabled: props.disabled,
    accessibilityLabel: props.accessibilityLabel,
  };

  return renderDescriptorInstance({
    descriptor: switchDescriptor,
    recipe: recipes["switch"],
    displayName: switchDisplayName,
    selection,
    content,
    behaviour,
  });
};
SwitchInner.displayName = `${switchDisplayName}Inner`;

export const Switch = scopedByAccent(SwitchInner);
Switch.displayName = switchDisplayName;
