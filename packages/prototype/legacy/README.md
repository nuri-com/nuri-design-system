# `legacy/` — the pre-axes hand recipes (frozen archive · N+36)

This directory is a **quarantine**, not a build input. Everything here is a
**pre-axes hand recipe** — authored before the design system converged on the
axes/descriptor model. It is moved here (`git mv`, never deleted) to draw the
**coherence line** the convergence pass needs:

> **active = `{primitives + the 3 descriptor recipes}`** (button · icon-avatar ·
> topbar). **Everything else = frozen** — rebuilt as a descriptor *on demand*,
> not maintained as a hand recipe.

See **decision §64** (composition model · open primitives / **closed recipes** ·
the keep/archive taxonomy) and `docs/package-architecture.md` §3.2.

## Status (what `legacy/` is NOT)

- **NOT gated** — no test walks it; `npm test -w @nuri/spec` ignores it.
- **NOT doc-genned** — it is absent from the nav (`lib/docs/shell.js`), from
  `llms.txt`, and from the descriptor/doc emitters.
- **NOT a dependency** — the active tree never imports or loads anything here
  (`grep -rl 'legacy/' packages/spec/{pipeline,lib,styles,pages,build}` = 0).
- **NOT live** — nothing here was flipped on; **decision 2 is untouched**.

## What's here

### `components/` — 7 hand-recipe component dirs (`.css` + `.js`)

| dir | notes |
|---|---|
| `list` · `list-item` · `list-interactive-item` | the List family primitives |
| `nav-item` | the first closed recipe (decision 52) |
| `switch` | toggle input |
| `tabs` | segmented control (defines `nuri-tab`) |
| `typography-stack` | stacked-text recipe |

> **Pruned (oracle spent · git-recoverable):** `icon-button` (rebuilt as
> `iconButtonDescriptor` · #92) and `tab-bar` (rebuilt as `tabBarDescriptor` /
> `tabDescriptor` · #96) were removed once their active-playground pages
> (`packages/playground/pages/{icon-button,tab-bar}.html`) confirmed superseded —
> the §1.C prune of `docs/primitives-contract.md`. Their pre-axes recipes live in
> git history if a future rebuild needs the exact old source.

### `pages/` — the 5 hand doc pages

`list-base.html` · `list-nav-item.html` · `switch.html` · `tabs.html` ·
`typography-stack.html`. (The `icon-button.html` / `tab-bar.html` doc pages were
pruned with their components — see above.)

### `playground/` — the 2 pre-axes compositions

`my-vault.html` — **the rebuild spec**: the wallet home screen composed from the
old recipes. It is the canonical reference for what a converged, descriptor-built
screen must reproduce. `composition-prototype.html` — the earlier composition
sandbox.

## Loadability

These files are **recoverable and readable** (frozen snapshots), but their
component-relative asset links (`../../lib/components/<name>/…`) point at the
**pre-archive** layout. Opened in place they render their *shells* but not their
moved-component children — they are meant to be **read as specs and recovered via
git history**, not run as live pages. To run one, restore it (and the component
it needs) to the pre-archive paths, or rebuild the component as a descriptor.

## Where this goes next

- **Convergence phase 5 (ledger purge):** this archived list is the input set.
- **At the package carve** (decision 68): `legacy/` relocates into
  **`@nuri/prototype`** alongside the other build-free web recipes — it is the
  recipes' eventual home (`docs/package-architecture.md` §3.2 / §3.5).
- **Rebuild-as-descriptor on demand:** when a screen needs one of these, it is
  re-authored as an axes/descriptor recipe in the active tree — not revived here.
