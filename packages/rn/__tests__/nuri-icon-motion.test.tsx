import * as React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { AccessibilityInfo, Animated } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { NuriIcon } from '../primitives/NuriIcon';
import { NuriThemeProvider } from '../theme';

type Renderer = TestRenderer.ReactTestRenderer;

async function renderIcon(name: 'apple' | 'spinner'): Promise<Renderer> {
  let renderer!: Renderer;
  await act(async () => {
    renderer = TestRenderer.create(
      <NuriThemeProvider>
        <NuriIcon name={name} />
      </NuriThemeProvider>,
    );
    await Promise.resolve();
  });
  return renderer;
}

function mockReducedMotion(enabled: boolean) {
  jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(enabled);
  jest.spyOn(AccessibilityInfo, 'addEventListener').mockReturnValue({
    remove: jest.fn(),
  } as unknown as ReturnType<typeof AccessibilityInfo.addEventListener>);
}

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('ring motion glyph renders four phase-offset arcs with registry-derived timing', async () => {
  mockReducedMotion(false);
  const loopStart = jest.fn();
  const loopStop = jest.fn();
  const timing = jest.spyOn(Animated, 'timing');
  jest.spyOn(Animated, 'loop').mockReturnValue({
    start: loopStart,
    stop: loopStop,
    reset: jest.fn(),
  });

  const renderer = await renderIcon('spinner');
  expect(renderer.root.findByProps({ testID: 'spinner-ring' })).toBeTruthy();
  expect(renderer.root.findAllByType(Animated.View)).toHaveLength(5);
  expect(renderer.root.findAllByType(SvgXml)).toHaveLength(0);
  expect(timing).toHaveBeenCalledWith(expect.any(Animated.Value), expect.objectContaining({
    toValue: 1,
    duration: 960,
    easing: expect.any(Function),
    useNativeDriver: true,
  }));
  expect(loopStart).toHaveBeenCalledTimes(1);

  act(() => renderer.unmount());
  expect(loopStop).toHaveBeenCalledTimes(1);
});

test('static glyph keeps the direct SvgXml path and does not subscribe to reduced motion', async () => {
  const reducedMotion = jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled');
  const renderer = await renderIcon('apple');

  expect(renderer.root.findAllByType(Animated.View)).toHaveLength(0);
  expect(renderer.root.findAllByType(SvgXml)).toHaveLength(1);
  expect(reducedMotion).not.toHaveBeenCalled();
  act(() => renderer.unmount());
});

test('reduced motion renders the motion glyph statically', async () => {
  mockReducedMotion(true);
  const loop = jest.spyOn(Animated, 'loop');
  const renderer = await renderIcon('spinner');

  expect(renderer.root.findAllByType(Animated.View)).toHaveLength(0);
  expect(renderer.root.findAllByType(SvgXml)).toHaveLength(1);
  expect(loop).not.toHaveBeenCalled();
  act(() => renderer.unmount());
});
