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
 * Sources — all @nuri/spec DATA exports (decision 48 · "emit FROM, never re-author"):
 *   · ir       — the composition descriptor (@nuri/spec/descriptors/<name> ·
 *                the browser-ESM twin · axes · anatomy · structure.base ·
 *                variants), reshaped by descriptor-ir.js#docIrFromDescriptor.
 *   · palette  — the {variant|chrome} → {bg·fg·fgMuted·pressedBg} mapping
 *                (@nuri/spec/palette · build/palette.ts). The token-map table
 *                dereferences each `palette:{variant}` node through it to the
 *                resolved TokenPaths.
 *   · tokens   — the size · space · radius · type VALUE maps, derived from
 *                @nuri/spec/tokens (build/tokens.ts · the px scales + the type
 *                composite) by buildDocTokenInputs. TWO uses (N+23 · one map):
 *                the leaf-VALIDATION sets (a box/typography leaf the descriptor
 *                references but absent from its scale throws · faithfulness ·
 *                decision 48) AND the value SOURCE — the px / type composite
 *                the Resolves-to column renders.
 *   · colors   — the default-scope colour resolver (makeColorResolver · N+23):
 *                a palette TokenPath → { var, hex }. The `var` (the live CSS
 *                custom property) comes from @nuri/spec/token-vars (the colour
 *                var registry · N+42); the `hex` from @nuri/spec/tokens at the
 *                default scope. The swatch reads `var` LIVE (re-themes with
 *                scope); `hex` is the literal it coincides with at the page :root.
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
// page's row order matches the descriptor's emit order (byte-stable). ──
const PART_ORDER = ['root', 'label', 'icon', 'content'];
const NS_ORDER = ['stack', 'box', 'typography', 'palette', 'interactive'];
const NS_PROP_ORDER = {
  stack: ['direction', 'align', 'justify', 'gap', 'wrap', 'fill'],
  box: ['width', 'height', 'minHeight', 'padding', 'paddingX', 'paddingY', 'paddingStart', 'paddingEnd', 'paddingTop', 'paddingBottom', 'radius'],
  typography: ['size'],
  palette: ['variant', 'accent', 'muted', 'chrome'],
  interactive: ['pressColor', 'pressScale', 'disabledOpacity'],
};

// A geometry leaf's scale namespace — engine knowledge (the schema's
// SizeLeaf / SpaceLeaf / RadiusLeaf · mirrors descriptors.js scaleLeaf).
// A prop NOT here is a literal/boolean (stack direction/align/justify/wrap)
// or a type step (typography.size · validated against the `type` scale).
const PROP_SCALE = {
  width: 'size', height: 'size', minHeight: 'size',
  padding: 'space', paddingX: 'space', paddingY: 'space',
  paddingStart: 'space', paddingEnd: 'space', paddingTop: 'space', paddingBottom: 'space',
  radius: 'radius',
  gap: 'space',
};

// palette cell channel → its short doc label, in canonical render order
// (mirrors build/palette.ts cell order: bg · fg · fgMuted · pressedBg).
const PALETTE_CHANNELS = [['bg', 'bg'], ['fg', 'fg'], ['fgMuted', 'muted'], ['pressedBg', 'pressed']];

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
// scope hex for colour. Re-sourced at N+42 (A4) onto @nuri/spec's DATA exports
// instead of the classifier internals (the boundary · convergence §5):
//   · @nuri/spec/tokens     — { chrome, accent, size, space, radius, type } (the
//                             resolved cross-product + the px scales + the type
//                             composite · build/tokens.ts).
//   · @nuri/spec/token-vars — { chrome, accent } leaf → CSS var name (the colour
//                             var registry the swatch reads live · build/token-vars.ts).
// buildDocTokenInputs is the SINGLE builder the doc build AND Guard G call, so the
// page re-emits byte-identical (the re-source is behaviour-preserving · decision 48).

// A palette TokenPath ('accent.solid' · 'chrome.bgStrong') → { var, hex }.
//   var — the CSS custom property the live swatch reads, from @nuri/spec/token-vars
//         (the leaf→cssVar registry the cascade emits · NOT hand-kebabed:
//         accent.solid→--nuri-accent-solid keeps its group prefix,
//         chrome.bgStrong→--nuri-bg-strong drops it).
//   hex — the default-scope (neutral + light · the page :root) resolved literal,
//         read from @nuri/spec/tokens at the canonical scope (chrome is theme-only;
//         accent is accent × theme — the classify-by-cascade shape). The live swatch
//         coincides with it at :root (it re-themes away from there).
// Throws on an unresolvable path (faithfulness · decision 48).
export function makeColorResolver(specTokens, tokenVars) {
  return (path) => {
    const [group, leaf] = path.split('.');
    const cssVar = tokenVars[group] && tokenVars[group][leaf];
    if (!cssVar) {
      throw new Error(`[docs] colour path '${path}' has no semantic var (token-vars drift)`);
    }
    const slice = group === 'accent'
      ? specTokens.accent[DEFAULT_ACCENT] && specTokens.accent[DEFAULT_ACCENT][DEFAULT_THEME]
      : specTokens[group] && specTokens[group][DEFAULT_THEME];
    const hex = slice && slice[leaf];
    if (hex == null) {
      throw new Error(`[docs] colour path '${path}' (${cssVar}) dangled at the default scope`);
    }
    return { var: cssVar, hex };
  };
}

// Build the value-bearing emitter inputs from @nuri/spec's token DATA. The px
// scale maps ({ leaf: 'NNpx' }) double as the leaf-VALIDATION sets (assertLeaf
// reads them by Object.hasOwn) AND the value source (the px each cell renders) —
// one map, two uses. The size/space/radius values are bare px integers in
// @nuri/spec/tokens; the docs render them with the unit (the inverse of the
// pipeline's px-strip · the byte-identical gate witnesses it). `type` is the full
// type scale (the step → its composite fields · directly from the data).
export function buildDocTokenInputs(specTokens, tokenVars) {
  const px = (scale) =>
    Object.fromEntries(Object.entries(scale).map(([leaf, v]) => [leaf, `${v}px`]));
  return {
    tokens: {
      size: px(specTokens.size),
      space: px(specTokens.space),
      radius: px(specTokens.radius),
      type: specTokens.type,
    },
    colors: makeColorResolver(specTokens, tokenVars),
  };
}

// nav_order per component source (the website slice grows this as coverage
// does · P11). default 1 for an un-listed source.
const NAV_ORDER = { button: 1, 'icon-avatar': 2, topbar: 3 };

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
// channel TokenPaths dereferenced through build/palette.ts (token column) and
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
  if (value === 'transparent') {
    return { token: attr(label, value), value: swatch('transparent') };
  }
  const { var: cssVar, hex } = colors(value);
  return { token: attr(label, value), value: `${swatch(`var(${cssVar})`)} \`${hex}\`` };
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
    // The type-scale key is the token; the resolved composite (decision 54) is
    // its value — every field on its own dt/dd line in the value column.
    const step = tokens.type[ns.size];
    return {
      token: attr('size', ns.size),
      value: [
        attr('fontSize', step.fontSize),
        attr('lineHeight', step.lineHeight),
        attr('weight', step.fontWeight),
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
  const out = [`- **root** · \`${a.el}\`${open}`];
  const parts = a.parts || {};
  for (const p of PART_ORDER) {
    if (p === 'root' || !parts[p]) continue;
    out.push(`  - **${p}** · \`${parts[p].el}\``);
  }
  return out;
}

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

  // ── just-the-docs front-matter ──
  lines.push('---');
  lines.push(`title: ${title}`);
  lines.push('layout: default');
  lines.push(`nav_order: ${NAV_ORDER[ir.source] ?? 1}`);
  lines.push('---');
  lines.push('');
  lines.push(`<!-- GENERATED · DO NOT EDIT BY HAND · source: build/descriptors/${ir.name}.ts`);
  lines.push('     emitter: pipeline/parsers/docs.js · re-emit: `npm run build -w @nuri/spec` -->');
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
