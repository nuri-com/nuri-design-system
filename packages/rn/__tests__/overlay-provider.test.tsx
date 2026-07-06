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
import { BackHandler, KeyboardAvoidingView, ScrollView, Text, TextInput, View } from 'react-native';
import { NuriThemeProvider } from '../theme';
import {
  BottomSheet,
  BottomSheetPanel,
  BottomSheetScroll,
  Button,
  OverlayProvider,
  TextField,
  TextFieldLabel,
  useOverlay,
} from '../index';
import type { OverlayApi } from '../index';
import { type FocusScrollApi, useFocusScroll } from '../runtime/focus-scroll';

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
  // BottomSheetScroll keeps the fields AND the footer in one scrollable panel.
  // LIMITATION (stated honestly): the actual keyboard push — KAV translating the
  // panel and the ScrollView scrolling the focused field above the keyboard — is
  // a native/layout behaviour the headless harness cannot compute. This asserts
  // the COMPOSED STRUCTURE that makes it reachable (a real-device check owns the
  // rest — see App / the expo-demo Sheet screen).
  test('a form sheet mounts a KeyboardAvoidingView wrapping fields + footer', () => {
    const tr = render(
      <NuriThemeProvider>
        <OverlayProvider>
          <BottomSheet open detent="content">
            <BottomSheetPanel>
              <BottomSheetScroll>
                <TextField value="" placeholder="Name">
                  <TextFieldLabel>Recipient</TextFieldLabel>
                </TextField>
                <Button variant="solid">Save</Button>
              </BottomSheetScroll>
            </BottomSheetPanel>
          </BottomSheet>
        </OverlayProvider>
      </NuriThemeProvider>,
    );

    // The keyboard-avoidance host is present in the mounted overlay subtree…
    expect(tr.root.findAllByType(KeyboardAvoidingView).length).toBeGreaterThan(0);
    // …and the field's input AND the footer button label coexist under it (both
    // reachable in one scroll region — the D4 "2-field form step stays reachable"
    // shape, now with a consuming composition).
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

  test('BottomSheetScroll coordinator measures the focused input and scrolls just enough', () => {
    jest.useFakeTimers();
    const originalRequestAnimationFrame = global.requestAnimationFrame;
    const originalCancelAnimationFrame = global.cancelAnimationFrame;
    global.requestAnimationFrame = ((cb: FrameRequestCallback) => setTimeout(() => cb(0), 0) as unknown as number);
    global.cancelAnimationFrame = ((id: number) => clearTimeout(id as unknown as ReturnType<typeof setTimeout>));

    const nativeScrollRef = {};
    const scrollTo = jest.fn();
    const getNativeScrollRefSpy = jest
      .spyOn(ScrollView.prototype, 'getNativeScrollRef')
      .mockReturnValue(nativeScrollRef as never);
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
      expect(measureLayout.mock.calls[0][0]).toBe(nativeScrollRef);
      expect(scrollTo).toHaveBeenCalledWith({ y: 138, animated: true });
      expect(scrollToSpy).toHaveBeenCalledTimes(1);
    } finally {
      getNativeScrollRefSpy.mockRestore();
      scrollToSpy.mockRestore();
      jest.useRealTimers();
      global.requestAnimationFrame = originalRequestAnimationFrame;
      global.cancelAnimationFrame = originalCancelAnimationFrame;
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
