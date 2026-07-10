import * as React from 'react';

import {
  IconButton,
  NuriIcon,
  Footer,
  Header,
  Screen,
  Scroll,
  Topbar,
  TopbarLeading,
  TopbarTrailing,
} from '@ds';
import { WalletTabs, type WalletTab } from '../components/WalletTabs';
// One board per tab — file and component names MATCH the WalletTab values.
import { Bitcoin } from './Bitcoin';
import { Bank } from './Bank';
import { Euro } from './Euro';

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
  return (
    <Screen>
      <Header safeAreaTop chrome="canvas">
        <Topbar>
          <TopbarLeading>
            <NuriIcon name="nuri" />
          </TopbarLeading>
          <TopbarTrailing>
            <IconButton icon="list-bullets" variant="soft" accessibilityLabel="Open sheet menu" onPress={onOpenMenu} />
            <IconButton icon="headphones" variant="soft" accessibilityLabel="Toggle theme" onPress={onToggleTheme} />
          </TopbarTrailing>
        </Topbar>
      </Header>

      <Scroll>
        {selectedTab === 'bitcoin' ? <Bitcoin /> : null}
        {selectedTab === 'bank' ? <Bank /> : null}
        {selectedTab === 'euro' ? <Euro /> : null}
      </Scroll>

      <Footer safeAreaBottom chrome="canvas">
        <WalletTabs selectedTab={selectedTab} onSelectTab={onSelectTab} />
      </Footer>
    </Screen>
  );
}
