import * as React from 'react';

import {
  BottomSheet,
  BottomSheetPanel,
  BottomSheetScroll,
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
  Topbar,
  TopbarTrailing,
  View,
} from '../../components/ui';
import { ACTIVITY_GROUPS } from './data';

export function ActivitySheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <BottomSheet open={open} detent="full" onOpenChange={(next) => !next && onClose()}>
      <BottomSheetPanel>
        <Topbar>
          <TopbarTrailing>
            <IconButton icon="download" variant="soft" accessibilityLabel="Download activity" />
            <IconButton icon="cross" variant="soft" accessibilityLabel="Close activity sheet" onPress={onClose} />
          </TopbarTrailing>
        </Topbar>

        <BottomSheetScroll>
          <View direction="column" align="stretch" justify="start" gap="xl" paddingBottom="xl">
            {ACTIVITY_GROUPS.map((group) => (
              <View key={group.month} direction="column" align="stretch" justify="start" gap="md">
                <View paddingX="lg">
                  <Text size="lg" emphasis>{group.month}</Text>
                </View>

                <List>
                  {group.items.map((item, index) => (
                    <React.Fragment key={`${group.month}-${item.name}-${index}`}>
                      {index > 0 ? <ListSeparator /> : null}
                      <ListAction accessibilityLabel={item.name}>
                        <ListActionLeadingAvatar name={item.icon} variant="outline" />
                        <ListActionText>{item.name}</ListActionText>
                        <ListActionTextMuted>{item.meta}</ListActionTextMuted>
                        <ListActionTrailingText>{item.amount}</ListActionTrailingText>
                        <ListActionTrailingTextMuted>{item.sats}</ListActionTrailingTextMuted>
                      </ListAction>
                    </React.Fragment>
                  ))}
                </List>
              </View>
            ))}
            <View height="2xl" />
          </View>
        </BottomSheetScroll>
      </BottomSheetPanel>
    </BottomSheet>
  );
}
