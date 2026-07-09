/* ──────────────────────────────────────────────────────────────
 * SCREENS · playground-parity RN demo surface.
 *
 * This file owns only the tiny state needed to switch visible mockups and
 * launch sheet examples. The mockup chunks themselves stay in separate files.
 * ────────────────────────────────────────────────────────────── */

import * as React from 'react';

import { Home } from './Home';
import { Menu } from './Menu';
import { ActionsSheet } from '../sheets/ActionsSheet';
import { ActivitySheet } from '../sheets/ActivitySheet';
import { AmountSheet } from '../sheets/AmountSheet';
import { FormSheet, FormSheet2 } from '../sheets/FormSheet';
import type { WalletTab } from '../components/WalletTabs';

type Page = 'wallet' | 'sheetMenu';
type OpenSheet = 'none' | 'activity' | 'amount' | 'actions' | 'form' | 'form2';
type FormValues = {
  iban: string;
  firstName: string;
  secondName: string;
  reference: string;
};

export const Screens: React.FC<{ onToggleTheme: () => void }> = ({ onToggleTheme }) => {
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
    <>
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

      <ActivitySheet
        open={openSheet === 'activity'}
        onClose={closeSheet}
      />
      <AmountSheet
        open={openSheet === 'amount'}
        onClose={closeSheet}
      />
      <ActionsSheet
        open={openSheet === 'actions'}
        onClose={closeSheet}
      />
      <FormSheet
        open={openSheet === 'form'}
        values={formValues}
        onChangeField={setField}
        onClose={closeSheet}
      />
      <FormSheet2
        open={openSheet === 'form2'}
        values={formValues}
        onChangeField={setField}
        onClose={closeSheet}
      />
    </>
  );
};
