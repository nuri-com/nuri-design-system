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
import type { BoxNS, StackNS, PaletteNS, InteractiveNS } from '../contract';
import { flattenInteractive } from '../runtime/resolve';
import { PressableHost } from '../runtime/pressable-host';
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
    onPress?: () => void;
    disabled?: boolean;
    accessibilityLabel?: string;
  };

const PressableImpl: React.FC<PressableProps> = (props) => {
  const { children, onPress, disabled, accessibilityLabel, ...nsProps } = props;
  const { node, theme } = useResolvedNode(nsProps);
  const isDisabled = !!disabled;
  return (
    <PressableHost
      onPress={onPress}
      disabled={isDisabled}
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => flattenInteractive(node, theme, { pressed, disabled: isDisabled })}
    >
      {withSurface(node.fg, children)}
    </PressableHost>
  );
};
PressableImpl.displayName = 'Pressable';
export const Pressable = withKeys(scopedByAccent(PressableImpl), [
  ...BOX_KEYS,
  ...STACK_KEYS.filter((key) => key !== 'distribute'),
  ...PALETTE_KEYS,
  ...INTERACTIVE_KEYS,
]);
