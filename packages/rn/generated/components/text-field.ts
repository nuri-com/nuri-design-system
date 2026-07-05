/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · TEXT-FIELD · GENERATED RN API ADAPTER · DO NOT EDIT BY HAND
 *
 * The exact public export for `text-field` (Path C component-API). `{Name}Props`
 * is emitted from the descriptor's `api` (packages/spec/components/text-field.ts);
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
import { textFieldDescriptor } from '@nuri/spec/descriptors/text-field';
import { recipes } from '../data/recipes';
import { NuriScope } from '../../theme';
import type { Accent } from '../data/tokens';
import type { IconName } from '../data/icons';
import { Button } from './button';
import { IconButton } from './icon-button';

export type TextFieldProps = {
  accent?: Accent;
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  inputMode?: 'text' | 'decimal' | 'numeric' | 'tel' | 'email' | 'url' | 'search';
  secureTextEntry?: boolean;
  disabled?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  accessibilityLabel?: string;
  children?: React.ReactNode;
};

type TextFieldPart = 'root' | 'label' | 'box' | 'input' | 'button' | 'iconButton';

const textFieldDisplayName = nuriNames('text-field').rn;
const componentRegistry = {
  "button": Button as React.ComponentType<Record<string, unknown>>,
  "icon-button": IconButton as React.ComponentType<Record<string, unknown>>,
};
export type TextFieldLabelProps = {
  children: string;
};
export const TextFieldLabel = createNuriSlot<TextFieldLabelProps>("label", `${textFieldDisplayName}Label`, 'children', textFieldDisplayName);
export type TextFieldButtonProps = {
  children?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
};
export const TextFieldButton = createNuriSlot<TextFieldButtonProps>("button", `${textFieldDisplayName}Button`, 'children', textFieldDisplayName);
export type TextFieldIconButtonProps = {
  name: IconName;
  onPress?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  children?: never;
};
export const TextFieldIconButton = createNuriSlot<TextFieldIconButtonProps>("iconButton", `${textFieldDisplayName}IconButton`, 'name', textFieldDisplayName);

const TextFieldInner: React.FC<TextFieldProps> = (props) => {
  const selection: Record<string, string> = {
  };
  const content: Partial<Record<TextFieldPart, React.ReactNode>> = {};
  const composition: Partial<Record<TextFieldPart, NuriCompositionEntry<TextFieldPart>[]>> = {};
  const harvestedComposition = harvestNuriComposition<TextFieldPart>(props.children, undefined, textFieldDisplayName);
  if (harvestedComposition.hasSlots) {
    composition.root = harvestedComposition.items;
  }
  if (!harvestedComposition.items.some((entry) => entry.part === "label")) {
    throw new Error(`nuri-factory: '${textFieldDisplayName}' requires Label`);
  }
  const behaviour: NuriBehaviour<TextFieldPart> = {};
  behaviour.input = {
    target: "input",
    focusTarget: "box",
    labelPart: "label",
    props: {
      value: props.value,
      onChangeText: props.onChangeText,
      placeholder: props.placeholder,
      inputMode: props.inputMode,
      secureTextEntry: props.secureTextEntry,
      disabled: props.disabled,
      onFocus: props.onFocus,
      onBlur: props.onBlur,
      accessibilityLabel: props.accessibilityLabel,
    },
  };

  return renderDescriptorInstance({
    descriptor: textFieldDescriptor,
    recipe: recipes["text-field"],
    displayName: textFieldDisplayName,
    selection,
    content,
    composition,
    components: componentRegistry,
    behaviour,
  });
};
TextFieldInner.displayName = `${textFieldDisplayName}Inner`;

export const TextField: React.FC<TextFieldProps> = (props) =>
  props.accent !== undefined
    ? React.createElement(NuriScope, { accent: props.accent, children: React.createElement(TextFieldInner, props) })
    : React.createElement(TextFieldInner, props);
TextField.displayName = textFieldDisplayName;
