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
 * Six guards (A · C · N+12a · D · N+19 · the composition model 65.3 ·
 * E · N+19 B2b · decision 65.3 §6 · F · N+19 B3 · decision 65 step 5 ·
 * G · N+22 · decision 66 arc #1 · the website doc-gen).
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
 *   G · each build/docs/*.md re-emits identically from its descriptor (the
 *       generation thesis applied to docs · decision 66 arc #1 · generalized
 *       to all three DESCRIPTOR_COMPONENTS at N+23 · increment 2). The page
 *       is BUILD OUTPUT — the stale-build / hand-edit guard (Guard D/E
 *       posture) plus the per-page contract pinned: the just-the-docs
 *       front-matter, the authored-story `## Example` include slot
 *       (decision 57.2 · the story is NOT generated), the data sections
 *       (API · Anatomy · Base · Token map), and ≥1 ENRICHED cell per page —
 *       the resolved value beside the token path (geometry px · the type
 *       composite · a live var() colour swatch + default-scope hex · N+23).
 *       The token-map's variant→palette derefs flow from Guard E's cells; the
 *       size→scale leaves + swatch hexes from the same build data tokens.ts
 *       emits — G pins the RENDERING.
 * ────────────────────────────────────────────────────────────── */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  DESCRIPTOR_COMPONENTS,
  emitDescriptorTsFromSource,
  emitDescriptorJsFromSource,
  docIrFromDescriptor,
  exportNameFor,
  emitSchemaTs,
  pageParts,
} from './parsers/descriptors.js';
import { derivePalette, emitPaletteTs } from './parsers/palette.js';
import { emitDocPage, buildDocTokenInputs } from './parsers/docs.js';
import {
  readSemanticRules,
  classifyAll,
  buildPrimitiveMap,
  resolveSemanticCrossProduct,
} from './parsers/semantic.js';
import { buildTypeScale } from './parsers/type.js';

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

test('D · build/descriptors/* re-emits from the authored SoT + the composition-form pins hold', async () => {
  // Schema · the hand-maintained pipeline source emitted (import rewritten)
  // must equal the committed build (decision 35 · stale-build / hand-edit guard).
  assert.equal(
    read('build/descriptors/schema.ts'),
    emitSchemaTs(read('pipeline/descriptors/schema.ts')),
    'build/descriptors/schema.ts is stale or hand-edited — run `npm run build`.',
  );

  for (const spec of DESCRIPTOR_COMPONENTS) {
    const authored = read(`pipeline/descriptors/${spec.name}.ts`);
    const html = read(`pages/components/${spec.source}.html`);

    // ── (1) STALE-BUILD / HAND-EDIT · build/ is the passthrough of the authored
    // SoT (decision 69 · §9 step 1 · the inversion): the .ts is the source with
    // the GENERATED header, the .js is it type-stripped — both DATA byte-identical.
    assert.equal(
      read(`build/descriptors/${spec.name}.ts`),
      emitDescriptorTsFromSource(spec, authored),
      `build/descriptors/${spec.name}.ts is stale or hand-edited — run \`npm run build\`.`,
    );
    assert.equal(
      read(`build/descriptors/${spec.name}.js`),
      emitDescriptorJsFromSource(spec, authored),
      `build/descriptors/${spec.name}.js is stale or hand-edited — run \`npm run build\`.`,
    );

    // ── (2) THE COMPOSITION-FORM IR · sourced from the AUTHORED descriptor (decision
    // 69 · the SoT) via its browser-ESM twin (node cannot import the .ts) — the SAME ir
    // Guard G feeds emitDocPage (mirrors Slice 9). The B1 PARITY ORACLE
    // (deriveDescriptor(CSS,HTML) re-reads the hand CSS+HTML and asserts derive ==
    // authored) RETIRED with the recipe CSS at the L3c flip (decision 74 · the
    // "until B2 generates the CSS" boundary decision 69 named): the descriptor is now
    // the SOLE SoT — there is no hand recipe CSS to cross-derive from. The descriptor
    // stays honest via Guard F (the frozen schema shape) + leg (1) re-emit freshness +
    // leg (3) the composition-form pins below (now pinning the authored IR directly).
    const twin = pathToFileURL(resolve(REPO_ROOT, `build/descriptors/${spec.name}.js`)).href;
    const descriptor = (await import(twin))[exportNameFor(spec.name)];
    const ir = docIrFromDescriptor(spec, descriptor);

    // ── (3) THE COMPOSITION-FORM PINS · a renamed/removed axis value, a moved
    // anatomy part, or a changed `interactive` opt-in breaks here EVEN IF the
    // build + oracle agree — a deliberate contract change must update this guard.
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
// palette.css (the web dispatch · every variant + chrome bg/fg cell + the gated
// pressed `:active` swap · B2c·1) + typography.css (the muted fg). The recipe-CSS
// cross-checks (button/icon-avatar/topbar) retired with the recipe layer (decision
// 74 · the L3c flip). derivePalette THROWS on any
// cell↔CSS contradiction (incl. a stray/absent `[data-press-color]`
// pressed row), so this test fails on the same drift `npm run build`
// fails on; the pinned table below additionally catches a coordinated
// CSS+build change — the operator-settled contract may only move by
// deliberately updating this pin.
//
// (The B2c·1 pressed-dispatch witness — which cross-checked palette.css's `:active`
// swap against the live Button's button.css `:active` rules — retired with the recipe
// layer · decision 74; the pressedBg is still covered by derivePalette section E.2 +
// the EXPECTED_PALETTE pin.)
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

  // The pressed-dispatch witness (N+19 B2c·1) — which cross-checked palette.css's gated
  // [data-press-color]:active bg swap against the live Button's button.css `:active`
  // rules — RETIRED with the recipe layer (decision 74 · the L3c flip · there is no
  // recipe button.css to witness anymore). The pressed bg is still fully covered:
  // derivePalette section E.2 asserts each palette.css `:active` row against
  // PALETTE_CONTRACT, and EXPECTED_PALETTE pins the pressedBg cells above.
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

// ── Guard G · the generated doc pages ⊂ their descriptor (N+22 · decision 66
// arc #1 · generalized to all three at N+23 · increment 2) ──
// The §35 discipline (committed build re-emits identically) applied to the
// website doc-gen: build/docs/<source>.md is RENDERED from the descriptor IR
// (read-only · NOT §9 · decision 2 STANDS) by pipeline/parsers/docs.js. The
// re-emit identity is the stale-build / hand-edit guard (Guard D/E posture);
// the per-page pins lock the contract — a future emitter change that drops the
// front-matter, the authored-story include slot, a data section, or the N+23
// VALUE enrichment breaks HERE, not only at `git diff --exit-code build/`. The
// page OUTPUT is now a pure function of (ir · palette · tokens · colors) — all
// SoT-derived via the SAME builder the orchestrator feeds (buildDocTokenInputs ·
// the scale maps that double as the leaf-validation sets · the type composite ·
// the default-scope colour resolver), so the re-emit matches byte-for-byte.
const DOC_COMPONENTS = ['composition-button', 'icon-avatar', 'topbar'];

// Per-page contract (N+23): front-matter title/nav · the authored `## Example`
// include · the data sections · the 2-column split (the resolved value in its
// OWN "Resolves to" column beside the "Token" composition · operator request) ·
// and ≥1 ENRICHED value cell exercising each format (geometry px · the type
// composite · the live var() swatch + hex · the em-dash for a literal/flag). The
// enriched cells are the FAITHFUL R1.5 surface — icon-avatar's `subtle` fg-only
// variant + radius.full (the 9999px sentinel) · topbar's MIXED stack (literals →
// em-dash, gap → px) + its LONE `center true` token-map row (center=false is an
// empty partmap · no rows). A deliberate emitter change must update these pins.
const PAGE_CONTRACT = {
  'composition-button': {
    source: 'button', title: 'Button', nav: 1,
    cells: [
      // colour · the live var() swatch + the default-scope hex in the VALUE column
      '| `variant` | `solid` | `root` | `palette` | **bg** `accent.solid`<br>**fg** `accent.onSolid`<br>**pressed** `accent.solidPressed` | <span class="nuri-doc-swatch" style="background:var(--nuri-accent-solid)"></span> `#12110b`<br><span class="nuri-doc-swatch" style="background:var(--nuri-accent-on-solid)"></span> `#f0eee3`<br><span class="nuri-doc-swatch" style="background:var(--nuri-accent-solid-pressed)"></span> `#242319` |',
      // geometry · the resolved px in the value column
      '| `size` | `lg` | `root` | `box` | **minHeight** `size.xl`<br>**paddingX** `space.xl`<br>**radius** `radius.md` | `60px`<br>`24px`<br>`12px` |',
      // typography · the expanded composite in the value column
      '| `size` | `md` | `label` | `typography` | **size** `mdEm` | **fontSize** `17`<br>**lineHeight** `1.29`<br>**weight** `600`<br>**letterSpacing** `-0.02` |',
    ],
  },
  'icon-avatar': {
    source: 'icon-avatar', title: 'Icon Avatar', nav: 2,
    cells: [
      // geometry · the radius.full sentinel (9999px) in the value column
      '| `root` | `box` | **width** `size.lg`<br>**height** `size.lg`<br>**radius** `radius.full` | `48px`<br>`48px`<br>`9999px` |',
      // the `subtle` fg-only variant · a single swatch in the value column
      '| `variant` | `subtle` | `root` | `palette` | **fg** `chrome.borderStrong` | <span class="nuri-doc-swatch" style="background:var(--nuri-border-strong)"></span> `#bfbcac` |',
    ],
  },
  topbar: {
    source: 'topbar', title: 'Topbar', nav: 3,
    cells: [
      // chrome surface · the canvas swatch + hex in the value column
      '| `root` | `palette` | **bg** `chrome.bgCanvas`<br>**fg** `chrome.textPrimary`<br>**muted** `chrome.textMuted` | <span class="nuri-doc-swatch" style="background:var(--nuri-bg-canvas)"></span> `#fffdf2`<br><span class="nuri-doc-swatch" style="background:var(--nuri-text-primary)"></span> `#222013`<br><span class="nuri-doc-swatch" style="background:var(--nuri-text-muted)"></span> `#666455` |',
      // the MIXED stack cell · literals → the em-dash, gap → the resolved px (the
      // value column aligns line-for-line with the Token column)
      '| `root` | `stack` | **direction** `row`<br>**align** `center`<br>**gap** `space.sm` | —<br>—<br>`6px` |',
      // the LONE token-map row · center=false is an empty partmap (faithful R1.5)
      '| `center` | `true` | `content` | `stack` | **align** `center`<br>**justify** `center` | —<br>— |',
    ],
  },
};

test('G · each build/docs/*.md re-emits identically from its descriptor', async () => {
  const semanticRules = readSemanticRules(read('styles/tokens-semantic.css'));
  const classifiedGroups = classifyAll(semanticRules);
  // The default-scope (neutral + light · cream) resolved cross-product + type
  // scale — the SAME data the orchestrator's Slice 9 feeds buildDocTokenInputs,
  // so the value-bearing inputs (px · composite · swatch var + hex) reconstruct
  // identically and the page re-emits byte-for-byte.
  const primitiveMap = buildPrimitiveMap(read('styles/tokens-primitive.css'));
  const resolved = resolveSemanticCrossProduct(semanticRules, primitiveMap);
  const typeScale = buildTypeScale(primitiveMap);
  const { tokens, colors } = buildDocTokenInputs(classifiedGroups, resolved, typeScale);
  // The same palette cells the page derefs (build/palette.ts · Guard E's SoT).
  const palette = derivePalette(
    {
      typography: read('lib/components/typography/typography.css'),
      palette:    read('lib/components/palette/palette.css'),
    },
    { classifiedGroups },
  );

  // Re-emit must equal the committed build (stale-build / hand-edit guard). The
  // doc IR is sourced from the AUTHORED descriptor (decision 69 · the SoT), via
  // the browser-ESM twin (node cannot import the .ts SoT) — NOT re-derived from
  // CSS. Mirrors Slice 9; Guard D separately proves derive(CSS) ≡ the authored data.
  for (const spec of DESCRIPTOR_COMPONENTS) {
    if (!DOC_COMPONENTS.includes(spec.name)) continue;
    const twin = pathToFileURL(resolve(REPO_ROOT, `build/descriptors/${spec.name}.js`)).href;
    const descriptor = (await import(twin))[exportNameFor(spec.name)];
    const ir = docIrFromDescriptor(spec, descriptor);
    assert.equal(
      read(`build/docs/${spec.source}.md`),
      emitDocPage(ir, { palette, tokens, colors }),
      `build/docs/${spec.source}.md is stale or hand-edited — run \`npm run build\`.`,
    );
  }

  // The per-page contract pins (a deliberate emitter change must update these).
  for (const spec of DESCRIPTOR_COMPONENTS) {
    const contract = PAGE_CONTRACT[spec.name];
    if (!contract) continue;
    const md = read(`build/docs/${contract.source}.md`);
    assert.match(
      md,
      new RegExp(`^---\\ntitle: ${contract.title}\\nlayout: default\\nnav_order: ${contract.nav}\\n---`),
      `${contract.source}.md: the just-the-docs front-matter drifted`,
    );
    assert.ok(
      md.includes(`\n{% include demo/${contract.source}.html %}\n`),
      `${contract.source}.md: the authored <nuri-demo> story include slot is missing (decision 57.2)`,
    );
    for (const h of ['## Example', '## API', '## Anatomy', '## Base', '## Token map']) {
      assert.ok(md.includes(`\n${h}\n`), `${contract.source}.md: missing the '${h}' section`);
    }
    // The N+23 two-column split — the composition (Token) and its concrete value
    // (Resolves to) in separate columns, in BOTH tables.
    assert.ok(
      md.includes('| Part | Namespace | Token | Resolves to |'),
      `${contract.source}.md: the Base table lost the 2-column Token / Resolves-to split`,
    );
    assert.ok(
      md.includes('| Axis | Value | Part | Namespace | Token | Resolves to |'),
      `${contract.source}.md: the Token map lost the 2-column Token / Resolves-to split`,
    );
    // ≥1 enriched cell per page — the N+23 value/swatch/composite RENDERING.
    for (const cell of contract.cells) {
      assert.ok(
        md.includes(cell),
        `${contract.source}.md: an enriched cell rendering drifted —\n  expected substring: ${cell}`,
      );
    }
  }
});
