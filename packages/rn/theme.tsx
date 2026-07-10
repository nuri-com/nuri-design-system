/* ══════════════════════════════════════════════════════════════════
 * NURI · THEME RUNTIME · the consumer-side theming model (Option B · SEED-4)
 * ──────────────────────────────────────────────────────────────────
 * The context now carries the RESOLVED THEME PAYLOAD (Option B · the debt-
 * register SEED-4 rework): the provider builds it ONCE per address and hands
 * it down, instead of every component/every render re-resolving the theme.
 *
 *   NuriThemeContext   the single orthogonal theming context · ONE entry per
 *                      live tree, holding the ThemePayload (Address {mode,accent}
 *                      + the resolved surface/chrome roles).
 *   NuriThemeProvider  the ROOT provider — builds the base payload (defaults
 *                      mirror the web <html data-*>: light/lilac).
 *   NuriScope          the Tier-3 subtree scope — MERGE-ON-OVERRIDE on the
 *                      ADDRESS (flip `accent`, inherit `mode`), then rebuild the
 *                      payload for the merged address. The ONE override mechanism
 *                      for root · scope · prop-accent (SEED-4).
 *   useNuriTheme()     one useContext lookup → the ThemePayload.
 *   typeStyle()        the ONE relative→absolute type conversion (the place
 *                      a future × fontScale / Dynamic Type lands · P11).
 *
 * Why the payload lives in context now (SEED-4 · reversing decision 27/62's
 * "no tokens in context"): the resolution is a PURE function of the address
 * (chrome[mode] ⊕ accent[accent][mode] · orthogonal · no cross-product), so
 * building it once at the provider and reading it downstream is strictly
 * cheaper than re-collapsing per component — while the Address scalars stay in
 * the payload so a nested scope can flip ONE axis and inherit the other.
 *
 * `density` / `neutral` are RESERVED by the spec but are NOT context entries
 * until their web tokens exist (P11). `font` is web-only (amendment 27.1) and
 * never migrates — RN uses the platform system font.
 * ══════════════════════════════════════════════════════════════════ */

import * as React from 'react';

import { typeScale, emphasisWeight } from './contract';
import type { Accent, Theme, TypeSize } from './contract';
import { buildNuriTheme } from './runtime/theme-payload';
import type { ThemePayload } from './runtime/theme-payload';

// Re-export the resolved payload type on the public barrel (index.ts `export *`).
export type { ThemePayload } from './runtime/theme-payload';

// ── SpaceLeaf · the 5-leaf semantic space subset the layout primitives
// expose (View gap/padding*, Spacer size · decision 36/37). ──
export type SpaceLeaf = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// ── TypeKey · a step in the type scale (decision 54 · de-fused 77). The fused
// `${TypeSize}Em` arm is GONE — emphasis is an orthogonal boolean (typeStyle's
// 2nd arg), not part of the key (P11). Kept as an alias for the 6 sizes. ──
export type TypeKey = TypeSize;

// ══════════════════════════════════════════════════════════════════
// The single orthogonal theming context.
// ══════════════════════════════════════════════════════════════════
// NuriThemeValue · the ADDRESS (the two live dimensions). The Provider/Scope
// take it as their prop surface; the resolved payload is DERIVED from it.
export type NuriThemeValue = {
  mode: Theme;
  accent: Accent;
  // density / neutral RESERVED · not entries until their web tokens
  // exist (P11). No `font` — web-only per amendment 27.1.
};

// Default mirrors the web <html data-*> defaults: mode 'light', accent 'lilac'.
export const NuriThemeContext = React.createContext<ThemePayload>(
  buildNuriTheme('lilac', 'light'),
);

// NuriThemeProvider · the ROOT. Builds the base payload for the tree. Both props
// default to the web defaults, so <NuriThemeProvider> with no props === the
// spec's default surface. An app that drives mode/accent (a light/dark toggle,
// useColorScheme) passes them here; the payload rebuilds only when the address
// changes (memoised per address · the resolution runs ONCE).
export const NuriThemeProvider: React.FC<
  Partial<NuriThemeValue> & { children: React.ReactNode }
> = ({ mode = 'light', accent = 'lilac', children }) => {
  const payload = React.useMemo(() => buildNuriTheme(accent, mode), [accent, mode]);
  return <NuriThemeContext.Provider value={payload}>{children}</NuriThemeContext.Provider>;
};

// NuriScope · the Tier-3 subtree-scope analogue (RN twin of web
// <nuri-scope mode=… accent=…>). MERGE-ON-OVERRIDE on the ADDRESS: reads the
// ambient payload's { mode, accent }, applies the overrides, and rebuilds the
// payload for the merged address — so an unspecified dimension inherits, a
// specified one wins. ONE composite Provider, not one-per-dim (F-SCOPE-1 closed
// · decision 62). This is the SINGLE override path (SEED-4): the prop-accent
// case (<Button accent="orange">) is just a NuriScope the factory establishes.
export const NuriScope: React.FC<
  Partial<NuriThemeValue> & { children: React.ReactNode }
> = ({ mode, accent, children }) => {
  const ambient = React.useContext(NuriThemeContext);
  const nextMode = mode ?? ambient.mode;
  const nextAccent = accent ?? ambient.accent;
  const payload = React.useMemo(
    () => buildNuriTheme(nextAccent, nextMode),
    [nextAccent, nextMode],
  );
  return <NuriThemeContext.Provider value={payload}>{children}</NuriThemeContext.Provider>;
};

// ── useNuriTheme · the one useContext lookup → the resolved payload ──
export function useNuriTheme(): ThemePayload {
  return React.useContext(NuriThemeContext);
}

// ══════════════════════════════════════════════════════════════════
// TYPE SCALE · relative→absolute conversion (decision 54 · de-fused 77)
// ──────────────────────────────────────────────────────────────────
// Two ORTHOGONAL inputs (decision 77 · the N+45 de-fusion): `size` is the
// type-scale step; `emphasis` swaps the regular weight to the single semibold
// override (emphasisWeight · uniform across every size · P11). The emit keeps
// lineHeight (unitless ratio) and letterSpacing (em number) RELATIVE; RN's are
// absolute dp, so the relative→absolute multiply lives in ONE place — here.
// Never raw-spread type[size] (lineHeight 1.29 would read as ~1px). This is also
// where a `* fontScale` lands when Dynamic Type ships (P11) — the ONE legit
// runtime multiply that survives the SEED-4 collapse.
export function typeStyle(size: TypeSize, emphasis?: boolean) {
  const t = typeScale[size];
  return {
    fontSize: t.fontSize,
    lineHeight: t.fontSize * t.lineHeight,
    letterSpacing: t.fontSize * t.letterSpacing,
    fontWeight: emphasis ? emphasisWeight : t.fontWeight,
  } as const;
}
