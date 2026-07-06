import type { ActivityGroup, FormField, OpenSheet, TransferMethod, WalletState } from './types';

export const WALLETS: readonly WalletState[] = [
  {
    key: 'bitcoin',
    icon: 'bitcoin-wallet',
    tabLabel: '€ 36.50',
    balance: '₿ 0.0413',
    secondaryAction: 'Receive',
    primaryAction: 'Send',
    primaryAccent: 'orange',
  },
  {
    key: 'bank',
    icon: 'bank',
    tabLabel: '€ 18.90',
    balance: '€ 25.87',
    secondaryAction: 'Details',
    primaryAction: 'Send',
    primaryAccent: 'lilac',
    cardVariant: 'soft',
  },
  {
    key: 'euro',
    icon: 'euro-wallet',
    tabLabel: '€ 25.70',
    balance: '€ 1 240.00',
    secondaryAction: 'Receive',
    primaryAction: 'Send',
    primaryAccent: 'lilac',
  },
];

export const SHEET_BUTTONS: readonly { key: Exclude<OpenSheet, 'none'>; label: string }[] = [
  { key: 'activity', label: 'Activity Sheet' },
  { key: 'amount', label: 'Amount Sheet' },
  { key: 'actions', label: 'Actions Sheet' },
  { key: 'form', label: 'Form Sheet' },
];

export const ACTIVITY_GROUPS: readonly ActivityGroup[] = [
  {
    month: 'This month',
    items: [
      { name: 'To Wallet', meta: 'Sent · 10:24 am', amount: '- 12.00 €', sats: '3433 Sats', icon: 'arrow-up' },
      { name: 'Euro to Bitcoin', meta: 'Converted · Yesterday', amount: '12.00 €', sats: '3433 Sats', icon: 'transfer-horizontal' },
      { name: 'To Izmir Köftecisi', meta: 'Paid · Sat, 4 Jul', amount: '- 7.00 €', sats: '3433 Sats', icon: 'arrow-up' },
    ],
  },
  {
    month: 'June',
    items: [
      { name: 'To Emin Mahrt', meta: 'Sent · Wed, 16 June', amount: '- 12.00 €', sats: '3433 Sats', icon: 'arrow-up' },
      { name: 'From Emil Wagner', meta: 'Received · Wed, 16 June', amount: '12.00 €', sats: '3433 Sats', icon: 'plus' },
      { name: 'From Wallet', meta: 'Received · Wed, 16 June', amount: '12.00 €', sats: '3433 Sats', icon: 'plus' },
      { name: 'To EASYJET AIR KCTJ...', meta: 'Paid · Wed, 16 June', amount: '- 110.00 €', sats: '3433 Sats', icon: 'arrow-up' },
      { name: 'To Izmir Köftecisi', meta: 'Paid · Wed, 16 June', amount: '- 7.00 €', sats: '3433 Sats', icon: 'arrow-up' },
    ],
  },
  {
    month: 'May',
    items: [
      { name: 'To Wallet', meta: 'Sent · Fri, 30 May', amount: '- 15.00 €', sats: '4291 Sats', icon: 'arrow-up' },
      { name: 'From Emil Wagner', meta: 'Received · Thu, 29 May', amount: '22.00 €', sats: '6294 Sats', icon: 'plus' },
      { name: 'Euro to Bitcoin', meta: 'Converted · Wed, 28 May', amount: '30.00 €', sats: '8582 Sats', icon: 'transfer-horizontal' },
      { name: 'To Izmir Köftecisi', meta: 'Paid · Tue, 27 May', amount: '- 7.00 €', sats: '2003 Sats', icon: 'arrow-up' },
      { name: 'To EASYJET AIR KCTJ...', meta: 'Paid · Mon, 26 May', amount: '- 84.00 €', sats: '24041 Sats', icon: 'arrow-up' },
    ],
  },
];

export const METHODS: readonly TransferMethod[] = [
  { label: 'Bitcoin wallet', icon: 'wallet', accent: 'orange' },
  { label: 'Credit card', icon: 'card', accent: 'lilac' },
  { label: 'Convert to euro', icon: 'transfer-horizontal' },
];

export const FORM_FIELDS: readonly FormField[] = [
  {
    id: 'iban',
    label: 'IBAN*',
    placeholder: 'IBAN',
    initialValue: 'DE06100110012625717344',
    action: 'Paste',
  },
  { id: 'firstName', label: 'First name*', placeholder: 'eg. Satoshi' },
  { id: 'secondName', label: 'Second name*', placeholder: 'eg. Nakamoto' },
  { id: 'reference', label: 'Reference', placeholder: 'Optional' },
  { id: 'email', label: 'Email', placeholder: 'name@example.com', inputMode: 'email' },
  { id: 'note', label: 'Note', placeholder: 'Add a short note' },
];

export const INITIAL_FORM_VALUES = FORM_FIELDS.reduce<Record<string, string>>((values, field) => {
  if (field.initialValue) values[field.id] = field.initialValue;
  return values;
}, {});
