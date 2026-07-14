/* ──────────────────────────────────────────────────────────────
 * NURI · ICONS PARSER (Node) · the SVG FOLDER is the SoT
 *
 * The icon SoT is the folder icons/*.svg (decision 38 · N+51 ·
 * convergence phase 4·1). Adding an icon = dropping a file: the
 * filename is the icon name (kebab-case), the file is one drawing.
 * Everything downstream is GENERATED, never hand-edited:
 *   · packages/prototype/generated/icons.js — the web reader (zero-build import)
 *   · packages/rn/generated/data/icons.ts        — the RN reader (typed · SvgXml)
 * ONE registry, TWO readers (decision 48), both emitted from here.
 *
 * The model SIMPLIFIED at N+51: one drawing per glyph · NO weights
 * (the old regular/bold/fill triple is RETIRED) · colour is always
 * currentColor (decision 38). The element re-wraps the inner markup in
 * an <svg viewBox="0 0 32 32" fill="currentColor">.
 *
 * This is NOT a token classifier and uses NO postcss — icons are a
 * closed enum of named SVG assets the CSS cascade can't express
 * (decision 38). The codegen stays SVG-text processing inside spec's
 * pipeline (the codegen-move is Phase 4·3, not this session).
 * ────────────────────────────────────────────────────────────── */

import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { loadTsDataFromPath } from '../ts-data-loader.js';

// Every source SVG must share this viewBox — the element wraps the inner
// markup in a constant <svg viewBox="0 0 32 32">. A glyph authored at a
// different viewBox would silently mis-scale, so we ASSERT uniformity and
// fail LOUD (the operator normalizes the source, not the generator).
export const ICON_VIEWBOX = '0 0 32 32';

const SUPPORTED_ICON_MOTIONS = new Set(['spin']);

export async function loadIconMotion(path) {
  const mod = await loadTsDataFromPath(path);
  const motion = mod.iconMotion;
  const durationMs = mod.iconMotionDurationMs;
  if (!motion || typeof motion !== 'object' || Array.isArray(motion)) {
    throw new Error('[icons] iconMotion must be an object keyed by icon name.');
  }
  if (!durationMs || typeof durationMs !== 'object' || Array.isArray(durationMs)) {
    throw new Error('[icons] iconMotionDurationMs must be an object keyed by motion name.');
  }
  return { motion, durationMs };
}

export function validateIconMotion(icons, motion, durationMs) {
  for (const [name, value] of Object.entries(motion)) {
    if (!(name in icons)) {
      throw new Error(`[icons] motion metadata names unknown glyph '${name}'.`);
    }
    if (!SUPPORTED_ICON_MOTIONS.has(value)) {
      throw new Error(`[icons] glyph '${name}' uses unsupported motion '${value}'.`);
    }
    if (!Number.isFinite(durationMs[value]) || durationMs[value] <= 0) {
      throw new Error(`[icons] motion '${value}' must declare a positive duration in iconMotionDurationMs.`);
    }
  }
  const orphanDurations = Object.keys(durationMs).filter(
    (value) => !Object.values(motion).includes(value),
  );
  if (orphanDurations.length) {
    throw new Error(`[icons] motion durations have no glyphs: ${orphanDurations.join(', ')}.`);
  }
}

// Pull the inner <path> markup out of one source SVG and normalize it into a
// registry value. Preserves each path's `d`, `fill-rule`, `clip-rule` and
// attribute order verbatim; only the hardcoded `fill` (white / #F0EEE3 / …)
// is rewritten to `currentColor` so the glyph inherits its parent's text
// colour (decision 38 · the sole colour story). A path with no `fill` is left
// untouched — the wrapper's currentColor applies.
export function extractIconMarkup(svgText, name) {
  // Guard the viewBox (assert-uniform · robust over a growing folder).
  const viewBoxMatch = svgText.match(/<svg\b[^>]*\bviewBox="([^"]*)"/i);
  const viewBox = viewBoxMatch && viewBoxMatch[1].trim();
  if (viewBox !== ICON_VIEWBOX) {
    throw new Error(
      `[icons] '${name}.svg' has viewBox="${viewBox ?? '(none)'}" — every icon must be ` +
      `viewBox="${ICON_VIEWBOX}" (the element wraps a constant viewBox · re-author the source).`,
    );
  }

  // Extract every <path …/> element (self-closing or not), in source order.
  const paths = svgText.match(/<path\b[^>]*?\/?>/gi) || [];
  if (paths.length === 0) {
    throw new Error(`[icons] '${name}.svg' has no <path> — an icon must draw at least one path.`);
  }

  return paths
    .map((path) => {
      // Normalize the fill VALUE only. `fill="…"` is the colour attribute;
      // `fill-rule="…"` / `clip-rule="…"` are NOT matched (the `=` must follow
      // `fill` immediately) so the even-odd rules pass through untouched.
      const recoloured = path.replace(/\bfill="[^"]*"/g, 'fill="currentColor"');
      // Collapse any internal whitespace runs to single spaces and trim so the
      // emitted string is byte-stable regardless of source formatting.
      return recoloured.replace(/\s+/g, ' ').replace(/\s*\/>$/, '/>').trim();
    })
    .join('');
}

// Read the icons/ folder → the ICONS registry { name: '<path…/>…' }.
// Names are the .svg filenames (kebab-case), sorted so the emit is
// deterministic (the byte-identical re-emit gate · decision 35).
export async function readIcons(dir) {
  const files = (await readdir(dir))
    .filter((f) => f.endsWith('.svg'))
    .sort();
  const icons = {};
  for (const file of files) {
    const name = file.slice(0, -'.svg'.length);
    const svgText = await readFile(resolve(dir, file), 'utf8');
    icons[name] = extractIconMarkup(svgText, name);
  }
  return icons;
}

// Emit packages/prototype/generated/icons.js — the web reader (zero-build ES module
// import). GENERATED + committed + byte-identical-guarded (decision 35).
export function emitIconsJs(icons, motion = {}, durationMs = {}) {
  validateIconMotion(icons, motion, durationMs);
  const names = Object.keys(icons);
  const motionNames = Object.keys(motion).sort();
  const motionKinds = Object.keys(durationMs).sort();
  const lines = [
    `/* ──────────────────────────────────────────────────────────────`,
    ` * NURI · COMPONENT · ICON · REGISTRY · GENERATED · DO NOT EDIT BY HAND`,
    ` *`,
    ` * Source · icons/*.svg (the SoT folder · one drawing per glyph)`,
    ` * Emitter · scripts/tokens-parser.js — run \`npm run build\``,
    ` *`,
    ` * ${names.length} glyphs · one markup each · NO weights (decision 38 · N+51).`,
    ` * Colour is currentColor only; <nuri-icon> re-wraps the markup in an`,
    ` * <svg viewBox="${ICON_VIEWBOX}" fill="currentColor">. The web inlines this`,
    ` * file directly (zero-build); build/icons.ts is the typed RN twin (one`,
    ` * registry, two readers · decision 48). To add a glyph, drop a .svg in`,
    ` * icons/ and re-run the build — never hand-edit this file.`,
    ` * ────────────────────────────────────────────────────────────── */`,
    ``,
    `export const ICONS = {`,
    ...names.map((n) => `  '${n}': ${JSON.stringify(icons[n])},`),
    `};`,
    ``,
    `export const ICON_MOTION = {`,
    ...motionNames.map((n) => `  '${n}': ${JSON.stringify(motion[n])},`),
    `};`,
    ``,
    `export const ICON_MOTION_DURATION_MS = {`,
    ...motionKinds.map((n) => `  '${n}': ${durationMs[n]},`),
    `};`,
    ``,
  ];
  return lines.join('\n');
}

// Emit build/icons.ts — the typed RN reader. IconName union +
// Record<IconName, string> (one markup per glyph · no weight inner-map).
// Path strings are JSON.stringify-encoded so any quote/escape round-trips.
export function emitIconsTs(icons, motion = {}, durationMs = {}) {
  validateIconMotion(icons, motion, durationMs);
  const names = Object.keys(icons);
  const motionNames = Object.keys(motion).sort();
  const motionKinds = Object.keys(durationMs).sort();
  const lines = [
    `/* ──────────────────────────────────────────────────────────────`,
    ` * NURI · ICON REGISTRY · GENERATED · DO NOT EDIT BY HAND`,
    ` *`,
    ` * Source · icons/*.svg (the SoT folder · one drawing per glyph)`,
    ` * Emitter · scripts/tokens-parser.js — run \`npm run build\``,
    ` *`,
    ` * Typed RN reader for ${names.length} glyphs · one markup each · NO weights`,
    ` * (decision 38 · N+51). The web inlines packages/prototype/generated/icons.js`,
    ` * directly; this file is the RN runtime's reader (react-native-svg SvgXml`,
    ` * over the same strings · decision 48). Every path string here equals the`,
    ` * folder-generated registry — enforced by the sync test in`,
    ` * tokens-parser.test.js.`,
    ` * ────────────────────────────────────────────────────────────── */`,
    ``,
    `export type IconName =`,
    ...names.map((n, i) => `  | '${n}'${i === names.length - 1 ? ';' : ''}`),
    ``,
    `export const icons: Record<IconName, string> = {`,
    ...names.map((n) => `  '${n}': ${JSON.stringify(icons[n])},`),
    `};`,
    ``,
    `export type IconMotion = ${motionKinds.map((n) => `'${n}'`).join(' | ')};`,
    ``,
    `export const iconMotion: Partial<Record<IconName, IconMotion>> = {`,
    ...motionNames.map((n) => `  '${n}': ${JSON.stringify(motion[n])},`),
    `};`,
    ``,
    `export const iconMotionDurationMs: Record<IconMotion, number> = {`,
    ...motionKinds.map((n) => `  '${n}': ${durationMs[n]},`),
    `};`,
    ``,
  ];
  return lines.join('\n');
}
