import * as React from 'react';
import { View as RNView } from 'react-native';
import type { LayoutChangeEvent, ViewStyle } from 'react-native';
import type { BoxNS, PaletteNS, StackNS } from '../contract';
import { useFixedRegionLayout, useRegisterRegion } from './FixedRegionLayout';
import { FIXED_REGION_STYLE_KEYS, numericPadding, useResolvedNode, withKeys, withSurface } from './shared';

type HeaderStyleProps =
  Pick<PaletteNS, 'chrome'> &
  Pick<StackNS, 'direction' | 'align' | 'justify' | 'gap'> &
  Pick<BoxNS, 'paddingX' | 'paddingY' | 'paddingTop' | 'paddingBottom'>;

export type HeaderProps = HeaderStyleProps & {
  safeAreaTop?: boolean;
  children?: React.ReactNode;
  testID?: string;
  onLayout?: (event: LayoutChangeEvent) => void;
  ref?: React.Ref<React.ElementRef<typeof RNView>>;
};

const HeaderImpl = React.forwardRef<React.ElementRef<typeof RNView>, HeaderProps>(({
  safeAreaTop = false,
  children,
  testID,
  onLayout,
  ...props
}, ref) => {
  const { safeAreaTop: hostSafeAreaTop } = useFixedRegionLayout();
  const handleLayout = useRegisterRegion('header', onLayout);
  const { node } = useResolvedNode(props);
  const resolvedViewStyle = node.view as ViewStyle;
  const authoredPaddingTop =
    props.paddingTop !== undefined
      ? numericPadding(resolvedViewStyle, 'paddingTop')
      : numericPadding(resolvedViewStyle, 'paddingVertical');
  const effectiveSafeAreaTop = safeAreaTop ? hostSafeAreaTop : 0;
  const composedPaddingTop =
    authoredPaddingTop > 0 || effectiveSafeAreaTop > 0
      ? { paddingTop: authoredPaddingTop + effectiveSafeAreaTop }
      : null;

  return (
    <RNView ref={ref} testID={testID} onLayout={handleLayout} style={[HEADER_STYLE, node.view, composedPaddingTop]}>
      {withSurface(node.fg, children)}
    </RNView>
  );
});
HeaderImpl.displayName = 'Header';

export const Header = withKeys(HeaderImpl, [
  'safeAreaTop',
  ...FIXED_REGION_STYLE_KEYS,
]);

const HEADER_STYLE: ViewStyle = {
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  zIndex: 2,
};
