/* ═══════════════════════════════════════════════════════════════════
 * NURI · COMPOSED APP ROOT
 * ────────────────────────────────────────────────────────────────────
 * NuriRoot bakes in the provider order that makes the app shell coherent:
 *
 *   NuriThemeProvider
 *     OverlayProvider
 *       View chrome="canvas" fill="grow"
 *         NuriSafeAreaProvider
 *
 * The order is the contract. The overlay must be inside the theme provider so
 * registered layers share the active payload, but above the canvas's safe-area
 * environment so its absolute outlet covers the whole window (including the
 * status bar). The DS View owns both canvas paint and its inherited foreground.
 *
 * This composes providers, not behaviour. Each provider remains public for
 * tests, unusual hosts, and other legitimate piecemeal assembly. Native inset
 * reading also remains consumer-owned: this component accepts plain numbers
 * and never imports a safe-area native module.
 * ════════════════════════════════════════════════════════════════════ */

import * as React from 'react';

import type { Accent, Theme } from './contract';
import { OverlayProvider } from './overlay';
import { View } from './primitives/View';
import { NuriSafeAreaProvider } from './safe-area';
import { NuriThemeProvider } from './theme';

export type NuriRootProps = {
  mode?: Theme;
  accent?: Accent;
  safeArea?: { top?: number; bottom?: number };
  children: React.ReactNode;
};

export function NuriRoot({
  mode = 'light',
  accent = 'lilac',
  safeArea,
  children,
}: NuriRootProps): React.ReactElement {
  return (
    <NuriThemeProvider mode={mode} accent={accent}>
      <OverlayProvider>
        <View chrome="canvas" fill="grow">
          <NuriSafeAreaProvider top={safeArea?.top} bottom={safeArea?.bottom}>
            {children}
          </NuriSafeAreaProvider>
        </View>
      </OverlayProvider>
    </NuriThemeProvider>
  );
}

NuriRoot.displayName = 'NuriRoot';
