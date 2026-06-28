/* ══════════════════════════════════════════════════════════════════
 * NURI · PARSER · COLOUR CSS EMIT (N+32 C1 · decision 70 · the second flip)
 * ──────────────────────────────────────────────────────────────────
 * The TS colour-primitive SoT (pipeline/colours.ts) → the colour declarations in
 * styles/tokens-primitive.css. decision 2 is REVERSED for the colour-PRIMITIVE
 * layer: these values are WRITTEN INTO the CSS, not read out of it. The dimension
 * vertical (N+31 · parsers/dimension-css.js) is the template; this is its colour
 * twin. The SEMANTIC accent×theme matrix (tokens-semantic.css · the decision-63
 * cascade) is NOT touched here — that is C2.
 *
 * The emit is an in-place PASSTHROUGH (the dimension S1 "passthrough-hybrid"):
 * postcss parses the hand CSS and ONLY the `--nuri-color-*` declarations' values
 * are rewritten from the SoT — every non-colour declaration, comment, and byte of
 * whitespace passes through verbatim (postcss preserves raws · setting a decl to
 * its current value round-trips byte-identical). At the default neutral (cream)
 * the values are unchanged from the committed CSS, so the whole pipeline
 * downstream (tokens.json · tokens.ts · …) stays byte-identical — tokens.ts
 * already resolved cream since decision 31 (N+5.8). cream ≠ gray is therefore a
 * WEB-CSS-ONLY value change (the old `:root` default was gray).
 *
 * Two `--nuri-color-*` sub-families, both owned here (one file · tokens-primitive):
 *   · the RAW scales        — 7 neutrals + lilac (12 × {light,dark}) + black/white
 *                             alpha (12 · theme-invariant). The literal catalog.
 *   · the NEUTRAL RESOLUTION — --nuri-color-neutral-N-{light,dark} →
 *                             var(--nuri-color-<active>-N-{light,dark}). ONE :root
 *                             block, the active scale baked in from the build's
 *                             --neutral (default cream). This REPLACES the retired
 *                             runtime [data-neutral] switcher (the 8 alias blocks ·
 *                             build-time selection only · the brief). --neutral=sage
 *                             repoints it (the whole web system rebuilds sage).
 *
 * The rewrite asserts the SoT and the CSS own EXACTLY the same `--nuri-color-*`
 * leaves (the drift guard · both directions) — a colour primitive added to one but
 * not the other fails the build loudly rather than silently diverging.
 *
 * loadColours type-strips + data:-URL imports the .ts SoT (node 20 cannot import a
 * .ts) — reusing stripTypes from dimension-css.js (one strip impl · decision 48):
 * the descriptor-twin / L3.1 / N+31 technique.
 * ══════════════════════════════════════════════════════════════════ */

import { readFile, writeFile } from 'node:fs/promises';
import postcss from 'postcss';

import { stripTypes } from './dimension-css.js';

// ── load the TS SoT ────────────────────────────────────────────────
// Strip the (deliberately trivial) TS apparatus colours.ts uses (the single-line
// `type` aliases + the `as const` / `as const satisfies …` suffixes · named types
// only in `satisfies`, so no inner `;` trips the stripper) and import the
// self-contained data module (no runtime imports) via a data: URL.
export async function loadColours(coloursTsPath) {
  const src = await readFile(coloursTsPath, 'utf8');
  const mod = await import('data:text/javascript,' + encodeURIComponent(stripTypes(src)));
  // A strip regression must fail LOUD here, not silently emit garbage: every SoT
  // table must survive the strip as a non-empty object.
  for (const name of ['neutralScales', 'lilac', 'blackAlpha', 'whiteAlpha']) {
    if (!mod[name] || typeof mod[name] !== 'object' || !Object.keys(mod[name]).length) {
      throw new Error(`[colour-css] loadColours: ${name} missing/empty (strip regression?)`);
    }
  }
  return {
    neutralScales: mod.neutralScales,
    lilac: mod.lilac,
    blackAlpha: mod.blackAlpha,
    whiteAlpha: mod.whiteAlpha,
  };
}

// ── SoT → the { cssVar → RHS } maps the rewriter applies ────────────
// A themed scale (gray … cream · lilac): each step → its light + dark literal.
function setThemedScale(map, scaleName, steps) {
  for (const [step, { light, dark }] of Object.entries(steps)) {
    map.set(`--nuri-color-${scaleName}-${step}-light`, light.value);
    map.set(`--nuri-color-${scaleName}-${step}-dark`, dark.value);
  }
}

// The RAW colour catalog (the literal leaves · no aliases). 7 neutrals + lilac +
// the two theme-invariant alpha scales.
export function primitiveColourMap({ neutralScales, lilac, blackAlpha, whiteAlpha }) {
  const map = new Map();
  for (const [scaleName, steps] of Object.entries(neutralScales)) {
    setThemedScale(map, scaleName, steps);
  }
  setThemedScale(map, 'lilac', lilac);
  for (const [base, steps] of [['black', blackAlpha], ['white', whiteAlpha]]) {
    for (const [step, leaf] of Object.entries(steps)) {
      map.set(`--nuri-color-${base}-alpha-${step}`, leaf.value);
    }
  }
  return map;
}

// The NEUTRAL RESOLUTION (the retired-switcher replacement): the active scale's
// steps → var(--nuri-color-<active>-N-{light,dark}). Parameterized by the build's
// --neutral (so it cannot be static SoT data). Iterates the active scale's own
// steps — a missing scale throws (the flag is validated upstream, but fail loud).
export function neutralResolutionMap(neutralScales, neutral) {
  const steps = neutralScales[neutral];
  if (!steps) {
    throw new Error(`[colour-css] neutralResolutionMap: '${neutral}' is not a neutral scale in pipeline/colours.ts (have: ${Object.keys(neutralScales).join(', ')})`);
  }
  const map = new Map();
  for (const step of Object.keys(steps)) {
    for (const theme of ['light', 'dark']) {
      map.set(`--nuri-color-neutral-${step}-${theme}`, `var(--nuri-color-${neutral}-${step}-${theme})`);
    }
  }
  return map;
}

// The full set of `--nuri-color-*` declarations the SoT owns in tokens-primitive
// (the raw catalog ∪ the neutral resolution), for the in-place rewrite.
export function colourPrimitiveMap({ colours, neutral }) {
  const map = primitiveColourMap(colours);
  for (const [k, v] of neutralResolutionMap(colours.neutralScales, neutral)) {
    map.set(k, v);
  }
  return map;
}

// ── the in-place rewrite (the passthrough emit) ─────────────────────
// Parse `cssText`, set every declaration whose prop is in `declMap` to its SoT
// value (verbatim everything else), and enforce the drift guard in BOTH
// directions over `ownedRe` (the family this file owns): the SoT must declare
// exactly the leaves the CSS does. Returns the restringified CSS. (The colour
// twin of dimension-css.js rewriteDimensionDecls.)
export function rewriteColourDecls(cssText, declMap, ownedRe) {
  const root = postcss.parse(cssText);
  const seen = new Set();
  const cssOwned = new Set();
  root.walkDecls((decl) => {
    if (ownedRe.test(decl.prop)) cssOwned.add(decl.prop);
    if (!declMap.has(decl.prop)) return;
    if (seen.has(decl.prop)) {
      throw new Error(`[colour-css] ${decl.prop} declared more than once — the SoT must own a single declaration per leaf`);
    }
    seen.add(decl.prop);
    decl.value = declMap.get(decl.prop);
  });
  const missingInCss = [...declMap.keys()].filter((p) => !seen.has(p));
  if (missingInCss.length) {
    throw new Error(`[colour-css] the SoT declares ${missingInCss.join(', ')} but the CSS has no such declaration — add it to the CSS or remove it from pipeline/colours.ts`);
  }
  const orphanInCss = [...cssOwned].filter((p) => !declMap.has(p));
  if (orphanInCss.length) {
    throw new Error(`[colour-css] the CSS declares ${orphanInCss.join(', ')} but pipeline/colours.ts does not — the SoT must own every colour declaration in tokens-primitive.css`);
  }
  return root.toString();
}

// ── the flip · SoT → tokens-primitive.css, in place ─────────────────
// Slice 0 of the build (pipeline/tokens-parser.js): regenerate the colour
// declarations from the SoT BEFORE every downstream slice reads the CSS. Writes
// into styles/ (the dimension S1 passthrough-hybrid trade · muddier provenance for
// zero repointing); byte-identical at the default neutral. Returns the rewritten
// string so a caller can reuse it without re-reading. ONLY tokens-primitive.css
// (the colour primitives + the neutral resolution); the semantic cascade is C2.
export async function flipColourCss({ primitivePath, colours, neutral }) {
  const declMap = colourPrimitiveMap({ colours, neutral });
  const primitive = rewriteColourDecls(
    await readFile(primitivePath, 'utf8'), declMap, /^--nuri-color-/,
  );
  await writeFile(primitivePath, primitive, 'utf8');
  return { primitive };
}
