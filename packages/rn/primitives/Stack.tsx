// ════════════════════════════════════════════════════════════════
// Stack — the flex-layout slice (stack namespace) · RN <View>
// ════════════════════════════════════════════════════════════════
import * as React from 'react';
import { View as RNView } from 'react-native';
import type { StackNS } from '../contract';
import { childFillStyle } from '../runtime/resolve';
import { STACK_KEYS, useResolvedNode, withKeys } from './shared';

export type StackProps = StackNS & { children?: React.ReactNode };

const StackImpl: React.FC<StackProps> = (props) => {
  const { children, ...nsProps } = props;
  const { node } = useResolvedNode(nsProps);
  // `distribute` is child-affecting (no node style · the childFill no-op). RN has no
  // `> *` combinator, so wrap each DIRECT child in a flex View carrying the per-child
  // style — the projection of the web child combinator (equal shares of the axis).
  if (!nsProps.distribute) return <RNView style={node.view}>{children}</RNView>;
  const childStyle = childFillStyle(nsProps.distribute);
  return (
    <RNView style={node.view}>
      {React.Children.map(children, (child) =>
        child === null || child === undefined || child === false || child === true
          ? child
          : <RNView style={childStyle}>{child}</RNView>,
      )}
    </RNView>
  );
};
StackImpl.displayName = 'Stack';
export const Stack = withKeys(StackImpl, STACK_KEYS);
