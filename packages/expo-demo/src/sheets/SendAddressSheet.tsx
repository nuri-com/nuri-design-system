import * as React from 'react';

import {
  Modal,
  ModalPanel,
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

const noop = () => undefined;

export function SendAddressSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} mode="full" onOpenChange={(next) => !next && onClose()}>
      <ModalPanel>
        <Header safeAreaTop>
          <Topbar surface="transparent">
            <TopbarTrailing>
              <IconButton icon="chevron-left" variant="soft" accessibilityLabel="Back" onPress={onClose} />
              <IconButton icon="cross" variant="soft" accessibilityLabel="Close send address sheet" onPress={onClose} />
            </TopbarTrailing>
          </Topbar>
        </Header>

        <Scroll>
          <View direction="column" align="stretch" justify="start" gap="xl" paddingX="lg" fill="grow">
            <View direction="column" align="stretch" gap="sm">
              <Text size="lg" emphasis>Send to Bitcoin address</Text>
              <Text size="md" muted>Scan Qr code or paste</Text>
            </View>

            <View direction="column" align="stretch" justify="center" fill="grow">
              <NuriScope mode="dark">
                <View chrome="canvas" radius="full" aspectRatio="square" align="center" justify="center">
                  <Text size="md" muted align="center">Camera</Text>
                </View>
              </NuriScope>
            </View>
          </View>
        </Scroll>

        <Footer safeAreaBottom direction="column" align="stretch" paddingBottom="lg" paddingX="lg">
          <View direction="row" distribute="even">
            <Button size="lg" variant="soft" onPress={noop}>Paste Bitcoin address</Button>
          </View>
        </Footer>
      </ModalPanel>
    </Modal>
  );
}
