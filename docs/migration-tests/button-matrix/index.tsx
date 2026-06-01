/* ──────────────────────────────────────────────────────────────
 * BUTTON MATRIX · RN HAND-TRANSLATION · entry re-export
 *
 * The former 1961-line monolith was split one-file-per-component in
 * the N+12b session (see roadmap/N+12b.md). Shared scaffolding lives
 * in `_shared.tsx`; each mirror in its own `<component>.tsx`; the demo
 * composition in `app.tsx`. This entry preserves the old import path
 * (`./index`) as a thin re-export of the App so nothing downstream
 * needs to know the file moved.
 * ────────────────────────────────────────────────────────────── */

export { default } from './app';
