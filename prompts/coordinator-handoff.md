# Coordinator handoff · Nuri · post-Bleed/Move arc · 2026-08-17

You are the **CTO/coordinator** for the Nuri design-system monorepo
(`/Users/darioaschero/Documents/dev/nuri`). This handoff is the authoritative state; the
previous handoff (Bleed + Move reference, 2026-08-15) is fully superseded — that arc is
**CLOSED**: merged (#213), tagged (`rn/v0.1.0-alpha.13`).

## Addendum · 2026-10-14 · the Switch arc is OPEN on `feat/toggle-switch` (unpushed)

State at the end of the 2026-10-13/14 session (this addendum supersedes nothing below; it adds):

- **MERGED as nuri-com/nuri-design-system#223 (squash `455e715` · 2026-10-14) · `main` is GREEN
  again** — the first green since 2026-09-16: the PR also carried the `package-lock.json` fix for
  the `@nuri/gen-ui` workspace the `racer(...)` commits had pushed to main unregistered. Branch
  deleted local + remote. Content — Switch + ListSwitch (option 2:
  the row's pill is a static copy under a parity guard) + schema deltas C1–C3 (`PaletteChrome`
  `inverse-muted` · pressable role `switch` · `propMaps.checked`) + the 72px list-row floor
  (`box.minHeight: '2xl'` on list-action/list-switch) + the Profile
  playground page (`pages/profile.html`: overlay transparent bar via Dock + `inset-top="dock"`,
  two boards incl. the "Bank and Cards" CTA card with a FLAGGED non-DS photo stand-in). Engine
  correction shipped with it: the composition classifier now renders untargeted PURE-STRUCTURE
  subtrees (`isSlotPart`); it had silently dropped the row's track on both targets.
- **Admission draft:** `prompts/admission-switch.md` (unposted) — §A–§E incl. the row floor (§D)
  and the glyph (§E); the Image-primitive gap named as a SEPARATE request. Implementation started
  BEFORE admission on the operator's instruction and is recorded as evidence only. Open ⚠ for the
  operator: thumb fallback (native only now), dark-mode thumb (neutral ON cream vs OFF grey sit
  close), RN accessible-name derivation on device, consumer owner + nuri-expo link, the named
  architect. Native residue: Yoga `aspectRatio`-on-stretch thumb, VoiceOver/TalkBack, press feel.
- **Next arc (hand-off, operator-chosen):** `prompts/brief-media-card-vocabulary.md` — `Image`
  primitive · `box.clip` · ratio leaves (`portrait` · `banner`), on a branch from `main` (#223 is
  merged — no stacking). Its five rulings are RATIFIED (§6): the session starts at §1. The
  "verified" badge uses `check-circle` in currentColor (a bare `check` glyph was added and
  withdrawn the same day — operator ruling: no lilac for now; the icon set is unchanged).
- **Operator's pending go:** publish `prompts/admission-switch.md` as an issue (the admission is
  still PENDING — #223 merged as evidence, not as admission), the #201 cross-reference comment,
  the tag decision (`rn/v0.1.0-alpha.15`? last tag `rn/v0.1.0-alpha.14` — the consumer vendors by
  tag), and what to do about `packages/gen-ui` (35 commits by Emin Mahrt pushed straight to main
  on 2026-09-16, outside the PR/admission flow; no README; `live.test.js` calls an external MCP
  endpoint; couples to prototype CSS by path; not covered by the 5 gates). Never merge, never tag
  without the explicit go.
- Lesson filed in memory: assert a composed descriptor's STRUCTURAL parts render on both targets
  by geometry; roles/states/first-run snapshots do not prove presence.

## Addendum · 2026-10-14 (2) · the media-card arc is MERGED as evidence (#225 · squash `66d31d6`)

State at the end of the 2026-10-14 hand-off session (adds to the addendum above; supersedes nothing):

- **MERGED as nuri-com/nuri-design-system#225 (squash `66d31d6` · 2026-10-14 · the operator's own
  merge · the 5 gates green) · `main` is GREEN.** Branch deleted local + remote. The arc shipped from
  `main@c5e830d` — the `prompts/brief-media-card-vocabulary.md` arc executed in ONE
  session, §1 → §3 → board swap → demo screen → docs → gates → evidence: ratio leaves `portrait`/`banner`
  · `box.clip` (the 4th versioned `BoxNS` add · Guard-F pin moved) · the `Image` / `<nuri-image>`
  primitive (box only · `fit` cover|contain · `accessibility-label` mirror · absent ⇒ decorative · the
  ring). `profile.html` board 2 is pure DS (the flagged stand-in is gone) + a copy-lengths board;
  expo-demo `Profile.tsx` is the RN twin (Menu → "Profile · media card"). Evidence under
  `docs/evidence/media-card/` (web boards · RN-web twin), all by probe. Local gates: root 125 ·
  prototype 127 · doc 3 · rn 299 + tsc · expo-demo 21 + tsc · re-emit hash-identical over 94 files.
  CI on #225: 5/5 green before the merge.
- **Admission draft:** `prompts/admission-media-card-vocabulary.md` (unposted · the executed evidence
  + native residue filled in). The merge is EVIDENCE, not admission (the #223 precedent) — the record
  is still to be published as an issue, and the architect question is OPEN: the operator named HIMSELF
  as architect (2026-10-14) while also being the requester, which the policy's overlap clause does not
  allow without a second named human reviewer. Three options were put to him (a second human · the
  #197 "fresh agent session as independent review" position, written in as an explicit choice · post
  as-is with the overlap declared); no answer yet. Do not post the issue until he picks one. Never tag
  without the explicit go.
- **Correction the arc surfaced (memory: rn-static-assets-carry-intrinsic-size):** the brief's "RN
  Image never derives a dimension from the asset" is FALSE for bundled static resources on native AND
  react-native-web; the primitive neutralises the default (`width/height: 'auto'` ahead of the box).
  The web board had passed and proved nothing about RN — probe RN-web by geometry before verifying.
- **Decisionlog practice (observed):** `decisionlog.md` is untouched since #140 (archived · immutable);
  #223 recorded its schema deltas in the Guard-F pin comment + the admission record, and #225 follows
  the same practice. The Switch record's "decisionlog amendment" acceptance line is stale wording.
- **Operator-local state preserved:** `.claude/launch.json` (dev-server entries) and
  `packages/expo-demo/src/screens/index.tsx` (the LOCAL-ONLY harness) were NOT staged; the harness was
  pointed at Profile only for the RN-web evidence and restored byte-identical afterwards.
- **iOS native verified on the simulator** (Expo Go SDK 54 · iPhone 16 Plus · `expo start --ios`
  installs the matching client; App-Store Expo Go is SDK 57 now, so a physical iPhone needs a dev build):
  card ≈394×197 pt, photo ≈130 pt wide, clipped at the corners, ring on — `ios-sim-profile.png`. The
  text column is `justify="between"` (operator ask · `b822d36`). **Residue still the operator's:**
  VoiceOver/TalkBack on the decorative photo · the ring in dark mode on device · Android corner clipping.
- **Operator's pending go (unchanged + one more):** publish the Switch admission (`admission-switch.md`)
  AND the media-card admission as issues · the #201 cross-reference · the tag decision (last tag
  `rn/v0.1.0-alpha.14`; #223 + #225 both unreleased) · `packages/gen-ui` · the orphan
  `native-text-input-command.web.ts`.

## Mode for the next session

Coordination over closures and follow-ups — no live implementation arc is open. The named
work below is either operator-owned (device pass, decisions), brief-sized (List refactor),
or org-level (#197). Design conversations stay collaborative prose with per-item operator
ratification; implementation goes to working-agent sessions off house-format briefs.

## Non-negotiable operating rules (learned; do not relearn the hard way)

1. **The playground is the consumer channel.** The nuri app team implements from a
   playground LINK; expo-demo is the internal bed. A pattern not expressible in pure DS
   composition on a playground page does not exist for the consumer. Ship gate.
2. **Agent output is a proposal, never a decision.** Operator ratifies per item, each item
   stated WITH its user-visible consequence. Never cite a lock back at the operator.
3. **Never merge** (`gh pr merge` never, `--admin` never). Stop at ready + green + evidence
   + named blockers. Tags are cut only on the operator's explicit go.
4. **Verify pattern arithmetic against the PUBLIC leaf type, never the token scale** —
   tokens are a superset (the `gap="2xs"` miss: token existed, `SpaceLeaf` didn't carry it;
   coordinator AND architect both missed it; the working agent's STOP caught it).
5. **A scoped request stays scoped.** When a model constraint suggests a wider
   implementation than asked (the avatar-border → global-outline mistake), bring the fork
   to the operator BEFORE building the wide version.
6. **The admission record precedes the merge** — and the reviewer will hold you to
   `docs/design-system-admission.md` (#197). Supersessions of admitted contracts get
   addenda + independent-architect re-look on the issues, not just PR prose. Known open
   conflict: that policy's "second human reviewer" clause vs the solo-operator reality
   (see Open items).
7. **Enforcement beats documentation** for contract exclusions: a documented "not valid
   content" claim must fail named at runtime on both projections (the Bleed scaffold
   exclusion pattern: internal context + `useAssertNotBandContent` on RN, `closest()` guard
   in `connectedCallback` on web).
8. Operator-session gh-auth "invalid token" claims are a recurring FALSE alarm — verify
   with `gh auth status`; never `gh auth login`. The gh token lacks `project` scopes;
   Project-board flips are the operator's (UI) unless he runs
   `gh auth refresh -s read:project,project`.
9. The iOS-simulator MCP on this Mac false-negatives ("Xcode not selected"); use the
   in-app driver + `simctl` technique (memory) or the operator's device.
10. Playground pages are pure DS composition; gaps are REPORTED, never hacked. Boards are
    verified by measurement (deep-box probe / `elementFromPoint`), not by eye — and
    near-metamer colours (translucent-vs-opaque hairlines on cream) are settled by
    computed values, not screenshots.

## Repo state

- `main@026c2c3` = squash of #213 "Bleed + the packaged Move reference". Released:
  **`rn/v0.1.0-alpha.13`** tagged on that commit and pushed (message carries the full arc
  content · alpha.12 + #208, #209, #213).
- Admissions: [#211] SelectTrigger (retroactive · addendum 2 with the operator
  supersessions · architect Admit + Admit-addendum) and [#212] Bleed (addendum with the
  space-retune supersession + hit-transparency contract · same verdicts). All verdicts are
  agent-session reviews posted from the operator's account — the attributability question
  is the #197 item below.
- Local tree carries the two operator-local edits — `.claude/launch.json` (dev-server
  entries incl. `nuri-docs-8767`, `expo-demo-web`) and
  `packages/expo-demo/src/screens/index.tsx` (LOCAL-ONLY overview harness) — plus
  untracked docs/prompts files. Preserve; never stage (explicit paths only, never
  `git add -A`).
- Untracked orphan still pending the operator's call:
  `packages/rn/runtime/native-text-input-command.web.ts` (as `.web.ts` it silently shadows
  the tracked `.ts` in local web runs). Keep-and-commit or delete.

## What the closed arc shipped (context, not tasks)

- **`Bleed` / `nuri-bleed`** — controlled negative space: `top|bottom|x|y` space leaves →
  negative margins on both targets; fixed internal lift; RN measured-box containment;
  **hit-transparent band as enforced contract** (RN: `box-none` wrapper + internal context
  cascade over Views, distribute wrappers, descriptor view/text/icon/image hosts, Text,
  NuriIcon, Separator; web: inherited `pointer-events:none` + per-leaf re-enables);
  scaffold/gesture primitives (Scroll, Screen, Header, Footer, Dock) fail named in-band on
  both projections; raw non-DS views excluded by documented contract.
- **The Move reference** on `packages/playground/pages/move.html`: canonical board
  (intrinsic 60px From strip · growing To card · arrow-down disc on the 6px Bleed seam =
  `gap="xs"` firing twice), the inverted-weights board, the bottom-sheet account picker
  ("Move from" topbar · unified-balance list grammar with provider bands · inline-muted
  balances · selection check trail · real Bitcoin logo (Wikimedia PD) + declared stand-in
  Lightning roundel). Expo twin mirrors 1:1; consumer seam overlay fully retired.
- **Retunes (operator-ratified, recorded in the #211/#212 addenda)**: space `xs` 4→3px +
  `2xs` retired; icon-avatar `sm` 36→24px with 18px glyph; select-trigger 36px min-height +
  unified `sm` gap; select-field caret 24→18px (subtle kept).
- **`border-translucent`** (black/white 10% · reuses L1 alpha overlays · first 2-segment
  theme-invariant refs) as the image LEAF's own ring — outline untouched.
- **`contentMode` bridge** (`api.propMaps.contentMode`, versioned envelope add): routed
  content drives an internal axis as data; icon-avatar `mode` suppresses the root paint in
  image mode (no more double border / oval); emit-time bridge validation; bridge axes
  excluded from web observed attributes.
- Doc truth pass across the IR; evidence at `docs/evidence/bleed-move/move-boards.png`.

## Open items (ordered)

1. **Consumer pin bump** (nuri app team): pull `rn/v0.1.0-alpha.13`. The tree≡tag rule
   applies — the UNPATCHED documented pull flow must regenerate the committed tree from
   the pin; a pull-script patch in the same PR = fix upstream here and re-tag.
2. **iOS device pass** (operator, phone via Expo Go): the seam touch + the native Bleed
   hit-routing (web/RNW proven by probe; native is the one undeclared-by-test residue).
   `expo-demo-web` serves web AND the phone (`exp://<LAN-IP>:8082`); metro caches hard —
   restart `--clear` when in doubt.
3. **#197 admission-policy amendment** (operator, org-level): #213 merged on an owner call
   OVER the review's P1 (admission attributability). The durable fix is posting the §5
   requested changes from `docs/agent-operating-model-ds-review.md` on #197 — the
   "second human reviewer" clause needs single-operator-honest wording ("a fresh agent
   session or CI, not an imaginary second human"). The four review rounds on #213 are the
   worked example to attach.
4. **List gutter refactor brief** (coordinator drafts, house format): List stops owning
   row-level padding; rows bleed edge-to-edge via `Bleed` — the second admitted consumer
   (#212). Cite the hit-transparency contract; rows are pressable so the cascade must
   leave ListAction targets intact (already the design).
5. **Common select component page** (decision, then small brief): SelectField +
   SelectTrigger have no component reference page since the trigger-candidates strip was
   pruned from move.html.
6. **Orphan decision** (operator): `native-text-input-command.web.ts`.
7. Optional, operator-priced: the D4 zero-state amount board; the real
   Arkade/Lightning brand asset to replace the declared stand-in roundel
   (`packages/playground/assets/logos/lightning.svg` + expo png).

## Residuals & context pointers

- Evidence: `docs/evidence/bleed-move/` (headless Chrome · boards ~2150–2400px wide;
  twin shots need the demo entry pointed at Move — stash the operator harness, restore).
- Playground serving: static http-server (`nuri-docs*` entries). Beware STALE SERVERS
  from other sessions on 8766 — a dead/stale server shows ghost pages; verify what a port
  actually serves (`curl | grep`) before debugging "wrong renders". Expo web on 8082.
- Admission records: #211 + #212 (bodies + addenda + architect comments) are the contract
  SoT for SelectTrigger and Bleed; `docs/design-system-admission.md` is the team policy;
  `docs/agent-operating-model-ds-review.md` §5 is the operator's pending counter-position.
- Memory carries the durable lessons (playground-is-the-consumer-channel ·
  verify-leaf-reachability-not-token-existence · surface-lock-consequences ·
  never-merge-yourself · dont-reflexively-defend · sim-matrix-in-app-driver). Trust the
  repo + this file over memory on state.
