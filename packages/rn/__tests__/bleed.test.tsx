import * as React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { View as RNView } from 'react-native';

import { Bleed, Pressable, View } from '../primitives';
import { IconAvatar } from '../index';
import { NuriThemeProvider } from '../theme';
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

  test('the band is touch-transparent: box-none wrapper, box-none layout Views inside, Pressables untouched', () => {
    // The element contract (#212 addendum · review P2): the lifted band never
    // eats sibling touches. Structural proof of the routing preconditions —
    // real hit ROUTING is asserted by the browser probe on the boards
    // (elementFromPoint over the trigger edge pixels) and the native touch
    // pass remains the named device residue.
    const tr = render(
      <Bleed top="xl" bottom="xl">
        <View direction="row" justify="center" align="center" height="lg" testID="band-row">
          <Pressable height="lg" accessibilityLabel="Swap" testID="disc" onPress={() => undefined} />
        </View>
      </Bleed>,
    );
    // 1 · the Bleed wrapper itself is box-none
    const wrapper = tr.root.findAllByType(RNView)[0];
    expect(wrapper.props.pointerEvents).toBe('box-none');
    // 2 · the static layout View INSIDE the band inherits box-none via context
    const bandRow = tr.root.findAll((n) => n.props.testID === 'band-row' && n.type === RNView)[0];
    expect(bandRow.props.pointerEvents).toBe('box-none');
    // 3 · the interactive child is NOT flattened — its subtree stays hit-testable
    const disc = tr.root.findAll((n) => n.props.testID === 'disc')
      .find((n) => typeof n.props.style === 'function');
    expect(disc).toBeTruthy();
    expect(disc!.props.pointerEvents).not.toBe('none');
    // 4 · a View OUTSIDE any Bleed stays untouched (no global behaviour change)
    const outside = render(<View testID="plain" />);
    const plain = outside.root.findAll((n) => n.props.testID === 'plain' && n.type === RNView)[0];
    expect(plain.props.pointerEvents).toBeUndefined();
  });

  test('the cascade covers paths beyond Bleed > View > Pressable: distribute wrappers and descriptor view hosts', () => {
    // Review P2 round 2: the transparency contract must hold for EVERY static
    // host path the band can contain, not only the demonstrated composition.
    // 1 · distribute wrappers (raw RNViews created by wrapDistributedChildren)
    const distributed = render(
      <Bleed top="xl" bottom="xl">
        <View direction="row" distribute="even" height="lg" testID="dist-row">
          <Pressable accessibilityLabel="A" testID="a" onPress={() => undefined} />
          <Pressable accessibilityLabel="B" testID="b" onPress={() => undefined} />
        </View>
      </Bleed>,
    );
    const distRow = distributed.root.findAll((n) => n.props.testID === 'dist-row' && n.type === RNView)[0];
    // the distribute wrappers are the equal-basis RNViews wrapDistributedChildren injects
    const wrappers = distRow.findAllByType(RNView).filter((n) => {
      const st = flat(n.props.style);
      return st.flexGrow === 1 && st.flexBasis === 0;
    });
    expect(wrappers.length).toBe(2);
    for (const wrapper of wrappers) expect(wrapper.props.pointerEvents).toBe('box-none');
    // the wrapped Pressables stay hit-testable
    expect(distributed.root.findAll((n) => n.props.testID === 'a').length).toBeGreaterThan(0);

    // 2 · a descriptor-rendered static `view` host (IconAvatar root)
    const withComponent = render(
      <NuriThemeProvider>
        <Bleed top="xl" bottom="xl">
          <IconAvatar icon="bitcoin" />
        </Bleed>
      </NuriThemeProvider>,
    );
    const bleedWrapper = withComponent.root.findAllByType(RNView)[0];
    const avatarRoot = bleedWrapper.findAllByType(RNView).find((n) => n.props.accessibilityElementsHidden === true);
    expect(avatarRoot).toBeTruthy();
    expect(avatarRoot!.props.pointerEvents).toBe('box-none');

    // 3 · the same descriptor host OUTSIDE a Bleed stays untouched
    const outside = render(
      <NuriThemeProvider>
        <IconAvatar icon="bitcoin" />
      </NuriThemeProvider>,
    );
    const plainRoot = outside.root.findAllByType(RNView).find((n) => n.props.accessibilityElementsHidden === true);
    expect(plainRoot).toBeTruthy();
    expect(plainRoot!.props.pointerEvents).toBeUndefined();
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
