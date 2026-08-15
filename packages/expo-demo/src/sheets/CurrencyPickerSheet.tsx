import * as React from 'react';
import type { ImageSourcePropType } from 'react-native';

import {
  Footer,
  Header,
  IconButton,
  List,
  ListAction,
  ListActionLeadingAvatar,
  ListActionText,
  ListActionTrailingText,
  Modal,
  ModalPanel,
  Scroll,
  Topbar,
  TopbarContent,
  TopbarLeading,
  TopbarTitle,
  View,
} from '@ds';
import type { IconName } from '@ds';

type Currency = {
  code: string;
  name: string;
  balance: string;
  avatar: { name: IconName; variant: 'solid'; accent: 'orange' } | { source: ImageSourcePropType };
};

const CURRENCIES: Currency[] = [
  {
    code: 'BTC',
    name: 'Bitcoin',
    balance: '₿ 0.00055427',
    avatar: { name: 'bitcoin', variant: 'solid', accent: 'orange' },
  },
  {
    code: 'EUR',
    name: 'Euro',
    balance: '€ 48.18',
    avatar: { source: require('../../assets/flags/eur.png') },
  },
  {
    code: 'PLN',
    name: 'Polish zloty',
    balance: 'zł 108.42',
    avatar: { source: require('../../assets/flags/pol.png') },
  },
  {
    code: 'UAH',
    name: 'Ukrainian hryvnia',
    balance: '₴ 3,840.00',
    avatar: { source: require('../../assets/flags/ukr.png') },
  },
];

export function CurrencyPickerSheet({
  open,
  title,
  onClose,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
}) {
  return (
    <Modal open={open} mode="full" onOpenChange={(next) => !next && onClose()}>
      <ModalPanel>
        <Header safeAreaTop chrome="transparent" safeAreaChrome="canvas">
          <Topbar surface="transparent" layout="fluid">
            <TopbarLeading>
              <IconButton
                icon="chevron-left"
                variant="soft"
                accessibilityLabel="Back to Move"
                onPress={onClose}
              />
            </TopbarLeading>
            <TopbarContent>
              <TopbarTitle>{title}</TopbarTitle>
            </TopbarContent>
          </Topbar>
        </Header>

        <Scroll>
          <View paddingTop="sm">
            <List>
              {CURRENCIES.map((currency) => (
                <ListAction
                  key={currency.code}
                  accessibilityLabel={`${currency.name}, balance ${currency.balance}`}
                  onPress={onClose}
                >
                  <ListActionLeadingAvatar {...currency.avatar} />
                  <ListActionText>{currency.name}</ListActionText>
                  <ListActionTrailingText>{currency.balance}</ListActionTrailingText>
                </ListAction>
              ))}
            </List>
          </View>
        </Scroll>

        <Footer safeAreaBottom chrome="strong" paddingY="sm" />
      </ModalPanel>
    </Modal>
  );
}
