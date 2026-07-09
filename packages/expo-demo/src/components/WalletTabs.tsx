import * as React from 'react';

import { TabBar, TabBarItem, TabBarItemIcon, TabBarItemLabel } from '@ds';

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
        selected={selectedTab === 'bitcoin'}
        onPress={() => onSelectTab('bitcoin')}
        accessibilityLabel="Bitcoin wallet"
      >
        <TabBarItemIcon name="bitcoin-wallet" />
        <TabBarItemLabel>€ 36.50</TabBarItemLabel>
      </TabBarItem>
      <TabBarItem
        selected={selectedTab === 'bank'}
        onPress={() => onSelectTab('bank')}
        accessibilityLabel="Bank account"
      >
        <TabBarItemIcon name="bank" />
        <TabBarItemLabel>€ 18.90</TabBarItemLabel>
      </TabBarItem>
      <TabBarItem
        selected={selectedTab === 'euro'}
        onPress={() => onSelectTab('euro')}
        accessibilityLabel="Euro wallet"
      >
        <TabBarItemIcon name="euro-wallet" />
        <TabBarItemLabel>€ 25.70</TabBarItemLabel>
      </TabBarItem>
    </TabBar>
  );
}
