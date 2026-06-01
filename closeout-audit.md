# Close-out audit · N+10 (Playground)

Read-only cross-file drift audit. Automated gates (build/test/tsc) already pass; this covers what they cannot see.

## Bugs

(none introduced this session)

## Drift

- `pages/components/topbar.html` + `pages/components/box.html` — **pre-existing** `controls="theme accent"` (SPACE-separated). `<nuri-demo>` splits `controls` on **comma** then filters against `VALID_CONTROLS` (`lib/docs/demo/demo.js`), so `"theme accent"` survives as a single token, matches nothing, and is dropped — those two demos render **no** toolbar toggles at all (the author intended theme + accent). Not introduced by N+10 (the playground touched no DS component page). Suggested fix: `controls="theme,accent"`. Spun off as a separate task rather than fixed inline (out of the playground's change surface).

## Smells

- `lib/playground/shell.js` — playground topbar navigation rides native `<button>`s (`nuri-button` / `nuri-icon-button` expose no `href`) wired with click→`location.assign`. Functional and keyboard-activatable, but a real `<a>` would be the more semantic affordance (back / "Design system" are navigations, not actions). Acknowledged in [decision 57](./decisionlog.md#57-playground--a-separate-composition-area--nuri-demo-device-frames--board-layout--scoped-device-theming--attribute-only-data-neutraldata-fontdata-themelight--n10); a DS `as-link` button/icon-button is the clean future fix, out of scope now.
- `lib/docs/demo/demo.css:51` — the board height chain runs through `nuri-demo:has(.nuri-demo-card[data-layout="board"])`. `:has()` is modern-browser-only; acceptable here because the playground is a dev-preview surface (the whole docs site already assumes a current Chromium/WebKit), but it is the one place a board card silently degrades on an old engine.

## Clean (verified holds)

- **Anchor chain.** All six cross-references in decision 57 resolve to real headings — 21 (`Consumer model · three agent personas + operator · N+3`), 30, 31 (`Default neutral scale = cream · CLI parameter …`), 42, 46, and the 57 self-anchor — confirmed against the actual `## NN.` headings. The two stale forms first drafted (`#21-agent-first-documentation-loop…`, `#31-build-resolves-one-neutral-scope…`) were corrected to the canonical forms used elsewhere in the repo; **zero** occurrences of either stale anchor remain.
- **Topbar component deps.** Both `pages/playground/my-vault.html` and `pages/playground/index.html` load the DS topbar's stack (`topbar` · `typography` · `icon-button` · `button` · `icon` · CSS + JS); `caret-left` is present in `lib/components/icon/icons.js`. The index page (previously minimal-dep) was extended to match — no missing-upgrade flash.
- **`accent`-with-`theme` is a net-positive cross-cutting fix.** Seeding `accent` onto any themeable scope that carries `theme` (`lib/docs/demo/demo.js`) also repairs the SAME latent accent→neutral revert on DS `controls="theme"` demos (`separator` / `typography` / `tab-bar` / `list-nav-item` / `stack` / …): toggling those to dark previously dropped the brand accent to neutral; now lilac survives. Identical at rest in light (pinned lilac === inherited lilac), so no visible regression — only a dark-mode correctness gain.
- **DS pages otherwise untouched.** Without `device` in `controls`, `<nuri-demo>` takes the non-device path (`device=''` → no frame, no forced-dark code pane, the one whole-card scope as before). The gate log confirms no `COMPONENTS` / `build/` emit change — the playground ships no DS component.
- **Token hygiene.** The only raw hex in `demo.css` is device-**hardware** chrome — `#0b0b0d` (bezel · pre-existing) and `#000` (camera cutout · new), both deliberately theme-independent (a phone shell / lens hole is black in light and dark), matching the existing bezel precedent. The screen surface and everything inside still resolve through semantic tokens. Device dimensions live as `--nuri-device-*` custom props on the frame (docs chrome), never as DS semantic tokens.
- **Cascade parity.** `[data-theme="light"]` added to semantic block 1 is transparent to the parser's `selectorMatches` (same `matches` + `spec` as bare `:root`), and `primitiveSelectorMatches` now accepts the bare `[data-neutral="…"]` form — together they restore test 7 (`resolveSemanticCrossProduct`) while making light/dark symmetric for nested scopes. `npm test` 19/19 confirms the cream cross-product oracle still holds.
- **Fixed playground surface.** `index.html` + `my-vault.html` pin `<html data-theme="light" data-neutral="cream">` directly (not via `NuriState.set`), so the playground reads light+cream regardless of the shared docs localStorage **without** clobbering the user's DS-area preferences.

## Disposition (main agent · 2026-05-31)

- **Drift (`controls="theme accent"` typo · topbar/box)** — **LEFT for follow-up.** Real but pre-existing and outside the playground's change surface (it touches DS component pages); spun off as a separate task so it isn't lost. One-char fix (space → comma) per demo.
- **Smells (native-button nav · `:has()` board chain)** — accepted as deliberate trade-offs for a docs/playground surface; recorded in decision 57.
- **Logged, not built (P11):** BalanceRow / AmountDisplay / swap-overlay missing-component candidates and the `<nuri-nav-item>` idempotency-guard latent bug (`dataset.nuriComposed = ''` is falsy) carry forward in decision 57 / `roadmap/N+10.md` "Next".
- All other areas verified clean. Gates green: `npm test` 19/19, `npm run build` clean, `npx tsc` exit 0.
