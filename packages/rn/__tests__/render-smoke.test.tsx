/* ══════════════════════════════════════════════════════════════════
 * NURI · RENDER SMOKE (react-test-renderer · headless · R1/R1.5)
 * ──────────────────────────────────────────────────────────────────
 * Mount each of the three frozen descriptors through the SAME factory, via
 * the ERGONOMIC 1:1 API (typed named props + children) → no-throw + a
 * committed snapshot of the rendered tree. The ongoing consumability guard
 * (decision 65.5 · X-wired) now that the hand-written mirrors are retired.
 *
 * The icon contract: the DS OWNS RN glyph rendering. The icon part takes a
 * TYPED `icon: IconName` and the factory resolves it → the register glyph →
 * NuriIcon (react-native-svg), threading the scope fg as `color`. We assert on
 * the rendered NuriIcon's `color`/`name` to prove the colour-by-scope (§12) +
 * the register resolution — no consumer-passed element anymore.
 * ══════════════════════════════════════════════════════════════════ */

import * as React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Image, ScrollView, Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { NuriThemeProvider, typeStyle } from '../theme';
import { NuriSafeAreaProvider } from '../safe-area';
import {
  Alert,
  AlertIcon,
  AlertButton,
  Button,
  ButtonText,
  ButtonIcon,
  IconAvatar,
  IconButton,
  Topbar,
  TopbarLeading,
  TopbarCenter,
  TopbarContent,
  TopbarTitle,
  TopbarTrailing,
  List,
  ListAction,
  ListActionLeadingAvatar,
  ListActionText,
  ListActionTextMuted,
  ListActionTrailingText,
  ListActionTrailingTextMuted,
  ListActionTrailIcon,
  SelectField,
  SelectFieldLabel,
  SelectFieldAvatar,
  SelectFieldValue,
  SelectFieldChevron,
  TextField,
  TextFieldLabel,
  TextFieldButton,
  TextFieldIconButton,
  TabBar,
  TabBarItem,
  TabBarItemIcon,
  TabBarItemLabel,
  NuriIcon,
  ListSeparator,
  Modal,
  Footer,
  ModalPanel,
  Scroll,
  Header,
  OverlayProvider,
} from '../index';
import { icons } from '../contract';
import type { Descriptor, Axes, TypographyNS } from '../contract';
import { renderDescriptorInstance } from '../runtime/renderer';
import type { BakedComponentRecipe } from '../runtime/resolve';
import { buildNuriTheme } from '../runtime/theme-payload';
import { space } from '../generated/data/tokens';
import type { TextFieldHandle } from '../index';
import { FocusScrollProvider } from '../runtime/focus-scroll';
// The hand-authorable primitives (step ①) — aliased so the DS names don't clash
// with the raw react-native View/Text imported above for the catalog tests.
import {
  View as NuriView,
  Text as NuriText,
  Pressable as NuriPressable,
  Screen as NuriScreen,
  Header as NuriHeader,
  Scroll as NuriScroll,
  Footer as NuriFooter,
  Dock as NuriDock,
} from '../primitives';

function render(node: React.ReactElement): TestRenderer.ReactTestRenderer {
  let tr!: TestRenderer.ReactTestRenderer;
  act(() => {
    tr = TestRenderer.create(node);
  });
  return tr;
}

// The interactive action HOSTS in a tree — the descriptor renderer's Pressable
// parts (a `button` role + the pressed style render-prop). RN's Pressable is not
// matched by findByType in RTR, so anchor on the role + the style FUNCTION (which
// isolates the Pressable instance from its resolved-style inner host View).
function pressableActions(tr: TestRenderer.ReactTestRenderer): TestRenderer.ReactTestInstance[] {
  return tr.root.findAll(
    (node) => node.props?.accessibilityRole === 'button' && typeof node.props?.style === 'function',
  );
}

function flatStyleForTest(style: unknown): Record<string, unknown> {
  return Array.isArray(style)
    ? Object.assign({}, ...style.filter(Boolean))
    : ((style ?? {}) as Record<string, unknown>);
}

describe('render-smoke — the ergonomic components mount headless', () => {
  test('Button — typed named props · interactive (Pressable) · label children', () => {
    const tr = render(
      <NuriThemeProvider>
        <Button variant="solid" size="lg" onPress={() => undefined}>
          Buy Bitcoin
        </Button>
      </NuriThemeProvider>,
    );
    expect(tr.toJSON()).toBeTruthy();
    const [button] = pressableActions(tr);
    expect(button.props.accessibilityRole).toBe('button');
    expect(button.props.accessibilityState).toEqual({ disabled: false });
    expect(button.props.accessibilityState).not.toHaveProperty('selected');
    expect(tr.toJSON()).toMatchSnapshot();
  });

  test('Button — label text is a single-line shrinkable control label', () => {
    const tr = render(
      <NuriThemeProvider>
        <Button variant="solid" size="lg">
          Add Money
        </Button>
      </NuriThemeProvider>,
    );
    const label = tr.root.findByType(Text);
    expect(label.props.children).toBe('Add Money');
    expect(label.props.numberOfLines).toBe(1);
    expect(label.props.ellipsizeMode).toBe('tail');
    expect(Object.assign({}, ...label.props.style.filter(Boolean))).toMatchObject({
      flexShrink: 1,
      textAlign: 'center',
    });
  });

  test('Button — ordered composition renders text/icon/text through the root Pressable', () => {
    const tr = render(
      <NuriThemeProvider>
        <Button variant="solid" size="lg" disabled onPress={() => undefined}>
          <ButtonText>Buy Bitcoin</ButtonText>
          <ButtonIcon name="apple" />
          <ButtonText>Pay</ButtonText>
        </Button>
      </NuriThemeProvider>,
    );
    expect(tr.toJSON()).toBeTruthy();
    const root = tr.toJSON() as TestRenderer.ReactTestRendererJSON;
    expect(root.type).toBe('View');
    expect(root.props.accessibilityState).toEqual({ disabled: true });
    const leaves = tr.root.findAll((node) => node.type === Text || node.type === NuriIcon);
    const sequence = leaves.map((node) => (node.type === Text ? `text:${node.props.children}` : `icon:${node.props.name}`));
    expect(sequence).toEqual(['text:Buy Bitcoin', 'icon:apple', 'text:Pay']);
    const firstTextStyle = leaves[0].props.style as unknown[];
    const firstTextColor = Object.assign({}, ...firstTextStyle.filter(Boolean)).color;
    expect(leaves[1].props.color).toBe(firstTextColor);
    expect(tr.toJSON()).toMatchSnapshot();
  });

  test('Button — a fragment-wrapped text and prop-backed icon both render', () => {
    const tr = render(
      <NuriThemeProvider>
        <Button variant="solid" size="lg">
          <>
            <ButtonText>Pay</ButtonText>
            <ButtonIcon name="apple" />
          </>
        </Button>
      </NuriThemeProvider>,
    );
    expect(tr.root.findByType(Text).props.children).toBe('Pay');
    expect(tr.root.findByType(NuriIcon).props.name).toBe('apple');
  });

  test('Button — nested fragments recursively expose their slots', () => {
    const tr = render(
      <NuriThemeProvider>
        <Button variant="solid" size="lg">
          <>
            <React.Fragment key="nested">
              <ButtonText>Nested</ButtonText>
              <ButtonIcon name="apple" />
            </React.Fragment>
          </>
        </Button>
      </NuriThemeProvider>,
    );
    const leaves = tr.root.findAll((node) => node.type === Text || node.type === NuriIcon);
    expect(leaves.map((node) => (node.type === Text ? node.props.children : node.props.name))).toEqual([
      'Nested',
      'apple',
    ]);
  });

  test('Button — a fragment mixing a slot and bare child routes the bare child to the fallback', () => {
    const tr = render(
      <NuriThemeProvider>
        <Button variant="solid" size="lg">
          <>
            <ButtonIcon name="apple" />
            Pay
          </>
        </Button>
      </NuriThemeProvider>,
    );
    const leaves = tr.root.findAll((node) => node.type === Text || node.type === NuriIcon);
    expect(leaves.map((node) => (node.type === Text ? node.props.children : node.props.name))).toEqual([
      'apple',
      'Pay',
    ]);
  });

  test('Button — a fragment-wrapped foreign slot marker still fails named', () => {
    const quiet = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      expect(() =>
        render(
          <NuriThemeProvider>
            <Button variant="solid" size="lg">
              <>
                <ListActionText>Wrong</ListActionText>
              </>
            </Button>
          </NuriThemeProvider>,
        ),
      ).toThrow("nuri-factory: foreign slot marker 'ListActionText' — not a 'Button' slot");
    } finally {
      quiet.mockRestore();
    }
  });

  test('IconAvatar — static (View) · the register glyph inherits the scope fg', () => {
    const tr = render(
      <NuriThemeProvider>
        <IconAvatar variant="soft" icon="apple" />
      </NuriThemeProvider>,
    );
    // soft → surface.soft.fg = chrome.light.textPrimary (#222013): colour-by-scope
    // delivered the surface foreground into the DS-rendered glyph (§12 · F-BOX-FG-1).
    const glyph = tr.root.findByType(NuriIcon);
    expect(glyph.props.name).toBe('apple');
    expect(glyph.props.color).toBe('#222013');
    expect(tr.root.findAllByType(Image)).toHaveLength(0);
    expect(tr.toJSON()).toMatchSnapshot();
  });

  test('IconAvatar — source renders the image leaf and no icon; both/neither warn once and image wins', () => {
    const source = { uri: 'data:image/png;base64,flag' };
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    try {
      const imageOnly = render(
        <NuriThemeProvider>
          <IconAvatar source={source} />
        </NuriThemeProvider>,
      );
      expect(imageOnly.root.findAllByType(NuriIcon)).toHaveLength(0);
      const image = imageOnly.root.findByType(Image);
      expect(image.props.source).toEqual(source);
      expect(image.props.resizeMode).toBe('cover');
      expect(image.props.style).toMatchObject({
        width: 48,
        height: 48,
        borderRadius: 9999,
        borderColor: '#dddac9',
        borderWidth: 1,
      });

      const both = render(
        <NuriThemeProvider>
          <IconAvatar icon="apple" source={source} />
        </NuriThemeProvider>,
      );
      expect(both.root.findAllByType(NuriIcon)).toHaveLength(0);
      expect(both.root.findAllByType(Image)).toHaveLength(1);
      expect(warn).toHaveBeenCalledTimes(1);

      render(
        <NuriThemeProvider>
          <IconAvatar />
        </NuriThemeProvider>,
      );
      expect(warn).toHaveBeenCalledTimes(1);
      expect(imageOnly.toJSON()).toMatchSnapshot();
    } finally {
      warn.mockRestore();
    }
  });

  test('IconAvatar — sm is a 36px circle while glyph size remains 24px', () => {
    const glyphAvatar = render(
      <NuriThemeProvider>
        <IconAvatar size="sm" icon="apple" />
      </NuriThemeProvider>,
    );
    const glyphRoot = glyphAvatar.toJSON() as TestRenderer.ReactTestRendererJSON;
    const glyphRootStyle = Array.isArray(glyphRoot.props.style)
      ? Object.assign({}, ...glyphRoot.props.style.filter(Boolean))
      : glyphRoot.props.style;
    expect(glyphRootStyle).toMatchObject({ width: 36, height: 36 });
    expect(glyphAvatar.root.findByType(NuriIcon).props.dimension).toBe(24);

    const imageAvatar = render(
      <NuriThemeProvider>
        <IconAvatar size="sm" source={{ uri: 'data:image/png;base64,flag' }} />
      </NuriThemeProvider>,
    );
    expect(imageAvatar.root.findByType(Image).props.style).toMatchObject({ width: 36, height: 36 });
  });

  test('IconAvatar — outline variant paints a transparent border affordance with muted glyph', () => {
    const tr = render(
      <NuriThemeProvider>
        <IconAvatar variant="outline" icon="wallet" />
      </NuriThemeProvider>,
    );
    const root = tr.toJSON() as TestRenderer.ReactTestRendererJSON;
    const style = Array.isArray(root.props.style)
      ? Object.assign({}, ...root.props.style.filter(Boolean))
      : root.props.style;
    expect(style).toMatchObject({
      backgroundColor: 'transparent',
      borderColor: '#dddac9',
      borderWidth: 1,
    });
    expect(tr.root.findByType(NuriIcon).props.color).toBe('#666455');
    expect(tr.toJSON()).toMatchSnapshot();
  });

  test('NuriIcon — standalone fallback reads theme text, not raw black (D9)', () => {
    const tr = render(
      <NuriThemeProvider mode="dark">
        <NuriIcon name="apple" />
      </NuriThemeProvider>,
    );
    const svg = tr.root.findByType(SvgXml);
    expect(svg.props.color).toBe('#f0eee3');
    expect(svg.props.color).not.toBe('#000');
  });

  test('NuriIcon — newly added glyphs render register markup', () => {
    // The suite renders named glyphs but never sweeps the register, so each new
    // SoT drawing gets a targeted mount: the register markup reaches SvgXml
    // inside the constant viewBox wrapper, colour normalized to currentColor.
    for (const name of ['arrow-up', 'arrow-down', 'list-bullets', 'lightning'] as const) {
      const tr = render(
        <NuriThemeProvider>
          <NuriIcon name={name} />
        </NuriThemeProvider>,
      );
      const svg = tr.root.findByType(SvgXml);
      expect(svg.props.xml).toContain(icons[name]);
      expect(svg.props.xml).toContain('viewBox="0 0 32 32"');
      expect(icons[name]).not.toMatch(/fill="(?!currentColor)/);
    }
  });

  test('IconAvatar — DECORATIVE · the root host hides its subtree from AT (F-DECORATIVE-1)', () => {
    // `decorative: true` (icon-avatar.ts) → the RN projection wires the platform-split
    // hide-pair on the ROOT host: accessibilityElementsHidden (iOS) +
    // importantForAccessibility="no-hide-descendants" (Android). This is the RN catch-up
    // to web's single `aria-hidden` (factory.js:536) — the production a11y gap (D4).
    const tr = render(
      <NuriThemeProvider>
        <IconAvatar variant="soft" icon="apple" />
      </NuriThemeProvider>,
    );
    const root = tr.toJSON() as TestRenderer.ReactTestRendererJSON;
    expect(root.props.accessibilityElementsHidden).toBe(true);
    expect(root.props.importantForAccessibility).toBe('no-hide-descendants');
  });

  test('Button — NON-decorative · the root host does NOT carry the hide-pair', () => {
    // The other direction: a descriptor with no `decorative` flag never gets the pair,
    // so an interactive control stays in the a11y tree (it has a name + a role).
    const tr = render(
      <NuriThemeProvider>
        <Button variant="solid" size="lg" onPress={() => undefined}>
          Buy Bitcoin
        </Button>
      </NuriThemeProvider>,
    );
    const root = tr.toJSON() as TestRenderer.ReactTestRendererJSON;
    expect(root.props.accessibilityElementsHidden).toBeUndefined();
    expect(root.props.importantForAccessibility).toBeUndefined();
  });

  test('Topbar — COMPOUND slots · leading/center/content/trailing regions composed via sub-components', () => {
    const tr = render(
      <NuriThemeProvider>
        <Topbar>
          <TopbarLeading><View accessibilityLabel="leading" /></TopbarLeading>
          <TopbarCenter><Text>Account</Text></TopbarCenter>
          <TopbarTrailing><View accessibilityLabel="trailing" /></TopbarTrailing>
        </Topbar>
      </NuriThemeProvider>,
    );
    expect(tr.toJSON()).toBeTruthy();
    // each region's content rendered (the centre text + the two edge views).
    expect(tr.root.findByProps({ accessibilityLabel: 'leading' })).toBeTruthy();
    expect(tr.root.findByProps({ accessibilityLabel: 'trailing' })).toBeTruthy();
    expect(tr.root.findByType(Text).props.children).toBe('Account');
    expect(tr.toJSON()).toMatchSnapshot();
  });

  test('Topbar — fluid content fills between hugging edges', () => {
    const tr = render(
      <NuriThemeProvider>
        <Topbar layout="fluid">
          <TopbarLeading><View accessibilityLabel="fluid-leading" /></TopbarLeading>
          <TopbarContent><View accessibilityLabel="fluid-content" /></TopbarContent>
          <TopbarTrailing><View accessibilityLabel="fluid-trailing" /></TopbarTrailing>
        </Topbar>
      </NuriThemeProvider>,
    );
    expect(tr.root.findByProps({ accessibilityLabel: 'fluid-leading' })).toBeTruthy();
    expect(tr.root.findByProps({ accessibilityLabel: 'fluid-content' })).toBeTruthy();
    expect(tr.root.findByProps({ accessibilityLabel: 'fluid-trailing' })).toBeTruthy();
    expect(tr.toJSON()).toMatchSnapshot();
  });

  test('Topbar — title is preset and always truncates to one line', () => {
    const tr = render(
      <NuriThemeProvider>
        <Topbar layout="fluid">
          <TopbarTitle>Settings Settings Settings Settings</TopbarTitle>
          <TopbarTrailing><View accessibilityLabel="title-trailing" /></TopbarTrailing>
        </Topbar>
      </NuriThemeProvider>,
    );
    const title = tr.root.findByType(Text);
    expect(title.props.children).toBe('Settings Settings Settings Settings');
    expect(title.props.numberOfLines).toBe(1);
    expect(title.props.ellipsizeMode).toBe('tail');
    expect(Object.assign({}, ...title.props.style.filter(Boolean))).toMatchObject({
      ...typeStyle('lg', true),
      textAlign: 'left',
    });
    expect(tr.toJSON()).toMatchSnapshot();
  });

  test('Topbar — fragment-wrapped region markers are harvested transparently', () => {
    const tr = render(
      <NuriThemeProvider>
        <Topbar>
          <React.Fragment key="regions">
            <TopbarLeading><View accessibilityLabel="fragment-leading" /></TopbarLeading>
            <TopbarCenter><Text>Fragment center</Text></TopbarCenter>
          </React.Fragment>
        </Topbar>
      </NuriThemeProvider>,
    );
    expect(tr.root.findByProps({ accessibilityLabel: 'fragment-leading' })).toBeTruthy();
    expect(tr.root.findByType(Text).props.children).toBe('Fragment center');
  });

  test('Topbar — BARE children default to the trailing region (the "just actions" slot)', () => {
    const tr = render(
      <NuriThemeProvider>
        <Topbar>
          <View accessibilityLabel="bare-action" />
        </Topbar>
      </NuriThemeProvider>,
    );
    expect(tr.toJSON()).toBeTruthy();
    expect(tr.root.findByProps({ accessibilityLabel: 'bare-action' })).toBeTruthy();
    expect(tr.toJSON()).toMatchSnapshot();
  });

  test('IconButton — the icon-only glyph circle · glyph routed via the `icon` prop · a11y name', () => {
    const tr = render(
      <NuriThemeProvider>
        <IconButton variant="solid" icon="apple" accessibilityLabel="Buy Bitcoin" onPress={() => undefined} />
      </NuriThemeProvider>,
    );
    expect(tr.toJSON()).toBeTruthy();
    // icon-only → the register glyph renders (scope fg threaded in) with NO Text
    // nodes (the control is the lone `icon` part · no visible text to name it).
    expect(tr.root.findAllByType(Text)).toHaveLength(0);
    expect(tr.toJSON()).toMatchSnapshot();
  });

  // REGRESSION LOCK (#113 · taner): a lone `icon` leaf is NOT a `children` sink —
  // the `icon` prop fills the glyph and stray children never hijack it (they were
  // routed into the icon part before the primaryPart-gated-on-text fix, silently
  // dropping `icon` and pushing a garbage string into the glyph).
  test('IconButton — the `icon` prop wins · stray children do NOT hijack the glyph', () => {
    const tr = render(
      <NuriThemeProvider>
        {/* @ts-expect-error Path C emits IconButton with `children?: never` — the type FORBIDS this at the call site. This runtime lock stays: the generated adapter ignores forbidden children and routes the declared `icon` prop into the glyph, so a JS caller can't hijack it either. */}
        <IconButton icon="wallet" accessibilityLabel="Wallet">stray</IconButton>
      </NuriThemeProvider>,
    );
    const glyph = tr.root.findByType(NuriIcon);
    expect(glyph.props.name).toBe('wallet');
    // the stray children string reaches no part → no Text node renders it.
    expect(tr.root.findAllByType(Text)).toHaveLength(0);
  });

  test('IconAvatar — the `icon` prop wins · stray children do NOT hijack the glyph', () => {
    const tr = render(
      <NuriThemeProvider>
        {/* @ts-expect-error Path C emits IconAvatar with `children?: never` — the type FORBIDS this. The generated adapter ignores forbidden children and routes the declared `icon` prop into the glyph. */}
        <IconAvatar icon="wallet">stray</IconAvatar>
      </NuriThemeProvider>,
    );
    const glyph = tr.root.findByType(NuriIcon);
    expect(glyph.props.name).toBe('wallet');
    expect(tr.root.findAllByType(Text)).toHaveLength(0);
  });

  test('TabBar — OPEN container renders its positional Tab children · selected + unselected items', () => {
    const tr = render(
      <NuriThemeProvider>
        <TabBar>
          <TabBarItem selected onPress={() => undefined} accessibilityLabel="Wallet">
            <TabBarItemIcon name="card" />
            <TabBarItemLabel>Wallet</TabBarItemLabel>
          </TabBarItem>
          <TabBarItem onPress={() => undefined} accessibilityLabel="Coin">
            <TabBarItemIcon name="bitcoin" />
            <TabBarItemLabel>Coin</TabBarItemLabel>
          </TabBarItem>
          <TabBarItem selected={false} onPress={() => undefined} accessibilityLabel="Cash">
            <TabBarItemIcon name="euro" />
            <TabBarItemLabel>Cash</TabBarItemLabel>
          </TabBarItem>
        </TabBar>
      </NuriThemeProvider>,
    );
    expect(tr.toJSON()).toBeTruthy();
    // the open bar rendered its three positional items (icon + label each).
    const labels = tr.root.findAllByType(Text).map((t) => t.props.children);
    expect(labels).toEqual(['Wallet', 'Coin', 'Cash']);
    const glyphs = tr.root.findAllByType(NuriIcon).map((g) => g.props.name);
    expect(glyphs).toEqual(['card', 'bitcoin', 'euro']);
    // selected → ghost fg (text-primary #222013); unselected → subtle fg
    // (border-strong) — the colour-only muted treatment, inherited by the glyph (§12).
    const selectedGlyph = tr.root.findAllByType(NuriIcon).find((g) => g.props.name === 'card');
    const unselectedGlyph = tr.root.findAllByType(NuriIcon).find((g) => g.props.name === 'bitcoin');
    expect(selectedGlyph!.props.color).toBe('#222013');
    expect(unselectedGlyph!.props.color).not.toBe('#222013');
    const tabList = tr.root.find(
      (node) => node.props?.accessibilityRole === 'tablist' && typeof node.props?.style !== 'function',
    );
    expect(tabList).toBeTruthy();
    const tabs = tr.root.findAll(
      (node) => node.props?.accessibilityRole === 'tab' && typeof node.props?.style === 'function',
    );
    expect(tabs).toHaveLength(3);
    expect(tabs[0].props.accessibilityState).toEqual({ disabled: false, selected: true });
    // The OMITTED-selected item announces false (the bridge declares both arms;
    // mirrors the web factory's coercion) — not a silent undefined.
    expect(tabs[1].props.accessibilityState).toEqual({ disabled: false, selected: false });
    expect(tabs[2].props.accessibilityState).toEqual({ disabled: false, selected: false });
    expect(tr.toJSON()).toMatchSnapshot();
  });

  test('Screen + Scroll dock insets + Dock mount with transparent Topbar/TabBar', () => {
    const onTopDockLayout = jest.fn();
    const onBottomDockLayout = jest.fn();
    const tr = render(
      <NuriThemeProvider>
        <NuriScreen>
          <NuriDock edge="top" onLayout={onTopDockLayout}>
            <Topbar surface="transparent">
              <IconButton icon="list-bullets" variant="soft" accessibilityLabel="Activity" />
              <IconButton icon="headphones" variant="soft" accessibilityLabel="Support" />
            </Topbar>
          </NuriDock>
          <NuriScroll insetTop="dock" insetBottom="dock">
            <List>
              <ListAction accessibilityLabel="Bank account" onPress={() => undefined}>
                <ListActionLeadingAvatar name="bank" />
                <ListActionText>Bank account</ListActionText>
                <ListActionTrailIcon name="chevron-right" />
              </ListAction>
            </List>
          </NuriScroll>
          <NuriDock edge="bottom" onLayout={onBottomDockLayout}>
            <TabBar surface="transparent">
              <TabBarItem selected accessibilityLabel="Bitcoin wallet">
                <TabBarItemIcon name="bitcoin-wallet" />
                <TabBarItemLabel>€ 36.50</TabBarItemLabel>
              </TabBarItem>
              <TabBarItem accessibilityLabel="Bank account">
                <TabBarItemIcon name="bank" />
                <TabBarItemLabel>€ 18.90</TabBarItemLabel>
              </TabBarItem>
              <TabBarItem accessibilityLabel="Euro wallet">
                <TabBarItemIcon name="euro-wallet" />
                <TabBarItemLabel>€ 25.70</TabBarItemLabel>
              </TabBarItem>
            </TabBar>
          </NuriDock>
        </NuriScreen>
      </NuriThemeProvider>,
    );

    expect(tr.toJSON()).toBeTruthy();
    expect(JSON.stringify(tr.toJSON())).toContain('"backgroundColor":"transparent"');
    const scrollContentStyle = tr.root.findByType(ScrollView).props.contentContainerStyle as unknown;
    const flatScrollContentStyle = Array.isArray(scrollContentStyle)
      ? Object.assign({}, ...scrollContentStyle.filter(Boolean))
      : scrollContentStyle;
    expect(flatScrollContentStyle).toEqual({ flexGrow: 1 });

    const topDock = tr.root.findAllByType(View).find((node) => {
      const style = flatStyleForTest(node.props.style);
      return typeof node.props.onLayout === 'function' && style.position === 'absolute' && style.top === 0 && style.zIndex === 1;
    });
    const bottomDock = tr.root.findAllByType(View).find((node) => {
      const style = flatStyleForTest(node.props.style);
      return typeof node.props.onLayout === 'function' && style.position === 'absolute' && style.bottom === 0 && style.zIndex === 1;
    });
    expect(topDock).toBeTruthy();
    expect(bottomDock).toBeTruthy();

    act(() => {
      topDock!.props.onLayout({ nativeEvent: { layout: { height: 64 } } });
      bottomDock!.props.onLayout({ nativeEvent: { layout: { height: 72 } } });
    });

    const measuredContentStyle = flatStyleForTest(tr.root.findByType(ScrollView).props.contentContainerStyle);
    expect(measuredContentStyle).toMatchObject({
      flexGrow: 1,
      paddingTop: 64,
      paddingBottom: 72,
    });
    expect(onTopDockLayout).toHaveBeenCalledTimes(1);
    expect(onBottomDockLayout).toHaveBeenCalledTimes(1);
  });

  test('Screen + Header + Scroll + Footer measure structural clearance and paint safe areas', () => {
    const tr = render(
      <NuriThemeProvider>
        <NuriSafeAreaProvider top={20} bottom={34}>
          <NuriScreen>
            <NuriHeader safeAreaTop chrome="canvas" paddingY="sm">
              <Topbar>
                <TopbarCenter><Text>Send</Text></TopbarCenter>
              </Topbar>
            </NuriHeader>
            <NuriScroll>
              <Text>Body</Text>
            </NuriScroll>
            <NuriFooter safeAreaBottom chrome="canvas" paddingY="sm" paddingX="lg">
              <Button variant="solid">Continue</Button>
            </NuriFooter>
          </NuriScreen>
        </NuriSafeAreaProvider>
      </NuriThemeProvider>,
    );

    const fixedHosts = tr.root
      .findAllByType(View)
      .filter((node) => typeof node.props.onLayout === 'function')
      .map((node) => ({ node, style: flatStyleForTest(node.props.style) }));
    const headerHost = fixedHosts.find(({ style }) => style.top === 0 && style.zIndex === 2);
    const footerHost = fixedHosts.find(({ style }) => style.bottom === 0 && style.zIndex === 2);
    expect(headerHost).toBeTruthy();
    expect(footerHost).toBeTruthy();
    expect(headerHost!.style.paddingTop).toBe(space.sm + 20);
    expect(footerHost!.style.paddingBottom).toBe(space.sm + 34);

    act(() => {
      headerHost!.node.props.onLayout({ nativeEvent: { layout: { height: 76 } } });
      footerHost!.node.props.onLayout({ nativeEvent: { layout: { height: 90 } } });
    });

    expect(flatStyleForTest(tr.root.findByType(ScrollView).props.contentContainerStyle)).toMatchObject({
      flexGrow: 1,
      paddingTop: 76,
      paddingBottom: 90,
    });
  });

  test('Modal — structural host renders sticky topbar, body scroll, and fixed footer', () => {
    const tr = render(
      <NuriThemeProvider>
        <OverlayProvider>
          <NuriScreen>
            <Modal open mode="sheet" scrim="dim" dismissible>
              <ModalPanel>
                <Header paddingTop="lg">
                  <Topbar surface="transparent">
                    <TopbarCenter><Text>Receive</Text></TopbarCenter>
                  </Topbar>
                </Header>
                <Scroll>
                  <Button variant="solid">Paste Bitcoin Address</Button>
                </Scroll>
                <Footer>
                  <Button variant="solid">Continue</Button>
                </Footer>
              </ModalPanel>
            </Modal>
          </NuriScreen>
        </OverlayProvider>
      </NuriThemeProvider>,
    );

    expect(tr.toJSON()).toBeTruthy();
    expect(tr.root.findAllByType(Text).map((t) => t.props.children)).toEqual(['Receive', 'Paste Bitcoin Address', 'Continue']);
    const panelChrome = tr.root.findAllByType(View).find((node) => {
      const style = node.props.style as unknown;
      const flat = Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : (style as Record<string, unknown>);
      return flat.borderTopLeftRadius === 18 && flat.borderTopRightRadius === 18;
    });
    expect(panelChrome).toBeTruthy();
    const scrollContentStyle = tr.root.findByType(ScrollView).props.contentContainerStyle as unknown;
    const flatScrollContentStyle = Array.isArray(scrollContentStyle)
      ? Object.assign({}, ...scrollContentStyle.filter(Boolean))
      : scrollContentStyle;
    expect(flatScrollContentStyle).toEqual({ flexGrow: 1 });
  });

  test('Modal — closed means no mounted engine surface', () => {
    const tr = render(
      <NuriThemeProvider>
        <OverlayProvider>
          <Modal open={false} mode="sheet">
            <ModalPanel><Text>Hidden</Text></ModalPanel>
          </Modal>
        </OverlayProvider>
      </NuriThemeProvider>,
    );
    expect(tr.toJSON()).toBeNull();
  });

  test('Alert — soft + action: leading glyph, prose message, and the delegated AlertButton in a row', () => {
    const tr = render(
      <NuriThemeProvider>
        <Alert>
          <AlertIcon name="warning-circle" />
          Total balance insufficient
          <AlertButton onPress={() => undefined}>Top up</AlertButton>
        </Alert>
      </NuriThemeProvider>,
    );
    expect(tr.toJSON()).toBeTruthy();
    // the flat children compose in authored order: icon · message · action.
    expect(tr.root.findByType(NuriIcon).props.name).toBe('warning-circle');
    expect(tr.root.findAllByType(Text).map((t) => t.props.children)).toEqual([
      'Total balance insufficient',
      'Top up',
    ]);
    // the AlertButton delegates to the real Button — one interactive action host
    // (accessibilityRole 'button' · the pressed style render-prop) that inherits
    // the Alert's (default) scope.
    expect(pressableActions(tr)).toHaveLength(1);
    expect(tr.toJSON()).toMatchSnapshot();
  });

  test('Alert — the STRING message renders through the prose donor part (§1.3 rule)', () => {
    const tr = render(
      <NuriThemeProvider>
        <Alert>
          <AlertIcon name="warning-circle" />
          Total balance insufficient
        </Alert>
      </NuriThemeProvider>,
    );
    // The bare string would crash RN inside a <View> ("Text strings must be
    // rendered within a <Text>"); the prose-children rule routes it through the
    // `message` donor part, rendered as that part's normal `text` leaf.
    const message = tr.root
      .findAllByType(Text)
      .find((t) => t.props.children === 'Total balance insufficient');
    expect(message).toBeTruthy();
    const style = Object.assign({}, ...(message!.props.style as unknown[]).filter(Boolean));
    // Assert only the DONOR's DECLARED styling (descriptor data): grow/shrink fill,
    // sm + emphasis (semibold), muted (one tone shared with the also-muted glyph),
    // and the v1 one-line truncate flow.
    expect(style).toMatchObject({ flexGrow: 1, flexShrink: 1 });
    expect(style.fontWeight).toBe(typeStyle('sm', true).fontWeight);
    expect(style.color).toBe(tr.root.findByType(NuriIcon).props.color);
    expect(typeof style.color).toBe('string');
    expect(message!.props.numberOfLines).toBe(1);
    expect(message!.props.ellipsizeMode).toBe('tail');
  });

  test('Alert — ghost without an action is a bare icon + message line (no pressable surface)', () => {
    const tr = render(
      <NuriThemeProvider>
        <Alert variant="ghost">
          <AlertIcon name="warning-circle" />
          Please enter a valid IBAN
        </Alert>
      </NuriThemeProvider>,
    );
    expect(tr.toJSON()).toBeTruthy();
    expect(tr.root.findByType(NuriIcon).props.name).toBe('warning-circle');
    expect(tr.root.findByType(Text).props.children).toBe('Please enter a valid IBAN');
    // ghost has no padding and no trailing action — the row is icon + message.
    expect(pressableActions(tr)).toHaveLength(0);
    const root = tr.toJSON() as TestRenderer.ReactTestRendererJSON;
    const rootStyle = Array.isArray(root.props.style)
      ? Object.assign({}, ...root.props.style.filter(Boolean))
      : root.props.style;
    expect(rootStyle.backgroundColor).toBe('transparent');
    expect(rootStyle.padding).toBeUndefined();
    expect(tr.toJSON()).toMatchSnapshot();
  });

  test('Alert — accent scopes the whole alert, including the delegated AlertButton', () => {
    const buttonBg = (accent: 'lilac' | 'orange') => {
      const tr = render(
        <NuriThemeProvider>
          <Alert accent={accent}>
            <AlertIcon name="warning-circle" />
            Verify your identity
            <AlertButton>Verify</AlertButton>
          </Alert>
        </NuriThemeProvider>,
      );
      // the delegated Button's action host resolves its (solid) background from
      // the ambient scope — evaluate the pressed render-prop in the rest state.
      const [action] = pressableActions(tr);
      const style = (action.props.style as (s: { pressed: boolean }) => Record<string, unknown>)({ pressed: false });
      return style.backgroundColor as string;
    };
    // two different accent scopes reach the delegated action (a solid accent bg),
    // so the button paints DIFFERENT colours — the Alert's accent scopes the
    // AlertButton for free (form-kit-spec §1.1), not just the alert surface.
    expect(buttonBg('lilac')).not.toBe(buttonBg('orange'));
  });

  test('TextField — native mount value is frozen as defaultValue and label names it', () => {
    const onChangeText = jest.fn();
    const tr = render(
      <NuriThemeProvider>
        <TextField value="DE12" onChangeText={onChangeText} placeholder="DE..." inputMode="numeric" autoCapitalize="characters" maxLength={22}>
          <TextFieldLabel>IBAN</TextFieldLabel>
        </TextField>
      </NuriThemeProvider>,
    );

    const input = tr.root.findByType(TextInput);
    // Native TextInput is deliberately uncontrolled for its mounted lifetime;
    // asserting defaultValue (and the absence of value) pins that correctness
    // boundary rather than the former destructive controlled-input contract.
    expect(Object.hasOwn(input.props, 'value')).toBe(false);
    expect(input.props.defaultValue).toBe('DE12');
    expect(input.props.placeholder).toBe('DE...');
    expect(input.props.inputMode).toBe('numeric');
    expect(input.props.autoCapitalize).toBe('characters');
    expect(input.props.maxLength).toBe(22);
    expect(input.props.accessibilityLabel).toBe('IBAN');
    act(() => input.props.onChange({ nativeEvent: { text: 'DE123', eventCount: 1 } }));
    expect(onChangeText).toHaveBeenCalledWith('DE123');
  });

  test('TextField — md maps to a 48px box while unset remains the 60px default', () => {
    const fieldHeights = (tree: TestRenderer.ReactTestRenderer) => tree.root.findAllByType(View)
      .map((view) => Array.isArray(view.props.style)
        ? Object.assign({}, ...view.props.style.filter(Boolean))
        : view.props.style)
      .map((style) => style?.height)
      .filter((height) => typeof height === 'number');
    const md = render(
      <NuriThemeProvider>
        <TextField size="md"><TextFieldLabel>Search</TextFieldLabel></TextField>
      </NuriThemeProvider>,
    );
    const defaultSize = render(
      <NuriThemeProvider>
        <TextField><TextFieldLabel>Search</TextFieldLabel></TextField>
      </NuriThemeProvider>,
    );
    expect(fieldHeights(md)).toContain(48);
    expect(fieldHeights(defaultSize)).toContain(60);
  });

  test('TextField — secure, disabled, trailing controls, and external ghost Alert compose', () => {
    const tr = render(
      <NuriThemeProvider>
        <>
          <TextField value="secret" secureTextEntry disabled accessibilityLabel="Account number">
            <TextFieldLabel>IBAN</TextFieldLabel>
            <TextFieldButton onPress={() => undefined} accessibilityLabel="Paste name">Paste</TextFieldButton>
            <TextFieldIconButton name="eye-hidden" onPress={() => undefined} accessibilityLabel="Hide account number" />
          </TextField>
          <Alert variant="ghost">
            <AlertIcon name="warning-circle" />
            Please enter a valid IBAN
          </Alert>
        </>
      </NuriThemeProvider>,
    );

    const input = tr.root.findByType(TextInput);
    const inputStyle = Array.isArray(input.props.style)
      ? Object.assign({}, ...input.props.style.filter(Boolean))
      : input.props.style;
    expect(input.props.secureTextEntry).toBe(true);
    expect(input.props.editable).toBe(false);
    expect(input.props.accessibilityLabel).toBe('Account number');
    expect(inputStyle.opacity).toBe(0.4);
    expect(tr.root.findAllByType(Text).map((t) => t.props.children)).toContain('Paste');
    expect(pressableActions(tr)).toHaveLength(2);
    expect(tr.root.findAllByType(Text).map((t) => t.props.children)).toContain('Please enter a valid IBAN');
  });

  test('TextField — focus handlers fire and an offset focus ring overlays the box (web parity)', () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    const tr = render(
      <NuriThemeProvider>
        <TextField value="Ada" onFocus={onFocus} onBlur={onBlur}>
          <TextFieldLabel>First name</TextFieldLabel>
        </TextField>
      </NuriThemeProvider>,
    );

    const input = tr.root.findByType(TextInput);
    const flatViewStyles = () =>
      tr.root.findAllByType(View).map((node) => {
        const style = node.props.style as unknown;
        return Array.isArray(style)
          ? (Object.assign({}, ...style.filter(Boolean)) as Record<string, unknown>)
          : ((style ?? {}) as Record<string, unknown>);
      });
    // The outlined box: the field's 1px-bordered, 60-tall host.
    const boxStyle = () => flatViewStyles().find((style) => style.borderWidth === 1 && style.height === 60);
    // The focus ring: the absolutely-positioned 2px overlay in the focusRing colour
    // (mirrors web's `outline: 2px solid var(--nuri-focus-ring); outline-offset: 2px`).
    const focusRing = () =>
      flatViewStyles().find(
        (style) => style.position === 'absolute' && style.borderWidth === 2 && style.borderColor === '#ae91ff',
      );

    // Unfocused: neutral border, no ring.
    expect(boxStyle()?.borderColor).toBe('#dddac9');
    expect(focusRing()).toBeUndefined();

    act(() => input.props.onFocus());
    expect(onFocus).toHaveBeenCalledTimes(1);
    // Focused: the box border stays neutral (web does NOT recolour it); the offset
    // ring appears, standing 2px off the box (inset −4 = −(offset + width)).
    expect(boxStyle()?.borderColor).toBe('#dddac9');
    const ring = focusRing();
    expect(ring).toBeDefined();
    expect(ring?.top).toBe(-4);
    expect(ring?.left).toBe(-4);
    expect(ring?.right).toBe(-4);
    expect(ring?.bottom).toBe(-4);

    act(() => input.props.onBlur());
    expect(onBlur).toHaveBeenCalledTimes(1);
    expect(boxStyle()?.borderColor).toBe('#dddac9');
    expect(focusRing()).toBeUndefined();
  });

  test('TextFieldHandle.focus() uses the native event path: ring on and focus-scroll scheduled', () => {
    const ref = React.createRef<TextFieldHandle>();
    const scheduleScroll = jest.fn();
    let tr!: TestRenderer.ReactTestRenderer;
    act(() => {
      tr = TestRenderer.create(
        <NuriThemeProvider>
          <FocusScrollProvider value={{ onInputFocus: scheduleScroll, onInputBlur: jest.fn() }}>
            <TextField ref={ref} value="">
              <TextFieldLabel>IBAN</TextFieldLabel>
            </TextField>
          </FocusScrollProvider>
        </NuriThemeProvider>,
      );
    });

    const input = tr.root.findByType(TextInput);
    (input.instance as unknown as { focus: () => void }).focus = () => input.props.onFocus();
    act(() => ref.current?.focus());
    expect(scheduleScroll).toHaveBeenCalledTimes(1);
    expect(
      tr.root.findAllByType(View).some((node) => {
        const style = Array.isArray(node.props.style)
          ? Object.assign({}, ...node.props.style.filter(Boolean))
          : node.props.style;
        return style?.position === 'absolute' && style?.borderWidth === 2;
      }),
    ).toBe(true);
  });

  test('TextField — an optional visible label accepts accessibilityLabel and unnamed inputs warn once in development', () => {
    const named = render(
      <NuriThemeProvider>
        <TextField size="md" accessibilityLabel="Search" placeholder="Search" />
      </NuriThemeProvider>,
    );
    expect(named.root.findAllByType(Text)).toHaveLength(0);
    expect(named.root.findByType(TextInput).props.accessibilityLabel).toBe('Search');

    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(<NuriThemeProvider><TextField placeholder="Search" /></NuriThemeProvider>);
    render(<NuriThemeProvider><TextField placeholder="Search again" /></NuriThemeProvider>);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]?.[0]).toContain('expects either its Label slot or accessibilityLabel');
    warn.mockRestore();
  });

  test('ListAction — direct row slots render avatar, content, trailing value, and trail icon', () => {
    const tr = render(
      <NuriThemeProvider>
        <ListAction accessibilityLabel="Transaction" onPress={() => undefined}>
          <ListActionLeadingAvatar name="arrow-up" />
          <ListActionText>To Emin Mahrt</ListActionText>
          <ListActionTextMuted>Sent • Wed, 16 May</ListActionTextMuted>
          <ListActionTrailingText>- 12.00 €</ListActionTrailingText>
          <ListActionTrailingTextMuted>3433 Sats</ListActionTrailingTextMuted>
          <ListActionTrailIcon name="chevron-right" />
        </ListAction>
      </NuriThemeProvider>,
    );
    expect(tr.toJSON()).toBeTruthy();
    expect(tr.root.findAllByType(NuriIcon).map((g) => g.props.name)).toEqual(['arrow-up', 'chevron-right']);
    expect(tr.root.findAllByType(Text).map((t) => t.props.children)).toEqual([
      'To Emin Mahrt',
      'Sent • Wed, 16 May',
      '- 12.00 €',
      '3433 Sats',
    ]);
    expect(tr.toJSON()).toMatchSnapshot();
  });

  test('ListAction — leading avatar forwards an image source without a glyph', () => {
    const source = { uri: 'https://example.test/poland.png' };
    const tr = render(
      <NuriThemeProvider>
        <ListAction accessibilityLabel="Poland">
          <ListActionLeadingAvatar source={source} />
          <ListActionText>Poland</ListActionText>
          <ListActionTrailingText>+54</ListActionTrailingText>
        </ListAction>
      </NuriThemeProvider>,
    );
    expect(tr.root.findAllByType(NuriIcon)).toHaveLength(0);
    expect(tr.root.findByType(Image).props.source).toEqual(source);
  });

  test('ListAction — a long unbroken muted value reaches its one-line truncation point', () => {
    const address = 'bc1qexamplewalletaddresswithenoughcharactersovertherowwidth';
    const tr = render(
      <NuriThemeProvider>
        <ListAction accessibilityLabel="Wallet address" onPress={() => undefined}>
          <ListActionTextMuted>{address}</ListActionTextMuted>
          <ListActionTrailIcon name="chevron-right" />
        </ListAction>
      </NuriThemeProvider>,
    );
    const mutedText = tr.root.findByType(Text);
    expect(mutedText.props.children).toBe(address);
    expect(mutedText.props.numberOfLines).toBe(1);
    expect(mutedText.props.ellipsizeMode).toBe('tail');
    expect(flatStyleForTest(mutedText.parent?.props.style)).toMatchObject({
      alignItems: 'stretch',
      flexGrow: 1,
      flexShrink: 1,
      minWidth: 0,
    });
  });

  test('ListAction — default outline avatar and solid orange avatar scope the glyph', () => {
    const outline = render(
      <NuriThemeProvider>
        <ListAction accessibilityLabel="Default" onPress={() => undefined}>
          <ListActionLeadingAvatar name="bank" />
          <ListActionText>Bank account</ListActionText>
        </ListAction>
      </NuriThemeProvider>,
    );
    expect(JSON.stringify(outline.toJSON())).toContain('#dddac9');
    expect(outline.root.findByType(NuriIcon).props.color).toBe('#666455');

    const solidOrange = render(
      <NuriThemeProvider>
        <ListAction accessibilityLabel="Solid" onPress={() => undefined}>
          <ListActionLeadingAvatar name="arrow-up" variant="solid" accent="orange" />
          <ListActionText>Orange solid</ListActionText>
        </ListAction>
      </NuriThemeProvider>,
    );
    expect(JSON.stringify(solidOrange.toJSON())).toContain('#ff8c5a');
    expect(solidOrange.root.findByType(NuriIcon).props.color).toBe('#5e280f');
  });

  test('SelectField — disclosure value renders optional avatar/chevron and forwards native a11y value', () => {
    const onPress = jest.fn();
    const source = { uri: 'https://example.test/deu.png' };
    const tr = render(
      <NuriThemeProvider>
        <SelectField
          accessibilityLabel="Country"
          accessibilityValue="Germany"
          onPress={onPress}
        >
          <SelectFieldLabel>Country</SelectFieldLabel>
          <SelectFieldAvatar source={source} />
          <SelectFieldValue>Germany</SelectFieldValue>
          <SelectFieldChevron name="chevron-down" />
        </SelectField>
      </NuriThemeProvider>,
    );

    expect(tr.root.findAllByType(Text).map((node) => node.props.children)).toEqual(['Country', 'Germany']);
    expect(tr.root.findByType(Image).props.source).toEqual(source);
    expect(tr.root.findByType(NuriIcon).props.name).toBe('chevron-down');
    const [field] = pressableActions(tr);
    expect(field.props.accessibilityRole).toBe('button');
    expect(field.props.accessibilityLabel).toBe('Country');
    expect(field.props.accessibilityValue).toEqual({ text: 'Germany' });
    const restingStyle = field.props.style({ pressed: false });
    const pressedStyle = field.props.style({ pressed: true });
    const theme = buildNuriTheme('lilac', 'light');
    expect(restingStyle.backgroundColor).toBe('transparent');
    expect(restingStyle.borderColor).toBe(theme.border.subtle);
    expect(pressedStyle.backgroundColor).toBe(theme.chrome.subtle.bg);
    expect(pressedStyle.borderColor).toBe(restingStyle.borderColor);
    expect(restingStyle.transform).toBeUndefined();
    expect(pressedStyle.transform).toBeUndefined();
    act(() => field.props.onPress());
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(tr.toJSON()).toMatchSnapshot();
  });

  test('SelectField — unadorned composition omits optional avatar and chevron', () => {
    const tr = render(
      <NuriThemeProvider>
        <SelectField accessibilityLabel="Delivery" accessibilityValue="Standard">
          <SelectFieldLabel>Delivery</SelectFieldLabel>
          <SelectFieldValue>Standard</SelectFieldValue>
        </SelectField>
      </NuriThemeProvider>,
    );
    expect(tr.root.findAllByType(Image)).toHaveLength(0);
    expect(tr.root.findAllByType(NuriIcon)).toHaveLength(0);
    expect(tr.root.findAllByType(Text).map((node) => node.props.children)).toEqual(['Delivery', 'Standard']);
  });

  test('List — open container preserves positional rows and separators', () => {
    const tr = render(
      <NuriThemeProvider>
        <List>
          <ListAction accessibilityLabel="Bank" onPress={() => undefined}>
            <ListActionLeadingAvatar name="bank" />
            <ListActionText>Bank account</ListActionText>
          </ListAction>
          <ListSeparator />
          <ListAction accessibilityLabel="Card" onPress={() => undefined}>
            <ListActionLeadingAvatar name="card" />
            <ListActionText>Credit card</ListActionText>
          </ListAction>
        </List>
      </NuriThemeProvider>,
    );
    expect(tr.root.findAllByType(Text).map((t) => t.props.children)).toEqual(['Bank account', 'Credit card']);
    expect(tr.root.findAllByType(NuriIcon).map((g) => g.props.name)).toEqual(['bank', 'card']);
    const root = tr.toJSON() as TestRenderer.ReactTestRendererJSON;
    const rootStyle = Array.isArray(root.props.style)
      ? Object.assign({}, ...root.props.style.filter(Boolean))
      : root.props.style;
    expect(rootStyle.paddingHorizontal).toBe(6);
    expect(rootStyle.paddingVertical).toBeUndefined();
    expect(tr.toJSON()).toMatchSnapshot();
  });

  test('ListSeparator — inset wrapper keeps Separator hairline scoped in light and dark', () => {
    const light = render(
      <NuriThemeProvider mode="light">
        <ListSeparator />
      </NuriThemeProvider>,
    );
    const dark = render(
      <NuriThemeProvider mode="dark">
        <ListSeparator />
      </NuriThemeProvider>,
    );
    const lineColor = (tr: TestRenderer.ReactTestRenderer) => {
      const line = tr.root.findAllByType(View).find((node) => {
        const style = node.props.style as unknown;
        const flat = Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : (style as Record<string, unknown>);
        return flat.height === 1 && flat.width === '100%';
      });
      expect(line).toBeTruthy();
      const style = line!.props.style as unknown;
      const flat = Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : (style as Record<string, unknown>);
      return flat.backgroundColor;
    };
    const lineMargin = (tr: TestRenderer.ReactTestRenderer) => {
      const line = tr.root.findAllByType(View).find((node) => {
        const style = node.props.style as unknown;
        const flat = Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : (style as Record<string, unknown>);
        return flat.height === 1 && flat.width === '100%';
      });
      expect(line).toBeTruthy();
      const style = line!.props.style as unknown;
      const flat = Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : (style as Record<string, unknown>);
      return flat.marginVertical;
    };
    expect(lineColor(light)).toBe('#dddac9');
    expect(lineColor(dark)).toBe('#3d3b2e');
    expect(lineMargin(light)).toBe(6);
  });

  // ── The grouping / repetition contract (decision 83) — PAIRED with the
  // web factory tests (packages/prototype/factory/factory.test.js B6–B11):
  // leaf slots auto-route through private anatomy containers, or fail with the
  // same named error.
  test('ListAction — leaf slots auto-route into private content/trailing containers', () => {
    const tr = render(
      <NuriThemeProvider>
        <ListAction accessibilityLabel="Row" onPress={() => undefined}>
          <ListActionText>Bank account</ListActionText>
          <ListActionTextMuted>Personal</ListActionTextMuted>
          <ListActionTrailingText>7.20 €</ListActionTrailingText>
          <ListActionTrailingTextMuted>13138 Sats</ListActionTrailingTextMuted>
        </ListAction>
      </NuriThemeProvider>,
    );
    const texts = tr.root.findAllByType(Text);
    expect(texts.map((t) => t.props.children)).toEqual(['Bank account', 'Personal', '7.20 €', '13138 Sats']);
    expect(texts[0].parent).toBe(texts[1].parent);
    expect(texts[2].parent).toBe(texts[3].parent);
    expect(texts[0].parent).not.toBe(texts[2].parent);
  });

  test('ListAction — removed public content region wrapper is not exported', () => {
    const quiet = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const RemovedListActionContent = (() => null) as React.FC<{ children?: React.ReactNode }>;
    RemovedListActionContent.displayName = 'ListActionContent';
    try {
      expect(() =>
        render(
          <NuriThemeProvider>
            <ListAction accessibilityLabel="Row" onPress={() => undefined}>
              <RemovedListActionContent>
                <ListActionText>Bank account</ListActionText>
              </RemovedListActionContent>
            </ListAction>
          </NuriThemeProvider>,
        ),
      ).toThrow("nuri-factory: 'ListAction' has no default content slot");
    } finally {
      quiet.mockRestore();
    }
  });

  test('ListAction — a multiple:true slot repeats as a SEQUENCE of leaf instances', () => {
    const tr = render(
      <NuriThemeProvider>
        <ListAction accessibilityLabel="Row" onPress={() => undefined}>
          <ListActionText>First line</ListActionText>
          <ListActionText>Second line</ListActionText>
        </ListAction>
      </NuriThemeProvider>,
    );
    const texts = tr.root.findAllByType(Text);
    expect(texts.map((t) => t.props.children)).toEqual(['First line', 'Second line']);
    // TWO leaf instances inside ONE content region — never one concatenated leaf.
    expect(texts).toHaveLength(2);
    expect(texts[0].parent).toBe(texts[1].parent);
  });

  test('ListAction — a repeated SINGULAR icon slot fails named', () => {
    const quiet = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      expect(() =>
        render(
          <NuriThemeProvider>
            <ListAction accessibilityLabel="Row" onPress={() => undefined}>
              <ListActionLeadingAvatar name="arrow-up" />
              <ListActionLeadingAvatar name="arrow-down" />
            </ListAction>
          </NuriThemeProvider>,
        ),
      ).toThrow("nuri-factory: slot targeting part 'leadingAvatar' is singular — it appears 2 times under 'root'");
    } finally {
      quiet.mockRestore();
    }
  });

  test('ListAction — bare children with no default sink fail named', () => {
    const quiet = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      expect(() =>
        render(
          <NuriThemeProvider>
            <ListAction accessibilityLabel="Row" onPress={() => undefined}>
              Send money
            </ListAction>
          </NuriThemeProvider>,
        ),
      ).toThrow("nuri-factory: 'ListAction' has no default content slot");
    } finally {
      quiet.mockRestore();
    }
  });

  test('ListAction — a foreign component\'s slot marker fails named', () => {
    const quiet = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      expect(() =>
        render(
          <NuriThemeProvider>
            <ListAction accessibilityLabel="Row" onPress={() => undefined}>
              <ButtonText>Wrong</ButtonText>
            </ListAction>
          </NuriThemeProvider>,
        ),
      ).toThrow("nuri-factory: foreign slot marker 'ButtonText' — not a 'ListAction' slot");
    } finally {
      quiet.mockRestore();
    }
  });

  // ── the hand-authorable primitive layer (step ①) — one headless mount per
  // primitive · no-throw + a committed snapshot (the consumability guard,
  // primitive-side · contract §3.3b). A View carrying a palette delivers its fg
  // by scope into a nested Text (proving the primitives reuse the factory's §12
  // colour-by-scope, not a parallel mechanism).
  test('primitives — View ⊃ View ⊃ Text compose · merged box⊕stack⊕palette + colour-by-scope', () => {
    const tr = render(
      <NuriThemeProvider>
        <NuriScreen>
          <NuriScroll>
            <NuriView variant="soft" padding="md" radius="lg">
              <NuriView direction="row" gap="sm" align="center">
                <NuriText size="md" emphasis>
                  Wallet
                </NuriText>
              </NuriView>
            </NuriView>
          </NuriScroll>
        </NuriScreen>
      </NuriThemeProvider>,
    );
    expect(tr.toJSON()).toBeTruthy();
    // soft surface fg (#222013) inherited by the nested Text via NuriSurfaceContext.
    // Inspect the rendered host <Text> (RN), not the DS Text wrapper — the wrapper
    // computes the style array and forwards it down.
    const host = tr.root.findByType(Text);
    const style = host.props.style as unknown;
    const flat = Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : style;
    expect(flat.color).toBe('#222013');
    const scroll = tr.root.findByType(ScrollView);
    expect(scroll.props.contentContainerStyle).toEqual({ flexGrow: 1 });
    expect(tr.toJSON()).toMatchSnapshot();
  });

  test('primitives — Screen safeArea applies both provider insets', () => {
    const tr = render(
      <NuriThemeProvider>
        <NuriSafeAreaProvider top={12} bottom={34}>
          <NuriScreen safeArea>
            <NuriText>Body</NuriText>
          </NuriScreen>
        </NuriSafeAreaProvider>
      </NuriThemeProvider>,
    );
    const screen = tr.root.findAllByType(View)[0];
    const style = screen.props.style as unknown;
    const flat = Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : style;
    expect(flat).toMatchObject({ flex: 1, paddingTop: 12, paddingBottom: 34 });
  });

  test('primitives — Screen edge booleans apply only the requested provider inset', () => {
    const renderScreen = (node: React.ReactElement) => {
      const tr = render(
        <NuriThemeProvider>
          <NuriSafeAreaProvider top={12} bottom={34}>
            {node}
          </NuriSafeAreaProvider>
        </NuriThemeProvider>,
      );
      return tr.root.findAllByType(View)[0];
    };

    const topOnly = flatStyleForTest(renderScreen(<NuriScreen safeAreaTop><NuriText>Top</NuriText></NuriScreen>).props.style);
    expect(topOnly.paddingTop).toBe(12);
    expect(topOnly).not.toHaveProperty('paddingBottom');

    const bottomOnly = flatStyleForTest(renderScreen(<NuriScreen safeAreaBottom><NuriText>Bottom</NuriText></NuriScreen>).props.style);
    expect(bottomOnly).not.toHaveProperty('paddingTop');
    expect(bottomOnly.paddingBottom).toBe(34);
  });

  test('primitives — Pressable · interactive opt-in · pressed transient via the shared applier', () => {
    const tr = render(
      <NuriThemeProvider>
        <NuriPressable
          variant="solid"
          padding="md"
          pressScale
          pressColor
          accessibilityLabel="Buy"
          onPress={() => undefined}
        >
          <NuriText size="md">Buy</NuriText>
        </NuriPressable>
      </NuriThemeProvider>,
    );
    expect(tr.toJSON()).toBeTruthy();
    expect(tr.toJSON()).toMatchSnapshot();
  });

  test('primitives — <View accent> establishes a scope · variant paints the SCOPED accent (not ambient · PR #111)', () => {
    // The open-primitive twin of the factory prop-accent: a `palette.accent` on a
    // primitive must scope its own surface. Under a lilac ambient, an orange View
    // with variant=solid paints the ORANGE solid (#ff8c5a) — proving the accent is
    // honoured as a nested scope, NOT silently dropped to the ambient lilac
    // (#beaaff · the blocker the review caught: resolvePalette dropped ns.accent).
    const tr = render(
      <NuriThemeProvider mode="light" accent="lilac">
        <NuriView accent="orange" variant="solid" />
      </NuriThemeProvider>,
    );
    const root = tr.toJSON() as TestRenderer.ReactTestRendererJSON;
    const style = root.props.style as unknown;
    const flat = Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : (style as Record<string, unknown>);
    expect(flat.backgroundColor).toBe('#ff8c5a'); // orange solid · the scoped accent
    expect(flat.backgroundColor).not.toBe('#beaaff'); // NOT the ambient lilac solid
  });

  test('accent self-scope (Tier-2) overrides ambient (F-SCOPE-2)', () => {
    // solid under a neutral self-scope inside a lilac ambient → the black solid
    // bg (#12110b · the NEUTRAL accent's solid surface) proves the prop won over
    // the lilac context. The glyph now renders through the DS (icon="apple"); the
    // scope still drives the avatar's surface — assert the neutral bg landed.
    const tr = render(
      <NuriThemeProvider mode="light" accent="lilac">
        <IconAvatar variant="solid" accent="neutral" icon="apple" />
      </NuriThemeProvider>,
    );
    expect(JSON.stringify(tr.toJSON())).toContain('#12110b');
  });
});

// ── TYPE-SURFACE HONESTY (compile-time only · no runtime) ──────────────────
// These assertions never run; they are typechecked. `tsc` (the parity gate's
// `--noEmit` step) FAILS if any of them stop holding — that is the point: the 5
// behaviour gates can't see type-surface drift, so the type honesty is pinned
// here instead (debt-register §2 · SEED-3 + D8).
describe('type-surface honesty (compile-time assertions · SEED-3 + D8)', () => {
  test('the surface holds in both directions', () => {
    // SEED-3 · `selected` is GATED on a `state` axis. TabBarItem (tab.ts's
    // `state: 'selected' | 'unselected'`) is the lone state-axis descriptor →
    // it ACCEPTS the clean consumer boolean.
    const ok = (
      <TabBarItem selected onPress={() => undefined} accessibilityLabel="Wallet">
        <TabBarItemIcon name="card" />
        <TabBarItemLabel>Wallet</TabBarItemLabel>
      </TabBarItem>
    );
    void ok;
    const transparentTabBarOk = <TabBar surface="transparent" />;
    void transparentTabBarOk;
    const transparentTopbarOk = <Topbar surface="transparent" />;
    void transparentTopbarOk;
    const dockOk = <NuriDock edge="bottom" />;
    void dockOk;
    const topDockOk = <NuriDock edge="top" />;
    void topDockOk;
    const scrollInsetOk = <NuriScroll insetBottom="dock" />;
    void scrollInsetOk;
    const scrollTopInsetOk = <NuriScroll insetTop="dock" />;
    void scrollTopInsetOk;

    // @ts-expect-error — TabBar surface is the public axis, limited to canvas|transparent.
    const badTabBarSurface = <TabBar surface="frosted" />;
    void badTabBarSurface;
    // @ts-expect-error — Topbar surface is the public axis, limited to canvas|transparent.
    const badTopbarSurface = <Topbar surface="frosted" />;
    void badTopbarSurface;
    // @ts-expect-error — Dock supports semantic screen edges, not arbitrary sides.
    const badDockEdge = <NuriDock edge="left" />;
    void badDockEdge;
    // @ts-expect-error — Scroll insetBottom is semantic, not an arbitrary spacing value.
    const badScrollInset = <NuriScroll insetBottom="xl" />;
    void badScrollInset;
    // @ts-expect-error — Scroll insetTop is semantic, not an arbitrary spacing value.
    const badScrollTopInset = <NuriScroll insetTop="xl" />;
    void badScrollTopInset;

    // …and a descriptor with NO `state` axis REJECTS it — `selected` no longer
    // lives on the universal base, so passing it is a type error, not a silent
    // no-op (the bug this fix closes).
    // @ts-expect-error — Button has no `state` axis → `selected` is not a prop.
    const buttonRejectsSelected = <Button variant="solid" selected>Buy</Button>;
    void buttonRejectsSelected;
    // @ts-expect-error — IconAvatar has no `state` axis → `selected` is not a prop.
    const avatarRejectsSelected = <IconAvatar variant="soft" icon="apple" selected />;
    void avatarRejectsSelected;

    // D8 · `defaults` is constrained to the descriptor's OWN axes (the mapped
    // type `{ [Axis in keyof A]?: A[Axis] }`), no longer the loose
    // `Partial<Record<string, string>>`. A descriptor over a `state` axis takes
    // a default keyed by that axis with one of its values…
    const okDefaults: Descriptor<{ state: 'selected' | 'unselected' }> = {
      structure: { anatomy: { el: 'view' } },
      defaults: { state: 'unselected' },
      // `api` REQUIRED (Path C · Phase 1) · factory-ignored · minimal for typecheck.
      api: { axes: [], slots: {} },
    };
    void okDefaults;

    const offAxisValue: Descriptor<{ state: 'selected' | 'unselected' }> = {
      structure: { anatomy: { el: 'view' } },
      // @ts-expect-error — 'nonsense' is not a value of the `state` axis.
      defaults: { state: 'nonsense' },
      api: { axes: [], slots: {} },
    };
    void offAxisValue;

    const unknownAxisKey: Descriptor<{ state: 'selected' | 'unselected' }> = {
      structure: { anatomy: { el: 'view' } },
      // @ts-expect-error — `siez` is not an axis of this descriptor.
      defaults: { siez: 'unselected' },
      api: { axes: [], slots: {} },
    };
    void unknownAxisKey;

    expect(true).toBe(true);
  });
});

// ── The exported-surface trust boundary (the PR-#132 review pass) ─────────────
// The coherence guard pins the SPEC data, but `renderDescriptorInstance` is
// public and `behaviour` is caller input. A pressable part the behaviour does
// not target must THROW named (operator-ratified), never render an
// a11y-announced dead button. SYNTHETIC shapes on purpose — the catalog's
// generated adapters always set `behaviour.pressable`, so no committed
// snapshot exercises this path (the verify-guard-completeness lesson).
describe('renderDescriptorInstance — the pressable trust boundary', () => {
  // A minimal schema-valid pressable descriptor + its baked-recipe twin (the
  // geometry-bake synthetic-fixture shape · geometry-bake.test.ts).
  const syntheticPressable: Descriptor<Axes> = {
    structure: {
      anatomy: { el: 'pressable' },
      base: { root: { interactive: { pressScale: true } } },
    },
    api: {
      axes: [],
      behaviour: { pressable: { target: 'root', props: ['onPress'] } },
      slots: {},
    },
  };
  const syntheticRecipe: BakedComponentRecipe = {
    root: { el: 'pressable', geometry: { base: {}, variants: {} } },
  };

  function mountWith(behaviour: Parameters<typeof renderDescriptorInstance>[0]['behaviour']): void {
    const Rogue: React.FC = () =>
      renderDescriptorInstance({
        descriptor: syntheticPressable,
        recipe: syntheticRecipe,
        displayName: 'Rogue',
        selection: {},
        content: {},
        behaviour,
      });
    act(() => {
      TestRenderer.create(
        <NuriThemeProvider>
          <Rogue />
        </NuriThemeProvider>,
      );
    });
  }

  test('an untargeted el:pressable part throws named (behaviour: {})', () => {
    // React logs the render-phase throw via console.error — silence it so the
    // suite output stays clean; the assertion is the throw itself.
    const quiet = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      expect(() => mountWith({})).toThrow(
        "nuri-factory: part 'root' is el:'pressable' but behaviour.pressable does not target it",
      );
      // A MISTARGETED pressable (declared, wrong part name) is the same caller error.
      expect(() => mountWith({ pressable: { target: 'label' } })).toThrow(
        "nuri-factory: part 'root' is el:'pressable' but behaviour.pressable does not target it",
      );
    } finally {
      quiet.mockRestore();
    }
  });
});

describe('renderDescriptorInstance — typography text flow', () => {
  const makeFlowHarness = (typography: TypographyNS) => {
    const descriptor: Descriptor<Axes> = {
      structure: {
        anatomy: { el: 'view', parts: { label: { el: 'text' } } },
        base: { label: { typography } },
      },
      api: {
        axes: [],
        themeScope: { accent: true },
        slots: { default: { part: 'label', kind: 'text', default: true } },
      },
    };
    const recipe: BakedComponentRecipe = {
      root: { el: 'view', geometry: { base: {}, variants: {} } },
      label: { el: 'text', geometry: { base: {}, variants: {} }, typography: { base: typography } },
    };
    const Harness: React.FC = () =>
      renderDescriptorInstance({
        descriptor,
        recipe,
        displayName: 'FlowHarness',
        selection: {},
        content: { label: 'A long label' },
        behaviour: {},
      });
    return render(
      <NuriThemeProvider>
        <Harness />
      </NuriThemeProvider>,
    ).root.findByType(Text);
  };

  test('truncate + lines maps to RN clamp props with tail ellipsis', () => {
    const label = makeFlowHarness({ size: 'md', flow: 'truncate', lines: 1 });
    expect(label.props.numberOfLines).toBe(1);
    expect(label.props.ellipsizeMode).toBe('tail');
  });

  test('wrap emits no RN clamp props', () => {
    const label = makeFlowHarness({ size: 'md', flow: 'wrap' });
    expect(label.props.numberOfLines).toBeUndefined();
    expect(label.props.ellipsizeMode).toBeUndefined();
  });
});

describe('renderDescriptorInstance — nested composition', () => {
  const nestedDescriptor: Descriptor<Axes> = {
    structure: {
      anatomy: {
        el: 'pressable',
        parts: {
          leading: { el: 'view', parts: { glyph: { el: 'icon' } } },
          content: { el: 'view', parts: { label: { el: 'text' }, detail: { el: 'text' } } },
        },
      },
      base: {
        root: {
          stack: { direction: 'row', align: 'center', gap: 'md' },
          palette: { variant: 'ghost' },
          interactive: { pressColor: true },
        },
        leading: { stack: { align: 'center', justify: 'center' }, box: { width: 'lg', height: 'lg' } },
        content: { stack: { direction: 'column', fill: 'grow' } },
        label: { typography: { size: 'md', emphasis: true } },
        detail: { typography: { size: 'sm' }, palette: { muted: true } },
      },
    },
    api: {
      axes: [],
      themeScope: { accent: true },
      behaviour: { pressable: { target: 'root', props: ['onPress'] } },
      slots: {},
    },
  };
  const nestedRecipe: BakedComponentRecipe = {
    root: {
      el: 'pressable',
      geometry: { base: { flexDirection: 'row', alignItems: 'center', gap: 12 }, variants: {} },
      interactive: { base: { pressColor: true } },
    },
    leading: {
      el: 'view',
      geometry: { base: { alignItems: 'center', justifyContent: 'center', width: 48, height: 48 }, variants: {} },
    },
    glyph: { el: 'icon', geometry: { base: {}, variants: {} } },
    content: {
      el: 'view',
      geometry: { base: { flexDirection: 'column', flexGrow: 1, flexShrink: 1 }, variants: {} },
    },
    label: { el: 'text', geometry: { base: {}, variants: {} }, typography: { base: { size: 'md', emphasis: true } } },
    detail: { el: 'text', geometry: { base: {}, variants: {} }, typography: { base: { size: 'sm' } } },
  };

  test('composition entries targeting nested leaves render their ancestor hosts', () => {
    const Nested: React.FC = () =>
      renderDescriptorInstance({
        descriptor: nestedDescriptor,
        recipe: nestedRecipe,
        displayName: 'Nested',
        selection: {},
        content: {},
        composition: {
          root: [
            { part: 'glyph', content: 'bank' },
            { part: 'label', content: 'Bank account' },
            { part: 'detail', content: 'Personal' },
          ],
        },
        behaviour: { pressable: { target: 'root', onPress: () => undefined } },
      });
    const tr = render(
      <NuriThemeProvider>
        <Nested />
      </NuriThemeProvider>,
    );

    const glyph = tr.root.findByType(NuriIcon);
    expect(glyph.props.name).toBe('bank');
    const leading = glyph.parent;
    expect(leading?.type).toBe('View');
    const leadingStyle = Array.isArray(leading?.props.style)
      ? Object.assign({}, ...leading.props.style.filter(Boolean))
      : leading?.props.style;
    expect(leadingStyle).toMatchObject({ width: 48, height: 48 });

    const texts = tr.root.findAllByType(Text);
    expect(texts.map((t) => t.props.children)).toEqual(['Bank account', 'Personal']);
    const contentHosts = texts.map((text) => text.parent);
    expect(contentHosts[0]?.type).toBe('View');
    expect(contentHosts[1]?.type).toBe('View');
    expect(contentHosts[0]).toBe(contentHosts[1]);
  });
});
