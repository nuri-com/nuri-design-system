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
 *   · NuriThemeContext + NuriScope · the single orthogonal theming
 *     context (decision 27/62 · merge-on-override · one entry per dim)
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
import { iconButton } from '../../../build/components/icon-button';
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
  iconButton,
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
// NURI THEME CONTEXT · the single orthogonal theming context
// (decision 27 · implemented decision 62 · closes F-SCOPE-1)
// ──────────────────────────────────────────────────────────────────
// Web side uses <html data-theme> + <html data-accent>, with nested
// scopes via <nuri-scope> / per-element data-accent. RN has no cascade —
// we model the SAME dimensions as ONE React Context whose value carries
// one entry PER DIMENSION. This is NOT two separate contexts (the
// per-dimension shape decision 27 REJECTED · the old AccentContext +
// ThemeContext) and NOT a pre-computed (∏ dims) theme registry (also
// rejected · scales O(∏ dims) · breaks the composability decisions 1/6/9
// rest on). Per AGENTS.md mapping table, both <nuri-scope accent=…> and
// <nuri-scope mode=…> map onto ONE <NuriScope> — no per-dimension synonym.
//
// Today only `mode` + `accent` are context entries (their CSS counterparts
// ship on the web side). `density` / `neutral` are RESERVED by the spec but
// are NOT context entries until their web tokens exist (P11). `font` is
// web-only (amendment 27.1) and never migrates.
//
// Default values mirror the web <html data-*> defaults: mode 'light',
// accent 'lilac'.
// ══════════════════════════════════════════════════════════════════
export type NuriThemeValue = {
  mode: Theme;
  accent: Accent;
};

export const NuriThemeContext = React.createContext<NuriThemeValue>({
  mode: 'light',
  accent: 'lilac',
});

// NuriScope · the Tier-3 subtree-scope analogue · the RN twin of the web
// <nuri-scope mode=… accent=…>. MERGE-ON-OVERRIDE: reads the ambient
// context and emits { ...ambient, ...overrides }, so unspecified dimensions
// inherit and specified ones win — `accent` can flip without redeclaring
// `mode`. ONE composite Provider, not one-per-dimension: the shape
// decision 27 (N+5.5) picked over the linear-nesting cost F-SCOPE-1
// originally surfaced.
export const NuriScope: React.FC<Partial<NuriThemeValue> & { children: React.ReactNode }> = ({
  children,
  ...overrides
}) => {
  const ambient = React.useContext(NuriThemeContext);
  return (
    <NuriThemeContext.Provider value={{ ...ambient, ...overrides }}>
      {children}
    </NuriThemeContext.Provider>
  );
};

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

// ── useRuntimeTokens · render-time (accent × mode) slice ──────────
// The List family's hook for the live runtime-token slice resolveToken
// dereferences against. Reads the ambient (accent, mode) pair from the
// single NuriThemeContext.
export function useRuntimeTokens(): RuntimeTokens {
  const { mode, accent } = React.useContext(NuriThemeContext);
  return {
    chrome: chrome[mode],
    accent: accentTokens[accent][mode],
    space,
    size,
    radius,
  };
}
