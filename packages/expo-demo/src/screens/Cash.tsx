import * as React from 'react';

import { Button, Text, View } from '@ds';

export function Cash() {
  return (
    <View direction="column" align="stretch" justify="start" gap="lg" paddingX="lg" paddingY="md" fill="grow">
      <View aspectRatio="card" radius="lg" />
      <Text size="3xl" align="center">€ 1 240.00</Text>
      <View direction="row" align="center" gap="sm">
        <View fill="even">
          <Button size="lg" variant="soft">Receive</Button>
        </View>
        <View fill="even">
          <Button size="lg" variant="solid" accent="lilac">Send</Button>
        </View>
      </View>
    </View>
  );
}
