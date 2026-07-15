/* ══════════════════════════════════════════════════════════════════
 * NURI · MODAL SHEET MODE · LAYOUT LATCH + NO-ARMING REGRESSION LOCK
 * ──────────────────────────────────────────────────────────────────
 * `handleSheetLayout` measures the sheet height once per delta and latches it
 * for the enter-slide travel distance. It MUST NOT arm a LayoutAnimation on a
 * content/height change: the old `configureNext(...)` inside `onLayout` armed
 * the NEXT commit (an off-by-one that animated nothing). This suite pins both
 * halves — the measurement still
 * latches, and no `LayoutAnimation.configureNext` is ever armed from layout —
 * so re-adding the dead arming fails the build. The real morph lands with D2.
 * ══════════════════════════════════════════════════════════════════ */

import * as React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Animated, LayoutAnimation, Text } from 'react-native';
import { NuriThemeProvider } from '../theme';
import { Modal, ModalPanel, OverlayProvider } from '../index';

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

describe('Modal — layout measurement latch + no LayoutAnimation arming (D3)', () => {
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
          <Modal open mode="sheet">
            <ModalPanel>
              <Text>Receive</Text>
            </ModalPanel>
          </Modal>
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
          <Modal open mode="sheet">
            <ModalPanel>
              <Text>Receive</Text>
            </ModalPanel>
          </Modal>
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
          <Modal open mode="sheet">
            <ModalPanel>
              <Text>Receive</Text>
            </ModalPanel>
          </Modal>
        </OverlayProvider>
      </NuriThemeProvider>,
    );
    // Latching a height drives the enter slide; the measurement path is unchanged
    // by D3 — the content stays mounted, and nothing is armed by measuring it.
    fireSheetLayout(tr, 400);
    expect(tr.root.findByType(Text).props.children).toBe('Receive');
    expect(configureNext).not.toHaveBeenCalled();
  });

  test('onOpenComplete fires once after the enter animation finishes', () => {
    const onOpenChange = jest.fn();
    const onOpenComplete = jest.fn();
    let finishEnter: ((result: { finished: boolean }) => void) | undefined;
    const timing = jest.spyOn(Animated, 'timing').mockImplementation(
      () =>
        ({
          start: (callback?: (result: { finished: boolean }) => void) => {
            finishEnter = callback;
          },
          stop: jest.fn(),
          reset: jest.fn(),
        }) as unknown as ReturnType<typeof Animated.timing>,
    );

    try {
      const tr = render(
        <NuriThemeProvider>
          <OverlayProvider>
            <Modal
              open
              mode="sheet"
              onOpenChange={onOpenChange}
              onOpenComplete={onOpenComplete}
            >
              <ModalPanel>
                <Text>Receive</Text>
              </ModalPanel>
            </Modal>
          </OverlayProvider>
        </NuriThemeProvider>,
      );

      expect(onOpenComplete).not.toHaveBeenCalled();
      fireSheetLayout(tr, 400);
      expect(onOpenComplete).not.toHaveBeenCalled();

      act(() => finishEnter?.({ finished: true }));
      expect(onOpenChange).toHaveBeenCalledWith(true);
      expect(onOpenComplete).toHaveBeenCalledTimes(1);

      act(() => finishEnter?.({ finished: true }));
      expect(onOpenComplete).toHaveBeenCalledTimes(1);
    } finally {
      timing.mockRestore();
    }
  });

  test('full mode starts its fade enter without waiting for a layout measurement', () => {
    let finishEnter: ((result: { finished: boolean }) => void) | undefined;
    const onOpenComplete = jest.fn();
    const timing = jest.spyOn(Animated, 'timing').mockImplementation(
      () =>
        ({
          start: (callback?: (result: { finished: boolean }) => void) => {
            finishEnter = callback;
          },
          stop: jest.fn(),
          reset: jest.fn(),
        }) as unknown as ReturnType<typeof Animated.timing>,
    );

    try {
      render(
        <NuriThemeProvider>
          <OverlayProvider>
            <Modal open mode="full" onOpenComplete={onOpenComplete}>
              <ModalPanel><Text>Form</Text></ModalPanel>
            </Modal>
          </OverlayProvider>
        </NuriThemeProvider>,
      );

      expect(timing).toHaveBeenCalledTimes(1);
      act(() => finishEnter?.({ finished: true }));
      expect(onOpenComplete).toHaveBeenCalledTimes(1);
    } finally {
      timing.mockRestore();
    }
  });

  test('changing mode preserves the mounted child instance', () => {
    class StatefulChild extends React.Component {
      render() {
        return <Text>Stateful</Text>;
      }
    }
    const childRef = React.createRef<StatefulChild>();
    const tree = (mode: 'sheet' | 'full') => (
      <NuriThemeProvider>
        <OverlayProvider>
          <Modal open mode={mode}>
            <ModalPanel><StatefulChild ref={childRef} /></ModalPanel>
          </Modal>
        </OverlayProvider>
      </NuriThemeProvider>
    );
    const tr = render(tree('full'));
    const first = childRef.current;

    act(() => tr.update(tree('sheet')));
    expect(childRef.current).toBe(first);
  });

  test('a closed sheet mounts no engine surface (exit/unmount behaviour retained)', () => {
    const tr = render(
      <NuriThemeProvider>
        <OverlayProvider>
          <Modal open={false} mode="sheet">
            <ModalPanel>
              <Text>Receive</Text>
            </ModalPanel>
          </Modal>
        </OverlayProvider>
      </NuriThemeProvider>,
    );
    expect(tr.toJSON()).toBeNull();
  });
});
