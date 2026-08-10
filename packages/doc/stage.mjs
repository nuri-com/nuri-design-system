/* ──────────────────────────────────────────────────────────────
 * NURI · @nuri/doc · STAGE (Node · N+22 · re-homed + repointed N+42 · A4)
 *
 * Copies the nuri RUNTIME assets into the Jekyll site so the generated pages'
 * <nuri-demo> stories HYDRATE. Run BEFORE `jekyll build` (pages.yml + local).
 *
 * The generated Markdown is NO LONGER staged — it lives IN the site tree
 * (generated/components/*.md · @nuri/doc owns it), so Jekyll builds it in place.
 * This stages only the runtime: @nuri/prototype — the factory + primitives + the
 * 5 generated namespace CSS + the 3 recipes + nuri-demo + reset, AND its generated/
 * web projection (the token CSS + the descriptor twins the recipes import + the icon
 * registry · N+62 · decision 80 · all formerly @nuri/spec's) — plus @nuri/doc's own
 * harness (state · control). @nuri/spec is PURE DATA now (no runtime assets to stage).
 * It also stages @nuri/playground into assets/playground/ so GitHub Pages has ONE
 * deployer: the docs site. The playground's generated boot module still imports
 * ../lib and ../../prototype, so those relative neighbors are staged too.
 *
 * It copies whole package DIRECTORIES, PRESERVING the cross-package ES-module import
 * graph: a staged prototype/recipes/<n>.js imports `../factory`, `../primitives`, AND
 * `../generated/descriptors/<n>.js`; primitives/icon.js imports `../generated/icons.js`
 * — all resolve INSIDE assets/nuri/prototype/ once prototype/generated is staged there.
 * The staged copies are gitignored (build output · the single SoT is the packages ·
 * regenerated every stage · no drift).
 *
 * No dependencies — plain node:fs. Resolves from its own location (cwd-agnostic).
 * ────────────────────────────────────────────────────────────── */

import { cpSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const DOC = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(DOC, '..', '..');
const PROTOTYPE = resolve(REPO_ROOT, 'packages/prototype');
const PLAYGROUND = resolve(REPO_ROOT, 'packages/playground');

// Whole-directory copies (src → dst under @nuri/doc). The dst layout mirrors the
// package layout so relative imports resolve in the staged site. assets/nuri/
// is the docs demo runtime; assets/playground/ is the playground's public
// subpath; assets/prototype/ is the relative ../../prototype neighbor that
// packages/playground/generated/boot.js imports.
const DIRS = [
  // @nuri/prototype — the web mechanism + nuri-demo + the GENERATED web projection
  // (N+62 · decision 80): the token CSS, the descriptor twins the recipes import, and
  // the icon registry primitives/icon.js imports all live under prototype/generated/ now
  // (was @nuri/spec's styles/ + build/descriptors/ + lib/components/icon/ pre-exit). The
  // recipes' `../generated/<...>` imports resolve inside assets/nuri/prototype/ once staged.
  [resolve(PROTOTYPE, 'factory'), 'assets/nuri/prototype/factory'],
  [resolve(PROTOTYPE, 'primitives'), 'assets/nuri/prototype/primitives'],
  [resolve(PROTOTYPE, 'recipes'), 'assets/nuri/prototype/recipes'],
  [resolve(PROTOTYPE, 'styles'), 'assets/nuri/prototype/styles'],
  [resolve(PROTOTYPE, 'generated'), 'assets/nuri/prototype/generated'],
  [resolve(PROTOTYPE, 'demo'), 'assets/nuri/prototype/demo'],
  // @nuri/doc — the harness (state seeds the scope · control defines NuriControl).
  [resolve(DOC, 'harness'), 'assets/nuri/docs'],

  // @nuri/playground — keep pages/ and generated/ as siblings so their relative
  // ../generated and ../../generated links survive. lib/ is required by boot.js;
  // assets/ holds the consumer image assets (the flag avatars) the pages source.
  [resolve(PLAYGROUND, 'pages'), 'assets/playground/pages'],
  [resolve(PLAYGROUND, 'generated'), 'assets/playground/generated'],
  [resolve(PLAYGROUND, 'lib'), 'assets/playground/lib'],
  [resolve(PLAYGROUND, 'assets'), 'assets/playground/assets'],

  // Relative neighbor for the playground boot module's ../../prototype imports.
  [resolve(PROTOTYPE, 'factory'), 'assets/prototype/factory'],
  [resolve(PROTOTYPE, 'primitives'), 'assets/prototype/primitives'],
  [resolve(PROTOTYPE, 'recipes'), 'assets/prototype/recipes'],
  [resolve(PROTOTYPE, 'styles'), 'assets/prototype/styles'],
  [resolve(PROTOTYPE, 'generated'), 'assets/prototype/generated'],
  [resolve(PROTOTYPE, 'demo'), 'assets/prototype/demo'],
];

// Clean the staged dirs so a renamed/removed source asset doesn't linger.
for (const stagedRoot of ['assets/nuri', 'assets/playground', 'assets/prototype']) {
  rmSync(resolve(DOC, stagedRoot), { recursive: true, force: true });
}
for (const [from, dst] of DIRS) {
  const to = resolve(DOC, dst);
  mkdirSync(dirname(to), { recursive: true });
  cpSync(from, to, { recursive: true });
}

console.log(
  `[stage] copied ${DIRS.length} runtime asset trees → assets/nuri/ + assets/playground/ + assets/prototype/ ` +
    `(@nuri/prototype · @nuri/playground · @nuri/doc harness)`,
);
