/* ──────────────────────────────────────────────────────────────
 * NURI · @nuri/doc · DESCRIPTOR → doc IR (N+42 · A4)
 *
 * Reshapes a frozen @nuri/spec descriptor (decision 69 · the SoT · imported
 * as its browser-ESM twin · build/descriptors/<name>.js) into the IR the
 * doc-gen renders. DISENTANGLED from @nuri/spec's pipeline/parsers/descriptors.js
 * at A4 (the rest of that file — the descriptor DATA emit — stays in @nuri/spec):
 * building the DOC IR is @nuri/doc's concern (it shapes the descriptor for the
 * Markdown page), so it travels with the emitter (convergence §5).
 *
 * The three reshape helpers (camel · exportNameFor · typeNameFor) are copied
 * verbatim from @nuri/spec's descriptors.js — trivial naming, owned by each
 * library that builds a descriptor IR (the strip.js · @nuri/prototype strip.js
 * "each library owns its helper" precedent). @nuri/spec keeps its copies (Slice 7
 * + Guard D); a divergence would surface as a wrong export name (the twin import
 * throws) or a byte-identical-gate failure.
 * ────────────────────────────────────────────────────────────── */

// kebab → camel (composition-button → compositionButton).
const camel = (s) => s.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());

// The export const name on the descriptor twin (compositionButtonDescriptor).
export function exportNameFor(name) {
  return camel(name) + 'Descriptor';
}
// The axes type name (CompositionButtonAxes) — surfaced on the IR (vestigial
// for the emitter, kept for IR-shape fidelity with the pre-A4 pipeline).
function typeNameFor(name) {
  const c = camel(name);
  return c.charAt(0).toUpperCase() + c.slice(1) + 'Axes';
}

// Descriptor → the doc IR: { name, source, exportName, typeName, axes, anatomy,
// base, variants }. axes = { <axis>: [<value>, …] } derived from variants. The
// anatomy / base / variants pass through from descriptor.structure (verbatim from
// the pre-A4 pipeline's docIrFromDescriptor so the emitted page is byte-identical).
export function docIrFromDescriptor(spec, descriptor) {
  const variants = descriptor.variants || {};
  const axes = {};
  for (const axis of Object.keys(variants)) axes[axis] = Object.keys(variants[axis]);
  return {
    name: spec.name,
    source: spec.source,
    exportName: exportNameFor(spec.name),
    typeName: typeNameFor(spec.name),
    axes,
    anatomy: descriptor.structure.anatomy,
    base: descriptor.structure.base,
    variants,
  };
}

// The component manifest — { descriptor NAME → doc SOURCE slug }. A copy of the
// {name, source} pairs from @nuri/spec's DESCRIPTOR_COMPONENTS (the 3 frozen
// descriptors · 65.3): @nuri/doc owns WHICH descriptors it documents (today the
// full descriptor set; the token + axis families land at A4b/A4c under their own
// manifests). The browser-ESM twin for each is imported from @nuri/spec.
export const DOC_COMPONENTS = [
  { name: 'composition-button', source: 'button' },
  { name: 'icon-avatar', source: 'icon-avatar' },
  { name: 'topbar', source: 'topbar' },
];
