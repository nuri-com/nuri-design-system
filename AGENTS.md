# Working on Nuri

Procedure for the **spec-authoring agent** — the persona that modifies
Nuri itself (CSS, web components, docs templates, this file). Read
when adding components, foundations, accents, tokens, or principles.

This doc is a **skill router**, not a principles doc. The WHY behind
each rule lives on [`pages/principles.html`](./pages/principles.html);
this file cites principles by ID, doesn't restate them. See
[decision 22](./decisionlog.md#22-principles-split--n3) for the split.

If something here conflicts with the code, the code wins — fix this
file, don't work around it.

---

## Audience boundary

| Persona | Reads | Doesn't read |
|---|---|---|
| spec-authoring (you) | this file · skills/* · decisionlog.md · roadmap/* · docs/RISKS.md | — |
| composing | principles.html · component pages | this file |
| migration | pipeline output · component anatomy/token-mapping · pages/implementation-guide.html | this file |
| operator | README · principles.html · sidebar | this file |

If you find yourself writing a "why" paragraph in this file, it
belongs on `pages/principles.html` (add as a new principle or extend
an existing one). If you find yourself writing a "how to use a Nuri
component," it belongs on a component page, not here.

---

## Hard rules (citation list)

Each rule below is enforced by a principle or a session decision. The
links are the WHY; this list is the WHAT. Don't restate these rules
in code comments or other docs — cite the principle / decision number.

| # | Rule | See |
|---|------|-----|
| 1 | Components consume semantic, never primitive (bare-constant carve-out · see decision 45) | [P3](./pages/principles.html#p3-components-consume-semantic) · [decision 45](./decisionlog.md#45-interaction-family-primitives--cross-component-design-constants---nuri-interaction---n65-post-close-coordinator-polish) |
| 2 | No hex in component code (only in `tokens-primitive.css`) | [P3](./pages/principles.html#p3-components-consume-semantic) |
| 3 | Primitives have `-light` / `-dark` suffix (alpha exempt) | [P2](./pages/principles.html#p2-two-layer-tokens) |
| 4 | Don't reorder the semantic cascade blocks | "Cascade ordering" below |
| 5 | Component tokens live in the component CSS under `@layer tokens` | [decision 9](./decisionlog.md#9-component-token-selector-pattern--n1) |
| 6 | Semantic selectors use `[data-*]`, not `:root[data-*]` | "Cascade ordering" below |
| 7 | Component-token selector is `:root, [data-accent], [data-theme]` — NOT `:root` alone | [decision 9](./decisionlog.md#9-component-token-selector-pattern--n1) |
| 8 | Mobile-first: `:active` only on components; no `:hover` and no `-hover` suffix | [P6](./pages/principles.html#p6-pressed-only) |
| 9 | Variant naming: `solid` / `soft`; default `soft` | [P7](./pages/principles.html#p7-variant-naming) |
| 10 | DTCG `$type` is inferred via naming prefix | [P9](./pages/principles.html#p9-dtcg-naming) |
| 11 | `rem` for type, `px` for everything else; line-heights unitless | [P8](./pages/principles.html#p8-unit-rule) |
| 12 | `.nuri-tag` is one visual treatment; modifier classes are semantic-only | [decision 11](./decisionlog.md#11-tag-unification--n1) |
| 13 | `<nuri-demo>` `<template>` child is the single source of truth | [decision 10](./decisionlog.md#10-nuri-demo-api--n1) |
| 14 | Foundation spec card = 4 DTCG-shaped rows (Type · Layer · Source · Status) | [decision 16](./decisionlog.md#16-foundation-spec-card--4-dtcg-shaped-rows--n2) |
| 15 | Token table format is unified — `lib/docs/tokens.js` `renderTable()` emits it natively | [decision 20](./decisionlog.md#20-token-table-format-unified-across-every-page--n2) |
| 16 | Typography v2 globals live in `shell.css`; type-utility pages load `typography.css` AFTER `shell.css` | [decisions 17–18](./decisionlog.md#17-typography-v2-promoted-globally-to-shellcss--n2) |
| 17 | No prose-essay entry pages (no home, no hub). The NAV is the index | [decision 23](./decisionlog.md#23-entry-pages-eliminated--n3) |
| 18 | Component pages serve four readers; anatomy + token-mapping = migration wiring spec; multi-part components REQUIRE machine-readable `data-*` on those tables | [decision 24](./decisionlog.md#24-component-pages-serve-four-readers-including-migration--n3) |
| 19 | Docs additions are mechanical — every new page follows its template, no free-form layout | [decisionlog.md](./decisionlog.md) (across decisions 16–24) |
| 20 | Primitives / components / skills / pages ship only when consumed OR explicitly speculative-reserved with one-line justification | [P11](./pages/principles.html#p11-parsimony) · [decision 30](./decisionlog.md#30-primitive-parsimony--no-speculative-additions--n571) |
| 21 | `build/` is committed and CI drift-guards it; the `pipeline/docs-drift.test.js` guards (component pages ↔ `llms.txt` · `build/components/*` ↔ README/impl-guide manifest · doc-stated counts ↔ live build) must stay green | [decision 35](./decisionlog.md#35-pipeline-sources-vs-build-outputs-physically-separated--pipeline-source-build-generated-only--n604) · [gates.yml](./.github/workflows/gates.yml) |

---

## Cascade ordering · `tokens-semantic.css`

The selectors in `tokens-semantic.css` are deliberately ordered. Later
rules override earlier ones at equal specificity. Reordering breaks
nested demo blocks.

1. `:root` — defaults (chrome light + neutral accent light)
2. `[data-theme="dark"]` — chrome dark + neutral accent dark
3. `[data-accent="neutral"]` — neutral accent light (for nested scopes)
4. `[data-accent="neutral"][data-theme="dark"]` — combined, specificity (0,2,0)
5. `[data-accent="lilac"]` — lilac accent light
6. `[data-accent="lilac"][data-theme="dark"]` — lilac accent dark overrides only

Lilac `accent-solid`, `accent-solid-pressed`, and `accent-on-solid`
are intentionally NOT redeclared in block 6 — they stay at the
`-light` values (the brand stays the brand). When adding a new BRIGHT
accent (amber, mint, yellow, sky), follow the same pattern. When
adding a SATURATED accent (red, blue, jade), mirror the neutral
pattern (blocks 3+4).

---

## Skills

Procedures live in [`skills/`](./skills/). Each file carries
`name:` + `description:` frontmatter (matches the claude-code skill
convention so a future "Nuri skills package" plugs in zero-friction).

| Skill | Use when |
|---|---|
| [add-component](./skills/add-component.md) | adding a DS component (Tier 1/2/3 surface with an RN equivalent) under `lib/components/<name>/` |
| [add-foundation](./skills/add-foundation.md) | adding a foundation page under `pages/foundations/` (token-driven or sample-driven) |
| [add-accent](./skills/add-accent.md) | adding a new accent / colour scale to primitive + semantic CSS |
| [modify-tokens](./skills/modify-tokens.md) | editing tokens at any layer (primitive · semantic · component) |
| [add-principle](./skills/add-principle.md) | adding or deprecating a principle on `pages/principles.html` (rare per decision 22) |
| [pipeline-dtcg-export](./skills/pipeline-dtcg-export.md) | extending the CSS → DTCG → RN pipeline or debugging classify-by-cascade |
| [close-out-session](./skills/close-out-session.md) | ending a working session — audit, triage, housekeeping, next-session prompt |

The RN-side migration spec (web→RN wiring) lives on
[`pages/implementation-guide.html`](./pages/implementation-guide.html),
not in `skills/` — it's consumer-facing wiring for the migration agent
and operator, not a procedure for spec-authoring.

For boilerplate when spawning new agents, see
[`prompts/`](./prompts/README.md) — coordinator, working-session,
closeout-audit, migration-test templates.

---

## Common mistakes to avoid

- Recreating `tokens-component.css` (deleted; component tokens go
  per-component under `@layer tokens` inside the component CSS)
- Using `:root` alone in component-token selectors (breaks Tier 2/3
  scope — hard-rule 7)
- Writing `:root[data-*]` in semantic selectors (use `[data-*]` —
  hard-rule 6)
- Hardcoding hex anywhere outside `tokens-primitive.css`
- Reading primitives in JS without theme suffix
  (`--nuri-color-gray-1` resolves to empty string)
- Reordering the semantic cascade blocks
- Re-introducing status colour primitives (`green-500` etc.) ahead of
  the first status-using component — the family ships as full Radix
  scales (Jade / Amber / Red / Blue) at that session, never as
  placeholders (N+5.7 cleanup)
- Declaring values in a `:root[data-theme="dark"]` block of the
  PRIMITIVE file (primitives are theme-agnostic by contract)
- Mixing CSS-level and JS-level theme awareness — let CSS do all
  theming via attribute selectors; reserve JS for toggling the attribute
- Re-declaring a colour chip / swatch with its own CSS (use
  `.nuri-swatch`)
- Building a custom table inline when a set of tokens needs displaying —
  use `.nuri-token-table` fed by `lib/docs/tokens.js`
- Loading a component script synchronously (sync upgrade fires before
  children parse — `connectedCallback` sees no children. Use `defer`)
- Adding `:hover` to component CSS or `-hover` suffix tokens to
  semantic (hard-rule 8)
- Adding a prose-essay home or hub page (hard-rule 17)
- Adding a component page without machine-readable `data-*` attrs on
  the anatomy / token-mapping tables (hard-rule 18)
- Assuming web ↔ RN parity at touch / layout / text behaviour
  ([RISKS R1](./docs/RISKS.md#r1--webrn-api-11--props-parity--behavioural-parity)
  — behavioural gap is budgeted per component; see
  [`pages/implementation-guide.html`](./pages/implementation-guide.html))

---

For current build state and next planned work, see
[`roadmap/index.md`](./roadmap/index.md),
[`decisionlog.md`](./decisionlog.md), and
[`docs/RISKS.md`](./docs/RISKS.md).
