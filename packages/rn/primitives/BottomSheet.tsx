// ════════════════════════════════════════════════════════════════
// BottomSheet family — public Nuri API, a REGISTRAR into the overlay layer.
// No gestures by design (nuri-expo removed swipe-dismiss): scrim tap is
// the only built-in dismissal, so Animated/Pressable/ScrollView suffice —
// zero native deps beyond react-native itself.
//
// <BottomSheet open> stays the authored, DECLARATIVE API, but instead of
// drawing its absoluteFill overlay inline it REGISTERS that subtree into the
// OverlayProvider (the LayerHost <Layer> pattern) and returns null. The
// provider's outlet renders it full-window, ABOVE the consumer's safe-area
// padding — so the scrim covers the status bar and overlays can stack. The
// enter/exit slide + the sheet-height measurement latch are unchanged; only
// WHERE the subtree renders moved (inline → the provider outlet).
// ════════════════════════════════════════════════════════════════
import * as React from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable as RNPressable,
  StyleSheet,
  View as RNView,
  useWindowDimensions,
} from 'react-native';
import type {
  LayoutChangeEvent,
  ViewStyle,
} from 'react-native';
import { blackAlpha } from '@nuri/spec/colours';
import { bottomSheetChrome } from '@nuri/spec/bottom-sheet-chrome';

import { space } from '../generated/data/tokens';
import { usePresentedLayer } from '../presented-layer';
import { useNuriSafeAreaInsets } from '../safe-area';
import { BottomSheetPanel as GeneratedBottomSheetPanel } from '../generated/components/bottom-sheet-panel';
import { FixedRegionLayoutProvider } from './FixedRegionLayout';

export type BottomSheetDetent = 'content' | 'full';
export type BottomSheetScrim = 'none' | 'dim';

export type BottomSheetProps = {
  open?: boolean;
  detent?: BottomSheetDetent;
  scrim?: BottomSheetScrim;
  dismissible?: boolean;
  onOpenChange?: (open: boolean) => void;
  onOpenComplete?: () => void;
  children?: React.ReactNode;
};

export type BottomSheetPanelProps = {
  children?: React.ReactNode;
};

// The full detent's gap between the safe-area top and the panel's top edge.
const FULL_TOP_GAP = space.sm;
const CONTENT_MAX_FRACTION = 0.82;

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

const RN_SCRIM = {
  transparent: 'transparent',
  'blackAlpha.7': blackAlpha[7].value,
} as const;

const AnimatedPressable = Animated.createAnimatedComponent(RNPressable);

export const BottomSheet: React.FC<BottomSheetProps> = ({
  open = false,
  detent = 'content',
  scrim = 'dim',
  dismissible = true,
  onOpenChange,
  onOpenComplete,
  children,
}) => {
  const safeAreaInsets = useNuriSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  // Measured sheet height doubles as the "ready to animate in" latch: the
  // enter slide waits for first layout so the travel distance is exact.
  const [sheetHeight, setSheetHeight] = React.useState<number | null>(null);
  const measuredHeight = React.useRef<number | null>(null);

  const handleSheetLayout = React.useCallback((event: LayoutChangeEvent) => {
    const next = Math.round(event.nativeEvent.layout.height);
    if (measuredHeight.current === next) return;
    // Latch the measured height for the enter-slide travel distance. Content-swap /
    // morph animation (content ↔ full) lands with D2 — see docs/bottom-sheet-improvements.md.
    measuredHeight.current = next;
    setSheetHeight(next);
  }, []);

  // `content` hugs its content, bottom-anchored (maxHeight cap). `full` keeps a
  // safe-area-relative top offset (safe top + sm gap): anchoring on the inset —
  // like the toast does — keeps the panel edge clear of the status bar on every
  // device and the toast↔sheet relationship stable. Still FILL-and-SHRINK: a
  // fixed height panel cannot fit once the keyboard shrinks the window (Android
  // adjustResize), so `justify: flex-end` would shove it off the top. flexGrow
  // fills the available host and shrinks with the resized window when the
  // keyboard opens — the ScrollView then scrolls the field into view.
  const fullMaxHeight = Math.max(
    0,
    Math.round(windowHeight - (safeAreaInsets.top + FULL_TOP_GAP)),
  );
  const sizeStyle: ViewStyle =
    detent === 'content'
      ? { maxHeight: Math.round(windowHeight * CONTENT_MAX_FRACTION) }
      : { flexGrow: 1, maxHeight: fullMaxHeight };
  // The scroll region's cap = the sheet's max height (padding lives inside the
  // scroll's content container, so panel ≈ scroll). Bounds the ScrollView so its
  // overflow scrolls; shrinks with the keyboard-resized window. Guard a
  // degenerate windowHeight (0 during init) so the cap never collapses the
  // scroll to nothing — no cap until a real height is known.
  const scrollMaxHeight =
    windowHeight > 0 ? (detent === 'content' ? Math.round(windowHeight * CONTENT_MAX_FRACTION) : fullMaxHeight) : undefined;
  usePresentedLayer({
    open,
    ready: sheetHeight !== null,
    dismissible,
    onRequestClose: dismissible ? () => onOpenChange?.(false) : undefined,
    onEnterComplete: () => {
      onOpenChange?.(true);
      onOpenComplete?.();
    },
    onExitComplete: () => {
      measuredHeight.current = null;
      setSheetHeight(null);
    },
    enterTiming: ENTER_TIMING,
    exitTiming: EXIT_TIMING,
    // The overlay subtree — identical to the old inline return (scrim +
    // KeyboardAvoidingView + the measured, translateY-slid Animated.View). It is
    // rebuilt each render and re-registered so the outlet shows the current node;
    // the progress Animated.Value is a stable ref, so the enter/exit slide runs
    // native-driven on the already-mounted node without a re-render.
    renderLayer: ({ progress, requestClose }) => {
      const translateY = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [sheetHeight ?? windowHeight, 0],
      });
      return (
        <RNView pointerEvents="box-none" style={StyleSheet.absoluteFill}>
          {scrim === 'dim' ? (
            <AnimatedPressable
              accessibilityRole={dismissible ? 'button' : undefined}
              disabled={!dismissible}
              onPress={dismissible ? requestClose : undefined}
              style={[styles.scrim, { opacity: progress }]}
            />
          ) : null}
          <KeyboardAvoidingView
            // Only PUSH the small bottom-anchored `content` sheet (iOS padding). A
            // `full` sheet already fills the screen — pushing it (height/padding)
            // double-counts against Android adjustResize and shoves it off the top;
            // it makes room by shrinking (sizeStyle flexGrow) + the ScrollView.
            behavior={detent === 'content' && Platform.OS === 'ios' ? 'padding' : undefined}
            pointerEvents="box-none"
            style={styles.host}
          >
            <Animated.View
              onLayout={handleSheetLayout}
              style={[sizeStyle, { transform: [{ translateY }] }]}
            >
              <FixedRegionLayoutProvider
                keyboardEnabled={detent === 'full'}
                safeAreaBottom={safeAreaInsets.bottom}
                scrollMaxHeight={scrollMaxHeight}
                windowHeight={windowHeight}
              >
                {children}
              </FixedRegionLayoutProvider>
            </Animated.View>
          </KeyboardAvoidingView>
        </RNView>
      );
    },
  });

  return null;
};
BottomSheet.displayName = 'BottomSheet';

export const BottomSheetPanel: React.FC<BottomSheetPanelProps> = ({ children }) => (
  <GeneratedBottomSheetPanel>{children}</GeneratedBottomSheetPanel>
);
BottomSheetPanel.displayName = 'BottomSheetPanel';

const styles = StyleSheet.create({
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: RN_SCRIM[bottomSheetChrome.scrim.dim],
  },
  host: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
});
