// ════════════════════════════════════════════════════════════════
// Bleed — controlled negative space · RN <View>
// ════════════════════════════════════════════════════════════════
import * as React from 'react';
import { View as RNView } from 'react-native';
import type { ViewStyle } from 'react-native';
import type { BleedNS } from '../contract';
import { resolveBleed } from '../runtime/resolve';
import { BLEED_FIELDS } from '@nuri/spec/resolve-map';
import { withKeys } from './shared';

export type BleedProps = BleedNS & {
  children: React.ReactElement;
};

// The element's fixed, non-configurable lift. `position:relative` makes the
// stacking promise explicit on web parity; zIndex is the RN realization.
const LIFT_STYLE: ViewStyle = { position: 'relative', zIndex: 1 };

const BleedImpl: React.FC<BleedProps> = ({ children, ...bleed }) => {
  const child = React.Children.only(children);
  if (child.type === React.Fragment) {
    throw new Error('Bleed expects exactly one host child; fragments are not accepted.');
  }
  return (
    <RNView style={[resolveBleed(bleed), LIFT_STYLE]}>
      {child}
    </RNView>
  );
};
BleedImpl.displayName = 'Bleed';

export const Bleed = withKeys(BleedImpl, Object.keys(BLEED_FIELDS));
