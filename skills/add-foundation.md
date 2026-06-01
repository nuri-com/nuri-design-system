---
name: add-foundation
description: Use this skill when adding a new foundation page (token-driven or sample-driven) under `pages/foundations/`. Mirrors `colour/primitive.html` (canonical reference) or `typography.html` (sample-driven variant).
---

# Skill · Add a new foundation page

**Canonical example**: [`pages/foundations/colour/primitive.html`](../pages/foundations/colour/primitive.html)
(token-driven) · [`pages/foundations/typography.html`](../pages/foundations/typography.html)
(sample-driven).

## Foundation template canonical

This is the structure every foundation page follows. The reference
implementation is `pages/foundations/colour/primitive.html` (token-
driven variant — most complex, exercises the most widgets).

Section order:

1. **Header** · `<nuri-page eyebrow title status lead>` — always
2. **Spec card** · `<dl class="nuri-spec-card" data-foundation="..." data-foundation-status="...">` with 4 DTCG-shaped rows — always
   - Row labels (fixed): **Type · Layer · Source · Status**
   - Cells use `<span class="nuri-spec-card__chip" data-{type,layer,source}="...">` for machine-extractable values; trailing `<span class="nuri-spec-card__meta">` for human-readable elaboration
   - Status row uses `<span class="nuri-tag nuri-tag--{draft,planned,exploratory}">` (modifier class is semantic-only — see [decision 11](../decisionlog.md#11-tag-unification--n1))
3. **Set indicator** · `<p class="nuri-token-meta">Set · <code>core</code></p>` — token-driven pages only. Add live-resolved context (theme/accent/active scale) when the page is reactive
4. **Body sections** · multiple `<section class="page-section" id="...">` blocks. Each has an `<h2>`, prose (`<p>`), and one or more shared widgets:
   - **Token tables** · `<div id="..."></div>` host divs populated by `lib/docs/tokens.js` `NuriTokens.renderTable(...)` calls
   - **Role explainer** · `<div class="nuri-role-legend">` for the 12-step Radix model (use only when actually showing all 12 roles)
   - **Sample ramp** · `<section class="nuri-scale-list">` with `<article class="nuri-scale-card">` children (Typography today; Spacing / Radii later)
   - **Callout** · `<div class="nuri-note">` for TBD / asymmetry / scope notes
   - **Inline interactive control** · the shared `.nuri-control` pill from [`lib/docs/control/`](../lib/docs/control/) works inline (see Semantic page's accent select). Page-local inline scripts hand-author the markup since `window.NuriControl` is defined by a deferred script
5. **Tokens dictionary** · for token-driven pages, sections (4) ARE the dictionary; sample-driven pages add a host div at the end. Not required if the body already exhausts the dictionary
6. **Roadmap** · `<section class="page-section" id="roadmap"><h2>Roadmap</h2><ul class="nuri-roadmap">...</ul></section>` — always

Sample-driven variant (Typography) skips section 3 — no
`.nuri-token-meta` because tokens aren't enumerated directly. The
hub-page variant existed in N+2 but was deleted in N+3
([decision 23](../decisionlog.md#23-entry-pages-eliminated--n3)) — if a
future foundation needs sub-page grouping, use the NAV section-header
pattern (`header: true` in NAV data — see `lib/docs/shell.js`).

*(The hub-page variant existed in N+2 — `pages/foundations/colour.html`
overview — and was deleted in N+3 per decision 23. If a future
foundation has multiple sub-pages, prefer the NAV section-header
pattern in `lib/docs/shell.js` over reviving a hub page.)*

Shared widgets a foundation page may consume — all in `shell.css`:
`.nuri-spec-card · .nuri-token-meta · .nuri-role-legend ·
.nuri-scale-list / .nuri-scale-card · .nuri-token-table (via
lib/docs/tokens.js) · .nuri-note · .nuri-card / .nuri-card--link /
.nuri-grid · .nuri-swatch · .nuri-tag · .nuri-roadmap`.

**Page-local `<style>` blocks are allowed only for genuinely single-
use widgets** (e.g., `exploration.html`'s `.exploration-active-badge`
on a temporary page). Don't recreate inline anything that has a shared
equivalent in `shell.css`.

## Page boilerplate

1. `<script src="../path/to/lib/docs/state.js"></script>` **synchronously**
   in `<head>` before stylesheets — hydrates `<html data-*>` so the
   cascade matches first paint (FOUC prevention).
2. Stylesheets in order: `tokens-primitive.css`, `tokens-semantic.css`,
   `shell.css`. If the page uses `.nuri-type-*` utilities, ALSO load
   `typography.css` AFTER `shell.css` (AGENTS.md hard-rule 16 —
   specificity tiebreak).
3. `<script src="../path/to/lib/docs/shell.js" defer></script>`
4. If using token tables: `<script src="../path/to/lib/docs/tokens.js"></script>`.

Page-local `<style>` blocks are allowed only for genuinely single-use
widgets (e.g., `exploration.html`'s `.exploration-active-badge` on a
temporary page). Don't recreate inline anything that has a shared
equivalent in `shell.css`.

## Anti-goals (parsimony · P11)

- Don't pre-emit foundation scales speculatively. If only
  `shadow-sm` has a consumer today, the foundation ships
  `shadow-sm` only — `shadow-md` / `lg` / `xl` arrive when their
  consumers do.
- The foundation page reflects what ships, not what's planned. No
  "(TBD)" placeholder rows in tables; no example chips of tokens
  that don't exist yet. Future scales surface in the page roadmap
  section with a session anchor, not in the dictionary.
- Don't add a status-family foundation section ahead of the first
  status-using component — the worked precedent is the N+5.7
  status-placeholder cleanup.
- See [P11](../pages/principles.html#p11-parsimony) ·
  [decision 30](../decisionlog.md#30-primitive-parsimony--no-speculative-additions--n571).

## NAV entry

Add an entry in [`lib/docs/shell.js`](../lib/docs/shell.js) under the
`Foundations` group. Flags: `placeholder: true` for stubs,
`nested: true` for sub-pages, `header: true` for non-clickable group
labels. To add a new persisted toggle (e.g., density), edit
`DEFAULT_SPECS` in `state.js`.
