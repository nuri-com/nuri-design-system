/* ══════════════════════════════════════════════════════════════════
 * NURI · TOAST · overlay tenant #2
 *
 * Locks the imperative contract: top-stack re-registration, replace/timer
 * semantics, sticky mode, exit-before-unregister, safe-area placement,
 * pointer transparency, back pass-through, and the provider-less warning.
 * ══════════════════════════════════════════════════════════════════ */

import * as React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Animated, BackHandler, Text, View } from 'react-native';

import {
  NuriSafeAreaProvider,
  OverlayProvider,
  ToastProvider,
  useOverlay,
  useToast,
} from '../index';
import type { OverlayApi, ToastApi } from '../index';
import { space } from '../generated/data/tokens';

type ExitCallback = ((result: { finished: boolean }) => void) | undefined;

function RuntimeProbe({
  onReady,
}: {
  onReady: (toast: ToastApi, overlay: OverlayApi) => void;
}): null {
  const toast = useToast();
  const overlay = useOverlay();
  React.useEffect(() => onReady(toast, overlay), [onReady, overlay, toast]);
  return null;
}

function ToastProbe({ onReady }: { onReady: (toast: ToastApi) => void }): null {
  const toast = useToast();
  React.useEffect(() => onReady(toast), [onReady, toast]);
  return null;
}

function renderRuntime(
  onReady: (toast: ToastApi, overlay: OverlayApi) => void,
): TestRenderer.ReactTestRenderer {
  let tr!: TestRenderer.ReactTestRenderer;
  act(() => {
    tr = TestRenderer.create(
      <OverlayProvider>
        <NuriSafeAreaProvider top={44} bottom={34}>
          <ToastProvider>
            <RuntimeProbe onReady={onReady} />
          </ToastProvider>
        </NuriSafeAreaProvider>
      </OverlayProvider>,
    );
  });
  return tr;
}

function textsInTree(tr: TestRenderer.ReactTestRenderer): string[] {
  return tr.root.findAllByType(Text).map((node) => node.props.children as string);
}

function flatStyle(style: unknown): Record<string, unknown> {
  return Array.isArray(style)
    ? Object.assign({}, ...style.filter(Boolean))
    : ((style ?? {}) as Record<string, unknown>);
}

function gestureSurface(
  tr: TestRenderer.ReactTestRenderer,
): TestRenderer.ReactTestInstance {
  return tr.root.find((node) => typeof node.props.onResponderMove === 'function');
}

function panEvent({
  currentY = 0,
  previousY = 0,
  timestamp = 1,
}: {
  currentY?: number;
  previousY?: number;
  timestamp?: number;
} = {}): never {
  return {
    nativeEvent: { touches: [{}] },
    touchHistory: {
      indexOfSingleActiveTouch: 0,
      mostRecentTimeStamp: timestamp,
      numberActiveTouches: 1,
      touchBank: [{
        currentPageX: 0,
        currentPageY: currentY,
        currentTimeStamp: timestamp,
        previousPageX: 0,
        previousPageY: previousY,
        previousTimeStamp: Math.max(0, timestamp - 100),
        startPageX: 0,
        startPageY: 0,
        startTimeStamp: 0,
        touchActive: true,
      }],
    },
  } as never;
}

describe('ToastProvider', () => {
  let exits: ExitCallback[];
  let flings: ExitCallback[];
  let timing: jest.SpyInstance;
  let spring: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    exits = [];
    flings = [];
    timing = jest.spyOn(Animated, 'timing').mockImplementation(
      (_value, config) =>
        ({
          start: (callback?: ExitCallback) => {
            if (config.toValue === 0) exits.push(callback);
            else if (typeof config.toValue === 'number' && config.toValue < 0) {
              flings.push(callback);
            }
            else callback?.({ finished: true });
          },
          stop: jest.fn(),
          reset: jest.fn(),
        }) as unknown as ReturnType<typeof Animated.timing>,
    );
    spring = jest.spyOn(Animated, 'spring').mockImplementation(
      () =>
        ({
          start: (callback?: ExitCallback) => callback?.({ finished: true }),
          stop: jest.fn(),
          reset: jest.fn(),
        }) as unknown as ReturnType<typeof Animated.spring>,
    );
  });

  afterEach(() => {
    spring.mockRestore();
    timing.mockRestore();
    jest.useRealTimers();
  });

  function finishExit(): void {
    const callback = exits.shift();
    expect(callback).toEqual(expect.any(Function));
    act(() => callback?.({ finished: true }));
  }

  function finishFling(): void {
    const callback = flings.shift();
    expect(callback).toEqual(expect.any(Function));
    act(() => callback?.({ finished: true }));
  }

  test('show registers above an open sheet and bakes safe-area placement into a transparent layer', () => {
    let toast!: ToastApi;
    let overlay!: OverlayApi;
    const tr = renderRuntime((nextToast, nextOverlay) => {
      toast = nextToast;
      overlay = nextOverlay;
    });

    act(() => overlay.register('sheet', <Text>Sheet</Text>));
    act(() => toast.show(<Text>Toast</Text>, { duration: 0 }));

    expect(textsInTree(tr)).toEqual(['Sheet', 'Toast']);
    const positionedLayer = tr.root.findAllByType(View).find((node) => {
      const style = flatStyle(node.props.style);
      return style.paddingTop === 44 + space.md;
    });
    expect(positionedLayer).toBeDefined();
    expect(positionedLayer!.props.pointerEvents).toBe('box-none');
    expect(flatStyle(positionedLayer!.props.style).paddingHorizontal).toBe(space.lg);
    expect(timing).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ duration: 280, toValue: 1, useNativeDriver: true }),
    );
  });

  test('replace restarts the timer and re-registers the toast at the top', () => {
    let toast!: ToastApi;
    let overlay!: OverlayApi;
    const tr = renderRuntime((nextToast, nextOverlay) => {
      toast = nextToast;
      overlay = nextOverlay;
    });

    act(() => overlay.register('sheet', <Text>Sheet</Text>));
    act(() => toast.show(<Text>First</Text>, { duration: 1000 }));
    act(() => jest.advanceTimersByTime(500));
    // Accepted v1 edge: a layer opened during the live window eclipses it…
    act(() => overlay.register('late-sheet', <Text>Late sheet</Text>));
    expect(textsInTree(tr)).toEqual(['Sheet', 'First', 'Late sheet']);

    // …until show is called again. Replace must move the single toast to top.
    act(() => toast.show(<Text>Second</Text>, { duration: 1000 }));
    expect(textsInTree(tr)).toEqual(['Sheet', 'Late sheet', 'Second']);

    act(() => jest.advanceTimersByTime(999));
    expect(exits).toHaveLength(0);
    act(() => jest.advanceTimersByTime(1));
    expect(exits).toHaveLength(1);
    finishExit();
    expect(textsInTree(tr)).toEqual(['Sheet', 'Late sheet']);
  });

  test('the default 3500ms auto-dismiss waits for exit before unregistering', () => {
    let toast!: ToastApi;
    const tr = renderRuntime((nextToast) => { toast = nextToast; });

    act(() => toast.show(<Text>Timed</Text>));
    act(() => jest.advanceTimersByTime(3499));
    expect(exits).toHaveLength(0);
    act(() => jest.advanceTimersByTime(1));
    expect(textsInTree(tr)).toContain('Timed');
    expect(timing).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ duration: 220, toValue: 0, useNativeDriver: true }),
    );

    finishExit();
    expect(textsInTree(tr)).not.toContain('Timed');
  });

  test('duration 0 and null are sticky until replaced or hidden', () => {
    let toast!: ToastApi;
    const tr = renderRuntime((nextToast) => { toast = nextToast; });

    act(() => toast.show(<Text>Zero</Text>, { duration: 0 }));
    act(() => jest.advanceTimersByTime(20_000));
    expect(textsInTree(tr)).toContain('Zero');
    expect(exits).toHaveLength(0);

    act(() => toast.show(<Text>Null</Text>, { duration: null }));
    act(() => jest.advanceTimersByTime(20_000));
    expect(textsInTree(tr)).toContain('Null');
    expect(exits).toHaveLength(0);
  });

  test('hide animates out, then unregisters', () => {
    let toast!: ToastApi;
    const tr = renderRuntime((nextToast) => { toast = nextToast; });

    act(() => toast.show(<Text>Sticky</Text>, { duration: 0 }));
    act(() => toast.hide());
    expect(textsInTree(tr)).toContain('Sticky');
    finishExit();
    expect(textsInTree(tr)).not.toContain('Sticky');
  });

  test('claims clear vertical movement but not touch-start or a small tap', () => {
    let toast!: ToastApi;
    const tr = renderRuntime((nextToast) => { toast = nextToast; });

    act(() => toast.show(<Text>Swipeable</Text>, { duration: 0 }));
    const surface = gestureSurface(tr);
    const start = panEvent();
    const smallMove = panEvent({ currentY: -3, timestamp: 101 });
    const verticalMove = panEvent({ currentY: -7, timestamp: 201 });

    expect(surface.props.onStartShouldSetResponderCapture(start)).toBe(false);
    expect(surface.props.onStartShouldSetResponder(start)).toBe(false);
    expect(surface.props.onMoveShouldSetResponderCapture(smallMove)).toBe(false);
    expect(surface.props.onMoveShouldSetResponder(smallMove)).toBe(false);
    expect(surface.props.onMoveShouldSetResponderCapture(verticalMove)).toBe(false);
    expect(surface.props.onMoveShouldSetResponder(verticalMove)).toBe(true);
  });

  test('swiping past the dismiss threshold unregisters after the fling and exit', () => {
    let toast!: ToastApi;
    const tr = renderRuntime((nextToast) => { toast = nextToast; });

    act(() => toast.show(<Text>Dismiss me</Text>, { duration: 0 }));
    const surface = gestureSurface(tr);
    act(() => {
      surface.props.onLayout({ nativeEvent: { layout: { height: 100 } } });
      surface.props.onResponderGrant(panEvent());
      surface.props.onResponderMove(panEvent({ currentY: -60, timestamp: 101 }));
      surface.props.onResponderRelease(panEvent({ currentY: -60, timestamp: 101 }));
    });

    expect(flings).toHaveLength(1);
    expect(textsInTree(tr)).toContain('Dismiss me');
    finishFling();
    expect(exits).toHaveLength(1);
    expect(textsInTree(tr)).toContain('Dismiss me');
    finishExit();
    expect(textsInTree(tr)).not.toContain('Dismiss me');
  });

  test('a short swipe springs back, stays visible, and restarts its timer fresh', () => {
    let toast!: ToastApi;
    const tr = renderRuntime((nextToast) => { toast = nextToast; });

    act(() => toast.show(<Text>Return</Text>, { duration: 1000 }));
    const surface = gestureSurface(tr);
    act(() => {
      surface.props.onLayout({ nativeEvent: { layout: { height: 100 } } });
      surface.props.onResponderGrant(panEvent());
      surface.props.onResponderMove(panEvent({ currentY: -20, timestamp: 101 }));
      surface.props.onResponderRelease(panEvent({ currentY: -20, timestamp: 101 }));
    });

    expect(spring).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ toValue: 0, useNativeDriver: false }),
    );
    act(() => jest.advanceTimersByTime(999));
    expect(exits).toHaveLength(0);
    expect(textsInTree(tr)).toContain('Return');
    act(() => jest.advanceTimersByTime(1));
    expect(exits).toHaveLength(1);
  });

  test('pauses the auto-dismiss timer while the responder is held', () => {
    let toast!: ToastApi;
    const tr = renderRuntime((nextToast) => { toast = nextToast; });

    act(() => toast.show(<Text>Hold</Text>, { duration: 1000 }));
    const surface = gestureSurface(tr);
    act(() => jest.advanceTimersByTime(999));
    act(() => surface.props.onResponderGrant(panEvent()));
    act(() => jest.advanceTimersByTime(1000));

    expect(exits).toHaveLength(0);
    expect(textsInTree(tr)).toContain('Hold');
  });

  test('show during an in-flight fling wins the animation-generation race', () => {
    let toast!: ToastApi;
    const tr = renderRuntime((nextToast) => { toast = nextToast; });

    act(() => toast.show(<Text>First</Text>, { duration: 0 }));
    const surface = gestureSurface(tr);
    act(() => {
      surface.props.onLayout({ nativeEvent: { layout: { height: 100 } } });
      surface.props.onResponderGrant(panEvent());
      surface.props.onResponderMove(panEvent({ currentY: -60, timestamp: 101 }));
      surface.props.onResponderRelease(panEvent({ currentY: -60, timestamp: 101 }));
    });
    expect(flings).toHaveLength(1);

    act(() => toast.show(<Text>Second</Text>, { duration: 0 }));
    finishFling();

    expect(exits).toHaveLength(0);
    expect(textsInTree(tr)).toContain('Second');
    expect(textsInTree(tr)).not.toContain('First');
  });

  test('Android back passes through the toast and dismisses the sheet', () => {
    const handlers: Array<() => boolean | null | undefined> = [];
    const addSpy = jest
      .spyOn(BackHandler, 'addEventListener')
      .mockImplementation((_event, handler) => {
        handlers.push(handler);
        return { remove: () => undefined } as never;
      });
    let toast!: ToastApi;
    let overlay!: OverlayApi;
    const closeSheet = jest.fn();

    try {
      renderRuntime((nextToast, nextOverlay) => {
        toast = nextToast;
        overlay = nextOverlay;
      });
      act(() => overlay.register('sheet', <Text>Sheet</Text>, { onRequestClose: closeSheet }));
      act(() => toast.show(<Text>Toast</Text>, { duration: 0 }));

      let handled = false;
      act(() => { handled = handlers[handlers.length - 1]() ?? false; });
      expect(handled).toBe(true);
      expect(closeSheet).toHaveBeenCalledTimes(1);
    } finally {
      addSpy.mockRestore();
    }
  });
});

test('provider-less useToast is inert and warns in development', () => {
  const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  let toast!: ToastApi;
  try {
    act(() => {
      TestRenderer.create(<ToastProbe onReady={(next) => { toast = next; }} />);
    });
    expect(() => toast.show(<Text>Nowhere</Text>)).not.toThrow();
    expect(() => toast.hide()).not.toThrow();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('without a <ToastProvider>');
  } finally {
    warn.mockRestore();
  }
});
