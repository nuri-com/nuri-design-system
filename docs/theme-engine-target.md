# Target design — the theme / resolution engine (materialize at build · select at runtime)

> **Status: BOTH ARCS SETTLED + LANDED.** This note tracks the debt-register's biggest finding (*the RN
> resolution engine doesn't match its documented design*) as two arcs. **Arc 1 (colour · SEED-4) is DONE**
> — the RN colour path resolves ONCE at the provider (Option B · below), proven a byte-identical rename.
> **Arc 2 (geometry · D11+D5) is DONE** — box/stack/typography/interactive are BAKED at build
> (`generated/recipes.ts`) and the factory LOADS + composes them (`flattenBakedPart`), retiring
> `flattenPart`'s per-render geometry resolution from the closed-component path; proven byte-identical by
> the oracle-equivalence guard + unchanged render snapshots. The diagnosis is in
> [`debt-register.md`](./debt-register.md), the principle is the handoff's PHILOSOPHY §2.

## The north star (handoff PHILOSOPHY §2)

**Build-time resolves everything resolvable; runtime SELECTS only the context-variant.** Box/stack/
typography are static → bake. Only colour (theme) and interaction (state) — and the Dynamic-Type
fontScale multiply — are genuinely runtime.

**⚠ The colour axes are ORTHOGONAL — do NOT materialize an (accent × mode) cross-product** (an earlier
draft of this note wrongly proposed `THEMES[accent][mode]` · corrected). `chrome` is mode-keyed
({light,dark}); `accent` is accent-then-mode-keyed; their role-sets are DISJOINT. So colour is **two
independent cheap SELECTIONS**, not a composition and not a cross-product. The README's "no materialized
(accent × theme) table · compose at selection" is CORRECT — keep it. The debt was NOT the colour
orthogonality; it was the **ceremony on top of it** (SEED-4 · now removed) + the **static parts resolved
at runtime** (D11 · Arc 2, still open).

## Arc 1 · Colour (SEED-4) — SETTLED · Option B (resolve once at the provider)

The colour path was doing too much: a stringly `resolveToken(slice,'chrome.x')` dot-sniff indirection, a
`buildNuriTheme` reshape re-run **per component**, a `runtimeTokens`/`resolveAccentSlice` re-collapse
**per render**, and a `resolvePalette` whole-theme rebuild to read one variant. All of it was a pure
function of the (accent, mode) address — precomputable, not runtime composition. The landed design:

### Context value = Address + Payload
The context carries the **resolved ThemePayload**, not just `{ mode, accent }` (this reverses decision
27/62's "no tokens in context" *for colour* — the resolution is a pure function of the address, so
building it once at the provider and reading it downstream is strictly cheaper than re-collapsing):

- **Address** — `{ mode, accent }` scalars, kept on the payload. REQUIRED for orthogonal single-axis
  overrides (a nested scope flips one axis, inherits the other; without the scalars you'd reverse-engineer
  them or cross-product).
- **Payload** — the RESOLVED theme, built ONCE by the provider: `surface` (the variant→role mapping
  applied → concrete hex), the resolved `chrome` slots (canvas/subtle/strong), `text`/`border`/`type`/
  `space`/`size`/`radius`/`interaction`, and the raw `slices` (`chrome[mode]` + the collapsed accent
  slice) for the advanced primitive surface (`useToken`/`resolveToken` · NOT the encouraged path).

### The provider builds the payload ONCE (memoised per address)
`buildNuriTheme(accent, mode)` (`rn/factory/theme.ts`) SELECTS the two orthogonal slices — `chrome[mode]`
+ the accent slice collapsed for the mode (the old `resolveAccentSlice` work, done once) — and applies
the **global variant→role mapping ONCE** → `surface`/`chrome`. `NuriThemeProvider`/`NuriScope` memoise it
per address (`rn/theme.tsx`). **No per-component `buildNuriTheme`.** The two colour axes stay stored
SEPARATELY (`chrome[mode]` + accent slice), never a cross-product.

### The mapping is typed data (dissolves the string-parse)
`generated/palette.ts` emits each cell as a STRUCTURAL colour ref `{ group, leaf }` (or a literal
`'transparent'`), so the builder indexes the selected slice with ZERO parse — the old `resolveColor`
dot-sniff + `RUNTIME_GROUPS` restatement of the group vocabulary **dissolved**.

### One override mechanism (root · scope · prop)
Prop-accent is a **nested scope**, not a bespoke build: `<Button accent="orange">` ≡
`<NuriScope accent="orange"><Button/></NuriScope>` — the factory wraps a scope around the component; the
inner reads the scoped payload + publishes the scoped surface fg (§12). This DELETED the `resolvePalette`
self-scope whole-theme rebuild (exercised by zero catalog descriptors) and the per-component memo.

### What the collapse removed (grep-proven gone)
`resolveColor`, `RUNTIME_GROUPS`, `resolveAccentSlice`, `runtimeTokens`, the per-component
`buildNuriTheme` memo, and the `resolvePalette` self-scope rebuild. `resolveToken`/`useToken` (the public
consumer primitive · read the raw slices off the payload) and the `typeStyle`/fontScale seam (the ONE
legit runtime multiply · P11) STAY.

### Validation (the named signal · landed)
`rn/factory/__tests__/colour-payload-identity.test.ts` asserts the provider payload (`surface` + resolved
`chrome` slots + the raw `slices`) === an INDEPENDENT token-derived oracle for EVERY (accent × mode) pair,
byte-for-byte — and BINDS to the mapping (mutate one palette cell → RED). GREEN ⇒ the ceremony was a pure
rename, safe to delete; the render-smoke + recipe snapshots stayed byte-identical (the companion
end-to-end proof).

## Arc 2 · Geometry (D11 + D5) — SETTLED · Option A (build-time bake)

Box/stack/typography/interactive are STATIC (a pure function of the descriptor + selection · no context
input) yet were resolved **at runtime** (`flattenPart`/`applyFields` per render + per press · D11), though
the README promises "100% static · zero-runtime slice." The correct build-time form already existed but was
test-only and baked colour (`toUnistylesRecipe`'s `{ base, variants }` · D5). This arc BAKES the geometry at
build and shrinks the runtime to "load the baked slice · merge colour + type + state."

### What landed
1. **The baked artifact** — `generated/recipes.ts` (committed · drift-gated), keyed by component → part:
   `{ el, open?, geometry: { base, variants }, typeStep?, interactive? }`. **Geometry-only + theme-
   INDEPENDENT + multi-channel** — box/stack baked to concrete ViewStyle, typography baked as the `{ size,
   emphasis }` REF (not metrics · the `× fontScale` seam stays runtime · P11), interactive as static state
   patches (`pressedStatic`/`disabledStatic` · theme-free constants) + a `pressColor` MARKER. **NO colour
   in the artifact** — no `backgroundColor`/`fg`/`pressedBg`/hex/accent·mode variant (the no-colour guard
   enforces it structurally: the bake runs a palette-SKIPPING resolver). This is the D5 promote, reshaped
   colour-free.
2. **The runtime** — `flattenBakedPart` (resolve.ts) LOADS the recipe, composes `base ⊕ variants[axis]
   [value]`, and merges the runtime pieces: colour via the **unchanged Arc-1 path** (`resolvePalette`
   against the theme context), the expanded type (`typeStyle`), and the interactive state patch. The
   factory's closed render path calls this; `flattenPart`'s per-render `applyFields` geometry resolution is
   RETIRED from it (grep-proven) — `applyFields`/`flattenPart` survive only for the open primitives + as the
   oracle reference.

### The toolchain seam (resolved · the documented Node-reimpl fallback)
The bake is emitted by a **Node applier in the codegen** (`scripts/parsers/recipes.js`) over the single-
sourced spec MAPPING (resolve-map `STACK_FIELDS`/`BOX_FIELDS` + property-spelling `.rn` + the dimension
scales) — the RN twin of the web geometry emit (`prototype/pipeline/parsers/namespace-css.js`, which applies
the SAME tables in Node to emit `box.css`/`stack.css`). Node 20 cannot run the TS resolver (no tsx/esbuild ·
the deliberate node-20 + type-strip toolchain · SEED-1b), and adding a bundler for one emit is out of grain.
The applier interpreter (~30 lines) is per-projection; the KNOWLEDGE (field tables + spellings + scales) is
single-sourced in spec. The **oracle-equivalence guard** binds the Node emit byte-for-byte to the TS runtime
resolver (`flattenPart`), mutation-proven — so the two appliers cannot drift silently.

### The guards (all green)
Oracle equivalence (baked ≡ runtime · full component × part × axis-selection × state × theme product ·
PROVEN to bind by a mutation test) · the no-colour invariant · key-order fidelity (the snapshots pretty-
format-SORT keys, so this is the only order check) · re-emit drift (the `spec` git-diff gate over
`generated/`) · render snapshots byte-identical (render-smoke).

### The density seam (design, not built · P11)
The pipeline stays shaped as `descriptor refs × scale table → baked geometry` (the Node applier reads px
from the scale table · never hand-authored numbers), so a future `density` axis becomes `scale-table-
selected-by-density → geometryByDensity` WITHOUT touching descriptors. Not implemented; not foreclosed.

## Scope discipline
Both arcs are **architecture-fidelity + perf** changes (restore the documented design · remove a
render-time recompute), **NOT correctness bugs** — the emitted hexes/metrics are identical (the byte-
identical snapshots + oracle guard are the proof). Arc 1 (colour) and Arc 2 (geometry) landed as two
focused briefs (one seam per PR · they share the `resolve.ts` surface).
