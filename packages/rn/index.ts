/* ──────────────────────────────────────────────────────────────
 * NURI · public barrel · the consumer-facing API surface.
 * Import Nuri from here: `import { Button, NuriThemeProvider } from './src/nuri'`.
 *
 * The clean factory example (R1.5): the contract seam + the theme runtime +
 * the generic descriptor factory (which exports the ergonomic, 1:1-with-web
 * Button / IconAvatar / Topbar). The hand-written migration mirrors are
 * retired — the factory is the single, real consumer of the frozen contract.
 *
 * PUBLIC SURFACE (SEED-4 · Arc 1): the theming API (NuriThemeProvider · NuriScope ·
 * useNuriTheme · resolveToken · useToken · typeStyle · the ThemePayload types), the
 * components + factory helpers (createNuriComponent · nuriNames · compoundSlots ·
 * NuriSurfaceContext · the Button/IconAvatar/Topbar/… instances), NuriIcon, and the
 * hand-authorable primitives (View/Stack/Text/Pressable/Screen/Scroll). The generic
 * descriptor ENGINE (resolveNS · flattenPart · toUnistylesRecipe · recipeFor ·
 * buildNuriTheme · the palette MAPPING · the resolver intermediate types) is
 * deliberately INTERNAL — intra-package module exports only, not on this barrel.
 *
 * ⚠ Arc 1 INTENTIONALLY RESHAPED THE RN API (Option B · resolve colour once at the
 * provider): the payload now lives in context and the engine left the public
 * surface. "No behaviour change" refers to the RENDER OUTPUT (byte-identical · the
 * snapshots + the colour-payload-identity guard), NOT the module surface. There is
 * no compat shim — @nuri/rn has no external consumer to break.
 * ────────────────────────────────────────────────────────────── */

export * from './contract';
export * from './theme';
export * from './factory';
