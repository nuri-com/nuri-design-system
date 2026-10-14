import * as React from 'react';

import {
  Button,
  Dock,
  Header,
  IconButton,
  Image,
  List,
  ListAction,
  ListActionText,
  ListActionTextMuted,
  ListActionTrailIcon,
  ListSwitch,
  ListSwitchText,
  Screen,
  Scroll,
  Separator,
  Text,
  Topbar,
  TopbarTrailing,
  View,
} from '@ds';

/* ──────────────────────────────────────────────────────────────
 * PROFILE · the "Bank and Cards" activation CTA (playground pages/profile.html,
 * second board, as spec · operator mock 2026-10-14).
 *
 * The RN twin of the media card — the consumer proof for the media-card
 * vocabulary (Image · box.clip · the portrait/banner ratio leaves): a `strong`
 * chrome `lg`-radius row that CLIPS its children at its own corners and whose
 * HEIGHT follows its 2:1 ratio (never the copy length); a growing text column;
 * a cover-cropped photo whose WIDTH follows its own 2:3 ratio × the card height
 * (Yoga computes it from the stretched cross axis). The photo has NO radius of
 * its own — the card crops it. Pure DS composition, 1:1 with the web board.
 * ────────────────────────────────────────────────────────────── */

// The photo: a 240×320 (3:4) asset cover-cropped into the 2:3 column.
const BANK_AND_CARDS = require('../../assets/photos/bank-and-cards.png');

function Section({ title }: { title: string }) {
  return (
    <View paddingX="lg" paddingTop="xl">
      <Text size="lg" emphasis>{title}</Text>
    </View>
  );
}

function Hairline() {
  return (
    <View paddingX="lg">
      <Separator ySpace="none" />
    </View>
  );
}

export function Profile({ onClose }: { onClose: () => void }) {
  // The DS is dumb: the screen owns the toggle values and flips them in onPress.
  const [bitcoinPayments, setBitcoinPayments] = React.useState(true);
  const [cardsAndBank, setCardsAndBank] = React.useState(false);

  return (
    <Screen>
      <Dock edge="top">
        <Header safeAreaTop chrome="transparent" safeAreaChrome="canvas">
          <Topbar surface="transparent">
            <TopbarTrailing>
              <IconButton icon="cross" variant="soft" accessibilityLabel="Close" onPress={onClose} />
            </TopbarTrailing>
          </Topbar>
        </Header>
      </Dock>

      <Scroll safeAreaBottom insetTop="dock">
        <View direction="column" align="stretch" justify="start" gap="md" paddingBottom="xl" fill="grow">
          <View paddingX="lg" paddingTop="md">
            <Text size="lg" emphasis>@Dario</Text>
          </View>

          <List>
            <ListAction accessibilityLabel="Payment link">
              <ListActionText>Payment link</ListActionText>
              <ListActionTrailIcon name="chevron-right" />
            </ListAction>
            <ListAction accessibilityLabel="Address book">
              <ListActionText>Address book</ListActionText>
              <ListActionTrailIcon name="chevron-right" />
            </ListAction>
            <ListAction accessibilityLabel="Support">
              <ListActionText>Support</ListActionText>
              <ListActionTrailIcon name="chevron-right" />
            </ListAction>
          </List>

          {/* the activation card (takes the separator's place) — the media card */}
          <View paddingX="lg" paddingTop="md">
            <View direction="row" align="stretch" chrome="strong" radius="lg" clip aspectRatio="banner">
              <View direction="column" align="start" justify="between" padding="lg" fill="grow-shrink">
                <View direction="column" align="start" gap="xs">
                  <Text size="md" emphasis>Bank and Cards</Text>
                  <Text size="sm" muted>Verify your account and get an IBAN and a Visa card.</Text>
                </View>
                <Button variant="solid" size="sm">Activate</Button>
              </View>
              <Image source={BANK_AND_CARDS} fit="cover" aspectRatio="portrait" />
            </View>
          </View>

          <Section title="Notifications" />
          <List>
            <ListSwitch checked={bitcoinPayments} accent="lilac" onPress={() => setBitcoinPayments((v) => !v)}>
              <ListSwitchText>Bitcoin payments</ListSwitchText>
            </ListSwitch>
            <ListSwitch checked={cardsAndBank} accent="lilac" onPress={() => setCardsAndBank((v) => !v)}>
              <ListSwitchText>Cards and bank</ListSwitchText>
            </ListSwitch>
          </List>

          <Hairline />
          <Section title="Settings" />
          <List>
            <ListAction accessibilityLabel="Language, English">
              <ListActionText>Language</ListActionText>
              <ListActionTextMuted>English</ListActionTextMuted>
              <ListActionTrailIcon name="chevron-right" />
            </ListAction>
            <ListAction accessibilityLabel="Currency, Euro">
              <ListActionText>Currency</ListActionText>
              <ListActionTextMuted>Euro</ListActionTextMuted>
              <ListActionTrailIcon name="chevron-right" />
            </ListAction>
            <ListAction accessibilityLabel="Crypto wallet, connect one to add funds">
              <ListActionText>Crypto wallet</ListActionText>
              <ListActionTextMuted>Connect one to add funds</ListActionTextMuted>
              <ListActionTrailIcon name="chevron-right" />
            </ListAction>
          </List>

          <Hairline />
          <Section title="Shop" />
          <List>
            <ListAction accessibilityLabel="eSIM">
              <ListActionText>eSIM</ListActionText>
              <ListActionTrailIcon name="chevron-right" />
            </ListAction>
          </List>

          <Hairline />
          <Section title="Account" />
          <List>
            <ListAction accessibilityLabel="Log out">
              <ListActionText>Log out</ListActionText>
              <ListActionTrailIcon name="chevron-right" />
            </ListAction>
          </List>

          <Hairline />
          <View paddingX="lg">
            <Text size="sm" muted>Version 0.104.0</Text>
          </View>
        </View>
      </Scroll>
    </Screen>
  );
}
