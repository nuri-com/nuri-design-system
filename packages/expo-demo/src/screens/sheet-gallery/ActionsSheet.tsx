import * as React from 'react';

import {
  BottomSheet,
  BottomSheetPanel,
  IconButton,
  List,
  ListAction,
  ListActionLeadingAvatar,
  ListActionText,
  ListActionTrailIcon,
  ListSeparator,
  Text,
  Topbar,
  TopbarTrailing,
  View,
} from '../../components/ui';
import { METHODS } from './data';

export function ActionsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <BottomSheet open={open} detent="content" onOpenChange={(next) => !next && onClose()}>
      <BottomSheetPanel>
        <View direction="column" align="stretch" justify="start" gap="xl" paddingBottom="lg">
          <View direction="column" align="stretch" justify="start">
            <Topbar>
              <TopbarTrailing>
                <IconButton icon="cross" variant="soft" accessibilityLabel="Close actions sheet" onPress={onClose} />
              </TopbarTrailing>
            </Topbar>

            <View direction="column" align="stretch" justify="start" gap="sm" paddingX="lg">
              <Text size="lg" emphasis>Where do you want to send it?</Text>
              <Text size="md" muted>Choose a transfer method</Text>
            </View>
          </View>

          <List>
            {METHODS.map((method, index) => (
              <React.Fragment key={method.label}>
                {index > 0 ? <ListSeparator /> : null}
                <ListAction accessibilityLabel={method.label} onPress={onClose}>
                  {method.accent ? (
                    <ListActionLeadingAvatar name={method.icon} variant="solid" accent={method.accent} />
                  ) : (
                    <ListActionLeadingAvatar name={method.icon} variant="solid" />
                  )}
                  <ListActionText>{method.label}</ListActionText>
                  <ListActionTrailIcon name="chevron-right" />
                </ListAction>
              </React.Fragment>
            ))}
          </List>
        </View>
      </BottomSheetPanel>
    </BottomSheet>
  );
}
