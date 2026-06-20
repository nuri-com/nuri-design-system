/* ──────────────────────────────────────────────────────────────
 * NURI · PARSER · DOCS (N+22 · decision 66 arc #1 · the website doc-gen)
 *
 * Renders the per-component DESCRIPTOR IR (the frozen machine-spec ·
 * decision 65 · 65.3) as a just-the-docs Markdown page. READ-ONLY on
 * the descriptor — this is the generation thesis applied to docs: the
 * page is BUILD OUTPUT, regenerated every build, so it cannot drift
 * from the spec the way the old hand-written pages did.
 *
 *   NOT §9 (decision 2 STANDS · the brief's hard line). We READ the
 *   descriptor to EMIT docs; we do NOT generate CSS from it. The
 *   descriptor is already the machine-spec (even while CSS-derived ·
 *   the 65.1 bootstrap), so doc-gen does not wait for the source
 *   inversion (north-star move 3 · the decoupling).
 *
 * Sources, two readers each (decision 48 · "emit FROM, never re-author"):
 *   · ir       — the composition descriptor (build/descriptors/<name>.ts ·
 *                axes · anatomy · structure.base · variants), produced
 *                live by deriveDescriptor during the build.
 *   · palette  — the {variant|chrome} → {bg·fg·fgMuted·pressedBg} mapping
 *                (build/palette.ts · pipeline/parsers/palette.js). The
 *                token-map table dereferences each `palette:{variant}`
 *                node through it to the resolved TokenPaths.
 *   · tokens   — the scale leaf sets (size · space · radius · type),
 *                a VALIDATION guard: a box/typography leaf the descriptor
 *                references that is absent from its scale throws at emit
 *                (faithfulness · decision 48). Output is a pure function
 *                of (ir · palette); `tokens` never reaches the bytes.
 *
 * SPEC ONLY — no prose (DRY · P11). The page carries the derivable
 * data (axes/API · anatomy · the per-axis composition resolved to token
 * paths · the interactive opt-ins) plus ONE structural slot — an
 * `## Example` that `{% include %}`s an AUTHORED <nuri-demo> story
 * (a consumer story · decision 57.2 · NOT generated · authored in
 * website/_includes/demo/<source>.html). The "+" in north-star move 3
 * ("generated data + stories via <nuri-demo>") is two sources; this
 * emitter owns the data half + the slot, the website owns the story.
 *
 * Byte-stable (decision 35 · `git diff --exit-code build/`): canonical
 * part/namespace/prop order, no timestamps, deterministic throughout.
 * ────────────────────────────────────────────────────────────── */

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

// nav_order per component source (the website slice grows this as coverage
// does · P11). Button is the first page; default 1 for an un-listed source.
const NAV_ORDER = { button: 1 };

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

// palette node ({ variant } | { chrome }) → its resolved TokenPath cells
// dereferenced through build/palette.ts, one channel per line (dt/dd style ·
// **bg** `accent.solid` …).
function renderPalette(ns, palette, where) {
  let cells;
  if (ns.variant !== undefined) cells = palette.variant[ns.variant];
  else if (ns.chrome !== undefined) cells = palette.chrome[ns.chrome];
  if (!cells) {
    throw new Error(`[docs] ${where}: no palette cell for ${JSON.stringify(ns)} (palette.ts drift)`);
  }
  const segs = [];
  for (const [key, label] of PALETTE_CHANNELS) {
    if (cells[key] === undefined) continue;
    segs.push(attr(label, cells[key]));
  }
  return segs.join(ATTR_SEP);
}

// one namespace → the "Resolves to" cell string · one attribute per line
// (canonical prop order). Each attribute is a bold term + a code value
// (the interactive flags are bare opt-in terms · no value).
function renderNsDetail(nsName, ns, { palette, tokens }, where) {
  if (nsName === 'palette') return renderPalette(ns, palette, where);
  if (nsName === 'interactive') {
    return NS_PROP_ORDER.interactive.filter((f) => ns[f]).map((f) => `\`${f}\``).join(ATTR_SEP);
  }
  if (nsName === 'typography') {
    assertLeaf(tokens, 'type', ns.size, `${where}.typography.size`);
    return attr('size', ns.size);
  }
  // stack | box · prop → scale-path or literal
  const segs = [];
  for (const prop of NS_PROP_ORDER[nsName]) {
    if (ns[prop] === undefined) continue;
    const scale = PROP_SCALE[prop];
    if (scale) {
      assertLeaf(tokens, scale, ns[prop], `${where}.${nsName}.${prop}`);
      segs.push(attr(prop, `${scale}.${ns[prop]}`));
    } else {
      segs.push(attr(prop, ns[prop]));
    }
  }
  return segs.join(ATTR_SEP);
}

// a PartMap → [[part, nsName, detail], …] in canonical part × namespace order.
function compositionRows(partMap, opts, where) {
  const rows = [];
  if (!partMap) return rows;
  for (const part of PART_ORDER) {
    const ns = partMap[part];
    if (!ns) continue;
    for (const nsName of NS_ORDER) {
      if (!ns[nsName]) continue;
      rows.push([part, nsName, renderNsDetail(nsName, ns[nsName], opts, `${where}.${part}`)]);
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
  const { palette } = opts;
  if (!palette) throw new Error('[docs] emitDocPage requires { palette } — the variant derefs resolve through it');
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
    lines.push('| Part | Namespace | Resolves to |');
    lines.push('| --- | --- | --- |');
    for (const [part, nsName, detail] of baseRows) {
      lines.push(`| \`${part}\` | \`${nsName}\` | ${detail} |`);
    }
    lines.push('');
  }

  // ── Token map · per axis value → the per-part namespace composition,
  // resolved to token paths (variant → palette.ts derefs · box/typography
  // → scale leaves). The agent-critical surface, generated. ──
  lines.push('## Token map');
  lines.push('');
  lines.push('| Axis | Value | Part | Namespace | Resolves to |');
  lines.push('| --- | --- | --- | --- | --- |');
  for (const axis of Object.keys(ir.axes)) {
    for (const value of ir.axes[axis]) {
      const pm = ir.variants && ir.variants[axis] && ir.variants[axis][value];
      for (const [part, nsName, detail] of compositionRows(pm, opts, `${axis}.${value}`)) {
        lines.push(`| \`${axis}\` | \`${value}\` | \`${part}\` | \`${nsName}\` | ${detail} |`);
      }
    }
  }
  lines.push('');

  return lines.join('\n');
}
