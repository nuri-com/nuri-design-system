import * as React from 'react';

import {
  BottomSheet,
  BottomSheetPanel,
  Button,
  ButtonIcon,
  IconButton,
  Text,
  Topbar,
  TopbarTrailing,
  View,
} from '../../components/ui';

const QUICK_AMOUNTS = ['€ 25', '€ 50', '€ 100', '€200'] as const;
const KEYPAD = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
] as const;

export function AmountSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
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
                {QUICK_AMOUNTS.map((amount) => (
                  <View key={amount} fill="even">
                    <Button size="sm" variant="solid">{amount}</Button>
                  </View>
                ))}
              </View>

              <View direction="column" gap="sm">
                {KEYPAD.map((row) => (
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
