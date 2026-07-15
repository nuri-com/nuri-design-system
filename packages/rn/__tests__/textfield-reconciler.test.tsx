import * as React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Platform, TextInput } from 'react-native';

jest.mock('../runtime/native-text-input-command', () => ({
  setTextAndSelection: jest.fn(),
}));

import { TextField, TextFieldLabel } from '../index';
import type { TextFieldProps } from '../index';
import { NuriThemeProvider } from '../theme';
import { setTextAndSelection } from '../runtime/native-text-input-command';

const mockSetTextAndSelection = setTextAndSelection as jest.MockedFunction<typeof setTextAndSelection>;

function field(props: TextFieldProps, key = 'field'): React.ReactElement {
  return (
    <NuriThemeProvider>
      <TextField key={key} {...props}>
        <TextFieldLabel>Name</TextFieldLabel>
      </TextField>
    </NuriThemeProvider>
  );
}

function renderField(props: TextFieldProps, key?: string): TestRenderer.ReactTestRenderer {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(field(props, key));
  });
  return tree;
}

function updateField(tree: TestRenderer.ReactTestRenderer, props: TextFieldProps, key?: string): void {
  act(() => tree.update(field(props, key)));
}

function nativeInput(tree: TestRenderer.ReactTestRenderer): TestRenderer.ReactTestInstance {
  return tree.root.findByType(TextInput);
}

function change(tree: TestRenderer.ReactTestRenderer, text: string, eventCount: number): void {
  act(() => nativeInput(tree).props.onChange({ nativeEvent: { text, eventCount } }));
}

function select(tree: TestRenderer.ReactTestRenderer, start: number, end = start): void {
  act(() => nativeInput(tree).props.onSelectionChange({ nativeEvent: { selection: { start, end } } }));
}

describe('DescriptorTextInput native-authoritative reconciler', () => {
  const originalPlatformOS = Platform.OS;

  beforeEach(() => {
    Object.defineProperty(Platform, 'OS', { configurable: true, get: () => 'ios' });
    mockSetTextAndSelection.mockClear();
  });

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { configurable: true, get: () => originalPlatformOS });
  });

  test('native input omits value, freezes defaultValue per mount, and re-primes only on remount', () => {
    const tree = renderField({ value: 'Ada' });
    expect(Object.hasOwn(nativeInput(tree).props, 'value')).toBe(false);
    expect(nativeInput(tree).props.defaultValue).toBe('Ada');

    updateField(tree, { value: 'Grace' });
    expect(Object.hasOwn(nativeInput(tree).props, 'value')).toBe(false);
    expect(nativeInput(tree).props.defaultValue).toBe('Ada');
    expect(mockSetTextAndSelection).toHaveBeenCalledTimes(1);

    updateField(tree, { value: 'Lennard' }, 'remounted');
    expect(nativeInput(tree).props.defaultValue).toBe('Lennard');
  });

  test('native onChange never runs general prop reconciliation; direct acknowledgement writes nothing', () => {
    const onChangeText = jest.fn();
    const tree = renderField({ value: '', onChangeText });
    change(tree, 'L', 1);
    expect(onChangeText).toHaveBeenCalledWith('L');
    expect(mockSetTextAndSelection).not.toHaveBeenCalled();

    updateField(tree, { value: 'L', onChangeText });
    expect(mockSetTextAndSelection).not.toHaveBeenCalled();
  });

  test('delayed and repeated intermediate echoes stay zero-write until convergence prunes them', () => {
    const tree = renderField({ value: '' });
    change(tree, 'L', 1);
    change(tree, 'Le', 2);

    updateField(tree, { value: 'L' });
    updateField(tree, { value: 'L' });
    expect(mockSetTextAndSelection).not.toHaveBeenCalled();

    updateField(tree, { value: 'Le' });
    expect(mockSetTextAndSelection).not.toHaveBeenCalled();
    updateField(tree, { value: 'L' });
    expect(mockSetTextAndSelection).toHaveBeenCalledTimes(1);
  });

  test('an external rewrite issues one command with the latest event count and mapped selection', () => {
    const tree = renderField({ value: 'abcdef' });
    change(tree, 'abcdef!', 7);
    select(tree, 3);
    updateField(tree, { value: 'abXcdef!' });

    expect(mockSetTextAndSelection).toHaveBeenCalledTimes(1);
    expect(mockSetTextAndSelection).toHaveBeenCalledWith(
      expect.anything(),
      7,
      'abXcdef!',
      4,
      4,
    );
    updateField(tree, { value: 'abXcdef!' });
    expect(mockSetTextAndSelection).toHaveBeenCalledTimes(1);
  });

  test('a fresh native event after an external rewrite is accepted instead of replaying the target', () => {
    const onChangeText = jest.fn();
    const tree = renderField({ value: 'Ada', onChangeText });
    updateField(tree, { value: 'Grace', onChangeText });
    expect(mockSetTextAndSelection).toHaveBeenCalledTimes(1);

    change(tree, 'Grace!', 9);
    expect(onChangeText).toHaveBeenCalledWith('Grace!');
    expect(mockSetTextAndSelection).toHaveBeenCalledTimes(1);
  });

  test('identity sanitizer is writeless; transforming sanitizer emits synchronously and recomputes fresh events', () => {
    const identityChange = jest.fn();
    const identity = renderField({ value: '', sanitize: (text) => text, onChangeText: identityChange });
    change(identity, 'a', 1);
    expect(identityChange).toHaveBeenCalledWith('a');
    expect(mockSetTextAndSelection).not.toHaveBeenCalled();

    const seen: string[] = [];
    const sanitize = (text: string) => text.toUpperCase().replaceAll(' ', '');
    const transformed = renderField({ value: '', sanitize, onChangeText: (text) => seen.push(text) });
    change(transformed, 'a b', 3);
    expect(seen).toEqual(['AB']);
    expect(mockSetTextAndSelection).toHaveBeenLastCalledWith(expect.anything(), 3, 'AB', 2, 2);

    change(transformed, 'ABc ', 4);
    expect(seen).toEqual(['AB', 'ABC']);
    expect(mockSetTextAndSelection).toHaveBeenLastCalledWith(expect.anything(), 4, 'ABC', 3, 3);
    expect(mockSetTextAndSelection).toHaveBeenCalledTimes(2);
  });

  test('pending history is bounded at 16 and duplicate pruning uses the newest occurrence', () => {
    const bounded = renderField({});
    for (let i = 1; i <= 17; i += 1) change(bounded, `v${i}`, i);
    updateField(bounded, { value: 'v1' });
    expect(mockSetTextAndSelection).toHaveBeenCalledTimes(1);

    mockSetTextAndSelection.mockClear();
    const duplicates = renderField({});
    change(duplicates, 'A', 1);
    change(duplicates, 'B', 2);
    change(duplicates, 'A', 3);
    change(duplicates, 'C', 4);
    updateField(duplicates, { value: 'A' });
    updateField(duplicates, { value: 'A' });
    expect(mockSetTextAndSelection).not.toHaveBeenCalled();
    updateField(duplicates, { value: 'C' });
    updateField(duplicates, { value: 'A' });
    expect(mockSetTextAndSelection).toHaveBeenCalledTimes(1);
  });

  test('programmatic clear writes when absent from history; a pending empty string is intentionally ambiguous', () => {
    const clear = renderField({ value: '' });
    change(clear, 'abc', 4);
    updateField(clear, { value: '' });
    expect(mockSetTextAndSelection).toHaveBeenLastCalledWith(expect.anything(), 4, '', 0, 0);

    mockSetTextAndSelection.mockClear();
    const ambiguous = renderField({});
    change(ambiguous, '', 1);
    change(ambiguous, 'a', 2);
    updateField(ambiguous, { value: '' });
    expect(mockSetTextAndSelection).not.toHaveBeenCalled();
  });

  test('maxLength reaches native while React Native web stays controlled and never calls native commands', () => {
    const native = renderField({ value: 'Ada', maxLength: 8 });
    expect(nativeInput(native).props.maxLength).toBe(8);

    Object.defineProperty(Platform, 'OS', { configurable: true, get: () => 'web' });
    const onChangeText = jest.fn();
    const sanitize = (text: string) => text.toUpperCase();
    const web = renderField({ value: 'Ada', maxLength: 12, sanitize, onChangeText });
    expect(nativeInput(web).props.value).toBe('Ada');
    expect(Object.hasOwn(nativeInput(web).props, 'defaultValue')).toBe(false);
    expect(nativeInput(web).props.maxLength).toBe(12);
    act(() => nativeInput(web).props.onChangeText('grace'));
    expect(onChangeText).toHaveBeenCalledWith('GRACE');
    updateField(web, { value: 'GRACE', maxLength: 12, sanitize, onChangeText });
    expect(nativeInput(web).props.value).toBe('GRACE');
    expect(mockSetTextAndSelection).not.toHaveBeenCalled();
  });
});
