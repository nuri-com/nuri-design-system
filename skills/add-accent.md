---
name: add-accent
description: Use this skill when adding a new accent or colour scale — extends `tokens-primitive.css` with 24 raw values and `tokens-semantic.css` with the per-family cascade pattern (bright vs saturated).
---

# Skill · Add a new accent / colour scale

1. Add 24 raw values to `tokens-primitive.css` (12 steps × 2 themes).
2. If it's an accent (not just a neutral choice), add to
   `tokens-semantic.css`:
   - `[data-accent="<name>"]` block with the six `accent-*` tokens at light
     (`accent-fg`, `accent-solid`, `accent-solid-pressed`, `accent-on-solid`,
     `accent-bg-subtle`, `accent-bg-subtle-pressed`)
   - `[data-accent="<name>"][data-theme="dark"]` block with dark overrides
3. Identify the family:
   - **Saturated** (gray, blue, red, jade): full mode swap — dark block
     redeclares all six `accent-*` tokens to `-dark` variants.
   - **Bright** (lilac, amber, mint, yellow, sky): freeze `accent-solid`,
     `accent-solid-pressed`, and `accent-on-solid` — dark block redeclares
     only `accent-fg`, `accent-bg-subtle`, and `accent-bg-subtle-pressed`.
4. Every new accent generates 6 `accent-*` tokens varying across
   (accent × theme). Each requires Format B per
   [decision 33](../decisionlog.md#33-semantic-token-docs--format-b-verbose-dual-mode-for-context-dependent-tokens--n601):
   canonical Format B at the new `[data-accent="<name>"]` block
   (block 5 / 7 / 9 / …), terse `(matrix in block N)` cross-ref at
   the corresponding dark block (block 6 / 8 / 10 / …). For bright
   accents, the partial-redeclare note (FROZEN vs theme-adapting)
   goes in the canonical comment per
   [P4](../pages/principles.html#p4-mode-accent-composition); the
   dark-block header explains the intentional P4 omissions for the
   frozen tokens.
5. Respect the cascade order in AGENTS.md "Cascade ordering". Reordering
   breaks nested demo scopes.
6. Add to `NuriState.AVAILABLE.accent` in `lib/docs/state.js` if the accent
   should appear in the topbar control (today: topbar accent toggle
   is excluded — accent changes happen via inline page controls).

## Anti-goals (parsimony · P11)

- Don't pre-emit accent scales that aren't actively consumed by a
  semantic block today. The 6 alternative-neutral speculative
  scales (mauve / slate / sage / olive / sand / cream) are the only
  current exception — they live in `RESERVED_COLOR_SCALES` in
  `pipeline/tokens-parser.test.js` with the exploration-page-switcher
  justification.
- A new speculative accent / neutral scale requires extending
  `RESERVED_COLOR_SCALES` with a one-line justification BEFORE the
  build will pass. No "ship the family, justify later".
- Don't ship a status-family scale (`green` / `orange` / `red`)
  ahead of the first status-using component — the foundation +
  scale land together with Toast / Alert / StatusPill, never as
  placeholders.
- See [P11](../pages/principles.html#p11-parsimony) ·
  [decision 30](../decisionlog.md#30-primitive-parsimony--no-speculative-additions--n571).
