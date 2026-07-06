/* ══════════════════════════════════════════════════════════════════
 * APP · the Nuri consumption example, full-screen.
 * ──────────────────────────────────────────────────────────────────
 * The NAVIGATOR role (decision 58): safe-area is owned in ONE place —
 * here — so the Nuri components stay inset-agnostic. The canvas-coloured
 * root pads the status-bar inset at top and the home-indicator at bottom
 * (insets are 0 on web). App also owns everything the DS deliberately
 * does NOT: the <NuriThemeProvider> root, the route state, and the
 * tab-items DATA. The demo opens on the playground screens surface, with a
 * simple menu for launching bottom-sheet examples. No navigation library.
 *
 * accent="neutral" mirrors the playground page scope (the tab-bar boards
 * render under accent=neutral — the accent pops are the screens' OWN
 * accent="orange"/"lilac" props).
 *
 * ══════════════════════════════════════════════════════════════════ */

import * as React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { NuriThemeProvider, OverlayProvider, useNuriTheme } from '@ds';
import type { Theme } from '@ds';
import { Screens } from './src/screens';

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
      <Screens onToggleTheme={onToggleTheme} />
    </View>
  );
}

function Root() {
  const [mode, setMode] = React.useState<Theme>('light');
  const toggleTheme = React.useCallback(
    () => setMode((m) => (m === 'light' ? 'dark' : 'light')),
    [],
  );

  // <OverlayProvider> sits INSIDE the theme provider (so a registered sheet's
  // panel themes through the same payload) but ABOVE the safe-area padding
  // (it wraps ThemedRoot, which owns the padded root) — so the overlay outlet's
  // absoluteFill fills the WHOLE window, and a sheet's scrim dims the status bar
  // too. This is the inset-agnostic stance: the DS provider consumes no insets;
  // the consumer's placement above the padding is what makes it full-frame.
  return (
    <NuriThemeProvider mode={mode} accent="neutral">
      <OverlayProvider>
        <ThemedRoot mode={mode} onToggleTheme={toggleTheme} />
      </OverlayProvider>
    </NuriThemeProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Root />
    </SafeAreaProvider>
  );
}

const styles = {
  root: { flex: 1 },
};
