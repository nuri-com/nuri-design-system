// ════════════════════════════════════════════════════════════════
// Dock — the structural screen-local dock · RN <View position:absolute>
// ════════════════════════════════════════════════════════════════
import * as React from 'react';
import { View as RNView } from 'react-native';
import type { LayoutChangeEvent, ViewStyle } from 'react-native';
import { useRegisterRegion } from './FixedRegionLayout';
import { withKeys } from './shared';

export type DockEdge = 'bottom' | 'top';
export type DockProps = {
  edge: DockEdge;
  children?: React.ReactNode;
  testID?: string;
  onLayout?: (event: LayoutChangeEvent) => void;
  ref?: React.Ref<React.ElementRef<typeof RNView>>;
};

const DockImpl = React.forwardRef<React.ElementRef<typeof RNView>, DockProps>(({
  edge,
  children,
  testID,
  onLayout,
}, ref) => {
  const handleLayout = useRegisterRegion(edge === 'top' ? 'dockTop' : 'dockBottom', onLayout);

  return (
    <RNView ref={ref} testID={testID} onLayout={handleLayout} style={edge === 'top' ? DOCK_TOP_STYLE : DOCK_BOTTOM_STYLE}>
      {children}
    </RNView>
  );
});
DockImpl.displayName = 'Dock';
export const Dock = withKeys(DockImpl, ['edge']);

const DOCK_BOTTOM_STYLE: ViewStyle = {
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 1,
};

const DOCK_TOP_STYLE: ViewStyle = {
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  zIndex: 1,
};
