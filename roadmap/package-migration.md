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

The journey's irreversible move is **§9** (reverse decision 2 · the CSS→TS SoT inversion); everything
before it is **reversible prep under decision 2**. The §9 audit then **split §9 itself into two steps**
([decision 69](../decisionlog.md)): **B1** authors the *descriptor* layer in TS (still **reversible** — the
CSS is retained as the live parity oracle · two agreeing sources), and **B2** generates `descriptor → CSS`
+ inverts the token vocabulary and **deletes the hand CSS** (the **irreversible** step). So the strategy: do
**all** the §9-independent work first — the runtime mirror, the package structure, the generated surfaces —
then take B1 (low-risk · reversible), then B2 last with a clean structure and maximum information. Most of
the target's value lands **before** the one irreversible commit.

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

## The §9 gate — the dec-2 audit (a decision, not a build) · CLEARED

Clear the [`resolver-model.md`](../docs/resolver-model.md) §9/§10 checks → **decide** to reverse decision 2.
**CLEARED for Layer A** ([decision 69](../decisionlog.md) · N+29): the audit authorized reversing decision 2
for the **descriptor layer** (B1 · reversible · the CSS retained as the parity oracle) while ring-fencing the
**token vocabulary** (decision 63) into B2. The irreversible commit is **B2** (CSS deletion), still gated on
§10's M2/M5 (does the generated CSS preserve the decision-63 cascade).

## Phase B — §9 · the SoT inversion (gated · last)

> **⚠ REFRAMED at N+29 — see [`cascade.md`](../docs/cascade.md) (the authoritative §9 model).** §9-web generates the **token-cascade + namespace CSS** from the TS SoT (RN consumes the same source); the per-component **recipe CSS RETIRES** — redundant with the namespace projection (the factory already renders via `data-*` + the namespace CSS). **"B2 = generate the recipe CSS" is obsolete.** The flip is bottom-up: **L3 axes → namespace CSS + retire recipes**, then **L1/L2 tokens → the cascade**. The rows below are kept for size/gate context; read them through `cascade.md`.

| # | session | ships | size | gate |
|---|---|---|---|---|
| **B1** ✓ | author the **descriptor** SoT in **TS** (the audited **Layer-A** scope · [decision 69](../decisionlog.md) · N+29) | author the 3 frozen descriptors in `spec/pipeline/descriptors/*.ts` (the SoT) · the descriptor stops being CSS-derived (the build is a passthrough · `build/descriptors/*` byte-identical) · the CSS becomes the **parity oracle** (Guard D · still renders web). **REVERSIBLE** (no CSS deleted · two agreeing sources). **Token vocabulary EXCLUDED** — it touches decision 63, moved to B2. | **M** | DONE · the descriptors are TS-authored · `spec` emits them · consumers (`@nuri/rn` contract + exports) unchanged · gates green |
| **B2** | the CSS resolver + token SoT (**§9 · the irreversible step**) | build-time `descriptor → CSS` · **author the token vocabulary in TS** (**Layer B** · incl. the decision-63 #4b/#6b cascade) and generate the **namespace + token-cascade CSS into `prototype`** (the **recipe CSS retires** · redundant with the namespace projection · see [`cascade.md`](../docs/cascade.md)) · delete the hand CSS (the parity oracle retires) · the dec-2/§9 audit fully clears | **L** | the generated CSS ≡ the prior hand CSS (parity) · `prototype` renders from generated CSS · the token cascade preserved (decision 63) |

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
