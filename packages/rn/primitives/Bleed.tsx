// ════════════════════════════════════════════════════════════════
// Bleed — controlled negative space · RN <View>
// ════════════════════════════════════════════════════════════════
import * as React from 'react';
import { View as RNView } from 'react-native';
import type { ViewStyle } from 'react-native';
import type { BleedNS } from '../contract';
import { resolveBleed } from '../runtime/resolve';
import { BLEED_FIELDS } from '@nuri/spec/resolve-map';
import { withKeys } from './shared';

export type BleedProps = BleedNS & {
  children: React.ReactElement;
};

// The element's fixed, non-configurable lift. `position:relative` makes the
// stacking promise explicit on web parity; zIndex is the RN realization.
const LIFT_STYLE: ViewStyle = { position: 'relative', zIndex: 1 };

// HIT-TRANSPARENCY CASCADE (the RN mirror of the web `.nuri-bleed`
// pointer-events cascade): static layout Views inside a Bleed band render
// `box-none` so the lifted band never eats sibling touches; interactive hosts
// (Pressable subtrees) are their own targets and are unaffected. INTERNAL —
// consumed by primitives/View, never public API.
export const BleedHitTransparencyContext = React.createContext(false);

// Screen scaffolding and gesture-owning primitives are NOT valid band content
// (a transparent Scroll cannot pan; screen chrome inside a negative-space band
// is a composition error) — the documented exclusion, ENFORCED: each of them
// calls this and fails named when rendered inside a Bleed band, at any depth,
// through any component (review P2 round 4).
export function useAssertNotBandContent(name: string): void {
  const inBleedBand = React.useContext(BleedHitTransparencyContext);
  if (inBleedBand) {
    throw new Error(
      `[nuri] <${name}> is screen scaffolding / gesture-owning and is not valid <Bleed> band content ` +
      '(the hit-transparency contract — see the Bleed doc).',
    );
  }
}

const BleedImpl: React.FC<BleedProps> = ({ children, ...bleed }) => {
  const child = React.Children.only(children);
  if (child.type === React.Fragment) {
    throw new Error('Bleed expects exactly one host child; fragments are not accepted.');
  }
  return (
    // HIT TRANSPARENCY (the element contract · #212 addendum item 2): the lift
    // makes the bleed band overlap siblings, so the container must never eat
    // their touches — `box-none` keeps the wrapper transparent while its child
    // subtree stays fully hit-testable (the retired consumer overlay's
    // behaviour, promoted into the element; web mirror: styles/bleed.css
    // pointer-events cascade).
    <RNView pointerEvents="box-none" style={[resolveBleed(bleed), LIFT_STYLE]}>
      <BleedHitTransparencyContext.Provider value={true}>
        {child}
      </BleedHitTransparencyContext.Provider>
    </RNView>
  );
};
BleedImpl.displayName = 'Bleed';

export const Bleed = withKeys(BleedImpl, Object.keys(BLEED_FIELDS));
