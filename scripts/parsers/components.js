/* ──────────────────────────────────────────────────────────────
 * NURI · PARSER · COMPONENTS
 * Walks the `@layer tokens` declarations of a component CSS file and
 * resolves each per the set-policy. (The per-component FILE emission to
 * build/components/<name>.ts was RETIRED at Smell-1 · decision 66 arc #0;
 * the orchestrator keeps the walk for TokenPath coverage + the resolver
 * tests, and emitComponentTs is retained as the resolver's source-string
 * form. The decision-45 interaction baseline those files carried now ships
 * transversally at build/interaction.ts · pipeline/parsers/interaction.js.)
 *
 * Each `--nuri-<component>-*` declaration is resolved per the
 * set-policy registry in pipeline/parsers/semantic.js (decision 34 ·
 * N+6.0.3):
 *
 *   · A reference (`var(--…)`) whose target is in a runtime set
 *     (chrome / accent today) emits as a TokenPath string literal
 *     `'<groupName>.<leafName>' as const satisfies TokenPath` — the
 *     consumer dereferences it at render time through a
 *     `resolveToken(tokens, path)` helper.
 *   · A reference whose target is in a pipeline-inlined set
 *     (primitive vocabulary today: colour · px · radius · type ·
 *     font · duration) is walked through the primitive map until a
 *     literal is reached; the literal is emitted as a JS expression
 *     (number for dimensions / durations, quoted string for font
 *     weights and colours).
 *   · A pure literal RHS (e.g. `0.97`, `0.4`) emits as a JS
 *     numeric literal.
 *
 * Together with the runtime tokens.ts and the TokenPath union at
 * build/token-paths.ts, the per-component resolve replaced the
 * pre-N+6.0.3 hardcoded `BUTTON_BASE` constants block — the
 * minHeight/paddingX drift that lingered after the
 * --nuri-px-{60,18} primitive rename is structurally killed
 * because the resolver always reads from the live CSS source.
 * ────────────────────────────────────────────────────────────── */

import { inferType } from './primitive.js';
import {
  primitiveSetFor,
  resolveSetPolicy,
  resolveValue,
} from './semantic.js';

// "--nuri-button-min-height" → "minHeight"
function leafNameFor(cssVar, componentPrefix) {
  return cssVar.slice(componentPrefix.length).replace(
    /-([a-z0-9])/g, (_, c) => c.toUpperCase(),
  );
}

// "icon-button" → "iconButton" — the export const identifier must be
// a valid JS name, so a hyphenated component name camelCases. A
// component whose camelCased name collides with a JS reserved word
// (e.g. "switch") gets a `Tokens` suffix so the `export const` stays
// syntactically valid; every other name passes through unchanged.
const RESERVED_WORDS = new Set([
  'switch', 'class', 'default', 'function', 'return', 'const', 'let',
  'var', 'export', 'import', 'new', 'delete', 'typeof', 'void', 'in',
  'instanceof', 'do', 'while', 'for', 'if', 'else', 'enum', 'extends',
  'super', 'this', 'with', 'yield', 'await', 'try', 'catch', 'finally',
  'throw', 'break', 'continue', 'debugger', 'case',
]);
function exportNameFor(componentName) {
  const camel = componentName.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
  return RESERVED_WORDS.has(camel) ? `${camel}Tokens` : camel;
}

function parseVarRef(value) {
  const m = value.match(/^var\(\s*(--[\w-]+)\s*(?:,[^)]*)?\)$/);
  return m ? m[1] : null;
}

function findSemanticEntry(cssVar, classifiedGroups) {
  for (const [groupName, group] of classifiedGroups) {
    const entry = group.entries.find((e) => e.cssVar === cssVar);
    if (entry) return { groupName, group, entry };
  }
  return null;
}

// Walk a `var(--…)` chain through the primitive map, returning the
// terminal literal AND the last var() name encountered so the
// formatter can infer the right output type. Mirrors resolveValue
// but exposes the var-name trail.
function walkChain(value, primitives) {
  let cur = value;
  let lastVar = null;
  let depth = 0;
  while (cur != null && /^var\(/i.test(cur)) {
    const name = parseVarRef(cur);
    if (!name) return { literal: cur, lastVar };
    lastVar = name;
    const next = primitives.get(name);
    if (next == null) return { literal: null, lastVar };
    cur = next;
    if (++depth > 16) {
      throw new Error(`var() chain too deep starting from ${value}`);
    }
  }
  return { literal: cur, lastVar };
}

// rem → px at the 16px root baseline. Mirrors the contract the
// migration pair encoded for buttonBase pre-N+6.0.3 (decision 34):
// --nuri-font-size-17 = 1.0625rem → 17.
function remToPx(rem) {
  const n = Number(rem) * 16;
  return Math.round(n * 1000) / 1000;
}

// Render a resolved primitive literal as a JS expression. The
// last-var name carries the type hint (dimension → number, font-
// weight → quoted string, etc.).
function formatPrimitiveLiteral(literal, lastVarName) {
  if (literal == null) {
    throw new Error(`component RHS dangled at ${lastVarName ?? '<literal>'}`);
  }
  const type = lastVarName ? inferType(lastVarName) : null;
  if (type === 'dimension') {
    if (literal.endsWith('px')) return String(Number(literal.slice(0, -2)));
    if (literal.endsWith('rem')) return String(remToPx(literal.slice(0, -3)));
    if (/^-?\d+(?:\.\d+)?$/.test(literal)) return literal;
  }
  if (type === 'duration') {
    if (literal.endsWith('ms')) return String(Number(literal.slice(0, -2)));
    if (literal.endsWith('s')) return String(Number(literal.slice(0, -1)) * 1000);
  }
  if (type === 'fontWeight') return `'${literal}'`;
  if (type === 'color') return `'${literal}'`;
  if (type === 'fontFamily') return `'${literal.replace(/'/g, "\\'")}'`;
  // Default: numeric pass-through, else quoted
  if (/^-?\d+(?:\.\d+)?$/.test(literal)) return literal;
  return `'${literal}'`;
}

// Resolve a single component-token declaration to one of two emit
// records. The component walker dispatches per setKey:
//   · runtime → tokenPath emit
//   · pipelineInline → literal emit (chain walked to terminal)
//   · pure literal RHS → literal emit (numeric or string)
export function resolveComponentValue(
  cssVar,
  value,
  { primitives, classifiedGroups },
) {
  const refName = parseVarRef(value);
  if (refName == null) {
    return { kind: 'literal', expression: formatPrimitiveLiteral(value, null) };
  }
  const sem = findSemanticEntry(refName, classifiedGroups);
  if (sem) {
    const policy = sem.group.policy;
    if (policy.runtime) {
      const path = `${sem.groupName}.${sem.entry.leafName}`;
      return { kind: 'tokenPath', path };
    }
    throw new Error(
      `component var ${cssVar} → ${refName} resolves to a semantic set ` +
      `'${sem.group.setKey}' that is neither runtime nor pipeline-inline ` +
      `— inconsistent SET_POLICY.`,
    );
  }
  const setKey = primitiveSetFor(refName);
  if (!setKey) {
    throw new Error(
      `component var ${cssVar} references ${refName} which is neither a ` +
      `classified semantic var nor a recognised primitive prefix — extend ` +
      `PRIMITIVE_SET_PREFIXES in pipeline/parsers/semantic.js or fix the ` +
      `reference.`,
    );
  }
  const policy = resolveSetPolicy(setKey, false);
  if (policy.runtime) {
    throw new Error(
      `component var ${cssVar} → ${refName} resolves to runtime set ` +
      `'${setKey}', but only semantic sets emit TokenPath today — a ` +
      `runtime primitive set has no namespace in tokens.ts to point at.`,
    );
  }
  const { literal, lastVar } = walkChain(value, primitives);
  if (literal == null) {
    throw new Error(
      `component var ${cssVar} chain through ${refName} dangled before ` +
      `reaching a literal (last var: ${lastVar ?? refName}).`,
    );
  }
  return { kind: 'literal', expression: formatPrimitiveLiteral(literal, lastVar) };
}

// Resolve a component's `@layer tokens` to a source string (the
// resolver's string form) + the set of TokenPath strings it references.
// The orchestrator no longer WRITES this string — the per-component
// build/components/<name>.ts emission was retired at Smell-1 (decision 66
// arc #0) — but still calls this to collect referencedPaths for the build
// log's TokenPath coverage. Exercised directly by the resolver tests.
export function emitComponentTs(componentName, declarations, { primitives, classifiedGroups }) {
  const componentPrefix = `--nuri-${componentName}-`;
  const referencedPaths = new Set();
  const rows = [];
  for (const { cssVar, value } of declarations) {
    const leaf = leafNameFor(cssVar, componentPrefix);
    const r = resolveComponentValue(cssVar, value, { primitives, classifiedGroups });
    if (r.kind === 'tokenPath') {
      referencedPaths.add(r.path);
      rows.push({ leaf, expression: `'${r.path}' as const satisfies TokenPath` });
    } else {
      rows.push({ leaf, expression: r.expression });
    }
  }
  const leafWidth = rows.reduce((w, r) => Math.max(w, r.leaf.length), 0);
  const exprStart = leafWidth + 2; // leaf + ':' + ' '
  // Right-pad expressions so the `as const satisfies TokenPath`
  // trail lines up across the file's TokenPath rows (matches the
  // brief's example).
  const exprWidth = rows.reduce((w, r) => {
    const head = r.expression.startsWith("'")
      ? r.expression.split("' as const")[0] + "'"
      : r.expression;
    return Math.max(w, head.length);
  }, 0);
  const lines = [
    `/* ──────────────────────────────────────────────────────────────`,
    ` * NURI · COMPONENT TOKENS · ${componentName.toUpperCase()} · GENERATED · DO NOT EDIT BY HAND`,
    ` *`,
    ` * Source · lib/components/${componentName}/${componentName}.css @layer tokens`,
    ` * Emitter · pipeline/tokens-parser.js — run \`npm run build\``,
    ` *`,
    ` * Per the set-policy registry (decision 34 · N+6.0.3):`,
    ` *   · Literal numerics/strings = references through pipeline-`,
    ` *     inlined primitive sets (px · radius · type · font · …)`,
    ` *     resolved to terminal literals at build time.`,
    ` *   · TokenPath strings = references through runtime sets`,
    ` *     (chrome · accent); the consumer dereferences via a`,
    ` *     resolveToken(tokens, path) helper at render time.`,
    ` * ────────────────────────────────────────────────────────────── */`,
    ``,
    `import type { TokenPath } from '../token-paths';`,
    ``,
    `export const ${exportNameFor(componentName)} = {`,
  ];
  for (const r of rows) {
    const label = `${r.leaf}:`.padEnd(exprStart);
    if (r.expression.includes('as const satisfies TokenPath')) {
      const [headRaw, tail] = r.expression.split(' as const');
      const headPad = headRaw.padEnd(exprWidth);
      lines.push(`  ${label} ${headPad} as const${tail},`);
    } else {
      lines.push(`  ${label} ${r.expression},`);
    }
  }
  lines.push(`} as const;`);
  lines.push('');
  return { source: lines.join('\n'), referencedPaths };
}

// Emit build/token-paths.ts as a string. The TokenPath union is
// mechanically derived from every runtime-set leaf — same source
// the per-component emitter dereferences when it writes a
// `'<group>.<leaf>' as const satisfies TokenPath`. Adding a new
// runtime set (or extending an existing one with new leaves)
// re-emits this file without hand-sync.
export function emitTokenPathsTs(classifiedGroups) {
  const runtimeGroups = [...classifiedGroups.entries()]
    .filter(([, g]) => g.policy.runtime);
  const lines = [
    `/* ──────────────────────────────────────────────────────────────`,
    ` * NURI · TOKEN PATHS · GENERATED · DO NOT EDIT BY HAND`,
    ` *`,
    ` * Source · build/tokens.ts (every runtime-set leaf path)`,
    ` * Emitter · pipeline/tokens-parser.js — run \`npm run build\``,
    ` *`,
    ` * Discriminated union of every runtime-set leaf path. Consumed`,
    ` * by build/components/<name>.ts where each TokenPath string is`,
    ` * \`as const satisfies TokenPath\`-checked, so adding or`,
    ` * renaming a runtime leaf without re-emitting this union fails`,
    ` * the TS compile (decision 34 · N+6.0.3).`,
    ` * ────────────────────────────────────────────────────────────── */`,
    ``,
  ];
  if (runtimeGroups.length === 0) {
    lines.push(`export type TokenPath = never;`);
    lines.push('');
    return lines.join('\n');
  }
  const paths = [];
  for (const [groupName, group] of runtimeGroups) {
    for (const { leafName } of group.entries) {
      paths.push(`${groupName}.${leafName}`);
    }
  }
  lines.push(`export type TokenPath =`);
  paths.forEach((p, i) => {
    const suffix = i === paths.length - 1 ? ';' : '';
    lines.push(`  | '${p}'${suffix}`);
  });
  lines.push('');
  return lines.join('\n');
}
