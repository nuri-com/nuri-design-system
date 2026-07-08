// ════════════════════════════════════════════════════════════════
// View — the merged painting node (box ⊕ stack ⊕ palette) · RN <View>
// ════════════════════════════════════════════════════════════════
import * as React from 'react';
import { View as RNView } from 'react-native';
import type { BoxNS, StackNS, PaletteNS, EffectNS } from '../contract';
import { PALETTE_KEYS, EFFECT_KEYS } from '@nuri/spec/descriptors/schema';
import {
  BOX_KEYS,
  STACK_KEYS,
  useResolvedNode,
  withKeys,
  scopedByAccent,
  withSurface,
  wrapDistributedChildren,
} from './shared';

export type ViewProps = BoxNS & StackNS & PaletteNS & EffectNS & { children?: React.ReactNode };

const ViewImpl: React.FC<ViewProps> = (props) => {
  const { children, ...nsProps } = props;
  const { node } = useResolvedNode(nsProps);
  const distributedChildren = wrapDistributedChildren(nsProps.distribute, children);
  return <RNView style={node.view}>{withSurface(node.fg, distributedChildren)}</RNView>;
};
ViewImpl.displayName = 'View';
export const View = withKeys(scopedByAccent(ViewImpl), [...BOX_KEYS, ...STACK_KEYS, ...PALETTE_KEYS, ...EFFECT_KEYS]);
