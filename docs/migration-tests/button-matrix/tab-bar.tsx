/* ══════════════════════════════════════════════════════════════════
 * TAB-BAR · the RN side of <nuri-tab-bar> + <nuri-tab-bar-item> · N+9 · decision 56
 * ──────────────────────────────────────────────────────────────────
 * API contract mirrors tab-bar.js (the compound web custom-elements):
 *   TabBar:
 *     value:     string                      controlled selected value
 *     onChange?: (value: string) => void
 *     label?:    string                      nav landmark accessible name
 *     children:  TabBarItem elements
 *   TabBarItem:
 *     value:     string
 *     name:      IconName                    glyph (typed registry key)
 *     label?:    string                      accessible name (else from name)
 *
 * The icon-only BOTTOM destination switcher — DISTINCT from Tabs.
 * Selection lives in TabBar; each item is presentational, told its
 * active state via React.cloneElement (F-SELECTED-VALUE-1).
 *
 * EMIT (decision 52): the ONE baked structural decision is the bar
 * height, dereferenced from tabBarTokens.height ('size.xl' → number).
 * Everything else is direct-semantic: selected → chrome.textPrimary +
 * filled glyph, rest → chrome.borderStrong + regular glyph, pressed →
 * chrome.textMuted + Button's press-scale (button.pressScale).
 *
 * A11y · F-TABBAR-ROLE-1: RN has no role mapping 1:1 to web's
 * <nav>/aria-current, so this mirror APPROXIMATES with
 * accessibilityRole="tab" + accessibilityState={{ selected }}.
 * ══════════════════════════════════════════════════════════════════ */

import * as React from 'react';
import { Pressable, View } from 'react-native';
import { Icon } from './icon';
import {
  NuriThemeContext,
  resolveToken,
  button,
  chrome,
  accentTokens,
  space,
  size,
  radius,
  tabBarTokens,
  type IconName,
  type RuntimeTokens,
} from './_shared';

export type TabBarItemProps = {
  value: string;
  name: IconName;
  label?: string;
  // Injected by TabBar (not author-set): the controller's selection +
  // change pipe. Optional so a bare <TabBarItem> still typechecks.
  active?: boolean;
  onSelect?: (value: string) => void;
};

export const TabBarItem: React.FC<TabBarItemProps> = ({ value, name, label, active, onSelect }) => {
  const { mode } = React.useContext(NuriThemeContext);
  const chromeSlice = chrome[mode];

  // Direct-semantic item colours (no per-item token · decision 56).
  const restFg     = chromeSlice.borderStrong; // not selected · recedes
  const selectedFg = chromeSlice.textPrimary;  // selected · NOT accent
  const pressedFg  = chromeSlice.textMuted;    // pressed · transient

  return (
    <Pressable
      onPress={() => onSelect?.(value)}
      // F-TABBAR-ROLE-1 · RN approximation of web's <nav>/aria-current.
      accessibilityRole="tab"
      accessibilityState={{ selected: !!active }}
      // F-ARIA-LABEL-1 · icon-only target needs an accessible name.
      accessibilityLabel={label ?? name.replace(/-/g, ' ')}
      style={({ pressed }) => [
        {
          flex:           1,
          alignSelf:      'stretch',
          alignItems:     'center',
          justifyContent: 'center',
        },
        // Reuses Button's press-scale constant (button.pressScale =
        // the shared --nuri-interaction-press-scale · decision 45).
        pressed && { transform: [{ scale: button.pressScale }] },
      ]}
    >
      {({ pressed }) => (
        <Icon
          name={name}
          size="md"
          // Selected → filled weight; rest → regular. Pressed leaves the
          // weight untouched (colour + scale only), 1:1 with the CSS.
          fill={!!active}
          color={pressed ? pressedFg : active ? selectedFg : restFg}
        />
      )}
    </Pressable>
  );
};

export type TabBarProps = {
  value: string;
  onChange?: (value: string) => void;
  label?: string;
  children: React.ReactElement<TabBarItemProps> | React.ReactElement<TabBarItemProps>[];
};

export const TabBar: React.FC<TabBarProps> = ({ value, onChange, label, children }) => {
  const { mode } = React.useContext(NuriThemeContext);
  const tokens: RuntimeTokens = {
    chrome: chrome[mode], accent: accentTokens.lilac[mode], space, size, radius,
  };
  // The ONE baked token: bar height = tabBarTokens.height ('size.xl') → number.
  const height = resolveToken(tokens, tabBarTokens.height) as number;

  return (
    <View
      // RN has no <nav> landmark; the accessibilityLabel carries the
      // navigation name. (Role parity gap · F-TABBAR-ROLE-1.)
      accessibilityLabel={label}
      style={{
        flexDirection:   'row',
        alignItems:      'stretch',
        height,
        backgroundColor: chrome[mode].bgCanvas,
      }}
    >
      {React.Children.map(children, (child) =>
        React.cloneElement(child, {
          active: child.props.value === value,
          onSelect: onChange,
        }),
      )}
    </View>
  );
};
