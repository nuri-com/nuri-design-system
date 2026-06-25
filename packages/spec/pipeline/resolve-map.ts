/* ══════════════════════════════════════════════════════════════════
 * NURI · THE AGNOSTIC NAMESPACE → STYLE MAPPING (DATA · the box/stack axis SoT)
 * ──────────────────────────────────────────────────────────────────
 * The shared mapping table for the two AGNOSTIC namespaces (decision 67 ·
 * roadmap/factory-rewrite.md §1). `box` + `stack` are walls of
 * `if (ns.x) s.y = scale[ns.x]` in the resolver — literally a mapping table
 * written as code; here that mapping is DATA, consumed by a generic per-target
 * applier. TWO platforms style from this ONE table — RN → ViewStyle (`applyFields`
 * in @nuri/rn's resolve.ts) and web → CSS (pipeline/parsers/namespace-css.js) —
 * the mapping written ONCE, only the emit differs ("do not hand-write the same
 * mapping twice" · drift).
 *
 * THE SEPARATION OF CONCERNS. A field carries `{ via, property-CONCEPT,
 * value-source }`: the VALUE-SOURCES are the shared contract (scales referenced
 * BY NAME · the flexbox KEYWORDS RN and CSS share verbatim · the flex `1/0`); the
 * property CONCEPT is a CANONICAL id (`prop: CanonicalId`), NOT a per-target name.
 * The per-target SPELLING (RN `paddingHorizontal` vs web `padding-inline`) is
 * single-sourced in the property-spelling registry (property-spelling.ts ·
 * decision 73 clause 2) — the RN applier reads `PROPERTY_SPELLING[prop].rn`, the
 * web emit reads `.css`. This is the S1 "canonical identities" plan (parked for
 * P11 — "no second consumer, no oracle yet"), realized now that BOTH emits exist
 * and the generated CSS + the RN snapshots are the dual oracle.
 *
 * The mechanism-divergent `expand` arm (fill) is NOT a registry entry — its RN
 * cases are a multi-prop ViewStyle fragment and its web spelling is the `flex`
 * shorthand (namespace-css.js's EXPAND_WEB), a difference of MECHANISM not name
 * (decision 73 cl.2). So `expand` keeps its own multi-prop shape here.
 *
 * HOME (transitional · convergence `final`): this axis SoT lives in @nuri/spec's
 * pipeline/ (the decision-68 rn→spec DAG · was mis-homed in @nuri/rn through the
 * shadow phase). @nuri/rn imports it via the exports map (`@nuri/spec/resolve-map`);
 * the web build reads it in place (type-strip + data:-URL · node 20 cannot import
 * a .ts). The codegen-vs-data home re-org is convergence phase 4.
 * ══════════════════════════════════════════════════════════════════ */

import type { StackNS, BoxNS } from './descriptors/schema';
import type { CanonicalId } from './property-spelling';

// The token scales the agnostic mappings draw values from, named (neutral):
// the per-target applier binds the tag to its scale repr (RN → the numeric
// scale objects · web → the CSS-var scale). NOT the resolved value (that is
// the emit's, and differs per target).
export type ScaleName = 'space' | 'size' | 'radius';

// One field = one namespace input key → one style property (or, for `expand`,
// a small multi-prop set) + HOW its value derives. The arms are tagged so the
// applier dispatches exhaustively (a new arm without a case is a compile error
// at `applyFields` · the assertNever backstop). `prop` is a CANONICAL id (the
// per-target name comes from property-spelling.ts); `scale`/`map`/`on`/`off` are
// neutral. The `expand` cases are an RN-spelled multi-prop fragment — the
// mechanism-divergent arm that stays OUT of the registry (decision 73 cl.2); it
// is RN-free here only by typing (Record<string, string | number>, no ViewStyle).
export type Field =
  | { via: 'scale'; prop: CanonicalId; scale: ScaleName } //       value = scale[input]
  | { via: 'keyword'; prop: CanonicalId; map: Record<string, string> } // value = map[input]
  | { via: 'literal'; prop: CanonicalId } //                       value = input (passthrough)
  | { via: 'flag'; prop: CanonicalId; on: string; off: string } // value = input ? on : off
  | { via: 'expand'; cases: Record<string, Record<string, string | number>> }; // multi-prop set

// ── flexbox keyword maps · NEUTRAL (CSS align-items/justify-content take the
// SAME flex-* keywords) · were the ALIGN/JUSTIFY consts in resolve.ts ──
const ALIGN: Record<NonNullable<StackNS['align']>, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
  baseline: 'baseline',
};
const JUSTIFY: Record<NonNullable<StackNS['justify']>, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
};
// fill → the flex tri-state · `grow` = grow to fill, do NOT shrink below content
// (web flex:1 0 auto · the hand Stack's boolean `fill`) · `grow-shrink` = the
// Topbar content-pivot (web flex:1 1 auto + min-inline-size:0 · schema §6 / B1.5
// §3) — grow AND shrink past content. The RN cases are RN-SPELLED multi-prop
// (flexGrow/flexShrink/minWidth); the web spelling (the `flex` shorthand + the
// logical min-size) is namespace-css.js's EXPAND_WEB. A mechanism difference, not
// a name → NOT a registry entry (decision 73 cl.2). Was resolveFill's switch.
const FILL: Record<NonNullable<StackNS['fill']>, Record<string, string | number>> = {
  grow: { flexGrow: 1, flexShrink: 0 },
  'grow-shrink': { flexGrow: 1, flexShrink: 1, minWidth: 0 },
};

// ── stack → flex · the mapping as DATA (was resolveStack's if-wall · mirrors
// the hand Stack primitive) ──
// ⚠ ORDER IS LOAD-BEARING: the applier emits in this declaration order, which
// must match the old if-sequence — pretty-format keeps object key order, so a
// reorder diffs the snapshots even with equal values. Order: direction · align ·
// justify · gap · wrap · fill. The `Record<keyof StackNS, …>` type makes the
// table TOTAL over the namespace — a new stack field is a compile error here.
export const STACK_FIELDS: Record<keyof StackNS, Field> = {
  direction: { via: 'literal', prop: 'flexDirection' },
  align: { via: 'keyword', prop: 'alignItems', map: ALIGN },
  justify: { via: 'keyword', prop: 'justifyContent', map: JUSTIFY },
  gap: { via: 'scale', prop: 'gap', scale: 'space' },
  wrap: { via: 'flag', prop: 'flexWrap', on: 'wrap', off: 'nowrap' },
  fill: { via: 'expand', cases: FILL },
};

// ── box → sizing · padding · radii (geometry only · 65.3 §6 · no colour) · the
// mapping as DATA (was resolveBox's if-wall) ──
// ⚠ ORDER IS LOAD-BEARING (see above). Order: width · height · minHeight ·
// padding · paddingX · paddingY · paddingStart · paddingEnd · paddingTop ·
// paddingBottom · radius. The `prop` is a CANONICAL id (the CSS-logical concept ·
// property-spelling.ts), so the box INPUT keys (width/paddingX/radius) and the
// canonical ids (inlineSize/paddingInline/borderRadius) differ — the registry's
// `rn` column maps each back to RN's physical prop (width/paddingHorizontal/…).
export const BOX_FIELDS: Record<keyof BoxNS, Field> = {
  width: { via: 'scale', prop: 'inlineSize', scale: 'size' },
  height: { via: 'scale', prop: 'blockSize', scale: 'size' },
  minHeight: { via: 'scale', prop: 'minBlockSize', scale: 'size' },
  padding: { via: 'scale', prop: 'padding', scale: 'space' },
  paddingX: { via: 'scale', prop: 'paddingInline', scale: 'space' },
  paddingY: { via: 'scale', prop: 'paddingBlock', scale: 'space' },
  paddingStart: { via: 'scale', prop: 'paddingInlineStart', scale: 'space' },
  paddingEnd: { via: 'scale', prop: 'paddingInlineEnd', scale: 'space' },
  paddingTop: { via: 'scale', prop: 'paddingBlockStart', scale: 'space' },
  paddingBottom: { via: 'scale', prop: 'paddingBlockEnd', scale: 'space' },
  radius: { via: 'scale', prop: 'borderRadius', scale: 'radius' },
};
