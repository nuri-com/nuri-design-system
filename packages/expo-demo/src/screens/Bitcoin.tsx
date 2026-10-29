import * as React from 'react';

import { Button, ButtonIcon, ButtonText, Text, View } from '@ds';

const BTC = '₿ 0.0413';
const EUR = '€ 2 634';

export function Bitcoin() {
  // The other-unit amount under the big one is a ghost swap (#233): an action inside
  // content, so no fill competes with the amount. The screen owns the unit state.
  const [inEuro, setInEuro] = React.useState(false);

  return (
    <View direction="column" align="stretch" justify="start" gap="lg" paddingX="lg" paddingY="md" fill="grow">
      <View aspectRatio="card" radius="lg" />
      <View direction="column" align="center" gap="xs">
        <Text size="3xl" align="center">{inEuro ? EUR : BTC}</Text>
        <Button size="sm" variant="ghost" onPress={() => setInEuro((value) => !value)}>
          <ButtonIcon name="transfer-vertical" />
          <ButtonText>{inEuro ? BTC : EUR}</ButtonText>
        </Button>
      </View>
      <View direction="row" align="center" gap="sm" distribute="even">
        <Button size="lg" variant="soft">Receive</Button>
        <Button size="lg" variant="solid" accent="orange">Send</Button>
      </View>
    </View>
  );
}
