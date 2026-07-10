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
  | 'accessibilityHint'
  | 'accessibilityElementsHidden'
  | 'importantForAccessibility'
  | 'onLayout'
  | 'testID'
  | 'style'
  | 'children'
> & {
  role?: PressableRole;
  selected?: boolean;
};

export type PressableRole = 'button' | 'tab';

// Internal shell shared by the open primitive and descriptor renderer. Style
// resolution stays with each caller; this component owns only host behaviour.
export const PressableHost = React.forwardRef<React.ElementRef<typeof RNPressable>, PressableHostProps>(
  ({ role, selected, disabled = false, ...props }, ref) => {
    const isDisabled = !!disabled;
    // The host announces exactly what the caller passes (S2): the descriptor
    // channel gates `selected` on the declared propMaps.selected bridge, the
    // open primitive gates it on role — policy lives at the callers, not here.
    const accessibilityState = selected === undefined
      ? { disabled: isDisabled }
      : { disabled: isDisabled, selected };
    const webSelected = Platform.OS === 'web' && selected !== undefined
      ? { 'aria-selected': selected }
      : {};
    return (
      <RNPressable
        {...props}
        {...webSelected}
        ref={ref}
        disabled={isDisabled}
        accessibilityRole={role ?? 'button'}
        accessibilityState={accessibilityState}
      />
    );
  },
);
PressableHost.displayName = 'PressableHost';
