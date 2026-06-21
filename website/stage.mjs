/* ──────────────────────────────────────────────────────────────
 * NURI · WEBSITE · STAGE (Node · N+22 · decision 66 arc #1)
 *
 * Copies the GENERATED docs + the nuri runtime assets into the Jekyll
 * site so `jekyll build` can serve them. Run AFTER `npm run build -w
 * @nuri/spec` (which emits build/docs/*.md) and BEFORE `jekyll build`
 * (the pages workflow + local both do this).
 *
 * Why a copy step: GitHub Pages deploys only website/_site (what Jekyll
 * outputs), so the assets must live INSIDE the site source. We copy them
 * fresh from the single SoT (packages/spec/{lib,styles,build}) rather than
 * commit duplicates — the generation thesis applied to assets: build
 * output, never hand-synced, so it cannot drift. The copy targets are
 * gitignored (website/.gitignore).
 *
 * No dependencies — plain node:fs. Resolves paths from its own location,
 * so it runs correctly regardless of cwd.
 * ────────────────────────────────────────────────────────────── */

import { cpSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { dirname, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const WEBSITE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(WEBSITE, '..');
const SPEC = resolve(REPO_ROOT, 'packages/spec');

// Runtime assets the <nuri-demo> stories need to hydrate — mirrors the <head> of
// the spec component pages (pages/components/{button,icon-avatar,topbar}.html).
// src (under packages/spec) → dst (under website/assets/nuri). The single SoT is
// packages/spec; these are copies, regenerated every stage. As the generated nav
// grows, the per-component runtime grows with it (N+23 · increment 2 added the
// IconAvatar + Topbar trees + the shared <nuri-icon> glyph runtime).
const ASSETS = [
  ['styles/tokens-primitive.css',                'assets/nuri/styles/tokens-primitive.css'],
  ['styles/tokens-semantic.css',                 'assets/nuri/styles/tokens-semantic.css'],
  ['styles/typography.css',                      'assets/nuri/styles/typography.css'],
  ['lib/docs/state.js',                          'assets/nuri/docs/state.js'],
  ['lib/docs/control/control.css',               'assets/nuri/docs/control/control.css'],
  ['lib/docs/control/control.js',                'assets/nuri/docs/control/control.js'],
  ['lib/docs/demo/demo.css',                     'assets/nuri/docs/demo/demo.css'],
  ['lib/docs/demo/demo.js',                      'assets/nuri/docs/demo/demo.js'],
  ['lib/components/button/button.css',           'assets/nuri/components/button/button.css'],
  ['lib/components/button/button.js',            'assets/nuri/components/button/button.js'],
  // <nuri-icon> glyph runtime (icon.js is an ES module · imports icons.js as a
  // staged sibling) — shared by IconAvatar + the Topbar's IconButton controls.
  ['lib/components/icon/icon.css',               'assets/nuri/components/icon/icon.css'],
  ['lib/components/icon/icon.js',                'assets/nuri/components/icon/icon.js'],
  ['lib/components/icon/icons.js',               'assets/nuri/components/icon/icons.js'],
  ['lib/components/icon-avatar/icon-avatar.css', 'assets/nuri/components/icon-avatar/icon-avatar.css'],
  ['lib/components/icon-avatar/icon-avatar.js',  'assets/nuri/components/icon-avatar/icon-avatar.js'],
  ['lib/components/icon-button/icon-button.css', 'assets/nuri/components/icon-button/icon-button.css'],
  ['lib/components/icon-button/icon-button.js',  'assets/nuri/components/icon-button/icon-button.js'],
  ['lib/components/topbar/topbar.css',           'assets/nuri/components/topbar/topbar.css'],
  ['lib/components/topbar/topbar.js',            'assets/nuri/components/topbar/topbar.js'],
  ['lib/components/scope/scope.js',              'assets/nuri/components/scope/scope.js'],
];

const DOCS_SRC = resolve(SPEC, 'build/docs');     // the generated pages
const PAGES_DST = resolve(WEBSITE, 'components');  // staged into the site nav

function stageAssets() {
  // Clean the staged dir so a renamed/removed source asset doesn't linger.
  rmSync(resolve(WEBSITE, 'assets/nuri'), { recursive: true, force: true });
  for (const [src, dst] of ASSETS) {
    const from = resolve(SPEC, src);
    const to = resolve(WEBSITE, dst);
    mkdirSync(dirname(to), { recursive: true });
    cpSync(from, to);
  }
  return ASSETS.length;
}

function stagePages() {
  rmSync(PAGES_DST, { recursive: true, force: true });
  mkdirSync(PAGES_DST, { recursive: true });
  const md = readdirSync(DOCS_SRC).filter((f) => f.endsWith('.md'));
  if (md.length === 0) {
    throw new Error(
      `[stage] no generated pages in ${DOCS_SRC} — run \`npm run build -w @nuri/spec\` first.`,
    );
  }
  for (const f of md) cpSync(resolve(DOCS_SRC, f), resolve(PAGES_DST, basename(f)));
  return md;
}

const assetCount = stageAssets();
const pages = stagePages();
console.log(
  `[stage] copied ${assetCount} runtime assets → website/assets/nuri/\n` +
  `[stage] staged ${pages.length} generated page(s) → website/components/ (${pages.join(', ')})`,
);
