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
import { BackHandler, KeyboardAvoidingView, Text, TextInput, View } from 'react-native';
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
});
