import * as React from 'react';
import { Animated, Easing, Platform, StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { iconMotionDurationMs } from '../../contract';
import type { SpinnerGlyphProps } from './types';
import { useReducedMotion } from './useReducedMotion';

const PHASES = [0, 0.5] as const;

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
        useNativeDriver: Platform.OS !== 'web',
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [progress, reduceMotion]);

  if (reduceMotion !== false) {
    return <SvgXml xml={xml} width={dimension} height={dimension} color={color} />;
  }

  const ringSize = dimension * 0.78;
  const ringInset = (dimension - ringSize) / 2;
  return (
    <Animated.View testID="spinner-ripple" style={{ width: dimension, height: dimension }}>
      {PHASES.map((phase) => {
        const phasedProgress = phase === 0
          ? progress
          : Animated.modulo(Animated.add(progress, phase), 1);
        const scale = phasedProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [0.2, 1],
        });
        const opacity = phasedProgress.interpolate({
          inputRange: [0, 0.15, 1],
          outputRange: [0, 1, 0],
        });
        return (
          <Animated.View
            key={phase}
            style={[
              styles.ring,
              {
                width: ringSize,
                height: ringSize,
                top: ringInset,
                left: ringInset,
                borderColor: color,
                opacity,
                transform: [{ scale }],
              },
            ]}
          />
        );
      })}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  ring: {
    position: 'absolute',
    boxSizing: 'border-box',
    borderWidth: 1.5,
    borderRadius: 999,
  },
});
