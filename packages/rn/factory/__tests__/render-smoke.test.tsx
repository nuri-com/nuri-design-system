/* ══════════════════════════════════════════════════════════════════
 * NURI · FACTORY · RENDER SMOKE (react-test-renderer · headless · R1/R1.5)
 * ──────────────────────────────────────────────────────────────────
 * Mount each of the three frozen descriptors through the SAME factory, via
 * the ERGONOMIC 1:1 API (typed named props + children) → no-throw + a
 * committed snapshot of the rendered tree. The ongoing consumability guard
 * (decision 65.5 · X-wired) now that the hand-written mirrors are retired.
 *
 * The factory is glyph-AGNOSTIC: for the icon part it injects the scope
 * foreground as `color` into the provided element. We use a stand-in glyph
 * to test that injection in ISOLATION (the real glyph renderer is the
 * consumer's — see the demo screen) — keeping the smoke about the factory.
 * ══════════════════════════════════════════════════════════════════ */

import * as React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text, View } from 'react-native';
import { NuriThemeProvider } from '../../theme';
import { Button, IconAvatar, Topbar } from '../index';

const TestGlyph: React.FC<{ color?: string }> = ({ color }) => (
  <View accessibilityLabel={`glyph:${color ?? 'none'}`} />
);

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

  test('IconAvatar — static (View) · glyph children inherit the scope fg', () => {
    const tr = render(
      <NuriThemeProvider>
        <IconAvatar variant="soft">
          <TestGlyph />
        </IconAvatar>
      </NuriThemeProvider>,
    );
    // soft → surface.soft.fg = chrome.light.textPrimary (#222013): colour-by-scope
    // delivered the surface foreground into the glyph (§12 · F-BOX-FG-1).
    expect(tr.root.findByProps({ accessibilityLabel: 'glyph:#222013' })).toBeTruthy();
    expect(tr.toJSON()).toMatchSnapshot();
  });

  test('Topbar — OPEN primitive · title children → the content pivot · leading via content', () => {
    const tr = render(
      <NuriThemeProvider>
        <Topbar center="true" content={{ root: <View accessibilityLabel="leading" /> }}>
          <Text>My Vault</Text>
        </Topbar>
      </NuriThemeProvider>,
    );
    expect(tr.toJSON()).toBeTruthy();
    expect(tr.toJSON()).toMatchSnapshot();
  });

  test('accent self-scope (Tier-2) overrides ambient (F-SCOPE-2)', () => {
    // solid under a neutral self-scope inside a lilac ambient → the black solid
    // (#12110b) proves the prop won over the lilac context.
    const tr = render(
      <NuriThemeProvider mode="light" accent="lilac">
        <IconAvatar variant="solid" accent="neutral">
          <TestGlyph />
        </IconAvatar>
      </NuriThemeProvider>,
    );
    expect(JSON.stringify(tr.toJSON())).toContain('#12110b');
  });
});
