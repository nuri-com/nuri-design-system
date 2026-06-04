/* ══════════════════════════════════════════════════════════════════
 * TOPBAR · the RN side of <nuri-topbar> · content-pivot · decision 46 · 64 · amendment 46.4
 * ──────────────────────────────────────────────────────────────────
 * API contract mirrors topbar.js (the light-DOM content-pivot shell):
 *   Topbar:
 *     center?:   boolean                      default false
 *     inset? · insetStart? · insetEnd?: 'xs'|'sm'|'lg'  edge-padding
 *                override (decision 46.1) · default 'lg' both edges
 *     children:  leading? · <TopbarContent> · trailing?  (POSITIONAL)
 *   TopbarContent:
 *     children:  bare title text OR a non-text centre (a segmented control)
 *
 * CONTENT-PIVOT (decision 64 · amendment 46.4): the `leading` / `trailing`
 * region components are GONE. The author wraps the centre in
 * <TopbarContent> (the flex:1 <View> pivot) and drops leading / trailing as
 * plain POSITIONAL children around it — anything before the pivot is
 * leading, anything after is trailing. The pivot's `flex:1` absorbs the
 * slack and pushes any trailing to the end BY CONSTRUCTION. This is the
 * validated ListItem content-pivot shape (list.tsx) — web and RN share one
 * explicit anatomy 1:1 (R1).
 *
 * Resolves the R-EXPO-2 cluster (SPEC-FEEDBACK F-DEMO-6) STRUCTURALLY:
 *   (a) NO phantom gap · a positional empty side is simply absent — there
 *       is no empty side <View> to reserve a `gap` slot (was: an empty
 *       region <View> still ate a gap slot · violated amendment 46.3).
 *   (b) NO collapsed trailing · leading / trailing are self-sized positional
 *       controls, never a `flex:0` (basis-0) region that measured 0px and
 *       let icons overflow (the old `flex: sideFlex` bug · now there is no
 *       side region to collapse).
 *   (c) the non-text centre is NOT <Text>-wrapped · the lg-em title type
 *       applies to BARE TEXT only — a non-text centre (a segmented control,
 *       an <Icon>, a <View>) passes through (was: a single <Text> wrapping
 *       all centre nodes · native-invalid for a non-text child).
 *
 * Topbar is a LAYOUT PRIMITIVE (decision 46) — no component-token aliasing.
 * It reads the semantic chrome vocabulary directly: size.lg (height ·
 * matches the web `var(--nuri-size-lg)` · the prior `size.xl` was a stale
 * web↔RN drift, corrected here), chrome.bgCanvas (surface), space.sm (gap),
 * space.{xs,sm,lg} (edge padding · base lg + declarative inset · decision
 * 46.1). The title type is NOT hand-applied: <TopbarContent> REUSES
 * Typography (the single text-style owner · decision 64 · 53) for bare
 * text, exactly as the web pivot applies the `.nuri-type-lg--em` utility.
 *
 * `center` centres the content WITHIN the pivot (`alignItems: 'center'`) —
 * with symmetric side controls (a segmented switch flanked by equal icon
 * buttons · the common centred shape) it reads optically centred. This is
 * the web↔RN-faithful realization that survives the positional model: the
 * old equal-flex side WRAPPERS that balanced asymmetric sides are gone with
 * the reparenting they required (amendment 46.4 · the budgeted center
 * mechanism · R1).
 * ══════════════════════════════════════════════════════════════════ */

import * as React from 'react';
import { View } from 'react-native';
import { NuriThemeContext, chrome, space, size } from './_shared';
import { Typography } from './typography';

type Inset = 'xs' | 'sm' | 'lg';

// center reaches the pivot the way the web `[data-center]` attribute reaches
// <nuri-topbar-content> through the cascade — RN has no cascade, so one
// Context carries it (the RowDensityContext pattern · list.tsx).
const TopbarContext = React.createContext<{ center: boolean }>({ center: false });

// The content PIVOT — the RN analogue of <nuri-topbar-content>. The flex:1
// <View> that absorbs the row's slack and pushes any trailing positional
// sibling to the end. A LAYOUT part: bare title text REUSES Typography
// (lg-em · the single text-style owner · decision 64 · 53); a NON-TEXT
// centre passes through untyped — never <Text>-wrapped (the R-EXPO-2c fix).
export const TopbarContent: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { center } = React.useContext(TopbarContext);
  return (
    <View style={{ flex: 1, minWidth: 0, ...(center ? { alignItems: 'center' } : null) }}>
      {typeof children === 'string'
        ? <Typography size="lg" emphasis>{children}</Typography>
        : children}
    </View>
  );
};

export type TopbarProps = {
  center?: boolean;
  // Edge-padding override · mirrors the web inset API (decision 46.1).
  // `inset` is the symmetric shorthand; insetStart / insetEnd win per edge.
  // Default 'lg' both edges — never auto-resolved from child type (per-shape
  // defaults move to recipes · amendment 46.4).
  inset?: Inset;
  insetStart?: Inset;
  insetEnd?: Inset;
  children?: React.ReactNode;
};

export const Topbar: React.FC<TopbarProps> = ({
  center = false,
  inset,
  insetStart,
  insetEnd,
  children,
}) => {
  const { mode } = React.useContext(NuriThemeContext);
  const chromeSlice = chrome[mode];

  // Edge padding · base 'lg' + the declarative inset override (per edge,
  // `inset` shorthand folded in). Declared once, read identically here and
  // in CSS — no per-platform heuristic, no occupancy / center auto.
  const paddingStart = space[insetStart ?? inset ?? 'lg'];
  const paddingEnd = space[insetEnd ?? inset ?? 'lg'];

  // Positional children flow in document order: leading · <TopbarContent> ·
  // trailing — exactly like the web row. No region routing, no empty-side
  // <View> (so no phantom gap · R-EXPO-2a). center reaches the pivot via
  // context, the RN analogue of the web `[data-center]` descendant selector.
  return (
    <TopbarContext.Provider value={{ center }}>
      <View
        accessibilityRole="header"
        style={{
          flexDirection:   'row',
          alignItems:      'center',
          height:          size.lg,
          backgroundColor: chromeSlice.bgCanvas,
          gap:             space.sm,
          paddingStart,
          paddingEnd,
        }}
      >
        {children}
      </View>
    </TopbarContext.Provider>
  );
};
