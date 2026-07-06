import * as React from 'react';

import { Button, IconButton, Topbar, View } from '../../components/ui';
import { SHEET_BUTTONS } from './data';
import type { OpenSheet } from './types';

export function SheetMenu({
  onBack,
  onOpenSheet,
}: {
  onBack: () => void;
  onOpenSheet: (sheet: OpenSheet) => void;
}) {
  return (
    <>
      <Topbar>
        <IconButton icon="chevron-left" variant="soft" accessibilityLabel="Back to wallet" onPress={onBack} />
      </Topbar>

      <View direction="column" align="stretch" justify="center" gap="md" paddingX="lg" paddingY="lg" fill="grow">
        {SHEET_BUTTONS.map((item) => (
          <Button key={item.key} size="lg" onPress={() => onOpenSheet(item.key)}>
            {item.label}
          </Button>
        ))}
      </View>
    </>
  );
}
