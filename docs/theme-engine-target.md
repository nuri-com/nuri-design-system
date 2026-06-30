# Target design — the theme / resolution engine (materialize at build · select at runtime)

> **Status: PROPOSAL / RFC.** The TARGET shape for the debt-register's biggest finding
> (SEED-4 + D11 + D5 · *the RN resolution engine doesn't match its documented design*). This is the
> *solution* the next coordinator's fix-brief starts from — the diagnosis is in
> [`debt-register.md`](./debt-register.md), the principle is the handoff's PHILOSOPHY §2. Grounded in
> the current code (cited); the **implementation brief verifies the open seams flagged below.**

## The north star (handoff PHILOSOPHY §2)

**Build-time resolves everything resolvable; runtime SELECTS only the context-variant.** Box/stack/
typography are static → bake. Only colour (theme) and interaction (state) — and the Dynamic-Type
fontScale multiply — are genuinely runtime.

**⚠ The colour axes are ORTHOGONAL — do NOT materialize an (accent × mode) cross-product** (an earlier
draft of this note wrongly proposed `THEMES[accent][mode]` · corrected). `chrome` is mode-keyed
({light,dark}); `accent` is accent-then-mode-keyed; their role-sets are DISJOINT (the `RuntimeTokens`
type has `chrome` and `accent` as separate keys — a consumer reads `theme.chrome.canvas.bg` OR
`theme.accent.solid`, never a mix). So colour is **two independent cheap SELECTIONS**, not a composition
and not a cross-product. The README's "no materialized (accent × theme) table · compose at selection" is
CORRECT — keep it. The debt is NOT the colour orthogonality; it is the **ceremony on top of it** (SEED-4)
+ the **static parts resolved at runtime** (D11).

## Current shape (traced · the debt)

- **Context** ([`rn/theme.tsx`](../packages/rn/theme.tsx)): carries only `{ mode, accent }` — orthogonal,
  deliberate (decision 27/62). **This is RIGHT and STAYS.**
- **`runtimeTokens(accent, mode)`** (theme.tsx:151): recomputes a slice **every render** via
  `resolveAccentSlice` — which the code documents as *"BYTE-IDENTICAL to the value the old
  `accentTokens[accent][mode]` cross-product cell carried"* (theme.tsx:51). N+59 reshaped the accent
  STORAGE to an accent-major two-layer table (flat-or-`{light,dark}` per role) — that reshape is FINE and
  STAYS (it's compact + orthogonal). **The debt is that the per-mode COLLAPSE runs at RUNTIME, per
  render**, instead of once at build. (Same shape, wrong time — the D11 pattern, on colour.)
- **`resolveToken(slice, 'chrome.textPrimary')`** — a stringly deref of a STATICALLY-KNOWN path (SEED-4).
- **`flattenPart → applyFields`** (resolve.ts:90) — resolves box/stack/typography **per render + per
  press** (D11), though the README promises they're "100% static · zero-runtime slice."
- **`toUnistylesRecipe`'s `{base, variants}`** (resolve.ts:528) — the build-time static form ALREADY
  EXISTS but is unused-in-production (D5): *computed and discarded.*

## Target shape

### Build (codegen emits — keeping the two colour axes ORTHOGONAL)
1. **The colour slices, mode-resolved but NOT cross-producted.** `chrome` → `{light,dark}` (the chrome
   roles per mode · already stored this way). `accent` → per accent, the accent roles resolved per mode
   (collapse each role's flat-or-`{light,dark}` to its mode hex · the `resolveAccentSlice` work, done ONCE
   at build). Store chrome and accent **SEPARATELY** — `chrome[mode]` + `accent[accent][mode]` — NOT a
   combined `THEMES[accent][mode]`. `resolveAccentSlice` / `runtimeTokens` then **DELETE** (the per-render
   collapse + reshape is gone). Storage ≈ 2 chrome + the accent tables, vs the 6 redundant full slices a
   cross-product would cost.
2. **Per-component precomputed recipe** — promote `toUnistylesRecipe`'s `{base, variants}` (D5) from
   test-only to the build emit: **box/stack/typography baked to CONCRETE values** (static · D11 closed);
   **colour parts as role-REFERENCES** (e.g. `bg → accent.solid` / `fg → chrome.textPrimary`, NOT a hex —
   colour is the runtime selection); **interactive as the state patches** (runtime · state).

### Runtime (the provider SELECTS · two orthogonal lookups · no composition)
- The context still holds `{ mode, accent }` (switching = a context change · unchanged · orthogonal).
- `useRuntimeTokens()` becomes **two independent lookups** — `chrome[mode]` and `accent[accent][mode]` —
  not a recompute. (Optionally exposed as one `{ chrome, accent }` view for ergonomics, but the storage
  stays orthogonal.)
- A component **LOADS its precomputed recipe** + **binds each colour role-ref** to its slice (`chrome.*`
  → `chrome[mode]` · `accent.*` → `accent[accent][mode]`) + **applies the interactive patch** on state.
  `resolveToken` of static paths, the per-render `applyFields` over box/stack, and `buildNuriTheme` /
  `resolvePalette`'s whole-theme-rebuild-for-one-variant all **collapse**. The self-scope case (Button's
  prop-accent) is just a different `accent[propAccent][mode]` lookup — NOT a theme rebuild. Consumers read
  **`theme.chrome.canvas.bg` / `theme.accent.solid` directly** (the flat orthogonal shape).

## What stays (do NOT over-cut — the [[dont-reflexively-defend]] guard, inverted)
- **The `{ mode, accent }` orthogonal context + the provider/scope** (NuriThemeProvider · NuriScope ·
  merge-on-override) — switching is real and right.
- **Colour as a runtime SELECTION** — `chrome[mode]` + `accent[accent][mode]`, two ORTHOGONAL lookups,
  IS "runtime selects the context-variant." The self-scope case (Button's prop-accent · `resolvePalette`'s
  rebuild) becomes a **different accent lookup** (`accent[propAccent][mode]`), not a theme rebuild.
- **The interactive state patches** (pressed/disabled) — genuinely runtime (state), stay.
- **The `typeStyle` / fontScale seam** (P11) — typography bakes its METRICS, but the `× fontScale`
  Dynamic-Type multiply is a genuine RUNTIME input (the OS a11y setting) and stays a runtime multiply.
  This is the ONE legitimate runtime composition in the static set.

## Migration (a codegen + factory change · the form already exists)
1. Emit the mode-resolved colour slices from the codegen — `chrome[mode]` + `accent[accent][mode]`,
   stored SEPARATELY (orthogonal · no cross-product).
2. Emit the per-component `{base, variants}` (promote `toUnistylesRecipe` · build not runtime).
3. Repoint the factory render: LOAD the recipe + SELECT the slice + apply state — retire `flattenPart`'s
   per-render geometry resolution, `runtimeTokens`, `resolveAccentSlice`, `buildNuriTheme`, the static-path
   `resolveToken`.
4. Keep `typeStyle`/fontScale + the interactive patches.

## Open seams (the implementation brief MUST verify — don't assume)
- The exact `{base, variants}` shape `toUnistylesRecipe` emits + whether it cleanly covers all 7 catalog
  components + the primitives (the open-positional ones may differ).
- How colour role-refs thread through the recipe vs the selected slice (the binding point) — and the
  self-scope/prop-accent path precisely.
- The codegen home for `THEMES` + the re-emit/drift gate over it.
- Whether `decisionlog.md` records a REAL constraint behind the N+59 de-materialization (a planned
  runtime-extensible accent?) — the colour-model says accents are build-fixed, but confirm before deleting.

## Validation (the debt-register's named signal)
The cheap proof this is a faithful rename, not a behaviour change: assert **the emitted `chrome[mode]` +
`accent[accent][mode]` slices === `runtimeTokens(accent, mode)`** byte-for-byte across all (accent, mode)
pairs — green ⇒ the build-resolved slices are identical to the old runtime composition, which was pure
ceremony, safe to delete. This is also the new GUARD the gate-blind-spot map calls for (no gate today
measures *when* resolution happens).

## Scope discipline
This is an **architecture-fidelity + perf** change (restores the documented design · removes a render-time
recompute), **NOT a correctness bug** — the emitted hexes are identical today. Sequence it after the small
isolated fixes (D4 · SEED-3 · D1) per the handoff roadmap; it shares the `resolve.ts` / `theme.tsx` surface
with nothing else, so it lands as one focused (large) brief.
