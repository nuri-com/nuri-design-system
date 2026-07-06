/* ──────────────────────────────────────────────────────────────
 * SHEET GALLERY · current-API bottom-sheet demo.
 *
 * Screen-local product/demo composition only: this file owns page state,
 * selected wallet tab, sheet-open state, and sample form values.
 * ────────────────────────────────────────────────────────────── */

import * as React from 'react';

import { View } from '../../components/ui';
import { ActionsSheet } from './ActionsSheet';
import { ActivitySheet } from './ActivitySheet';
import { AmountSheet } from './AmountSheet';
import { FormSheet } from './FormSheet';
import { SheetMenu } from './SheetMenu';
import { WalletHome } from './WalletHome';
import { INITIAL_FORM_VALUES, WALLETS } from './data';
import type { OpenSheet, Page, WalletTab } from './types';

export const SheetGallery: React.FC<{ onToggleTheme: () => void }> = ({ onToggleTheme }) => {
  const [page, setPage] = React.useState<Page>('wallet');
  const [wallet, setWallet] = React.useState<WalletTab>('euro');
  const [openSheet, setOpenSheet] = React.useState<OpenSheet>('none');
  const [formValues, setFormValues] = React.useState<Record<string, string>>(INITIAL_FORM_VALUES);

  const selectedWallet = WALLETS.find((item) => item.key === wallet) ?? WALLETS[0];
  const closeSheet = React.useCallback(() => setOpenSheet('none'), []);
  const setField = React.useCallback(
    (id: string) => (value: string) => setFormValues((prev) => ({ ...prev, [id]: value })),
    [],
  );

  return (
    <View direction="column" align="stretch" justify="start" fill="grow" chrome="canvas">
      {page === 'wallet' ? (
        <WalletHome
          selectedWallet={selectedWallet}
          selectedTab={wallet}
          onSelectTab={setWallet}
          onOpenMenu={() => setPage('sheetMenu')}
          onToggleTheme={onToggleTheme}
        />
      ) : (
        <SheetMenu
          onBack={() => setPage('wallet')}
          onOpenSheet={setOpenSheet}
        />
      )}

      <ActivitySheet open={openSheet === 'activity'} onClose={closeSheet} />
      <AmountSheet open={openSheet === 'amount'} onClose={closeSheet} />
      <ActionsSheet open={openSheet === 'actions'} onClose={closeSheet} />
      <FormSheet
        open={openSheet === 'form'}
        values={formValues}
        onChangeField={setField}
        onClose={closeSheet}
      />
    </View>
  );
};
