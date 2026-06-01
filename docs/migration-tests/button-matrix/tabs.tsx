/* ══════════════════════════════════════════════════════════════════
 * TABS · the RN side of <nuri-tabs> + <nuri-tab> · N+6.5 · decision 43
 * ──────────────────────────────────────────────────────────────────
 * API contract mirrors tabs.js (the compound web custom-elements):
 *   Tabs:
 *     value:     string                      controlled selected value
 *     onChange?: (value: string) => void
 *     children:  Tab elements
 *   Tab:
 *     value:     string
 *     children:  string (label)
 *
 * DISABLED (decision 42/43 · D3 · N+13) · faithful to tabs.js ATTRS
 * (observedAttributes ['value','active','disabled']) — a disabled,
 * non-selectable option. The RN Tab now carries `disabled?: boolean`:
 * non-pressable (Pressable `disabled`), muted (the shared interaction
 * disabled opacity · button.disabledOpacity = --nuri-interaction-
 * disabled-opacity, 0.4 · the SAME primitive the web --nuri-tab-disabled-
 * opacity resolves from), press feedback suppressed, and
 * accessibilityState.disabled set.
 *
 * ⚠ BEHAVIOURAL DELTA (F-TAB-DISABLED-1 · friction-delta): web styles
 * the disabled option off the inner button's native `:disabled`
 * pseudo-class (+ cursor: not-allowed) — there is no DOM `:disabled` on
 * RN, so the mirror drives the muted look from the boolean directly and
 * the cursor affordance is web-only (the same F-DISABLED-1 cursor gap).
 * Props stay 1:1; only the disabled-state mechanism differs.
 *
 * The container surface is the RN Box (background + radius + padding —
 * via `style`, decision 42). The inter-tab gap reads the generated
 * tabsTokens.gap. Per-OPTION shape tokens (--nuri-tab-*) are web-CSS-
 * only by design, so the RN Tab reads the SAME semantic vocabulary
 * directly: size.md, space.md, radius.sm, chrome.textMuted (rest fg),
 * accent.solid / accent.onSolid (active fill/fg).
 *
 * Selection state lives in Tabs (mirrors the web controller owning
 * `value`); Tab is presentational, told its active state via
 * React.cloneElement (F-SELECTED-VALUE-1). Roving arrow-key nav is
 * deferred on both sides (F-KEYBOARD-NAV-1).
 * ══════════════════════════════════════════════════════════════════ */

import * as React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Box } from './box';
import {
  NuriThemeContext,
  resolveToken,
  typeStyle,
  tabsTokens,
  button,
  chrome,
  accentTokens,
  space,
  size,
  radius,
  type TokenPath,
  type RuntimeTokens,
} from './_shared';

export type TabProps = {
  value: string;
  children: string;
  disabled?: boolean;
  // Injected by Tabs (not author-set): the controller's selection +
  // change pipe. Optional so a bare <Tab> still typechecks.
  active?: boolean;
  onSelect?: (value: string) => void;
};

export const Tab: React.FC<TabProps> = ({ value, children, disabled, active, onSelect }) => {
  const { mode, accent } = React.useContext(NuriThemeContext);
  const tokens: RuntimeTokens = {
    chrome: chrome[mode], accent: accentTokens[accent][mode], space, size, radius,
  };

  const restFg   = resolveToken(tokens, 'chrome.textMuted' as const satisfies TokenPath) as string;
  const activeBg = resolveToken(tokens, 'accent.solid' as const satisfies TokenPath) as string;
  const activeFg = resolveToken(tokens, 'accent.onSolid' as const satisfies TokenPath) as string;

  return (
    <Pressable
      onPress={() => onSelect?.(value)}
      disabled={disabled}
      accessibilityRole="tab"
      accessibilityState={{ selected: !!active, disabled: !!disabled }}
      style={({ pressed }) => [
        {
          flex:            1,
          minHeight:       size.md,
          paddingHorizontal: space.md,
          borderRadius:    radius.sm,
          alignItems:      'center',
          justifyContent:  'center',
          backgroundColor: active ? activeBg : 'transparent',
        },
        disabled && { opacity: button.disabledOpacity },
        pressed && !disabled && { transform: [{ scale: 0.97 }] },
      ]}
    >
      <Text
        style={{
          ...typeStyle('smEm'),
          color: active ? activeFg : restFg,
        }}
      >
        {children}
      </Text>
    </Pressable>
  );
};

export type TabsProps = {
  value: string;
  onChange?: (value: string) => void;
  children: React.ReactElement<TabProps> | React.ReactElement<TabProps>[];
};

export const Tabs: React.FC<TabsProps> = ({ value, onChange, children }) => {
  const { mode, accent } = React.useContext(NuriThemeContext);
  const tokens: RuntimeTokens = {
    chrome: chrome[mode], accent: accentTokens[accent][mode], space, size, radius,
  };
  // gap is the generated tabsTokens.gap TokenPath ('space.2xs') → number.
  const gap = resolveToken(tokens, tabsTokens.gap) as number;

  // Container surface via the RN Box (background + radius + padding) —
  // the same composition the web <nuri-tabs> performs (decision 42).
  // Box now carries the surface props natively (D1 · N+13), so the
  // strong/md surface is declared, not passed through the style hatch.
  return (
    <Box
      paddingX="xs"
      paddingY="xs"
      background="strong"
      radius="md"
    >
      <View style={{ flexDirection: 'row', gap }}>
        {React.Children.map(children, (child) =>
          React.cloneElement(child, {
            active: child.props.value === value,
            onSelect: onChange,
          }),
        )}
      </View>
    </Box>
  );
};
