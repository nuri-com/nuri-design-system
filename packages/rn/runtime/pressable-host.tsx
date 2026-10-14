import * as React from 'react';
import { Platform, Pressable as RNPressable } from 'react-native';
import type { PressableProps as RNPressableProps } from 'react-native';

type PressableHostProps = Pick<
  RNPressableProps,
  | 'onPress'
  | 'onLongPress'
  | 'hitSlop'
  | 'disabled'
  | 'accessibilityLabel'
  | 'accessibilityValue'
  | 'accessibilityHint'
  | 'accessibilityElementsHidden'
  | 'importantForAccessibility'
  | 'onLayout'
  | 'testID'
  | 'style'
  | 'children'
> & {
  role?: DescriptorPressableRole;
  selected?: boolean;
  checked?: boolean;
};

export type PressableRole = 'button' | 'tab';
// The descriptor channel's superset (the Switch slice · prompts/admission-switch.md
// anti-scope): `switch` is reachable ONLY through a descriptor (role + the `checked`
// bridge); the open Pressable primitive keeps `PressableRole`, so its public
// surface is byte-identical.
export type DescriptorPressableRole = PressableRole | 'switch';

// Internal shell shared by the open primitive and descriptor renderer. Style
// resolution stays with each caller; this component owns only host behaviour.
export const PressableHost = React.forwardRef<React.ElementRef<typeof RNPressable>, PressableHostProps>(
  ({ role, selected, checked, disabled = false, ...props }, ref) => {
    const isDisabled = !!disabled;
    // The host announces exactly what the caller passes (S2): the descriptor
    // channel gates `selected` on the declared propMaps.selected bridge (and
    // `checked` on propMaps.checked · the switch role), the open primitive gates
    // it on role — policy lives at the callers, not here. A state is present ONLY
    // when passed: no silent `selected: undefined` / `checked: undefined` keys.
    const accessibilityState = {
      disabled: isDisabled,
      ...(selected === undefined ? {} : { selected }),
      ...(checked === undefined ? {} : { checked }),
    };
    const webState = Platform.OS === 'web'
      ? {
          ...(selected === undefined ? {} : { 'aria-selected': selected }),
          ...(checked === undefined ? {} : { 'aria-checked': checked }),
        }
      : {};
    return (
      <RNPressable
        {...props}
        {...webState}
        ref={ref}
        disabled={isDisabled}
        accessibilityRole={role ?? 'button'}
        accessibilityState={accessibilityState}
      />
    );
  },
);
PressableHost.displayName = 'PressableHost';
