import * as React from 'react';
import { Animated, Easing } from 'react-native';
import { Circle, Svg, SvgXml } from 'react-native-svg';

import { iconMotionDurationMs } from '../../contract';
import type { SpinnerGlyphProps } from './types';
import { useReducedMotion } from './useReducedMotion';

const PHASES = [0, 0.5] as const;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const SpinnerRipple: React.FC<SpinnerGlyphProps> = ({ xml, dimension, color }) => {
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
        duration: iconMotionDurationMs.ripple,
        easing: Easing.bezier(0.2, 0.65, 0.35, 1),
        useNativeDriver: false,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [progress, reduceMotion]);

  if (reduceMotion !== false) {
    return <SvgXml xml={xml} width={dimension} height={dimension} color={color} />;
  }

  const ringSize = dimension * 0.78;
  return (
    <Svg testID="spinner-ripple" width={dimension} height={dimension}>
      {PHASES.map((phase, index) => {
        const phasedProgress = phase === 0
          ? progress
          : Animated.modulo(Animated.add(progress, phase), 1);
        const radius = phasedProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [ringSize * 0.1, ringSize * 0.5],
        });
        const opacity = phasedProgress.interpolate({
          inputRange: [0, 0.15, 1],
          outputRange: [0, 1, 0],
        });
        return (
          <AnimatedCircle
            key={phase}
            testID={`spinner-ripple-ring-${index}`}
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={1.5}
            opacity={opacity}
          />
        );
      })}
    </Svg>
  );
};
