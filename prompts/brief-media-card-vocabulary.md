# Brief — Media-card vocabulary: `Image` primitive · `box.clip` · ratio leaves

Prepared 2026-10-14 by the coordinator for the NEXT working session (the operator chose the
hand-off; see "Why not this session" at the end). Consumer evidence already exists on
`feat/toggle-switch`: the Profile "Bank and Cards" CTA board
(`packages/playground/pages/profile.html`, second `<nuri-demo>`), whose photo is a FLAGGED non-DS
stand-in (an `<img>` hand-authoring the factory's image-leaf shape). This arc replaces the stand-in
with vocabulary. Governance: three Extensions → one admission request (draft it from this brief
before coding, the Switch record's format); the code is evidence until `Admit` + `Ready`.

## 0 · The goal, stated as the consumer sees it

```html
<nuri-view direction="row" align="stretch" chrome="strong" radius="lg" clip aspect-ratio="banner">
  <nuri-view direction="column" justify="center" gap="xs" padding="lg" fill="grow-shrink">
    …title · copy · Activate…
  </nuri-view>
  <nuri-image source="../assets/photos/bank-and-cards.png" fit="cover" aspect-ratio="portrait"></nuri-image>
</nuri-view>
```

RN twin: `<View … clip aspectRatio="banner"><View …/><Image source={require(…)} fit="cover" aspectRatio="portrait" /></View>`.

Three consequences the operator ratified on the board (2026-10-14): the photo has NO corner radius
of its own (the card clips it); the card's height follows its RATIO, never the copy length; the
photo's width follows its own ratio × the card height.

## 1 · Ratio leaves (`packages/spec/tokens/dimensions.ts` · ~30 min)

- `ratio` += `portrait` (2:3 → `{ value: 0.667, unit: 'none' }`) and `banner` (2:1 →
  `{ value: 2, unit: 'none' }`). ⚠ NAMES + VALUES are an operator ruling: the mock's photo column
  renders 132×196 (2:3, cover-cropped from a 3:4 asset) and the card 394×196 (2:1).
- `RatioLeaf = keyof typeof ratio` derives automatically; box.css gains
  `[data-aspect-ratio="portrait|banner"]` from the box emitter (`BOX_FIELDS.aspectRatio` is
  `via: 'scale', scale: 'ratio'`); RN resolves through the generated `ratio` tokens. Docs: the
  dimension foundation page re-emits. Guards to expect: `scripts/dimension-tokens.test.js`
  (re-run; it may pin the ratio set), docs-drift Guard C tokens, the box-css freshness test.
- Verify: the Switch thumb (`square`) and the balance card (`card`) are byte-identical.

## 2 · `box.clip` (~1.5 h · the `hug`/`distribute` precedent: one Field-table entry, two engines)

- `schema.ts` `BoxNS` += `clip?: boolean` (comment: "the node clips its children at its own box
  and radius — `overflow: hidden` on both targets · the media-card slice"). Guard-F pin:
  `scripts/docs-drift.test.js` `namespaces.BoxNS` += `'clip?': 'boolean'`.
- `axes/resolve-map.ts` `BOX_FIELDS` += `clip: { via: 'flag', prop: 'overflow', on: 'hidden',
  off: 'visible' }` (the `flag` field kind exists); `axes/property-spelling.ts` += the `overflow`
  canonical id → web `overflow` / RN `overflow` (check the CanonicalId union + the
  spec-agnosticism allowlist: a CSS-looking name may need a `why` entry like `rn-min-width`).
- Web: box.css regenerates `.nuri-box[data-clip] { overflow: hidden; }` (the flag emitter — verify
  it emits a presence attribute like `[data-wrap]`); View/Pressable/Header/… accept `clip`
  automatically (flat props bucket by `Object.keys(BOX_FIELDS)`). RN: `resolve.ts` box →
  `overflow: 'hidden'` (Android clips children only with overflow hidden on the SAME view ✓).
- Guards/docs: `packages/rn/__tests__/primitives-parity.test.ts` (web attrs ≡ RN props — picks the
  key up from BOX_FIELDS; confirm), the recipes/geometry-bake oracle (unaffected unless a descriptor
  adopts clip), doc pages of every open primitive gain a `clip` row → `packages/doc/pipeline/
  docs-drift.test.js` cells (the `inverse-muted` precedent: one replace_all), `docs/primitives-
  contract.md` sentence. Tests: a box-css rule test + an RN resolve test + a parity assertion.
- Anti-scope: no `overflow: scroll` (Scroll owns scrolling), no `clip` on text leaves.

## 3 · The `Image` primitive (~3–4 h · the design-bearing part)

**Contract (⚠ three rulings before code):**
- `source` — web: a URL string attribute; RN: `ImageSourcePropType` (the icon-avatar `source`
  bridge is the precedent, including the codegen's `image-source` slot kind). Required.
- `fit` — `'cover' | 'contain'`, default `cover` (RN `resizeMode`, web `object-fit`). ⚠ vocabulary.
- Accessible name — ⚠ `accessibility-label`/`accessibilityLabel` (the decision-21 find-replace
  mirror, like Pressable) vs web-native `alt`. Absent → DECORATIVE on both targets (`alt=""` +
  `aria-hidden` / `accessible={false}`), the IconAvatar precedent.
- Box namespace flat props (width · height · minHeight · aspectRatio · radius · clip · padding…)
  via `BOX_FIELDS` like View; NO stack, NO palette (an image has no colour), NO interactive. The
  blend ring (`image.css` · border-translucent) stays the element contract, always on.
- Sizing truth: RN `Image` never derives a dimension from the asset — a usable image declares
  `aspectRatio` + one dimension OR is stretched by its row with `aspectRatio` (Yoga computes the
  other axis; proven by the Switch thumb). Document it on the doc page; the web `<img>` does the
  same by intrinsic ratio only when `aspect-ratio` is absent — so authors should always pass one.

**Files:**
- RN: `packages/rn/primitives/Image.tsx` (model on `View.tsx`'s prop bucketing + the renderer's
  `renderImage` leaf for resizeMode/ring; `import { Image as RNImage } from 'react-native'` — the
  DS already shadows `View`/`Text`), `primitives/index.ts`, `packages/rn/index.ts` barrel (value +
  `ImageProps`), `__tests__/public-surface.test.ts`, `__tests__/render-smoke.test.tsx` (sizing by
  ratio + stretch · decorative vs labelled), `type-tests/component-types.test-d.tsx`,
  `__tests__/primitives-parity.test.ts` registration.
- Web: `packages/prototype/primitives/image.js` custom element `<nuri-image>` (model on `view.js`;
  inner `<img class="nuri-image …">` with `object-fit` from `fit`), `playground/pipeline/bundle.js`,
  `doc/stage.mjs` + `_includes/head_custom.html` if the doc site must load it, the factory test
  for the element (attrs · decorative · fit).
- Docs: `packages/doc/pipeline/component-api-ir.js` entry (`image` · api kind, the `view` page's
  shape · nav after Pressable), `harness/shell.js` nav, `pipeline/docs.js` NAV_ORDER,
  `pipeline/docs-drift.test.js` pin, `docs/primitives-contract.md` section.
- Consumers: `profile.html` board 2 drops the stand-in (the §0 markup); expo-demo gains the card
  (a `Profile` screen or a block on `Menu.tsx`) for the RN proof via the Expo web preview + the
  native residue (asset `require`, cover on device).
- Naming guard: `image` → `Image` / `nuri-image` is mechanical ✓; the `no-unused-exports` guard
  wants a consumer of every export (the demo card is it).

## 4 · Sequence · gates · evidence

Branch `feat/media-card-vocabulary` from `main` (#223 merged 2026-10-14 — the Profile board with the
flagged stand-in is on main, so no stacking is needed). Order: §1 → §2 → §3 → board swap → demo card → docs →
full gate suite (root · prototype · playground · doc · rn jest + tsc · expo tsc · re-emit
determinism) → evidence screenshots (web board; Expo web preview; a long-copy board proving the
card height never moves) → admission draft updated with the executed evidence → draft PR (never
merge). Acceptance by probe: the card's rendered height equals width ÷ 2 with 1-line AND 4-line
copy; the photo has no own radius and is clipped by the card; `getBoundingClientRect` of the photo
= card height × 2⁄3 wide; RN snapshot shows `overflow: 'hidden'` on the card and `aspectRatio` on
both nodes.

## 5 · Why not this session (the coordinator's evaluation, 2026-10-14)

- §1 + §2 are mechanical (~2 h) but useless without §3; §3 is design-bearing (three rulings · RN
  sizing semantics · a new parity-gate entry · a doc IR page) — ~3–4 h of careful two-target work.
- The three items are a DIFFERENT contract area (media/box) from the Switch delivery, which sits
  on `feat/toggle-switch` unpushed with its own admission draft: mixing them would make one PR
  carry five admission items. A fresh session on a stacked branch is the natural seam.
- This session's lesson (the classifier silently dropping the row's track on BOTH targets while
  every role/state test was green) argues for an unhurried, fresh context for structural engine
  work — not for the tail of a very long session.
- Nothing is lost by waiting: the consumer evidence is committed and flagged; the rulings can be
  settled now in prose and carried in this brief.

## 6 · Rulings — RATIFIED by the operator 2026-10-14, as proposed

1. Ratio names + values: `portrait` 2:3 (0.667) and `banner` 2:1 (2).
2. `clip` is a boolean box flag (`<nuri-view clip>` · `<View clip />`), not an `overflow` keyword.
3. The image's accessible name is `accessibility-label` / `accessibilityLabel` (the decision-21
   mirror rule, like Pressable); absent → decorative on both targets.
4. `fit` defaults to `cover`; vocabulary `cover | contain`.
5. The always-on blend ring stays the element contract for the free-standing image.

No further design decision is open: the next session starts straight from §1.
