import * as React from 'react';

import {
  Button,
  IconButton,
  NuriIcon,
  Text,
  Topbar,
  TopbarLeading,
  TopbarTrailing,
  View,
} from '@ds';
import { WalletTabs, type WalletTab } from '../components/WalletTabs';

export function Home({
  selectedTab,
  onSelectTab,
  onOpenMenu,
  onToggleTheme,
}: {
  selectedTab: WalletTab;
  onSelectTab: (tab: WalletTab) => void;
  onOpenMenu: () => void;
  onToggleTheme: () => void;
}) {
  const balance = selectedTab === 'bitcoin' ? '₿ 0.0413' : selectedTab === 'bank' ? '€ 25.87' : '€ 1 240.00';
  const secondaryAction = selectedTab === 'bank' ? 'Details' : 'Receive';
  const primaryAccent = selectedTab === 'bitcoin' ? 'orange' : 'lilac';

  return (
    <>
      <Topbar>
        <TopbarLeading>
          <NuriIcon name="nuri" />
        </TopbarLeading>
        <TopbarTrailing>
          <IconButton icon="list-bullets" variant="soft" accessibilityLabel="Open sheet menu" onPress={onOpenMenu} />
          <IconButton icon="headphones" variant="soft" accessibilityLabel="Toggle theme" onPress={onToggleTheme} />
        </TopbarTrailing>
      </Topbar>

      <View direction="column" align="stretch" justify="start" gap="lg" paddingX="lg" paddingY="md" fill="grow">
        {selectedTab === 'bank' ? (
          <View aspectRatio="card" radius="lg" variant="soft" />
        ) : (
          <View aspectRatio="card" radius="lg" />
        )}
        <Text size="3xl" emphasis align="center">{balance}</Text>
        <View direction="row" align="center" gap="sm">
          <View fill="even">
            <Button size="lg" variant="soft">{secondaryAction}</Button>
          </View>
          <View fill="even">
            <Button size="lg" variant="solid" accent={primaryAccent}>Send</Button>
          </View>
        </View>
      </View>

      <WalletTabs selectedTab={selectedTab} onSelectTab={onSelectTab} />
    </>
  );
}
