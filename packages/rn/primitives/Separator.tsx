// ════════════════════════════════════════════════════════════════
// Separator — horizontal hairline · RN <View>
// ────────────────────────────────────────────────────────────────
// Mirrors web <nuri-separator>: border.1 visible line, border.subtle colour,
// y-space margin defaulting to sm. Horizontal only by contract.
// ════════════════════════════════════════════════════════════════
import * as React from 'react';
import { View as RNView } from 'react-native';
import type { ViewStyle } from 'react-native';
import { border, space } from '../contract';
import { useNuriTheme } from '../theme';
import { withKeys } from './shared';
import { BleedHitTransparencyContext } from './Bleed';

export type SeparatorYSpace = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SeparatorProps = { ySpace?: SeparatorYSpace };

const SeparatorImpl: React.FC<SeparatorProps> = ({ ySpace = 'sm' }) => {
  const theme = useNuriTheme();
  // Hairlines inside a Bleed band are touch-transparent (review P2 round 3).
  const inBleedBand = React.useContext(BleedHitTransparencyContext);
  const style: ViewStyle = {
    height: border[1],
    width: '100%',
    marginVertical: space[ySpace],
    backgroundColor: theme.border.subtle,
  };
  return <RNView accessibilityRole="none" pointerEvents={inBleedBand ? 'none' : undefined} style={style} />;
};
SeparatorImpl.displayName = 'Separator';
export const Separator = withKeys(SeparatorImpl, ['ySpace']);
