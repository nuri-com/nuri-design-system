/* ══════════════════════════════════════════════════════════════════
 * APP · the Nuri consumption example, full-screen.
 * ──────────────────────────────────────────────────────────────────
 * The NAVIGATOR role (decision 58): safe-area is owned in ONE place —
 * here — so the Nuri components stay inset-agnostic. The canvas-coloured
 * root pads the status-bar inset at top and the home-indicator at bottom
 * (insets are 0 on web). App also owns everything the DS deliberately
 * does NOT: the <NuriThemeProvider> root, the route state, and the
 * tab-items DATA — the screens are pure DS composition (topbar + content)
 * and <BottomBar> is the app-owned stateful wrapper over the dumb DS bar,
 * rendered ONCE below the active screen. No navigation library.
 *
 * accent="neutral" mirrors the playground page scope (the tab-bar boards
 * render under accent=neutral — the accent pops are the screens' OWN
 * accent="orange"/"lilac" props).
 *
 * HARNESS: the theme-toggle strip is demo chrome — the RN twin of the
 * playground's board controls, NOT part of the consumption example. It is
 * the one sanctioned non-DS spot (raw RN + StyleSheet · the settled
 * harness/screen split).
 * ══════════════════════════════════════════════════════════════════ */

import * as React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { NuriThemeProvider, useNuriTheme } from './src/components/ui';
import type { IconName, Theme } from './src/components/ui';
import { BottomBar } from './src/components/BottomBar';
import { Wallet } from './src/screens/Wallet';
import { Coin } from './src/screens/Coin';
import { Cash } from './src/screens/Cash';

// ── the app DATA the DS never owns: the routes and their tab items (the
// playground's three boards · one interactive bar). `selected` follows the
// route state; the DS bar just paints it. ──
type Route = 'wallet' | 'coin' | 'cash';

const TAB_ITEMS: readonly { key: Route; icon: IconName; label: string }[] = [
  { key: 'wallet', icon: 'wallet', label: '€ 36.50' },
  { key: 'coin', icon: 'card', label: '€ 18.90' },
  { key: 'cash', icon: 'bank', label: '€ 25.70' },
];

const SCREENS: Record<Route, React.FC> = {
  wallet: Wallet,
  coin: Coin,
  cash: Cash,
};

function ThemedRoot({
  mode,
  onToggleTheme,
}: {
  mode: Theme;
  onToggleTheme: () => void;
}) {
  const theme = useNuriTheme();
  // The ONE place safe-area is owned (decision 58 · navigator role).
  const insets = useSafeAreaInsets();
  const [route, setRoute] = React.useState<Route>('wallet');
  const ActiveScreen = SCREENS[route];

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: theme.chrome.canvas.bg,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      {/* HARNESS · theme toggle — demo chrome, not the DS. */}
      <View style={styles.harness}>
        <Pressable onPress={onToggleTheme} hitSlop={8}>
          <Text style={[styles.harnessText, { color: theme.text.muted }]}>
            theme: {mode} ⇄
          </Text>
        </Pressable>
      </View>
      <ActiveScreen />
      <BottomBar items={TAB_ITEMS} selected={route} onSelect={setRoute} />
    </View>
  );
}

function Root() {
  const [mode, setMode] = React.useState<Theme>('light');
  const toggleTheme = React.useCallback(
    () => setMode((m) => (m === 'light' ? 'dark' : 'light')),
    [],
  );

  return (
    <NuriThemeProvider mode={mode} accent="neutral">
      <ThemedRoot mode={mode} onToggleTheme={toggleTheme} />
    </NuriThemeProvider>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.gestureRoot}>
      <SafeAreaProvider>
        <Root />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  gestureRoot: { flex: 1 },
  root: { flex: 1 },
  // HARNESS chrome only (the sanctioned non-DS spot).
  harness: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 16, paddingVertical: 4 },
  harnessText: { fontSize: 12 },
});
