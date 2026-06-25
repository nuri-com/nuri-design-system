# N+38 · L3c — the flip (decision 2 reverses for the namespace layer)

**Status**: SHIPPED on `feat/n38-l3c-flip` (base main `0dfa4d2`). The one irreversible step
of [decision 70](../decisionlog.md)'s cascade — and the END of the refactor's SUBSTANCE.
Ledger: [decision 74](../decisionlog.md). Convergence: phase 3.

## What shipped

The five namespace-CSS shadows (N+30→N+35) were proven ≡ the hand CSS; `demo.html` proved the
factory renders the 3 descriptors. This session made the generation LIVE, made the 3 recipe
elements factory-backed, and deleted the hand layer. **decision 2 reverses for the namespace
layer** (git-recoverable; ledger §74).

1. **Namespace CSS live.** `pipeline/css-preview.js` gained `flipNamespaceCss()` (the Slice-0
   `flip*` idiom) — it generates the 5 axes (`box` · `stack` · `palette` · `interactive` ·
   `typography`) and writes them IN PLACE over `lib/components/<ns>/<ns>.css`. Wired into
   `npm run build` as a namespace-CSS slice in `tokens-parser.js` (after the Slice-0 token
   flips it reads for the scale vocab, before Slice 8). The hand namespace CSS retired — the
   generator is the sole source. `build/css-preview/` (the shadow dir) deleted. The 4 emitter
   headers flipped SHADOW → LIVE.

2. **Factory-backed the 3 recipe elements** (the SOLE web renderer now · `lib/runtime/factory.js`):
   - `button.js` / `icon-avatar.js` → thin modules: `connectedCallback` reads attrs (recipe
     defaults passed EXPLICITLY) → `buildComponent(descriptor, selection, props)` → mounts the
     de-collapsed `nuri-*` tree. They **self-import** their primitive deps (`pressable`/`view`/
     `icon`/`typography` · idempotent define-guards added so classic `<script>` tags coexist).
   - `topbar.js` → **apply-NS-to-host** (the operator-chosen shape · the open-view factory
     can't place leading/pivot/trailing positional children): reads the descriptor's
     `base.root`/`base.content` namespaces via the factory's now-exported `mergedNSForPart` +
     `mergeAttrs`, and applies the namespace classes+`data-*` to the existing `<nuri-topbar>`
     shell + `<nuri-topbar-content>` pivot — positional children stay in place.
   - `reset.css` linked where the factory button mounts.

3. **Deleted the hand layer.** `lib/components/{button,icon-avatar,topbar}/<name>.css` removed
   (the recipe CSS). The recipe rendering logic is gone (the `.js` rewritten as factory
   registrations). Active pages repointed: recipe-CSS links dropped, recipe scripts module-ized,
   namespace CSS ensured. The recipe modules self-import primitives, so the page repoint is
   CSS-only.

4. **Slice 8 decoupled.** `derivePalette` dropped sections A (button aliases) / B (icon-avatar
   subtle) / C (topbar chrome) — redundant with section E (`palette.css`'s own variant+chrome
   rows) + D (`typography.css` muted). `build/palette.ts` cells stay byte-identical (header
   comment updated). The COMPONENTS walk (Slice 4) dropped button/icon-avatar/topbar (their CSS
   is gone · build-output-neutral).

5. **Tests adapted.** The 4 shadow tests → re-emit ≡ committed `lib/components` (the hand oracle
   retired). The **Guard-D shorthand/longhand gap CLOSED** — new Guard E asserts the box padding
   family is source-ordered uniform→axis→edge (the precedence the retired hand oracle masked).
   `docs-drift` Guard D's `deriveDescriptor(CSS)≡authored` parity oracle RETIRED (no recipe CSS
   to derive from · decision 69's "until B2 generates the CSS" boundary) — leg 3 now sources the
   IR from the authored descriptor twin; Guard G's stale `derivePalette` call + the pressed-
   witness fixed. `tokens-parser` per-component resolver test reframed to synthetic input.
   Computed-check HTMLs repointed to the live `lib/components`.

6. **Ledger** [§74](../decisionlog.md) + this retro.

## The one design decision (resolved)

**How a recipe element becomes factory-backed.** button + icon-avatar fit the brief's rec
(connectedCallback → `buildComponent` → mount). Topbar does NOT — its open-view anatomy
(shell + one content pivot) can't place leading/pivot/trailing positional children via the
factory (it appends own-content then child-parts; can't put trailing AFTER the pivot). Surfaced
at the operator checkpoint → **apply-NS-to-host** chosen: topbar styles the EXISTING
`<nuri-topbar>`/`<nuri-topbar-content>` from the descriptor's namespaces, preserving the
positional children. Asymmetric with button/icon-avatar, but faithful + no factory extension.

## Operator-checkpoint decisions (all as-recommended)

- **Topbar** = apply-NS-to-host (above).
- **components/topbar.html** = accept degradation + note: its `inset` + bare-text-title demos
  aren't in the descriptor, so they render with descriptor defaults (no crash · a doc-page
  degradation · the page was already transitional).
- **resolve-map.ts** = transitional (left in `@nuri/rn`, read cross-package by the spec build);
  relocation to `@nuri/spec` deferred to the package carve / `final`.

## The git wrinkle (opening)

The brief assumed A3 (the prototype carve · N+37) was committed "on its branch." It was NOT —
46 staged renames + working edits, uncommitted, on `feat/n37-prototype-carve` (at main tip),
with `factory.js` + the recipe JS moved OUT of spec → which BLOCKED the flip. Surfaced to the
operator → chose "commit to its branch": the carve was committed (`88da5d3`, recoverable) and
`feat/n38-l3c-flip` branched clean from `0dfa4d2` for the flip in spec.

## Verification (the render gate · `demo.html`)

- All 3 descriptors (Button matrix 3×3 · IconAvatars · Topbar) + the primitive card render via
  the **factory + generated namespace CSS** — console CLEAN, all 7 custom elements defined (the
  recipe modules self-import their primitives · no double-define).
- Computed styles correct: ghost transparent / soft `bg-strong` / solid `accent-solid` · sizes
  sm/md/lg → 36/48/60px · `reset.css` zeroed the native-button border · box padding `0 12px`.
- Theme/accent re-resolve LIVE: dark + lilac → body dark, solid+avatar lilac, soft dark canvas.
- Visually ≡ the pre-flip recipe render (screenshots).
- Gates: spec **71/71** (the 4 shadow tests + docs-drift + tokens-parser adapted · Guard E added)
  · `build/*` byte-identical except the 5 namespace CSS (regenerated · the intended flip) + the
  `build/palette.ts` header comment · rn + rn/expo tsc confirmed (resolve-map untouched).

## Known fidelity gaps (accepted · first-bump backlog · the descriptor is intentionally simpler)

- topbar `inset`/`inset-start`/`inset-end` — not a descriptor axis · dropped (topbar.html
  degrades).
- topbar bare-text lg-em title-type — not in the descriptor.
- icon-avatar `fill` — the factory's `renderIcon` emits only the glyph name (the post-A3 icon arc
  owns weight/size).
- The render gate exercises NONE of these.

## Residual cleanup (noted, deferred)

- **Dead-code tail**: the per-component `@layer tokens` resolver (`resolveComponentValue` /
  `emitComponentTs`) — no active component carries decls anymore (the recipes that did retired).
  Unexercised; cleanup deferred (the Smell-1.1 family). The test reframed to synthetic input to
  keep the resolver covered.
- **Doc-comment sweep**: a few module-top headers (the parser modules · the bespoke SoT TS files)
  still mention "shadow / build-css-preview" in passing (the emit-function headers + the test
  headers + the ledger are all current).

## Next

`final` (the axis SoTs → `@nuri/spec` · the property-spelling registry · decision 73 cl.2) · the
package carve (decision 68 · now near-mechanical — the flip leaves coherent folders) · the token
residues (type scale / border / fonts → TS) · the descriptor long-tail (the other ~16 hand
components → descriptors → their recipes retire). **The refactor's substance is DONE.**
