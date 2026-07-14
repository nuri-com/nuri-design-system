import * as React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { AccessibilityInfo, Animated, StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { NuriIcon } from '../primitives/NuriIcon';
import { NuriThemeProvider } from '../theme';

type Renderer = TestRenderer.ReactTestRenderer;

async function renderIcon(name: 'apple' | 'spinner' | 'spinner-ripple' | 'spinner-quarter' | 'spinner-coin'): Promise<Renderer> {
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
  const animatedViews = renderer.root.findAllByType(Animated.View);
  expect(animatedViews).toHaveLength(5);
  expect(animatedViews.slice(1).map((arc) => StyleSheet.flatten(arc.props.style).opacity)).toEqual([
    0.25,
    0.5,
    0.75,
    1,
  ]);
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

test('ripple renders two phased animated rings and its own reduced-motion glyph', async () => {
  mockReducedMotion(false);
  jest.spyOn(Animated, 'loop').mockReturnValue({
    start: jest.fn(),
    stop: jest.fn(),
    reset: jest.fn(),
  });
  const animated = await renderIcon('spinner-ripple');
  expect(animated.root.findByProps({ testID: 'spinner-ripple' })).toBeTruthy();
  expect(animated.root.findAllByType(Animated.View)).toHaveLength(3);
  expect(animated.root.findAllByType(SvgXml)).toHaveLength(0);
  act(() => animated.unmount());

  jest.restoreAllMocks();
  mockReducedMotion(true);
  const reduced = await renderIcon('spinner-ripple');
  expect(reduced.root.findAllByType(Animated.View)).toHaveLength(0);
  expect(reduced.root.findByType(SvgXml).props.xml).toContain('A12.48 12.48');
  act(() => reduced.unmount());
});

test('quarter preserves the clipped sqrt-two geometry and renders its own static fallback', async () => {
  mockReducedMotion(false);
  jest.spyOn(Animated, 'loop').mockReturnValue({
    start: jest.fn(),
    stop: jest.fn(),
    reset: jest.fn(),
  });
  const animated = await renderIcon('spinner-quarter');
  const clip = animated.root.findByProps({ testID: 'spinner-quarter' });
  const clipStyle = StyleSheet.flatten(clip.props.style);
  expect(clipStyle.overflow).toBe('hidden');
  expect(clipStyle.transform[0].translateY).toBeCloseTo(-2.4);
  expect(clipStyle.transform.slice(1)).toEqual([
    { rotate: '-45deg' },
    { scale: 0.70710678 },
  ]);
  expect(animated.root.findAllByType(Animated.View)).toHaveLength(3);
  for (const arc of animated.root.findAllByType(Animated.View)) {
    expect(StyleSheet.flatten(arc.props.style).borderWidth).toBe(2.1213);
  }
  act(() => animated.unmount());

  jest.restoreAllMocks();
  mockReducedMotion(true);
  const reduced = await renderIcon('spinner-quarter');
  expect(reduced.root.findAllByType(Animated.View)).toHaveLength(0);
  expect(reduced.root.findByType(SvgXml).props.xml).toContain('A24 24');
  act(() => reduced.unmount());
});

test('coin renders the rotating pair of mirrored gradient lights and its own static fallback', async () => {
  mockReducedMotion(false);
  jest.spyOn(Animated, 'loop').mockReturnValue({
    start: jest.fn(),
    stop: jest.fn(),
    reset: jest.fn(),
  });
  const animated = await renderIcon('spinner-coin');
  const coin = animated.root.findByProps({ testID: 'spinner-coin' });
  expect(StyleSheet.flatten(coin.props.style).transform[0]).toEqual({ perspective: 76.80000000000001 });
  expect(animated.root.findAllByType(Animated.View)).toHaveLength(3);
  expect(animated.root.findAllByType(SvgXml)).toHaveLength(0);
  act(() => animated.unmount());

  jest.restoreAllMocks();
  mockReducedMotion(true);
  const reduced = await renderIcon('spinner-coin');
  expect(reduced.root.findAllByType(Animated.View)).toHaveLength(0);
  expect(reduced.root.findByType(SvgXml).props.xml).toContain('A13.44 13.44');
  act(() => reduced.unmount());
});
