# Factory rewrite — the catalog-generation arc (sequence + resolver refinements)

> **What this is.** The **roadmap derived from** [`docs/target-architecture.md`](../docs/target-architecture.md)
> — the build order + the resolver-model refinements agreed in the 2026-06-22 design session
> ([decision 67](../decisionlog.md)). The target doc describes the end state "as if arrived"; THIS file
> is the delta-to-today + the P11 sequence the target defers. **Decision 2 (CSS is SoT) STANDS through
> the whole mirror sequence (S1–S4); only §9 — the last, gated arc — reverses it.**

---

## 1. The resolver model (refines target §6.1)

The factory's resolver is a **per-target registry**, not an imperative `switch`:

```
resolvers = {
  rn:  { stack, box, typography, palette, interactive },   // RUNTIME
  web: { stack, box, typography, palette, interactive },   // RUNTIME
  css: { stack, box, typography, palette, interactive },   // BUILD-TIME (§9)
}
```

The factory picks the target's map and dispatches by namespace. A target is *registered* by providing
its namespace→resolver map; the type forces it **total** — a namespace without a resolver is a
**compile error** (the `assertNever` exhaustiveness of today, now per-target · the consumability proof ·
[RISKS R7](../docs/RISKS.md)).

**The data/mechanism line runs through the cells** (the §4 line, drawn inside the resolver):

- **Agnostic namespaces — `box` · `stack` · `typography`.** The mapping (`box.padding → the padding
  property, value from the space scale`) is **platform-agnostic DATA**. Today it is hand-transcribed as
  walls of `if (ns.x) s.y = scale[ns.x]` (`resolve.ts` `resolveBox`/`resolveStack` — literally a mapping
  table written as code). At the target the three cells **delegate to ONE shared mapping table**; only
  the per-target *emit* differs (RN → a `ViewStyle` object · web → a CSS var / inline · CSS → a rule).
  **Do not hand-write the same mapping three times** (drift).
- **Bespoke namespaces — `palette` · `interactive`.** The three cells are **genuinely distinct
  mechanism**, NOT hardcoding: `palette` resolves the theme matrix + the `accent` self-scope +
  **fg-by-scope** (web `currentColor` for free · RN threads `fg` by hand · CSS cascade vars) — the point
  where the platforms truly diverge; `interactive`'s *how* (Pressable / `:active` / the pressed
  render-prop) is **behaviour, the factory's, never data** ([decision 65](../decisionlog.md)). These stay
  hand-written per target.

Net: **~3 shared tables + ~6 bespoke resolvers + the dispatch** — not a 15-cell hand-written matrix.

---

## 2. Runtime vs build-time — and why the mirror is NOT §9

- **RN + web resolvers = RUNTIME.** The web mirror resolves in the browser, which is what preserves the
  **zero-build** composition property ([decision 66](../decisionlog.md) · *what Nuri IS #3*).
- **CSS resolver = BUILD-TIME.** This is **§9** (`descriptor → CSS`, static · `:active` for the pressed
  state, not a runtime render-prop · a structurally different resolver shape from the two runtime ones).

**Load-bearing:** the runtime web mirror is a *consumer* of the descriptor (exactly like the RN factory).
It does **NOT** reverse decision 2 — decision 2 is the *authoring direction* (CSS authored → descriptor
derived), independent of who consumes the descriptor at runtime. **Only the build-time CSS resolver is
§9** and reverses decision 2 (audit-gated · NOT decided). So the whole mirror (S1–S4) ships with
**decision 2 STANDS**.

**The vestige (the one watch-point).** Once the web mirror styles recipes from the descriptor at runtime,
`button.css`'s recipe rules stop being a *runtime stylesheet* — they survive only as the build-time
*derivation source* (CSS → descriptor). Coherent, but a hand-maintained CSS that never renders. §9
resolves it (author the descriptor directly · retire/generate the CSS). **Mirror and §9 are sequential,
not independent.**

---

## 3. The build order (the sessions)

| # | Session | Ships | Gate | Dec 2 |
|---|---------|-------|------|-------|
| **S1** | RN resolver → data-driven | extract the shared namespace→style table + restructure `resolveNS` into the per-target registry (RN column) · `palette`/`interactive` stay bespoke · preserve `assertNever` + the `toUnistylesRecipe` parity oracle | factory **27/27 + 7 snapshots byte-identical** · tsc 0 | STANDS |
| **S2** | Web primitives | `nuri-pressable` · `nuri-text` · `nuri-screen` · `nuri-scroll` (vocabulary = data · mirror RN 1:1 · like the existing `nuri-box`/`nuri-stack`) · resolve `view` = box vs a `nuri-view` | render + 1:1 RN API · console clean | STANDS |
| **S3** | Web factory · slice | the web-target resolver (consumes S1's table · runtime emit) + **de-collapse Button** into `<nuri-pressable><nuri-text>` styled from the descriptor · prove equivalence | visual proof (preview MCP) vs today · the **N+23 docs token-map is the reference** | STANDS |
| **S4** | Web factory · generalize + retire | extend to icon-avatar + topbar · **retire the hand-written `button.js` / `icon-avatar.js` / `topbar.js`** | the 3 recipes rendered by the factory · gates green | STANDS (`button.css` → the vestige) |
| **§9** | CSS resolver · source inversion | build-time `descriptor → CSS` + author the descriptor in TS + the **dec-2/§9 audit** | **separate · audit-gated** | **REVERSES** (recipes) |

**Why this order (two corrections to the naïve sequence):**

1. **RN refactor FIRST, not last.** It is the only platform with an **oracle** (the 7 snapshots +
   render-smoke + the `toUnistylesRecipe` parity check), so extracting the shared table there is a
   **provably byte-identical refactor**. It births the table + the registry interface the web factory
   then consumes. Building the web factory first means inventing both **without an oracle**, then
   refactoring RN to match — twice.
2. **CSS LAST and separate, not co-located with the web factory.** Per the runtime/build split, the CSS
   resolver is §9 (reverses dec 2 · audit-gated). It is the endgame, not a peer of the runtime mirror.

**Dependencies.** S1 is the foundation (no dependency). **S2 is disjoint from S1 → parallelizable**
(separate worktree). S3 needs S1 (the table) + S2 (the primitives). S4 needs S3. §9 is a separate gated
arc, sized when reached. **~4 sessions to the runtime mirror** (S1→S4); with S1 ∥ S2, ~3 wall-clock.
Then §9 separately (~2–4 · sized later).

---

## 4. The rails (every session preserves)

- **Exhaustiveness** — a sixth namespace without a resolver is a compile error (`assertNever`, per
  target · the consumability proof · R7).
- **The parity oracle** — `toUnistylesRecipe` is a SECOND independent reader vs `flattenPart`
  (target §8.1). The walker must **not** fuse them, or the check is lost.
- **Byte-stable output** — the factory render-smoke + the 7 snapshots gate the RN side; the `build/`
  §35 `git diff --exit-code` gate holds.

---

**Lineage.** Derives from [`docs/target-architecture.md`](../docs/target-architecture.md) +
[decision 67](../decisionlog.md) (the lock) · [decision 66](../decisionlog.md) (the generation thesis ·
the arc sequence) · [decision 2](../decisionlog.md) (CSS is SoT · STANDS until §9) ·
[decision 65](../decisionlog.md) (behaviour is the factory's, never data).
