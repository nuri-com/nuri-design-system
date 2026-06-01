---
name: add-component
description: Use this skill when adding a new DS component (Tier 1/2/3 surface with an RN equivalent) — creates `lib/components/<name>/` + `pages/components/<name>.html` mirroring Button.
---

# Skill · Add a new component

**Canonical example**: [`pages/components/button.html`](../pages/components/button.html)
· [`lib/components/button/`](../lib/components/button/).

**Scope of this skill**: this covers **DS surfaces only** — components
that have (or will have) an RN equivalent. They live in
`lib/components/`. Web-only docs-chrome widgets (a new toolbar
control, a new docs callout, a new shell-internal helper) belong in
`lib/docs/` and follow a different shape — no separate skill exists
yet; cite [decision 26](../decisionlog.md#26-ds-surfaces-vs-docs-chrome-are-physically-separated--n35)
and mirror an existing `lib/docs/*` file when the first case lands.

1. **Files**. Create `lib/components/<name>/<name>.css` and `<name>.js`.
   Mirror Button's shape: single CSS file with `@layer tokens` +
   `@layer rules`. Custom element wraps a native element.

2. **Component-token selector**. Use `:root, [data-accent], [data-theme]`
   in the `@layer tokens` block (AGENTS.md hard-rule 7). Single `:root`
   silently breaks Tier 2/3 scope. See the long comment in
   `button.css` for the worked rationale.

3. **Variant manifest comment**. Open `<name>.css` with a comment
   block describing the variant matrix, sizes, states. Human-readable
   counterpart to CVA's variants object; machine-readable structure
   is derived from the CSS itself by the pipeline.

4. **Custom element wrapper**. `display: contents` so it doesn't
   disturb layout; styles target the inner native element. Load with
   `defer`, NEVER sync — sync upgrade fires before children parse and
   `connectedCallback` sees no children. Pre-style with `:not(:defined)`
   to avoid FOUC.

5. **NAV entry**. In [`lib/docs/shell.js`](../lib/docs/shell.js), set `href` on
   the existing placeholder entry (remove `placeholder: true`).

6. **Docs page** `pages/components/<name>.html`. Section order
   (mirror Button):
   - Spec card · 4 rows + chips with `data-*`
   - Hero demo · `<nuri-demo>` showing the default
   - API · attributes / props with types
   - **Anatomy** · `<table class="nuri-table">` — for multi-part
     components, REQUIRED machine-readable attrs per row: `data-part`,
     `data-element`, optional `data-role` (AGENTS.md hard-rule 18)
   - Variants · one `<nuri-demo>` per variant
   - States · one row per state
   - Theming · three demos: page · subtree · self
   - **Token mapping** · `<table class="nuri-table">` — REQUIRED
     attrs: `data-part`, `data-property`, `data-token`, `data-conditions`
     (variant/state combo). This IS the migration wiring spec
     (AGENTS.md hard-rule 18)
   - DTCG dictionary · host div populated by `NuriTokens.renderTable()`
   - Roadmap

7. **Smoke test** via preview MCP. Page renders, console clean,
   theme / accent toggles re-resolve, DTCG table has no `unknown`
   types. For multi-part components, verify the anatomy + token-map
   `data-*` attrs are present on every row.

## Anti-goals (parsimony · P11)

- Don't pre-emit anticipated component parts or variants. Add only
  what the brief specifies; new parts / variants arrive in their
  own session with their own consumer.
- Don't add component tokens (the `@layer tokens` block) beyond
  the variants × states actually rendered. A future variant ships
  with the session that authorises it, not earlier.
- Don't pre-fill the docs page's roadmap with speculative variants
  that don't have a session anchor — leave the section terse and
  honest about what's planned vs deferred.
- See [P11](../pages/principles.html#p11-parsimony) ·
  [decision 30](../decisionlog.md#30-primitive-parsimony--no-speculative-additions--n571).

## What goes in semantic vs component

When a new state needs a token (e.g., "pressed" arrived with Button),
ask: system concept or component concept?

- *System* (≥ 2 components will want it): extend `tokens-semantic.css`.
  Example: `--nuri-accent-solid-pressed` serves Tag, Chip, IconButton too.
- *Component* (only this one): keep in `<name>.css` under
  `@layer tokens`. Example: `--nuri-button-padding-x`.

## Reference · `<nuri-demo>` API

Custom element used in component docs to render an interactive
example with toolbar + preview + auto-derived code. Defined in
[`lib/docs/demo/demo.js`](../lib/docs/demo/demo.js).

Per [decision 10](../decisionlog.md#10-nuri-demo-api--n1), the
`<template>` child is the single source of truth — its children are
cloned into the preview area, its innerHTML is serialised into the
code block. The two cannot drift.

### Attributes

| Attribute | Type | Default | Effect |
|---|---|---|---|
| `controls` | comma-separated subset of `theme` / `accent` / `neutral` / `font` | none | Renders toolbar select(s) for the named dimension(s). Each mutates the inner `<nuri-scope>` only — never `NuriState` or `<html data-*>`. |
| `label` | string | none | Card heading shown above the preview. |
| `subtitle` | HTML allowed (inline `<code>` ok) | none | Subtitle below `label`. |
| `stack` | boolean attribute | absent | If present, preview children stack vertically instead of centered. |

### Markup pattern

```html
<nuri-demo controls="theme,accent" label="Variants">
  <template>
    <nuri-button variant="solid">Pay</nuri-button>
    <nuri-button variant="soft">Cancel</nuri-button>
  </template>
</nuri-demo>
```

The element wraps the entire card with an inner `<nuri-scope>` so the
toolbar + code area get themed too (playground feel, not just preview).

### Reset semantics

Toolbar controls update the inner `<nuri-scope>` only. Reloading the
page resets every demo to its page-level defaults (current `<html
data-*>` from `NuriState`).
