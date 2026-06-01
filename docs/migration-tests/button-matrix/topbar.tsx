/* ══════════════════════════════════════════════════════════════════
 * TOPBAR · the RN side of <nuri-topbar> + wrappers · N+6.6 · decision 46
 * ──────────────────────────────────────────────────────────────────
 * API contract mirrors topbar.js (the light-DOM compound shell):
 *   Topbar:
 *     center?:   boolean                      default false
 *     inset? · insetStart? · insetEnd?: 'xs'|'sm'|'lg'  edge-padding
 *                override (decision 46.1) · default auto from structure
 *     children:  TopbarStart? · centre nodes · TopbarEnd?
 *   TopbarStart / TopbarEnd:
 *     children:  the leading / trailing region content (optional)
 *
 * COMPLETE translation of the LAYOUT. It composes IconButton for any
 * icon affordances (now glyph-live as of N+6.8 · F-ICON-RN-1 CLOSED) —
 * Topbar adds NO new *direct* Icon consumer, so it kept the single
 * funnel narrow while the renderer debt was still open (see RISKS).
 * Like Tabs, the shell inspects its children for the named region
 * element types and routes them; everything else is the centre (the
 * web reparents authored children into three region containers — RN's
 * analogue is this child split).
 *
 * Topbar is a LAYOUT PRIMITIVE (decision 46) — no component-token
 * aliasing. It reads the semantic chrome vocabulary directly:
 * size.xl (height), chrome.bgCanvas (surface), chrome.textPrimary
 * (composed text colour — RN has no inherited `color`, so the title
 * carries it), space.sm (gap), space.xs / space.sm / space.lg (edge
 * padding · base → occupancy → center → inset · decision 46.1).
 *
 * Edge-padding occupancy + center are computed here from structure,
 * the RN analogue of the web's data-leading / data-trailing /
 * data-center attribute dispatch (decision 42 · the web computes it
 * in CSS, never JS; RN has no CSS so the split happens at the call
 * site, off the token surface — same values either way).
 * ══════════════════════════════════════════════════════════════════ */

import * as React from 'react';
import { Text, View } from 'react-native';
import { NuriThemeContext, typeStyle, chrome, space, size } from './_shared';

type TopbarRegionProps = { children?: React.ReactNode };

// Region markers · presentational pass-throughs. The web wrappers are
// display:contents markers the controller reads; on RN they exist as
// distinct component identities so Topbar can route them by `type`.
export const TopbarStart: React.FC<TopbarRegionProps> = ({ children }) => <>{children}</>;
export const TopbarEnd: React.FC<TopbarRegionProps> = ({ children }) => <>{children}</>;

type Inset = 'xs' | 'sm' | 'lg';
export type TopbarProps = {
  center?: boolean;
  // Edge-padding override · mirrors the web inset API (decision 46.1).
  // `inset` is the symmetric shorthand; insetStart / insetEnd win per
  // edge. Declared once, read identically here and in CSS — no
  // per-platform heuristic.
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

  // Route the named region markers; everything else is the centre —
  // the RN analogue of the web reparenting into start / centre / end.
  let startNode: React.ReactNode = null;
  let endNode: React.ReactNode = null;
  const centreNodes: React.ReactNode[] = [];
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child)) {
      if (child.type === TopbarStart) { startNode = child; return; }
      if (child.type === TopbarEnd)   { endNode = child; return; }
    }
    centreNodes.push(child);
  });

  const leadingFilled = startNode != null;
  const trailingFilled = endNode != null;

  // Edge padding · base → occupancy → center → inset, the exact order
  // the CSS layers it (decision 46.1). Occupancy: a filled edge hugs
  // its control (sm), an empty edge gives content room (lg). center
  // mode defaults to a tight symmetric xs gutter; the explicit inset
  // override (per edge, `inset` shorthand folded in) wins last.
  const startInset = insetStart ?? inset;
  const endInset = insetEnd ?? inset;
  const paddingStart = startInset
    ? space[startInset]
    : center
      ? space.xs
      : leadingFilled
        ? space.sm
        : space.lg;
  const paddingEnd = endInset
    ? space[endInset]
    : center
      ? space.xs
      : trailingFilled
        ? space.sm
        : space.lg;

  // center=true → equal side regions (flex:1) keep the centre optically
  // centred regardless of side widths; default → centre absorbs slack.
  const sideFlex = center ? 1 : 0;

  return (
    <View
      accessibilityRole="header"
      style={{
        flexDirection:   'row',
        alignItems:      'center',
        height:          size.xl,
        backgroundColor: chromeSlice.bgCanvas,
        gap:             space.sm,
        paddingStart,
        paddingEnd,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, flex: sideFlex }}>
        {startNode}
      </View>
      <View
        style={{
          flexDirection:  'row',
          alignItems:     'center',
          gap:            space.sm,
          flexGrow:       center ? 0 : 1,
          flexShrink:     1,
          justifyContent: center ? 'center' : 'flex-start',
        }}
      >
        {/* Default title type · lg-em from the shared scale (decision
            54/55). RN can't propagate text style through a View, so the
            centre carries a Text layer that bare title text inherits —
            the analogue of the web .nuri-topbar__center type block. The
            wrapper is in the COMPONENT (generic), not per-title in the
            demo. */}
        <Text style={{ ...typeStyle('lgEm'), color: chromeSlice.textPrimary }}>
          {centreNodes}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, flex: sideFlex, justifyContent: 'flex-end' }}>
        {endNode}
      </View>
    </View>
  );
};
