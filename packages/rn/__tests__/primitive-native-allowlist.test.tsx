import * as React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import {
  Pressable as RNPressable,
  ScrollView as RNScrollView,
  Text as RNText,
  View as RNView,
} from 'react-native';
import { NuriThemeProvider } from '../theme';
import {
  Dock,
  Footer,
  Header,
  Pressable,
  Screen,
  Scroll,
  Stack,
  Text,
  View,
} from '../primitives';

describe('open primitives — curated native allowlist', () => {
  test('every primitive ref reaches its native host, including accent-scoped wrappers', () => {
    const refs = {
      view: React.createRef<React.ElementRef<typeof RNView>>(),
      stack: React.createRef<React.ElementRef<typeof RNView>>(),
      text: React.createRef<React.ElementRef<typeof RNText>>(),
      pressable: React.createRef<React.ElementRef<typeof RNPressable>>(),
      screen: React.createRef<React.ElementRef<typeof RNView>>(),
      header: React.createRef<React.ElementRef<typeof RNView>>(),
      scroll: React.createRef<React.ElementRef<typeof RNScrollView>>(),
      footer: React.createRef<React.ElementRef<typeof RNView>>(),
      dock: React.createRef<React.ElementRef<typeof RNView>>(),
    };
    act(() => {
      TestRenderer.create(
        <NuriThemeProvider>
          <Screen ref={refs.screen} testID="screen">
            <Header ref={refs.header} testID="header" />
            <Scroll ref={refs.scroll} testID="scroll">
              <View ref={refs.view} testID="view" accent="orange">
                <Stack ref={refs.stack} testID="stack">
                  <Text ref={refs.text} testID="text" accent="lilac">Label</Text>
                  <Pressable ref={refs.pressable} testID="pressable" accent="orange" />
                </Stack>
              </View>
            </Scroll>
            <Footer ref={refs.footer} testID="footer" />
            <Dock ref={refs.dock} testID="dock" edge="bottom" />
          </Screen>
        </NuriThemeProvider>,
        {
          createNodeMock: (element) => {
            const props = element.props as { testID?: string };
            return { nativeTestID: props.testID };
          },
        },
      );
    });

    for (const [name, ref] of Object.entries(refs)) {
      expect(ref.current).not.toBeNull();
      expect((ref.current as unknown as { props: { testID?: string } }).props.testID).toBe(name);
    }
    expect(refs.view.current).toBeInstanceOf(RNView);
    expect(refs.stack.current).toBeInstanceOf(RNView);
    expect(refs.text.current).toBeInstanceOf(RNText);
    expect(refs.pressable.current).toBeInstanceOf(RNView);
    expect(refs.screen.current).toBeInstanceOf(RNView);
    expect(refs.header.current).toBeInstanceOf(RNView);
    expect(refs.scroll.current).toBeInstanceOf(RNScrollView);
    expect(refs.footer.current).toBeInstanceOf(RNView);
    expect(refs.dock.current).toBeInstanceOf(RNView);
    expect(View.displayName).toBe('View');
    expect(Text.displayName).toBe('Text');
    expect(Pressable.displayName).toBe('Pressable');
    expect(View.propKeys).not.toContain('testID');
    expect(Pressable.propKeys).not.toContain('hitSlop');
  });

  test('Pressable forwards events and native affordances while enforcing tab selected semantics', () => {
    const onPress = jest.fn();
    const onLongPress = jest.fn();
    const event = { nativeEvent: { pageX: 12, pageY: 24 } };
    let tr!: TestRenderer.ReactTestRenderer;
    act(() => {
      tr = TestRenderer.create(
        <NuriThemeProvider>
          <>
            <Pressable
              role="tab"
              testID="tab"
              hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
              accessibilityHint="Opens wallet"
              onPress={onPress}
              onLongPress={onLongPress}
            />
            <Pressable testID="button" />
          </>
        </NuriThemeProvider>,
      );
    });
    const tab = tr.root.find((node) => node.props.testID === 'tab' && node.props.accessibilityRole === 'tab');
    const button = tr.root.find((node) => node.props.testID === 'button' && node.props.accessibilityRole === 'button');

    expect(tab.props.accessibilityState).toEqual({ disabled: false, selected: false });
    expect(tab.props.hitSlop).toEqual({ top: 8, right: 8, bottom: 8, left: 8 });
    expect(tab.props.accessibilityHint).toBe('Opens wallet');
    expect(button.props.accessibilityState).toEqual({ disabled: false });
    expect(button.props.accessibilityState).not.toHaveProperty('selected');

    act(() => {
      tab.props.onPress(event);
      tab.props.onLongPress(event);
    });
    expect(onPress).toHaveBeenCalledWith(event);
    expect(onLongPress).toHaveBeenCalledWith(event);
  });
});
