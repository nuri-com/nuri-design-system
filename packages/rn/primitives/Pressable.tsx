// ════════════════════════════════════════════════════════════════
// Pressable — View + the interactive opt-in (+ onPress) · RN <Pressable>
// ────────────────────────────────────────────────────────────────
// Mirrors the factory's el:'pressable' case (runtime/renderer.tsx · amendment
// 65.13 — the host is structure data, not an interactive-view derivation): the
// pressed render-prop re-applies the interactive transients via the SHARED
// flattenInteractive (F-PRESSED-1); disabled drives the a11y state + the
// disabledOpacity opt-in. behaviour (onPress/disabled/a11y) is the wrapper's;
// the style is 100% runtime/resolve.ts.
// ════════════════════════════════════════════════════════════════
import * as React from 'react';
import { Pressable as RNPressable } from 'react-native';
import type { GestureResponderEvent, Insets, LayoutChangeEvent } from 'react-native';
import type { BoxNS, StackNS, PaletteNS, InteractiveNS } from '../contract';
import { flattenInteractive } from '../runtime/resolve';
import { PressableHost } from '../runtime/pressable-host';
import type { PressableRole } from '../runtime/pressable-host';
import { PALETTE_KEYS } from '@nuri/spec/descriptors/schema';
import {
  BOX_KEYS,
  STACK_KEYS,
  INTERACTIVE_KEYS,
  useResolvedNode,
  withKeys,
  scopedByAccent,
  withSurface,
} from './shared';

export type PressableProps = BoxNS &
  // `distribute` needs child wrapping, which Pressable supports on neither engine.
  Omit<StackNS, 'distribute'> &
  PaletteNS &
  InteractiveNS & {
    children?: React.ReactNode;
    onPress?: (event: GestureResponderEvent) => void;
    onLongPress?: (event: GestureResponderEvent) => void;
    hitSlop?: number | Insets;
    disabled?: boolean;
    role?: PressableRole;
    selected?: boolean;
    accessibilityLabel?: string;
    accessibilityHint?: string;
    testID?: string;
    onLayout?: (event: LayoutChangeEvent) => void;
    ref?: React.Ref<React.ElementRef<typeof RNPressable>>;
  };

const PressableImpl = React.forwardRef<React.ElementRef<typeof RNPressable>, PressableProps>((props, ref) => {
  const {
    children,
    onPress,
    onLongPress,
    hitSlop,
    disabled,
    role,
    selected,
    accessibilityLabel,
    accessibilityHint,
    testID,
    onLayout,
    ...nsProps
  } = props;
  const { node, theme } = useResolvedNode(nsProps);
  const isDisabled = !!disabled;
  return (
    <PressableHost
      ref={ref}
      onPress={onPress}
      onLongPress={onLongPress}
      hitSlop={hitSlop}
      disabled={isDisabled}
      role={role}
      // The open-primitive selected policy (the S2 invariant, gated HERE not in
      // the shared host): a tab announces its state (omitted → false); a plain
      // button never carries a selected key.
      selected={role === 'tab' ? selected === true : undefined}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      testID={testID}
      onLayout={onLayout}
      style={({ pressed }) => flattenInteractive(node, theme, { pressed, disabled: isDisabled })}
    >
      {withSurface(node.fg, children)}
    </PressableHost>
  );
});
PressableImpl.displayName = 'Pressable';
export const Pressable = withKeys(scopedByAccent(PressableImpl), [
  ...BOX_KEYS,
  ...STACK_KEYS.filter((key) => key !== 'distribute'),
  ...PALETTE_KEYS,
  ...INTERACTIVE_KEYS,
]);
