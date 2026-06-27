/* ══════════════════════════════════════════════════════════════════
 * NURI · INTERACTIVE AXIS · SOURCE OF TRUTH (TS) · N+44 · single-source · decision 70 / 73 / 74
 * ──────────────────────────────────────────────────────────────────
 * The `interactive` axis of the cascade (docs/cascade.md · L3 · a BESPOKE axis ·
 * decision 67 / 73), authored ONCE in TS. interactive is the interaction funnel:
 * the structured per-part opt-in (decision 65.3 §6 / 65.4) that decomposes
 * interaction into INDEPENDENT effects — a node opts into exactly what it needs.
 *
 * ── ONE SoT, TWO+ PROJECTIONS (the N+44 reshape · the one-SoT invariant · dec 70) ──
 * Before N+44 the opt-in → (gate · property · trigger · realization) mapping was
 * hand-written in THREE readers — the web CSS (this axis' emitter), the web factory's
 * gate attrs, and the RN factory's state patches — three sources that could DRIFT.
 * This file is now the single source all readers project from:
 *
 *   · `opts`     — the 3 AGNOSTIC opt-ins (pressColor · pressScale · disabledOpacity).
 *                  Each carries the runtime TRIGGER, the web GATE attr, the RN
 *                  realization (pure data · interpreted by the appliers · no closures),
 *                  and its web CSS rule (`null` where the rule lives elsewhere —
 *                  pressColor's :active bg-swap is PALETTE's, not interactive's).
 *   · webChrome  — the WEB-ONLY realization (no agnostic input · no RN analog): the
 *                  cursor/transition affordance, the focus ring, the disabled
 *                  cascade-order guard. Realization SUPPORT for the opt-ins, not
 *                  agnostic inputs (so deliberately NOT in `opts`).
 *   · webOrder   — the interleaved web emit order. LOAD-BEARING (see below).
 *
 * The web emitter (prototype/pipeline/parsers/interactive-css.js) walks `webOrder`,
 * pulling each rule from `webChrome` (literal) or `opts[name].web` (built) → the
 * `@layer rules` block. The web factory derives a gated opt's host attr from
 * `opts[key].gate`. The RN applier (packages/rn/factory/resolve.ts · flattenPart +
 * buildPartRecipe) walks `opts` in key order → the same state patches. The mapping
 * lives in ONE place; the realizations are projections.
 *
 * ── THE RN REALIZATION VOCABULARY (`opts[key].rn` · pure data) ──
 *   · { prop, from }            — the value is READ from the resolved node
 *                                 (pressColor → node.pressedBg · the per-variant swap).
 *   · { prop, token, shape? }   — the value is the theme constant at the dotted path
 *                                 (theme.interaction.* · decision 45); `shape:'scale'`
 *                                 wraps it as RN's `[{ scale: v }]` transform.
 * The appliers interpret this; the SoT carries NO functions (strip.js-loadable).
 *
 * ── THE LOAD-BEARING ORDER (the centerpiece · interactive.css `@layer rules`) ──
 * pressScale (`[data-press-scale]:active`) and disabledGuard
 * (`[aria-disabled="true"]:active`) BOTH set `transform` at EQUAL specificity (0,3,0)
 * — a `[data-press-scale][aria-disabled="true"]:active` node matches BOTH, so the
 * cascade resolves `transform` by SOURCE ORDER. pressScale MUST emit BEFORE
 * disabledGuard so `transform: none` wins → a disabled control never scales.
 * `webOrder` IS that order (preserved by the emitter); the harness proves it
 * (prototype/pipeline/interactive-css.test.js · the order guard + the browser cell).
 *
 * ── THE DERIVED `effects` BRIDGE (transient · @nuri/doc ONLY · delete on doc redesign) ──
 * `effects` is the legacy CSS-rules-as-data array (`{ name, on, decls }`) the N+43
 * axis-doc emitter reads (packages/doc/pipeline/axis-ir.js#interactiveAxisIr). It is
 * now a DERIVED PROJECTION of `webOrder` + `webChrome` + `opts[].web` — NOT a second
 * source. `opts` is THE source; `effects` is its web projection in the legacy shape,
 * kept so @nuri/doc re-emits BYTE-IDENTICAL (the doc CI gate) with NO doc-gen change.
 * The web rules keep the STRUCTURED `on: [{ attr?, state? }]` parts (not flat selector
 * strings) precisely so this projection is faithful — the doc's gateOf reads `p.attr`.
 * When the doc redesign re-sources its interactive page onto `opts` (the next arc),
 * this export is DELETED.
 *
 * ── STRIP CONSTRAINTS (read before editing — two strippers load this file) ──
 * Consumed via type-strip + data:-URL import by BOTH @nuri/prototype's line-oriented
 * `stripTypes` (interactive-css.js / strip.js) AND @nuri/doc's brace-aware
 * `stripTsData` (decision 48 · 69 · node 20 cannot import a .ts). To strip cleanly
 * under both: every `type` alias is SINGLE-LINE; NO `const NAME: T =` annotations
 * (use `as const satisfies <NamedType>`); the `satisfies` target is COMMA-FREE (the
 * doc strip's regex stops at a comma — so `satisfies OptTable`, NOT `Record<…,…>`).
 *
 * Base: decision 2 (reversed for the namespace layer · 74) · 45 · 65.3 §6 · 65.4 ·
 * 67 · 70 · 73 · 74 · the one-SoT-two-projections invariant.
 * ══════════════════════════════════════════════════════════════════ */

// A declaration — a literal `[property, value]` pair (the value verbatim, incl. any
// `var(--nuri-…)` constant inline · no value transform · the THINNEST axis).
type Decl = readonly [string, string];
// A selector PART appended to `.nuri-interactive`: an optional attribute gate
// (`[data-press-scale]` presence · `[aria-disabled="true"]` equality) + an optional
// pseudo-state (`:active` · `:focus-visible` · `:disabled`). Both absent ⇒ the bare class.
type SelectorPart = { attr?: string; state?: string };
// A web CSS rule = the selector PARTS it applies to (the comma list · usually one) +
// its declarations. The structured `on` (not a flat selector string) keeps the derived
// `effects` projection + the doc's gate read faithful.
type WebRule = { on: readonly SelectorPart[]; decls: readonly Decl[] };
// The runtime trigger an opt's effect fires on (the RN State key · the web pseudo-state).
type Trigger = 'pressed' | 'disabled';
// The RN realization — pure data interpreted by the appliers (no closures · see header).
type RnRealize = { prop: string; from: string } | { prop: string; token: string; shape?: 'scale' };
// One agnostic opt-in: trigger · the web gate attr (`'auto'` ⇒ no gate · automatic) ·
// the RN realization · the web CSS rule (`null` ⇒ the rule lives in another axis).
type Opt = { trigger: Trigger; gate: string; rn: RnRealize; web: WebRule | null };
// The named satisfies targets (COMMA-FREE · the doc strip constraint).
type OptTable = Record<string, Opt>;
type ChromeTable = Record<string, WebRule>;

// ── opts · the 3 AGNOSTIC opt-ins (THE single source · key order = the RN applier's
// walk order · pressColor → pressScale → disabledOpacity) ──
export const opts = {
  // pressColor · the :active background swap to the node's own variant pressedBg.
  // The RN value is node-derived (per palette-variant); the WEB rule lives in
  // PALETTE (palette.css's `[data-press-color]:active` bg swap), so `web` is null —
  // pressColor sets NO interactive.css rule. The factory still gates it (press-color).
  pressColor: {
    trigger: 'pressed',
    gate: 'press-color',
    rn: { prop: 'backgroundColor', from: 'pressedBg' },
    web: null,
  },
  // pressScale · the tactile :active scale, gated so a static surface never reacts.
  // MUST precede disabledGuard in webOrder (the equal-specificity transform pair).
  pressScale: {
    trigger: 'pressed',
    gate: 'press-scale',
    rn: { prop: 'transform', token: 'interaction.pressScale', shape: 'scale' },
    web: {
      on: [{ attr: '[data-press-scale]', state: ':active' }],
      decls: [['transform', 'scale(var(--nuri-interaction-press-scale))']],
    },
  },
  // disabledOpacity · the shared dim. AUTOMATIC (gate 'auto' · no opt-in attr): both
  // the native :disabled (form controls) and [aria-disabled] (a non-form painting
  // node) dim to the shared opacity (a multi-selector / comma rule).
  disabledOpacity: {
    trigger: 'disabled',
    gate: 'auto',
    rn: { prop: 'opacity', token: 'interaction.disabledOpacity' },
    web: {
      on: [{ state: ':disabled' }, { attr: '[aria-disabled="true"]' }],
      decls: [['opacity', 'var(--nuri-interaction-disabled-opacity)']],
    },
  },
} as const satisfies OptTable;

// ── webChrome · the WEB-ONLY realization (no agnostic input · no RN analog) ──
export const webChrome = {
  // Affordance · automatic. cursor + the press transition fire on every interactive
  // node; the transition carries the pressColor swap (palette's · background-color)
  // and the pressScale (transform).
  affordance: {
    on: [{}],
    decls: [
      ['cursor', 'pointer'],
      ['transition', 'background-color var(--nuri-duration-fast) ease, transform var(--nuri-duration-fast) ease'],
    ],
  },
  // Focus · automatic. The brand-coloured ring, never accent-derived.
  focus: {
    on: [{ state: ':focus-visible' }],
    decls: [
      ['outline', '2px solid var(--nuri-focus-ring)'],
      ['outline-offset', '2px'],
    ],
  },
  // disabledGuard · automatic. Reverts the press SCALE when disabled (a non-form
  // [aria-disabled] node still fires :active). EQUAL specificity to pressScale → wins
  // ONLY because it is emitted LATER (the load-bearing order · webOrder).
  disabledGuard: {
    on: [{ attr: '[aria-disabled="true"]', state: ':active' }],
    decls: [['transform', 'none']],
  },
} as const satisfies ChromeTable;

// ── webOrder · the interleaved web emit order (LOAD-BEARING: pressScale strictly
// before disabledGuard · see header). Each entry resolves to a rule in webChrome
// (affordance · focus · disabledGuard) or opts[name].web (pressScale · disabledOpacity).
// pressColor is absent — its web rule is palette's (opts.pressColor.web === null). ──
export const webOrder = ['affordance', 'focus', 'pressScale', 'disabledGuard', 'disabledOpacity'] as const satisfies readonly string[];

// ── effects · the DERIVED legacy projection (transient bridge · @nuri/doc ONLY) ──
// `webOrder` in order, each as the legacy `{ name, on, decls }` effect. A faithful
// projection of opts/webChrome (NOT a second source · see header). `webRules` lifts
// the two opt web rules alongside webChrome so every webOrder name resolves (and the
// derivation type-checks + strips to valid JS without a cast). DELETE on doc redesign.
const webRules = { ...webChrome, pressScale: opts.pressScale.web, disabledOpacity: opts.disabledOpacity.web };
export const effects = webOrder.map((name) => ({ name, ...webRules[name] }));
