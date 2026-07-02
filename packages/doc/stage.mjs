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

// Whole-directory copies (src → dst under @nuri/doc). The dst layout mirrors the
// package layout so the recipes' relative imports (../factory · ../primitives ·
// ../generated/descriptors · ../generated/icons.js) resolve
// inside assets/nuri/. The staged dir is gitignored (.gitignore: /assets/nuri/).
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
];

// Clean the staged dir so a renamed/removed source asset doesn't linger.
rmSync(resolve(DOC, 'assets/nuri'), { recursive: true, force: true });
for (const [from, dst] of DIRS) {
  const to = resolve(DOC, dst);
  mkdirSync(dirname(to), { recursive: true });
  cpSync(from, to, { recursive: true });
}

console.log(
  `[stage] copied ${DIRS.length} runtime asset trees → assets/nuri/ ` +
    `(@nuri/prototype factory·primitives·recipes·styles·demo · @nuri/spec styles·descriptors·icon · @nuri/doc harness)`,
);
