# Admission request — DRAFT, UNPOSTED — Switch + ListSwitch (binary setting toggle · standalone + list row)

Front door: DS contract admission request (`.github/ISSUE_TEMPLATE/ds-contract-admission.yml`).
Prepared 2026-10-13 by the coordinator for the operator, from the operator mocks and the tree at
`main@022845e`. Section order mirrors the issue form (the nuri-com/nuri-design-system#221 precedent)
so it pastes straight in. Items marked ⚠ are open operator rulings; the operator ratifies per item,
then this publishes as its own issue (house sequence: record → independent-architect verdict → Ready
→ brief). Branch `feat/toggle-switch` exists and holds NO code — the implementation brief is gated on
this record and on Project `Ready`.

## Admission class

Extension — Pending/request-only. Two new components plus three versioned schema/axis deltas. No
existing public surface is removed or narrowed (the open `Pressable` primitive's `role` union is
deliberately left byte-identical · see anti-scope), so this is not Mixed.

## Requesting actor / consumer owner

- Requesting actor / evidence owner: @darioaschero (operator); request prepared by the coordinator
  session on the operator's instruction.
- Consumer owner: the Nuri app (nuri-com/nuri-expo). ⚠ Name the app-side owner login.

## Request summary and current state

**Current surface:** Nuri has NO binary-setting control. The catalog's only boolean-state bridge is
`propMaps.selected` (TabBarItem · `role: 'tab'`), which announces "selected", not on/off. The legacy
prototype Switch (decision 44 · `<nuri-switch>` · N+6.5) was retired with the pre-refactor component
layer; nothing replaced it in the data-only catalog.

**Consumer need:** settings rows that enable or disable a payment capability. Operator mock
2026-10-13: "Bitcoin payments" (on) / "Cards and bank" (off), each a list row with a trailing pill
(`docs/evidence/switch/list-switch-mock.png`); the standalone pill in both states
(`docs/evidence/switch/switch-mock.png`).

**Why now:** the Cards area (expo-demo `Cards.tsx` · playground `cards.html` · merged in #215) is
the next screen family; its settings page cannot be expressed in pure DS on the playground, and
"expressible on the playground" is the consumer-channel ship gate.

## Proposed contract delta (not admitted)

### A · `Switch` / `nuri-switch` — the standalone pill

- **Anatomy:** pressable `root` (the track) + one private `thumb` part (`el: 'view'`). Nothing else.
- **Geometry (all on-scale · no new leaf):** track `box: { width: 'xl', height: 'md', padding: 'xs',
  radius: 'full' }` = 60×36 with a 3px inset; `stack: { direction: 'row', align: 'stretch', fill: 'hug' }`
  (`hug` = never shrinks beside long siblings · the TabBarItem root-`fill` precedent). Thumb
  `box: { aspectRatio: 'square', radius: 'full' }` → stretches to the 30px inner height → 30×30.
  ⚠ Fallback if a target cannot derive the width from a stretched height: thumb `sm` (24) + inset
  `sm` (6) = the same 36 track with a visibly smaller thumb. The operator rules on the rendered
  board, not on this prose.
- **Colour:** internal `state` axis `on | off`, default `off`. `on` → track `palette.variant: 'solid'`
  (`accent-solid` · lilac under the default accent, as in the mock). `off` → track
  `palette.chrome: 'inverse-muted'` (NEW chrome surface · C1 · bg `bg-inverse-muted`, the token
  decision 44 created for exactly this). Thumb `palette.chrome: 'canvas'` in both states (lifts off
  either track · decision 44). ⚠ Dark-mode board check: `bg-canvas` turns the thumb near-black on
  the lilac track.
- **Position:** `on` → track `stack.justify: 'end'`; `off` → `'start'`. Instant re-layout (no slide ·
  anti-scope).
- **Interaction:** `interactive: { disabledOpacity: true }` ONLY — no `pressScale`, no `pressColor`.
  Operator ruling 2026-10-13: a switch's native press feedback lives on the THUMB (iOS widens it ·
  Material grows it + a state layer · decision 44 scaled the knob, not the pill), and the engine can
  only express press effects on the pressable root (Channel 2 direction 3; RN flattens children with
  `pressed: false`, `renderer.tsx:507`; web gates on the node's own `:active`, `interactive.css:28`).
  Whole-pill scale at the 0.97 baseline is a Button/Tab feel transplanted and near-invisible on 60px;
  admitting it now would make its later removal an observable contraction. So the control's feedback
  in v1 is the thumb snap on release; cursor + focus ring remain automatic with `el:'pressable'`.
  Honest cost: no touch-down response on native until thumb-level feedback lands (anti-scope).
- **Public API:** `checked?: boolean` (default `false`) via `propMaps.checked` (NEW · C3) · `onPress` ·
  `disabled` · `accessibilityLabel` (required in practice: the control has no visible text) · `accent`
  self-scope (`themeScope.accent`). `axes: []`, `slots: {}`, so the codegen emits `children?: never`.
  Role `switch` (NEW · C2) → RN `accessibilityRole="switch"` + `accessibilityState.checked`; web
  `<button role="switch" aria-checked>` (the decision-44 ruling: a switch, never a checkbox).
- **Controlled and dumb:** the DS never flips the value; the consumer flips it in `onPress`
  (`checked={on} onPress={() => setOn(v => !v)}` · the per-item `selected`+`onPress` grammar).

### B · `ListSwitch` / `nuri-list-switch` — the list row whose WHOLE row is the switch

- **Sibling of `ListAction`** with the same row geometry (`padding: 'md'` · `radius: 'lg'` · `gap: 'md'`
  · `palette.variant: 'ghost'` · `interactive: { pressColor, disabledOpacity }`) and the same `content`
  column with the `text` (md · emphasis · truncate 1) and `textMuted` (sm · muted) component slots
  (`ListSwitchText` / `ListSwitchTextMuted` · `<nuri-list-switch-text>` …). No leading avatar in v1.
- **The trailing part is a private `track` + `thumb` pair — a COPY of A's look** (identical namespace
  values), NOT an embedded `component: 'switch'`. Rationale in the trade study. A parity guard (NEW
  test) pins `list-switch.{track,thumb}` base + `state` variants ≡ `switch.{root,thumb}` minus
  `interactive` (on Switch now only `disabledOpacity`) and `el` — that comparison surface is the
  guard's whole claim. With no press effect on the standalone pill, the same pill behaves identically
  in both contexts: it never reacts itself; the CONTROL does (the row's wash · the thumb snap).
- **The root is the one control:** `role: 'switch'`, `propMaps.checked` on the same internal `state`
  axis, `onPress`, `disabled`, `accessibilityLabel` optional (the row text names the control on web;
  ⚠ confirm on RN that the Pressable derives its name from the descendant text on both OSes, else
  the codegen's existing accessible-name warning applies).
- **Full-row tap target** (the Android/Material model · a strict superset of iOS Settings' pill-only
  target · VoiceOver treats an iOS settings row as one switch either way). Both targets' pressables
  cancel on scroll, so rows do not flip on a swipe-through.
- Two shapes refused by construction: no label slot on `Switch`; no `Switch` inside `ListAction`.

### C · Schema / axis deltas (versioned · the Guard-F pin moves with each)

1. **`PaletteChrome` += `'inverse-muted'`.** `axes/palette-surface.ts` chrome +=
   `{ bg: 'bg-inverse-muted', fg: 'text-on-inverse' }`; `scripts/parsers/palette.js`
   `PALETTE_CONTRACT.chrome` + `ROW_ORDER` mirror it; regen `palette.css` + `palette.ts`; Guard D
   re-derives the surface pairs. Chrome (not variant) because the OFF track must stay accent-invariant.
   The chrome slot has no pressed channel by contract — consistent with Switch having no press-down
   effect at all (no `pressColor`, no `pressScale` · the interaction ruling in A).
2. **`behaviour.pressable.role` += `'switch'`** (`role?: 'button' | 'tab' | 'switch'`). Codegen already
   passes `role` verbatim; RN `PressableHost` accepts it; the web host sets `role="switch"`. Coupling
   rule mirrors the existing tab rule: `role 'switch'` REQUIRES `propMaps.checked`, and `propMaps.checked`
   requires `role 'switch'` — a Channel-4-style guard.
3. **`propMaps.checked: { axis, true, false }`** — a sibling of `propMaps.selected` with the same shape
   and the same validation (internal axis · real values · never in `api.axes`). Output differs: RN
   `accessibilityState.checked` / web `aria-checked`; the generated `{Name}Props` gains
   `checked?: boolean`. Every site that carries the `selected` bridge today (codegen ×3 · validator ·
   guards ×2 · web factory ×4 · RN renderer + host) gains a `checked` twin. `selected` itself is NOT
   generalised or renamed (that would make this Mixed).

### D · List rows gain a 72px floor (operator ruling 2026-10-14 · added after the Profile board)

`list-action` and `list-switch` root `box` += `minHeight: '2xl'` (72 · on the size scale). A list
row had no height rule — it was `padding md` around its tallest flank, so the catalog's rows measured
72 (a 48px avatar), 60 (a 36px switch track), 65 (two text lines) or 48 (a bare chevron row), and the
first avatar-less consumer (the Profile screen) showed three heights on one screen while the mock
keeps a 72 pitch. With the floor every list row is 72, content centred: avatar rows are byte-identical
(already 72), avatar-less, two-line and toggle rows grow. This touches `list-action`'s observable
geometry, so it is named here for the architect as a sibling item of the request (the alternative —
consumer-side spacing — has no DS vocabulary and would be a CSS patch).

### Proposed anti-scope (refused generalisation)

- No `variant` or `size` axis on either component — one pill, one size (decision 44's anti-scope upheld).
- No slide animation and no press-down effect on the pill in v1: the thumb snaps on release and the
  pill does not scale or wash. Thumb-level press feedback (the iOS widen / Material grow) is bundled
  with the slide into ONE follow-up request — both need press/transition state to reach the thumb
  part, which is one mechanism (press-state propagation to child parts, both targets), not two.
- No label slot on `Switch`; no `Switch` embedded in `ListAction` or in any pressable root (web
  `<button>` inside `<button>` · RN's deepest Pressable steals the pill tap).
- No "passive component-ref" render mode and no parent→child prop binding (`$prop.*`) — the two
  mechanisms option 1 needed. Reopening condition: a THIRD consumer of the Switch look (a card or tile
  row); then the mechanism is built against three real cases and the parity guard retires.
- No `checked` / `role="switch"` on the OPEN `Pressable` primitive: `PressableRole` splits into the
  primitive's `'button' | 'tab'` and the descriptor channel's superset, so the primitive's public
  surface is byte-identical.
- No `value` / `onValueChange` / group sugar, no uncontrolled mode, no indeterminate state.
- No new size or space leaf for the 30px thumb (derived from on-scale values, or the on-scale fallback).
- No leading avatar and no `trailingText` on `ListSwitch` in v1.
- No haptics (nuri-com/nuri-design-system#221 territory).

## Consumer need, gap, current workaround and evidence

- **Consumer / owner:** Nuri app · Cards settings (payment-capability toggles). ⚠ owner login.
- **Concrete use case:** the two mock rows — "Bitcoin payments" on, "Cards and bank" off.
- **Gap:** inexpressible in pure DS — no binary-state control, no row grammar for one. `ListAction` +
  TabBarItem's `selected` bridge announce "selected", not on/off; `ListAction`'s trailing slots are
  text/icon only (closed by design); a consumer-composed row cannot carry `role="switch"` +
  `aria-checked` on both targets.
- **Current workaround:** none in the DS channel. The app would hand-roll RN `Switch` + a custom row,
  forking the row geometry, the colour tokens and the a11y semantics across web and RN.
- **Evidence:** `docs/evidence/switch/switch-mock.png` + `docs/evidence/switch/list-switch-mock.png`
  (operator mocks · 2026-10-13); `decisionlog.md` §44 (the retired prototype Switch · same geometry
  class · the `bg-inverse-muted` token · the `<button role="switch">` ruling); `docs/flow-inventory.md:224`
  (C4 card details — the settings-rows family this screen belongs to).
- **Missing:** an exact nuri-com/nuri-expo issue or PR for the Cards settings screen. ⚠ App owner to
  link; its absence may yield `Request more evidence`.

## Class-scoped Extension evidence

- **Recurrence / system invariant:** a binary setting toggle is a platform-standard control (iOS
  `UISwitch` · Android/Material Switch · WAI-ARIA `switch`) and recurs in every settings surface — card
  capabilities now, notification and privacy preferences in the flow inventory's C-series later. The
  a11y contract (role `switch` + checked state, correct on BOTH targets) is a system invariant a
  consumer cannot supply from composition.
- **DS ownership:** the look (track/thumb tokens · on/off colour · press feedback), the row grammar
  (shared with `ListAction`) and the a11y semantics are presentation vocabulary. The VALUE and what a
  press does stay consumer-owned (the DS gives dumb presentation).
- **Trade study:**
  - *Embed `component: 'switch'` in the row (option 1)* — REJECTED for v1, verified against the tree:
    (i) no path for a root prop to reach a component-ref part — `slotProps` come only from
    composition markers (`packages/rn/runtime/renderer.tsx:619`), and `$axis.state → checked` renders
    always-off on RN (string, not boolean) and always-on on web (`setAttribute('checked','on')` is
    true by presence · `packages/prototype/factory/factory.js:479`) — a parity bug by construction;
    (ii) pressable-inside-pressable has no precedent in the catalog (SelectTrigger embeds a decorative
    avatar; Alert/TextField embed Button from a `view` root); (iii) no per-instance passive mode —
    `decorative` is descriptor-level (`renderer.tsx:539`) and the renderer throws on an untargeted
    pressable (`renderer.tsx:694`). Cost: two more schema bumps + RN/web/codegen/validator work, and
    still-invalid web markup.
  - *Private copy of the look in `list-switch` + parity guard (option 2)* — CHOSEN. Zero mechanism
    beyond C1–C3; one control per row by construction; ~6 lines of duplicated data under a guard whose
    comparison surface is named above. The "author it in the spec before the engine" rule.
  - *Public decorative `SwitchIndicator`* — rejected: public surface for an internal need.
  - *`ListAction` + an open trailing slot* — rejected: duplicated label, a 60×36 target, and a pattern
    `ListAction` deliberately closed.
  - *Reuse `propMaps.selected` for Switch* — rejected: announces "selected"; `checked` is the honest bridge.
- **Contract cost:** 2 descriptors · 3 versioned schema/axis deltas · 2 guards · ~20 roster-site edits
  (listed in scope) · 2 doc pages · 2 playground reference pages · 1 demo board. Maintenance: a Switch
  visual change edits two descriptor files (the guard fails until both move).
- **Compatibility:** purely additive. Existing generated outputs byte-identical except the new chrome row
  in `palette.css` / `palette.ts`, the `role` / `propMaps` type widenings, and — measured at
  implementation — the generated doc pages of every open primitive that documents the `chrome`
  attribute (View · Pressable · Header · Footer · Typography: one union cell each gains
  `'inverse-muted'`, i.e. the open primitives can paint the new chrome too, as they can every chrome).

## Requested DS architect / admission recorder

⚠ @darioaschero to name. Precedent: #221 requested @taner-caliskan (requested, not appointed). If the
operator records the decision, the operator is also the requester → a second named human
architectural reviewer is required in the decision record. No architect decision exists in this request.

## Architect decision record location (architect-owned)

(empty on initial request)

## Proposed bounded execution scope if admitted

- **Spec:** `packages/spec/components/switch.ts`, `list-switch.ts` (new); `components/schema.ts` (C1–C3
  types · the Guard-F pin); `axes/palette-surface.ts` (C1).
- **Codegen / guards:** `scripts/parsers/palette.js` (chrome mirror + row order) · `components-api.js`
  (`checked` bridge ×3 · validator · role pass-through unchanged) · `descriptors.js` roster ·
  `component-api.test.js` (Channel 4 for `checked` · role↔bridge coupling) · `docs-drift.test.js`
  (pin + roster) · `spec-agnosticism.test.js` · NEW `switch-parity.test.js`.
- **RN:** `runtime/pressable-host.tsx` (role union split + `checked` state) · `runtime/renderer.tsx`
  (pass-through) · `index.ts` barrel · `__tests__/render-smoke` · `__tests__/public-surface` ·
  `type-tests/component-types` · regenerated `generated/components/{switch,list-switch}.ts` +
  `generated/data/{palette,recipes}.ts`.
- **Web:** `prototype/factory/factory.js` (role + `aria-checked` at the four `selected` sites) ·
  `recipes/{switch,list-switch}.js` · regenerated `styles/palette.css` + descriptor twins ·
  `playground/pipeline/bundle.js` · `pages/component/{switch,list-switch}.html` · `component/index.html`
  · a settings board on `cards.html` carrying the two mock rows.
- **Expo-demo:** `screens/Cards.tsx` gains the two settings rows (pure DS components · RN-translatable).
- **Doc:** `harness/shell.js` nav · `pipeline/component-api-ir.js` · `pipeline/docs.js` order ·
  `pipeline/docs-drift.test.js` pins; generated pages for both components.
- **NOT in scope:** engine mechanisms (passive refs · prop binding) · the open `Pressable` primitive ·
  animation · any `ListAction` change · vendored consumer mirrors (they follow their documented pull
  flow) · the merge (the operator merges).

## Downstream verification plan (before Ready)

- [ ] **Repository checks / CI:** root `npm run build` + `npm test`; the 5 gates (`spec` · `prototype` ·
      `doc` · `rn` render-smoke + tsc · `expo-demo` tsc) including the @nuri/doc workspace; the re-emit
      gate (`git diff --exit-code` after regen); only the generated files listed in scope differ.
- [ ] **Contract / type proof:** `{Switch,ListSwitch}Props` exact in the type-tests (`checked?: boolean` ·
      `children?: never` on Switch · the two slot components on ListSwitch); the parity guard green AND
      mutation-tested (perturb one `list-switch.track` value → red); the `checked` Channel-4 guard and
      the role↔bridge rule mutation-tested; the Guard-F pin moved deliberately with a decisionlog amendment.
- [ ] **Rendered proof (web · in-session):** `component/switch.html` (on/off × enabled/disabled × the
      three accents × light/dark) · `component/list-switch.html` · the `cards.html` settings board. DOM
      probe: exactly one `button[role=switch][aria-checked]` per row; no `nuri-switch` element inside
      `nuri-list-switch`; `elementFromPoint` across the full row width hits the row's button; measured
      60×36 track · 3px inset · 30px thumb (or the ⚠ fallback).
- [ ] **Expo proof (post-implementation):** the `Cards.tsx` rows via the Expo web preview
      (`expo-demo-web` launch), then the native-only residue for the operator on device/simulator:
      VoiceOver/TalkBack announce "switch, on/off" and toggle on double-tap; press feel (row wash on
      `ListSwitch` · thumb snap on release on the standalone pill, no press-down effect by ruling); no
      toggle on a scroll-through.
- [ ] **Real consumer:** an exact nuri-com/nuri-expo PR implementing the Cards settings screen from the
      playground link (the consumer channel) — attached during Verification/Done, never pre-Ready.

## Acceptance criteria and Verification/Done evidence

1. Both components render on RN and web from the descriptors with zero hand-authored platform strings
   (names mechanical kebab↔Pascal).
2. A11y: RN `accessibilityRole="switch"` + `accessibilityState.checked`; web `role="switch"` +
   `aria-checked` mirroring `checked`; exactly ONE focusable, announced control per `ListSwitch`.
3. Geometry and colours equal the token values above on both targets — screenshots filed under
   `docs/evidence/switch/`.
4. Full-row tap toggles (probe-measured, not by eye); a disabled row is inert and dimmed.
5. The parity guard and the role↔bridge guard are present, green and mutation-tested.
6. Full gate suite green, including @nuri/doc.
7. Doc pages generated for both components (Guard G).
8. Decisionlog amendment logged for C1–C3 (a 65.x amendment).
9. This issue's status line flipped in the SAME PR that ships the implementation (ledger hygiene).

## Owning repository / dependencies / risk

- nuri-com/nuri-design-system @ `main` (baseline `022845e`).
- Risk: **Product** (public contract + a11y semantics; no native-module, security or funds surface).
- Dependencies: nuri-com/nuri-design-system#201 (list-family tracking — `ListSwitch` joins the family;
  the pending list-gutter contraction applies to it exactly as to `ListAction`) ·
  nuri-com/nuri-design-system#212 (Bleed — the edge-to-edge row construction applies unchanged) ·
  nuri-com/nuri-design-system#221 (haptics — not extended here) · `decisionlog.md` §44.
- Decision Needed: the independent architect admission; the ⚠ rulings above.

## Authority / release and documentation plan

- **Authority:** the operator authorised drafting on 2026-10-13 (option 2 confirmed in session);
  publication requires the operator's per-item ratification of the ⚠ rulings. The coordinator may read
  the tree and write this draft plus the evidence files; it may NOT implement, self-admit, flip Project
  state, or merge. Implementation runs only after `Admit` + Project `Ready`, in one working session from
  a brief gated on this record; the operator merges.
- **Release / docs:** additive, no migration. Decisionlog amendment for the three schema deltas; doc
  pages for `Switch` and `ListSwitch` plus a usage note (row vs standalone · the whole-row-target
  rationale); the release note lists the two components and the `inverse-muted` chrome surface.
  Rollback = revert the single PR (no consumer depends on it before Done).

## Admission-request acknowledgements

All fourteen form acknowledgements apply as written: this is request evidence only — not `Admit`, not
`Ready`; the contract stays proposed until an independent named human DS architect records `Admit`
with a specific accepted contract and anti-scope (a second human reviewer if roles overlap); the
Extension evidence (recurrence · ownership · trade study · cost · anti-scope) is above; executed
Expo/device proof is collected after implementation; no form field, branch (`feat/toggle-switch` is
empty), PR, demo or green gate grants Ready; nothing is routed through a maintenance form, an
experiment or a fast lane; references use canonical `owner/repo#number` form.

## Process

- Ratified 2026-10-13: `checked` prop name · `Switch`/`nuri-switch` naming · option 2 (private copy +
  parity guard) · no press-down effect on the pill (`disabledOpacity` only).
- Operator ratifies the remaining ⚠ items (thumb fallback · dark-mode thumb · RN accessible-name
  derivation · consumer owner + nuri-expo link · the named architect) → coordinator publishes this as a new issue
  via the contract-admission form → independent architect verdict on the issue → Project `Ready` → the
  gated brief goes to ONE working session (Switch + ListSwitch + C1–C3 + guards + pages + demo + docs ·
  mechanical work, no split). The record precedes the merge.
- #201 gets a one-line cross-reference comment when this publishes (`ListSwitch` joins the list family).
- **Implementation STARTED 2026-10-13 on the operator's instruction, BEFORE admission** — recorded
  now, not retroactively (the SelectTrigger lesson). Branch `feat/toggle-switch`, draft PR only. The
  code is EVIDENCE for this request: it does not admit, does not Ready, and must not merge until
  `Admit` + Project `Ready` exist. The `interactive` ruling (no press-down effect) and option 2 are
  implemented as recorded above; the ⚠ items stay open for the operator.
- **Scope amendment surfaced by execution (2026-10-13 · recorded for the architect):** the shared
  composition classifier (`packages/spec/composition/classify.js`) skipped any anatomy child no slot
  targets unless it hosted the input target — so `ListSwitch`'s trailing `track`/`thumb` (pure
  structure) rendered on NEITHER target while every role/state test was green. Fixed in the ONE
  shared SoT: an untargeted subtree with NO slot part is `static` (rendered in anatomy order); an
  untargeted subtree that has slot parts stays absent (the bare-collapse · ListAction's `trailing`
  unchanged). Both engines pass the same `isSlotPart` predicate; the rule is pinned in
  `scripts/composition-classify.test.js` and the smoke tests now assert the track/thumb RENDER on
  both targets. No public surface changes; it is an engine correction the Switch merely exposed.
- **Executed evidence so far (web + RN-web · in `docs/evidence/switch/`):** `web-switch-states-light.jpg`
  / `-dark.png` (the state matrix · the stretched square thumb derives its width on Chrome — no
  fallback needed on web); `web-list-switch-boards.jpg` (mock rows · two-line · disabled · long-title
  truncation with the 60px track held); `rn-web-cards-settings.jpg` (expo-demo `Cards.tsx` via the
  Expo web preview). Full gate suite green on every workspace (root 125 · prototype 125 · doc 3 ·
  rn 293 + tsc · expo tsc) and the regeneration is deterministic. Native residue for the operator:
  the Yoga `aspectRatio`-on-stretch thumb on device, VoiceOver/TalkBack "switch, on/off", press feel.
  ⚠ Dark-mode board observation for ruling 2: under the NEUTRAL accent the ON track (cream) and the
  OFF track (light grey) sit close in luminance; lilac/orange ON read clearly against the grey OFF.
