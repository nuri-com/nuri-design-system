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
 * + build-time CSS assertion (the descriptors.js SURFACE discipline):
 * the operator-settled contract table lives below as semantic-var
 * wiring, and derivePalette() asserts EVERY cell against the parsed
 * CSS SoT before anything emits:
 *
 *   · EVERY variant + chrome bg/fg cell — palette.css's dispatch rows (the web
 *     realization restates the full table: variant solid/soft/ghost/subtle + the 3
 *     chrome slots, incl. the gated [data-press-color]:active pressed bg swap; an
 *     extra/missing row throws).
 *   · fgMuted (every cell)              — typography.css's data-muted dispatch
 *     (the single muted delivery · decision 53; no node-level muted).
 *
 * The recipe-CSS cross-checks (button.css `@layer tokens` aliases · icon-avatar.css
 * subtle · topbar.css's chrome host) RETIRED with the recipe layer (decision 74 · the
 * L3c flip) — they were redundant with palette.css's own rows above.
 *
 * A cell that contradicts the CSS throws here → `npm run build` fails;
 * docs-drift Guard E re-derives + pins the table → `npm test` fails.
 *
 * RESERVED — mapped, not built (decision 30): variant `outline` · the
 * `border` channel · solid.fgMuted (the onSolid.muted token). Present
 * in this comment as the reservation; NO values emit.
 * ────────────────────────────────────────────────────────────── */

import postcss from 'postcss';

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

// Canonical orderings — the emit is deterministic regardless of CSS
// declaration order (the descriptors.js convention).
const AXIS_ORDER    = ['variant', 'chrome'];
const ROW_ORDER     = { variant: ['solid', 'soft', 'ghost', 'subtle'], chrome: ['canvas', 'subtle', 'strong'] };
const CHANNEL_ORDER = ['bg', 'fg', 'fgMuted', 'pressedBg'];

// ── CSS reading helpers (postcss · mirrors descriptors.js) ────────────

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

// A decl value → the referenced semantic var, or the bare literal.
function varTarget(value) {
  const m = value.match(/var\(\s*(--[\w-]+)/);
  return m ? m[1] : value.trim();
}

// The rule whose comma-separated selector list contains `selector` exactly.
function ruleFor(rules, selector) {
  return rules.find((r) => r.selector.split(',').map((s) => s.trim()).includes(selector));
}

function fail(where, msg) {
  throw new Error(`[palette] ${where}: ${msg}`);
}

// Assert a parsed CSS value resolves to the contract cell.
function assertCell(actualVar, cell, where) {
  if (actualVar !== cell) {
    fail(where, `CSS SoT disagrees with the contract table — resolves to '${actualVar}', ` +
      `the contract says '${cell}'. Fix the CSS or (deliberately) update PALETTE_CONTRACT + the Guard E pin.`);
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

// ── derive · assert the contract against the surviving namespace CSS, resolve cells ──
// cssSources = { typography, palette } (file contents · the recipe sources retired ·
// decision 74 · the L3c flip); classifiedGroups = the classifyAll() pass over
// tokens-semantic.css the orchestrator already holds.
export function derivePalette(cssSources, { classifiedGroups }) {
  // Sections A (button.css aliases) · B (icon-avatar.css subtle) · C (topbar.css
  // chrome host) RETIRED with the recipe layer (decision 74 · the L3c flip) — they
  // were REDUNDANT cross-checks with section E below (palette.css restates EVERY
  // variant + chrome bg/fg cell, incl. subtle's fg-only role and all 3 chrome slots)
  // and section D (typography.css muted). The contract is now witnessed in full by the
  // two surviving namespace CSS files; build/palette.ts (the cells) is unchanged.

  // D · fgMuted (every cell) ← typography.css's data-muted dispatch.
  const mutedRule = ruleFor(rulesInLayer(cssSources.typography, 'rules'), 'nuri-typography[data-muted]');
  if (!mutedRule || !mutedRule.decls.has('color')) {
    fail('typography.css', 'nuri-typography[data-muted] colour rule not found');
  }
  const mutedVar = varTarget(mutedRule.decls.get('color'));
  for (const axis of AXIS_ORDER) {
    for (const row of ROW_ORDER[axis]) {
      const cell = PALETTE_CONTRACT[axis][row].fgMuted;
      if (cell !== undefined) assertCell(mutedVar, cell, `typography.css muted vs ${axis}=${row}.fgMuted`);
    }
  }

  // E · palette.css's own dispatch (the web reader restates the table):
  //   E.1 · the rest-state bg/fg rows (every cell · the complete pair).
  //   E.2 · the pressed `:active` bg swap (N+19 B2c·1 · gated
  //         `[data-press-color]`) — interactive's one palette-realized
  //         effect (65.3 §6: pressed-COLOUR → palette).
  // Nothing else: muted is typography's, scale/opacity are interactive's —
  // a surprise row throws (the stray-rule rejection below).
  const paletteRules = rulesInLayer(cssSources.palette, 'rules')
    .filter((r) => r.selector.includes('.nuri-palette'));
  const expectedSelectors = [];

  // E.1 · rest-state rows.
  for (const axis of AXIS_ORDER) {
    for (const row of ROW_ORDER[axis]) {
      const selector = `.nuri-palette[data-${axis}="${row}"]`;
      expectedSelectors.push(selector);
      const rule = ruleFor(paletteRules, selector);
      if (!rule) fail('palette.css', `dispatch rule ${selector} not found`);
      const contract = PALETTE_CONTRACT[axis][row];
      const channels = { bg: 'background', fg: 'color' };
      for (const [channel, prop] of Object.entries(channels)) {
        const declared = rule.decls.get(prop);
        if (contract[channel] === undefined) {
          if (declared !== undefined) {
            fail(`palette.css ${selector}`, `declares '${prop}' but the contract row has no ${channel} channel (fg-only role)`);
          }
          continue;
        }
        if (declared === undefined) fail(`palette.css ${selector}`, `missing '${prop}' (the complete-pair rule)`);
        assertCell(varTarget(declared), contract[channel], `palette.css ${selector} ${prop}`);
      }
      const extra = [...rule.decls.keys()].filter((p) => p !== 'background' && p !== 'color');
      if (extra.length) {
        fail(`palette.css ${selector}`, `unexpected declaration(s) ${extra.join(', ')} — rest-state dispatch is bg/fg only (pressed = the gated :active rows · muted = typography)`);
      }
    }
  }

  // E.2 · pressed `:active` rows. variant solid/soft/ghost only — subtle
  // is fg-only and the chrome slot has no pressed channel by contract.
  // Each row's background ≡ the `pressedBg` cell, the value the live
  // Button presses with (button.css the SoT witness; section A pins the
  // matching `--nuri-button-<v>-bg-pressed` alias). background-only —
  // the scale/opacity transients are interactive's, not palette's.
  for (const row of ROW_ORDER.variant) {
    const pressedBg = PALETTE_CONTRACT.variant[row].pressedBg;
    if (pressedBg === undefined) continue; // subtle · no pressed channel
    const selector = `.nuri-palette[data-variant="${row}"][data-press-color]:active`;
    expectedSelectors.push(selector);
    const rule = ruleFor(paletteRules, selector);
    if (!rule) fail('palette.css', `pressed dispatch rule ${selector} not found`);
    const declared = rule.decls.get('background');
    if (declared === undefined) fail(`palette.css ${selector}`, `missing 'background' (the pressed bg swap)`);
    assertCell(varTarget(declared), pressedBg, `palette.css ${selector} background`);
    const extra = [...rule.decls.keys()].filter((p) => p !== 'background');
    if (extra.length) {
      fail(`palette.css ${selector}`, `unexpected declaration(s) ${extra.join(', ')} — pressed dispatch is background only (scale/opacity are interactive's)`);
    }
  }

  for (const { selector } of paletteRules) {
    for (const single of selector.split(',').map((s) => s.trim())) {
      if (!expectedSelectors.includes(single)) {
        fail('palette.css', `unexpected .nuri-palette rule '${single}' — not a contract row (rest-state bg/fg or the gated [data-press-color]:active pressed swap; muted is typography's, scale/opacity are interactive's)`);
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
    ` * Source · the palette namespace's CSS SoT (asserted cell-for-cell`,
    ` * at emit time — a contradiction fails the build · decision 48):`,
    ` *   lib/components/palette/palette.css          every variant + chrome bg/fg cell`,
    ` *                                               (+ the gated pressed :active swap)`,
    ` *   lib/components/typography/typography.css    the muted fg (fgMuted)`,
    ` * (The recipe-CSS cross-checks — button/icon-avatar/topbar — retired with the`,
    ` *  recipe layer · decision 74 · the L3c flip · they were redundant with palette.css.)`,
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
