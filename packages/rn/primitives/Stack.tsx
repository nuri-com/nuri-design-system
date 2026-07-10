// ════════════════════════════════════════════════════════════════
// Stack — the flex-layout slice (stack namespace) · RN <View>
// ════════════════════════════════════════════════════════════════
import * as React from 'react';
import { View as RNView } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
import type { StackNS } from '../contract';
import { STACK_KEYS, useResolvedNode, withKeys, wrapDistributedChildren } from './shared';

export type StackProps = StackNS & {
  children?: React.ReactNode;
  testID?: string;
  onLayout?: (event: LayoutChangeEvent) => void;
  ref?: React.Ref<React.ElementRef<typeof RNView>>;
};

const StackImpl = React.forwardRef<React.ElementRef<typeof RNView>, StackProps>((props, ref) => {
  const { children, testID, onLayout, ...nsProps } = props;
  const { node } = useResolvedNode(nsProps);
  return <RNView ref={ref} testID={testID} onLayout={onLayout} style={node.view}>{wrapDistributedChildren(nsProps.distribute, children)}</RNView>;
});
StackImpl.displayName = 'Stack';
export const Stack = withKeys(StackImpl, STACK_KEYS);
