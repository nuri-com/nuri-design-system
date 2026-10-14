// ════════════════════════════════════════════════════════════════
// Image — the free-standing bitmap leaf (box only) · RN <Image>
// ────────────────────────────────────────────────────────────────
// The RN twin of web <nuri-image> (image.js) and the OPEN sibling of the
// renderer's `el:'image'` leaf (the icon-avatar `source` bridge): the same
// box-namespace geometry through the SAME runtime/resolve.ts appliers, the
// same always-on blend ring (border-translucent · the element contract, not a
// palette cell), the same `cover` crop by default. NO stack (an image has no
// children), NO palette (a bitmap has no colour), NO interactive (a pressable
// image is <Pressable><Image/></Pressable>).
//
// SIZING TRUTH (documented on the doc page): an Image's layout NEVER follows
// its asset's pixel size. RN applies a bundled static resource's intrinsic
// dimensions as the Image's DEFAULT width/height (native: `[{width, height},
// base, style]` from the resolved source · react-native-web: the asset
// registry's size as an inline style) — which would pin a 240×320 asset at
// 240×320 and defeat both the row's stretch and `aspectRatio`. This primitive
// neutralises that default (`width: 'auto'` · `height: 'auto'` AHEAD of the
// resolved box, so an authored width/height still wins): a usable image
// declares `aspectRatio` + one dimension, OR is stretched by its row
// (`align="stretch"`) with `aspectRatio` so Yoga computes the other axis — the
// media-card photo column (`<Image aspectRatio="portrait" />` beside a growing
// text column inside a `clip aspectRatio="banner"` row). Proven on RN-web by
// probe (2026-10-14): the host measured 240×320 before, 329×494 after.
//
// ACCESSIBLE NAME (the decision-21 mirror · `accessibility-label` on web):
// absent ⇒ DECORATIVE on both targets (`accessible={false}` here · `alt=""` +
// `aria-hidden` on web — the IconAvatar precedent); present ⇒ an announced
// image carrying the label.
// ════════════════════════════════════════════════════════════════
import * as React from 'react';
import { Image as RNImage } from 'react-native';
import type { ImageSourcePropType, ImageStyle, LayoutChangeEvent, StyleProp } from 'react-native';
import type { BoxNS } from '../contract';
import { border } from '../contract';
import { BleedHitTransparencyContext } from './Bleed';
import { BOX_KEYS, useResolvedNode, withKeys } from './shared';

export type ImageFit = 'cover' | 'contain';

export type ImageProps = BoxNS & {
  source: ImageSourcePropType;
  fit?: ImageFit;
  accessibilityLabel?: string;
  testID?: string;
  onLayout?: (event: LayoutChangeEvent) => void;
  ref?: React.Ref<React.ElementRef<typeof RNImage>>;
};

const ImageImpl = React.forwardRef<React.ElementRef<typeof RNImage>, ImageProps>((props, ref) => {
  const { source, fit = 'cover', accessibilityLabel, testID, onLayout, ...nsProps } = props;
  const { node, theme } = useResolvedNode(nsProps);
  // Static bitmap leaves are touch-transparent inside a Bleed band — the same
  // rule the renderer's image leaf follows (#212 addendum · internal, no API).
  const inBleedBand = React.useContext(BleedHitTransparencyContext);
  const decorative = accessibilityLabel === undefined;
  return (
    <RNImage
      ref={ref}
      source={source}
      resizeMode={fit}
      accessible={!decorative}
      {...(decorative ? null : { accessibilityRole: 'image' as const, accessibilityLabel })}
      testID={testID}
      onLayout={onLayout}
      style={[
        // The asset's intrinsic size is NOT a layout input (see the header):
        // reset RN's static-resource default before the resolved box lands.
        { width: 'auto', height: 'auto' } as ImageStyle,
        node.view as StyleProp<ImageStyle>,
        // The always-on blend ring — the image LEAF's own contract (mirrors the
        // renderer's `el:'image'` case and the web `.nuri-image` rule).
        { borderWidth: border[1], borderColor: theme.border.translucent },
        ...(inBleedBand ? [{ pointerEvents: 'none' } as ImageStyle] : []),
      ]}
    />
  );
});
ImageImpl.displayName = 'Image';
export const Image = withKeys(ImageImpl, BOX_KEYS);
