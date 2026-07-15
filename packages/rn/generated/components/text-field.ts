/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · TEXT-FIELD · GENERATED RN API ADAPTER · DO NOT EDIT BY HAND
 *
 * The exact public export for `text-field` (Path C component-API). `{Name}Props`
 * is emitted from the descriptor's `api` (packages/spec/components/text-field.ts);
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
import { textFieldDescriptor } from '@nuri/spec/descriptors/text-field';
import { recipes } from '../data/recipes';
import { scopedByAccent } from '../../primitives/shared';
import type { Accent } from '../data/tokens';
import type { IconName } from '../data/icons';
import { Button } from './button';
import { IconButton } from './icon-button';

export type TextFieldHandle = { focus(): void; blur(): void };

export type TextFieldProps = {
  size?: 'md' | 'lg';
  accent?: Accent;
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  inputMode?: 'text' | 'decimal' | 'numeric' | 'tel' | 'email' | 'url' | 'search';
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  disabled?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  accessibilityLabel?: string;
  children?: React.ReactNode;
};

type TextFieldPart = 'root' | 'label' | 'box' | 'input' | 'button' | 'iconButton';

const textFieldDisplayName = nuriNames('text-field').rn;
let warnedTextFieldAccessibleName = false;
const componentRegistry = {
  "button": Button as React.ComponentType<Record<string, unknown>>,
  "icon-button": IconButton as React.ComponentType<Record<string, unknown>>,
};
export type TextFieldLabelProps = {
  children?: string;
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
  accessibilityLabel: string;
  children?: never;
};
export const TextFieldIconButton = createNuriSlot<TextFieldIconButtonProps>("iconButton", `${textFieldDisplayName}IconButton`, 'name', textFieldDisplayName);

const TextFieldInner = React.forwardRef<TextFieldHandle, TextFieldProps>((props, ref) => {
  const selection: Record<string, string> = {
    "size": props.size ?? "lg",
  };
  const content: Partial<Record<TextFieldPart, React.ReactNode>> = {};
  const composition: Partial<Record<TextFieldPart, NuriCompositionEntry<TextFieldPart>[]>> = {};
  const harvestedComposition = harvestNuriComposition<TextFieldPart>(props.children, undefined, textFieldDisplayName);
  if (harvestedComposition.hasSlots) {
    composition.root = harvestedComposition.items;
  }
  if (!warnedTextFieldAccessibleName && typeof __DEV__ !== 'undefined' && __DEV__ && !harvestedComposition.items.some((entry) => entry.part === "label") && props.accessibilityLabel === undefined) {
    warnedTextFieldAccessibleName = true;
    console.warn('[nuri] <' + textFieldDisplayName + '> expects either its Label slot or accessibilityLabel so the input has an accessible name.');
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
      autoCapitalize: props.autoCapitalize,
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
    inputHandle: ref,
  });
});
TextFieldInner.displayName = `${textFieldDisplayName}Inner`;

export const TextField = scopedByAccent(TextFieldInner);
TextField.displayName = textFieldDisplayName;
