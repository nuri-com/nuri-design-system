/* ══════════════════════════════════════════════════════════════════
 * NURI · THEME RUNTIME · the consumer-side theming model
 * ──────────────────────────────────────────────────────────────────
 * Productionized from the migration-test reference (_shared.tsx). The
 * CONTRACT is preserved 1:1 (the mirror is the answer-key on the
 * contract); only the public surface is rounded out for a real app:
 *
 *   NuriThemeContext   the single orthogonal theming context · ONE entry
 *                      per live dimension { mode, accent } (decision
 *                      27/62). NOT two contexts; NOT a (∏ dims) registry.
 *   NuriThemeProvider  the ROOT provider — establishes the base value
 *                      (defaults mirror the web <html data-*>: light/lilac).
 *   NuriScope          the Tier-3 subtree scope — MERGE-ON-OVERRIDE, so a
 *                      child can flip `accent` without redeclaring `mode`.
 *   useNuriTheme()     one useContext lookup → { mode, accent }.
 *   useRuntimeTokens() the render-time (accent × mode) RuntimeTokens slice.
 *   resolveToken()     dereference a TokenPath → string (colour) | number
 *                      (dimension). The contract signature is (tokens, path).
 *   useToken()         ergonomic single-arg form: resolveToken(slice, path).
 *   typeStyle()        the ONE relative→absolute type conversion (the place
 *                      a future × fontScale / Dynamic Type lands · P11).
 *
 * Why no `tokens` in the context (decision 27/62 · the framing rule):
 * the context carries only { mode, accent }; the token slice is DERIVED
 * via useRuntimeTokens(). Storing the slice in context would couple every
 * consumer to a recompute and lose the orthogonal-dimensions property.
 *
 * `density` / `neutral` are RESERVED by the spec but are NOT context
 * entries until their web tokens exist (P11). `font` is web-only
 * (amendment 27.1) and never migrates — RN uses the platform system font.
 * ══════════════════════════════════════════════════════════════════ */

import * as React from 'react';

import {
  chrome,
  accentTokens,
  space,
  size,
  radius,
  typeScale,
} from './contract';
import type { Accent, Theme, TokenPath, TypeSize } from './contract';

// ── RuntimeTokens · the live (accent × theme) slice resolveToken reads ──
// chrome is theme-keyed; accent is (accent × theme)-keyed; space/size/
// radius are cascade-invariant singletons. resolveToken returns string for
// colour leaves (chrome/accent) and number for dimension leaves.
export type RuntimeTokens = {
  chrome: typeof chrome.light;
  accent: typeof accentTokens.lilac.light;
  space: typeof space;
  size: typeof size;
  radius: typeof radius;
};

// ── SpaceLeaf · the 5-leaf semantic space subset the layout primitives
// expose (Stack gap, Box padding*, Spacer size · decision 36/37). ──
export type SpaceLeaf = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// ── TypeKey · a step in the type scale, regular or em (decision 54). ──
export type TypeKey = TypeSize | `${TypeSize}Em`;

// ══════════════════════════════════════════════════════════════════
// The single orthogonal theming context.
// ══════════════════════════════════════════════════════════════════
export type NuriThemeValue = {
  mode: Theme;
  accent: Accent;
  // density / neutral RESERVED · not entries until their web tokens
  // exist (P11). No `font` — web-only per amendment 27.1.
};

// Default mirrors the web <html data-*> defaults: mode 'light', accent 'lilac'.
export const NuriThemeContext = React.createContext<NuriThemeValue>({
  mode: 'light',
  accent: 'lilac',
});

// NuriThemeProvider · the ROOT. Sets the base value for the tree. Both
// props default to the web defaults, so <NuriThemeProvider> with no props
// === the spec's default surface. An app that drives mode/accent (e.g. a
// light/dark toggle, or useColorScheme) passes them here.
export const NuriThemeProvider: React.FC<
  Partial<NuriThemeValue> & { children: React.ReactNode }
> = ({ mode = 'light', accent = 'lilac', children }) => (
  <NuriThemeContext.Provider value={{ mode, accent }}>
    {children}
  </NuriThemeContext.Provider>
);

// NuriScope · the Tier-3 subtree-scope analogue (RN twin of web
// <nuri-scope mode=… accent=…>). MERGE-ON-OVERRIDE: reads the ambient
// context and emits { ...ambient, ...overrides } — unspecified dimensions
// inherit, specified ones win. ONE composite Provider, not one-per-dim
// (F-SCOPE-1 closed · decision 62). The single-context model is immune to
// the web cascade accent×theme self-scope edge (F-SCOPE-3 is web-only).
export const NuriScope: React.FC<
  Partial<NuriThemeValue> & { children: React.ReactNode }
> = ({ children, ...overrides }) => {
  const ambient = React.useContext(NuriThemeContext);
  return (
    <NuriThemeContext.Provider value={{ ...ambient, ...overrides }}>
      {children}
    </NuriThemeContext.Provider>
  );
};

// ── useNuriTheme · the one useContext lookup ──────────────────────
export function useNuriTheme(): NuriThemeValue {
  return React.useContext(NuriThemeContext);
}

// ── useRuntimeTokens · render-time (accent × mode) slice ──────────
// The RuntimeTokens resolveToken dereferences against. Reads the ambient
// (accent, mode) pair from the single NuriThemeContext.
export function useRuntimeTokens(): RuntimeTokens {
  const { mode, accent } = React.useContext(NuriThemeContext);
  return runtimeTokens(accent, mode);
}

// Pure (accent, mode) → RuntimeTokens. Exposed so a component that already
// resolved its self-scoped accent (Button/IconButton, prop-wins-ambient)
// can build the slice without a second context read.
export function runtimeTokens(accent: Accent, mode: Theme): RuntimeTokens {
  return {
    chrome: chrome[mode],
    accent: accentTokens[accent][mode],
    space,
    size,
    radius,
  };
}

// ── resolveToken · consumer-side dereference (decision 34) ────────
// A per-component file emits e.g. button.solidBg as the literal string
// 'accent.solid' as const satisfies TokenPath; this turns that path into a
// concrete value by indexing the live slice. Returns string for colour
// leaves (chrome/accent), number for dimension leaves (space/size/radius)
// — handle the union at the call site (cast `as string` / `as number`).
export function resolveToken(tokens: RuntimeTokens, path: TokenPath): string | number {
  const [group, leaf] = path.split('.') as [keyof RuntimeTokens, string];
  return (tokens[group] as Record<string, string | number>)[leaf];
}

// ── useToken · ergonomic single-arg dereference ───────────────────
// Sugar over resolveToken(useRuntimeTokens(), path) for the common case of
// a one-off lookup in a component body. The contract primitive stays the
// pure two-arg resolveToken; this just spares the slice plumbing.
export function useToken(path: TokenPath): string | number {
  return resolveToken(useRuntimeTokens(), path);
}

// ══════════════════════════════════════════════════════════════════
// TYPE SCALE · relative→absolute conversion (decision 54)
// ──────────────────────────────────────────────────────────────────
// The emit keeps lineHeight (unitless ratio) and letterSpacing (em number)
// RELATIVE; RN's lineHeight / letterSpacing are absolute dp. The
// relative→absolute multiply lives in ONE place — here. Never raw-spread
// type[key] (lineHeight 1.29 would read as ~1px). This is also where a
// `* fontScale` lands when Dynamic Type ships (P11).
export function typeStyle(key: TypeKey) {
  const t = typeScale[key];
  return {
    fontSize: t.fontSize,
    lineHeight: t.fontSize * t.lineHeight,
    letterSpacing: t.fontSize * t.letterSpacing,
    fontWeight: t.fontWeight,
  } as const;
}
