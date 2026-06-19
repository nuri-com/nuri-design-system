/* ──────────────────────────────────────────────────────────────
 * NURI · public barrel · the consumer-facing API surface.
 * Import Nuri from here: `import { Button, NuriThemeProvider } from './src/nuri'`.
 *
 * The clean factory example (R1.5): the contract seam + the theme runtime +
 * the generic descriptor factory (which exports the ergonomic, 1:1-with-web
 * Button / IconAvatar / Topbar). The hand-written migration mirrors are
 * retired — the factory is the single, real consumer of the frozen contract.
 * ────────────────────────────────────────────────────────────── */

export * from './contract';
export * from './theme';
export * from './factory';
