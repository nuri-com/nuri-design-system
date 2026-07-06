/* ──────────────────────────────────────────────────────────────
 * BOTTOM SHEET DEMO · current-API bottom-sheet demo.
 *
 * Screen-local product/demo composition only: this file owns page state,
 * selected wallet tab, sheet-open state, and sample form values.
 * ────────────────────────────────────────────────────────────── */

import * as React from 'react';

import { View } from '@ds';
import { Home } from './bottom-sheet-demo/Home';
import { Menu } from './bottom-sheet-demo/Menu';
import { ActionsSheet } from './bottom-sheet-demo/sheets/ActionsSheet';
import { ActivitySheet } from './bottom-sheet-demo/sheets/ActivitySheet';
import { AmountSheet } from './bottom-sheet-demo/sheets/AmountSheet';
import { FormSheet } from './bottom-sheet-demo/sheets/FormSheet';
import type { WalletTab } from './bottom-sheet-demo/components/WalletTabs';

type Page = 'wallet' | 'sheetMenu';
type OpenSheet = 'none' | 'activity' | 'amount' | 'actions' | 'form';
type FormValues = {
  iban: string;
  firstName: string;
  secondName: string;
  reference: string;
};

export const BottomSheetDemo: React.FC<{ onToggleTheme: () => void }> = ({ onToggleTheme }) => {
  const [page, setPage] = React.useState<Page>('wallet');
  const [wallet, setWallet] = React.useState<WalletTab>('euro');
  const [openSheet, setOpenSheet] = React.useState<OpenSheet>('none');
  const [formValues, setFormValues] = React.useState<FormValues>({
    iban: 'DE06100110012625717344',
    firstName: '',
    secondName: '',
    reference: '',
  });

  const closeSheet = React.useCallback(() => setOpenSheet('none'), []);
  const setField = React.useCallback(
    (id: keyof FormValues) => (value: string) => setFormValues((prev) => ({ ...prev, [id]: value })),
    [],
  );

  return (
    <View direction="column" align="stretch" justify="start" fill="grow" chrome="canvas">
      {page === 'wallet' ? (
        <Home
          selectedTab={wallet}
          onSelectTab={setWallet}
          onOpenMenu={() => setPage('sheetMenu')}
          onToggleTheme={onToggleTheme}
        />
      ) : (
        <Menu
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
