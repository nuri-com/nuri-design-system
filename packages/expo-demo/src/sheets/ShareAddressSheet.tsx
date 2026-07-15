import * as React from 'react';

import {
  Alert,
  AlertIcon,
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
  useToast,
} from '@ds';

const ADDRESS_ROWS = [
  ['bc1q', 'cten', '7huq', 'q3h8', 'xg65', 'g7fe', 'wrdk', 'wmjj'],
  ['u3zy', '6a69', 'ujwv', 'cjf9', '7919', 'dxps', 'gsl6', 'r4'],
] as const;
export function ShareAddressSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast();
  const showCopied = React.useCallback(() => {
    toast.show(
      <Alert><AlertIcon name="check-circle" />Address copied</Alert>,
    );
  }, [toast]);
  const showSending = React.useCallback(() => {
    toast.show(
      <Alert><AlertIcon name="spinner" />Sending…</Alert>,
    );
  }, [toast]);

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
          <View direction="column" align="stretch" justify="start" gap="sm" paddingX="lg" fill="grow">
            <Text size="lg" emphasis>Bitcoin address</Text>

            <View direction="column" align="stretch" gap="sm">
              {ADDRESS_ROWS.map((row, rowIndex) => (
                <View key={rowIndex} direction="row" gap="sm" distribute="even">
                  {row.map((chunk, chunkIndex) => <Text key={`${rowIndex}-${chunkIndex}`} size="sm" mono muted>{chunk}</Text>)}
                </View>
              ))}
            </View>

            <View direction="column" align="stretch" justify="center" fill="grow">
              <View variant="outline" radius="lg" padding="xl">
                <NuriScope mode="dark">
                  <View chrome="canvas" aspectRatio="square" align="center" justify="center">
                    <Text size="md" muted align="center">Qr Code</Text>
                  </View>
                </NuriScope>
              </View>
            </View>
          </View>
        </Scroll>

        <Footer safeAreaBottom direction="column" align="stretch" paddingBottom="lg" paddingX="lg">
          <View direction="row" gap="sm" distribute="even">
            <Button size="lg" variant="soft" onPress={showCopied}>Copy</Button>
            <Button size="lg" variant="soft" onPress={showSending}>Share</Button>
          </View>
        </Footer>
      </BottomSheetPanel>
    </BottomSheet>
  );
}
