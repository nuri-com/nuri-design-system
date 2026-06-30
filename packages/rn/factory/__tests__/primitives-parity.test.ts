/* ══════════════════════════════════════════════════════════════════
 * NURI · FACTORY · PRIMITIVE PARITY GATE (contract §3.3a · step ①)
 * ──────────────────────────────────────────────────────────────────
 * Assert, per hand-authorable primitive:
 *
 *     web element ATTRS  ≡  RN component props  ≡  schema namespace keys
 *
 * The SoT is the SCHEMA, sourced at runtime from the shared mapping tables
 * (STACK_FIELDS/BOX_FIELDS · total over keyof StackNS/BoxNS by construction) +
 * the interactive `opts` table, plus a `satisfies Record<keyof …NS, …>` pin for
 * the bespoke palette/typography namespaces (a new schema key is a COMPILE error
 * in BOTH this file and primitives.tsx → they cannot silently diverge). The web
 * `ATTRS` arrays become a CHECKED projection, not a trusted hand list — the
 * analogue of the descriptor anatomy-vs-addressed-parts agreement check.
 *
 * SCOPE NOTE (the web leg). The fully-current, single-namespace web mirror is
 * `<nuri-stack>` — checked bidirectionally below. `<nuri-view>` carries NO
 * element ATTRS (the web factory applies the merged box⊕stack⊕palette classes
 * directly · view.js), and `<nuri-box>` is mid-retirement (the §1.B fold · stale
 * vs BoxNS), so View's web surface has no element-ATTRS oracle — its parity is
 * RN-props ≡ schema-keys. typography.js / pressable.js expose a PARTIAL namespace
 * surface (typography adds palette's `muted`; pressable realizes disabledOpacity
 * via the native `disabled` attr, not a `disabled-opacity` attr), so their web
 * leg is asserted as a SUBSET-consistency check (every namespace attr they DO
 * expose is a real schema key), the bidirectional half being RN-props ≡ schema.
 * "No web refactor" is an anti-goal this session — the gate reads web, never
 * edits it.
 * ══════════════════════════════════════════════════════════════════ */

import * as fs from 'fs';
import * as path from 'path';
import { View, Stack, Text, Pressable, Screen, Scroll } from '../primitives';
import { STACK_FIELDS, BOX_FIELDS } from '@nuri/spec/resolve-map';
import { opts as INTERACTIVE_OPTS } from '@nuri/spec/interactive-effects';
import type { PaletteNS, TypographyNS } from '../../contract';

// ── schema namespace keys · the runtime SoT (independent of primitives.tsx) ──
const STACK_KEYS = Object.keys(STACK_FIELDS);
const BOX_KEYS = Object.keys(BOX_FIELDS);
const INTERACTIVE_KEYS = Object.keys(INTERACTIVE_OPTS);
// palette/typography have no Field table — pin them with a totality `satisfies`
// (a schema add/remove/rename breaks this line, the Guard-F mechanism one level out).
const PALETTE_KEYS = Object.keys(
  { variant: 0, accent: 0, muted: 0, chrome: 0 } satisfies Record<keyof PaletteNS, 0>,
);
const TYPOGRAPHY_KEYS = Object.keys(
  { size: 0, emphasis: 0 } satisfies Record<keyof TypographyNS, 0>,
);

const sorted = (a: readonly string[]): string[] => [...a].sort();
const union = (...lists: string[][]): string[] => sorted([...new Set(lists.flat())]);

// camelCase ↔ kebab-case (web ATTRS are kebab; schema keys are camel).
const kebab = (s: string): string => s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);

// Read a web primitive's hand-listed `ATTRS = [ … ]` array from its source (the
// CHECKED projection · the file stays the source, the test reads it · no import:
// the IIFE custom-element files reference `document`/`HTMLElement`, unloadable here).
function webAttrs(file: string): string[] {
  const src = fs.readFileSync(
    path.resolve(__dirname, '../../../prototype/primitives', file),
    'utf8',
  );
  const m = src.match(/const ATTRS = \[([\s\S]*?)\]/);
  if (!m) throw new Error(`no ATTRS array in ${file}`);
  return m[1]
    .split(',')
    .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean);
}

describe('primitive parity gate — web ATTRS ≡ RN props ≡ schema NS keys', () => {
  // ── RN props ≡ schema NS keys (the drift guard · every primitive) ──
  test('Stack props ≡ StackNS keys', () => {
    expect(sorted(Stack.propKeys)).toEqual(sorted(STACK_KEYS));
  });

  test('View props ≡ box ∪ stack ∪ palette keys', () => {
    expect(sorted(View.propKeys)).toEqual(union(BOX_KEYS, STACK_KEYS, PALETTE_KEYS));
  });

  test('Text props ≡ typography ∪ palette keys', () => {
    expect(sorted(Text.propKeys)).toEqual(union(TYPOGRAPHY_KEYS, PALETTE_KEYS));
  });

  test('Pressable props ≡ box ∪ stack ∪ palette ∪ interactive keys', () => {
    expect(sorted(Pressable.propKeys)).toEqual(
      union(BOX_KEYS, STACK_KEYS, PALETTE_KEYS, INTERACTIVE_KEYS),
    );
  });

  test('Screen / Scroll are structural (no namespace props)', () => {
    expect(Screen.propKeys).toEqual([]);
    expect(Scroll.propKeys).toEqual([]);
  });

  // ── web ATTRS leg ──
  test('web <nuri-stack> ATTRS (minus the web-only `as` host hatch) ≡ StackNS keys', () => {
    const attrs = webAttrs('stack.js').filter((a) => a !== 'as');
    expect(sorted(attrs)).toEqual(sorted(STACK_KEYS.map(kebab)));
  });

  test('web <nuri-typography> namespace ATTRS are real schema keys (typography ∪ palette)', () => {
    // size/emphasis ∈ typography; muted ∈ palette. Every typography ATTRS entry
    // must be a real key of one of Text's namespaces (subset-consistency).
    const valid = new Set([...TYPOGRAPHY_KEYS, ...PALETTE_KEYS].map(kebab));
    for (const a of webAttrs('typography.js')) expect(valid.has(a)).toBe(true);
    // and the typography namespace itself is fully present on the web element.
    const attrs = new Set(webAttrs('typography.js'));
    for (const k of TYPOGRAPHY_KEYS) expect(attrs.has(kebab(k))).toBe(true);
  });

  test('web <nuri-pressable> press-* ATTRS map to real InteractiveNS keys', () => {
    // press-scale/press-color ∈ interactive; disabled/accent/accessibility-label
    // are behaviour, not namespace. Assert the interactive ones are real keys.
    const interactiveKebab = new Set(INTERACTIVE_KEYS.map(kebab));
    const pressAttrs = webAttrs('pressable.js').filter((a) => a.startsWith('press-'));
    for (const a of pressAttrs) expect(interactiveKebab.has(a)).toBe(true);
  });
});
