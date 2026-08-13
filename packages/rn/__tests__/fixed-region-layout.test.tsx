import * as React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Keyboard, Platform, View } from 'react-native';
import type { KeyboardEvent, LayoutChangeEvent } from 'react-native';
import {
  FixedRegionLayoutProvider,
  useFixedRegionLayout,
  useRegisterDockInset,
} from '../primitives/FixedRegionLayout';

type DockEdge = Parameters<typeof useRegisterDockInset>[0];
type DockChannel = 'dockTopInset' | 'dockBottomInset';

const CHANNEL_BY_EDGE: Record<DockEdge, DockChannel> = {
  top: 'dockTopInset',
  bottom: 'dockBottomInset',
};

function DockRegion({
  edge,
  onLayout,
}: {
  edge: DockEdge;
  onLayout?: (event: LayoutChangeEvent) => void;
}): React.ReactElement {
  return <View onLayout={useRegisterDockInset(edge, onLayout)} />;
}

function LayoutProbe({
  onValue,
}: {
  onValue: (value: ReturnType<typeof useFixedRegionLayout>) => void;
}): null {
  const value = useFixedRegionLayout();
  React.useEffect(() => {
    onValue(value);
  }, [onValue, value]);
  return null;
}

function DockHarness({
  edge,
  mounted,
  consumerOnLayout,
  onValue,
}: {
  edge: DockEdge;
  mounted: boolean;
  consumerOnLayout: (event: LayoutChangeEvent) => void;
  onValue: (value: ReturnType<typeof useFixedRegionLayout>) => void;
}): React.ReactElement {
  return (
    <FixedRegionLayoutProvider>
      {mounted ? <DockRegion edge={edge} onLayout={consumerOnLayout} /> : null}
      <LayoutProbe onValue={onValue} />
    </FixedRegionLayoutProvider>
  );
}

describe('useRegisterDockInset', () => {
  test.each<DockEdge>(['top', 'bottom'])(
    '%s rounds, reports, composes consumer layout, and cleans up to zero',
    (edge) => {
      const consumerOnLayout = jest.fn();
      let current!: ReturnType<typeof useFixedRegionLayout>;
      let tr!: TestRenderer.ReactTestRenderer;
      act(() => {
        tr = TestRenderer.create(
          <DockHarness
            edge={edge}
            mounted
            consumerOnLayout={consumerOnLayout}
            onValue={(value) => (current = value)}
          />,
        );
      });

      const event = { nativeEvent: { layout: { height: 42.6 } } } as LayoutChangeEvent;
      act(() => tr.root.findByType(View).props.onLayout(event));

      expect(current[CHANNEL_BY_EDGE[edge]]).toBe(43);
      expect(consumerOnLayout).toHaveBeenCalledTimes(1);
      expect(consumerOnLayout).toHaveBeenCalledWith(event);

      act(() => tr.root.findByType(View).props.onLayout(event));
      expect(current[CHANNEL_BY_EDGE[edge]]).toBe(43);
      expect(consumerOnLayout).toHaveBeenCalledTimes(2);

      act(() => {
        tr.update(
          <DockHarness
            edge={edge}
            mounted={false}
            consumerOnLayout={consumerOnLayout}
            onValue={(value) => (current = value)}
          />,
        );
      });
      expect(current[CHANNEL_BY_EDGE[edge]]).toBe(0);
    },
  );
});

describe('FixedRegionLayoutProvider keyboard frame geometry', () => {
  const originalPlatformOS = Platform.OS;

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { configurable: true, get: () => originalPlatformOS });
    jest.restoreAllMocks();
  });

  test('iOS show, frame growth, and hide update one structural frame inset', () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, get: () => 'ios' });
    const handlers: Partial<Record<string, (event: KeyboardEvent) => void>> = {};
    jest.spyOn(Keyboard, 'addListener').mockImplementation((eventName, callback) => {
      handlers[eventName] = callback;
      return { remove: () => undefined } as never;
    });
    const schedule = jest.spyOn(Keyboard, 'scheduleLayoutAnimation').mockImplementation(() => undefined);
    let current!: ReturnType<typeof useFixedRegionLayout>;

    act(() => {
      TestRenderer.create(
        <FixedRegionLayoutProvider hostGeometry="fill" keyboardEnabled windowHeight={800}>
          <LayoutProbe onValue={(value) => (current = value)} />
        </FixedRegionLayoutProvider>,
      );
    });

    expect(current.hostGeometry).toBe('fill');
    expect(current.frameKeyboardInset).toBe(0);
    expect(handlers.keyboardWillShow).toEqual(expect.any(Function));
    expect(handlers.keyboardWillChangeFrame).toEqual(expect.any(Function));
    expect(handlers.keyboardWillHide).toEqual(expect.any(Function));

    const show = { endCoordinates: { height: 280, screenY: 520 } } as KeyboardEvent;
    act(() => handlers.keyboardWillShow?.(show));
    expect(current.frameKeyboardInset).toBe(280);

    const grow = { endCoordinates: { height: 360, screenY: 440 } } as KeyboardEvent;
    act(() => handlers.keyboardWillChangeFrame?.(grow));
    expect(current.frameKeyboardInset).toBe(360);

    const dismissFrame = { endCoordinates: { height: 360, screenY: 800 } } as KeyboardEvent;
    act(() => handlers.keyboardWillChangeFrame?.(dismissFrame));
    expect(current.frameKeyboardInset).toBe(360);

    const hardwareKeyboard = { endCoordinates: { height: 0, screenY: 0 } } as KeyboardEvent;
    act(() => handlers.keyboardWillChangeFrame?.(hardwareKeyboard));
    expect(current.frameKeyboardInset).toBe(0);

    const hide = { endCoordinates: { height: 0, screenY: 800 } } as KeyboardEvent;
    act(() => handlers.keyboardWillHide?.(hide));
    expect(current.frameKeyboardInset).toBe(0);
    expect(schedule.mock.calls.map(([event]) => event)).toEqual([show, grow, hardwareKeyboard]);
  });

  test('Android applies only keyboard occlusion not already consumed by a window resize', () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, get: () => 'android' });
    const handlers: Partial<Record<string, (event: KeyboardEvent) => void>> = {};
    jest.spyOn(Keyboard, 'addListener').mockImplementation((eventName, callback) => {
      handlers[eventName] = callback;
      return { remove: () => undefined } as never;
    });
    let current!: ReturnType<typeof useFixedRegionLayout>;
    const tree = (windowHeight: number) => (
      <FixedRegionLayoutProvider hostGeometry="fill" keyboardEnabled windowHeight={windowHeight}>
        <LayoutProbe onValue={(value) => (current = value)} />
      </FixedRegionLayoutProvider>
    );
    let tr!: TestRenderer.ReactTestRenderer;
    act(() => {
      tr = TestRenderer.create(tree(800));
    });

    expect(handlers.keyboardDidShow).toEqual(expect.any(Function));
    expect(handlers.keyboardWillChangeFrame).toBeUndefined();
    act(() => handlers.keyboardDidShow?.({ endCoordinates: { height: 280, screenY: 520 } } as KeyboardEvent));
    expect(current.frameKeyboardInset).toBe(280);

    act(() => tr.update(tree(520)));
    expect(current.frameKeyboardInset).toBe(0);
  });

  test('Android screen geometry includes the system-bar strip omitted from keyboard height', () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, get: () => 'android' });
    const handlers: Partial<Record<string, (event: KeyboardEvent) => void>> = {};
    jest.spyOn(Keyboard, 'addListener').mockImplementation((eventName, callback) => {
      handlers[eventName] = callback;
      return { remove: () => undefined } as never;
    });
    let current!: ReturnType<typeof useFixedRegionLayout>;

    act(() => {
      TestRenderer.create(
        <FixedRegionLayoutProvider hostGeometry="fill" keyboardEnabled windowHeight={914.2857}>
          <LayoutProbe onValue={(value) => (current = value)} />
        </FixedRegionLayoutProvider>,
      );
    });

    act(() => handlers.keyboardDidShow?.({
      endCoordinates: { height: 340.9524, screenY: 549.3333 },
    } as KeyboardEvent));

    // Physical Expo Go evidence: 914 - 549 = 365. The 341dp event height
    // excludes the 24dp navigation strip, so height alone would overlap it.
    expect(current.keyboardHeight).toBe(341);
    expect(current.keyboardScreenY).toBe(549);
    expect(current.frameKeyboardInset).toBe(365);
  });

  test('ownership disable clears an unmatched frame and consecutive shows still refire', () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, get: () => 'ios' });
    const handlers: Partial<Record<string, Set<(event: KeyboardEvent) => void>>> = {};
    jest.spyOn(Keyboard, 'addListener').mockImplementation((eventName, callback) => {
      handlers[eventName] ??= new Set();
      handlers[eventName]!.add(callback);
      return { remove: () => handlers[eventName]?.delete(callback) } as never;
    });
    let current!: ReturnType<typeof useFixedRegionLayout>;
    const tree = (keyboardEnabled: boolean) => (
      <FixedRegionLayoutProvider
        hostGeometry="fill"
        keyboardEnabled={keyboardEnabled}
        windowHeight={800}
      >
        <LayoutProbe onValue={(value) => (current = value)} />
      </FixedRegionLayoutProvider>
    );
    let tr!: TestRenderer.ReactTestRenderer;
    act(() => {
      tr = TestRenderer.create(tree(true));
    });

    const fireShow = (height: number) => {
      for (const show of [...(handlers.keyboardWillShow ?? [])]) {
        show({ endCoordinates: { height, screenY: 800 - height } } as KeyboardEvent);
      }
    };
    act(() => fireShow(280));
    expect(current.frameKeyboardInset).toBe(280);
    act(() => fireShow(360));
    expect(current.frameKeyboardInset).toBe(360);

    act(() => tr.update(tree(false)));
    expect(current.keyboardEnabled).toBe(false);
    expect(current.keyboardHeight).toBe(0);
    expect(current.keyboardScreenY).toBeNull();
    expect(current.frameKeyboardInset).toBe(0);
    expect(handlers.keyboardWillShow?.size ?? 0).toBe(0);

    act(() => tr.update(tree(true)));
    expect(current.keyboardEnabled).toBe(true);
    expect(current.keyboardHeight).toBe(0);
    expect(current.keyboardScreenY).toBeNull();
    expect(current.frameKeyboardInset).toBe(0);
    expect(handlers.keyboardWillShow?.size).toBe(1);
  });

});
