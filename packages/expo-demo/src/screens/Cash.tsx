/* ──────────────────────────────────────────────────────────────
 * CASH · the euro destination — the "cash" board of
 * packages/playground/pages/tab-bar.html, translated. Pure DS
 * composition via the ui/ manifest; the tab bar renders ONCE in App.
 * Same hand-finish deltas as Wallet.tsx (documented there + in the PR).
 * The one board delta: the card surface carries variant="soft".
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

export const Cash: React.FC = () => (
  <View direction="column" align="stretch" justify="start" fill="grow" chrome="canvas">
    <Topbar>
      <TopbarLeading>
        <NuriIcon name="nuri" />
      </TopbarLeading>
      <TopbarCenter>
        <Button size="sm" variant="solid">Add to Apple Wallet</Button>
      </TopbarCenter>
      <TopbarTrailing>
        <IconButton icon="headphones" variant="soft" size="lg" accessibilityLabel="Support" />
      </TopbarTrailing>
    </Topbar>

    <View direction="column" align="stretch" justify="start" gap="lg" paddingX="lg" paddingY="md" fill="grow">
      <View aspectRatio="card" radius="lg" variant="soft" />
      <View align="center">
        <Text size="3xl" emphasis>€ 1 240.00</Text>
      </View>
      <View direction="row" align="center" gap="sm">
        <View fill="even">
          <Button size="lg" variant="soft">Details</Button>
        </View>
        <View fill="even">
          <Button size="lg" variant="solid" accent="lilac">Add Money</Button>
        </View>
      </View>
    </View>
  </View>
);
