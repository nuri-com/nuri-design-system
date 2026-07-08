// ════════════════════════════════════════════════════════════════
// Stack — the flex-layout slice (stack namespace) · RN <View>
// ════════════════════════════════════════════════════════════════
import * as React from 'react';
import { View as RNView } from 'react-native';
import type { StackNS } from '../contract';
import { STACK_KEYS, useResolvedNode, withKeys, wrapDistributedChildren } from './shared';

export type StackProps = StackNS & { children?: React.ReactNode };

const StackImpl: React.FC<StackProps> = (props) => {
  const { children, ...nsProps } = props;
  const { node } = useResolvedNode(nsProps);
  return <RNView style={node.view}>{wrapDistributedChildren(nsProps.distribute, children)}</RNView>;
};
StackImpl.displayName = 'Stack';
export const Stack = withKeys(StackImpl, STACK_KEYS);
