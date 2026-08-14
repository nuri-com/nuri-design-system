/* ──────────────────────────────────────────────────────────────
 * NURI · PARSER · PALETTE (the colour-namespace mapping · 65.3 §6 · N+19 B2b)
 *
 * Emits packages/rn/generated/data/palette.ts — the {variant | chrome} → {bg · fg · fgMuted ·
 * pressedBg · border} mapping as STRUCTURAL colour REFS `{ group, leaf }` (SEED-4 · a
 * dotted path split at emit · the accent×theme-GENERIC `accent.solid`, never a
 * concrete colour · decision 34 indirection), so the RN theme builder indexes the
 * selected slice with ZERO parse. Emitted ONCE in the baseline (decision 65.2:
 * surface = shared data; 65.1: engine = platform-native, mapping = data).
 *
 * ONE SOURCE, TWO READERS (decision 48), realized as author-in-emitter
 * + build-time SoT assertion (the descriptors.js SURFACE discipline):
 * the operator-settled contract table lives below as semantic-var
 * wiring, and derivePalette() asserts EVERY cell against the namespace
 * axis TS SoTs before anything emits:
 *
 *   · EVERY variant + chrome bg/fg/pressed/border cell — palette-surface.ts's SURFACE
 *     role table (the complete pair + the optional pressed swap + the optional border:
 *     variant solid/soft/ghost/subtle/outline + the 4 chrome slots; an extra/missing
 *     role or channel throws).
 *   · fgMuted (every cell)                       — typography-axis.ts's muted role
 *     (the single muted delivery · decision 53; no node-level muted).
 *
 * RE-SOURCED at N+40 (decision 74 'Next: final'): the witness is now the TS SoTs
 * that also emit the prototype namespace CSS, so the build stops reaching into
 * projection CSS. The recipe-CSS cross-checks (button/icon-avatar/topbar) had
 * already retired at the flip (decision 74).
 *
 * A cell that contradicts the SoT throws here → `npm run build` fails;
 * docs-drift Guard E re-derives + pins the table → `npm test` fails.
 *
 * RESERVED — mapped, not built (decision 30): solid.fgMuted (the
 * onSolid.muted token). Present in this comment as the reservation; NO value emits.
 * ────────────────────────────────────────────────────────────── */

// ── The operator-settled contract wiring (B2b) ────────────────────────
// input → channel → the semantic var (or the `transparent` literal —
// the ghostBg emit convention) the surface paints with. The evolution
// of descriptors.js's SURFACE funnel (resolver-model §11): palette owns
// ALL colour (65.3 `surface → palette`), adding the fgMuted column and
// the theme-only chrome slot. `subtle` is fg-only. Chrome surfaces are normally
// static; chrome.subtle alone carries an optional pressed channel so an
// INTERACTIVE node can opt into the pill wash without changing static views.
export const PALETTE_CONTRACT = {
  variant: {
    solid:  { bg: '--nuri-accent-solid', fg: '--nuri-accent-on-solid', pressedBg: '--nuri-accent-solid-pressed' },
    soft:   { bg: '--nuri-bg-strong',    fg: '--nuri-text-primary',    fgMuted: '--nuri-text-muted', pressedBg: '--nuri-bg-pressed' },
    ghost:  { bg: 'transparent',         fg: '--nuri-text-primary',    fgMuted: '--nuri-text-muted', pressedBg: '--nuri-bg-subtle' },
    subtle: { fg: '--nuri-border-strong' },
    // outline carries NO fgMuted cell: its fg IS text-muted, so the muted swap
    // would substitute text-muted for text-muted — a no-op channel. Absent-by-
    // omission is the subtle/solid precedent; the RN resolver falls back to fg.
    outline: { bg: 'transparent', fg: '--nuri-text-muted', pressedBg: '--nuri-bg-subtle', border: '--nuri-border-subtle' },
  },
  chrome: {
    canvas: { bg: '--nuri-bg-canvas', fg: '--nuri-text-primary', fgMuted: '--nuri-text-muted' },
    subtle: { bg: '--nuri-bg-subtle', fg: '--nuri-text-primary', fgMuted: '--nuri-text-muted', pressedBg: '--nuri-bg-strong' },
    strong: { bg: '--nuri-bg-strong', fg: '--nuri-text-primary', fgMuted: '--nuri-text-muted' },
    transparent: { bg: 'transparent', fg: '--nuri-text-primary', fgMuted: '--nuri-text-muted' },
  },
};

// Canonical orderings — the emit is deterministic regardless of the SoT's
// source declaration order (the descriptors.js convention).
const AXIS_ORDER    = ['variant', 'chrome'];
const ROW_ORDER     = { variant: ['solid', 'soft', 'ghost', 'subtle', 'outline'], chrome: ['canvas', 'subtle', 'strong', 'transparent'] };
const CHANNEL_ORDER = ['bg', 'fg', 'fgMuted', 'pressedBg', 'border'];

// ── SoT reading helpers ───────────────────────────────────────────────

// A surface Paint (palette-surface.ts) → the contract's semantic-var spelling, or
// `undefined` when the channel is absent (the fg-only / no-pressed shape). Mirrors
// palette-css.js#paintToCss (the assertNever analogue, inverted to the contract's
// `--nuri-` form): a bare string is an L2 role NAME (prefix `--nuri-`); a `{ literal }`
// is the verbatim CSS value (the `transparent` exception · no var). Anything else throws.
function paintToVar(paint, where) {
  if (paint === undefined) return undefined;
  if (typeof paint === 'string') return `--nuri-${paint}`;
  if (paint && typeof paint.literal === 'string') return paint.literal;
  fail(where, `unrecognised paint ${JSON.stringify(paint)} — expected a role name, { literal }, or absent`);
}

function fail(where, msg) {
  throw new Error(`[palette] ${where}: ${msg}`);
}

// Assert a resolved SoT value matches the contract cell.
function assertCell(actualVar, cell, where) {
  if (actualVar !== cell) {
    fail(where, `the TS SoT disagrees with the contract table — resolves to '${actualVar}', ` +
      `the contract says '${cell}'. Fix the SoT or (deliberately) update PALETTE_CONTRACT + the Guard E pin.`);
  }
}

// `--nuri-text-primary` → `chrome.textPrimary` through the classified
// runtime groups (the same machinery components.js dispatches per
// decision 34) — a renamed/removed semantic leaf throws, so the
// TokenPath emit can never dangle.
function tokenPathFor(cssVar, classifiedGroups, where) {
  for (const [groupName, group] of classifiedGroups) {
    const entry = group.entries.find((e) => e.cssVar === cssVar);
    if (entry) {
      if (!group.policy.runtime) {
        fail(where, `'${cssVar}' classifies into non-runtime set '${group.setKey}' — palette cells must be runtime TokenPaths`);
      }
      return `${groupName}.${entry.leafName}`;
    }
  }
  fail(where, `'${cssVar}' is not a classified semantic var — renamed/removed leaf?`);
}

// ── derive · assert the contract against the namespace-axis TS SoTs, resolve cells ──
// { surface, typographyAxis } = the loaded TS SoTs — palette-surface.ts's `surface`
// (the SURFACE role table · bg/fg/pressed pairs) + typography-axis.ts's `axis` (the
// muted role). Re-sourced at N+40 from the generated prototype namespace CSS
// typography}.css those SoTs emit (§74 'Next: final') so spec's build stops reading the
// namespace CSS the A3 carve moves out. classifiedGroups = the classifyAll() pass over
// tokens-semantic.css the orchestrator already holds.
export function derivePalette({ surface, typographyAxis }, { classifiedGroups }) {
  // Sections A (button.css aliases) · B (icon-avatar.css subtle) · C (topbar.css
  // chrome host) RETIRED with the recipe layer (decision 74 · the L3c flip) — they
  // were REDUNDANT cross-checks with sections D + E below. The contract is now
  // witnessed in full by the two namespace-axis TS SoTs (the source the generated
  // namespace CSS is itself derived from); packages/rn/generated/data/palette.ts (the cells) is unchanged.

  // D · fgMuted (every cell) ← typography-axis.ts's `muted.role`. The single
  // muted delivery (decision 53) resolves to the shared text-muted role.
  const mutedVar = paintToVar(typographyAxis.muted?.role, 'typography-axis.ts muted.role');
  for (const axis of AXIS_ORDER) {
    for (const row of ROW_ORDER[axis]) {
      const cell = PALETTE_CONTRACT[axis][row].fgMuted;
      if (cell !== undefined) assertCell(mutedVar, cell, `typography-axis.ts muted vs ${axis}=${row}.fgMuted`);
    }
  }

  // E · bg/fg/pressedBg/border (every cell) ← palette-surface.ts's SURFACE role table.
  // The contract's {bg, fg, pressedBg, border} restates the SoT's {bg, fg, pressed,
  // border}, modulo
  // the role-name → `--nuri-<role>` prefix (paintToVar) and the `transparent` literal.
  // The SoT's shape is honored, not special-cased: subtle is fg-only (no bg/pressed),
  // while chrome.subtle carries the trigger's optional pressed wash. fgMuted is typography's (section D), NOT a surface
  // channel. Both directions are checked — a contract cell with no SoT channel, an SoT
  // channel with no contract cell, a stray role/channel, all throw.
  const SURFACE_CHANNELS = [['bg', 'bg'], ['fg', 'fg'], ['pressedBg', 'pressed'], ['border', 'border']];
  for (const axis of AXIS_ORDER) {
    for (const row of ROW_ORDER[axis]) {
      const role = surface[axis] && surface[axis][row];
      if (!role) fail('palette-surface.ts', `surface role ${axis}.${row} not found`);
      const contract = PALETTE_CONTRACT[axis][row];
      for (const [contractKey, surfaceKey] of SURFACE_CHANNELS) {
        const cell = contract[contractKey];
        const actual = paintToVar(role[surfaceKey], `palette-surface.ts ${axis}.${row}.${surfaceKey}`);
        if (cell === undefined) {
          if (actual !== undefined) {
            fail(`palette-surface.ts ${axis}.${row}`, `declares ${surfaceKey} '${actual}' but the contract row has no ${contractKey} channel`);
          }
          continue;
        }
        if (actual === undefined) fail(`palette-surface.ts ${axis}.${row}`, `missing ${surfaceKey} (the contract expects ${contractKey} '${cell}')`);
        assertCell(actual, cell, `palette-surface.ts ${axis}=${row} ${surfaceKey}`);
      }
      // The surface role carries ONLY bg/fg/pressed/border (muted is typography's · decision 53).
      const extra = Object.keys(role).filter((k) => k !== 'bg' && k !== 'fg' && k !== 'pressed' && k !== 'border');
      if (extra.length) {
        fail(`palette-surface.ts ${axis}.${row}`, `unexpected channel(s) ${extra.join(', ')} — surface owns bg/fg/pressed/border only`);
      }
    }
  }

  // The surface table carries ONLY the contract rows — a surprise role throws (the
  // SoT analogue of the old stray-`.nuri-palette`-rule rejection).
  for (const axis of AXIS_ORDER) {
    for (const row of Object.keys(surface[axis] || {})) {
      if (!ROW_ORDER[axis].includes(row)) {
        fail('palette-surface.ts', `unexpected ${axis} role '${row}' — not a contract row`);
      }
    }
  }

  // ── Resolve → TokenPath cells (the IR Guard E pins) ──────────────
  const cells = {};
  for (const axis of AXIS_ORDER) {
    cells[axis] = {};
    for (const row of ROW_ORDER[axis]) {
      cells[axis][row] = {};
      for (const channel of CHANNEL_ORDER) {
        const cell = PALETTE_CONTRACT[axis][row][channel];
        if (cell === undefined) continue;
        cells[axis][row][channel] = cell.startsWith('--')
          ? tokenPathFor(cell, classifiedGroups, `${axis}=${row}.${channel}`)
          : cell; // the `transparent` literal (ghostBg convention)
      }
    }
  }
  return cells;
}

// ── emit · packages/rn/generated/data/palette.ts source ────────────────────────────────────
// The mapping emits each colour cell as a STRUCTURAL ref `{ group, leaf }` (a
// dotted TokenPath split at emit) or a verbatim literal (ghost's 'transparent').
// Preserving (group, leaf) structurally lets the RN theme builder index the
// selected slice with ZERO parse — the old stringly `resolveColor` dot-sniff +
// `RUNTIME_GROUPS` restatement dissolve (SEED-4). `as const satisfies ColorRef`
// pins each ref's `${group}.${leaf}` back to a real runtime TokenPath.
export function emitPaletteTs(cells) {
  // Split a dotted TokenPath into its (group, leaf); a literal has no dot.
  const refOf = (value) => {
    const dot = value.indexOf('.');
    return dot > 0 ? { group: value.slice(0, dot), leaf: value.slice(dot + 1) } : null;
  };
  // Global column alignment across every row (the button.ts look): the label, the
  // quoted group, and the quoted leaf each align to their widest occurrence.
  let labelWidth = 0;
  let groupWidth = 0;
  let leafWidth = 0;
  for (const axis of AXIS_ORDER) {
    for (const row of Object.keys(cells[axis])) {
      for (const [channel, value] of Object.entries(cells[axis][row])) {
        labelWidth = Math.max(labelWidth, channel.length + 1);
        const ref = refOf(value);
        if (ref) {
          groupWidth = Math.max(groupWidth, ref.group.length + 2);
          leafWidth = Math.max(leafWidth, ref.leaf.length + 2);
        }
      }
    }
  }
  const lines = [
    `/* ──────────────────────────────────────────────────────────────`,
    ` * NURI · PALETTE MAPPING · GENERATED · DO NOT EDIT BY HAND`,
    ` *`,
    ` * Source · the namespace axis TS SoTs (asserted cell-for-cell at`,
    ` * emit time — a contradiction fails the build · decision 48):`,
    ` *   packages/spec/axes/palette-surface.ts   every variant + chrome bg/fg pair`,
    ` *                                 (+ the pressed swap → pressedBg)`,
    ` *   packages/spec/axes/typography-axis.ts   the muted role → the muted fg (fgMuted)`,
    ` * (Re-sourced at N+40 from the generated prototype namespace CSS these SoTs emit`,
    ` *  · §74 'Next: final' — the spec build stops reading projection CSS.)`,
    ` * Emitter · scripts/parsers/palette.js — run \`npm run build\``,
    ` *`,
    ` * The {variant | chrome} → {bg · fg · fgMuted · pressedBg · border} mapping as`,
    ` * STRUCTURAL colour REFS (decision 34 · SEED-4) — accent×theme-GENERIC. Each`,
    ` * cell is \`{ group, leaf }\` preserving the (group, leaf) so the RN theme`,
    ` * builder (generated → runtime/theme-payload.ts) indexes the selected chrome | accent`,
    ` * slice with ZERO parse (the old dotted-string + resolveColor dot-sniff is`,
    ` * gone). The mapping is applied ONCE at the provider (Option B · 65.1: engine =`,
    ` * platform-native, mapping = data · emitted ONCE · 65.2).`,
    ` *`,
    ` *   · ghost.bg = the literal 'transparent' (NOT a ref) — the`,
    ` *     retired per-component button ghostBg convention.`,
    ` *   · subtle = fg-only (no bg/pressed) · the IconAvatar role.`,
    ` *   · chrome = theme-only surfaces; chrome.subtle optionally washes to`,
    ` *     chrome.bgStrong when an interactive node opts into pressColor.`,
    ` *   · pressedBg is DATA for the RN resolver; the web pressed`,
    ` *     dispatch is gated on the \`interactive\` flag (B2c).`,
    ` *   · outline.border carries the border-colour role for outlined surfaces.`,
    ` *   · RESERVED — mapped, not built (decision 30): solid.fgMuted`,
    ` *     (the onSolid.muted token).`,
    ` * ────────────────────────────────────────────────────────────── */`,
    ``,
    `import type { TokenPath } from './token-paths';`,
    ``,
    `// A colour cell is a structural REF — \`{ group, leaf }\` preserved so the theme`,
    `// builder indexes the selected (chrome | accent) slice with ZERO parse — or a`,
    `// verbatim literal (ghost's 'transparent'). \`ColorRef\` is narrowed to the two`,
    `// COLOUR groups (chrome | accent · the only groups a palette cell refs) and pins`,
    `// each ref's \`\${group}.\${leaf}\` to a real runtime TokenPath (the emit guarantee).`,
    `type ColorPath = Extract<TokenPath, \`chrome.\${string}\` | \`accent.\${string}\`>;`,
    `export type ColorRef<P extends ColorPath = ColorPath> =`,
    `  P extends \`\${infer G}.\${infer L}\` ? { readonly group: G; readonly leaf: L } : never;`,
    ``,
    `export const palette = {`,
  ];
  for (const axis of AXIS_ORDER) {
    lines.push(`  ${axis}: {`);
    for (const row of Object.keys(cells[axis])) {
      lines.push(`    ${row}: {`);
      for (const [channel, value] of Object.entries(cells[axis][row])) {
        const label = `${channel}:`.padEnd(labelWidth + 1);
        const ref = refOf(value);
        if (ref) {
          const group = `'${ref.group}',`.padEnd(groupWidth + 1);
          const leaf = `'${ref.leaf}'`.padEnd(leafWidth);
          lines.push(`      ${label} { group: ${group} leaf: ${leaf} } as const satisfies ColorRef,`);
        } else {
          lines.push(`      ${label} '${value}',`); // the transparent literal
        }
      }
      lines.push(`    },`);
    }
    lines.push(`  },`);
  }
  lines.push(`} as const;`);
  lines.push('');
  return lines.join('\n');
}
