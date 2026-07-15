/* ══════════════════════════════════════════════════════════════════
 * NURI · PRIMITIVES · PRIMITIVE PARITY GATE (contract §3.3a · step ①)
 * ──────────────────────────────────────────────────────────────────
 * Assert, per hand-authorable primitive:
 *
 *     web element ATTRS  ≡  RN component props  ≡  schema namespace keys
 *
 * The SoT is the SCHEMA, sourced at runtime from the shared mapping tables
 * (STACK_FIELDS/BOX_FIELDS · total over keyof StackNS/BoxNS by construction) +
 * the interactive `opts` table, plus a `satisfies Record<keyof …NS, …>` pin for
 * the bespoke palette/typography namespaces (a new schema key is a COMPILE error
 * in BOTH this file and primitives/ → they cannot silently diverge). The web
 * `ATTRS` arrays become a CHECKED projection, not a trusted hand list — the
 * analogue of the descriptor anatomy-vs-addressed-parts agreement check.
 *
 * SCOPE NOTE (the web leg). The fully-current layout mirror is `<nuri-view>`
 * (box ∪ stack ∪ palette), checked BIDIRECTIONALLY below. `<nuri-view>`
 * became hand-authorable in ③ (view.js
 * gained a public attr surface that self-derives the merged box⊕stack⊕palette
 * classes + data-* via the factory's own mergeAttrs · the dual-mode mirror of
 * the RN View primitive), so View now has a real element-ATTRS oracle — closing
 * the #102-deferred leg (its parity was RN-props ≡ schema only). The view attrs
 * live in THREE namespace literals (BOX_ATTRS/STACK_ATTRS/PALETTE_ATTRS · the
 * buckets the reader needs); the gate unions them. typography.js / pressable.js
 * expose a PARTIAL namespace surface (typography adds palette's `muted`;
 * pressable realizes disabledOpacity via the native `disabled` attr, not a
 * `disabled-opacity` attr), so their web leg is asserted as a SUBSET-consistency
 * check (every namespace attr they DO expose is a real schema key), the
 * bidirectional half being RN-props ≡ schema.
 * ══════════════════════════════════════════════════════════════════ */

import * as fs from 'fs';
import * as path from 'path';
import { View, Text, Pressable, Screen, Header, Scroll, Footer, Dock, Separator, ListSeparator } from '../primitives';
import { STACK_FIELDS, BOX_FIELDS } from '@nuri/spec/resolve-map';
import { opts as INTERACTIVE_OPTS } from '@nuri/spec/interactive-effects';
import { PALETTE_KEYS, TYPOGRAPHY_KEYS, EFFECT_KEYS } from '@nuri/spec/descriptors/schema';

// ── schema namespace keys · ONE runtime SoT per namespace, read from @nuri/spec
// (independent of primitives/ · the gate must read the SCHEMA, not the wrapper
// it checks). box/stack/interactive from the shared Field/opts tables;
// palette/typography from the schema's totality-pinned runtime key lists. ──
const STACK_KEYS = Object.keys(STACK_FIELDS);
const BOX_KEYS = Object.keys(BOX_FIELDS);
const INTERACTIVE_KEYS = Object.keys(INTERACTIVE_OPTS);

const sorted = (a: readonly string[]): string[] => [...a].sort();
const union = (...lists: string[][]): string[] => sorted([...new Set(lists.flat())]);

// camelCase ↔ kebab-case (web ATTRS are kebab; schema keys are camel).
const kebab = (s: string): string => s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);

// Read a web primitive's hand-listed `ATTRS = [ … ]` array from its source (the
// CHECKED projection · the file stays the source, the test reads it · no import:
// the IIFE custom-element files reference `document`/`HTMLElement`, unloadable here).
function webAttrs(file: string): string[] {
  const src = fs.readFileSync(
    path.resolve(__dirname, '../../prototype/primitives', file),
    'utf8',
  );
  const m = src.match(/const ATTRS = \[([\s\S]*?)\]/);
  if (!m) throw new Error(`no ATTRS array in ${file}`);
  return m[1]
    .split(',')
    .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean);
}

// <nuri-view>'s public attrs live in THREE namespace literals (BOX_ATTRS /
// STACK_ATTRS / PALETTE_ATTRS · the buckets view.js's reader needs to construct
// the namespace map · view.js). Read + union them — the same checked-projection
// idea as webAttrs, one regex per bucket.
function viewAttrs(): string[] {
  const src = fs.readFileSync(
    path.resolve(__dirname, '../../prototype/primitives/view.js'),
    'utf8',
  );
  const grab = (name: string): string[] => {
    const m = src.match(new RegExp(`const ${name} = \\[([\\s\\S]*?)\\]`));
    if (!m) throw new Error(`no ${name} array in view.js`);
    return m[1]
      .split(',')
      .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
      .filter(Boolean);
  };
  return [...grab('BOX_ATTRS'), ...grab('STACK_ATTRS'), ...grab('PALETTE_ATTRS'), ...grab('EFFECT_ATTRS')];
}

describe('primitive parity gate — web ATTRS ≡ RN props ≡ schema NS keys', () => {
  // ── RN props ≡ schema NS keys (the drift guard · every primitive) ──
  test('View props ≡ box ∪ stack ∪ palette ∪ effect keys', () => {
    expect(sorted(View.propKeys)).toEqual(union(BOX_KEYS, STACK_KEYS, PALETTE_KEYS, EFFECT_KEYS));
  });

  test('Text props ≡ typography ∪ palette keys', () => {
    expect(sorted(Text.propKeys)).toEqual(union(TYPOGRAPHY_KEYS, PALETTE_KEYS));
  });

  test('Pressable props ≡ box ∪ stack-minus-distribute ∪ palette ∪ interactive keys', () => {
    // Deliberate exclusion: Pressable wraps no children on either engine. Wiring
    // distribute is a future both-engines change, not an RN-only surface claim.
    expect(sorted(Pressable.propKeys)).toEqual(
      union(BOX_KEYS, STACK_KEYS.filter((key) => key !== 'distribute'), PALETTE_KEYS, INTERACTIVE_KEYS),
    );
  });

  test('Screen exposes only its local safe-area contract; ListSeparator has no namespace props', () => {
    expect(Screen.propKeys).toEqual(['safeArea', 'safeAreaTop', 'safeAreaBottom']);
    expect(ListSeparator.propKeys).toEqual([]);
  });

  test('Scroll props are its local inset contract', () => {
    expect(Scroll.propKeys).toEqual(['safeAreaTop', 'safeAreaBottom', 'insetTop', 'insetBottom']);
  });

  test('Header and Footer expose their fixed-region visual contracts', () => {
    expect(Header.propKeys).toEqual([
      'safeAreaTop',
      'safeAreaChrome',
      'chrome',
      'direction',
      'align',
      'justify',
      'gap',
      'paddingX',
      'paddingY',
      'paddingTop',
      'paddingBottom',
    ]);
    expect(Footer.propKeys).toEqual([
      'safeAreaBottom',
      'chrome',
      'direction',
      'align',
      'justify',
      'gap',
      'paddingX',
      'paddingY',
      'paddingTop',
      'paddingBottom',
    ]);
  });

  test('Dock props are its local edge contract', () => {
    expect(Dock.propKeys).toEqual(['edge']);
  });

  test('Separator props are its local y-space contract', () => {
    expect(Separator.propKeys).toEqual(['ySpace']);
  });

  // ── web ATTRS leg ──
  test('web <nuri-view> ATTRS ≡ box ∪ stack ∪ palette ∪ effect keys (the #102-deferred leg, now bidirectional)', () => {
    expect(sorted(viewAttrs())).toEqual(sorted(union(BOX_KEYS, STACK_KEYS, PALETTE_KEYS, EFFECT_KEYS).map(kebab)));
  });

  test('web <nuri-screen> ATTRS expose the local device safe-area contract', () => {
    const attrs = webAttrs('screen.js').filter((a) => a !== 'as');
    expect(attrs).toEqual(['safe-area', 'safe-area-top', 'safe-area-bottom']);
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

  test('web <nuri-scroll> exposes its local inset attrs', () => {
    expect(webAttrs('scroll.js')).toEqual(['as', 'safe-area-top', 'safe-area-bottom', 'inset-top', 'inset-bottom']);
  });

  test('web <nuri-header> exposes the fixed-region visual contract', () => {
    expect(webAttrs('header.js')).toEqual([
      'as',
      'safe-area-top',
      'safe-area-chrome',
      'chrome',
      'direction',
      'align',
      'justify',
      'gap',
      'padding-x',
      'padding-y',
      'padding-top',
      'padding-bottom',
    ]);
  });

  test('web <nuri-footer> exposes the fixed-region visual contract', () => {
    expect(webAttrs('footer.js')).toEqual([
      'as',
      'safe-area-bottom',
      'chrome',
      'direction',
      'align',
      'justify',
      'gap',
      'padding-x',
      'padding-y',
      'padding-top',
      'padding-bottom',
    ]);
  });

  test('web <nuri-dock> exposes its local edge attr', () => {
    expect(webAttrs('dock.js')).toEqual(['edge']);
  });
});
