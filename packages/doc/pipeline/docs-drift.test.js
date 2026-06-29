/* ──────────────────────────────────────────────────────────────
 * NURI · @nuri/doc · DOC-GEN DRIFT GUARD (Guard G · N+22 · decision 66 arc #1 ·
 * moved + re-sourced N+42 · A4)
 *
 * The §35 discipline (committed build re-emits identically) applied to the
 * doc-gen: generated/components/<source>.md is RENDERED from the descriptor IR
 * (read-only · decision 2 STANDS for the doc · we EMIT docs, generate NO CSS)
 * by pipeline/docs.js. The re-emit identity is the stale-build / hand-edit guard;
 * the per-page pins lock the contract — a future emitter change that drops the
 * front-matter, the authored-story include slot, a data section, or the N+23
 * VALUE enrichment breaks HERE, not only at `git diff --exit-code generated/`.
 *
 * Guard G TRAVELLED with the emitter at A4 (it was sibling to @nuri/spec's
 * docs-drift.test.js · Guards A/C/D/E/F STAY in @nuri/spec — they guard the
 * descriptor / palette / schema / count surfaces). RE-SOURCED onto @nuri/spec's
 * DATA exports (the boundary · convergence §5): the page OUTPUT is a pure
 * function of (ir · palette · tokens · colors), all read from @nuri/spec DATA via
 * the SAME builder the doc build feeds (buildDocTokenInputs over @nuri/spec/tokens
 * + /token-vars · palette from @nuri/spec/palette · the descriptor twins) — NOT
 * the classifier / derivePalette the pre-A4 guard ran. So the re-emit matches
 * byte-for-byte.
 * ────────────────────────────────────────────────────────────── */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { loadSpecData, loadDataFromPath } from './strip.js';
import { docIrFromDescriptor, exportNameFor, DOC_COMPONENTS } from './descriptor-ir.js';
import { AXIS_DOCS } from './axis-ir.js';
import { FOUNDATION_DOCS } from './foundations-ir.js';
import { emitDocPage, emitAxisPage, emitFoundationPage, buildDocTokenInputs, makeRoleResolver } from './docs.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DOC_ROOT = resolve(__dirname, '..');
// The generated artifacts left @nuri/spec for the two projections at N+62 (decision 80):
// the RN contract (tokens · palette → @nuri/rn/generated/), the web output (descriptor
// twins · token-vars → @nuri/prototype/generated/). Read from the owning projection.
const RN_GENERATED = resolve(__dirname, '../../rn/generated');
const PROTO_GENERATED = resolve(__dirname, '../../prototype/generated');
const SPEC_DESCRIPTORS = resolve(PROTO_GENERATED, 'descriptors');
const readGenerated = (source) =>
  readFileSync(resolve(DOC_ROOT, 'generated/components', `${source}.md`), 'utf8');
const readAxis = (source) =>
  readFileSync(resolve(DOC_ROOT, 'generated/axes', `${source}.md`), 'utf8');
const readFoundation = (source) =>
  readFileSync(resolve(DOC_ROOT, 'generated/foundations', `${source}.md`), 'utf8');

// The re-pathed provenance header (the N+42 → A4b carry · decision 75): the emitter
// moved OUT of @nuri/spec at A4, so every generated page now cites the @nuri/doc home.
// Pinned so a regression to the stale `@nuri/spec` path fails HERE, not only at the
// byte gate.
const REPATHED_HEADER = 'emitter: packages/doc/pipeline/docs.js · re-emit: `npm run build -w @nuri/doc`';

// Per-page contract (N+23): front-matter title/nav · the authored `## Example`
// include · the data sections · the 2-column split (the resolved value in its
// OWN "Resolves to" column beside the "Token" composition · operator request) ·
// and ≥1 ENRICHED value cell exercising each format (geometry px · the type
// composite · the live var() swatch + hex · the em-dash for a literal/flag). The
// enriched cells are the FAITHFUL R1.5 surface — icon-avatar's `subtle` fg-only
// variant + radius.full (the 9999px sentinel) · topbar's MIXED stack (literals →
// em-dash, gap → px) + a region edge's all-literal `even`-flex stack (no axes now ·
// the token map is empty). A deliberate emitter change must update these pins.
const PAGE_CONTRACT = {
  'composition-button': {
    source: 'button', title: 'Button', nav: 1,
    cells: [
      // colour · the live var() swatch + the default-scope hex in the VALUE column
      '| `variant` | `solid` | `root` | `palette` | **bg** `accent.solid`<br>**fg** `accent.onSolid`<br>**pressed** `accent.solidPressed` | <span class="nuri-doc-swatch" style="background:var(--nuri-accent-solid)"></span> `#12110b`<br><span class="nuri-doc-swatch" style="background:var(--nuri-accent-on-solid)"></span> `#f0eee3`<br><span class="nuri-doc-swatch" style="background:var(--nuri-accent-solid-pressed)"></span> `#242319` |',
      // geometry · the resolved px in the value column
      '| `size` | `lg` | `root` | `box` | **minHeight** `size.xl`<br>**paddingX** `space.xl`<br>**radius** `radius.full` | `54px`<br>`24px`<br>`9999px` |',
      // typography · the two orthogonal inputs (size + emphasis · decision 77) in the
      // Token column, the resolved composite in the Value column (weight 600 = the
      // emphasisWeight override · computed-equivalent with the old fused `mdEm`)
      '| `size` | `md` | `label` | `typography` | **size** `md`<br>**emphasis** `true` | **fontSize** `17`<br>**lineHeight** `1.29`<br>**weight** `600`<br>**letterSpacing** `-0.02` |',
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
      // a region edge · the `even` flex (the topbar-slots slice · true centring) ·
      // all-literal stack → every value-column cell the em-dash
      '| `leading` | `stack` | **direction** `row`<br>**align** `center`<br>**fill** `even` | —<br>—<br>— |',
    ],
  },
};

test('G · each generated/components/*.md re-emits identically from its descriptor', async () => {
  // The value-bearing inputs — re-sourced onto @nuri/spec DATA (the boundary):
  // @nuri/spec/tokens (the resolved cross-product + px scales + type composite) +
  // @nuri/spec/token-vars (the colour var registry) → buildDocTokenInputs; the
  // palette cells from @nuri/spec/palette (build/palette.ts · the data export ·
  // NOT re-derived from the axis SoTs the way the pre-A4 spec-resident guard did).
  const specTokens = await loadDataFromPath(resolve(RN_GENERATED, 'tokens.ts'));
  const { tokenVars } = await loadDataFromPath(resolve(PROTO_GENERATED, 'token-vars.ts'));
  const { palette } = await loadDataFromPath(resolve(RN_GENERATED, 'palette.ts'));
  const { tokens, colors } = buildDocTokenInputs(specTokens, tokenVars);

  // Re-emit must equal the committed page (stale-build / hand-edit guard). The doc
  // IR is sourced from the AUTHORED descriptor (decision 69 · the SoT), via the
  // browser-ESM twin (node cannot import the .ts SoT) — NOT re-derived from CSS.
  for (const spec of DOC_COMPONENTS) {
    const twin = pathToFileURL(resolve(SPEC_DESCRIPTORS, `${spec.name}.js`)).href;
    const descriptor = (await import(twin))[exportNameFor(spec.name)];
    const ir = docIrFromDescriptor(spec, descriptor);
    assert.equal(
      readGenerated(spec.source),
      emitDocPage(ir, { palette, tokens, colors }),
      `generated/components/${spec.source}.md is stale or hand-edited — run \`npm run build -w @nuri/doc\`.`,
    );
  }

  // The per-page contract pins (a deliberate emitter change must update these).
  for (const spec of DOC_COMPONENTS) {
    const contract = PAGE_CONTRACT[spec.name];
    if (!contract) continue;
    const md = readGenerated(contract.source);
    assert.match(
      md,
      new RegExp(`^---\\ntitle: ${contract.title}\\nlayout: default\\nnav_order: ${contract.nav}\\n---`),
      `${contract.source}.md: the just-the-docs front-matter drifted`,
    );
    assert.ok(
      md.includes(REPATHED_HEADER),
      `${contract.source}.md: the provenance header is not re-pathed to the @nuri/doc home (the N+42 → A4b carry)`,
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

// ════════════════════════════════════════════════════════════════════
// The AXIS family (N+43 · A4b) — the 5 namespace-axis pages re-emit ≡ committed.
// ════════════════════════════════════════════════════════════════════
// Per-page contract (the load-bearing surface a deliberate emitter change must
// update): front-matter title/nav · the re-pathed header · the axis's natural shape
// — the box/stack spelling table (input → web/rn + value-source · the locked grammar
// header · incl. the mechanism-divergent `fill`/expand `—`) · the palette role table
// with RESOLVING swatches (the live var() + role + default-scope hex · the fg-only
// `subtle` em-dash) · the interactive agnostic opt-in set + the demoted web-only chrome
// (the order note a chrome caption · §76) · the typography wrapper dispatch (muted + align).
const AXIS_CONTRACT = {
  stack: {
    nav: 1, title: 'Stack', section: '## Fields',
    cells: [
      // the spelling table: input → web/rn + the keyword value-source map
      '| `align` | `align-items` | `alignItems` | `start` → `flex-start`<br>`center` → `center`<br>`end` → `flex-end`<br>`stretch` → `stretch`<br>`baseline` → `baseline` |',
      // the mechanism-divergent expand arm (fill · no registry entry · rn → em-dash) ·
      // `even` (the topbar-slots slice · the equal-basis-0 edge for true centring)
      '| `fill` | `flex` | — | `grow` → `flexGrow: 1` · `flexShrink: 0`<br>`grow-shrink` → `flexGrow: 1` · `flexShrink: 1` · `minWidth: 0`<br>`even` → `flexGrow: 1` · `flexShrink: 1` · `flexBasis: 0` · `minWidth: 0` |',
    ],
    includes: ['| Input | Web | RN | Value |'], // the locked grammar (CSS → Web · the N+47 rename)
  },
  box: {
    nav: 2, title: 'Box', section: '## Fields',
    cells: [
      // the canonical-id → per-target spelling (logical web · de-logicalized RN)
      '| `paddingX` | `padding-inline` | `paddingHorizontal` | `space` scale |',
      '| `radius` | `border-radius` | `borderRadius` | `radius` scale |',
    ],
    includes: ['| Input | Web | RN | Value |'], // the locked grammar (CSS → Web · the N+47 rename)
  },
  palette: {
    nav: 3, title: 'Palette', section: '## Variant',
    cells: [
      // a resolving swatch (live var() + role NAME + default-scope hex · all 3 channels)
      '| `soft` | <span class="nuri-doc-swatch" style="background:var(--nuri-bg-strong)"></span> `bg-strong` `#f3f1e2` | <span class="nuri-doc-swatch" style="background:var(--nuri-text-primary)"></span> `text-primary` `#222013` | <span class="nuri-doc-swatch" style="background:var(--nuri-bg-pressed)"></span> `bg-pressed` `#ece9da` |',
      // the fg-only `subtle` (absent bg + pressed → the em-dash)
      '| `subtle` | — | <span class="nuri-doc-swatch" style="background:var(--nuri-border-strong)"></span> `border-strong` `#bfbcac` | — |',
    ],
    includes: ['## Chrome'], // the second dispatch table (variant XOR chrome)
  },
  interactive: {
    // RE-SOURCED (§76 · the fan-out) off the deleted `effects` bridge onto opts/webChrome/
    // webOrder — the agnostic `## Effects` opt-in table (the locked grammar) + the demoted
    // web-only `## Chrome` section. The load-bearing order note demoted to a chrome caption.
    nav: 4, title: 'Interactive', section: '## Effects',
    cells: [
      // the agnostic opt-in: assembled web selector → decl · the RN realization · the gate
      '| `pressScale` | `.nuri-interactive[data-press-scale]:active` → `transform: scale(var(--nuri-interaction-press-scale))` | `transform: [{ scale }] ← interaction.pressScale` | opt-in · `[data-press-scale]` |',
      // pressColor's Web is a palette cross-ref (its :active bg-swap is palette's rule)
      '| `pressColor` | → palette (`:active` bg swap) | `backgroundColor ← pressedBg` | opt-in · `[data-press-color]` |',
      // disabledOpacity · automatic gate · the multi-selector web rule
      '| `disabledOpacity` | `.nuri-interactive:disabled, .nuri-interactive[aria-disabled="true"]` → `opacity: var(--nuri-interaction-disabled-opacity)` | `opacity ← interaction.disabledOpacity` | automatic |',
    ],
    // the locked agnostic grammar header + the demoted web-only chrome section; the
    // disabledGuard chrome row + the demoted order caption (NOT the old top-level note).
    includes: [
      '| Input | Web | RN | Value |',
      '## Chrome',
      '| `disabledGuard` | `.nuri-interactive[aria-disabled="true"]:active` | `transform: none` |',
      'both set `transform` at equal specificity',
    ],
  },
  typography: {
    // RE-POINTED (decision 77 · the de-fusion) — the PRIMARY section is now the agnostic
    // `size` type-step axis (the Input|Web|RN grammar this spike LOCKS for the fan-out);
    // the wrapper is demoted to a web-only prose section.
    nav: 5, title: 'Typography', section: '## Size',
    cells: [
      // the size axis (the spike): the type step → web [data-type-style] / RN typeStyle,
      // the Value a REFERENCE to the type scale (Foundations · A4c · not restated).
      "| `md` | `[data-type-style=\"md\"]` | `typeStyle('md')` | `type` scale |",
      "| `3xl` | `[data-type-style=\"3xl\"]` | `typeStyle('3xl')` | `type` scale |",
      // the orthogonal emphasis boolean — ONE row (the de-fusion's whole point ·
      // contrast the old fused `mdEm`): the data-attr presence rule / typeStyle's 2nd arg.
      "| `emphasis` | `[data-type-emphasis]` | `typeStyle(size, true)` | semibold |",
      // the web-only wrapper dispatch (secondary · unchanged): the reflected-boolean
      // muted (theme-cascaded chrome token) + a plain prop-driven align.
      '| `muted` | `nuri-typography[data-muted]` | `color: var(--nuri-text-muted)` |',
      '| `alignCenter` | `nuri-typography[align="center"]` | `display: block`<br>`text-align: center` |',
    ],
    // the locked agnostic grammar header (the spike · the fan-out adopts it) + the
    // orthogonal emphasis section + the demoted web-only wrapper section.
    includes: ['| Input | Web | RN | Value |', '## Emphasis', '## Wrapper'],
  },
};

test('G · each generated/axes/*.md re-emits identically from its axis SoT', async () => {
  // The axis-doc data bag — the SAME SoTs build.js feeds, read via strip.js (NOT
  // spec's pipeline functions · the boundary · convergence §5 · decision 75). The
  // palette role resolver reuses the N+22 colour resolver (makeRoleResolver).
  const { STACK_FIELDS, BOX_FIELDS } = await loadSpecData('resolve-map');
  const { PROPERTY_SPELLING } = await loadSpecData('property-spelling');
  const { surface } = await loadSpecData('palette-surface');
  const { opts, webChrome, webOrder } = await loadSpecData('interactive-effects');
  const { axis } = await loadSpecData('typography-axis');
  const specTokens = await loadDataFromPath(resolve(RN_GENERATED, 'tokens.ts'));
  const { tokenVars } = await loadDataFromPath(resolve(PROTO_GENERATED, 'token-vars.ts'));
  const d = {
    stackFields: STACK_FIELDS,
    boxFields: BOX_FIELDS,
    registry: PROPERTY_SPELLING,
    surface,
    opts,
    webChrome,
    webOrder,
    axis,
    typeSizes: Object.keys(specTokens.type), // the 6 type-step sizes (the `size` axis · decision 77)
    roleColor: makeRoleResolver(specTokens, tokenVars),
  };

  // Re-emit must equal the committed page (stale-build / hand-edit guard). The IR is
  // a pure function of the AUTHORED axis SoT (decision 67 · the bespoke single source).
  for (const entry of AXIS_DOCS) {
    const ir = entry.build(d);
    assert.equal(
      readAxis(entry.source),
      emitAxisPage(ir, { nav: entry.nav, src: entry.src, lead: entry.lead }),
      `generated/axes/${entry.source}.md is stale or hand-edited — run \`npm run build -w @nuri/doc\`.`,
    );
  }

  // The per-page contract pins (a deliberate emitter change must update these).
  for (const entry of AXIS_DOCS) {
    const contract = AXIS_CONTRACT[entry.source];
    if (!contract) continue;
    const md = readAxis(entry.source);
    assert.match(
      md,
      new RegExp(`^---\\ntitle: ${contract.title}\\nlayout: default\\nnav_order: ${contract.nav}\\n---`),
      `axes/${entry.source}.md: the just-the-docs front-matter drifted`,
    );
    assert.ok(
      md.includes(REPATHED_HEADER),
      `axes/${entry.source}.md: the provenance header is not re-pathed to the @nuri/doc home (the N+42 → A4b carry)`,
    );
    assert.ok(
      md.includes(`\n${contract.section}\n`),
      `axes/${entry.source}.md: missing the '${contract.section}' section`,
    );
    for (const cell of contract.cells) {
      assert.ok(
        md.includes(cell),
        `axes/${entry.source}.md: a load-bearing cell rendering drifted —\n  expected substring: ${cell}`,
      );
    }
    for (const inc of contract.includes || []) {
      assert.ok(
        md.includes(inc),
        `axes/${entry.source}.md: missing expected content —\n  expected substring: ${inc}`,
      );
    }
  }
});

// ════════════════════════════════════════════════════════════════════
// The FOUNDATIONS family (N+48 · A4c) — the token-vocabulary pages re-emit ≡
// committed. CLOSES decision 75's 3-family set (Components ✓ · Axes ✓ · Foundations).
// ════════════════════════════════════════════════════════════════════
// Per-page contract (the load-bearing surface a deliberate emitter change must update):
// front-matter title/nav · the re-pathed header · each subject's natural shape —
// the dimension cascade (leaf → the `px-N` primitive → the resolved px · the literal
// sentinel for the off-scale 0 / 9999) · the colour PRIMITIVE literal swatches (theme-
// fixed · light/dark · incl. lilac's frozen step + an alpha overlay) · the colour
// SEMANTIC role matrix (the `{ref}` cascade pointer + a live var() swatch + the default-
// scope hex · incl. the INVERSE accent-solid) · the typography composite (the de-fused
// shape · decision 77 · 6 sizes + the orthogonal emphasis weight · NOT the old `Em` twins).
const FOUNDATION_CONTRACT = {
  'colour-primitive': {
    title: 'Colour Primitive', nav: 1, section: '## Neutral (cream)',
    cells: [
      // a themed literal swatch row (cream step 1 · light + dark · theme-FIXED literals)
      '| `1` | <span class="nuri-doc-swatch" style="background:#fffdf2"></span> `#fffdf2` | <span class="nuri-doc-swatch" style="background:#12110b"></span> `#12110b` |',
      // lilac's FROZEN step 9 (light === dark · the brand keeps identity · P4)
      '| `9` | <span class="nuri-doc-swatch" style="background:#beaaff"></span> `#beaaff` | <span class="nuri-doc-swatch" style="background:#beaaff"></span> `#beaaff` |',
      // an alpha overlay (theme-invariant · one column · the rgba spelled verbatim)
      '| `5` | <span class="nuri-doc-swatch" style="background:rgba(0, 0, 0, 0.30)"></span> `rgba(0, 0, 0, 0.30)` |',
    ],
    includes: ['## Lilac', '## Black alpha', '## White alpha'],
  },
  'colour-semantic': {
    title: 'Colour Semantic', nav: 2, section: '## Chrome',
    cells: [
      // a semantic role → the cascade ref + a LIVE var() swatch + the default-scope hex
      '| `bg-canvas` | `neutral.1.light` | <span class="nuri-doc-swatch" style="background:var(--nuri-bg-canvas)"></span> `#fffdf2` |',
      // the INVERSE accent-solid (light arm points across to neutral.1.dark · near-black CTA)
      '| `accent-solid` | `neutral.1.dark` | <span class="nuri-doc-swatch" style="background:var(--nuri-accent-solid)"></span> `#12110b` |',
    ],
    includes: ['## Accent', '| Role | Cascade | Resolves to |'],
  },
  dimension: {
    title: 'Dimension', nav: 3, section: '## Primitives',
    cells: [
      // a px primitive (key == px · decision 32)
      '| `px-12` | `12px` |',
      // the cascade row: a leaf → the px-N primitive it references → the resolved px
      '| `space.md` | `px-12` | `12px` |',
      // the off-scale literal sentinel (radius.full · 9999 · no px backing by design)
      '| `radius.full` | `literal` | `9999px` |',
    ],
    includes: ['## Space', '## Size', '## Radius', '| Token | Cascade | Value |'],
  },
  typography: {
    title: 'Typography', nav: 4, section: '## Scale',
    cells: [
      // the type-step composite (the resolved DATA projection · units in the header)
      '| `md` | `17` | `1.29` | `400` | `-0.02` |',
    ],
    // the de-fused emphasis shape (decision 77 · ONE orthogonal weight · NOT a per-size step)
    includes: ['## Emphasis', "every step's weight to `600`", '| Step | Font size (px) | Line height | Weight | Letter spacing (em) |'],
  },
};

test('G · each generated/foundations/*.md re-emits identically from its token SoT', async () => {
  // The foundations-doc data bag — the SAME SoTs build.js feeds, read via strip.js (the
  // additive ./dimensions + ./colours exports · NEVER spec's pipeline functions · the
  // boundary · convergence §5 · decision 75). The resolved px scales + the role resolver
  // come from the SAME buildDocTokenInputs / makeRoleResolver the component/axis pages use.
  const dimensions = await loadSpecData('dimensions');
  const colours = await loadSpecData('colours');
  const specTokens = await loadDataFromPath(resolve(RN_GENERATED, 'tokens.ts'));
  const { tokenVars } = await loadDataFromPath(resolve(PROTO_GENERATED, 'token-vars.ts'));
  const { tokens } = buildDocTokenInputs(specTokens, tokenVars);
  const d = {
    dimensions,
    colours,
    tokens,
    roleColor: makeRoleResolver(specTokens, tokenVars),
  };

  // Re-emit must equal the committed page (stale-build / hand-edit guard). The IR is a
  // pure function of the AUTHORED token SoT (decision 70 · the cascade · TS source).
  for (const entry of FOUNDATION_DOCS) {
    const ir = entry.build(d);
    assert.equal(
      readFoundation(entry.source),
      emitFoundationPage(ir, { nav: entry.nav, src: entry.src, lead: entry.lead }),
      `generated/foundations/${entry.source}.md is stale or hand-edited — run \`npm run build -w @nuri/doc\`.`,
    );
  }

  // The per-page contract pins (a deliberate emitter change must update these).
  for (const entry of FOUNDATION_DOCS) {
    const contract = FOUNDATION_CONTRACT[entry.source];
    if (!contract) continue;
    const md = readFoundation(entry.source);
    assert.match(
      md,
      new RegExp(`^---\\ntitle: ${contract.title}\\nlayout: default\\nnav_order: ${contract.nav}\\n---`),
      `foundations/${entry.source}.md: the just-the-docs front-matter drifted`,
    );
    assert.ok(
      md.includes(REPATHED_HEADER),
      `foundations/${entry.source}.md: the provenance header is not re-pathed to the @nuri/doc home (the A4 carry)`,
    );
    assert.ok(
      md.includes(`\n${contract.section}\n`),
      `foundations/${entry.source}.md: missing the '${contract.section}' section`,
    );
    for (const cell of contract.cells) {
      assert.ok(
        md.includes(cell),
        `foundations/${entry.source}.md: a load-bearing cell rendering drifted —\n  expected substring: ${cell}`,
      );
    }
    for (const inc of contract.includes || []) {
      assert.ok(
        md.includes(inc),
        `foundations/${entry.source}.md: missing expected content —\n  expected substring: ${inc}`,
      );
    }
  }
});
