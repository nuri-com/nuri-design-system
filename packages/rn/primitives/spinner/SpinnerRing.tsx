import * as React from 'react';
import { Animated, Easing, Platform, StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { iconMotionDurationMs } from '../../contract';
import type { SpinnerGlyphProps } from './types';
import { useReducedMotion } from './useReducedMotion';

const STAGGER_MS = 90;
const OPACITIES = [0.25, 0.5, 0.75, 1] as const;
const EASE = Easing.bezier(0.4, 0.08, 0.2, 0.84);
const KEYFRAME_STEPS = 96;

/* CSS applies the easing independently after each negative animation-delay:
 * angle(index, time) = ease((time + phase(index)) % 1). A single eased RN
 * value plus a fixed angle cannot reproduce that — every arc decelerates at
 * once and the tail visually collapses. Sample the same phase-shifted curves
 * onto one LINEAR native clock instead. Adding a full turn after the wrap
 * keeps every output range continuous while remaining visually equivalent. */
const ROTATION_KEYFRAMES = OPACITIES.map((_, index) => {
  const phase = (STAGGER_MS * index) / iconMotionDurationMs.ring;
  const wrap = 1 - phase;
  const inputRange = Array.from({ length: KEYFRAME_STEPS + 1 }, (_value, step) => step / KEYFRAME_STEPS);

  if (wrap > 0 && wrap < 1 && !inputRange.includes(wrap)) {
    inputRange.push(wrap);
    inputRange.sort((left, right) => left - right);
  }

  const outputRange = inputRange.map((time) => {
    const shifted = time + phase;
    const turn = shifted >= 1 ? 1 : 0;
    const localProgress = shifted - turn;
    return `${(turn + EASE(localProgress)) * 360}deg`;
  });

  return { inputRange, outputRange };
});

export const SpinnerRing: React.FC<SpinnerGlyphProps> = ({ xml, dimension, color }) => {
  const progress = React.useRef(new Animated.Value(0)).current;
  const reduceMotion = useReducedMotion();

  React.useEffect(() => {
    if (reduceMotion !== false) {
      progress.stopAnimation();
      progress.setValue(0);
      return undefined;
    }
    const animation = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: iconMotionDurationMs.ring,
        easing: Easing.linear,
        useNativeDriver: Platform.OS !== 'web',
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [progress, reduceMotion]);

  if (reduceMotion !== false) {
    return <SvgXml xml={xml} width={dimension} height={dimension} color={color} />;
  }

  const inset = dimension * 0.08;
  const arcSize = dimension - inset * 2;
  return (
    <Animated.View testID="spinner-ring" style={{ width: dimension, height: dimension }}>
      {OPACITIES.map((opacity, index) => {
        const rotate = progress.interpolate(ROTATION_KEYFRAMES[index]);
        return (
          <Animated.View
            key={opacity}
            style={[
              styles.arc,
              {
                width: arcSize,
                height: arcSize,
                inset,
                opacity,
                borderTopColor: color,
                transform: [{ rotate }],
              },
            ]}
          />
        );
      })}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  arc: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: 'transparent',
    borderRadius: 999,
  },
});
