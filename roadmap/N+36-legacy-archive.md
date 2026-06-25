# Session N+36 · legacy archive + minimal demo bench (convergence phase 1)

**Status**: shipped on `feat/n36-legacy-archive` (base `main` @ `773554e`). The first phase of the convergence pass — quarantine the pre-axes hand recipes into `legacy/` (move, never delete) and stand up one `demo.html` that exercises the **active set only**.
**Type**: **mechanical move + bench · REVERSIBLE · NOTHING LIVE.** No generation touched (no emitter / `pipeline/` logic / `build/` output / namespace-CSS shadow changed). **[decision 2](../decisionlog.md) untouched.** No decision opened. The keep/archive line is **[decision §64](../decisionlog.md)** (open primitives / closed recipes · the composition-model taxonomy).

---

## The coherence line this draws

> **active = `{primitives + the 3 descriptor recipes}`** (button · icon-avatar · topbar).
> **everything else = frozen** — rebuilt as a descriptor *on demand*, not maintained as a hand recipe.

The pre-axes hand recipes (and their doc pages + the legacy compositions) dragged into the convergence work — `my-vault.html` alone composes ~7 of them. Quarantining them gives the convergence pass a clean, disjoint active tree and a decoupled bench (`demo.html`) that doesn't depend on any frozen recipe.

## What moved (`git mv` → `packages/spec/legacy/`)

| dest | items |
|---|---|
| `legacy/components/` (9 dirs · `.css`+`.js`) | `icon-button` · `list` · `list-item` · `list-interactive-item` · `nav-item` · `switch` · `tab-bar` (defines `nuri-tab-bar-item`) · `tabs` (defines `nuri-tab`) · `typography-stack` |
| `legacy/pages/` (7 hand doc pages) | `icon-button.html` · `list-base.html` · `list-nav-item.html` · `switch.html` · `tab-bar.html` · `tabs.html` · `typography-stack.html` |
| `legacy/playground/` (2 compositions) | `my-vault.html` (the **rebuild spec**) · `composition-prototype.html` |
| `legacy/README.md` (new) | frozen · not gated · not doc-genned · not a dependency · rebuild-as-descriptor on demand · relocates into `@nuri/prototype` at the carve ([package-architecture §3.2/§3.5](../docs/package-architecture.md)) |

## The active-reference sweep (what was touched + why)

Everything below is an **active** reference to a now-moved name — removed/updated so the gates stay green and the active tree never points at the quarantine. **No emitter or generation logic touched.**

| file | change |
|---|---|
| `pipeline/tokens-parser.js` | dropped the 9 names from the `COMPONENTS` `@layer tokens` **walk list** (21→12). The walk feeds ONLY the build LOG (`componentReports`); the TokenPath union derives from `classifiedGroups` (Slice 5), so the drop is **build-output-neutral** (proven: `build/` byte-identical). |
| `pipeline/tokens-parser.test.js` | removed the IconButton + TabBar fresh-parse dispatch sub-blocks (they read the moved CSS). Button already exercises every `resolveComponentValue` dispatch KIND; archived recipes carry no active test coverage by design. Count unchanged (they were sub-asserts in one `test()`). |
| `lib/docs/shell.js` | removed the 7 nav entries (IconButton · Switch · TypographyStack · Tabs · TabBar · the whole List section). |
| `llms.txt` | removed the 7 component-page lines + the now-empty `Inputs:` / `List:` section headers (keeps Guard A `pages/components/*.html ⊂ llms.txt` consistent). |
| `pages/playground/index.html` | dropped the unused icon-button loads (index mode never renders it — the playground shell only emits `nuri-icon-button` in *document* mode, which only the now-legacy pages use); swapped the `my-vault` card → the new `demo.html` card. |
| `pages/components/{separator,icon-avatar,button}.html` | de-linked 3 prose cross-links to moved pages (kept the word, dropped the broken `<a href>`). `button`/`icon-avatar` are descriptor structure-sources → verified `build/descriptors/*` byte-identical after. |
| `pages/components/palette.html` | removed the tabs loads + the one inert "living consumer · Tabs" `<nuri-demo>` block (palette.html is not a descriptor source). |
| `pages/components/topbar.html` | removed the 4 dead loaders (icon-button + tabs css/js). **Body untouched** (it's the topbar descriptor structure-source → `build/descriptors/topbar.ts` byte-identical). The topbar component does **not** bake icon-button (leading/trailing are positional slotted children · §64), so neither the component nor its descriptor breaks. |

## The one transitional cost (documented, not hidden)

`topbar.html` and `palette.html` stay **active** but their doc-page DEMOS embed now-archived components. Per the brief (remove the dead loaders; no rebuilds), the loaders are gone and the markup left in place, so **those specific demos render inert** (the topbar shell renders; its slotted icon-button/tabs children don't upgrade). This is the literal, minimal consequence of archiving icon-button/tabs while keeping topbar/palette active — it is **not** a gate concern (no gate loads these pages) and not a `legacy/` reference. The clean-up (re-author those demos with active components, or fold the pages) belongs to the convergence doc-cleanup, not this mechanical move. `screen.html`'s escaped `&lt;nuri-tab-bar&gt;` code example is prose, left as-is.

## Gates (all green)

- `npm test -w @nuri/spec` → **70 pass / 0 fail** (count held).
- `npm run build -w @nuri/spec` → `git diff --exit-code packages/spec/build/` **byte-identical** (the archive does not perturb the emitted contract).
- `npm test -w @nuri/rn` → **27 pass + 7 snapshots** · `tsc` **0** for `@nuri/rn` + `@nuri/expo-demo` (web-recipe moves don't touch RN — confirmed).
- `grep -rl 'legacy/' packages/spec/{pipeline,lib,styles,pages,build}` → **0** (active tree never references the quarantine; the prose mentions in those dirs say "legacy" without the slash on purpose — the precise path lives only in `legacy/README.md` + this retro).

## The bench · `pages/playground/demo.html`

The minimal bench, loading **only** active component scripts/CSS: a Topbar (Back/title/Settings), the Button variant×size matrix (solid/soft/ghost × sm/md/lg), 3 IconAvatars (solid/soft/subtle), and a card composed from primitives (box+stack+typography+icon). A theme/accent toolbar flips `<html data-theme/data-accent>` live.

**Visual checkpoint (preview MCP):** all 7 element types upgrade · 11 buttons + 3 avatars + topbar render · **console clean** · the **Dark + Lilac** toggle re-resolves the semantic cascade (body cream→`rgb(18,17,11)`, the solid surfaces neutral→lilac). It works today against the live recipes; at the L3c ·2 flip it becomes the **factory-parity bench**.

## What's next (convergence)

- The **archived list above** = the input set for the **ledger purge** (convergence phase 5).
- At the **package carve** ([decision 68](../decisionlog.md)): `legacy/` relocates into `@nuri/prototype`.
- The L3c sequence (web-factory harness → namespace CSS live+generated → factory sole-renderer + retire the 3 recipes) is unchanged by this — see [`roadmap/index.md`](./index.md) and the memory handoff.
- Doc-cleanup backlog: re-home the inert `topbar.html`/`palette.html` demos onto active components.
