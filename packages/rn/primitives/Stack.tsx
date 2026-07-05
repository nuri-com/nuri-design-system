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
  // PARITY EDGE (latent): React.Children.map wraps each ELEMENT, so a Fragment child
  // (`<>…</>`) becomes ONE even cell — unlike web `> *`, where a fragment has no DOM
  // node and its members are the direct children (each its own cell). Author FLAT
  // children under a distribute stack (no fragment grouping) to keep the two aligned.
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
