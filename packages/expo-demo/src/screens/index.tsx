/* ──────────────────────────────────────────────────────────────
 * SCREENS · playground-parity RN demo surface.
 *
 * The router owns ROUTING state only: which page is visible and which wallet
 * tab is selected. Sheets and their state live with the screen that launches
 * them (Menu.tsx) — a <BottomSheet> registers into the OverlayProvider from
 * anywhere, so nothing needs hoisting to the root.
 * ────────────────────────────────────────────────────────────── */

import * as React from 'react';

import { Home } from './Home';
import { Menu } from './Menu';
import type { WalletTab } from '../components/WalletTabs';

type Page = 'wallet' | 'sheetMenu';

export const Screens: React.FC<{ onToggleTheme: () => void }> = ({ onToggleTheme }) => {
  const [page, setPage] = React.useState<Page>('wallet');
  const [wallet, setWallet] = React.useState<WalletTab>('euro');

  return page === 'wallet' ? (
    <Home
      selectedTab={wallet}
      onSelectTab={setWallet}
      onOpenMenu={() => setPage('sheetMenu')}
      onToggleTheme={onToggleTheme}
    />
  ) : (
    <Menu onBack={() => setPage('wallet')} />
  );
};
