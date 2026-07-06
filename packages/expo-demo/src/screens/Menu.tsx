import * as React from 'react';

import { Button, IconButton, Topbar, View } from '@ds';

export function Menu({
  onBack,
  onOpenSheet,
}: {
  onBack: () => void;
  onOpenSheet: (sheet: 'activity' | 'amount' | 'actions' | 'form') => void;
}) {
  return (
    <>
      <Topbar>
        <IconButton icon="chevron-left" variant="soft" accessibilityLabel="Back to wallet" onPress={onBack} />
      </Topbar>

      <View direction="column" align="stretch" justify="center" gap="md" paddingX="lg" paddingY="lg" fill="grow">
        <Button size="lg" onPress={() => onOpenSheet('activity')}>Activity Sheet</Button>
        <Button size="lg" onPress={() => onOpenSheet('amount')}>Amount Sheet</Button>
        <Button size="lg" onPress={() => onOpenSheet('actions')}>Actions Sheet</Button>
        <Button size="lg" onPress={() => onOpenSheet('form')}>Form Sheet</Button>
      </View>
    </>
  );
}
