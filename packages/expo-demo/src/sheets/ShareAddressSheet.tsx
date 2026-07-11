import * as React from 'react';

import {
  BottomSheet,
  BottomSheetPanel,
  Button,
  Footer,
  Header,
  IconButton,
  NuriScope,
  Scroll,
  Text,
  Topbar,
  TopbarTrailing,
  View,
} from '@ds';

const ADDRESS_ROWS = [
  ['bc1q', 'w508', 'd6qe', 'jxqt', 'dg4y', '5r3z', 'arva', 'ry0c'],
  ['5xw7', 'kygt', '0800', '0000', '0000', '0000', '0000', '0000'],
] as const;
const noop = () => undefined;

export function ShareAddressSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <BottomSheet open={open} detent="full" onOpenChange={(next) => !next && onClose()}>
      <BottomSheetPanel>
        <Header paddingTop="lg">
          <Topbar surface="transparent">
            <TopbarTrailing>
              <IconButton icon="cross" variant="soft" accessibilityLabel="Close share address sheet" onPress={onClose} />
            </TopbarTrailing>
          </Topbar>
        </Header>

        <Scroll>
          <View direction="column" align="stretch" justify="start" gap="xl" paddingX="lg">
            <Text size="xl" emphasis>Share your Bitcoin address</Text>

            <View direction="column" align="stretch" gap="sm">
              {ADDRESS_ROWS.map((row, rowIndex) => (
                <View key={rowIndex} direction="row" distribute="even">
                  {row.map((chunk) => <Text key={chunk} size="sm" mono align="center">{chunk}</Text>)}
                </View>
              ))}
            </View>

            <View variant="outline" radius="lg" padding="md">
              <NuriScope mode="dark">
                <View chrome="canvas" radius="md" aspectRatio="square" align="center" justify="center">
                  <Text size="md" muted align="center">Qr Code</Text>
                </View>
              </NuriScope>
            </View>
          </View>
        </Scroll>

        <Footer safeAreaBottom direction="column" align="stretch" paddingY="sm" paddingX="lg">
          <View direction="row" gap="sm" distribute="even">
            <Button size="lg" variant="soft" onPress={noop}>Copy</Button>
            <Button size="lg" variant="soft" onPress={noop}>Share</Button>
          </View>
        </Footer>
      </BottomSheetPanel>
    </BottomSheet>
  );
}
