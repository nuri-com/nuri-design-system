/* ──────────────────────────────────────────────────────────────
 * NURI · PARSER · DESCRIPTORS (R-EXPO-6 · decision 65 · 65.2)
 *
 * Emits the per-component DESCRIPTOR — the frozen cross-repo contract
 * instance — additively under build/descriptors/. Two sources, one
 * reader each (decision 48 · 65 guardrail · "emit FROM, never re-author"):
 *
 *   · MAPPING half  — lib/components/<name>/<name>.css @layer blocks.
 *     The variant→style VALUES (bg/fg/pressed · geometry · type-step ·
 *     press-scale · disabled-opacity), read + VALIDATED against the
 *     surface funnel (resolver-model §11). This is the 65.1 bootstrap,
 *     the spike's derive-button.ts proven on a real component.
 *   · STRUCTURE half — pages/components/<name>.html data-part anatomy
 *     (decision 24.1). Which parts a component has; the mapping half
 *     patches them by name. Un-derivable from CSS (the web is one node ·
 *     65.2) → the second source.
 *
 * Output shape = the schema at build/descriptors/schema.ts: a theme
 * thunk `(theme) => ({ variants, compoundVariants? })`, `$parts`
 * patching the structure-named parts, the one semantic `typeStep` ref.
 * The RN factory (B2 · native · finalized in Expo) interprets it; this
 * repo only emits + proves the contract (decision 65). Additive — the
 * existing build/ emit is byte-identical.
 * ────────────────────────────────────────────────────────────── */

import postcss from 'postcss';

// ── The three spike-validated components (65.2) · scope-locked ────────
// Each entry maps a descriptor NAME → its source files + the structure
// role-routing (engine knowledge · cf. derive-button.ts's lookup tables).
// Naming (decision 64.1 · 65.2 · "resolves open choice #3"): the open
// Button primitive takes the `composition-` prefix (bare `button` = the
// recipe); IconAvatar / Topbar keep bare names — their family renames are
// deferred · P11. The token emit at build/components/button.ts is a
// different artifact and is untouched.
export const DESCRIPTOR_COMPONENTS = [
  { name: 'composition-button', source: 'button',      kind: 'button',      fgPart: 'label' },
  { name: 'icon-avatar',        source: 'icon-avatar',  kind: 'iconAvatar',  fgPart: 'icon'  },
  { name: 'topbar',             source: 'topbar',       kind: 'topbar',      centerPart: 'content' },
];

// ── Surface funnel · resolver-model §11 · the variant×accent map as data ──
// role → slot → the semantic token (or `transparent` literal) the CSS MUST
// reference for the mapping to be faithful (decision 65.1 bootstrap · spike
// Layer-A clean-equal). The emitter resolves each variant rule's value
// (through the component-token alias for Button · directly for IconAvatar)
// and asserts it equals this table, then emits `theme.surface.<role>.<slot>`.
// A drift (a variant pointing at the wrong chrome/accent token) throws at
// build → the gate fails. The VALUES live once in build/tokens.ts; this is
// only the role↔token wiring the bootstrap proves.
const SURFACE = {
  solid:  { bg: '--nuri-accent-solid', fg: '--nuri-accent-on-solid', pressedBg: '--nuri-accent-solid-pressed' },
  soft:   { bg: '--nuri-bg-strong',    fg: '--nuri-text-primary',    pressedBg: '--nuri-bg-pressed' },
  ghost:  { bg: 'transparent',         fg: '--nuri-text-primary',    pressedBg: '--nuri-bg-subtle' },
  subtle: { bg: 'transparent',         fg: '--nuri-border-strong' },
};

// Canonical orderings so the emit is deterministic regardless of CSS
// declaration order. An unknown value throws (drift / surprise variant).
const VARIANT_ORDER = ['solid', 'soft', 'ghost', 'subtle'];
const SIZE_ORDER = ['sm', 'md', 'lg'];

// ════════════════════════════════════════════════════════════════════
// CSS reading helpers (postcss · the @layer mapping half)
// ════════════════════════════════════════════════════════════════════

// Every rule inside a named `@layer <param>` block → { selector, decls }
// (decls is a prop→value Map). Mirrors components.js's @layer walk.
function rulesInLayer(css, layerParam) {
  const root = postcss.parse(css);
  const out = [];
  root.walkAtRules('layer', (at) => {
    if (at.params !== layerParam) return;
    at.walkRules((rule) => {
      const decls = new Map();
      rule.walkDecls((d) => decls.set(d.prop, d.value.trim()));
      out.push({ selector: rule.selector, decls });
    });
  });
  return out;
}

// `@layer tokens` alias map · `--nuri-<comp>-<suffix>: var(--nuri-<x>) | <literal>`.
// Mirrors derive-button.ts parseAliases; empty for skip-emit components
// (IconAvatar / Topbar consume semantic vars directly · decisions 50 / 37).
function aliasMap(css) {
  const out = new Map();
  for (const { decls } of rulesInLayer(css, 'tokens')) {
    for (const [prop, value] of decls) {
      if (prop.startsWith('--nuri-')) out.set(prop, value);
    }
  }
  return out;
}

// A decl value → its first var() target, or a bare literal.
// `var(--x)` → {var}; `0 var(--x)` / `scale(var(--x))` → {var}; `transparent` → {literal}.
function refTarget(value) {
  const m = value.match(/var\(\s*(--[\w-]+)/);
  return m ? { var: m[1] } : { literal: value.trim() };
}

// Resolve a rule's value to the underlying SEMANTIC var (or literal),
// stepping through one component-token alias if present (Button) or
// returning the directly-referenced semantic var (IconAvatar / Topbar).
function resolveSemantic(value, aliases) {
  const t = refTarget(value);
  if (t.literal !== undefined) return t.literal;
  if (aliases.has(t.var)) {
    const at = refTarget(aliases.get(t.var));
    return at.literal !== undefined ? at.literal : at.var;
  }
  return t.var;
}

const find = (rules, sel) => rules.find((r) => r.selector === sel);
const camel = (s) => s.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
// member access that survives numeric-leading leaves (`2xl` → ['2xl']).
const member = (base, leaf) => (/^[A-Za-z_$][\w$]*$/.test(leaf) ? `${base}.${leaf}` : `${base}['${leaf}']`);

// ── value → theme-expression string (the emitted RHS) ────────────────

// COLOUR · role from the variant (selector), slot from the CSS property;
// VALIDATE the resolved token equals the surface funnel, then emit the path.
function surfaceExpr(role, slot, declValue, aliases, where) {
  const expected = SURFACE[role] && SURFACE[role][slot];
  if (expected === undefined) {
    throw new Error(`[descriptors] no surface mapping for ${role}.${slot} (${where})`);
  }
  const actual = resolveSemantic(declValue, aliases);
  if (actual !== expected) {
    throw new Error(
      `[descriptors] ${where}: surface drift — ${role}.${slot} resolves to ` +
      `'${actual}' but the funnel (resolver-model §11) expects '${expected}'. ` +
      `Fix the CSS or the SURFACE table.`,
    );
  }
  return `theme.surface.${role}.${slot}`;
}

// GEOMETRY · resolve through the alias to a primitive scale var → theme path.
function scaleExpr(declValue, aliases, where) {
  const sem = resolveSemantic(declValue, aliases);
  const m = sem.match(/^--nuri-(size|space|radius)-(.+)$/);
  if (!m) throw new Error(`[descriptors] ${where}: '${sem}' is not a size/space/radius scale var`);
  return member(`theme.${m[1]}`, m[2]);
}

// INTERACTION · the not-colour effects → theme.interaction.<camel>.
function interactionExpr(declValue, aliases, where) {
  const sem = resolveSemantic(declValue, aliases);
  const m = sem.match(/^--nuri-interaction-(.+)$/);
  if (!m) throw new Error(`[descriptors] ${where}: '${sem}' is not an --nuri-interaction-* var`);
  return `theme.interaction.${camel(m[1])}`;
}

// TYPE · a size rule's font block → the semantic type-step key (decision 54/55).
// `--nuri-type-<X>-size` + `--nuri-type-<X>-em-weight` → `<X>Em`; plain → `<X>`.
function typeStepFrom(decls, where) {
  const fs = decls.get('font-size') || '';
  const m = fs.match(/var\(--nuri-type-([a-z0-9]+)-size\)/);
  if (!m) throw new Error(`[descriptors] ${where}: no --nuri-type-*-size in the size block`);
  const isEm = /var\(--nuri-type-[a-z0-9]+-em-weight\)/.test(decls.get('font-weight') || '');
  return m[1] + (isEm ? 'Em' : '');
}

// All modifier values present as `.nuri-<comp>--<value>` rules (rest
// selectors only · no `:active` / state suffix). For Button this set spans
// BOTH axes (variant + size share the `--<x>` namespace); each axis filters
// the set by its canonical order, and the caller checks every value is
// claimed by SOME axis (so a typo'd modifier still throws · drift guard).
function presentValues(rules, comp) {
  const re = new RegExp(`^\\.nuri-${comp}--([a-z0-9]+)$`);
  const found = new Set();
  for (const { selector } of rules) {
    const m = selector.match(re);
    if (m) found.add(m[1]);
  }
  return found;
}
const axisValues = (present, order) => order.filter((v) => present.has(v));
function assertCovered(present, claimed, where) {
  for (const v of present) {
    if (!claimed.has(v)) {
      throw new Error(`[descriptors] ${where}: modifier '${v}' is not a known axis value (drift?)`);
    }
  }
}

// ════════════════════════════════════════════════════════════════════
// PAGE reading (the structure / parts half · decision 24.1)
// ════════════════════════════════════════════════════════════════════

// The component page's declared parts — the `data-part="…"` chips inside
// the `data-spec="parts"` spec-card row. `root` is the implicit host; a
// page may name only its NON-host parts (Topbar names leading/content/
// trailing). Returns the set the descriptor's `$parts` targets must be a
// subset of (the renamed/removed-part drift guard · ship item 6).
export function pageParts(html) {
  const block = (html.match(/data-spec="parts"[\s\S]*?<\/dd>/) || [''])[0];
  return [...block.matchAll(/data-part="([^"]+)"/g)].map((m) => m[1]);
}

// ════════════════════════════════════════════════════════════════════
// DERIVE · CSS mapping + page structure → the descriptor IR
// ════════════════════════════════════════════════════════════════════
// IR: { name, source, exportName, typeName, usesTheme, axes, parts,
//       variants: { <axis>: { <value>: StyleValueIR } },
//       compoundVariants?: [ { cond, styles } ] }
// StyleValueIR = { root: {prop→expr}, parts: { <part>: {prop→expr} } }
// Every expr is the final RHS string emitted verbatim.

function exportNameFor(name) {
  return camel(name) + 'Descriptor';
}
function typeNameFor(name) {
  const c = camel(name);
  return c.charAt(0).toUpperCase() + c.slice(1) + 'Axes';
}

function assertPart(part, parts, where) {
  if (!parts.includes(part)) {
    throw new Error(
      `[descriptors] ${where}: structure part '${part}' is not declared in the ` +
      `page anatomy (data-spec="parts": ${parts.join(', ') || '∅'}). Add it to the ` +
      `page or fix the routing (decision 24.1 · 65.2 · the structure source).`,
    );
  }
}

// ── Button · recipe-with-parts · variant→bg + label fg · size→geometry + label type + compounds ──
function deriveButton(spec, css, html) {
  const aliases = aliasMap(css);
  const rules = rulesInLayer(css, 'rules');
  const parts = pageParts(html);
  assertPart('root', parts, 'button');
  assertPart(spec.fgPart, parts, 'button.variant.fg'); // 'label' ⊆ page

  const present = presentValues(rules, 'button'); // spans variant + size
  const variantValues = axisValues(present, VARIANT_ORDER);
  const sizeValues = axisValues(present, SIZE_ORDER);
  assertCovered(present, new Set([...variantValues, ...sizeValues]), 'button');

  const variant = {};
  for (const v of variantValues) {
    const rest = find(rules, `.nuri-button--${v}`);
    const w = `button.variant.${v}`;
    variant[v] = {
      root: { backgroundColor: surfaceExpr(v, 'bg', rest.decls.get('background'), aliases, w) },
      parts: { [spec.fgPart]: { color: surfaceExpr(v, 'fg', rest.decls.get('color'), aliases, w) } },
    };
  }

  const size = {};
  for (const s of sizeValues) {
    const rule = find(rules, `.nuri-button--${s}`);
    const w = `button.size.${s}`;
    size[s] = {
      root: {
        minHeight: scaleExpr(rule.decls.get('min-height'), aliases, w),
        paddingHorizontal: scaleExpr(rule.decls.get('padding'), aliases, w),
        borderRadius: scaleExpr(rule.decls.get('border-radius'), aliases, w),
      },
      parts: { [spec.fgPart]: { typeStep: `'${typeStepFrom(rule.decls, w)}'` } },
    };
  }

  // compoundVariants · per-variant pressed colour + the two opt-in effects.
  const compoundVariants = [];
  for (const v of variantValues) {
    const active = find(rules, `.nuri-button--${v}:active`);
    const w = `button.${v}:active`;
    compoundVariants.push({
      cond: { variant: `'${v}'`, pressed: 'true' },
      styles: { root: { backgroundColor: surfaceExpr(v, 'pressedBg', active.decls.get('background'), aliases, w) } },
    });
  }
  const press = find(rules, '.nuri-button:active');
  compoundVariants.push({
    cond: { pressed: 'true' },
    styles: { root: { transform: `[{ scale: ${interactionExpr(press.decls.get('transform'), aliases, 'button:active')} }]` } },
  });
  const disabledRule = rules.find((r) => r.selector.includes('.nuri-button[disabled]') && r.decls.has('opacity'));
  if (!disabledRule) throw new Error('[descriptors] button: no [disabled] opacity rule');
  compoundVariants.push({
    cond: { disabled: 'true' },
    styles: { root: { opacity: interactionExpr(disabledRule.decls.get('opacity'), aliases, 'button[disabled]') } },
  });

  return {
    name: spec.name, source: spec.source,
    exportName: exportNameFor(spec.name), typeName: typeNameFor(spec.name),
    usesTheme: true, parts,
    axes: { variant: variantValues, size: sizeValues },
    variants: { variant, size },
    compoundVariants,
  };
}

// ── IconAvatar · static · the full surface incl. `subtle` · NO compounds ──
function deriveIconAvatar(spec, css, html) {
  const aliases = aliasMap(css); // empty by design (decision 50)
  const rules = rulesInLayer(css, 'rules');
  const parts = pageParts(html);
  assertPart('root', parts, 'icon-avatar');
  assertPart(spec.fgPart, parts, 'icon-avatar.variant.fg'); // 'icon' ⊆ page

  const present = presentValues(rules, 'icon-avatar');
  const variantValues = axisValues(present, VARIANT_ORDER);
  assertCovered(present, new Set(variantValues), 'icon-avatar');
  const variant = {};
  for (const v of variantValues) {
    const rule = find(rules, `.nuri-icon-avatar--${v}`);
    const w = `icon-avatar.variant.${v}`;
    variant[v] = {
      root: { backgroundColor: surfaceExpr(v, 'bg', rule.decls.get('background'), aliases, w) },
      parts: { [spec.fgPart]: { color: surfaceExpr(v, 'fg', rule.decls.get('color'), aliases, w) } },
    };
  }

  return {
    name: spec.name, source: spec.source,
    exportName: exportNameFor(spec.name), typeName: typeNameFor(spec.name),
    usesTheme: true, parts,
    axes: { variant: variantValues },
    variants: { variant },
    // compoundVariants ABSENT · "no interaction" by omission (65.2 · resolver-model §2/§5).
  };
}

// ── Topbar · layout primitive · `center` → 100% on the content pivot ──
function deriveTopbar(spec, css, html) {
  const rules = rulesInLayer(css, 'rules');
  const parts = pageParts(html);
  assertPart(spec.centerPart, parts, 'topbar.center'); // 'content' ⊆ page

  // The center patch lands entirely on the content pivot (host untouched ·
  // 65.2 · the proof part-addressing is unavoidable). Read the descendant
  // rule `nuri-topbar[data-center] > nuri-topbar-content`; map the RN-
  // crossing alignment literals (web-only display / text-align dropped).
  const centerRule = rules.find((r) => /\[data-center\]\s*>\s*nuri-topbar-content/.test(r.selector));
  if (!centerRule) throw new Error('[descriptors] topbar: no [data-center] > content rule');
  const ALIGN = { 'align-items': 'alignItems', 'justify-content': 'justifyContent' };
  const contentPatch = {};
  for (const [cssProp, rnKey] of Object.entries(ALIGN)) {
    const val = centerRule.decls.get(cssProp);
    if (val) contentPatch[rnKey] = `'${val}'`;
  }
  if (Object.keys(contentPatch).length === 0) {
    throw new Error('[descriptors] topbar: [data-center] rule carries no align-items/justify-content');
  }

  return {
    name: spec.name, source: spec.source,
    exportName: exportNameFor(spec.name), typeName: typeNameFor(spec.name),
    usesTheme: false, parts,
    axes: { center: ['false', 'true'] },
    variants: {
      // boolean axis · both keys required (65.2 minor strain): the no-op
      // default `false` is an explicit empty patch; `true` patches content.
      center: {
        false: { root: {}, parts: {} },
        true: { root: {}, parts: { [spec.centerPart]: contentPatch } },
      },
    },
    // No compoundVariants — `center` is not interaction-state dependent.
  };
}

const DERIVERS = { button: deriveButton, iconAvatar: deriveIconAvatar, topbar: deriveTopbar };

export function deriveDescriptor(spec, { css, html }) {
  const deriver = DERIVERS[spec.kind];
  if (!deriver) throw new Error(`[descriptors] no deriver for kind '${spec.kind}'`);
  return deriver(spec, css, html);
}

// ════════════════════════════════════════════════════════════════════
// RENDER · IR → the descriptor .ts source string
// ════════════════════════════════════════════════════════════════════

function renderPatch(patch) {
  return Object.entries(patch).map(([k, expr]) => `${k}: ${expr}`).join(', ');
}

// StyleValueIR { root, parts } → `{ ...root, $parts: { part: { … } } }`.
function renderStyleValue(sv) {
  const segs = [];
  const rootStr = renderPatch(sv.root || {});
  if (rootStr) segs.push(rootStr);
  const partNames = Object.keys(sv.parts || {});
  if (partNames.length) {
    const inner = partNames.map((p) => `${p}: { ${renderPatch(sv.parts[p])} }`).join(', ');
    segs.push(`$parts: { ${inner} }`);
  }
  return segs.length ? `{ ${segs.join(', ')} }` : '{}';
}

function renderAxesType(typeName, axes) {
  const lines = [`type ${typeName} = {`];
  for (const [axis, values] of Object.entries(axes)) {
    lines.push(`  ${axis}: ${values.map((v) => `'${v}'`).join(' | ')};`);
  }
  lines.push('};');
  return lines.join('\n');
}

function renderCondition(cond) {
  return Object.entries(cond).map(([k, v]) => `${k}: ${v}`).join(', ');
}

export function emitDescriptorTs(ir) {
  const themeArg = ir.usesTheme ? 'theme' : '_theme';
  const lines = [
    `/* ──────────────────────────────────────────────────────────────`,
    ` * NURI · COMPONENT DESCRIPTOR · ${ir.name.toUpperCase()} · GENERATED · DO NOT EDIT BY HAND`,
    ` *`,
    ` * Sources (decision 65 · 65.2 · one source, two readers · decision 48):`,
    ` *   · mapping   — lib/components/${ir.source}/${ir.source}.css @layer (variant→style values)`,
    ` *   · structure — pages/components/${ir.source}.html data-part anatomy (decision 24.1)`,
    ` * Emitter · pipeline/tokens-parser.js — run \`npm run build\``,
    ` *`,
    ` * The frozen contract instance (schema · ./schema). A theme thunk;`,
    ` * \`$parts\` patches the structure-named parts; \`typeStep\` is the one`,
    ` * semantic ref the RN factory (B2 · native) expands via typeStyle.`,
    ` * NEVER hand-edited — re-emit from the sources above.`,
    ` * ────────────────────────────────────────────────────────────── */`,
    ``,
    `import type { Descriptor } from './schema';`,
    ``,
    renderAxesType(ir.typeName, ir.axes),
    ``,
    `export const ${ir.exportName}: Descriptor<${ir.typeName}> = (${themeArg}) => ({`,
    `  variants: {`,
  ];
  for (const [axis, values] of Object.entries(ir.axes)) {
    lines.push(`    ${axis}: {`);
    for (const value of values) {
      // `value` may be a numeric-leading key but axes here are identifiers.
      lines.push(`      ${value}: ${renderStyleValue(ir.variants[axis][value])},`);
    }
    lines.push(`    },`);
  }
  lines.push(`  },`);
  if (ir.compoundVariants && ir.compoundVariants.length) {
    lines.push(`  compoundVariants: [`);
    for (const cv of ir.compoundVariants) {
      lines.push(`    { ${renderCondition(cv.cond)}, styles: ${renderStyleValue(cv.styles)} },`);
    }
    lines.push(`  ],`);
  }
  lines.push(`});`);
  lines.push('');
  return lines.join('\n');
}

// ════════════════════════════════════════════════════════════════════
// SCHEMA emit · copy the hand-maintained pipeline source verbatim,
// rewriting the one build-relative tokens import (decision 35).
// ════════════════════════════════════════════════════════════════════

const SCHEMA_HEADER = [
  `/* ──────────────────────────────────────────────────────────────`,
  ` * NURI · DESCRIPTOR SCHEMA · GENERATED · DO NOT EDIT BY HAND`,
  ` *`,
  ` * Source · pipeline/descriptors/schema.ts (the canonical contract · hand-maintained)`,
  ` * Emitter · pipeline/tokens-parser.js — run \`npm run build\``,
  ` *`,
  ` * The FROZEN cross-repo contract type (decision 65 · 65.2): each`,
  ` * component descriptor is \`(theme) => ({ variants, compoundVariants? })\``,
  ` * — the CVA core + part-addressable \`$parts\` + the one semantic`,
  ` * \`typeStep\` ref. Validated by the variants-model spike`,
  ` * (docs/variants-model-spike.md). The RN factory (B2 · finalized in the`,
  ` * Expo project) imports THIS type; engine + behaviour are native, never`,
  ` * data (decision 65 · 65.1 · resolver-model §7). Reuses the emitted`,
  ` * scale types from ./tokens verbatim (decision 48). Type-only`,
  ` * react-native import (the migration-mirror posture · no RN runtime).`,
  ` * ────────────────────────────────────────────────────────────── */`,
  ``,
].join('\n');

// Take the schema source content, drop its own header (everything before
// the first import), rewrite the build-relative tokens import for the
// emitted location (pipeline/descriptors → ../../build/tokens; the emitted
// build/descriptors/schema.ts → ../tokens), prepend the GENERATED header.
// Verbatim otherwise — no escaping of the TS template-literal type
// `${TypeSize}Em` (a JS template string would mangle the backtick / ${…}).
export function emitSchemaTs(schemaSource) {
  const start = schemaSource.indexOf('import type');
  if (start < 0) throw new Error('[descriptors] schema source has no import — cannot emit');
  const body = schemaSource.slice(start).split("'../../build/tokens'").join("'../tokens'");
  return SCHEMA_HEADER + body;
}
