// Curated, jargon-free copy for the 6 user-facing tools.
// Keys under `fields` are tool argument names (mapping target); all text is user-visible.
export const tools = {
  create_account: {
    title: 'Create your account',
    description: 'One email address and your country. That is all we need to start.',
    cta: 'Create my account',
    fields: {
      email: {
        label: 'Email address',
        placeholder: 'you@example.com',
        help: 'We send your login link here.',
      },
      country: {
        label: 'Country you live in',
        placeholder: 'e.g. Germany',
        help: 'This decides which payment rails your account uses.',
      },
    },
  },
  get_account_status: {
    title: 'Your account setup',
    description: 'See how far your setup has come and what happens next.',
    cta: 'Check progress',
    fields: {},
  },
  provision_virtual_card_and_bank_account: {
    title: 'Your card and euro account',
    description: 'Get a virtual card and your own euro account in one tap.',
    cta: 'Set up my card and account',
    fields: {},
  },
  cards: {
    title: 'Your cards',
    description: 'See your cards, set spending limits, and approve purchases.',
    cta: 'Open my cards',
    fields: {
      card_label: { label: 'Name for this card', placeholder: 'e.g. My everyday card' },
      amount: { label: 'Amount', placeholder: 'e.g. 25.00' },
    },
  },
  bank: {
    title: 'Money and payments',
    description: 'Check your balances and move money in and out.',
    cta: 'Open my money',
    fields: {
      amount: { label: 'Amount', placeholder: 'e.g. 50.00' },
    },
  },
  payouts: {
    title: 'Send money',
    description: 'Send money to a saved recipient. You always see the full cost before you confirm.',
    cta: 'Send money',
    fields: {
      amount: {
        label: 'Amount to send',
        placeholder: 'e.g. 100.00',
        help: 'Written the way money is written, like 12.50.',
      },
      iban: {
        label: 'Their account number (IBAN)',
        placeholder: 'e.g. DE44 5001 0517 5407 3249 31',
        help: 'The long number on their bank statement. Letters and digits only.',
      },
      recipient_name: {
        label: 'Their full name',
        placeholder: 'e.g. Maria Schmidt',
      },
    },
  },
};

export const common = {
  loading: 'One moment…',
  error: 'Something went wrong. Please try again.',
  back: 'Back',
  next: 'Continue',
  confirm: 'Confirm',
  cancel: 'Cancel',
  done: 'Done',
};
