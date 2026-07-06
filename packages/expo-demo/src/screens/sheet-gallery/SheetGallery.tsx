/* ──────────────────────────────────────────────────────────────
 * SHEET GALLERY · current-API bottom-sheet demo.
 *
 * Screen-local product/demo composition only: this file owns page state,
 * selected wallet tab, sheet-open state, and sample form values.
 * ────────────────────────────────────────────────────────────── */

import * as React from 'react';

import { View } from '@ds';
import { ActionsSheet } from './ActionsSheet';
import { ActivitySheet } from './ActivitySheet';
import { AmountSheet } from './AmountSheet';
import { FormSheet } from './FormSheet';
import { SheetMenu } from './SheetMenu';
import { WalletHome } from './WalletHome';

type Page = 'wallet' | 'sheetMenu';
type WalletTab = 'bitcoin' | 'bank' | 'euro';
type OpenSheet = 'none' | 'activity' | 'amount' | 'actions' | 'form';
type FormValues = {
  iban: string;
  firstName: string;
  secondName: string;
  reference: string;
  email: string;
  note: string;
};

export const SheetGallery: React.FC<{ onToggleTheme: () => void }> = ({ onToggleTheme }) => {
  const [page, setPage] = React.useState<Page>('wallet');
  const [wallet, setWallet] = React.useState<WalletTab>('euro');
  const [openSheet, setOpenSheet] = React.useState<OpenSheet>('none');
  const [formValues, setFormValues] = React.useState<FormValues>({
    iban: 'DE06100110012625717344',
    firstName: '',
    secondName: '',
    reference: '',
    email: '',
    note: '',
  });

  const closeSheet = React.useCallback(() => setOpenSheet('none'), []);
  const setField = React.useCallback(
    (id: keyof FormValues) => (value: string) => setFormValues((prev) => ({ ...prev, [id]: value })),
    [],
  );

  return (
    <View direction="column" align="stretch" justify="start" fill="grow" chrome="canvas">
      {page === 'wallet' ? (
        <WalletHome
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
