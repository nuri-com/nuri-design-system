/* ══════════════════════════════════════════════════════════════════
 * SCROLL · the RN side of <nuri-scroll> · decision 58 · 60 · N+11
 * ──────────────────────────────────────────────────────────────────
 * The growing, scrolling body. A <ScrollView style={{ flex: 1 }}> whose
 * `contentContainerStyle` defaults to { flexGrow: 1 }. Scrolling is a
 * COMPONENT in RN, not a View style — which is exactly why it is its own
 * primitive and `overflow` is never a Box prop (R1).
 *
 * Why the contentContainerStyle flexGrow:1 (R-EXPO-4 · SPEC-FEEDBACK
 * F-DEMO-3): a ScrollView lays its children out in a SEPARATE content
 * container that is content-sized by default — so a `Box fill`
 * (`flexGrow:1`) child would have no free space to grow into and would
 * collapse to content height. Setting the content container itself to
 * `flexGrow:1` is the faithful RN realization of the web `<nuri-scroll>`,
 * which is `flex:1` (definite height) + `display:flex; flex-direction:
 * column`, so a `flex:1 0 auto` box can fill it (scroll.css · decision
 * 60). This gives the content container the viewport height; a child
 * still only fills if it carries `fill` (the grow stays OPT-IN per
 * child). Overridable via the prop, merged AFTER the default — mirroring
 * the `style` pattern.
 *
 * (The earlier header claimed padding/fill go on a `<Box fill>` CHILD as
 * "the contentContainerStyle analogue (Box fill == {flexGrow:1})" — the
 * first real Expo render disproved it: the Box fill is a child OF the
 * content container, not the content container itself, so the Scroll must
 * grow the content container here.)
 * ══════════════════════════════════════════════════════════════════ */

import * as React from 'react';
import { ScrollView, type StyleProp, type ViewStyle } from 'react-native';

export type ScrollProps = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export const Scroll: React.FC<ScrollProps> = ({ children, style, contentContainerStyle }) => (
  <ScrollView
    style={[{ flex: 1 }, style]}
    contentContainerStyle={[{ flexGrow: 1 }, contentContainerStyle]}
  >
    {children}
  </ScrollView>
);
