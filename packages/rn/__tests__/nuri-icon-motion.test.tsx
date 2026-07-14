import * as React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { AccessibilityInfo, Animated, StyleSheet } from 'react-native';
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

test('ring motion glyph renders four independently eased phase-offset arcs with registry-derived timing', async () => {
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
  const clock = timing.mock.calls[0][0] as Animated.Value;
  const easing = timing.mock.calls[0][1].easing;
  expect(easing?.(0.25)).toBeCloseTo(0.25);

  const rotations = animatedViews.slice(1).map((arc) => (
    StyleSheet.flatten(arc.props.style).transform[0].rotate as unknown as { __getValue(): string }
  ));
  act(() => clock.setValue(0.5));
  const before = rotations.map((rotation) => Number.parseFloat(rotation.__getValue()));
  act(() => clock.setValue(0.55));
  const after = rotations.map((rotation) => Number.parseFloat(rotation.__getValue()));
  const advances = after.map((angle, index) => angle - before[index]);

  // When the darkest leading arc decelerates, the trailing arc keeps moving —
  // matching four CSS animations with negative delays rather than a rigid group.
  expect(advances[0]).toBeGreaterThan(advances[3]);

  // The matched non-zero endpoint velocity removes the apparent stop on both
  // sides of the leading arc's loop while preserving its deceleration.
  act(() => clock.setValue(0.7));
  const leadingBeforeWrap = Number.parseFloat(rotations[3].__getValue());
  act(() => clock.setValue(0.71875));
  const leadingAtWrap = Number.parseFloat(rotations[3].__getValue());
  act(() => clock.setValue(0.7375));
  const leadingAfterWrap = Number.parseFloat(rotations[3].__getValue());
  expect(leadingAtWrap - leadingBeforeWrap).toBeGreaterThan(0.75);
  expect(leadingAfterWrap - leadingAtWrap).toBeGreaterThan(0.75);
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
