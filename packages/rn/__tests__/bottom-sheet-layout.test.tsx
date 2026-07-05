/* ══════════════════════════════════════════════════════════════════
 * NURI · BOTTOM SHEET · LAYOUT LATCH + NO-ARMING REGRESSION LOCK (D3)
 * ──────────────────────────────────────────────────────────────────
 * `handleSheetLayout` measures the sheet height once per delta and latches it
 * for the enter-slide travel distance. It MUST NOT arm a LayoutAnimation on a
 * content/height change: the old `configureNext(...)` inside `onLayout` armed
 * the NEXT commit (an off-by-one that animated nothing · docs/bottom-sheet-
 * improvements.md D3). This suite pins both halves — the measurement still
 * latches, and no `LayoutAnimation.configureNext` is ever armed from layout —
 * so re-adding the dead arming fails the build. The real morph lands with D2.
 * ══════════════════════════════════════════════════════════════════ */

import * as React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { LayoutAnimation, Text } from 'react-native';
import { NuriThemeProvider } from '../theme';
import { BottomSheet, BottomSheetPanel, OverlayProvider } from '../index';

function render(node: React.ReactElement): TestRenderer.ReactTestRenderer {
  let tr!: TestRenderer.ReactTestRenderer;
  act(() => {
    tr = TestRenderer.create(node);
  });
  return tr;
}

// Two hosts carry an `onLayout` in the tree: the outer KeyboardAvoidingView and
// the sheet's Animated.View. Only the sheet view is styled with the enter-slide
// `transform`, so anchor on that to drive `handleSheetLayout` (firing the KAV's
// handler with a synthetic event would hit its `event.persist()` instead).
function fireSheetLayout(tr: TestRenderer.ReactTestRenderer, height: number): void {
  const host = tr.root.find((n) => {
    if (typeof n.props?.onLayout !== 'function') return false;
    const style = n.props.style as unknown;
    const flat = Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : style;
    return Boolean(flat) && typeof flat === 'object' && 'transform' in (flat as Record<string, unknown>);
  });
  act(() => {
    host.props.onLayout({
      nativeEvent: { layout: { x: 0, y: 0, width: 375, height } },
      persist: () => undefined,
    });
  });
}

describe('BottomSheet — layout measurement latch + no LayoutAnimation arming (D3)', () => {
  let configureNext: jest.SpyInstance;

  beforeEach(() => {
    configureNext = jest.spyOn(LayoutAnimation, 'configureNext').mockImplementation(() => undefined);
  });

  afterEach(() => {
    configureNext.mockRestore();
  });

  test('an initial measurement does NOT arm a LayoutAnimation', () => {
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
    fireSheetLayout(tr, 400);
    expect(configureNext).not.toHaveBeenCalled();
  });

  test('a subsequent content/height change does NOT arm a LayoutAnimation', () => {
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
    // First layout latches the height; a second, taller layout is the swap the
    // old off-by-one arming targeted. Neither may call configureNext.
    fireSheetLayout(tr, 400);
    fireSheetLayout(tr, 520);
    expect(configureNext).not.toHaveBeenCalled();
  });

  test('the measurement latch keeps the sheet content mounted after layout (enter-slide path intact)', () => {
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
    // Latching a height drives the enter slide; the measurement path is unchanged
    // by D3 — the content stays mounted, and nothing is armed by measuring it.
    fireSheetLayout(tr, 400);
    expect(tr.root.findByType(Text).props.children).toBe('Receive');
    expect(configureNext).not.toHaveBeenCalled();
  });

  test('a closed sheet mounts no engine surface (exit/unmount behaviour retained)', () => {
    const tr = render(
      <NuriThemeProvider>
        <OverlayProvider>
          <BottomSheet open={false} detent="content">
            <BottomSheetPanel>
              <Text>Receive</Text>
            </BottomSheetPanel>
          </BottomSheet>
        </OverlayProvider>
      </NuriThemeProvider>,
    );
    expect(tr.toJSON()).toBeNull();
  });
});
