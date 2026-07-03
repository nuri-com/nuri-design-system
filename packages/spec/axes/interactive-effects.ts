/* ══════════════════════════════════════════════════════════════════
 * NURI · INTERACTIVE AXIS · SOURCE OF TRUTH (TS) · agnostic opt-ins · decision 70 / 73 / 74
 * ──────────────────────────────────────────────────────────────────
 * The `interactive` axis of the cascade (L3 · a BESPOKE axis ·
 * decision 67 / 73), authored ONCE in TS. interactive is the interaction funnel:
 * the structured per-part opt-in (decision 65.3 §6 / 65.4) that decomposes
 * interaction into INDEPENDENT effects — a node opts into exactly what it needs.
 *
 * ── ONE AGNOSTIC SoT, PROJECTION-OWNED REALIZATION (SEED-1a) ──
 * Before SEED-1a the opt-in mapping and the browser CSS realization lived together
 * here. That kept readers aligned, but violated the project rule: @nuri/spec is pure,
 * target-agnostic data; each projection owns its own realization. This file now carries
 * only the shared opt-in contract:
 *
 *   · `trigger` — the abstract interaction state that activates the opt.
 *   · `gate`    — the stable opt-in key a projection may expose (`auto` means no
 *                 author opt-in is required).
 *   · `rn`      — the RN realization vocabulary, still pure data interpreted by the
 *                 RN appliers.
 *
 * The prototype projection owns browser selectors, declarations, affordance chrome,
 * and source order in `packages/prototype/pipeline/parsers/interactive-css.js`. The
 * web factory still derives gated host attributes from `opts[key].gate`, and the RN
 * applier (packages/rn/runtime/resolve.ts · flattenInteractive · shared by the
 * flattenPart test oracle + the flattenBakedPart render path) walks `opts` in key
 * order → the same state patches.
 *
 * ── THE RN REALIZATION VOCABULARY (`opts[key].rn` · pure data) ──
 *   · { prop, from }            — the value is READ from the resolved node
 *                                 (pressColor → node.pressedBg · the per-variant swap).
 *   · { prop, token, shape? }   — the value is the theme constant at the dotted path
 *                                 (theme.interaction.* · decision 45); `shape:'scale'`
 *                                 wraps it as RN's `[{ scale: v }]` transform.
 * The appliers interpret this; the SoT carries NO functions and is consumed
 * through the shared TS data loader.
 *
 * Base: decision 2 (reversed for the namespace layer · 74) · 45 · 65.3 §6 · 65.4 ·
 * 67 · 70 · 73 · 74 · the one-SoT-two-projections invariant.
 * ══════════════════════════════════════════════════════════════════ */

// The runtime trigger an opt's effect fires on.
type Trigger = 'pressed' | 'disabled';
// The RN realization — pure data interpreted by the appliers (no closures · see header).
type RnRealize = { prop: string; from: string } | { prop: string; token: string; shape?: 'scale' };
// One agnostic opt-in: trigger · stable projection gate (`'auto'` ⇒ no author opt-in) · RN realization.
type Opt = { trigger: Trigger; gate: string; rn: RnRealize };
type OptTable = Record<string, Opt>;

// ── opts · the 3 AGNOSTIC opt-ins (key order = the RN applier's
// walk order · pressColor → pressScale → disabledOpacity) ──
export const opts = {
  // pressColor · the pressed background swap to the node's own variant pressedBg.
  // The RN value is node-derived (per palette-variant). Other projections interpret
  // the shared gate in their own boundary.
  pressColor: {
    trigger: 'pressed',
    gate: 'press-color',
    rn: { prop: 'backgroundColor', from: 'pressedBg' },
  },
  // pressScale · the tactile pressed-scale effect, gated so a static surface never reacts.
  pressScale: {
    trigger: 'pressed',
    gate: 'press-scale',
    rn: { prop: 'transform', token: 'interaction.pressScale', shape: 'scale' },
  },
  // disabledOpacity · the shared dim. AUTOMATIC (gate 'auto' · no author opt-in).
  disabledOpacity: {
    trigger: 'disabled',
    gate: 'auto',
    rn: { prop: 'opacity', token: 'interaction.disabledOpacity' },
  },
} as const satisfies OptTable;
