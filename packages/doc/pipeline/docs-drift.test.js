/* ──────────────────────────────────────────────────────────────
 * NURI · @nuri/doc · DOC-GEN DRIFT GUARD (Guard G · N+22 · decision 66 arc #1 ·
 * moved + re-sourced N+42 · A4)
 *
 * The §35 discipline (committed build re-emits identically) applied to the
 * doc-gen: generated/components/<source>.md is RENDERED by pipeline/docs.js from
 * the RN public prop type for each documented component-like surface. The re-emit
 * identity is the stale-build / hand-edit guard;
 * the per-page pins lock the contract — a future emitter change that drops the
 * front-matter, an API table, or the source prop surface breaks HERE, not only at
 * `git diff --exit-code generated/`.
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
import { fileURLToPath } from 'node:url';

import { loadSpecData, loadDataFromPath } from './strip.js';
import { COMPONENT_API_DOCS, componentApiIrFromFile } from './component-api-ir.js';
import { AXIS_DOCS } from './axis-ir.js';
import { FOUNDATION_DOCS } from './foundations-ir.js';
import { emitComponentApiPage, emitAxisPage, emitFoundationPage, buildDocTokenInputs, makeRoleResolver } from './docs.js';
import { interactiveWebProjection } from '../../prototype/pipeline/parsers/interactive-css.js';
import { typographyWebProjection } from '../../prototype/pipeline/parsers/typography-css.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '../../..');
const DOC_ROOT = resolve(__dirname, '..');
// The generated artifacts left @nuri/spec for the two projections at N+62 (decision 80):
// the RN contract (tokens · palette → @nuri/rn/generated/), the web output (descriptor
// twins · token-vars → @nuri/prototype/generated/). Read from the owning projection.
const RN_GENERATED = resolve(__dirname, '../../rn/generated');
const PROTO_GENERATED = resolve(__dirname, '../../prototype/generated');
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

// Per-page contract: every component page is API-only, sourced from an RN public
// prop type. Pins keep the generator honest without making prose a second source.
const PAGE_CONTRACT = {
  button: {
    kind: 'api', source: 'button', title: 'Button', nav: 1,
    cells: [
      '### ButtonProps',
      "| `variant` | no | `'solid' | 'soft' | 'ghost'` | style axis |",
      "| `size` | no | `'sm' | 'md' | 'lg'` | style axis |",
      "| `accent` | no | `'neutral' | 'lilac' | 'orange'` | theme scope |",
      '| `onPress` | no | `() => void` | pressable behaviour |',
      '| `disabled` | no | `boolean` | pressable behaviour |',
      '| `accessibilityLabel` | no | `string` | pressable behaviour |',
      '| `children` | no | `React.ReactNode` | default content slot |',
      '### ButtonTextProps',
      '| `children` | no | `React.ReactNode` | slot content |',
      '### ButtonIconProps',
      '| `name` | yes | `IconName` | scalar icon name |',
      '> `children` is not accepted (`children?: never`).',
    ],
    excludes: ['## Example', '## Anatomy', '## Base', '## Token map'],
  },
  'icon-button': {
    kind: 'api', source: 'icon-button', title: 'Icon Button', nav: 2,
    cells: [
      "| `variant` | no | `'solid' | 'soft' | 'ghost'` | style axis |",
      '| `icon` | yes | `IconName` | scalar icon name |',
      '> `children` is not accepted (`children?: never`).',
    ],
    excludes: ['## Example', '## Anatomy', '## Base', '## Token map'],
  },
  'icon-avatar': {
    kind: 'api', source: 'icon-avatar', title: 'Icon Avatar', nav: 3,
    cells: [
      "| `variant` | no | `'solid' | 'soft' | 'ghost' | 'subtle'` | style axis |",
      "| `accent` | no | `'neutral' | 'lilac' | 'orange'` | theme scope |",
      '| `icon` | yes | `IconName` | scalar icon name |',
      '> `children` is not accepted (`children?: never`).',
    ],
    excludes: ['## Example', '## Anatomy', '## Base', '## Token map', '`onPress`', '`disabled`', '`accessibilityLabel`'],
  },
  'tab-bar': {
    kind: 'api', source: 'tab-bar', title: 'Tab Bar', nav: 4,
    cells: [
      "| `accent` | no | `'neutral' | 'lilac' | 'orange'` | theme scope |",
      '| `children` | no | `React.ReactNode` | default content slot |',
    ],
    excludes: ['## Example', '## Anatomy', '## Base', '## Token map'],
  },
  'tab-bar-item': {
    kind: 'api', source: 'tab-bar-item', title: 'Tab Bar Item', nav: 5,
    cells: [
      '| `selected` | no | `boolean` | state axis |',
      '| `label` | no | `string` | scalar label |',
      '> `children` is not accepted (`children?: never`).',
    ],
    excludes: ['## Example', '## Anatomy', '## Base', '## Token map'],
  },
  topbar: {
    kind: 'api', source: 'topbar', title: 'Topbar', nav: 6,
    cells: [
      "| `accent` | no | `'neutral' | 'lilac' | 'orange'` | theme scope |",
      '| `children` | no | `React.ReactNode` | default content slot |',
    ],
    excludes: ['## Example', '## Anatomy', '## Base', '## Token map'],
  },
  stack: {
    kind: 'api', source: 'stack', title: 'Stack', nav: 7,
    cells: [
      "| `direction` | no | `'row' | 'column'` | style axis |",
      "| `gap` | no | `'xs' | 'sm' | 'md' | 'lg' | 'xl'` | style axis |",
      "| `fill` | no | `'grow' | 'grow-shrink' | 'even'` | style axis |",
      '| `children` | no | `React.ReactNode` | default content slot |',
    ],
    excludes: ['## Example', '## Anatomy', '## Base', '## Token map'],
  },
  view: {
    kind: 'api', source: 'view', title: 'View', nav: 8,
    cells: [
      "| `width` | no | `'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'` | style axis |",
      "| `aspectRatio` | no | `'square' | 'card'` | style axis |",
      "| `variant` | no | `'solid' | 'soft' | 'ghost' | 'subtle'` | style axis |",
      "| `accent` | no | `'neutral' | 'lilac' | 'orange'` | theme scope |",
    ],
    excludes: ['## Example', '## Anatomy', '## Base', '## Token map'],
  },
  typography: {
    kind: 'api', source: 'typography', title: 'Typography', nav: 9,
    cells: [
      "| `size` | no | `'xs' | 'sm' | 'md' | 'lg' | 'xl' | '3xl'` | style axis |",
      '| `emphasis` | no | `boolean` | style axis |',
      "| `chrome` | no | `'canvas' | 'subtle' | 'strong'` | style axis |",
      '| `children` | no | `React.ReactNode` | default content slot |',
    ],
    excludes: ['## Example', '## Anatomy', '## Base', '## Token map'],
  },
  icon: {
    kind: 'api', source: 'icon', title: 'Icon', nav: 10,
    cells: [
      '| `name` | yes | `IconName` | scalar icon name |',
      '| `color` | no | `string` | glyph rendering |',
      '| `dimension` | no | `number` | glyph rendering |',
    ],
    excludes: ['## Example', '## Anatomy', '## Base', '## Token map'],
  },
};

test('G · each generated/components/*.md re-emits identically from its source surface', async () => {
  // Re-emit must equal the committed page (stale-build / hand-edit guard). The doc
  // IR is sourced from the RN public prop type for every component-like surface.
  for (const spec of COMPONENT_API_DOCS) {
    const emitted = emitComponentApiPage(await componentApiIrFromFile(spec, REPO_ROOT));
    assert.equal(
      readGenerated(spec.source),
      emitted,
      `generated/components/${spec.source}.md is stale or hand-edited — run \`npm run build -w @nuri/doc\`.`,
    );
  }

  // The per-page contract pins (a deliberate emitter change must update these).
  for (const spec of COMPONENT_API_DOCS) {
    const contract = PAGE_CONTRACT[spec.source];
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
    assert.ok(md.includes('\n## API\n'), `${contract.source}.md: missing the '## API' section`);
    assert.ok(
      md.includes('| Prop | Required | Type | Notes |'),
      `${contract.source}.md: the API-only prop table drifted`,
    );
    assert.ok(
      !md.includes('\\|'),
      `${contract.source}.md: generated API type cells must not render visible escaped pipes`,
    );
    for (const excluded of contract.excludes || []) {
      assert.ok(
        !md.includes(excluded),
        `${contract.source}.md: API-only page includes excluded descriptor/story content '${excluded}'`,
      );
    }
    for (const cell of contract.cells) {
      assert.ok(
        md.includes(cell),
        `${contract.source}.md: an API cell rendering drifted —\n  expected substring: ${cell}`,
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
      '| `fill` | `flex` | — | `grow` → `grow: 1` · `shrink: 0`<br>`grow-shrink` → `grow: 1` · `shrink: 1` · `minInline: 0`<br>`even` → `grow: 1` · `shrink: 1` · `basis: 0` · `minInline: 0` |',
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
    // SEED-1a: agnostic opts come from spec; web selector/chrome/order facts come from
    // the prototype-owned web projection.
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
  const { opts } = await loadSpecData('interactive-effects');
  const interactiveWeb = interactiveWebProjection(opts);
  const { axis } = await loadSpecData('typography-axis');
  const typographyWeb = typographyWebProjection(axis);
  const specTokens = await loadDataFromPath(resolve(RN_GENERATED, 'tokens.ts'));
  const { tokenVars } = await loadDataFromPath(resolve(PROTO_GENERATED, 'token-vars.ts'));
  const d = {
    stackFields: STACK_FIELDS,
    boxFields: BOX_FIELDS,
    registry: PROPERTY_SPELLING,
    surface,
    opts,
    interactiveWeb,
    axis,
    typographyWeb,
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
