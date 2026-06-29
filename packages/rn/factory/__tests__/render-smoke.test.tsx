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
import { Button, IconAvatar, IconButton, Topbar, NuriIcon } from '../index';

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

  test('Topbar — COMPOUND slots · leading/center/trailing regions composed via sub-components', () => {
    const tr = render(
      <NuriThemeProvider>
        <Topbar>
          <Topbar.Leading><View accessibilityLabel="leading" /></Topbar.Leading>
          <Topbar.Center><Text>Account</Text></Topbar.Center>
          <Topbar.Trailing><View accessibilityLabel="trailing" /></Topbar.Trailing>
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
