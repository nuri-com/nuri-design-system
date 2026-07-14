/* ══════════════════════════════════════════════════════════════════
 * NURI · PRIMITIVES · NuriIcon (the DS owns RN glyph rendering)
 * ──────────────────────────────────────────────────────────────────
 * The RN twin of web's `<nuri-icon name>`: resolve a TYPED `IconName` →
 * the frozen registry markup (`icons[name]` · rn/generated/data/icons.ts · one
 * drawing per glyph · decision 38 · N+51) → render the SVG through
 * react-native-svg's `SvgXml` (one registry, two readers · decision 48).
 *
 * THIS is the shift the icon-contract makes: glyph rendering is the DS's,
 * not the consumer's. Before, the factory was glyph-AGNOSTIC — it cloned a
 * consumer-passed element and injected `{ color, dimension }`. Now the icon
 * part resolves the NAME and renders here, so a non-existent glyph is a TS
 * build error (`icon: IconName` · the typed register key) and the consumer
 * never touches react-native-svg.
 *
 * `color`  → the scope foreground (the currentColor channel · §12 · the
 *            factory threads the resolved surface fg in).
 * `dimension` → the icon part's resolved box width on the SHARED size axis
 *            (N+51), threaded from the factory; standalone it defaults to the
 *            icon "md" (the `sm` size leaf · the naming OFFSET).
 * viewBox `0 0 32 32` · `fill="currentColor"` — mirrors the web element.
 * ══════════════════════════════════════════════════════════════════ */

import * as React from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import {
  icons,
  iconMotion,
  iconMotionDurationMs,
  size,
} from '../contract';
import type { IconName } from '../contract';
import { useNuriTheme } from '../theme';

export type NuriIconProps = {
  // The TYPED register key — `keyof` the frozen register (the build-error gate).
  name: IconName;
  // The currentColor channel — the scope foreground (the factory injects it).
  color?: string;
  // The glyph px size — the icon part's resolved box width (the SHARED axis).
  dimension?: number;
};

type MotionIconProps = {
  xml: string;
  dimension: number;
  color: string;
};

const MotionIcon: React.FC<MotionIconProps> = ({ xml, dimension, color }) => {
  const rotation = React.useRef(new Animated.Value(0)).current;
  const [reduceMotion, setReduceMotion] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted) setReduceMotion(enabled);
      })
      .catch(() => {
        if (mounted) setReduceMotion(false);
      });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  React.useEffect(() => {
    if (reduceMotion !== false) {
      rotation.stopAnimation();
      rotation.setValue(0);
      return undefined;
    }
    rotation.setValue(0);
    const animation = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: iconMotionDurationMs.spin,
        easing: Easing.linear,
        // react-native-web reports no native animated module. Passing `true`
        // there makes Animated.loop take its native-loop branch before the
        // timing animation falls back, so it completes only one revolution.
        // Native keeps the required off-thread driver; Expo web uses the JS
        // driver so the same infinite-loop contract remains inspectable.
        useNativeDriver: Platform.OS !== 'web',
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [reduceMotion, rotation]);

  const glyph = <SvgXml xml={xml} width={dimension} height={dimension} color={color} />;
  if (reduceMotion !== false) return glyph;

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  return (
    <Animated.View style={{ width: dimension, height: dimension, transform: [{ rotate }] }}>
      {glyph}
    </Animated.View>
  );
};

export const NuriIcon: React.FC<NuriIconProps> = ({ name, color, dimension = size.sm }) => {
  const theme = useNuriTheme();
  const xml = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor">${icons[name]}</svg>`;
  const resolvedColor = color ?? theme.text.primary;
  if (!iconMotion[name]) {
    return <SvgXml xml={xml} width={dimension} height={dimension} color={resolvedColor} />;
  }
  return <MotionIcon xml={xml} dimension={dimension} color={resolvedColor} />;
};
