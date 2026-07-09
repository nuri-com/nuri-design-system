import * as React from 'react';
import { View as RNView } from 'react-native';
import type { LayoutChangeEvent, ViewStyle } from 'react-native';
import type { BoxNS, PaletteNS, StackNS } from '../contract';
import { useFixedRegionLayout } from './FixedRegionLayout';
import { useResolvedNode, withKeys, withSurface } from './shared';

type FooterStyleProps =
  Pick<PaletteNS, 'chrome'> &
  Pick<StackNS, 'direction' | 'align' | 'justify' | 'gap'> &
  Pick<BoxNS, 'paddingX' | 'paddingY' | 'paddingTop' | 'paddingBottom'>;

export type FooterProps = FooterStyleProps & {
  safeAreaBottom?: boolean;
  children?: React.ReactNode;
};

function numericPadding(style: ViewStyle, key: 'paddingBottom' | 'paddingVertical'): number {
  const value = style[key];
  return typeof value === 'number' ? value : 0;
}

const FooterImpl: React.FC<FooterProps> = ({ safeAreaBottom = false, children, ...props }) => {
  const { keyboardOffset, safeAreaBottom: hostSafeAreaBottom, setFooterHeight } = useFixedRegionLayout();
  const measuredHeight = React.useRef(0);
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

  React.useEffect(() => () => setFooterHeight(0), [setFooterHeight]);

  const handleLayout = React.useCallback((event: LayoutChangeEvent) => {
    const next = Math.round(event.nativeEvent.layout.height);
    if (measuredHeight.current === next) return;
    measuredHeight.current = next;
    setFooterHeight(next);
  }, [setFooterHeight]);

  return (
    <RNView
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
};
FooterImpl.displayName = 'Footer';

export const Footer = withKeys(FooterImpl, [
  'safeAreaBottom',
  'chrome',
  'direction',
  'align',
  'justify',
  'gap',
  'paddingX',
  'paddingY',
  'paddingTop',
  'paddingBottom',
]);

const FOOTER_STYLE: ViewStyle = {
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 2,
};
