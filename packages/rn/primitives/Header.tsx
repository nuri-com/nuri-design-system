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
  safeAreaChrome?: PaletteNS['chrome'];
  children?: React.ReactNode;
  testID?: string;
  onLayout?: (event: LayoutChangeEvent) => void;
  ref?: React.Ref<React.ElementRef<typeof RNView>>;
};

const HeaderImpl = React.forwardRef<React.ElementRef<typeof RNView>, HeaderProps>(({
  safeAreaTop = false,
  safeAreaChrome,
  children,
  testID,
  onLayout,
  ...props
}, ref) => {
  const { safeAreaTop: hostSafeAreaTop } = useFixedRegionLayout();
  const { node } = useResolvedNode(props);
  const { node: safeAreaNode } = useResolvedNode({ chrome: safeAreaChrome });
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
    <RNView ref={ref} testID={testID} onLayout={onLayout} style={[HEADER_STYLE, node.view, composedPaddingTop]}>
      {effectiveSafeAreaTop > 0 && safeAreaChrome !== undefined ? (
        <RNView
          pointerEvents="none"
          style={[SAFE_AREA_CHROME_STYLE, safeAreaNode.view, { height: effectiveSafeAreaTop }]}
        />
      ) : null}
      {withSurface(node.fg, children)}
    </RNView>
  );
});
HeaderImpl.displayName = 'Header';

export const Header = withKeys(HeaderImpl, [
  'safeAreaTop',
  'safeAreaChrome',
  ...FIXED_REGION_STYLE_KEYS,
]);

const HEADER_STYLE: ViewStyle = {
  flexShrink: 0,
  alignSelf: 'stretch',
};

const SAFE_AREA_CHROME_STYLE: ViewStyle = {
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
};
