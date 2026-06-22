/* ══════════════════════════════════════════════════════════════════
 * NURI · FACTORY · THE AGNOSTIC NAMESPACE → STYLE MAPPING (DATA · S1)
 * ──────────────────────────────────────────────────────────────────
 * The shared mapping table for the THREE agnostic namespaces (target §4 ·
 * decision 67 · roadmap/factory-rewrite.md §1). `box` + `stack` are walls of
 * `if (ns.x) s.y = scale[ns.x]` in the resolver — literally a mapping table
 * written as code; here that mapping is DATA, consumed by a generic per-target
 * applier (RN: `applyFields` in resolve.ts). Three platforms will style from
 * this ONE table (RN → ViewStyle · web → CSS · CSS → a rule · §9) — the mapping
 * is written ONCE, only the emit differs ("do not hand-write the same mapping
 * three times" · drift).
 *
 * THE NEUTRALITY CHOICE (the S1 design judgment · operator-confirmed at checkpoint).
 * The VALUE-SOURCES are the shared contract: scales referenced BY NAME (the
 * applier binds the tag to its own scale repr), the flexbox KEYWORDS RN and CSS
 * share verbatim (`flex-start`, `space-between`, `row`), the `1/0` flex values.
 * The property SPELLING (`flexDirection`, `paddingHorizontal`, `borderRadius`) is
 * the per-target EMIT's business — RN-spelled here. So S3 ADDS a web emit that
 * consumes THIS table (key → property-concept → value-source) + supplies its own
 * spelling (camelCase→kebab + the logical-pad remap `paddingHorizontal`→
 * `padding-inline`); it does NOT fork the table. The alternative — canonical
 * identities now, the RN applier translating back — front-loads that rename map
 * with zero S1 benefit and no oracle to validate it (the snapshots exercise only
 * the RN emit), so it is deferred to S3 as not-yet-consumed (P11).
 * ══════════════════════════════════════════════════════════════════ */

import type { ViewStyle } from 'react-native';
import type { StackNS, BoxNS } from '../contract';

// The token scales the agnostic mappings draw values from, named (neutral):
// the per-target applier binds the tag to its scale repr (RN → the numeric
// scale objects · web → the CSS-var scale). NOT the resolved value (that is
// the emit's, and differs per target).
export type ScaleName = 'space' | 'size' | 'radius';

// One field = one namespace input key → one style property (or, for `expand`,
// a small multi-prop set) + HOW its value derives. The arms are tagged so the
// applier dispatches exhaustively (a new arm without a case is a compile error
// at `applyFields` · the assertNever backstop). `prop`/`cases` carry RN-spelled
// identities (the neutrality choice above); `scale`/`map`/`on`/`off` are neutral.
export type Field =
  | { via: 'scale'; prop: keyof ViewStyle; scale: ScaleName } //   value = scale[input]
  | { via: 'keyword'; prop: keyof ViewStyle; map: Record<string, string> } // value = map[input]
  | { via: 'literal'; prop: keyof ViewStyle } //                   value = input (passthrough)
  | { via: 'flag'; prop: keyof ViewStyle; on: string; off: string } // value = input ? on : off
  | { via: 'expand'; cases: Record<string, ViewStyle> }; //        input selects a multi-prop set

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
// §3) — grow AND shrink past content. The `1/0` + minWidth:0 are neutral; the
// prop spellings are RN. Was resolveFill's switch.
const FILL: Record<NonNullable<StackNS['fill']>, ViewStyle> = {
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
// paddingBottom · radius. `paddingX`/`paddingY`/`radius` are the input-key ≠
// output-prop cases (→ paddingHorizontal/paddingVertical/borderRadius).
export const BOX_FIELDS: Record<keyof BoxNS, Field> = {
  width: { via: 'scale', prop: 'width', scale: 'size' },
  height: { via: 'scale', prop: 'height', scale: 'size' },
  minHeight: { via: 'scale', prop: 'minHeight', scale: 'size' },
  padding: { via: 'scale', prop: 'padding', scale: 'space' },
  paddingX: { via: 'scale', prop: 'paddingHorizontal', scale: 'space' },
  paddingY: { via: 'scale', prop: 'paddingVertical', scale: 'space' },
  paddingStart: { via: 'scale', prop: 'paddingStart', scale: 'space' },
  paddingEnd: { via: 'scale', prop: 'paddingEnd', scale: 'space' },
  paddingTop: { via: 'scale', prop: 'paddingTop', scale: 'space' },
  paddingBottom: { via: 'scale', prop: 'paddingBottom', scale: 'space' },
  radius: { via: 'scale', prop: 'borderRadius', scale: 'radius' },
};
