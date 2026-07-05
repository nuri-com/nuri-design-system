/* ══════════════════════════════════════════════════════════════════
 * NURI · STACK distribute="even" (react-test-renderer · headless)
 * ──────────────────────────────────────────────────────────────────
 * The RN projection of the parent-side even split. Web has no `> *` reach
 * through a display:contents component host, so BOTH platforms wrap each direct
 * child in a flex box: web injects a `.nuri-stack` div (view.js), RN injects a
 * flex <View> here (Stack.tsx). This guards the RN wrapping + that the per-child
 * flex is single-sourced from childFillStyle (the shared DISTRIBUTE table).
 * ══════════════════════════════════════════════════════════════════ */

import * as React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text, View } from 'react-native';
import { Stack } from '../primitives';
import { childFillStyle } from '../runtime/resolve';

function render(node: React.ReactElement): TestRenderer.ReactTestRenderer {
  let tr!: TestRenderer.ReactTestRenderer;
  act(() => {
    tr = TestRenderer.create(node);
  });
  return tr;
}

// A wrapper is a host <View> carrying the even child-fill style (flex 1 1 0 · min 0).
const isEvenWrapper = (n: TestRenderer.ReactTestInstance): boolean =>
  n.type === View &&
  n.props?.style?.flexGrow === 1 &&
  n.props?.style?.flexShrink === 1 &&
  n.props?.style?.flexBasis === 0;

test('distribute="even" wraps EACH direct child in a flex View (the RN twin of the web `> *`)', () => {
  const tr = render(
    <Stack direction="row" distribute="even">
      <Text>A</Text>
      <Text>Bee</Text>
      <Text>Charlie</Text>
    </Stack>,
  );
  const wrappers = tr.root.findAll(isEvenWrapper);
  expect(wrappers).toHaveLength(3);
  // the wrapper style is single-sourced from the shared DISTRIBUTE table
  expect(wrappers[0].props.style).toEqual(childFillStyle('even'));
});

test('no distribute → children are NOT wrapped (byte-identical to a plain Stack)', () => {
  const tr = render(
    <Stack direction="row">
      <Text>A</Text>
      <Text>Bee</Text>
    </Stack>,
  );
  expect(tr.root.findAll(isEvenWrapper)).toHaveLength(0);
});

test('childFillStyle("even") is flex 1 1 0 + min 0 (== the `even` fill · CHILD-applied)', () => {
  expect(childFillStyle('even')).toEqual({ flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0 });
});
