/* ══════════════════════════════════════════════════════════════════
 * NURI · TOAST RUNTIME · overlay tenant #2
 * ──────────────────────────────────────────────────────────────────
 * Imperative, content-agnostic, replace-not-queue. ToastProvider lives
 * INSIDE NuriSafeAreaProvider so it can read the resolved top inset, then
 * bakes that number into the node registered in OverlayProvider's outlet.
 * The outlet itself remains inset-agnostic and dependency-free.
 *
 * A show always unregisters + re-registers its single layer so the toast moves
 * to the top of the current overlay stack. Accepted v1 edge: a layer opened
 * after a live toast can eclipse it until the next show.
 * ══════════════════════════════════════════════════════════════════ */

import * as React from 'react';
import {
  Animated,
  Easing,
  PanResponder,
  StyleSheet,
  View as RNView,
} from 'react-native';

import { space } from './generated/data/tokens';
import { useOverlay } from './overlay';
import { useNuriSafeAreaInsets } from './safe-area';

export type ToastOptions = {
  /** Visible lifetime in milliseconds. `0` or `null` stays until hide/replaced. */
  duration?: number | null;
};

export type ToastApi = {
  show: (node: React.ReactNode, options?: ToastOptions) => void;
  hide: () => void;
};

export type ToastProviderProps = {
  children?: React.ReactNode;
};

const DEFAULT_DURATION = 3500;
const SWIPE_CAPTURE_DY = 6;
const SWIPE_DISMISS_DISTANCE_FRACTION = 0.45;
const SWIPE_DISMISS_VELOCITY = 0.75;
const SWIPE_RUBBER_BAND_DIVISOR = 3;
const SWIPE_FLING_DURATION = 160;
const ENTER_TIMING: Omit<Animated.TimingAnimationConfig, 'toValue'> = {
  duration: 280,
  easing: Easing.out(Easing.cubic),
  useNativeDriver: true,
};
const EXIT_TIMING: Omit<Animated.TimingAnimationConfig, 'toValue'> = {
  duration: 220,
  easing: Easing.in(Easing.cubic),
  useNativeDriver: true,
};

type ToastPhase = 'hidden' | 'entering' | 'visible' | 'exiting';

let warnedNoProvider = false;
function warnNoProvider(): void {
  if (warnedNoProvider) return;
  warnedNoProvider = true;
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.warn(
      '[nuri] useToast() was used without a <ToastProvider>. ' +
        'Mount <ToastProvider> inside <NuriSafeAreaProvider>, or use <NuriRoot>.',
    );
  }
}

const ToastContext = React.createContext<ToastApi>({
  show: warnNoProvider,
  hide: warnNoProvider,
});

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const overlay = useOverlay();
  const safeAreaInsets = useNuriSafeAreaInsets();
  const layerId = React.useId();
  const progress = React.useRef(new Animated.Value(0)).current;
  const dragY = React.useRef(new Animated.Value(0)).current;
  const phaseRef = React.useRef<ToastPhase>('hidden');
  const contentRef = React.useRef<React.ReactNode>(null);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const durationRef = React.useRef<number | null>(null);
  const surfaceHeightRef = React.useRef(0);
  const animationGenerationRef = React.useRef(0);
  const hideRef = React.useRef<() => void>(() => undefined);

  const clearTimer = React.useCallback(() => {
    if (timerRef.current === null) return;
    clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  const restartTimer = React.useCallback(() => {
    clearTimer();
    const duration = durationRef.current;
    if (
      typeof duration !== 'number'
      || duration <= 0
      || phaseRef.current === 'hidden'
      || phaseRef.current === 'exiting'
    ) return;
    timerRef.current = setTimeout(() => hideRef.current(), duration);
  }, [clearTimer]);

  const returnDragToRest = React.useCallback(() => {
    Animated.spring(dragY, {
      toValue: 0,
      useNativeDriver: false,
    }).start();
    restartTimer();
  }, [dragY, restartTimer]);

  const panResponder = React.useMemo(
    () => PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_event, gestureState) => (
        Math.abs(gestureState.dy) >= SWIPE_CAPTURE_DY
        && Math.abs(gestureState.dy) > Math.abs(gestureState.dx)
      ),
      onPanResponderGrant: () => {
        clearTimer();
        dragY.stopAnimation();
      },
      onPanResponderMove: (_event, gestureState) => {
        dragY.setValue(
          gestureState.dy < 0
            ? gestureState.dy
            : gestureState.dy / SWIPE_RUBBER_BAND_DIVISOR,
        );
      },
      onPanResponderRelease: (_event, gestureState) => {
        const dismissDistance = Math.max(
          SWIPE_CAPTURE_DY,
          surfaceHeightRef.current * SWIPE_DISMISS_DISTANCE_FRACTION,
        );
        const shouldDismiss = gestureState.dy <= -dismissDistance
          || gestureState.vy <= -SWIPE_DISMISS_VELOCITY;

        if (!shouldDismiss) {
          returnDragToRest();
          return;
        }

        const generation = animationGenerationRef.current;
        const offscreenY = -(
          safeAreaInsets.top
          + Math.max(surfaceHeightRef.current, space['2xl'])
        );
        Animated.timing(dragY, {
          duration: SWIPE_FLING_DURATION,
          easing: Easing.out(Easing.cubic),
          toValue: offscreenY,
          useNativeDriver: false,
        }).start(({ finished }) => {
          if (!finished || generation !== animationGenerationRef.current) return;
          hideRef.current();
        });
      },
      onPanResponderTerminate: returnDragToRest,
    }),
    [clearTimer, dragY, returnDragToRest, safeAreaInsets.top],
  );

  const renderToastNode = React.useCallback(
    (node: React.ReactNode): React.ReactNode => {
      const translateY = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [-(safeAreaInsets.top + space['2xl']), 0],
      });
      return (
        <RNView
          pointerEvents="box-none"
          style={[styles.layer, { paddingTop: safeAreaInsets.top + space.lg }]}
        >
          <Animated.View
            pointerEvents="auto"
            style={[styles.surface, { opacity: progress, transform: [{ translateY }] }]}
          >
            <Animated.View
              {...panResponder.panHandlers}
              onLayout={(event) => {
                surfaceHeightRef.current = event.nativeEvent.layout.height;
              }}
              style={{ transform: [{ translateY: dragY }] }}
            >
              {node}
            </Animated.View>
          </Animated.View>
        </RNView>
      );
    },
    [dragY, panResponder.panHandlers, progress, safeAreaInsets.top],
  );

  const hide = React.useCallback(() => {
    clearTimer();
    if (phaseRef.current === 'hidden' || phaseRef.current === 'exiting') return;

    phaseRef.current = 'exiting';
    const generation = ++animationGenerationRef.current;
    progress.stopAnimation();
    Animated.timing(progress, { ...EXIT_TIMING, toValue: 0 }).start(({ finished }) => {
      if (!finished || generation !== animationGenerationRef.current) return;
      phaseRef.current = 'hidden';
      contentRef.current = null;
      overlay.unregister(layerId);
    });
  }, [clearTimer, layerId, overlay, progress]);
  hideRef.current = hide;

  const show = React.useCallback<ToastApi['show']>(
    (node, options) => {
      clearTimer();
      const wasHidden = phaseRef.current === 'hidden';
      const generation = ++animationGenerationRef.current;
      progress.stopAnimation();
      dragY.stopAnimation();
      dragY.setValue(0);
      if (wasHidden) progress.setValue(0);

      contentRef.current = node;
      phaseRef.current = 'entering';

      // Replace-not-queue, and deliberately move the tenant back to the top.
      overlay.unregister(layerId);
      overlay.register(layerId, renderToastNode(node), {
        blocking: false,
        dismissible: false,
      });

      Animated.timing(progress, { ...ENTER_TIMING, toValue: 1 }).start(({ finished }) => {
        if (finished && generation === animationGenerationRef.current) {
          phaseRef.current = 'visible';
        }
      });

      const duration = options?.duration === null
        ? null
        : (options?.duration ?? DEFAULT_DURATION);
      durationRef.current = duration;
      restartTimer();
    },
    [clearTimer, dragY, layerId, overlay, progress, renderToastNode, restartTimer],
  );

  // Insets are normally stable. If the host updates them while a toast is
  // live (rotation/window change), refresh the baked node in place without
  // disturbing its stack slot.
  React.useLayoutEffect(() => {
    if (phaseRef.current === 'hidden' || contentRef.current === null) return;
    overlay.update(layerId, renderToastNode(contentRef.current));
  }, [layerId, overlay, renderToastNode]);

  React.useEffect(
    () => () => {
      ++animationGenerationRef.current;
      clearTimer();
      progress.stopAnimation();
      dragY.stopAnimation();
      overlay.unregister(layerId);
    },
    [clearTimer, dragY, layerId, overlay, progress],
  );

  const api = React.useMemo<ToastApi>(() => ({ show, hide }), [show, hide]);
  return <ToastContext.Provider value={api}>{children}</ToastContext.Provider>;
};
ToastProvider.displayName = 'ToastProvider';

export function useToast(): ToastApi {
  return React.useContext(ToastContext);
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: space.lg,
  },
  surface: {
    alignSelf: 'center',
    maxWidth: '100%',
  },
});
