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
 * Sibling to tokens-parser.test.js (kept separate so its
 * "19 of 19" assertion count stays stable · N+12a). Run with:
 *   node --test pipeline/docs-drift.test.js
 * or via the glob in `npm test`.
 *
 * Five guards (A–C · ship-list item 5 · N+12a · D · N+19 · decision 65.2
 * · E · N+19 B2b · decision 65.3 §6):
 *   A · every pages/components/*.html is listed in llms.txt
 *   B · every build/components/*.ts is named in README + impl-guide
 *   C · doc-stated emitted counts match the live build artefacts
 *   D · each build/descriptors/*.ts re-emits identically from its live
 *       sources (the @layer CSS mapping + the page data-part structure),
 *       and the 65.2 validated shapes are pinned — a renamed/removed
 *       part, variant, or token breaks the test (the TokenPath discipline
 *       applied to the descriptor).
 *   E · build/palette.ts re-emits identically from the palette CSS SoT
 *       (palette.css + the recipe CSS the cells are asserted against),
 *       and the operator-settled contract table is pinned — a cell that
 *       contradicts the CSS fails here (and the build · decision 48).
 * ────────────────────────────────────────────────────────────── */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve, basename } from 'node:path';
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
const REPO_ROOT = resolve(__dirname, '..');

const read = (rel) => readFileSync(resolve(REPO_ROOT, rel), 'utf8');
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
  const llms = read('llms.txt');
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

// ── Guard B · build/components ⊂ README ∩ impl-guide ──────────────
test('B · every build/components/*.ts is named in README + impl-guide', () => {
  const readme = read('README.md');
  const guide = read('pages/implementation-guide.html');
  const comps = listFiles('build/components', '.ts').map((f) => basename(f, '.ts'));
  assert.ok(comps.length > 0, 'expected at least one build/components file');

  const missingReadme = comps.filter((c) => !readme.includes(c));
  const missingGuide = comps.filter((c) => !guide.includes(c));

  assert.deepEqual(
    missingReadme,
    [],
    `README.md manifest omits build/components file(s): ${missingReadme.join(', ')}.`,
  );
  assert.deepEqual(
    missingGuide,
    [],
    `implementation-guide.html manifest omits build/components file(s): ${missingGuide.join(', ')}.`,
  );
});

// ── Guard C · doc-stated counts == live build ────────────────────
test('C · doc-stated emitted counts match the live build', () => {
  // Live truths derived from the emitted artefacts.
  const tokenPathMembers = (read('build/token-paths.ts').match(/^\s+\| '/gm) || []).length;
  const iconCount = (read('build/icons.ts').match(/^\s+\| '/gm) || []).length;
  const componentFiles = listFiles('build/components', '.ts').length;

  const llms = read('llms.txt');
  const readme = read('README.md');
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

  // per-component file count.
  assert.equal(
    extractCount(llms, /TokenPath references · (\d+) files:/, 'llms.txt component-file count'),
    componentFiles,
    'llms.txt component-file count drifted from build/components/',
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

// ── Guard D · descriptors ⊂ their live sources (decision 65.2 · R-EXPO-6) ──
// The TokenPath discipline (decision 34) applied to the per-component
// descriptor: the emitted contract must always re-derive from its two
// sources — the @layer CSS (mapping · the 65.1 bootstrap) and the page
// data-part anatomy (structure · decision 24.1). A renamed/removed part,
// variant, or token breaks the build (deriveDescriptor throws) AND this
// test; the pinned shapes catch a dropped axis value even if the build was
// re-emitted. The 65.2 validated shapes (the spike's three components).
const EXPECTED_DESCRIPTORS = {
  'composition-button': {
    axes: { variant: ['solid', 'soft', 'ghost'], size: ['sm', 'md', 'lg'] },
    parts: ['label'], // non-root parts the $parts overlay targets
    compoundVariants: 5, // 3× pressed colour + pressScale + disabledOpacity
  },
  'icon-avatar': {
    axes: { variant: ['solid', 'soft', 'ghost', 'subtle'] },
    parts: ['icon'],
    compoundVariants: 0, // static · "no interaction" by omission (65.2)
  },
  topbar: {
    axes: { center: ['false', 'true'] },
    parts: ['content'], // center lands 100% on the content pivot
    compoundVariants: 0,
  },
};

// Every non-root part the descriptor's `$parts` overlay touches.
function partsTargetedBy(ir) {
  const names = new Set();
  for (const axis of Object.keys(ir.variants)) {
    for (const value of Object.keys(ir.variants[axis])) {
      for (const p of Object.keys(ir.variants[axis][value].parts || {})) names.add(p);
    }
  }
  for (const cv of ir.compoundVariants || []) {
    for (const p of Object.keys((cv.styles && cv.styles.parts) || {})) names.add(p);
  }
  return [...names];
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
    // token pointing at the wrong chrome/accent leaf (surfaceExpr), a routed
    // part absent from the page anatomy (assertPart), or an unknown variant
    // modifier (assertCovered). So this call itself is the token/part/variant guard.
    const ir = deriveDescriptor(spec, { css, html });

    // Re-emit must equal the committed build (stale-build / hand-edit guard).
    assert.equal(
      read(`build/descriptors/${spec.name}.ts`),
      emitDescriptorTs(ir),
      `build/descriptors/${spec.name}.ts is stale or hand-edited — run \`npm run build\`.`,
    );

    // The 65.2 frozen-shape pins: a renamed/removed axis value, $parts target,
    // or compound breaks here EVEN IF the build was re-emitted — a deliberate
    // contract change must update this guard.
    const expected = EXPECTED_DESCRIPTORS[spec.name];
    assert.ok(expected, `[docs-drift] no pinned shape for descriptor '${spec.name}'`);
    assert.deepEqual(ir.axes, expected.axes, `${spec.name}: axis values drifted from the 65.2 shape`);
    assert.deepEqual(
      partsTargetedBy(ir).sort(),
      [...expected.parts].sort(),
      `${spec.name}: $parts targets drifted from the 65.2 shape`,
    );
    assert.equal(
      (ir.compoundVariants || []).length,
      expected.compoundVariants,
      `${spec.name}: compoundVariants count drifted from the 65.2 shape`,
    );

    // Every $parts target is a page-declared part (decision 24.1 · the
    // structure source); `root` is the implicit host.
    const declared = new Set(['root', ...pageParts(html)]);
    for (const p of partsTargetedBy(ir)) {
      assert.ok(
        declared.has(p),
        `${spec.name}: $parts targets '${p}' absent from the page anatomy (${[...declared].join(', ')})`,
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
