import * as React from 'react';

import { TabBar, TabBarItem } from '@ds';

export type WalletTab = 'bitcoin' | 'bank' | 'euro';

export function WalletTabs({
  selectedTab,
  onSelectTab,
}: {
  selectedTab: WalletTab;
  onSelectTab: (tab: WalletTab) => void;
}) {
  return (
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
  );
}
