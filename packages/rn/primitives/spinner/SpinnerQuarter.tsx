import * as React from 'react';
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { iconMotionDurationMs } from '../../contract';
import type { SpinnerGlyphProps } from './types';
import { useReducedMotion } from './useReducedMotion';

const FIT = 0.70710678;
const PHASES = [0, 1 / 3, 2 / 3] as const;

export const SpinnerQuarter: React.FC<SpinnerGlyphProps> = ({ xml, dimension, color }) => {
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
        duration: iconMotionDurationMs.quarter,
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

  return (
    <View
      testID="spinner-quarter"
      style={[
        styles.clip,
        {
          width: dimension,
          height: dimension,
          transform: [
            { translateY: dimension * -0.1 },
            { rotate: '-45deg' },
            { scale: FIT },
          ],
        },
      ]}
    >
      {PHASES.map((phase) => {
        const phasedProgress = phase === 0
          ? progress
          : Animated.modulo(Animated.add(progress, phase), 1);
        const scale = phasedProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [0.2, 1],
          easing: Easing.bezier(0.35, 0.2, 0.65, 0.8),
        });
        const rise = phasedProgress.interpolate({
          inputRange: [0, 0.15],
          outputRange: [0, 1],
          easing: Easing.bezier(0.2, 0.65, 0.35, 1),
          extrapolateRight: 'clamp',
        });
        const fade = phasedProgress.interpolate({
          inputRange: [0.15, 1],
          outputRange: [1, 0],
          easing: Easing.bezier(0.55, 0, 0.75, 0.45),
          extrapolateLeft: 'clamp',
        });
        return (
          <Animated.View
            key={phase}
            style={[
              styles.arc,
              {
                width: dimension * 2,
                height: dimension * 2,
                left: -dimension,
                borderColor: color,
                opacity: Animated.multiply(rise, fade),
                transform: [{ scale }],
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  clip: {
    overflow: 'hidden',
  },
  arc: {
    position: 'absolute',
    top: 0,
    boxSizing: 'border-box',
    borderWidth: 2.1213,
    borderRadius: 999,
  },
});
