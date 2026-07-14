import * as React from 'react';
import { Animated, Easing, Platform, StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { iconMotionDurationMs } from '../../contract';
import type { SpinnerGlyphProps } from './types';
import { useReducedMotion } from './useReducedMotion';

const STAGGER_MS = 90;
const OPACITIES = [1, 0.75, 0.5, 0.25] as const;

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
        easing: Easing.bezier(0.4, 0, 0.2, 1),
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
        const phase = (STAGGER_MS * index) / iconMotionDurationMs.ring;
        const rotate = progress.interpolate({
          inputRange: [0, 1],
          outputRange: [`${phase * 360}deg`, `${(phase + 1) * 360}deg`],
        });
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
