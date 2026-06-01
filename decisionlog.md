# Decision log

Immutable ledger. Decisions append, never renumber. An amendment to
an existing decision appends as `### N.M amendment · <session>`
beneath the original; the original body stays verbatim.

Cross-referenced from: AGENTS.md hard-rules table, skills/*.md,
docs/RISKS.md, roadmap/*.md, README.md, llms.txt.

---

## 1. 2-layer token architecture · N+1

**2-layer token architecture** (primitive + semantic). No Layer 1
swap, no Layer 3/4 at the system level.

## 2. Pipeline strategy = Pattern C · N+1

**Pipeline strategy = Pattern C** · CSS source of truth, custom
parser → `tokens.json` (DTCG), Style Dictionary → RN.

### 2.1 amendment · N+5.5

Style Dictionary is conditional on a second target platform (iOS /
Android / Figma sync); for RN-only, the custom emitter at
`pipeline/parsers/semantic.js` is terminal — SD adds no value over
what the cascade-aware resolver already produces.

## 3. Mobile-first interaction model · N+1

**Mobile-first interaction model** · components have `:active`
only, no `:hover`. Semantic tokens use `-pressed`. Chrome (docs
shell) may use `:hover` because it's docs UI, not a Nuri component.

## 4. Semantic naming · N+1

**Semantic naming** · `bg-canvas/subtle/strong/pressed/inverse`.
`accent-solid-pressed` (not `-hover`). Inverse uses cross-theme.

## 5. Variant naming · N+1

**Variant naming** · `solid` / `soft` (Radix). Default `soft`.
Solid is accent-driven, soft is chrome-only.

## 6. 3-tier component model · N+1

**3-tier component model** · scope providers (Tier 1), accent
consumers (Tier 2), `<nuri-scope>` (Tier 3).

## 7. Unistyles v3 as RN target · N+1

**Unistyles v3 as RN target** · stylesheet ergonomics only.

### 7.1 amendment · N+5.5

The theme registry is bypassed by `NuriThemeContext` per decision 27.

## 8. Default `data-accent` = `lilac` · N+1

**Default `data-accent` = `lilac`**.

## 9. Component-token selector pattern · N+1

**Component-token selector pattern** ·
`:root, [data-accent], [data-theme]` (NOT `:root` alone). Component
tokens declared in `@layer tokens` must be re-declared on every
scope-providing element so their `var()` references re-resolve at
the scope level — otherwise Tier 2/3 scoping silently breaks (the
resolved literal gets inherited as-is). See `lib/components/button/
button.css` for the worked example + the long comment.

## 10. `<nuri-demo>` API · N+1

`<nuri-demo>` API — `<template>` slot is the single source of
truth. Attributes: `controls` (theme/accent/neutral/font subset),
`label`, `subtitle` (HTML allowed), `stack` boolean. The inner
`<nuri-scope>` wraps the entire card (toolbar + preview + code),
not just the preview content — playground-style.

## 11. Tag unification · N+1

**Tag unification** — `.nuri-tag` is a single visual treatment
(subtle bg + border + muted text). Modifier classes
(`--draft`, `--ready`, `--planned`, `--exploratory`) remain in
markup for semantic / agent data extraction but have NO visual
effect. Status is communicated by the label text, not by colour.
Pick the modifier that matches the `data-foundation-status` /
`data-component-status` on the parent (e.g., exploration foundation
uses `--exploratory`, not `--draft`).

## 12. Typography rule · N+1

**Typography rule** — non-mono prose = 15px, mono identifiers = 13px.
Currently page-local on the Button page; AGENTS.md should promote
to a body class opt-in or to shell-wide default when N+2 finishes.

## 13. Muted-by-default colour rule · N+1

**Muted-by-default colour rule** — every text element starts at
`--nuri-text-muted`; primary is reserved for headers (h1/h2/h3),
group-header rows in tables, and `<strong>` in prose. Currently
page-local; promote pattern with N+2.

## 14. Layout pattern for component pages · N+1

**Layout pattern for component pages**: max-width 560 on prose
+ cards; tables break out edge-to-edge of `.nuri-shell__main` via
negative `size-10` margins; `.nuri-shell__main { max-width: none }`
page-local override; section divider via `::before` on
`.page-section + .page-section`. Currently page-local; promote
with N+2.

## 15. Demo toolbar mirrors topbar exactly · N+2

**Demo toolbar mirrors topbar exactly** — same bg-strong, radius-sm,
height 32, padding, primary color, regular weight, inline-SVG caret
(not background-image data URI — `currentColor` doesn't inherit
across data URIs). Topbar still has the broken background-image
caret; fix bundled into N+3 extraction.

## 16. Foundation spec card = 4 DTCG-shaped rows · N+2

**Foundation spec card = 4 DTCG-shaped rows** · `Type` (DTCG `$type` — `color`/`dimension`/`typography`/...) · `Layer` (`primitive`/`semantic`/`utility`/`architecture`/`exploration`) · `Source` (CSS file) · `Status` (lifecycle tag). The user explicitly rejected "Consumers" and "Reactive to" rows as docs-implementation metadata, not design-token properties — "per foundation il formato standard dei design token è il modello giusto." Cardinality info (12 × 2 × 7, etc.) lives in `.nuri-token-meta` or page prose, not the spec card.

## 17. Typography v2 promoted globally to `shell.css` · N+2

**Typography v2 promoted globally to `shell.css`** · NOT opt-in via body class. Reason: mechanical — new pages get it for free without remembering a class; the visual is the new direction for every page. Home page renders fine on the new defaults (manually verified). Page-local `<style>` typography blocks have been deleted from Button page; foundation pages never had them.

## 18. `.nuri-type-*` utility classes use chained-class selectors · N+2

**`.nuri-type-*` utility classes use chained-class selectors** · `.nuri-type-xs.nuri-type-xs { ... }` to hit specificity (0,0,2) and tie `.nuri-shell__main p` from `shell.css`. Source order breaks the tie — pages that use type utilities **must** link `typography.css` AFTER `shell.css` (see `pages/foundations/typography.html`).

## 19. Foundation template variants in service of ONE structure · N+2

**Foundation template variants in service of ONE structure** · The same 6-section template covers 3 page shapes: hub (overview that skips set-indicator + dictionary) · token-driven (catalogue/composition/exploration) · sample-driven (Typography uses `.nuri-scale-list` instead of dictionary tables, plus retains a roadmap). Sections that don't apply are simply omitted — no template forks.

## 20. Token table format unified across every page · N+2

**Token table format unified across every page** · `lib/docs/tokens.js` `renderTable()` now emits the wrapper + inline-swatch layout natively (the post-processor that was page-local on Button is gone). One shape on every page: `<div class="nuri-table-scroll"><table class="nuri-token-table">...</table></div>`. Columns: DTCG · CSS var · (Reference) · Value · Type — NO swatch column; the 24px (`size-7`) `.nuri-swatch--inline` hangs inside the DTCG name cell via negative `margin-left: -size-10 + size-3` (= -40px) so the chip sits 8px from the cell border AND token names still align to the column-header edge at `size-10` (48px). Air-on-the-left math added in N+3 closeout; original N+2 math was `margin-left: -size-10` which put the chip flush against the table border. Row height 44px, nowrap, first/last cell padding-x = `size-10` so content aligns with the prose 560 left edge while the table itself extends edge-to-edge of `.nuri-shell__main` via the wrapper's negative `size-10` margins.

### 20.1 amendment · N+6.0.2

Token tables MAY emit multiple value columns — one per cascade-varying
dimension value — when the page documents the **full resolution
matrix** of context-dependent tokens. The default single-`Value`-column
shape stays canonical for single-value tokens (primitive layer ·
component layer) and single-context views (button.html at the live
theme). Trigger is dependency-driven, identical to
[decision 33](./decisionlog.md#33-semantic-token-docs--format-b-verbose-dual-mode-for-context-dependent-tokens--n601):
if the page documents the matrix structurally instead of toggling
through it interactively, the renderer emits one value column per
varying-dimension value; otherwise stays single-`Value`.

The first consumer (`pages/foundations/colour/semantic.html`) emits 7
columns — DTCG · CSS var · **Reference Light** · **Light** ·
**Reference Dark** · **Dark** · Type — via
`renderTable({ showBothModes: true, accent })` paired with
`parseSemantics({ accent, bothThemes: true })`. The reference itself
is one column per varying-dimension value (the reference can change
per theme — e.g. `var(--nuri-color-neutral-1-light)` →
`var(--nuri-color-neutral-1-dark)` for the same `--nuri-bg-canvas`)
and the inline swatch chip moves from the DTCG name cell into each
Reference cell, carrying explicit `data-theme` + `data-accent` attrs
so each chip resolves under its own cascade context (independent of
the live `<html data-*>` state). The two opt-ins are strictly
additive: `parsePrimitives()` callers, single-context
`parseSemantics()` callers, and the default `renderTable()` call all
keep the 5-column shape with the chip in the DTCG cell — zero
behaviour change. Future density / font dimensions extend the same
option family (e.g., `showAllDensities`, `showAllFonts`) at the
moment a page chooses to document those dimensions structurally
rather than interactively; each varying-dimension value gets one
Reference + one Value column + one chip carrying the matching data-*
attr.

See: [decision 33](./decisionlog.md#33-semantic-token-docs--format-b-verbose-dual-mode-for-context-dependent-tokens--n601)
(the inline-CSS counterpart — Format B matrix at canonical block),
[`roadmap/N+6.0.2.md`](./roadmap/N+6.0.2.md) (this amendment's source
session).

## 21. Consumer model · three agent personas + operator · N+3

**Consumer model · three agent personas + operator** · Nuri's docs surfaces are optimised for an agent reader. Three personas: **spec-authoring** (modifies Nuri itself — reads AGENTS.md, HANDOFF, ROADMAP), **composing** (uses Nuri components to assemble prototypes / screens — reads component pages + principles), **migration** (translates Nuri spec → RN — reads pipeline output + component anatomy/token-mapping). The **operator** is the human prompting/reviewing all three. Humans browsing the docs as cold readers are NOT a primary use case — README is the "what is Nuri" surface for newcomers.

## 22. Principles split · N+3

**Principles split** · The WHY of Nuri lives in `pages/principles.html`, read by composing / migration agents and the operator. AGENTS.md is procedure-only for the spec-authoring agent; it cites principles by ID and doesn't restate them. Reason: principles change rarely, procedure changes per session — versioning them together (the pre-N+3 shape) caused the staleness banner that prompted this refactor.

## 23. Entry pages eliminated · N+3

**Entry pages eliminated** · `pages/home.html` and `pages/foundations/colour.html` (overview) are deleted. No prose-essay surfaces. The NAV in `lib/docs/shell.js` is the index; `index.html` redirects to `pages/foundations/colour/primitive.html`. The "Colour" group in NAV is a non-clickable section header (uses `header: true` flag in NAV data), not a hub page. Reason per decision 21: no agent reader for entry-prose; the operator orients via README + sidebar.

### 23.1 amendment · N+5.6

Procedure pages serving a concrete agent persona per decision 21
(today: `principles.html` for the WHY, `implementation-guide.html`
for HOW-to-migrate-to-RN) are allowed as siblings — they have
agentic consumers and structured content, not orientation prose.

## 24. Component pages serve four readers, including migration · N+3

**Component pages serve four readers, including migration** · Composing / operator / spec-authoring use API + variants/states/theming sections. The **migration agent** reads anatomy + token-mapping sections as the *wiring spec* (per-part × per-variant × per-state which token activates on which DOM/RN element). Multi-part components require machine-readable `data-*` attrs on anatomy + token-mapping rows: `data-part`, `data-element`, `data-property`, `data-token`, `data-conditions`. The pipeline output (DTCG values, Style Dictionary JS) covers raw values; the page covers wiring. Without the page's wiring, the migration agent has tokens but doesn't know which DOM element owns each one.

### 24.1 amendment · N+6.4 · Behavioural-delta section

The four readers all assume **web↔RN prop parity** (RISKS R1: web
and RN expose the same props 1:1). What R1 also says — and what the
original four sections never surfaced — is that *identical props do
not guarantee identical behaviour*: the press feedback, focus
affordance, disabled semantics, and accessible-name derivation are
**budgeted per-component** and land on each platform's native
primitive differently. The migration agent reading only
anatomy + token-mapping gets the visual wiring but not these
behavioural obligations, so it silently reimplements (or drops)
them.

Component pages therefore gain a fifth section — **Behavioural
delta** — a table keyed by **friction code** (`F-PRESSED-1`,
`F-FOCUS-1`, `F-DISABLED-1`, and component-specific codes like
`F-ARIA-LABEL-1`, `F-TOUCH-TARGET-1`). Each row states the web
behaviour, the RN behaviour, and the delta the migration agent must
honour. The codes are the same ones tracked in
[`docs/RISKS.md`](./docs/RISKS.md), so the page and the risk
register share one vocabulary.

This is a **section addition**, not a structural rewrite — it rides
the [decision 19](#19-foundation-template-variants-in-service-of-one-structure--n2)
section-flexibility precedent (a page includes the sections its
component needs). It is **retroactive to Button** (the section is
backfilled there) and **forward to IconButton** (which adds two
component-specific codes). It is **NOT** backfilled onto Stack /
Box / Icon this session: those are either layout primitives with no
press/focus/disabled surface (Stack/Box) or a non-interactive atom
(Icon), so the delta is empty and the section would be noise.
Backfill them only when a real behavioural delta appears.

## 25. Risk register · N+3

**Risk register** · `docs/RISKS.md` enumerates open risks with named failure modes + mitigation paths. Updated per session alongside HANDOFF and ROADMAP. Only risks with a named failure mode visible from the project's own choices belong here — not generic hazards.

## 26. DS surfaces vs docs chrome are physically separated · N+3.5

**DS surfaces vs docs chrome are physically separated** · `lib/components/` contains **only** surfaces that have an RN equivalent — Button (Tier 2) and `<nuri-scope>` (Tier 3 · web-only mechanism but the RN side has React Context analogues per decision 6). Web-only docs chrome — state.js, shell.js, tokens.js (browser parser), `<nuri-demo>`, NuriControl — lives in `lib/docs/`. The pipeline (`pipeline/tokens-parser.js`) reads CSS authored against `lib/components/`-derived tokens and never touches `lib/docs/`. Reason: prevents the migration agent and the spec-authoring agent from having to mentally tag each file as "is this DS or chrome?" Refactor landed in N+3.5. Decision 35 (N+6.0.4) extends the same physical-separation-by-lifecycle pattern to the pipeline: source in `pipeline/`, output in `build/`.

## 27. Theme provider · custom orthogonal, not cross-product registry · N+5.5

**Theme provider · custom orthogonal, not cross-product registry**
· The RN theme provider keeps `<nuri-scope>` dimensions
orthogonal: a single `NuriThemeContext` with merge-on-override
semantics, one entry per dimension (`mode`, `accent`, + future
`density` / `neutral`). Pre-computed (∏ dimensions)
theme tuples are explicitly rejected — they scale O(∏ dims)
(8 × 3 × 2 × 7 = 672 themes at the roadmap dimensions) and
violate the composability decisions 1, 6, 9 and P5 are predicated
on. Unistyles, if used, is consumed for stylesheet ergonomics
only (its theme registry is bypassed). The composite
`NuriScope` mirrors the web `<nuri-scope>` API 1:1. Spec'd in
[`lib/components/scope/README.md`](./lib/components/scope/README.md);
see [RISKS R1 F-SCOPE-1](./docs/RISKS.md#r1--webrn-api-11--props-parity--behavioural-parity)
for the migration spec. Codified at N+5.5 alongside the emitter's
classify-by-cascade refactor (decision 28).

### 27.1 amendment · N+5.7

Font dimension is web-only (emulation overlay for design
exploration via `<nuri-scope font="ios|android|pixel">` →
`[data-font]` cascade overrides at the primitive layer).
`NuriThemeContext` on RN carries `mode` + `accent` + future
`density` + `neutral`; `font` is NOT migrated. RN inherits the
platform's system font stack natively — the migration spec does
not surface a `Font` type. Primitive-level `--nuri-font-family-*`
defaults already point at the system stack, so the RN side gets
the right font without a context entry.

## 28. Emitter shape derives from cascade structure, not from a hardcoded list · N+5.5

**Emitter shape derives from cascade structure, not from a
hardcoded list** · `pipeline/parsers/semantic.js` discovers each
semantic var's dimensionality by inspecting which
`[data-<dim>=…]` blocks declare it (the `classifySemantic`
function); the var's tokens.ts export shape, group, and TS type
literal all follow mechanically from that signature. A signature
→ group-name mapping (`GROUP_NAMES`) is the single declarative
extension point — adding a new cascade dimension fails the build
with the unmapped signature in the error until a name is picked,
forcing a conscious decision instead of silent drift. Naming-vs-
cascade agreement is asserted for any group declaring a
`namingPrefix` (today: `--nuri-accent-*` must classify
`[accent, theme]` and vice versa). The pre-N+5.5 hardcoded
`ACCENT_TOKEN_EXPORTS` / `CHROME_TOKEN_EXPORTS` lists are gone;
the six flat `accentSolid` / `accentFg` / … exports collapse
into a single nested `accent` export keyed by `Record<Accent,
Record<Theme, { … }>>`. See [roadmap/N+5.5.md](./roadmap/N+5.5.md)
and `pipeline/parsers/semantic.js` header for the worked example.

## 29. Line-height is unitless proportional, not absolute · N+5.7

Semantic tokens (`--nuri-type-*-line-height`) declare line-height
as unitless multipliers (1.27, 1.29, 1.20, …). This matches RN's
`Text.lineHeight` which expects either a pixel number or a
multiplier; unitless multipliers port mechanically to RN without
unit conversion or DPR math.

Primitive `--nuri-line-height-N` absolute tokens (rem values) were
orphan AND architecturally wrong for the RN target — N+5.7 deletes
them. Future typography tokens MUST declare unitless line-height;
primitive absolute line-heights are explicitly rejected.

See: `styles/tokens-primitive.css` `--nuri-type-*-line-height`
declarations, [`roadmap/N+5.7.md`](./roadmap/N+5.7.md) for the
cleanup pass.

## 30. Primitive parsimony · no speculative additions · N+5.7.1

Codifies [P11](./pages/principles.html#p11-parsimony) as a
procedural lock. Spec-authoring agents may not add tokens,
components, skill files, or pages without a current consumer OR
an explicit reservation entry with one-line justification.

Reservation registries today:
- `pipeline/tokens-parser.test.js` · `RESERVED_COLOR_SCALES` +
  `RESERVED_TOKENS` (per-scale and per-token allowlists; guardrail
  test #15 fails on unauthorised drift at CI)
- (future) similar registries when speculation emerges as a class
  in components, skills, or pages

Procedural enforcement cascade:
- [AGENTS.md hard-rule 20](./AGENTS.md) cites P11 + this decision
- [`prompts/working-session.md`](./prompts/working-session.md)
  default anti-goals include "no speculative additions"
- [`skills/add-component.md`](./skills/add-component.md),
  [`skills/add-foundation.md`](./skills/add-foundation.md),
  [`skills/add-accent.md`](./skills/add-accent.md),
  [`skills/modify-tokens.md`](./skills/modify-tokens.md),
  [`skills/add-principle.md`](./skills/add-principle.md) each
  carry the parsimony anti-goal explicitly
- [`skills/close-out-session.md`](./skills/close-out-session.md)
  audit-asks include "any new file / token / component / skill /
  page without consumer?"

n=5 evidence trigger (all surfaced by the post-N+5.6 audit and
cleaned in N+5.7):
- shadow tokens (20 unauthorised primitives)
- orphan font-size primitives (12)
- absolute line-height primitives (10)
- status placeholders (3 single-step colours)
- premature shadow atomic-pattern codification at
  `pages/principles.html:407` (replaced with a real shipped
  4-deep `--nuri-color-<scale>-<step>-{light,dark}` pattern)

The mechanical guardrail at the test layer (N+5.7) catches the
primitive drift class at CI; this decision promotes the same
principle UPSTREAM so the same drift cannot recur in components,
skills, or pages where mechanical guardrails don't exist today.

See: [P11](./pages/principles.html#p11-parsimony) (the WHY),
[`roadmap/N+5.7.md`](./roadmap/N+5.7.md) (cleanup evidence),
[`roadmap/N+5.7.1.md`](./roadmap/N+5.7.1.md) (this session).

## 31. Default neutral scale = cream · CLI parameter `--neutral=<scale>` · N+5.8

The Node pipeline emits per a CLI parameter `--neutral=<scale>`;
default is `cream`. Allowed scales: `gray`, `mauve`, `slate`,
`sage`, `olive`, `sand`, `cream` — the 6 Radix neutrals plus
`gray` (the pre-N+5.8 default, kept as explicit option).

The exploration page's web-side `data-neutral` switcher continues
to test alternatives at preview time without rebuilding; the CLI
flag controls what `build/tokens.ts` emits for RN consumption.

Reason: cream provides a warmer, less-clinical baseline than gray
for the brand's content tone. The 6 alternative scales stay in
the primitive layer per the [P11](./pages/principles.html#p11-parsimony)
parsimony exception (speculative-reserved with the exploration-
page-switcher + CLI-override justification — see
`RESERVED_COLOR_SCALES` in
[`pipeline/tokens-parser.test.js`](./pipeline/tokens-parser.test.js)).

Lock to a single default arrives when the team converges (no
session anchor — operator pick); until then, all 7 scales stay
selectable via CLI.

Side effects landed in N+5.8:
- [`pipeline/parsers/semantic.js`](./pipeline/parsers/semantic.js)
  exports `NEUTRAL_SCALES` + `DEFAULT_NEUTRAL` + `validateNeutral`
- [`pipeline/tokens-parser.js`](./pipeline/tokens-parser.js) parses
  `--neutral=<scale>` from `process.argv`
- [`build/tokens.ts`](./build/tokens.ts) rebuilds with cream-
  resolved values (12 chrome + 4 accent neutral-side vars
  updated; lilac side + focus-ring unchanged per P4)
- Oracle table at
  [`pipeline/tokens-parser.test.js`](./pipeline/tokens-parser.test.js)
  re-derived for cream defaults (72 cells hand-verified)
- [`skills/pipeline-dtcg-export.md`](./skills/pipeline-dtcg-export.md)
  documents the CLI flag + new default

See: [P11](./pages/principles.html#p11-parsimony) (parsimony —
speculative scales are reserved-with-justification),
[`roadmap/N+5.8.md`](./roadmap/N+5.8.md) (this session).

## 32. Primitive scale uses direct-pixel naming `--nuri-px-N` · N+6.0

The primitive sizing layer uses **direct-pixel naming**: `--nuri-px-N`
declares a CSS variable whose value is literally `Npx`. Example:
`--nuri-px-12: 12px`, `--nuri-px-60: 60px`. No indexed-scale
abstraction (decision retires the previous `--nuri-size-{0..12}`
Radix-indexed shape).

**Reason**: the indexed-scale shape (size-3 = 8px, size-12 = 80px)
was opaque — readers couldn't infer pixel values from the name.
Direct-pixel naming reads-as-it-runs: `var(--nuri-px-48)` is
unambiguously 48px. Reduces cognitive load for spec-authoring
agents + migration agents.

**Scale composition**: `--nuri-px-{2, 4, 6, 12, 18, 24, 28, 36, 48,
60, 72}` (11 values). Every value has at least one current consumer
(per [P11](./pages/principles.html#p11-parsimony) parsimony +
[decision 30](./decisionlog.md#30-primitive-parsimony--no-speculative-additions--n571)).
Future additions only when a semantic or component consumer
arrives — no speculative pre-shipping.

**Migration applied in N+6.0** (deterministic per-row mapping):

| old declaration | px | new declaration | rule |
|---|---:|---|---|
| `--nuri-size-0`  |  0 | dropped (no consumers; literal `0` if needed) | retire |
| `--nuri-size-1`  |  2 | `--nuri-px-2`  | identity |
| `--nuri-size-2`  |  4 | `--nuri-px-4`  | identity |
| `--nuri-size-3`  |  8 | `--nuri-px-6`  | -2 tighter (mobile-first density) |
| `--nuri-size-4`  | 12 | `--nuri-px-12` | identity |
| `--nuri-size-5`  | 16 | `--nuri-px-18` | round to nearest |
| `--nuri-size-6`  | 20 | `--nuri-px-18` | round to nearest |
| `--nuri-size-7`  | 24 | `--nuri-px-24` | identity |
| `--nuri-size-8`  | 32 | `--nuri-px-28` | -4 (compact docs chrome) |
| `--nuri-size-9`  | 40 | `--nuri-px-36` | round to nearest |
| `--nuri-size-10` | 48 | `--nuri-px-48` | identity |
| `--nuri-size-11` | 64 | `--nuri-px-60` | round to nearest |
| `--nuri-size-12` | 80 | `--nuri-px-72` | round to nearest |
| `44px` hardcoded | 44 | `var(--nuri-px-48)` | operator confirmed |
| `56px` hardcoded | 56 | `var(--nuri-px-60)` | operator confirmed |

The `--nuri-size-*` prefix is **reserved** for the semantic sizing
layer arriving in N+6.1 (`--nuri-size-{xs, sm, md, lg, xl, 2xl,
3xl}`). The `TYPE_PREFIXES` table in both parsers keeps an entry
for `--nuri-size-` defensively so semantic-layer dimensions
classify correctly at the moment they land.

**`--nuri-px-90`** is not in the N+6.0 primitive set. It arrives
in N+6.1 alongside the `--nuri-size-3xl` semantic that consumes it
(rather than pre-shipping under speculative reservation).

See: [P11](./pages/principles.html#p11-parsimony),
[decision 30](./decisionlog.md#30-primitive-parsimony--no-speculative-additions--n571),
[`roadmap/N+6.0.md`](./roadmap/N+6.0.md).

## 33. Semantic token docs · Format B verbose dual-mode for context-dependent tokens · N+6.0.1

`styles/tokens-semantic.css` documents every context-dependent
semantic token (one that varies across {theme, scope, accent, …})
with a **Format B inline comment** that shows the FULL resolution
matrix at a single **canonical-declaration block**. Other cascade
blocks declaring the same token carry a **terse 1-line cross-ref**
back to the canonical, not a duplicate matrix.

**Trigger** is dependency-driven, not type-driven:

- A token whose value varies across {theme, scope, accent, density,
  font, …} gets Format B at its canonical block + terse cross-refs
  elsewhere.
- A token whose value is invariant across the active cascade
  dimensions gets a 1-line role description only — no matrix.

Today, the 18 semantic tokens that ship (12 chrome + 6 accent) all
vary across at least one dimension (`data-theme` for chrome,
`data-theme × data-accent` for accent), so all 18 carry Format B.
The N+6.1 semantic spacing + sizing layers will be mode/scope-
invariant — they get terse role descriptions, not Format B.
A future change that makes spacing density-dependent would promote
those declarations to Format B mechanically.

**Canonical-declaration assignment** (the block where the matrix
lives) follows the cascade structure:

| Token category | Canonical block | Reason |
|---|---|---|
| Chrome (bg / text / border / focus) | Block 1 (`:root`) | Block 1 declares the chrome default; block 2 is the only override |
| Accent · neutral family | Block 1 (`:root`) | Block 1 declares the neutral default; blocks 2/3/4 are mode/scope variants |
| Accent · lilac family | Block 5 (`[data-accent="lilac"]`) | Block 5 declares the lilac default; block 6 holds partial-dark overrides per [P4](./pages/principles.html#p4-mode-accent-composition) |

**Format B template** (canonical block):

```css
/* token.name · short role · scope hint
 *   <dim-A value-A> · <dim-B value-B>: <primitive token name>
 *   <dim-A value-A> · <dim-B value-B>: <primitive token name>
 *   …
 *   <P4 reference if asymmetric or frozen> */
--nuri-…: var(--nuri-color-…);
```

**Terse cross-ref template** (non-canonical block):

```css
/* token.name · <context tag> (matrix in block N) */
--nuri-…: var(--nuri-color-…);
```

**Conventions** (locked at N+6.0.1):

- **Token names only** — no hex inline. Hex values drift; primitive
  token names are stable references.
- **Primitive token names** (`neutral-1-dark`) NOT prefixed CSS var
  forms (`--nuri-color-neutral-1-dark`) — readability.
- **UPPERCASE** for emphasis on inversion (`DARK`, `LIGHT`) or P4
  state (`INVERSE`, `FROZEN`) where meaningful.
- Cross-refs cite literal `block N` or `P4`, not file:line — stable
  across edits.

**Reason**: pre-N+6.0.1, each cascade block documented only ITS
current mode/accent. A cold reader (especially the migration
agent) had to traverse 4+ blocks to reconstruct the full resolution
matrix for any (theme × accent)-dependent token. Format B
concentrates the matrix at a single declaration; cross-refs
prevent the duplicate-and-drift cost of repeating it everywhere.

The convention applies dependency-driven rather than type-driven so
that future semantic tokens (spacing / sizing in N+6.1) which are
mode-invariant don't get speculative Format B comments —
[P11](./pages/principles.html#p11-parsimony) parsimony lock applies
to documentation surface area too.

Procedural enforcement cascade (N+6.0.1.1 · surface-localized, since
the trigger fires only when modifying `styles/tokens-semantic.css`):

- [`skills/modify-tokens.md`](./skills/modify-tokens.md) Semantic
  bullet cites this decision · names the dependency-driven trigger
  + canonical-block + terse-cross-ref pattern for any semantic edit
- [`skills/add-accent.md`](./skills/add-accent.md) per-family
  cascade step cites this decision · names the 6 accent-* tokens
  varying across (accent × theme), canonical Format B at the new
  accent block + terse cross-ref at the dark block, with the
  bright-accent partial-redeclare note per
  [P4](./pages/principles.html#p4-mode-accent-composition)
- [`skills/close-out-session.md`](./skills/close-out-session.md)
  audit-asks include "every new/modified token that varies across
  cascade dimensions carries Format B canonical + terse cross-refs?
  every invariant token carries a 1-line role description only?"

Surfaces explicitly NOT extended (decision 33 trigger is
surface-localized, not trans-surface — adding cross-refs to
[AGENTS.md](./AGENTS.md) hard-rules, [`prompts/working-session.md`](./prompts/working-session.md)
FIXED defaults, [`skills/add-component.md`](./skills/add-component.md)
or [`skills/add-foundation.md`](./skills/add-foundation.md) would be
false-positive for sessions that don't touch `tokens-semantic.css`).
Contrast [decision 30](./decisionlog.md#30-primitive-parsimony--no-speculative-additions--n571)
which IS trans-surface and so warranted the 5-layer cascade.

See: [P4](./pages/principles.html#p4-mode-accent-composition),
[decision 9](./decisionlog.md#9-component-token-selector-pattern--n1)
(cascade re-resolution at scope-providing elements — the structural
reason multi-block declaration exists),
[`roadmap/N+6.0.1.md`](./roadmap/N+6.0.1.md) (this decision's source
session), [`roadmap/N+6.0.1.1.md`](./roadmap/N+6.0.1.1.md) (the
procedural-enforcement cascade above).

## 34. Per-component files + TokenPath union + set policy · pipeline emit shape · N+6.0.3

The pipeline emits three TS surfaces for the RN consumer
([decision 27](./decisionlog.md#27-theme-provider--custom-orthogonal-not-cross-product-registry--n55)):

- `build/tokens.ts` · **runtime sets only** · monolite namespaced.
  Each cascade-classified group ([decision 28](./decisionlog.md#28-emitter-shape-derives-from-cascade-structure-not-from-a-hardcoded-list--n55))
  whose policy is `runtime: true` emits as one top-level nested
  export (`chrome: Record<Theme, …>`, `accent: Record<Accent,
  Record<Theme, …>>`). Context-invariant primitive vocabulary stays
  out of this file by construction.
- `build/components/<name>.ts` · **one file per component**.
  References to pipeline-inlined sets resolve to literal numerics /
  strings at build time; references to runtime sets emit as
  `'<group>.<leaf>' as const satisfies TokenPath` so the consumer
  dereferences them at render time. Replaces the pre-N+6.0.3
  `BUTTON_BASE` constants block held inside the emitter — the
  emitter now reads from the live CSS source on every build, so
  primitive renames flow through mechanically (the
  `BUTTON_BASE.minHeight = 56` / `paddingX = 16` drift that
  survived the N+6.0 `--nuri-px-{60,18}` rename is structurally
  killed).
- `build/token-paths.ts` · **discriminated union** over every
  runtime-set leaf. Mechanically derived from the same
  `classifyAll` pass that emits `tokens.ts`; per-component files
  `import type { TokenPath }` and TS enforces leaf-name agreement
  at compile time. No hand-sync.

### Set policy

Every set the pipeline touches has three flags:

- `cascadeVarying` — derived by the classifier (true if any
  `[data-<dim>=…]` block declares the set's leaves).
- `runtime` — appears in `tokens.ts` + the `TokenPath` union.
- `pipelineInline` — references resolve to literal values during
  pipeline emit (component CSS chains walked to terminal).

**Auto-rule** (not operator-pickable):
`cascadeVarying === true` → forces `runtime: true` and
`pipelineInline: false`. Explicit policy that contradicts the
auto-rule throws at the classifier. Cascade-varying sets can only
be runtime — their value depends on consumer context, so there is
no terminal literal to inline.

**Operator pick** (for context-invariant sets only): pick
`(runtime: true, pipelineInline: false)` to expose the vocabulary
to consumers, or `(runtime: false, pipelineInline: true)` to keep
the set internal and resolve at build. Exactly one must be true; a
set with neither flag is an orphan and throws.

### Initial set registry (N+6.0.3 lock)

```js
// pipeline/parsers/semantic.js · SET_POLICY
export const SET_POLICY = {
  // Primitive layer · internal vocab · pipeline-inlined
  'primitive.colour':   { runtime: false, pipelineInline: true },
  'primitive.px':       { runtime: false, pipelineInline: true },
  'primitive.radius':   { runtime: false, pipelineInline: true },
  'primitive.type':     { runtime: false, pipelineInline: true },
  'primitive.font':     { runtime: false, pipelineInline: true },
  'primitive.duration': { runtime: false, pipelineInline: true },

  // Semantic cascade-varying · auto-rule fills in runtime: true
  'semantic.chrome':    {},
  'semantic.accent':    {},

  // Future · semantic vocabulary · runtime exposed for layout
  // consumers (placeholders; leaves arrive in N+6.1):
  // 'semantic.space':  { runtime: true, pipelineInline: false },
  // 'semantic.size':   { runtime: true, pipelineInline: false },
};
```

### Reason

Surface-localised contract for the RN consumer. The contract is
provider-agnostic — Unistyles and a custom Context that derives a
`(theme, accent)` slice from `NuriThemeContext` ([decision 27](./decisionlog.md#27-theme-provider--custom-orthogonal-not-cross-product-registry--n55))
consume `button.ts` identically. The `tokens.ts` namespace stays
lean (only context-dependent vocabulary travels with the runtime).
Auto-promotion handles future cascade dimensions: a new
`[data-density=…]` block on an existing set flips
`cascadeVarying: true`, the auto-rule promotes it to runtime, and
the per-component emitter switches from literal emit to TokenPath
emit on the next build with no policy edit. The
`BUTTON_BASE`-style drift class is closed structurally: every
component-token numeric now flows from live CSS, not a
hand-maintained constants block.

### Relationship to decision 28

[Decision 28](./decisionlog.md#28-emitter-shape-derives-from-cascade-structure-not-from-a-hardcoded-list--n55)
governs the **internals** of the classifier: dimensionality
discovery from the cascade, `GROUP_NAMES` as the single declarative
extension point for new signatures, naming-vs-cascade agreement.
Decision 34 documents the **public emit contract** layered on top:
which classified groups reach the runtime namespace, which
primitive vocabulary stays internal, and how component-level
references dispatch. The classifier is unchanged; the orchestrator
gains two new emit steps (per-component file + TokenPath union)
and the runtime emit gains a runtime-only filter.

### Resolver boundary

`resolveToken(tokens, path)` is the consumer-side dereference
helper. Production implementations live in the consuming app
(Unistyles theme function · custom Context selector); the Nuri
spec describes the contract, not the runtime. A ~10-line sketch
in `docs/migration-tests/button-matrix/index.tsx` demonstrates the
shape against the new `button.ts` + `chrome` + `accent` imports
([N+6.0.3 migration pair update](./docs/migration-tests/button-matrix/index.tsx)).

### n=1 caveat

This is structural-shape n=1 today. The classify-by-cascade engine
underneath is n=5+ proven (N+5.5 land · N+5.7 cleanup · N+5.7.1
lock · N+5.8 parameterization · N+6.0/.1/.1.1/.2 polish) but the
public-emit contract has zero downstream consumer evidence. Real
validation arrives when the first RN consumer (Unistyles or
custom Context) consumes `button.ts` + `tokens.ts` + `TokenPath`
for a production component and reports back. Until then,
decision 34 is "committed shape, evidence-deferred"; an amendment
34.1 lands if consumer integration surfaces shape gaps.

### Procedural enforcement cascade

None this session — decision 34 is surface-localised (it only
fires when the pipeline code at `pipeline/parsers/*` changes or when
a new component CSS file lands). Apply the N+6.0.1.1 pattern at a
follow-up `.1` session if/when a new component CSS file surfaces
the need to extend a skill cross-ref (e.g.,
[`skills/add-component.md`](./skills/add-component.md) gaining a
SET_POLICY-mention bullet).

See: [P11](./pages/principles.html#p11-parsimony) (runtime sets
need consumer justification before promotion),
[decision 27](./decisionlog.md#27-theme-provider--custom-orthogonal-not-cross-product-registry--n55)
(the orthogonal Context that consumes the runtime shape),
[decision 28](./decisionlog.md#28-emitter-shape-derives-from-cascade-structure-not-from-a-hardcoded-list--n55)
(the classifier internals this contract layers on top of),
[`roadmap/N+6.0.3.md`](./roadmap/N+6.0.3.md) (this decision's
source session).

### Superseded in part · the `type`-pipelineInline clause · N+8.3

The `'primitive.type': { pipelineInline: true }` set policy stays for
**component-token references** (a `--nuri-button-md-font-size:
var(--nuri-type-md-size)` still resolves to a build-time literal in
`build/components/button.ts`). What is **superseded** is the
*implication* that the type scale has NO runtime namespace, forcing
every RN consumer to hand-declare its values: [decision 54](#54-type-scale-emitted-as-a-directly-accessed-namespace--one-source-two-readers--n83)
emits the scale as a typed, directly-accessed `type` namespace in
`build/tokens.ts` (the icon model · [decision 48](#48-typed-buildiconsts-emit--svgxml-over-the-shared-registry--one-registry-two-readers--n68)).
The scale primitives are now read TWO ways from ONE source: inlined
when a component aliases them, emitted as `type.*` for direct RN
dereference. The decision-53 note that "type-emit is N+8.3, out of
scope" is now resolved by decision 54.

## 35. Pipeline sources vs build outputs physically separated · `pipeline/` source, `build/` generated-only · N+6.0.4

**Pipeline sources vs build outputs are physically separated.**
`pipeline/` holds the Node pipeline's hand-maintained source files
— the orchestrator at [`pipeline/tokens-parser.js`](./pipeline/tokens-parser.js),
its parser slices at [`pipeline/parsers/{primitive,semantic,components}.js`](./pipeline/parsers),
and the test runner at [`pipeline/tokens-parser.test.js`](./pipeline/tokens-parser.test.js).
`build/` holds **only** generated outputs: [`build/tokens.json`](./build/tokens.json),
[`build/tokens.ts`](./build/tokens.ts),
[`build/components/<name>.ts`](./build/components/) (today: `button.ts`),
and [`build/token-paths.ts`](./build/token-paths.ts). Every file
under `build/` is regenerable by `npm run build` from the live
sources under `pipeline/` + `styles/` + `lib/components/`; a
manual edit to anything under `build/` is a workflow bug to be
caught and reverted, not a valid change.

### Invariant

Anything in `build/` is **generated** by `pipeline/tokens-parser.js`
and is **never hand-edited**. Anything under `pipeline/` is
**hand-maintained source** and **never machine-written**. The
directory boundary carries the lifecycle distinction structurally,
not by convention.

### Reason

Pre-N+6.0.4, `build/` mixed both kinds of file: the 5 source
files (`tokens-parser.js`, `tokens-parser.test.js`, `parsers/*`)
shipped next to the 4 generated outputs (`tokens.json`,
`tokens.ts`, `components/button.ts`, `token-paths.ts`). The
"is this file source or output?" cognitive tax was small at the
N+5 split (one orchestrator + two parser slices) but grew with
each emit surface added (N+6.0.3 doubled the file count in
`build/` with `components/button.ts` + `token-paths.ts`). The
mixed state also blocked the natural follow-up of `.gitignore`-ing
`build/` once a stable output platform locks (Style Dictionary or
otherwise) — gitignoring half the directory is not possible. The
N+6.0.4 separation removes the tax once and unblocks future
hardening.

### Precedent

Decision 26 (DS surfaces vs docs chrome are physically separated ·
N+3.5) applied the same physical-separation-by-lifecycle pattern
to `lib/components/` (RN-migrating surfaces) vs `lib/docs/`
(web-only chrome). Same shape: a lifecycle distinction made
structural so neither the migration agent nor the spec-authoring
agent needs to mentally tag each file. N+6.0.4 extends the
pattern to the pipeline.

### Resolves

Long-standing "Open questions" entry in
[`roadmap/index.md`](./roadmap/index.md) — "`build/` mixes
pipeline sources and outputs · partial split landed in N+5" had
explicitly listed `pipeline/` (source) + `build/` (output only)
as one of the candidate resolutions. Decision 35 picks that
candidate and locks it.

### Future hardening (out of scope this session)

- A pre-commit hook or CI check that fails on a manual edit to
  `build/*` (diff `build/` against `npm run build` output) —
  enforces the invariant mechanically instead of by convention.
- `.gitignore` `build/*` once a stable output platform locks
  (Style Dictionary slice lands, or Unistyles consumption
  converges on which outputs are consumed downstream vs which
  are dev-time conveniences). Until then `build/` stays
  committed so the migration test's drop-in shape stays
  reviewable in pull-request diffs.

### Procedural enforcement cascade

None this session — decision 35 is a single structural invariant
embedded in the directory layout. Skill cross-refs land only if
a future session surfaces drift (per the N+6.0.1.1 precedent).
The lone forward-pointing skill that mentions the pipeline source
paths ([`skills/pipeline-dtcg-export.md`](./skills/pipeline-dtcg-export.md))
was updated this session as part of the doc-surface sweep.

See: [decision 26](./decisionlog.md#26-ds-surfaces-vs-docs-chrome-are-physically-separated--n35)
(precedent · same physical-separation-by-lifecycle pattern),
[decision 2.1 amendment](./decisionlog.md#21-amendment--n55) (the
"wait for SD slice" framing this session retires by separating
source from output now rather than deferring to the conditional
SD landing),
[decision 34](./decisionlog.md#34-per-component-files--tokenpath-union--set-policy--pipeline-emit-shape--n603)
(the per-component emit + TokenPath union contract whose
file-count expansion finally tipped the cost balance),
[`roadmap/N+6.0.4.md`](./roadmap/N+6.0.4.md) (this decision's
source session).

## 36. Semantic spacing + sizing vocabularies · 7+7 T-shirt scale · cascade-invariant · N+6.1

**Two T-shirt-scale semantic dimension vocabularies land at the
semantic layer**, each shipping a complete 7-leaf range that aliases
the [decision 32](./decisionlog.md#32-primitive-scale-uses-direct-pixel-naming---nuri-px-n--n60)
`--nuri-px-N` primitive layer:

```
space.2xs = 2   space.xs = 4   space.sm = 6   space.md = 12   space.lg = 18   space.xl = 24   space.2xl = 36
size.xs   = 18  size.sm  = 28  size.md  = 36  size.lg  = 48   size.xl  = 60   size.2xl = 72   size.3xl  = 90
```

**Spacing** is the vocabulary `gap` / `margin` / `padding` consume
(between-element values, granular 2–36 px range). **Sizing** is the
vocabulary `min-height` / `width` consume (element dimensions, larger
18–90 px range). The two scales share the T-shirt naming but anchor
asymmetrically by design — spacing covers smaller granular values for
between-element rhythm; sizing covers larger values for touch targets
+ control heights. Picking one mental model per role surfaces intent
at the call site: `--nuri-button-min-height: var(--nuri-size-xl)`
reads as *"comfortable primary action"*, not as *"60 pixels"*.

### Naming convention · T-shirt scale, not direct-pixel

T-shirt names (xs · sm · md · …) at the semantic layer preserve
vocabulary identity if the mapping changes — a future
`--nuri-size-xl` move from 60 → 64 px doesn't churn every consumer.
Direct-pixel naming on the semantic layer would be mirror-aliasing
without abstraction value: `--nuri-size-60` aliasing `--nuri-px-60`
adds a hop but no semantic information. Direct-pixel naming on the
primitive layer (decision 32) stays intentional — primitive is the
internal vocabulary; the value IS the name.

### Asymmetric ranges by design

Spacing and sizing share the T-shirt vocabulary but cover different
absolute ranges. The asymmetry is the design surface, not an
oversight: a screen with `--nuri-space-xl` (24 px) between cards and
`--nuri-button-min-height: var(--nuri-size-xl)` (60 px) is internally
consistent — both are the "extra-large" choice within their own
mental model.

### Full vocab ships at N+6.1 · P11 exception

All 14 leaves ship in the same session, even though only one
component (Button) consumes `size.xl` + `space.lg` today. Vocabulary
IS the design surface: partial scales undermine the abstraction (a
composing agent reading the page sees `xs · sm · md` and assumes
those are the complete options; landing `lg · xl · 2xl` later would
silently change the meaning of an existing choice). Same precedent
that ships [P11](./pages/principles.html#p11-parsimony)-defended
12-step Radix colour scales complete even when the semantic layer
consumes only a few steps; same precedent as the
[decision 31](./decisionlog.md#31-default-neutral-scale--cream--cli-parameter---neutral=scale--n58)
cream-default neutral with the alternative neutrals
reserved-with-justification in `RESERVED_COLOR_SCALES`.

The reservation registry at the primitive-usage guardrail test
(test 17) is NOT updated for these 14 leaves: semantic-layer leaves
are not the surface that guardrail audits (it audits primitives).
The 14 leaves DO consume primitives through the alias chain
(every space + size leaf chains to a `--nuri-px-N`), which is
exactly what the guardrail's transitive-closure pass already
discovers automatically.

### Auto-promotion via SET_POLICY (decision 34)

The [SET_POLICY registry](./pipeline/parsers/semantic.js) gains
two new active entries:

```js
'semantic.space':  { runtime: true, pipelineInline: false },
'semantic.size':   { runtime: true, pipelineInline: false },
```

The placeholders for these slots were left commented at N+6.0.3 —
this session uncomments them. The classifier auto-routes
`--nuri-space-*` and `--nuri-size-*` to two new namespaced exports
in [`build/tokens.ts`](./build/tokens.ts) (`export const space:` +
`export const size:`); [`build/token-paths.ts`](./build/token-paths.ts)
gains 14 new union members mechanically. The per-component emitter
detects that
`--nuri-button-min-height` and `--nuri-button-padding-x` now
reference runtime sets (not pipeline-inlined primitives), so
`button.minHeight` flips from `60` (literal) to
`'size.xl' as const satisfies TokenPath`, and `paddingX` flips
from `18` to `'space.lg' as const satisfies TokenPath`. **Zero
edits to `pipeline/parsers/components.js`** — the auto-promotion
falls out of the SET_POLICY change.

The classifier itself gains one structural extension: GROUP_NAMES
now supports an array-valued entry under a shared signature (the
empty signature `''` shared by space + size), with namingPrefix as
the discriminator. This is the smallest extension that lets two
cascade-invariant vocabularies coexist without colliding; future
cascade-invariant sets (radii · durations · …) plug into the same
array slot. The classifier's naming-vs-cascade agreement check is
generalised to compare against specific entries (sig + namingPrefix
match) rather than signature alone.

### Documentation convention · 1-line role, NOT Format B

Per [decision 33](./decisionlog.md#33-semantic-token-docs--format-b-verbose-dual-mode-for-context-dependent-tokens--n601)'s
dependency-driven trigger, semantic tokens that do NOT vary across
cascade dimensions get 1-line role descriptions only — NOT Format B.
The 14 space + size leaves are cascade-invariant today (no
[data-*] block redeclares them), so each leaf carries a terse
role description at its declaration site in
[`tokens-semantic.css`](./styles/tokens-semantic.css) (e.g. *"space.md ·
default gap · siblings inside a card, row-gap in a grid"*). If a
future density dimension lands and the cascade-classifier promotes
these signatures to `density`, the rule re-fires automatically:
the rows promote to Format B at that point. The rule self-applies
without intervention.

### Component refactor · button.css retires the N+6.0 P3 placeholder

[Hard rule 1 in AGENTS.md / P3](./pages/principles.html#p3-components-consume-semantic)
is *"components consume semantic, never primitive"*. The N+6.0
primitive rename left
[`lib/components/button/button.css`](./lib/components/button/button.css)
temporarily violating P3 at two sites (`var(--nuri-px-60)` /
`var(--nuri-px-18)` — the renamed primitives the semantic layer
hadn't yet alias-promoted). This session restores P3:

```css
--nuri-button-min-height: var(--nuri-size-xl);
--nuri-button-padding-x:  var(--nuri-space-lg);
```

The two-line edit demonstrates the auto-promotion mechanism +
surfaces the consumer-side static-vs-dynamic split (see below).

### Consumer-side trade-off · static-vs-dynamic split

`StyleSheet.create` evaluates at module load — before any
(theme × accent) context exists. The pre-refactor migration
consumer kept `minHeight` + `paddingHorizontal` inside the static
block (literal numbers from `button.ts`). Post-refactor those
fields are TokenPath strings; the consumer must resolve them at
render time through `resolveToken(tokens, ...)` and inline the
result into the render-time style array. The
[migration-test pair](./docs/migration-tests/button-matrix/index.tsx)
keeps `borderRadius` in `StyleSheet.create` (still a literal) and
moves `minHeight` + `paddingHorizontal` to the inline array — the
split made honest, not hidden. Production consumers (Unistyles,
custom Context) handle the same split more elegantly via a dynamic
theme function; the migration-test sketch documents the cost as it
appears in the minimal-infrastructure case.

This is the natural consequence of decision 34 (TokenPath emit) +
decision 36 (runtime-exposed semantic dimension vocabulary), not a
friction worth working around. A consumer that wanted to keep
everything static could opt into the alternative policy
`{ runtime: false, pipelineInline: true }` and accept that the
vocabulary stops being part of the runtime contract — but then
users couldn't reference `space.md` from app code, which is the
whole point of exposing the layer.

### No procedural enforcement cascade this session

Decision 36 is surface-localised — it only fires when the semantic
dimension layer is touched (new leaves added; new dimension family
landing). The skill surface ([`skills/modify-tokens.md`](./skills/modify-tokens.md))
already inherits the [decision 33](./decisionlog.md#33-semantic-token-docs--format-b-verbose-dual-mode-for-context-dependent-tokens--n601)
dependency-driven trigger, so an agent adding new space/size leaves
will write the right comment shape automatically. Apply the
[N+6.0.1.1 pattern](./roadmap/N+6.0.1.1.md) at a follow-up `.1`
session if a future contributor's first contact with semantic
dimensions surfaces a drift the current cascade doesn't catch.

See: [decision 32](./decisionlog.md#32-primitive-scale-uses-direct-pixel-naming---nuri-px-n--n60)
(the primitive layer this vocabulary maps to),
[decision 33](./decisionlog.md#33-semantic-token-docs--format-b-verbose-dual-mode-for-context-dependent-tokens--n601)
(the dependency-driven trigger that says these get 1-line role
descriptions, not Format B),
[decision 34](./decisionlog.md#34-per-component-files--tokenpath-union--set-policy--pipeline-emit-shape--n603)
(the SET_POLICY auto-promotion mechanism that emits these as
runtime sets + flips component refs to TokenPath),
[P3 / hard rule 1](./pages/principles.html#p3-components-consume-semantic)
(components consume semantic — the rule the N+6.0 placeholder
admitted temporarily and this session restores),
[P11](./pages/principles.html#p11-parsimony) (parsimony · the
"vocabulary IS the design surface" exception that justifies
shipping all 14 leaves with one consumer today),
[`roadmap/N+6.1.md`](./roadmap/N+6.1.md) (this decision's source
session).

### 36.1 amendment · N+6.1.1

**Radius joins the semantic dimension family as the third sibling
under the same structural slot.** The semantic radius vocabulary
ships at N+6.1.1 with four leaves:

```
radius.sm   = 6      (chains to --nuri-px-6)
radius.md   = 12     (chains to --nuri-px-12)
radius.lg   = 18     (chains to --nuri-px-18)
radius.full = 9999px (literal sentinel · no --nuri-px-N alias)
```

The pre-N+6.0 primitive `--nuri-radius-{sm,md,lg,full}` declarations
are retired from
[`styles/tokens-primitive.css`](./styles/tokens-primitive.css); the
semantic layer reuses the same names — sm/md/lg with new values
(semantic 6/12/18 vs old primitive 4/8/12), full with the same
9999px sentinel value the old primitive held. The remaining
primitive radius leaves (`--nuri-radius-{none,xs,xl,2xl}`) stay
primitive in `RESERVED_TOKENS` pending future semantic promotion
when consumers materialise. Chrome consumers (shell.css · demo.css
· control.css) keep their existing `var(--nuri-radius-{sm,md,lg})`
references and re-resolve to the new semantic values — a small
visual softening of rounded surfaces (sm: 4→6, md: 8→12, lg:
12→18), documented as the natural consequence of consolidating the
radius vocabulary on the semantic layer.

### Structural identity with decision 36

Radius slots into every structural extension decision 36 introduced
at N+6.1, with **no new mechanics**:

- **Same naming convention** · T-shirt scale at the semantic layer
  (decision 36's reasoning self-applies: direct-pixel on semantic
  would be mirror-aliasing without abstraction value).
- **Same SET_POLICY runtime entry** ·
  `'semantic.radius': { runtime: true, pipelineInline: false }`
  alongside `semantic.space` + `semantic.size`. Auto-promotion
  fires identically — [`button.css`](./lib/components/button/button.css)'s
  `--nuri-button-radius: var(--nuri-radius-md)` flips
  [`button.ts`](./build/components/button.ts)'s `radius` field
  from literal `12` to `'radius.md' as const satisfies TokenPath`
  without pipeline edits.
- **Same classifier extension slot** · GROUP_NAMES' empty-signature
  array gains a third entry `{ name: 'radius', cssPrefix:
  '--nuri-radius-', namingPrefix: '--nuri-radius-' }`. The
  array-valued-entry pattern decision 36 introduced absorbs the
  third sibling with zero structural change.
- **Same foundation page template** · the four nested pages under
  `pages/foundations/dimension/` (primitive · spacing · sizing ·
  radius) follow the same 4-section template (spec card · approach
  · token table · roadmap) the N+6.1 sessions established.
- **Same consumer-side static-vs-dynamic split** · the migration
  pair moves `borderRadius` from `StyleSheet.create` to the
  render-time inline style array alongside `minHeight` +
  `paddingHorizontal` (already moved at N+6.1). The
  `RuntimeTokens` type widens once more to include `radius`.

### The `radius.full = 9999px` literal sentinel

`radius.full` is the **first semantic dimension leaf without a
`--nuri-px-N` alias backing** — a literal `9999px` sentinel value
chosen so the browser clamps `border-radius` to
`min(width/2, height/2)`, producing a pill for any rectangular box
and a circle when `width = height`. A 100% percentage was tried
initially (the original amendment 36.1 lock) but interprets
relative to box dimensions, distorting rectangular elements like
`.nuri-tag` into ellipses — see the N+6.1.1 post-close polish
section in [`roadmap/N+6.1.1.md`](./roadmap/N+6.1.1.md) for the
visual-bug trigger that drove the 100% → 9999px correction. The
9999 sentinel sits outside the `--nuri-px-N` scale (which tops at
90) by design.

The runtime emit handles per-leaf TS-type inference (helper
`semanticLeafTsType(group, leafName, cssVar, values)` consults the
resolved value for cascade-invariant groups · numeric literals like
`12px` emit as `number`, non-numeric literals like `forever` would
emit as `string`). Post-polish the `radius` namespace emits all
leaves as `number` (sm/md/lg from the `--nuri-px-N` chain, full
from the `9999px` literal post px-strip in the per-component
emitter), so the resulting [`build/tokens.ts`](./build/tokens.ts)
`radius` namespace types as `{ sm: number; md: number; lg: number;
full: number }` — narrowest accurate shape. The per-leaf inference
infrastructure stays in place for future cascade-invariant
vocabularies that may ship genuine mixed-literal leaves (a
hypothetical duration scale with `instant: 0ms` + `infinite:
'forever'`, an aspect-ratio scale with numeric ratios + `auto`)
which would inherit the same shape with no further mechanics.

### Foundation surface reorg

All four dimension foundation pages now live nested under
`pages/foundations/dimension/` — symmetric with the colour family's
existing nested structure. The pre-N+6.1.1 top-level
`pages/foundations/{spacing,sizing}.html` paths are gone (moved
into the new nested folder). The NAV in
[`lib/docs/shell.js`](./lib/docs/shell.js) shows the "Dimension"
section header with four nested children (Primitive first,
followed by the three semantic vocabularies — spacing · sizing ·
radius).

### Continuation-agent pattern (informational · not procedural)

This amendment shipped under a continuation-agent pattern — the
same agent that closed N+6.1 picked up N+6.1.1 to save onboarding
cost on a tight same-domain follow-up. First non-fresh-agent
session since N+5.5. The pattern's success criterion: clean ship
with no missed audit findings beyond what a fresh agent would have
caught. Documented in
[`roadmap/N+6.1.1.md`](./roadmap/N+6.1.1.md) for a future
coordinator to inherit.

### No procedural enforcement cascade this session

Amendment 36.1 is surface-localised — it adds a third leaf to
patterns decision 36 already established. The skill surface
([`skills/modify-tokens.md`](./skills/modify-tokens.md)) inherits
the same dependency-driven trigger from decision 33; no new
mechanics, no new skill cross-refs.

See: [decision 36](./decisionlog.md#36-semantic-spacing--sizing-vocabularies--77-t-shirt-scale--cascade-invariant--n61)
(the parent decision this amendment extends),
[`roadmap/N+6.1.1.md`](./roadmap/N+6.1.1.md) (this amendment's
source session).

## 37. Layout primitives consume semantic vocabulary via prop · no component-token aliasing · N+6.2

**A new class of components lands at N+6.2: the layout primitive.**
Stack ([`lib/components/stack/`](./lib/components/stack/)) and Box
([`lib/components/box/`](./lib/components/box/)) ship as the first
two; future Grid · Cluster · Switcher join the class when
consumers materialise. Layout primitives consume the
[decision 36](./decisionlog.md#36-semantic-spacing--sizing-vocabularies--77-t-shirt-scale--cascade-invariant--n61)
semantic vocabulary **via prop**, NOT via component-token aliasing
in their `@layer tokens` block — a structural departure from the
Button pattern that this decision locks as the canonical shape
for parametrized-by-prop components.

### What

A layout primitive declares an **empty** `@layer tokens` block
(or none) and dispatches the semantic vocabulary entirely in
`@layer rules` through **attribute-selector CSS**:

```css
/* lib/components/stack/stack.css · @layer rules */
.nuri-stack[data-gap="xs"] { gap: var(--nuri-space-xs); }
.nuri-stack[data-gap="sm"] { gap: var(--nuri-space-sm); }
.nuri-stack[data-gap="md"] { gap: var(--nuri-space-md); }
.nuri-stack[data-gap="lg"] { gap: var(--nuri-space-lg); }
.nuri-stack[data-gap="xl"] { gap: var(--nuri-space-xl); }
```

The JS custom element mirrors each prop to a `data-*` attribute on
the inner host element; the CSS attribute selector picks the right
`var(--nuri-space-*)` reference. No `--nuri-stack-gap-md:
var(--nuri-space-md)` alias declaration anywhere — the
component-token layer is empty.

### Reason

Parametrized-by-prop components have no fixed internal default to
alias. Button consumes `--nuri-button-min-height:
var(--nuri-size-xl)` because Button has a fixed internal value
(60 px today) that the spec declares ONCE and the CSS rule reads
ONCE; the component-token name carries semantic information
("the floor height for a primary action") that the resolved value
doesn't. Stack has no fixed default for `gap` — the consumer picks
at the call site (`gap="md"`). A hypothetical
`--nuri-stack-gap-md: var(--nuri-space-md)` alias would mirror
exactly what the prop value already says, without abstraction
value: the consumer reading `<nuri-stack gap="md">` already
understands "md gap"; the alias is "useless indirection"
(operator framing · N+6.1.1 thread). Button's pattern doesn't
generalise to parametrized layouts.

### API surface convention

Layout primitives expose **enum vocabularies matching the
consumed semantic family's T-shirt names**. Subsets are allowed
when the full range would surface choice paralysis at the prop:
Stack `gap` and Box padding props accept the **5-leaf subset**
`xs · sm · md · lg · xl` of the 7-leaf `--nuri-space-*` scale.
The 2 omitted leaves (`2xs` = 2 px, `2xl` = 36 px) stay
available for ad-hoc consumers via direct `tokens.space.{2xs,2xl}`;
they aren't deleted from the semantic vocabulary, just not
promoted to the prop surface. Subset decisions are operator picks
informed by real consumer evidence (2xs is too fine and 2xl too
loose for typical layout rhythm in the migration-test consumer).

### No component-token in `@layer tokens` · pipeline empty-emit case

Layout primitives ship with **no per-component file** under
[`build/components/`](./build/components/). The
[`pipeline/parsers/components.js`](./pipeline/parsers/components.js)
walker reads the component's `@layer tokens` block; when the
block is empty (or absent), the orchestrator at
[`pipeline/tokens-parser.js`](./pipeline/tokens-parser.js) detects
the empty case and skips the emit step — `build/components/stack.ts`
and `build/components/box.ts` are deliberately NOT generated.
The orchestrator logs the skip explicitly:

```
[tokens-parser] wrote component 'stack' (0 decls · layout-primitive · no per-component file emitted)
[tokens-parser] wrote component 'box'   (0 decls · layout-primitive · no per-component file emitted)
```

This extends the per-component emit contract from
[decision 34](./decisionlog.md#34-per-component-files--tokenpath-union--set-policy--pipeline-emit-shape--n603)
with a third case: "empty `@layer tokens` → no file". The
`COMPONENTS` array in
[`pipeline/tokens-parser.js`](./pipeline/tokens-parser.js) stays
the single registry (now `['button', 'stack', 'box']`), but the
walker only writes for components with non-empty token blocks.

### RN-side dispatch

The RN equivalent of Stack/Box reads the prop value and looks up
`space[gap]` directly against the runtime `space` namespace
imported from
[`build/tokens.ts`](./build/tokens.ts) — the same dereference
pattern as the consumer-side static-vs-dynamic split documented at
[decision 36](./decisionlog.md#36-semantic-spacing--sizing-vocabularies--77-t-shirt-scale--cascade-invariant--n61),
but skipping the TokenPath indirection because the prop value
*is* the leaf name (no per-component anatomy file to point at).
The reference implementation ships in the
[migration-test pair](./docs/migration-tests/button-matrix/index.tsx)
as a local module; the long-term home for layout-primitive RN
definitions is an Open question in
[`roadmap/index.md`](./roadmap/index.md) (peer file
`lib/components/<name>/<name>.tsx`? separate `lib/spec/`
namespace?) — re-evaluate post-N+6.2 when n≥2 component RN specs
exist.

### Component page template adaptation

Layout primitives adapt [decision 24](./decisionlog.md#24-component-pages-serve-four-readers-including-migration--n3)'s
4-reader template by **omitting the Variants, States, and
Theming sections** — layout primitives have none of those axes.
The Anatomy + Token-mapping sections stay (per decision 24 they
ARE the migration wiring spec); spec card · hero demo · API ·
live demos · roadmap stay. This adaptation does NOT amend
decision 24 — section flexibility is already a
[decision 19](./decisionlog.md#19-foundation-template-variants-in-service-of-one-structure--n2)
principle ("sections that don't apply are simply omitted — no
template forks"). Layout primitives extend the precedent decision
19 set for foundation pages to component pages.

### Relationship to other decisions

- [Decision 27](./decisionlog.md#27-theme-provider--custom-orthogonal-not-cross-product-registry--n55)
  (orthogonal theme provider · "no useless indirection") · the
  deeper why: the same parsimony argument that rejects
  pre-computed cross-product theme tuples rejects component-token
  aliasing for parametrized layouts. Both add hops without
  abstraction value.
- [Decision 36](./decisionlog.md#36-semantic-spacing--sizing-vocabularies--77-t-shirt-scale--cascade-invariant--n61)
  + [amendment 36.1](./decisionlog.md#361-amendment--n611) · the
  semantic vocabulary Stack/Box consume via prop. Decision 37
  doesn't extend the vocabulary; it adds a consumption pattern.
- [Decision 34](./decisionlog.md#34-per-component-files--tokenpath-union--set-policy--pipeline-emit-shape--n603)
  · the per-component emit contract. Decision 37 extends it with
  the "empty case = skip emit" branch.
- [Decision 24](./decisionlog.md#24-component-pages-serve-four-readers-including-migration--n3)
  · the component page template. Decision 37 adapts (not amends)
  by skipping sections that don't apply.
- [Decision 19](./decisionlog.md#19-foundation-template-variants-in-service-of-one-structure--n2)
  · the template-flexibility precedent that makes the section
  skip non-controversial.

### F-LAYOUT-1 retired

The N+4 friction class
[F-LAYOUT-1](./docs/migration-tests/button-matrix/FRICTIONS.md)
("no Stack / HStack / VStack primitives") that drove both the web
and RN sides of the migration-test consumer to hand-roll flex
layout retires at N+6.2. The pre-N+6.2 `.playground-row-group` /
`.playground-row` styles on the web side and the `canvas` /
`rowGroup` / `row` `StyleSheet.create` entries on the RN side are
both replaced with `<nuri-stack>` / `<nuri-box>` (web) and
`<Stack>` / `<Box>` (RN · local module) composition.

### P3 enforcement Open question · evidence in

[Hard rule 1 / P3](./pages/principles.html#p3-components-consume-semantic)
says components consume semantic tokens, never primitive. The Open
question about mechanical enforcement (a hypothetical guardrail
that greps `lib/components/**/*.css` for `var(--nuri-px-` /
`var(--nuri-color-`) flagged a likely layout-primitive carve-out.
N+6.2 confirms the carve-out shape: layout primitives consume
semantic via attribute-dispatch in `@layer rules` with NO
component-tokens in `@layer tokens`. A mechanical guardrail
should exempt this pattern (no `@layer tokens` declarations →
no P3 violation surface). The Open question entry in
[`roadmap/index.md`](./roadmap/index.md) updates to reference
this evidence.

### Procedural enforcement cascade

None this session — decision 37 is surface-localised (it fires
when a new layout primitive is added). Apply the
[N+6.0.1.1 pattern](./roadmap/N+6.0.1.1.md) at a follow-up `.1`
session if/when a third layout primitive (Grid / Cluster /
Switcher) surfaces a drift the current pattern doesn't catch.

See: [P11](./pages/principles.html#p11-parsimony) (parsimony · the
WHY for refusing component-token aliasing when the abstraction
adds no value),
[decision 27](./decisionlog.md#27-theme-provider--custom-orthogonal-not-cross-product-registry--n55)
(the orthogonal · "useless indirection" framing this decision
generalises),
[decision 36](./decisionlog.md#36-semantic-spacing--sizing-vocabularies--77-t-shirt-scale--cascade-invariant--n61)
+ [amendment 36.1](./decisionlog.md#361-amendment--n611) (the
vocabulary consumed),
[decision 34](./decisionlog.md#34-per-component-files--tokenpath-union--set-policy--pipeline-emit-shape--n603)
(the per-component emit contract · this decision extends with
the empty-case branch),
[decision 24](./decisionlog.md#24-component-pages-serve-four-readers-including-migration--n3)
(the component page template · the section-skip adaptation),
[decision 19](./decisionlog.md#19-foundation-template-variants-in-service-of-one-structure--n2)
(template-flexibility precedent),
[`roadmap/N+6.2.md`](./roadmap/N+6.2.md) (this decision's source
session).

## 38. Icon component · phosphor source · `<nuri-icon name>` Nuri facade · 2-size + fill + registry-based JS dispatch · N+6.3

**Iconography lands at N+6.3 as the first visual atom.** Icon
([`lib/components/icon/`](./lib/components/icon/)) ships as a thin
Nuri facade over a hand-curated registry of phosphor SVG paths.
Where decision 37 locked **attribute-dispatch** (prop → `data-*` →
CSS attribute selector) as the shape for parametrized-by-prop
layout primitives, decision 38 locks **registry-based JS dispatch**
(prop → registry key lookup → inline SVG) as the co-pattern for
components whose vocabulary is an enum of named assets the CSS
cascade can't express. The two patterns are siblings: same
prop-mirroring discipline, different resolution mechanism.

### What

`<nuri-icon name size fill>` renders an inline SVG glyph from
[`lib/components/icon/icons.js`](./lib/components/icon/icons.js) —
a hand-maintained registry of 17 keys × 3 weights (51 path
strings) sourced from `@phosphor-icons/core`. The element is an ES
module (`<script type="module">`, deferred by default so
`connectedCallback` fires after children parse · the AGENTS.md
custom-element rule). Props:

- `name` (required) · registry key · kebab-case · warns
  `[NuriIcon] unknown name "<value>"` and renders nothing on miss
- `size` · `md` (default) | `sm` · mirrored to `data-size` on the
  host so [`icon.css`](./lib/components/icon/icon.css) dispatches
  the box dimensions via attribute selector (the decision 37
  co-pattern)
- `fill` · boolean · presence forces the fill weight

The SVG is emitted with `fill="currentColor"`, `aria-hidden="true"`,
`focusable="false"` on the `0 0 256 256` phosphor viewBox grid.

### Reason

Icons are a closed, named vocabulary (you ask for `vault`, not for
a colour or a size token), and the asset is an SVG path string the
CSS cascade cannot select on. Attribute-dispatch (decision 37)
resolves a prop to a `var(--nuri-*)` reference — it works when the
target is a token. An icon's target is a path string keyed by name,
so the dispatch has to happen in JS: read `name`, look it up in the
registry, inline the SVG. This is the first registry-based JS
dispatch in Nuri and the canonical shape for any future
named-asset component (illustration sets, flag sets, etc.).

### API surface · weight coupling, NOT a raw prop

Weight is **coupled to size + fill**, never exposed as an open
`weight` prop:

```
md  + no fill  → regular
sm  + no fill  → bold     (heavier stroke holds up at the smaller box)
any + fill     → fill
```

Exposing raw phosphor weights (`thin · light · regular · bold ·
fill · duotone`) would surface choice paralysis at the call site
and leak the source library's vocabulary into the Nuri API. The
coupling encodes the one correct pairing per size; a consumer asks
for `size` and optionally `fill`, never for a stroke weight. Colour
is `currentColor` only — no `tone`/`accent`/`color` prop. An icon
inherits its parent's text colour, the same way a glyph in running
text does; a coloured icon is the parent's concern (wrap it, set
`color`), not the icon's.

### Source storage · hand-curated registry, not a build-time import

The 51 path strings live **inlined** in
[`icons.js`](./lib/components/icon/icons.js), extracted once from
`@phosphor-icons/core` (a devDependency, present for provenance and
future re-extraction · NOT imported at runtime). The registry is
hand-curated to exactly the 17 keys real Nuri consumers need; it is
not a wholesale re-export of the phosphor set. Adding a glyph is a
deliberate registry edit, not an automatic consequence of the
dependency. The extraction was a throwaway local script, not
committed.

### Pipeline · empty `@layer tokens` empty-emit case (extends decision 37)

Icon ships with **no per-component file** under
[`build/components/`](./build/components/). Its
[`icon.css`](./lib/components/icon/icon.css) declares an **empty**
`@layer tokens` block — it consumes the semantic size vocabulary
directly in `@layer rules` via attribute dispatch, with no
component-token aliasing. The
[`pipeline/tokens-parser.js`](./pipeline/tokens-parser.js)
orchestrator detects the empty case and skips emit, exactly as it
does for Stack/Box (decision 37). `icon` joins the `COMPONENTS`
registry array (now `['button', 'stack', 'box', 'icon']`); the
skip-log message generalised from "layout-primitive" to the
pattern-neutral "empty `@layer tokens`" because the empty-emit case
is no longer layout-specific:

```
[tokens-parser] wrote component 'icon' (0 decls · empty @layer tokens · no per-component file emitted)
```

### Subset usage of `semantic.size` · no new family

Icon reuses the existing
[decision 36](./decisionlog.md#36-semantic-spacing--sizing-vocabularies--77-t-shirt-scale--cascade-invariant--n61)
`--nuri-size-*` vocabulary rather than minting a new
`--nuri-icon-size-*` family. The two sizes map to a 2-leaf subset:

- `md` → `--nuri-size-sm` (28 px) · default
- `sm` → `--nuri-size-xs` (18 px)

A `--nuri-icon-size-md: var(--nuri-size-sm)` alias would be the
"useless indirection" decision 37 already rejects — the prop value
`size="md"` already carries the meaning. This is the same
subset-at-the-prop convention layout primitives use (decision 37's
5-leaf `gap` subset), applied to a 2-leaf size range.

### RN-side dispatch sketch · deferred

The RN equivalent reads `name` and dereferences the same registry
against a platform SVG renderer (`react-native-svg` `<Path>` per
glyph), with the identical weight-coupling logic. No RN renderer
ships this session — N+6.3 is spec + web only. The RN spec is an
**Open question** in [`roadmap/index.md`](./roadmap/index.md) and a
friction (`F-ICON-RN-1`) in
[`docs/RISKS.md`](./docs/RISKS.md), targeted at N+6.4 when
IconButton lands as the first real icon consumer and forces the
RN-side question.

### Deferred items (Open questions · roadmap/index.md)

- **RN icon renderer spec** · `react-native-svg` path-per-weight ·
  resolve at N+6.4 with IconButton as first consumer
- **Pipeline auto-import trigger** · whether a future build step
  re-extracts from `@phosphor-icons/core` on registry-key changes,
  vs. the current hand-curated edit
- **Raw-weight unlock** · if a real consumer needs `thin`/`light`/
  `duotone`, revisit the coupling — deferred until evidence exists
- **Catalog governance** · the policy for growing past 17 glyphs
  (who approves, what bar) · deferred until the second expansion
  request

### Relationship to other decisions

- [Decision 37](./decisionlog.md#37-layout-primitives-consume-semantic-vocabulary-via-prop--no-component-token-aliasing--n62)
  · the attribute-dispatch sibling. Decision 38 is the
  registry-based-JS-dispatch co-pattern for named-asset
  vocabularies, and reuses 37's empty `@layer tokens` → skip-emit
  branch (generalising the skip-log message).
- [Decision 36](./decisionlog.md#36-semantic-spacing--sizing-vocabularies--77-t-shirt-scale--cascade-invariant--n61)
  · the `--nuri-size-*` vocabulary Icon consumes as a 2-leaf
  subset. Decision 38 adds no new family.
- [Decision 34](./decisionlog.md#34-per-component-files--tokenpath-union--set-policy--pipeline-emit-shape--n603)
  · the per-component emit contract. Decision 38 rides the
  empty-case branch decision 37 added.
- [Decision 24](./decisionlog.md#24-component-pages-serve-four-readers-including-migration--n3)
  + [decision 19](./decisionlog.md#19-foundation-template-variants-in-service-of-one-structure--n2)
  · Iconography ships as a **foundation** page (it establishes the
  icon vocabulary), so it omits Variants/States/Theming per the
  decision 19 section-flexibility precedent.

See: [P11](./pages/principles.html#p11-parsimony) (parsimony · the
WHY for the coupled-weight API and the refused
`--nuri-icon-size-*` family),
[`roadmap/N+6.3.md`](./roadmap/N+6.3.md) (this decision's source
session).

## 39. Ghost variant joins solid/soft as a cross-component chrome-less tertiary · N+6.4

**Ghost lands at N+6.4 as a third variant on BOTH Button and
IconButton — a cross-component decision, not a per-component one.**
Where [decision 5](#5-variant-naming--n1) named `solid` (accent-
driven) and `soft` (chrome-only) and
[decision 11](#11-soft-is-chrome-only-the-accent-knob-does-not-touch-it--n1)
locked soft as chrome-only, decision 39 adds `ghost` as a sibling
in that same family: **chrome-less** — transparent until pressed,
never bordered, never accent-tinted.

### What

`variant="ghost"` is a new enum value on `<nuri-button>` and
`<nuri-icon-button>`. Its resolved appearance:

- **bg** · `transparent` at rest → `--nuri-bg-subtle` on `:active`
- **fg** · `--nuri-text-primary` (chrome text, NOT accent)
- **border** · none, in every state (rest / pressed / disabled)

It is the quietest of the three: `solid` carries accent identity,
`soft` is a chrome-tinted fill, `ghost` is fill-less chrome. The
press feedback is the *only* affordance that paints a box.

### Reason

A tertiary action (Skip · Dismiss · a toolbar icon that shouldn't
compete) needs a control that reads as tappable without carrying a
filled background. The alternative — a `soft` button with a custom
override — reintroduces the per-call chrome tweaking decisions 5
and 11 exist to forbid. Promoting `ghost` to a named variant keeps
the "pick a variant, never tune chrome" discipline intact while
covering the tertiary tier.

### Cross-component by construction

Ghost is defined **once per component** but as the *same* semantic
contract on both. This is deliberate: a variant is part of the
shared Actions vocabulary, so a consumer who learns `ghost` on
Button gets the identical promise on IconButton. The two CSS
definitions are independent (`--nuri-button-ghost-*` and
`--nuri-icon-button-ghost-*` token groups, each in its own
component file) but the chrome-less / no-border / no-accent rules
are word-for-word the same. A future Actions component inherits the
same ghost contract.

### Anti-scope (locked this session)

- **No accent variation on ghost.** `solid` is the only
  accent-following variant; ghost fg is always `text-primary`.
  Setting `accent` on a ghost control is a no-op on the glyph/label
  colour (it still scopes the inner button, but no ghost token
  reads an accent ramp).
- **No border on ghost, any state.** The pressed state paints a
  `bg-subtle` box, not an outline. An outlined tertiary is a
  *separate future variant* (`outline`), tracked as an Open
  question — decision 39 does not pre-empt it.

### Relationship to other decisions

- [Decision 5](#5-variant-naming--n1) /
  [Decision 11](#11-soft-is-chrome-only-the-accent-knob-does-not-touch-it--n1)
  · ghost extends the variant family those established; it inherits
  11's chrome-only stance and sharpens it (soft has a fill, ghost
  does not).
- [Decision 40](#40-iconbutton-is-single-size-locked--md48px--n64)
  · IconButton, ghost's second host, ships the same session.
- See [`roadmap/N+6.4.md`](./roadmap/N+6.4.md) for the source
  session and the `outline` Open question.

## 40. IconButton is single-size-locked · md=48px · N+6.4

**`<nuri-icon-button>` ships with exactly one size — `md` (48px) —
and no `size` prop.** This is a deliberate divergence from Button,
which the *same session* gives a three-size matrix
([decision 41](#41-button-three-size-matrix--asymmetric-typeradius-coupling--default-shifts-to-md--n64)).

### What

`<nuri-icon-button name variant accent label disabled>` — note the
absence of `size`. The control is a fixed 48×48px circle
(`--nuri-icon-button-size: var(--nuri-size-lg)`, radius
`--nuri-radius-full`) wrapping a single `md` `<nuri-icon>`. It is
the **first real consumer of [Icon](#38-icon-component--phosphor-source--nuri-icon-name-nuri-facade--2-size--fill--registry-based-js-dispatch--n63)**,
validating that the Icon atom composes correctly inside an
interactive control (the N+6.3 Open question decision 38 deferred to
"when IconButton lands").

### Reason

A 48px circle is exactly the iOS/Android minimum comfortable touch
target (`F-TOUCH-TARGET-1`). Shrinking it below that breaks
tappability; growing it is a layout concern the consumer solves with
spacing, not a new size token. There is **no evidence yet** for a
second icon-button size — and minting `sm`/`lg` variants now would
be the speculative-generality P11 forbids. Button earns its matrix
because text buttons demonstrably appear at three densities
(decision 41); IconButton has one job at one size until a real
second density appears.

### Anti-scope (locked this session)

- **No multi-size IconButton.** No `size` attribute, no
  `--nuri-icon-button-{lg,sm}-*` token groups. The single size is
  `md`, resolving to `size.lg` (48px). If a dense toolbar variant is
  needed later, it is a new decision with evidence, not a
  pre-built knob.
- The inner glyph is locked to `<nuri-icon size="md">`; the button
  size and the icon size are **not** independently tunable.

### Accessibility · F-ARIA-LABEL-1

An icon-only control has no text node, so an accessible name is
**required**, not optional. IconButton auto-derives `aria-label`
from the kebab `name` (`gear` → "gear", `arrows-down-up` → "arrows
down up") unless an explicit `label` attribute overrides it. The
inner `<nuri-icon>` is `aria-hidden`, so the label is the only thing
assistive tech announces. This is tracked as `F-ARIA-LABEL-1` (new
this session) in [`docs/RISKS.md`](./docs/RISKS.md) and surfaced in
IconButton's Behavioural-delta section
([amendment 24.1](#241-amendment--n64--behavioural-delta-section)).

### Relationship to other decisions

- [Decision 38](#38-icon-component--phosphor-source--nuri-icon-name-nuri-facade--2-size--fill--registry-based-js-dispatch--n63)
  · IconButton is Icon's first consumer; it answers 38's deferred
  "first real consumer" question and confirms the
  `<nuri-icon>` facade composes inside a control.
- [Decision 39](#39-ghost-variant-joins-solidsoft-as-a-cross-component-chrome-less-tertiary--n64)
  · IconButton hosts all three variants including ghost.
- [Decision 41](#41-button-three-size-matrix--asymmetric-typeradius-coupling--default-shifts-to-md--n64)
  · the deliberate contrast — Button gets three sizes the same
  session IconButton is locked to one. The asymmetry is the point:
  size count follows evidence, not symmetry.

### 40.1 amendment · N+6.6 · `fill` weight passthrough

**IconButton gains a `fill` boolean that forwards to the inner
`<nuri-icon>`'s filled weight.** The single-size lock (the substance
of decision 40) is **unchanged** — this adds a glyph-weight knob, not
a size knob.

`<nuri-icon-button name variant accent label disabled fill>` — when
`fill` is present, `#sync` sets `fill=''` on the wrapped
`<nuri-icon>` (registering as present in Icon's
`hasAttribute('fill')` check); when absent it removes it. The host
attribute is added to both `ATTRS` and `observedAttributes`, so
toggling it re-renders. This is a **pure passthrough**: IconButton
mints no fill-specific token and makes no layout change. The filled
weight resolves entirely inside Icon's existing registry dispatch
(decision 38), exactly as a bare `<nuri-icon fill>` would.

The amendment is consumer-driven: Topbar's close affordance
([decision 46](#46-topbar--compositional-chrome-shell-via-named-light-dom-wrappers--slots-not-use-case-variants--n66))
wants a filled `x-circle` glyph, and routing the weight through the
existing IconButton wrapper keeps Topbar composing Icon **only**
through IconButton — preserving the single-funnel that
[`docs/RISKS.md` F-ICON-RN-1](./docs/RISKS.md) tracks (no new direct
`<nuri-icon>` consumer enters the tree). The RN translation mirrors
the prop as `fill?: boolean` on `IconButtonProps`; in the stub it is
a no-op passthrough (the RN Icon renderer is deferred · F-ICON-RN-1),
documented as such at the prop.

## 41. Button three-size matrix · asymmetric type/radius coupling · default shifts to md · N+6.4

**Button gains a three-size matrix — `lg` · `md` · `sm` — and the
default shifts from implicit-`lg` to explicit-`md`.** Prior to
N+6.4, Button had one (implicit) size. Decision 41 makes size an
explicit `size` prop with three values and a **non-uniform** token
coupling.

### What · the matrix

| size | min-height | padding-x | font-size | radius |
|------|-----------|-----------|-----------|--------|
| `lg` | `size.xl` (60px) | `space.xl` (24px) | `type-md` (17px) | `radius.md` (12px) |
| `md` *(default)* | `size.lg` (48px) | `space.lg` (18px) | `type-md` (17px) | `radius.sm` (6px) |
| `sm` | `size.md` (36px) | `space.md` (12px) | `type-sm` (15px) | `radius.sm` (6px) |

### The coupling is asymmetric — by design

The two couplings break at **different boundaries**:

- **Typography** breaks at the `md`/`sm` boundary: `lg` and `md`
  *share* `type-md` (17px); only `sm` drops to `type-sm` (15px).
  Rationale: lg and md are both primary-action sizes that should
  read at the same body weight; sm is a dense/badge action where a
  smaller label is appropriate.
- **Radius** breaks at the `lg`/`md` boundary: `lg` gets
  `radius.md` (12px); `md` and `sm` *share* `radius.sm` (6px).
  Rationale: the large soft-primary wants a softer corner to match
  its presence; the inline and dense sizes share a tighter corner.

A naive matrix would scale all four properties in lockstep. The
asymmetry encodes the real visual intent: **type tracks the
primary/dense split, radius tracks the hero/standard split**, and
those two splits do not coincide.

### Default shifts to md · explicit, no shim

The default size is now `md` (48px), set explicitly in
[`button.js`](./lib/components/button/button.js)
(`getAttribute('size') || 'md'`). The pre-N+6.4 implicit size was
effectively the largest; **md is the new default** because the
inline action is the common case. This is a **deliberate visual
change** to existing un-sized `<nuri-button>` usages, accepted as
correct:

- **No backward-compat shim, no feature flag.** Un-sized buttons
  re-render at md. The spec is the source of truth; there is no
  legacy size to preserve.
- **No autofix sweep** that stamps `size="lg"` onto existing
  call-sites to freeze the old look. If a specific button wants the
  hero size, it opts into `size="lg"` for a *reason*, not to dodge
  the default shift.

### Contrast with IconButton (decision 40)

Button earns three sizes; IconButton is locked to one
([decision 40](#40-iconbutton-is-single-size-locked--md48px--n64)).
Same session, opposite call. The principle: **a size matrix is
justified by demonstrated density variation**, not by symmetry
across components. Text buttons appear as hero CTAs, inline
actions, and dense/badge actions — three real densities. Icon
buttons (so far) do one job at one comfortable touch target.

### Relationship to other decisions

- [Decision 36](#36-semantic-spacing--sizing-vocabularies--77-t-shirt-scale--cascade-invariant--n61)
  · the matrix consumes the `size.*` / `space.*` / `radius.*`
  vocabularies as subsets; it mints no new primitive.
- [Decision 34](#34-per-component-files--tokenpath-union--set-policy--pipeline-emit-shape--n603)
  · the per-size token groups (`--nuri-button-{lg,md,sm}-*`) emit
  through the standard per-component pipeline; the SET_POLICY
  px/radius/type values inline to literals, leaving the runtime
  chrome/accent sets as TokenPath strings.
- [Decision 40](#40-iconbutton-is-single-size-locked--md48px--n64)
  · the deliberate asymmetric counterpart.
- See [`roadmap/N+6.4.md`](./roadmap/N+6.4.md) for the source
  session.

---

## 42. Box gains `background` + `radius` props · attribute-dispatch surface vocabulary · evidence-gated promotion · N+6.5

**Box graduates from layout-only to layout + surface.** The
`background` and `radius` props — held as evidence-gated Open
questions since N+6.2 — promote in N+6.5 because the first real
consumer surfaced: Tabs needs a chrome-filled, rounded tablist
surface (see [decision 43](#43-tabs--first-multi-element-compound--first-box-composition-consumer--n65)).
Box stays a **layout primitive** under
[decision 37](#37-layout-primitives-consume-semantic-vocabulary-via-prop--no-component-token-aliasing--n62):
the two new props dispatch through attribute-selector CSS, and
Box's `@layer tokens` block stays **empty** (no component-token
aliasing).

### What

Two new props, both pure attribute-dispatch in `@layer rules`:

```css
/* lib/components/box/box.css · @layer rules */
.nuri-box[data-background="canvas"]       { background: var(--nuri-bg-canvas); }
.nuri-box[data-background="subtle"]       { background: var(--nuri-bg-subtle); }
.nuri-box[data-background="strong"]       { background: var(--nuri-bg-strong); }
.nuri-box[data-background="accent-solid"] { background: var(--nuri-accent-solid); color: var(--nuri-accent-on-solid); }
.nuri-box[data-background="accent-subtle"]{ background: var(--nuri-accent-bg-subtle); }
.nuri-box[data-radius="sm"]   { border-radius: var(--nuri-radius-sm); }
.nuri-box[data-radius="md"]   { border-radius: var(--nuri-radius-md); }
.nuri-box[data-radius="lg"]   { border-radius: var(--nuri-radius-lg); }
.nuri-box[data-radius="full"] { border-radius: var(--nuri-radius-full); }
```

- **`background`** · 5-value enum spanning the two surface families:
  chrome (`canvas` · `subtle` · `strong`) + accent (`accent-solid` ·
  `accent-subtle`). `accent-solid` is the only value that also sets
  `color` (to `accent-on-solid`), because a solid accent fill needs a
  legible foreground; the chrome and accent-subtle fills inherit text
  colour from the cascade.
- **`radius`** · the 4 semantic radius leaves (`sm` · `md` · `lg` ·
  `full`), consumed as a subset exactly as decision 36/41 consume the
  other semantic scales.

`box.js` adds `'background'` / `'radius'` to its observed attributes,
the `BACKGROUNDS` / `RADII` enum guards (a `console.warn` on an
unknown value, then mirror through), and dispatches each to its
`data-*` attribute. No `--nuri-box-*` token is declared.

### Reason

The N+6.2 evidence-gate held precisely because there was no consumer:
background on a *layout* primitive risked becoming a god-prop that
consumer components (Card / Field) would route their own
accent/variant resolution through, blurring the layout/surface line.
Tabs settles it — a compound that genuinely wants Box to own the
surface so the option shapes can sit on top of it. One real consumer
clears the gate; the vocabulary stays deliberately small (no gradient,
no border, no shadow, no per-corner radius) until a second consumer
asks.

### The accent-fill `color` coupling

`accent-solid` is the sole background value that also writes `color`.
This is not a layout concern leaking in — it is the minimum needed to
keep a solid accent surface legible, and it mirrors the
solid-Button/solid-IconButton pattern (`accent-solid` bg ⇒
`accent-on-solid` fg). The other four values leave `color` to the
cascade. A consumer that wants different foreground handling sets it
on its own children, not on Box.

### Anti-scope (locked this session)

- **No `max-width` prop.** It needs a NEW semantic vocabulary
  (page-shaped rem values, distinct from `semantic.size`'s
  element-shaped px). Deferred until a page-layout component asks.
- **No `border` / `shadow` / `gradient`** background values, and no
  per-corner radius. The enum is exactly what Tabs needs.
- **No component-token.** Box's `@layer tokens` stays empty; the
  pipeline's empty-emit case (decision 37) still applies — Box emits
  no `build/components/box.ts`.

### Relationship to other decisions

- [Decision 37](#37-layout-primitives-consume-semantic-vocabulary-via-prop--no-component-token-aliasing--n62)
  · the attribute-dispatch / empty-`@layer tokens` contract this
  extends. Background + radius are dispatched exactly like `padding`
  / `gap`, not aliased.
- [Decision 43](#43-tabs--first-multi-element-compound--first-box-composition-consumer--n65)
  · the consumer that cleared the evidence-gate.
- [Decision 36](#36-semantic-spacing--sizing-vocabularies--77-t-shirt-scale--cascade-invariant--n61)
  · `radius` consumes the semantic radius leaves as a subset.
- See [`roadmap/N+6.5.md`](./roadmap/N+6.5.md) for the source session.

---

## 43. Tabs · first multi-element compound · first Box composition consumer · N+6.5

**Tabs is the design system's first multi-element compound and its
first Box composition consumer.** `<nuri-tabs value>` +
`<nuri-tab value>` form a Radix-like pair sharing one piece of state
(the selected value); the controller composes a `<nuri-box>` as the
tablist surface rather than re-painting it. Two firsts in one
component, both deliberate.

### What

```html
<nuri-tabs value="overview">
  <nuri-tab value="overview">Overview</nuri-tab>
  <nuri-tab value="activity">Activity</nuri-tab>
  <nuri-tab value="settings">Settings</nuri-tab>
</nuri-tabs>
```

- **One directory, one IIFE** (`lib/components/tabs/tabs.js`) defines
  and registers BOTH elements. They share state through the DOM: a
  click sets the controller's `value` attribute; the controller's
  `attributeChangedCallback` toggles an `active` attribute on each
  child tab, which each tab mirrors to `data-active` + `aria-selected`
  on its inner `<button role="tab">`.
- **The tablist surface is a composed Box.** On mount the controller
  builds `<nuri-box background="strong" radius="md" padding="xs">`
  wrapping a flex `<div role="tablist">`, then moves the authored tabs
  into it. tabs.css owns ONLY the flex rhythm (`--nuri-tabs-gap`) and
  the per-option shape (`--nuri-tab-*`); the surface is delegated.
- **Option shape mirrors Button `sm`** (decision 41): `size.md` min
  height, `space.md` padding-x, `type-sm`, `radius.sm`. At rest a tab
  is transparent with muted text; the active tab fills `accent-solid`
  + `accent-on-solid`, carrying the accent identity like a solid
  Button.

### Reason · why a compound, why composing Box

A segmented selector is irreducibly multi-element: a controller that
owns selection and N options that reflect it. Faking it as a single
element with a `tabs="a,b,c"` prop would lose per-tab `disabled`,
per-tab content, and the natural HTML authoring shape. The Radix
compound pattern is the honest model, and Tabs is simple enough
(single-select, no panels yet) to be the first one.

Composing Box (rather than re-declaring `background`/`border-radius`
in tabs.css) is the whole point of promoting decision 42: it proves
the layout/surface split holds under a real consumer. The surface
tokens live in ONE place (Box), and Tabs reads them through the prop
API exactly as an app author would.

### Pipeline · two prefixes, one emitted

Only `--nuri-tabs-*` (the container prefix) emits to
`build/components/tabs.ts` — the emitter matches the **exact**
component prefix (`decl.prop.startsWith('--nuri-tabs-')`), so
`--nuri-tab-*` (the option shape) is **not** captured. This is
deliberate: the RN Tab renders its option shape from the same
semantic vocabulary on its own side; only the container gap needs to
cross the build boundary. `tabs.ts` is therefore a single-entry file
(`{ gap: 'space.2xs' }`).

### A11y · roving baseline, arrow-nav deferred

The tablist carries `role="tablist"`; each tab is a
`<button role="tab" aria-selected>`. A roving-`tabIndex` baseline is
in place (active tab `0`, rest `-1`), but full arrow-key roving across
the tablist is **deferred** this session (`F-KEYBOARD-NAV-1`) — each
tab is individually focusable and activates via native Enter/Space.

### Anti-scope (locked this session)

- **No `outline` / `ghost` variant on Tab.** One appearance: muted
  rest, accent-solid active.
- **No tab panels** (`<nuri-tab-panel>`). Selection only; panels
  arrive when a panelled surface needs them.
- **No arrow-key roving** this session (deferred, not dropped).

### Relationship to other decisions

- [Decision 42](#42-box-gains-background--radius-props--attribute-dispatch-surface-vocabulary--evidence-gated-promotion--n65)
  · Tabs is the consumer that promoted Box's surface props; the
  tablist surface IS a composed Box.
- [Decision 41](#41-button-three-size-matrix--asymmetric-typeradius-coupling--default-shifts-to-md--n64)
  · the option shape reuses Button's `sm` geometry.
- [Decision 9](#9-component-token-selector-pattern--n1)
  · `--nuri-tab-*` is re-declared on `:root,[data-accent],[data-theme]`
  so `accent-solid` resolves at the scope level.
- [Decision 34](#34-per-component-files--tokenpath-union--set-policy--pipeline-emit-shape--n603)
  · exact-prefix emit means only `--nuri-tabs-*` reaches `tabs.ts`.
- See [`roadmap/N+6.5.md`](./roadmap/N+6.5.md) for the source session.

### 43.1 amendment · N+6.5 · Vocabulary-derived compound options skip per-component RN emit

Decision 43 ships Tabs with TWO token prefixes in
[`lib/components/tabs/tabs.css`](./lib/components/tabs/tabs.css):
`--nuri-tabs-*` (container · 1 token: `gap`) and `--nuri-tab-*`
(option · 10 tokens: shape + state). The pipeline parser
([`pipeline/parsers/components.js:79`](./pipeline/parsers/components.js))
applies an exact dir-prefix filter (`--nuri-${dir}-*`); `--nuri-tab-*`
intentionally falls outside the `tabs/` dir match and the option
tokens **do not** emit to [`build/components/tabs.ts`](./build/components/tabs.ts).
Only the container `gap` token reaches the RN spec emit.

This amendment **locks the asymmetry as a deliberate convention** —
not a bug, not a parser limitation to work around. The trigger
criterion + rationale:

**Trigger:** when ALL sub-element tokens of a compound component are
references to semantic vocabulary already exposed via runtime sets
(in Tabs' case: `size.md`, `space.md`, `type.sm`, `radius.sm`,
`text.muted`, `accent.solid`, `accent.on-solid` · plus the
literal `0.97` press-scale and `0.4` disabled-opacity shared across
components), the sub-element may use a sibling prefix
(`--nuri-${element}-*`) that intentionally falls outside the
dir-prefix filter.

**Reason:** the RN consumer reconstructs the sub-element shape
directly from semantic vocabulary via existing TokenPath dereference
(`size.md`, `space.md`, …) — no design-specific information is
lost. Re-emitting these references under a `--nuri-tabs-option-*`
flat namespace would only add 10 indirection-through-prefix entries
to the TokenPath union, restating the same vocabulary lookup the
consumer already does. Decision 24's 1:1 web↔RN obligation is on
the **props API**, not on internal component-tokens; the props API
is preserved (web and RN both expose `<Tabs value> + <Tab value>`),
and the visual shape is reconstructed from the shared vocabulary.

**Anti-trigger (when to flat-namespace instead):** if a sub-element
introduces design-specific tokens — a fixed indicator width, a
custom press-scale that diverges from the parent, a variant matrix
unique to the sub-element — promote to the dir-prefix flat
namespace (`--nuri-${dir}-${role}-*`) so the RN emit captures
them. The Tab option's `--nuri-tab-press-scale: 0.97` and
`--nuri-tab-disabled-opacity: 0.4` are borderline (literal numerics,
not vocabulary references), but they match the cross-component
shared defaults (Button, IconButton both use the same literals);
they ride the convention rather than triggering the anti-rule.

**Migration agent guidance:** when implementing the RN side of a
Tabs-like compound, the option shape comes from the same semantic
vocabulary the web CSS references — read
[`lib/components/tabs/tabs.css`](./lib/components/tabs/tabs.css)
@layer tokens block to see the mapping, then reference
[`build/tokens.ts`](./build/tokens.ts) runtime sets for the actual
values. The `--nuri-tab-*` declarations are the documented mapping
table, not a missing RN spec.

**Future application:** Accordion items, Select options, ListItem
content — any future compound whose sub-element is vocabulary-derived
follows this convention. The first compound that violates the
trigger (sub-element with design-specific tokens) promotes those
specific tokens to the flat namespace; the vocabulary-derived ones
stay sibling-prefixed. This is the **first cross-component-token-
emit convention** in Nuri; n=1 evidence today, codified for
discoverability.

This amendment also implicitly **closes a Closeout audit gap**: a
naive grep "does every `--nuri-*` declaration in `lib/components/<dir>/`
match the dir prefix?" would flag the `--nuri-tab-*` tokens as
"orphans". The convention says they're NOT orphans — they're
sibling-prefixed by design. A future audit-ask in
[`skills/close-out-session.md`](./skills/close-out-session.md)
should distinguish (1) genuinely orphan tokens (typos, leftover
drift) from (2) intentional sibling-prefixed compound sub-elements
that pass the trigger criterion above. Lean: skill amendment lands
post-n+2 evidence (second compound shipping with the same
convention).

---

## 44. Switch · standalone parametric pill · owns component-tokens · `<button role="switch">` not checkbox · N+6.5

**Switch is a standalone parametric pill that owns component-tokens —
the opposite structural call from a layout primitive.** Unlike Box /
Stack / Tabs (which dispatch semantic vocabulary or compose other
components), Switch has a small fixed track/knob palette that earns a
named, scope-resolved component-token layer, exactly like Button and
IconButton.

### What

```html
<nuri-switch></nuri-switch>                        <!-- off -->
<nuri-switch checked></nuri-switch>                <!-- on -->
<nuri-switch checked accent="lilac"></nuri-switch> <!-- on · self-scope -->
<nuri-switch disabled></nuri-switch>
```

- **Single size, no variants.** A 60×36 track (`size.xl` × `size.md`,
  `radius.full`) with a 28×28 knob (`size.sm`), `space.xs` inset. The
  only axes are `checked` × `disabled`.
- **Owns `@layer tokens`** declared on `:root,[data-accent],[data-theme]`
  (decision 9 scope re-resolution): track geometry, OFF/ON/knob
  colours, press scale, disabled opacity. These emit to
  `build/components/switch.ts`.
- **Colour** · OFF track is `bg-inverse-muted` (a new chrome semantic
  token · see below), ON track is `accent-solid` (the only
  accent-driven surface), knob is always `bg-canvas` so it lifts off
  either track colour.

### The derived `knob-travel` stays out of `@layer tokens`

The knob's slide distance is
`calc(track-width − knob-size − 2·inset)` = 24px. It is declared in
`@layer rules` on `.nuri-switch`, **not** in `@layer tokens`, because
it is a derived geometry value — a `calc()` over other tokens, not an
alias the pipeline can resolve to a single literal. Putting it in the
token surface broke the emitter (it emitted a quoted multi-line
`calc()` string · syntax error); the fix is structural, not a
special-case in the parser. The docs token-dictionary filter
correspondingly excludes it.

### New semantic token · `--nuri-bg-inverse-muted`

Switch's OFF track needed a muted same-theme fill that reads "off /
inactive" — distinct from `bg-strong` (too prominent) and
`bg-inverse` (full inversion). Added one chrome semantic token mapping
to `neutral-11` (light + dark cascade-varying), auto-discovered by the
classify-by-cascade pipeline (decision 28) — the semantic export count
went 36 → 37 with no emitter edit.

### A11y · `<button role="switch">`, NOT `<input type="checkbox">`

The inner control is a native
`<button type="button" role="switch" aria-checked>`. A checkbox would
announce "checkbox, checked/unchecked"; a switch announces "switch,
on/off" — the correct semantics for a binary setting toggle. The
wrapper toggles the host `checked` attribute on click; the DOM
attribute is the source of truth (`F-CHECKED-STATE-1` · the RN side is
controlled-prop-driven).

### Anti-scope (locked this session)

- **No `<input type="checkbox">`.** Native button + ARIA only.
- **No variant or size matrix.** One pill, one size.
- **No new accent variant.** The accent shows only via `accent-solid`
  on the ON track; `accent` is Tier 2 self-scope, nothing more.
- **No label slot.** Field-row label association is deferred.

### Relationship to other decisions

- [Decision 9](#9-component-token-selector-pattern--n1)
  · the component-token re-resolution model Switch follows (vs the
  empty-`@layer tokens` of layout primitives).
- [Decision 37](#37-layout-primitives-consume-semantic-vocabulary-via-prop--no-component-token-aliasing--n62)
  · the deliberate structural counterpart — Switch is NOT a layout
  primitive, so it owns tokens.
- [Decision 28](#auto-promotion-via-set_policy-decision-34)
  · `--nuri-bg-inverse-muted` is auto-discovered by classify-by-cascade;
  no hardcoded export edit.
- [Decision 34](#34-per-component-files--tokenpath-union--set-policy--pipeline-emit-shape--n603)
  · `switch.ts` emits 9 declarations (geometry/colour as TokenPath
  strings, scale/opacity as literals). The reserved-word guard in
  `exportNameFor` emits `switchTokens` (not `switch`).
- See [`roadmap/N+6.5.md`](./roadmap/N+6.5.md) for the source session.

---

## 45. Interaction-family primitives · cross-component design constants · `--nuri-interaction-*` · N+6.5 (post-close coordinator polish)

**Cross-component literal design decisions that n=3+ components were
hardcoding get promoted to centralized primitive tokens** under a new
`--nuri-interaction-*` family. Two tokens land in this first pass:
`--nuri-interaction-press-scale: 0.97` and
`--nuri-interaction-disabled-opacity: 0.4`. The polish closes an
antipattern that emerged across decisions 39 (Button + IconButton
press feedback) and 43 (Tabs option same press feedback), where each
component re-declared the same literal in its own `@layer tokens`.
Centralization makes the design decision **propagatable from a single
edit** and surfaces the convention as a documented contract.

### What

Two cascade-invariant primitives added to
[`styles/tokens-primitive.css`](./styles/tokens-primitive.css)
in the same neighbourhood as `--nuri-duration-*`:

```css
--nuri-interaction-press-scale:      0.97;  /* transform: scale on :active · variant-agnostic */
--nuri-interaction-disabled-opacity: 0.4;   /* opacity on [disabled] · cross-component */
```

Component `@layer tokens` blocks reference them via alias:

```css
/* button.css */
--nuri-button-press-scale:      var(--nuri-interaction-press-scale);
--nuri-button-disabled-opacity: var(--nuri-interaction-disabled-opacity);
/* icon-button.css, tabs.css mirror the same pattern.
 * switch.css uses --nuri-interaction-disabled-opacity for the
 * disabled track + KEEPS a literal 0.92 for the knob press-scale
 * (documented override · see "Consumer override" below). */
```

Pipeline integration: `PRIMITIVE_SET_PREFIXES` in
[`pipeline/parsers/semantic.js`](./pipeline/parsers/semantic.js)
gains `['--nuri-interaction-', 'primitive.interaction']`. `SET_POLICY`
gains `'primitive.interaction': { runtime: false, pipelineInline: true }`
— literals resolve through the var-chain to terminal values at build
time, exactly like `primitive.duration`. The build emit is byte-identical
post-polish: every consumer's per-component `.ts` file still resolves
to the same numeric (`pressScale: 0.97`, `disabledOpacity: 0.4`) — the
indirection is **pipeline-inlined**, invisible to the RN consumer.

### Reason · why centralize, why primitive layer, why family prefix

**Why centralize.** Pre-polish, four components hardcoded the same
two literals (`0.97` in Button + IconButton + Tab; `0.4` in Button
+ IconButton + Tab + Switch). The hardcoding silently broke the
"single source of truth" expectation: a future designer wanting to
soften the press feedback would have to edit 3–4 files. Centralization
encodes the design decision in one place and propagates it through
the existing `@layer tokens` alias mechanism that components already
use for every other reference.

**Why primitive layer (not semantic).** Initial attempt placed these
in [`styles/tokens-semantic.css`](./styles/tokens-semantic.css), which
the pipeline classifier rejected: the semantic classifier wants
group-prefix family vocabularies (chrome, accent, space, size, radius)
not bare singletons. The correct home is the **primitive layer**, in
the same neighbourhood as `--nuri-duration-*` — both are raw numeric
constants without role abstraction or scale ([decision 32](#32-primitive-scale-uses-direct-pixel-naming---nuri-px-n--n60)
locks primitive layer as the home for raw measurements). Semantic
layer is role-based references to primitives (`bg.canvas =
neutral-1-light`); these tokens have no role abstraction, they're
literally just the constants.

**Why family-prefix `--nuri-interaction-*`.** The pipeline's
`PRIMITIVE_SET_PREFIXES` classifier matches by prefix; bare singleton
names like `--nuri-press-scale` and `--nuri-disabled-opacity` would
either need individual `PRIMITIVE_SET_PREFIXES` entries (fragile, doesn't
scale) or live without classification (rejected by the orphan check
at `resolveSetPolicy`). Family-prefixing aligns with the established
pattern (`--nuri-duration-fast/med/slow`, `--nuri-px-N`,
`--nuri-radius-*`) and makes future expansion trivial — the family
extends when more interaction concerns surface their consumer
evidence.

### Relation to P3 / decision 9 · the bare-constant carve-out

[Decision 9 / hard rule 1 / P3](#9-component-token-selector-pattern--n1)
says **components consume semantic tokens, never primitive directly**.
Decision 45 introduces tokens at the primitive layer that are consumed
through the component `@layer tokens` alias (which IS the canonical
shape · components alias primitives in their own token block, then
reference the alias in `@layer rules`). But the alias mechanism here
points DIRECTLY at a primitive, with no semantic intermediate. Strictly,
this contradicts P3.

**The contradiction is real, but the carve-out is already established
practice.** [`--nuri-duration-fast`](./styles/tokens-primitive.css) lives
in the primitive layer (added pre-N+5) and is consumed directly from
component CSS in 4+ components today (button.css, icon-button.css,
tabs.css, switch.css all transition through `var(--nuri-duration-fast)`).
P3 was already implicitly violated by that pattern. Decision 45
**formalizes the carve-out that was already in effect**.

**The carve-out criterion: "bare-constant primitives may be consumed
directly · no semantic alias required."** A primitive qualifies as
"bare-constant" when ALL of:

1. **No role abstraction** — the value is literally itself
   (`0.97`, `120ms`), not a reference to a scale step
   (`--nuri-color-neutral-1-light`) or a vocabulary leaf
   (`--nuri-px-12`).
2. **No semantic alias would add abstraction value** — wrapping the
   primitive in a semantic token like `--nuri-state-press-scale: var(--nuri-interaction-press-scale)`
   would be 1-to-1 identity aliasing with a different name; the
   migration agent learns nothing new from the indirection, the
   refactor surface doesn't decouple anything.
3. **Family-prefixed at primitive layer** for pipeline classifier
   compatibility (`--nuri-duration-*`, `--nuri-interaction-*`).

Anything that fails ANY of these criteria MUST go through a semantic
alias (the strict P3 path). Color values fail #1 (they have a scale
abstraction). T-shirt-scale dimensions fail #1 + #2 (they have a
vocabulary). Focus-ring `var(--nuri-color-lilac-8-light)` fails #2
(its semantic role IS "the focus indicator color", abstract from the
specific lilac step). The bare-constant carve-out is genuinely narrow.

**Future amendment 9.1 trigger.** If a third bare-constant primitive
family materializes (e.g., motion spring stiffness, focus-ring
thickness), promote this carve-out from "decision 45 documents the
existing practice" to "amendment 9.1 formally amends P3 with the
bare-constant exception". Today: n=2 evidence (duration + interaction),
sufficient for decision 45 to document, insufficient for promoting
to a formal P3 amendment.

### Consumer override pattern

**Components MAY override the centralized value with a literal when
geometric or contextual justification applies.** The override MUST
carry an inline comment documenting the rationale. Today's anchor:
[`switch.css`](./lib/components/switch/switch.css) knob press-scale
uses `0.92` (not `var(--nuri-interaction-press-scale)`) because the
knob is `size.sm` (28×28) and a 3% shrink reads as almost no feedback
at that geometry; `0.92` (8% shrink) keeps the tactile press visible.
The inline comment cites this decision and explains the override
explicitly. Future overrides follow the same pattern: literal value
+ rationale comment + cross-ref to this decision.

This **deliberate-asymmetry-with-documentation** is a sibling of
[decision 11](#11-tag-unification--n1)'s "soft is chrome-only" (where
the variant intentionally diverges from its accent siblings, also
with documented rationale). Both encode the philosophy "consistency
by default, deliberate exceptions with explicit rationale."

### Promotion criterion (when to add a new token to the family)

A new `--nuri-interaction-*` token lands when ALL of:

1. **n=2+ consumers** are hardcoding the same literal (the operator-
   audit-catching event that triggered this polish — three Button-family
   components hardcoded `0.97`).
2. The role is **nameable** as "the standard X for Y" where X is a
   property (scale, opacity, …) and Y is an interaction concern
   (press, disabled, focus, …) — not a one-off geometric tuning.
3. The value is **cascade-invariant** — no dependency on theme,
   accent, scope, or viewport. (Cascade-varying interaction values
   would belong in the semantic chrome/accent families with their
   own SET_POLICY runtime entry.)
4. The literal is **not part of a T-shirt scale** (those go to the
   semantic dimension vocabularies per [decision 36](#36-semantic-spacing--sizing-vocabularies--77-t-shirt-scale--cascade-invariant--n61)).

This is **decision 30 (primitive parsimony) compatible** because the
tokens are consumer-promoted from existing hardcoding, not
speculative additions; test 17 (`every primitive token is consumed
or explicitly reserved`) passes — both leaves have ≥3 consumers
each.

### Anti-pattern · what does NOT belong in `--nuri-interaction-*`

- **Cascade-varying values** (depend on theme/accent/scope): those
  go to semantic chrome/accent families (e.g., a hypothetical
  hover-bg-tint that adapts per-accent would live in semantic).
- **T-shirt-scale vocabularies** (multiple ordered leaves): those
  go to semantic dimension families (space, size, radius).
- **Role-bearing abstractions** (`focus-ring`, `accent-on-solid`):
  those go to semantic layer (they encode a SEMANTIC role pointing
  at a primitive; interaction-family is the raw constant itself).
- **Component-specific tuning** that no other component reuses: stays
  in the component's `@layer tokens` with a literal (sub-trigger-
  criterion: n<2).

### Future expansion (deferred · trigger-driven)

Likely future `--nuri-interaction-*` members when their consumer-
evidence triggers:

- `--nuri-interaction-focus-ring-thickness` if multiple components
  start declaring their own `outline-width` literally
- `--nuri-interaction-hover-bg-tint` if Nuri ever ships a `:hover`
  affordance (today: mobile-first · no hover · so N/A)
- `--nuri-interaction-spring-stiffness` if motion config surfaces
  beyond the current `duration-fast` (e.g., spring-based
  transitions in RN)

None of these ship today. Promotion criterion above gates each.

### Cross-references

- [Decision 9](#9-component-token-selector-pattern--n1)
  · component `@layer tokens` references this primitive via the
  established `:root, [data-accent], [data-theme]` re-declaration
  pattern (Tier 2/3 self-scope correctness).
- [Decision 30](#30-primitive-parsimony--no-speculative-additions--n571)
  · consumer-promoted (n=3+) — not speculative — passes test 17.
- [Decision 32](#32-primitive-scale-uses-direct-pixel-naming---nuri-px-n--n60)
  · primitive layer as the home for raw measurements + literals
  without role abstraction.
- [Decision 34](#34-per-component-files--tokenpath-union--set-policy--pipeline-emit-shape--n603)
  · `SET_POLICY` gains `primitive.interaction` entry,
  `pipelineInline: true` (matches `primitive.duration` shape).
- [Decision 39](#39-ghost-variant-joins-solidsoft-as-a-cross-component-chrome-less-tertiary--n64)
  · sibling pattern of "shared design decision across multiple
  components" — decision 39 ships a shared VARIANT, decision 45
  ships shared INTERACTION CONSTANTS. Different vocabularies,
  same philosophical move.
- See [`roadmap/N+6.5.md`](./roadmap/N+6.5.md) post-close polish
  section.

---

## 46. Compositional chrome shell via named light-DOM wrappers · N+6.6

**Topbar is a layout primitive, not a configured widget.** It ships
as a three-region compositional shell — `[leading] · children ·
[trailing]` — driven by a single structural boolean, `center`. The
caller composes content into named light-DOM wrapper elements
(`<nuri-topbar-start>` / `<nuri-topbar-end>`); everything else is the
centre region. **Slots, not use-case variants.** There is no
`variant="back"`, no `variant="search"`, no `title` / `subtitle`
prop — those would be use-case enumerations of an open-ended surface.

### What

```html
<nuri-topbar>
  <nuri-topbar-start>
    <nuri-icon-button name="caret-left" variant="ghost" label="Back"></nuri-icon-button>
  </nuri-topbar-start>
  <nuri-typography size="md" emphasis>Account</nuri-typography>
  <nuri-topbar-end>
    <nuri-icon-button name="gear" variant="ghost" label="Settings"></nuri-icon-button>
  </nuri-topbar-end>
</nuri-topbar>
```

- `<nuri-topbar>` is the flex host: `display:flex; align-items:center;
  height: var(--nuri-size-xl); background: var(--nuri-bg-canvas);
  color: var(--nuri-text-primary); gap: var(--nuri-space-sm)`.
- `<nuri-topbar-start>` / `<nuri-topbar-end>` are `display:contents`
  marker wrappers. The caller wraps leading/trailing content in them;
  anything outside them is the centre.
- `center` (boolean) is the **only** prop. It flips the layout from
  left-aligned title (`center=false`: side regions `flex:0 0 auto`,
  centre `flex:1` left-justified) to balanced title
  (`center=true`: side regions `flex:1`, centre `flex:0 0 auto`
  centre-justified, `padding-inline: var(--nuri-space-lg)`).

### The light-DOM child-reparenting mechanism (no Shadow DOM)

`connectedCallback` queries `:scope > nuri-topbar-start` and
`:scope > nuri-topbar-end`, treats every other top-level node as a
centre node, builds three region `<div>`s
(`.nuri-topbar__start/__center/__end`), reparents the wrappers and the
loose nodes into them, and appends the regions back to the host. This
is the **same mechanism Tabs uses**
([decision 43](#43-tabs--first-multi-element-compound--first-box-composition-consumer--n65))
— no Shadow DOM, no `<slot>`, no `display:contents` host. Reasons,
identical to Tabs: light-DOM keeps the cascade reaching tokens (no
shadow boundary to pierce), keeps the migration agent reading real
DOM, and matches the RN translation where the child-routing happens
in render.

### Empty `@layer tokens` · layout primitive (no `--nuri-topbar-*`)

Topbar mints **zero component tokens**. Its CSS `@layer tokens` block
is empty; all styling in `@layer rules` consumes semantic tokens
directly (`--nuri-bg-canvas`, `--nuri-text-primary`,
`--nuri-space-{sm,lg}`, `--nuri-size-xl`). This is the
**layout-primitive pattern** established by Box
([decision 37](#37-layout-primitives-consume-semantic-vocabulary-via-prop--no-component-token-aliasing--n62)):
the pipeline walker visits `topbar` in the `COMPONENTS` registry,
detects the empty token block, and **skips** writing
`build/components/topbar.ts` — exactly as it does for Box/Stack/Icon.
No per-component RN token module ships.

### Attribute-dispatch · padding computed in CSS, never JS

Per [decision 42](#42-box-gains-background--radius-props--attribute-dispatch-surface-vocabulary--evidence-gated-promotion--n65),
the edge padding is **not** computed in JavaScript. `connectedCallback`
sets structural data-attributes on the host —
`data-center` (presence), `data-leading="filled|empty"`,
`data-trailing="filled|empty"` (whether the start/end region holds
content) — and the CSS `@layer rules` selectors map those states to
padding:

- `center=true` → `padding-inline: var(--nuri-space-lg)` on both
  edges (side regions absorb the balance).
- `center=false`, edge occupied → that edge gets
  `var(--nuri-space-sm)` (content already has visual mass).
- `center=false`, edge empty → that edge gets
  `var(--nuri-space-lg)` (the title needs breathing room from the
  hard edge).

JS reports *state*; CSS owns *appearance*. (Implementation uses
logical `padding-inline-start/end` rather than the brief's literal
`padding-left/right`, for RTL parity with Box — a faithful
translation of the spec's intent, not a scope expansion.)

### Reason · slots beat variants for open-ended chrome

A top app bar is a **composition surface**, not a fixed-shape widget.
Real bars hold back-buttons, titles, subtitles, action clusters,
search fields, segmented controls — an open set. Enumerating those as
`variant="…"` values would be the speculative-generality P11/decision
30 forbids: every new layout need would mint a new variant, and the
component would accumulate use-case knowledge it has no business
holding. The slot model pushes content composition to the caller and
keeps Topbar's own surface area minimal — **one structural boolean**.
This mirrors the Tabs decision to be a compound of composed children
rather than a `data`-driven config object.

### Anti-scope (locked this session)

- **No `--nuri-topbar-*` tokens.** Layout primitive · empty
  `@layer tokens` · no `build/components/topbar.ts`.
- **No props beyond `center`** (later: + the `inset` edge-padding
  override, evidence-gated · [amendment 46.1](#461-amendment--n66--inset-edge-padding-override)).
  No `title`/`subtitle`, no `variant`, no `elevation`/`border` knob. A
  divider or elevation, if ever needed, is a future evidence-gated
  decision.
- **No Shadow DOM / no `<slot>`.** Light-DOM reparenting only.
- **No SegmentedControl, no Icon RN renderer.** The close affordance
  composes the *existing* IconButton (gaining `fill` ·
  [amendment 40.1](#401-amendment--n66--fill-weight-passthrough)),
  so no new direct `<nuri-icon>` consumer enters the tree
  (preserves the F-ICON-RN-1 single funnel).

### Relationship to other decisions

- [Decision 43](#43-tabs--first-multi-element-compound--first-box-composition-consumer--n65)
  · same light-DOM child-reparenting compound mechanism; Topbar is
  the second compound and reuses the pattern verbatim (no Shadow DOM,
  no `<slot>`, `connectedCallback` reparents).
- [Decision 37](#37-layout-primitives-consume-semantic-vocabulary-via-prop--no-component-token-aliasing--n62)
  · Topbar is a layout primitive: empty `@layer tokens`, pipeline
  skips per-component emit.
- [Decision 42](#42-box-gains-background--radius-props--attribute-dispatch-surface-vocabulary--evidence-gated-promotion--n65)
  · attribute-dispatch — JS sets data-* state, CSS owns padding.
- [Decision 30](#30-primitive-parsimony--no-speculative-additions--n571)
  / P11 · `center`-only API · slots not variants is the
  speculative-generality refusal in component-API form.
- [Amendment 40.1](#401-amendment--n66--fill-weight-passthrough)
  · IconButton's `fill` passthrough, the sibling change this session,
  serves Topbar's filled close glyph while keeping Icon single-funnelled.
- See [`roadmap/N+6.6.md`](./roadmap/N+6.6.md) for the source session.

### 46.1 amendment · N+6.6 · `inset` edge-padding override

**Edge padding gains a per-edge override — `inset` / `inset-start` /
`inset-end` (`xs`|`sm`|`lg`) — and the `center` default tightens from
`lg` to `xs`.** Evidence-gated by two real centred shapes that the
single hardcoded `center` padding could not both serve: a centred
`<nuri-tabs>` switcher wants a tight `xs` gutter, while the Cancel /
Edit / Save action bar wants the roomy `lg`. Occupancy detection
(`filled` / `empty`) cannot tell them apart — an icon button and a
text button are both "filled" — so the split has to be *declared*, not
inferred.

**Why a prop and not auto-detection.** A heuristic ("is the edge child
an IconButton?") would have to be re-implemented on the RN port:
web inspects the DOM, RN inspects a React child tree (arrays,
fragments, falsy children). Two unrelated code paths computing the
same value is a silent cross-platform drift surface — the exact class
of bug the migration-test apparatus exists to prevent (RISKS R1). An
explicit prop is one declared value both platforms read identically.
This is the principled exception to decision 46's "no props beyond
`center`": density at the screen edge is a genuine authoring decision,
not cleanly derivable cross-platform.

**Mechanism (decision 42 lineage).** topbar.js folds the `inset`
shorthand + per-edge `inset-start` / `inset-end` into
`data-inset-start` / `data-inset-end`; topbar.css resolves the final
value through two custom props (`--_inset-start` / `--_inset-end`) so
the base, occupancy, `center`, and `inset` assignments all sit at
**equal specificity** and compose purely by **source order** (base →
occupancy → center → inset). JS never computes padding. The empty-slot
behaviour is unchanged: with no override, an empty edge still resolves
to `lg` (title breathes from the screen edge), an occupied edge to
`sm`, and a centred bar to `xs`.

**Caveat.** In `center` mode the side regions are `flex: 1`, so an
asymmetric `inset-start ≠ inset-end` shifts the optical centre. Keep
insets symmetric on centred bars (use the `inset` shorthand); per-edge
overrides are mainly meaningful in default mode.

RN parity: `TopbarProps` gains `inset?` / `insetStart?` / `insetEnd?:
'xs'|'sm'|'lg'`; the action-bar demo carries `inset="lg"`. `tsc`
re-run → exit 0.

### 46.2 amendment · N+8.4 · Topbar is now font-BEARING for its title

**The centre region carries a default title type — Topbar is no longer
pure-layout for text.** Originally the shell styled only `color` and
expected a slotted `<nuri-typography>` for the title (see the
[decision 54](#54-type-scale-emitted-as-a-directly-accessed-namespace--one-source-two-readers--n83)
"Topbar is NOT an exception" note, now **reversed** by this amendment).
[Decision 55](#55-component-owned-labels-source-type-from-the-shared-scale--button--tab--topbar--n84)
moves the title type INTO the shell: `.nuri-topbar__center` declares a
default **lg-em** treatment (size · line-height · letter-spacing ·
weight) sourced directly from the shared `--nuri-type-*` scale, so a
**bare title text node** (no per-text wrapper, no `<nuri-typography>`)
reads as a heading by inheritance.

**Still a layout primitive — the invariant holds.** Topbar continues to
own **zero `--nuri-topbar-*` component tokens** (`@layer tokens` stays
empty · pipeline rides the skip-emit branch · no `build/components/
topbar.ts`). It reads the shared type scale directly in `@layer rules`,
exactly as it already reads `--nuri-space-*` / `--nuri-size-*`. "Owns no
tokens" was never "styles no text"; this amendment only makes the latter
explicit. The `center` boolean remains the only structural prop —
there is still no `title` prop.

**RN parity.** RN cannot propagate text style through a `View`, so the
Topbar component wraps `centreNodes` in a single `<Text>` carrying
`typeStyle('lgEm')` + the title color; bare title text inherits it. The
wrapper lives in the COMPONENT (generic), not per-title in author code —
the analogue of the web centre-region type block. `docs/migration-tests/
button-matrix/index.tsx` updated; `tsc` → exit 0.

**Operator signed off (2026-05-31)** on Topbar becoming font-bearing for
its title (default lg-em sourced from the shared scale · bare text inherits
· still owns zero `--nuri-topbar-*` tokens) — confirmed at the N+8.4 visual
checkpoint.

### 46.3 amendment · N+11 · an empty side region collapses (no phantom gap)

**An empty side region no longer eats a `gap` slot.** The shell ALWAYS builds
all three region containers (`__start` · `__center` · `__end`) so `center` mode
can balance the middle with `flex:1` sides. But the host
`nuri-topbar { gap: var(--nuri-space-sm) }` reserves a slot for an EMPTY side
region too — nudging the title inward by `space-sm` even when nothing is there
(the My-vault topbar — title + end only — hit exactly this). Occupancy is
already reflected at mount as `data-leading` / `data-trailing`, so the fix is
CSS-only: collapse an empty side OUT of flow, but ONLY in the default
(non-`center`) layout — `center` keeps the empty regions because they balance
the centre:

```css
nuri-topbar:not([data-center])[data-leading="empty"]  .nuri-topbar__start { display: none; }
nuri-topbar:not([data-center])[data-trailing="empty"] .nuri-topbar__end   { display: none; }
```

**RN parity note.** The RN Topbar must mirror this — don't render an empty side
`View` in the non-center layout, or the row's `gap` re-introduces the phantom
inset. Verified across all 12 topbar doc demos: empty sides collapse in
non-center bars; all 3 center-mode bars keep their regions; filled regions never
collapse.

**Operator signed off (2026-06-01)** on the Topbar empty-side-region collapse (no phantom gap).

## 47. TypographyStack family · contextual text-hierarchy primitive · level carried by the element · N+6.7

> **⚠ Partially superseded by [decision 53](#53-typographystack--element-eliminated--muted-on-typography--n82) (N+8.2).**
> The `<nuri-typography-stack>` rhythm container, its empty-`@layer
> tokens` skip-emit posture, and the column-`2xs` / row-`xs` owned gap
> (sections (a) · (c) · the inter-level rhythm values) all **stand**.
> What is **superseded**: the second element
> `<nuri-typography-stack-element>` and its `level` 1..5 sub-scale
> (sections (b) · (d)'s framing · the `data-level` colour dispatch · the
> `TYPOGRAPHY_STACK_LEVELS` RN record). Decision 53 eliminates the
> `-element` — the container now wraps plain `<nuri-typography>` lines
> whose `size` / `emphasis` / new `muted` prop carry what `level`
> resolved, and the 5-level table is **dropped** (a replacement guidance
> table was reviewed and deliberately not shipped — invented advice ·
> deferred until the type-scale principles land). Read the body below as
> the original N+6.7 rationale; read decision 53 for the current shape.

**TypographyStack is a layout primitive that owns the vertical (and
horizontal) rhythm between stacked typographic lines.** It ships as a
two-element light-DOM compound — a flex container plus a styled line —
where each line declares a **contextual `level` (1..5)**, not an
absolute size. The level maps to an existing `.nuri-type-*` utility
class (size + emphasis) and dispatches a chrome text colour off
`data-level`. No new tokens. `<nuri-typography>` is untouched.

### What

```html
<nuri-typography-stack>
  <nuri-typography-stack-element level="1">Coffee — Blue Bottle</nuri-typography-stack-element>
  <nuri-typography-stack-element level="5">Yesterday · 4:32 PM</nuri-typography-stack-element>
</nuri-typography-stack>
```

- `<nuri-typography-stack>` is the flex host: `flex-direction: column`
  with `gap: var(--nuri-space-2xs)` by default; `[direction="row"]`
  flips to `flex-direction: row; align-items: baseline; gap:
  var(--nuri-space-xs)`.
- `<nuri-typography-stack-element level="1..5">` is the styled text
  line. `#sync()` resolves `level` → the `.nuri-type-*` utility class
  (the size + emphasis SSOT in `styles/typography.css`) and sets
  `data-level` so `typography-stack.css` can dispatch the colour.

The level table (carried verbatim in the component CSS variant
manifest, the JS `LEVELS` map, the docs token-map, and the RN
`TYPOGRAPHY_STACK_LEVELS` record):

| level | utility class       | size | emphasis | colour                  |
| ----- | ------------------- | ---- | -------- | ----------------------- |
| 1     | `nuri-type-lg--em`  | lg   | 600      | `--nuri-text-primary`   |
| 2     | `nuri-type-md--em`  | md   | 600      | `--nuri-text-primary`   |
| 3     | `nuri-type-sm--em`  | sm   | 600      | `--nuri-text-primary`   |
| 4     | `nuri-type-sm`      | sm   | 400      | `--nuri-text-primary`   |
| 5     | `nuri-type-sm`      | sm   | 400      | `--nuri-text-muted`     |

Unknown / missing `level` warns and falls back to level 4 (the plain
`sm` primary line), mirroring `<nuri-typography>`'s unknown-size warn.

### (a) Why a new primitive and not reuse `<nuri-stack>`

`<nuri-stack>` is a *generic* flex/gap primitive — it knows nothing
about typographic rhythm. The space between a title and its caption is
not the same authoring decision as the space between two cards: it is
**inter-level text rhythm**, a property of the type system, and it
belongs to a primitive that owns that vocabulary. Folding it into
`<nuri-stack>` would either (i) force every caller to re-derive the
correct gap by hand (drift surface), or (ii) teach the generic stack
about type levels (use-case knowledge it has no business holding —
the speculative-generality refusal of
[decision 30](#30-primitive-parsimony--no-speculative-additions--n571)
/ P11). A dedicated primitive keeps the rhythm in one place and keeps
`<nuri-stack>` generic. This mirrors
[decision 37](#37-layout-primitives-consume-semantic-vocabulary-via-prop--no-component-token-aliasing--n62):
a layout primitive with an empty `@layer tokens` — the pipeline
walker visits `typography-stack` in the `COMPONENTS` registry, detects
the empty block, and **skips** writing `build/components/typography-stack.ts`.

### (b) Why `level` lives on `-element`, not on Typography

`<nuri-typography>`'s `size` prop is an **absolute** scale token
(xs..xl) — a global, context-free choice. A stack `level` is
**contextual**: "the most prominent line in *this* stack", which the
stack then renders at a concrete size. Putting `level` on Typography
would (i) collide conceptually with `size` (two competing scales on
one element), and (ii) leak the stack's contextual hierarchy into a
context-free primitive. Carrying it on a *stack-scoped* element keeps
the two scales orthogonal and confines the contextual vocabulary to
where it has meaning. This is the same compound-of-composed-children
shape as
[decision 43](#43-tabs--first-multi-element-compound--first-box-composition-consumer--n65)
(Tabs) and
[decision 46](#46-compositional-chrome-shell-via-named-light-dom-wrappers--n66)
(Topbar) — light-DOM, no Shadow DOM, no `<slot>`, single IIFE
defining both elements.

### (c) Zero new tokens

Sizes/emphasis reuse the `.nuri-type-*` utilities (SSOT
`styles/typography.css`); colour reuses the two chrome text tokens
`--nuri-text-primary` / `--nuri-text-muted`; rhythm reuses the
existing spacing primitives (`--nuri-space-2xs` / `--nuri-space-xs`).
Empty `@layer tokens` → no `--nuri-typography-stack-*` namespace, no
`build/components/typography-stack.ts`.

### (d) Typography untouched

No `level`, no `tone`, no new prop on `<nuri-typography>`. The stack
*composes* the existing utility classes rather than extending the
primitive — the line element sets `className` directly, so the type
SSOT stays the single owner of size + emphasis.

### Attribute-dispatch · colour computed in CSS, never JS

Per [decision 42](#42-box-gains-background--radius-props--attribute-dispatch-surface-vocabulary--evidence-gated-promotion--n65),
`#sync()` reports *state* (`data-level`) and CSS owns *appearance*
(the per-level colour). JS never reads or writes a colour value.

### RN parity (RISKS R1)

The primitive `type` set is **pipelineInline**
([decision 34](#34-per-component-files--tokenpath-union--set-policy--pipeline-emit-shape--n603)) — no
runtime namespace in `tokens.ts` — so RN cannot dereference font
sizes/weights from tokens. They are hand-declared once in
`TYPOGRAPHY_STACK_LEVELS` (px equivalents sourced from the
`--nuri-type-*` primitives: lg=22 / md=17 / sm=15; em=600 / regular
400; line-heights 1.27 / 1.29 / 1.33), while **colour** resolves from
the runtime `chrome[theme]` slice exactly as the web `data-level`
dispatch does. One declared mapping, read identically both sides.
`tsc` → exit 0.

### Anti-scope (locked this session)

- **No `--nuri-typography-stack-*` tokens.** Layout primitive · empty
  `@layer tokens` · no `build/components/typography-stack.ts`.
- **No `gap` prop on the stack.** Rhythm is owned by the primitive,
  not authored per-instance.
- **No Shadow DOM / no `<slot>`.** Light-DOM only; the host *is* the
  styled text node (no inner span), like `<nuri-typography>`.
- **`<nuri-typography>` untouched.** No `level`, no `tone`.
- **No List / ListItem / Separator.** Those compose this primitive in
  a future session; building them now would be speculative.

### Inter-level rhythm values · operator-confirmed (N+6.7 close)

The two inter-level rhythm values — **column `2xs`**, **row `xs`** —
were surfaced as proposals at close (the *mechanism* — gap on the host,
flippable by `direction` — was always locked; only the exact spacing
tokens were the operator's authoring judgement). **Operator signed off
on `2xs` / `xs` as shipped (2026-05-29)**; the values are now locked
alongside the mechanism.

### Relationship to other decisions

- [Decision 43](#43-tabs--first-multi-element-compound--first-box-composition-consumer--n65)
  / [Decision 46](#46-compositional-chrome-shell-via-named-light-dom-wrappers--n66)
  · same light-DOM single-IIFE multi-element compound mechanism.
- [Decision 37](#37-layout-primitives-consume-semantic-vocabulary-via-prop--no-component-token-aliasing--n62)
  · layout primitive · empty `@layer tokens` · pipeline skips emit.
- [Decision 42](#42-box-gains-background--radius-props--attribute-dispatch-surface-vocabulary--evidence-gated-promotion--n65)
  · attribute-dispatch — JS sets `data-level`, CSS owns colour.
- [Decision 33](#33-semantic-token-docs--format-b-verbose-dual-mode-for-context-dependent-tokens--n601)
  · verbose Format B header comments on the new CSS/JS.
- [Decision 30](#30-primitive-parsimony--no-speculative-additions--n571)
  / P11 · zero new tokens, no `gap` prop, no List family — the
  no-speculative-additions refusal in component-API form.
- See [`roadmap/N+6.7.md`](./roadmap/N+6.7.md) for the source session.

## 48. Typed build/icons.ts emit · SvgXml over the shared registry · one registry, two readers · N+6.8

**The RN side reads icons from the same registry the web inlines —
emitted once as a typed `build/icons.ts` and rendered through
`react-native-svg`'s `SvgXml` over the verbatim path string.** This
closes `F-ICON-RN-1` (open + deliberately deferred across N+6.4–N+6.7)
and backs IconButton's honest `<View>` stub with a real glyph. The
proof is **type-only** — this is a spec repo with no RN runtime,
bundler, or Expo; `tsc` exit 0 is the deliverable. **Operator signed
off on the closure of F-ICON-RN-1 (2026-05-29).**

### What

```ts
// build/icons.ts — GENERATED · DO NOT EDIT
export type IconName = 'vault' | 'coin-vertical' | … ;   // all 17 keys
export type IconWeight = 'regular' | 'bold' | 'fill';
export const icons: Record<IconName, Record<IconWeight, string>> = { … };
```

- The pipeline emits `build/icons.ts` from
  [`lib/components/icon/icons.js`](./lib/components/icon/icons.js) —
  the single source of truth ·
  [decision 38](#38-icon-component--phosphor-source--nuri-icon-name-nuri-facade--2-size--fill--registry-based-js-dispatch--n63).
  Emitter at [`pipeline/parsers/icons.js`](./pipeline/parsers/icons.js),
  wired into the orchestrator as Slice 5. Path strings are
  `JSON.stringify`-encoded (any quote/escape round-trips) and weights
  emit in a fixed order (`regular · bold · fill`) so the emit is
  byte-stable.
- The RN `Icon` ([`docs/migration-tests/button-matrix/index.tsx`](./docs/migration-tests/button-matrix/index.tsx))
  re-wraps `icons[name][weight]` in the phosphor
  `<svg viewBox="0 0 256 256" fill="currentColor">` shell — the same
  shell `icon.js` builds — and feeds it to `SvgXml`. `currentColor`
  resolves to the `color` prop (SvgXml's currentColor channel),
  defaulting to ambient `chrome[theme].textPrimary`. Box dims mirror
  `icon.css`: md → `size.sm` (28) · sm → `size.xs` (18).
- Weight coupling is **not a prop** — identical to `icon.js`:
  `fill ? 'fill' : size === 'sm' ? 'bold' : 'regular'`.
- IconButton **composes** `Icon` in place of the `View` stub (md-locked
  → regular weight; `fill` selects the filled weight · amendment 40.1
  now live). The RN analogue of the web funnel where
  `<nuri-icon-button>` wraps `<nuri-icon>`.

### (a) Why a typed emit and not inline-on-RN like the web

The web inlines `icons.js` directly (zero-build). RN has no equivalent
zero-build inline and benefits from a **typed** `IconName` union so a
bad key is a compile error, not a runtime warn. Emitting the registry
once as `build/icons.ts` gives the RN runtime a typed reader while
keeping `icons.js` the SSOT. **One registry, two readers** (web inline
+ RN `SvgXml`). A drift guard in
[`pipeline/tokens-parser.test.js`](./pipeline/tokens-parser.test.js)
asserts the on-disk emit equals `emitIconsTs(ICONS)` byte-for-byte and
that every `[name][weight]` path equals `icons.js`.

### (b) Why SvgXml over the path string, not SVGR / per-glyph codegen

SVGR (or hand-authored per-glyph `<Path>` components) would fork the
glyph source into a **second hand-maintained shape**, breaking the
single-registry invariant decision 38 rests on. Feeding the registry's
verbatim SVG string to `SvgXml` keeps exactly one authored copy of each
path. The icons are a closed enum of named SVG assets the CSS cascade
can't express — a verbatim typed mirror is the right emit, not a token
classifier.

### (c) Why no react-native-svg dependency

This is a spec repo with no RN build. Adding `react-native-svg` as a
real dependency would pull an RN runtime into a doc-first project for
no rendering payoff. Instead a **local type shim**
([`react-native-svg.d.ts`](./docs/migration-tests/button-matrix/react-native-svg.d.ts))
declares only the `SvgXml` surface the Icon consumes (`xml`, `width`,
`height`, `color`). The migration test proves the **prop contract**
typechecks against the shared registry; it never renders. When a real
RN build lands, delete the shim and add the package — the Icon is
written against that exact prop surface, so the swap is mechanical.

### Anti-scope (locked this session)

- **No new glyphs.** Stays 17 names × 3 weights — no speculative
  registry growth ([decision 30](#30-primitive-parsimony--no-speculative-additions--n571) / P11).
- **`icons.js` untouched.** It stays the SSOT; the emit is a verbatim
  typed mirror, never a second editable copy.
- **Web `<nuri-icon>` untouched.** No behavioural change on the web side.
- **No expanded prop surface.** RN `Icon` / `IconButton` stay 1:1 with
  the web elements.
- **No partial renderer.** The renderer consumes real path strings or
  it doesn't ship (the four prior sessions kept an honest stub rather
  than fake a glyph).

### Relationship to other decisions

- [Decision 38](#38-icon-component--phosphor-source--nuri-icon-name-nuri-facade--2-size--fill--registry-based-js-dispatch--n63)
  · the single-registry invariant + weight coupling this emit mirrors.
- [Decision 40](#40-iconbutton-is-single-size-locked--md48px--n64)
  / [amendment 40.1](#401-amendment--n66--fill-weight-passthrough)
  · IconButton md-lock + the now-live `fill` passthrough.
- [Decision 35](#35-pipeline-sources-vs-build-outputs-physically-separated--pipeline-source-build-generated-only--n604)
  · `build/icons.ts` is generated, never hand-edited.
- [Decision 34](#34-per-component-files--tokenpath-union--set-policy--pipeline-emit-shape--n603)
  · the per-emit shape this slice extends (icons are NOT a token
  classifier — a verbatim typed mirror).
- Closes `F-ICON-RN-1` in [`docs/RISKS.md`](./docs/RISKS.md) R1 and
  [`docs/migration-tests/button-matrix/FRICTIONS.md`](./docs/migration-tests/button-matrix/FRICTIONS.md).
- See [`roadmap/N+6.8.md`](./roadmap/N+6.8.md) for the source session.

## 49. Separator · standalone generic 1px display primitive · author-placed · horizontal-only · N+6.9

**A separator is a generic, prop-free 1px hairline the author drops
between content blocks — NOT a Stack `divider` prop.** It is the
thinnest display primitive: one line, one colour, no rhythm of its
own. This ships the first List-family building block and **closes the
long-deferred Stack-`divider` open question** by reframing it: a
divider is just a Separator an author places between rows, so neither
a `<nuri-divider>` component nor a Stack `divider` boolean is needed.
**Operator signed off (2026-05-29).**

### What

```css
/* separator.css — @layer rules · paints the host directly */
nuri-separator, nuri-separator:not(:defined) {
  display: block; block-size: 1px; inline-size: 100%;
  background: var(--nuri-border-subtle); border: 0;
}
```

- `<nuri-separator>` takes **no props**. The host element *is* the
  visible line (unlike Stack/Box, whose `display:contents` host wraps
  an inner element) — there is no inner node and nothing to upgrade,
  so the skeleton and the defined element render identically (no FOUC
  delta). [`separator.css`](./lib/components/separator/separator.css) ·
  [`separator.js`](./lib/components/separator/separator.js).
- It consumes the semantic `--nuri-border-subtle` token **directly**
  in `@layer rules` — no `@layer tokens` block, no component-token
  alias (a `--nuri-separator-color` would be useless indirection ·
  the [decision 37](#37-layout-primitives-consume-semantic-vocabulary-via-prop--no-component-token-aliasing--n62)
  family). The colour re-resolves per theme automatically.
- **Skip-emit**: the empty `@layer tokens` makes the per-component
  pipeline emitter a graceful no-op — no `build/components/separator.ts`
  ships ([decision 37](#37-layout-primitives-consume-semantic-vocabulary-via-prop--no-component-token-aliasing--n62)
  · the layout/display-primitive skip path).
- Behaviour-free JS: the only job is semantics — the host is exposed
  as `role="separator"` + `aria-orientation="horizontal"` (the ARIA
  analogue of `<hr>`). The RN side is a 1px `<View>` stretched on the
  cross axis, filled with `chrome[theme].borderSubtle`.

### (a) Why a standalone Separator and not a Stack `divider` prop

The external-project Stack spec carries a `divider: boolean`. Shipping
it as a Stack prop would mean Stack reaching into its own children to
interleave rules (JS child-wrapping on web + a render-map on RN) —
hidden complexity inside a pure layout primitive. A standalone
Separator the author places explicitly keeps Stack pure, makes the
divider a visible, inspectable node, and lets the same hairline serve
non-Stack contexts (section breaks, list rows). The `divider` prop is
**retired, not deferred** — Separator subsumes it.

### (b) Why horizontal-only and prop-free

Parsimony (P11 · [decision 30](#30-primitive-parsimony--no-speculative-additions--n571)).
A vertical hairline changes `block-size`→`inline-size`, the
`aria-orientation` value, and the stretch behaviour — a real future
need, but one to design against a real row-layout consumer rather than
speculatively. Thickness / variant / inset / margin are likewise out:
vertical rhythm around the rule is the surrounding Stack `gap`'s job,
not the Separator's.

### Anti-scope (locked this session)

- **No orientation / vertical** — horizontal only.
- **No thickness / variant / inset / margin props** — fixed 1px, no
  rhythm of its own.
- **Not a Stack or List prop** — author-placed standalone element.
- **No new tokens** — consumes `--nuri-border-subtle` directly.
- **No per-component emit** — skip-emit, no `build/components/` file.

### Relationship to other decisions

- [Decision 37](#37-layout-primitives-consume-semantic-vocabulary-via-prop--no-component-token-aliasing--n62)
  · the skip-emit + direct-semantic-consumption pattern Separator follows.
- [Decision 42](#42-box-gains-background--radius-props--surface-primitive--n65)
  / [decision 43](#43-tabs-compound--container-tokens-emit-option-tokens-web-only--n65)
  · the "consume semantic vocabulary directly in `@layer rules`"
  precedent (Tabs).
- Closes the **Stack-`divider` open question** in
  [`roadmap/index.md`](./roadmap/index.md) and supersedes the deferred
  `<nuri-divider>` roadmap item on the Stack page.
- First of the List-family building blocks (batch 1) · see
  [`roadmap/N+6.9.md`](./roadmap/N+6.9.md).

### 49.1 amendment · N+8.1

**Separator gains ONE prop — `y-space`** (the vertical breathing room
above and below the line, over the semantic space scale · default `sm` ·
accepts `none` for a flush hairline). The N+6.9 anti-scope said "no
margin (vertical rhythm is the author's job, via the surrounding Stack
`gap`)". That held while a Separator only ever sat inside a Stack that
owned the rhythm. The List family broke that premise: `<nuri-list>` is
gap-free ([decision 51](#51-list--listitem--family-capstone--one-row-shape-slots-not-use-case-variants--density-owns-row-rhythm--interactive-press-overlay--skip-emit--n7)(b))
so there is **no container gap** to supply inter-row rhythm — the divider
itself must carry it. (The N+8 close briefly added a List `gap` instead;
N+8.1 removed it as a decision-51 contradiction and moved the spacing
here · [decision 52(b.1)](#52-list-family-refactor--primitiveinteractiverecipe-split--wrap-not-overlay-a11y-fix--emit-fixed-values--first-recipe-nav-item--n8).)

`y-space` is a **`margin-block`**, NOT a thicker fill: the visible
hairline stays exactly **1px** at every value — only the surrounding
margin changes. It is **prop-driven** (attribute-selector dispatch over
`--nuri-space-*`, like Stack `gap` · [decision 37](#37-layout-primitives-consume-semantic-vocabulary-via-prop--no-component-token-aliasing--n62)),
so Separator **stays skip-emit** — the prop value IS the space leaf the
attribute selects, with no fixed mapping to emit (contrast the List
family's EMIT for its baked-in values · [decision 52(c)](#52-list-family-refactor--primitiveinteractiverecipe-split--wrap-not-overlay-a11y-fix--emit-fixed-values--first-recipe-nav-item--n8)).
RN mirrors it with `marginVertical: space[yspace]`. Still horizontal-only;
still no thickness / variant / inset / orientation. The semantic space
scale also gains a **`--nuri-space-none` (= 0)** leaf this session for the
`y-space="none"` flush case.

## 50. IconAvatar · static decorative twin of IconButton · composes Icon directly · skip-emit · `Avatar` name reserved · N+6.9

**An IconAvatar is an icon on a coloured circle with ALL interaction
stripped — the static, decorative twin of IconButton.** It is the
**second direct `<nuri-icon>` consumer** (after IconButton), now
allowed outside IconButton because N+6.8 closed `F-ICON-RN-1`
([decision 48](#48-typed-buildiconsts-emit--svgxml-over-the-shared-registry--one-registry-two-readers--n68)).
It shares IconButton's variant→surface matrix but is decorative:
`aria-hidden`, not focusable, no role, no accessible name.
**Operator signed off (2026-05-29), incl. the avatar-only `subtle`
variant and the 48px (`size-lg`) lock mirroring IconButton.**

### What

```css
/* icon-avatar.css — @layer rules · direct semantic surfaces, no tokens */
.nuri-icon-avatar {
  inline-size: var(--nuri-size-lg); block-size: var(--nuri-size-lg);
  border-radius: var(--nuri-radius-full); /* 48px circle · same as IconButton */
}
.nuri-icon-avatar--solid  { background: var(--nuri-accent-solid); color: var(--nuri-accent-on-solid); }
.nuri-icon-avatar--soft   { background: var(--nuri-bg-strong);    color: var(--nuri-text-primary); }
.nuri-icon-avatar--ghost  { background: transparent;             color: var(--nuri-text-primary); }
.nuri-icon-avatar--subtle { background: transparent;             color: var(--nuri-border-strong); } /* avatar-only */
```

- Props mirror IconButton with **one avatar-only addition**: `name`
  (required · `IconName`), `variant?` (solid|soft|ghost — shared with
  IconButton — **plus `subtle`** · default soft), `accent?` (Tier 2
  self-scope), `fill?`. **No** `disabled` / `label` / `onPress` /
  `size`. `subtle` is the lone variant with no IconButton counterpart:
  like `ghost` (transparent) but the glyph reads in `--nuri-border-strong`
  for the lowest-emphasis decorative treatment — an *actionable* control
  never wants a near-invisible glyph, so it stays avatar-only. [`icon-avatar.css`](./lib/components/icon-avatar/icon-avatar.css)
  · [`icon-avatar.js`](./lib/components/icon-avatar/icon-avatar.js).
- It consumes the **same semantic surfaces IconButton uses** (rest
  state only) **directly** in `@layer rules` — the
  [decision 42](#42-box-gains-background--radius-props--surface-primitive--n65)
  /[43](#43-tabs-compound--container-tokens-emit-option-tokens-web-only--n65)
  (Tabs) precedent — **not** via component-token aliasing. There is no
  `@layer tokens` block: it **must not** duplicate `icon-button.ts`.
  **Skip-emit** · no `build/components/icon-avatar.ts` ships.
- **Single-size-locked** `--nuri-size-lg` (48px), like IconButton's
  size-lock ([decision 40](#40-iconbutton-is-single-size-locked--md48px--n64)).
  IconAvatar is IconButton's **exact static twin**, so it mirrors that
  geometry leaf-for-leaf — the same `size-lg` (48px) container and the
  same `<nuri-icon size="md">` (28px regular) glyph for a ~10px optical
  ring. No new token (P11 · reuses IconButton's leaves). Only the
  interaction differs.
- The host is `aria-hidden="true"`, not focusable, no `role`. The RN
  side is a circular `<View>` (`accessibilityElementsHidden` +
  `importantForAccessibility="no-hide-descendants"`) that **composes
  the real RN `Icon`** and **reuses the `iconButtonBg`/`iconButtonFg`
  funnel** at rest for the shared solid/soft/ghost variants — proving
  "same resolveToken surface" literally, so the shared matrix can never
  drift between the two. `subtle` is the one variant special-cased
  outside the funnel (transparent bg · `chrome.borderStrong` fg)
  because it has no IconButton counterpart to share.

### (a) Why a separate component and not an IconButton variant

IconButton is a control: it owns press feedback, focus ring, disabled,
and — critically — `F-ARIA-LABEL-1` (an icon-only control *requires*
an accessible name). An avatar is **decorative**: it conveys nothing
the adjacent text doesn't, so it must be hidden from AT, carry no
label, and never take focus. Folding decoration into the control would
force every avatar to invent a fake label and a fake interaction
surface. Splitting them keeps each honest — and makes IconAvatar the
rare near-zero-delta component (it inherits *none* of IconButton's
behavioural frictions).

### (b) Why it composes Icon directly (and why that's newly allowed)

Through N+6.7, IconButton was the **only** sanctioned `<nuri-icon>`
consumer because the RN glyph renderer was an open risk
(`F-ICON-RN-1`). N+6.8 closed it
([decision 48](#48-typed-buildiconsts-emit--svgxml-over-the-shared-registry--one-registry-two-readers--n68)):
there is now a typed `build/icons.ts` + `SvgXml` reader. IconAvatar is
the **first NEW consumer to ship against the resolved Icon**, with no
shim — the practical proof that the closure unblocked the Icon family.

### (c) Why the bare `Avatar` name stays reserved

`IconAvatar` is the icon-only leaf. A future polymorphic
`<nuri-avatar>` that also renders a **photo or initials** is a real
eventual need — but speculative now (P11 · no image/initials consumer
exists). Reserving the bare `Avatar` name keeps the door open without
building the door: IconAvatar does not pre-empt it.

### Anti-scope (locked this session)

- **No interactivity** — no press / disabled / focus / onPress.
- **No `label`** — decorative, `aria-hidden`, no `F-ARIA-LABEL-1` burden.
- **No `size` prop** — single-locked 48px (same as IconButton).
- **No new tokens** — reuses size-lg / radius-full / the accent+chrome
  surfaces IconButton already consumes.
- **No per-component emit** — must NOT duplicate `icon-button.ts`; skip-emit.
- **No generic/polymorphic Avatar** — image/initials deferred; the
  `Avatar` name stays reserved.
- **`icons.js`, web `<nuri-icon>`, and IconButton untouched.**

### Relationship to other decisions

- [Decision 40](#40-iconbutton-is-single-size-locked--md48px--n64)
  · the single-size-lock pattern + the variant→surface matrix
  IconAvatar mirrors (rest state only).
- [Decision 39](#39-button-gains-a-ghost-variant--shared-cross-component-tertiary--n64)
  · the shared solid/soft/ghost vocabulary IconAvatar extends with its
  avatar-only `subtle`.
- [Decision 48](#48-typed-buildiconsts-emit--svgxml-over-the-shared-registry--one-registry-two-readers--n68)
  · closing `F-ICON-RN-1` is what unblocks IconAvatar as a direct Icon
  consumer.
- [Decision 42](#42-box-gains-background--radius-props--surface-primitive--n65)
  / [43](#43-tabs-compound--container-tokens-emit-option-tokens-web-only--n65)
  · the consume-semantic-surfaces-directly (skip-emit) precedent.
- Second of the List-family building blocks (batch 1) · see
  [`roadmap/N+6.9.md`](./roadmap/N+6.9.md).

## 51. List + ListItem · family capstone · ONE row shape (slots, not use-case variants) · density owns row rhythm · interactive press overlay · skip-emit · N+7

**The List family is the capstone composition: `<nuri-list>` stacks
`<nuri-list-item>` rows, and the row is ONE shape —
`[leading?] · content · [trailing?]` — composed via slots, NOT a set of
use-case variants.** The mocks' disclosure rows, transaction rows, and
summary rows are the SAME element with different children dropped into
three positions. Both elements are **layout primitives** (empty
`@layer tokens` · skip-emit) that compose the batch-1 building blocks —
Separator ([decision 49](#49-separator--standalone-generic-1px-display-primitive--author-placed--horizontal-only--n69)),
IconAvatar ([decision 50](#50-iconavatar--static-decorative-twin-of-iconbutton--composes-icon-directly--skip-emit--avatar-name-reserved--n69)),
TypographyStack ([decision 47](#47-typographystack-family--contextual-text-hierarchy-primitive--level-carried-by-the-element--n67)),
Icon — **used as-is, none modified.** This closes the original
`TransactionList` / `InfoList` placeholders: there is no
use-case-variant component, only the one shape.

### What

```css
/* list.css — @layer rules · density projects row min-height onto the rows */
nuri-list { display: flex; flex-direction: column; } /* NO gap */
nuri-list[density="sm"] nuri-list-item { min-block-size: var(--nuri-size-xl);  } /* 60 */
nuri-list nuri-list-item,
nuri-list[density="md"] nuri-list-item { min-block-size: var(--nuri-size-2xl); } /* 72 · default */
nuri-list[density="lg"] nuri-list-item { min-block-size: var(--nuri-size-3xl); } /* 90 */

/* list-item.css — flex row · book-ends auto · middle flex:1 · press overlay */
nuri-list-item { position: relative; display: flex; align-items: center;
  gap: var(--nuri-space-md); padding-inline: var(--nuri-space-lg); padding-block: var(--nuri-space-md); }
nuri-list-item > :not(nuri-list-item-leading):not(nuri-list-item-trailing):not(.nuri-list-item__press) { flex: 1 1 auto; min-inline-size: 0; }
.nuri-list-item__press { position: absolute; inset: 0; z-index: 0; background: transparent; }
.nuri-list-item__press:active { background: var(--nuri-bg-pressed); }
.nuri-list-item__press:focus-visible { outline: 2px solid var(--nuri-focus-ring); outline-offset: -2px; }
nuri-list-item[interactive] > :not(.nuri-list-item__press) { position: relative; z-index: 1; pointer-events: none; }
```

- **List API** is one structural axis: `density?` (`sm`|`md`|`lg` ·
  default `md`), reflected as the `density` attribute by `list.js`.
  **No `gap` prop.** [`list.css`](./lib/components/list/list.css) ·
  [`list.js`](./lib/components/list/list.js).
- **ListItem API** is one boolean: `interactive?`. Plus two named
  light-DOM book-ends, `<nuri-list-item-leading>` /
  `<nuri-list-item-trailing>` (presence is the API · no props). Content
  is **everything else** — unwrapped, in document order, **NOT
  reparented**. [`list-item.css`](./lib/components/list-item/list-item.css)
  · [`list-item.js`](./lib/components/list-item/list-item.js).
- Both consume the semantic vocabulary (`size-*`, `space-*`,
  `bg-pressed`, `focus-ring`) **directly** in `@layer rules` — the
  [decision 37](#37-layout-primitives-consume-semantic-vocabulary-via-prop--no-component-token-aliasing--n62)
  / 47 / 49 / 50 precedent. **No `@layer tokens` · skip-emit** · no
  `build/components/{list,list-item}.ts` ships (test count stays 18, no
  new token).

### (a) Why density lives on the List, not the ListItem

Row height is a **container decision projected onto the rows**: the same
row markup must get a taller touch target inside a dense vs. roomy list.
So the density→min-height rule lives in `list.css` and targets
`nuri-list-item` via a **descendant selector**
(`nuri-list[density="lg"] nuri-list-item`). The RN analogue is a
`DensityContext` the List provides and each ListItem reads. A ListItem
outside a List still renders (default `md`), but density is the List's
to set.

### (b) Why NO `gap` prop on the List

Inter-row rhythm is **not** a container gutter — it is each row's own
`density`-driven min-height **plus** whatever `<nuri-separator>`s the
author drops between rows. A `gap` would double-space the separators and
fight the row min-height. This mirrors [decision 49](#49-separator--standalone-generic-1px-display-primitive--author-placed--horizontal-only--n69)
closing the Stack-`divider` question: a divider is a Separator the author
places, not a container prop. The density selector targeting
`nuri-list-item` **only** is what keeps author separators a crisp 1px
across every density.

### (c) Why ONE shape, not use-case variants

A `variant="transaction|faq|fee"` matrix would hard-code three layouts
that are really the same three-position row with different fills. The
slot composition makes the row open-ended (any leading, any trailing,
any content) at zero variant cost — the parsimony rule (P-variant). It
also means the row never needs to know what it contains, so the building
blocks stay decoupled.

### (d) The interactive press target — overlay, not native button

The row carries `role="listitem"` **always**. When `interactive`,
`list-item.js` appends an absolutely-positioned
`<div class="nuri-list-item__press" role="button" tabindex="0">` that
fills the row (`inset:0`) and **is** the press target — **NOT** a native
`<button>`, **NOT** an `<a href>`. It is **nav-agnostic**: it fires a
bubbling `click` (Enter on keydown, Space on keyup — the ARIA
button-activation contract a `<div>` doesn't get for free) and performs
no routing; wiring the press is the consumer's job.

This yields the required **dual role** (row = `listitem`, inner target =
`button`) with **no content reparenting**, and a **full-row pressed wash
without `:has()`**: the overlay sits at `z-index:0` while the in-flow
content is lifted to `z-index:1` + `pointer-events:none`, so (i) the
`:active` `bg-pressed` wash paints the **whole row behind** the content,
and (ii) taps anywhere pass **through** the decorative content down to
the overlay. The overlay is given an accessible name from the row's
visible text (a nameless `role="button"` is an AT defect · cf.
IconButton's `F-ARIA-LABEL-1`); the composed glyphs are already
`aria-hidden`, so the name resolves to the typographic lines.

`F-FOCUS-1`: the focus ring is **web-only** (mirrors Button's
`:focus-visible`; RN omits it). `F-LISTITEM-ROLE-1` (new): RN's
`AccessibilityRole` union has `list` (set on the container) but **no
`listitem`** peer — so the RN row gets no explicit role (membership
reads from the `list` container), and the web's dual-element overlay
collapses to a **single** `Pressable(accessibilityRole="button")` on RN
(one node can't be both `listitem` and `button` on the web, but RN has
no `listitem` role to conflict with). web↔RN parity is **behavioural**
(same press, same wash), not byte-identical structure (`RISKS R1`).

### Anti-scope (locked this session)

- **No use-case variants** — no `faq` / `transaction` / `fee` shapes;
  one slotted row.
- **No `gap` prop on List** — rhythm is row min-height + author
  Separators.
- **No `href` / native `<button>`** — the interactive target is a
  `role="button"` overlay, nav-agnostic.
- **No `disabled`** — interactivity is binary.
- **No `:hover`** — mobile-first, pressed-only (AGENTS.md hard-rule 8).
- **No new tokens** — reuses `size-{xl,2xl,3xl}` / `space-{lg,md}` /
  `bg-pressed` / `focus-ring`.
- **No per-component emit** — empty `@layer tokens`, skip-emit for both.
- **No "interactive control in a row"** — the settings-row-with-Switch
  pattern (a real control nested in an interactive row) is
  **cross-platform-gated** (the press overlay and a nested control's hit
  area conflict, and the web↔RN resolution differs) · **deferred**.
- **No polymorphic Avatar / exchange overlay.**
- **Separator / IconAvatar / TypographyStack / Icon untouched** —
  composed as-is.

### Relationship to other decisions

- [Decision 37](#37-layout-primitives-consume-the-semantic-scale-through-a-prop-no-component-token-aliasing--n62)
  / [47](#47-typographystack--two-element-light-dom-compound-for-stacked-text-lines--n67)
  / [49](#49-separator--standalone-generic-1px-display-primitive--author-placed--horizontal-only--n69)
  / [50](#50-iconavatar--static-decorative-twin-of-iconbutton--composes-icon-directly--skip-emit--avatar-name-reserved--n69)
  · the layout-primitive skip-emit lineage + the building blocks the row
  composes.
- [Decision 46](#46-topbar--compositional-chrome-shell-via-named-light-dom-region-wrappers--n66)
  · the named light-DOM region-wrapper pattern — but ListItem **does NOT
  reparent** (Topbar routes children into 3 regions; ListItem keeps
  document order).
- [Decision 39](#39-button-gains-a-ghost-variant--shared-cross-component-tertiary--n64)
  · the pressed-wash interaction vocabulary the overlay mirrors.
- Capstone of the List family · see [`roadmap/N+7.md`](./roadmap/N+7.md).
- **Superseded by [Decision 52](#52-list-family-refactor--primitiveinteractiverecipe-split--wrap-not-overlay-a11y-fix--emit-fixed-values--first-recipe-nav-item--n8)** — the press OVERLAY (d) and the
  copied-aria-label are replaced by a declarative WRAPPER; the
  skip-emit (both elements) flips to EMIT for the fixed style values.

## 52. List family REFACTOR · primitive/interactive/recipe split · WRAP-not-overlay a11y fix · EMIT fixed values · first recipe (nav-item) · N+8

**The List family splits along three axes this session: (1) interactivity
moves OUT of the `list-item` primitive into a declarative
`<nuri-list-interactive-item>` WRAPPER that wraps the row in a
`role="button"`; (2) the first RECIPE — `<nuri-nav-item>` — lands as a
named composition over those primitives; (3) the family's FIXED style
values flip from skip-emit to EMIT so web↔RN parity is machine-checked.**
This supersedes [decision 51](#51-list--listitem--family-capstone--one-row-shape-slots-not-use-case-variants--density-owns-row-rhythm--interactive-press-overlay--skip-emit--n7)'s
press overlay and its skip-emit posture.

### (a) The a11y fix is STRUCTURAL — WRAP, not overlay

Decision 51's interactive row was ONE element carrying both
`role="listitem"` and an inner absolutely-positioned
`role="button"` overlay, **and the overlay was given an accessible name
copied from the row's visible text**. Screen readers then announced the
name **twice** — once from the button's label, once from the content the
button contained. The N+8 fix is structural, not a patch:

```
<nuri-list-interactive-item onpress="…">   ← host · role="listitem"
  <div class="…__action" role="button" tabindex="0">  ← WRAPS the content
    <nuri-list-item role="presentation">    ← demoted · the content
      …leading · content · trailing…
    </nuri-list-item>
  </div>
</nuri-list-interactive-item>
```

The actionable element **wraps** the content, so **the content IS the
button's accessible name** — read once, no copied `aria-label`, no
double-read. The host is `listitem`; the inner row is demoted to
`role="presentation"` (one named button per row). Keyboard contract:
Enter on keydown, Space on keyup (the ARIA button-activation a `<div>`
doesn't get free). It is **nav-agnostic** — fires a bubbling `press`
CustomEvent and performs no routing. `:focus-visible` ring is **web-only**
(`F-FOCUS-1`); RN collapses to a single `Pressable(accessibilityRole=
"button")` wrapping the content (`F-LISTITEM-ROLE-1` · `RISKS R1`).

**`list-item` reverts to purely presentational** — `role="listitem"` and
nothing else: no `interactive` attr, no overlay, no keyboard handler, no
derived label. Interactivity is composed AROUND it, never baked in.

### (b) Full-bleed by COUNTER-MARGIN + NO inline padding (operator checkpoint · revised N+8.1)

The row's horizontal padding is **removed entirely**: `list-item` has
**no inline padding**, so content sits **flush with the full-width author
`<nuri-separator>`s** — the two align by construction. The horizontal
inset is the **container's** job (the screen / list wrapper supplies the
outer margin), not the row's. The docs demos correspondingly **drop the
`bg-subtle` card fill** — rows read on the plain surface, where the
content↔separator alignment is the visible structure. Only `padding-block`
(tall-content guard) and `gap` (inter-part gutter) remain as **row**
spacing; the **List itself is gap-free** (see (b.1) below).

The interactive press wash reaches the row edges by a **counter-margin**
on the action box: `margin-inline: calc(-1 * var(--nuri-space-md))` bleeds
the flat fill `space-md` past each edge into the container's own
horizontal padding, while an equal `padding-inline` re-insets the wrapped
content so it stays flush with the separators. (The original N+8 text
claimed nesting made the counter-bleed *unnecessary* and the x-fade
gradient faked the edge-dissolve; N+8.1 reverts to a **flat `bg-subtle`
wash + counter-margin** — see "Press wash" below. A flat
`backgroundColor` cannot render a gradient in core RN, so the gradient
broke the web↔RN parity R1 is built on.) The density selector
(`nuri-list nuri-list-item { min-block-size }`) still matches the nested
row unchanged.

### (b.1) List is gap-free — inter-row spacing lives on the Separator (N+8.1)

The N+8 close added a fixed `gap: var(--nuri-space-xs)` to `<nuri-list>`
"so the rows breathe." That **contradicted [decision 51](#51-list--listitem--family-capstone--one-row-shape-slots-not-use-case-variants--density-owns-row-rhythm--interactive-press-overlay--skip-emit--n7)(b)**
("Why NO `gap` prop on the List" — a gap double-spaces the separators and
fights the row min-height). **N+8.1 removes the List `gap`**: decision 51
holds, `<nuri-list>` is a plain flex column with no gutter. Inter-row
breathing room moves onto the Separator as a tunable **`y-space`** margin
(default `sm`), the natural home — a divider IS a Separator the author
places ([decision 49](#49-separator--standalone-generic-1px-display-primitive--author-placed--horizontal-only--n69)),
so its own spacing is the divider's rhythm. Separator-less lists stay
flush (min-height only) — deliberate, not a bug. See
[amendment 49.1](#491-amendment--n81).

### (c) EMIT, not skip-emit — fixed values become component tokens

Decision 51 made both elements skip-emit (empty `@layer tokens`). N+8
flips the **fixed, baked-in** style values to EMIT, because a fixed
value the consumer cannot reparametrize is exactly what can silently
drift between web and RN:

| component | emitted tokens | semantic |
|-----------|----------------|----------|
| `list` | `densitySmMinHeight` / `densityMdMinHeight` / `densityLgMinHeight` | `size.{xl,2xl,3xl}` (no `gap` · revised N+8.1) |
| `list-item` | `paddingBlock` · `gap` | `space.md` · `space.md` |
| `list-interactive-item` | `wash` · `washPressed` · `radius` | `transparent` · `chrome.bgSubtle` (flat · revised N+8.1) · `radius.lg` (revised N+8.1) |

RN dereferences each via `resolveToken` instead of hardcoding the leaf —
the same machine-checked contract Button / Switch / Tabs use. Contrast
the fully **prop-driven** layout primitives (Stack / Box ·
[decision 37](#37-layout-primitives-consume-semantic-vocabulary-via-prop--no-component-token-aliasing--n62))
which stay skip-emit: prop dispatch carries no fixed value to drift.
**The skip-emit-vs-EMIT line is therefore: does the element bake a fixed
style decision (EMIT) or merely dispatch a consumer-supplied one
(skip-emit)?**

### (d) The first RECIPE — `nav-item` — composition, not variant

`<nuri-nav-item onpress>Activate card</nuri-nav-item>` is the first
**recipe**: a named, opinionated composition over primitives, NOT a new
variant axis on an existing one. It expands to
`list-interactive-item ∘ list-item ∘ an auto-filled trailing
caret`, applies `.nuri-type-md--em` to the label (reusing the SSOT type
utility), and mutes the caret via a **trailing `color: var(--nuri-
border-strong)`** that `Icon` inherits through `currentColor` — so **no
`muted` prop is added to Icon** ([decision 38](#38-icon-component--phosphor-source--nuri-icon-name-nuri-facade--2-size--fill--registry-based-js-dispatch--n63) untouched).

**Recipes build their internal structure by cloning a native
`<template>`, NOT imperative `createElement` and NOT a JS template
library (no lit-html / JSX).** The element stays a thin upgrade over
real DOM; the structure is declarative markup. Recipes are
**skip-emit** — they introduce no new style decision (empty
`@layer tokens`), only a fixed arrangement of primitives that already
own their tokens. The host is `display: contents` so it vanishes from
layout and the a11y tree, leaving the composed `list-interactive-item`
to carry `role="listitem"`.

**Optional leading book-end (polish).** `nav-item` distributes its
authored children when composing: a `<nuri-list-item-leading>` child is
**hoisted into the composed `list-item`** (so `list-item` positions it as
the start book-end by element type · [decision 51](#51-list--listitem--family-capstone--one-row-shape-slots-not-use-case-variants--density-owns-row-rhythm--interactive-press-overlay--skip-emit--n7)),
while everything else moves into the `.nuri-type-md--em` label span. A
disclosure row can therefore carry a leading `icon-avatar` with **no new
CSS** — the recipe just routes children to the slot the primitive already
owns. RN mirrors this with a `leading?: ReactNode` prop on `NavItem`
forwarded to `InteractiveListItem`. The label-vs-leading split is by
element type, so the recipe never needs to enumerate child kinds.

### (e) Docs · section-per-recipe micro-pattern

List is promoted from a single page to a **section** in the shell nav
with sub-pages: **Base** (`pages/components/list-base.html` · the
container + presentational row + interactive wrapper) and **Navigation
Item** (`pages/components/list-nav-item.html` · the recipe). The retired
`list.html` is removed. The pattern: **a recipe gets its own docs
sub-page under the family section**, with a "Recipe, not variant"
rationale and the literal `<template>` expansion shown — so the
composition is legible, not magic.

### Anti-scope (locked this session)

- **No `activity-item`** — the second candidate recipe is **deferred** to
  a future session.
- **No `muted` prop on Icon** — caret muted via inherited `currentColor`.
- **No lit-html / JSX / imperative DOM** in recipes — native `<template>`.
- **No content `scale` on press** — the scale treatment was dropped at the
  checkpoint (see "Press wash" below); no `scale` attr/prop survives.
- **One new semantic token** — `space.none` (= 0 · revised N+8.1; the
  N+8 `chrome.bgSubtleXFade` gradient was reverted — see
  [amendment 52.1](#521-amendment--n81)). The press wash reuses the flat
  `chrome.bgSubtle`; the row otherwise reuses `space-md` / `radius.lg`
  (revised N+8.1) / `border-strong`.
- **No press overlay, no copied aria-label** — the WRAPPER replaces both.
- **No inline padding on the row** — content is edge-to-edge; the
  container owns the horizontal margin.
- **`list-interactive-item` / `list-item` / `list` are EMIT** — only the
  recipe (`nav-item`) and the bare layout primitives stay skip-emit.

### Press wash · resolved at checkpoint (scale dropped · x-fade plateau)

Two press treatments were trialled: **A** (wash only) and **B** (wash +
content `scale(0.97)`). The operator chose **wash only** and the **scale
experiment was removed entirely** — no `scale` attr (web) / prop (RN)
survives, and `pressScale` is no longer an emitted token.

The pressed wash is the flat **`chrome.bgSubtle`** semantic token (revised
N+8.1). The N+8 close trialled a `chrome.bgSubtleXFade` horizontal
gradient — `linear-gradient(to right, transparent, <bg-subtle>,
<bg-subtle>, transparent)`, a centred plateau dissolving at both edges —
as the press wash, so a full-bleed box could read as inset without a
counter-margin. That broke web↔RN parity (R1): a flat `backgroundColor`
cannot render a gradient in core RN, and it was the lone semantic token
whose RHS was a composite gradient rather than a single `var()`. **N+8.1
reverts it** to a flat `chrome.bgSubtle` fill made full-bleed by a
**counter-margin** on the action box (see (b)); the
`--nuri-bg-subtle-x-fade` token and the pipeline's composite-resolution
support are removed (no semantic token has a gradient RHS anymore). See
[amendment 52.1](#521-amendment--n81).

A separate **trailing right-pin** lands on `list-item`:
`nuri-list-item-trailing { margin-inline-start: auto }`. The content
column normally absorbs the slack (`flex:1`) and pushes trailing to the
end, but that selector only matches an ELEMENT content node — a **bare
text** content node is an anonymous flex item with no `flex:1`, so it
wouldn't push. `margin-inline-start:auto` pins the trailing book-end to
the row end in BOTH cases (a no-op when content already fills the row).

### Relationship to other decisions

- [Decision 51](#51-list--listitem--family-capstone--one-row-shape-slots-not-use-case-variants--density-owns-row-rhythm--interactive-press-overlay--skip-emit--n7)
  · the capstone this refactors — keeps the ONE-shape row and density
  axis, replaces the overlay with the wrapper and skip-emit with EMIT.
- [Decision 34](#34-per-component-files--tokenpath-union--set-policy--pipeline-emit-shape--n603)
  · the per-component emit shape the family now participates in.
- [Decision 37](#37-layout-primitives-consume-semantic-vocabulary-via-prop--no-component-token-aliasing--n62)
  · the skip-emit layout-primitive lineage the EMIT line is drawn
  against.
- [Decision 38](#38-icon-component--phosphor-source--nuri-icon-name-nuri-facade--2-size--fill--registry-based-js-dispatch--n63)
  · Icon stays unchanged — recipe mutes the caret via `currentColor`,
  no `muted` prop.
- First recipe of the system · see [`roadmap/N+8.md`](./roadmap/N+8.md).

### 52.1 amendment · N+8.1

Two N+8 over-reaches surfaced in review are reverted here; the
decision-52 body above is rewritten in place to match (sections (b),
(b.1), (c)'s EMIT table, the Anti-scope token line, and the Press-wash
section already reflect this amendment).

**(1) The press wash reverts from gradient to a flat fill.** The N+8
close trialled `--nuri-bg-subtle-x-fade` — a horizontal
`linear-gradient(to right, transparent, <bg-subtle>, <bg-subtle>,
transparent)` — as the press wash, so a full-bleed action box could read
as inset *without* a counter-margin. That broke web↔RN parity
([R1](./RISKS.md)): a flat RN `backgroundColor` cannot paint a gradient,
and it was the only semantic token whose RHS was a composite gradient
rather than a single `var()`. **N+8.1 reverts the wash to a flat
`chrome.bgSubtle`** made full-bleed by a **counter-margin** on the
`.nuri-list-interactive-item__action` box (`margin-inline: calc(-1 *
space-md)` + equal `padding-inline: space-md`, keeping content flush with
the full-width separators while the wash bleeds into the container's
padding · `border-radius: radius.lg`, raised from `radius.sm` at N+8.1).
The
`--nuri-bg-subtle-x-fade` token (light + dark) is deleted, and
`pipeline/parsers/semantic.js` drops its composite/embedded-`var()`
resolution support — **no semantic token carries a gradient RHS anymore**
(the parser chases a single `var()` chain and returns). The EMIT line is
now `washPressed = chrome.bgSubtle` (a flat `TokenPath`, not a gradient).

**(2) The List loses its `gap`; inter-row spacing moves to the
Separator.** The N+8 close added a fixed `--nuri-list-gap` (= `space.xs`)
to `<nuri-list>`, contradicting
[decision 51](#51-list--listitem--family-capstone--one-row-shape-slots-not-use-case-variants--density-owns-row-rhythm--interactive-press-overlay--skip-emit--n7)(b)'s
"no gap". N+8.1 removes it — `<nuri-list>` is back to a gap-free
`display: flex; flex-direction: column`, and the RN `List` drops `gap`.
Inter-row breathing room now lives on `<nuri-separator>` via its new
`y-space` prop ([amendment 49.1](#491-amendment--n81)), so an
author who wants spacing drops a Separator between rows and tunes it;
a separator-less list stays deliberately flush. The semantic space scale
gains a **`--nuri-space-none` (= 0)** leaf for `y-space="none"`. List
family `EMIT` no longer carries a `gap` row.

**Net SET_POLICY:** `list` / `list-item` / `list-interactive-item` stay
EMIT (now without `list.gap`); `separator` stays **skip-emit** (its
`y-space` is prop-driven · [decision 37](#37-layout-primitives-consume-semantic-vocabulary-via-prop--no-component-token-aliasing--n62)).
See [`roadmap/N+8.1.md`](./roadmap/N+8.1.md).

## 53. TypographyStack `-element` eliminated · `muted` on Typography · N+8.2

**This amends [decision 47](#47-typographystack-family--contextual-text-hierarchy-primitive--level-carried-by-the-element--n67): the second element
`<nuri-typography-stack-element>` and its `level` 1..5 sub-scale are
ELIMINATED.** **Operator signed off (2026-05-31), incl. deferring the
level guidance-table to the N+8.3 type-scale work rather than shipping it
as orphan advice.** `<nuri-typography-stack>` survives as the rhythm container,
but now wraps plain `<nuri-typography>` lines, which gain a `muted`
boolean prop for the supporting (ex-`level`-5) line. The 5-level scale
is **dropped** — and deliberately NOT replaced by a "guidance table"
(that doctrine is invented advice until the type-scale principles are
documented · P11 / [decision 30](#30-primitive-parsimony--no-speculative-additions--n571)), so it is deferred. This is a **STRUCTURAL**
cleanup — it does not change how type values reach RN (that
hand-declared-vs-pipelineInline gap is [decision 34](#34-per-component-files--tokenpath-union--set-policy--pipeline-emit-shape--n603)'s,
and its fix is the separate N+8.3 session · decision B).

### (a) Why eliminate the `-element`

Seen in use, `<nuri-typography-stack-element>` **collided** with
`<nuri-typography>` (two near-identical text elements, one with `size`,
one with `level`) and its `level` sub-scale added a layer of indirection
— an author had to learn a stack-private 1..5 scale that then resolved
back to the same `size` + `emphasis` + colour that `<nuri-typography>`
already expresses directly. Decision 47(b) defended `level`-on-`-element`
as keeping a *contextual* scale off the *absolute* `size` primitive; in
practice the contextual framing did not earn its second element. The
parsimony call (P11) flips: **one primitive with one type vocabulary**
beats a parallel element + sub-scale that mirror it.

### (b) What survives from decision 47

`<nuri-typography-stack>` is unchanged in shape: a single light-DOM flex
container, empty `@layer tokens`, **skip-emit** (no
`build/components/typography-stack.ts`), owning ONLY the inter-line
rhythm — column `space.2xs` / row `space.xs` gap, flipped by the static
`direction` attribute (decision 47's operator-confirmed values stand). It
is still a layout primitive ([decision 37](#37-layout-primitives-consume-semantic-vocabulary-via-prop--no-component-token-aliasing--n62))
and still its-reason-to-exist-vs-`<nuri-stack>` is the owned rhythm. What
changes is only its *children*: plain `<nuri-typography>` lines, not a
bespoke `-element`.

### (c) `muted` on `<nuri-typography>` — boolean, decision-42 dispatch

`<nuri-typography>` gains a third prop, `muted` (boolean), alongside
`size` + `emphasis`:

```html
<nuri-typography-stack>
  <nuri-typography size="lg" emphasis>Coffee Roasters</nuri-typography>
  <nuri-typography size="sm" muted>26 May · 4:32 PM</nuri-typography>
</nuri-typography-stack>
```

`muted` follows the [decision 42](#42-box-gains-background--radius-props--attribute-dispatch-surface-vocabulary--evidence-gated-promotion--n65)
attribute-dispatch pattern: `typography.js` reflects the boolean as
`data-muted` (JS reports *state*), `typography.css` owns the *colour*
(`nuri-typography[data-muted] { color: var(--nuri-text-muted) }`). Absent
→ `currentColor` (inherits the cascade primary); present → the chrome
`--nuri-text-muted` token, which re-resolves under a `[data-theme]`
scope so the supporting line shifts in dark exactly as the old
`data-level="5"` line did. Because `#sync()` rewrites `className`
wholesale for the size/emphasis utility, the muted state rides a separate
`data-muted` attribute, not a class.

**`muted` is a BOOLEAN, not a tone enum.** There is deliberately no
`tone="primary|muted|accent"` — that would be the P11 floodgate
[decision 38](#38-icon-component--phosphor-source--nuri-icon-name-nuri-facade--2-size--fill--registry-based-js-dispatch--n63)
refused for Icon (Icon has no tone; its caret mutes via inherited
`currentColor`). Typography earns a single muted boolean because the
supporting-line tone is a real, recurring, two-state need; it does not
earn a colour enum until a second tone has a real consumer.

### (d) The 5-level scale is DROPPED — guidance deferred, not shipped

The decision-47 level table is **removed**, and — after operator review
at the N+8.2 visual checkpoint (2026-05-31) — was **not** replaced by a
"guidance table" on
[`pages/components/typography-stack.html`](./pages/components/typography-stack.html).
The originally-drafted table (1 → `lg` em · 2 → `md` em · 3 → `sm` em ·
4 → `sm` · 5 → `sm muted`, each with a "Tone" + "Use for" column) was
**invented advice** — a size/emphasis/muted-per-step doctrine with no
shipped consumer behind it — exactly the speculative documentation P11
([decision 30](#30-primitive-parsimony--no-speculative-additions--n571))
says to defer. The honest posture: the stack imposes no scale; the author
composes `size` + `emphasis` + `muted` per line directly. A formal
hierarchy doctrine is **deferred until the type-scale principles are
documented** — at which point a guidance table can land grounded in real
principles rather than guesswork. The page's §5 "Hierarchy guidance"
section is gone; the only trace is a one-line "deliberately not shipped"
note. No `level` attribute, no `LEVELS` JS map, no `data-level` CSS
dispatch, no `TYPOGRAPHY_STACK_LEVELS` RN record exist anymore.

### (e) RN parity (RISKS R1) — structural only

RN mirrors the web 1:1: `TypographyStackElement` +
`TYPOGRAPHY_STACK_LEVELS` are removed; an RN `Typography`
(`size` / `emphasis` / `muted`) lands, `TypographyStack` wraps
`Typography` children, and `NavItem` composes `Typography`. Type metrics
stay **hand-declared** (`TYPOGRAPHY_SIZES` px map — xs 13 · sm 15 · md 17
· lg 22 · xl 30 · 3xl 57; em 600 / regular 400) because the primitive
`type` set is **pipelineInline** ([decision 34](#34-per-component-files--tokenpath-union--set-policy--pipeline-emit-shape--n603)),
so it has no `tokens.ts` namespace to dereference. Colour resolves from
the runtime `chrome[theme]` slice (`muted` → `textMuted`, else
`textPrimary` — RN has no `currentColor`, so the web default maps to
`textPrimary`). **This session does NOT emit the type set** — reversing
the pipelineInline posture is the separate **N+8.3** session (decision B);
decision 53 is structural only.

### (f) Components compose Typography, not the raw utility

`nav-item`'s recipe label flips from the raw `.nuri-type-md--em` utility
class to a composed `<nuri-typography size="md" emphasis>`. The principle
— *components compose the Typography primitive, not the utility class
directly* — is now consistent across the system and sets up N+8.3
cleanly. (The label keeps a `nuri-nav-item__label` class purely as the
compose-time `querySelector` hook; `typography.js` rewrites `className`
to the size/emphasis utility once the line connects.)

### Anti-scope (locked this session)

- **NOT the type-emit / decision-34 reversal.** Type values stay
  pipelineInline / hand-declared on RN. That is N+8.3 (decision B). This
  session is STRUCTURAL only.
- **`muted` is a boolean, not a tone enum** — no
  `tone="primary|muted|accent"` floodgate (P11).
- **Typography + TypographyStack stay skip-emit** — no new tokens, no
  emit. `muted` reuses the existing `--nuri-text-muted` chrome token.
- **No `<nuri-typography-stack-element>` left anywhere** (static or RN) —
  only explanatory references in docs/comments describing the reversal.

### Relationship to other decisions

- [Decision 47](#47-typographystack-family--contextual-text-hierarchy-primitive--level-carried-by-the-element--n67)
  · amended here — the rhythm container survives, the `-element` +
  `level` are eliminated.
- [Decision 42](#42-box-gains-background--radius-props--attribute-dispatch-surface-vocabulary--evidence-gated-promotion--n65)
  · the JS-reports-state / CSS-owns-colour pattern `muted` follows.
- [Decision 38](#38-icon-component--phosphor-source--nuri-icon-name-nuri-facade--2-size--fill--registry-based-js-dispatch--n63)
  · context for why `muted` is a *boolean*, not a tone enum (no
  colour-prop floodgate).
- [Decision 34](#34-per-component-files--tokenpath-union--set-policy--pipeline-emit-shape--n603)
  · the pipelineInline `type` set that keeps RN type values hand-declared
  — its reversal is N+8.3, OUT OF SCOPE here.
- [P11](./pages/principles.html#p11-parsimony) · one primitive with one
  type vocabulary over a parallel element + sub-scale; `muted` boolean
  over a tone enum.
- See [`roadmap/N+8.2.md`](./roadmap/N+8.2.md) for the source session.

## 54. Type scale EMITTED as a directly-accessed namespace · one source, two readers · N+8.3

**This reverses the `type`-pipelineInline clause of [decision 34](#34-per-component-files--tokenpath-union--set-policy--pipeline-emit-shape--n603).**
The type scale is now a **first-class emitted namespace** in
`build/tokens.ts` that RN **dereferences** — machine-checked against the
source primitives — exactly like the icon registry
([decision 48](#48-typed-buildiconsts-emit--svgxml-over-the-shared-registry--one-registry-two-readers--n68)
· *one source, two readers*). RN no longer hand-declares the metrics.
**Operator signed off (2026-05-31), including the relative-value shape and
the `typeStyle(key)` consumer helper.**

### The rule (operator-confirmed)

> The `<nuri-typography>` **element** is for author content; component-owned
> labels style themselves; but the type **values** come from this one
> shared scale.

I.e. the *element* and the *values* are separable concerns. Whether text
ships as a `<nuri-typography>` line (author content) or as a label baked
into a component (Button, Tab, Topbar) is a per-component call — but every
one of those readers pulls its `fontSize / lineHeight / letterSpacing /
fontWeight` from the **same** `--nuri-type-*` scale. The element is not the
gatekeeper of the metrics; the scale is.

### (a) Emit shape — DTCG typography composite, per step × {regular, em}

`pipeline/parsers/type.js` emits a `type` namespace from the
`--nuri-type-*` primitives in
[`styles/tokens-primitive.css`](./styles/tokens-primitive.css) (the SAME
source the web reads through the `.nuri-type-*` utility classes in
[`styles/typography.css`](./styles/typography.css) · zero-build). It is a
**directly-accessed, context-invariant** namespace (like `icons`), NOT a
cascade-resolved runtime/TokenPath set — the consumer reads `type[key]`
straight, there is no `(accent × theme)` cross-product.

```ts
export const type: Record<TypeSize | `${TypeSize}Em`, TypeStep> = {
  md:   { fontSize: 17, lineHeight: 1.29, fontWeight: '400', letterSpacing: -0.02 },
  mdEm: { fontSize: 17, lineHeight: 1.29, fontWeight: '600', letterSpacing: -0.02 },
  // … xs · sm · lg · xl · 3xl, each with its `${size}Em` twin
};
```

- `fontSize` → **px number** (rem × 16 at the 16px root · `1.0625rem → 17`).
- `lineHeight` → **unitless ratio, verbatim** (e.g. `1.29` · NOT `fontSize × ratio`).
- `letterSpacing` → **em number, verbatim** (e.g. `-0.02` · `xs = 0`).
- `fontWeight` → the resolved weight literal as a **quoted string**
  (`'400'` regular · `'600'` em).

Sizes are `xs · sm · md · lg · xl · 3xl` (`2xl` is a deliberate reserved
gap · `tokens-primitive.css`). Each size emits a `{size}` (regular) and a
`{size}Em` (the `--em` weight) record.

### (b) lineHeight + letterSpacing stay RELATIVE — the a11y rationale

Both `lineHeight` and `letterSpacing` are emitted as **ratios** (a
unitless line-height ratio, an em tracking number), NOT baked to absolute
dp. On the web both scale with `font-size` natively. **RN's `lineHeight`
and `letterSpacing` are absolute dp that do NOT scale with `fontSize` or
the OS `fontScale`** — so baking either to absolute in the emit would
clip/cramp at large accessibility text sizes and break **web↔RN
"spacing-that-scales" parity**.

The relative→absolute conversion therefore lives in **ONE place** — the
consumer-side `typeStyle(key)` helper:

```ts
function typeStyle(key: TypeKey) {
  const t = type[key];
  return {
    fontSize: t.fontSize,
    lineHeight: t.fontSize * t.lineHeight,      // ratio → absolute dp
    letterSpacing: t.fontSize * t.letterSpacing, // em → absolute dp
    fontWeight: t.fontWeight,
  };
}
```

Consumers use `<Text style={typeStyle('md')}>`, **never** `{...type.md}`
(a raw spread would feed RN `lineHeight: 1.29` ≈ 1px). This helper is also
the single point where a `* fontScale` multiply will land when Dynamic
Type ships (not now · **P11** · deferred). Consistent with the
`resolveToken` sketch ([decision 21](#21-consumer-model--three-agent-personas--operator--n3)).

### (c) Drift guard — independent re-derivation

The emit is byte-checked in `pipeline/tokens-parser.test.js`: the test
re-derives every value (`fontSize` rem→px, `lineHeight` ratio verbatim,
`letterSpacing` em verbatim) from the `--nuri-type-*` source with its OWN
conversion helpers (not the emitter's), asserts full coverage (every size
× {regular, em}), per-step `deepEqual`, and that the on-disk
`build/tokens.ts` `.includes()` the freshly-emitted block. A renamed or
dropped source primitive throws at build; a transform bug can't hide
because the guard never calls `buildTypeScale`'s converters.

### Anti-scope (locked this session)

- **The SET_POLICY set itself is NOT removed.** `'primitive.type'` keeps
  its component-token-reference role in [decision 34](#34-per-component-files--tokenpath-union--set-policy--pipeline-emit-shape--n603);
  what reverses is only the *no-runtime-namespace* implication of the
  `pipelineInline` flag for the type scale.
- **Web is UNCHANGED.** `.nuri-type-*` classes keep consuming
  `--nuri-type-*` directly (zero-build). The emit is the RN reader ONLY —
  CSS is NOT regenerated from it.
- **NOT a cascade/runtime set.** No `(accent × theme)` resolution, no
  TokenPath union entry — `type` is directly-accessed like `icons`.
- **lineHeight/letterSpacing are NOT baked absolute** — see (b).

### Current exceptions — deferred to N+8.4

> **✓ Resolved in N+8.4 by [decision 55](#55-component-owned-labels-source-type-from-the-shared-scale--button--tab--topbar--n84).**
> Button and Tab dropped their duplicated font tokens and now source
> label type directly from this scale. The "**Topbar is NOT an
> exception**" claim below was **reversed**: N+8.4 deliberately made
> Topbar font-bearing for its title (lg-em from this scale, bare text
> inherits) — see [amendment 46.2](#462-amendment--n84--topbar-is-now-font-bearing-for-its-title).
> Read the original deferral below for context.

**Button and Tab still carry their own duplicated font tokens** — Button's
`--nuri-button-{lg,md,sm}-font-size` + `--nuri-button-font-weight`
(`button.css`) and Tab's `--nuri-tab-font-size` + `--nuri-tab-font-weight`
(`tabs.css`), each aliasing a `--nuri-type-*-size` / weight primitive
through a per-component token rather than reading this shared scale
directly. Consolidating those two onto the `type` scale — per the rule in
this decision — is **deferred to N+8.4**. (**Topbar is NOT an exception**:
reviewed this session, `topbar.css` owns NO font-size/weight tokens — it is
a layout shell ([decision 46](#46-compositional-chrome-shell-via-named-light-dom-wrappers--n66)),
styling only `color` and expecting a slotted `<nuri-typography>` for its
title. The earlier "Button / Tab / Topbar" framing named Topbar in error.)
This session lands the scale and migrates the `Typography` primitive; the
per-component consolidation is the follow-up.

### Relationship to other decisions

- [Decision 34](#34-per-component-files--tokenpath-union--set-policy--pipeline-emit-shape--n603)
  · its `type`-pipelineInline clause is reversed here (a "Superseded in
  part" marker is recorded inline at decision 34). The set-policy
  mechanism survives for component-token references.
- [Decision 48](#48-typed-buildiconsts-emit--svgxml-over-the-shared-registry--one-registry-two-readers--n68)
  · the *one source, two readers* template this emit mirrors (web inlines
  the source · RN reads the typed emit).
- [Decision 53](#53-typographystack--element-eliminated--muted-on-typography--n82)
  · the structural Typography cleanup that set this up; it explicitly
  deferred the type-emit to N+8.3 (this decision).
- [Decision 21](#21-consumer-model--three-agent-personas--operator--n3)
  · `typeStyle(key)` is the type-scale analogue of the one-runtime-reader
  helper; the future `* fontScale` point.
- [P11](./pages/principles.html#p11-parsimony) · Dynamic Type scaling is
  acknowledged in the helper's shape but NOT built — deferred until a real
  consumer needs it.
- See [`roadmap/N+8.3.md`](./roadmap/N+8.3.md) for the source session.

## 55. Component-owned labels source type from the shared scale · Button · Tab · Topbar · N+8.4

**A component that owns its label styles itself — but the type VALUES
come from the ONE shared `--nuri-type-*` scale, never from duplicated
per-component font tokens.** This is the consolidation
[decision 54](#54-type-scale-emitted-as-a-directly-accessed-namespace--one-source-two-readers--n83)
deferred to N+8.4, applied to the three font-bearing components whose
labels are component-owned (they do NOT route through the
`<nuri-typography>` element — that element is for author content).

### The rule

Decision 54 established the scale and the boundary: *the
`<nuri-typography>` element is for author content; component-owned labels
style themselves; but the type values come from this one shared scale.*
Decision 55 is that boundary enforced — three components stop duplicating
type and read the scale directly.

### What changed

- **Button** — dropped `--nuri-button-{lg,md,sm}-font-size` +
  `--nuri-button-font-weight`. Each size block in `button.css @layer
  rules` references the scale directly: lg + md = **type-md-em**, sm =
  **type-sm-em**, pulling **all four attributes** (size · line-height ·
  letter-spacing · weight) verbatim. The emit (`build/components/
  button.ts`) no longer carries `fontSize`/`fontWeight` fields; the RN
  matrix reads `typeStyle('mdEm')`.
- **Tab** — dropped `--nuri-tab-font-size` + `--nuri-tab-font-weight`;
  `.nuri-tab` references **type-sm-em** directly (mirrors Button sm). The
  RN Tab switched from borrowing `button.mdFontSize` (a latent 17px bug)
  to `typeStyle('smEm')` (15px · correct).
- **Topbar** — the centre region gains a default **lg-em** title type
  from the scale; bare title text inherits it (no `<nuri-typography>`, no
  per-text wrapper). This makes Topbar font-bearing —
  [amendment 46.2](#462-amendment--n84--topbar-is-now-font-bearing-for-its-title)
  records the reversal of the "Topbar is NOT an exception" note in
  decision 54. `topbar.html` demos converted from `<nuri-typography
  size="lg" emphasis>` to bare text; the now-orphaned `typography.css` /
  typography element includes were removed from that page.

### CSS approach · primitives-direct, not the utility class

The brief suggested the `.nuri-type-*` utility class, but `button.html`
and `tabs.html` do **not** load `styles/typography.css` — the class would
silently no-op there. Instead each component references the
`--nuri-type-*` **primitives directly** in its `@layer rules`. Same
single source (the primitive scale), self-contained per component, works
on every page regardless of which stylesheets it loads. Operator-approved
at the N+8.4 visual checkpoint.

### Line-height · align-to-scale (operator decision)

Button and Tab previously hard-coded `line-height: 1.2` with **no**
letter-spacing. Adopting the scale changes both, and the operator chose
**align-to-scale** (not a preserved 1.2 override):

| | before | after (from scale) |
|---|---|---|
| Button md/lg line-height | 1.2 (20.4px) | **1.29** (21.93px) |
| Button/Tab sm line-height | 1.2 (18px) | **1.33** (19.95px) |
| letter-spacing | 0 | **−0.02em** (md) · **−0.01em** (sm) |

Rationale: a single "one source" story beats a per-component override;
buttons are fixed-height + vertically centred, so single-line labels
barely shift. The bespoke 1.2 is retired.

### No new tokens

Per [P11](./pages/principles.html#p11-parsimony) and the anti-goal: this
adds **zero** component font tokens. It only removes duplication and
points the three components at the existing shared scale. Topbar still
owns no `--nuri-topbar-*` tokens (skip-emit intact).

### Gates

`npm test` 19/19 (the byte-check test updated: the retired Button
font fields are now asserted **absent**), `npm run build` clean (button
20 decls · topbar 0 decls), `tsc` on the migration test → exit 0.

### Relationship to other decisions

- [Decision 54](#54-type-scale-emitted-as-a-directly-accessed-namespace--one-source-two-readers--n83)
  · the scale + the rule this decision enforces; its N+8.4 deferral is
  now resolved.
- [Decision 46](#46-compositional-chrome-shell-via-named-light-dom-wrappers--n66)
  · amended (46.2) — Topbar becomes font-bearing for its title while
  remaining a layout primitive that owns no component tokens.
- [Decision 41](#41-button-three-size-matrix--asymmetric-typeradius-coupling--default-shifts-to-md--n64)
  · Button's md/sm typography break (lg + md = type-md, sm = type-sm) is
  preserved — now expressed directly against the scale.
- [Decision 43](#43-tabs--first-multi-element-compound--first-box-composition-consumer--n65)
  · Tab mirrors Button sm; the shared-scale sourcing keeps that mirror
  exact (type-sm-em on both).
- See [`roadmap/N+8.4.md`](./roadmap/N+8.4.md) for the source session.

**Operator signed off (2026-05-31)**, including the **align-to-scale**
line-height choice (Button md/lg → 1.29 · sm → 1.33 · letter-spacing now
−0.02em/−0.01em · the bespoke 1.2 retired) and the primitives-direct CSS
approach (reference `--nuri-type-*` directly, not the `.nuri-type-*`
utility class) — confirmed at the N+8.4 visual checkpoint.

## 56. TabBar · icon-only bottom destination switcher · distinct from Tabs · emit bar height · direct-semantic items · N+9

**The icon-only BOTTOM navigation bar — the app-level destination
switcher behind the My-vault / Coin / Activity screens.** A compound of
two light-DOM custom elements (`<nuri-tab-bar>` controller +
`<nuri-tab-bar-item>` destinations) sharing one piece of state (the
selected `value`). It is **navigation chrome**, structurally and
semantically DISTINCT from
[Tabs](#43-tabs--first-multi-element-compound--first-box-composition-consumer--n65)
(the in-page segmented INPUT) — different role, different surface,
different a11y model (F-TABBAR-ROLE-1).

### The rule

TabBar mirrors Tabs' value/active **mechanics** (controller owns the
`value` attribute; children mirror an `active` attribute off it;
authored children reparent into a built container) but shares none of
its **semantics**. Tabs is a `role="tablist"` single-select control
inside a page; TabBar is a top-level destination switcher rendered as a
`<nav>` of native `<button>`s, the selected one carrying
`aria-current="page"`. The bar is router-agnostic — it emits selection,
it does not navigate.

### What changed

- **New compound** `lib/components/tab-bar/{tab-bar.css,tab-bar.js}` —
  one IIFE defining both elements (`display: contents`, defer-loaded).
  The controller defaults `value` to the first item, builds the `<nav
  class="nuri-tab-bar">`, reparents items, and toggles each item's
  `active` attribute on click. Each item builds an inner `<button
  class="nuri-tab-bar__item">` wrapping a `<nuri-icon size="md">`.
- **Registered** in the pipeline (`pipeline/tokens-parser.js` COMPONENTS
  array gains `'tab-bar'`, ordered before `'tabs'` — no prefix collision:
  `--nuri-tab-bar-` is distinct from `--nuri-tabs-`).
- **Docs** `pages/components/tab-bar.html` (new) + the
  `components/tab-bar` shell entry flipped from placeholder to live.
- **RN mirror** `docs/migration-tests/button-matrix/index.tsx` gains
  `TabBar` + `TabBarItem` (shared-selection 1:1, icon via the typed
  registry, the F-TABBAR-ROLE-1 role gap noted in a comment).

### EMIT · one baked structural token (decision 52)

Unlike the
[direct-semantic-only](#46-compositional-chrome-shell-via-named-light-dom-wrappers--n66)
chrome primitives (Topbar / IconAvatar own zero component tokens),
TabBar bakes **one** fixed structural decision worth machine-checking:
its height. `--nuri-tab-bar-height: var(--nuri-size-xl)` mirrors the
Topbar chrome row so the top and bottom chrome share one rhythm, and is
EMITted to `build/components/tab-bar.ts` as
`tabBar.height: 'size.xl'` for web↔RN parity. Everything else is
direct-semantic.

### Direct-semantic items · zero per-item tokens

The per-item treatment reads the shared chrome + interaction vocabulary
directly in `@layer rules` (the
[IconAvatar / Topbar precedent](#50-iconavatar--static-decorative-twin-of-iconbutton--composes-icon-directly--skip-emit--avatar-name-reserved--n69)),
NOT via per-item component-token aliasing — so the bar emits exactly one
declaration. Operator-locked visual spec (zero new tokens):

| state | icon weight | color | scale |
|---|---|---|---|
| selected (active) | fill | `--nuri-text-primary` | — |
| not selected | regular | `--nuri-border-strong` | — |
| pressed (transient) | unchanged | `--nuri-text-muted` | press-scale |

Icon weight flips via the `fill` attribute tab-bar.js sets on the inner
`<nuri-icon>` of the selected item ([Icon weight coupling · decision
38](#38-icon-component--phosphor-source--nuri-icon-name-nuri-facade--2-size--fill--registry-based-js-dispatch--n63)). **Pressed
has NO background change** — only the shared Button press-scale
(`--nuri-interaction-press-scale` · 0.97) plus a colour shift to
text-muted; the weight is untouched. Pressed is transient and applies to
whichever item is held regardless of selection, overriding the resting
colour by source order (equal 0-2-0 specificity to the active rule).
This reuses Button's press-scale constant directly under the
[bare-constant carve-out · decision 45](#45-interaction-family-primitives--cross-component-design-constants----nuri-interaction---n65-post-close-coordinator-polish)
— no tab-bar press token.

### Chrome-only · accent has no effect

Selection reads `--nuri-text-primary`, never an accent-derived surface,
so switching `[data-accent]` leaves the bar unchanged. The focus ring is
the brand `--nuri-focus-ring` (never accent-derived). Only `[data-theme]`
moves the bar (its canvas + chrome colours).

### A11y · F-TABBAR-ROLE-1 (honest platform gap)

Web: `<nav aria-label>` + native `<button>` per destination +
`aria-current="page"` on the selected one — router-agnostic, distinct
from a tablist. RN has no peer for "current page in a nav landmark," so
the mirror approximates with `accessibilityRole="tab"` +
`accessibilityState={{ selected }}` — the same honest-platform-gap
pattern as
[F-LISTITEM-ROLE-1](./docs/RISKS.md). The icon-only target reuses
**F-ARIA-LABEL-1** (`label || name.replace(/-/g, ' ')`) and the shared
**F-SELECTED-VALUE-1** controlled-selection contract. Recorded in
`docs/RISKS.md` under R1.

### Full-width · operator decision at checkpoint

Because the host is `display: contents`, the built `<nav>` shrink-wrapped
to its icons inside the centred preview stage. The operator chose
`inline-size: 100%` so the bar spans its container edge-to-edge (a bottom
navigation bar fills the screen width). **No** `position: fixed` /
safe-area inset (P11 · routing + viewport pinning belong to the consuming
app, not the primitive) and **no** top border ([decision 49 · dividers
are author-placed Separators](#49-separator--standalone-generic-1px-display-primitive--author-placed--horizontal-only--n69)).

### No new tokens

One emitted structural token (`--nuri-tab-bar-height`, an alias of an
existing primitive). Zero new primitives, zero new semantics, zero
per-item component tokens. Per
[P11](./pages/principles.html#p11-parsimony) and the anti-goal list (no
badge / label / tone / max-width / new glyphs).

### Gates

`npm test` 19/19 (added a tab-bar emit guard: asserts `export const
tabBar = {`, the kebab name absent, `height: 'size.xl'`, and exactly one
`--nuri-tab-bar-` declaration resolving to `{ kind: 'tokenPath', path:
'size.xl' }`), `npm run build` clean (tab-bar · 1 decl · 1 TokenPath
ref), `tsc` on the migration test → exit 0.

### Relationship to other decisions

- [Decision 43](#43-tabs--first-multi-element-compound--first-box-composition-consumer--n65)
  · shares Tabs' compound value/active mechanics; shares none of its
  tablist semantics (F-TABBAR-ROLE-1 is the wedge).
- [Decision 52](#52-list-family-refactor--primitiveinteractiverecipe-split--wrap-not-overlay-a11y-fix--emit-fixed-values--first-recipe-nav-item--n8)
  · TabBar EMITs (one baked height) rather than skip-emit — the first
  chrome primitive to bake a single structural token.
- [Decision 50](#50-iconavatar--static-decorative-twin-of-iconbutton--composes-icon-directly--skip-emit--avatar-name-reserved--n69)
  · the per-item treatment is direct-semantic, extending the IconAvatar /
  Topbar precedent to a stateful (selected / pressed) surface.
- [Decision 45](#45-interaction-family-primitives--cross-component-design-constants----nuri-interaction---n65-post-close-coordinator-polish)
  · pressed reuses the bare press-scale constant; no tab-bar press token.
- [Decision 38](#38-icon-component--phosphor-source--nuri-icon-name-nuri-facade--2-size--fill--registry-based-js-dispatch--n63)
  · selection drives icon weight via the `fill` attribute (md → regular
  at rest, md+fill → fill when selected).
- See [`roadmap/N+9.md`](./roadmap/N+9.md) for the source session.

**Operator signed off (2026-05-31)** at the N+9 visual checkpoint —
confirming the F-TABBAR-ROLE-1 a11y model (nav + button + aria-current,
router-agnostic; RN approximates with tab/selected) and the
`inline-size: 100%` full-width bar.

## 57. Playground · a separate composition area · `<nuri-demo>` device frames + `board` layout · scoped device theming · attribute-only `[data-neutral]`/`[data-font]`/`[data-theme="light"]` · N+10

**The Playground is a SEPARATE docs area where real screen compositions
render live inside device frames** — the surface that makes the agent-first
loop's "composes" step visible
([decision 21](#21-consumer-model--three-agent-personas--operator--n3): operator
prompts → agent composes → translate). It validates the design system on real
layouts: a wallet home screen, not a component in isolation. It is chrome-only
glue over existing components — **no new component, token, or glyph** ships from
the composition itself (P11 · [decision 30](#30-primitive-parsimony--no-speculative-additions--n571)).
The first document, **My vault**, is composed ENTIRELY from shipped components
(Topbar · Box · Stack · Typography · IconAvatar · IconButton · List · NavItem ·
Button · TabBar · Icon) plus a few raw-HTML bits (balance rows, a swap overlay,
the € total) — those raw bits are the *missing-component candidates* this
session LOGGED rather than built (see Open questions).

### The rule

The Playground is a sibling area, NOT the DS `<nuri-shell>`: its own simpler
shell (`lib/playground/`, `pages/playground/`) with no nav tree and no global
token toggles. Per-view theming lives on each `<nuri-demo device …>`. It is a
**fixed light + cream surface** — the pages pin `<html data-theme="light"
data-neutral="cream">` regardless of the shared docs localStorage (done WITHOUT
`NuriState.set`, so the user's DS prefs are not clobbered). The only themeable
island is the device screen.

### What changed · `<nuri-demo>` (the docs widget) gains two opt-ins

- **`device` control** — when listed, the preview renders inside a phone device
  frame (bezel · status bar · cutout · bottom control) and the toolbar shows a
  device picker. DS component pages never list it, so they are unaffected — the
  frame is purely additive.
- **`layout` prop** — `widget` (default · the rounded, fully-bordered DS docs
  card · toolbar · preview · code) | `board` (the playground panel: 560px wide,
  no radius, a single right border so panels butt into a continuous canvas,
  `height: 100%`, toolbar moved BETWEEN preview and code, the preview is the
  resizable region — `resize: vertical`, tall by default so the code starts
  below the fold and the user drags to reveal it, both panes scroll
  independently). The ONE thing `layout` reorders is the DOM section order (not
  CSS `order`, so reading / tab order stay correct).

### Device frames · 4 presets × 4 platform chrome kits

Each `DEVICE_OPTIONS` entry carries `value` (→ `data-device`, dimensions),
`font` (the platform typeface), and `platform` (→ `data-platform`, the chrome
kit). The **SCREEN owns the device's real logical dimensions** (`inline-size`
= width · `aspect-ratio` = width/height); the black frame `fit-content`-wraps it
and ADDS the bezel as padding (`--nuri-device-bezel` sides · independent
`-top`/`-bottom`) — so the given dimensions are the screen's, never eaten by the
bezel. A `PLATFORM_CHROME` map composes three independent traits; the DOM is
structurally distinct per platform (island vs punch-hole vs nav bar), so JS
composes the structure and CSS owns the paint
([decision 42](#42-box-gains-background--radius-props--attribute-dispatch-surface-vocabulary--evidence-gated-promotion--n65)):

| device | screen | platform | cutout | status | bottom |
|---|---|---|---|---|---|
| iPhone 17e | 390×844 | `ios` | Dynamic Island | iOS | gesture pill |
| iPhone SE | 375×667 | `ios-classic` | none | iOS | none · thick black forehead/chin (75px) |
| Pixel 8 | 412×915 | `pixel` | Dynamic Island | Android | gesture pill |
| Android | 360×800 | `android` | punch-hole | Android | 3 transparent buttons · taller chin |

Operator calls: Pixel reads like a modern iPhone (floating bar + pill · only the
Android glyphs/typeface give it away); generic Android is the distinct one
(punch-hole + 3-button nav, Samsung-style); the SE home button is off-screen, so
it's just generous black padding. Changing the device re-skins the chrome in
place (`_swapDeviceChrome`) WITHOUT rebuilding the viewport, so the live
composition keeps its element state.

### Scoped device theming · the themeable scope wraps only the screen

In device mode the controllable `<nuri-scope>` is moved INSIDE the frame and
wraps ONLY the phone screen, so the toolbar's theme / neutral / font controls
re-theme **just the device content**. The card chrome inherits the page's fixed
light+cream context (no wrapping scope), and the code pane is **forced dark**
(`data-theme="dark"`). The device picker also drives the font (a preset carries
its platform typeface). Non-device (DS docs) cards are unchanged: one scope still
wraps the whole self-contained demo.

### The token-cascade fixes (the reusable, machine-checked part)

Making a NESTED `<nuri-scope>` re-resolve neutral and font (so the device
control works) exposed three `:root`-only asymmetries; all are fixed to the
attribute-only form the theme/accent overrides already use, so a scope anywhere
can re-theme its subtree:

- **`[data-neutral="…"]`** and **`[data-font="…"]`** overrides
  (`styles/tokens-primitive.css`) drop the `:root` prefix. Before, a scoped
  neutral/font change was a silent no-op (the override only matched `<html>`).
- **`tokens-semantic.css` block 1** (`:root`, the light chrome/surface defaults)
  gains **`[data-theme="light"]`**, mirroring the existing attribute-only
  `[data-theme="dark"]` block 2. Without it a nested `mode="light"` scope could
  not re-declare the chrome tokens — they stayed frozen at the value `:root`
  computed with the PAGE neutral — so scoped neutral worked in dark but was a
  no-op in light. Light and dark are now symmetric: either theme re-asserts at
  any wrapper.
- **A themeable scope now carries `accent` alongside `theme`.** The accent×theme
  tokens use a COMPOUND selector (`[data-accent="lilac"][data-theme="dark"]`); a
  scope that flips `data-theme` also matches the bare `[data-theme="dark"]` rule
  (which resets accent to the neutral-dark default), so without `data-accent` on
  the SAME element the lilac-dark override never matches and the brand colour
  reverts to neutral in dark. `<nuri-demo>` seeds `accent` from the page default
  whenever the scope carries `theme`.

**Pipeline parity** — `primitiveSelectorMatches`
(`pipeline/parsers/semantic.js`) now accepts the bare `[data-neutral="…"]` form
alongside `:root[data-neutral="…"]`, so the build still resolves its single
chosen neutral scope ([decision 31](#31-default-neutral-scale--cream--cli-parameter---neutral=scale--n58)).
The semantic `:root, [data-theme="light"]` change is transparent to
`selectorMatches` (same match + spec as bare `:root`). Test 7
(`resolveSemanticCrossProduct`) caught the regression before it shipped.

### Playground topbar · the DS `<nuri-topbar center>`

The playground shell's own chrome uses the DS
[Topbar](#46-compositional-chrome-shell-via-named-light-dom-wrappers--n66)
(`center`) rather than a bespoke bar: a leading **ghost** `caret-left`
icon-button (documents only · back to the index), a centre **`<nuri-typography
size="sm" emphasis>`** title, and a trailing **soft `sm`** "Design system"
button (text only, no arrow). `nuri-button` / `nuri-icon-button` are native
`<button>`s (no `href`), so navigation is wired with click→`location.assign`
listeners on the host elements (the click bubbles up; the `data-pg-nav`
attribute survives the topbar's reparent). The custom `.nuri-pg__topbar-*` /
brand / back / ds-link CSS is retired; `.nuri-pg__topbar` keeps only
`position: sticky` + the divider (layout/height/surface come from `topbar.css`).

### Anti-scope (held)

- **No new component, token, or glyph from the composition.** My vault is
  existing parts only; the device-frame chrome is decorative inline SVG (the
  same category as the original status-bar glyphs), not DS components/glyphs.
- **The device frame is the playground's, not the DS's** — `device` is opt-in;
  no DS page lists it, no per-frame component tokens, dimensions/chrome live as
  `--nuri-device-*` custom props on the frame (not semantic tokens).
- **No `position: fixed` / routing** in the playground shell — it is a docs
  surface, not an app.

### Gates

`npm test` **19/19** (test 7's oracle already covers the cream cross-product;
the parser fix restores it), `npm run build` clean, `npx tsc -p
docs/migration-tests/button-matrix/tsconfig.json` exit 0. No pipeline COMPONENTS
change (the playground ships no new DS component); no `build/` emit change.

### Relationship to other decisions

- [Decision 21](#21-consumer-model--three-agent-personas--operator--n3)
  · the Playground is the "composes" step made visible — real layouts, not
  isolated components.
- [Decision 46](#46-compositional-chrome-shell-via-named-light-dom-wrappers--n66)
  · the playground topbar consumes the DS Topbar (`center`) rather than a
  bespoke bar.
- [Decision 42](#42-box-gains-background--radius-props--attribute-dispatch-surface-vocabulary--evidence-gated-promotion--n65)
  · per-platform device chrome is attribute-dispatched off `data-platform` (JS
  structure · CSS paint).
- [Decision 31](#31-default-neutral-scale--cream--cli-parameter---neutral=scale--n58)
  · the parser's neutral-scope match extends to the attribute-only form.
- See [`roadmap/N+10.md`](./roadmap/N+10.md) for the source session.

**Open questions logged (not built · P11):** BalanceRow / AmountDisplay /
swap-overlay are real-component candidates surfaced by the My-vault composition
(today raw HTML); the `<nuri-nav-item>` idempotency guard
(`dataset.nuriComposed = ''` is falsy, so the guard never blocks — only bites on
reparent-after-compose) is a latent one-line fix deferred to a DS-touching
session.

**Operator signed off (2026-05-31)** across the N+10 visual checkpoints —
approving the board layout, the resizable preview + below-the-fold code, the
4 device presets with per-platform status bars / cutouts / nav, the polished
bezels + radii, the scoped-device theming (forced-dark code · fixed light+cream
chrome), and the DS-topbar playground chrome.

### 57.1 amendment · N+11 · pin ALL THREE chrome dimensions · shell renders on neutral GRAY

Two playground-surface fixes from the N+11 composition work:

- **Accent is now pinned too.** Decision 57 pinned `data-theme="light"` +
  `data-neutral="cream"` but left `data-accent` to leak from the shared docs
  localStorage. A visitor who had toggled `accent="neutral"` in the DS area saw
  the brand (lilac) wash to neutral-black inside the frame (the "Buy Bitcoin"
  solid button went black). The playground is a FIXED surface — so it must pin
  ALL three: the inline head script now also sets `data-accent="lilac"` (the
  brand · the `NuriState` fallback). Verified deterministic even with
  `localStorage nuri:accent="neutral"` set.
- **The shell chrome renders on neutral GRAY; the mockup stays cream** — so the
  cream brand surface reads against a plain grey reference instead of
  cream-on-cream. `lib/playground/shell.js` sets `data-neutral="gray"` AND
  re-asserts `data-theme="light"` on the `<nuri-playground-shell>` host (guarded
  · a page may override). BOTH are required: `data-neutral` alone only swaps the
  PRIMITIVE neutral ramp; the SEMANTIC chrome tokens (`bg-subtle` / text / …)
  re-resolve only where the `[data-theme]` block re-matches (decision 57's own
  "light re-asserts at any wrapper" fix) — so re-asserting theme on the same
  element recomputes them against the gray ramp. The device frame re-scopes its
  own theme+neutral via `<nuri-scope>` (seeded cream from the page pin), so only
  the surrounding chrome greys. Result: shell `bg-subtle` `#f9f9f9` vs frame
  `bg-canvas` `#fffdf2`.

**Operator signed off (2026-06-01)** on the playground shell pinning all three chrome dimensions and rendering on the neutral gray ramp.

## 58. Screen + Scroll · per-screen layout scaffold · navigator owns the safe-area · TabBar is a SIBLING, not a child · N+11

**Two new layout primitives decompose "a full mobile screen" into composable DS
parts**, so the playground's My-vault body stops being page-local `.vault` CSS
and becomes pure composition (the migration-to-RN goal · R1). `<nuri-screen>` is
the full-height column; `<nuri-scroll>` is the growing, scrolling body between
the pinned chrome.

### The rule

- **`<nuri-screen>`** — a `display:contents` host over an inner `.nuri-screen`
  that is `display:flex; flex-direction:column; flex:1; min-block-size:0`. Fills
  its parent's main axis and stacks pinned chrome (Topbar) above a growing
  Scroll. Pure structure — no surface, no tokens (layout-primitive class ·
  [decision 37](#37-layout-primitives-consume-semantic-vocabulary-via-prop--no-component-token-aliasing--n62)).
  RN map: `<View style={{ flex: 1 }}>` (later the themed SafeAreaProvider root).
- **`<nuri-scroll>`** — `display:contents` host over an inner `.nuri-scroll` that
  is `flex:1; min-block-size:0; overflow-y:auto; overscroll-behavior:contain`.
  RN map: `<ScrollView style={{ flex: 1 }}>`. **Scrolling is a COMPONENT in RN,
  NOT a `View` style** — so `overflow` could never be a Box prop (it would have
  no `View` analogue · R1). That is exactly why Scroll is its own primitive.
  Padding for the scrolled content goes on a `<nuri-box>` INSIDE the scroll,
  which maps to ScrollView's `contentContainerStyle` — never the ScrollView box.

### Safe-area + the navigator model (the load-bearing call)

Screen is **NOT the navigator**. In RN the thing that holds Screen + the bottom
TabBar and owns the safe-area is the navigator (React Navigation) — framework
chrome, not an authored `View`. So:

- **The bottom TabBar is a SIBLING of Screen, never a child.** In RN the tab bar
  renders once at navigator level, persistent across screens; nesting it inside
  each screen's view violates the RN navigation norm. The playground device
  frame plays the navigator role; `<nuri-tab-bar>` sits as a sibling of
  `<nuri-screen>`.
- **Safe-area is owned in ONE place — the navigator/frame** — so Screen stays
  inset-agnostic (no `env()` / inset props · P11). In the playground the frame's
  structural status / home / nav rows ARE the insets; in RN it is
  `SafeAreaProvider` + React Navigation auto-applying insets to the header /
  tab-bar. The consuming app handles it upstream; the primitives never bake it
  in (no CSS var needed — the frame's existing structural inset rows already do
  the job, verified empirically).

### Why not a `<nuri-app-shell>`

A single component wrapping Screen + TabBar + safe-area would BE the navigator —
and the navigator is React Navigation, a framework, not an authored `View`.
Shipping `<nuri-app-shell>` would invent a web abstraction with no clean RN home
→ violates R1. The composition (Screen + sibling TabBar, frame owns insets) is
the RN-faithful shape.

### Skip-emit

Both bake only structural CSS (flex fill / overflow), no design-scale value, so
`@layer tokens` is empty and the per-component pipeline rides the skip-emit
branch (decision 52) — registered in `COMPONENTS` (so the emitter acknowledges +
guards them) but no `build/components/{screen,scroll}.ts`.

### Gates

`npm run build` logs the two skip lines; `npm test` 19/19; doc pages
`pages/components/{screen,scroll}.html` + the Components·Layout NAV entries
render clean.

**Operator signed off (2026-06-01)** on the Screen + Scroll scaffold, the navigator-owns-the-safe-area model, and TabBar as a SIBLING of Screen (not a child).

## 59. Spacer + Typography `align` · the fill / alignment primitives · N+11

**Spacer** — a flexible gap. An empty box that GROWS (`flex:1`) to absorb a flex
parent's free space (the SwiftUI / RN `Spacer` idiom · push siblings apart or
shove content to an edge) or holds a FIXED extent from the semantic space scale
(`size` · inline-size in a row, block-size in a column per `direction`). Like
Separator (decision 49) it sizes the HOST directly — no inner element, no JS
reparenting; behaviour-free, dispatched purely on its own attributes in
`@layer rules`. Layout-primitive class
([decision 37](#37-layout-primitives-consume-semantic-vocabulary-via-prop--no-component-token-aliasing--n62))
— empty `@layer tokens`, skip-emit, registered in `COMPONENTS`. RN map: grow →
`<View style={{ flex: 1 }} />`; fixed → a `<View>` with a definite
`width` (row) / `height` (column) from `tokens.space`.

**Why Spacer, not a general `grow` prop (for now).** When the fill need first
surfaced (swap-row separators · value-push-right) the operator chose to
introduce Spacer first and "see what emerges" rather than a `grow` boolean on
every primitive. Spacer covers push-apart + proportional layout; the
container-fill case that emerged later got `fill` (decision 60), not a grow
prop. A general `grow` prop stays deferred (P11).

**Typography `align`** — `start | center | end` → `text-align` (logical ·
RTL-aware). The host is `display:inline` by default, so `align` flips it to
`display:block` so the alignment takes effect and the box fills its container's
inline size (a flex-column item stretches full-width, so `end` right-aligns).
Pure attribute-dispatch CSS — NO JS reflection (the attr survives `#sync`, which
only rewrites the size/emphasis className + `data-muted`). Evidence-gated by the
My-vault total (`€ 97.50`, right-aligned). RN map: `<Text style={{ textAlign }}>`.

### Gates

build skip-emit unchanged (spacer added to `COMPONENTS` · no tokens); 19/19;
`pages/components/spacer.html` (+ NAV) and the `typography.html` `align` rows
render clean.

**Operator signed off (2026-06-01)** on Spacer + Typography `align`.

## 60. Box + Stack `fill` · grow to fill a flex parent · the ScrollView contentContainer pattern · N+11

**`fill` is the opt-in that lets a Scroll's content column fill the viewport** —
so a `<nuri-spacer>` inside has slack to push trailing content (e.g. the
fund-action buttons) to the bottom. The web analogue of RN's
`<ScrollView contentContainerStyle={{ flexGrow: 1 }}>` — and, as in RN, it is
OPT-IN, not automatic.

### The rule

- `<nuri-scroll>` becomes a flex column (`display:flex; flex-direction:column`)
  so a child can grow into it. Plain (non-fill) content stays natural-height +
  top-aligned — no regression to the Screen/Scroll doc demos.
- **Box `fill`** → `flex: 1 0 auto` AND `display:flex; flex-direction:column` —
  it grows to fill its flex parent AND becomes a column so a filling child fills
  in turn.
- **Stack `fill`** → `flex: 1 0 auto`.
- Both dispatch via `data-fill` (the same `data-*` reflection as their other
  props · no tokens → skip-emit unchanged).

**Why `flex: 1 0 auto`, not `flex: 1` (= `1 1 0`).** With basis 0 + shrink 1 the
box would be clamped to the viewport height even when content is TALLER, so the
Scroll would see no overflow and fail to scroll (content clips). `1 0 auto`
(grow 1, shrink 0, basis auto) fills when content is short AND keeps content
height when content is tall → the Scroll scrolls. This matches RN
`contentContainerStyle={{ flexGrow: 1 }}` (flexGrow 1, RN-default flexShrink 0,
basis auto). RN map: a `View` with `style={{ flex: 1 }}` as the contentContainer.

The vault chain: `Scroll(flex col) > Box[fill](flex:1 0 auto · col) >
Stack[fill](flex:1 0 auto) > … Spacer … buttons`.

### Gates

19/19; build skip-emit unchanged; `box.html` / `stack.html` `fill` rows render.

**Operator signed off (2026-06-01)** on Box + Stack `fill` (`flex: 1 0 auto`).

## 61. Spacer `grow` · proportional grow · N+11

> **Renamed `weight` → `grow` (operator · 2026-06-01).** `weight` collided with
> font-weight in Nuri; `grow` is intuitive (the spacer grows by nature), maps
> literally to `flex-grow`, and is collision-free. Prose below uses the final
> name; the original prop was `weight`.

**`grow="1..4"` gives a grow Spacer a proportional share of the slack**
(`flex-grow: n`). Two grow spacers at `1` / `2` split the free space `1:2`.
Scoped `:not([size])` so a fixed (sized) spacer ignores it; pure CSS attribute
dispatch (no JS). Evidence-gated by the My-vault layout: a `grow="1"` spacer
above the total and a `grow="2"` spacer above the fund actions float the total
with breathing room while pinning the actions lower (verified 1:2 = 51/103px in
the frame; 119/237px on the doc page).

**RN parity.** A positive RN `flex` IS proportional `flexGrow` —
`style={{ flex: 2 }}` takes twice the share of `flex: 1`. So `grow` maps 1:1
to RN; the migration-test Spacer reads `grow → flex: n`.

### Gates

19/19; skip-emit unchanged; the `spacer.html` `grow` token-map rows render.

**Operator signed off (2026-06-01)** on Spacer `grow`, including the `weight`→`grow` rename.

## 62. NuriThemeContext implemented · the single orthogonal theming context lands in the migration test · N+13

**The locked [decision 27](#27-theme-provider--custom-orthogonal-not-cross-product-registry--n55)
shape is now the IMPLEMENTATION** in the RN migration mirrors
(`docs/migration-tests/button-matrix/`). Until N+13 the examples carried the
shape decision 27 explicitly **rejected** — two separate per-dimension contexts
(`AccentContext` + `ThemeContext`) with a per-dimension `AccentProvider`. The
reader-facing spec ([`lib/components/scope/README.md`](./lib/components/scope/README.md)
· [`pages/components/scope.html`](./pages/components/scope.html)) prescribed a
SINGLE `NuriThemeContext`; the examples contradicted it. That spec↔example gap
was the open friction **F-SCOPE-1** (see
[RISKS R1](./docs/RISKS.md#r1--webrn-api-11--props-parity--behavioural-parity)).

**What ships.** `_shared.tsx` exposes:

- **One `NuriThemeContext`** carrying one entry per dimension —
  `{ mode, accent }` — defaults `mode: 'light'`, `accent: 'lilac'` (mirrors the
  web `<html data-*>` defaults). NOT two contexts; NOT a pre-computed (∏ dims)
  registry.
- **`NuriScope`** · the composite Tier-3 provider with **merge-on-override**:
  `<NuriThemeContext.Provider value={{ ...ambient, ...overrides }}>`. Unspecified
  dimensions inherit; specified ones win — `accent` can flip without redeclaring
  `mode`. One composite Provider, not one-per-dimension.

Every mirror that reads theming now does a single
`const { mode, accent } = useContext(NuriThemeContext)`; Tier-2 self-scope (a
component's `accent` prop over ambient) is an inline merge (`accentProp ?? accent`,
prop-wins); `app.tsx`'s Tier-3 demo is `<NuriScope accent="neutral">`.

**This is the n=1 confirmation decision 27 awaited.** The single context now
carries TWO dimensions and the demo exercises merge-on-override across them
(`accent` flips to neutral while `mode` inherits light) — the composite shape's
first real exercise, closing the "composite vs per-dimension Providers" open
question in 27's favour. Caveat (P11): only `mode` + `accent` exist as context
entries today; `density` / `neutral` stay **reserved, not implemented**, until
their web CSS counterparts ship (no speculative context entry). `font` never
migrates ([amendment 27.1](#271-amendment--n57)). Full beyond-two-dimension
confirmation reactivates when a third migrated dimension lands.

**F-SCOPE-1 → closed.** The examples now DO exactly what the spec describes;
the scope page + README describe exactly what the examples do (zero residual gap).

### Gates

`tsc -p docs/migration-tests/button-matrix/tsconfig.json` exit 0; `npm test`
green (incl. docs-drift guards); `npm run build` clean (no `build/` diff — this
touches no `build/` input).

**Operator signed off (2026-06-01)** on the single `NuriThemeContext` +
`NuriScope` (merge-on-override) landing in the migration test and closing
F-SCOPE-1 — the examples, the Scope page, and the impl-guide now agree.

## 63. Accent×theme self-scope cascade clobber · descendant-combinator dark blocks (#4b/#6b) · web-CSS-only · N+15

### The bug

A Tier-2 component that **self-scopes its accent** (`data-accent` mirrored onto
its inner element by `icon-button.js` / `icon-avatar.js` / `button.js`) resolved
the **LIGHT** accent value even inside a **dark ancestor scope**. In the
playground My-vault dark device frame the swap IconButton
(`variant="solid" accent="neutral"`) painted `--nuri-accent-solid: #12110b` (light
neutral) on the `#12110b` dark canvas — a cream circle gone **dark-on-dark
(invisible)**. IconAvatars under a dark scope had the same failure; Button is
latent (no Button self-scopes accent in that screen).

**Mechanism.** The accent cascade
([tokens-semantic.css](../styles/tokens-semantic.css)) declares each accent token
in attribute-only blocks: `[data-accent="neutral"]` (block 3 · light) and
`[data-accent="neutral"][data-theme="dark"]` (block 4 · dark · spec 0,2,0). When a
component self-scopes accent it sets `data-accent` on the ELEMENT but **not**
`data-theme` (it can't know its ancestor's theme). Inside a dark scope, block 2
(`[data-theme="dark"]`) sets the dark neutral-accent values at the ANCESTOR
(inherited down), but block 3 then **re-declares the light values AT THE ELEMENT**,
clobbering the inherited dark — and block 4 never matches (no `data-theme` on the
element). Proof: adding `data-theme="dark"` to that same button flipped it to
`#fffdf2` (computed-style). It is **web-CSS-only**: the RN side
([decision 27](#27-rn-theming--single-orthogonal-context--n55)/[62](#62-nurithemecontext-implemented--the-single-orthogonal-theming-context-lands-in-the-migration-test--n13))
reads `{ mode, accent }` from ONE context and resolves `tokens[accent][mode]` — no
cascade, no clobber. This bug **validates the RN single-context model.**

### The fix · approach A (descendant-combinator dark blocks)

Two new blocks mirror the existing dark values via a **descendant combinator**:

- **#4b** `[data-theme="dark"] [data-accent="neutral"]` — all 6 neutral dark values (mirrors block 4).
- **#6b** `[data-theme="dark"] [data-accent="lilac"]` — the 3 theme-adapting lilac tokens (fg, bg-subtle, bg-subtle-pressed · mirrors block 6 · the P4-frozen solid/solid-pressed/on-solid stay INTENTIONALLY ABSENT, as in block 6).

Specificity (0,2,0) beats the element-self blocks 3/5 (0,1,0), so a self-scoped
accent element with a dark ANCESTOR re-resolves to the dark value. Placed right
after their #4/#6 twin so equal-specificity ties (only when a scope nests inside a
same-theme outer scope) resolve to the same value either way.

**Why A over B (accent-as-pointer indirection · rejected).** B
(`[data-accent]` points at a per-theme intermediate `--nuri-accent-neutral-solid`;
`[data-theme]` defines those) is architecturally cleaner in the browser but
**breaks the pipeline's classify-by-cascade contract**
([decision 28](#28-classify-by-cascade--n55)/[34](#34-per-component-files--tokenpath-union--set-policy--pipeline-emit-shape--n603)):
`--nuri-accent-solid` would classify to signature `accent` (unknown → throws); the
`--nuri-accent-*`-named intermediates declared under `[data-theme]` only fail the
naming↔cascade agreement check; and the Node `resolveValue` chases **primitives
only**, so the semantic→semantic `var()` dangles → build throws. The emit IS the
deliverable (RN), so that is non-negotiable. **A is parser-transparent**:
`selectorMatches` counts `[`=2 and resolves #4b/#6b to the same (accent, dark) cell
as #4/#6 with identical values → **`build/tokens.ts` is byte-identical, zero emit
change.** A is also the better fit for the N+10 attribute-only cascade model
([decision 57](#57-playground)): N+10 dropped `:root` so attribute selectors match
nested scopes — it did not ban combinators, and #4b/#6b add no new dimension.

### KNOWN LIMITATION (revisit-trigger)

A descendant combinator matches **ANY** dark ancestor, not the **NEAREST** theme.
So a self-scoped accent inside a LIGHT scope nested inside a DARK scope resolves
DARK (wrong — nearest is light · verified computed-style `#fffdf2`). CSS cannot
express "nearest scope" without a per-element theme. **No current consumer nests
opposite themes around a self-scoped accent** (the playground scopes ONE theme per
device frame), so accepted per **P11**. **Revisit if** a nested-opposite-theme
consumer lands — the per-element-theme · RN single-context model
([decision 27](#27-rn-theming--single-orthogonal-context--n55)/62) is the clean
answer there. Logged at [RISKS F-SCOPE-3](./docs/RISKS.md#r1--webrn-api-11--props-parity--behavioural-parity).

### Verify (both directions · computed-style)

- **Fixed in scope** · swap neutral `--nuri-accent-solid` `#12110b → #fffdf2`;
  resolved `background-color` `rgb(255,253,242)` (cream) on `rgb(18,17,11)` canvas;
  IconAvatar (neutral self-scope) also `#fffdf2`; self-scoped lilac fg/bg-subtle
  adapt to dark while frozen solid stays `#beaaff`.
- **Light unchanged** · swap stays `#12110b` (no dark ancestor → #4b inert).
- **No N+10 regression** · same-element `data-theme="dark" data-accent="lilac"`
  scope still resolves via block 6 (`#e3ddfa`/`#beaaff`); un-self-scoped elements
  follow nearest theme.

### Gates

`npm test` **22/22** (incl. docs-drift guards); `npm run build` clean +
`git diff --exit-code build/` **byte-identical** (the accent cascade feeds the
emit, but #4b/#6b mirror existing dark values so nothing changed); `tsc -p
docs/migration-tests/button-matrix/tsconfig.json` exit 0.

### Anti-scope (held)

- **Web-CSS-only.** The RN migration mirrors are untouched (single-context · correct).
- **Not papered over in the composition** — the swap's `variant`/`accent` are
  unchanged; the underlying cascade is fixed so EVERY self-scoped accent works in a
  themed scope.
- **One file** (`styles/tokens-semantic.css`) + this decision + RISKS/roadmap; no
  `build/` shape change.

**Operator signed off (2026-06-01)** on approach A and the My-vault dark-mode
visual checkpoint (swap renders as a cream circle · resolved `rgb(255,253,242)` on
`rgb(18,17,11)`), with the nearest-theme limitation accepted per P11 as a
documented revisit-trigger.
