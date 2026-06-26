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

import { loadSpecData } from './strip.js';
import { docIrFromDescriptor, exportNameFor, DOC_COMPONENTS } from './descriptor-ir.js';
import { emitDocPage, buildDocTokenInputs } from './docs.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DOC_ROOT = resolve(__dirname, '..');
// The descriptor browser-ESM twins still live in @nuri/spec (Slice 7 · the build-
// free cross-package read · the @nuri/prototype recipe precedent).
const SPEC_DESCRIPTORS = resolve(__dirname, '../../spec/build/descriptors');
const readGenerated = (source) =>
  readFileSync(resolve(DOC_ROOT, 'generated/components', `${source}.md`), 'utf8');

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

test('G · each generated/components/*.md re-emits identically from its descriptor', async () => {
  // The value-bearing inputs — re-sourced onto @nuri/spec DATA (the boundary):
  // @nuri/spec/tokens (the resolved cross-product + px scales + type composite) +
  // @nuri/spec/token-vars (the colour var registry) → buildDocTokenInputs; the
  // palette cells from @nuri/spec/palette (build/palette.ts · the data export ·
  // NOT re-derived from the axis SoTs the way the pre-A4 spec-resident guard did).
  const specTokens = await loadSpecData('tokens');
  const { tokenVars } = await loadSpecData('token-vars');
  const { palette } = await loadSpecData('palette');
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
