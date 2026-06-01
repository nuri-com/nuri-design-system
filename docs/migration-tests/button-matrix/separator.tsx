/* ══════════════════════════════════════════════════════════════════
 * SEPARATOR · the RN side of <nuri-separator> · N+6.9 · decision 49
 * ──────────────────────────────────────────────────────────────────
 * A generic 1px hairline — author-placed. Mirrors separator.css: a
 * 1px-tall View, stretched on the cross axis, filled with the theme's
 * border-subtle chrome token. Horizontal only (decision 49). Structural
 * divider · accessibilityRole="none" (the web role="separator" has no
 * exact RN peer, and a non-focusable rule adds no AT semantics beyond
 * the visual break).
 *
 * ONE prop: `ySpace` (amendment 49.1 · N+8.1) — the vertical breathing
 * room above/below the line, over `none` + `xs–xl` (default 'sm';
 * 2xs/2xl excluded, matching Stack `gap`). It is a `marginVertical`, NOT
 * a thicker fill: the visible hairline stays exactly 1px at every value
 * (mirrors the web `margin-block` dispatch). This is the List family's
 * inter-row rhythm now that <List> is gap-free (decision 51 · 52 · N+8.1).
 * ══════════════════════════════════════════════════════════════════ */

import * as React from 'react';
import { View } from 'react-native';
import { NuriThemeContext, chrome, space } from './_shared';

export type SeparatorProps = {
  ySpace?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
};

export const Separator: React.FC<SeparatorProps> = ({ ySpace = 'sm' }) => {
  const { mode } = React.useContext(NuriThemeContext);
  return (
    <View
      accessibilityRole="none"
      style={{
        height:          1,
        alignSelf:       'stretch',
        marginVertical:  space[ySpace],
        backgroundColor: chrome[mode].borderSubtle,
      }}
    />
  );
};
