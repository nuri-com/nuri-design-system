import * as React from 'react';

import {
  BottomSheet,
  BottomSheetPanel,
  BottomSheetScroll,
  BottomSheetTopbar,
  IconButton,
  List,
  ListAction,
  ListActionLeadingAvatar,
  ListActionText,
  ListActionTrailIcon,
  ListSeparator,
  Text,
  TopbarTrailing,
  View,
} from '@ds';

export function ActionsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <BottomSheet open={open} detent="content" onOpenChange={(next) => !next && onClose()}>
      <BottomSheetPanel>
        <BottomSheetTopbar>
          <TopbarTrailing>
            <IconButton icon="cross" variant="soft" accessibilityLabel="Close actions sheet" onPress={onClose} />
          </TopbarTrailing>
        </BottomSheetTopbar>

        <BottomSheetScroll>
          <View direction="column" align="stretch" justify="start" gap="xl" paddingBottom="lg">
            <View direction="column" align="stretch" justify="start" gap="sm" paddingX="lg">
              <Text size="lg" emphasis>Where do you want to send it?</Text>
              <Text size="md" muted>Choose a transfer method</Text>
            </View>

            <List>
              <ListAction accessibilityLabel="Bitcoin wallet" onPress={onClose}>
                <ListActionLeadingAvatar name="wallet" variant="solid" accent="orange" />
                <ListActionText>Bitcoin wallet</ListActionText>
                <ListActionTrailIcon name="chevron-right" />
              </ListAction>
              <ListSeparator />
              <ListAction accessibilityLabel="Credit card" onPress={onClose}>
                <ListActionLeadingAvatar name="card" variant="solid" accent="lilac" />
                <ListActionText>Credit card</ListActionText>
                <ListActionTrailIcon name="chevron-right" />
              </ListAction>
              <ListSeparator />
              <ListAction accessibilityLabel="Convert to euro" onPress={onClose}>
                <ListActionLeadingAvatar name="transfer-horizontal" variant="solid" />
                <ListActionText>Convert to euro</ListActionText>
                <ListActionTrailIcon name="chevron-right" />
              </ListAction>
            </List>
          </View>
        </BottomSheetScroll>
      </BottomSheetPanel>
    </BottomSheet>
  );
}
