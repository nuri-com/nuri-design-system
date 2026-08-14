/* ──────────────────────────────────────────────────────────────
 * NURI · SPEC AGNOSTICISM GUARD
 *
 * @nuri/spec is pure data. Target realization belongs in projections. This
 * guard scans comment-stripped spec sources for web CSS/selector payloads and
 * RN ViewStyle property fragments, with every legitimate exception named here.
 * ────────────────────────────────────────────────────────────── */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(import.meta.url), '../..');
const SPEC_ROOT = resolve(ROOT, 'packages/spec');

const DENY = [
  { name: 'web-css-var', re: /var\(--/g, reason: 'CSS variables are projection realization.' },
  { name: 'web-active-selector', re: /:active\b/g, reason: 'Pseudo selectors are web projection realization.' },
  { name: 'web-focus-visible-selector', re: /:focus-visible\b/g, reason: 'Pseudo selectors are web projection realization.' },
  { name: 'web-data-selector', re: /\[data-/g, reason: 'CSS selector fragments are web projection realization.' },
  { name: 'web-cursor-decl', re: /\bcursor\b/g, reason: 'CSS declaration payloads live in the web projection.' },
  { name: 'web-transition-decl', re: /\btransition\b/g, reason: 'CSS declaration payloads live in the web projection.' },
  { name: 'web-outline-decl', re: /\boutline\b/g, reason: 'CSS declaration payloads live in the web projection.' },
  { name: 'target-web-field', re: /\bweb\s*:/g, reason: 'Web projection payloads live in the web projection.' },
  { name: 'target-rn-field', re: /\brn\s*:/g, reason: 'RN projection payloads live in the RN projection.' },
  { name: 'rn-flex-grow', re: /\bflexGrow\b/g, reason: 'RN ViewStyle keys live at the RN boundary.' },
  { name: 'rn-flex-shrink', re: /\bflexShrink\b/g, reason: 'RN ViewStyle keys live at the RN boundary.' },
  { name: 'rn-flex-basis', re: /\bflexBasis\b/g, reason: 'RN ViewStyle keys live at the RN boundary.' },
  { name: 'rn-background-color', re: /\bbackgroundColor\b/g, reason: 'RN ViewStyle keys live at the RN boundary.' },
  { name: 'rn-padding-horizontal', re: /\bpaddingHorizontal\b/g, reason: 'RN ViewStyle keys live at the RN boundary.' },
  { name: 'rn-padding-vertical', re: /\bpaddingVertical\b/g, reason: 'RN ViewStyle keys live at the RN boundary.' },
  { name: 'rn-min-width', re: /\bminWidth\b/g, reason: 'RN ViewStyle keys live at the RN boundary.' },
  { name: 'rn-shadow-color', re: /\bshadowColor\b/g, reason: 'RN shadow style keys live at the RN boundary.' },
  { name: 'rn-shadow-offset', re: /\bshadowOffset\b/g, reason: 'RN shadow style keys live at the RN boundary.' },
  { name: 'rn-shadow-opacity', re: /\bshadowOpacity\b/g, reason: 'RN shadow style keys live at the RN boundary.' },
  { name: 'rn-shadow-radius', re: /\bshadowRadius\b/g, reason: 'RN shadow style keys live at the RN boundary.' },
];

// Explicit exceptions:
// - property-spelling is the registry that names per-target property spellings.
//   It is still scanned for web selector/CSS-var/declaration payloads.
// - interactive-effects currently carries the RN realization vocabulary for its
//   opt-ins; SEED-1a made browser realization projection-owned but kept this RN
//   prop map as the cross-target interaction contract.
// - minWidth is also an authored BoxNS input key used by icon-button; it is not a
//   resolved ViewStyle fragment in those files.
// - outline is now a semantic PaletteVariant / surface row, not a CSS outline
//   declaration, in the named spec files below.
const ALLOW = [
  {
    file: 'axes/property-spelling.ts',
    names: new Set(['target-rn-field', 'rn-min-width', 'rn-padding-horizontal', 'rn-padding-vertical']),
    why: 'the explicit RN column in the per-target spelling registry',
  },
  {
    file: 'axes/interactive-effects.ts',
    names: new Set(['target-rn-field', 'rn-background-color']),
    why: 'the SEED-1a RN realization vocabulary for interaction opt-ins',
  },
  {
    files: new Set(['components/schema.ts', 'components/icon-button.ts', 'axes/resolve-map.ts']),
    names: new Set(['rn-min-width']),
    why: 'minWidth is the public BoxNS input key before per-target spelling',
  },
  {
    files: new Set([
      'components/icon-avatar.ts',
      'components/list-action.ts',
      'components/select-field.ts',
      'components/select-trigger.ts',
      'components/text-field.ts',
      'axes/palette-surface.ts',
    ]),
    names: new Set(['web-outline-decl']),
    why: 'outline is a semantic palette value here, not a CSS declaration',
  },
  {
    file: 'components/schema.ts',
    names: new Set(['web-outline-decl']),
    why: "the PaletteVariant union member 'outline' — the frozen contract's value vocab, no CSS payload",
  },
];

function specFiles(dir = SPEC_ROOT) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const abs = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'icons') continue;
      out.push(...specFiles(abs));
    } else if (/\.(ts|json)$/.test(entry.name)) {
      out.push(abs);
    }
  }
  return out;
}

function stripComments(src) {
  let out = '';
  let i = 0;
  let quote = null;
  while (i < src.length) {
    const c = src[i];
    const n = src[i + 1];
    if (quote) {
      out += c;
      if (c === '\\') {
        out += n ?? '';
        i += 2;
        continue;
      }
      if (c === quote) quote = null;
      i++;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') {
      quote = c;
      out += c;
      i++;
      continue;
    }
    if (c === '/' && n === '/') {
      out += '  ';
      i += 2;
      while (i < src.length && src[i] !== '\n') {
        out += ' ';
        i++;
      }
      continue;
    }
    if (c === '/' && n === '*') {
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
    out += c;
    i++;
  }
  return out;
}

function lineCol(src, index) {
  const lines = src.slice(0, index).split('\n');
  return { line: lines.length, col: lines[lines.length - 1].length + 1 };
}

function allowed(rel, name) {
  return ALLOW.some((entry) =>
    (entry.file === rel || entry.files?.has(rel)) && entry.names.has(name)
  );
}

test('packages/spec stays target-agnostic', () => {
  const hits = [];
  for (const file of specFiles()) {
    const rel = relative(SPEC_ROOT, file);
    const stripped = stripComments(readFileSync(file, 'utf8'));
    for (const deny of DENY) {
      deny.re.lastIndex = 0;
      for (const match of stripped.matchAll(deny.re)) {
        if (allowed(rel, deny.name)) continue;
        const { line, col } = lineCol(stripped, match.index);
        hits.push(`${rel}:${line}:${col} ${deny.name} '${match[0]}' — ${deny.reason}`);
      }
    }
  }

  assert.deepEqual(hits, []);
});
