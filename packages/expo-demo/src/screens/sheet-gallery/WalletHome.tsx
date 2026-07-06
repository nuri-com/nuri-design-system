import * as React from 'react';

import {
  Button,
  IconButton,
  NuriIcon,
  TabBar,
  TabBarItem,
  Text,
  Topbar,
  TopbarLeading,
  TopbarTrailing,
  View,
} from '@ds';

export function WalletHome({
  selectedTab,
  onSelectTab,
  onOpenMenu,
  onToggleTheme,
}: {
  selectedTab: 'bitcoin' | 'bank' | 'euro';
  onSelectTab: (tab: 'bitcoin' | 'bank' | 'euro') => void;
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

      <TabBar>
        <TabBarItem
          icon="bitcoin-wallet"
          label="€ 36.50"
          selected={selectedTab === 'bitcoin'}
          onPress={() => onSelectTab('bitcoin')}
        />
        <TabBarItem
          icon="bank"
          label="€ 18.90"
          selected={selectedTab === 'bank'}
          onPress={() => onSelectTab('bank')}
        />
        <TabBarItem
          icon="euro-wallet"
          label="€ 25.70"
          selected={selectedTab === 'euro'}
          onPress={() => onSelectTab('euro')}
        />
      </TabBar>
    </>
  );
}
