---
name: modify-tokens
description: Use this skill when editing tokens at any layer — primitive (`tokens-primitive.css`), semantic (`tokens-semantic.css`), or component (`lib/components/<name>/<name>.css` under `@layer tokens`).
---

# Skill · Modify tokens (primitive · semantic · component)

- **Primitive** · edit `tokens-primitive.css`. Stay theme-agnostic —
  no `[data-theme]` selectors in this file. Add the `-light` /
  `-dark` suffix per AGENTS.md hard-rule 3 (alpha exempt). The
  dimension scale uses direct-pixel naming (`--nuri-px-N` = literal
  N pixels) per
  [decision 32](../decisionlog.md#32-primitive-scale-uses-direct-pixel-naming---nuri-px-n--n60);
  new pixel values arrive only when a semantic or component
  consumer materialises in the same edit (P11 parsimony).
- **Semantic** · edit `tokens-semantic.css`. Don't reorder the
  cascade (see AGENTS.md "Cascade ordering"). When a name follows
  the established emphasis vocabulary (`subtle`, `strong`, `pressed`,
  `inverse`), pick from that list before inventing a new suffix.
  When the new/modified token varies across cascade dimensions
  ({theme, accent, scope, …}), apply Format B per
  [decision 33](../decisionlog.md#33-semantic-token-docs--format-b-verbose-dual-mode-for-context-dependent-tokens--n601):
  canonical Format B comment at the cascade block where the token
  first declares, terse 1-line cross-refs (`(matrix in block N)`)
  at the other blocks. Tokens invariant across cascade get a
  1-line role description only — no Format B (dependency-driven
  trigger).
- **Component** · edit `lib/components/<name>/<name>.css` under
  `@layer tokens`. Use the multi-selector pattern from AGENTS.md
  hard-rule 7.

System concept vs component concept: if a new token will be reused
by ≥ 2 components, it belongs in semantic. Otherwise in the component.

## Anti-goals (parsimony · P11)

- Modifications don't add new token roles or scale steps
  speculatively. If the brief asks "modify `accent-fg`", don't
  also add `accent-fg-pressed` or `accent-fg-muted` unless the
  brief requires them.
- Renaming or restructuring an existing token does not authorise
  adding sibling tokens for "completeness" — the family arrives
  with the consumer that needs it.
- Primitive-layer edits land or stay deleted; never resurrect a
  previously-deleted family (shadow / line-height / status
  placeholders, per N+5.7) without an active consumer in the same
  session.
- See [P11](../pages/principles.html#p11-parsimony) ·
  [decision 30](../decisionlog.md#30-primitive-parsimony--no-speculative-additions--n571).
