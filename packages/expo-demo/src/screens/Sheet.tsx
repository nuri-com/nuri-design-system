/* ──────────────────────────────────────────────────────────────
 * SHEET · current-API bottom-sheet gallery.
 *
 * This is intentionally demo composition only: the screen owns local page,
 * selected wallet tab, sheet-open state, and sample form values. The sheet
 * chrome uses today's public API (<BottomSheet>, <BottomSheetPanel>,
 * <BottomSheetScroll>) without adding the future header/footer contract.
 * ────────────────────────────────────────────────────────────── */

import * as React from 'react';
import {
  BottomSheet,
  BottomSheetPanel,
  BottomSheetScroll,
  Button,
  ButtonIcon,
  IconButton,
  List,
  ListAction,
  ListActionLeadingAvatar,
  ListActionText,
  ListActionTextMuted,
  ListActionTrailingText,
  ListActionTrailingTextMuted,
  ListActionTrailIcon,
  ListSeparator,
  NuriIcon,
  TabBar,
  TabBarItem,
  Text,
  TextField,
  TextFieldButton,
  TextFieldLabel,
  Topbar,
  TopbarLeading,
  TopbarTrailing,
  View,
} from '../components/ui';
import type { IconName } from '../components/ui';

type Page = 'wallet' | 'sheetMenu';
type WalletTab = 'bitcoin' | 'bank' | 'euro';
type OpenSheet = 'none' | 'activity' | 'amount' | 'actions' | 'form';

type WalletState = {
  key: WalletTab;
  icon: IconName;
  tabLabel: string;
  balance: string;
  secondaryAction: string;
  primaryAction: string;
  primaryAccent: 'orange' | 'lilac';
  cardVariant?: 'soft';
};

const WALLETS: readonly WalletState[] = [
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

const SHEET_BUTTONS: readonly { key: Exclude<OpenSheet, 'none'>; label: string }[] = [
  { key: 'activity', label: 'Activity Sheet' },
  { key: 'amount', label: 'Amount Sheet' },
  { key: 'actions', label: 'Actions Sheet' },
  { key: 'form', label: 'Form Sheet' },
];

const ACTIVITY_GROUPS: readonly {
  month: string;
  items: readonly {
    name: string;
    meta: string;
    amount: string;
    sats: string;
    icon: IconName;
  }[];
}[] = [
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

const METHODS: readonly {
  label: string;
  icon: IconName;
  accent?: 'orange' | 'lilac';
}[] = [
  { label: 'Bitcoin wallet', icon: 'wallet', accent: 'orange' },
  { label: 'Credit card', icon: 'card', accent: 'lilac' },
  { label: 'Convert to euro', icon: 'transfer-horizontal' },
];

type FormField = {
  id: string;
  label: string;
  placeholder: string;
  inputMode?: React.ComponentProps<typeof TextField>['inputMode'];
  initialValue?: string;
  action?: string;
};

const FORM_FIELDS: readonly FormField[] = [
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

const INITIAL_FORM_VALUES = FORM_FIELDS.reduce<Record<string, string>>((values, field) => {
  if (field.initialValue) values[field.id] = field.initialValue;
  return values;
}, {});

export const Sheet: React.FC<{ onToggleTheme: () => void }> = ({ onToggleTheme }) => {
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
        <WalletPage
          selectedWallet={selectedWallet}
          selectedTab={wallet}
          onSelectTab={setWallet}
          onOpenMenu={() => setPage('sheetMenu')}
          onToggleTheme={onToggleTheme}
        />
      ) : (
        <SheetMenuPage
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

function WalletPage({
  selectedWallet,
  selectedTab,
  onSelectTab,
  onOpenMenu,
  onToggleTheme,
}: {
  selectedWallet: WalletState;
  selectedTab: WalletTab;
  onSelectTab: (tab: WalletTab) => void;
  onOpenMenu: () => void;
  onToggleTheme: () => void;
}) {
  return (
    <>
      <Topbar>
        <TopbarLeading>
          <NuriIcon name="nuri" />
        </TopbarLeading>
        <TopbarTrailing>
          <IconButton icon="list-bullets" variant="soft" accessibilityLabel="Open sheet menu" onPress={onOpenMenu} />
          <IconButton icon="headphones" variant="soft" accessibilityLabel="Toggle theme" onPress={onToggleTheme} />
        </TopbarTrailing>
      </Topbar>

      <View direction="column" align="stretch" justify="start" gap="lg" paddingX="lg" paddingY="md" fill="grow">
        {selectedWallet.cardVariant ? (
          <View aspectRatio="card" radius="lg" variant={selectedWallet.cardVariant} />
        ) : (
          <View aspectRatio="card" radius="lg" />
        )}
        <Text size="3xl" emphasis align="center">{selectedWallet.balance}</Text>
        <View direction="row" align="center" gap="sm">
          <View fill="even">
            <Button size="lg" variant="soft">{selectedWallet.secondaryAction}</Button>
          </View>
          <View fill="even">
            <Button size="lg" variant="solid" accent={selectedWallet.primaryAccent}>{selectedWallet.primaryAction}</Button>
          </View>
        </View>
      </View>

      <TabBar>
        {WALLETS.map((item) => (
          <TabBarItem
            key={item.key}
            icon={item.icon}
            label={item.tabLabel}
            selected={item.key === selectedTab}
            onPress={() => onSelectTab(item.key)}
          />
        ))}
      </TabBar>
    </>
  );
}

function SheetMenuPage({
  onBack,
  onOpenSheet,
}: {
  onBack: () => void;
  onOpenSheet: (sheet: OpenSheet) => void;
}) {
  return (
    <>
      <Topbar>
        <IconButton icon="chevron-left" variant="soft" accessibilityLabel="Back to wallet" onPress={onBack} />
      </Topbar>

      <View direction="column" align="stretch" justify="center" gap="md" paddingX="lg" paddingY="lg" fill="grow">
        {SHEET_BUTTONS.map((item) => (
          <Button key={item.key} size="lg" onPress={() => onOpenSheet(item.key)}>
            {item.label}
          </Button>
        ))}
      </View>
    </>
  );
}

function ActivitySheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <BottomSheet open={open} detent="full" onOpenChange={(next) => !next && onClose()}>
      <BottomSheetPanel>
        <Topbar>
          <TopbarTrailing>
            <IconButton icon="download" variant="soft" accessibilityLabel="Download activity" />
            <IconButton icon="cross" variant="soft" accessibilityLabel="Close activity sheet" onPress={onClose} />
          </TopbarTrailing>
        </Topbar>

        <BottomSheetScroll>
          <View direction="column" align="stretch" justify="start" gap="xl" paddingBottom="xl">
            {ACTIVITY_GROUPS.map((group) => (
              <View key={group.month} direction="column" align="stretch" justify="start" gap="md">
                <View paddingX="lg">
                  <Text size="lg" emphasis>{group.month}</Text>
                </View>

                <List>
                  {group.items.map((item, index) => (
                    <React.Fragment key={`${group.month}-${item.name}-${index}`}>
                      {index > 0 ? <ListSeparator /> : null}
                      <ListAction accessibilityLabel={item.name}>
                        <ListActionLeadingAvatar name={item.icon} variant="outline" />
                        <ListActionText>{item.name}</ListActionText>
                        <ListActionTextMuted>{item.meta}</ListActionTextMuted>
                        <ListActionTrailingText>{item.amount}</ListActionTrailingText>
                        <ListActionTrailingTextMuted>{item.sats}</ListActionTrailingTextMuted>
                      </ListAction>
                    </React.Fragment>
                  ))}
                </List>
              </View>
            ))}
            <View height="2xl" />
          </View>
        </BottomSheetScroll>
      </BottomSheetPanel>
    </BottomSheet>
  );
}

function AmountSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const quickAmounts = ['€ 25', '€ 50', '€ 100', '€200'];
  const keypad = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
  ] as const;

  return (
    <BottomSheet open={open} detent="full" onOpenChange={(next) => !next && onClose()}>
      <BottomSheetPanel>
        <View direction="column" align="stretch" justify="start" fill="grow-shrink">
          <Topbar>
            <TopbarTrailing>
              <IconButton icon="cross" variant="soft" accessibilityLabel="Close amount sheet" onPress={onClose} />
            </TopbarTrailing>
          </Topbar>

          <View direction="column" align="stretch" justify="between" gap="lg" paddingX="lg" paddingBottom="lg" fill="grow-shrink">
            <View direction="column" align="stretch" justify="start" gap="sm">
              <Text size="lg" emphasis>How much do you want to send?</Text>
              <Text size="md" muted>€207 available in your cash account</Text>
            </View>

            <View direction="column" align="center" justify="center" gap="sm" fill="grow-shrink">
              <Text size="3xl" emphasis align="center">€ 25.87</Text>
              <Text size="md" align="center">₿ 5234</Text>
            </View>

            <View direction="column" align="stretch" justify="end" gap="md">
              <View direction="row" gap="sm">
                {quickAmounts.map((amount) => (
                  <View key={amount} fill="even">
                    <Button size="sm" variant="solid">{amount}</Button>
                  </View>
                ))}
              </View>

              <View direction="column" gap="sm">
                {keypad.map((row) => (
                  <View key={row.join('')} direction="row" gap="sm">
                    {row.map((value) => (
                      <View key={value} fill="even">
                        <Button size="lg">{value}</Button>
                      </View>
                    ))}
                  </View>
                ))}
                <View direction="row" gap="sm">
                  <View fill="even">
                    <Button size="lg">.</Button>
                  </View>
                  <View fill="even">
                    <Button size="lg">0</Button>
                  </View>
                  <View fill="even">
                    <Button size="lg" accessibilityLabel="Delete digit">
                      <ButtonIcon name="chevron-left" />
                    </Button>
                  </View>
                </View>
              </View>

              <Button size="lg" variant="solid" accent="lilac" onPress={onClose}>Next</Button>
            </View>
          </View>
        </View>
      </BottomSheetPanel>
    </BottomSheet>
  );
}

function ActionsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <BottomSheet open={open} detent="content" onOpenChange={(next) => !next && onClose()}>
      <BottomSheetPanel>
        <View direction="column" align="stretch" justify="start" gap="xl" paddingBottom="lg">
          <View direction="column" align="stretch" justify="start">
            <Topbar>
              <TopbarTrailing>
                <IconButton icon="cross" variant="soft" accessibilityLabel="Close actions sheet" onPress={onClose} />
              </TopbarTrailing>
            </Topbar>

            <View direction="column" align="stretch" justify="start" gap="sm" paddingX="lg">
              <Text size="lg" emphasis>Where do you want to send it?</Text>
              <Text size="md" muted>Choose a transfer method</Text>
            </View>
          </View>

          <List>
            {METHODS.map((method, index) => (
              <React.Fragment key={method.label}>
                {index > 0 ? <ListSeparator /> : null}
                <ListAction accessibilityLabel={method.label} onPress={onClose}>
                  {method.accent ? (
                    <ListActionLeadingAvatar name={method.icon} variant="solid" accent={method.accent} />
                  ) : (
                    <ListActionLeadingAvatar name={method.icon} variant="solid" />
                  )}
                  <ListActionText>{method.label}</ListActionText>
                  <ListActionTrailIcon name="chevron-right" />
                </ListAction>
              </React.Fragment>
            ))}
          </List>
        </View>
      </BottomSheetPanel>
    </BottomSheet>
  );
}

function FormSheet({
  open,
  values,
  onChangeField,
  onClose,
}: {
  open: boolean;
  values: Record<string, string>;
  onChangeField: (id: string) => (value: string) => void;
  onClose: () => void;
}) {
  return (
    <BottomSheet open={open} detent="full" onOpenChange={(next) => !next && onClose()}>
      <BottomSheetPanel>
        <View direction="column" align="stretch" justify="start" fill="grow">
          <Topbar>
            <TopbarTrailing>
              <IconButton icon="cross" variant="soft" accessibilityLabel="Close form sheet" onPress={onClose} />
            </TopbarTrailing>
          </Topbar>

          <View direction="column" align="stretch" justify="start" fill="grow-shrink">
            <BottomSheetScroll>
              <View direction="column" align="stretch" justify="start" gap="xl" paddingX="lg" paddingBottom="xl">
                <View direction="column" align="stretch" justify="start" gap="sm">
                  <Text size="lg" emphasis>Who is your recipient?</Text>
                  <Text size="md" muted>Enter their bank account details</Text>
                </View>

                <View direction="column" align="stretch" justify="start" gap="xl">
                  {FORM_FIELDS.map((field) => (
                    <TextField
                      key={field.id}
                      value={values[field.id] ?? ''}
                      onChangeText={onChangeField(field.id)}
                      placeholder={field.placeholder}
                      inputMode={field.inputMode}
                    >
                      <TextFieldLabel>{field.label}</TextFieldLabel>
                      {field.action ? (
                        <TextFieldButton accessibilityLabel={field.action}>{field.action}</TextFieldButton>
                      ) : null}
                    </TextField>
                  ))}
                </View>

                <Button size="lg" variant="solid" accent="lilac" onPress={onClose}>Save recipient</Button>
                <View height="xl" />
              </View>
            </BottomSheetScroll>
          </View>
        </View>
      </BottomSheetPanel>
    </BottomSheet>
  );
}
