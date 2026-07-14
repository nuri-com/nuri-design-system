import * as React from 'react';
import { Animated, Easing, Platform, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { SvgXml } from 'react-native-svg';

import { iconMotionDurationMs } from '../../contract';
import type { SpinnerGlyphProps } from './types';
import { useReducedMotion } from './useReducedMotion';

type CoinLightProps = SpinnerGlyphProps & {
  gradientId: string;
  mirrored?: boolean;
  opacity: Animated.AnimatedInterpolation<number>;
};

const CoinLight: React.FC<CoinLightProps> = ({
  gradientId,
  mirrored = false,
  opacity,
  dimension,
  color,
}) => {
  const discSize = dimension * 0.84;
  return (
    <Animated.View style={[styles.light, { width: dimension, height: dimension, opacity }]}>
      <Svg width={dimension} height={dimension} viewBox={`0 0 ${dimension} ${dimension}`}>
        <Defs>
          <LinearGradient
            id={gradientId}
            x1={mirrored ? '100%' : '0%'}
            y1="0%"
            x2={mirrored ? '0%' : '100%'}
            y2="0%"
          >
            <Stop offset="0%" stopColor={color} stopOpacity={1} />
            <Stop offset="50%" stopColor={color} stopOpacity={1} />
            <Stop offset="100%" stopColor={color} stopOpacity={0.2} />
          </LinearGradient>
        </Defs>
        <Circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={(discSize - 1.5) / 2}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={1.5}
        />
      </Svg>
    </Animated.View>
  );
};

export const SpinnerCoin: React.FC<SpinnerGlyphProps> = ({ xml, dimension, color }) => {
  const turnProgress = React.useRef(new Animated.Value(0)).current;
  const lightProgress = React.useRef(new Animated.Value(0)).current;
  const reduceMotion = useReducedMotion();

  React.useEffect(() => {
    if (reduceMotion !== false) {
      turnProgress.stopAnimation();
      lightProgress.stopAnimation();
      turnProgress.setValue(0);
      lightProgress.setValue(0);
      return undefined;
    }
    const nativeDriver = Platform.OS !== 'web';
    const turn = Animated.loop(
      Animated.timing(turnProgress, {
        toValue: 1,
        duration: iconMotionDurationMs.coin,
        easing: Easing.bezier(0.55, 0.05, 0.45, 0.95),
        useNativeDriver: nativeDriver,
      }),
    );
    const lights = Animated.loop(
      Animated.timing(lightProgress, {
        toValue: 1,
        duration: iconMotionDurationMs.coin,
        easing: Easing.linear,
        useNativeDriver: nativeDriver,
      }),
    );
    turn.start();
    lights.start();
    return () => {
      turn.stop();
      lights.stop();
    };
  }, [lightProgress, reduceMotion, turnProgress]);

  if (reduceMotion !== false) {
    return <SvgXml xml={xml} width={dimension} height={dimension} color={color} />;
  }

  const rotateY = turnProgress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '180deg', '360deg'],
  });
  const frontOpacity = lightProgress.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0.5, 1, 0.5, 0, 0.5],
  });
  const backOpacity = lightProgress.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0.5, 0, 0.5, 1, 0.5],
  });

  return (
    <Animated.View
      testID="spinner-coin"
      style={{
        width: dimension,
        height: dimension,
        backfaceVisibility: 'visible',
        transform: [{ perspective: dimension * 3.2 }, { rotateY }],
      }}
    >
      <CoinLight
        gradientId="nuri-coin-front"
        xml={xml}
        dimension={dimension}
        color={color}
        opacity={frontOpacity}
      />
      <CoinLight
        gradientId="nuri-coin-back"
        mirrored
        xml={xml}
        dimension={dimension}
        color={color}
        opacity={backOpacity}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  light: {
    position: 'absolute',
    inset: 0,
  },
});
