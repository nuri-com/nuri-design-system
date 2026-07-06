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
} from '../../components/ui';
import { WALLETS } from './data';
import type { WalletState, WalletTab } from './types';

export function WalletHome({
  selectedWallet,
  selectedTab,
  onSelectTab,
  onOpenMenu,
  onToggleTheme,
}: {
  selectedWallet: WalletState;
  selectedTab: WalletTab;
  onSelectTab: (tab: WalletTab) => void;
  onOpenMenu: () => void;
  onToggleTheme: () => void;
}) {
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
        {selectedWallet.cardVariant ? (
          <View aspectRatio="card" radius="lg" variant={selectedWallet.cardVariant} />
        ) : (
          <View aspectRatio="card" radius="lg" />
        )}
        <Text size="3xl" emphasis align="center">{selectedWallet.balance}</Text>
        <View direction="row" align="center" gap="sm">
          <View fill="even">
            <Button size="lg" variant="soft">{selectedWallet.secondaryAction}</Button>
          </View>
          <View fill="even">
            <Button size="lg" variant="solid" accent={selectedWallet.primaryAccent}>{selectedWallet.primaryAction}</Button>
          </View>
        </View>
      </View>

      <TabBar>
        {WALLETS.map((item) => (
          <TabBarItem
            key={item.key}
            icon={item.icon}
            label={item.tabLabel}
            selected={item.key === selectedTab}
            onPress={() => onSelectTab(item.key)}
          />
        ))}
      </TabBar>
    </>
  );
}
