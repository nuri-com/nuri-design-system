import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PLAYGROUND_ROOT = resolve(__dirname, '..');
const PROTOTYPE_ROOT = resolve(PLAYGROUND_ROOT, '../prototype');
const GENERATED_ROOT = resolve(PLAYGROUND_ROOT, 'generated');

const CSS_INPUTS = [
  ['@nuri/prototype generated tokens', 'generated/styles/tokens-primitive.css'],
  ['@nuri/prototype generated semantics', 'generated/styles/tokens-semantic.css'],
  ['@nuri/prototype generated shell reset', 'generated/styles/shell.css'],
  ['@nuri/prototype generated type scale', 'generated/styles/typography.css'],
  ['@nuri/prototype primitive icon', 'primitives/icon.css'],
  ['@nuri/prototype primitive input', 'primitives/input.css'],
  ['@nuri/prototype primitive pressable', 'primitives/pressable.css'],
  ['@nuri/prototype primitive view', 'primitives/view.css'],
  ['@nuri/prototype primitive screen', 'primitives/screen.css'],
  ['@nuri/prototype primitive header', 'primitives/header.css'],
  ['@nuri/prototype primitive scroll', 'primitives/scroll.css'],
  ['@nuri/prototype primitive footer', 'primitives/footer.css'],
  ['@nuri/prototype primitive dock', 'primitives/dock.css'],
  ['@nuri/prototype primitive separator', 'primitives/separator.css'],
  ['@nuri/prototype primitive list separator', 'primitives/list-separator.css'],
  ['@nuri/prototype primitive spacer', 'primitives/spacer.css'],
  ['@nuri/prototype namespace typography', 'styles/typography.css'],
  ['@nuri/prototype namespace stack', 'styles/stack.css'],
  ['@nuri/prototype namespace box', 'styles/box.css'],
  ['@nuri/prototype namespace palette', 'styles/palette.css'],
  ['@nuri/prototype namespace interactive', 'styles/interactive.css'],
  ['@nuri/prototype namespace effect', 'styles/effect.css'],
  ['@nuri/prototype factory reset', 'factory/reset.css'],
  ['@nuri/prototype recipe bottom sheet', 'recipes/bottom-sheet.css'],
  ['@nuri/prototype demo controls', 'demo/control.css'],
  ['@nuri/prototype demo boards', 'demo/demo.css'],
  ['@nuri/playground shell', '../playground/lib/shell.css'],
];

const BOOT_IMPORTS = [
  '../../prototype/demo/available.js',
  '../../prototype/demo/control.js',
  '../lib/shell.js',
  '../../prototype/primitives/scope.js',
  '../../prototype/primitives/icon.js',
  '../../prototype/primitives/input.js',
  '../../prototype/primitives/pressable.js',
  '../../prototype/primitives/view.js',
  '../../prototype/primitives/typography.js',
  '../../prototype/primitives/screen.js',
  '../../prototype/primitives/header.js',
  '../../prototype/primitives/scroll.js',
  '../../prototype/primitives/footer.js',
  '../../prototype/primitives/dock.js',
  '../../prototype/primitives/separator.js',
  '../../prototype/primitives/list-separator.js',
  '../../prototype/primitives/spacer.js',
  '../../prototype/recipes/alert.js',
  '../../prototype/recipes/button.js',
  '../../prototype/recipes/icon-button.js',
  '../../prototype/recipes/icon-avatar.js',
  '../../prototype/recipes/topbar.js',
  '../../prototype/recipes/list-action.js',
  '../../prototype/recipes/list.js',
  '../../prototype/recipes/text-field.js',
  '../../prototype/recipes/tab-bar.js',
  '../../prototype/recipes/bottom-sheet.js',
  '../../prototype/demo/demo.js',
];

async function emitCss() {
  const chunks = [
    `/* GENERATED · DO NOT EDIT BY HAND · source: packages/playground/pipeline/bundle.js */`,
    `@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;600;700&family=Roboto+Mono:wght@400;500&family=Google+Sans+Text:wght@400;500;700&display=swap');`,
  ];

  for (const [label, relativePath] of CSS_INPUTS) {
    const root = relativePath.startsWith('../playground/') ? PLAYGROUND_ROOT : PROTOTYPE_ROOT;
    const path = relativePath.startsWith('../playground/')
      ? resolve(root, relativePath.replace('../playground/', ''))
      : resolve(root, relativePath);
    const source = await readFile(path, 'utf8');
    chunks.push(`\n/* ${label} · ${relativePath} */\n${source.trimEnd()}\n`);
  }

  return chunks.join('\n') + '\n';
}

function emitBoot() {
  return [
    `/* GENERATED · DO NOT EDIT BY HAND · source: packages/playground/pipeline/bundle.js */`,
    ``,
    `document.documentElement.dataset.theme ||= 'light';`,
    `document.documentElement.dataset.neutral ||= 'cream';`,
    `document.documentElement.dataset.accent ||= 'neutral';`,
    ``,
    ...BOOT_IMPORTS.map((path) => `await import('${path}');`),
    ``,
  ].join('\n');
}

export async function emitPlaygroundBundles() {
  await mkdir(GENERATED_ROOT, { recursive: true });
  const css = await emitCss();
  const boot = emitBoot();
  await writeFile(resolve(GENERATED_ROOT, 'playground.css'), css, 'utf8');
  await writeFile(resolve(GENERATED_ROOT, 'boot.js'), boot, 'utf8');
  return [
    resolve(GENERATED_ROOT, 'playground.css'),
    resolve(GENERATED_ROOT, 'boot.js'),
  ];
}

async function main() {
  const outputs = await emitPlaygroundBundles();
  for (const out of outputs) {
    console.log(`[playground-bundle] generated → ${out}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
