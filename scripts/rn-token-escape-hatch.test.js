import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

const TARGETS = [
  'packages/rn/index.ts',
  'packages/rn/theme.tsx',
  'packages/rn/contract.ts',
  'packages/rn/runtime/theme-payload.ts',
  'packages/expo-demo/App.tsx',
  'packages/expo-demo/src',
];

const FORBIDDEN_IDENTIFIERS = /\b(?:useToken|resolveToken|useRuntimeTokens|RuntimeTokens|ColourTokenPath)\b/;
const THEME_PAYLOAD_SLICES = /\bThemePayload\b[\s\S]*?\bslices\b/;
const RAW_COLOUR_EXPORTS = /\bexport\s*{[^}]*\b(?:chrome|accentTokens)\b[^}]*}/;
const RAW_COLOUR_IMPORT_FROM_RN = /\bimport\s*{[^}]*\b(?:chrome|accentTokens)\b[^}]*}\s*from\s*['"]@nuri\/rn['"]/;

function sourceFiles(path) {
  const abs = resolve(REPO_ROOT, path);
  const stat = statSync(abs);
  if (stat.isFile()) return [abs];

  const out = [];
  for (const entry of readdirSync(abs)) {
    const child = join(abs, entry);
    const childStat = statSync(child);
    if (childStat.isDirectory()) out.push(...sourceFiles(child));
    else if (/\.(ts|tsx)$/.test(entry)) out.push(child);
  }
  return out;
}

function stripCommentsAndStrings(src) {
  let out = '';
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    const d = src[i + 1];
    if (c === '/' && d === '/') {
      out += '  ';
      i += 2;
      while (i < src.length && src[i] !== '\n') {
        out += ' ';
        i++;
      }
      continue;
    }
    if (c === '/' && d === '*') {
      out += '  ';
      i += 2;
      while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) {
        out += src[i] === '\n' ? '\n' : ' ';
        i++;
      }
      if (i < src.length) {
        out += '  ';
        i += 2;
      }
      continue;
    }
    if (c === '"' || c === "'" || c === '`') {
      const quote = c;
      out += ' ';
      i++;
      while (i < src.length) {
        if (src[i] === '\\') {
          out += ' ';
          if (i + 1 < src.length) out += src[i + 1] === '\n' ? '\n' : ' ';
          i += 2;
          continue;
        }
        if (src[i] === quote) {
          out += ' ';
          i++;
          break;
        }
        out += src[i] === '\n' ? '\n' : ' ';
        i++;
      }
      continue;
    }
    out += c;
    i++;
  }
  return out;
}

test('RN public/demo code does not regrow the token escape hatch', () => {
  for (const file of TARGETS.flatMap(sourceFiles)) {
    const rel = file.slice(REPO_ROOT.length + 1);
    const code = stripCommentsAndStrings(readFileSync(file, 'utf8'));
    assert.doesNotMatch(code, FORBIDDEN_IDENTIFIERS, rel);
  }
});

test('ThemePayload does not carry raw token slices', () => {
  const file = resolve(REPO_ROOT, 'packages/rn/runtime/theme-payload.ts');
  const code = stripCommentsAndStrings(readFileSync(file, 'utf8'));
  assert.doesNotMatch(code, THEME_PAYLOAD_SLICES, 'ThemePayload must stay resolved-role-only');
});

test('RN public barrel does not expose raw colour token tables', () => {
  const file = resolve(REPO_ROOT, 'packages/rn/contract.ts');
  const code = stripCommentsAndStrings(readFileSync(file, 'utf8'));
  assert.doesNotMatch(code, RAW_COLOUR_EXPORTS, 'contract.ts must not export chrome/accentTokens');
});

test('Expo demo does not import raw colour token tables from @nuri/rn', () => {
  for (const file of sourceFiles('packages/expo-demo')) {
    const rel = file.slice(REPO_ROOT.length + 1);
    const code = stripCommentsAndStrings(readFileSync(file, 'utf8'));
    assert.doesNotMatch(code, RAW_COLOUR_IMPORT_FROM_RN, rel);
  }
});
