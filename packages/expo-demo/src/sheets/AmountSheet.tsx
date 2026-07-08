import * as React from 'react';

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

export function AmountSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <BottomSheet open={open} detent="full" safeAreaBottom onOpenChange={(next) => !next && onClose()}>
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
              <View direction="row" gap="sm" distribute="even">
                <Button size="sm" variant="solid">€ 25</Button>
                <Button size="sm" variant="solid">€ 50</Button>
                <Button size="sm" variant="solid">€ 100</Button>
                <Button size="sm" variant="solid">€200</Button>
              </View>

              <View direction="column" gap="sm">
                <View direction="row" gap="sm" distribute="even">
                  <Button size="lg">1</Button>
                  <Button size="lg">2</Button>
                  <Button size="lg">3</Button>
                </View>
                <View direction="row" gap="sm" distribute="even">
                  <Button size="lg">4</Button>
                  <Button size="lg">5</Button>
                  <Button size="lg">6</Button>
                </View>
                <View direction="row" gap="sm" distribute="even">
                  <Button size="lg">7</Button>
                  <Button size="lg">8</Button>
                  <Button size="lg">9</Button>
                </View>
                <View direction="row" gap="sm" distribute="even">
                  <Button size="lg">.</Button>
                  <Button size="lg">0</Button>
                  <Button size="lg" accessibilityLabel="Delete digit">
                    <ButtonIcon name="chevron-left" />
                  </Button>
                </View>
              </View>
            </View>
          </View>
        </BottomSheetScroll>

        <BottomSheetFooter direction="column" align="stretch" paddingY="sm" paddingX="lg">
          <Button size="lg" variant="solid" accent="lilac" onPress={onClose}>Next</Button>
        </BottomSheetFooter>
      </BottomSheetPanel>
    </BottomSheet>
  );
}
