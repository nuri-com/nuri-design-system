/* ──────────────────────────────────────────────────────────────
 * NURI · ICONS EMITTER (Node)
 *
 * Emits build/icons.ts — a TYPED registry of phosphor SVG path
 * strings — from lib/components/icon/icons.js (the single source of
 * truth · decision 38). The web side inlines icons.js directly
 * (zero-build); the RN side consumes the typed emit through
 * react-native-svg's SvgXml. ONE registry, TWO readers (decision 48).
 *
 * This is NOT a token classifier — icons are a closed enum of named
 * SVG assets the CSS cascade can't express (decision 38). The emit is
 * a verbatim, machine-checkable copy of the SSOT: every path string in
 * build/icons.ts equals icons.js, asserted by the sync test. No SVGR,
 * no per-glyph <Path> codegen — that would fork the glyph source into
 * a second hand-maintained shape and break the single-registry
 * invariant decision 38 rests on.
 * ────────────────────────────────────────────────────────────── */

// Fixed weight order — mirrors the icon.js weight-coupling vocabulary
// (decision 38): regular · bold · fill. Deterministic so the emit is
// byte-stable across builds (the drift guard compares re-emit equality).
export const ICON_WEIGHTS = ['regular', 'bold', 'fill'];

// Emit build/icons.ts as a string from the ICONS registry object.
// Path strings are JSON.stringify-encoded so any quote/escape in the
// phosphor `d` data round-trips safely regardless of content.
export function emitIconsTs(icons) {
  const names = Object.keys(icons);
  const lines = [
    `/* ──────────────────────────────────────────────────────────────`,
    ` * NURI · ICON REGISTRY · GENERATED · DO NOT EDIT BY HAND`,
    ` *`,
    ` * Source · lib/components/icon/icons.js (the SSOT registry)`,
    ` * Emitter · pipeline/tokens-parser.js — run \`npm run build\``,
    ` *`,
    ` * Typed mirror of the hand-curated phosphor registry: ${names.length}`,
    ` * glyphs × ${ICON_WEIGHTS.length} weights. The web inlines icons.js directly; this`,
    ` * file is the RN runtime's reader (react-native-svg SvgXml over the`,
    ` * same strings · decision 48). Every path string here equals`,
    ` * icons.js — enforced by the sync test in tokens-parser.test.js.`,
    ` * ────────────────────────────────────────────────────────────── */`,
    ``,
    `export type IconName =`,
    ...names.map((n, i) => `  | '${n}'${i === names.length - 1 ? ';' : ''}`),
    ``,
    `export type IconWeight = ${ICON_WEIGHTS.map((w) => `'${w}'`).join(' | ')};`,
    ``,
    `export const icons: Record<IconName, Record<IconWeight, string>> = {`,
  ];
  for (const name of names) {
    lines.push(`  '${name}': {`);
    for (const weight of ICON_WEIGHTS) {
      lines.push(`    ${weight}: ${JSON.stringify(icons[name][weight])},`);
    }
    lines.push(`  },`);
  }
  lines.push(`};`);
  lines.push('');
  return lines.join('\n');
}
