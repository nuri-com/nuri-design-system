# Package migration — the session sequence to the target

> **What this is.** The **session-level path** from today's 3-package repo to the 6-package target
> ([`docs/package-architecture.md`](../docs/package-architecture.md) · [decision 68](../decisionlog.md)),
> integrating the remaining factory-rewrite arc ([`factory-rewrite.md`](./factory-rewrite.md) · S4, §9).
> The architecture doc is the destination "as if arrived"; THIS is the ordered path + the gating + the
> sizing.
>
> **Lineage.** [`docs/package-architecture.md`](../docs/package-architecture.md) (decision 68 · the layout)
> · [`factory-rewrite.md`](./factory-rewrite.md) (the factory arc · S1–S4 · §9) ·
> [`docs/target-architecture.md`](../docs/target-architecture.md) (the projection model) · decision 2/§9
> (the one gate).

---

## The shape — front-load the reversible prep, §9 last

The whole journey has **one** irreversible, audit-gated step: **§9** (reverse decision 2 · the CSS→TS
SoT inversion). Everything else is **reversible prep under decision 2**. So the strategy: do **all** the
§9-independent work first — the runtime mirror, the package structure, the generated surfaces — then make
the **§9 call last**, with a clean structure and maximum information. Most of the target's value (the
6-package split, the generated surfaces, the full runtime mirror) lands **before** committing to the
decision-2 reversal.

```
  Phase A · §9-INDEPENDENT (reversible · decision 2 STANDS)
    A1 rn rename → A2 S4 → A3 carve prototype → A4 doc → A5 playground → A6 codegen surfaces
                                                                                    │
  ── the §9 GATE · the dec-2 audit (a DECISION, not a build) ────────────────────────┤
                                                                                    ▼
  Phase B · §9 (gated · the SoT inversion · last)
    B1 author the SoT in TS → B2 the CSS resolver (descriptor → CSS)
```

---

## Phase A — §9-independent (reversible · decision 2 STANDS)

| # | session | ships | size | deps | gate |
|---|---|---|---|---|---|
| **A1** | `factory → rn` (rename) | rename `@nuri/factory` → `@nuri/rn` · update `expo-demo`'s dep · CI job names · doc refs | **S** | — | gates green · `expo-demo` tsc 0 |
| **A2** | **S4** · factory generalize/retire | the web factory covers **icon-avatar/topbar** · build **`nuri-view`** · emit the `.js` descriptor twins for the other 2 · **retire** the hand recipes (`button.js`/`icon-avatar.js`/`topbar.js`) | **L** | S3 | the 3 recipes factory-rendered · gates green · ([`factory-rewrite.md`](./factory-rewrite.md) S4) |
| **A3** | carve **`@nuri/prototype`** | move the web **JS mechanism** (factory + `nuri-*` primitives + `nuri-demo` + reset/boilerplate) out of `spec/lib` → `@nuri/prototype` · **option iii: the namespace CSS STAYS in `spec` until §9** (below) | **L** | A2 | docs + playground still render · gates green |
| **A4** | extract **`@nuri/doc`** | consolidate `website/` + `spec/pages/` + `spec/lib/docs/` (minus `demo` → prototype) → `@nuri/doc` (SSG) | **M** | A3 | the docs site builds (SSG) + renders |
| **A5** | extract **`@nuri/playground`** | `spec/lib/playground` + `spec/pages/playground` → `@nuri/playground` (build-free) | **S/M** | A3 | the bench renders build-free |
| **A6** | codegen **surfaces** | generate the **RN barrel** (`rn`) + the **WC mirror** recipe registrations (`prototype`) from the descriptor — **§9-independent** (target §9: *"the RN barrel and the WC mirror do not wait for §9"*) | **M** | A2, A3 | the surfaces regenerate byte-stable · gates green |

→ **~6–7 sessions.** At the end: the runtime mirror covers every recipe, the 6-package structure exists
(minus `spec = TS SoT`), the surfaces are generated — **all from a descriptor still derived-from-CSS**
(decision 2 INTACT · everything reversible).

## The §9 gate — the dec-2 audit (a decision, not a build)

Clear the [`resolver-model.md`](../docs/resolver-model.md) §9/§10 checks → **decide** to reverse
decision 2. The lone irreversible step; everything before it is reversible.

## Phase B — §9 · the SoT inversion (gated · last)

| # | session | ships | size | gate |
|---|---|---|---|---|
| **B1** | author the SoT in **TS** | author the descriptor registry + the token vocabulary in TS (`spec` = pure SoT) · the descriptor stops being CSS-derived | **M** | the descriptor + tokens are TS-authored · `spec` exports them · consumers unchanged |
| **B2** | the CSS resolver (**§9**) | build-time `descriptor → CSS` · generate the namespace + recipe CSS **into `prototype`** · the dec-2/§9 audit clears | **L** | the generated CSS ≡ the prior hand CSS (parity) · `prototype` renders from generated CSS |

→ **~3–5 sessions.** CSS becomes output; `prototype`'s CSS is generated; `spec` → pure TS SoT; the
`prototype → spec` graph is finally true.

## Total — **~9–12 sessions** to the target.

---

## Notes / nuances

- **A3 · option iii (the prototype carve).** Today the CSS is the SoT (decision 2) and `spec`'s
  `pipeline/` reads it. Moving the CSS to `prototype` would **invert** the pipeline's read
  (`spec → prototype`). So A3 moves only the **JS mechanism**; the **namespace CSS stays in `spec`** until
  §9 generates it into `prototype` (B2). This keeps A3 genuinely §9-safe. (Rejected: (i) CSS stays in
  spec forever — a web library without its CSS · (ii) accept the inverted build-time read as a transient.)
- **Order flexibility.** A1 (rn) and A2 (S4) are §9-independent and can swap; A6 (surfaces) is also
  §9-independent. **Recommended order:** A1 → A2 → A3 → {A4, A5} → A6 → §9 → B1 → B2. Rationale: A1 proves
  the migration mechanics on the lowest-risk package; A2 finishes the runtime mirror (a clean milestone)
  and leaves fewer hand recipes for A3 to move.
- **`factory-rewrite.md` is the S4/§9 detail**; this doc integrates them into the package path (it does
  not duplicate the per-step factory mechanics).
- **Deferred** (target §9.3/§9.4): where codegen physically runs (`pipeline/` stays put through Phase A ·
  a `@nuri/codegen` vs per-library build scripts is a §9-era call) · versioning / external consumption ·
  the within-`prototype` design⟂plumbing file split (resolved at B2 when the namespace CSS is generated).
