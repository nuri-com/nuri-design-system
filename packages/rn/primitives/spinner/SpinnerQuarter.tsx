import * as React from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { Circle, Svg, SvgXml } from 'react-native-svg';

import { iconMotionDurationMs } from '../../contract';
import type { SpinnerGlyphProps } from './types';
import { useReducedMotion } from './useReducedMotion';

const FIT = 0.70710678;
const PHASES = [0, 1 / 3, 2 / 3] as const;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

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
        useNativeDriver: false,
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
      <Svg width={dimension} height={dimension}>
        {PHASES.map((phase, index) => {
          const phasedProgress = phase === 0
            ? progress
            : Animated.modulo(Animated.add(progress, phase), 1);
          const radius = phasedProgress.interpolate({
            inputRange: [0, 1],
            outputRange: [dimension * 0.2, dimension],
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
            <AnimatedCircle
              key={phase}
              testID={`spinner-quarter-ring-${index}`}
              cx={0}
              cy={dimension}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={2.1213}
              opacity={Animated.multiply(rise, fade)}
            />
          );
        })}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  clip: {
    overflow: 'hidden',
  },
});
