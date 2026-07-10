import * as React from 'react';
import { View as RNView } from 'react-native';
import type { LayoutChangeEvent, ViewStyle } from 'react-native';
import type { BoxNS, PaletteNS, StackNS } from '../contract';
import { useFixedRegionLayout, useRegisterRegion } from './FixedRegionLayout';
import { FIXED_REGION_STYLE_KEYS, numericPadding, useResolvedNode, withKeys, withSurface } from './shared';

type FooterStyleProps =
  Pick<PaletteNS, 'chrome'> &
  Pick<StackNS, 'direction' | 'align' | 'justify' | 'gap'> &
  Pick<BoxNS, 'paddingX' | 'paddingY' | 'paddingTop' | 'paddingBottom'>;

export type FooterProps = FooterStyleProps & {
  safeAreaBottom?: boolean;
  children?: React.ReactNode;
  testID?: string;
  onLayout?: (event: LayoutChangeEvent) => void;
  ref?: React.Ref<React.ElementRef<typeof RNView>>;
};

const FooterImpl = React.forwardRef<React.ElementRef<typeof RNView>, FooterProps>(({
  safeAreaBottom = false,
  children,
  testID,
  onLayout,
  ...props
}, ref) => {
  const { keyboardOffset, safeAreaBottom: hostSafeAreaBottom } = useFixedRegionLayout();
  const handleLayout = useRegisterRegion('footer', onLayout);
  const { node } = useResolvedNode(props);
  const resolvedViewStyle = node.view as ViewStyle;
  const authoredPaddingBottom =
    props.paddingBottom !== undefined
      ? numericPadding(resolvedViewStyle, 'paddingBottom')
      : numericPadding(resolvedViewStyle, 'paddingVertical');
  const activeSafeAreaBottom = safeAreaBottom && keyboardOffset === 0 ? hostSafeAreaBottom : 0;
  const composedPaddingBottom =
    authoredPaddingBottom > 0 || activeSafeAreaBottom > 0
      ? { paddingBottom: authoredPaddingBottom + activeSafeAreaBottom }
      : null;

  return (
    <RNView
      ref={ref}
      testID={testID}
      onLayout={handleLayout}
      style={[
        FOOTER_STYLE,
        node.view,
        keyboardOffset > 0 ? { bottom: keyboardOffset } : null,
        composedPaddingBottom,
      ]}
    >
      {withSurface(node.fg, children)}
    </RNView>
  );
});
FooterImpl.displayName = 'Footer';

export const Footer = withKeys(FooterImpl, [
  'safeAreaBottom',
  ...FIXED_REGION_STYLE_KEYS,
]);

const FOOTER_STYLE: ViewStyle = {
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 2,
};
