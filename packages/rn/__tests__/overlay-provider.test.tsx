/* ══════════════════════════════════════════════════════════════════
 * NURI · OVERLAY PROVIDER · REGISTRY + STACKING + BACK ROUTING + REGISTRAR
 * ──────────────────────────────────────────────────────────────────
 * The overlay layer proven at
 * the runtime level:
 *   · register → the outlet renders the node; unregister → it's gone; update
 *     refreshes the node in place.
 *   · TWO layers stack in mount order (later = on top) — the toast/flow
 *     generality proof: a second layer renders above a sheet with NO rewrite.
 *   · hardware-back skips non-blocking tenants, then routes to the TOPMOST
 *     blocking layer and is consumed there.
 *   · <Modal open> under <OverlayProvider> puts its subtree in the OUTLET
 *     (not inline), and closing removes it.
 * ══════════════════════════════════════════════════════════════════ */

import * as React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { BackHandler, Keyboard, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { NuriThemeProvider } from '../theme';
import {
  Modal,
  ModalPanel,
  Button,
  Footer,
  Header,
  NuriSafeAreaProvider,
  OverlayProvider,
  Screen,
  Scroll,
  TextField,
  TextFieldLabel,
  useOverlay,
} from '../index';
import type { OverlayApi } from '../index';
import { space } from '../generated/data/tokens';
import { type FocusScrollApi, useFocusScroll } from '../runtime/focus-scroll';
import { buildNuriTheme } from '../runtime/theme-payload';
import { FixedRegionLayoutProvider } from '../primitives/FixedRegionLayout';

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

  test('back skips a non-blocking toast and dismisses the blocking sheet beneath', () => {
    let api!: OverlayApi;
    const closeSheet = jest.fn();
    const closeToast = jest.fn();
    render(<OverlayProvider><ApiProbe onReady={(a) => (api = a)} /></OverlayProvider>);

    act(() => api.register('sheet', <Text>Sheet</Text>, { onRequestClose: closeSheet }));
    act(() => api.register('toast', <Text>Toast</Text>, {
      blocking: false,
      dismissible: false,
      onRequestClose: closeToast,
    }));

    expect(pressBack()).toBe(true);
    expect(closeSheet).toHaveBeenCalledTimes(1);
    expect(closeToast).not.toHaveBeenCalled();
  });

  test('back with only non-blocking layers propagates to the app', () => {
    let api!: OverlayApi;
    render(<OverlayProvider><ApiProbe onReady={(a) => (api = a)} /></OverlayProvider>);

    act(() => api.register('toast', <Text>Toast</Text>, { blocking: false }));
    expect(pressBack()).toBe(false);
  });
});

describe('Modal — registers into the overlay outlet', () => {
  test('an open sheet renders its subtree in the outlet, not inline', () => {
    const tr = render(
      <NuriThemeProvider>
        <OverlayProvider>
          <Modal open mode="sheet">
            <ModalPanel>
              <Text>Receive</Text>
            </ModalPanel>
          </Modal>
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
      <Modal open mode="sheet">
        <ModalPanel><Text>Upper</Text></ModalPanel>
      </Modal>
    );
    function Harness({ lowerLabel }: { lowerLabel: string }) {
      return (
        <NuriThemeProvider>
          <OverlayProvider>
            <Modal open mode="sheet">
              <ModalPanel><Text>{lowerLabel}</Text></ModalPanel>
            </Modal>
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
              <Modal open mode="sheet">
                <ModalPanel>
                  <Text>Receive</Text>
                </ModalPanel>
              </Modal>
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

describe('Modal — keyboard-reachable form composition', () => {
  // Full mode owns focus-scroll without a KeyboardAvoidingView; composing
  // Scroll keeps fields in the body scroll while structural Footer stays in the
  // same bounded column outside it.
  // LIMITATION (stated honestly): the actual keyboard resize and the ScrollView
  // scrolling the focused field above the keyboard are
  // a native/layout behaviour the headless harness cannot compute. This asserts
  // the COMPOSED STRUCTURE that makes it reachable (a real-device check owns the
  // rest — see App / the expo-demo Sheet screen).
  test('a full modal mounts fields and a structural footer without the retired KeyboardAvoidingView', () => {
    const tr = render(
      <NuriThemeProvider>
        <OverlayProvider>
          <Modal open mode="full">
            <ModalPanel>
              <Scroll>
                <TextField value="" placeholder="Name">
                  <TextFieldLabel>Recipient</TextFieldLabel>
                </TextField>
              </Scroll>
              <Footer>
                <Button variant="solid">Save</Button>
              </Footer>
            </ModalPanel>
          </Modal>
        </OverlayProvider>
      </NuriThemeProvider>,
    );

    expect(tr.root.findAllByType(KeyboardAvoidingView)).toHaveLength(0);
    // …and the field's input plus structural footer button label coexist under it;
    // Scroll owns field focus-scroll while the footer is represented
    // as measured bottom inset.
    expect(tr.root.findAllByType(TextInput).length).toBeGreaterThan(0);
    expect(textsInTree(tr)).toContain('Save');
    expect(textsInTree(tr)).toContain('Recipient');
  });

  test('Scroll provides the internal focus-scroll coordinator', () => {
    const captured = { api: null as FocusScrollApi | null };
    render(
      <NuriThemeProvider>
        <FixedRegionLayoutProvider keyboardEnabled>
          <Scroll>
            <FocusScrollProbe onReady={(next) => (captured.api = next)} />
          </Scroll>
        </FixedRegionLayoutProvider>
      </NuriThemeProvider>,
    );

    const api = captured.api;
    expectFocusScrollApi(api);
    expect(api.onInputFocus).toEqual(expect.any(Function));
    expect(api.onInputBlur).toEqual(expect.any(Function));
  });

  test('Header, Scroll, and Footer form a bounded column without a measurement handshake', () => {
    const onHeaderLayout = jest.fn();
    const onFooterLayout = jest.fn();
    const tr = render(
      <NuriThemeProvider>
        <OverlayProvider>
          <Modal open mode="full">
            <ModalPanel>
              <Header paddingTop="lg" onLayout={onHeaderLayout}>
                <Button>Close</Button>
              </Header>
              <Scroll>
                <Text>Body</Text>
              </Scroll>
              <Footer
                onLayout={onFooterLayout}
                chrome="strong"
                direction="row"
                align="center"
                justify="end"
                gap="sm"
                paddingX="lg"
                paddingY="xs"
              >
                <Button variant="solid">Continue</Button>
              </Footer>
            </ModalPanel>
          </Modal>
        </OverlayProvider>
      </NuriThemeProvider>,
    );

    const topbarHost = tr.root.findAllByType(View).find((node) => node.props.onLayout === onHeaderLayout);
    const footerHost = tr.root.findAllByType(View).find((node) => node.props.onLayout === onFooterLayout);
    expect(topbarHost).toBeTruthy();
    expect(footerHost).toBeTruthy();
    expect(flatStyle(topbarHost!.props.style)).toMatchObject({
      flexShrink: 0,
      alignSelf: 'stretch',
      paddingTop: space.lg,
    });
    expect(flatStyle(topbarHost!.props.style).position).toBeUndefined();
    const footerHostStyle = flatStyle(footerHost!.props.style);
    expect(footerHostStyle).toMatchObject({ flexShrink: 0, alignSelf: 'stretch' });
    expect(footerHostStyle.position).toBeUndefined();
    expect(footerHostStyle.flexDirection).toBe('row');
    expect(footerHostStyle.alignItems).toBe('center');
    expect(footerHostStyle.justifyContent).toBe('flex-end');
    expect(footerHostStyle.gap).toBe(space.sm);
    expect(footerHostStyle.paddingHorizontal).toBe(space.lg);
    expect(footerHostStyle.paddingVertical).toBe(space.xs);
    expect(footerHostStyle.paddingBottom).toBe(space.xs);
    expect(footerHostStyle.backgroundColor).toEqual(expect.any(String));
    const initialScrollStyle = flatStyle(tr.root.findByType(ScrollView).props.style);
    const initialContentStyle = flatStyle(tr.root.findByType(ScrollView).props.contentContainerStyle);
    expect(initialScrollStyle).toEqual({ flexGrow: 1, flexShrink: 1, minHeight: 0 });
    expect(initialContentStyle).toEqual({ flexGrow: 1 });

    act(() => {
      topbarHost!.props.onLayout({ nativeEvent: { layout: { height: 56 } } });
      footerHost!.props.onLayout({ nativeEvent: { layout: { height: 72 } } });
    });

    const scroll = tr.root.findByType(ScrollView);
    expect(flatStyle(scroll.props.style)).toEqual(initialScrollStyle);
    expect(flatStyle(scroll.props.contentContainerStyle)).toEqual(initialContentStyle);
    expect(onHeaderLayout).toHaveBeenCalledTimes(1);
    expect(onFooterLayout).toHaveBeenCalledTimes(1);
  });

  test('Header paints safe-area chrome independently from its transparent body', () => {
    const theme = buildNuriTheme('lilac', 'light');
    const tr = render(
      <NuriThemeProvider>
        <FixedRegionLayoutProvider safeAreaTop={24}>
          <Header safeAreaTop chrome="transparent" safeAreaChrome="canvas">
            <Text>Search</Text>
          </Header>
        </FixedRegionLayoutProvider>
      </NuriThemeProvider>,
    );

    const views = tr.root.findAllByType(View);
    const header = views.find((node) => {
      const style = flatStyle(node.props.style);
      return style.flexShrink === 0 && style.backgroundColor === 'transparent';
    });
    const safeAreaChrome = views.find((node) => node.props.pointerEvents === 'none');
    expect(header).toBeTruthy();
    expect(safeAreaChrome).toBeTruthy();
    expect(flatStyle(header!.props.style).backgroundColor).toBe('transparent');
    expect(flatStyle(header!.props.style).paddingTop).toBe(24);
    expect(flatStyle(safeAreaChrome!.props.style)).toMatchObject({
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 24,
      backgroundColor: theme.chrome.canvas.bg,
    });
  });

  test('Footer composes authored bottom padding with safe-area bottom', () => {
    const tr = render(
      <NuriThemeProvider>
        <NuriSafeAreaProvider bottom={34}>
          <OverlayProvider>
            <Modal open mode="full">
              <ModalPanel>
                <Scroll>
                  <Text>Body</Text>
                </Scroll>
                <Footer safeAreaBottom direction="column" align="stretch" paddingY="sm" paddingX="lg">
                  <Button variant="solid">Continue</Button>
                </Footer>
              </ModalPanel>
            </Modal>
          </OverlayProvider>
        </NuriSafeAreaProvider>
      </NuriThemeProvider>,
    );

    const footerHost = tr.root
      .findAllByType(View)
      .find((node) => flatStyle(node.props.style).paddingBottom === space.sm + 34);
    expect(footerHost).toBeTruthy();
    const footerStyle = flatStyle(footerHost!.props.style);
    expect(footerStyle.alignItems).toBe('stretch');
    expect(footerStyle.paddingHorizontal).toBe(space.lg);
    expect(footerStyle.paddingVertical).toBe(space.sm);
    expect(footerStyle.paddingBottom).toBe(space.sm + 34);
    expect(flatStyle(tr.root.findByType(ScrollView).props.contentContainerStyle).paddingBottom).toBeUndefined();

    expect(footerHost!.props.onLayout).toBeUndefined();
  });

  test('Footer ignores raw host safe-area inset unless requested', () => {
    const tr = render(
      <NuriThemeProvider>
        <NuriSafeAreaProvider bottom={34}>
          <OverlayProvider>
            <Modal open mode="full">
              <ModalPanel>
                <Scroll>
                  <Text>Body</Text>
                </Scroll>
                <Footer paddingY="sm">
                  <Button variant="solid">Continue</Button>
                </Footer>
              </ModalPanel>
            </Modal>
          </OverlayProvider>
        </NuriSafeAreaProvider>
      </NuriThemeProvider>,
    );

    const footerHost = tr.root
      .findAllByType(View)
      .find((node) => {
        const style = flatStyle(node.props.style);
        return style.flexShrink === 0 && style.paddingBottom === space.sm;
      });
    expect(footerHost).toBeTruthy();
    expect(flatStyle(footerHost!.props.style).paddingBottom).toBe(space.sm);
    expect(flatStyle(tr.root.findByType(ScrollView).props.contentContainerStyle).paddingBottom).toBeUndefined();
  });

  test('Footer is the sole requested bottom-safe-area owner when present', () => {
    const tr = render(
      <NuriThemeProvider>
        <NuriSafeAreaProvider bottom={34}>
          <OverlayProvider>
            <Modal open mode="full">
              <ModalPanel>
                <Scroll>
                  <Text>Body</Text>
                </Scroll>
                <Footer safeAreaBottom paddingY="sm">
                  <Button variant="solid">Continue</Button>
                </Footer>
              </ModalPanel>
            </Modal>
          </OverlayProvider>
        </NuriSafeAreaProvider>
      </NuriThemeProvider>,
    );

    const footerHost = tr.root
      .findAllByType(View)
      .find((node) => flatStyle(node.props.style).paddingBottom === space.sm + 34);
    expect(footerHost).toBeTruthy();
    expect(flatStyle(footerHost!.props.style).paddingBottom).toBe(space.sm + 34);
    expect(flatStyle(tr.root.findByType(ScrollView).props.contentContainerStyle).paddingBottom).toBeUndefined();
  });

  test('Scroll safeAreaBottom reserves scroll-only content when there is no footer', () => {
    const tr = render(
      <NuriThemeProvider>
        <NuriSafeAreaProvider bottom={34}>
          <OverlayProvider>
            <Modal open mode="full">
              <ModalPanel>
                <Scroll safeAreaBottom>
                  <Text>Body</Text>
                </Scroll>
              </ModalPanel>
            </Modal>
          </OverlayProvider>
        </NuriSafeAreaProvider>
      </NuriThemeProvider>,
    );

    expect(flatStyle(tr.root.findByType(ScrollView).props.contentContainerStyle).paddingBottom).toBe(34);
  });

  test('Screen keyboard inset replaces a requested bottom safe-area reserve', () => {
    const originalPlatformOS = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, get: () => 'ios' });
    const handlers: Record<string, (event: { endCoordinates: { height: number; screenY: number } }) => void> = {};
    const addSpy = jest.spyOn(Keyboard, 'addListener').mockImplementation((eventName, cb) => {
      handlers[eventName] = cb as (event: { endCoordinates: { height: number; screenY: number } }) => void;
      return { remove: () => undefined } as never;
    });

    try {
      const tr = render(
        <NuriThemeProvider>
          <NuriSafeAreaProvider bottom={34}>
            <Screen safeAreaBottom>
              <Scroll><Text>Body</Text></Scroll>
            </Screen>
          </NuriSafeAreaProvider>
        </NuriThemeProvider>,
      );
      const screen = tr.root.findAllByType(View).find((node) => {
        const style = flatStyle(node.props.style);
        return style.flex === 1 && style.position === 'relative' && style.overflow === 'hidden';
      })!;
      expect(flatStyle(screen.props.style).paddingBottom).toBe(34);

      act(() => handlers.keyboardWillShow({ endCoordinates: { height: 280, screenY: 520 } }));
      expect(flatStyle(screen.props.style).paddingBottom).toBe(280);

      act(() => handlers.keyboardWillHide({ endCoordinates: { height: 0, screenY: 800 } }));
      expect(flatStyle(screen.props.style).paddingBottom).toBe(34);
    } finally {
      addSpy.mockRestore();
      Object.defineProperty(Platform, 'OS', { configurable: true, get: () => originalPlatformOS });
    }
  });

  test('Modal content detent bounds Scroll without flex-filling the sheet', () => {
    const tr = render(
      <NuriThemeProvider>
        <OverlayProvider>
          <Modal open mode="sheet">
            <ModalPanel>
              <Header paddingTop="lg">
                <Text>Actions</Text>
              </Header>
              <Scroll safeAreaBottom>
                <Text>Choose a transfer method</Text>
              </Scroll>
            </ModalPanel>
          </Modal>
        </OverlayProvider>
      </NuriThemeProvider>,
    );

    const scrollStyle = flatStyle(tr.root.findByType(ScrollView).props.style);
    expect(scrollStyle).toEqual({ flexShrink: 1, minHeight: 0 });
  });

  test('iOS frame inset shrinks the structural column through show, grow, and hide', () => {
    const originalPlatformOS = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, get: () => 'ios' });
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
          <NuriSafeAreaProvider bottom={34}>
            <OverlayProvider>
              <Modal open mode="full">
                <ModalPanel>
                  <Scroll>
                    <Text>Body</Text>
                  </Scroll>
                  <Footer safeAreaBottom paddingY="sm">
                    <Button variant="solid">Continue</Button>
                  </Footer>
                </ModalPanel>
              </Modal>
            </OverlayProvider>
          </NuriSafeAreaProvider>
        </NuriThemeProvider>,
      );

      const findFooterHost = () => tr.root
        .findAllByType(View)
        .find((node) => flatStyle(node.props.style).paddingVertical === space.sm);
      const findFrameHost = () => tr.root.find((node) => {
        const style = flatStyle(node.props.style);
        return typeof node.props.onLayout === 'function' && Array.isArray(style.transform) && style.position === 'absolute';
      });

      expect(flatStyle(findFrameHost().props.style).paddingBottom).toBeUndefined();
      expect(flatStyle(findFooterHost()!.props.style).bottom).toBeUndefined();
      expect(flatStyle(findFooterHost()!.props.style).paddingVertical).toBe(space.sm);
      expect(flatStyle(findFooterHost()!.props.style).paddingBottom).toBe(space.sm + 34);

      act(() => {
        for (const show of keyboardHandlers.keyboardWillShow!) {
          show({ endCoordinates: { height: 280, screenY: 520 } });
        }
      });
      expect(flatStyle(findFrameHost().props.style).paddingBottom).toBe(280);
      expect(flatStyle(findFooterHost()!.props.style).bottom).toBeUndefined();
      expect(flatStyle(findFooterHost()!.props.style).paddingBottom).toBe(space.sm);

      act(() => {
        for (const change of keyboardHandlers.keyboardWillChangeFrame!) {
          change({ endCoordinates: { height: 360, screenY: 440 } });
        }
      });
      expect(flatStyle(findFrameHost().props.style).paddingBottom).toBe(360);

      act(() => {
        for (const hide of keyboardHandlers.keyboardWillHide!) {
          hide({ endCoordinates: { height: 0, screenY: 800 } });
        }
      });
      expect(flatStyle(findFrameHost().props.style).paddingBottom).toBeUndefined();
      expect(flatStyle(findFooterHost()!.props.style).bottom).toBeUndefined();
      expect(flatStyle(findFooterHost()!.props.style).paddingBottom).toBe(space.sm + 34);
    } finally {
      addSpy.mockRestore();
      Object.defineProperty(Platform, 'OS', { configurable: true, get: () => originalPlatformOS });
    }
  });

  test('Android adjustResize never applies a transient second keyboard offset', () => {
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
            <Modal open mode="full">
              <ModalPanel>
                <Scroll>
                  <Text>Body</Text>
                </Scroll>
                <Footer>
                  <Button variant="solid">Continue</Button>
                </Footer>
              </ModalPanel>
            </Modal>
          </OverlayProvider>
        </NuriThemeProvider>,
      );

      const findFooterHost = () => tr.root
        .findAllByType(View)
        .find((node) => flatStyle(node.props.style).flexShrink === 0);
      const findFrameHost = () => tr.root.find((node) => {
        const style = flatStyle(node.props.style);
        return typeof node.props.onLayout === 'function' && Array.isArray(style.transform) && style.position === 'absolute';
      });

      expect(keyboardHandlers.keyboardDidShow).toBeTruthy();
      expect(flatStyle(findFooterHost()!.props.style).bottom).toBeUndefined();
      expect(flatStyle(findFrameHost().props.style).paddingBottom).toBeUndefined();

      const scrollStyle = flatStyle(tr.root.findByType(ScrollView).props.style);
      expect(scrollStyle).toEqual({ flexGrow: 1, flexShrink: 1, minHeight: 0 });

      act(() => {
        for (const show of keyboardHandlers.keyboardDidShow!) {
          // Model keyboardDidShow arriving before useWindowDimensions publishes
          // the adjustResize height. The old screenY-derived offset briefly
          // moved the footer and compressed Scroll until the dimension update.
          show({ endCoordinates: { height: 280, screenY: 520 } });
        }
      });
      expect(flatStyle(findFooterHost()!.props.style).bottom).toBeUndefined();
      expect(flatStyle(findFrameHost().props.style).paddingBottom).toBeUndefined();
      expect(flatStyle(tr.root.findByType(ScrollView).props.style)).toEqual(scrollStyle);
    } finally {
      addSpy.mockRestore();
      Object.defineProperty(Platform, 'OS', { configurable: true, get: () => originalPlatformOS });
    }
  });

  test('Scroll coordinator measures the focused input and scrolls just enough', () => {
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
    const onScrollLayout = jest.fn();

    try {
      let tr!: TestRenderer.ReactTestRenderer;
      act(() => {
        tr = TestRenderer.create(
          <NuriThemeProvider>
            <FixedRegionLayoutProvider keyboardEnabled>
              <Scroll onLayout={onScrollLayout}>
                <FocusScrollProbe onReady={(next) => (captured.api = next)} />
              </Scroll>
            </FixedRegionLayoutProvider>
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
        api.onInputFocus({ measureLayout } as unknown as TextInput);
      });

      act(() => {
        jest.runAllTimers();
      });

      expect(measureLayout).toHaveBeenCalledTimes(1);
      expect(measureLayout.mock.calls[0][0]).toBe(scrollContentRef);
      expect(scrollTo).toHaveBeenCalledWith({ y: 202, animated: true });
      expect(scrollToSpy).toHaveBeenCalledTimes(1);
      expect(onScrollLayout).toHaveBeenCalledTimes(1);
    } finally {
      getInnerViewRefSpy.mockRestore();
      scrollToSpy.mockRestore();
      jest.useRealTimers();
      global.requestAnimationFrame = originalRequestAnimationFrame;
      global.cancelAnimationFrame = originalCancelAnimationFrame;
    }
  });

  test('Scroll scrolls a focused field away from the keyboard safe edge', () => {
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
            <FixedRegionLayoutProvider keyboardEnabled>
              <Scroll>
                <FocusScrollProbe onReady={(next) => (captured.api = next)} />
              </Scroll>
            </FixedRegionLayoutProvider>
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
        api.onInputFocus({ measureLayout } as unknown as TextInput);
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

      act(() => {
        const show = keyboardHandlers.keyboardWillShow ?? keyboardHandlers.keyboardDidShow;
        show({ endCoordinates: { height: 360 } });
      });
      act(() => {
        jest.runAllTimers();
      });

      expect(scrollTo).toHaveBeenLastCalledWith({ y: 144, animated: true });
      expect(scrollToSpy).toHaveBeenCalledTimes(2);
    } finally {
      addSpy.mockRestore();
      getInnerViewRefSpy.mockRestore();
      scrollToSpy.mockRestore();
      jest.useRealTimers();
      global.requestAnimationFrame = originalRequestAnimationFrame;
      global.cancelAnimationFrame = originalCancelAnimationFrame;
    }
  });

  test('only the Scroll that owns focus adds keyboard content clearance', () => {
    jest.useFakeTimers();
    const originalRequestAnimationFrame = global.requestAnimationFrame;
    const originalCancelAnimationFrame = global.cancelAnimationFrame;
    global.requestAnimationFrame = ((cb: FrameRequestCallback) => setTimeout(() => cb(0), 0) as unknown as number);
    global.cancelAnimationFrame = ((id: number) => clearTimeout(id as unknown as ReturnType<typeof setTimeout>));
    const keyboardHandlers: Record<string, (event: { endCoordinates: { height: number; screenY: number } }) => void> = {};
    const addSpy = jest.spyOn(Keyboard, 'addListener').mockImplementation((eventName, cb) => {
      keyboardHandlers[eventName] = cb as (event: { endCoordinates: { height: number; screenY: number } }) => void;
      return { remove: () => undefined } as never;
    });

    try {
      const tr = render(
        <NuriThemeProvider>
          <FixedRegionLayoutProvider keyboardEnabled>
            <Header>
              <TextField value="" accessibilityLabel="Search" placeholder="Header search" />
            </Header>
            <Scroll>
              <TextField value="" accessibilityLabel="Amount" placeholder="Body field" />
            </Scroll>
          </FixedRegionLayoutProvider>
        </NuriThemeProvider>,
      );
      const scroll = tr.root.findByType(ScrollView);
      const headerInput = tr.root.findAllByType(TextInput).find((node) => node.props.placeholder === 'Header search')!;
      const bodyInput = tr.root.findAllByType(TextInput).find((node) => node.props.placeholder === 'Body field')!;

      act(() => headerInput.props.onFocus({ nativeEvent: {} }));
      act(() => {
        const show = keyboardHandlers.keyboardWillShow ?? keyboardHandlers.keyboardDidShow;
        show({ endCoordinates: { height: 280, screenY: 520 } });
      });
      expect(flatStyle(scroll.props.contentContainerStyle)).toEqual({ flexGrow: 1 });

      act(() => bodyInput.props.onFocus({ nativeEvent: {} }));
      expect(flatStyle(scroll.props.contentContainerStyle).paddingBottom).toBe(368);

      act(() => bodyInput.props.onBlur({ nativeEvent: {} }));
      expect(flatStyle(scroll.props.contentContainerStyle).paddingBottom).toBeUndefined();
    } finally {
      addSpy.mockRestore();
      jest.useRealTimers();
      global.requestAnimationFrame = originalRequestAnimationFrame;
      global.cancelAnimationFrame = originalCancelAnimationFrame;
    }
  });

  test('blur clears the current focus target before later keyboard growth', () => {
    jest.useFakeTimers();
    const originalRequestAnimationFrame = global.requestAnimationFrame;
    const originalCancelAnimationFrame = global.cancelAnimationFrame;
    global.requestAnimationFrame = ((cb: FrameRequestCallback) => setTimeout(() => cb(0), 0) as unknown as number);
    global.cancelAnimationFrame = ((id: number) => clearTimeout(id as unknown as ReturnType<typeof setTimeout>));

    const keyboardHandlers: Record<string, (event: { endCoordinates: { height: number } }) => void> = {};
    const scrollContentRef = {};
    const addSpy = jest
      .spyOn(Keyboard, 'addListener')
      .mockImplementation((eventName, cb) => {
        keyboardHandlers[eventName] = cb as (event: { endCoordinates: { height: number } }) => void;
        return { remove: () => undefined } as never;
      });
    const getInnerViewRefSpy = jest
      .spyOn(ScrollView.prototype as ScrollViewWithInnerRef, 'getInnerViewRef')
      .mockReturnValue(scrollContentRef as never);
    const scrollToSpy = jest.spyOn(ScrollView.prototype, 'scrollTo').mockImplementation(() => undefined);
    const measureLayout = jest.fn((_relativeNode, onSuccess: (x: number, y: number, width: number, height: number) => void) => {
      onSuccess(0, 360, 120, 54);
    });
    const input = { measureLayout } as unknown as TextInput;
    const captured = { api: null as FocusScrollApi | null };

    try {
      const tr = render(
        <NuriThemeProvider>
          <FixedRegionLayoutProvider keyboardEnabled>
            <Scroll>
              <FocusScrollProbe onReady={(next) => (captured.api = next)} />
            </Scroll>
          </FixedRegionLayoutProvider>
        </NuriThemeProvider>,
      );
      act(() => {
        tr.root.findByType(ScrollView).props.onLayout({ nativeEvent: { layout: { height: 600 } } });
      });

      const api = captured.api;
      expectFocusScrollApi(api);
      act(() => api.onInputFocus(input));
      act(() => jest.runAllTimers());
      expect(measureLayout).toHaveBeenCalledTimes(1);

      act(() => api.onInputBlur(input));
      act(() => {
        const show = keyboardHandlers.keyboardWillShow ?? keyboardHandlers.keyboardDidShow;
        show({ endCoordinates: { height: 280 } });
      });
      act(() => jest.runAllTimers());

      expect(measureLayout).toHaveBeenCalledTimes(1);
    } finally {
      addSpy.mockRestore();
      getInnerViewRefSpy.mockRestore();
      scrollToSpy.mockRestore();
      jest.useRealTimers();
      global.requestAnimationFrame = originalRequestAnimationFrame;
      global.cancelAnimationFrame = originalCancelAnimationFrame;
    }
  });

  test('blur from the previous input does not clear the newer focus target', () => {
    jest.useFakeTimers();
    const originalRequestAnimationFrame = global.requestAnimationFrame;
    const originalCancelAnimationFrame = global.cancelAnimationFrame;
    global.requestAnimationFrame = ((cb: FrameRequestCallback) => setTimeout(() => cb(0), 0) as unknown as number);
    global.cancelAnimationFrame = ((id: number) => clearTimeout(id as unknown as ReturnType<typeof setTimeout>));

    const keyboardHandlers: Record<string, (event: { endCoordinates: { height: number } }) => void> = {};
    const addSpy = jest
      .spyOn(Keyboard, 'addListener')
      .mockImplementation((eventName, cb) => {
        keyboardHandlers[eventName] = cb as (event: { endCoordinates: { height: number } }) => void;
        return { remove: () => undefined } as never;
      });
    const getInnerViewRefSpy = jest
      .spyOn(ScrollView.prototype as ScrollViewWithInnerRef, 'getInnerViewRef')
      .mockReturnValue({} as never);
    const scrollToSpy = jest.spyOn(ScrollView.prototype, 'scrollTo').mockImplementation(() => undefined);
    const measureA = jest.fn();
    const measureB = jest.fn((_relativeNode, onSuccess: (x: number, y: number, width: number, height: number) => void) => {
      onSuccess(0, 360, 120, 54);
    });
    const inputA = { measureLayout: measureA } as unknown as TextInput;
    const inputB = { measureLayout: measureB } as unknown as TextInput;
    const captured = { api: null as FocusScrollApi | null };

    try {
      const tr = render(
        <NuriThemeProvider>
          <FixedRegionLayoutProvider keyboardEnabled>
            <Scroll>
              <FocusScrollProbe onReady={(next) => (captured.api = next)} />
            </Scroll>
          </FixedRegionLayoutProvider>
        </NuriThemeProvider>,
      );
      act(() => {
        tr.root.findByType(ScrollView).props.onLayout({ nativeEvent: { layout: { height: 600 } } });
      });

      const api = captured.api;
      expectFocusScrollApi(api);
      act(() => {
        api.onInputFocus(inputA);
        api.onInputFocus(inputB);
        api.onInputBlur(inputA);
        const show = keyboardHandlers.keyboardWillShow ?? keyboardHandlers.keyboardDidShow;
        show({ endCoordinates: { height: 280 } });
      });
      act(() => jest.runAllTimers());

      expect(measureA).not.toHaveBeenCalled();
      expect(measureB).toHaveBeenCalledTimes(1);
    } finally {
      addSpy.mockRestore();
      getInnerViewRefSpy.mockRestore();
      scrollToSpy.mockRestore();
      jest.useRealTimers();
      global.requestAnimationFrame = originalRequestAnimationFrame;
      global.cancelAnimationFrame = originalCancelAnimationFrame;
    }
  });

  test('Scroll uses window coordinates to clear the keyboard edge', () => {
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
            <FixedRegionLayoutProvider keyboardEnabled>
              <Scroll>
                <FocusScrollProbe onReady={(next) => (captured.api = next)} />
              </Scroll>
            </FixedRegionLayoutProvider>
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
        api.onInputFocus(Object.assign(inputRef, { measureLayout }) as unknown as TextInput);
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

  test('Scroll does not scroll a focused field that is already visible after prior scroll', () => {
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
            <FixedRegionLayoutProvider keyboardEnabled>
              <Scroll>
                <FocusScrollProbe onReady={(next) => (captured.api = next)} />
              </Scroll>
            </FixedRegionLayoutProvider>
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
        api.onInputFocus({ measureLayout } as unknown as TextInput);
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

  test('Scroll scrolls a hidden bottom-edge field with existing scroll offset', () => {
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
            <FixedRegionLayoutProvider keyboardEnabled>
              <Scroll>
                <FocusScrollProbe onReady={(next) => (captured.api = next)} />
              </Scroll>
            </FixedRegionLayoutProvider>
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
        api.onInputFocus({ measureLayout } as unknown as TextInput);
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

  test('Scroll focus-scroll safe top is local and does not add Header height', () => {
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
              <Modal open mode="full">
                <ModalPanel>
                  <Header>
                    <Button>Close</Button>
                  </Header>
                  <Scroll>
                    <FocusScrollProbe onReady={(next) => (captured.api = next)} />
                  </Scroll>
                </ModalPanel>
              </Modal>
            </OverlayProvider>
          </NuriThemeProvider>,
        );
      });

      const scroll = tr.root.findByType(ScrollView);
      act(() => {
        scroll.props.onLayout({ nativeEvent: { layout: { height: 600 } } });
        scroll.props.onScroll({ nativeEvent: { contentOffset: { y: 100 } } });
      });

      const api = captured.api;
      expectFocusScrollApi(api);
      act(() => {
        api.onInputFocus({ measureLayout } as unknown as TextInput);
      });
      act(() => {
        jest.runAllTimers();
      });

      expect(scrollTo).toHaveBeenCalledWith({ y: 94, animated: true });
      expect(scrollToSpy).toHaveBeenCalledTimes(1);
    } finally {
      getInnerViewRefSpy.mockRestore();
      scrollToSpy.mockRestore();
      jest.useRealTimers();
      global.requestAnimationFrame = originalRequestAnimationFrame;
      global.cancelAnimationFrame = originalCancelAnimationFrame;
    }
  });

  test('sheet-mode Scroll ignores keyboard geometry while the dev tripwire observes it', () => {
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
          <OverlayProvider>
            <Modal open mode="sheet">
              <ModalPanel>
                <Scroll>
                  <Text>Field</Text>
                </Scroll>
                <Footer><Button>Continue</Button></Footer>
              </ModalPanel>
            </Modal>
          </OverlayProvider>
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

      const contentStyle = scroll.props.contentContainerStyle as unknown;
      const flat = Array.isArray(contentStyle)
        ? Object.assign({}, ...contentStyle.filter(Boolean))
        : contentStyle as Record<string, unknown>;
      expect(flat).toEqual({ flexGrow: 1 });
      const footer = tr.root.findAllByType(View).find((node) => flatStyle(node.props.style).flexShrink === 0);
      expect(flatStyle(footer!.props.style).bottom).toBeUndefined();
    } finally {
      addSpy.mockRestore();
    }
  });

  test('one TextField focus event registers, toggles the ring, and calls the consumer', () => {
    const captured = { api: null as FocusScrollApi | null };
    const onInputFocus = jest.fn();
    const onInputBlur = jest.fn();
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    const tr = render(
      <NuriThemeProvider>
        <FixedRegionLayoutProvider keyboardEnabled>
          <Scroll>
            <FocusScrollProbe onReady={(next) => (captured.api = next)} />
            <TextField value="" onFocus={onFocus} onBlur={onBlur} placeholder="Name">
              <TextFieldLabel>Recipient</TextFieldLabel>
            </TextField>
          </Scroll>
        </FixedRegionLayoutProvider>
      </NuriThemeProvider>,
    );

    const api = captured.api;
    expectFocusScrollApi(api);
    api.onInputFocus = onInputFocus;
    api.onInputBlur = onInputBlur;

    const input = tr.root.findByType(TextInput);
    act(() => {
      input.props.onFocus();
    });

    expect(onInputFocus).toHaveBeenCalledTimes(1);
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(
      tr.root.findAllByType(View).some((node) => {
        const style = flatStyle(node.props.style);
        return style.position === 'absolute' && style.borderWidth === 2;
      }),
    ).toBe(true);

    act(() => input.props.onBlur());
    expect(onInputBlur).toHaveBeenCalledTimes(1);
    expect(onBlur).toHaveBeenCalledTimes(1);
    expect(
      tr.root.findAllByType(View).some((node) => {
        const style = flatStyle(node.props.style);
        return style.position === 'absolute' && style.borderWidth === 2;
      }),
    ).toBe(false);
  });

  test('a throwing consumer onFocus cannot prevent registration or the focus ring', () => {
    const captured = { api: null as FocusScrollApi | null };
    const onInputFocus = jest.fn();
    const consumerError = new Error('consumer focus failure');
    const onFocus = jest.fn(() => {
      throw consumerError;
    });
    const tr = render(
      <NuriThemeProvider>
        <FixedRegionLayoutProvider keyboardEnabled>
          <Scroll>
            <FocusScrollProbe onReady={(next) => (captured.api = next)} />
            <TextField value="" onFocus={onFocus}>
              <TextFieldLabel>Recipient</TextFieldLabel>
            </TextField>
          </Scroll>
        </FixedRegionLayoutProvider>
      </NuriThemeProvider>,
    );

    const api = captured.api;
    expectFocusScrollApi(api);
    api.onInputFocus = onInputFocus;
    let thrown: unknown;
    act(() => {
      try {
        tr.root.findByType(TextInput).props.onFocus();
      } catch (error) {
        thrown = error;
      }
    });

    expect(thrown).toBe(consumerError);
    expect(onInputFocus).toHaveBeenCalledTimes(1);
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(
      tr.root.findAllByType(View).some((node) => {
        const style = flatStyle(node.props.style);
        return style.position === 'absolute' && style.borderWidth === 2;
      }),
    ).toBe(true);
  });

  test('without Scroll, TextField focus remains a normal public focus event', () => {
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
