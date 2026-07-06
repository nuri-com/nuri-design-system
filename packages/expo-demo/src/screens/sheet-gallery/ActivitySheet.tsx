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
  ListActionTextMuted,
  ListActionTrailingText,
  ListActionTrailingTextMuted,
  ListSeparator,
  Text,
  TopbarTrailing,
  View,
} from '@ds';

export function ActivitySheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <BottomSheet open={open} detent="full" onOpenChange={(next) => !next && onClose()}>
      <BottomSheetPanel>
        <BottomSheetTopbar>
          <TopbarTrailing>
            <IconButton icon="download" variant="soft" accessibilityLabel="Download activity" />
            <IconButton icon="cross" variant="soft" accessibilityLabel="Close activity sheet" onPress={onClose} />
          </TopbarTrailing>
        </BottomSheetTopbar>

        <BottomSheetScroll>
          <View direction="column" align="stretch" justify="start" gap="xl" paddingBottom="xl">
            <View direction="column" align="stretch" justify="start" gap="md">
              <View paddingX="lg">
                <Text size="lg" emphasis>This month</Text>
              </View>

              <List>
                <ListAction accessibilityLabel="To Wallet">
                  <ListActionLeadingAvatar name="arrow-up" variant="outline" />
                  <ListActionText>To Wallet</ListActionText>
                  <ListActionTextMuted>Sent · 10:24 am</ListActionTextMuted>
                  <ListActionTrailingText>- 12.00 €</ListActionTrailingText>
                  <ListActionTrailingTextMuted>3433 Sats</ListActionTrailingTextMuted>
                </ListAction>
                <ListSeparator />
                <ListAction accessibilityLabel="Euro to Bitcoin">
                  <ListActionLeadingAvatar name="transfer-horizontal" variant="outline" />
                  <ListActionText>Euro to Bitcoin</ListActionText>
                  <ListActionTextMuted>Converted · Yesterday</ListActionTextMuted>
                  <ListActionTrailingText>12.00 €</ListActionTrailingText>
                  <ListActionTrailingTextMuted>3433 Sats</ListActionTrailingTextMuted>
                </ListAction>
                <ListSeparator />
                <ListAction accessibilityLabel="To Izmir Köftecisi">
                  <ListActionLeadingAvatar name="arrow-up" variant="outline" />
                  <ListActionText>To Izmir Köftecisi</ListActionText>
                  <ListActionTextMuted>Paid · Sat, 4 Jul</ListActionTextMuted>
                  <ListActionTrailingText>- 7.00 €</ListActionTrailingText>
                  <ListActionTrailingTextMuted>3433 Sats</ListActionTrailingTextMuted>
                </ListAction>
              </List>
            </View>

            <View direction="column" align="stretch" justify="start" gap="md">
              <View paddingX="lg">
                <Text size="lg" emphasis>June</Text>
              </View>

              <List>
                <ListAction accessibilityLabel="To Emin Mahrt">
                  <ListActionLeadingAvatar name="arrow-up" variant="outline" />
                  <ListActionText>To Emin Mahrt</ListActionText>
                  <ListActionTextMuted>Sent · Wed, 16 June</ListActionTextMuted>
                  <ListActionTrailingText>- 12.00 €</ListActionTrailingText>
                  <ListActionTrailingTextMuted>3433 Sats</ListActionTrailingTextMuted>
                </ListAction>
                <ListSeparator />
                <ListAction accessibilityLabel="From Emil Wagner">
                  <ListActionLeadingAvatar name="plus" variant="outline" />
                  <ListActionText>From Emil Wagner</ListActionText>
                  <ListActionTextMuted>Received · Wed, 16 June</ListActionTextMuted>
                  <ListActionTrailingText>12.00 €</ListActionTrailingText>
                  <ListActionTrailingTextMuted>3433 Sats</ListActionTrailingTextMuted>
                </ListAction>
                <ListSeparator />
                <ListAction accessibilityLabel="From Wallet">
                  <ListActionLeadingAvatar name="plus" variant="outline" />
                  <ListActionText>From Wallet</ListActionText>
                  <ListActionTextMuted>Received · Wed, 16 June</ListActionTextMuted>
                  <ListActionTrailingText>12.00 €</ListActionTrailingText>
                  <ListActionTrailingTextMuted>3433 Sats</ListActionTrailingTextMuted>
                </ListAction>
                <ListSeparator />
                <ListAction accessibilityLabel="To EASYJET AIR KCTJ253FI">
                  <ListActionLeadingAvatar name="arrow-up" variant="outline" />
                  <ListActionText>To EASYJET AIR KCTJ...</ListActionText>
                  <ListActionTextMuted>Paid · Wed, 16 June</ListActionTextMuted>
                  <ListActionTrailingText>- 110.00 €</ListActionTrailingText>
                  <ListActionTrailingTextMuted>3433 Sats</ListActionTrailingTextMuted>
                </ListAction>
                <ListSeparator />
                <ListAction accessibilityLabel="To Izmir Köftecisi">
                  <ListActionLeadingAvatar name="arrow-up" variant="outline" />
                  <ListActionText>To Izmir Köftecisi</ListActionText>
                  <ListActionTextMuted>Paid · Wed, 16 June</ListActionTextMuted>
                  <ListActionTrailingText>- 7.00 €</ListActionTrailingText>
                  <ListActionTrailingTextMuted>3433 Sats</ListActionTrailingTextMuted>
                </ListAction>
              </List>
            </View>

            <View direction="column" align="stretch" justify="start" gap="md">
              <View paddingX="lg">
                <Text size="lg" emphasis>May</Text>
              </View>

              <List>
                <ListAction accessibilityLabel="To Wallet">
                  <ListActionLeadingAvatar name="arrow-up" variant="outline" />
                  <ListActionText>To Wallet</ListActionText>
                  <ListActionTextMuted>Sent · Fri, 30 May</ListActionTextMuted>
                  <ListActionTrailingText>- 15.00 €</ListActionTrailingText>
                  <ListActionTrailingTextMuted>4291 Sats</ListActionTrailingTextMuted>
                </ListAction>
                <ListSeparator />
                <ListAction accessibilityLabel="From Emil Wagner">
                  <ListActionLeadingAvatar name="plus" variant="outline" />
                  <ListActionText>From Emil Wagner</ListActionText>
                  <ListActionTextMuted>Received · Thu, 29 May</ListActionTextMuted>
                  <ListActionTrailingText>22.00 €</ListActionTrailingText>
                  <ListActionTrailingTextMuted>6294 Sats</ListActionTrailingTextMuted>
                </ListAction>
                <ListSeparator />
                <ListAction accessibilityLabel="Euro to Bitcoin">
                  <ListActionLeadingAvatar name="transfer-horizontal" variant="outline" />
                  <ListActionText>Euro to Bitcoin</ListActionText>
                  <ListActionTextMuted>Converted · Wed, 28 May</ListActionTextMuted>
                  <ListActionTrailingText>30.00 €</ListActionTrailingText>
                  <ListActionTrailingTextMuted>8582 Sats</ListActionTrailingTextMuted>
                </ListAction>
                <ListSeparator />
                <ListAction accessibilityLabel="To Izmir Köftecisi">
                  <ListActionLeadingAvatar name="arrow-up" variant="outline" />
                  <ListActionText>To Izmir Köftecisi</ListActionText>
                  <ListActionTextMuted>Paid · Tue, 27 May</ListActionTextMuted>
                  <ListActionTrailingText>- 7.00 €</ListActionTrailingText>
                  <ListActionTrailingTextMuted>2003 Sats</ListActionTrailingTextMuted>
                </ListAction>
                <ListSeparator />
                <ListAction accessibilityLabel="To EASYJET AIR KCTJ253FI">
                  <ListActionLeadingAvatar name="arrow-up" variant="outline" />
                  <ListActionText>To EASYJET AIR KCTJ...</ListActionText>
                  <ListActionTextMuted>Paid · Mon, 26 May</ListActionTextMuted>
                  <ListActionTrailingText>- 84.00 €</ListActionTrailingText>
                  <ListActionTrailingTextMuted>24041 Sats</ListActionTrailingTextMuted>
                </ListAction>
              </List>
            </View>

            <View height="2xl" />
          </View>
        </BottomSheetScroll>
      </BottomSheetPanel>
    </BottomSheet>
  );
}
