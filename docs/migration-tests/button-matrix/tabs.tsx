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
 * ⚠ DRIFT (logged · roadmap/N+12b.md): the web <nuri-tab> observes a
 * `disabled` attribute (tabs.js observedAttributes ['value','active',
 * 'disabled']) — a disabled, non-selectable option. This RN Tab mirror
 * does NOT carry a `disabled` prop. Adding it (non-pressable + muted
 * styling + accessibilityState.disabled) is faithful to the web API;
 * logged as OPEN rather than silently added in the N+12b split.
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
  ThemeContext,
  AccentContext,
  resolveToken,
  typeStyle,
  tabsTokens,
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
  // Injected by Tabs (not author-set): the controller's selection +
  // change pipe. Optional so a bare <Tab> still typechecks.
  active?: boolean;
  onSelect?: (value: string) => void;
};

export const Tab: React.FC<TabProps> = ({ value, children, active, onSelect }) => {
  const theme = React.useContext(ThemeContext);
  const accent = React.useContext(AccentContext);
  const tokens: RuntimeTokens = {
    chrome: chrome[theme], accent: accentTokens[accent][theme], space, size, radius,
  };

  const restFg   = resolveToken(tokens, 'chrome.textMuted' as const satisfies TokenPath) as string;
  const activeBg = resolveToken(tokens, 'accent.solid' as const satisfies TokenPath) as string;
  const activeFg = resolveToken(tokens, 'accent.onSolid' as const satisfies TokenPath) as string;

  return (
    <Pressable
      onPress={() => onSelect?.(value)}
      accessibilityRole="tab"
      accessibilityState={{ selected: !!active }}
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
        pressed && { transform: [{ scale: 0.97 }] },
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
  const theme = React.useContext(ThemeContext);
  const accent = React.useContext(AccentContext);
  const tokens: RuntimeTokens = {
    chrome: chrome[theme], accent: accentTokens[accent][theme], space, size, radius,
  };
  // gap is the generated tabsTokens.gap TokenPath ('space.2xs') → number.
  const gap = resolveToken(tokens, tabsTokens.gap) as number;

  // Container surface via the RN Box (background + radius + padding) —
  // the same composition the web <nuri-tabs> performs (decision 42).
  return (
    <Box
      paddingX="xs"
      paddingY="xs"
      style={{ backgroundColor: chrome[theme].bgStrong, borderRadius: radius.md }}
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
