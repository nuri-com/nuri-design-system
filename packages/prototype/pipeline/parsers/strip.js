/* ══════════════════════════════════════════════════════════════════
 * NURI · PROTOTYPE · the shared TS-strip (node 20 cannot import a .ts SoT)
 * ──────────────────────────────────────────────────────────────────
 * The namespace-CSS emitters read @nuri/spec's axis SoTs (property-spelling ·
 * palette-surface · interactive-effects · typography-axis — the `as const
 * satisfies <named type>` authored style) as TEXT, strip the (deliberately
 * trivial) TS apparatus, and import the resulting self-contained data module via
 * a data: URL — the descriptor-twin technique (decision 69).
 *
 * This is a VERBATIM copy of @nuri/spec's pipeline/parsers/dimension-css.js#stripTypes
 * (the "one strip impl" · decision 48). At the A3 carve the namespace-CSS generator
 * moved to @nuri/prototype (each library owns the emitter for its own surface ·
 * convergence §5), so it owns this strip; @nuri/spec keeps its copy for the token
 * flips (loadDimensions / loadColours · which stay in spec). The two strip the SAME
 * authored style; the byte-identical re-emit guard (pipeline/*.test.js) is what keeps
 * them honest if either side's SoT style ever drifts.
 *
 * Strips:
 *   · `export type X …;` AND bare `type X …;`   (single-line aliases)
 *   · ` as const` / ` as const satisfies <T>;`  (the const-assertion suffixes)
 * resolve-map.ts's tagged-union `Field` type needs a DIFFERENT strip — that one
 * stays bespoke + inline in namespace-css.js (loadFieldTable).
 * ══════════════════════════════════════════════════════════════════ */

export function stripTypes(src) {
  return src
    .replace(/^(?:export )?type .*;\n/gm, '')              // drop `export type` AND bare `type` aliases
    .replace(/ as const(?: satisfies [^;\n]+)?;/g, ';');   // drop the const-assertion / `satisfies` suffixes
}
