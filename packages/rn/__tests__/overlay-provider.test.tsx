/* ══════════════════════════════════════════════════════════════════
 * NURI · OVERLAY PROVIDER · REGISTRY + STACKING + BACK ROUTING + REGISTRAR
 * ──────────────────────────────────────────────────────────────────
 * The overlay layer (route B · docs/bottom-sheet-improvements.md) proven at
 * the runtime level:
 *   · register → the outlet renders the node; unregister → it's gone; update
 *     refreshes the node in place.
 *   · TWO layers stack in mount order (later = on top) — the toast/flow
 *     generality proof: a second layer renders above a sheet with NO rewrite.
 *   · hardware-back routes to the TOPMOST dismissible layer's close handler and
 *     is consumed so it never falls through a blocking (non-dismissible) layer.
 *   · <BottomSheet open> under <OverlayProvider> puts its subtree in the OUTLET
 *     (not inline), and closing removes it.
 * ══════════════════════════════════════════════════════════════════ */

import * as React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { BackHandler, Keyboard, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { NuriThemeProvider } from '../theme';
import {
  BottomSheet,
  BottomSheetFooter,
  BottomSheetPanel,
  BottomSheetScroll,
  BottomSheetTopbar,
  Button,
  OverlayProvider,
  TextField,
  TextFieldLabel,
  useOverlay,
} from '../index';
import type { OverlayApi } from '../index';
import { space } from '../generated/data/tokens';
import { type FocusScrollApi, useFocusScroll } from '../runtime/focus-scroll';

type ScrollViewWithInnerRef = ScrollView & {
  getInnerViewRef: () => unknown;
};
type NativeMeasurable = {
  measureInWindow: (callback: (x: number, y: number, width: number, height: number) => void) => void;
};
type WindowMeasuredRef = NativeMeasurable & {
  frame: readonly [number, number, number, number];
};

function render(node: React.ReactElement): TestRenderer.ReactTestRenderer {
  let tr!: TestRenderer.ReactTestRenderer;
  act(() => {
    tr = TestRenderer.create(node);
  });
  return tr;
}

// A harness that captures the overlay API so a test can drive register/update/
// unregister imperatively — the future toast/flow tenant's path.
function ApiProbe({ onReady }: { onReady: (api: OverlayApi) => void }): null {
  const api = useOverlay();
  React.useEffect(() => {
    onReady(api);
  }, [api, onReady]);
  return null;
}

function textsInTree(tr: TestRenderer.ReactTestRenderer): string[] {
  return tr.root.findAllByType(Text).map((n) => n.props.children as string);
}

function FocusScrollProbe({ onReady }: { onReady: (api: FocusScrollApi | null) => void }): null {
  const api = useFocusScroll();
  React.useEffect(() => {
    onReady(api);
  }, [api, onReady]);
  return null;
}

function expectFocusScrollApi(api: FocusScrollApi | null): asserts api is FocusScrollApi {
  expect(api).not.toBeNull();
}

function flatStyle(style: unknown): Record<string, unknown> {
  return Array.isArray(style)
    ? Object.assign({}, ...style.filter(Boolean))
    : ((style ?? {}) as Record<string, unknown>);
}

describe('OverlayProvider — registry runtime', () => {
  test('register renders the node in the outlet; unregister removes it', () => {
    let api!: OverlayApi;
    const tr = render(<OverlayProvider><ApiProbe onReady={(a) => (api = a)} /></OverlayProvider>);

    expect(textsInTree(tr)).toEqual([]);

    act(() => api.register('a', <Text>Layer A</Text>));
    expect(textsInTree(tr)).toEqual(['Layer A']);

    act(() => api.unregister('a'));
    expect(textsInTree(tr)).toEqual([]);
  });

  test('update refreshes a registered layer node in place', () => {
    let api!: OverlayApi;
    const tr = render(<OverlayProvider><ApiProbe onReady={(a) => (api = a)} /></OverlayProvider>);

    act(() => api.register('a', <Text>before</Text>));
    expect(textsInTree(tr)).toEqual(['before']);

    act(() => api.update('a', <Text>after</Text>));
    expect(textsInTree(tr)).toEqual(['after']);
  });

  test('two layers stack in mount order (later = on top) — the toast/flow proof', () => {
    let api!: OverlayApi;
    const tr = render(<OverlayProvider><ApiProbe onReady={(a) => (api = a)} /></OverlayProvider>);

    act(() => api.register('sheet', <Text>Sheet</Text>));
    act(() => api.register('toast', <Text>Toast</Text>));

    // Both present, and the SECOND registered renders after (on top of) the first.
    expect(textsInTree(tr)).toEqual(['Sheet', 'Toast']);

    // The outlet wraps each layer in an absoluteFill View with an ascending
    // zIndex — the later layer's wrapper carries the higher zIndex.
    const zIndexes = tr.root
      .findAllByType(View)
      .map((n) => {
        const style = n.props.style as unknown;
        const flat = Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : style;
        return flat && typeof flat === 'object' ? (flat as Record<string, unknown>).zIndex : undefined;
      })
      .filter((z): z is number => typeof z === 'number' && z < 1000);
    expect(zIndexes).toEqual([0, 1]);
  });

  test('re-registering a lower layer keeps its slot (stacking survives a re-render)', () => {
    // The regression lock: a lower layer that re-renders (keyboard/content/parent)
    // must NOT jump above an upper layer. register upserts in place; the registrar
    // never unregisters-then-re-registers on a node change (two effects, not one).
    let api!: OverlayApi;
    const tr = render(<OverlayProvider><ApiProbe onReady={(a) => (api = a)} /></OverlayProvider>);

    act(() => api.register('sheet', <Text>Sheet v1</Text>));
    act(() => api.register('toast', <Text>Toast</Text>));
    expect(textsInTree(tr)).toEqual(['Sheet v1', 'Toast']);

    // Re-register the LOWER layer with a fresh node (what a re-render does).
    act(() => api.register('sheet', <Text>Sheet v2</Text>));

    // Node refreshed in place; order unchanged — 'sheet' did NOT jump to the top.
    expect(textsInTree(tr)).toEqual(['Sheet v2', 'Toast']);
  });
});

describe('OverlayProvider — hardware-back routing', () => {
  let handlers: Array<() => boolean | null | undefined>;
  let addSpy: jest.SpyInstance;

  beforeEach(() => {
    handlers = [];
    addSpy = jest
      .spyOn(BackHandler, 'addEventListener')
      .mockImplementation((_evt: string, cb: () => boolean | null | undefined) => {
        handlers.push(cb);
        return { remove: () => undefined } as never;
      });
  });

  afterEach(() => addSpy.mockRestore());

  function pressBack(): boolean {
    let handled: boolean | null | undefined = false;
    act(() => {
      handled = handlers[handlers.length - 1]();
    });
    return handled ?? false;
  }

  test('back closes the topmost dismissible layer and is consumed', () => {
    let api!: OverlayApi;
    const close = jest.fn();
    render(<OverlayProvider><ApiProbe onReady={(a) => (api = a)} /></OverlayProvider>);

    act(() => api.register('a', <Text>A</Text>, { dismissible: true, onRequestClose: close }));
    expect(pressBack()).toBe(true);
    expect(close).toHaveBeenCalledTimes(1);
  });

  test('back on a non-dismissible top layer is swallowed without closing (blocking)', () => {
    let api!: OverlayApi;
    const close = jest.fn();
    render(<OverlayProvider><ApiProbe onReady={(a) => (api = a)} /></OverlayProvider>);

    act(() => api.register('block', <Text>Blocking</Text>, { dismissible: false, onRequestClose: close }));
    // Consumed (true) so it never falls through, but the close handler is NOT run.
    expect(pressBack()).toBe(true);
    expect(close).not.toHaveBeenCalled();
  });

  test('back with no layers propagates (returns false)', () => {
    render(<OverlayProvider><ApiProbe onReady={() => undefined} /></OverlayProvider>);
    expect(pressBack()).toBe(false);
  });

  test('back routes to the TOP of a stack (topmost owns back)', () => {
    let api!: OverlayApi;
    const closeSheet = jest.fn();
    const closeToast = jest.fn();
    render(<OverlayProvider><ApiProbe onReady={(a) => (api = a)} /></OverlayProvider>);

    act(() => api.register('sheet', <Text>Sheet</Text>, { onRequestClose: closeSheet }));
    act(() => api.register('toast', <Text>Toast</Text>, { onRequestClose: closeToast }));

    pressBack();
    expect(closeToast).toHaveBeenCalledTimes(1);
    expect(closeSheet).not.toHaveBeenCalled();
  });
});

describe('BottomSheet — registers into the overlay outlet', () => {
  test('an open sheet renders its subtree in the outlet, not inline', () => {
    const tr = render(
      <NuriThemeProvider>
        <OverlayProvider>
          <BottomSheet open detent="content">
            <BottomSheetPanel>
              <Text>Receive</Text>
            </BottomSheetPanel>
          </BottomSheet>
        </OverlayProvider>
      </NuriThemeProvider>,
    );
    // The panel content is present (rendered via the outlet), and the sheet's
    // enter-slide Animated.View (the transform host) is in the tree.
    expect(textsInTree(tr)).toContain('Receive');
    const slid = tr.root.findAll((n) => {
      const style = n.props?.style as unknown;
      const flat = Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : style;
      return Boolean(flat) && typeof flat === 'object' && 'transform' in (flat as Record<string, unknown>);
    });
    expect(slid.length).toBeGreaterThan(0);
  });

  test('a lower sheet re-rendering IN ISOLATION does NOT jump above an upper sheet (effect-level lock)', () => {
    // Reproduces the real regression: with a single register-with-cleanup effect,
    // re-rendering ONLY the lower sheet ran unregister→register and re-appended it
    // on top. The upper sheet's element is kept STABLE so it bails out of the
    // re-render (mirroring the real trigger — a sheet re-rendering on its OWN
    // state: keyboard/height/content — while an upper layer sits still). The lower
    // sheet must keep its slot: [lower, upper], not [upper, lower].
    const upper = (
      <BottomSheet open detent="content">
        <BottomSheetPanel><Text>Upper</Text></BottomSheetPanel>
      </BottomSheet>
    );
    function Harness({ lowerLabel }: { lowerLabel: string }) {
      return (
        <NuriThemeProvider>
          <OverlayProvider>
            <BottomSheet open detent="content">
              <BottomSheetPanel><Text>{lowerLabel}</Text></BottomSheetPanel>
            </BottomSheet>
            {upper}
          </OverlayProvider>
        </NuriThemeProvider>
      );
    }
    let tr!: TestRenderer.ReactTestRenderer;
    act(() => {
      tr = TestRenderer.create(<Harness lowerLabel="Lower v1" />);
    });
    expect(textsInTree(tr)).toEqual(['Lower v1', 'Upper']);

    // Only the lower sheet re-renders (the upper element is referentially stable
    // → React bails on it → only the lower's effect runs).
    act(() => {
      tr.update(<Harness lowerLabel="Lower v2" />);
    });
    expect(textsInTree(tr)).toEqual(['Lower v2', 'Upper']);
  });

  test('unmounting the sheet unregisters its layer (the removal path)', () => {
    // The registrar's cleanup (overlay.unregister on the layout effect) is the
    // mechanism that empties the outlet. A full open=false → exit-animation →
    // setMounted(false) round-trip depends on the native-driven exit COMPLETING,
    // which the headless harness's mock Animated driver does not run to its
    // finished callback — an honest limitation stated here. So we prove the
    // removal mechanism directly: when the sheet leaves the tree, its cleanup
    // fires and the outlet empties (the same overlay.unregister the exit path
    // calls once setMounted(false) commits on a real device).
    function Harness({ mount }: { mount: boolean }) {
      return (
        <NuriThemeProvider>
          <OverlayProvider>
            {mount ? (
              <BottomSheet open detent="content">
                <BottomSheetPanel>
                  <Text>Receive</Text>
                </BottomSheetPanel>
              </BottomSheet>
            ) : null}
          </OverlayProvider>
        </NuriThemeProvider>
      );
    }
    let tr!: TestRenderer.ReactTestRenderer;
    act(() => {
      tr = TestRenderer.create(<Harness mount />);
    });
    expect(textsInTree(tr)).toContain('Receive');

    act(() => {
      tr.update(<Harness mount={false} />);
    });
    expect(textsInTree(tr)).not.toContain('Receive');
  });
});

describe('BottomSheet — keyboard-reachable form composition', () => {
  // The migrated overlay subtree keeps its KeyboardAvoidingView, and composing
  // BottomSheetScroll keeps fields in the body scroll while BottomSheetFooter is
  // fixed outside it; measured footer height becomes the scroll's bottom inset.
  // LIMITATION (stated honestly): the actual keyboard push — KAV translating the
  // panel and the ScrollView scrolling the focused field above the keyboard — is
  // a native/layout behaviour the headless harness cannot compute. This asserts
  // the COMPOSED STRUCTURE that makes it reachable (a real-device check owns the
  // rest — see App / the expo-demo Sheet screen).
  test('a form sheet mounts a KeyboardAvoidingView wrapping body fields and fixed footer', () => {
    const tr = render(
      <NuriThemeProvider>
        <OverlayProvider>
          <BottomSheet open detent="content">
            <BottomSheetPanel>
              <BottomSheetScroll>
                <TextField value="" placeholder="Name">
                  <TextFieldLabel>Recipient</TextFieldLabel>
                </TextField>
              </BottomSheetScroll>
              <BottomSheetFooter>
                <Button variant="solid">Save</Button>
              </BottomSheetFooter>
            </BottomSheetPanel>
          </BottomSheet>
        </OverlayProvider>
      </NuriThemeProvider>,
    );

    // The keyboard-avoidance host is present in the mounted overlay subtree…
    expect(tr.root.findAllByType(KeyboardAvoidingView).length).toBeGreaterThan(0);
    // …and the field's input plus fixed footer button label coexist under it;
    // BottomSheetScroll owns field focus-scroll while the footer is represented
    // as measured bottom inset.
    expect(tr.root.findAllByType(TextInput).length).toBeGreaterThan(0);
    expect(textsInTree(tr)).toContain('Save');
    expect(textsInTree(tr)).toContain('Recipient');
  });

  test('BottomSheetScroll provides the internal focus-scroll coordinator', () => {
    const captured = { api: null as FocusScrollApi | null };
    render(
      <NuriThemeProvider>
        <BottomSheetScroll>
          <FocusScrollProbe onReady={(next) => (captured.api = next)} />
        </BottomSheetScroll>
      </NuriThemeProvider>,
    );

    const api = captured.api;
    expectFocusScrollApi(api);
    expect(api.requestScrollToFocusedInput).toEqual(expect.any(Function));
  });

  test('BottomSheetTopbar and BottomSheetFooter measure into BottomSheetScroll insets', () => {
    const tr = render(
      <NuriThemeProvider>
        <OverlayProvider>
          <BottomSheet open detent="full">
            <BottomSheetPanel>
              <BottomSheetTopbar>
                <Button>Close</Button>
              </BottomSheetTopbar>
              <BottomSheetScroll>
                <Text>Body</Text>
              </BottomSheetScroll>
              <BottomSheetFooter>
                <Button variant="solid">Continue</Button>
              </BottomSheetFooter>
            </BottomSheetPanel>
          </BottomSheet>
        </OverlayProvider>
      </NuriThemeProvider>,
    );

    const topbarHost = tr.root
      .findAllByType(View)
      .find((node) => {
        const style = flatStyle(node.props.style);
        return typeof node.props.onLayout === 'function' && style.top === 0 && style.zIndex === 2;
      });
    const footerHost = tr.root
      .findAllByType(View)
      .find((node) => {
        const style = flatStyle(node.props.style);
        return typeof node.props.onLayout === 'function' && style.bottom === 0 && style.zIndex === 2;
      });
    expect(topbarHost).toBeTruthy();
    expect(footerHost).toBeTruthy();
    expect(flatStyle(topbarHost!.props.style).paddingTop).toBe(space.lg);
    const footerHostStyle = flatStyle(footerHost!.props.style);
    expect(footerHostStyle).not.toHaveProperty('paddingHorizontal');
    expect(footerHostStyle).not.toHaveProperty('paddingTop');
    expect(footerHostStyle).not.toHaveProperty('paddingBottom');
    const scrollMaxHeightBeforeFooterMeasure = flatStyle(tr.root.findByType(ScrollView).props.style).maxHeight;

    act(() => {
      topbarHost!.props.onLayout({ nativeEvent: { layout: { height: 56 } } });
      footerHost!.props.onLayout({ nativeEvent: { layout: { height: 72 } } });
    });

    const scroll = tr.root.findByType(ScrollView);
    const contentStyle = flatStyle(scroll.props.contentContainerStyle);
    expect(contentStyle.paddingTop).toBe(56);
    expect(contentStyle.paddingBottom).toBe(72);
    expect(flatStyle(scroll.props.style).maxHeight).toBe(scrollMaxHeightBeforeFooterMeasure);
  });

  test('BottomSheetFooter follows the keyboard on full sheets', () => {
    const keyboardHandlers: Record<string, Array<(event: { endCoordinates: { height: number; screenY: number } }) => void>> = {};
    const addSpy = jest
      .spyOn(Keyboard, 'addListener')
      .mockImplementation((eventName, cb) => {
        keyboardHandlers[eventName] ??= [];
        keyboardHandlers[eventName].push(cb as (event: { endCoordinates: { height: number; screenY: number } }) => void);
        return { remove: () => undefined } as never;
      });

    try {
      const tr = render(
        <NuriThemeProvider>
          <OverlayProvider>
            <BottomSheet open detent="full">
              <BottomSheetPanel>
                <BottomSheetScroll>
                  <Text>Body</Text>
                </BottomSheetScroll>
                <BottomSheetFooter>
                  <Button variant="solid">Continue</Button>
                </BottomSheetFooter>
              </BottomSheetPanel>
            </BottomSheet>
          </OverlayProvider>
        </NuriThemeProvider>,
      );

      const findFooterHost = () => tr.root
        .findAllByType(View)
        .find((node) => {
          const style = flatStyle(node.props.style);
          return typeof node.props.onLayout === 'function' && style.zIndex === 2 && style.left === 0 && style.right === 0;
        });

      expect(flatStyle(findFooterHost()!.props.style).bottom).toBe(0);

      act(() => {
        const showHandlers = keyboardHandlers.keyboardWillShow ?? keyboardHandlers.keyboardDidShow;
        for (const show of showHandlers) show({ endCoordinates: { height: 280, screenY: 0 } });
      });
      expect(flatStyle(findFooterHost()!.props.style).bottom).toBe(280);

      act(() => {
        const hideHandlers = keyboardHandlers.keyboardWillHide ?? keyboardHandlers.keyboardDidHide;
        for (const hide of hideHandlers) hide({ endCoordinates: { height: 0, screenY: 0 } });
      });
      expect(flatStyle(findFooterHost()!.props.style).bottom).toBe(0);
    } finally {
      addSpy.mockRestore();
    }
  });

  test('BottomSheetFooter does not double-count Android adjustResize', () => {
    const originalPlatformOS = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, get: () => 'android' });

    const keyboardHandlers: Record<string, Array<(event: { endCoordinates: { height: number; screenY: number } }) => void>> = {};
    const addSpy = jest
      .spyOn(Keyboard, 'addListener')
      .mockImplementation((eventName, cb) => {
        keyboardHandlers[eventName] ??= [];
        keyboardHandlers[eventName].push(cb as (event: { endCoordinates: { height: number; screenY: number } }) => void);
        return { remove: () => undefined } as never;
      });

    try {
      const tr = render(
        <NuriThemeProvider>
          <OverlayProvider>
            <BottomSheet open detent="full">
              <BottomSheetPanel>
                <BottomSheetScroll>
                  <Text>Body</Text>
                </BottomSheetScroll>
                <BottomSheetFooter>
                  <Button variant="solid">Continue</Button>
                </BottomSheetFooter>
              </BottomSheetPanel>
            </BottomSheet>
          </OverlayProvider>
        </NuriThemeProvider>,
      );

      const findFooterHost = () => tr.root
        .findAllByType(View)
        .find((node) => {
          const style = flatStyle(node.props.style);
          return typeof node.props.onLayout === 'function' && style.zIndex === 2 && style.left === 0 && style.right === 0;
        });

      expect(keyboardHandlers.keyboardDidShow).toBeTruthy();
      expect(flatStyle(findFooterHost()!.props.style).bottom).toBe(0);

      const scrollMaxHeight = flatStyle(tr.root.findByType(ScrollView).props.style).maxHeight;
      expect(scrollMaxHeight).toEqual(expect.any(Number));
      const resizedWindowBottom = (scrollMaxHeight as number) + 40;

      act(() => {
        for (const show of keyboardHandlers.keyboardDidShow!) {
          show({ endCoordinates: { height: 280, screenY: resizedWindowBottom } });
        }
      });
      expect(flatStyle(findFooterHost()!.props.style).bottom).toBe(0);
    } finally {
      addSpy.mockRestore();
      Object.defineProperty(Platform, 'OS', { configurable: true, get: () => originalPlatformOS });
    }
  });

  test('BottomSheetScroll coordinator measures the focused input and scrolls just enough', () => {
    jest.useFakeTimers();
    const originalRequestAnimationFrame = global.requestAnimationFrame;
    const originalCancelAnimationFrame = global.cancelAnimationFrame;
    global.requestAnimationFrame = ((cb: FrameRequestCallback) => setTimeout(() => cb(0), 0) as unknown as number);
    global.cancelAnimationFrame = ((id: number) => clearTimeout(id as unknown as ReturnType<typeof setTimeout>));

    const scrollContentRef = {};
    const scrollTo = jest.fn();
    const getInnerViewRefSpy = jest
      .spyOn(ScrollView.prototype as ScrollViewWithInnerRef, 'getInnerViewRef')
      .mockReturnValue(scrollContentRef as never);
    const scrollToSpy = jest.spyOn(ScrollView.prototype, 'scrollTo').mockImplementation(scrollTo);
    const measureLayout = jest.fn((_relativeNode, onSuccess: (x: number, y: number, width: number, height: number) => void) => {
      onSuccess(0, 360, 120, 54);
    });
    const captured = { api: null as FocusScrollApi | null };

    try {
      let tr!: TestRenderer.ReactTestRenderer;
      act(() => {
        tr = TestRenderer.create(
          <NuriThemeProvider>
            <BottomSheetScroll>
              <FocusScrollProbe onReady={(next) => (captured.api = next)} />
            </BottomSheetScroll>
          </NuriThemeProvider>,
        );
      });

      const scroll = tr.root.findByType(ScrollView);
      act(() => {
        scroll.props.onLayout({ nativeEvent: { layout: { height: 300 } } });
      });

      const api = captured.api;
      expectFocusScrollApi(api);
      act(() => {
        api.requestScrollToFocusedInput({ measureLayout } as unknown as TextInput);
      });

      act(() => {
        jest.runAllTimers();
      });

      expect(measureLayout).toHaveBeenCalledTimes(1);
      expect(measureLayout.mock.calls[0][0]).toBe(scrollContentRef);
      expect(scrollTo).toHaveBeenCalledWith({ y: 202, animated: true });
      expect(scrollToSpy).toHaveBeenCalledTimes(1);
    } finally {
      getInnerViewRefSpy.mockRestore();
      scrollToSpy.mockRestore();
      jest.useRealTimers();
      global.requestAnimationFrame = originalRequestAnimationFrame;
      global.cancelAnimationFrame = originalCancelAnimationFrame;
    }
  });

  test('BottomSheetScroll scrolls a focused field away from the keyboard safe edge', () => {
    jest.useFakeTimers();
    const originalRequestAnimationFrame = global.requestAnimationFrame;
    const originalCancelAnimationFrame = global.cancelAnimationFrame;
    global.requestAnimationFrame = ((cb: FrameRequestCallback) => setTimeout(() => cb(0), 0) as unknown as number);
    global.cancelAnimationFrame = ((id: number) => clearTimeout(id as unknown as ReturnType<typeof setTimeout>));

    const keyboardHandlers: Record<string, (event: { endCoordinates: { height: number } }) => void> = {};
    const scrollContentRef = {};
    const scrollTo = jest.fn();
    const addSpy = jest
      .spyOn(Keyboard, 'addListener')
      .mockImplementation((eventName, cb) => {
        keyboardHandlers[eventName] = cb as (event: { endCoordinates: { height: number } }) => void;
        return { remove: () => undefined } as never;
      });
    const getInnerViewRefSpy = jest
      .spyOn(ScrollView.prototype as ScrollViewWithInnerRef, 'getInnerViewRef')
      .mockReturnValue(scrollContentRef as never);
    const scrollToSpy = jest.spyOn(ScrollView.prototype, 'scrollTo').mockImplementation(scrollTo);
    const measureLayout = jest.fn((_relativeNode, onSuccess: (x: number, y: number, width: number, height: number) => void) => {
      // Measured against the scroll content, y=242/h=54 is inside the raw
      // 320px keyboard-safe viewport, but too close to the keyboard/accessory
      // edge. The active bottom margin should lift it to the safe line.
      onSuccess(0, 242, 120, 54);
    });
    const captured = { api: null as FocusScrollApi | null };

    try {
      let tr!: TestRenderer.ReactTestRenderer;
      act(() => {
        tr = TestRenderer.create(
          <NuriThemeProvider>
            <BottomSheetScroll>
              <FocusScrollProbe onReady={(next) => (captured.api = next)} />
            </BottomSheetScroll>
          </NuriThemeProvider>,
        );
      });

      const scroll = tr.root.findByType(ScrollView);
      act(() => {
        scroll.props.onLayout({ nativeEvent: { layout: { height: 600 } } });
      });

      const api = captured.api;
      expectFocusScrollApi(api);
      act(() => {
        api.requestScrollToFocusedInput({ measureLayout } as unknown as TextInput);
      });
      act(() => {
        const show = keyboardHandlers.keyboardWillShow ?? keyboardHandlers.keyboardDidShow;
        show({ endCoordinates: { height: 280 } });
      });
      act(() => {
        jest.runAllTimers();
      });

      expect(scrollTo).toHaveBeenLastCalledWith({ y: 64, animated: true });
      expect(scrollToSpy).toHaveBeenCalled();
    } finally {
      addSpy.mockRestore();
      getInnerViewRefSpy.mockRestore();
      scrollToSpy.mockRestore();
      jest.useRealTimers();
      global.requestAnimationFrame = originalRequestAnimationFrame;
      global.cancelAnimationFrame = originalCancelAnimationFrame;
    }
  });

  test('BottomSheetScroll uses window coordinates to clear the keyboard edge', () => {
    jest.useFakeTimers();
    const originalRequestAnimationFrame = global.requestAnimationFrame;
    const originalCancelAnimationFrame = global.cancelAnimationFrame;
    global.requestAnimationFrame = ((cb: FrameRequestCallback) => setTimeout(() => cb(0), 0) as unknown as number);
    global.cancelAnimationFrame = ((id: number) => clearTimeout(id as unknown as ReturnType<typeof setTimeout>));

    const keyboardHandlers: Record<string, (event: { endCoordinates: { height: number; screenY: number } }) => void> = {};
    const scrollNativeRef: WindowMeasuredRef = {
      frame: [0, 40, 360, 600],
      measureInWindow: jest.fn(function (this: WindowMeasuredRef, _cb) {
        _cb(...this.frame);
      }),
    };
    const scrollContentRef = {};
    const scrollTo = jest.fn();
    const addSpy = jest
      .spyOn(Keyboard, 'addListener')
      .mockImplementation((eventName, cb) => {
        keyboardHandlers[eventName] = cb as (event: { endCoordinates: { height: number; screenY: number } }) => void;
        return { remove: () => undefined } as never;
      });
    const getNativeScrollRefSpy = jest
      .spyOn(ScrollView.prototype, 'getNativeScrollRef')
      .mockReturnValue(scrollNativeRef as never);
    const getInnerViewRefSpy = jest
      .spyOn(ScrollView.prototype as ScrollViewWithInnerRef, 'getInnerViewRef')
      .mockReturnValue(scrollContentRef as never);
    const scrollToSpy = jest.spyOn(ScrollView.prototype, 'scrollTo').mockImplementation(scrollTo);
    const measureLayout = jest.fn();
    const inputRef: WindowMeasuredRef = {
      frame: [0, 300, 320, 54],
      // The input bottom is at 354px in the window, while the keyboard/accessory
      // starts at 360px. The safe line is 360 - 88 = 272, so it must scroll by 82.
      measureInWindow: jest.fn(function (this: WindowMeasuredRef, _cb) {
        _cb(...this.frame);
      }),
    };
    const captured = { api: null as FocusScrollApi | null };

    try {
      let tr!: TestRenderer.ReactTestRenderer;
      act(() => {
        tr = TestRenderer.create(
          <NuriThemeProvider>
            <BottomSheetScroll>
              <FocusScrollProbe onReady={(next) => (captured.api = next)} />
            </BottomSheetScroll>
          </NuriThemeProvider>,
        );
      });

      const scroll = tr.root.findByType(ScrollView);
      act(() => {
        scroll.props.onLayout({ nativeEvent: { layout: { height: 600 } } });
      });
      act(() => {
        const show = keyboardHandlers.keyboardWillShow ?? keyboardHandlers.keyboardDidShow;
        show({ endCoordinates: { height: 280, screenY: 360 } });
      });

      const api = captured.api;
      expectFocusScrollApi(api);
      act(() => {
        api.requestScrollToFocusedInput(Object.assign(inputRef, { measureLayout }) as unknown as TextInput);
      });
      act(() => {
        jest.runAllTimers();
      });

      expect(scrollNativeRef.measureInWindow).toHaveBeenCalledTimes(1);
      expect(inputRef.measureInWindow).toHaveBeenCalledTimes(1);
      expect(measureLayout).not.toHaveBeenCalled();
      expect(scrollTo).toHaveBeenCalledWith({ y: 82, animated: true });
      expect(scrollToSpy).toHaveBeenCalledTimes(1);
    } finally {
      addSpy.mockRestore();
      getNativeScrollRefSpy.mockRestore();
      getInnerViewRefSpy.mockRestore();
      scrollToSpy.mockRestore();
      jest.useRealTimers();
      global.requestAnimationFrame = originalRequestAnimationFrame;
      global.cancelAnimationFrame = originalCancelAnimationFrame;
    }
  });

  test('BottomSheetScroll does not scroll a focused field that is already visible after prior scroll', () => {
    jest.useFakeTimers();
    const originalRequestAnimationFrame = global.requestAnimationFrame;
    const originalCancelAnimationFrame = global.cancelAnimationFrame;
    global.requestAnimationFrame = ((cb: FrameRequestCallback) => setTimeout(() => cb(0), 0) as unknown as number);
    global.cancelAnimationFrame = ((id: number) => clearTimeout(id as unknown as ReturnType<typeof setTimeout>));

    const keyboardHandlers: Record<string, (event: { endCoordinates: { height: number } }) => void> = {};
    const scrollContentRef = {};
    const scrollTo = jest.fn();
    const addSpy = jest
      .spyOn(Keyboard, 'addListener')
      .mockImplementation((eventName, cb) => {
        keyboardHandlers[eventName] = cb as (event: { endCoordinates: { height: number } }) => void;
        return { remove: () => undefined } as never;
      });
    const getInnerViewRefSpy = jest
      .spyOn(ScrollView.prototype as ScrollViewWithInnerRef, 'getInnerViewRef')
      .mockReturnValue(scrollContentRef as never);
    const scrollToSpy = jest.spyOn(ScrollView.prototype, 'scrollTo').mockImplementation(scrollTo);
    const measureLayout = jest.fn((_relativeNode, onSuccess: (x: number, y: number, width: number, height: number) => void) => {
      // Measured against the scroll content, y is content-relative. With
      // scrollY=100, the visible content window is 100..420, so 150..204 is
      // already fully inside the viewport.
      onSuccess(0, 150, 120, 54);
    });
    const captured = { api: null as FocusScrollApi | null };

    try {
      let tr!: TestRenderer.ReactTestRenderer;
      act(() => {
        tr = TestRenderer.create(
          <NuriThemeProvider>
            <BottomSheetScroll>
              <FocusScrollProbe onReady={(next) => (captured.api = next)} />
            </BottomSheetScroll>
          </NuriThemeProvider>,
        );
      });

      const scroll = tr.root.findByType(ScrollView);
      act(() => {
        scroll.props.onLayout({ nativeEvent: { layout: { height: 600 } } });
      });
      act(() => {
        const show = keyboardHandlers.keyboardWillShow ?? keyboardHandlers.keyboardDidShow;
        show({ endCoordinates: { height: 280 } });
      });
      act(() => {
        scroll.props.onScroll({ nativeEvent: { contentOffset: { y: 100 } } });
      });

      const api = captured.api;
      expectFocusScrollApi(api);
      act(() => {
        api.requestScrollToFocusedInput({ measureLayout } as unknown as TextInput);
      });
      act(() => {
        jest.runAllTimers();
      });

      expect(measureLayout).toHaveBeenCalledTimes(1);
      expect(scrollTo).not.toHaveBeenCalled();
      expect(scrollToSpy).not.toHaveBeenCalled();
    } finally {
      addSpy.mockRestore();
      getInnerViewRefSpy.mockRestore();
      scrollToSpy.mockRestore();
      jest.useRealTimers();
      global.requestAnimationFrame = originalRequestAnimationFrame;
      global.cancelAnimationFrame = originalCancelAnimationFrame;
    }
  });

  test('BottomSheetScroll scrolls a hidden bottom-edge field with existing scroll offset', () => {
    jest.useFakeTimers();
    const originalRequestAnimationFrame = global.requestAnimationFrame;
    const originalCancelAnimationFrame = global.cancelAnimationFrame;
    global.requestAnimationFrame = ((cb: FrameRequestCallback) => setTimeout(() => cb(0), 0) as unknown as number);
    global.cancelAnimationFrame = ((id: number) => clearTimeout(id as unknown as ReturnType<typeof setTimeout>));

    const keyboardHandlers: Record<string, (event: { endCoordinates: { height: number } }) => void> = {};
    const scrollContentRef = {};
    const scrollTo = jest.fn();
    const addSpy = jest
      .spyOn(Keyboard, 'addListener')
      .mockImplementation((eventName, cb) => {
        keyboardHandlers[eventName] = cb as (event: { endCoordinates: { height: number } }) => void;
        return { remove: () => undefined } as never;
      });
    const getInnerViewRefSpy = jest
      .spyOn(ScrollView.prototype as ScrollViewWithInnerRef, 'getInnerViewRef')
      .mockReturnValue(scrollContentRef as never);
    const scrollToSpy = jest.spyOn(ScrollView.prototype, 'scrollTo').mockImplementation(scrollTo);
    const measureLayout = jest.fn((_relativeNode, onSuccess: (x: number, y: number, width: number, height: number) => void) => {
      // Measured against the scroll content, y is content-relative. With
      // scrollY=100, the visible content window is 100..420; y=450/h=54 sits
      // below it and scrolls to leave the configured bottom comfort margin.
      onSuccess(0, 450, 120, 54);
    });
    const captured = { api: null as FocusScrollApi | null };

    try {
      let tr!: TestRenderer.ReactTestRenderer;
      act(() => {
        tr = TestRenderer.create(
          <NuriThemeProvider>
            <BottomSheetScroll>
              <FocusScrollProbe onReady={(next) => (captured.api = next)} />
            </BottomSheetScroll>
          </NuriThemeProvider>,
        );
      });

      const scroll = tr.root.findByType(ScrollView);
      act(() => {
        scroll.props.onLayout({ nativeEvent: { layout: { height: 600 } } });
      });
      act(() => {
        const show = keyboardHandlers.keyboardWillShow ?? keyboardHandlers.keyboardDidShow;
        show({ endCoordinates: { height: 280 } });
      });
      act(() => {
        scroll.props.onScroll({ nativeEvent: { contentOffset: { y: 100 } } });
      });

      const api = captured.api;
      expectFocusScrollApi(api);
      act(() => {
        api.requestScrollToFocusedInput({ measureLayout } as unknown as TextInput);
      });
      act(() => {
        jest.runAllTimers();
      });

      expect(measureLayout).toHaveBeenCalledTimes(1);
      expect(scrollTo).toHaveBeenCalledWith({ y: 272, animated: true });
      expect(scrollToSpy).toHaveBeenCalledTimes(1);
    } finally {
      addSpy.mockRestore();
      getInnerViewRefSpy.mockRestore();
      scrollToSpy.mockRestore();
      jest.useRealTimers();
      global.requestAnimationFrame = originalRequestAnimationFrame;
      global.cancelAnimationFrame = originalCancelAnimationFrame;
    }
  });

  test('BottomSheetScroll focus-scroll safe top accounts for sticky topbar height', () => {
    jest.useFakeTimers();
    const originalRequestAnimationFrame = global.requestAnimationFrame;
    const originalCancelAnimationFrame = global.cancelAnimationFrame;
    global.requestAnimationFrame = ((cb: FrameRequestCallback) => setTimeout(() => cb(0), 0) as unknown as number);
    global.cancelAnimationFrame = ((id: number) => clearTimeout(id as unknown as ReturnType<typeof setTimeout>));

    const scrollContentRef = {};
    const scrollTo = jest.fn();
    const getInnerViewRefSpy = jest
      .spyOn(ScrollView.prototype as ScrollViewWithInnerRef, 'getInnerViewRef')
      .mockReturnValue(scrollContentRef as never);
    const scrollToSpy = jest.spyOn(ScrollView.prototype, 'scrollTo').mockImplementation(scrollTo);
    const measureLayout = jest.fn((_relativeNode, onSuccess: (x: number, y: number, width: number, height: number) => void) => {
      onSuccess(0, 110, 120, 44);
    });
    const captured = { api: null as FocusScrollApi | null };

    try {
      let tr!: TestRenderer.ReactTestRenderer;
      act(() => {
        tr = TestRenderer.create(
          <NuriThemeProvider>
            <OverlayProvider>
              <BottomSheet open detent="full">
                <BottomSheetPanel>
                  <BottomSheetTopbar>
                    <Button>Close</Button>
                  </BottomSheetTopbar>
                  <BottomSheetScroll>
                    <FocusScrollProbe onReady={(next) => (captured.api = next)} />
                  </BottomSheetScroll>
                </BottomSheetPanel>
              </BottomSheet>
            </OverlayProvider>
          </NuriThemeProvider>,
        );
      });

      const topbarHost = tr.root
        .findAllByType(View)
        .find((node) => {
          const style = flatStyle(node.props.style);
          return typeof node.props.onLayout === 'function' && style.top === 0 && style.zIndex === 2;
        });
      act(() => {
        topbarHost!.props.onLayout({ nativeEvent: { layout: { height: 56 } } });
      });

      const scroll = tr.root.findByType(ScrollView);
      act(() => {
        scroll.props.onLayout({ nativeEvent: { layout: { height: 600 } } });
        scroll.props.onScroll({ nativeEvent: { contentOffset: { y: 100 } } });
      });

      const api = captured.api;
      expectFocusScrollApi(api);
      act(() => {
        api.requestScrollToFocusedInput({ measureLayout } as unknown as TextInput);
      });
      act(() => {
        jest.runAllTimers();
      });

      expect(scrollTo).toHaveBeenCalledWith({ y: 38, animated: true });
      expect(scrollToSpy).toHaveBeenCalledTimes(1);
    } finally {
      getInnerViewRefSpy.mockRestore();
      scrollToSpy.mockRestore();
      jest.useRealTimers();
      global.requestAnimationFrame = originalRequestAnimationFrame;
      global.cancelAnimationFrame = originalCancelAnimationFrame;
    }
  });

  test('BottomSheetScroll adds keyboard bottom padding when the viewport does not resize', () => {
    const keyboardHandlers: Record<string, (event: { endCoordinates: { height: number } }) => void> = {};
    const addSpy = jest
      .spyOn(Keyboard, 'addListener')
      .mockImplementation((eventName, cb) => {
        keyboardHandlers[eventName] = cb as (event: { endCoordinates: { height: number } }) => void;
        return { remove: () => undefined } as never;
      });

    try {
      const tr = render(
        <NuriThemeProvider>
          <BottomSheetScroll>
            <Text>Field</Text>
          </BottomSheetScroll>
        </NuriThemeProvider>,
      );

      const scroll = tr.root.findByType(ScrollView);
      act(() => {
        scroll.props.onLayout({ nativeEvent: { layout: { height: 600 } } });
      });
      act(() => {
        const show = keyboardHandlers.keyboardWillShow ?? keyboardHandlers.keyboardDidShow;
        show({ endCoordinates: { height: 280 } });
      });

      const contentStyle = scroll.props.contentContainerStyle as unknown[];
      const flat = Object.assign({}, ...contentStyle.filter(Boolean));
      expect(flat.paddingBottom).toBe(368);
    } finally {
      addSpy.mockRestore();
    }
  });

  test('focusing a descriptor TextField inside BottomSheetScroll requests the coordinator and preserves public onFocus', () => {
    const captured = { api: null as FocusScrollApi | null };
    const requestScrollToFocusedInput = jest.fn();
    const onFocus = jest.fn();
    const tr = render(
      <NuriThemeProvider>
        <BottomSheetScroll>
          <FocusScrollProbe onReady={(next) => (captured.api = next)} />
          <TextField value="" onFocus={onFocus} placeholder="Name">
            <TextFieldLabel>Recipient</TextFieldLabel>
          </TextField>
        </BottomSheetScroll>
      </NuriThemeProvider>,
    );

    const api = captured.api;
    expectFocusScrollApi(api);
    api.requestScrollToFocusedInput = requestScrollToFocusedInput;

    const input = tr.root.findByType(TextInput);
    act(() => {
      input.props.onFocus();
    });

    expect(requestScrollToFocusedInput).toHaveBeenCalledTimes(1);
    expect(onFocus).toHaveBeenCalledTimes(1);
  });

  test('without BottomSheetScroll, TextField focus remains a normal public focus event', () => {
    const onFocus = jest.fn();
    const tr = render(
      <NuriThemeProvider>
        <TextField value="" onFocus={onFocus}>
          <TextFieldLabel>Recipient</TextFieldLabel>
        </TextField>
      </NuriThemeProvider>,
    );

    const input = tr.root.findByType(TextInput);
    act(() => {
      input.props.onFocus();
    });
    expect(onFocus).toHaveBeenCalledTimes(1);
  });
});
