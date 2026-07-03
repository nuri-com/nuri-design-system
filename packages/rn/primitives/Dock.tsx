// ════════════════════════════════════════════════════════════════
// Dock — the structural screen-local dock · RN <View position:absolute>
// ════════════════════════════════════════════════════════════════
import * as React from 'react';
import { View as RNView } from 'react-native';
import type { LayoutChangeEvent, ViewStyle } from 'react-native';
import { withKeys } from './shared';
import { ScreenDockContext } from './Screen';

export type DockEdge = 'bottom' | 'top';
export type DockProps = { edge: DockEdge; children?: React.ReactNode };

const DockImpl: React.FC<DockProps> = ({ edge, children }) => {
  const { setTopInset, setBottomInset } = React.useContext(ScreenDockContext);
  const setInset = edge === 'top' ? setTopInset : setBottomInset;

  React.useEffect(() => () => setInset(0), [setInset]);

  const onLayout = React.useCallback(
    (event: LayoutChangeEvent) => {
      setInset(event.nativeEvent.layout.height);
    },
    [setInset],
  );

  return (
    <RNView onLayout={onLayout} style={edge === 'top' ? DOCK_TOP_STYLE : DOCK_BOTTOM_STYLE}>
      {children}
    </RNView>
  );
};
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
