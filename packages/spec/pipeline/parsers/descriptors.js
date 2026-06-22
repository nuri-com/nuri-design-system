/* ──────────────────────────────────────────────────────────────
 * NURI · PARSER · DESCRIPTORS (R-EXPO-6 · decision 65 · the composition model 65.3)
 *
 * Emits the per-component DESCRIPTOR — the frozen cross-repo contract
 * instance — additively under build/descriptors/. Two sources, one
 * reader each (decision 48 · 65 guardrail · "emit FROM, never re-author"):
 *
 *   · MAPPING half  — lib/components/<name>/<name>.css @layer blocks.
 *     Each declaration maps to ONE primitive namespace prop (the B1.5 §3
 *     CSS→composition table): background/color → palette · sizing/padding/
 *     radius → box · font → typography · flex/direction/align/justify/gap/
 *     fill → stack · the pressed/scale/opacity/affordance → the derived
 *     `interactive` opt-in. The scale/surface VALUES are read + VALIDATED
 *     (the variant bg/fg ≡ the surface funnel · the press-scale/disabled
 *     ≡ the interaction baseline), then emitted as their SEMANTIC name.
 *   · STRUCTURE half — pages/components/<name>.html data-part anatomy
 *     (decision 24.1). Which parts a component has; the composition
 *     addresses them by name. Un-derivable from CSS (the web is one node)
 *     → the second source.
 *
 * Output shape = the schema at build/descriptors/schema.ts: PURE DATA
 * (no theme thunk · 65.3 §7) `{ structure: { anatomy, base }, variants? }`,
 * each value a SEMANTIC namespace name. The pressed/scale/opacity/affordance
 * collapse to the `interactive` opt-in on the root (Button); IconAvatar /
 * Topbar are static. NO `compoundVariants` — the press transition is no
 * longer data (decision 65 · behaviour ≠ data). The RN factory (B2c·3 ·
 * native · finalized in Expo) interprets it; this repo only emits + proves
 * the contract. Additive — build/palette.ts / tokens.ts / components/* stay
 * byte-identical; only build/descriptors/* re-emits.
 * ────────────────────────────────────────────────────────────── */

import postcss from 'postcss';

// ── The three spike-validated components (65.3) · scope-locked ────────
// Each entry maps a descriptor NAME → its source files + the structure
// role-routing (engine knowledge · cf. derive-button.ts's lookup tables).
// Naming (decision 64.1 · "resolves open choice #3"): the open Button
// primitive takes the `composition-` prefix (bare `button` = the recipe);
// IconAvatar / Topbar keep bare names — their family renames are deferred ·
// P11. (The per-component token emit at build/components/button.ts was a
// separate artifact, retired at Smell-1 · decision 66 arc #0; the descriptor
// emit here is independent and unaffected.)
export const DESCRIPTOR_COMPONENTS = [
  { name: 'composition-button', source: 'button',      kind: 'button',      fgPart: 'label' },
  { name: 'icon-avatar',        source: 'icon-avatar',  kind: 'iconAvatar',  fgPart: 'icon'  },
  { name: 'topbar',             source: 'topbar',       kind: 'topbar',      centerPart: 'content' },
];

// ── Surface funnel · resolver-model §11 · the variant×accent map as data ──
// role → slot → the semantic token (or `transparent` literal) the CSS MUST
// reference for the `palette:{variant}` emit to be FAITHFUL (decision 65.1
// bootstrap). The emitter resolves each variant rule's bg+fg (through the
// component-token alias for Button · directly for IconAvatar) and ASSERTS it
// equals this table, then emits the variant NAME — the colour itself is the
// palette engine's (build/palette.ts · Guard E). A drift (a variant pointing
// at the wrong chrome/accent token, or a pressed bg ≠ the funnel pressedBg)
// throws at build → the gate fails. The VALUES live once in build/tokens.ts.
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

// CSS flex literal → the stack namespace's semantic name (mirrors the
// Stack primitive · stack.css / stack.tsx ALIGN_MAP · JUSTIFY_MAP, reversed).
const ALIGN_IN = { 'flex-start': 'start', center: 'center', 'flex-end': 'end', stretch: 'stretch', baseline: 'baseline' };
const JUSTIFY_IN = { 'flex-start': 'start', center: 'center', 'flex-end': 'end', 'space-between': 'between', 'space-around': 'around' };

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

// A rule's own `--*` custom-property decls → an alias map. Topbar's host
// rule sets `--_inset-start: var(--nuri-space-lg)` LOCALLY (not in @layer
// tokens · skip-emit), so its padding resolves through these (decision 46.1).
function localVars(rule) {
  const out = new Map();
  for (const [prop, value] of rule.decls) {
    if (prop.startsWith('--')) out.set(prop, value);
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
// stepping through one alias hop if present (a Button component-token or a
// Topbar local `--_inset-*`) or returning the directly-referenced semantic
// var (IconAvatar / Topbar surfaces).
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
// A rule whose comma-joined selector list contains `exact` (Topbar's host
// and content pivot are element selectors paired with `:not(:defined)`).
const findByPart = (rules, exact) => rules.find((r) => r.selector.split(',').some((s) => s.trim() === exact));
const camel = (s) => s.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());

// ── value → SEMANTIC name (the emitted leaf / variant) ────────────────

// GEOMETRY · resolve through the alias to a primitive scale var, ASSERT it
// is the expected scale (size / space / radius), return the LEAF name.
function scaleLeaf(declValue, aliases, expectedScale, where) {
  if (declValue === undefined) throw new Error(`[descriptors] ${where}: missing declaration`);
  const sem = resolveSemantic(declValue, aliases);
  const m = sem.match(/^--nuri-(size|space|radius)-(.+)$/);
  if (!m) throw new Error(`[descriptors] ${where}: '${sem}' is not a size/space/radius scale var`);
  if (m[1] !== expectedScale) {
    throw new Error(`[descriptors] ${where}: '${sem}' is the '${m[1]}' scale, expected '${expectedScale}'`);
  }
  return m[2];
}

// COLOUR · ASSERT the resolved bg/fg/pressedBg token equals the surface
// funnel for (role, slot). Validate-only — the emitted form carries the
// variant NAME (palette owns the colour · build/palette.ts).
function assertSurface(role, slot, declValue, aliases, where) {
  const expected = SURFACE[role] && SURFACE[role][slot];
  if (expected === undefined) throw new Error(`[descriptors] no surface mapping for ${role}.${slot} (${where})`);
  if (declValue === undefined) throw new Error(`[descriptors] ${where}: missing ${slot} declaration`);
  const actual = resolveSemantic(declValue, aliases);
  if (actual !== expected) {
    throw new Error(
      `[descriptors] ${where}: surface drift — ${role}.${slot} resolves to ` +
      `'${actual}' but the funnel (resolver-model §11) expects '${expected}'. ` +
      `Fix the CSS or the SURFACE table.`,
    );
  }
}

// INTERACTION · ASSERT the not-colour effect resolves to its interaction
// baseline (`--nuri-interaction-<suffix>` · decision 45). Validate-only —
// the emitted form carries the boolean opt-in (value derived by the engine).
function assertInteraction(declValue, aliases, suffix, where) {
  if (declValue === undefined) throw new Error(`[descriptors] ${where}: missing declaration`);
  const sem = resolveSemantic(declValue, aliases);
  if (sem !== `--nuri-interaction-${suffix}`) {
    throw new Error(`[descriptors] ${where}: expected --nuri-interaction-${suffix}, got '${sem}'`);
  }
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

// A flex rule → the `stack` namespace (mapping align-items / justify-content
// / gap; direction is structure knowledge passed by the caller — Button /
// Topbar are rows, IconAvatar is a single-child centring box · §8).
function stackFromRule(rule, aliases, { direction }, where) {
  const ns = {};
  if (direction) ns.direction = direction;
  const ai = rule.decls.get('align-items');
  if (ai !== undefined) {
    if (!ALIGN_IN[ai]) throw new Error(`[descriptors] ${where}: unknown align-items '${ai}'`);
    ns.align = ALIGN_IN[ai];
  }
  const jc = rule.decls.get('justify-content');
  if (jc !== undefined) {
    if (!JUSTIFY_IN[jc]) throw new Error(`[descriptors] ${where}: unknown justify-content '${jc}'`);
    ns.justify = JUSTIFY_IN[jc];
  }
  const gap = rule.decls.get('gap');
  if (gap !== undefined) ns.gap = scaleLeaf(gap, aliases, 'space', `${where}.gap`);
  return ns;
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
// trailing). Returns the set the descriptor's part targets must be a
// subset of (the renamed/removed-part drift guard · ship item 6).
export function pageParts(html) {
  const block = (html.match(/data-spec="parts"[\s\S]*?<\/dd>/) || [''])[0];
  return [...block.matchAll(/data-part="([^"]+)"/g)].map((m) => m[1]);
}

// ════════════════════════════════════════════════════════════════════
// DERIVE · CSS mapping + page structure → the descriptor IR
// ════════════════════════════════════════════════════════════════════
// IR: { name, source, exportName, typeName, axes,
//       anatomy: PartAnatomy, base: PartMap,
//       variants: { <axis>: { <value>: PartMap } } }
// PartMap = { <part>: NS } · NS = { stack?, box?, typography?, palette?,
//   interactive? } · every value a SEMANTIC name (string) or boolean.

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
      `page or fix the routing (decision 24.1 · the structure source).`,
    );
  }
}

// ── Button · open primitive · stack row + interactive opt-in (base) · variant→palette · size→box+typography ──
function deriveButton(spec, css, html) {
  const aliases = aliasMap(css);
  const rules = rulesInLayer(css, 'rules');
  const parts = pageParts(html);
  assertPart('root', parts, 'button');
  assertPart(spec.fgPart, parts, 'button.label'); // 'label' ⊆ page

  const present = presentValues(rules, 'button'); // spans variant + size
  const variantValues = axisValues(present, VARIANT_ORDER);
  const sizeValues = axisValues(present, SIZE_ORDER);
  assertCovered(present, new Set([...variantValues, ...sizeValues]), 'button');

  // ── structure.base.root · stack (the row layout) ──────────────────
  const baseRule = find(rules, '.nuri-button');
  if (!baseRule) throw new Error('[descriptors] button: no .nuri-button base rule');
  const stack = stackFromRule(baseRule, aliases, { direction: 'row' }, 'button.base');
  if (stack.align !== 'center' || stack.justify !== 'center') {
    throw new Error('[descriptors] button.base: expected align/justify center (the row IS centred)');
  }

  // ── structure.base.root · interactive opt-in (the pressed/scale/disabled
  // channels collapse here · §8 · no compound). Each channel is DERIVED
  // from its live CSS rule, VALIDATED against the contract:
  //   pressColor      ← every `.nuri-button--<v>:active` bg ≡ the funnel pressedBg
  //   pressScale      ← `.nuri-button:active` transform ≡ interaction press-scale
  //   disabledOpacity ← `[disabled]` opacity ≡ interaction disabled-opacity
  for (const v of variantValues) {
    const active = find(rules, `.nuri-button--${v}:active`);
    if (!active) throw new Error(`[descriptors] button: no .nuri-button--${v}:active pressed rule`);
    assertSurface(v, 'pressedBg', active.decls.get('background'), aliases, `button.${v}:active`);
  }
  const press = find(rules, '.nuri-button:active');
  if (!press) throw new Error('[descriptors] button: no .nuri-button:active rule');
  assertInteraction(press.decls.get('transform'), aliases, 'press-scale', 'button:active');
  const disabledRule = rules.find((r) => r.selector.includes('.nuri-button[disabled]') && r.decls.has('opacity'));
  if (!disabledRule) throw new Error('[descriptors] button: no [disabled] opacity rule');
  assertInteraction(disabledRule.decls.get('opacity'), aliases, 'disabled-opacity', 'button[disabled]');

  const base = {
    root: {
      stack,
      interactive: { pressColor: true, pressScale: true, disabledOpacity: true },
    },
  };

  // ── variants.variant → root.palette{variant} (the label fg drops out ·
  // it follows by scope · F-BOX-FG-1 · the factory threads the role-fg ·
  // B2c·3). bg + fg are still READ + VALIDATED (the funnel proof). ──
  const variant = {};
  for (const v of variantValues) {
    const rest = find(rules, `.nuri-button--${v}`);
    const w = `button.variant.${v}`;
    assertSurface(v, 'bg', rest.decls.get('background'), aliases, w);
    assertSurface(v, 'fg', rest.decls.get('color'), aliases, w);
    variant[v] = { root: { palette: { variant: v } } };
  }

  // ── variants.size → root.box{minHeight, paddingX, radius} + label.typography{size} ──
  const size = {};
  for (const s of sizeValues) {
    const rule = find(rules, `.nuri-button--${s}`);
    const w = `button.size.${s}`;
    size[s] = {
      root: {
        box: {
          minHeight: scaleLeaf(rule.decls.get('min-height'), aliases, 'size', `${w}.minHeight`),
          paddingX: scaleLeaf(rule.decls.get('padding'), aliases, 'space', `${w}.paddingX`),
          radius: scaleLeaf(rule.decls.get('border-radius'), aliases, 'radius', `${w}.radius`),
        },
      },
      [spec.fgPart]: { typography: { size: typeStepFrom(rule.decls, w) } },
    };
  }

  return {
    name: spec.name, source: spec.source,
    exportName: exportNameFor(spec.name), typeName: typeNameFor(spec.name),
    axes: { variant: variantValues, size: sizeValues },
    anatomy: { el: 'view', parts: { [spec.fgPart]: { el: 'text' } } },
    base,
    variants: { variant, size },
  };
}

// ── IconAvatar · static · the fixed circle (base) · the full surface incl. `subtle` · NO interactive ──
function deriveIconAvatar(spec, css, html) {
  const aliases = aliasMap(css); // empty by design (decision 50)
  const rules = rulesInLayer(css, 'rules');
  const parts = pageParts(html);
  assertPart('root', parts, 'icon-avatar');
  assertPart(spec.fgPart, parts, 'icon-avatar.icon'); // 'icon' ⊆ page

  const present = presentValues(rules, 'icon-avatar');
  const variantValues = axisValues(present, VARIANT_ORDER);
  assertCovered(present, new Set(variantValues), 'icon-avatar');

  // ── structure.base.root · stack (centring · single child → no direction ·
  // §8) + box (the fixed lg circle · invariant) ──
  const baseRule = find(rules, '.nuri-icon-avatar');
  if (!baseRule) throw new Error('[descriptors] icon-avatar: no .nuri-icon-avatar base rule');
  const stack = stackFromRule(baseRule, aliases, {}, 'icon-avatar.base');
  if (stack.align !== 'center' || stack.justify !== 'center') {
    throw new Error('[descriptors] icon-avatar.base: expected align/justify center');
  }
  const box = {
    width: scaleLeaf(baseRule.decls.get('inline-size'), aliases, 'size', 'icon-avatar.base.width'),
    height: scaleLeaf(baseRule.decls.get('block-size'), aliases, 'size', 'icon-avatar.base.height'),
    radius: scaleLeaf(baseRule.decls.get('border-radius'), aliases, 'radius', 'icon-avatar.base.radius'),
  };

  const variant = {};
  for (const v of variantValues) {
    const rule = find(rules, `.nuri-icon-avatar--${v}`);
    const w = `icon-avatar.variant.${v}`;
    assertSurface(v, 'bg', rule.decls.get('background'), aliases, w);
    assertSurface(v, 'fg', rule.decls.get('color'), aliases, w);
    variant[v] = { root: { palette: { variant: v } } };
  }

  return {
    name: spec.name, source: spec.source,
    exportName: exportNameFor(spec.name), typeName: typeNameFor(spec.name),
    axes: { variant: variantValues },
    anatomy: { el: 'view', parts: { [spec.fgPart]: { el: 'icon' } } },
    base: { root: { stack, box } },
    variants: { variant },
    // No interactive, no variants beyond `variant` · static (65.3 · the IconAvatar story).
  };
}

// ── Topbar · open layout primitive · row chrome + content-pivot (base) · `center` → 100% on the pivot ──
function deriveTopbar(spec, css, html) {
  const aliases = aliasMap(css); // empty by design (skip-emit · decision 37)
  const rules = rulesInLayer(css, 'rules');
  const parts = pageParts(html);
  assertPart(spec.centerPart, parts, 'topbar.center'); // 'content' ⊆ page

  // ── structure.base.root · the chrome row · element selector (comma-joined
  // with `:not(:defined)`). padding resolves through the host's LOCAL
  // `--_inset-*` vars (decision 46.1). ──
  const host = findByPart(rules, 'nuri-topbar');
  if (!host) throw new Error('[descriptors] topbar: no host rule');
  const hostAliases = new Map([...aliases, ...localVars(host)]);
  const stack = stackFromRule(host, hostAliases, { direction: 'row' }, 'topbar.host');
  if (stack.align !== 'center' || stack.gap === undefined) {
    throw new Error('[descriptors] topbar.host: expected align center + gap');
  }
  const box = {
    height: scaleLeaf(host.decls.get('height'), hostAliases, 'size', 'topbar.host.height'),
    paddingStart: scaleLeaf(host.decls.get('padding-inline-start'), hostAliases, 'space', 'topbar.host.paddingStart'),
    paddingEnd: scaleLeaf(host.decls.get('padding-inline-end'), hostAliases, 'space', 'topbar.host.paddingEnd'),
  };
  // chrome · the canvas slot (palette owns it · B1.5 §4.3 · theme-only).
  const bg = resolveSemantic(host.decls.get('background') ?? '', hostAliases);
  if (bg !== '--nuri-bg-canvas') {
    throw new Error(`[descriptors] topbar.host: chrome bg expected --nuri-bg-canvas, got '${bg}'`);
  }

  // ── structure.base.content · the pivot · stack fill grow-shrink ·
  // (`flex:1 1 auto` + `min-inline-size:0` is ANATOMY · §8 · B1.5 §3). ──
  const content = findByPart(rules, 'nuri-topbar-content');
  if (!content) throw new Error('[descriptors] topbar: no content pivot rule');
  const flex = content.decls.get('flex');
  const minInline = content.decls.get('min-inline-size');
  if (flex !== '1 1 auto' || minInline !== '0') {
    throw new Error(
      `[descriptors] topbar.content: expected flex:1 1 auto + min-inline-size:0 ` +
      `(the grow-shrink pivot), got flex:'${flex}' min-inline-size:'${minInline}'`,
    );
  }

  const base = {
    root: { stack, box, palette: { chrome: 'canvas' } },
    [spec.centerPart]: { stack: { fill: 'grow-shrink' } },
  };

  // ── variants.center · the content centres in the pivot (host untouched ·
  // §8 · the part-addressing is unavoidable). The web-only display /
  // text-align literals are dropped; align/justify cross to RN as stack. ──
  const centerRule = rules.find((r) => /\[data-center\]\s*>\s*nuri-topbar-content/.test(r.selector));
  if (!centerRule) throw new Error('[descriptors] topbar: no [data-center] > content rule');
  const centerStack = stackFromRule(centerRule, aliases, {}, 'topbar.center');
  if (centerStack.align === undefined && centerStack.justify === undefined) {
    throw new Error('[descriptors] topbar: [data-center] rule carries no align-items/justify-content');
  }

  return {
    name: spec.name, source: spec.source,
    exportName: exportNameFor(spec.name), typeName: typeNameFor(spec.name),
    axes: { center: ['false', 'true'] },
    anatomy: { el: 'view', open: true, parts: { [spec.centerPart]: { el: 'view' } } },
    base,
    variants: {
      // boolean axis · both keys required: the no-op default `false` is an
      // empty PartMap; `true` patches the content pivot's stack.
      center: {
        false: {},
        true: { [spec.centerPart]: { stack: centerStack } },
      },
    },
  };
}

const DERIVERS = { button: deriveButton, iconAvatar: deriveIconAvatar, topbar: deriveTopbar };

export function deriveDescriptor(spec, { css, html }) {
  const deriver = DERIVERS[spec.kind];
  if (!deriver) throw new Error(`[descriptors] no deriver for kind '${spec.kind}'`);
  return deriver(spec, css, html);
}

// ════════════════════════════════════════════════════════════════════
// RENDER · IR → the descriptor .ts source string (canonical-order →
// byte-stable emit · decision 35 · git diff --exit-code build/)
// ════════════════════════════════════════════════════════════════════

const NS_ORDER = ['stack', 'box', 'typography', 'palette', 'interactive'];
const NS_PROP_ORDER = {
  stack: ['direction', 'align', 'justify', 'gap', 'wrap', 'fill'],
  box: ['width', 'height', 'minHeight', 'padding', 'paddingX', 'paddingY', 'paddingStart', 'paddingEnd', 'paddingTop', 'paddingBottom', 'radius'],
  typography: ['size'],
  palette: ['variant', 'accent', 'muted', 'chrome'],
  interactive: ['pressColor', 'pressScale', 'disabledOpacity'],
};
const PART_ORDER = ['root', 'label', 'icon', 'content'];

const renderVal = (v) => (typeof v === 'boolean' ? String(v) : `'${v}'`);

// one namespace → `stack: { direction: 'row', align: 'center' }` (canonical
// prop order · an unknown prop throws — the schema vocabulary is the guard).
function renderNsBlock(nsName, props) {
  const order = NS_PROP_ORDER[nsName];
  for (const k of Object.keys(props)) {
    if (!order.includes(k)) throw new Error(`[descriptors] unknown ${nsName} prop '${k}'`);
  }
  const inner = order.filter((k) => props[k] !== undefined).map((k) => `${k}: ${renderVal(props[k])}`).join(', ');
  return `${nsName}: { ${inner} }`;
}

// an NS map → `{ stack: {…}, box: {…} }` (canonical namespace order).
function renderNsInline(ns) {
  for (const k of Object.keys(ns)) {
    if (!NS_ORDER.includes(k)) throw new Error(`[descriptors] unknown namespace '${k}'`);
  }
  return `{ ${NS_ORDER.filter((n) => ns[n]).map((n) => renderNsBlock(n, ns[n])).join(', ')} }`;
}

// a PartMap → `{ root: {…}, label: {…} }` (canonical part order) · `{}` empty.
function renderPartMapInline(pm) {
  for (const p of Object.keys(pm)) {
    if (!PART_ORDER.includes(p)) throw new Error(`[descriptors] unknown part '${p}'`);
  }
  const present = PART_ORDER.filter((p) => pm[p]);
  if (!present.length) return '{}';
  return `{ ${present.map((p) => `${p}: ${renderNsInline(pm[p])}`).join(', ')} }`;
}

// a PartAnatomy → `{ el: 'view', open: true, parts: { content: {…} } }`.
function renderAnatomy(a) {
  const segs = [`el: '${a.el}'`];
  if (a.open) segs.push('open: true');
  if (a.parts) {
    const names = PART_ORDER.filter((p) => a.parts[p]);
    segs.push(`parts: { ${names.map((p) => `${p}: ${renderAnatomy(a.parts[p])}`).join(', ')} }`);
  }
  return `{ ${segs.join(', ')} }`;
}

// structure { anatomy, base } · base multi-line (one part / one namespace per
// line · the §8 worked-example layout the build mirrors).
function renderStructureLines(ir) {
  const lines = ['  structure: {', `    anatomy: ${renderAnatomy(ir.anatomy)},`];
  const baseParts = PART_ORDER.filter((p) => ir.base && ir.base[p]);
  if (baseParts.length) {
    lines.push('    base: {');
    for (const part of baseParts) {
      const ns = ir.base[part];
      lines.push(`      ${part}: {`);
      for (const n of NS_ORDER.filter((x) => ns[x])) lines.push(`        ${renderNsBlock(n, ns[n])},`);
      lines.push('      },');
    }
    lines.push('    },');
  }
  lines.push('  },');
  return lines;
}

// variants · each axis value as a compact one-line PartMap.
function renderVariantsLines(ir) {
  const axes = Object.keys(ir.axes);
  if (!axes.length) return [];
  const lines = ['  variants: {'];
  for (const axis of axes) {
    lines.push(`    ${axis}: {`);
    for (const value of ir.axes[axis]) {
      lines.push(`      ${value}: ${renderPartMapInline(ir.variants[axis][value])},`);
    }
    lines.push('    },');
  }
  lines.push('  },');
  return lines;
}

function renderAxesType(typeName, axes) {
  const lines = [`type ${typeName} = {`];
  for (const [axis, values] of Object.entries(axes)) {
    lines.push(`  ${axis}: ${values.map((v) => `'${v}'`).join(' | ')};`);
  }
  lines.push('};');
  return lines.join('\n');
}

function descriptorHeader(ir) {
  return [
    `/* ──────────────────────────────────────────────────────────────`,
    ` * NURI · COMPONENT DESCRIPTOR · ${ir.name.toUpperCase()} · GENERATED · DO NOT EDIT BY HAND`,
    ` *`,
    ` * Sources (decision 65 · the composition model 65.3 · one source, two readers · decision 48):`,
    ` *   · mapping   — lib/components/${ir.source}/${ir.source}.css @layer (axis→namespace values)`,
    ` *   · structure — pages/components/${ir.source}.html data-part anatomy (decision 24.1)`,
    ` * Emitter · pipeline/tokens-parser.js — run \`npm run build\``,
    ` *`,
    ` * PURE DATA (no theme thunk · 65.3 §7): structure { anatomy, base } +`,
    ` * variants, composed from the five primitive namespaces (stack · box ·`,
    ` * typography · palette · interactive · 65.3 §6) in SEMANTIC names. The`,
    ` * platform-native engine resolves them (factory on RN · CSS on web · 65.1);`,
    ` * behaviour (Pressable / press transition / focus / a11y) is the factory's,`,
    ` * never data. NEVER hand-edited — re-emit from the sources above.`,
    ` * ────────────────────────────────────────────────────────────── */`,
  ].join('\n');
}

export function emitDescriptorTs(ir) {
  const lines = [
    descriptorHeader(ir),
    ``,
    `import type { Descriptor } from './schema';`,
    ``,
    renderAxesType(ir.typeName, ir.axes),
    ``,
    `export const ${ir.exportName}: Descriptor<${ir.typeName}> = {`,
    ...renderStructureLines(ir),
    ...renderVariantsLines(ir),
    `};`,
    ``,
  ];
  return lines.join('\n');
}

// ════════════════════════════════════════════════════════════════════
// BROWSER-ESM TWIN · descriptor IR → a browser-loadable .js (decision 67 · S3)
// ════════════════════════════════════════════════════════════════════
// The runtime web factory (lib/runtime/factory.js · the S3 mirror) consumes
// the descriptor IN THE BROWSER to render a de-collapsed nuri-* tree. ES
// modules cannot `import` a .ts at runtime, so the descriptor also emits as
// plain browser ESM — the .ts MINUS the type apparatus (no `import type`, no
// axes type, no `: Descriptor<…>` annotation). The data is byte-for-byte the
// same: SAME IR, SAME canonical-order renderers (renderStructure/Variants),
// so the .js is the .ts with the three TS-only lines removed. This preserves
// the zero-build composition property (decision 66 · what Nuri IS #3): a page
// `import`s the descriptor + the factory and resolves with no build step.

function descriptorHeaderJs(ir) {
  return [
    `/* ──────────────────────────────────────────────────────────────`,
    ` * NURI · COMPONENT DESCRIPTOR · ${ir.name.toUpperCase()} · BROWSER ESM · GENERATED · DO NOT EDIT BY HAND`,
    ` *`,
    ` * The browser-ESM twin of ${ir.name}.ts — IDENTICAL data, emitted from the`,
    ` * SAME IR via the SAME canonical-order renderers, MINUS the TS apparatus`,
    ` * (no \`import type\`, no axes type, no \`: Descriptor<…>\` annotation). A`,
    ` * browser can \`import { ${ir.exportName} }\` from it at runtime with NO build`,
    ` * step — the runtime web factory (lib/runtime/factory.js · the decision-67`,
    ` * S3 mirror) consumes it to render a de-collapsed nuri-* tree, preserving the`,
    ` * zero-build composition property (decision 66 · what Nuri IS #3).`,
    ` *`,
    ` * Sources (decision 65 · the composition model 65.3 · one source, two readers · decision 48):`,
    ` *   · mapping   — lib/components/${ir.source}/${ir.source}.css @layer (axis→namespace values)`,
    ` *   · structure — pages/components/${ir.source}.html data-part anatomy (decision 24.1)`,
    ` * Emitter · pipeline/tokens-parser.js — run \`npm run build\``,
    ` *`,
    ` * Committed (decision 35) · the \`git diff --exit-code build/\` gate covers it.`,
    ` * NEVER hand-edited — re-emit from the sources above.`,
    ` * ────────────────────────────────────────────────────────────── */`,
  ].join('\n');
}

export function emitDescriptorJs(ir) {
  const lines = [
    descriptorHeaderJs(ir),
    ``,
    `export const ${ir.exportName} = {`,
    ...renderStructureLines(ir),
    ...renderVariantsLines(ir),
    `};`,
    ``,
  ];
  return lines.join('\n');
}

// ════════════════════════════════════════════════════════════════════
// SCHEMA emit · copy the hand-maintained pipeline source verbatim,
// rewriting the build-relative tokens import (decision 35).
// ════════════════════════════════════════════════════════════════════

const SCHEMA_HEADER = [
  `/* ──────────────────────────────────────────────────────────────`,
  ` * NURI · DESCRIPTOR SCHEMA · GENERATED · DO NOT EDIT BY HAND`,
  ` *`,
  ` * Source · pipeline/descriptors/schema.ts (the canonical contract · hand-maintained)`,
  ` * Emitter · pipeline/tokens-parser.js — run \`npm run build\``,
  ` *`,
  ` * The FROZEN cross-repo contract type (decision 65 · the composition`,
  ` * model · amendments 65.3 · 65.4 · 65.5 · ratified): a descriptor is PURE`,
  ` * DATA — \`{ structure: { anatomy, base }, variants? }\` — a composition of`,
  ` * the five disjoint primitive namespaces (stack · box · typography ·`,
  ` * palette · interactive · 65.3 §6) in SEMANTIC names, ZERO raw style. The`,
  ` * platform-native engine resolves them (factory on RN · CSS on web · 65.1);`,
  ` * behaviour is the factory's, never data. Reuses the emitted scale types`,
  ` * from ./tokens verbatim (decision 48). Validated by the B1.5 playground`,
  ` * prototype (roadmap/N+19-B1.5.md).`,
  ` *`,
  ` * FROZEN as of B3 (N+19 · decision 65 step 5 · "an enforced freeze, not`,
  ` * honorary"): the schema SHAPE is locked — guarded by Guard F in`,
  ` * pipeline/docs-drift.test.js (the FROZEN_SCHEMA pin). A post-freeze shape`,
  ` * change is DELIBERATE + VERSIONED (update the pin + a 65 amendment · the`,
  ` * version-negotiation machinery lands with the first real bump · P11). The`,
  ` * RN factory relocates to the CI-wired Expo consumer (X-wired · 65.5); this`,
  ` * repo emits + freezes the contract — engine + behaviour are the factory's.`,
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
