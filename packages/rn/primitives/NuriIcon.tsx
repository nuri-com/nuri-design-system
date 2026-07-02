/* ══════════════════════════════════════════════════════════════════
 * NURI · PRIMITIVES · NuriIcon (the DS owns RN glyph rendering)
 * ──────────────────────────────────────────────────────────────────
 * The RN twin of web's `<nuri-icon name>`: resolve a TYPED `IconName` →
 * the frozen registry markup (`icons[name]` · rn/generated/data/icons.ts · one
 * drawing per glyph · decision 38 · N+51) → render the SVG through
 * react-native-svg's `SvgXml` (one registry, two readers · decision 48).
 *
 * THIS is the shift the icon-contract makes: glyph rendering is the DS's,
 * not the consumer's. Before, the factory was glyph-AGNOSTIC — it cloned a
 * consumer-passed element and injected `{ color, dimension }`. Now the icon
 * part resolves the NAME and renders here, so a non-existent glyph is a TS
 * build error (`icon: IconName` · the typed register key) and the consumer
 * never touches react-native-svg.
 *
 * `color`  → the scope foreground (the currentColor channel · §12 · the
 *            factory threads the resolved surface fg in).
 * `dimension` → the icon part's resolved box width on the SHARED size axis
 *            (N+51), threaded from the factory; standalone it defaults to the
 *            icon "md" (the `sm` size leaf · the naming OFFSET).
 * viewBox `0 0 32 32` · `fill="currentColor"` — mirrors the web element.
 * ══════════════════════════════════════════════════════════════════ */

import * as React from 'react';
import { SvgXml } from 'react-native-svg';
import { icons, size } from '../contract';
import type { IconName } from '../contract';
import { useNuriTheme } from '../theme';

export type NuriIconProps = {
  // The TYPED register key — `keyof` the frozen register (the build-error gate).
  name: IconName;
  // The currentColor channel — the scope foreground (the factory injects it).
  color?: string;
  // The glyph px size — the icon part's resolved box width (the SHARED axis).
  dimension?: number;
};

export const NuriIcon: React.FC<NuriIconProps> = ({ name, color, dimension = size.sm }) => {
  const theme = useNuriTheme();
  const xml = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor">${icons[name]}</svg>`;
  return <SvgXml xml={xml} width={dimension} height={dimension} color={color ?? theme.text.primary} />;
};
