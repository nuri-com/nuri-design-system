import * as React from 'react';

import {
  Button,
  Dock,
  Footer,
  Header,
  IconButton,
  NuriScope,
  Screen,
  Text,
  Topbar,
  TopbarContent,
  TopbarTrailing,
  View,
} from '@ds';

const noop = () => undefined;

// EXPLORATIVE (operator mock 2026-08-17): the shared QR-scanner step redesigned
// — "Who is your recipient?" with Paste · Upload · Scan. 1:1 twin of the
// playground board "scan · recipient · docked panel" (pages/scan.html, the
// operator-ruled grammar): the dark camera PLACEHOLDER fills the screen
// edge-to-edge (no camera implementation in the demo bed, ever) and the
// docked panel overlays it via Dock, its radiusTop="lg" corner cutouts
// revealing the camera behind — the bottom-sheet chrome, screen-owned.
//
// Purpose of this prototype (operator ask): observe how the STATUS BAR reacts
// to the scope placement. The demo drives Expo StatusBar from the app-level
// theme (App.tsx), so this screen-local dark scope does NOT flip it — in
// light mode expect dark status glyphs over the dark camera. That reaction is
// the point: where mode scope should live (and whether the DS should own
// per-screen status-bar style) is the open design question this screen makes
// visible on device.
//
// Safe area: solved by nesting Footer inside the docked panel (see below) —
// Dock overlays but styles nothing, and Footer cannot round its own corners, so
// each contributes the half it can. The clean fix would be safeAreaBottom on
// Dock (or radiusTop on Footer); recorded rather than worked around.
export function Scan({ onClose }: { onClose: () => void }) {
  return (
    <Screen>
      {/* Uncomment to try the app-side per-screen override on device — RN
          StatusBar instances stack, so this wins while Scan is mounted and
          restores on close: (import { StatusBar } from 'expo-status-bar')
        <StatusBar style="light" />
      */}
      <NuriScope mode="dark">
        <View chrome="canvas" fill="grow" direction="column" align="stretch">
          <Header safeAreaTop chrome="transparent">
            <Topbar surface="transparent" layout="fluid">
              <TopbarContent />
              <TopbarTrailing>
                <IconButton icon="cross" variant="soft" accessibilityLabel="Close" onPress={onClose} />
              </TopbarTrailing>
            </Topbar>
          </Header>
        </View>
      </NuriScope>

      <Dock edge="bottom">
        <View chrome="canvas" radiusTop="lg" direction="column" align="stretch" gap="xl" paddingX="lg" paddingTop="xl">
          <View direction="column" align="stretch" gap="sm" paddingBottom="md">
            <Text size="lg" emphasis>Who is your recipient?</Text>
            <Text size="md" muted>Scan or upload a QR code, bill, invoice or screenshot to add details automatically</Text>
          </View>
          {/* Footer INSIDE the docked panel: it is the only primitive that adds
              the device safe-area to its authored padding, which lands the Scan
              button on the same line as Move's Cancel/Next. It cannot carry the
              rounded corners (no radiusTop), so the painted panel stays the
              View; Dock takes only `edge` and supplies no inset. */}
          <Footer safeAreaBottom direction="column" align="stretch" gap="sm" paddingBottom="lg">
            <View direction="row" distribute="even" gap="sm">
              <Button size="lg" variant="soft" onPress={noop}>Paste</Button>
              <Button size="lg" variant="soft" onPress={noop}>Upload</Button>
            </View>
            <Button size="lg" variant="solid" accent="lilac" onPress={noop}>Scan</Button>
          </Footer>
        </View>
      </Dock>
    </Screen>
  );
}
