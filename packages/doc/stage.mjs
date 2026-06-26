/* ──────────────────────────────────────────────────────────────
 * NURI · @nuri/doc · STAGE (Node · N+22 · re-homed + repointed N+42 · A4)
 *
 * Copies the nuri RUNTIME assets into the Jekyll site so the generated pages'
 * <nuri-demo> stories HYDRATE. Run BEFORE `jekyll build` (pages.yml + local).
 *
 * The generated Markdown is NO LONGER staged — it lives IN the site tree
 * (generated/components/*.md · @nuri/doc owns it), so Jekyll builds it in place.
 * This stages only the runtime: @nuri/prototype (the factory + primitives + the
 * 5 generated namespace CSS + the 3 recipes + nuri-demo + reset) and @nuri/spec
 * (the token CSS + the descriptor twins the recipes import + the icon registry),
 * plus @nuri/doc's own harness (state · control).
 *
 * REPOINTED at N+42: the pre-A3 ASSETS list copied per-file from @nuri/spec's
 * lib/components/* + lib/docs/* — paths that MOVED to @nuri/prototype (the A3
 * carve) or RETIRED (the recipe CSS · the L3c flip). It now copies whole package
 * DIRECTORIES, PRESERVING the cross-package ES-module import graph: a staged
 * prototype/recipes/<n>.js imports `../factory`, `../primitives`, AND
 * `../../spec/build/descriptors/<n>.js` + `../../spec/lib/components/icon/icons.js`,
 * so @nuri/prototype and @nuri/spec mirror UNDER assets/nuri/ at the relative
 * positions those imports resolve to. The staged copies are gitignored (build
 * output · the single SoT is the packages · regenerated every stage · no drift).
 *
 * No dependencies — plain node:fs. Resolves from its own location (cwd-agnostic).
 * ────────────────────────────────────────────────────────────── */

import { cpSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const DOC = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(DOC, '..', '..');
const PROTOTYPE = resolve(REPO_ROOT, 'packages/prototype');
const SPEC = resolve(REPO_ROOT, 'packages/spec');

// Whole-directory copies (src → dst under @nuri/doc). The dst layout mirrors the
// package layout so the recipes' relative imports (../factory · ../primitives ·
// ../../spec/build/descriptors · ../../spec/lib/components/icon/icons.js) resolve
// inside assets/nuri/. The staged dir is gitignored (.gitignore: /assets/nuri/).
const DIRS = [
  // @nuri/prototype — the web mechanism + the generated namespace CSS + nuri-demo.
  [resolve(PROTOTYPE, 'factory'), 'assets/nuri/prototype/factory'],
  [resolve(PROTOTYPE, 'primitives'), 'assets/nuri/prototype/primitives'],
  [resolve(PROTOTYPE, 'recipes'), 'assets/nuri/prototype/recipes'],
  [resolve(PROTOTYPE, 'styles'), 'assets/nuri/prototype/styles'],
  [resolve(PROTOTYPE, 'demo'), 'assets/nuri/prototype/demo'],
  // @nuri/spec — the token CSS (→ Phase 4), the descriptor twins the recipes import,
  // and the icon glyph registry primitives/icon.js imports.
  [resolve(SPEC, 'styles'), 'assets/nuri/spec/styles'],
  [resolve(SPEC, 'build/descriptors'), 'assets/nuri/spec/build/descriptors'],
  [resolve(SPEC, 'lib/components/icon'), 'assets/nuri/spec/lib/components/icon'],
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
