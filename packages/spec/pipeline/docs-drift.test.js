/* ──────────────────────────────────────────────────────────────
 * NURI · DOCS-DRIFT GUARDS · CI-ENFORCED FRESHNESS
 *
 * Agent-facing entry-point docs (llms.txt · README.md ·
 * implementation-guide.html) are derived, hand-maintained mirrors
 * of two live truths: the page tree under pages/components/ and the
 * emitted artefacts under build/. They rot silently — a new page or
 * a re-emitted count lands, the prose doesn't, and the next agent
 * trusts a stale map. These guards fail the build the moment a doc
 * falls behind the live tree, so the drift is caught at PR time, not
 * by a confused reader three sessions later.
 *
 * Sibling to tokens-parser.test.js (kept separate so its assertion
 * count stays stable · N+12a). Run with:
 *   node --test pipeline/docs-drift.test.js
 * or via the glob in `npm test`.
 *
 * Five guards (A · C · N+12a · D · N+19 · the composition model 65.3 ·
 * E · N+19 B2b · decision 65.3 §6 · F · N+19 B3 · decision 65 step 5).
 * (Guard B — every build/components/*.ts named in README + impl-guide —
 * was RETIRED at Smell-1 · decision 66 arc #0 when build/components/ was
 * deleted and the interaction baseline relocated to build/interaction.ts.)
 *   A · every pages/components/*.html is listed in llms.txt
 *   C · doc-stated emitted counts match the live build artefacts
 *   D · each build/descriptors/*.ts re-emits identically — in the
 *       COMPOSITION form (65.3 §7 · structure { anatomy, base } +
 *       variants · the five primitive namespaces) — from its live sources
 *       (the @layer CSS mapping + the page data-part structure), and the
 *       validated shapes are pinned: a renamed/removed part, variant, or
 *       namespace value (incl. the collapsed `interactive` opt-in) breaks
 *       the test (the TokenPath discipline applied to the descriptor).
 *   E · build/palette.ts re-emits identically from the palette CSS SoT
 *       (palette.css + the recipe CSS the cells are asserted against),
 *       and the operator-settled contract table is pinned — a cell that
 *       contradicts the CSS fails here (and the build · decision 48).
 *   F · the FROZEN schema SHAPE — the cross-repo contract TYPE is locked
 *       (decision 65 step 5 · "an enforced freeze, not honorary"). The
 *       five namespace field vocabularies, the leaf/structural unions, and
 *       the Descriptor/PartAnatomy/PartMap envelope are pinned EXACTLY as
 *       pipeline/descriptors/schema.ts declares them; a field added /
 *       removed / renamed / retyped, or a union member moved, breaks here.
 *       Distinct from D: D keeps the INSTANCES faithful to live CSS (the
 *       per-component axes/values stay free); F freezes the schema shape.
 * ────────────────────────────────────────────────────────────── */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  DESCRIPTOR_COMPONENTS,
  deriveDescriptor,
  emitDescriptorTs,
  emitSchemaTs,
  pageParts,
} from './parsers/descriptors.js';
import { derivePalette, emitPaletteTs } from './parsers/palette.js';
import { readSemanticRules, classifyAll } from './parsers/semantic.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
// The pipeline lives in the @nuri/spec workspace (decision 65.7), so REPO_ROOT
// roots the spec package — `pages/`, `build/`, `lib/`, `styles/` all moved with
// it and resolve unchanged. The agent-facing entry-point docs (llms.txt ·
// README.md) are repo-level and stay at the monorepo root, two levels up.
const REPO_ROOT = resolve(__dirname, '..');
const MONOREPO_ROOT = resolve(REPO_ROOT, '..', '..');

const read = (rel) => readFileSync(resolve(REPO_ROOT, rel), 'utf8');
const readRoot = (rel) => readFileSync(resolve(MONOREPO_ROOT, rel), 'utf8');
const listFiles = (relDir, ext) =>
  readdirSync(resolve(REPO_ROOT, relDir)).filter((f) => f.endsWith(ext));

// Pull the first capture group of `re` out of `text`, or fail with
// `label` so a removed/renamed canonical phrase reads as drift, not
// as a silently-passing test.
const extractCount = (text, re, label) => {
  const m = text.match(re);
  assert.ok(
    m,
    `[docs-drift] canonical count phrase missing — expected to match ${re} (${label}). ` +
      `The phrasing changed or was deleted; update the doc or this guard.`,
  );
  return Number(m[1]);
};

// ── Guard A · page-tree ⊂ llms.txt ───────────────────────────────
test('A · every pages/components/*.html appears in llms.txt', () => {
  const llms = readRoot('llms.txt');
  const pages = listFiles('pages/components', '.html');
  assert.ok(pages.length > 0, 'expected at least one component page');

  const missing = pages.filter((p) => !llms.includes(`components/${p}`));
  assert.deepEqual(
    missing,
    [],
    `llms.txt is missing component page(s): ${missing.join(', ')}. ` +
      `Add each under its NAV section in llms.txt.`,
  );
});

// ── Guard C · doc-stated counts == live build ────────────────────
test('C · doc-stated emitted counts match the live build', () => {
  // Live truths derived from the emitted artefacts.
  const tokenPathMembers = (read('build/token-paths.ts').match(/^\s+\| '/gm) || []).length;
  const iconCount = (read('build/icons.ts').match(/^\s+\| '/gm) || []).length;

  const llms = readRoot('llms.txt');
  const readme = readRoot('README.md');
  const guide = read('pages/implementation-guide.html');

  // runtime-set leaf count (== TokenPath members).
  assert.equal(
    extractCount(llms, /every runtime-set leaf \((\d+) members\)/, 'llms.txt token-paths members'),
    tokenPathMembers,
    'llms.txt token-paths member count drifted from build/token-paths.ts',
  );
  assert.equal(
    extractCount(llms, /\+ radius \((\d+) leaves\)/, 'llms.txt tokens.ts runtime-set leaves'),
    tokenPathMembers,
    'llms.txt tokens.ts leaf count drifted from build/token-paths.ts',
  );
  assert.equal(
    extractCount(readme, /runtime-set leaf · (\d+) members/, 'README token-paths members'),
    tokenPathMembers,
    'README member count drifted from build/token-paths.ts',
  );

  // glyph registry count.
  assert.equal(
    extractCount(llms, /\((\d+) glyphs × 3 weights\)/, 'llms.txt glyph count'),
    iconCount,
    'llms.txt glyph count drifted from build/icons.ts',
  );
  assert.equal(
    extractCount(guide, /(\d+) glyphs/, 'impl-guide glyph count'),
    iconCount,
    'implementation-guide.html glyph count drifted from build/icons.ts',
  );
});

// ── Guard D · descriptors ⊂ their live sources (the composition model 65.3 · R-EXPO-6) ──
// The TokenPath discipline (decision 34) applied to the per-component
// descriptor: the emitted contract must always re-derive — in the
// COMPOSITION form (65.3 §7 · structure { anatomy, base } + variants ·
// the five primitive namespaces) — from its two sources: the @layer CSS
// (mapping · the 65.1 bootstrap) and the page data-part anatomy (structure
// · decision 24.1). A renamed/removed part, variant, or namespace value
// breaks the build (deriveDescriptor throws — the surface funnel,
// scale-leaf, interaction-baseline, and page-part assertions) AND this
// test; the pinned shapes catch a dropped axis value, a moved part, or a
// changed `interactive` opt-in even if the build was re-emitted. The
// validated shapes (B1.5 · the three composed recipes).
const EXPECTED_DESCRIPTORS = {
  'composition-button': {
    axes: { variant: ['solid', 'soft', 'ghost'], size: ['sm', 'md', 'lg'] },
    parts: ['label'], // the anatomy's non-root parts
    interactive: ['pressColor', 'pressScale', 'disabledOpacity'], // the collapsed root opt-in (§8 · no compound)
  },
  'icon-avatar': {
    axes: { variant: ['solid', 'soft', 'ghost', 'subtle'] },
    parts: ['icon'],
    interactive: [], // static · no `interactive` (65.3 · the IconAvatar story)
  },
  topbar: {
    axes: { center: ['false', 'true'] },
    parts: ['content'], // the pivot · center lands 100% on it
    interactive: [],
  },
};

// The anatomy's non-root parts (the structural declaration).
function anatomyParts(ir) {
  return Object.keys((ir.anatomy && ir.anatomy.parts) || {});
}

// Every non-root part a namespace composition ADDRESSES (base + variants).
function addressedParts(ir) {
  const names = new Set();
  const collect = (pm) => {
    for (const p of Object.keys(pm || {})) if (p !== 'root') names.add(p);
  };
  collect(ir.base);
  for (const axis of Object.keys(ir.variants || {})) {
    for (const value of Object.keys(ir.variants[axis])) collect(ir.variants[axis][value]);
  }
  return [...names];
}

// The root's `interactive` opt-in channels (the collapsed pressed/scale/
// disabled flags · §8) — [] for a static surface.
function interactiveChannels(ir) {
  const it = ir.base && ir.base.root && ir.base.root.interactive;
  return it ? Object.keys(it).filter((k) => it[k]) : [];
}

test('D · each build/descriptors/*.ts re-emits identically from its sources', () => {
  // Schema · the hand-maintained pipeline source emitted (import rewritten)
  // must equal the committed build (decision 35 · stale-build / hand-edit guard).
  assert.equal(
    read('build/descriptors/schema.ts'),
    emitSchemaTs(read('pipeline/descriptors/schema.ts')),
    'build/descriptors/schema.ts is stale or hand-edited — run `npm run build`.',
  );

  for (const spec of DESCRIPTOR_COMPONENTS) {
    const css = read(`lib/components/${spec.source}/${spec.source}.css`);
    const html = read(`pages/components/${spec.source}.html`);

    // deriveDescriptor re-reads BOTH sources and THROWS on drift: a surface
    // bg/fg/pressedBg pointing at the wrong chrome/accent leaf (assertSurface),
    // a geometry decl off its scale (scaleLeaf), a press-scale/disabled effect
    // off the interaction baseline (assertInteraction), a routed part absent
    // from the page anatomy (assertPart), or an unknown variant modifier
    // (assertCovered). So this call itself is the token/part/variant guard.
    const ir = deriveDescriptor(spec, { css, html });

    // Re-emit must equal the committed build (stale-build / hand-edit guard).
    assert.equal(
      read(`build/descriptors/${spec.name}.ts`),
      emitDescriptorTs(ir),
      `build/descriptors/${spec.name}.ts is stale or hand-edited — run \`npm run build\`.`,
    );

    // The composition-form pins: a renamed/removed axis value, a moved
    // anatomy part, or a changed `interactive` opt-in breaks here EVEN IF the
    // build was re-emitted — a deliberate contract change must update this guard.
    const expected = EXPECTED_DESCRIPTORS[spec.name];
    assert.ok(expected, `[docs-drift] no pinned shape for descriptor '${spec.name}'`);
    assert.deepEqual(ir.axes, expected.axes, `${spec.name}: axis values drifted from the 65.3 shape`);
    assert.deepEqual(
      anatomyParts(ir).sort(),
      [...expected.parts].sort(),
      `${spec.name}: anatomy parts drifted from the 65.3 shape`,
    );
    assert.deepEqual(
      interactiveChannels(ir).sort(),
      [...expected.interactive].sort(),
      `${spec.name}: the root \`interactive\` opt-in drifted from the 65.3 shape`,
    );

    // Every addressed/anatomy part is a page-declared part (decision 24.1 ·
    // the structure source); `root` is the implicit host. Positional slots
    // (leading/trailing) are not styled parts → not addressed.
    const declared = new Set(['root', ...pageParts(html)]);
    for (const p of [...anatomyParts(ir), ...addressedParts(ir)]) {
      assert.ok(
        declared.has(p),
        `${spec.name}: part '${p}' absent from the page anatomy (${[...declared].join(', ')})`,
      );
    }
    // A part a composition addresses must be in the anatomy (you cannot patch
    // an undeclared part).
    const inAnatomy = new Set(['root', ...anatomyParts(ir)]);
    for (const p of addressedParts(ir)) {
      assert.ok(
        inAnatomy.has(p),
        `${spec.name}: composition addresses part '${p}' not in the anatomy (${[...inAnatomy].join(', ')})`,
      );
    }
  }
});

// ── Guard E · the palette mapping ⊂ its CSS SoT (N+19 B2b · decision 65.3 §6) ──
// The decision-48 discipline applied to the colour namespace: the
// {variant | chrome} → {bg, fg, fgMuted, pressedBg} mapping at
// build/palette.ts must always re-derive from the live CSS —
// palette.css (the web dispatch · every bg/fg cell + the gated pressed
// `:active` swap · B2c·1) cross-asserted against the recipe CSS
// (button.css aliases · icon-avatar.css subtle · topbar.css's chrome
// pair · typography.css's muted fg). derivePalette THROWS on any
// cell↔CSS contradiction (incl. a stray/absent `[data-press-color]`
// pressed row), so this test fails on the same drift `npm run build`
// fails on; the pinned table below additionally catches a coordinated
// CSS+build change — the operator-settled contract may only move by
// deliberately updating this pin.
//
// B2c·1 also pins the pressed-dispatch witness EXPLICITLY: the new
// palette `:active` bg swap must paint the same value the live Button
// presses with (button.css's `:active` rules — the SoT witness the
// parser's alias check does NOT read), i.e. the `pressedBg` column.
const EXPECTED_PALETTE = {
  variant: {
    solid:  { bg: 'accent.solid',    fg: 'accent.onSolid',     pressedBg: 'accent.solidPressed' },
    soft:   { bg: 'chrome.bgStrong', fg: 'chrome.textPrimary', fgMuted: 'chrome.textMuted', pressedBg: 'chrome.bgPressed' },
    ghost:  { bg: 'transparent',     fg: 'chrome.textPrimary', fgMuted: 'chrome.textMuted', pressedBg: 'chrome.bgSubtle' },
    subtle: { fg: 'chrome.borderStrong' },
  },
  chrome: {
    canvas: { bg: 'chrome.bgCanvas', fg: 'chrome.textPrimary', fgMuted: 'chrome.textMuted' },
    subtle: { bg: 'chrome.bgSubtle', fg: 'chrome.textPrimary', fgMuted: 'chrome.textMuted' },
    strong: { bg: 'chrome.bgStrong', fg: 'chrome.textPrimary', fgMuted: 'chrome.textMuted' },
  },
};

test('E · build/palette.ts re-derives from the CSS SoT and matches the pinned contract table', () => {
  const classifiedGroups = classifyAll(readSemanticRules(read('styles/tokens-semantic.css')));

  // derivePalette re-reads every source and THROWS on drift (a cell
  // pointing at the wrong leaf, a missing complete-pair channel, a
  // stray .nuri-palette rule, a renamed semantic var) — the call
  // itself is the cell↔CSS guard.
  const cells = derivePalette(
    {
      button:     read('lib/components/button/button.css'),
      iconAvatar: read('lib/components/icon-avatar/icon-avatar.css'),
      topbar:     read('lib/components/topbar/topbar.css'),
      typography: read('lib/components/typography/typography.css'),
      palette:    read('lib/components/palette/palette.css'),
    },
    { classifiedGroups },
  );

  // Re-emit must equal the committed build (stale-build / hand-edit guard).
  assert.equal(
    read('build/palette.ts'),
    emitPaletteTs(cells),
    'build/palette.ts is stale or hand-edited — run `npm run build`.',
  );

  // The operator-settled contract pin (B2b): a CSS change that flows
  // through to ANY cell fails here even after a re-build.
  assert.deepEqual(cells, EXPECTED_PALETTE, 'palette cells drifted from the B2b contract table');

  // ── Pressed-dispatch witness (N+19 B2c·1) ──────────────────────────
  // The palette `:active` bg swap (gated `[data-press-color]`) must
  // paint the SAME value the live Button presses with — i.e. the
  // `pressedBg` column build/palette.ts emits. derivePalette already
  // cross-asserts every cell (a contradiction throws above); this pins
  // the button.css ↔ palette.css ↔ emit equality directly against the
  // live Button's `:active` rules — which the parser's `@layer tokens`
  // alias check (section A) does NOT read — so a divergence reads as
  // the bug it is (decision 48 · the SoT witness).
  const buttonCss  = read('lib/components/button/button.css');
  const paletteCss = read('lib/components/palette/palette.css');
  const cap = (re, src, label) => {
    const m = src.match(re);
    assert.ok(m, `[docs-drift] Guard E pressed witness: expected to match ${re} (${label})`);
    return m[1];
  };
  // A semantic --nuri-* var → its runtime TokenPath (the same resolution
  // derivePalette emits), so the witness ties straight to the cells.
  const pathFor = (cssVar) => {
    for (const [groupName, group] of classifiedGroups) {
      const entry = group.entries.find((e) => e.cssVar === cssVar);
      if (entry) return `${groupName}.${entry.leafName}`;
    }
    return null;
  };
  for (const v of ['solid', 'soft', 'ghost']) {
    // button.css `:active` rule → the pressed alias → (one hop through
    // `@layer tokens`) the semantic var the live Button presses with.
    const alias  = cap(new RegExp(`\\.nuri-button--${v}:active\\s*\\{\\s*background:\\s*var\\((--nuri-button-${v}-bg-pressed)\\)`), buttonCss, `button ${v} :active`);
    const btnVar = cap(new RegExp(`${alias}:\\s*var\\((--[\\w-]+)\\)`), buttonCss, `button ${v} pressed alias`);
    // palette.css pressed row → the semantic var it paints on `:active`.
    const palVar = cap(new RegExp(`\\.nuri-palette\\[data-variant="${v}"\\]\\[data-press-color\\]:active\\s*\\{\\s*background:\\s*var\\((--[\\w-]+)\\)`), paletteCss, `palette ${v} pressed`);
    assert.equal(palVar, btnVar, `palette ${v} pressed :active bg must equal the live Button's :active bg (button.css SoT witness)`);
    assert.equal(cells.variant[v].pressedBg, pathFor(btnVar), `build/palette.ts ${v}.pressedBg must equal the live Button's :active bg as a TokenPath (button.css SoT witness · decision 48)`);
  }
});

// ── Guard F · the FROZEN schema shape (N+19 B3 · decision 65 step 5) ──
// The cross-repo contract IS the schema shape (decision 65 · 65.1 · the
// source-agnostic freeze). B2c·2 (#28) landed it in its final composition form;
// B3 LOCKS it. This guard pins the schema's field vocabularies, leaf/structural
// unions, and the descriptor envelope EXACTLY as pipeline/descriptors/schema.ts
// declares them, then asserts the source still declares precisely that — "a
// schema-shape test · an enforced freeze, not honorary" (decision 65 step 5).
//
// What it LOCKS: the five namespace field vocabularies (StackNS / BoxNS /
// TypographyNS / PaletteNS / InteractiveNS · field name → declared value type),
// the leaf vocabs (SpaceLeaf / RadiusLeaf member sets · SizeLeaf / TypeKey
// declaration forms), the palette sub-vocabs, and the Part / El / NS /
// PartAnatomy / PartMap / Axes / Variants / Descriptor envelope. A field
// added / removed / renamed / retyped, or a union member moved, BREAKS here.
// What it does NOT lock: the per-component AXES + instance VALUES (Guard D ·
// they re-derive from live CSS) — F is the cross-repo TYPE contract, D keeps
// the instances faithful. Post-freeze the contract only moves DELIBERATELY:
// update the pin below + log it as a versioned contract change (decision 65 ·
// "post-freeze changes are versioned"; the version-negotiation machinery lands
// with the first real bump · P11).
//
// Mechanism: a runtime structural pin in the repo's pin-and-assert guard style
// (Guard D/E), reading the hand-maintained schema SOURCE (Guard D already locks
// build ≡ emit(source), so the freeze flows transitively to build/). The §A
// compile-time AssertEqual<Live, Frozen> mirror was the considered alternative
// (robustness fallback · settled with the operator at the B3 checkpoint).
const FROZEN_SCHEMA = {
  // The five disjoint namespaces (65.3 §6) · field → declared value type. The
  // `?` in a key is the optional marker — flipping required/optional drifts it.
  namespaces: {
    StackNS: {
      'direction?': "'row' | 'column'",
      'align?': "'start' | 'center' | 'end' | 'stretch' | 'baseline'",
      'justify?': "'start' | 'center' | 'end' | 'between' | 'around'",
      'gap?': 'SpaceLeaf',
      'wrap?': 'boolean',
      'fill?': "'grow' | 'grow-shrink'",
    },
    BoxNS: {
      'width?': 'SizeLeaf', 'height?': 'SizeLeaf', 'minHeight?': 'SizeLeaf',
      'padding?': 'SpaceLeaf', 'paddingX?': 'SpaceLeaf', 'paddingY?': 'SpaceLeaf',
      'paddingStart?': 'SpaceLeaf', 'paddingEnd?': 'SpaceLeaf',
      'paddingTop?': 'SpaceLeaf', 'paddingBottom?': 'SpaceLeaf', 'radius?': 'RadiusLeaf',
    },
    TypographyNS: { 'size?': 'TypeKey' },
    PaletteNS: { 'variant?': 'PaletteVariant', 'accent?': 'Accent', 'muted?': 'boolean', 'chrome?': 'PaletteChrome' },
    InteractiveNS: { 'pressColor?': 'boolean', 'pressScale?': 'boolean', 'disabledOpacity?': 'boolean' },
  },
  // Leaf VOCABULARIES the namespaces reference. Pure string-literal unions are
  // pinned member-for-member (order-insensitive); the two scale-derived leaves
  // are pinned by DECLARATION FORM — their members live in the tokens emit
  // (governed by Guard C / tokens-parser, not the shape freeze).
  leafUnions: {
    SpaceLeaf: ['xs', 'sm', 'md', 'lg', 'xl'],
    RadiusLeaf: ['sm', 'md', 'lg', 'full'],
    PaletteVariant: ['solid', 'soft', 'ghost', 'subtle'],
    PaletteChrome: ['canvas', 'subtle', 'strong'],
  },
  leafForms: {
    SizeLeaf: "keyof typeof import('../../build/tokens').size",
    TypeKey: 'TypeSize | `${TypeSize}Em`',
  },
  // The parts + composition + envelope (65.3 §7 · decision 24.1).
  Part: ['root', 'label', 'icon', 'content'],
  El: ['view', 'text', 'icon'],
  NS: { 'stack?': 'StackNS', 'box?': 'BoxNS', 'typography?': 'TypographyNS', 'palette?': 'PaletteNS', 'interactive?': 'InteractiveNS' },
  PartAnatomy: { 'el': 'El', 'open?': 'boolean', 'parts?': "Partial<Record<Exclude<Part, 'root'>, PartAnatomy>>" },
  Descriptor: { 'structure': '{ anatomy: PartAnatomy; base?: PartMap }', 'variants?': 'Variants<A>' },
  aliasForms: {
    PartMap: 'Partial<Record<Part, NS>>',
    Axes: 'Record<string, string>',
    Variants: '{ [Axis in keyof A]: { [Value in A[Axis]]: PartMap }; }',
  },
};

// Normalize a TS type fragment to a canonical token stream — collapse
// whitespace, standardize spacing around `|` / `,` / `;` / `:` — so the freeze
// catches CONTENT drift (a member/field/type change), not benign reformatting.
const normType = (s) =>
  s.replace(/\s+/g, ' ').replace(/\s*\|\s*/g, ' | ').replace(/\s*([,;:])\s*/g, '$1 ').trim();

// Pull the RHS of `export type <Name>...= <rhs>;` from the schema source —
// brace/paren/bracket-aware scan to the top-level terminating `;` (every `;`
// we must skip past lives inside `{}`; unions/generics never hold one). A
// missing/renamed type throws here with a legible message (drift, not a pass).
function typeRhs(src, name) {
  const m = new RegExp(`export type ${name}\\b[^=]*=\\s*`).exec(src);
  assert.ok(m, `[freeze] schema declares no \`export type ${name}\` — the frozen contract type was renamed or removed (B3 · decision 65)`);
  let depth = 0, i = m.index + m[0].length;
  const start = i;
  for (; i < src.length; i++) {
    const c = src[i];
    if (c === '{' || c === '(' || c === '[') depth++;
    else if (c === '}' || c === ')' || c === ']') depth--;
    else if (c === ';' && depth === 0) break;
  }
  return src.slice(start, i).trim();
}

// An object-type RHS `{ field?: T; … }` → { 'field?': 'normT', … } (the key
// keeps its optional `?`). Splits on top-level `;` (brace-depth-aware, so a
// nested object's inner `;` stays with its field's value).
function typeFields(rhs) {
  const inner = rhs.replace(/^\{/, '').replace(/\}$/, '');
  const out = {};
  let depth = 0, buf = '';
  const flush = () => {
    const f = buf.trim(); buf = '';
    if (!f) return;
    const ci = f.indexOf(':');
    out[f.slice(0, ci).trim()] = normType(f.slice(ci + 1));
  };
  for (const c of inner) {
    if (c === '{' || c === '(' || c === '[') depth++;
    else if (c === '}' || c === ')' || c === ']') depth--;
    if (c === ';' && depth === 0) flush();
    else buf += c;
  }
  flush();
  return out;
}

// A pure string-literal union RHS `'a' | 'b'` → its sorted member set.
const unionMembers = (rhs) => rhs.split('|').map((s) => s.trim().replace(/^'|'$/g, '')).sort();

test('F · the descriptor schema shape is frozen (B3 · decision 65 step 5)', () => {
  const src = read('pipeline/descriptors/schema.ts');
  const drift = (what) =>
    `${what} drifted from the FROZEN schema shape (B3). The cross-repo contract is locked — ` +
    `if this is deliberate, update the FROZEN_SCHEMA pin AND version the change (decision 65 · ` +
    `post-freeze changes are versioned); otherwise the schema was changed by accident.`;

  // The five namespace field vocabularies (field name → value type).
  for (const [name, pinned] of Object.entries(FROZEN_SCHEMA.namespaces)) {
    assert.deepEqual(typeFields(typeRhs(src, name)), pinned, drift(`namespace ${name}`));
  }

  // The leaf vocabularies — member sets + the two scale-derived declaration forms.
  for (const [name, pinned] of Object.entries(FROZEN_SCHEMA.leafUnions)) {
    assert.deepEqual(unionMembers(typeRhs(src, name)), [...pinned].sort(), drift(`leaf vocab ${name}`));
  }
  for (const [name, pinned] of Object.entries(FROZEN_SCHEMA.leafForms)) {
    assert.equal(normType(typeRhs(src, name)), normType(pinned), drift(`leaf form ${name}`));
  }

  // The parts + structural unions (member sets).
  assert.deepEqual(unionMembers(typeRhs(src, 'Part')), [...FROZEN_SCHEMA.Part].sort(), drift('Part'));
  assert.deepEqual(unionMembers(typeRhs(src, 'El')), [...FROZEN_SCHEMA.El].sort(), drift('El'));

  // The composition + anatomy + descriptor envelope (field maps).
  assert.deepEqual(typeFields(typeRhs(src, 'NS')), FROZEN_SCHEMA.NS, drift('the NS composition'));
  assert.deepEqual(typeFields(typeRhs(src, 'PartAnatomy')), FROZEN_SCHEMA.PartAnatomy, drift('PartAnatomy'));
  assert.deepEqual(typeFields(typeRhs(src, 'Descriptor')), FROZEN_SCHEMA.Descriptor, drift('the Descriptor envelope'));

  // The remaining structural alias forms (PartMap · Axes · Variants).
  for (const [name, pinned] of Object.entries(FROZEN_SCHEMA.aliasForms)) {
    assert.equal(normType(typeRhs(src, name)), normType(pinned), drift(`alias ${name}`));
  }
});
