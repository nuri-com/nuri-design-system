# DS contract admission request — ADMITTED (nuri-com/nuri-design-system#231) · Ready · IMPLEMENTED on `feat/avatar-initials-accessory`, independent verification pending — IconAvatar `initials` content + corner `accessory` (+ ListAction forwarding)

> **Filing notes (not part of the form).** Paste each `##` section below into the field of the same
> name in `.github/ISSUE_TEMPLATE/ds-contract-admission.yml`; the sections follow the form's order.
> Issue title: "DS admission: IconAvatar initials + corner accessory (+ ListAction forwarding)".
> Filed as nuri-com/nuri-design-system#231; this text is the amended body (independent review:
> https://github.com/nuri-com/nuri-design-system/issues/231#issuecomment-6387666532). Evidence: the
> boards on `main@d06e2cc` (nuri-com/nuri-design-system#228). Companion request, filed separately:
> the five icon glyphs (nuri-com/nuri-design-system#230); the two are independent. Policy version:
> `main@45918bb` (nuri-com/nuri-design-system#229, which adds the sole-architect exception).
> Prepared 2026-10-24 by a working agent from `prompts/brief-avatar-initials-accessory.md` (phase 1).
> **Status (2026-10-24).** Admitted by @darioaschero under the sole-architect exception
> (https://github.com/nuri-com/nuri-design-system/issues/231#issuecomment-6388320227); Project `Ready`
> confirmed by the operator; implemented on branch `feat/avatar-initials-accessory` in ONE PR against
> `main` that references nuri-com/nuri-design-system#231 (not merged). Verification/Done still needs the
> operator's native residue (device) and the real-consumer nuri-com/nuri-expo PR. The text below is the
> record as filed and stays unchanged.

## Admission class

Extension

## Requesting actor / evidence owner

@darioaschero

## Consumer owner / affected-surface owner

@darioaschero (nuri-com/nuri-expo: send step S1, the search mode, the address book)

## Request summary and current state

> **Amended 2026-10-24 after the independent review**
> (https://github.com/nuri-com/nuri-design-system/issues/231#issuecomment-6387666532), following the
> architect's direction on the open calls. The admission decision itself is not recorded here; it is
> @darioaschero's, in an architect-owned comment.

**Current surface.** `IconAvatar` (`packages/spec/components/icon-avatar.ts`) shows exactly one of two
contents: a glyph (`icon`) or an image (`source`, which wins when both are given). An internal
`mode` axis (`glyph | image`, derived by `propMaps.contentMode`) mutes the root's variant paint in
image mode. Sizes: `md` 48px (default), `sm` 24px. Decorative (hidden from assistive tech).
`ListAction`'s `leadingAvatar` part nests an `icon-avatar` and forwards `name → icon`, `variant`
(default `outline`), `accent` and `source`. The DS has no way to put text in an avatar and no way to
lay one part over another (the schema has no positioning; `BleedNS` exists precisely so that
descriptors and View *cannot* opt into overlap).

**Consumer need.** The send step S1 (recipient list), search results and the address book list
people as flat contacts. The row subtitle names the identifier (`@emil`, `N26 ···4521`, `bc1q…9m7t`).
The avatar should carry the person's **initials** and a small **accessory** at the bottom-right that
shows the payment rail (a Nuri user vs a bank, Bitcoin, Lightning, card or mobile-money destination).
Actions in the same list (Scan or paste, All contacts, New recipient) keep the outline glyph avatar.

**Why now.** The need is nuri-expo's. Its address book, its suggestions and the send step draw every
contact as a generated wordpet PNG passed as `source`, with coloured PNG logos for rails (§ Consumer
need), and the intended look cannot be built from DS parts: `IconAvatar` takes no text,
`ListActionLeadingAvatar` accepts only `IconAvatar` props, and nothing in the DS can overlay a part.
The playground boards (`send.html`, pure DS; `send-recipient.html`, outside the DS) show the target
and the gap; they are evidence, not the source of the need.

## Proposed contract delta (not admitted)

Two public props on `IconAvatar` (`initials`, `accessory`), one public axis (`accessorySurface`),
their forwarding through `ListActionLeadingAvatar`, one chrome slot (`inverse`), one size leaf
(`2xs`), and the schema, codegen and engine rules they need. Nothing public is removed or narrowed
(the one internal reshape is under Class-scoped Contraction / Mixed evidence).

### Public surface (what a consumer writes)

| | RN | Web |
|---|---|---|
| Initials content | `<IconAvatar initials="EB" />` | `<nuri-icon-avatar initials="EB">` |
| Accessory glyph | `accessory="nuri"` (an `IconName`) | `accessory="nuri"` |
| Accessory surface | `accessorySurface="canvas" \| "inverse"` (default `canvas`) | `accessory-surface="…"` |
| In a list row | `<ListActionLeadingAvatar initials="EB" accessory="bank" />` | `<nuri-list-action-leading-avatar initials="EB" accessory="bank">` |

A Nuri contact: `initials="EB" accessory="nuri" accessorySurface="inverse"`. Every other rail:
`initials="CM" accessory="bank"` (the `canvas` default). A photo: `source={…} accessory="nuri"
accessorySurface="inverse"`. Existing `icon`, `source`, `variant`, `size`, `accent` are unchanged.

### A · Initials

**A1 · Content.** A new `initials` part (`el: 'text'`) in the `icon-avatar` anatomy and an `initials`
slot with a scalar prop. 1–2 letters, derived and cased by the caller; the DS does not parse names.
The text leaf is single-line with tail truncation, so a longer string cannot break the circle (three
or more letters truncate; that is not a feature). **Presence = a non-empty string:** `initials=""`
behaves as absent (no initials mode, no text, no dev warning).

**A2 · Treatment, locked by mechanism.** The internal `mode` axis gains `initials`. In that mode the
root paints `soft` (`bg-strong` fill, `text-primary` letters) whatever `variant`/`accent` say, the
same way image mode already mutes the variant. `variant` and `accent` are documented no-ops in
initials mode. Type: `md` (17px), regular, on the `md` avatar (chosen by the requester on the board,
§B4); `xs` (13px), regular, on the `sm` avatar (not yet seen on a board).
*Why lock it:* `ListAction` forwards `variant` with an `outline` default, so without the lock every
person row would draw outline initials (transparent, muted letters) unless the caller remembered
`variant="soft"`; and `variant="solid" accent="orange"` would bring back per-person colour, which
the requester dropped.

**Letter-spacing:** the initials use their step's own letter-spacing (md −0.02em, xs 0). No tracking
token, no letter-spacing rule (dropped after review). On web the second letter's position does not
depend on letter-spacing (centred text, spacing trails every glyph), so the board's ring contact
(§B4) carries over unchanged; verified by probe at both values.

**OS text size:** the initials do **not** follow the OS text size. The avatar is decorative and a
fixed-size circle; the row's name, which is text, scales. Without this, large accessibility sizes
would truncate the initials inside the 48px circle and push them into the accessory. Mechanism (RN):
text leaves inside a `decorative` descriptor render with `allowFontScaling={false}`. `icon-avatar` is
the only decorative descriptor and the initials its only text leaf; the rule keys on existing
descriptor data (`decorative`, decision 50), not on the slot kind, so slot kinds carry no
presentation. Web: no rule (browser zoom scales the whole avatar; the type step is `rem`, so a larger
browser *default* font size grows the initials inside the `px` circle: accepted).

**A3 · Precedence + the `contentMode` reshape.** `source` > `initials` > `icon`. Today
`contentMode = { slot, axis, present, absent }` handles one slot. Proposed:
`contentMode = { axis, present: [{ slot, value }, …], absent }`; the first present slot wins (array
order is the precedence). icon-avatar: `present: [{ slot: 'source', value: 'image' }, { slot:
'initials', value: 'initials' }], absent: 'glyph'`. The generated one-time dev warning generalises
from "exactly one of icon or source" to "exactly one of icon, source or initials" (`initials=""`
counts as absent, A1).

**A4 · Slot kind.** `SlotSpec.kind` gains a scalar kind for this content, working name `'initials'`.
`prop` is legal only on `icon-name` and `image-source` slots (Channel 7); rich text is
composition-only (the 2026-07-01 rule). A dedicated kind keeps that rule: only this kind of text
gets a prop. **New guard:** a `text` slot must be `component` or `default`. Today the RN codegen
turns a non-component, non-default `kind: 'text'` slot into a `slotName?: string` prop and routes it
as content (`scripts/parsers/components-api.js:379, 492`); no descriptor uses that path and no guard
forbids it. After this change the `initials` kind is the only scalar text prop in the DS, by
mechanism. The kind carries routing only, no presentation (no letter-spacing, no font-scaling rule).

> **Q1 · Initials shape · resolved after review.** Scalar prop + new kind + mode lock, as above;
> letter-spacing dropped (the step's own value); presence = non-empty string; the bare-`text` guard
> closes the latent scalar path. Rejected: (a) a composition marker
> (`<IconAvatarInitials>EB</IconAvatarInitials>`): `contentMode` requires a scalar prop slot, and
> `ListAction` forwards nested-component *props*, not composition children, so it costs more engine
> work for a worse 2-letter API; (b) letting `prop` appear on any `text` slot: it would undo the
> composition-only rule for every component; (c) initials that follow `variant`: the two failure
> modes in A2; (d) caps letter-spacing in any form (a `tracking.caps` token keyed on the kind, or a
> `TypographyNS` flag that every Text would gain): dropped; (e) the two letters as separate nodes
> with a gap: the smallest space step (3px) is about 0.18em at 17px, it does not scale with the text,
> and splitting breaks single letters, accents, emoji and non-Latin names (and would make the DS
> split names, which A1 rules out).

### B · Accessory

**B1 · Anatomy.** Two parts: `accessory` (a `view` host: the disc) and `accessoryIcon` (an `icon`
leaf inside it). Slot `accessory: { part: 'accessoryIcon', kind: 'icon-name', prop: 'accessory' }`.
Public axis `accessorySurface: 'canvas' | 'inverse'`, default `canvas`. **No accessory accent.**
The disc has no width or height: it sizes from its content, the 15px glyph plus `space.xs` (3px)
padding, so **21px in both surfaces** (`accessory`: `box: { padding: 'xs', radius: 'full' }`;
`accessoryIcon`: `box: { width: '2xs', height: '2xs' }`). Only existing `BoxNS` fields; the
`canvas` hairline takes no layout (B2); §B4 has the numbers.

**B2 · Placement: a new, descriptor-only overlay.** `PartAnatomy` gains
`overlay?: 'corner-accessory'` (named for the mechanism, not a corner coordinate). One value, which
bundles:

- the part leaves the flow; its box is pinned to the parent host's bottom-end corner and pushed out
  by `space.xs` (3px) on both axes, drawn above the parent's content;
- a 2px knockout ring in `bg-canvas`, outside the disc, taking no layout space;
- a 1px `border-subtle` separation hairline inside the disc, taking no layout space, drawn when the
  disc paints the ring's own colour (`chrome: canvas`) so a canvas disc stays distinct from its
  canvas ring; an `inverse` disc has none. The hairline is the accessory's, like the image element's
  ring: no chrome row gains a border, and no resolver change is needed;
- content gating: an overlay host renders only when its slot has content (hosts always render today;
  without this rule every avatar would draw an empty disc).

An overlay part is a **non-interactive `view` host** (no `pressable`, no `interactive`, no hit
target). **Allowlist guard:** only `icon-avatar.accessory` may declare `overlay`; any other use fails
CI and is a new Extension. This **narrowly revisits the `BleedNS` position** ("descriptors and View
cannot opt into overlap"): one descriptor part may overlap, View and every other descriptor still
cannot. Engines realise it generically, keyed off `overlay`, with no component logic:
- RN: `position: 'absolute'`; the ring as an absolutely-positioned bordered sibling and the hairline
  as an absolutely-positioned bordered child (inset 0), both the focus-ring technique already in
  `runtime/renderer.tsx`.
- Web: `position: absolute`; `box-shadow: 0 0 0 2px var(--nuri-bg-canvas)` (+ `inset 0 0 0 1px
  var(--nuri-border-subtle)` on a canvas disc); `position: relative` on the root **painting node**,
  not on the `display: contents` component host.

> **Q2 · Where overlap lives · resolved after review.** A `PartAnatomy` field, as above: structure,
> invariant per descriptor (no variant can move it) and invisible to the open primitives. Value
> renamed from `'bottom-end'` to `'corner-accessory'`; ring, outset, hairline and gating stay bundled
> in the one value (separate fields would be more surface for one consumer); the allowlist guard and
> the non-interactive rule bound the precedent. Rejected: a `BoxNS` field (`box.anchor`). Every
> `BoxNS` field becomes a flat prop on View, Pressable and Image (`Object.keys(BOX_FIELDS)`), which
> would hand absolute positioning to every agent-written layout.

**B3 · The two surfaces: chrome slots, accent-invariant by construction.**

| `accessorySurface` | Paints | Realisation |
|---|---|---|
| `canvas` (default · every other rail) | canvas disc, `text-primary` glyph, 1px `border-subtle` hairline | the existing chrome `canvas` (`bg-canvas` + `text-primary`); the hairline is the overlay's, no layout (B2) |
| `inverse` (Nuri users) | inverse disc (dark in light theme, light in dark), contrasting glyph | new chrome `inverse` = `bg-inverse` + `text-on-inverse` |

- Named for what it paints, following the `surface` axis on topbar and tab-bar (`surface: canvas |
  transparent`, the chrome slot each value paints).
- `bg-inverse` / `text-on-inverse` resolve to exactly the neutral `accent-solid` / `accent-on-solid`
  values in both themes (`neutral-1-dark`/`-light`, `neutral-12-dark`/`-light`). So `inverse` paints
  the requester's "solid + accent neutral" pixel for pixel, but under the lilac or orange accent it
  stays neutral. A lilac Nuri badge cannot happen.
- The existing `outline` **variant** cannot serve: it paints `transparent` + `text-muted`. Over a
  photo the disc would be see-through, and the glyph would be the 5.85:1 muted the requester
  rejected (`text-primary` is 16.03:1 on canvas).
- `inverse-muted` is already a chrome slot; `inverse` itself is not, though its roles exist. Only
  `inverse` becomes a new public chrome slot. It also becomes a `chrome=` value on View and
  Pressable: admitted for the accessory; that availability sets no precedent for further chrome rows.
- `accessorySurface` without `accessory` is a no-op.

> **Q3 · Accessory shape · resolved after review.** The narrow pair `accessory` (glyph) +
> `accessorySurface` (two values, default `canvas`), no accent; `canvas` reuses the existing chrome
> row, only `inverse` is new; the hairline is the accessory's, drawn without layout, so both surfaces
> measure 21×21 like the board. Web attribute `accessory-surface` via a generic camelCase→kebab-case
> mapping for axis attributes in the web factory (today it reads axis names raw: `factory.js:1008,
> 1116`; single-word axes are unaffected). Rejected: (a) a nested `icon-avatar` as the accessory
> (self-referencing component part at a new size): it exposes all five variants plus accent
> (coloured rail badges by the back door), its `outline` paints the wrong pair, and a
> self-referencing component part is untested in codegen; (b) `solid` variant + a per-part
> `accent: 'neutral'` pin: no descriptor pins `palette.accent` per part today, and RN resolves accent
> only as an upstream scope (`resolve.ts` · SEED-4), so it needs new engine work to avoid one palette
> row; (c) a standalone `Badge` component: consumers still cannot overlap it, and it invites
> count/status badges; (d) `accessoryVariant: 'solid' | 'outline'`: reuses the variant words while
> painting different pairs; (e) a `canvas-outline` chrome row with a palette border: the border takes
> layout on both engines, so the disc would be 23px, not the chosen 21px.

**B4 · Geometry, as chosen on the board.** The requester's first stated target was "22px disc, −3px,
2px ring, glyph about 16px". Measured on the board's first version (commit `bb33e6e` in
nuri-com/nuri-design-system#228, by probe, not by eye): disc 22×22, outset 3/3, ring 2px, **glyph
12.96px** (`<nuri-icon size="sm">` = 18px × `scale(.72)`); that page CSS never drew a 16px glyph. The
requester then iterated on the board (2026-10-24). Every row below was measured by probe on the 48px
avatar, light and dark (the fixed 24/18 row on the scratch comparison, the rest on the board), all
with a 3px outset (`space.xs`) and the 2px ring:

| Badge | Glyph | Padding | Initials | Verdict |
|---|---|---|---|---|
| 22, fixed (first version: commit `bb33e6e` in nuri-com/nuri-design-system#228) | 12.96 | — | 13px / 400 (the dropped rule) | first reviewed look; off-scale |
| 24, fixed `size.sm` | 18 `size.xs` | — | — | glyph nearly touches the hairline: reject |
| 24, fixed | 12 | — | 14.5px / 600 | balanced, but needs a 12px leaf |
| 18, fixed `size.xs` | 12 | — | 14.5px / 600 | lighter; glyph 2px from the hairline |
| 24, from content | 18 `size.xs` | 3 `space.xs` | 17px / 400 | covers about 9×5px of the second initial: reject |
| 27, from content | 15 | 6 `space.sm` | 17px / 400 | too big: reject |
| **21, from content** | **15, new `size.2xs`** | **3 `space.xs`** | **17px / 400** | **chosen by the requester; the evidence at `main@d06e2cc`** |

- **New size leaf `2xs` = 15px** (`packages/spec/tokens/dimensions.ts`), the step below `xs` (18).
  It sits on the 3px grid the space scale uses, not the size scale's own steps (18, 24, 36…). Cost:
  `SizeLeaf` widens, so `width="2xs"` becomes legal on every box-bearing surface (doc rows move).
  `2xs` is not an icon size. The token-free options were the 18px glyph rows above, both rejected.
- The 2px ring stays a literal, mirroring `FOCUS_RING_WIDTH` (the focus ring's 2px is a design
  constant, not a token). Minting `border.2` for one ring is the alternative. The 1px hairline uses
  the existing `border.1`.
- **Known contact:** at 17px the initials reach the ring, which touches the lower-right corner of a
  wide second letter by **about 1px** (independent review probe: the second letter's bounding box
  against the ring circle, Chromium/macOS `system-ui`: about 1.1px for M, 0.6–0.7px for C and K,
  about 0 for B). Font-dependent. Seen and accepted on the board (14.5px initials would clear it); the
  device check is in the native residue (§ Downstream verification plan).
- **The evidence board draws this geometry** (`packages/playground/pages/send-recipient.html` on
  `main@d06e2cc`, nuri-com/nuri-design-system#228; page CSS, still outside the DS; X17, X19 and X16
  share the classes). Probed: all 12 badges (6 inverse, 6 canvas) measure 21×21 with no width or
  height set, a 15px glyph, 3px padding, 3/3 outset, the ring and the canvas hairline as box-shadows
  (no layout), and 17px / 400 initials; the row titles keep md's −0.34px. The board sets the initials
  at +0.05em (0.85px); the contract uses the step's −0.02em (A2), which does not move the second
  letter.
- The `nuri` glyph looks optically larger than the outline glyphs at this size; that is a separate
  Correction for the DS maintenance form (noted in the five-glyph request), not a geometry question.

> **Q4 · Sizes · resolved after review.** The accessory is specified for `md` (48) only. On `sm` (24)
> a proportional badge would be about 10px, too small for a legible glyph. Enforcement:
> documentation, stated in two places: the generated API table's Notes for `accessory` and
> `accessorySurface` (`NOTE_BY_PROP`, `packages/doc/pipeline/component-api-ir.js`) and the
> `icon-avatar` page lead (same file). The RN codegen emits no per-prop TSDoc today, and this request
> adds no channel for it. The one forwarding consumer (`ListAction`) always renders `md`. A generated
> dev warning would need a `SlotSpec` field: more schema for one warning. Not proposed.

### C · ListAction forwarding

`leadingAvatar.props` gains `initials: '$slot.initials'`, `accessory: '$slot.accessory'`,
`accessorySurface: '$slot.accessorySurface'`. The generated `ListActionLeadingAvatar` marker gains
the three props / attributes. Nothing else changes in `list-action`. Because of the mode lock (A2),
`<ListActionLeadingAvatar initials="EB" />` paints soft despite the row's `outline` default.
`SelectTrigger` / `SelectField` avatars do **not** forward (no consumer).

**Codegen:** forwarded marker props are typed from the target component's api, generically
(public axis → its value union; slot kind → `IconName` / `ImageSourcePropType` / `string`; `accent` →
`Accent`), replacing the hand special-cases in `slotPropTs` (`components-api.js:318-325`, which today
types only `accent`, `variant` and the `SLOT_PROP_TS` map, and would emit `unknown` for the three new
props).

### D · Accessibility

`IconAvatar` stays decorative (decision 50): initials and the accessory are hidden from assistive
tech along with the circle.

**Contract:** the accessory is **never the only carrier of the rail**. The rail is named in visible
row text or in the row's `accessibilityLabel`; a handle is not a name. Today `send.html` labels the
bank row "Claude M., N26 account ending 4521" but a Nuri row "Emil Berg, at emil" (`send.html:67`),
which implies the rail without naming it. The rebuilt `send.html` Nuri rows read **"Emil Berg, Nuri
user, @emil"**.

> **Q5 · Labels · resolved after review.** No `accessoryLabel` prop; the contract sentence above. A
> labelled standalone avatar is anti-scope until a consumer shows one.

### Schema / codegen / engine ledger (what moves deliberately)

| # | Where | Change | Guard |
|---|---|---|---|
| 1 | `schema.ts` `PartAnatomy` | `overlay?: 'corner-accessory'` | Guard-F pin moves · new overlay allowlist guard (`icon-avatar.accessory` only; non-interactive `view` host) |
| 2 | `schema.ts` `SlotSpec.kind` | `+ 'initials'` (scalar, prop-legal) | Guard-F pin moves · Channel 7 admits the kind · new guard: a `text` slot is `component` or `default` |
| 3 | `schema.ts` `ComponentApi.propMaps.contentMode` | single slot → ordered `present` list | Guard-F pin moves |
| 4 | `schema.ts` `PaletteChrome` + `palette-surface.ts` | `+ 'inverse'` | Guard-F pin moves (`leafUnions`) · palette guards (web Guard D · RN `palette.js` `PALETTE_CONTRACT` cell check) |
| 5 | `tokens/dimensions.ts` `size` | `+ 2xs: 15px` | dimension-token oracle |
| 6 | `scripts/parsers/components-api.js` | forwarded marker props typed from the target's api (generic) | component-api tests + RN type-tests |
| 7 | web `factory.js` | axis attributes camelCase → kebab-case (generic; single-word axes unchanged) | factory test |
| 8 | RN `renderer.tsx` + web `factory.js` / CSS | the `corner-accessory` overlay: placement, ring, canvas hairline, content gating | render-smoke + factory test |
| 9 | RN `renderer.tsx` | text leaves in a `decorative` descriptor: `allowFontScaling={false}` | render-smoke |

Guard F moves for **four** frozen surfaces (rows 1–4), in one deliberate, commented move. No tracking
token, no kind-keyed presentation rule, no resolver change.

### Proposed anti-scope (refused generalisation)

- No person colour palettes of any kind (pastel, Radix, hue wheel, hash-to-colour); initials are
  always `soft`. `variant` and `accent` are documented no-ops in initials mode.
- No coloured rail badges and no per-rail colour table; colour is not a rail code. Exactly two
  accessory surfaces; no accessory accent; no lilac Nuri badge.
- No KYC / "verified" / status marks, no count or notification badges, no online dots. The
  accessory is a rail glyph from the DS icon set: no image and no initials in the accessory, and no
  status or motion glyphs as accessory content (`check-circle`, `warning-circle`, `cross-circle`,
  `spinner`). The type stays `IconName`: which glyphs are rails is product knowledge.
- No `overlay` value other than `'corner-accessory'`; no `overlay` on any part other than
  `icon-avatar.accessory` (allowlist guard; another use is a new Extension); no `overlay` on
  View/Pressable/Image; overlay parts are non-interactive; no general positioning vocabulary.
- No surface-adaptive ring: it is `bg-canvas`. On a non-canvas surface (a `strong` card, a pressed
  `bg-subtle` row while the finger is down) it shows as a canvas ring. No ring width or colour option.
- `inverse` is admitted for the accessory; its availability as `chrome=` on View and Pressable sets
  no precedent for further chrome rows.
- No accessory on `sm`; no new avatar size. nuri-expo's 72px "hero" avatar
  (`components/SendRecipientContact.tsx:16` "the DS avatar only comes in list sizes") stays app-owned.
- `2xs` is a size leaf, not an icon size: no new icon step.
- No name parsing, casing or grapheme logic in the DS; no image fallback to initials (no load or
  error states: the image-mode anti-scope stands; the caller passes one content). Three or more
  letters truncate; that is not a feature.
- No letter-spacing option or token anywhere: initials use their step's letter-spacing. No
  text-transform: the caller supplies capitals.
- Initials do not follow the OS text size (RN); no font-scaling option.
- `accessorySurface` without `accessory` is a no-op.
- No generated avatars: nuri-expo's wordpets stay an app decision.
- No forwarding through `SelectTrigger` / `SelectField`.

## Consumer need, gap, and current workaround (before admission)

- **Consumer / owner:** @darioaschero, for nuri-com/nuri-expo: send S1 (recipient list), the search
  mode, the address book.
- **Concrete use case:** a row "Emil Berg · @emil" with EB initials and an inverse Nuri accessory;
  "Claude M. · N26 ···4521" with CM initials and a canvas `bank` accessory; the same accessory over a
  profile photo.
- **Gap:** `IconAvatar` takes a glyph or an image only; `ListActionLeadingAvatar` forwards only
  `name`/`variant`/`accent`/`source`; nothing in the DS can overlay a part.
- **Current workaround (DS evidence page):** `packages/playground/pages/send-recipient.html` on
  `main@d06e2cc` (nuri-com/nuri-design-system#228). Every person row is hand-built: a `nuri-view` row
  + a `<span class="xav">` circle + a `<span class="xbadge">` badge, styled by a
  `<style data-outside-ds>` block, with the chevron copied by hand.
- **Current workaround (the app):** nuri-expo (`feat/send-shortcut-1741@bdf020b1`) draws every
  contact as a generated wordpet PNG passed as `source`:
  `screens/addressBook/AddressBookScreen.tsx:140` and `components/AddressBookSuggestions.tsx:106`
  (`<ListActionLeadingAvatar source={contactAvatar(…)} />`), plus a raw 72px `Image` in
  `components/SendRecipientContact.tsx`. Rail marks are coloured PNG logos
  (`lib/addressBook/kindImages.ts`).

## Available consumer-local prototype or evidence (before admission)

- **Boards on `main@d06e2cc`** (nuri-com/nuri-design-system#228):
  `packages/playground/pages/send-recipient.html` (outside the DS, with disclaimer): **X17** target
  (initials + accessory), **X19** the same accessory on photos (randomuser.me placeholder portraits,
  inlined), **X16** what nuri-expo draws today (vendored wordpets, for reference); its closing GAP LOG
  lists what this contract must cover. `packages/playground/pages/send.html` (pure DS): the decided
  send boards, whose person rows this contract would rebuild.
- **App code:** nuri-expo `feat/send-shortcut-1741@bdf020b1`, the files named above; the app already
  derives letters (`lib/addressBook/initial.ts`, `initialOf`, for index grouping).
- **External references** (Mobbin, iOS). The pattern of a network/rail badge at the bottom-right of a
  person avatar recurs across fintech send flows:
  - Revolut: "contacts on Revolut" list, coloured initials + a black "R" badge with a canvas ring
    ([screen](https://mobbin.com/screens/f279e075-cb96-414a-90d8-071cb1e7d3ff)); the same badge on a
    photo ([screen](https://mobbin.com/screens/f6d78153-b465-4143-bb11-6ec1efe20406)) and on search
    results ([screen](https://mobbin.com/screens/ec2b8dcb-9432-4084-a9a2-3219176c42f5)).
  - Wise: request list with **neutral** initials + a Wise badge, beside an outline-glyph action row
    "Anyone" ([screen](https://mobbin.com/screens/fec122dc-d3b8-4ad5-81c4-db6b25eee921)); search
    "On Wise" ([screen](https://mobbin.com/screens/e870a006-6cd6-48b9-84c1-a666c20dea77)). Closest
    to this target: neutral initials, glyph actions in the same list.
  - Monzo: split-bill contacts, initials and photos with an "M" badge
    ([screen](https://mobbin.com/screens/ebd099d4-afa1-4f7c-9f10-9fec762ff5d1)); an account-type
    glyph badge on initials ([screen](https://mobbin.com/screens/cf70d9ae-6e37-407e-98e4-4b9e6fdfc5e7)).
  - **Honest limit:** in these references the badge mostly marks *in-network* users (Revolut,
    Wise, Monzo). Badging *every* external rail with a monochrome canvas glyph is Nuri's own
    extension of the pattern, and Revolut and Monzo use per-person colours, which this request drops.
- **Corrections found while preparing this request** (by probe, on the board's first version:
  commit `bb33e6e` in nuri-com/nuri-design-system#228): the accessory glyph was 12.96px, not ~16px
  (§B4). The initials rendered at **13px / weight 400**: the page rule `font: 600 15px/1 inherit` was
  an invalid shorthand (a `font` value cannot end in `inherit`), so the browser dropped it. The "600,
  size-scaled" treatment in the first decision was therefore never on screen; once the rule was fixed
  and compared, the requester chose `md` (17px) regular (§A2, §B4).
- **Corrections from the independent review** (https://github.com/nuri-com/nuri-design-system/issues/231#issuecomment-6387666532):
  the outline disc as first proposed (a chrome row with a palette border) would measure 23px, not
  21px; Guard F covers four surfaces, not three; the web axis attribute and the forwarded-prop types
  needed generic changes; the initials-to-ring contact is about 1px, not ~2px. All are answered in
  the amended text above.
- **Missing evidence and owner:** an exact nuri-com/nuri-expo issue or PR for the send S1 /
  address-book avatar change; owner @darioaschero.

## Class-scoped Contraction / Mixed evidence

Filed as an Extension. One internal reshape is listed here in case the architect reads it as a
narrowing: `ComponentApi.propMaps.contentMode` changes from one slot to an ordered list (§A3). Its
only user is `icon-avatar`, and no descriptor is authored outside this repo (`contentMode` appears
only in `schema.ts`, `icon-avatar.ts`, its generated twin
`packages/prototype/generated/descriptors/icon-avatar.js`, `scripts/parsers/components-api.js`,
`packages/prototype/factory/factory.js` and the Guard-F pin). The new bare-`text` guard (A4) forbids
a slot shape no descriptor uses. Affected consumers: none; migration: the one in-repo descriptor, in
the same PR; rollback: revert that PR.

## Class-scoped Extension / Mixed evidence

- **Recurrence:** inside nuri-expo, three list surfaces render person avatars today (address book
  list, address-book suggestions, the activity sheet's contacts via `contactAvatar`), and send S1 +
  search add two more. Outside: three of the reference fintech apps above show initials and an
  in-network badge. The overlap itself (a glyph badge on a circle) is the one composition no consumer
  can build from DS parts. **Product decision, not recurrence:** showing the rail on *every* external
  contact (the `canvas` accessory) is the consumer owner's product decision for Nuri; the references
  badge only in-network users.
- **DS ownership:** the look (circle, initials type step, accessory disc, ring, hairline, the two
  surfaces) and its cross-platform mechanics (out-of-flow placement, knockout ring, content gating,
  fixed-size decorative text) are presentation vocabulary. Which rail a contact uses, the letters,
  and the row's label stay consumer-owned.
- **Trade study:**
  - *Keep it consumer-owned (an app wrapper around `IconAvatar` with an absolute badge):* works in
    nuri-expo's RN code, but `ListActionLeadingAvatar` only accepts `IconAvatar` props, so the app
    must hand-build rows and loses the list-row contract (72px floor, press, a11y, trail icon).
    **Rejected.**
  - *A nested `icon-avatar` as the accessory, a `Badge` component, a per-part accent pin, a
    composition initials marker, a bordered `canvas-outline` chrome row:* rejected in Q1 and Q3.
  - *Off-scale literals (22/13) baked into the engines:* rejected; hand numbers in the engines are
    exactly what the token discipline and `rn-token-escape-hatch` guard exist to stop.
  - *Existing leaves only (an 18px glyph, in a fixed or a padded 24px badge):* rejected on the
    board (§B4).
  - *`overlay` as a `BoxNS` field:* rejected (Q2).
  - *Caps letter-spacing (`tracking.caps`):* dropped after review (Q1).
- **Contract cost:** 4 frozen-schema surfaces (Guard-F pin, one move), 1 chrome slot, 1 size leaf,
  1 generic overlay realisation per engine (placement, ring, canvas hairline, gating), 1 RN
  font-scaling rule for decorative text, 1 new slot kind, 2 new guards (overlay allowlist; bare
  `text` slots), generic forwarded-prop typing in the codegen, generic axis-attribute kebab mapping in
  the web factory, the `contentMode` reader reshaped in 2 places, `icon-avatar` + `list-action`
  descriptor data, doc pages.
- **Compatibility:** additive for consumers. With none of the new props set, `IconAvatar` and
  `ListAction` render as today: the `initials` leaf has no content, and the overlay host is gated.
  The axis-attribute mapping changes nothing for today's single-word axes. Existing render-smoke
  snapshots should not move; any that do must be justified. Generated deltas expected: RN
  `icon-avatar.ts` / `list-action.ts` adapters, `recipes.ts`, `palette.ts`, `tokens.ts` /
  `token-paths.ts` (the `2xs` leaf); web descriptor twins, `palette.css` (1 row), token CSS (`2xs`) +
  `box.css` (the `2xs` leaf), the overlay rule; doc pages (`icon-avatar`, `list-action`, the palette
  and dimension foundations, every page whose `width`/`height`/`chrome` union widens).
- **Anti-scope:** see "Proposed anti-scope" under the contract delta.

## Requested DS architect / admission recorder

@darioaschero · second human architectural reviewer: none · sole-architect exception (@darioaschero) · independent review: https://github.com/nuri-com/nuri-design-system/issues/231#issuecomment-6387666532 (docs/design-system-admission.md, "Named exception · sole DS architect (@darioaschero)", nuri-com/nuri-design-system#229)

## Architect decision record location (architect-owned)

_(Leave empty on initial request: architect-owned.)_

## Proposed bounded execution scope if admitted

- **Spec:** `components/schema.ts` (deltas 1–4), `components/icon-avatar.ts` (anatomy `initials`,
  `accessory` with `overlay: 'corner-accessory'`, `accessoryIcon`; `mode` gains `initials`;
  `accessorySurface` axis + default `canvas`; `contentMode` list; slots), `components/list-action.ts`
  (3 forwarded props), `tokens/dimensions.ts` (`2xs`), `axes/palette-surface.ts` (the `inverse`
  chrome row).
- **Codegen / guards:** `scripts/parsers/components-api.js` (the scalar `initials` kind → `string`
  prop / attribute; `contentMode` list with presence = non-empty for initials; the generalised
  warning; forwarded marker props typed from the target's api), `scripts/parsers/palette.js`
  (`PALETTE_CONTRACT` row), `scripts/docs-drift.test.js` (Guard-F pin for the four surfaces, moved
  once, the move commented), `scripts/component-api.test.js` (Channel 7 admits the `initials` kind;
  the bare-`text` guard; the overlay allowlist + non-interactive guard), the dimension and palette
  oracles.
- **RN:** `runtime/renderer.tsx` (overlay placement + ring + canvas hairline + content gating;
  initials routed to the text leaf; `allowFontScaling={false}` on text leaves of a decorative
  descriptor), regenerated `generated/`, render-smoke + type-tests (`IconAvatarProps`,
  `ListActionLeadingAvatarProps` exact).
- **Web:** `factory/factory.js` (overlay, ring, hairline, gating; camelCase→kebab-case axis
  attributes), the overlay CSS rule, regenerated styles + descriptor twins, `factory.test.js`.
- **Playground:** `component/icon-avatar.html` and `component/list-action.html` proofs; `send.html`
  person rows rebuilt as `list-action` rows with `initials` + `accessory` (Nuri rows labelled "Emil
  Berg, Nuri user, @emil"); **delete `send-recipient.html` and its card in `pages/index.html`**
  (line 51 on `main@d06e2cc`).
- **Expo-demo:** one committable screen or section with the person rows (never the operator-local
  `screens/index.tsx` / `Overview.tsx`).
- **Doc:** generated pages + the IR notes (`packages/doc/pipeline/component-api-ir.js`: the
  `icon-avatar` lead and the `NOTE_BY_PROP` notes for `accessory` / `accessorySurface`, `md` only) +
  the drift pins, kept in sync.
- **NOT in scope:** the five-glyph request (its own issue), nuri-expo changes (the consumer's PR),
  `SelectTrigger` / `SelectField` forwarding, a hero size, a search trigger, the merge.

## Downstream verification plan (before Ready)

- [ ] **Repository checks / CI:** root `npm run build` + `npm test`; the 5 gates (`spec` · `prototype`
      · `doc` · `rn` render-smoke + tsc · `expo-demo` tsc), including `@nuri/doc` (`npm test` +
      build + `git diff --exit-code packages/doc/generated/`); re-emit determinism (two builds,
      identical hashes); only the generated files listed above differ.
- [ ] **Contract / type proof:** `IconAvatarProps` and `ListActionLeadingAvatarProps` exact (the three
      new keys, `initials: string`, `accessory: IconName`, `accessorySurface: 'canvas' | 'inverse'`,
      no `unknown`, still `children?: never`); the Guard-F pin moved once for the four surfaces;
      the overlay allowlist and bare-`text` guards fail on a synthetic violating descriptor;
      existing snapshots unchanged or justified.
- [ ] **Rendered proof, web (by probe, not by eye):** at 48px, for initials, image and glyph, each
      with no accessory, `canvas` and `inverse`, light and dark: **both surfaces** measure 21×21
      with no width/height set (15px glyph + 3px padding), outset 3/3, ring 2px in `bg-canvas`, the
      `canvas` hairline 1px `border-subtle` with no layout, glyph 15×15, initials 17px / 400 with
      the step's letter-spacing (−0.34px); the `inverse` disc colour equals `--nuri-accent-solid`
      under `data-accent="neutral"` **and stays equal under lilac and orange**; no accessory node
      exists when `accessory` is absent; `initials=""` renders glyph mode with no text node; the
      overlay's containing block is the root painting node, not the `display: contents` host;
      `accessory-surface` is observed and live-updates; the host stays `aria-hidden`.
- [ ] **Rendered proof, RN-web (Expo web preview, by probe):** the same geometry on host nodes (both
      surfaces 21×21); the accessory is drawn above an image; `variant`/`accent` are no-ops in
      initials mode; the initials `Text` carries `allowFontScaling={false}` (render-smoke).
- [ ] **Native residue (operator, device):** Android drawing the accessory 3px outside the 48px
      avatar (RN Android overflow), the ring and hairline at device pixel densities, VoiceOver/
      TalkBack reading the row label (including "Nuri user") and not the letters, the 17px initials
      against the ring with wide second letters (B, M: the accepted ~1px contact, §B4) at the
      device's system font, and **OS text size at the largest accessibility setting** (iOS Larger
      Accessibility Sizes, Android font scale max): initials stay fixed and untruncated, the row
      name scales.
- [ ] **Real consumer:** an exact nuri-com/nuri-expo PR replacing the wordpet `source` in
      `AddressBookScreen.tsx:140` and `AddressBookSuggestions.tsx:106` with `initials` + `accessory`.
      Attached during Verification/Done, never before Ready.

## Acceptance criteria and Verification/Done evidence

1. `send.html` person rows are pure DS `list-action` rows, Nuri rows labelled with the rail ("Emil
   Berg, Nuri user, @emil"); `send-recipient.html` and its index card are gone; no `data-outside-ds`
   CSS remains in the playground.
2. The geometry and colour probes above pass on web and RN-web, light and dark; both surfaces 21×21.
3. Accent invariance: the accessory never changes colour with the accent; initials never leave
   `soft`.
4. Existing `IconAvatar` (glyph, image) and `ListAction` renders unchanged.
5. Full gate suite green, including `@nuri/doc`; regeneration deterministic; the two new guards
   present and proven to fail on a violation.
6. Doc pages generated for the new props, the `inverse` chrome slot and the `2xs` leaf; the
   anti-scope sentences on the `icon-avatar` page (decorative accessory, the rail always named in row
   text or label, `md` only, canvas ring, fixed-size initials, step letter-spacing) and `md` only in
   the API table notes.
7. The schema deltas recorded in the Guard-F pin comment + this record (the decisionlog is archived).
8. This record's status line flipped in the SAME PR that ships the implementation.

## Owning repository and base branch

nuri-com/nuri-design-system @ main (baseline `main@d06e2cc`)

## Dependencies and human decisions

- Evidence: nuri-com/nuri-design-system#228 (merged as `d06e2cc`; the boards cited above).
- Precedents: the image-mode arc (IconAvatar `source`); decision 50 (decorative avatar); the
  `surface` axis on topbar and tab-bar (axis named for the chrome slot it paints).
- Companion request (independent, filed separately): the five icon glyphs
  nuri-com/nuri-design-system#230.
- Independent review posted:
  https://github.com/nuri-com/nuri-design-system/issues/231#issuecomment-6387666532 (verdict "Admit
  with changes"). Q1–Q5 are answered in this amended text following the architect's direction.
- Decision Needed: the admission decision by @darioaschero under the sole-architect exception
  (docs/design-system-admission.md, "Named exception · sole DS architect (@darioaschero)",
  nuri-com/nuri-design-system#229), recorded in an architect-owned comment that answers each concern
  the review raised. The geometry was chosen by the requester on the board (§B4: a 21px badge from a
  15px glyph + 3px padding, 17px regular initials).

## Risk class

Product

## Authority, responsibility, and accountability evidence

- **May change if admitted:** only the artifacts under "Proposed bounded execution scope".
- **Excluded:** the five-glyph request, nuri-expo code (the consumer's own PR), `SelectTrigger` /
  `SelectField` forwarding, a hero avatar size, a search trigger (evaluated separately against
  SelectField).
- **Approval boundaries:** the requester decided the target on 2026-10-24; the drafting agent may
  not admit, record decisions, move Project state, tag or merge. Admission is @darioaschero's record
  under the sole-architect exception, informed by the independent review session; execution starts
  only at Project `Ready`. Amended 2026-10-24 after the independent review, following the
  architect's direction on the open calls.
- **Independent verification:** the probes, gates and device checks in the verification plan, plus
  the nuri-com/nuri-expo PR attached at Verification/Done.

## Release, migration, and documentation plan

- **Release note:** the two props + `accessorySurface`, the `ListAction` forwarding, the `inverse`
  chrome slot, the `2xs` = 15px size leaf, the descriptor-only `overlay: 'corner-accessory'`,
  fixed-size initials on RN, camelCase→kebab-case axis attributes on web.
- **Migration:** none for consumers (additive). Inside the repo: `send-recipient.html` and its index
  card deleted, `send.html` person rows rebuilt as `list-action` rows.
- **Documentation:** generated pages for `icon-avatar`, `list-action` and the palette and dimension
  foundations; the Guard-F pin comment records the schema deltas.
- **Rollback:** revert the single PR.

## Admission-request acknowledgements

Tick all fourteen boxes. All apply as written: this is a request only (no `Admit`, no `Ready`); the
roles overlap, and the second-reviewer box is met through the sole-architect exception
(docs/design-system-admission.md, nuri-com/nuri-design-system#229): an independent review session
posts on this issue and its link goes into the decision record; the Extension evidence is above;
executed Expo/device proof comes after implementation; references use canonical `owner/repo#number`
form.

---

## Drafting log (not part of the form)

- 2026-10-24 · phase 1. Read the admission policy, the form, the media-card record (precedent),
  `icon-avatar.ts`, `list-action.ts`, `schema.ts`, `palette-surface.ts`, `dimensions.ts`, the RN
  renderer/resolver, the web factory's `contentMode` path, both evidence pages and nuri-expo's
  address-book code. Mobbin references gathered.
- 2026-10-24 · probed the board's first version (geometry in §B4, the dropped `font` rule); rendered a
  scratch comparison (deleted, never committed).
- 2026-10-24 · requester iterated the geometry on the board and chose 17px regular initials, a 15px
  glyph with 3px padding (21px badge) and a `2xs` = 15px size leaf; then +0.05em initials
  letter-spacing built into the initials content kind.
- 2026-10-24 · operator review: approved in substance; the icons request reduced to five glyphs; a
  device check of the 17px initials against the ring added to the native residue.
- 2026-10-24 · step 1: nuri-com/nuri-design-system#228 merged as `d06e2cc` (its playground pages are
  identical to the reviewed `4ab342d`); evidence re-pointed to `main@d06e2cc`; owners filled in; the
  icons split into `prompts/admission-icons-five-glyphs.md`; sections reordered to the form.
- 2026-10-24 · step 2: the sole-architect exception (nuri-com/nuri-design-system#229, policy version
  `main@45918bb`) applied to the reviewer field, the decision line, authority and acknowledgements.
- 2026-10-24 · step 3: filed as nuri-com/nuri-design-system#231; independent review posted
  (issuecomment-6387666532, "Admit with changes"). Amended per the architect's direction: canvas
  hairline without layout (both surfaces 21×21; A, B, C together); `accessoryVariant` →
  `accessorySurface: canvas | inverse` (only `inverse` new) + web axis kebab mapping;
  `tracking.caps` dropped; RN initials fixed-size (`allowFontScaling={false}` on decorative text);
  rail always named in row text or label; overlay renamed `corner-accessory` + allowlist; initials
  presence non-empty; bare-`text` guard; generic forwarded-prop typing; Guard F = four surfaces;
  contact ≈1px. The amendment was made by the session that wrote the review; any further independent
  review of this text needs a new session.
