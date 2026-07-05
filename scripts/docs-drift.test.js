/* ──────────────────────────────────────────────────────────────
 * NURI · DOCS-DRIFT GUARDS · CI-ENFORCED FRESHNESS
 *
 * The agent-facing entry-point manifest (llms.txt) is a derived,
 * hand-maintained mirror of the emitted artefacts under build/. It
 * rots silently — a re-emitted count lands, the prose doesn't, and the
 * next agent trusts a stale map. These guards fail the build the moment
 * a doc falls behind the live artefacts, so the drift is caught at PR
 * time, not by a confused reader three sessions later. (The README pin
 * RETIRED at N+63 · the concise front door carries no derived counts.)
 *
 * Sibling to tokens-parser.test.js (kept separate so its assertion
 * count stays stable · N+12a). Run with:
 *   node --test pipeline/docs-drift.test.js
 * or via the glob in `npm test`.
 *
 * Four guards (C · N+12a · D · N+19 · the composition model 65.3 ·
 * E · N+19 B2b · decision 65.3 §6 · F · N+19 B3 · decision 65 step 5).
 * (Guard B — every build/components/*.ts named in README + impl-guide —
 * was RETIRED at Smell-1 · decision 66 arc #0 when build/components/ was
 * deleted and the interaction baseline relocated to build/interaction.ts.
 * Guard A — pages/components/*.html ⊂ llms.txt — RETIRED at N+42 · the A4
 * carve when the hand pages ARCHIVED to @nuri/doc/archive/ (the active doc
 * surface is now the GENERATED pages · @nuri/doc's Guard G). Guard G — the
 * doc-page re-emit pin — MOVED to @nuri/doc at N+42 with the doc-gen it pins ·
 * convergence §5 · "spec emits data, doc transforms it".)
 *   C · doc-stated emitted counts match the live build artefacts
 *   D · build/descriptors/schema.ts + each *.js twin re-emits identically — in the
 *       COMPOSITION form (65.3 §7 · structure { anatomy, base } +
 *       variants · the five primitive namespaces) — from its live sources
 *       (the @layer CSS mapping + the page data-part structure), and the
 *       validated shapes are pinned: a renamed/removed part, variant, or
 *       namespace value (incl. the collapsed `interactive` opt-in) breaks
 *       the test (the TokenPath discipline applied to the descriptor).
 *   E · packages/rn/generated/data/palette.ts re-emits identically from the namespace-axis TS SoTs
 *       (palette-surface.ts + typography-axis.ts · re-sourced N+40 · §74), and
 *       the operator-settled contract table is pinned — a cell that contradicts
 *       the SoT fails here (and the build · decision 48).
 *   F · the FROZEN schema SHAPE — the cross-repo contract TYPE is locked
 *       (decision 65 step 5 · "an enforced freeze, not honorary"). The
 *       five namespace field vocabularies, the leaf/structural unions, and
 *       the Descriptor/PartAnatomy/PartMap envelope are pinned EXACTLY as
 *       packages/spec/components/schema.ts declares them; a field added /
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
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  DESCRIPTOR_COMPONENTS,
  emitDescriptorJsFromSource,
  exportNameFor,
} from './parsers/descriptors.js';
import { derivePalette, emitPaletteTs } from './parsers/palette.js';
import { readSemanticRules, classifyAll } from './parsers/semantic.js';
import { loadTsDataFromPath } from './ts-data-loader.js';

// (Guard G · the doc-page re-emit pin · MOVED to @nuri/doc at N+42 · the A4 carve.
// The doc-gen [emitDocPage / buildDocTokenInputs / docIrFromDescriptor · + the
// buildPrimitiveMap / resolveSemanticCrossProduct / buildTypeScale value inputs it
// fed] left @nuri/spec with the emitter · convergence §5. Guards A/C/D/E/F STAY —
// they pin the descriptor / palette / schema / count surfaces @nuri/spec owns.)

const __dirname = dirname(fileURLToPath(import.meta.url));
// The codegen lives in the root `scripts/` dir (convergence phase 4·3 · @nuri/spec
// is now no-deps/no-scripts), so REPO_ROOT roots the spec package one level over —
// `pages/`, `build/`, `lib/`, `styles/` resolve unchanged. The agent-facing
// entry-point docs (llms.txt · README.md) are repo-level and stay at the monorepo
// root, two levels up from spec.
const REPO_ROOT = resolve(__dirname, '../packages/spec');
const MONOREPO_ROOT = resolve(REPO_ROOT, '..', '..');

const read = (rel) => readFileSync(resolve(REPO_ROOT, rel), 'utf8');
const readRoot = (rel) => readFileSync(resolve(MONOREPO_ROOT, rel), 'utf8');
// N+62 (decision 80): the generated artifacts left @nuri/spec for the two projections —
// the RN contract → @nuri/rn/generated/, the web output → @nuri/prototype/generated/.
const RN_GENERATED = resolve(MONOREPO_ROOT, 'packages/rn/generated');
const PROTO_GENERATED = resolve(MONOREPO_ROOT, 'packages/prototype/generated');
const readRn = (rel) => readFileSync(resolve(RN_GENERATED, rel), 'utf8');
const readProto = (rel) => readFileSync(resolve(PROTO_GENERATED, rel), 'utf8');

// Load a namespace-axis TS SoT (palette-surface.ts / typography-axis.ts) through
// the same TS data boundary Slice 8 uses (NOT loadSurface/loadAxis · those emitters
// leave spec at the A3 carve). The two derivePalette guards (E + G) re-derive
// packages/rn/generated/data/palette.ts from the SAME SoTs the build reads.
const loadAxisSoT = async (rel, exportName) =>
  (await loadTsDataFromPath(resolve(REPO_ROOT, rel)))[exportName];

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

// (Guard A · pages/components/*.html ⊂ llms.txt · RETIRED at N+42 · the A4 carve.
// The hand component pages ARCHIVED to @nuri/doc/archive/ — frozen regen specs, not
// the active doc surface (the GENERATED pages are · gated by @nuri/doc's Guard G).
// The llms.txt consumer manifest still path-lists the archived tree — a holistic
// post-migration rewrite is deferred doc-hygiene · roadmap/index.md, NOT a slice-1
// gate. The count phrases llms.txt/README state stay pinned by Guard C below.)

// ── Guard C · doc-stated counts == live build ────────────────────
test('C · doc-stated emitted counts match the live build', () => {
  // Live truths derived from the emitted artefacts.
  const tokenPathMembers = (readRn('data/token-paths.ts').match(/^\s+\| '/gm) || []).length;

  const llms = readRoot('llms.txt');

  // runtime-set leaf count (== TokenPath members).
  assert.equal(
    extractCount(llms, /every runtime-set leaf \((\d+) members\)/, 'llms.txt token-paths members'),
    tokenPathMembers,
    'llms.txt token-paths member count drifted from build/token-paths.ts',
  );
  assert.equal(
    extractCount(llms, /\+ ratio \((\d+) leaves\)/, 'llms.txt tokens.ts runtime-set leaves'),
    tokenPathMembers,
    'llms.txt tokens.ts leaf count drifted from build/token-paths.ts',
  );

  // (The README token-count pin RETIRED at N+63 · Phase 5 · the concise front door.
  // The 18KB structure-mirroring README was replaced wholesale by the concise project
  // doc [docs/PROJECT.md → README.md], which carries NO token counts by design — the
  // front door is prose, not a derived count mirror. llms.txt stays the count-pinned
  // agent manifest [regenerated post-Phase-6]; README is no longer drift-gated.)

  // (The glyph-count cross-check RETIRED at N+51 · the icons-as-folder flip. The
  // icon registry is now GENERATED from icons/*.svg and meant to GROW by dropping
  // files — pinning a count would force a doc edit on every new glyph, breaking the
  // "add an icon = add a file, nothing else" invariant · convergence phase 4·1.
  // The drift guard that matters now is the folder → registry round-trip in
  // tokens-parser.test.js, not a hand-stated count.)
});

// ── Guard D · the descriptor twin re-emits + its composition-form shape holds (65.3 · R-EXPO-6) ──
// The TokenPath discipline (decision 34) applied to the per-component
// descriptor — now in the post-oracle world: the descriptor is the SOLE
// SoT (the CSS parity oracle retired at the L3c flip · decision 74), so
// this guard reads the AUTHORED descriptor in its COMPOSITION form (65.3
// §7 · structure { anatomy, base } + variants · the five primitive
// namespaces) via its committed browser-ESM twin, and pins the shape: a
// renamed/removed part, variant, or namespace value (incl. the collapsed
// `interactive` opt-in) breaks this test even if the build re-emitted
// clean. The validated shapes (B1.5 · the three composed recipes).
const EXPECTED_DESCRIPTORS = {
  // alert (the form-kit inline notice · composition-only · form-kit-spec §1) — a
  // compact one-line centred row with a leading `icon` part and a `message` donor
  // text part (the flat STRING children render through it as a single-line leaf ·
  // the prose rule); the trailing AlertButton is a bare element child. `soft` raises
  // a neutral pill surface; `ghost` is transparent. Static · no `interactive`.
  alert: {
    axes: { variant: ['soft', 'ghost'] },
    parts: ['icon', 'message', 'action'],
    interactive: [],
  },
  button: {
    axes: { variant: ['solid', 'soft', 'ghost'], size: ['sm', 'md', 'lg'], fill: ['natural', 'even', 'hug'] },
    parts: ['label', 'icon'], // the anatomy's non-root parts
    interactive: ['pressColor', 'pressScale', 'disabledOpacity'], // the collapsed root opt-in (§8 · no compound)
  },
  'icon-avatar': {
    axes: { variant: ['solid', 'soft', 'ghost', 'subtle', 'outline'] },
    parts: ['icon'],
    interactive: [], // static · no `interactive` (65.3 · the IconAvatar story)
  },
  // topbar (the topbar-slots slice · the catalog's first
  // COMPOUND component) — a slot-based action bar with one semantic surface axis:
  // three descriptor-local typed regions, the edges carrying the `even` flex so
  // the centre lands dead-centre.
  // The stringly-boolean `center` axis is GONE (true centring is structural now).
  topbar: {
    axes: { surface: ['canvas', 'transparent'] },
    parts: ['leading', 'center', 'trailing'],
    interactive: [],
  },
  // icon-button (P11 · reduced to icon-ONLY at Path C Phase 0/B0) — the
  // conventional glyph circle: a lone `icon` part is the whole control (the
  // anchored flanks retired · the lockup relocated to composable Button · Phase 4),
  // interactive like Button (all three channels), variant × size.
  'icon-button': {
    axes: { variant: ['solid', 'soft', 'ghost'], size: ['sm', 'md', 'lg'] },
    parts: ['icon'],
    interactive: ['pressColor', 'pressScale', 'disabledOpacity'],
  },
  // list (the list family's open host) — a gap-free column that accepts rows and
  // separators as positional children. It names no row slots by design.
  list: {
    axes: {},
    parts: [],
    interactive: [],
  },
  // list-action (the list family's pressable row · decision 84) — a
  // pressColor-only row with nested containers for leading avatar, content,
  // trailing value stack, and trailing icon.
  'list-action': {
    axes: { variant: ['outline', 'solid', 'soft', 'ghost', 'subtle'] },
    parts: [
      'leadingAvatar',
      'content',
      'text',
      'textMuted',
      'trailing',
      'trailingText',
      'trailingTextMuted',
      'trailIcon',
    ],
    interactive: ['pressColor', 'disabledOpacity'],
  },
  'text-field': {
    axes: {},
    parts: ['label', 'box', 'input', 'button', 'iconButton'],
    interactive: [],
  },
  // tab-bar-item (the bottom-bar ITEM · presentation only) — icon-over-label, the
  // `state` 2-value appearance axis (selected ghost / unselected subtle · the
  // colour-only muted treatment · icon weights dropped at decision 38), pressScale
  // ONLY (the legacy tab-item baseline · no bg change). The `selected` boolean bridges
  // onto `state` in both factories.
  'tab-bar-item': {
    axes: { state: ['selected', 'unselected'] },
    parts: ['icon', 'label'],
    interactive: ['pressScale'],
  },
  // tab-bar (the DUMB layout container) — an OPEN row of equal columns, one
  // semantic surface axis, NO named parts (the open-positional children are the
  // Tab items · not slots), NO interactive (the items are, the bar is not).
  'tab-bar': {
    axes: { surface: ['canvas', 'transparent'] },
    parts: [],
    interactive: [],
  },
  // bottom-sheet-panel (the descriptor-backed visual part of the sheet family) —
  // an OPEN positional canvas surface. Detents, scrim, gestures, and engine
  // behaviour belong to the structural BottomSheet primitive, not this descriptor.
  'bottom-sheet-panel': {
    axes: {},
    parts: [],
    interactive: [],
  },
};

// The anatomy's non-root parts (the structural declaration).
function anatomyParts(ir) {
  const parts = [];
  const walk = (node) => {
    for (const [part, child] of Object.entries((node && node.parts) || {})) {
      parts.push(part);
      walk(child);
    }
  };
  walk(ir.anatomy);
  return parts;
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
  // Schema · the verbatim build/descriptors/schema.ts copy was DROPPED at N+61
  // (Slice 3b·2b·i · orphan since 3a · rn imports the source via the
  // `./descriptors/schema` subpath). The frozen SHAPE is still enforced over the
  // SOURCE by Guard F below. Only the browser-ESM .js twins are emitted now.

  for (const spec of DESCRIPTOR_COMPONENTS) {
    const authored = read(`components/${spec.name}.ts`);

    // ── (1) STALE-BUILD / HAND-EDIT · the verbatim .ts COPY was dropped (Slice 3a ·
    // projection-model §4 · decision 80): @nuri/rn imports the authored SoT directly.
    // The browser-ESM .js twin is the WEB projection's generated output now (N+62 ·
    // @nuri/prototype/generated/descriptors/ · the recipes + doc staging consume it).
    assert.equal(
      readProto(`descriptors/${spec.name}.js`),
      emitDescriptorJsFromSource(spec, authored),
      `packages/prototype/generated/descriptors/${spec.name}.js is stale or hand-edited — run \`node scripts/tokens-parser.js\`.`,
    );

    // ── (2) THE COMPOSITION-FORM IR · sourced from the AUTHORED descriptor (decision
    // 69 · the SoT) via its browser-ESM twin (node cannot import the .ts). The B1 PARITY
    // ORACLE (the pre-SoT cross-check that re-read the hand CSS+HTML and asserted the
    // derived shape == the authored data) RETIRED with the recipe CSS at the L3c flip
    // (decision 74 · the "until B2 generates the CSS" boundary decision 69 named): the
    // descriptor is now the SOLE SoT — there is no hand recipe CSS to cross-derive from.
    // Its dead derivation code was pruned at debt-register D1. The descriptor
    // stays honest via Guard F (the frozen schema shape) + leg (1) re-emit freshness +
    // leg (3) the composition-form pins below (now pinning the authored IR directly).
    // The IR reshape is INLINED here (was docIrFromDescriptor · MOVED to @nuri/doc at
    // N+42 · the A4 carve · convergence §5) — Guard D needs only the structural fields
    // (axes / anatomy / base / variants), not the doc emitter's exportName/typeName.
    const twin = pathToFileURL(resolve(PROTO_GENERATED, `descriptors/${spec.name}.js`)).href;
    const descriptor = (await import(twin))[exportNameFor(spec.name)];
    const variants = descriptor.variants || {};
    const axes = {};
    for (const a of Object.keys(variants)) axes[a] = Object.keys(variants[a]);
    const ir = { axes, anatomy: descriptor.structure.anatomy, base: descriptor.structure.base, variants };

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

    // (The "every addressed/anatomy part is a PAGE-declared part" cross-check
    // [decision 24.1 · the hand page was the structure source] RETIRED at N+42 ·
    // the A4 carve — pages/components/ ARCHIVED to @nuri/doc/archive/, and post-flip
    // [N+38 · decision 74] the descriptor is the SOLE SoT [the B1 page/CSS oracle
    // already retired], so the anatomy is pinned by EXPECTED_DESCRIPTORS.parts above,
    // not the hand page. The descriptor-INTERNAL invariant below stays.)
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

// ── Size-coherence guard · icon-button's row-shape stays coherent with Button ──
// P11 (the icon-button slice): the icon-anchored control shares Button's HEIGHT +
// CORNER per size (minHeight · radius) so the two sit coherently in a row — but
// paddingX INTENTIONALLY DIVERGES (Button pads for text; icon-button carries only
// a small ring + a `minWidth` floor so the BARE form squares · minWidth =
// minHeight). So the pin is: minHeight ≡ Button · radius ≡ Button · minWidth ==
// the row's own minHeight (the square invariant). The shared-fragment extraction
// (a `_button-family-sizing` slice) is a deliberate FOLLOW-UP; until then THIS
// guard is the seam. Reads the browser-ESM twins (node cannot import the .ts).
test('icon-button stays size-coherent with button (height + corner + the square floor · P11)', async () => {
  const loadTwin = async (name) =>
    (await import(pathToFileURL(resolve(PROTO_GENERATED, `descriptors/${name}.js`)).href))[exportNameFor(name)];
  const button = await loadTwin('button');
  const iconButton = await loadTwin('icon-button');

  for (const sizeKey of ['sm', 'md', 'lg']) {
    const buttonBox = button.variants.size[sizeKey].root.box;
    const ibBox = iconButton.variants.size[sizeKey].root.box;
    // height + corner coherent with Button (the row alignment invariant).
    assert.equal(ibBox.minHeight, buttonBox.minHeight, `icon-button.size.${sizeKey}: minHeight diverged from Button (row-height coherence · P11)`);
    assert.equal(ibBox.radius, buttonBox.radius, `icon-button.size.${sizeKey}: radius diverged from Button (corner coherence · P11)`);
    // the square floor — minWidth must equal THIS row's minHeight (bare → square).
    assert.equal(ibBox.minWidth, ibBox.minHeight, `icon-button.size.${sizeKey}: minWidth must equal minHeight so the bare control floors to a square (P11)`);
  }
});

// ── Guard E · the palette mapping ⊂ its TS SoT (N+19 B2b · decision 65.3 §6 · re-sourced N+40) ──
// The decision-48 discipline applied to the colour namespace: the
// {variant | chrome} → {bg, fg, fgMuted, pressedBg, border} mapping at
// packages/rn/generated/data/palette.ts must always re-derive from the namespace-axis TS SoTs —
// palette-surface.ts (the SURFACE pairs · every variant + chrome bg/fg + the pressed
// swap) + typography-axis.ts (the muted fg). RE-SOURCED at N+40 from the generated
// lib/components/{palette,typography}.css (§74 'Next: final') — one step up the cascade
// so the guard (like the build) stops reading the namespace CSS the A3 carve relocates.
// derivePalette THROWS on any cell↔SoT contradiction (a wrong leaf, a missing/absent
// channel, a stray surface role), so this test fails on the same drift `npm run build`
// fails on; the pinned table below additionally catches a coordinated SoT+build change —
// the operator-settled contract may only move by deliberately updating this pin.
//
// (The B2c·1 pressed-dispatch witness — which cross-checked palette.css's `:active`
// swap against the live Button's button.css `:active` rules — retired with the recipe
// layer · decision 74; the pressedBg is still covered by derivePalette section E +
// the EXPECTED_PALETTE pin.)
const EXPECTED_PALETTE = {
  variant: {
    solid:  { bg: 'accent.solid',    fg: 'accent.onSolid',     pressedBg: 'accent.solidPressed' },
    soft:   { bg: 'chrome.bgStrong', fg: 'chrome.textPrimary', fgMuted: 'chrome.textMuted', pressedBg: 'chrome.bgPressed' },
    ghost:  { bg: 'transparent',     fg: 'chrome.textPrimary', fgMuted: 'chrome.textMuted', pressedBg: 'chrome.bgSubtle' },
    subtle: { fg: 'chrome.borderStrong' },
    outline:{ bg: 'transparent',     fg: 'chrome.textMuted', border: 'chrome.borderSubtle' },
  },
  chrome: {
    canvas: { bg: 'chrome.bgCanvas', fg: 'chrome.textPrimary', fgMuted: 'chrome.textMuted' },
    subtle: { bg: 'chrome.bgSubtle', fg: 'chrome.textPrimary', fgMuted: 'chrome.textMuted' },
    strong: { bg: 'chrome.bgStrong', fg: 'chrome.textPrimary', fgMuted: 'chrome.textMuted' },
    transparent: { bg: 'transparent', fg: 'chrome.textPrimary', fgMuted: 'chrome.textMuted' },
  },
};

test('E · packages/rn/generated/data/palette.ts re-derives from the TS SoT and matches the pinned contract table', async () => {
  const classifiedGroups = classifyAll(readSemanticRules(readProto('styles/tokens-semantic.css')));

  // derivePalette re-reads every SoT and THROWS on drift (a cell pointing
  // at the wrong leaf, a missing channel, a stray surface role, a renamed
  // semantic var) — the call itself is the cell↔SoT guard. The SoTs are
  // loaded the spec-resident way (NOT via the carve-bound loadSurface/loadAxis).
  const cells = derivePalette(
    {
      surface:        await loadAxisSoT('axes/palette-surface.ts', 'surface'),
      typographyAxis: await loadAxisSoT('axes/typography-axis.ts', 'axis'),
    },
    { classifiedGroups },
  );

  // Re-emit must equal the committed build (stale-build / hand-edit guard).
  assert.equal(
    readRn('data/palette.ts'),
    emitPaletteTs(cells),
    'packages/rn/generated/data/palette.ts is stale or hand-edited — run `node scripts/tokens-parser.js`.',
  );

  // The operator-settled contract pin (B2b): a SoT change that flows
  // through to ANY cell fails here even after a re-build.
  assert.deepEqual(cells, EXPECTED_PALETTE, 'palette cells drifted from the B2b contract table');

  // The pressed-dispatch witness (N+19 B2c·1) — which cross-checked palette.css's gated
  // [data-press-color]:active bg swap against the live Button's button.css `:active`
  // rules — RETIRED with the recipe layer (decision 74 · the L3c flip · there is no
  // recipe button.css to witness anymore). The pressed bg is still fully covered:
  // derivePalette section E asserts each surface role's `pressed` against
  // PALETTE_CONTRACT, and EXPECTED_PALETTE pins the pressedBg cells above.
});

// ── Guard F · the FROZEN schema shape (N+19 B3 · decision 65 step 5) ──
// The cross-repo contract IS the schema shape (decision 65 · 65.1 · the
// source-agnostic freeze). B2c·2 (#28) landed it in its final composition form;
// B3 LOCKS it. This guard pins the schema's field vocabularies, leaf/structural
// unions, and the descriptor envelope EXACTLY as packages/spec/components/schema.ts
// declares them, then asserts the source still declares precisely that — "a
// schema-shape test · an enforced freeze, not honorary" (decision 65 step 5).
//
// What it LOCKS: the five namespace field vocabularies (StackNS / BoxNS /
// TypographyNS / PaletteNS / InteractiveNS · field name → declared value type),
// the leaf vocabs (SpaceLeaf / RadiusLeaf member sets · SizeLeaf / TypeKey
// declaration forms), the palette sub-vocabs, and the PartId / El / NS /
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
      // `even` ADDED at the topbar-slots slice (the 2nd post-freeze StackNS add ·
      // the equal-basis-0 edge for true centring · decision 65 "versioned").
      // `hug` ADDED at the trailing-action slice (the 3rd versioned StackNS.fill
      // add · flex:0 0 auto — the no-shrink content floor · alert's AlertButton).
      'fill?': "'grow' | 'grow-shrink' | 'even' | 'hug'",
    },
    // `minWidth` ADDED at P11 (the icon-button slice · the 2nd deliberate
    // post-freeze BoxNS add · decision 65 "post-freeze changes are versioned"):
    // the min-inline-size floor the icon-anchored bare control squares against.
    // `aspectRatio` ADDED at the box-aspect-ratio slice (a deliberate, versioned
    // post-freeze BoxNS add · decision 65 "post-freeze changes are versioned"): the
    // width:height ratio, the first box field backed by a non-px scale (`ratio`).
    BoxNS: {
      'width?': 'SizeLeaf', 'height?': 'SizeLeaf', 'minHeight?': 'SizeLeaf', 'minWidth?': 'SizeLeaf',
      'padding?': 'SpaceLeaf', 'paddingX?': 'SpaceLeaf', 'paddingY?': 'SpaceLeaf',
      'paddingStart?': 'SpaceLeaf', 'paddingEnd?': 'SpaceLeaf',
      'paddingTop?': 'SpaceLeaf', 'paddingBottom?': 'SpaceLeaf', 'radius?': 'RadiusLeaf',
      'radiusTop?': 'RadiusLeaf',
      'aspectRatio?': 'RatioLeaf',
    },
    // DE-FUSED at N+45 (decision 77 · the versioned post-freeze change): two
    // ORTHOGONAL inputs (the fused `${TypeSize}Em` arm of TypeKey is gone · P11).
    // `align` ADDED at the W3 typography-align slice (a deliberate, versioned
    // post-freeze TypographyNS add · decision 65 "post-freeze changes are
    // versioned"): text-axis alignment (`start`/`center`/`end`), distinct from
    // StackNS layout alignment, projected as raw web `[align]` and RN `textAlign`.
    TypographyNS: {
      'size?': 'TypeSize',
      'emphasis?': 'boolean',
      'align?': "'start' | 'center' | 'end'",
      'flow?': "'wrap' | 'truncate'",
      'lines?': '1 | 2 | 3',
    },
    PaletteNS: { 'variant?': 'PaletteVariant', 'accent?': 'Accent', 'muted?': 'boolean', 'chrome?': 'PaletteChrome' },
    InteractiveNS: { 'pressColor?': 'boolean', 'pressScale?': 'boolean', 'disabledOpacity?': 'boolean' },
    EffectNS: { 'elevation?': 'Elevation' },
  },
  // Leaf VOCABULARIES the namespaces reference. Pure string-literal unions are
  // pinned member-for-member (order-insensitive); the two scale-derived leaves
  // are pinned by DECLARATION FORM — their members live in the tokens emit
  // (governed by Guard C / tokens-parser, not the shape freeze).
  leafUnions: {
    SpaceLeaf: ['xs', 'sm', 'md', 'lg', 'xl'],
    RadiusLeaf: ['sm', 'md', 'lg', 'full'],
    Elevation: ['none', 'raised'],
    // `outline` ADDED at the icon-avatar outline slice (PR #130 · the 1st deliberate
    // post-freeze PaletteVariant add · decision 65 "post-freeze changes are versioned"
    // · logged as amendment 65.12): the palette's first BORDER channel (transparent
    // bg · text-muted fg · 1px border-subtle stroke) — closes decision 30's
    // "palette outline = reserved, mapped-not-built".
    PaletteVariant: ['solid', 'soft', 'ghost', 'subtle', 'outline'],
    PaletteChrome: ['canvas', 'subtle', 'strong', 'transparent'],
    InputBehaviourProp: [
      'value',
      'onChangeText',
      'placeholder',
      'inputMode',
      'secureTextEntry',
      'disabled',
      'onFocus',
      'onBlur',
      'accessibilityLabel',
    ],
  },
  // The scale-derived leaves are pinned by DECLARATION FORM. Re-homed at N+61
  // (Slice 3b·2b·i) off build/tokens onto the TS SoTs (../dimensions · ../colours
  // · ../typography) via `keyof typeof import(...)` — same unions, no build/ dep.
  // Their MEMBERS live in the SoTs (governed by the SoTs / tokens-parser, not the
  // shape freeze); the form pin catches a re-home drift or a renamed SoT export.
  leafForms: {
    // N+62 (decision 80): schema.ts moved pipeline/descriptors/ → components/ and the
    // token SoTs pipeline/ → tokens/; the import paths re-homed accordingly (the schema
    // SHAPE — the derived vocab — is unchanged · this pin just tracks the moved path).
    SizeLeaf: "keyof typeof import('../tokens/dimensions').size",
    // RatioLeaf · the box-aspect-ratio slice · scale-derived like SizeLeaf (the FULL
    // `ratio` table IS the vocab · square/card). Members live in the dimensions SoT.
    RatioLeaf: "keyof typeof import('../tokens/dimensions').ratio",
    Accent: "keyof typeof import('../tokens/colours').accent",
    TypeSize: "keyof typeof import('../tokens/typography').type",
    TypeKey: 'TypeSize', // de-fused at N+45 (decision 77) · the `${TypeSize}Em` arm retired
  },
  // Part ids are descriptor-local (Path C · Phase 5). `root` is still the required
  // host convention, but non-root names are validated against each descriptor's
  // anatomy by component-api guards/codegen rather than frozen as one global roster.
  //
  // `pressable` ADDED at the el:'pressable' slice (the 1st deliberate post-freeze
  // `El` add · decision 65 "post-freeze changes are versioned" · logged as
  // amendment 65.13): WHICH JSX host a part renders as is a per-descriptor
  // STRUCTURAL fact, so it moves into the anatomy — the renderers become a pure
  // switch over `el` (RN <Pressable> · web <nuri-pressable>), retiring the RN
  // behaviour-channel sniff and the web interactive-flag sniff. The coherence
  // guard (component-api.test.js Channel 2) pins el:'pressable' ≡ the declared
  // `behaviour.pressable.target` ≡ the `interactive`-flagged parts. This
  // discharges primitives-contract §0.1's "adding one is a versioned Guard-F
  // bump" reservation — 4 El cases now, 4 parity primitives.
  El: ['view', 'text', 'icon', 'pressable', 'input'],
  NS: { 'stack?': 'StackNS', 'box?': 'BoxNS', 'typography?': 'TypographyNS', 'palette?': 'PaletteNS', 'interactive?': 'InteractiveNS', 'effect?': 'EffectNS' },
  ComponentRef: {
    'component': 'string',
    'props?': 'Record<string, string | boolean | number | null>',
  },
  PartAnatomy: {
    'el?': 'El',
    'component?': 'string',
    'props?': "ComponentRef['props']",
    'open?': 'boolean',
    'parts?': "Partial<Record<Exclude<P, 'root'>, PartAnatomy<P>>>",
  },
  // `defaults` (R1.5 per-axis public default) + `decorative` (decision 50 a11y
  // flag) added at N+50 (the web-factory slice · a deliberate, versioned
  // post-freeze envelope add · both DATA the two factories read). `defaults`
  // TIGHTENED (D8 · type-surface honesty) from `Partial<Record<string, string>>`
  // to the per-axis mapped type — its keys/values are now constrained to the
  // descriptor's own axes (a typo'd axis or value is a type error). A type-only
  // change: the emitted twins are byte-identical (the strip drops types).
  //
  // `api` (ComponentApi · REQUIRED) added at Path C · Phase 1 (the component-API
  // arc · docs/archive/component-api-target.md · the 3rd deliberate post-freeze envelope
  // add · decision 65 "post-freeze changes are versioned"). It is the missing
  // schema layer — the descriptor's PUBLIC API as DATA (axes / themeScope /
  // behaviour / propMaps / slots) — so the RN factory stops INVENTING each
  // component's surface from anatomy guesses. Pure data, renderer-ignored this
  // phase (codegen consumes it in Phase 2), so the emitted twins carry it
  // verbatim and every render/snapshot stays byte-identical. `ComponentApi` +
  // `SlotSpec` are pinned as full field-maps below (like NS / PartAnatomy).
  Descriptor: { 'structure': '{ anatomy: PartAnatomy<P>; base?: PartMap<P> }', 'variants?': 'Variants<A, P>', 'defaults?': '{ [Axis in keyof A]?: A[Axis] }', 'decorative?': 'boolean', 'api': 'ComponentApi<P>' },
  // The PUBLIC-API layer (Path C · Phase 1). Field-for-field pins (like NS /
  // PartAnatomy) — a field added/removed/renamed/retyped on either breaks here.
  ComponentApi: {
    'axes': 'string[]',
    'themeScope?': '{ accent: true }',
    'behaviour?': "{ pressable?: { target: P; props: ('onPress' | 'disabled' | 'accessibilityLabel')[] }; input?: { target: P; focusTarget?: P; labelPart?: P; props: InputBehaviourProp[] }; }",
    'propMaps?': '{ selected?: { axis: string; true: string; false: string } }',
    'slots': 'Record<string, SlotSpec<P>>',
  },
  SlotSpec: {
    'part': 'P',
    'kind': "'text' | 'icon-name' | 'node' | 'region' | 'children'",
    'prop?': 'string',
    'default?': 'true',
    'component?': 'true',
    'required?': 'boolean',
    'multiple?': 'boolean',
  },
  aliasForms: {
    PartId: 'string',
    Part: 'PartId',
    PartMap: 'Partial<Record<P, NS>>',
    Axes: 'Record<string, string>',
    Variants: '{ [Axis in keyof A]: { [Value in A[Axis]]: PartMap<P> }; }',
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
  const m = new RegExp(`export type ${name}\\b(?:<[^>]*>)?\\s*=\\s*`).exec(src);
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
  const src = read('components/schema.ts');
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

  // The structural unions (member sets).
  assert.deepEqual(unionMembers(typeRhs(src, 'El')), [...FROZEN_SCHEMA.El].sort(), drift('El'));

  // The composition + anatomy + descriptor envelope (field maps).
  assert.deepEqual(typeFields(typeRhs(src, 'NS')), FROZEN_SCHEMA.NS, drift('the NS composition'));
  assert.deepEqual(typeFields(typeRhs(src, 'ComponentRef')), FROZEN_SCHEMA.ComponentRef, drift('ComponentRef'));
  assert.deepEqual(typeFields(typeRhs(src, 'PartAnatomy')), FROZEN_SCHEMA.PartAnatomy, drift('PartAnatomy'));
  assert.deepEqual(typeFields(typeRhs(src, 'Descriptor')), FROZEN_SCHEMA.Descriptor, drift('the Descriptor envelope'));

  // The PUBLIC-API layer (Path C · Phase 1 · the 3rd post-freeze envelope add).
  assert.deepEqual(typeFields(typeRhs(src, 'ComponentApi')), FROZEN_SCHEMA.ComponentApi, drift('the ComponentApi shape'));
  assert.deepEqual(typeFields(typeRhs(src, 'SlotSpec')), FROZEN_SCHEMA.SlotSpec, drift('the SlotSpec shape'));

  // The remaining structural alias forms (PartMap · Axes · Variants).
  for (const [name, pinned] of Object.entries(FROZEN_SCHEMA.aliasForms)) {
    assert.equal(normType(typeRhs(src, name)), normType(pinned), drift(`alias ${name}`));
  }
});
