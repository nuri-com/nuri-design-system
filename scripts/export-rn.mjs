#!/usr/bin/env node
/* ──────────────────────────────────────────────────────────────
 * NURI · VENDOR EXPORTER · flattens @nuri/rn + its @nuri/spec data
 * imports into one self-contained TS source tree a consumer app
 * vendors verbatim (no npm registry · the shadcn model).
 *
 * Usage:  node scripts/export-rn.mjs [outDir]      (default: vendor-out/nuri-ds)
 *
 * Output layout (all imports rewritten to relative paths):
 *   <out>/index.ts        → the ONLY sanctioned import target (consumers
 *                           reach it via the @ds tsconfig-paths alias) —
 *                           re-exports internal/rn/index
 *   <out>/internal/**     → everything else, producer layout preserved
 *                           verbatim (rn/** minus tests/mocks/config ·
 *                           spec/** = the actual-import closure). The
 *                           internal/ prefix IS the contract: generated
 *                           payload, never imported directly, reviewed
 *                           as a MANIFEST bump not file-by-file.
 *   <out>/MANIFEST.json   → { ref?, commit, exportedAt, files }
 *
 * The @nuri/spec subpath → file mapping is READ from
 * packages/spec/package.json `exports` — never hardcoded, so a new
 * descriptor subpath can't silently break the exporter.
 *
 * Gate: the output must contain no `@nuri/` import and no
 * animation-lib import (gorhom/reanimated/gesture-handler/worklets);
 * the script throws otherwise. Only react / react-native /
 * react-native-svg externals are allowed to survive.
 * ────────────────────────────────────────────────────────────── */

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execSync } from 'node:child_process';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const RN_SRC = join(repoRoot, 'packages/rn');
const SPEC_SRC = join(repoRoot, 'packages/spec');

// rn entries that are dev harness, not consumable surface.
const RN_EXCLUDE = new Set([
  '__tests__', '__mocks__', 'type-tests', 'node_modules',
  'jest.config.js', 'babel.config.js', 'package.json', 'tsconfig.json',
]);

// Externals allowed to survive in the vendored output.
export const FORBIDDEN = /@nuri\/|@gorhom|react-native-reanimated|react-native-gesture-handler|react-native-worklets/;

// ── pure helpers (exported for scripts/export-rn.test.js) ──

// Rewrite every `@nuri/spec/…` import in `src` to a relative path into the
// vendored spec tree. Covers BOTH the `from '…'` and the inline `import('…')`
// forms — mirroring the seed scan — and preserves the matched prefix/quote.
// Returns { src, changed }; throws if a subpath has no spec-exports entry.
export function rewriteSpecImports(src, { file, specMap, internalDir }) {
  let changed = false;
  const out = src.replace(/\b(from |import\()(['"])(@nuri\/spec\/[^'"]+)\2/g, (whole, prefix, quote, subpath) => {
    const target = specMap.get(subpath);
    if (!target) throw new Error(`${file}: import '${subpath}' has no entry in the spec exports map`);
    let rel = relative(dirname(file), join(internalDir, 'spec', target)).replace(/\\/g, '/').replace(/\.tsx?$/, '');
    if (!rel.startsWith('.')) rel = `./${rel}`;
    changed = true;
    return `${prefix}${quote}${rel}${quote}`;
  });
  return { src: out, changed };
}

// Extract the quoted specifier from every import form — `from '…'`,
// `import('…')`, `require('…')` — and return those matching `forbidden`.
// Testing the SPECIFIER (not the whole line/file) catches inline `import(`,
// `require(`, and multi-line `from` continuations, while a comment that merely
// mentions a forbidden name (no import structure) is correctly ignored.
export function findForbiddenSpecifiers(src, forbidden = FORBIDDEN) {
  const IMPORT_SPECIFIER = /(?:\bfrom\s+|\bimport\s*\(\s*|\brequire\s*\(\s*)(['"])([^'"]+)\1/g;
  const offenders = [];
  for (const [, , specifier] of src.matchAll(IMPORT_SPECIFIER)) {
    if (forbidden.test(specifier)) offenders.push(specifier);
  }
  return offenders;
}

function main() {
  const outDir = resolve(repoRoot, process.argv[2] ?? 'vendor-out/nuri-ds');

  // ── 1 · the subpath map, read from the spec exports map ──
  const specPkg = JSON.parse(readFileSync(join(SPEC_SRC, 'package.json'), 'utf8'));
  const specMap = new Map(); // '@nuri/spec/colours' → 'tokens/colours.ts' (spec-relative)
  for (const [subpath, target] of Object.entries(specPkg.exports)) {
    specMap.set(`@nuri/spec${subpath.slice(1)}`, target.replace(/^\.\//, ''));
  }

  // ── 2 · clean output, copy trees ──
  rmSync(outDir, { recursive: true, force: true });
  const internalDir = join(outDir, 'internal');
  mkdirSync(join(internalDir, 'rn'), { recursive: true });
  mkdirSync(join(internalDir, 'spec'), { recursive: true });

  for (const entry of readdirSync(RN_SRC)) {
    if (RN_EXCLUDE.has(entry)) continue;
    cpSync(join(RN_SRC, entry), join(internalDir, 'rn', entry), { recursive: true });
  }
  // Seed the spec copy from the rn tree's ACTUAL @nuri/spec imports (both the
  // `from '...'` and inline `import('...')` forms) — NOT the whole exports map:
  // axes only the other projections read (palette-surface · typography-axis)
  // must not ship in the consumer payload. Then close over the seeds' intra-spec
  // relative imports (e.g. schema.ts → ../tokens/typography, which no
  // exports-map entry names), layout preserved.
  const seeds = new Set();
  (function scanRn(dir) {
    for (const entry of readdirSync(dir)) {
      const p = join(dir, entry);
      if (statSync(p).isDirectory()) scanRn(p);
      else if (/\.tsx?$/.test(entry)) {
        const src = readFileSync(p, 'utf8');
        for (const [, , subpath] of src.matchAll(/(from |import\()['"](@nuri\/spec\/[^'"]+)['"]/g)) {
          const target = specMap.get(subpath);
          if (!target) throw new Error(`${p}: import '${subpath}' has no entry in the spec exports map`);
          seeds.add(target);
        }
      }
    }
  })(join(internalDir, 'rn'));
  const specQueue = [...seeds];
  const specCopied = new Set();
  while (specQueue.length) {
    const target = specQueue.pop();
    if (specCopied.has(target)) continue;
    specCopied.add(target);
    cpSync(join(SPEC_SRC, target), join(internalDir, 'spec', target));
    const src = readFileSync(join(SPEC_SRC, target), 'utf8');
    // Both import forms: `from './x'` and the inline type form `import('./x')`.
    for (const [, , rel] of src.matchAll(/(from |import\()['"](\.\.?\/[^'"]+)['"]/g)) {
      const base = join(dirname(target), rel);
      const candidate = ['.ts', '.tsx', ''].map((ext) => base + ext).find((p) => {
        try { return statSync(join(SPEC_SRC, p)).isFile(); } catch { return false; }
      });
      if (!candidate) throw new Error(`spec/${target}: relative import '${rel}' does not resolve inside packages/spec`);
      specQueue.push(candidate);
    }
  }

  // ── 3 · rewrite @nuri/spec imports to relative paths ──
  const tsFiles = [];
  (function walk(dir) {
    for (const entry of readdirSync(dir)) {
      const p = join(dir, entry);
      if (statSync(p).isDirectory()) walk(p);
      else if (/\.tsx?$/.test(entry)) tsFiles.push(p);
    }
  })(outDir);

  for (const file of tsFiles) {
    const src = readFileSync(file, 'utf8');
    const { src: rewritten, changed } = rewriteSpecImports(src, { file, specMap, internalDir });
    if (changed) writeFileSync(file, rewritten);
  }

  // ── 4 · consumer-facing barrel ──
  writeFileSync(
    join(outDir, 'index.ts'),
    `// NURI DS · vendored · generated by scripts/export-rn.mjs — DO NOT EDIT.\n// The ONLY sanctioned import target (via the @ds alias). Never import from\n// internal/. Re-pull with ds-pull.mjs; MANIFEST.json has the source pin.\nexport * from './internal/rn/index';\n`,
  );

  // ── 4b · consumer README: version banner + component inventory with
  // version-exact doc links. {{REF}} placeholders are substituted by
  // ds-pull (tag when pinned · commit when --local), so every link points
  // at the docs FOR THE VENDORED VERSION via the repo-at-tag URL. When the
  // docs site (GitHub Pages) exists, only DOCS_BASE changes.
  const DOCS_BASE = 'https://github.com/nuri-com/nuri-design-system/blob/{{REF}}/packages/doc/generated/components';
  // Doc filenames follow the WEB element names where they differ from the RN export.
  const DOC_ALIAS = { 'nuri-icon': 'icon', text: 'typography' };
  const kebab = (n) => n.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  const pascal = (k) => k.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join('');

  const components = [];
  for (const f of readdirSync(join(RN_SRC, 'primitives'))) {
    if (!/\.tsx$/.test(f) || f === 'shared.tsx') continue;
    components.push(f.replace(/\.tsx$/, ''));
  }
  for (const subpath of specMap.keys()) {
    const m = subpath.match(/^@nuri\/spec\/descriptors\/(.+)$/);
    if (m && m[1] !== 'schema') components.push(pascal(m[1]));
  }
  components.sort();

  const rows = components.map((name) => {
    const docName = DOC_ALIAS[kebab(name)] ?? kebab(name);
    const hasDoc = existsSync(join(repoRoot, 'packages/doc/generated/components', `${docName}.md`));
    return `| \`${name}\` | ${hasDoc ? `[docs](${DOCS_BASE}/${docName}.md)` : '—'} |`;
  });

  writeFileSync(
    join(outDir, 'README.md'),
    [
      '# Nuri DS · vendored — DO NOT TOUCH',
      '',
      '**Version: `{{REF}}`** · exported from nuri-design-system by `scripts/export-rn.mjs`.',
      '',
      'Everything in this folder is **generated**. Never edit, never import from `internal/` —',
      'the ONLY sanctioned import is the barrel, via the `@ds` alias:',
      '',
      '```ts',
      "import { Button, View, BottomSheet } from '@ds';",
      '```',
      '',
      'Upgrade = re-pull (the whole upgrade is one reviewable diff; see `MANIFEST.json` for the pin):',
      '',
      '```bash',
      'node tools/ds-pull.mjs rn/vX.Y.Z',
      '```',
      '',
      '## Components',
      '',
      '| Component | Docs |',
      '|---|---|',
      ...rows,
      '',
      '_Docs links point at the documentation for exactly this vendored version (repo-at-tag)._',
      '',
    ].join('\n'),
  );

  // ── 5 · gate: nothing forbidden survives ──
  const offenders = [];
  for (const file of tsFiles.concat(join(outDir, 'index.ts'))) {
    const src = readFileSync(file, 'utf8');
    for (const specifier of findForbiddenSpecifiers(src)) {
      offenders.push(`${relative(outDir, file)}: ${specifier}`);
    }
  }
  if (offenders.length) {
    console.error('FORBIDDEN imports survived the export:\n' + offenders.join('\n'));
    process.exit(1);
  }

  // ── 6 · manifest ──
  let commit = 'unknown';
  try { commit = execSync('git rev-parse HEAD', { cwd: repoRoot }).toString().trim(); } catch {}
  writeFileSync(
    join(outDir, 'MANIFEST.json'),
    JSON.stringify({ commit, exportedAt: new Date().toISOString(), files: tsFiles.length + 1 }, null, 2) + '\n',
  );

  console.log(`exported ${tsFiles.length + 1} files → ${relative(repoRoot, outDir)} (commit ${commit.slice(0, 7)})`);
}

// Run only when executed directly, not when imported by the test.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
