import * as React from 'react';
import { View as RNView } from 'react-native';
import type { LayoutChangeEvent, ViewStyle } from 'react-native';
import type { BoxNS, PaletteNS, StackNS } from '../contract';
import { useFixedRegionLayout } from './FixedRegionLayout';
import { FIXED_REGION_STYLE_KEYS, numericPadding, useResolvedNode, withKeys, withSurface } from './shared';

type HeaderStyleProps =
  Pick<PaletteNS, 'chrome'> &
  Pick<StackNS, 'direction' | 'align' | 'justify' | 'gap'> &
  Pick<BoxNS, 'paddingX' | 'paddingY' | 'paddingTop' | 'paddingBottom'>;

export type HeaderProps = HeaderStyleProps & {
  safeAreaTop?: boolean;
  children?: React.ReactNode;
};

const HeaderImpl: React.FC<HeaderProps> = ({ safeAreaTop = false, children, ...props }) => {
  const { safeAreaTop: hostSafeAreaTop, setHeaderHeight } = useFixedRegionLayout();
  const measuredHeight = React.useRef(0);
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

  React.useEffect(() => () => setHeaderHeight(0), [setHeaderHeight]);

  const handleLayout = React.useCallback((event: LayoutChangeEvent) => {
    const next = Math.round(event.nativeEvent.layout.height);
    if (measuredHeight.current === next) return;
    measuredHeight.current = next;
    setHeaderHeight(next);
  }, [setHeaderHeight]);

  return (
    <RNView onLayout={handleLayout} style={[HEADER_STYLE, node.view, composedPaddingTop]}>
      {withSurface(node.fg, children)}
    </RNView>
  );
};
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
