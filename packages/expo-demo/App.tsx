/* ══════════════════════════════════════════════════════════════════
 * APP · the Nuri consumption example, full-screen.
 * ──────────────────────────────────────────────────────────────────
 * The NAVIGATOR role (decision 58): safe-area is READ in ONE place — here —
 * and passed as numbers to NuriRoot. App owns the native safe-area reader, the
 * Expo StatusBar, route state, and tab-items DATA. The demo opens on the
 * playground screens surface, with a simple menu for launching bottom-sheet
 * examples. No navigation library.
 *
 * accent="neutral" mirrors the playground page scope (the tab-bar boards
 * render under accent=neutral — the accent pops are the screens' OWN
 * accent="orange"/"lilac" props).
 *
 * ══════════════════════════════════════════════════════════════════ */

import * as React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { NuriRoot } from '@ds';
import type { Theme } from '@ds';
import { Screens } from './src/screens';

function Shell() {
  const [mode, setMode] = React.useState<Theme>('light');
  const toggleTheme = React.useCallback(
    () => setMode((m) => (m === 'light' ? 'dark' : 'light')),
    [],
  );
  // The ONE place safe-area is owned (decision 58 · navigator role).
  const insets = useSafeAreaInsets();

  return (
    <NuriRoot mode={mode} accent="neutral" safeArea={insets}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <Screens onToggleTheme={toggleTheme} />
    </NuriRoot>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Shell />
    </SafeAreaProvider>
  );
}
