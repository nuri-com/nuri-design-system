/* ══════════════════════════════════════════════════════════════════
 * NURI · FACTORY · RENDER SMOKE (react-test-renderer · headless · R1/R1.5)
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
import { Text, View } from 'react-native';
import { NuriThemeProvider } from '../../theme';
import {
  Button,
  IconAvatar,
  IconButton,
  Topbar,
  TopbarLeading,
  TopbarCenter,
  TopbarTrailing,
  TabBar,
  TabBarItem,
  NuriIcon,
} from '../index';
// The hand-authorable primitives (step ①) — aliased so the DS names don't clash
// with the raw react-native View/Text imported above for the catalog tests.
import {
  View as NuriView,
  Stack as NuriStack,
  Text as NuriText,
  Pressable as NuriPressable,
  Screen as NuriScreen,
  Scroll as NuriScroll,
} from '../primitives';

function render(node: React.ReactElement): TestRenderer.ReactTestRenderer {
  let tr!: TestRenderer.ReactTestRenderer;
  act(() => {
    tr = TestRenderer.create(node);
  });
  return tr;
}

describe('render-smoke — the ergonomic components mount headless', () => {
  test('Button — typed named props · interactive (Pressable) · label children', () => {
    const tr = render(
      <NuriThemeProvider>
        <Button variant="solid" size="md" onPress={() => undefined}>
          Buy Bitcoin
        </Button>
      </NuriThemeProvider>,
    );
    expect(tr.toJSON()).toBeTruthy();
    expect(tr.toJSON()).toMatchSnapshot();
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
    expect(tr.toJSON()).toMatchSnapshot();
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
        <Button variant="solid" size="md" onPress={() => undefined}>
          Buy Bitcoin
        </Button>
      </NuriThemeProvider>,
    );
    const root = tr.toJSON() as TestRenderer.ReactTestRendererJSON;
    expect(root.props.accessibilityElementsHidden).toBeUndefined();
    expect(root.props.importantForAccessibility).toBeUndefined();
  });

  test('Topbar — COMPOUND slots · leading/center/trailing regions composed via sub-components', () => {
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

  test('IconButton — BARE · the icon-anchored control · glyph routed via the `icon` prop · a11y name', () => {
    const tr = render(
      <NuriThemeProvider>
        <IconButton variant="solid" size="md" icon="apple" accessibilityLabel="Buy Bitcoin" onPress={() => undefined} />
      </NuriThemeProvider>,
    );
    expect(tr.toJSON()).toBeTruthy();
    // bare → the register glyph renders (scope fg threaded in) with NO flank Text nodes
    // (the optional-flank collapse · so a stack gap never widens the round control).
    expect(tr.root.findAllByType(Text)).toHaveLength(0);
    expect(tr.toJSON()).toMatchSnapshot();
  });

  test('IconButton — FLANKED · prefix/suffix text flank the icon (`Buy Bitcoin 🍎 Pay`)', () => {
    const tr = render(
      <NuriThemeProvider>
        <IconButton variant="soft" prefix="Buy Bitcoin" icon="apple" suffix="Pay" onPress={() => undefined} />
      </NuriThemeProvider>,
    );
    expect(tr.toJSON()).toBeTruthy();
    // flanked → two Text flanks, in row order with the glyph between them.
    const texts = tr.root.findAllByType(Text).map((t) => t.props.children);
    expect(texts).toEqual(['Buy Bitcoin', 'Pay']);
    expect(tr.toJSON()).toMatchSnapshot();
  });

  test('TabBar — OPEN container renders its positional Tab children · selected + unselected items', () => {
    const tr = render(
      <NuriThemeProvider>
        <TabBar>
          <TabBarItem icon="card" label="Wallet" selected onPress={() => undefined} />
          <TabBarItem icon="bitcoin" label="Coin" onPress={() => undefined} />
          <TabBarItem icon="euro" label="Cash" selected={false} onPress={() => undefined} />
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
    expect(tr.toJSON()).toMatchSnapshot();
  });

  // ── the hand-authorable primitive layer (step ①) — one headless mount per
  // primitive · no-throw + a committed snapshot (the consumability guard,
  // primitive-side · contract §3.3b). A View carrying a palette delivers its fg
  // by scope into a nested Text (proving the primitives reuse the factory's §12
  // colour-by-scope, not a parallel mechanism).
  test('primitives — View ⊃ Stack ⊃ Text compose · merged box⊕stack⊕palette + colour-by-scope', () => {
    const tr = render(
      <NuriThemeProvider>
        <NuriScreen>
          <NuriScroll>
            <NuriView variant="soft" padding="md" radius="lg">
              <NuriStack direction="row" gap="sm" align="center">
                <NuriText size="md" emphasis>
                  Wallet
                </NuriText>
              </NuriStack>
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
    expect(tr.toJSON()).toMatchSnapshot();
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
