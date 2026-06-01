/* ──────────────────────────────────────────────────────────────
 * PLAYGROUND · BUTTON MATRIX · RN HAND-TRANSLATION · SHARED SCAFFOLDING
 *
 * Everything every per-component mirror imports. Extracted from the
 * former monolithic `index.tsx` in the N+12b split (one file per
 * component) — the behaviour is unchanged; this only relocates the
 * shared surface so each `<component>.tsx` imports from ONE place.
 *
 * Contents:
 *   · the `build/*` re-exports — every mirror reaches its tokens
 *     through `./_shared`, never into `../../../build/` directly
 *   · the `SvgXml` shim re-export (the ambient module lives in
 *     react-native-svg.d.ts · decision 48)
 *   · resolveToken + RuntimeTokens · the consumer-side dereference
 *   · AccentContext / ThemeContext + AccentProvider · the RN cascade
 *   · SpaceLeaf · the 5-leaf semantic space subset (Stack/Box/Spacer)
 *   · typeStyle + TypeKey · the single relative→absolute type conversion
 *   · useRuntimeTokens · render-time (accent × theme) slice for the List family
 *
 * Verification contract (unchanged): this dir typechecks under
 *   tsc -p docs/migration-tests/button-matrix/tsconfig.json
 * No bundler, no Expo runtime, no rendering — the static contract IS
 * the deliverable.
 * ────────────────────────────────────────────────────────────── */

import * as React from 'react';

import {
  accent as accentTokens,
  chrome,
  space,
  size,
  radius,
  type as typeScale,
} from '../../../build/tokens';
import type { Accent, Theme, TypeSize, TypeWeight, TypeStep } from '../../../build/tokens';
import { button } from '../../../build/components/button';
import { switchTokens } from '../../../build/components/switch';
import { tabs as tabsTokens } from '../../../build/components/tabs';
import { tabBar as tabBarTokens } from '../../../build/components/tab-bar';
import { list as listTokens } from '../../../build/components/list';
import { listItem } from '../../../build/components/list-item';
import { listInteractiveItem } from '../../../build/components/list-interactive-item';
import type { TokenPath } from '../../../build/token-paths';
import { icons } from '../../../build/icons';
import type { IconName, IconWeight } from '../../../build/icons';
import { SvgXml } from 'react-native-svg';
import type { SvgXmlProps } from 'react-native-svg';

// ── build/* re-exports · the single import surface for every mirror ──
export {
  accentTokens,
  chrome,
  space,
  size,
  radius,
  typeScale,
  button,
  switchTokens,
  tabsTokens,
  tabBarTokens,
  listTokens,
  listItem,
  listInteractiveItem,
  icons,
  SvgXml,
};
export type { Accent, Theme, TypeSize, TypeWeight, TypeStep, TokenPath, IconName, IconWeight, SvgXmlProps };

// ── resolveToken · consumer-side dereference helper (decision 34) ─
// A per-component file emits e.g. `button.solidBg` as the literal
// string `'accent.solid' as const satisfies TokenPath`; the consumer
// turns that path into a concrete value at render time by looking it
// up in the current (accent × theme) slice of the runtime tokens.
// Production consumers (Unistyles, custom Context) ship their own
// implementation; the sketch lives in the migration-test pair as
// reference, NOT in `build/` or `lib/`.
//
// N+6.1 (decision 36) added semantic spacing + sizing as cascade-
// invariant runtime sets — the dereference returns `string` for
// colour leaves (chrome / accent) and `number` for dimension leaves
// (space / size / radius). The return type widens to `string | number`
// so the inline render-time consumer can pass the value straight into
// either a `backgroundColor` (string) or a `minHeight` (number) slot.
export type RuntimeTokens = {
  chrome: typeof chrome.light;
  accent: typeof accentTokens.lilac.light;
  space:  typeof space;
  size:   typeof size;
  radius: typeof radius;
};

export function resolveToken(tokens: RuntimeTokens, path: TokenPath): string | number {
  const [group, leaf] = path.split('.') as [keyof RuntimeTokens, string];
  return (tokens[group] as Record<string, string | number>)[leaf];
}

// ── SpaceLeaf · the 5-leaf semantic space subset ─────────────────
// What Stack `gap`, Box `padding*`, and Spacer `size` accept — the
// subset of the full space scale the layout primitives expose on the
// web side (decision 36 / 37).
export type SpaceLeaf = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// ══════════════════════════════════════════════════════════════════
// THEME + ACCENT CONTEXTS · RN analogues of Nuri's web cascade
// ──────────────────────────────────────────────────────────────────
// Web side uses <html data-theme> + <html data-accent>, with nested
// scopes via <nuri-scope> / per-element data-accent. RN has no
// cascade — we model the same two dimensions as React Context.
// One provider per dimension; per AGENTS.md mapping table:
//   data-accent page-level / <nuri-scope accent=...>  →  AccentProvider
//   data-theme  page-level / <nuri-scope mode=...>    →  ThemeProvider
//
// Default values mirror the web defaults: theme 'light', accent 'lilac'.
// ══════════════════════════════════════════════════════════════════
export const AccentContext = React.createContext<Accent>('lilac');
export const ThemeContext = React.createContext<Theme>('light');

// Tier 3 subtree-scope analogue — same shape as the web
// <nuri-scope accent="...">; nest providers for multi-dimension
// scope (the web does it on one element, RN needs one per dim —
// see FRICTIONS.md F-SCOPE-1).
export const AccentProvider: React.FC<{ value: Accent; children: React.ReactNode }> = ({
  value,
  children,
}) => <AccentContext.Provider value={value}>{children}</AccentContext.Provider>;

// ══════════════════════════════════════════════════════════════════
// TYPE SCALE · relative→absolute conversion (decision 54)
// ──────────────────────────────────────────────────────────────────
// The emit keeps lineHeight (a unitless ratio) and letterSpacing (an
// em number) RELATIVE; RN's lineHeight / letterSpacing are absolute dp
// that do NOT scale with fontSize or the OS fontScale. The relative→
// absolute conversion lives in ONE place: `typeStyle(key)`. That is
// also where a `* fontScale` multiply lands when Dynamic Type ships
// (P11 · not now). Consumers use `style={typeStyle(key)}` — never a raw
// `{...type[key]}` spread (lineHeight 1.29 would read as ~1px).
// ══════════════════════════════════════════════════════════════════
export type TypeKey = TypeSize | `${TypeSize}Em`;

export function typeStyle(key: TypeKey) {
  const t = typeScale[key];
  return {
    fontSize: t.fontSize,
    lineHeight: t.fontSize * t.lineHeight,
    letterSpacing: t.fontSize * t.letterSpacing,
    fontWeight: t.fontWeight,
  };
}

// ── useRuntimeTokens · render-time (accent × theme) slice ─────────
// The List family's hook for the live runtime-token slice resolveToken
// dereferences against. Reads ambient accent + theme from context.
export function useRuntimeTokens(): RuntimeTokens {
  const ambientAccent = React.useContext(AccentContext);
  const theme = React.useContext(ThemeContext);
  return {
    chrome: chrome[theme],
    accent: accentTokens[ambientAccent][theme],
    space,
    size,
    radius,
  };
}
