# Target design — the theme / resolution engine (materialize at build · select at runtime)

> **Status: COLOUR ARC (SEED-4) SETTLED + LANDED · GEOMETRY ARC (D11+D5) STILL RFC.** This note tracks
> the debt-register's biggest finding (*the RN resolution engine doesn't match its documented design*) as
> two arcs. **Arc 1 (colour · SEED-4) is DONE** — the RN colour path resolves ONCE at the provider
> (Option B · below), proven a byte-identical rename. **Arc 2 (geometry · D11+D5) is the remaining RFC** —
> box/stack/typography still resolve at runtime; their build-time bake is future work. The diagnosis is in
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

## Arc 2 · Geometry (D11 + D5) — RFC (still runtime-resolved · future work)

Box/stack/typography are STATIC (a pure function of the descriptor + selection · no context input) yet are
still resolved **at runtime** (`flattenPart`/`applyFields` per render + per press · D11), though the
README promises "100% static · zero-runtime slice." The correct build-time form ALREADY EXISTS but is
unused-in-production: `toUnistylesRecipe`'s `{ base, variants }` (D5 · computed and discarded). This arc
is untouched by SEED-4 (deliberately — one seam per PR).

### Target shape (unchanged from the original RFC)
1. **Emit the per-component precomputed recipe** — promote `toUnistylesRecipe`'s `{ base, variants }` from
   test-only to the build emit: box/stack/typography baked to CONCRETE values (static · D11 closed);
   colour parts as role-REFERENCES (already the runtime selection · Arc 1); interactive as the state
   patches (runtime · state).
2. **Repoint the factory render**: LOAD the recipe + apply the interactive patch on state, retiring
   `flattenPart`'s per-render geometry resolution.
3. **Keep** `typeStyle`/fontScale (typography bakes its METRICS, but the `× fontScale` Dynamic-Type
   multiply is a genuine RUNTIME input · P11 · the ONE legit runtime composition in the static set).

### Open seams (the Arc-2 implementation brief MUST verify — don't assume)
- The exact `{ base, variants }` shape `toUnistylesRecipe` emits + whether it cleanly covers all catalog
  components + the primitives (the open-positional ones may differ).
- How the colour role-refs (now the payload's `surface`) thread through the baked recipe.
- The codegen home for the per-component recipe + the re-emit/drift gate over it.

## Scope discipline
Both arcs are **architecture-fidelity + perf** changes (restore the documented design · remove a
render-time recompute), **NOT correctness bugs** — the emitted hexes/metrics are identical today. Arc 1
(colour) landed as one focused brief; Arc 2 (geometry) is sequenced separately (it shares the
`resolve.ts` surface, so pulling it into Arc 1 would double the blast radius).
