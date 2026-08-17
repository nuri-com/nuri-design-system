import * as React from 'react';
import type { ImageSourcePropType } from 'react-native';

import {
  Header,
  IconButton,
  List,
  ListAction,
  ListActionLeadingAvatar,
  ListActionText,
  ListActionTextMuted,
  ListActionTrailIcon,
  Modal,
  ModalPanel,
  Scroll,
  Separator,
  Text,
  Topbar,
  TopbarContent,
  TopbarTitle,
  TopbarTrailing,
  View,
} from '@ds';
import type { IconName } from '@ds';

type Account = {
  key: string;
  name: string;
  balance?: string;
  avatar:
    | { name: IconName; variant: 'solid' | 'outline'; accent?: 'orange' | 'lilac' }
    | { source: ImageSourcePropType };
};

type Provider = { label: string; accounts: Account[] };

// Mirrors the unified-balance large-title board: provider bands as labelled
// dividers, balances inline-muted, mixed row types (balances · card · IBAN).
const PROVIDERS: Provider[] = [
  {
    label: 'Nuri wallet',
    accounts: [
      {
        key: 'BTC',
        name: 'Bitcoin',
        balance: '86969 ₿',
        avatar: { source: require('../../assets/logos/bitcoin.png') },
      },
      {
        key: 'EUR',
        name: 'Euro',
        balance: '100.00 €',
        avatar: { source: require('../../assets/flags/eur.png') },
      },
      {
        key: 'USD',
        name: 'Dollar',
        balance: '74.60 $',
        avatar: { source: require('../../assets/flags/usa.png') },
      },
    ],
  },
  {
    label: 'Arkade wallet',
    accounts: [
      {
        key: 'LN',
        name: 'Bitcoin Lightning',
        balance: '0 ₿',
        avatar: { source: require('../../assets/logos/lightning.png') },
      },
    ],
  },
  {
    label: 'Wirex wallet',
    accounts: [
      {
        key: 'VISA',
        name: 'Visa credit card',
        balance: '34.45 €',
        avatar: { name: 'card', variant: 'outline' },
      },
      {
        key: 'IBAN',
        name: 'IBAN account',
        avatar: { name: 'bank', variant: 'outline' },
      },
    ],
  },
];

function ProviderBand({ label }: { label: string }) {
  return (
    <View direction="row" align="center" gap="sm" height="md" paddingX="md">
      <View fill="grow"><Separator ySpace="none" /></View>
      <Text size="sm" emphasis muted>{label}</Text>
      <View fill="grow"><Separator ySpace="none" /></View>
    </View>
  );
}

export function CurrencyPickerSheet({
  open,
  title,
  selectedKey,
  onClose,
}: {
  open: boolean;
  title: string;
  selectedKey: string;
  onClose: () => void;
}) {
  return (
    <Modal open={open} mode="sheet" onOpenChange={(next) => !next && onClose()}>
      <ModalPanel>
        <Header chrome="transparent">
          <Topbar surface="transparent" layout="fluid">
            <TopbarContent>
              <TopbarTitle>{title}</TopbarTitle>
            </TopbarContent>
            <TopbarTrailing>
              <IconButton
                icon="cross"
                variant="soft"
                accessibilityLabel="Close"
                onPress={onClose}
              />
            </TopbarTrailing>
          </Topbar>
        </Header>

        <Scroll safeAreaBottom>
          <View direction="column" align="stretch" gap="sm" paddingBottom="lg">
            <List>
              {PROVIDERS.map((provider) => (
                <React.Fragment key={provider.label}>
                  <ProviderBand label={provider.label} />
                  {provider.accounts.map((account) => (
                    <ListAction
                      key={account.key}
                      accessibilityLabel={[
                        account.name,
                        account.balance,
                        account.key === selectedKey ? 'selected' : undefined,
                      ].filter(Boolean).join(', ')}
                      onPress={onClose}
                    >
                      <ListActionLeadingAvatar {...account.avatar} />
                      <ListActionText>{account.name}</ListActionText>
                      {account.balance ? (
                        <ListActionTextMuted>{account.balance}</ListActionTextMuted>
                      ) : null}
                      {account.key === selectedKey ? (
                        <ListActionTrailIcon name="check-circle" />
                      ) : null}
                    </ListAction>
                  ))}
                </React.Fragment>
              ))}
            </List>
          </View>
        </Scroll>
      </ModalPanel>
    </Modal>
  );
}
