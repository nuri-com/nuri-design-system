# Admission request — DRAFT, UNPOSTED — Media-card vocabulary (`Image` primitive · `box.clip` · ratio leaves)

Front door: DS contract admission request (`.github/ISSUE_TEMPLATE/ds-contract-admission.yml`).
Prepared 2026-10-14 by the coordinator for the operator, from `prompts/brief-media-card-vocabulary.md`
(its five rulings RATIFIED 2026-10-14 · §6) and the tree at `main@c5e830d`. Section order mirrors the
issue form (the nuri-com/nuri-design-system#221 precedent) so it pastes straight in. Implementation
runs on `feat/media-card-vocabulary` on the operator's instruction (the hand-off session) and is
recorded here as EVIDENCE, as the Switch record (#223) was: it does not admit, does not Ready, and
does not merge without the operator's explicit go.

## Admission class

Extension — Pending/request-only. One new open primitive (`Image` / `<nuri-image>`), one versioned
`BoxNS` field (`clip`), two ratio-scale leaves (`portrait` · `banner`). No existing public surface is
removed or narrowed, so this is not Mixed. The three items are ONE request because they are one
consumer pattern (the media card) and useless apart: the leaves size the card and the photo, `clip`
makes the card crop the photo at its own radius, the primitive is the photo.

## Requesting actor / consumer owner

- Requesting actor / evidence owner: @darioaschero (operator); request prepared by the coordinator
  session on the operator's instruction.
- Consumer owner: the Nuri app (nuri-com/nuri-expo). ⚠ Name the app-side owner login.

## Request summary and current state

**Current surface:** the DS has NO free-standing image on either target. RN exports no `Image`; the
web `image` leaf exists only inside the icon-avatar descriptor (the `source` bridge). A box has no
way to clip its children (`overflow` is not a `BoxNS` field). The `ratio` scale carries `square` (1)
and `card` (1.586) only.

**Consumer need:** the Profile "Bank and Cards" activation card (operator mock 2026-10-14, right
frame): a `strong`-chrome `lg`-radius row — a text column (title · copy · an `sm` solid Button) beside
a cover-cropped photo that fills the card's height and is clipped by the card's corners. The card's
height follows its own 2:1 ratio; the photo's width follows its 2:3 ratio × the card height; the photo
has no corner radius of its own.

**Why now:** the Profile screen shipped on `main` in #223 with the photo as a FLAGGED non-DS stand-in
(`packages/playground/pages/profile.html`, second board: an `<img>` hand-authoring the factory's
image-leaf shape). The board shows the gap, not a patch — "expressible in pure DS on the playground"
is the consumer-channel ship gate, and this card is not.

## Proposed contract delta (not admitted)

### A · Ratio leaves — `portrait` (2:3 · 0.667) and `banner` (2:1 · 2)

`packages/spec/tokens/dimensions.ts` `ratio` += two leaves. `RatioLeaf` derives automatically
(`keyof typeof ratio`); `box.aspectRatio` gains the two values on every open primitive that carries
the box namespace (View · Pressable · Image) and in every descriptor. Web: `box.css` gains
`[data-aspect-ratio="portrait|banner"]` from the box emitter; RN resolves through the generated
`ratio` table. Names + values are an operator ruling (brief §6.1): the mock's photo column renders
2:3 and the card 2:1. Existing leaves (`square` · `card`) are byte-identical.

### B · `box.clip` — a boolean box flag (versioned `BoxNS` add · the Guard-F pin moves)

`BoxNS` += `clip?: boolean`: the node clips its children at its own box and radius —
`overflow: hidden` on both targets. Authored as a presence flag (`<nuri-view clip>` · `<View clip />`),
NOT an `overflow` keyword (brief §6.2): the only clip the DS admits is "at my own box"; scrolling stays
Scroll's. One Field-table entry (`via: 'flag'` · the `wrap` precedent) + one canonical id (`overflow`)
in the property-spelling registry → both engines pick it up from the shared table; every open
primitive with the box namespace accepts it automatically (the flat-props bucket is
`Object.keys(BOX_FIELDS)`). Anti-scope: no `overflow: scroll|auto`, no `clip` on text leaves, no
`clipPath`/shape clipping.

### C · `Image` / `<nuri-image>` — the open image primitive

- **Contract:** `source` (required · web: a URL string attribute · RN: `ImageSourcePropType`, the
  icon-avatar `source` bridge precedent); `fit` = `'cover' | 'contain'`, default `cover` (RN
  `resizeMode` · web `object-fit` · brief §6.4); `accessibilityLabel` / `accessibility-label` (the
  decision-21 find-replace mirror, like Pressable · brief §6.3) — ABSENT ⇒ DECORATIVE on both targets
  (web `alt=""` + `aria-hidden="true"` · RN `accessible={false}`), PRESENT ⇒ an announced image (web
  `alt` · RN `accessibilityRole="image"` + the label). Box namespace flat props via `BOX_FIELDS`
  (width · height · minHeight · minWidth · padding* · radius* · aspectRatio · clip) like View; NO
  stack, NO palette (an image has no colour), NO interactive, NO effect.
- **The blend ring** (`.nuri-image` · border-translucent · black/white 10%) stays the element
  contract, always on, on both targets (brief §6.5) — the free-standing image keeps the same ring the
  icon-avatar image leaf has.
- **Sizing truth (documented on the page · CORRECTED by execution 2026-10-14):** the brief claimed RN
  `Image` never derives a dimension from the asset. It does for bundled static resources: RN applies the
  resolved source's intrinsic `{width, height}` as the Image's default style, and react-native-web
  injects the asset-registry size inline — probed on RN-web, the photo host measured 240×320 (the
  asset) instead of the stretched 2:3 column. The primitive therefore NEUTRALISES that default
  (`width: 'auto'` · `height: 'auto'` ahead of the resolved box, so an authored dimension still wins):
  the asset's pixel size is never a layout input. A usable image declares `aspectRatio` + one
  dimension, OR is stretched by its row (`align="stretch"`) with `aspectRatio` so Yoga computes the
  other axis (the Switch-thumb precedent). The web `<img>` sizes by its intrinsic ratio only when
  `aspect-ratio` is absent — so authors pass one.
- **Web shape:** `<nuri-image>` is a `display: contents` host (the `nuri-button` precedent) around ONE
  inner `<img class="nuri-image nuri-box" …>` that IS the flex item — so a row's `align="stretch"`
  stretches the `<img>` itself and `aspect-ratio` transfers to its width, exactly as RN's `Image` host
  behaves. Box attrs self-derive through the factory's own `mergeAttrs` (view.js's reader pattern).
- **Naming:** `image` → `Image` / `nuri-image` is mechanical. RN shadows react-native's `Image` the way
  the DS already shadows `View`/`Text`/`Pressable`.

### Proposed anti-scope (refused generalisation)

- No `fit` values beyond `cover | contain` (no `fill`, `none`, `scale-down`, no focal point).
- No `source` fallback / placeholder / loading state, no `onLoad`/`onError`, no `blurhash`, no
  `srcset` / density variants on web (the asset pipeline is the consumer's).
- No palette on Image (no tint, no background) · no interactive (a pressable image is
  `<Pressable><Image/></Pressable>`) · no stack (an image has no children).
- No `overflow: scroll|auto` keyword on `clip` · no `clip` on Text.
- No `ratio` leaves beyond the two the card needs; no free-form numeric ratios.
- No vendored consumer mirrors · no merge (the operator merges).

## Consumer need, gap, current workaround and evidence

- **Consumer / owner:** Nuri app · Profile screen (the "Bank and Cards" activation CTA). ⚠ owner login.
- **Concrete use case:** the mock card — title "Bank and Cards", copy "Verify your account and get an
  IBAN and a Visa card.", an `sm` solid "Activate" Button, the photo column at the trailing edge.
- **Gap:** inexpressible in pure DS — no image element on either target; no way for the card to crop a
  child at its corners; no 2:1 / 2:3 leaves.
- **Current workaround:** the flagged `<img class="nuri-image nuri-box" data-radius="lg">` stand-in on
  the playground board (web only — it has no RN twin at all, so the expo-demo cannot carry the card).
- **Evidence:** the merged Profile board (`profile.html` · #223) · the operator mock (2026-10-14) ·
  `docs/flow-inventory.md` (the C-series settings/profile family).
- **Missing:** an exact nuri-com/nuri-expo issue or PR for the Profile screen. ⚠ App owner to link.

## Class-scoped Extension evidence

- **Recurrence / system invariant:** a bitmap on a surface recurs in every product (card art,
  onboarding illustrations, merchant logos, KYC document previews); the consumer cannot supply a
  cross-target image with the DS ring, box geometry, and the decorative/labelled a11y contract from
  composition. `clip` is the one box behaviour a media card needs that no composition can produce
  (a parent cannot reach a child's corners). The two ratios are the card's own geometry.
- **DS ownership:** the look (ring · radius · cover/contain · the clip) and the a11y semantics are
  presentation vocabulary. The asset, its loading, and what a tap does stay consumer-owned.
- **Trade study:**
  - *Promote the icon-avatar image leaf to a public `IconAvatar source` only* — rejected: a circle
    badge is not a card photo (fixed `lg`/`sm` sizes · `full` radius · no ratio).
  - *A `MediaCard` descriptor* — rejected for v1: it would bake ONE layout (text-left, photo-right)
    into the catalog; the card is ordinary `View` composition once the three gaps close, and a
    descriptor can follow when a third card layout proves the recurrence.
  - *`overflow` as a keyword axis (`visible | hidden | scroll`)* — rejected (brief §6.2): `scroll` is
    Scroll's, `visible` is the default; a boolean flag admits exactly the one behaviour.
  - *Consumer-side radius on the photo (`radius="lg"` on the image, no clip)* — rejected: the card's
    inner corners would still show the square photo corner on the text side, and the operator ruled the
    photo has NO radius of its own.
  - *Fixed photo width (`width="…"`) instead of a ratio* — rejected: the card height follows its ratio
    at every device width; a fixed photo width breaks the 2:3 crop.
- **Contract cost:** 1 primitive (2 files + CSS) · 1 `BoxNS` field (1 Field-table entry + 1 registry
  id · Guard-F pin moves) · 2 ratio leaves · the parity-gate registration · 1 doc page + 1 `clip` row
  on every box-bearing primitive page · 1 playground board swap · 1 demo screen. Maintenance: the
  primitive is a thin wrapper over the shared appliers (no second mapping).
- **Compatibility:** purely additive. Generated outputs differ only by the two ratio tokens (RN
  `tokens.ts` · `token-paths.ts` · web `token-vars.ts` · the token CSS · `box.css` rules for the two
  leaves + the one `clip` rule) and the doc pages (the `clip` row · the widened `aspectRatio` union).

## Requested DS architect / admission recorder

⚠ @darioaschero to name. Precedent: #221 requested @taner-caliskan (requested, not appointed). If the
operator records the decision, the operator is also the requester → a second named human
architectural reviewer is required in the decision record. No architect decision exists in this request.

## Architect decision record location (architect-owned)

(empty on initial request)

## Proposed bounded execution scope if admitted

- **Spec:** `tokens/dimensions.ts` (A) · `components/schema.ts` (B · the `clip` field + the Guard-F
  pin in `scripts/docs-drift.test.js`) · `axes/resolve-map.ts` (B · `BOX_FIELDS.clip`) ·
  `axes/property-spelling.ts` (B · the `overflow` canonical id).
- **Codegen / guards:** `scripts/dimension-tokens.test.js` (the restated ratio oracle + the union
  oracle) · `scripts/docs-drift.test.js` (pin) · `scripts/spec-agnosticism.test.js` (only if the
  `overflow` id trips a deny rule).
- **RN:** `primitives/Image.tsx` (new) · `primitives/index.ts` · `index.ts` barrel · `runtime/resolve.ts`
  (unchanged — the `flag` arm exists) · `__tests__/primitives-parity.test.ts` · `__tests__/public-surface`
  · `__tests__/render-smoke` (sizing by ratio + stretch · decorative vs labelled · the clip) ·
  `type-tests/component-types` · regenerated `generated/data/{tokens,token-paths}.ts`.
- **Web:** `primitives/image.js` (new) + `primitives/image.css` (the host rule) · regenerated
  `styles/box.css` · `playground/pipeline/bundle.js` · `factory/factory.test.js` (the element) ·
  `pages/profile.html` (the board swap) · `doc/stage.mjs` + `_includes/head_custom.html` if the doc
  site must load it.
- **Expo-demo:** a `Profile` screen (pure DS · RN-translatable) carrying the card, launched from Menu;
  the photo asset copied under `expo-demo/assets/photos/`.
- **Doc:** `pipeline/component-api-ir.js` (the `image` entry) · `harness/shell.js` nav ·
  `pipeline/docs.js` NAV_ORDER · `pipeline/docs-drift.test.js` pins (the `clip` row · the
  `aspectRatio` union · the new page · the two ratio rows) · `docs/primitives-contract.md` row.
- **NOT in scope:** a `MediaCard` descriptor · image loading states · the icon-avatar leaf (unchanged)
  · vendored consumer mirrors · the merge.

## Downstream verification plan (before Ready)

- [ ] **Repository checks / CI:** root `npm run build` + `npm test`; the 5 gates (`spec` · `prototype` ·
      `doc` · `rn` render-smoke + tsc · `expo-demo` tsc) including the @nuri/doc workspace; the re-emit
      gate; only the generated files listed above differ.
- [ ] **Contract / type proof:** `ImageProps` exact in the type-tests (box keys · `source` required ·
      `fit` · `accessibilityLabel` · no stack/palette/interactive · no `children`); the parity gate
      registers Image (web attrs ≡ RN props ≡ box keys + the local contract); the Guard-F pin moved
      deliberately with a decisionlog amendment.
- [ ] **Rendered proof (web · in-session · by probe, not by eye):** the Profile board with the §0
      markup; the card's rendered height = width ÷ 2 with 1-line AND 4-line copy; the photo's
      `getBoundingClientRect` width = card height × 2⁄3; the photo has no own radius and is clipped by
      the card (`overflow: hidden` computed on the card, the photo's corner pixel = the card's bg);
      `<img alt="" aria-hidden="true">` when unlabelled.
- [ ] **Expo proof (post-implementation):** the `Profile` screen via the Expo web preview; the RN
      snapshot shows `overflow: 'hidden'` on the card and `aspectRatio` on both nodes. Native residue
      for the operator on device: the asset `require` + cover on device · VoiceOver/TalkBack silence
      for the decorative image · the ring over the photo in dark mode.
- [ ] **Real consumer:** an exact nuri-com/nuri-expo PR implementing the Profile screen from the
      playground link — attached during Verification/Done, never pre-Ready.

## Acceptance criteria and Verification/Done evidence

1. `Image` renders on RN and web with zero hand-authored platform strings; the Profile board carries
   NO non-DS element.
2. A11y: unlabelled ⇒ decorative on both targets; labelled ⇒ announced as an image with the label.
3. Geometry by probe (above) on both targets — screenshots filed under `docs/evidence/media-card/`.
4. `clip` crops at the box radius on both targets; `overflow` never reaches `scroll`.
5. Full gate suite green, including @nuri/doc; regeneration deterministic.
6. Doc page generated for Image (Guard G); the `clip` row on every box-bearing primitive page.
7. The versioned `BoxNS` bump recorded where the house now records it: the Guard-F pin comment
   (`scripts/docs-drift.test.js`) + this record (the decisionlog is the archived, immutable history —
   untouched since #140; the Switch deltas in #223 followed the same practice).
8. This record's status line flipped in the SAME PR that ships the implementation.

## Owning repository / dependencies / risk

- nuri-com/nuri-design-system @ `main` (baseline `c5e830d`).
- Risk: **Product** (public contract + a11y semantics; no native-module, security or funds surface).
- Dependencies: #223 (the Profile board carrying the flagged stand-in) · the icon-avatar `source`
  bridge (the image-leaf precedent · unchanged) · decision 21 (the accessibility-label mirror).
- Decision Needed: the independent architect admission.

## Authority / release and documentation plan

- **Authority:** the operator ratified the five rulings on 2026-10-14 and chose the hand-off; the
  coordinator drafts this record and implements on the branch as evidence. It may NOT self-admit, flip
  Project state, tag, or merge.
- **Release / docs:** additive, no migration. Decisionlog amendment for the `BoxNS` bump; the Image doc
  page with the sizing-truth note; the release note lists the primitive, the flag and the two leaves.
  Rollback = revert the single PR.

## Admission-request acknowledgements

All fourteen form acknowledgements apply as written: this is request evidence only — not `Admit`, not
`Ready`; the contract stays proposed until an independent named human DS architect records `Admit`
with a specific accepted contract and anti-scope (a second human reviewer if roles overlap); the
Extension evidence is above; executed Expo/device proof is collected after implementation; no form
field, branch, PR, demo or green gate grants Ready; nothing is routed through a maintenance form, an
experiment or a fast lane; references use canonical `owner/repo#number` form.

## Process

- Ratified 2026-10-14 (brief §6): the ratio names + values · `clip` as a boolean flag · the
  `accessibility-label` mirror with absent ⇒ decorative · `fit` default `cover`, `cover | contain` ·
  the always-on ring.
- Implementation STARTED 2026-10-14 on `feat/media-card-vocabulary` on the operator's instruction,
  BEFORE admission — recorded now, not retroactively. The code is EVIDENCE for this request.
- **Executed evidence (2026-10-14 · branch `feat/media-card-vocabulary` · draft
  nuri-com/nuri-design-system#225 · never merged):**
  - **Web (playground `profile.html` · by probe, not by eye):** every clipped card measures 354×177
    (ratio 2.000 · `overflow: hidden` · 18px radius) with 2-line, 1-line, 5-line and bare copy — the
    height never moves; every photo measures 118.05×177 (ratio 0.667 · expected 118.0) with NO own
    radius, the 1px ring (`rgba(0,0,0,.1)` light · `rgba(255,255,255,.1)` dark), `object-fit` from
    `fit`; unlabelled ⇒ `alt=""` + `aria-hidden="true"`, labelled ⇒ `alt` and no `aria-hidden`.
    `<nuri-image>` is a `display: contents` host around ONE `<img class="nuri-image nuri-box">`.
    File: `docs/evidence/media-card/web-profile-boards.png` (the three boards · 2400px wide).
  - **RN-web (expo-demo `Profile.tsx` via the Expo web preview · by probe):** card 988×494 (ratio
    2.000 · `overflow: hidden` · 18px radius); photo host 329.5×494 (ratio 0.667 · expected 329.5)
    with inline `width: auto; height: auto; aspect-ratio: 0.667 / 1` overriding react-native-web's
    injected asset size. File: `docs/evidence/media-card/rn-web-profile.png` (520×1000 twin).
  - **Correction surfaced by execution:** the sizing-truth claim (above) — the first RN-web probe
    measured the photo host at the asset's 240×320; the primitive now neutralises RN's static-resource
    default. The web board had passed and proved nothing about RN.
  - **Gates (local):** root 125 · prototype 127 · doc 3 · rn 299 + tsc · expo-demo 21 + tsc; two
    consecutive `npm run build` runs hash-identical across every generated dir (re-emit determinism).
    Generated deltas exactly as predicted: the two ratio tokens (RN `tokens.ts` · `token-paths.ts` ·
    the semantic token CSS · `box.css` 2 rules) + the `clip` rule + the doc pages (`view` · `pressable`
    · `box` axis · `dimension` foundation · the new `image` page) + the playground bundle.
  - **Native residue for the operator (device / Expo Go):** the asset `require` + cover on device ·
    Yoga's `width: 'auto'` + `aspectRatio`-on-stretch for an Image host (the thumb precedent was a
    View) · VoiceOver/TalkBack silence for the decorative photo and "image, Bank card" for a labelled
    one · the ring over the photo in dark mode · Android clipping at the rounded card corners.
