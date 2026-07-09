// ════════════════════════════════════════════════════════════════
// Scroll — the structural flex-fill + overflow · RN <ScrollView>
// (scroll.js:8 · "a thin component over <ScrollView>") · no namespace.
// ════════════════════════════════════════════════════════════════
import * as React from 'react';
import { Keyboard, Platform, ScrollView as RNScrollView } from 'react-native';
import type {
  KeyboardEvent,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  TextInput,
  ViewStyle,
} from 'react-native';
import { FocusScrollProvider, type FocusScrollApi } from '../runtime/focus-scroll';
import { useFixedRegionLayout } from './FixedRegionLayout';
import { SCREEN_STYLE, withKeys } from './shared';

export type ScrollInsetBottom = 'none' | 'dock';
export type ScrollInsetTop = 'none' | 'dock';
export type ScrollProps = {
  safeAreaTop?: boolean;
  safeAreaBottom?: boolean;
  insetTop?: ScrollInsetTop;
  insetBottom?: ScrollInsetBottom;
  children?: React.ReactNode;
};

type ScrollViewInstance = React.ElementRef<typeof RNScrollView>;
type ScrollContentRef = NonNullable<Parameters<TextInput['measureLayout']>[0]>;
type ScrollViewWithNativeRef = ScrollViewInstance & {
  getNativeScrollRef?: () => ScrollContentRef | null;
};
type ScrollViewWithInnerRef = ScrollViewInstance & {
  getInnerViewRef?: () => ScrollContentRef | null;
};
type MeasureInWindowCallback = (x: number, y: number, width: number, height: number) => void;
type NativeMeasurable = {
  measureInWindow?: (callback: MeasureInWindowCallback) => void;
};

const FOCUS_TOP_MARGIN = 16;
const FOCUS_BOTTOM_MARGIN = 88;
const FOCUS_SCROLL_DELAY_MS = 32;
const FOCUS_SCROLL_REPEAT_DELAY_MS = 60;

const ScrollImpl: React.FC<ScrollProps> = ({
  safeAreaTop = false,
  safeAreaBottom = false,
  insetTop = 'none',
  insetBottom = 'none',
  children,
}) => {
  const {
    scrollMaxHeight,
    headerHeight,
    footerHeight,
    keyboardOffset,
    safeAreaTop: hostSafeAreaTop,
    safeAreaBottom: hostSafeAreaBottom,
    dockTopInset,
    dockBottomInset,
  } = useFixedRegionLayout();
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
    const targetTop = headerHeight + FOCUS_TOP_MARGIN;
    const targetBottom = Math.max(targetTop, visibleHeight - FOCUS_BOTTOM_MARGIN);
    const scrollToNextY = (nextY: number): void => {
      const clampedY = Math.max(0, Math.round(nextY));
      if (Math.abs(clampedY - scrollY.current) < 1) return;
      scroll.scrollTo({ y: clampedY, animated: true });
      scrollY.current = clampedY;
    };

    const scrollWithNativeRef = scroll as ScrollViewWithNativeRef;
    const scrollNativeRef = scrollWithNativeRef.getNativeScrollRef?.();
    const scrollWindowMeasurable = scrollNativeRef as NativeMeasurable | null | undefined;
    const inputWindowMeasurable = input as NativeMeasurable;
    if (
      visibleHeight > 0 &&
      typeof scrollWindowMeasurable?.measureInWindow === 'function' &&
      typeof inputWindowMeasurable.measureInWindow === 'function'
    ) {
      const measureScrollInWindow: (callback: MeasureInWindowCallback) => void =
        scrollWindowMeasurable.measureInWindow.bind(scrollWindowMeasurable);
      const measureInputInWindow: (callback: MeasureInWindowCallback) => void =
        inputWindowMeasurable.measureInWindow.bind(inputWindowMeasurable);
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
        : scrollWithNativeRef.getNativeScrollRef?.();
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
  }, [keyboardOcclusion, scrollMaxHeight, headerHeight]);

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
  }, [clearScheduledScrolls, scheduleScrollToInput, scrollMaxHeight, updateKeyboardPadding]);

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

  const topContentPadding =
    headerHeight +
    (safeAreaTop ? hostSafeAreaTop : 0) +
    (insetTop === 'dock' ? dockTopInset : 0);
  const bottomContentPadding =
    Math.max(footerHeight, safeAreaBottom ? hostSafeAreaBottom : 0) +
    (insetBottom === 'dock' ? dockBottomInset : 0) +
    keyboardPadding;
  const contentStyle =
    topContentPadding > 0 || bottomContentPadding > 0
      ? [
          SCROLL_CONTENT_STYLE,
          topContentPadding > 0 ? { paddingTop: topContentPadding } : null,
          bottomContentPadding > 0 ? { paddingBottom: bottomContentPadding } : null,
        ]
      : SCROLL_CONTENT_STYLE;
  const scrollStyle =
    scrollMaxHeight !== undefined
      ? { maxHeight: Math.max(0, scrollMaxHeight - keyboardOffset) }
      : SCREEN_STYLE;

  return (
    <RNScrollView
      ref={scrollRef}
      style={scrollStyle}
      contentContainerStyle={contentStyle}
      keyboardShouldPersistTaps="handled"
      onLayout={handleLayout}
      onScroll={handleScroll}
      scrollEventThrottle={16}
    >
      <FocusScrollProvider value={focusScrollApi}>{children}</FocusScrollProvider>
    </RNScrollView>
  );
};
ScrollImpl.displayName = 'Scroll';
export const Scroll = withKeys(ScrollImpl, ['safeAreaTop', 'safeAreaBottom', 'insetTop', 'insetBottom']);
const SCROLL_CONTENT_STYLE: ViewStyle = { flexGrow: 1 };
