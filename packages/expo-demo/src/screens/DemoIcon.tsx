/* ══════════════════════════════════════════════════════════════════
 * DEMO GLYPH — the CONSUMER's glyph glue (not part of nuri)
 * ──────────────────────────────────────────────────────────────────
 * The factory is glyph-AGNOSTIC: it drives the consumer-glyph contract
 * `{ color?, dimension? }` into whatever icon element you hand its icon part —
 * `color` by SCOPE (the surface foreground), `dimension` from the icon part's
 * box on the SHARED size axis (N+51). THIS is the ~12 lines a consuming app
 * writes once to render the spec's icon registry — exactly the "how the team
 * consumes the spec" example. It reads the frozen `icons` registry (one
 * registry, two readers · decision 48) through react-native-svg and exposes the
 * `color` + `dimension` props so <IconAvatar> can drive both by scope + box.
 * `dimension` defaults to size.sm (the icon "md" · the OFFSET) for standalone use.
 * ══════════════════════════════════════════════════════════════════ */

import * as React from 'react';
import { SvgXml } from 'react-native-svg';
import { icons, size } from '@nuri/rn';
import type { IconName } from '@nuri/rn';

export type DemoIconProps = {
  name: IconName;
  color?: string; // injected by the factory's icon part (scope foreground)
  dimension?: number;
};

export const DemoIcon: React.FC<DemoIconProps> = ({ name, color, dimension = size.sm }) => {
  const xml = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor">${icons[name]}</svg>`;
  return <SvgXml xml={xml} width={dimension} height={dimension} color={color ?? '#000'} />;
};
