/* ──────────────────────────────────────────────────────────────
 * NURI · PARSER · DESCRIPTORS · the authored-source PASSTHROUGH emit
 *
 * The descriptor layer is TS-AUTHORED (decision 69 · §9 step 1): each component
 * descriptor is hand-authored at packages/spec/components/<name>.ts (the SoT ·
 * decision 2 reversed for THIS layer only · the token vocabulary stays CSS-SoT,
 * decision 63 · ring-fenced). This module emits the committed browser-ESM twin
 * FROM that source as a verbatim PASSTHROUGH — swap the authored header for the
 * GENERATED header, type-strip the body (decision 67 · the zero-build runtime
 * web factory imports the .js with no build step). It is a mechanical transform
 * of the SoT, NOT a derivation.
 *
 * (The CSS PARITY ORACLE that once lived here — the pre-SoT cross-check that
 * re-derived each descriptor from the hand component CSS + page HTML and asserted
 * it matched the authored data — was REMOVED at the dead-code prune [debt-register
 * D1]. It was retired at the L3c flip [decision 74 · the descriptor became the
 * SOLE SoT] and the infra-exit deleted its lib//pages/ inputs, so it read files
 * that no longer exist and was never invoked. The no-unused-exports guard
 * [scripts/no-unused-exports.test.js] now gates this surface so the rot can't
 * regrow.)
 *
 * Output shape = the schema at packages/spec/components/schema.ts: PURE DATA
 * (no theme thunk · 65.3 §7) `{ structure: { anatomy, base }, variants? }`, each
 * value a SEMANTIC namespace name (stack · box · typography · palette ·
 * interactive · 65.3 §6). The RN/web factory + the docs consume the AUTHORED
 * descriptor; this module emits its committed twin (the doc IR build moved to
 * @nuri/doc at N+42 · the A4 carve).
 * ────────────────────────────────────────────────────────────── */

// ── The frozen descriptor set · scope-locked · the ONE build-side roster ──────
// Each entry is a descriptor NAME, and `name` IS the component's PUBLIC kebab: the
// authored source file is `components/<name>.ts`, the exports subpath is
// `./descriptors/<name>`, and the factory bindings DERIVE the web/RN names from the
// SAME kebab (web `nuri-{name}` · RN `Pascal({name})` · nuriNames). The vestigial
// `source`/`public` overrides are GONE (deterministic-naming · SEED-2 · D7): the two
// components that carried them — `composition-button`→`button`, `tab`→`tab-bar-item`
// — were renamed at the source so `name === public` for every component, and the
// oracle that read `source`/`kind`/`fgPart` was pruned (debt-register D1/D2). The
// runtime bindings (rn/generated/components/*.ts + the web recipes) restate the same kebab —
// they cannot import this build-time registry across the zero-build web boundary —
// and the naming guard (scripts/naming.test.js · D7 §2) pins that every restated
// name ∈ this ONE roster, so a rename that misses a site fails CI. This is the sole
// build-side list; BROWSER_DESCRIPTOR_COMPONENTS (tokens-parser.js) derives from it.
export const DESCRIPTOR_COMPONENTS = [
  { name: 'alert' },
  { name: 'button' },
  { name: 'icon-avatar' },
  { name: 'topbar' },
  { name: 'icon-button' },
  { name: 'list' },
  { name: 'list-action' },
  { name: 'text-field' },
  { name: 'tab-bar-item' },
  { name: 'tab-bar' },
  { name: 'modal-panel' },
];

// ── NAME → the export identifier / camelCase ─────────────────────────
// `tab-bar-item` → `tabBarItemDescriptor`. Used by the .js twin's header (the
// `import { … }` example) + the docs/Guard D twin reader.
const camel = (s) => s.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());

export function exportNameFor(name) {
  return camel(name) + 'Descriptor';
}

export function validateDescriptorTypographyFlow(name, descriptor) {
  const maps = [];
  if (descriptor.structure?.base) maps.push(['structure.base', descriptor.structure.base]);
  for (const [axis, values] of Object.entries(descriptor.variants || {})) {
    for (const [value, partMap] of Object.entries(values || {})) {
      maps.push([`variants.${axis}.${value}`, partMap]);
    }
  }
  for (const [surface, partMap] of maps) {
    for (const [part, ns] of Object.entries(partMap || {})) {
      const typography = ns?.typography;
      if (!typography) continue;
      const hasLines = typography.lines !== undefined;
      const flow = typography.flow;
      if (flow === 'wrap' && hasLines) {
        throw new Error(`[descriptors] ${name}: ${surface}.${part}.typography flow:'wrap' must not declare lines`);
      }
      if (hasLines && flow !== 'truncate') {
        throw new Error(`[descriptors] ${name}: ${surface}.${part}.typography declares lines without flow:'truncate'`);
      }
      if (flow === 'truncate' && !hasLines) {
        throw new Error(`[descriptors] ${name}: ${surface}.${part}.typography flow:'truncate' must declare lines`);
      }
    }
  }
}

// ════════════════════════════════════════════════════════════════════
// PASSTHROUGH · the AUTHORED descriptor source → build/ (decision 69 · §9 step 1)
// ════════════════════════════════════════════════════════════════════
// The descriptor layer is now TS-authored (packages/spec/components/<name>.ts is
// the SoT · decision 2 reversed for the layer). The committed browser-ESM twin
// build/descriptors/<name>.js is emitted FROM that source: the same DATA body
// MINUS the TS apparatus (the browser-ESM twin · decision 67 · the runtime web
// factory imports it with no build step · zero-build · what Nuri IS #3). This is
// a mechanical transform of the SoT — NOT a CSS derivation. (The verbatim .ts
// COPY emit was dropped at Slice 3a · @nuri/rn imports the authored SoT directly.)

// The DATA body of a descriptor module — `import type …` to EOF. The authored
// source leads with `import type { Descriptor } from './schema'`, so the twin
// emit slices from there and preserves the body byte-for-byte.
export function descriptorBody(source) {
  // Anchor on the actual statement at line-start (the `m` flag) — NOT a bare
  // `indexOf('import type')`, since the authored header text mentions the phrase.
  const m = source.match(/^import type \{ Descriptor \} from '\.\/schema';/m);
  if (!m) throw new Error("[descriptors] descriptor source has no `import type { Descriptor } from './schema'` statement — cannot slice the body");
  return source.slice(m.index);
}

function passthroughHeaderJs(spec) {
  return [
    `/* ──────────────────────────────────────────────────────────────`,
    ` * NURI · COMPONENT DESCRIPTOR · ${spec.name.toUpperCase()} · BROWSER ESM · GENERATED · DO NOT EDIT BY HAND`,
    ` *`,
    ` * The browser-ESM twin of packages/spec/components/${spec.name}.ts — IDENTICAL data,`,
    ` * the authored source type-stripped (no \`import type\`, no axes type, no`,
    ` * \`: Descriptor<…>\` annotation). A browser can \`import { ${exportNameFor(spec.name)} }\``,
    ` * from it at runtime with NO build step — the prototype web factory`,
    ` * (packages/prototype/factory/factory.js · decision 67) consumes it to render a de-collapsed`,
    ` * nuri-* tree, preserving the zero-build composition property (decision 66 ·`,
    ` * what Nuri IS #3).`,
    ` *`,
    ` * Source · packages/spec/components/${spec.name}.ts (the AUTHORED SoT · §9 step 1 ·`,
    ` * decision 69 · N+29 B1). Emitter · scripts/tokens-parser.js — \`npm run build\`.`,
    ` * Committed (decision 35) · the re-emit gate covers packages/prototype/generated/.`,
    ` * NEVER hand-edit generated/ — edit the authored source above.`,
    ` * ────────────────────────────────────────────────────────────── */`,
  ].join('\n');
}

// Type-strip emit · authored .ts → build/descriptors/<name>.js. The three TS-only
// removals (the documented browser-ESM transform · decision 67): drop the `import
// type`, the axes `type … = {…};`, and the `: Descriptor<…>` annotation. Byte-
// identical DATA to the .ts (a transform of the SoT · not a CSS derivation).
export function emitDescriptorJsFromSource(spec, source) {
  const body = descriptorBody(source)
    .replace(/^import type \{ Descriptor \} from '\.\/schema';\n\n/, '')
    .replace(/^type \w+ = \{[\s\S]*?\};\n\n/, '')
    .replace(/^(export const \w+): Descriptor<[^>]*> = /, '$1 = ');
  return passthroughHeaderJs(spec) + '\n\n' + body;
}

// ════════════════════════════════════════════════════════════════════
// DOC IR · MOVED to @nuri/doc at N+42 · the A4 carve
// ════════════════════════════════════════════════════════════════════
// docIrFromDescriptor (the AUTHORED descriptor DATA → the IR the doc-gen renders)
// left @nuri/spec with the doc emitter at the A4 carve — building the doc IR is
// @nuri/doc's concern (convergence §5 · "spec emits data, doc transforms it"). It
// now lives at packages/doc/pipeline/descriptor-ir.js, sourced from the descriptor
// twins Slice 7 still emits. Guard D inlines the equivalent structural reshape
// (axes / anatomy / base / variants · pipeline/docs-drift.test.js).

// ════════════════════════════════════════════════════════════════════
// (SCHEMA emit · REMOVED at N+61 · Slice 3b·2b·i.) The verbatim build/
// descriptors/schema.ts copy was an orphan since 3a — @nuri/rn imports the
// authored SoT directly via the `./descriptors/schema` exports subpath. With
// the type-re-home (schema.ts now derives SizeLeaf/Accent/TypeSize from the TS
// SoTs · keyof typeof import(...)), the schema source imports NOTHING from
// build/, so there is no tokens-import to rewrite and nothing to emit. The
// frozen-shape contract is still enforced by Guard F over the SOURCE
// (docs-drift.test.js · the FROZEN_SCHEMA pin · projection-model §4 · decision 80).
// ════════════════════════════════════════════════════════════════════
