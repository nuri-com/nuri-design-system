/* ══════════════════════════════════════════════════════════════════
 * ICON · the RN side of <nuri-icon> · N+6.3 spec · N+6.8 renderer
 * ──────────────────────────────────────────────────────────────────
 * API contract mirrors icon.js (the web custom-element · decision 38):
 *   name:   IconName  (registry key · the typed union from build/icons)
 *   size?:  'md' | 'sm'                         default 'md'
 *   fill?:  boolean                             presence forces fill weight
 *   color?: string    (currentColor analogue · defaults to ambient text)
 *
 * ONE registry, TWO readers (decision 48): the web inlines icons.js
 * directly; this RN side dereferences the SAME path strings — emitted
 * once as the typed build/icons.ts — through react-native-svg's SvgXml.
 *
 * Weight coupling is identical to the web (decision 38) — NOT a prop:
 *   md  + no fill → regular
 *   sm  + no fill → bold
 *   any + fill    → fill
 *
 * Box dimensions mirror icon.css (decision 38): md → size.sm (28px) ·
 * sm → size.xs (18px). currentColor maps to the `color` prop; default
 * is the ambient text colour (chrome text-primary).
 * ══════════════════════════════════════════════════════════════════ */

import * as React from 'react';
import {
  SvgXml,
  NuriThemeContext,
  size,
  chrome,
  icons,
  type IconName,
  type IconWeight,
} from './_shared';

export type IconProps = {
  name: IconName;
  size?: 'md' | 'sm';
  fill?: boolean;
  color?: string;
};

// md → size.sm (28px) · sm → size.xs (18px) — the icon.css box subset.
const ICON_DIMENSION: Record<NonNullable<IconProps['size']>, number> = {
  md: size.sm,
  sm: size.xs,
};

export const Icon: React.FC<IconProps> = ({ name, size: iconSize = 'md', fill, color }) => {
  const { mode } = React.useContext(NuriThemeContext);
  // Weight coupling (decision 38) · identical to icon.js #render.
  const weight: IconWeight = fill ? 'fill' : iconSize === 'sm' ? 'bold' : 'regular';
  // Re-wrap the registry path in the phosphor viewBox grid — the same
  // <svg> shell icon.js builds — and feed it to SvgXml. fill=currentColor
  // resolves to the `color` prop (SvgXml's currentColor channel).
  const xml =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" ` +
    `fill="currentColor">${icons[name][weight]}</svg>`;
  const dimension = ICON_DIMENSION[iconSize];
  return (
    <SvgXml
      xml={xml}
      width={dimension}
      height={dimension}
      color={color ?? chrome[mode].textPrimary}
    />
  );
};
