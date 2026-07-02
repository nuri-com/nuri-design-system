/* ══════════════════════════════════════════════════════════════════
 * NURI · PARSER · TYPE-SCALE CSS EMIT (N+52 · decision 78 · the type composite)
 * ──────────────────────────────────────────────────────────────────
 * The TS type SoT (packages/spec/tokens/typography.ts) → the --nuri-type-* declarations in
 * styles/tokens-primitive.css. decision 2 is REVERSED for the type COMPOSITE: the
 * six step composites are WRITTEN INTO the CSS, not read out of it.
 *
 * The emit is an in-place rewrite (the dimension-css.js posture): postcss parses
 * the hand CSS and ONLY the --nuri-type-* declarations' values are regenerated
 * from the SoT — every other declaration, comment, and byte of whitespace passes
 * through verbatim (postcss preserves raws). Unlike the dimension flip this is NOT
 * a pure passthrough — the values are DE-REFERENCED to inline:
 *   · --nuri-type-{step}-size:   var(--nuri-font-size-N) → the rem literal (px÷16
 *                                · 17 → 1.0625rem · the current spelling · rendered
 *                                value identical)
 *   · --nuri-type-{step}-weight: var(--nuri-font-weight-X) → the weight literal
 *                                (regular → 400 · resolved from the primitive)
 *   · --nuri-type-{step}-line-height / -tracking: already inline today — re-emitted
 *                                from the SoT to the SAME value (the ratio · the em)
 * So the --nuri-font-size-* / --nuri-font-weight-* PRIMITIVES go back to being a
 * foundational hand-CSS layer (shell.css's concern · NOT touched here · a Phase 4·3
 * residue) — the fake type↔shell coupling dissolves. The resolved VALUES are
 * unchanged, so packages/rn/generated/data/tokens.ts (the RN reader · re-sourced onto this SoT) +
 * everything downstream stays byte-identical; only the --nuri-type-* block's
 * spelling changes (var→inline · computed-equivalent · the N+45 gate posture).
 *
 * The drift guard runs in BOTH directions over /^--nuri-type-/ (the family this
 * emit owns): the SoT must declare exactly the --nuri-type-* leaves the CSS does.
 *
 * loadTypography imports the .ts SoT through scripts/ts-data-loader.js, the shared
 * build-time TS→ESM data boundary.
 * ══════════════════════════════════════════════════════════════════ */

import { readFile, writeFile } from 'node:fs/promises';
import postcss from 'postcss';

import { loadTsDataFromPath } from '../ts-data-loader.js';

// ── load the TS SoT ────────────────────────────────────────────────
export async function loadTypography(typographyTsPath) {
  const mod = await loadTsDataFromPath(typographyTsPath);
  if (!mod.type || typeof mod.type !== 'object' || !Object.keys(mod.type).length) {
    throw new Error('[type-css] loadTypography: `type` missing/empty (loader regression?)');
  }
  return mod.type;
}

// ── the font-weight primitive map (name → literal) ──────────────────
// Parse the --nuri-font-weight-* declarations from the CSS the flip reads, so the
// SoT's readable weight NAME (`regular`) resolves to its inline LITERAL (`400`)
// against the primitive that stays the source of truth for the weight value. The
// primitives are bare literals (no var chain), so a direct read suffices.
export function readFontWeights(cssText) {
  const map = new Map();
  postcss.parse(cssText).walkDecls((decl) => {
    const m = decl.prop.match(/^--nuri-font-weight-([a-z]+)$/);
    if (m) map.set(m[1], decl.value.trim());
  });
  return map;
}

// px → rem at the 16px root baseline (the inverse of components.js#remToPx · 17 →
// 1.0625rem · the current spelling). The six font sizes all divide 16 exactly, so
// the rem is exact; round defensively against float artifacts.
function pxToRem(px) {
  return `${Math.round((px / 16) * 1e6) / 1e6}rem`;
}

// ── SoT step → the { cssVar → RHS } map the rewriter applies ─────────
// Every leaf DE-REFERENCED to inline: size → the rem literal, weight → the resolved
// literal, lineHeight → the unitless ratio, tracking → the em number (0 stays the
// bare `0`). Four leaves per step.
export function typeDeclMap(type, fontWeights) {
  const map = new Map();
  for (const [step, s] of Object.entries(type)) {
    const weight = fontWeights.get(s.weight);
    if (weight == null) {
      throw new Error(`[type-css] step '${step}' weight '${s.weight}' has no --nuri-font-weight-${s.weight} primitive to resolve against`);
    }
    map.set(`--nuri-type-${step}-size`, pxToRem(s.fontSize));
    map.set(`--nuri-type-${step}-line-height`, String(s.lineHeight));
    map.set(`--nuri-type-${step}-tracking`, s.letterSpacing === 0 ? '0' : `${s.letterSpacing}em`);
    map.set(`--nuri-type-${step}-weight`, weight);
  }
  return map;
}

// ── the in-place rewrite ────────────────────────────────────────────
// Parse `cssText`, set every --nuri-type-* declaration to its SoT value (verbatim
// everything else), and enforce the drift guard in BOTH directions: the SoT must
// declare exactly the --nuri-type-* leaves the CSS does. Returns the restringified
// CSS. Mirrors dimension-css.js#rewriteDimensionDecls.
export function rewriteTypeDecls(cssText, declMap) {
  const root = postcss.parse(cssText);
  const seen = new Set();
  const cssOwned = new Set();
  root.walkDecls((decl) => {
    if (/^--nuri-type-/.test(decl.prop)) cssOwned.add(decl.prop);
    if (!declMap.has(decl.prop)) return;
    if (seen.has(decl.prop)) {
      throw new Error(`[type-css] ${decl.prop} declared more than once — the SoT must own a single declaration per leaf`);
    }
    seen.add(decl.prop);
    decl.value = declMap.get(decl.prop);
  });
  const missingInCss = [...declMap.keys()].filter((p) => !seen.has(p));
  if (missingInCss.length) {
    throw new Error(`[type-css] the SoT declares ${missingInCss.join(', ')} but the CSS has no such declaration — add it to the CSS or remove it from packages/spec/tokens/typography.ts`);
  }
  const orphanInCss = [...cssOwned].filter((p) => !declMap.has(p));
  if (orphanInCss.length) {
    throw new Error(`[type-css] the CSS declares ${orphanInCss.join(', ')} but packages/spec/tokens/typography.ts does not — the SoT must own every --nuri-type-* declaration`);
  }
  return root.toString();
}

// ── the flip · SoT → tokens-primitive.css, in place ─────────────────
// Slice 0 of the build (scripts/tokens-parser.js): regenerate the --nuri-type-*
// declarations (de-referenced to inline) from the SoT BEFORE Slice 2 reads the
// CSS. The weight names resolve against the font-weight primitives read from the
// same file. Returns the rewritten string so a caller can reuse it.
export async function flipTypeCss({ primitivePath, type }) {
  const cssText = await readFile(primitivePath, 'utf8');
  const css = rewriteTypeDecls(cssText, typeDeclMap(type, readFontWeights(cssText)));
  await writeFile(primitivePath, css, 'utf8');
  return css;
}
