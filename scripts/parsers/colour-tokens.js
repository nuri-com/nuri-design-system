/* ══════════════════════════════════════════════════════════════════
 * NURI · PARSER · COLOUR → packages/rn/generated/tokens.ts (N+59 · Slice 3b·1 · decision 80)
 * ──────────────────────────────────────────────────────────────────
 * Re-sources the COLOUR arm of packages/rn/generated/tokens.ts (chrome + accent) STRAIGHT from
 * packages/spec/tokens/colours.ts — ref→hex, no CSS round-trip. The projection model
 * (docs/projection-model.md §3): colour is LAYERED SUBSTITUTION (accent upstream
 * of mode), NOT a materialized (accent × theme) cross-product. So:
 *
 *   · chrome  → theme-major, BYTE-IDENTICAL to the old CSS-walked emit. chrome is
 *     accent-invariant (theme-only); each role's `{light,dark}` ref pair resolves to
 *     a hex pair. Emitted via the SAME generic emitTokensTs path (so the spelling is
 *     unchanged), only the VALUES now come from the TS SoT — we hand back a
 *     cross-product shape with all three accents holding the identical hex pair.
 *   · accent  → accent-MAJOR, TWO-LAYER (the new shape): `Record<Accent, { role:
 *     hex | {light,dark} }>`. A FLAT SoT role (a single bare ref · the P4-frozen
 *     brand fill) → one `hex` string; a PAIR SoT role (`{light,dark}`) → `{light:
 *     hex, dark: hex}`. The flat-vs-pair distinction is read STRAIGHT from
 *     packages/spec/tokens/colours.ts's authored shape (string vs object), never re-derived from CSS.
 *     This kills the duplication the cross-product carried (solid/solid-pressed/
 *     on-solid were byte-copied across light & dark).
 *
 * A ref is a BARE `'scale.step.theme'` string (N+55 · decision 80). Refs resolve as
 * `ramps[scale][step][theme].value`, where `neutral` is the ABSTRACT pointer that
 * resolves to the build's active --neutral scale (default cream) — the same
 * resolution the colour-semantic parity harness restates by hand.
 *
 * The runtime composition `chrome[mode] ⊕ accent[accent][mode]` (theme.tsx
 * runtimeTokens) yields a slice BYTE-IDENTICAL to today — the values are unchanged,
 * only the accent SHAPE + how tokens.ts is GENERATED change.
 * ══════════════════════════════════════════════════════════════════ */

import { ACCENTS, THEMES } from './semantic.js';

// camelCase a kebab role key (the leaf identifier build/tokens.ts exposes ·
// 'solid-pressed' → 'solidPressed'). Mirrors semantic.js's classifier camelCase so
// the accent leaf names + the TokenPath union (accent.solidPressed · token-paths.ts)
// stay in lockstep.
function camelCase(str) {
  return str.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
}

// Build the ref → hex resolver for the build's active neutral. `neutral` is the
// abstract pointer (→ the active scale · cream by default); the accent ramps
// (lilac · orange · …) resolve by their own name. Data-driven over colours.ts's
// accentScales (N+56) — adding an accent ramp needs no edit here.
function makeRefResolver(colours, neutral) {
  const scales = colours.neutralScales[neutral];
  if (!scales) {
    throw new Error(
      `[colour-tokens] '${neutral}' is not a neutral scale in packages/spec/tokens/colours.ts ` +
      `(have: ${Object.keys(colours.neutralScales).join(', ')})`,
    );
  }
  const sotScales = { neutral: scales, ...colours.accentScales };
  return function resolveRef(ref) {
    if (typeof ref !== 'string') {
      throw new Error(`[colour-tokens] colour ref is not a bare string: ${JSON.stringify(ref)}`);
    }
    const parts = ref.split('.');
    if (parts.length !== 3 || !THEMES.includes(parts[2])) {
      throw new Error(`[colour-tokens] bad colour ref '${ref}' — want 'scale.step.theme' (theme ∈ {${THEMES.join(',')}})`);
    }
    const [scale, step, theme] = parts;
    const table = sotScales[scale];
    if (!table) {
      throw new Error(`[colour-tokens] unknown scale '${scale}' in ref '${ref}'`);
    }
    const leaf = table[step]?.[theme];
    if (!leaf || typeof leaf.value !== 'string') {
      throw new Error(`[colour-tokens] no primitive for ref '${ref}'`);
    }
    return leaf.value;
  };
}

// chrome (theme-only · accent-invariant) → a cross-product node per role, in the
// shape resolveSemanticCrossProduct produces ({ [cssVar]: { [accent]: { [theme]:
// hex } } }) so the generic emitTokensTs chrome path emits it theme-major +
// byte-identical. Each role's `{light,dark}` ref pair resolves to a hex pair; the
// SAME pair is handed to every accent (chrome does not vary by accent — the
// emitter's accent-invariance rail asserts it).
function chromeCrossProduct(chrome, resolveRef) {
  const out = {};
  for (const [role, pair] of Object.entries(chrome)) {
    const hex = { light: resolveRef(pair.light), dark: resolveRef(pair.dark) };
    const perAccent = {};
    for (const a of ACCENTS) perAccent[a] = { light: hex.light, dark: hex.dark };
    out[`--nuri-${role}`] = perAccent;
  }
  return out;
}

// accent (accent-major) → the two-layer table: { [accentName]: { [camelLeaf]: hex |
// {light,dark} } }. A flat ref → one hex; a `{light,dark}` ref pair → a hex pair.
// Accent order follows ACCENTS (the emitted Record<Accent,…> order); the role order
// follows the SoT's authored order (fg · solid · solid-pressed · on-solid ·
// bg-subtle · bg-subtle-pressed).
function accentTwoLayer(accent, resolveRef) {
  const out = {};
  for (const accentName of ACCENTS) {
    const roles = accent[accentName];
    if (!roles) {
      throw new Error(`[colour-tokens] accent '${accentName}' (in ACCENTS) has no entry in colours.ts accent`);
    }
    const table = {};
    for (const [role, def] of Object.entries(roles)) {
      table[camelCase(role)] =
        typeof def === 'string'
          ? resolveRef(def)
          : { light: resolveRef(def.light), dark: resolveRef(def.dark) };
    }
    out[accentName] = table;
  }
  return out;
}

// The whole colour arm of build/tokens.ts, resolved from the TS SoT. `chrome` is a
// cross-product node map (merged over resolveSemanticCrossProduct's output so the
// generic emit stays byte-identical); `accent` is the two-layer table the dedicated
// accent emitter formats. `neutral` is the build's active --neutral scale.
export function resolveColourTokens({ chrome, accent }, colours, neutral) {
  const resolveRef = makeRefResolver(colours, neutral);
  return {
    chrome: chromeCrossProduct(chrome, resolveRef),
    accent: accentTwoLayer(accent, resolveRef),
  };
}
