import * as React from 'react';
import { StyleSheet, View as RNView } from 'react-native';

import {
  Button,
  ButtonIcon,
  IconButton,
  NuriScope,
  Screen,
  Scroll,
  SelectTrigger,
  SelectTriggerAvatar,
  SelectTriggerChevron,
  SelectTriggerLabel,
  SelectTriggerValue,
  Text,
  View,
} from '@ds';

const noop = () => undefined;

const REGULAR = {
  from: 'Bitcoin',
  fromBalance: '₿ 86,969',
  to: 'Euro',
  amount: '€ 48.18',
} as const;

// Adversarial copy is deliberately realistic rather than synthetic: long ISO
// currency names and the largest formatted amount the demo accepts. The
// composition moves balances off the trigger row and constrains the display;
// the SelectTrigger value itself owns one-line truncation.
const ADVERSARIAL = {
  from: 'United Arab Emirates dirham',
  fromBalance: 'د.إ 999,999,999,999.99',
  to: 'São Tomé and Príncipe dobra',
  amount: 'Db 999,999,999,999.99',
} as const;

function Keypad() {
  const rows = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
  ] as const;

  return (
    <View direction="column" gap="sm">
      {rows.map((row) => (
        <View key={row.join('')} direction="row" gap="sm" distribute="even">
          {row.map((digit) => <Button key={digit} onPress={noop}>{digit}</Button>)}
        </View>
      ))}
      <View direction="row" gap="sm" distribute="even">
        <Button onPress={noop}>.</Button>
        <Button onPress={noop}>0</Button>
        <Button accessibilityLabel="Delete digit" onPress={noop}>
          <ButtonIcon name="chevron-left" />
        </Button>
      </View>
    </View>
  );
}

export function Move({ onClose }: { onClose: () => void }) {
  const [stress, setStress] = React.useState(false);
  const story = stress ? ADVERSARIAL : REGULAR;

  return (
    <Screen safeArea>
      <Scroll>
        <View direction="column" align="stretch" gap="xl" paddingX="lg" paddingY="lg" fill="grow">
          <View direction="row" justify="between" align="center" gap="md">
            <Text size="lg" emphasis>Move</Text>
            <Button size="sm" variant="soft" onPress={() => setStress((value) => !value)}>
              {stress ? 'Regular values' : 'Stress values'}
            </Button>
          </View>

          <NuriScope mode="dark">
            <RNView style={styles.cards}>
              <View
                chrome="subtle"
                radius="lg"
                paddingX="lg"
                paddingTop="lg"
                paddingBottom="xl"
              >
                <RNView style={styles.triggerConstraint}>
                  <SelectTrigger
                    accessibilityLabel="From"
                    accessibilityValue={story.from}
                    onPress={noop}
                  >
                    <SelectTriggerLabel>From</SelectTriggerLabel>
                    <SelectTriggerAvatar name={stress ? 'bank' : 'bitcoin'} variant="solid" accent="orange" />
                    <SelectTriggerValue>{story.from}</SelectTriggerValue>
                    <SelectTriggerChevron name="caret-down" />
                  </SelectTrigger>
                </RNView>
                <Text size="md" emphasis align="end" flow="truncate" lines={1}>
                  {story.fromBalance}
                </Text>
              </View>

              {/* Consumer-local seam overlay. Its immediate parent is exactly
                  48×48-high and contains the complete disc. Negative margins
                  move that bounded parent onto the seam; neither iOS nor
                  Android has to hit-test an overflowing child. */}
              <RNView pointerEvents="box-none" style={styles.seamParent}>
                <IconButton
                  variant="solid"
                  icon="transfer-vertical"
                  accessibilityLabel={`Swap ${story.from} and ${story.to}`}
                  onPress={noop}
                />
              </RNView>

              <View
                chrome="subtle"
                radius="lg"
                paddingX="lg"
                paddingTop="xl"
                paddingBottom="lg"
                fill="grow"
              >
                <View height="xs" />
                <RNView style={styles.triggerConstraint}>
                  <SelectTrigger
                    variant="ghost"
                    accessibilityLabel="To"
                    accessibilityValue={story.to}
                    onPress={noop}
                  >
                    <SelectTriggerLabel>To</SelectTriggerLabel>
                    <SelectTriggerAvatar name={stress ? 'bank' : 'euro'} variant="outline" />
                    <SelectTriggerValue>{story.to}</SelectTriggerValue>
                    <SelectTriggerChevron name="caret-down" />
                  </SelectTrigger>
                </RNView>

                <View fill="grow" justify="end" align="end">
                  <Text size="3xl" align="end" flow="truncate" lines={1}>
                    {story.amount}
                  </Text>
                </View>
              </View>
            </RNView>
          </NuriScope>

          <Keypad />

          <View direction="row" gap="sm" distribute="even">
            <Button size="lg" variant="soft" onPress={onClose}>Cancel</Button>
            <Button size="lg" variant="solid" accent="lilac" onPress={noop}>Next</Button>
          </View>
        </View>
      </Scroll>
    </Screen>
  );
}

const SWAP_DISC = 48;
const CARD_GAP = 4;

const styles = StyleSheet.create({
  cards: {
    flexGrow: 1,
  },
  triggerConstraint: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  seamParent: {
    alignItems: 'center',
    height: SWAP_DISC,
    justifyContent: 'center',
    marginBottom: -(SWAP_DISC / 2 - CARD_GAP),
    marginTop: -(SWAP_DISC / 2),
    zIndex: 1,
  },
});
