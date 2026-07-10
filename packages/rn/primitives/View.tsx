// ════════════════════════════════════════════════════════════════
// View — the merged painting node (box ⊕ stack ⊕ palette) · RN <View>
// ════════════════════════════════════════════════════════════════
import * as React from 'react';
import { View as RNView } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
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

export type ViewProps = BoxNS & StackNS & PaletteNS & EffectNS & {
  children?: React.ReactNode;
  testID?: string;
  onLayout?: (event: LayoutChangeEvent) => void;
  ref?: React.Ref<React.ElementRef<typeof RNView>>;
};

const ViewImpl = React.forwardRef<React.ElementRef<typeof RNView>, ViewProps>((props, ref) => {
  const { children, testID, onLayout, ...nsProps } = props;
  const { node } = useResolvedNode(nsProps);
  const distributedChildren = wrapDistributedChildren(nsProps.distribute, children);
  return <RNView ref={ref} testID={testID} onLayout={onLayout} style={node.view}>{withSurface(node.fg, distributedChildren)}</RNView>;
});
ViewImpl.displayName = 'View';
export const View = withKeys(scopedByAccent(ViewImpl), [...BOX_KEYS, ...STACK_KEYS, ...PALETTE_KEYS, ...EFFECT_KEYS]);
