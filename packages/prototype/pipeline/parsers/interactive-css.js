/* ══════════════════════════════════════════════════════════════════
 * NURI · PARSER · INTERACTIVE NAMESPACE CSS EMIT (the LIVE generated CSS · decision 74 · SEED-1a)
 * ──────────────────────────────────────────────────────────────────
 * The interactive AXIS SoT (packages/spec/axes/interactive-effects.ts) → the web
 * interactive namespace CSS. interactive is a BESPOKE axis (decision 67 / 73): the
 * structured per-part interaction opt-in (decision 65.3 §6 / 65.4), single-sourced
 * but NOT a Field-table member. SEED-1a moved browser CSS realization out of spec:
 * spec owns only `opts` (trigger · gate · RN vocabulary), and this module owns the
 * web rules/chrome/order. It writes the `.nuri-interactive[gate]:state` dispatch the
 * CSS pseudo-class cascade resolves (the inverse-spelling of flattenPart's RN state
 * patches).
 *
 * ── The walk (webOrder → @layer rules) ──────────────────────────────
 * For each name in `webOrder` the rule comes from `webChrome[name]` (the local chrome
 * rule) or `optRules[name]` (the local opt rule · null where the rule lives in
 * another axis — pressColor's :active bg-swap is PALETTE's, so pressColor is NOT in
 * webOrder). Each rule is `{ on: [{attr?,state?}], decls: [[prop,value]] }`:
 *   · affordance · `.nuri-interactive` — cursor + the press transition (automatic).
 *   · focus · `.nuri-interactive:focus-visible` — the brand outline ring (automatic).
 *   · pressScale · `.nuri-interactive[data-press-scale]:active` — the :active scale,
 *     gated so a static surface never matches :active.
 *   · disabledGuard · `.nuri-interactive[aria-disabled="true"]:active` — reverts the
 *     scale to none when disabled. EQUAL specificity to pressScale (0,3,0), so it wins
 *     ONLY by SOURCE ORDER (emitted later · LOAD-BEARING · webOrder · the order guard).
 *   · disabledOpacity · `.nuri-interactive:disabled, .nuri-interactive[aria-disabled=
 *     "true"]` — the shared dim (a multi-selector / comma rule · automatic).
 *
 * ── NO SHELL (interactive is the MERGED-NODE axis · 65.3 §6 / B1.5 §4.2) ─
 * Unlike box/stack (custom-element wrappers · display:contents · :not(:defined)
 * skeletons), there is NO <nuri-interactive> element and no interactive.js — the
 * class + the gate attrs land directly ON the painting node (`class="nuri-box
 * nuri-palette nuri-interactive" data-press-scale`). So the emit has no PRE/POST
 * shell, no :not(:defined): every selector is the `.nuri-interactive` class dispatch.
 *
 * ── The SPELLING (the per-target delta · the SoT-vs-shell line) ─────────────
 * interactive is the THINNEST web projection: each declaration is a literal [prop,
 * value] pair, the `var(--nuri-…)` interaction constant inline. There is NO value
 * transform (unlike palette's role-NAME → `var(--nuri-<role>)`, or
 * dimensions' `{ ref }` → `var(--nuri-px-N)`) — the constants are consumed directly
 * (decision 45). The only derivation is the SELECTOR ASSEMBLY: `.nuri-interactive` +
 * the attr gate + the pseudo-state, comma-joined for the multi-selector rule.
 *
 * loadInteractive type-strips + data:-URL imports the .ts SoT (node 20 cannot import a
 * .ts) — reusing strip.js#stripTypes (one strip impl · decision 48): the
 * descriptor-twin / L3.1 / palette technique. The SoT lives in @nuri/spec; this web
 * projection lives here in @nuri/prototype.
 * ══════════════════════════════════════════════════════════════════ */

import { readFile } from 'node:fs/promises';

import { stripTypes } from './strip.js';

// ── load the TS SoT (the shared agnostic opt-ins) ──
export async function loadInteractive(effectsTsPath) {
  const src = await readFile(effectsTsPath, 'utf8');
  const mod = await import('data:text/javascript,' + encodeURIComponent(stripTypes(src)));
  // A strip regression must fail LOUD here, not silently emit garbage.
  const { opts } = mod;
  if (!opts || typeof opts !== 'object' || !Object.keys(opts).length) {
    throw new Error('[interactive-css] loadInteractive: opts missing/empty (strip regression?)');
  }
  return { opts };
}

// The web-only realization for interactive. Keeping it in this projection closes the
// SEED-1 spec-agnosticism violation while preserving the exact generated CSS.
const WEB_CHROME = {
  affordance: {
    on: [{}],
    decls: [
      ['cursor', 'pointer'],
      ['transition', 'background-color var(--nuri-duration-fast) ease, transform var(--nuri-duration-fast) ease'],
    ],
  },
  focus: {
    on: [{ state: ':focus-visible' }],
    decls: [
      ['outline', '2px solid var(--nuri-focus-ring)'],
      ['outline-offset', '2px'],
    ],
  },
  disabledGuard: {
    on: [{ attr: '[aria-disabled="true"]', state: ':active' }],
    decls: [['transform', 'none']],
  },
};

// LOAD-BEARING: pressScale must emit before disabledGuard so the disabled transform
// guard wins for a both-gated active control. Guard D proves this order.
const WEB_ORDER = ['affordance', 'focus', 'pressScale', 'disabledGuard', 'disabledOpacity'];

function requireOpt(opts, key) {
  const opt = opts[key];
  if (!opt || typeof opt !== 'object') {
    throw new Error(`[interactive-css] required interactive opt '${key}' is missing`);
  }
  return opt;
}

function gatedAttr(opts, key) {
  const gate = requireOpt(opts, key).gate;
  if (!gate || gate === 'auto') {
    throw new Error(`[interactive-css] opt '${key}' must have an explicit projection gate`);
  }
  return `[data-${gate}]`;
}

function optWebRule(opts, key) {
  switch (key) {
    case 'pressColor':
      return null;
    case 'pressScale':
      return {
        on: [{ attr: gatedAttr(opts, 'pressScale'), state: ':active' }],
        decls: [['transform', 'scale(var(--nuri-interaction-press-scale))']],
      };
    case 'disabledOpacity':
      return {
        on: [{ state: ':disabled' }, { attr: '[aria-disabled="true"]' }],
        decls: [['opacity', 'var(--nuri-interaction-disabled-opacity)']],
      };
    default:
      throw new Error(`[interactive-css] no web projection rule for interactive opt '${key}'`);
  }
}

export function interactiveWebProjection(opts) {
  const optRules = {};
  for (const key of Object.keys(opts)) {
    optRules[key] = optWebRule(opts, key);
  }
  return { optRules, webChrome: WEB_CHROME, webOrder: WEB_ORDER };
}

// ── a SelectorPart → its full selector (NO element wrapper · the class IS the node) ──
// `.nuri-interactive` + the optional attr gate + the optional pseudo-state. Both
// absent ⇒ the bare class (affordance).
const BASE = '.nuri-interactive';
export function partToSelector(part) {
  if (part === null || typeof part !== 'object') {
    throw new Error(`[interactive-css] selector part is not an object: ${JSON.stringify(part)}`);
  }
  return BASE + (part.attr ?? '') + (part.state ?? '');
}

// ── a WebRule { on, decls } → its CSS rule { sel, decls } ────────────
// `sel` is the comma-joined selector list (usually one part · disabledOpacity has
// two). `decls` passes through verbatim (the [prop, value] pairs · no value transform).
export function ruleToCss(rule) {
  if (!rule || !Array.isArray(rule.on) || rule.on.length === 0) {
    throw new Error(`[interactive-css] web rule has no selector parts: ${JSON.stringify(rule)}`);
  }
  if (!Array.isArray(rule.decls) || rule.decls.length === 0) {
    throw new Error(`[interactive-css] web rule has no declarations: ${JSON.stringify(rule)}`);
  }
  const sel = rule.on.map(partToSelector).join(', ');
  return { sel, decls: rule.decls };
}

// ── serialize a rule → CSS text (indented inside @layer rules) ──────
function serializeRule({ sel, decls }) {
  const body = decls.map(([p, v]) => `${p}: ${v};`).join(' ');
  return `  ${sel} { ${body} }`;
}

// ══════════════════════════════════════════════════════════════════
// emitInteractiveCss · the SoT opts + web projection → the full namespace CSS file
// ══════════════════════════════════════════════════════════════════
// Walks webOrder, pulling each rule from webChrome (literal) or optRules[name] (built),
// in the LOAD-BEARING array order (pressScale strictly before disabledGuard). Layout:
// provenance header + empty `@layer tokens` (interactive dispatches the shared --nuri-
// interaction-* / --nuri-focus-ring vocabulary directly · decision 37) + `@layer rules`.
export function emitInteractiveCss({ opts }) {
  const { optRules, webChrome, webOrder } = interactiveWebProjection(opts);
  const ruleLines = webOrder
    .map((name) => {
      const rule = webChrome[name] ?? optRules[name];
      if (!rule) {
        throw new Error(`[interactive-css] webOrder entry '${name}' resolves to no rule (not in webChrome and optRules['${name}'] is null/absent)`);
      }
      return rule;
    })
    .map(ruleToCss)
    .map(serializeRule);

  return [
    // ⚠ This GENERATED header is held BYTE-IDENTICAL to the committed interactive.css
    // (the decision-74 freshness gate · git diff --exit-code). The web realization has
    // moved into this projection (SEED-1a), but the OUTPUT must not change — so the
    // header wording stays as-is until the SoT-name refresh rides a future re-emit.
    // "EFFECT set" ≡ the interactive-effects.ts opts plus this projection table.
    `/* ──────────────────────────────────────────────────────────────`,
    ` * NURI · NAMESPACE CSS · INTERACTIVE · GENERATED — DO NOT EDIT BY HAND`,
    ` *`,
    ` * GENERATED from the interactive EFFECT set (packages/spec/pipeline/interactive-`,
    ` * effects.ts) by prototype/pipeline/css-preview.js — the inverse-spelling of`,
    ` * flattenPart (packages/rn/factory/resolve.ts) — wired into npm run build -w`,
    ` * @nuri/prototype (its own build · regenerates IN PLACE over prototype/styles/`,
    ` * interactive.css). This is the LIVE interactive namespace CSS: the pages link it and`,
    ` * the web factory styles the nuri-interactive merged node with it. decision 2 reversed`,
    ` * for the namespace layer (decision 74 · executing decision 70 · the L3c flip · N+38 ·`,
    ` * carved to @nuri/prototype at N+41) — the hand SoT retired (git-recoverable), the`,
    ` * generator is the sole source. The rule ORDER is LOAD-BEARING — pressScale before`,
    ` * disabledGuard so a disabled control's transform resolves to none (the equal-`,
    ` * specificity pair · the order guard proves it). Re-run npm run build -w @nuri/`,
    ` * prototype; freshness gated by prototype/pipeline/interactive-css.test.js.`,
    ` * ────────────────────────────────────────────────────────────── */`,
    ``,
    `@layer tokens {`,
    `  /* Empty by design (decision 37 · the Stack/Box/Palette pattern). interactive`,
    `   * dispatches the shared --nuri-interaction-* / --nuri-focus-ring / --nuri-`,
    `   * duration-fast vocabulary directly in \`@layer rules\`; a --nuri-interactive-*`,
    `   * alias would be useless indirection. Mirrors the hand interactive.css. */`,
    `}`,
    ``,
    `@layer rules {`,
    ruleLines.join('\n'),
    `}`,
    ``,
  ].join('\n');
}
