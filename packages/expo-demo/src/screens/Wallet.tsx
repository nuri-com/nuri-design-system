/* ──────────────────────────────────────────────────────────────
 * WALLET · the card destination — the "wallet" board of
 * packages/playground/pages/tab-bar.html, translated. Pure DS
 * composition: primitives + generated components via the ui/ manifest,
 * typed props only. The tab bar is NOT here — the bar renders ONCE in
 * App (screen = topbar + content; App composes screen + BottomBar).
 *
 * Hand-finish deltas vs the web template (see the PR findings):
 *   · root `nuri-stack` → View chrome="canvas" — the RN twin of the web
 *     page cascade's colour context: the screen roots a canvas surface so
 *     bare Text reads the themed fg by scope (§12).
 *   · `gap="none"` dropped (no 'none' space leaf · the flex default IS no gap).
 *   · bare `fill` → fill="grow" (the web bare-attr back-compat value).
 * ────────────────────────────────────────────────────────────── */

import * as React from 'react';
import {
  Button,
  IconButton,
  NuriIcon,
  Text,
  Topbar,
  TopbarCenter,
  TopbarLeading,
  TopbarTrailing,
  View,
} from '../components/ui';

export const Wallet: React.FC = () => (
  <View direction="column" align="stretch" justify="start" fill="grow" chrome="canvas">
    <Topbar>
      <TopbarLeading>
        <NuriIcon name="nuri" />
      </TopbarLeading>
      <TopbarCenter>
        <IconButton size="sm" variant="solid" icon="apple" accessibilityLabel="Buy with Apple Pay" />
      </TopbarCenter>
      <TopbarTrailing>
        <IconButton icon="headphones" variant="soft" size="lg" accessibilityLabel="Support" />
      </TopbarTrailing>
    </Topbar>

    <View direction="column" align="stretch" justify="start" gap="lg" paddingX="lg" paddingY="md" fill="grow">
      <View aspectRatio="card" radius="lg" />
      <Text size="3xl" emphasis align="center">€ 25.87</Text>
      <View direction="row" align="center" gap="sm">
        <View fill="even">
          <Button size="lg" variant="soft">Receive</Button>
        </View>
        <View fill="even">
          <Button size="lg" variant="solid" accent="orange">Send</Button>
        </View>
      </View>
    </View>
  </View>
);
