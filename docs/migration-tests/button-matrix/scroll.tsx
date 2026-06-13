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
 * container that is content-sized by default — so a `Stack fill`
 * (`flexGrow:1` · fill is stack-only since amendment 60.1 · N+19 U3,
 * box is purely geometric) child would have no free space to grow into
 * and would collapse to content height. Setting the content container
 * itself to `flexGrow:1` is the faithful RN realization of the web
 * `<nuri-scroll>`, which is `flex:1` (definite height) + `display:flex;
 * flex-direction: column`, so a `flex:1 0 auto` stack can fill it
 * (scroll.css · decision 60). This gives the content container the
 * viewport height; a child still only fills if it carries `fill` (the
 * grow stays OPT-IN per child). Overridable via the prop, merged AFTER
 * the default — mirroring the `style` pattern.
 *
 * (The earlier header claimed padding/fill go on a filling CHILD as
 * "the contentContainerStyle analogue (fill == {flexGrow:1})" — the
 * first real Expo render disproved it: the filling child is a child OF
 * the content container, not the content container itself, so the
 * Scroll must grow the content container here. At the time that child
 * was a `<Box fill>`; the box half of `fill` retired with N+19 U3 —
 * the web merges stack `fill` + box padding on ONE class-layer node.)
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
