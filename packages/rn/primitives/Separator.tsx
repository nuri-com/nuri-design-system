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

export type SeparatorYSpace = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SeparatorProps = { ySpace?: SeparatorYSpace };

const SeparatorImpl: React.FC<SeparatorProps> = ({ ySpace = 'sm' }) => {
  const theme = useNuriTheme();
  const style: ViewStyle = {
    height: border[1],
    width: '100%',
    marginVertical: space[ySpace],
    backgroundColor: theme.border.subtle,
  };
  return <RNView accessibilityRole="none" style={style} />;
};
SeparatorImpl.displayName = 'Separator';
export const Separator = withKeys(SeparatorImpl, ['ySpace']);
