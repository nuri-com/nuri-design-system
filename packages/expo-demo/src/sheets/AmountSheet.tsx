import * as React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  BottomSheet,
  BottomSheetFooter,
  BottomSheetPanel,
  BottomSheetScroll,
  BottomSheetTopbar,
  Button,
  ButtonIcon,
  IconButton,
  Text,
  TopbarTrailing,
  View,
} from '@ds';

export function AmountSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <BottomSheet open={open} detent="full" onOpenChange={(next) => !next && onClose()}>
      <BottomSheetPanel>
        <BottomSheetTopbar>
          <TopbarTrailing>
            <IconButton icon="cross" variant="soft" accessibilityLabel="Close amount sheet" onPress={onClose} />
          </TopbarTrailing>
        </BottomSheetTopbar>

        <BottomSheetScroll>
          <View direction="column" align="stretch" justify="between" gap="xl" paddingX="lg" fill="grow">
            <View direction="column" align="stretch" justify="start" gap="sm">
              <Text size="lg" emphasis>How much do you want to send?</Text>
              <Text size="md" muted>€207 available in your cash account</Text>
            </View>

            <View direction="column" align="center" justify="center" gap="sm" fill="grow">
              <Text size="3xl" emphasis align="center">€ 25.87</Text>
              <Text size="md" align="center">₿ 5234</Text>
            </View>

            <View direction="column" align="stretch" justify="end" gap="md">
              <View direction="row" gap="sm">
                <View fill="even">
                  <Button size="sm" variant="solid">€ 25</Button>
                </View>
                <View fill="even">
                  <Button size="sm" variant="solid">€ 50</Button>
                </View>
                <View fill="even">
                  <Button size="sm" variant="solid">€ 100</Button>
                </View>
                <View fill="even">
                  <Button size="sm" variant="solid">€200</Button>
                </View>
              </View>

              <View direction="column" gap="sm">
                <View direction="row" gap="sm">
                  <View fill="even">
                    <Button size="lg">1</Button>
                  </View>
                  <View fill="even">
                    <Button size="lg">2</Button>
                  </View>
                  <View fill="even">
                    <Button size="lg">3</Button>
                  </View>
                </View>
                <View direction="row" gap="sm">
                  <View fill="even">
                    <Button size="lg">4</Button>
                  </View>
                  <View fill="even">
                    <Button size="lg">5</Button>
                  </View>
                  <View fill="even">
                    <Button size="lg">6</Button>
                  </View>
                </View>
                <View direction="row" gap="sm">
                  <View fill="even">
                    <Button size="lg">7</Button>
                  </View>
                  <View fill="even">
                    <Button size="lg">8</Button>
                  </View>
                  <View fill="even">
                    <Button size="lg">9</Button>
                  </View>
                </View>
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
            </View>
          </View>
        </BottomSheetScroll>

        <BottomSheetFooter>
          <View direction="column" align="stretch" paddingY="sm" paddingX="lg">
            <SafeAreaView edges={['bottom']} style={styles.footerSafeArea}>
              <View direction="column" align="stretch">
                <Button size="lg" variant="solid" accent="lilac" onPress={onClose}>Next</Button>
              </View>
            </SafeAreaView>
          </View>
        </BottomSheetFooter>
      </BottomSheetPanel>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  footerSafeArea: {
    width: '100%',
  },
});
