// ════════════════════════════════════════════════════════════════
// BottomSheet family — public Nuri API over the hidden core-RN engine.
// No gestures by design (nuri-expo removed swipe-dismiss): scrim tap is
// the only built-in dismissal, so Animated/Pressable/ScrollView suffice —
// zero native deps beyond react-native itself.
// ════════════════════════════════════════════════════════════════
import * as React from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  Pressable as RNPressable,
  ScrollView as RNScrollView,
  StyleSheet,
  UIManager,
  View as RNView,
  useWindowDimensions,
} from 'react-native';
import type { LayoutChangeEvent, ViewStyle } from 'react-native';
import { blackAlpha } from '@nuri/spec/colours';
import { bottomSheetChrome } from '@nuri/spec/bottom-sheet-chrome';
import { bottomSheetPanelDescriptor } from '@nuri/spec/descriptors/bottom-sheet-panel';

import { useNuriTheme } from '../theme';
import { recipes } from '../generated/data/recipes';
import { BottomSheetPanel as GeneratedBottomSheetPanel } from '../generated/components/bottom-sheet-panel';

// LayoutAnimation is a no-op on old-arch Android unless enabled.
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export type BottomSheetDetent = 'content' | 'large' | 'full';
export type BottomSheetScrim = 'none' | 'dim';

export type BottomSheetProps = {
  open?: boolean;
  detent?: BottomSheetDetent;
  scrim?: BottomSheetScrim;
  dismissible?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
};

export type BottomSheetPanelProps = {
  children?: React.ReactNode;
};

export type BottomSheetScrollProps = {
  children?: React.ReactNode;
};

const DETENT_FRACTION: Record<Exclude<BottomSheetDetent, 'content'>, number> = {
  large: 0.8,
  full: 0.96,
};
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

// Fixed detents size the ENGINE frame, so the panel must fill it (the RN
// mirror of the web recipe's `[detent="large"] > panel` block-size rules);
// the panel learns the active detent through this engine-private context.
const DetentContext = React.createContext<BottomSheetDetent>('content');

// The descriptor panel's authored chrome (radius · elevation · stack), read
// from the generated recipe so the fixed-detent fill wrapper stays
// recipe-exact with zero hand-mirrored values.
const PANEL_CHROME = recipes['bottom-sheet-panel'].root.geometry.base as ViewStyle;
// Its authored surface role likewise comes from the descriptor's palette —
// the fill's bg can never drift from what the panel itself paints.
const PANEL_SURFACE = bottomSheetPanelDescriptor.structure.base?.root?.palette?.chrome;

export const BottomSheet: React.FC<BottomSheetProps> = ({
  open = false,
  detent = 'content',
  scrim = 'dim',
  dismissible = true,
  onOpenChange,
  children,
}) => {
  const { height: windowHeight } = useWindowDimensions();
  const progress = React.useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = React.useState(open);
  // Measured sheet height doubles as the "ready to animate in" latch: the
  // enter slide waits for first layout so the travel distance is exact.
  const [sheetHeight, setSheetHeight] = React.useState<number | null>(null);
  const measuredHeight = React.useRef<number | null>(null);
  const openNotified = React.useRef(false);
  // Latest-callback ref: keeps onOpenChange out of the animation effects'
  // deps so a parent's inline lambda can't restart a running animation.
  const onOpenChangeRef = React.useRef(onOpenChange);
  onOpenChangeRef.current = onOpenChange;

  React.useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    openNotified.current = false;
    if (!mounted) return;
    Animated.timing(progress, { ...EXIT_TIMING, toValue: 0 }).start(({ finished }) => {
      if (!finished) return;
      measuredHeight.current = null;
      setSheetHeight(null);
      setMounted(false);
    });
  }, [open, mounted, progress]);

  React.useEffect(() => {
    if (!open || !mounted || sheetHeight === null) return;
    Animated.timing(progress, { ...ENTER_TIMING, toValue: 1 }).start(({ finished }) => {
      if (finished && !openNotified.current) {
        openNotified.current = true;
        onOpenChangeRef.current?.(true);
      }
    });
  }, [open, mounted, sheetHeight, progress]);

  const handleSheetLayout = React.useCallback((event: LayoutChangeEvent) => {
    const next = Math.round(event.nativeEvent.layout.height);
    if (measuredHeight.current === next) return;
    // Content-driven height change while settled (v1 · buttery swaps deferred).
    if (measuredHeight.current !== null) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    measuredHeight.current = next;
    setSheetHeight(next);
  }, []);

  const translateY = React.useMemo(
    () =>
      progress.interpolate({
        inputRange: [0, 1],
        outputRange: [sheetHeight ?? windowHeight, 0],
      }),
    [progress, sheetHeight, windowHeight],
  );

  if (!mounted) return null;

  const sizeStyle: ViewStyle =
    detent === 'content'
      ? { maxHeight: Math.round(windowHeight * CONTENT_MAX_FRACTION) }
      : { height: Math.round(windowHeight * DETENT_FRACTION[detent]) };

  const scrimNode =
    scrim === 'dim' ? (
      <AnimatedPressable
        accessibilityRole={dismissible ? 'button' : undefined}
        disabled={!dismissible}
        onPress={dismissible ? () => onOpenChange?.(false) : undefined}
        style={[styles.scrim, { opacity: progress }]}
      />
    ) : null;

  return (
    <RNView pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      {scrimNode}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        pointerEvents="box-none"
        style={styles.host}
      >
        <Animated.View onLayout={handleSheetLayout} style={[sizeStyle, { transform: [{ translateY }] }]}>
          <DetentContext.Provider value={detent}>{children}</DetentContext.Provider>
        </Animated.View>
      </KeyboardAvoidingView>
    </RNView>
  );
};
BottomSheet.displayName = 'BottomSheet';

export const BottomSheetPanel: React.FC<BottomSheetPanelProps> = ({ children }) => {
  const detent = React.useContext(DetentContext);
  const theme = useNuriTheme();
  if (detent === 'content') return <GeneratedBottomSheetPanel>{children}</GeneratedBottomSheetPanel>;
  // Fill the fixed-detent frame with the panel's own chrome (recipe geometry +
  // its palette bg realized via the theme); the clip box swallows the inner
  // descriptor panel's shadow so no seam paints mid-sheet below short content.
  return (
    <RNView style={[PANEL_CHROME, styles.panelFill, { backgroundColor: PANEL_SURFACE && theme.chrome[PANEL_SURFACE].bg }]}>
      <RNView style={styles.panelClip}>
        <GeneratedBottomSheetPanel>{children}</GeneratedBottomSheetPanel>
      </RNView>
    </RNView>
  );
};
BottomSheetPanel.displayName = 'BottomSheetPanel';

export const BottomSheetScroll: React.FC<BottomSheetScrollProps> = ({ children }) => (
  <RNScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
    {children}
  </RNScrollView>
);
BottomSheetScroll.displayName = 'BottomSheetScroll';

const styles = StyleSheet.create({
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: RN_SCRIM[bottomSheetChrome.scrim.dim],
  },
  host: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  panelFill: {
    flex: 1,
  },
  panelClip: {
    overflow: 'hidden',
  },
  scrollContent: {
    flexGrow: 1,
  } satisfies ViewStyle,
});
