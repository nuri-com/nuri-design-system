/* ──────────────────────────────────────────────────────────────
 * NURI · public barrel · the consumer-facing API surface.
 * Import Nuri from here: `import { Button, NuriThemeProvider } from './src/nuri'`.
 *
 * The clean factory example (R1.5): the contract seam + the theme runtime +
 * generated descriptor adapters (Button / IconAvatar / Topbar / ...) over a
 * shared normalized renderer. The hand-written migration mirrors are retired.
 *
 * PUBLIC SURFACE (SEED-4 · completion): the theming API (NuriThemeProvider · NuriScope ·
 * useNuriTheme · typeStyle · the ThemePayload type), the
 * components + renderer helpers (nuriNames · NuriSurfaceContext · the
 * Button/IconAvatar/Topbar/… instances), NuriIcon, and the
 * hand-authorable primitives (View/Stack/Text/Pressable/Screen/Scroll). The generic
 * descriptor ENGINE (resolveNS · flattenPart · flattenBakedPart · buildNuriTheme ·
 * the palette MAPPING · the baked geometry recipe + the resolver intermediate types)
 * is deliberately INTERNAL — intra-package module exports only, not on this barrel.
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
