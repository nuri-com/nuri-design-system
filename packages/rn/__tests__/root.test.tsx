/* ═══════════════════════════════════════════════════════════════════
 * NURI ROOT · composed provider contract
 *
 * Proves the ordering through observable behavior: theme and overlay contexts
 * are live, the DS canvas paints bg + inherited fg, safe-area numbers reach a
 * Screen, omitted numbers normalize to zero, and a mode change repaints.
 * ═══════════════════════════════════════════════════════════════════ */

import * as React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text as RNText, View as RNView } from 'react-native';

import { NuriRoot, Screen, Text, useNuriSafeAreaInsets, useNuriTheme, useOverlay } from '../index';
import type { NuriSafeAreaInsets, OverlayApi, ThemePayload } from '../index';
import { buildNuriTheme } from '../runtime/theme-payload';

function render(node: React.ReactElement): TestRenderer.ReactTestRenderer {
  let tr!: TestRenderer.ReactTestRenderer;
  act(() => {
    tr = TestRenderer.create(node);
  });
  return tr;
}

function flatStyle(style: unknown): Record<string, unknown> {
  return Array.isArray(style)
    ? Object.assign({}, ...style.filter(Boolean))
    : ((style ?? {}) as Record<string, unknown>);
}

function ThemeProbe({ onValue }: { onValue: (value: ThemePayload) => void }): null {
  const value = useNuriTheme();
  onValue(value);
  return null;
}

function SafeAreaProbe({ onValue }: { onValue: (value: NuriSafeAreaInsets) => void }): null {
  const value = useNuriSafeAreaInsets();
  onValue(value);
  return null;
}

function OverlayProbe({ onValue }: { onValue: (value: OverlayApi) => void }): null {
  const value = useOverlay();
  React.useEffect(() => onValue(value), [onValue, value]);
  return null;
}

function findPaintedCanvas(
  tr: TestRenderer.ReactTestRenderer,
  backgroundColor: string,
): TestRenderer.ReactTestInstance {
  return tr.root.findAllByType(RNView).find((node) => (
    flatStyle(node.props.style).backgroundColor === backgroundColor
  ))!;
}

describe('NuriRoot', () => {
  test('provides the selected theme and a live overlay outlet', () => {
    let theme!: ThemePayload;
    let overlay!: OverlayApi;
    const onTheme = (value: ThemePayload) => { theme = value; };
    const onOverlay = (value: OverlayApi) => { overlay = value; };
    const tr = render(
      <NuriRoot mode="dark" accent="orange">
        <ThemeProbe onValue={onTheme} />
        <OverlayProbe onValue={onOverlay} />
      </NuriRoot>,
    );

    expect(theme.mode).toBe('dark');
    expect(theme.accent).toBe('orange');

    act(() => overlay.register('proof', <RNText>Overlay layer</RNText>));
    expect(tr.root.findAllByType(RNText).map((node) => node.props.children)).toContain('Overlay layer');
  });

  test('paints canvas bg and provides canvas fg to a propless Text child', () => {
    const expected = buildNuriTheme('lilac', 'light').chrome.canvas;
    let theme!: ThemePayload;
    const tr = render(
      <NuriRoot>
        <ThemeProbe onValue={(value) => { theme = value; }} />
        <Text>Inherited canvas foreground</Text>
      </NuriRoot>,
    );

    expect({ mode: theme.mode, accent: theme.accent }).toEqual({ mode: 'light', accent: 'lilac' });
    const canvas = findPaintedCanvas(tr, expected.bg);
    expect(flatStyle(canvas.props.style)).toMatchObject({
      backgroundColor: expected.bg,
      flexGrow: 1,
      flexShrink: 0,
    });
    expect(flatStyle(tr.root.findByType(RNText).props.style).color).toBe(expected.fg);
  });

  test('passes safe-area numbers to Screen and defaults omitted edges to zero', () => {
    const tr = render(
      <NuriRoot safeArea={{ top: 59, bottom: 34 }}>
        <Screen safeArea />
      </NuriRoot>,
    );
    const screen = tr.root.findAllByType(RNView).find((node) => {
      const style = flatStyle(node.props.style);
      return style.paddingTop === 59 && style.paddingBottom === 34;
    });
    expect(screen).toBeDefined();

    let omitted!: NuriSafeAreaInsets;
    render(
      <NuriRoot>
        <SafeAreaProbe onValue={(value) => { omitted = value; }} />
      </NuriRoot>,
    );
    expect(omitted).toEqual({ top: 0, bottom: 0 });
  });

  test('repaints the canvas and inherited foreground when mode changes', () => {
    const light = buildNuriTheme('neutral', 'light').chrome.canvas;
    const dark = buildNuriTheme('neutral', 'dark').chrome.canvas;
    const child = <Text>Mode-aware canvas</Text>;
    const tr = render(<NuriRoot mode="light" accent="neutral">{child}</NuriRoot>);

    expect(findPaintedCanvas(tr, light.bg)).toBeDefined();
    expect(flatStyle(tr.root.findByType(RNText).props.style).color).toBe(light.fg);

    act(() => {
      tr.update(<NuriRoot mode="dark" accent="neutral">{child}</NuriRoot>);
    });

    expect(findPaintedCanvas(tr, dark.bg)).toBeDefined();
    expect(flatStyle(tr.root.findByType(RNText).props.style).color).toBe(dark.fg);
    expect(dark.bg).not.toBe(light.bg);
  });
});
