/* ──────────────────────────────────────────────────────────────
 * NURI · @nuri/doc · the @nuri/spec DATA loader (N+42 · A4)
 *
 * @nuri/doc consumes @nuri/spec's committed DATA exports (build/*.ts) to
 * transform them → Markdown. node 20 cannot `import` a .ts, and @nuri/spec
 * ships RAW TS (no dist · resolved under TS bundler / Metro · see its
 * package.json), so this strips the (data-file) TS apparatus and imports the
 * result via a data: URL — the descriptor-twin technique (decision 69), the
 * same move @nuri/prototype's emitter uses for @nuri/spec's axis SoTs (N+41 ·
 * pipeline/parsers/strip.js). The data files are emitter-controlled output; a
 * malformed strip fails LOUD (the import throws) and the byte-identical doc
 * gate (git diff --exit-code generated/) witnesses any drift.
 *
 * Brace/angle/paren-DEPTH-AWARE (richer than prototype's line-oriented
 * stripTypes) because build/tokens.ts carries MULTI-LINE constructs the SoTs
 * do not: a `export type TypeStep = { … }` spanning lines, and inline
 * `export const chrome: Record<Theme, { … }> = { … }` annotations. Handles:
 *   · `import type … ;`                         (whole line)
 *   · `export type X = … ;` / `type X = … ;`    (scan to depth-0 `;`)
 *   · `export const x: T = …`                   (drop `: T` · scan `:` → depth-0 `=`)
 *   · ` as const satisfies T` / ` as const`     (the const-assertion suffixes)
 * It is PURE DATA in / PURE DATA out — never executes @nuri/spec pipeline code.
 * ────────────────────────────────────────────────────────────── */

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const OPEN = '{<([';
const CLOSE = '}>)]';

// Index of the first `term` char at bracket-depth 0, scanning from `from`.
function scanToDepth0(src, from, term) {
  let depth = 0;
  for (let i = from; i < src.length; i++) {
    const c = src[i];
    if (OPEN.includes(c)) depth++;
    else if (CLOSE.includes(c)) depth--;
    else if (c === term && depth === 0) return i;
  }
  return src.length;
}

// Remove `type` / `export type` aliases — the decl may span braces (a multi-
// line object type), so scan from the keyword to the depth-0 terminating `;`.
function removeTypeDecls(src) {
  const re = /(^|\n)([ \t]*)(?:export[ \t]+)?type[ \t]/g;
  let m, out = '', last = 0;
  while ((m = re.exec(src))) {
    const declStart = m.index + m[1].length; // keep the leading newline
    const semi = scanToDepth0(src, re.lastIndex, ';');
    out += src.slice(last, declStart);
    last = semi + 1; // drop through the ';'
    re.lastIndex = last;
  }
  return out + src.slice(last);
}

// Drop the inline annotation in `const NAME: TYPE = …` → `const NAME = …`
// (the `export` is optional — resolve-map.ts annotates its private ALIGN/JUSTIFY/
// FILL consts the same way, not just the exported tables). TYPE may span lines /
// hold braces, so scan `:` → the depth-0 `=`.
function stripConstAnnotations(src) {
  const re = /\b(?:export[ \t]+)?const[ \t]+\w+[ \t]*:/g;
  let m, out = '', last = 0;
  while ((m = re.exec(src))) {
    const colon = m.index + m[0].length - 1;
    const eq = scanToDepth0(src, colon + 1, '=');
    out += src.slice(last, colon) + ' ';
    last = eq; // keep from the '='
    re.lastIndex = eq;
  }
  return out + src.slice(last);
}

// Remove the const-assertion suffix `as const`, optionally followed by ` satisfies
// <TYPE>`. The old form was a line-bounded `[^,;\n]+` — fine for the axis SoTs (whose
// satisfies-types were comma-free), but it TRUNCATES at the first comma INSIDE the
// type: `} as const satisfies Record<string, Leaf>;` matched only `…Record<string`,
// leaving `}, Leaf>;` (a syntax error · the dimensions.ts / colours.ts table suffix ·
// N+48 · A4c). So scan the type DEPTH-AWARE — past `<…>` / `(…)` / commas — to its
// depth-0 terminator (`;` / `,` / newline), the same scanToDepth0 discipline the
// type-decl + const-annotation strippers above use.
function stripAsConst(src) {
  const re = /\s+as\s+const/g;
  let m, out = '', last = 0;
  while ((m = re.exec(src))) {
    out += src.slice(last, m.index);
    let end = re.lastIndex;
    const sat = src.slice(end).match(/^\s+satisfies\s+/);
    if (sat) {
      let depth = 0, i = end + sat[0].length;
      for (; i < src.length; i++) {
        const c = src[i];
        if (OPEN.includes(c)) depth++;
        else if (CLOSE.includes(c)) depth--;
        else if (depth === 0 && (c === ';' || c === ',' || c === '\n')) break;
      }
      end = i;
    }
    last = end;
    re.lastIndex = end;
  }
  return out + src.slice(last);
}

export function stripTsData(src) {
  let s = src.replace(/^[ \t]*import[ \t]+type[ \t][^\n]*\n/gm, '');
  s = removeTypeDecls(s);
  s = stripConstAnnotations(s);
  s = stripAsConst(s);
  return s;
}

// Resolve a @nuri/spec data subpath through its exports map (import.meta.resolve ·
// node 20.6+ · honours `exports` · the @nuri/prototype precedent), strip the TS,
// and import the self-contained data module. Returns the module namespace.
export async function loadSpecData(subpath) {
  const url = import.meta.resolve(`@nuri/spec/${subpath}`);
  const src = await readFile(fileURLToPath(url), 'utf8');
  return import('data:text/javascript,' + encodeURIComponent(stripTsData(src)));
}

// Load a data module by ABSOLUTE PATH (same strip-then-data-URL pipeline) — for the
// generated artifacts that left @nuri/spec for the two PROJECTIONS at N+62 (the infra
// exit · decision 80): the RN contract (tokens · palette → @nuri/rn/generated/) and the
// web token-var registry (token-vars → @nuri/prototype/generated/). @nuri/spec is pure
// data now, so doc reads those resolved artifacts from the projection that owns them,
// by relative path — the descriptor-twin precedent (build.js reads the twins the same way).
export async function loadDataFromPath(absPath) {
  const src = await readFile(absPath, 'utf8');
  return import('data:text/javascript,' + encodeURIComponent(stripTsData(src)));
}
