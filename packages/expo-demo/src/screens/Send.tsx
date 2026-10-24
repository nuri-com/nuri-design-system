import * as React from 'react';

import {
  Dock,
  Header,
  IconButton,
  List,
  ListAction,
  ListActionLeadingAvatar,
  ListActionText,
  ListActionTextMuted,
  ListActionTrailIcon,
  Screen,
  Scroll,
  Text,
  TextField,
  Topbar,
  TopbarTrailing,
  View,
} from '@ds';
import type { IconName } from '@ds';

/* ──────────────────────────────────────────────────────────────
 * SEND · recipient (playground pages/send.html, board "send · recipient", as spec).
 *
 * The RN twin of the person rows the IconAvatar `initials` + `accessory` contract
 * admits (nuri-com/nuri-design-system#231): people carry their initials on the soft
 * circle and the payment rail on the corner disc — Nuri users on the `inverse` disc,
 * every other rail on the `canvas` disc. The initials stay soft although the row
 * forwards its outline default (the mode lock). The accessory is decorative, so each
 * row NAMES its rail in its accessibilityLabel ("Emil Berg, Nuri user, @emil"); a
 * handle is not a name. Actions keep the outline glyph avatar. Pure DS composition,
 * 1:1 with the web board.
 * ────────────────────────────────────────────────────────────── */

const noop = () => undefined;

type Person = {
  name: string;
  initials: string;
  handle: string;
  label: string;
  accessory: IconName;
  accessorySurface?: 'canvas' | 'inverse';
};

const PEOPLE: Person[] = [
  { name: 'Emil Berg', initials: 'EB', handle: '@emil', label: 'Emil Berg, Nuri user, @emil', accessory: 'nuri', accessorySurface: 'inverse' },
  { name: 'Claude M.', initials: 'CM', handle: 'N26 ···4521', label: 'Claude M., N26 account ending 4521', accessory: 'bank' },
  { name: 'Sara Conti', initials: 'SC', handle: '@sarac', label: 'Sara Conti, Nuri user, @sarac', accessory: 'nuri', accessorySurface: 'inverse' },
  { name: 'Anna K.', initials: 'AK', handle: 'bc1q…9m7t', label: 'Anna K., Bitcoin address bc1q…9m7t', accessory: 'bitcoin' },
];

export function Send({ onClose }: { onClose: () => void }) {
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
          <View paddingX="lg" paddingTop="md" paddingBottom="sm">
            <Text size="lg" emphasis>Send</Text>
          </View>
          <View paddingX="lg">
            <TextField placeholder="Search" accessibilityLabel="Search contacts and Nuri users" />
          </View>
          <List>
            <ListAction accessibilityLabel="Scan or paste" onPress={noop}>
              <ListActionLeadingAvatar name="qr-scan" variant="outline" />
              <ListActionText>Scan or paste</ListActionText>
              <ListActionTextMuted>From a QR code or copied text</ListActionTextMuted>
              <ListActionTrailIcon name="chevron-right" />
            </ListAction>
            {PEOPLE.map((person) => (
              <ListAction key={person.label} accessibilityLabel={person.label} onPress={noop}>
                <ListActionLeadingAvatar
                  initials={person.initials}
                  accessory={person.accessory}
                  accessorySurface={person.accessorySurface}
                />
                <ListActionText>{person.name}</ListActionText>
                <ListActionTextMuted>{person.handle}</ListActionTextMuted>
                <ListActionTrailIcon name="chevron-right" />
              </ListAction>
            ))}
            <ListAction accessibilityLabel="All contacts" onPress={noop}>
              <ListActionLeadingAvatar name="list-bullets" variant="outline" />
              <ListActionText>All contacts</ListActionText>
              <ListActionTextMuted>15 saved</ListActionTextMuted>
              <ListActionTrailIcon name="chevron-right" />
            </ListAction>
            <ListAction accessibilityLabel="New recipient" onPress={noop}>
              <ListActionLeadingAvatar name="plus" variant="outline" />
              <ListActionText>New recipient</ListActionText>
              <ListActionTextMuted>Bitcoin address, IBAN and more</ListActionTextMuted>
              <ListActionTrailIcon name="chevron-right" />
            </ListAction>
          </List>
        </View>
      </Scroll>
    </Screen>
  );
}
