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
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable as RNPressable,
  ScrollView as RNScrollView,
  StyleSheet,
  View as RNView,
  useWindowDimensions,
} from 'react-native';
import type {
  KeyboardEvent,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  TextInput,
  ViewStyle,
} from 'react-native';
import { blackAlpha } from '@nuri/spec/colours';
import { bottomSheetChrome } from '@nuri/spec/bottom-sheet-chrome';

import { useOverlay } from '../overlay';
import { BottomSheetPanel as GeneratedBottomSheetPanel } from '../generated/components/bottom-sheet-panel';
import { Topbar as GeneratedTopbar, type TopbarProps } from '../generated/components/topbar';
import { space } from '../generated/data/tokens';
import { FocusScrollProvider, type FocusScrollApi } from '../runtime/focus-scroll';

type ScrollViewInstance = React.ElementRef<typeof RNScrollView>;
type ScrollContentRef = ReturnType<ScrollViewInstance['getNativeScrollRef']>;
type ScrollViewWithInnerRef = ScrollViewInstance & {
  getInnerViewRef?: () => ScrollContentRef;
};
type NativeMeasurable = {
  measureInWindow?: (callback: (x: number, y: number, width: number, height: number) => void) => void;
};

export type BottomSheetDetent = 'content' | 'full';
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

export type BottomSheetTopbarProps = TopbarProps;

export type BottomSheetFooterProps = {
  children?: React.ReactNode;
};

export type BottomSheetScrollProps = {
  children?: React.ReactNode;
};

const FULL_TOP_OFFSET = 40;
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
const FOCUS_TOP_MARGIN = 16;
// Keep the focused field comfortably above the keyboard/accessory strip, not
// merely one pixel visible at the viewport edge. Android keyboard metrics can
// exclude parts of the IME chrome, so this margin intentionally absorbs that
// uncertainty while giving the cursor breathing room.
const FOCUS_BOTTOM_MARGIN = 88;
const FOCUS_SCROLL_DELAY_MS = 32;
const FOCUS_SCROLL_REPEAT_DELAY_MS = 60;

// The sheet's available content height, threaded to BottomSheetScroll via
// context. The panel descriptor is `fill: grow` (flexGrow 1, flexShrink 0) with
// no main-axis `minHeight: 0` — and the axis vocabulary can't express one (the
// size scale has no zero) — so a flex chain alone can't bound the ScrollView
// for a tall (overflowing / keyboard-shrunk) full sheet: the panel refuses to
// shrink below its content and the scroll never scrolls. The primitive owns the
// sheet's height, so it hands the scroll region an explicit maxHeight instead.
// It tracks windowHeight, which SHRINKS under Android adjustResize when the
// keyboard opens — so the field scrolls into reach without pushing the panel.
type BottomSheetLayoutValue = {
  scrollMaxHeight?: number;
  topbarHeight: number;
  footerHeight: number;
  footerKeyboardOffset: number;
  setTopbarHeight: (height: number) => void;
  setFooterHeight: (height: number) => void;
};

const DEFAULT_LAYOUT_VALUE: BottomSheetLayoutValue = {
  topbarHeight: 0,
  footerHeight: 0,
  footerKeyboardOffset: 0,
  setTopbarHeight: () => undefined,
  setFooterHeight: () => undefined,
};

const BottomSheetLayoutContext = React.createContext<BottomSheetLayoutValue>(DEFAULT_LAYOUT_VALUE);

export const BottomSheet: React.FC<BottomSheetProps> = ({
  open = false,
  detent = 'content',
  scrim = 'dim',
  dismissible = true,
  onOpenChange,
  children,
}) => {
  const overlay = useOverlay();
  const layerId = React.useId();
  const { height: windowHeight } = useWindowDimensions();
  const progress = React.useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = React.useState(open);
  // Measured sheet height doubles as the "ready to animate in" latch: the
  // enter slide waits for first layout so the travel distance is exact.
  const [sheetHeight, setSheetHeight] = React.useState<number | null>(null);
  const [topbarHeight, setTopbarHeight] = React.useState(0);
  const [footerHeight, setFooterHeight] = React.useState(0);
  const [footerKeyboardOffset, setFooterKeyboardOffset] = React.useState(0);
  const measuredHeight = React.useRef<number | null>(null);
  const openNotified = React.useRef(false);
  // Latest-callback ref: keeps onOpenChange out of the animation effects'
  // deps so a parent's inline lambda can't restart a running animation.
  const onOpenChangeRef = React.useRef(onOpenChange);
  onOpenChangeRef.current = onOpenChange;
  // Stable close handler for scrim tap AND hardware-back routing (the overlay
  // layer calls it on the topmost dismissible layer). Reads the latest callback
  // via the ref so its identity never changes.
  const requestClose = React.useCallback(() => {
    onOpenChangeRef.current?.(false);
  }, []);

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

  const resolveFooterKeyboardOffset = React.useCallback((event: KeyboardEvent): number => {
    const { height, screenY } = event.endCoordinates;
    if (Platform.OS === 'android' && screenY > 0) {
      return Math.max(0, Math.round(windowHeight - screenY));
    }
    if (height > 0) return Math.round(height);
    return screenY > 0 ? Math.max(0, Math.round(windowHeight - screenY)) : 0;
  }, [windowHeight]);

  React.useEffect(() => {
    if (!mounted || detent !== 'full') {
      setFooterKeyboardOffset(0);
      return;
    }
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, (event: KeyboardEvent) => {
      setFooterKeyboardOffset(resolveFooterKeyboardOffset(event));
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setFooterKeyboardOffset(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [mounted, detent, resolveFooterKeyboardOffset]);

  const handleSheetLayout = React.useCallback((event: LayoutChangeEvent) => {
    const next = Math.round(event.nativeEvent.layout.height);
    if (measuredHeight.current === next) return;
    // Latch the measured height for the enter-slide travel distance. Content-swap /
    // morph animation (content ↔ full) lands with D2 — see docs/bottom-sheet-improvements.md.
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

  // `content` hugs its content, bottom-anchored (maxHeight cap). `full` keeps a
  // 40px top offset while still FILL-and-SHRINK: a fixed height panel cannot fit
  // once the keyboard shrinks the window (Android adjustResize), so `justify:
  // flex-end` would shove it off the top. flexGrow fills the available host and
  // shrinks with the resized window when the keyboard opens — the ScrollView
  // then scrolls the field into view.
  const fullMaxHeight = Math.max(0, Math.round(windowHeight - FULL_TOP_OFFSET));
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
  const layoutValue = React.useMemo<BottomSheetLayoutValue>(
    () => ({
      scrollMaxHeight,
      topbarHeight,
      footerHeight,
      footerKeyboardOffset,
      setTopbarHeight,
      setFooterHeight,
    }),
    [scrollMaxHeight, topbarHeight, footerHeight, footerKeyboardOffset],
  );

  // The overlay subtree — identical to the old inline return (scrim +
  // KeyboardAvoidingView + the measured, translateY-slid Animated.View). It is
  // rebuilt each render (fresh translateY on a height/detent change) and
  // re-registered so the outlet shows the current node; the progress/translateY
  // Animated values are stable refs, so the enter/exit slide runs native-driven
  // on the already-mounted node without a re-render. Only built while mounted.
  const overlayNode = mounted ? (
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
        <Animated.View onLayout={handleSheetLayout} style={[sizeStyle, { transform: [{ translateY }] }]}>
          <BottomSheetLayoutContext.Provider value={layoutValue}>
            {children}
          </BottomSheetLayoutContext.Provider>
        </Animated.View>
      </KeyboardAvoidingView>
    </RNView>
  ) : null;

  // Register the subtree into the overlay layer while mounted (the <Layer>
  // pattern): the outlet renders it full-window, above the safe-area padding.
  // TWO effects, NOT one (mirrors LayerHost.tsx) — this split is load-bearing
  // for stacking order. A single register-with-cleanup effect would, on every
  // re-render, run cleanup (unregister) then body (register), and register
  // re-APPENDS a fresh id to the TOP — so a lower sheet that re-renders (keyboard,
  // content, height, any parent re-render) would jump above an upper layer,
  // inverting the mount-order guarantee. Splitting fixes it:
  //   A · upsert the fresh node WITHOUT cleanup — register upserts in place, so
  //       a re-render refreshes the node and keeps its slot in the stack.
  React.useLayoutEffect(() => {
    if (!mounted) return;
    overlay.register(layerId, overlayNode, {
      dismissible,
      onRequestClose: dismissible ? requestClose : undefined,
    });
  }, [mounted, overlayNode, dismissible, requestClose, overlay, layerId]);
  //   B · the ONLY place the layer leaves the stack — on close (!mounted) or
  //       unmount. Never runs on a node/dismissible change, so order is stable.
  React.useLayoutEffect(() => {
    if (!mounted) overlay.unregister(layerId);
    return () => overlay.unregister(layerId);
  }, [mounted, layerId, overlay]);

  return null;
};
BottomSheet.displayName = 'BottomSheet';

export const BottomSheetPanel: React.FC<BottomSheetPanelProps> = ({ children }) => (
  <GeneratedBottomSheetPanel>{children}</GeneratedBottomSheetPanel>
);
BottomSheetPanel.displayName = 'BottomSheetPanel';

export const BottomSheetTopbar: React.FC<BottomSheetTopbarProps> = ({ children, surface = 'transparent', ...props }) => {
  const { setTopbarHeight } = React.useContext(BottomSheetLayoutContext);
  const measuredHeight = React.useRef(0);

  React.useEffect(() => () => setTopbarHeight(0), [setTopbarHeight]);

  const handleLayout = React.useCallback((event: LayoutChangeEvent) => {
    const next = Math.round(event.nativeEvent.layout.height);
    if (measuredHeight.current === next) return;
    measuredHeight.current = next;
    setTopbarHeight(next);
  }, [setTopbarHeight]);

  return (
    <RNView onLayout={handleLayout} style={styles.topbar}>
      <GeneratedTopbar {...props} surface={surface}>{children}</GeneratedTopbar>
    </RNView>
  );
};
BottomSheetTopbar.displayName = 'BottomSheetTopbar';

export const BottomSheetFooter: React.FC<BottomSheetFooterProps> = ({ children }) => {
  const { footerKeyboardOffset, setFooterHeight } = React.useContext(BottomSheetLayoutContext);
  const measuredHeight = React.useRef(0);

  React.useEffect(() => () => setFooterHeight(0), [setFooterHeight]);

  const handleLayout = React.useCallback((event: LayoutChangeEvent) => {
    const next = Math.round(event.nativeEvent.layout.height);
    if (measuredHeight.current === next) return;
    measuredHeight.current = next;
    setFooterHeight(next);
  }, [setFooterHeight]);

  return (
    <RNView onLayout={handleLayout} style={[styles.footer, footerKeyboardOffset > 0 ? { bottom: footerKeyboardOffset } : null]}>
      {children}
    </RNView>
  );
};
BottomSheetFooter.displayName = 'BottomSheetFooter';

export const BottomSheetScroll: React.FC<BottomSheetScrollProps> = ({ children }) => {
  // Bound the scroll to the sheet's available height (from the primitive via
  // context) so its overflow actually scrolls — the panel can't provide a
  // bounded height on its own (see BottomSheetLayoutContext). Outside a
  // BottomSheet the cap is absent and it scrolls its parent's bounds as before.
  const { scrollMaxHeight, topbarHeight, footerHeight, footerKeyboardOffset } = React.useContext(BottomSheetLayoutContext);
  const scrollRef = React.useRef<React.ElementRef<typeof RNScrollView>>(null);
  const scrollY = React.useRef(0);
  const viewportHeight = React.useRef(0);
  const preKeyboardViewportHeight = React.useRef(0);
  const keyboardHeight = React.useRef(0);
  const keyboardScreenY = React.useRef<number | null>(null);
  const focusedInput = React.useRef<TextInput | null>(null);
  const rafs = React.useRef<number[]>([]);
  const timers = React.useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const [keyboardPadding, setKeyboardPadding] = React.useState(0);

  const clearScheduledScrolls = React.useCallback(() => {
    for (const raf of rafs.current) cancelAnimationFrame(raf);
    for (const timer of timers.current) clearTimeout(timer);
    rafs.current = [];
    timers.current = [];
  }, []);

  const keyboardOcclusion = React.useCallback(() => {
    const measuredViewport = viewportHeight.current || scrollMaxHeight || 0;
    const beforeKeyboard = preKeyboardViewportHeight.current || measuredViewport;
    const viewportShrink = Math.max(0, beforeKeyboard - measuredViewport);
    return Math.max(0, keyboardHeight.current - viewportShrink);
  }, [scrollMaxHeight]);

  const updateKeyboardPadding = React.useCallback(() => {
    if (keyboardHeight.current <= 0) {
      setKeyboardPadding(0);
      return;
    }
    setKeyboardPadding(keyboardOcclusion() + FOCUS_BOTTOM_MARGIN);
  }, [keyboardOcclusion]);

  const performScrollToInput = React.useCallback((input: TextInput | null) => {
    const scroll = scrollRef.current;
    if (!input || !scroll) return;

    const measuredViewport = viewportHeight.current || scrollMaxHeight || 0;
    const visibleHeight = Math.max(0, measuredViewport - keyboardOcclusion());
    const currentY = scrollY.current;
    const targetTop = topbarHeight + FOCUS_TOP_MARGIN;
    const targetBottom = Math.max(targetTop, visibleHeight - FOCUS_BOTTOM_MARGIN);
    const scrollToNextY = (nextY: number): void => {
      const clampedY = Math.max(0, Math.round(nextY));
      if (Math.abs(clampedY - scrollY.current) < 1) return;
      scroll.scrollTo({ y: clampedY, animated: true });
      scrollY.current = clampedY;
    };

    const scrollNativeRef = scroll.getNativeScrollRef?.();
    const scrollWindowMeasurable = scrollNativeRef as NativeMeasurable | null | undefined;
    const inputWindowMeasurable = input as NativeMeasurable;
    if (
      visibleHeight > 0 &&
      typeof scrollWindowMeasurable?.measureInWindow === 'function' &&
      typeof inputWindowMeasurable.measureInWindow === 'function'
    ) {
      const measureScrollInWindow = scrollWindowMeasurable.measureInWindow.bind(scrollWindowMeasurable);
      const measureInputInWindow = inputWindowMeasurable.measureInWindow.bind(inputWindowMeasurable);
      measureScrollInWindow((_scrollX, scrollWindowY, _scrollWidth, scrollWindowHeight) => {
        measureInputInWindow((_inputX, inputWindowY, _inputWidth, inputHeight) => {
          const viewportWindowHeight = measuredViewport || scrollWindowHeight;
          const viewportWindowBottom = scrollWindowY + viewportWindowHeight;
          const keyboardWindowTop = keyboardScreenY.current ?? (scrollWindowY + visibleHeight);
          const safeWindowTop = scrollWindowY + targetTop;
          const safeWindowBottom = Math.max(safeWindowTop, Math.min(viewportWindowBottom, keyboardWindowTop) - FOCUS_BOTTOM_MARGIN);
          const inputWindowBottom = inputWindowY + inputHeight;

          let nextY = currentY;
          if (inputWindowBottom > safeWindowBottom) {
            nextY = currentY + inputWindowBottom - safeWindowBottom;
          } else if (inputWindowY < safeWindowTop) {
            nextY = currentY + inputWindowY - safeWindowTop;
          }
          scrollToNextY(nextY);
        });
      });
      return;
    }

    const scrollWithInnerRef = scroll as ScrollViewWithInnerRef;
    const scrollContentRef =
      typeof scrollWithInnerRef.getInnerViewRef === 'function'
        ? scrollWithInnerRef.getInnerViewRef()
        : scroll.getNativeScrollRef?.();
    if (scrollContentRef == null || typeof input.measureLayout !== 'function') return;

    input.measureLayout(
      scrollContentRef,
      (_x, y, _width, height) => {
        let nextY = currentY;
        if (visibleHeight > 0) {
          const safeTop = currentY + targetTop;
          const safeBottom = currentY + targetBottom;
          const inputTop = y;
          const inputBottom = inputTop + height;
          if (inputBottom > safeBottom) {
            nextY = inputBottom - targetBottom;
          } else if (inputTop < safeTop) {
            nextY = inputTop - targetTop;
          }
        } else {
          nextY = currentY + y - FOCUS_TOP_MARGIN;
        }

        scrollToNextY(nextY);
      },
      () => undefined,
    );
  }, [keyboardOcclusion, scrollMaxHeight, topbarHeight]);

  const scheduleScrollToInput = React.useCallback((input: TextInput | null, delay = FOCUS_SCROLL_DELAY_MS) => {
    if (!input) return;
    clearScheduledScrolls();
    focusedInput.current = input;
    const raf = requestAnimationFrame(() => {
      rafs.current = rafs.current.filter((item) => item !== raf);
      const timer = setTimeout(() => {
        timers.current = timers.current.filter((item) => item !== timer);
        performScrollToInput(input);
      }, delay);
      timers.current.push(timer);
    });
    rafs.current.push(raf);
  }, [clearScheduledScrolls, performScrollToInput]);

  React.useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, (event: KeyboardEvent) => {
      if (preKeyboardViewportHeight.current === 0) {
        preKeyboardViewportHeight.current = viewportHeight.current || scrollMaxHeight || 0;
      }
      keyboardHeight.current = event.endCoordinates.height;
      keyboardScreenY.current = event.endCoordinates.screenY > 0 ? event.endCoordinates.screenY : null;
      updateKeyboardPadding();
      // Re-run after the keyboard transition because a focus event can arrive
      // before native has delivered stable layout measurements.
      scheduleScrollToInput(focusedInput.current, FOCUS_SCROLL_REPEAT_DELAY_MS);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      preKeyboardViewportHeight.current = 0;
      keyboardHeight.current = 0;
      keyboardScreenY.current = null;
      setKeyboardPadding(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
      clearScheduledScrolls();
    };
  }, [clearScheduledScrolls, scheduleScrollToInput]);

  const focusScrollApi = React.useMemo<FocusScrollApi>(() => ({
    requestScrollToFocusedInput: (input) => scheduleScrollToInput(input),
  }), [scheduleScrollToInput]);

  const handleLayout = React.useCallback((event: LayoutChangeEvent) => {
    viewportHeight.current = event.nativeEvent.layout.height;
    if (keyboardHeight.current > 0) updateKeyboardPadding();
  }, [updateKeyboardPadding]);

  const handleScroll = React.useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollY.current = event.nativeEvent.contentOffset.y;
  }, []);

  return (
    <RNScrollView
      ref={scrollRef}
      style={scrollMaxHeight !== undefined ? { maxHeight: Math.max(0, scrollMaxHeight - footerKeyboardOffset) } : undefined}
      contentContainerStyle={[
        styles.scrollContent,
        topbarHeight > 0 ? { paddingTop: topbarHeight } : null,
        footerHeight + keyboardPadding > 0 ? { paddingBottom: footerHeight + keyboardPadding } : null,
      ]}
      keyboardShouldPersistTaps="handled"
      onLayout={handleLayout}
      onScroll={handleScroll}
      scrollEventThrottle={16}
    >
      <FocusScrollProvider value={focusScrollApi}>{children}</FocusScrollProvider>
    </RNScrollView>
  );
};
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
  topbar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    paddingTop: space.lg,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
  },
  scrollContent: {
    flexGrow: 1,
  } satisfies ViewStyle,
});
