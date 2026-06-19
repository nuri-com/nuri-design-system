/* ══════════════════════════════════════════════════════════════════
 * APP · the Nuri factory demo, full-screen.
 * ──────────────────────────────────────────────────────────────────
 * Mounts the consumable EXAMPLE (src/screens/Demo) under a single
 * <NuriThemeProvider> pinned to the brand accent (lilac). The demo is built
 * ONLY on the factory components (the ergonomic Button / IconAvatar / Topbar).
 *
 * SAFE-AREA · THE NAVIGATOR ROLE (decision 58): safe-area is owned in ONE
 * place — here — so the Nuri components stay inset-agnostic. The canvas-
 * coloured root pads the status-bar inset at top and the home-indicator at
 * bottom (insets are 0 on web). The light/dark toggle lives in the demo.
 * ══════════════════════════════════════════════════════════════════ */

import * as React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { NuriThemeProvider, chrome, type Theme } from '@nuri/factory';
import { Demo } from './src/screens/Demo';

function Root() {
  const [mode, setMode] = React.useState<Theme>('light');
  const toggleTheme = React.useCallback(
    () => setMode((m) => (m === 'light' ? 'dark' : 'light')),
    [],
  );

  // The ONE place safe-area is owned (decision 58 · navigator role).
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: chrome[mode].bgCanvas,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <NuriThemeProvider mode={mode} accent="lilac">
        <Demo onToggleTheme={toggleTheme} />
      </NuriThemeProvider>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Root />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
