// ════════════════════════════════════════════════════════════════
// ListSeparator — list-family preset over Separator · RN <View>
// ────────────────────────────────────────────────────────────────
// The hairline paint stays in Separator; this wrapper owns only the list inset.
// ════════════════════════════════════════════════════════════════
import * as React from 'react';
import { Separator } from './Separator';
import { View } from './View';
import { withKeys } from './shared';

export type ListSeparatorProps = Record<string, never>;

const ListSeparatorImpl: React.FC<ListSeparatorProps> = () => (
  // Keep the row-alignment coupling in one preset: list-action root padding is md.
  <View paddingX="md">
    <Separator ySpace="sm" />
  </View>
);
ListSeparatorImpl.displayName = 'ListSeparator';
export const ListSeparator = withKeys(ListSeparatorImpl, []);
