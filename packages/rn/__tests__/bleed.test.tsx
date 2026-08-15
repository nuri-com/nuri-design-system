import * as React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { View as RNView } from 'react-native';

import { Bleed, Pressable, View } from '../primitives';
import { resolveNS } from '../runtime/resolve';
import { buildNuriTheme } from '../runtime/theme-payload';

function render(node: React.ReactElement): TestRenderer.ReactTestRenderer {
  let tr!: TestRenderer.ReactTestRenderer;
  act(() => { tr = TestRenderer.create(node); });
  return tr;
}

const flat = (style: unknown): Record<string, unknown> =>
  Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : ((style ?? {}) as Record<string, unknown>);

describe('Bleed — controlled negative space', () => {
  test('all four leaves resolve to negative margins; specific block edges win over y; lift is fixed', () => {
    const tr = render(
      <Bleed top="xl" bottom="lg" x="md" y="sm">
        <View height="lg" />
      </Bleed>,
    );
    const host = tr.root.findAllByType(RNView)[0];
    expect(flat(host.props.style)).toEqual({
      marginHorizontal: -12,
      marginVertical: -6,
      marginTop: -24,
      marginBottom: -18,
      position: 'relative',
      zIndex: 1,
    });
  });

  test('the fixed lift places the Bleed host above ordinary siblings', () => {
    const tr = render(
      <View>
        <View testID="before" />
        <Bleed top="xl">
          <View testID="bled" />
        </Bleed>
        <View testID="after" />
      </View>,
    );
    const bleedHost = tr.root.findAllByType(RNView)
      .find((node) => flat(node.props.style).zIndex === 1);
    expect(bleedHost).toBeTruthy();
    expect(flat(tr.root.findByProps({ testID: 'before' }).props.style).zIndex).toBeUndefined();
    expect(flat(tr.root.findByProps({ testID: 'after' }).props.style).zIndex).toBeUndefined();
  });

  test('the complete 48px interactive child stays inside the repositioned host and registers edge presses', () => {
    const onPress = jest.fn();
    const tr = render(
      <Bleed top="xl" bottom="xl">
        <Pressable height="lg" accessibilityLabel="Swap" testID="disc" onPress={onPress} />
      </Bleed>,
    );
    const bleedHost = tr.root.findAllByType(RNView)[0];
    const disc = bleedHost.findAll((node) => node.props.testID === 'disc')
      .find((node) => typeof node.props.style === 'function');
    expect(disc).toBeTruthy();
    const restingStyle = (disc!.props.style as (state: { pressed: boolean }) => unknown)({ pressed: false });
    expect(flat(restingStyle).height).toBe(48);

    act(() => {
      disc!.props.onPress({ nativeEvent: { locationX: 1, locationY: 24 } });
      disc!.props.onPress({ nativeEvent: { locationX: 47, locationY: 24 } });
    });
    expect(onPress).toHaveBeenCalledTimes(2);
  });

  test('one child is enforced, including rejection of fragment escape hatches', () => {
    expect(() => render(
      <Bleed top="xl">
        <>
          <View />
          <View />
        </>
      </Bleed>,
    )).toThrow(/fragments are not accepted/);
  });

  test('no-Bleed static composition resolution is byte-identical', () => {
    const resolved = resolveNS(
      { stack: { direction: 'row', gap: 'md' }, box: { paddingX: 'lg' } },
      buildNuriTheme('neutral', 'light'),
    );
    expect(JSON.stringify(resolved)).toBe(
      '{"view":{"flexDirection":"row","gap":12,"paddingHorizontal":18}}',
    );
  });
});
