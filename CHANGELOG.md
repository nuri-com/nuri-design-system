# Changelog

Newest first. SHAs are 8-char commit hashes on `main`. Tags follow the scheme `rn/v0.1.0-alpha.N` (the `@nuri/rn` vendor pin).

## 2026-10-14 — [RELEASE] rn/v0.1.0-alpha.15 — hermes-agent for emino

Current state of `main` at HEAD `d6f153aa`. Latest tag `rn/v0.1.0-alpha.15` points at `66d31d66`; HEAD adds only `prompts/` handoff notes, so the version is unchanged. No new tag or release created (tags are cut by the DS maintainers as consumer pins).

- npm-workspaces monorepo: `@nuri/spec` (pure data SoT), `@nuri/rn` (production RN projection), `@nuri/prototype` (web projection), `@nuri/doc` (GitHub Pages docs), `@nuri/playground`, `@nuri/expo-demo`, `@nuri/gen-ui`.
- Root codegen `scripts/tokens-parser.js` regenerates `packages/rn/generated/` and `packages/prototype/generated/`; 5 required CI gates in `gates.yml`.
- Docs: root README rewritten with Logs, Status, Architecture, User flow, Components, API and Run sections; CHANGELOG.md and PROMPTLOG.md added. No code changed.

## 2026-10-14

- `d6f153aa` docs(handoff): records post-#225 state: merged as evidence, `main` green, architect overlap still open (#226).
- `66d31d66` feat: media-card vocabulary: `Image` primitive, `box.clip`, portrait/banner ratio leaves, as evidence for a pending admission (#225). Tagged `rn/v0.1.0-alpha.15`.
- `c5e830df` docs(handoff): records post-#223 state and next arc from `main` (#224).
- `455e7150` feat: `Switch` and `ListSwitch` binary setting toggle, as evidence for a pending admission (#223).

## 2026-09-16

`@nuri/gen-ui` built in a series of racer commits: MCP tool schemas and responses rendered as Nuri UI.

- `022845e6` Adds guardrails: jargon ban test and app smoke test.
- `886137a4` Live MCP wiring: auto-connect, real home data, one-tap provisioning, human-readable errors.
- `686c7791` Home dashboard plus 3 flow screens in Nuri components, hash routing.
- `cde68392` Curated copy and flow definitions for 6 tools, no jargon.
- `c7c5b644` App shell: Nuri DS browser harness at `/app`, phone width.
- `3fb163de` Session layer: auto-connect, session captured and injected, never exposed.
- `7ac8b29d` Demo: action list as large cards, prompt on top, card feed.
- `354d82df` Validator bans raw enum values; live check stays 9/9.
- `4f2015fb` Renderer: response cards with status badges, amount hero, SVG icons.
- `e18b6af1` Dark skin: near-black tokens, Inter, airy card styles.
- `af3cdf98` Mapper humanizes enums, adds icon keys, amount and status classification.
- `aaac71d5` Demo as a conversation: action list, history, auto state.
- `d44531a0` Live test: 9/9 and no visible snake_case labels.
- `128b4593` Renderer shows the response as a chat message with an "Advanced" group.
- `e72375a4` Validator bans snake_case, adds interpreter rules.
- `ef10b996` Mapper becomes a translator: human labels, field classification.
- `702cc8af` Live test and demo verification against the text rule.
- `42ac51b4` Mapper sets `collapseAfter` everywhere; validator penalizes missing ones.
- `c12a3807` Renderer: teaser plus "more" toggle for long texts.
- `762f1fbe` Catalog rule: `collapseAfter` prop and text rule.
- `4b74a6a1` Guards `process` access in `mapper.js` and `renderer.js` so they run in the browser.
- `088f8c4b` Demo form rendered via `schemaToTree` + `renderTree`; app layout done.
- `00d507a8` Demo as a real app: prototype DS, 420px layout, states.
- `d03a256a` Live test against the new catalog: 9/9 valid.
- `3c144ecb` Renderer for 10 components; responses map to List/Paragraph.
- `03559a6a` Strict validator against the new catalog.
- `1c028318` Mapper fix: enum to Dropdown, boolean to Switch, short labels.
- `a67b3d89` Catalog rebaseline: 10 components as the single truth.
- `d56b6e48` Demo page and `npm run demo` (server, auto-open).
- `8f0d9d36` Renderer: tree to DOM and tool response to tree, DS styling.
- `19958504` Live test: all 9 MCP tools return valid trees.
- `2b849c87` Validator rejects unknown components and props.
- `441b47fc` Mapper: `inputSchema` to UI tree, form values to `tools/call` args.
- `8d02686b` MCP JSON-RPC over HTTP client (list and call).
- `b4679cb5` Catalog: 8 typed UI components as `catalog.json`.
- `1792d32c` Ignores a local-only 110MB fig file and `.racer` logs (fixes GH001 push).

## 2026-08-26

- `251ca3af` feat(playground+demo): Cards boards and the carousel account-view prototype (Rail, loop, predictive commit) (#215).

## 2026-08-17

- `96573218` feat(playground): Move blocked states, Scan recipient exploration, NuriRoot scroll correction (#214). Tagged `rn/v0.1.0-alpha.14`.
- `026c2c38` feat: `Bleed` primitive and the packaged Move reference (seam, boards, sheet picker, avatar ring) (#213). Tagged `rn/v0.1.0-alpha.13`.

## 2026-08-14

- `b14e5bec` feat: adds `SelectTrigger` and the Move parity proof (#209).
- `5acca9a9` feat(playground): Move board (#208).

## 2026-08-13

- `a2892232` fix(rn): scopes modal keyboard ownership (#207). Tagged `rn/v0.1.0-alpha.12`.

## 2026-08-11

- `fd71aedd` feat(playground): large-title add-money board (#206).

## 2026-08-10

- `536da2ac` fix(doc): stages playground image assets into the Pages deploy (#205).
- `7a6f5869` feat(playground): unified balance screen set (#204).
- `01b191d5` Refactors fixed regions to a one-pass layout (#198).

## 2026-07-17

- `cdf389d6` Adds the lane-specific design-system admission contract (#197).

## 2026-07-15

- `0b251cda` TextField native authoritative reconciler (#196). Tagged `rn/v0.1.0-alpha.11`.
- `e5d45632` feat(rn+web): `SelectField` and country-picker pattern: pressable a11y channels, topbar content lane, header safe-area chrome (#195).
- `eb041aa2` feat(schema): image node type, avatar source mode, TextField size axis (#194).
- `078b6361` feat(rn): `Modal mode="sheet" | "full"`, one blocking presented surface (#193).
- `d5d3fdc7` refactor(rn): extracts `usePresentedLayer`, behavior-preserving (#192).
- `7b2ead8e` feat(rn): toast swipe-up dismissal via JS drag layer (#191).
- `ddcd50be` feat(rn): `Toast`, overlay tenant #2, imperative, above the sheet (#190).

## 2026-07-14

- `d9d528cd` feat(icons): spinner, the staggered-ring motion glyph (#189).

## 2026-07-13

- `ba0397ce` Adds the Receive Bitcoin playground (#188). Tagged `rn/v0.1.0-alpha.10`.
- `5fa1a3b6` feat(playground): bottom sheet payment flows (#187).
- `beeb36c0` feat: extends form APIs, adds the lightning icon (#186).

## Earlier history

191 earlier commits, from `6ecd73b0` (2026-06-01, "Initial commit · Nuri design-system specification") to `3a912e78` (2026-07-11, #185, tagged `rn/v0.1.0-alpha.9`). Tags `rn/v0.1.0-alpha.1` to `rn/v0.1.0-alpha.9` fall in this range. Design rationale is recorded in `decisionlog.md` and `roadmap/`.
