import * as React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Keyboard, Pressable, Text } from 'react-native';

import {
  BottomSheet,
  BottomSheetPanel,
  Modal,
  ModalPanel,
  NuriThemeProvider,
  OverlayProvider,
} from '../index';

function render(node: React.ReactElement): TestRenderer.ReactTestRenderer {
  let tr!: TestRenderer.ReactTestRenderer;
  act(() => {
    tr = TestRenderer.create(node);
  });
  return tr;
}

describe('BottomSheet deprecated compatibility wrapper', () => {
  test('detent="full" translates to a scrimless full Modal and warns once', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    try {
      const tr = render(
        <NuriThemeProvider>
          <OverlayProvider>
            <BottomSheet open detent="full">
              <BottomSheetPanel><Text>Legacy form</Text></BottomSheetPanel>
            </BottomSheet>
          </OverlayProvider>
        </NuriThemeProvider>,
      );

      expect(tr.root.findAllByType(Pressable)).toHaveLength(0);
      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('<BottomSheet> is deprecated'));

      act(() => {
        tr.update(
          <NuriThemeProvider>
            <OverlayProvider>
              <BottomSheet open detent="full">
                <BottomSheetPanel><Text>Legacy form</Text></BottomSheetPanel>
              </BottomSheet>
            </OverlayProvider>
          </NuriThemeProvider>,
        );
      });
      expect(warn).toHaveBeenCalledTimes(1);
      act(() => tr.unmount());
    } finally {
      warn.mockRestore();
    }
  });

  test('full mode ignores scrim with a one-time warning', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    try {
      const tr = render(
        <NuriThemeProvider>
          <OverlayProvider>
            <Modal open mode="full" scrim="dim">
              <ModalPanel><Text>Full</Text></ModalPanel>
            </Modal>
          </OverlayProvider>
        </NuriThemeProvider>,
      );
      expect(tr.root.findAllByType(Pressable)).toHaveLength(0);
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('ignores `scrim`'));
      act(() => tr.unmount());
    } finally {
      warn.mockRestore();
    }
  });

  test('keyboard tripwire warns once for the topmost sheet modal', () => {
    const handlers: Array<(event: never) => void> = [];
    const add = jest.spyOn(Keyboard, 'addListener').mockImplementation((_event, handler) => {
      handlers.push(handler as (event: never) => void);
      return { remove: () => undefined } as never;
    });
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    try {
      const tr = render(
        <NuriThemeProvider>
          <OverlayProvider>
            <Modal open mode="sheet">
              <ModalPanel><Text>Sheet</Text></ModalPanel>
            </Modal>
          </OverlayProvider>
        </NuriThemeProvider>,
      );
      act(() => handlers.forEach((handler) => handler({} as never)));
      act(() => handlers.forEach((handler) => handler({} as never)));
      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('Inputs belong in mode="full"'));
      act(() => tr.unmount());
    } finally {
      warn.mockRestore();
      add.mockRestore();
    }
  });
});
