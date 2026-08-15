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
import { CurrencyPickerSheet } from '../sheets/CurrencyPickerSheet';

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

export function Move({ stress = false, onClose }: { stress?: boolean; onClose: () => void }) {
  const story = stress ? ADVERSARIAL : REGULAR;
  const [picker, setPicker] = React.useState<'from' | 'to' | null>(null);

  return (
    <>
      <Screen safeArea>
        <Scroll>
          <View direction="column" align="stretch" gap="xl" paddingX="lg" paddingY="lg" fill="grow">
          <NuriScope mode="dark">
            <View fill="grow">
              {stress ? (
                <View
                  chrome="subtle"
                  radius="lg"
                  paddingX="lg"
                  paddingTop="lg"
                  paddingBottom="xl"
                >
                  <SelectTrigger
                    accessibilityLabel="From"
                    accessibilityValue={story.from}
                    onPress={() => setPicker('from')}
                  >
                    <SelectTriggerLabel>From</SelectTriggerLabel>
                    <SelectTriggerAvatar name="bank" variant="solid" accent="orange" />
                    <SelectTriggerValue>{story.from}</SelectTriggerValue>
                    <SelectTriggerChevron name="caret-down" />
                  </SelectTrigger>
                  <Text size="md" emphasis align="end" flow="truncate" lines={1}>
                    {story.fromBalance}
                  </Text>
                </View>
              ) : (
                <View chrome="subtle" radius="lg" paddingX="lg" paddingY="sm">
                  <View direction="row" justify="between" align="center">
                    <SelectTrigger
                      accessibilityLabel="From"
                      accessibilityValue={story.from}
                      onPress={() => setPicker('from')}
                    >
                      <SelectTriggerLabel>From</SelectTriggerLabel>
                      <SelectTriggerAvatar name="bitcoin" variant="solid" accent="orange" />
                      <SelectTriggerValue>{story.from}</SelectTriggerValue>
                      <SelectTriggerChevron name="caret-down" />
                    </SelectTrigger>
                    <Text size="md" emphasis>{story.fromBalance}</Text>
                  </View>
                </View>
              )}

              {/* Consumer-local seam overlay (the operator-approved design):
                  the immediate parent is exactly 48px tall and contains the
                  complete disc, so native parent-bounds hit-testing sees the
                  whole target; negative margins ride it onto the 4px seam. */}
              <RNView pointerEvents="box-none" style={styles.seamParent}>
                <IconButton
                  variant="solid"
                  icon="transfer-vertical"
                  accessibilityLabel={`Swap ${story.from} and ${story.to}`}
                  onPress={noop}
                />
              </RNView>

              {stress ? (
                <View
                  chrome="subtle"
                  radius="lg"
                  paddingX="lg"
                  paddingTop="xl"
                  paddingBottom="lg"
                  fill="grow"
                >
                  <View height="xs" />
                  <SelectTrigger
                    accessibilityLabel="To"
                    accessibilityValue={story.to}
                    onPress={() => setPicker('to')}
                  >
                    <SelectTriggerLabel>To</SelectTriggerLabel>
                    <SelectTriggerAvatar name="bank" variant="outline" />
                    <SelectTriggerValue>{story.to}</SelectTriggerValue>
                    <SelectTriggerChevron name="caret-down" />
                  </SelectTrigger>

                  <View fill="grow" justify="end" align="end">
                    <Text size="3xl" align="end" flow="truncate" lines={1}>
                      {story.amount}
                    </Text>
                  </View>
                </View>
              ) : (
                <View
                  chrome="subtle"
                  radius="lg"
                  paddingX="lg"
                  paddingTop="sm"
                  paddingBottom="lg"
                  fill="grow"
                >
                  <SelectTrigger
                    accessibilityLabel="To"
                    accessibilityValue={story.to}
                    onPress={() => setPicker('to')}
                  >
                    <SelectTriggerLabel>To</SelectTriggerLabel>
                    <SelectTriggerAvatar source={require('../../assets/flags/eur.png')} />
                    <SelectTriggerValue>{story.to}</SelectTriggerValue>
                    <SelectTriggerChevron name="caret-down" />
                  </SelectTrigger>

                  <View fill="grow" justify="end" align="end">
                    <Text size="3xl" align="end" flow="truncate" lines={1}>
                      {story.amount}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </NuriScope>

          <Keypad />

          <View direction="row" gap="sm" distribute="even">
            <Button size="lg" variant="soft" onPress={onClose}>Cancel</Button>
            <Button size="lg" variant="solid" accent="lilac" onPress={noop}>Next</Button>
          </View>
          </View>
        </Scroll>
      </Screen>
      <CurrencyPickerSheet
        open={picker !== null}
        title={picker === 'from' ? 'From currency' : 'To currency'}
        onClose={() => setPicker(null)}
      />
    </>
  );
}

const SWAP_DISC = 48;
const CARD_GAP = 4;

const styles = StyleSheet.create({
  seamParent: {
    alignItems: 'center',
    height: SWAP_DISC,
    justifyContent: 'center',
    marginBottom: -(SWAP_DISC / 2 - CARD_GAP),
    marginTop: -(SWAP_DISC / 2),
    zIndex: 1,
  },
});
