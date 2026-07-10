import * as React from 'react';
import { Platform, Pressable as RNPressable } from 'react-native';
import type { PressableProps as RNPressableProps } from 'react-native';

type PressableHostProps = Pick<
  RNPressableProps,
  | 'onPress'
  | 'disabled'
  | 'accessibilityLabel'
  | 'accessibilityElementsHidden'
  | 'importantForAccessibility'
  | 'style'
  | 'children'
> & {
  role?: 'button' | 'tab';
  selected?: boolean;
};

// Internal shell shared by the open primitive and descriptor renderer. Style
// resolution stays with each caller; this component owns only host behaviour.
export const PressableHost: React.FC<PressableHostProps> = ({
  role,
  selected,
  disabled = false,
  ...props
}) => {
  const isDisabled = !!disabled;
  const accessibilityState = selected === undefined ? { disabled: isDisabled } : { disabled: isDisabled, selected };
  const webSelected = Platform.OS === 'web' && selected !== undefined ? { 'aria-selected': selected } : {};
  return (
    <RNPressable
      {...props}
      {...webSelected}
      disabled={isDisabled}
      accessibilityRole={role ?? 'button'}
      accessibilityState={accessibilityState}
    />
  );
};
