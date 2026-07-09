/* ──────────────────────────────────────────────────────────────
 * NURI · @nuri/doc · DOC-GEN (N+22 · decision 66 arc #1 · re-homed N+42 · A4)
 *
 * Renders the per-component DESCRIPTOR IR (the frozen machine-spec ·
 * decision 65 · 65.3) as a just-the-docs Markdown page. READ-ONLY on
 * the descriptor — this is the generation thesis applied to docs: the
 * page is BUILD OUTPUT, regenerated every build, so it cannot drift
 * from the spec the way the old hand-written pages did.
 *
 *   THE BOUNDARY (N+42 · A4 · convergence §5 · decision 75): @nuri/spec
 *   emits pure DATA; transforming data → Markdown is @nuri/doc's job. This
 *   emitter moved OUT of @nuri/spec's pipeline (was parsers/docs.js · re-
 *   sourced onto @nuri/spec's DATA exports, NOT its classifier internals) —
 *   the A3 pattern (each library owns its emitter, reads spec's data) applied
 *   to documentation. The descriptor is the machine-spec (decision 69 · the
 *   SoT); doc-gen reads it + the token data, never re-deriving from CSS.
 *
 * Sources (decision 48 · "emit FROM, never re-author"). @nuri/spec is pure DATA now
 * (N+62 · decision 80); the resolved artifacts live in the two PROJECTIONS, read by
 * relative path via strip.js#loadDataFromPath:
 *   · ir       — the composition descriptor (@nuri/spec/descriptors/<name> · DATA ·
 *                the browser-ESM twin from @nuri/prototype/generated/descriptors/ ·
 *                axes · anatomy · structure.base · variants), reshaped by
 *                descriptor-ir.js#docIrFromDescriptor.
 *   · palette  — the {variant|chrome} → {bg·fg·fgMuted·pressedBg·border} mapping
 *                (@nuri/rn/generated/data/palette.ts · the RN projection). The token-map
 *                table dereferences each `palette:{variant}` node through it to the
 *                resolved TokenPaths.
 *   · tokens   — the size · space · radius · type VALUE maps, derived from
 *                @nuri/rn/generated/data/tokens.ts (the px scales + the type composite)
 *                by buildDocTokenInputs. TWO uses (N+23 · one map): the leaf-
 *                VALIDATION sets (a box/typography leaf the descriptor references but
 *                absent from its scale throws · faithfulness · decision 48) AND the
 *                value SOURCE — the px / type composite the Resolves-to column renders.
 *   · colors   — the default-scope colour resolver (makeColorResolver · N+23):
 *                a palette TokenPath → { var, hex }. The `var` (the live CSS custom
 *                property) comes from @nuri/prototype/generated/token-vars.ts (the
 *                web projection's colour var registry · N+42); the `hex` from
 *                @nuri/rn/generated/data/tokens.ts at the default scope. The swatch reads
 *                `var` LIVE (re-themes with scope); `hex` is the literal at :root.
 *
 *   Output is a pure function of (ir · palette · tokens · colors) — all
 *   @nuri/spec-data-derived through buildDocTokenInputs (the one builder the
 *   doc build AND Guard G call), so the page re-emits byte-identical.
 *
 * SPEC ONLY — no prose (DRY · P11). The page carries the derivable
 * data (axes/API · anatomy · the per-part composition [the Token column] +
 * its resolved values [the Resolves-to column · px · the type composite · the
 * live var() swatch + the default-scope hex] · the interactive opt-ins) plus
 * ONE structural slot — an
 * `## Example` that `{% include %}`s an AUTHORED <nuri-demo> story
 * (a consumer story · decision 57.2 · NOT generated · authored in
 * _includes/demo/<source>.html). The "+" in north-star move 3
 * ("generated data + stories via <nuri-demo>") is two sources; this
 * emitter owns the data half + the slot, the doc package owns the story.
 *
 * Byte-stable (decision 35 · `git diff --exit-code generated/`): canonical
 * part/namespace/prop order, no timestamps, deterministic throughout.
 * ────────────────────────────────────────────────────────────── */

// The default scope every generated swatch + value resolves at: the canonical
// build scope (decision 31 · neutral accent · cream neutral · light theme — the
// scope @nuri/doc's head_custom.html pins, so each live var() swatch coincides
// with its printed hex). In the pre-A4 pipeline these were ACCENTS[0] / THEMES[0]
// (parsers/semantic.js); @nuri/doc reads spec DATA, not the classifier, so the
// canonical default is a local constant (convergence §5 · the post-flip boundary).
const DEFAULT_ACCENT = 'neutral';
const DEFAULT_THEME = 'light';

// ── Canonical orderings · mirror pipeline/parsers/descriptors.js so the
// page's row order matches the descriptor's emit order (byte-stable). The
// topbar regions (leading/center/trailing · the topbar-slots slice) join in
// left→centre→right row order; the leaf parts (label/icon/content) follow. ──
const PART_ORDER = ['root', 'leading', 'center', 'trailing', 'label', 'icon', 'content'];
const NS_ORDER = ['stack', 'box', 'typography', 'palette', 'interactive', 'effect'];
const NS_PROP_ORDER = {
  stack: ['direction', 'align', 'justify', 'gap', 'wrap', 'fill'],
  box: ['width', 'height', 'minHeight', 'minWidth', 'padding', 'paddingX', 'paddingY', 'paddingStart', 'paddingEnd', 'paddingTop', 'paddingBottom', 'radius', 'radiusTop', 'aspectRatio'],
  typography: ['size', 'emphasis'],
  palette: ['variant', 'accent', 'muted', 'chrome'],
  interactive: ['pressColor', 'pressScale', 'disabledOpacity'],
  effect: ['elevation'],
};

// A geometry leaf's scale namespace — engine knowledge (the schema's
// SizeLeaf / SpaceLeaf / RadiusLeaf · mirrors descriptors.js scaleLeaf).
// A prop NOT here is a literal/boolean (stack direction/align/justify/wrap)
// or a type step (typography.size · validated against the `type` scale).
const PROP_SCALE = {
  width: 'size', height: 'size', minHeight: 'size',
  padding: 'space', paddingX: 'space', paddingY: 'space',
  paddingStart: 'space', paddingEnd: 'space', paddingTop: 'space', paddingBottom: 'space',
  radius: 'radius', radiusTop: 'radius',
  aspectRatio: 'ratio',
  gap: 'space',
};

// palette cell channel → its short doc label, in canonical render order
// (mirrors packages/rn/generated/data/palette.ts cell order: bg · fg · fgMuted · pressedBg · border).
const PALETTE_CHANNELS = [['bg', 'bg'], ['fg', 'fg'], ['fgMuted', 'muted'], ['pressedBg', 'pressed'], ['border', 'border']];

// ONE LINE PER ATTRIBUTE in a "Resolves to" cell (operator readability · N+22):
// a `<br>` between attributes, each rendered dt/dd-style — a bold term (the
// prop) + a code value. A real <dl> can't live in a Markdown table cell
// (kramdown escapes block HTML in the span-level cell context · verified),
// but `<br>` + span markdown (`**term**` · `` `value` ``) render cleanly.
const ATTR_SEP = '<br>';
const attr = (term, value) => `**${term}** \`${value}\``;

// The "Resolves to" column marks a literal/flag attribute (a stack enum · an
// interactive opt-in) — no token→value indirection to resolve — with an em dash,
// so the value column aligns line-for-line with the Token column (N+23 · the
// resolved values live in their own column · operator request).
const NO_VALUE = '—';

// A live colour chip — an inline <span> (kramdown passes span-level HTML through
// inside a table cell · N+22) whose background is the LIVE semantic var(), so it
// re-themes with the page/scope rather than baking a literal. `background` is
// either `var(--nuri-…)` (a resolved palette channel) or the literal
// `transparent` (the ghost bg · a bordered empty square). The `.nuri-doc-swatch`
// rule is inlined in _includes/head_custom.html — stable platform glue,
// alongside the nuri-scope/nuri-demo base rules.
const swatch = (background) => `<span class="nuri-doc-swatch" style="background:${background}"></span>`;

// ── Value resolution · the @nuri/spec-DATA inputs the emitter renders (N+23 · re-sourced N+42) ──
// Every "Resolves to" cell carries the RESOLVED value beside the token path —
// a px for geometry, the type composite for typography, a live swatch + default-
// scope hex for colour. Re-sourced at N+42 (A4) onto the resolved DATA artifacts
// instead of the classifier internals; the artifacts moved to the two projections at
// N+62 (decision 80):
//   · @nuri/rn/generated/data/tokens.ts        — { chrome, accent, size, space, radius, type }
//                             (the resolved cross-product + px scales + type composite).
//   · @nuri/prototype/generated/token-vars.ts — { chrome, accent } leaf → CSS var name
//                             (the web projection's colour var registry · swatch reads live).
// buildDocTokenInputs is the SINGLE builder the doc build AND Guard G call, so the
// page re-emits byte-identical (the re-source is behaviour-preserving · decision 48).

// A palette TokenPath ('accent.solid' · 'chrome.bgStrong') → { var, hex }.
//   var — the CSS custom property the live swatch reads, from @nuri/spec/token-vars
//         (the leaf→cssVar registry the cascade emits · NOT hand-kebabed:
//         accent.solid→--nuri-accent-solid keeps its group prefix,
//         chrome.bgStrong→--nuri-bg-strong drops it).
//   hex — the default-scope (neutral + light · the page :root) resolved literal,
//         read from @nuri/spec/tokens at the canonical scope. chrome is theme-only
//         (chrome[theme][leaf]); accent is accent-MAJOR two-layer (N+59 · Slice 3b·1 ·
//         projection model §3): accent[accent][leaf] is a flat hex (theme-invariant)
//         or a {light,dark} pair — collapsed to the default theme, the same composition
//         the runtime does. The live swatch coincides with it at :root (it re-themes
//         away from there).
// Throws on an unresolvable path (faithfulness · decision 48).
export function makeColorResolver(specTokens, tokenVars) {
  return (path) => {
    const [group, leaf] = path.split('.');
    const cssVar = tokenVars[group] && tokenVars[group][leaf];
    if (!cssVar) {
      throw new Error(`[docs] colour path '${path}' has no semantic var (token-vars drift)`);
    }
    let hex;
    if (group === 'accent') {
      const role = specTokens.accent[DEFAULT_ACCENT] && specTokens.accent[DEFAULT_ACCENT][leaf];
      // two-layer: a flat string role is theme-invariant; a {light,dark} pair picks
      // the default theme (the resolved hex is unchanged from the old cross-product cell).
      hex = typeof role === 'string' ? role : role && role[DEFAULT_THEME];
    } else {
      const slice = specTokens[group] && specTokens[group][DEFAULT_THEME];
      hex = slice && slice[leaf];
    }
    if (hex == null) {
      throw new Error(`[docs] colour path '${path}' (${cssVar}) dangled at the default scope`);
    }
    return { var: cssVar, hex };
  };
}

// A palette-surface L2 role NAME ('bg-strong' · 'accent-solid') → { var, hex } (N+43 ·
// the axis-doc palette swatches). palette-surface.ts paints a node with the FINAL role
// name — the emit prefixes `--nuri-` → var(--nuri-<role>) — so `var` = `--nuri-<role>`,
// and the hex is the default-scope literal that var resolves to. REUSES the N+22 TokenPath
// resolver (makeColorResolver) via a var-keyed reverse map over the SAME token-vars
// registry, NOT a hand re-derivation of spec's group/camel convention in doc (the N+42
// boundary · the var spelling is spec's data · convergence §5). Throws on a role with no
// matching var (faithfulness · decision 48).
export function makeRoleResolver(specTokens, tokenVars) {
  const fromPath = makeColorResolver(specTokens, tokenVars);
  const hexByVar = {};
  for (const group of Object.keys(tokenVars)) {
    for (const leaf of Object.keys(tokenVars[group])) {
      const { var: cssVar, hex } = fromPath(`${group}.${leaf}`);
      hexByVar[cssVar] = hex;
    }
  }
  return (role) => {
    const cssVar = `--nuri-${role}`;
    if (!(cssVar in hexByVar)) {
      throw new Error(`[docs] palette role '${role}' has no semantic var (${cssVar}) — palette-surface/token-vars drift`);
    }
    return { var: cssVar, hex: hexByVar[cssVar] };
  };
}

// Build the value-bearing emitter inputs from @nuri/spec's token DATA. Dimension
// values follow the same spelling as CSS: pixel dimensions render Npx except 0,
// ratio renders bare numbers. `type` is the full type scale.
export function buildDocTokenInputs(specTokens, tokenVars) {
  const px = (scale) =>
    Object.fromEntries(Object.entries(scale).map(([leaf, v]) => [leaf, v === 0 ? '0' : `${v}px`]));
  const bare = (scale) =>
    Object.fromEntries(Object.entries(scale).map(([leaf, v]) => [leaf, `${v}`]));
  return {
    tokens: {
      size: px(specTokens.size),
      space: px(specTokens.space),
      radius: px(specTokens.radius),
      ratio: bare(specTokens.ratio),
      border: px(specTokens.border),
      type: specTokens.type,
      emphasisWeight: specTokens.emphasisWeight, // the orthogonal weight override (decision 77)
    },
    colors: makeColorResolver(specTokens, tokenVars),
  };
}

// nav_order per component source (the website slice grows this as coverage
// does · P11). default 1 for an un-listed source.
const NAV_ORDER = {
  button: 1,
  alert: 2,
  'icon-button': 3,
  'icon-avatar': 4,
  list: 5,
  'list-action': 6,
  'text-field': 7,
  'tab-bar': 8,
  'tab-bar-item': 9,
  topbar: 10,
  stack: 11,
  view: 12,
  typography: 13,
  icon: 14,
  pressable: 15,
  screen: 16,
  header: 17,
  scroll: 18,
  footer: 19,
  dock: 20,
  separator: 21,
  'bottom-sheet': 22,
  'bottom-sheet-panel': 23,
};

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const titleFor = (source) => source.split('-').map(cap).join(' ');

// `tokens` is OPTIONAL; when present, assert the leaf lives in its scale.
// Accepts a Set or a plain object (Object.hasOwn) per scale.
function assertLeaf(tokens, scale, leaf, where) {
  if (!tokens || !tokens[scale]) return;
  const set = tokens[scale];
  const has = set instanceof Set ? set.has(leaf) : Object.prototype.hasOwnProperty.call(set, leaf);
  if (!has) {
    throw new Error(`[docs] ${where}: leaf '${leaf}' is absent from the '${scale}' scale (descriptor/scale drift)`);
  }
}

// palette node ({ variant } | { chrome }) → { token, value } cell pair: the
// channel TokenPaths dereferenced through packages/rn/generated/data/palette.ts (token column) and
// the live var() swatch + default-scope hex (value column), one channel per
// line (dt/dd style · the two columns align line-for-line).
function renderPalette(ns, palette, colors, where) {
  let cells;
  if (ns.variant !== undefined) cells = palette.variant[ns.variant];
  else if (ns.chrome !== undefined) cells = palette.chrome[ns.chrome];
  if (!cells) {
    throw new Error(`[docs] ${where}: no palette cell for ${JSON.stringify(ns)} (palette.ts drift)`);
  }
  const toks = [], vals = [];
  for (const [key, label] of PALETTE_CHANNELS) {
    if (cells[key] === undefined) continue;
    const { token, value } = renderChannel(label, cells[key], colors);
    toks.push(token); vals.push(value);
  }
  return { token: toks.join(ATTR_SEP), value: vals.join(ATTR_SEP) };
}

// One palette channel → { token, value }: token = the bold label + the channel
// TokenPath (or the literal 'transparent' for the ghost bg); value = a live
// var() swatch + the default-scope hex. transparent is the special case
// (decision 30 · the ghostBg literal): the swatch is the bordered empty square,
// no hex.
function renderChannel(label, value, colors) {
  // A palette cell is a STRUCTURAL colour ref `{ group, leaf }` (SEED-4 · the RN
  // mapping retyped) or a verbatim literal (ghost's 'transparent'). Normalize a
  // ref back to its dotted path for the token column + the resolver, so the doc
  // output stays byte-identical to the old TokenPath-string emit.
  const path = value && typeof value === 'object' ? `${value.group}.${value.leaf}` : value;
  if (path === 'transparent') {
    return { token: attr(label, path), value: swatch('transparent') };
  }
  const { var: cssVar, hex } = colors(path);
  return { token: attr(label, path), value: `${swatch(`var(${cssVar})`)} \`${hex}\`` };
}

// one namespace → { token, value } — the two parallel cell strings (the Token
// column + the Resolves-to column), one attribute per line in canonical prop
// order. token = the composition (the bold term + its token-path / literal /
// flag); value = the CONCRETE resolution (the scale px · the type composite ·
// the colour swatch + hex), or NO_VALUE for a literal/flag (no indirection).
function renderNsDetail(nsName, ns, { palette, tokens, colors }, where) {
  if (nsName === 'palette') return renderPalette(ns, palette, colors, where);
  if (nsName === 'interactive') {
    const flags = NS_PROP_ORDER.interactive.filter((f) => ns[f]);
    return {
      token: flags.map((f) => `\`${f}\``).join(ATTR_SEP),
      value: flags.map(() => NO_VALUE).join(ATTR_SEP),
    };
  }
  if (nsName === 'typography') {
    assertLeaf(tokens, 'type', ns.size, `${where}.typography.size`);
    // Two ORTHOGONAL inputs (decision 77 · the N+45 de-fusion): the `size` token
    // + the `emphasis` flag. The resolved composite (decision 54) is the size
    // step's metrics with the weight swapped to emphasisWeight when emphasis —
    // every field on its own dt/dd line in the value column. Computed-equivalent:
    // the weight is the SAME value the old fused `${size}Em` step carried.
    const step = tokens.type[ns.size];
    const weight = ns.emphasis ? tokens.emphasisWeight : step.fontWeight;
    const toks = [attr('size', ns.size)];
    if (ns.emphasis) toks.push(attr('emphasis', 'true'));
    return {
      token: toks.join(ATTR_SEP),
      value: [
        attr('fontSize', step.fontSize),
        attr('lineHeight', step.lineHeight),
        attr('weight', weight),
        attr('letterSpacing', step.letterSpacing),
      ].join(ATTR_SEP),
    };
  }
  // stack | box · prop → scale-path + the resolved px, or a literal (NO_VALUE)
  const toks = [], vals = [];
  for (const prop of NS_PROP_ORDER[nsName]) {
    if (ns[prop] === undefined) continue;
    const scale = PROP_SCALE[prop];
    if (scale) {
      assertLeaf(tokens, scale, ns[prop], `${where}.${nsName}.${prop}`);
      toks.push(attr(prop, `${scale}.${ns[prop]}`));
      vals.push(`\`${tokens[scale][ns[prop]]}\``);
    } else {
      toks.push(attr(prop, ns[prop]));
      vals.push(NO_VALUE);
    }
  }
  return { token: toks.join(ATTR_SEP), value: vals.join(ATTR_SEP) };
}

// a PartMap → [[part, nsName, token, value], …] in canonical part × namespace
// order. token = the composition column, value = the resolved-value column.
function compositionRows(partMap, opts, where) {
  const rows = [];
  if (!partMap) return rows;
  for (const part of PART_ORDER) {
    const ns = partMap[part];
    if (!ns) continue;
    for (const nsName of NS_ORDER) {
      if (!ns[nsName]) continue;
      const { token, value } = renderNsDetail(nsName, ns[nsName], opts, `${where}.${part}`);
      rows.push([part, nsName, token, value]);
    }
  }
  return rows;
}

// the anatomy el-tree → a nested bullet list (root host + one level of parts ·
// Button/IconAvatar/Topbar are single-level · deeper nesting is P11-deferred).
function renderAnatomyLines(ir) {
  const a = ir.anatomy;
  const open = a.open ? ' · `open`' : '';
  const label = (node) => node.component ? `component:${node.component}` : node.el;
  const out = [`- **root** · \`${label(a)}\`${open}`];
  const parts = a.parts || {};
  for (const p of PART_ORDER) {
    if (p === 'root' || !parts[p]) continue;
    out.push(`  - **${p}** · \`${label(parts[p])}\``);
  }
  return out;
}

// ── just-the-docs front-matter + the GENERATED provenance header · SHARED by the
// component (emitDocPage) + axis (emitAxisPage) emitters. RE-PATHED at N+43 (A4b) to
// the @nuri/doc home: the emitter moved OUT of @nuri/spec at A4 (decision 75), so the
// header now cites packages/doc/pipeline/docs.js · `npm run build -w @nuri/doc` (was
// the stale pre-move pipeline/parsers/docs.js · `npm run build -w @nuri/spec`, kept
// verbatim through A4 to preserve that session's byte-identical proof · the N+42
// Known/deferred carry). `source` is the SoT the page is generated FROM. ──
function frontMatter(title, navOrder) {
  return ['---', `title: ${title}`, 'layout: default', `nav_order: ${navOrder}`, '---', ''];
}
function genHeader(source) {
  return [
    `<!-- GENERATED · DO NOT EDIT BY HAND · source: ${source}`,
    '     emitter: packages/doc/pipeline/docs.js · re-emit: `npm run build -w @nuri/doc` -->',
  ];
}

const tableCode = (value) => `\`${String(value).replace(/\|/g, '\\|')}\``;
const apiTableCode = (value) => `\`${String(value)}\``;

// ════════════════════════════════════════════════════════════════════
// EMIT · the descriptor IR → the just-the-docs Markdown page string
// ════════════════════════════════════════════════════════════════════
export function emitDocPage(ir, opts = {}) {
  const { palette, tokens, colors } = opts;
  if (!palette) throw new Error('[docs] emitDocPage requires { palette } — the variant derefs resolve through it');
  if (!tokens) throw new Error('[docs] emitDocPage requires { tokens } — the box/typography cells resolve their value (px · composite) through the scale maps');
  if (!colors) throw new Error('[docs] emitDocPage requires { colors } — the palette swatches resolve their var + default-scope hex through it');
  const title = titleFor(ir.source);
  const lines = [];

  // ── just-the-docs front-matter + the GENERATED provenance header (shared · re-pathed) ──
  lines.push(...frontMatter(title, NAV_ORDER[ir.source] ?? 1));
  lines.push(...genHeader(`packages/spec/components/${ir.name}.ts`));
  lines.push('');
  lines.push(`# ${title}`);
  lines.push('');

  // ── Example · the authored <nuri-demo> story slot (decision 57.2 ·
  // composing isn't DS work · the story lives in website/_includes). ──
  lines.push('## Example');
  lines.push('');
  lines.push(`{% include demo/${ir.source}.html %}`);
  lines.push('');

  // ── API · the axes (axis → its values) ──
  lines.push('## API');
  lines.push('');
  lines.push('| Axis | Values |');
  lines.push('| --- | --- |');
  for (const axis of Object.keys(ir.axes)) {
    lines.push(`| \`${axis}\` | ${ir.axes[axis].map((v) => `\`${v}\``).join(' · ')} |`);
  }
  lines.push('');

  // ── Anatomy · the el part tree ──
  lines.push('## Anatomy');
  lines.push('');
  for (const l of renderAnatomyLines(ir)) lines.push(l);
  lines.push('');

  // ── Base · the invariant composition (structure.base · incl. the
  // interactive opt-ins · §8 · the locked defaults) ──
  const baseRows = compositionRows(ir.base, opts, 'base');
  if (baseRows.length) {
    lines.push('## Base');
    lines.push('');
    lines.push('| Part | Namespace | Token | Resolves to |');
    lines.push('| --- | --- | --- | --- |');
    for (const [part, nsName, token, value] of baseRows) {
      lines.push(`| \`${part}\` | \`${nsName}\` | ${token} | ${value} |`);
    }
    lines.push('');
  }

  // ── Token map · per axis value → the per-part namespace composition. The
  // Token column carries the semantic composition (variant → palette.ts derefs ·
  // box/typography → scale leaves); the Resolves-to column carries its CONCRETE
  // value (the swatch + hex · the px · the type composite). The agent-critical
  // surface, generated. ──
  lines.push('## Token map');
  lines.push('');
  lines.push('| Axis | Value | Part | Namespace | Token | Resolves to |');
  lines.push('| --- | --- | --- | --- | --- | --- |');
  for (const axis of Object.keys(ir.axes)) {
    for (const value of ir.axes[axis]) {
      const pm = ir.variants && ir.variants[axis] && ir.variants[axis][value];
      for (const [part, nsName, token, resolved] of compositionRows(pm, opts, `${axis}.${value}`)) {
        lines.push(`| \`${axis}\` | \`${value}\` | \`${part}\` | \`${nsName}\` | ${token} | ${resolved} |`);
      }
    }
  }
  lines.push('');

  return lines.join('\n');
}

// ════════════════════════════════════════════════════════════════════
// EMIT · generated RN component prop type → API-only pilot page
// ════════════════════════════════════════════════════════════════════
function renderApiPropTable(lines, apiType) {
  lines.push('| Prop | Required | Type | Notes |');
  lines.push('| --- | --- | --- | --- |');
  for (const prop of apiType.props) {
    lines.push(`| \`${prop.name}\` | ${prop.required ? 'yes' : 'no'} | ${apiTableCode(prop.type)} | ${prop.note} |`);
  }
  lines.push('');
  for (const prop of apiType.forbidden || []) {
    lines.push(`> \`${prop.name}\` is not accepted (${apiTableCode(`${prop.name}?: ${prop.type}`)}).`);
    lines.push('');
  }
}

export function emitComponentApiPage(ir) {
  const title = ir.title || titleFor(ir.source);
  const lines = [];
  const apiTypes = ir.types || [{ typeName: ir.typeName, props: ir.props, forbidden: ir.forbidden }];
  lines.push(...frontMatter(title, ir.nav ?? NAV_ORDER[ir.source] ?? 1));
  lines.push(...genHeader(ir.src));
  lines.push('');
  lines.push(`# ${title}`);
  lines.push('');
  lines.push('## API');
  lines.push('');
  for (const apiType of apiTypes) {
    if (apiTypes.length > 1) {
      lines.push(`### ${apiType.typeName}`);
      lines.push('');
    }
    renderApiPropTable(lines, apiType);
  }
  return lines.join('\n');
}

// ════════════════════════════════════════════════════════════════════
// EMIT · the AXIS IR → the just-the-docs Markdown page string (N+43 · A4b)
// ════════════════════════════════════════════════════════════════════
// The axis-family sibling of emitDocPage. The 5 namespace axes are BESPOKE
// (decision 73), so each IR kind renders its own natural shape (axis-ir.js builds
// them): `fields` (box/stack · the spelling table) · `palette` (the role table with
// resolving swatches) · `interactive` (the agnostic opt-in set + the demoted web-only
// chrome) · `typography` (size + emphasis + the wrapper). Pure function of (ir · the manifest's
// nav/src/lead) → byte-stable (decision 35 · the doc CI gate).
export function emitAxisPage(ir, { nav, src, lead } = {}) {
  const title = titleFor(ir.source);
  const lines = [];
  lines.push(...frontMatter(title, nav));
  lines.push(...genHeader(src));
  lines.push('');
  lines.push(`# ${title}`);
  lines.push('');
  if (lead) {
    lines.push(lead);
    lines.push('');
  }
  if (ir.kind === 'fields') renderFields(ir, lines);
  else if (ir.kind === 'palette') renderPaletteAxis(ir, lines);
  else if (ir.kind === 'interactive') renderInteractive(ir, lines);
  else if (ir.kind === 'typography') renderTypography(ir, lines);
  else throw new Error(`[docs] emitAxisPage: unknown axis kind '${ir.kind}'`);
  return lines.join('\n');
}

// A list of [property, value] decls → one `prop: value` per line (the interactive /
// typography Declarations cell · dt/dd style · the <br> the component cells use).
function renderDecls(decls) {
  return decls.map(([prop, value]) => `\`${prop}: ${value}\``).join(ATTR_SEP);
}

// ── box / stack · the agnostic Field table: each input → its CSS + RN property
// name + the value-SOURCE (the `via`). The mechanism-divergent `fill`/expand arm
// (no registry entry · rn=null) renders `—` for RN + a caption (decision 73 cl.2). ──
function renderFields(ir, lines) {
  lines.push('## Fields');
  lines.push('');
  lines.push('| Input | Web | RN | Value |');
  lines.push('| --- | --- | --- | --- |');
  for (const r of ir.rows) {
    const rn = r.rn ? `\`${r.rn}\`` : NO_VALUE;
    lines.push(`| \`${r.input}\` | \`${r.css}\` | ${rn} | ${renderFieldValue(r.via, r.detail)} |`);
  }
  lines.push('');
  if (ir.hasExpand) {
    lines.push('> **`fill`** is the mechanism-divergent `expand` arm (decision 73 cl.2) — not a');
    lines.push('> property-spelling entry: web is the `flex` shorthand, RN a multi-prop `ViewStyle`');
    lines.push('> set (the per-value expansion in the Value column).');
    lines.push('');
  }
}

// the Value cell per `via`: a scale NAME (resolved at A4c · not here) · a keyword
// map · a literal passthrough · a flag's on/off · the expand cases (RN-spelled).
function renderFieldValue(via, detail) {
  switch (via) {
    case 'scale':
    case 'scaleMulti':
      return `\`${detail.scale}\` scale`;
    case 'literal':
      return 'passthrough';
    case 'keyword':
      return Object.entries(detail.map).map(([k, v]) => `\`${k}\` → \`${v}\``).join(ATTR_SEP);
    case 'flag':
      return `\`${detail.on}\` / \`${detail.off}\``;
    case 'expand':
    case 'childFill':
      return Object.entries(detail.cases)
        .map(([name, props]) => `\`${name}\` → ${Object.entries(props).map(([k, v]) => `\`${k}: ${v}\``).join(' · ')}`)
        .join(ATTR_SEP);
    default:
      throw new Error(`[docs] renderFieldValue: unknown via '${via}'`);
  }
}

// ── palette · the SURFACE role table, split by the two mutually-exclusive dispatch
// axes (variant XOR chrome). Each channel cell = a live var() swatch + the role NAME
// + the default-scope hex (the complete pair · the component-page swatch style). ──
function renderPaletteAxis(ir, lines) {
  for (const [heading, rows] of [['Variant', ir.variant], ['Chrome', ir.chrome]]) {
    lines.push(`## ${heading}`);
    lines.push('');
    lines.push(`| ${heading} | Background | Foreground | Pressed | Border |`);
    lines.push('| --- | --- | --- | --- | --- |');
    for (const row of rows) {
      lines.push(`| \`${row.input}\` | ${channelCell(row.bg)} | ${channelCell(row.fg)} | ${channelCell(row.pressed)} | ${channelCell(row.border)} |`);
    }
    lines.push('');
  }
}

// one palette channel → its cell. null (absent · fg-only / no-pressed) → the em
// dash; a { literal } (ghost's transparent) → a bordered empty swatch + the literal
// (no hex); a resolved role → the live var() swatch + the role NAME + the hex.
function channelCell(ch) {
  if (ch === null) return NO_VALUE;
  if (ch.literal !== undefined) return `${swatch(ch.literal)} \`${ch.literal}\``;
  return `${swatch(`var(${ch.var})`)} \`${ch.role}\` \`${ch.hex}\``;
}

// ── interactive (§76 · the fan-out · SEED-1a: spec `opts` + prototype web projection)
// · TWO sections, mirroring typography's de-fusion shape:
//   · Effects — the AGNOSTIC axis (the 3 opt-ins) on the locked `| Input | Web | RN |
//               Value |` grammar: the web realization (assembled selector → decls, or a
//               palette cross-ref where the rule lives in palette) · the RN realization
//               (the documented `prop ← source` convention) · the gate (Value column).
//   · Chrome  — the demoted web-only realization support (affordance · focus · the
//               disabled guard · no agnostic input · no RN analog), reusing the
//               `## Wrapper` shape. The load-bearing order note demotes into it as a
//               one-line caption (the N+46 precedent: a web-cascade mechanic has no
//               place on the agnostic table). ──
function renderInteractive(ir, lines) {
  lines.push('## Effects');
  lines.push('');
  lines.push('| Input | Web | RN | Value |');
  lines.push('| --- | --- | --- | --- |');
  for (const r of ir.opts) {
    lines.push(`| \`${r.input}\` | ${renderOptWeb(r.web)} | \`${r.rn}\` | ${renderGate(r.gate)} |`);
  }
  lines.push('');
  lines.push('## Chrome');
  lines.push('');
  lines.push('| Channel | Selector | Declarations |');
  lines.push('| --- | --- | --- |');
  for (const r of ir.chrome) {
    lines.push(`| \`${r.name}\` | \`${r.selector}\` | ${renderDecls(r.decls)} |`);
  }
  lines.push('');
  lines.push('> The `nuri-interactive` chrome is **web-only** realization support (cursor + transition');
  lines.push('> affordance · the focus ring · the disabled-state guard) — no agnostic input, no RN');
  lines.push('> analog, so it is not part of the `Effects` axis above.');
  lines.push('');
  if (ir.order.length >= 2) {
    const [first, second] = ir.order;
    lines.push(`> \`${first}\` and \`${second}\` both set \`transform\` at equal specificity, so source order`);
    lines.push(`> decides: \`${second}\` is emitted last, so a disabled control reverts the press-scale`);
    lines.push('> (never scales).');
    lines.push('');
  }
}

// the agnostic Web cell for an interactive opt: the assembled selector → its decls, or
// a palette cross-ref where the web rule lives in palette (pressColor's :active bg swap).
function renderOptWeb(web) {
  if (web.palette) return '→ palette (`:active` bg swap)';
  return `\`${web.selector}\` → ${renderDecls(web.decls)}`;
}

// the Gate cell: automatic, or an author opt-in via a data-* attribute.
function renderGate(gate) {
  return gate.kind === 'opt-in' ? `opt-in · \`${gate.attr}\`` : 'automatic';
}

// ── typography (decision 77 · the de-fusion · the SPIKE of the agnostic axis-doc
// grammar) · THREE sections. The PRIMARY axis is two orthogonal inputs, each on the
// `| Input | Web | RN | Value |` grammar the other 4 axes adopt next (the fan-out):
//   · Size     — the 6 type-steps → web `[data-type-style]` / RN typeStyle · the Value
//                a REFERENCE to the type SCALE (Foundations · A4c · not restated).
//   · Emphasis — the orthogonal boolean → web `[data-type-emphasis]` / RN typeStyle's
//                2nd arg · the de-fusion made visible (1 boolean × 6 sizes, not 12 keys).
// SECONDARY — the web-only `nuri-typography` WRAPPER dispatch (muted + align · a REAL
// element, no RN analog). The wrapper note is the ONE honest framing the table shape
// can't carry on its own (no RN column ≠ "web-only" to a skimming reader). ──
function renderTypography(ir, lines) {
  lines.push('## Size');
  lines.push('');
  lines.push('| Input | Web | RN | Value |');
  lines.push('| --- | --- | --- | --- |');
  for (const r of ir.size) {
    lines.push(`| \`${r.input}\` | \`${r.web}\` | \`${r.rn}\` | \`type\` scale |`);
  }
  lines.push('');
  lines.push('## Emphasis');
  lines.push('');
  lines.push('| Input | Web | RN | Value |');
  lines.push('| --- | --- | --- | --- |');
  const e = ir.emphasis;
  lines.push(`| \`${e.input}\` | \`${e.web}\` | \`${e.rn}\` | ${e.value} |`);
  lines.push('');
  lines.push('## Wrapper');
  lines.push('');
  lines.push('| Channel | Selector | Declarations |');
  lines.push('| --- | --- | --- |');
  for (const r of ir.wrapper) {
    lines.push(`| \`${r.name}\` | \`${r.selector}\` | ${renderDecls(r.decls)} |`);
  }
  lines.push('');
  lines.push(`> The \`${ir.element}\` element is a **web-only** prose wrapper (muted tone + block`);
  lines.push('> alignment · no RN analog). It is not part of the `size`/`emphasis` axis above.');
  lines.push('');
}

// ════════════════════════════════════════════════════════════════════
// EMIT · the FOUNDATIONS IR → the just-the-docs Markdown page string (N+48 · A4c)
// ════════════════════════════════════════════════════════════════════
// The foundations-family sibling of emitDocPage / emitAxisPage. The token vocabulary
// is TARGET-NEUTRAL (a px, a hex — same on both targets), so each page is a RESOLVING-
// VALUE table (the palette idiom: input → the `{ref}` cascade → the resolved value +
// swatch), AGNOSTIC by nature — NO `Input | Web | RN | Value` grammar. Three subjects,
// three shapes (foundations-ir.js builds them): `dimension` (the px primitives + the
// scale cascades) · `colour` (the primitive ramps + the semantic role matrix) ·
// `typography` (the type-step composites + the emphasis override). Pure function of
// (ir · the manifest's nav/src/lead) → byte-stable (decision 35 · the doc CI gate).
export function emitFoundationPage(ir, { nav, src, lead } = {}) {
  const title = titleFor(ir.source);
  const lines = [];
  lines.push(...frontMatter(title, nav));
  lines.push(...genHeader(src));
  lines.push('');
  lines.push(`# ${title}`);
  lines.push('');
  if (lead) {
    lines.push(lead);
    lines.push('');
  }
  if (ir.kind === 'dimension') renderDimension(ir, lines);
  else if (ir.kind === 'colour-primitive') renderColourPrimitive(ir, lines);
  else if (ir.kind === 'colour-semantic') renderColourSemantic(ir, lines);
  else if (ir.kind === 'typography') renderTypographyScale(ir, lines);
  else throw new Error(`[docs] emitFoundationPage: unknown foundation kind '${ir.kind}'`);
  return lines.join('\n');
}

// ── dimension · direct semantic scales. Each leaf renders its source posture
// (`literal`) beside the resolved value. ──
function renderDimension(ir, lines) {
  if (ir.primitives.length) {
    lines.push('## Primitives');
    lines.push('');
    lines.push('| Token | Value |');
    lines.push('| --- | --- |');
    for (const p of ir.primitives) {
      lines.push(`| \`${p.token}\` | \`${p.value}\` |`);
    }
    lines.push('');
  }
  for (const scale of ir.scales) {
    lines.push(`## ${cap(scale.name)}`);
    lines.push('');
    lines.push('| Token | Cascade | Value |');
    lines.push('| --- | --- | --- |');
    for (const r of scale.rows) {
      const cascade = r.cascade.literal ? '`literal`' : `\`${r.cascade.ref}\``;
      lines.push(`| \`${r.token}\` | ${cascade} | \`${r.value}\` |`);
    }
    lines.push('');
  }
}

// ── colour · primitives · theme-fixed LITERAL swatches (the raw catalog · one `##`
// per ramp · cream + lilac as light/dark pairs, the alpha overlays as one column). ──
function renderColourPrimitive(ir, lines) {
  for (const ramp of ir.ramps) {
    lines.push(`## ${ramp.name}`);
    lines.push('');
    if (ramp.mode === 'themed') {
      lines.push('| Step | Light | Dark |');
      lines.push('| --- | --- | --- |');
      for (const r of ramp.rows) {
        lines.push(`| \`${r.step}\` | ${swatch(r.light)} \`${r.light}\` | ${swatch(r.dark)} \`${r.dark}\` |`);
      }
    } else {
      lines.push('| Step | Value |');
      lines.push('| --- | --- |');
      for (const r of ramp.rows) {
        lines.push(`| \`${r.step}\` | ${swatch(r.value)} \`${r.value}\` |`);
      }
    }
    lines.push('');
  }
}

// ── colour · semantics · the role matrix with LIVE var() swatches (one `##` per
// group · the `{ref}` cascade pointer + the resolved default-scope hex · the slice the
// palette axis samples). ──
function renderColourSemantic(ir, lines) {
  for (const group of ir.semantics) {
    lines.push(`## ${group.name}`);
    lines.push('');
    lines.push('| Role | Cascade | Resolves to |');
    lines.push('| --- | --- | --- |');
    for (const r of group.rows) {
      lines.push(`| \`${r.role}\` | \`${r.cascade}\` | ${swatch(`var(${r.var})`)} \`${r.hex}\` |`);
    }
    lines.push('');
  }
}

// ── typography · the type-scale composite (one row per step · the metrics carry their
// unit in the column header · the values are the verbatim DATA projection) + the
// orthogonal emphasis override as a note (decision 77 · NOT a per-size step · contrast
// the old fused `${size}Em` twins). The scale itself stays CSS-SoT (the lead's note). ──
function renderTypographyScale(ir, lines) {
  lines.push('## Scale');
  lines.push('');
  lines.push('| Step | Font size (px) | Line height | Weight | Letter spacing (em) |');
  lines.push('| --- | --- | --- | --- | --- |');
  for (const s of ir.steps) {
    lines.push(`| \`${s.step}\` | \`${s.fontSize}\` | \`${s.lineHeight}\` | \`${s.weight}\` | \`${s.letterSpacing}\` |`);
  }
  lines.push('');
  lines.push('## Emphasis');
  lines.push('');
  lines.push(`> **\`emphasis\`** is an orthogonal boolean (decision 77 · the N+45 de-fusion): it swaps`);
  lines.push(`> every step's weight to \`${ir.emphasisWeight}\` (\`emphasisWeight\`), uniform across all six`);
  lines.push('> sizes — not a separate per-size step (contrast the old fused `${size}Em` twins). RN');
  lines.push('> applies it via `typeStyle(size, true)`; web via the source-order-last');
  lines.push('> `[data-type-emphasis]` rule.');
  lines.push('');
}
