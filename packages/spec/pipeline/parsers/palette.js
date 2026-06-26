/* ──────────────────────────────────────────────────────────────
 * NURI · PARSER · PALETTE (the colour-namespace mapping · 65.3 §6 · N+19 B2b)
 *
 * Emits build/palette.ts — the {variant | chrome} → {bg · fg · fgMuted ·
 * pressedBg} mapping as TokenPath-typed data, accent×theme-GENERIC
 * (`accent.solid`, never a concrete colour · decision 34 indirection).
 * Emitted ONCE in the baseline (decision 65.2: surface = shared data;
 * 65.1: engine = platform-native, mapping = data). ADDITIVE — the
 * existing build/ emit is byte-identical.
 *
 * ONE SOURCE, TWO READERS (decision 48), realized as author-in-emitter
 * + build-time SoT assertion (the descriptors.js SURFACE discipline):
 * the operator-settled contract table lives below as semantic-var
 * wiring, and derivePalette() asserts EVERY cell against the namespace
 * axis TS SoTs before anything emits:
 *
 *   · EVERY variant + chrome bg/fg/pressed cell — palette-surface.ts's SURFACE role
 *     table (the complete pair + the optional pressed swap: variant solid/soft/ghost/
 *     subtle + the 3 chrome slots; an extra/missing role or channel throws).
 *   · fgMuted (every cell)                       — typography-axis.ts's muted dispatch
 *     (the single muted delivery · decision 53; no node-level muted).
 *
 * RE-SOURCED at N+40 (decision 74 'Next: final'): the witness was the GENERATED
 * lib/components/{palette,typography}.css (§74) — now the TS SoTs those CSS files are
 * emitted FROM, so spec's build stops reaching into the namespace CSS that the A3
 * carve moves to @nuri/prototype (one step further up the cascade · no decision
 * opened · the cells are unchanged). The recipe-CSS cross-checks (button/icon-avatar/
 * topbar) had already retired at the flip (decision 74).
 *
 * A cell that contradicts the SoT throws here → `npm run build` fails;
 * docs-drift Guard E re-derives + pins the table → `npm test` fails.
 *
 * RESERVED — mapped, not built (decision 30): variant `outline` · the
 * `border` channel · solid.fgMuted (the onSolid.muted token). Present
 * in this comment as the reservation; NO values emit.
 * ────────────────────────────────────────────────────────────── */

// ── The operator-settled contract wiring (B2b) ────────────────────────
// input → channel → the semantic var (or the `transparent` literal —
// the ghostBg emit convention) the surface paints with. The evolution
// of descriptors.js's SURFACE funnel (resolver-model §11): palette owns
// ALL colour (65.3 `surface → palette`), adding the fgMuted column and
// the theme-only chrome slot. `subtle` is fg-only; the chrome slot has
// no pressed channel by contract.
export const PALETTE_CONTRACT = {
  variant: {
    solid:  { bg: '--nuri-accent-solid', fg: '--nuri-accent-on-solid', pressedBg: '--nuri-accent-solid-pressed' },
    soft:   { bg: '--nuri-bg-strong',    fg: '--nuri-text-primary',    fgMuted: '--nuri-text-muted', pressedBg: '--nuri-bg-pressed' },
    ghost:  { bg: 'transparent',         fg: '--nuri-text-primary',    fgMuted: '--nuri-text-muted', pressedBg: '--nuri-bg-subtle' },
    subtle: { fg: '--nuri-border-strong' },
  },
  chrome: {
    canvas: { bg: '--nuri-bg-canvas', fg: '--nuri-text-primary', fgMuted: '--nuri-text-muted' },
    subtle: { bg: '--nuri-bg-subtle', fg: '--nuri-text-primary', fgMuted: '--nuri-text-muted' },
    strong: { bg: '--nuri-bg-strong', fg: '--nuri-text-primary', fgMuted: '--nuri-text-muted' },
  },
};

// Canonical orderings — the emit is deterministic regardless of the SoT's
// source declaration order (the descriptors.js convention).
const AXIS_ORDER    = ['variant', 'chrome'];
const ROW_ORDER     = { variant: ['solid', 'soft', 'ghost', 'subtle'], chrome: ['canvas', 'subtle', 'strong'] };
const CHANNEL_ORDER = ['bg', 'fg', 'fgMuted', 'pressedBg'];

// ── SoT reading helpers ───────────────────────────────────────────────

// A decl value → the referenced semantic var, or the bare literal. The muted
// dispatch decl is `var(--nuri-text-muted)` (typography-axis.ts · the value verbatim).
function varTarget(value) {
  const m = value.match(/var\(\s*(--[\w-]+)/);
  return m ? m[1] : value.trim();
}

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
// muted dispatch). Re-sourced at N+40 from the generated lib/components/{palette,
// typography}.css those SoTs emit (§74 'Next: final') so spec's build stops reading the
// namespace CSS the A3 carve moves out. classifiedGroups = the classifyAll() pass over
// tokens-semantic.css the orchestrator already holds.
export function derivePalette({ surface, typographyAxis }, { classifiedGroups }) {
  // Sections A (button.css aliases) · B (icon-avatar.css subtle) · C (topbar.css
  // chrome host) RETIRED with the recipe layer (decision 74 · the L3c flip) — they
  // were REDUNDANT cross-checks with sections D + E below. The contract is now
  // witnessed in full by the two namespace-axis TS SoTs (the source the generated
  // namespace CSS is itself derived from); build/palette.ts (the cells) is unchanged.

  // D · fgMuted (every cell) ← typography-axis.ts's `muted` dispatch rule. The single
  // muted delivery (decision 53): the rule's `color` decl is `var(--nuri-text-muted)`
  // verbatim (the value the emitter writes into typography.css unchanged).
  const mutedRule = typographyAxis.dispatch.find((r) => r.name === 'muted');
  if (!mutedRule) fail('typography-axis.ts', "the 'muted' dispatch rule not found");
  const mutedColor = mutedRule.decls.find(([prop]) => prop === 'color');
  if (!mutedColor) fail('typography-axis.ts', "the 'muted' dispatch rule declares no color");
  const mutedVar = varTarget(mutedColor[1]);
  for (const axis of AXIS_ORDER) {
    for (const row of ROW_ORDER[axis]) {
      const cell = PALETTE_CONTRACT[axis][row].fgMuted;
      if (cell !== undefined) assertCell(mutedVar, cell, `typography-axis.ts muted vs ${axis}=${row}.fgMuted`);
    }
  }

  // E · bg/fg/pressedBg (every cell) ← palette-surface.ts's SURFACE role table. The
  // contract's {bg, fg, pressedBg} restates the SoT's {bg, fg, pressed} pair, modulo
  // the role-name → `--nuri-<role>` prefix (paintToVar) and the `transparent` literal.
  // The SoT's shape is honored, not special-cased: subtle is fg-only (no bg/pressed),
  // the chrome slot has no pressed. fgMuted is typography's (section D), NOT a surface
  // channel. Both directions are checked — a contract cell with no SoT channel, an SoT
  // channel with no contract cell, a stray role/channel, all throw.
  const SURFACE_CHANNELS = [['bg', 'bg'], ['fg', 'fg'], ['pressedBg', 'pressed']];
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
      // The surface role carries ONLY bg/fg/pressed (muted is typography's · decision 53).
      const extra = Object.keys(role).filter((k) => k !== 'bg' && k !== 'fg' && k !== 'pressed');
      if (extra.length) {
        fail(`palette-surface.ts ${axis}.${row}`, `unexpected channel(s) ${extra.join(', ')} — surface owns bg/fg/pressed only`);
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

// ── emit · build/palette.ts source ────────────────────────────────────
export function emitPaletteTs(cells) {
  // Global column alignment across every row (the button.ts look).
  let labelWidth = 0;
  let exprWidth = 0;
  for (const axis of AXIS_ORDER) {
    for (const row of Object.keys(cells[axis])) {
      for (const [channel, value] of Object.entries(cells[axis][row])) {
        labelWidth = Math.max(labelWidth, channel.length + 1);
        exprWidth = Math.max(exprWidth, value.length + 2);
      }
    }
  }
  const lines = [
    `/* ──────────────────────────────────────────────────────────────`,
    ` * NURI · PALETTE MAPPING · GENERATED · DO NOT EDIT BY HAND`,
    ` *`,
    ` * Source · the namespace axis TS SoTs (asserted cell-for-cell at`,
    ` * emit time — a contradiction fails the build · decision 48):`,
    ` *   pipeline/palette-surface.ts   every variant + chrome bg/fg pair`,
    ` *                                 (+ the pressed swap → pressedBg)`,
    ` *   pipeline/typography-axis.ts   the muted dispatch → the muted fg (fgMuted)`,
    ` * (Re-sourced at N+40 from the generated lib/components/{palette,typography}.css`,
    ` *  these SoTs emit · §74 'Next: final' — the spec build stops reading the namespace`,
    ` *  CSS the A3 carve relocates · build/palette.ts cells unchanged.)`,
    ` * Emitter · pipeline/parsers/palette.js — run \`npm run build\``,
    ` *`,
    ` * The {variant | chrome} → {bg · fg · fgMuted · pressedBg} mapping`,
    ` * as TokenPath data (decision 34) — accent×theme-GENERIC; the`,
    ` * consumer dereferences each path against the live (accent × theme)`,
    ` * slice via resolveToken at render time (decision 65.1: engine =`,
    ` * platform-native, mapping = data · emitted ONCE · 65.2).`,
    ` *`,
    ` *   · ghost.bg = the literal 'transparent' (NOT a TokenPath) — the`,
    ` *     build/components/button.ts ghostBg convention.`,
    ` *   · subtle = fg-only (no bg/pressed) · the IconAvatar role.`,
    ` *   · chrome = theme-only surfaces (no accent, no pressed).`,
    ` *   · pressedBg is DATA for the RN resolver; the web pressed`,
    ` *     dispatch is gated on the \`interactive\` flag (B2c).`,
    ` *   · RESERVED — mapped, not built (decision 30): variant 'outline'`,
    ` *     · the border channel · solid.fgMuted (the onSolid.muted token).`,
    ` * ────────────────────────────────────────────────────────────── */`,
    ``,
    `import type { TokenPath } from './token-paths';`,
    ``,
    `export const palette = {`,
  ];
  for (const axis of AXIS_ORDER) {
    lines.push(`  ${axis}: {`);
    for (const row of Object.keys(cells[axis])) {
      lines.push(`    ${row}: {`);
      for (const [channel, value] of Object.entries(cells[axis][row])) {
        const label = `${channel}:`.padEnd(labelWidth + 1);
        const head = `'${value}'`;
        if (value.includes('.')) {
          lines.push(`      ${label} ${head.padEnd(exprWidth)} as const satisfies TokenPath,`);
        } else {
          lines.push(`      ${label} ${head},`); // the transparent literal
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
