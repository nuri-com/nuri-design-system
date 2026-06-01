/* ══════════════════════════════════════════════════════════════════
 * LIST FAMILY · primitive / interactive wrapper · N+8 · decision 52
 * ──────────────────────────────────────────────────────────────────
 * The N+8 refactor splits the family into clean roles, mirroring the
 * web custom elements one-for-one:
 *
 *   List                   <nuri-list>                  container · role=list
 *   ListItem               <nuri-list-item>             PRESENTATIONAL row
 *   InteractiveListItem    <nuri-list-interactive-item> pressable WRAPPER
 *   NavItem                <nuri-nav-item>              RECIPE (see nav-item.tsx)
 *
 * EMIT, not hardcode (decision 52). Every fixed value below dereferences
 * an emitted component token via resolveToken — the SAME machine-checked
 * contract Button / Switch / Tabs use — instead of re-typing the space /
 * size leaf by hand:
 *
 *   List       density → list.densitySmMinHeight  (= 'size.xl'  · TokenPath)
 *   ListItem   guard   → listItem.paddingBlock     (= 'space.md')
 *              gutter  → listItem.gap              (= 'space.md')
 *   Interactive wash   → listInteractiveItem.washPressed (= 'chrome.bgSubtle')
 *              radius  → listInteractiveItem.radius        (= 'radius.lg')
 *
 * PRESS WASH IS A FLAT FILL (decision 52 · revised N+8.1): washPressed
 * resolves to the flat `chrome.bgSubtle` semantic colour — a plain
 * `backgroundColor` that crosses to RN cleanly (R1). Full-bleed is
 * achieved by a COUNTER-MARGIN on the press box (negative marginHorizontal
 * + equal paddingHorizontal · = `space.md`), not by fading the colour. The
 * single press treatment carries no content `scale`.
 *
 * PRESENTATIONAL ListItem (decision 52): the row carries NO interactivity
 * — no `interactive` prop, no Pressable, no wash. Interactivity is
 * COMPOSED AROUND it by InteractiveListItem, exactly as the web wrapper
 * wraps <nuri-list-item>. The Pressable WRAPS the content, so the content
 * is the button's accessible name (read once · the N+7 double-read fix).
 *
 * A11y deltas (R1): F-LISTITEM-ROLE-1 — RN's AccessibilityRole has `list`
 * (on the container) but no `listitem` peer, so rows get no explicit row
 * role; membership reads from the `list` container. F-FOCUS-1 — no focus
 * ring on RN (no keyboard-focus distinction on touch).
 * ══════════════════════════════════════════════════════════════════ */

import * as React from 'react';
import { Pressable, View, type ViewStyle } from 'react-native';
import {
  resolveToken,
  useRuntimeTokens,
  listTokens,
  listItem,
  listInteractiveItem,
  space,
  type TokenPath,
} from './_shared';

export type Density = 'sm' | 'md' | 'lg';

// density → the emitted List min-height TokenPath (decision 52 · EMIT).
// resolveToken dereferences against the live size slice at render time,
// the RN analogue of the web `nuri-list[density] nuri-list-item` selector.
const DENSITY_TOKEN: Record<Density, TokenPath> = {
  sm: listTokens.densitySmMinHeight, // 'size.xl'  · 60
  md: listTokens.densityMdMinHeight, // 'size.2xl' · 72 · default
  lg: listTokens.densityLgMinHeight, // 'size.3xl' · 90
};

// List-local ROW density (the <nuri-list density> projection onto rows) —
// NOT the reserved scope theming `density` dimension (that lives on
// NuriThemeContext when its web tokens land · P11). Named to avoid the collision.
export const RowDensityContext = React.createContext<Density>('md');

export type ListProps = {
  density?: Density;
  children?: React.ReactNode;
};

export const List: React.FC<ListProps> = ({ density = 'md', children }) => (
  // role="list" container. No gap (decision 51) — rhythm is the row
  // min-height + author Separators. density projects onto rows via
  // context, NOT a per-row prop (the container owns the decision).
  <RowDensityContext.Provider value={density}>
    <View accessibilityRole="list">{children}</View>
  </RowDensityContext.Provider>
);

export type ListItemProps = {
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  children?: React.ReactNode;
};

// Presentational row — NO interactivity (decision 52). Inset, block
// guard, and inter-part gutter all dereference emitted listItem tokens.
export const ListItem: React.FC<ListItemProps> = ({ leading, trailing, children }) => {
  const tokens = useRuntimeTokens();
  const density = React.useContext(RowDensityContext);

  const rowStyle: ViewStyle = {
    minHeight:         resolveToken(tokens, DENSITY_TOKEN[density])   as number,
    flexDirection:     'row',
    alignItems:        'center',
    gap:               resolveToken(tokens, listItem.gap)            as number,
    paddingVertical:   resolveToken(tokens, listItem.paddingBlock)   as number,
  };

  return (
    <View style={rowStyle}>
      {leading != null ? <View>{leading}</View> : null}
      <View style={{ flex: 1, minWidth: 0 }}>{children}</View>
      {trailing != null ? <View>{trailing}</View> : null}
    </View>
  );
};

export type InteractiveListItemProps = ListItemProps & {
  onPress?: () => void;
};

// Pressable WRAPPER around a presentational ListItem (decision 52). The
// Pressable WRAPS the content so the content IS the button's accessible
// name (read once · the N+7 double-read fix). Wash + radius dereference
// the emitted listInteractiveItem tokens. NO focus ring (F-FOCUS-1).
//
// washPressed resolves to the flat `chrome.bgSubtle` colour (revised N+8.1 ·
// the x-fade gradient was reverted), so it crosses to RN cleanly as a plain
// backgroundColor. Full-bleed comes from the COUNTER-MARGIN: a negative
// marginHorizontal (= -space.md) re-inset by an equal paddingHorizontal, so
// the flat wash bleeds past the row edges while content stays flush with the
// Separators. The single press treatment carries no content scale.
export const InteractiveListItem: React.FC<InteractiveListItemProps> = ({
  onPress, leading, trailing, children,
}) => {
  const tokens = useRuntimeTokens();
  const washPressed = resolveToken(tokens, listInteractiveItem.washPressed) as string;
  const itemRadius  = resolveToken(tokens, listInteractiveItem.radius)      as number;
  const bleed       = space.md;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        {
          borderRadius:      itemRadius,
          marginHorizontal:  -bleed,
          paddingHorizontal: bleed,
        },
        pressed ? { backgroundColor: washPressed } : null,
      ]}
    >
      <ListItem leading={leading} trailing={trailing}>{children}</ListItem>
    </Pressable>
  );
};
