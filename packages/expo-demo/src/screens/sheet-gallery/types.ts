import type { ComponentProps } from 'react';

import type { IconName, TextField } from '../../components/ui';

export type Page = 'wallet' | 'sheetMenu';
export type WalletTab = 'bitcoin' | 'bank' | 'euro';
export type OpenSheet = 'none' | 'activity' | 'amount' | 'actions' | 'form';

export type WalletState = {
  key: WalletTab;
  icon: IconName;
  tabLabel: string;
  balance: string;
  secondaryAction: string;
  primaryAction: string;
  primaryAccent: 'orange' | 'lilac';
  cardVariant?: 'soft';
};

export type ActivityGroup = {
  month: string;
  items: readonly {
    name: string;
    meta: string;
    amount: string;
    sats: string;
    icon: IconName;
  }[];
};

export type TransferMethod = {
  label: string;
  icon: IconName;
  accent?: 'orange' | 'lilac';
};

export type FormField = {
  id: string;
  label: string;
  placeholder: string;
  inputMode?: ComponentProps<typeof TextField>['inputMode'];
  initialValue?: string;
  action?: string;
};
