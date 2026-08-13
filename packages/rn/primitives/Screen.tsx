// ════════════════════════════════════════════════════════════════
// Screen — the structural flex-column fill · RN <View style={{flex:1}}>
// (screen.js:9 · "a thin component over <View> · flex:1") · no namespace.
// Safe-area application is an authoring boolean: the app/navigator reads native
// insets once into NuriSafeAreaProvider, and Screen applies requested edges.
// ════════════════════════════════════════════════════════════════
import * as React from 'react';
import { View as RNView } from 'react-native';
import type { LayoutChangeEvent, ViewStyle } from 'react-native';
import { useNuriSafeAreaInsets } from '../safe-area';
import { FixedRegionLayoutProvider, useFixedRegionLayout } from './FixedRegionLayout';
import { useHasOpenFullModal } from './modal-stack';
import { SCREEN_STYLE, withKeys } from './shared';

export type ScreenProps = {
  safeArea?: boolean;
  safeAreaTop?: boolean;
  safeAreaBottom?: boolean;
  children?: React.ReactNode;
  testID?: string;
  onLayout?: (event: LayoutChangeEvent) => void;
  ref?: React.Ref<React.ElementRef<typeof RNView>>;
};

const SCREEN_DOCK_STYLE: ViewStyle = { ...SCREEN_STYLE, position: 'relative', overflow: 'hidden' };

type ScreenFrameProps = Pick<ScreenProps, 'children' | 'testID' | 'onLayout'> & {
  requestedSafeAreaTop: number;
  requestedSafeAreaBottom: number;
  viewRef: React.Ref<React.ElementRef<typeof RNView>>;
};

const ScreenFrame: React.FC<ScreenFrameProps> = ({
  children,
  testID,
  onLayout,
  requestedSafeAreaTop,
  requestedSafeAreaBottom,
  viewRef,
}) => {
  const { frameKeyboardInset, keyboardHeight } = useFixedRegionLayout();
  const bottomInset = frameKeyboardInset > 0
    ? frameKeyboardInset
    : keyboardHeight > 0
      ? 0
      : requestedSafeAreaBottom;
  const insetStyle: ViewStyle = {};
  if (requestedSafeAreaTop > 0) insetStyle.paddingTop = requestedSafeAreaTop;
  if (bottomInset > 0) insetStyle.paddingBottom = bottomInset;
  const style = Object.keys(insetStyle).length ? [SCREEN_DOCK_STYLE, insetStyle] : SCREEN_DOCK_STYLE;

  return <RNView ref={viewRef} testID={testID} onLayout={onLayout} style={style}>{children}</RNView>;
};
ScreenFrame.displayName = 'ScreenFrame';

const ScreenImpl = React.forwardRef<React.ElementRef<typeof RNView>, ScreenProps>(({
  safeArea = false,
  safeAreaTop = false,
  safeAreaBottom = false,
  children,
  testID,
  onLayout,
}, ref) => {
  const insets = useNuriSafeAreaInsets();
  const hasOpenFullModal = useHasOpenFullModal();
  const requestedSafeAreaTop = safeArea || safeAreaTop ? insets.top : 0;
  const requestedSafeAreaBottom = safeArea || safeAreaBottom ? insets.bottom : 0;

  return (
    <FixedRegionLayoutProvider
      keyboardEnabled={!hasOpenFullModal}
      hostGeometry="fill"
      safeAreaTop={insets.top}
      safeAreaBottom={insets.bottom}
    >
      <ScreenFrame
        viewRef={ref}
        testID={testID}
        onLayout={onLayout}
        requestedSafeAreaTop={requestedSafeAreaTop}
        requestedSafeAreaBottom={requestedSafeAreaBottom}
      >
        {children}
      </ScreenFrame>
    </FixedRegionLayoutProvider>
  );
});
ScreenImpl.displayName = 'Screen';
export const Screen = withKeys(ScreenImpl, ['safeArea', 'safeAreaTop', 'safeAreaBottom']);
