/* ──────────────────────────────────────────────────────────────
 * NURI · NO-UNUSED-EXPORTS GUARD · CI-ENFORCED REACHABILITY
 *
 * The codegen surface (scripts/parsers/*.js + scripts/tokens-parser.js) has
 * no gate against DEAD CODE — the 5 docs-drift/round-trip guards prove the
 * emitted artefacts re-derive + don't drift, but a retired closure that no
 * longer runs (reads files that no longer exist, never invoked) sails through
 * them untouched. That is exactly how the ~300-line CSS-parity oracle in
 * parsers/descriptors.js sat unremoved for many increments after the L3c flip
 * made the descriptor the SoT and the infra-exit deleted its lib//pages/ inputs
 * (debt-register D1). This guard fails the build the moment a top-level symbol
 * in that surface is unreachable from a live consumer, so the rot is caught at
 * PR time instead of accreting.
 *
 * Sibling to docs-drift.test.js / tokens-parser.test.js — picked up by the
 * existing `node --test scripts/*.test.js` gate · zero new deps (a hand-rolled
 * tokenizer, no parser dependency · the surface is small + col-0-declared).
 *
 * ── MECHANISM · tree-shaking by reachability ──────────────────────
 * For every top-level declaration (`export?/function/const/let/class NAME`) in
 * the surface, the symbol must be REACHABLE from a live root. Roots are the
 * EXTERNAL signals of liveness; reachability then follows same-file references
 * (so a private helper that only the dead closure calls — e.g. deriveButton,
 * reachable solely from the dead DERIVERS map — is correctly flagged, where a
 * naive "is the name referenced anywhere?" check counts that intra-closure use
 * and misses it).
 *
 *   ROOT signals (a surface symbol N defined in file F is a root iff):
 *     · R1 — N is referenced in CODE (comments + string/import/re-export
 *            bodies stripped) of some file other than F: a real call site,
 *            incl. tokens-parser's main() and a test body. The tokens-parser
 *            RE-EXPORT barrel is a pure passthrough — its `import {…}` and
 *            `export {…}` specifier lists are NOT code, so a symbol that is
 *            ONLY ever re-exported and never actually consumed downstream is
 *            unrooted (this is what binds on deriveDescriptor/emitDescriptorTs).
 *     · R2 — N is named in an `import {…}` of a NON-surface consumer (a test,
 *            or a cross-package pipeline test). Test imports count as use even
 *            when the symbol is imported-but-not-called (the resolver tail in
 *            components.js · emitComponentTs/resolveComponentValue/…).
 *     · R3 — N is referenced by a top-level EXECUTABLE chunk in F itself (the
 *            module side-effect code, e.g. `if (import.meta.url …) main()` —
 *            this roots main()).
 *     · R4 — N is in RETAINED_UNUSED below (deliberately-kept, no live caller).
 *
 * ── KNOWN LIMITATIONS (honest over leaky-complete) ────────────────
 *   1. RETAINED_UNUSED is a curated allowlist escape hatch (name-keyed → reason)
 *      for a symbol deliberately kept with no live caller. It is EMPTY today —
 *      nothing on the surface is exempt; prefer deletion over an entry.
 *   2. Liveness is name-based, not scope-accurate (no symbol resolution). A
 *      symbol shadowed by an unrelated same-named local in a consumer reads as
 *      used. This only ever UNDER-reports dead code (never false-flags a live
 *      one) — the safe direction for a gate. The reachable closure that matters
 *      (the descriptor passthrough) is verified byte-for-byte by Guard D's
 *      re-emit, which this guard does not duplicate.
 *   3. Consumers are scripts/*.js + the cross-package files that actually
 *      import the surface (discovered by path, below) — the complete consumer
 *      set today. A future spec-only consumer added elsewhere must import the
 *      surface by the `scripts/parsers|tokens-parser` path to be discovered.
 *   4. Regex-literal detection is heuristic; a missed strip can only add
 *      apparent uses (leaky-safe).
 * ────────────────────────────────────────────────────────────── */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, resolve, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PARSERS_DIR = resolve(__dirname, 'parsers');
const REPO_ROOT = resolve(__dirname, '..');
const PACKAGES_DIR = resolve(REPO_ROOT, 'packages');

// ── RETAINED_UNUSED · deliberately-kept exports with no current caller ──
// The escape hatch: a surface export kept ON PURPOSE despite having no live
// consumer (name-keyed → reason). EMPTY today — the two genuinely-dead exports
// this once grandfathered (emitDescriptorTsFromSource · readComponentTokens)
// were deleted, so nothing is exempt. Add an entry (with its WHY) only for a
// symbol that must survive without a caller; prefer deletion.
const RETAINED_UNUSED = new Map([]);

// ════════════════════════════════════════════════════════════════════
// Tokenizer · source → a CODE VIEW with comments + string/regex literal text
// blanked to spaces (newlines preserved, so col-0 chunking still works), but
// template `${…}` interiors KEPT as code (real references live there).
// ════════════════════════════════════════════════════════════════════
function isRegexStart(prev) {
  if (prev === '') return true;
  return '(,=:[!&|?{;+-*%<>~^'.includes(prev);
}

// Stack-based so NESTED templates (`${`${p}:`}` — a template inside a ${}
// expression) and braces inside ${…} expressions are tracked correctly.
function toCodeView(src) {
  let out = '';
  let last = ''; // last non-whitespace char emitted (for regex detection)
  const emit = (ch) => { out += ch; if (!/\s/.test(ch)) last = ch; };
  const blank = (ch) => { out += ch === '\n' ? '\n' : ' '; };
  const stack = [{ mode: 'code', depth: 0 }];
  let i = 0;
  const n = src.length;
  while (i < n) {
    const fr = stack[stack.length - 1];
    const c = src[i];
    const d = src[i + 1];

    // ── template TEXT: blank it, but ${…} opens a fresh expression frame ──
    if (fr.mode === 'tpl') {
      if (c === '\\') { blank(c); if (i + 1 < n) blank(d); i += 2; continue; }
      if (c === '`') { out += ' '; i++; stack.pop(); continue; }
      if (c === '$' && d === '{') { out += '  '; i += 2; stack.push({ mode: 'expr', depth: 0 }); continue; }
      blank(c); i++; continue;
    }

    // ── code / template-expression ──
    if (c === '/' && d === '/') { // line comment
      out += '  '; i += 2;
      while (i < n && src[i] !== '\n') { out += ' '; i++; }
      continue;
    }
    if (c === '/' && d === '*') { // block comment
      out += '  '; i += 2;
      while (i < n && !(src[i] === '*' && src[i + 1] === '/')) { blank(src[i]); i++; }
      if (i < n) { out += '  '; i += 2; }
      continue;
    }
    if (c === "'" || c === '"') { // quoted string
      const q = c; emit(' '); i++;
      while (i < n && src[i] !== q) {
        if (src[i] === '\\') { blank(src[i]); if (i + 1 < n) blank(src[i + 1]); i += 2; }
        else { blank(src[i]); i++; }
      }
      if (i < n) { out += ' '; i++; }
      continue;
    }
    if (c === '`') { emit(' '); i++; stack.push({ mode: 'tpl' }); continue; }
    if (c === '/' && isRegexStart(last)) { // regex literal (heuristic)
      emit(' '); i++;
      while (i < n && src[i] !== '/') {
        if (src[i] === '\\') { blank(src[i]); if (i + 1 < n) blank(src[i + 1]); i += 2; }
        else if (src[i] === '[') {
          blank(src[i]); i++;
          while (i < n && src[i] !== ']') {
            if (src[i] === '\\') { blank(src[i]); if (i + 1 < n) blank(src[i + 1]); i += 2; }
            else { blank(src[i]); i++; }
          }
          if (i < n) { blank(src[i]); i++; }
        } else { blank(src[i]); i++; }
      }
      if (i < n) { out += ' '; i++; }
      while (i < n && /[a-z]/i.test(src[i])) { out += ' '; i++; }
      continue;
    }
    if (c === '{') { if (fr.mode === 'expr') fr.depth++; emit(c); i++; continue; }
    if (c === '}') {
      if (fr.mode === 'expr') {
        if (fr.depth === 0) { stack.pop(); out += ' '; i++; continue; } // ${…} closes
        fr.depth--;
      }
      emit(c); i++; continue;
    }
    emit(c); i++;
  }
  return out;
}

// ── chunk a code view into top-level constructs (each begins at a col-0
// identifier char; closing `}`/`]`/`)`/indented lines absorb into the chunk) ──
const DECL_RE = /^(export\s+)?(async\s+)?(function\s*\*?|const|let|var|class)\s+([A-Za-z_$][\w$]*)/;

function chunksOf(codeView) {
  const lines = codeView.split('\n');
  const chunks = [];
  let cur = null;
  for (const line of lines) {
    const starts = /^[A-Za-z_$]/.test(line);
    if (starts || cur === null) {
      if (cur) chunks.push(cur);
      cur = [line];
    } else {
      cur.push(line);
    }
  }
  if (cur) chunks.push(cur);
  return chunks.map((ls) => {
    const text = ls.join('\n');
    const first = ls[0];
    const m = first.match(DECL_RE);
    let kind;
    if (m) kind = 'decl';
    else if (/^import\b/.test(first)) kind = 'import';
    else if (/^export\b/.test(first)) kind = 'reexport';
    else if (/\S/.test(text)) kind = 'exec';
    else kind = 'blank';
    return { kind, text, name: m ? m[4] : null, exported: m ? !!m[1] : false };
  });
}

// identifiers in a blob of code-view text
function identsIn(text) {
  return new Set(text.match(/[A-Za-z_$][\w$]*/g) || []);
}

// names inside an `import {…}` specifier chunk (original imported name, pre-`as`)
function importNames(text) {
  const out = [];
  const block = text.match(/\{([\s\S]*?)\}/);
  if (!block) return out;
  for (const part of block[1].split(',')) {
    const name = part.trim().split(/\s+as\s+/)[0].trim();
    if (/^[A-Za-z_$][\w$]*$/.test(name)) out.push(name);
  }
  return out;
}

// ── file collection ──
function listJs(dir) {
  return readdirSync(dir)
    .filter((f) => f.endsWith('.js'))
    .map((f) => resolve(dir, f));
}

// every cross-package file that IMPORTS the surface by path (the complete
// external-consumer set beyond scripts/ · limitation 3)
function findCrossPackageConsumers(dir, acc) {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.git') continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) findCrossPackageConsumers(full, acc);
    else if (/\.(js|ts|tsx|mjs)$/.test(entry)) {
      const src = readFileSync(full, 'utf8');
      if (/from\s+['"][^'"]*scripts\/(parsers|tokens-parser)/.test(src)) acc.push(full);
    }
  }
  return acc;
}

const surfaceFiles = [resolve(__dirname, 'tokens-parser.js'), ...listJs(PARSERS_DIR)];
const scriptsFiles = listJs(__dirname); // includes the *.test.js consumers
const crossPkg = findCrossPackageConsumers(PACKAGES_DIR, []);
const consumerFiles = [...new Set([...surfaceFiles, ...scriptsFiles, ...crossPkg])];
const surfaceSet = new Set(surfaceFiles);

// ── build the per-file model ──
function modelOf(file) {
  const chunks = chunksOf(toCodeView(readFileSync(file, 'utf8')));
  const symbols = [];
  const execIdents = new Set();
  const codeIdents = new Set(); // decl + exec (excludes import/re-export specifiers)
  const importedNames = new Set();
  for (const ch of chunks) {
    if (ch.kind === 'decl') {
      symbols.push({ name: ch.name, exported: ch.exported, text: ch.text, file });
      for (const id of identsIn(ch.text)) codeIdents.add(id);
    } else if (ch.kind === 'exec') {
      for (const id of identsIn(ch.text)) { execIdents.add(id); codeIdents.add(id); }
    } else if (ch.kind === 'import') {
      for (const nm of importNames(ch.text)) importedNames.add(nm);
    }
  }
  return { file, symbols, execIdents, codeIdents, importedNames };
}

const models = new Map(consumerFiles.map((f) => [f, modelOf(f)]));

test('no-unused-exports · every codegen-surface symbol is reachable from a live consumer', () => {
  // External roots: R1 (referenced in another file's code) + R2 (imported by a
  // non-surface consumer). Computed once across all consumers.
  const r1Used = new Set(); // names referenced in CODE of SOME file
  const r2Imported = new Set(); // names imported by a NON-surface consumer
  for (const m of models.values()) {
    for (const id of m.codeIdents) r1Used.add(`${m.file}::${id}`);
    if (!surfaceSet.has(m.file)) for (const nm of m.importedNames) r2Imported.add(nm);
  }
  const referencedElsewhere = (name, file) => {
    for (const m of models.values()) {
      if (m.file === file) continue;
      if (m.codeIdents.has(name)) return true;
    }
    return false;
  };

  // Per surface file: seed roots, then BFS over intra-file reference edges.
  const flagged = [];
  for (const file of surfaceFiles) {
    const m = models.get(file);
    const byName = new Map(m.symbols.map((s) => [s.name, s]));
    // edges: A -> B if B's name appears in A's chunk text (B ≠ A, same file)
    const edges = new Map();
    for (const s of m.symbols) {
      const ids = identsIn(s.text);
      edges.set(s.name, m.symbols.filter((t) => t.name !== s.name && ids.has(t.name)).map((t) => t.name));
    }
    const reachable = new Set();
    const queue = [];
    for (const s of m.symbols) {
      const root =
        RETAINED_UNUSED.has(s.name) ||           // R4
        r2Imported.has(s.name) ||                // R2
        m.execIdents.has(s.name) ||              // R3
        referencedElsewhere(s.name, file);       // R1
      if (root) { reachable.add(s.name); queue.push(s.name); }
    }
    while (queue.length) {
      const cur = queue.shift();
      for (const nxt of edges.get(cur) || []) {
        if (!reachable.has(nxt)) { reachable.add(nxt); queue.push(nxt); }
      }
    }
    for (const s of m.symbols) {
      if (!reachable.has(s.name)) flagged.push(`${basename(file)} · ${s.name}`);
    }
  }

  assert.deepEqual(
    flagged.sort(),
    [],
    `Unused export(s) on the codegen surface — delete them, wire a consumer, or ` +
    `(if deliberately retained) add to RETAINED_UNUSED with a reason:\n  ` +
    flagged.sort().join('\n  '),
  );
});
