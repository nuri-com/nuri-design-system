/* ══════════════════════════════════════════════════════════════════
 * SWITCH · the RN side of <nuri-switch> · N+6.5 · decision 44
 * ──────────────────────────────────────────────────────────────────
 * API contract mirrors switch.js (the web custom-element):
 *   checked?:  boolean                      default false
 *   accent?:   Accent                       overrides ambient context
 *   disabled?: boolean
 *   onChange?: (checked: boolean) => void
 *   — NO `size` prop · single-size-locked (60×36 · decision 44)
 *
 * COMPLETE RN translation (no Icon blocker). Consumes switchTokens
 * end-to-end: geometry leaves (trackWidth/Height, knobSize, inset)
 * resolve to `number`, colour leaves (trackOffBg/OnBg, knobBg) to
 * `string` via resolveToken. Knob travel is the one derived value the
 * web keeps as a CSS calc() — computed inline here.
 *
 * Behavioural deltas vs the web (FRICTIONS.md · F-CHECKED-STATE-1):
 *   - Track flip · `checked` drives inline backgroundColor + knob
 *     translateX. No CSS transition (RN would need Animated).
 *   - Press squash · Pressable's `pressed` scales the knob manually.
 * ══════════════════════════════════════════════════════════════════ */

import * as React from 'react';
import { Pressable, View } from 'react-native';
import {
  NuriThemeContext,
  resolveToken,
  switchTokens,
  chrome,
  accentTokens,
  space,
  size,
  radius,
  type Accent,
  type RuntimeTokens,
} from './_shared';

export type SwitchProps = {
  checked?: boolean;
  accent?: Accent;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
};

export const Switch: React.FC<SwitchProps> = ({
  checked = false,
  accent: accentProp,
  disabled,
  onChange,
}) => {
  const { mode, accent: ambientAccent } = React.useContext(NuriThemeContext);
  const accent: Accent = accentProp ?? ambientAccent;

  const tokens: RuntimeTokens = {
    chrome: chrome[mode],
    accent: accentTokens[accent][mode],
    space,
    size,
    radius,
  };

  // Geometry leaves resolve to numbers; travel = track − knob − 2·inset
  // (the derived value the web keeps as a CSS calc, off the token surface).
  const trackWidth  = resolveToken(tokens, switchTokens.trackWidth) as number;
  const trackHeight = resolveToken(tokens, switchTokens.trackHeight) as number;
  const knobSize    = resolveToken(tokens, switchTokens.knobSize) as number;
  const inset       = resolveToken(tokens, switchTokens.inset) as number;
  const travel      = trackWidth - knobSize - 2 * inset;

  const trackColor = checked
    ? (resolveToken(tokens, switchTokens.trackOnBg) as string)
    : (resolveToken(tokens, switchTokens.trackOffBg) as string);
  const knobColor = resolveToken(tokens, switchTokens.knobBg) as string;

  return (
    <Pressable
      onPress={() => onChange?.(!checked)}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked: !!checked, disabled: !!disabled }}
      style={({ pressed }) => [
        {
          width:           trackWidth,
          height:          trackHeight,
          borderRadius:    radius.full,
          padding:         inset,
          justifyContent:  'center',
          backgroundColor: trackColor,
        },
        disabled && { opacity: switchTokens.disabledOpacity },
        pressed && !disabled && null,
      ]}
    >
      {({ pressed }) => (
        <View
          style={[
            {
              width:           knobSize,
              height:          knobSize,
              borderRadius:    radius.full,
              backgroundColor: knobColor,
              transform: [
                { translateX: checked ? travel : 0 },
                ...(pressed && !disabled ? [{ scale: switchTokens.knobPressScale }] : []),
              ],
            },
          ]}
        />
      )}
    </Pressable>
  );
};
