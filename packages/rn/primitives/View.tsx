// ════════════════════════════════════════════════════════════════
// View — the merged painting node (box ⊕ stack ⊕ palette) · RN <View>
// ════════════════════════════════════════════════════════════════
import * as React from 'react';
import { View as RNView } from 'react-native';
import type { BoxNS, StackNS, PaletteNS } from '../contract';
import { PALETTE_KEYS } from '@nuri/spec/descriptors/schema';
import { BOX_KEYS, STACK_KEYS, useResolvedNode, withKeys, scopedByAccent, withSurface } from './shared';

export type ViewProps = BoxNS & StackNS & PaletteNS & { children?: React.ReactNode };

const ViewImpl: React.FC<ViewProps> = (props) => {
  const { children, ...nsProps } = props;
  const { node } = useResolvedNode(nsProps);
  return <RNView style={node.view}>{withSurface(node.fg, children)}</RNView>;
};
ViewImpl.displayName = 'View';
export const View = withKeys(scopedByAccent(ViewImpl), [...BOX_KEYS, ...STACK_KEYS, ...PALETTE_KEYS]);
