# The primitive layer — the map + the web↔RN parity contract

> **Status:** AUDIT (read-only · foundation). This is the authoritative inventory of
> `@nuri/prototype`'s primitive layer and the spec of the parity contract that keeps the web and
> RN primitive surfaces in sync. It maps what exists, classifies every element, lists the gap, and
> specifies the contract mechanism + the follow-up sequencing. It changes **no** code — the
> implementation briefs are spun from §4.
>
> **When in doubt: code wins, then `README.md`, then this doc.** Every load-bearing claim cites
> `file:line`.

---

## 0. The settled framing (encoded, not relitigated)

The operator + coordinator have settled the architecture; this audit encodes it:

- **`View` is the structural primitive** — the painting node carrying **box ⊕ stack ⊕ palette**, the
  1:1 of RN `<View>`. On web `<nuri-view>` already *is* that merged node
  (`<nuri-view class="nuri-box nuri-stack nuri-palette" data-…>` ·
  [view.js:32](packages/prototype/primitives/view.js:32)).
- **box / stack / palette / interactive / typography are NAMESPACES** (disjoint style slices ·
  [schema.ts:200-206](packages/spec/components/schema.ts:200)), not standalone primitives. At the
  API level we expose **thin wrapper components over View**.
- **The hand-authorable primitive layer = `Stack` + `View` only. `Box` is DROPPED** — its geometry
  (padding/radius/sizing/aspect-ratio) is the **box namespace**, which already lands on `View`. A
  "geometry-without-palette" box is not a distinct intent; `View` covers it. `Stack` stays — flex
  layout is the one dominant, distinct structural intent.
  - Guideline: **Stack = laying out children · View = a surface/box/leaf.**
- **Both targets implement the primitives as thin wrappers** that forward namespace props through
  the shared `resolve-map`: web = a custom element + the generated namespace CSS; RN = a component
  → `<View style={…}>`. **RN's hand-authorable wrappers now exist — the audit-era gap is closed (§2).**

### 0.1 The reconciliation, discharged — `El` is 4 (the el:'pressable' bump)

The framing names **four** parity primitives — *view · text · icon · pressable* — and the frozen
schema `El` union now has **four** members to match:

```
El = 'view' | 'text' | 'icon' | 'pressable'
```
[schema.ts](packages/spec/components/schema.ts) · pinned by Guard F as
`El: ['view', 'text', 'icon', 'pressable']` ([scripts/docs-drift.test.js](scripts/docs-drift.test.js)).

An earlier revision of this section held the union at three ("Pressable is not a 4th `El` — it is
the `interactive`-flagged `view` … adding one is a versioned Guard-F bump"). **That bump is done
(amendment 65.13):** *which JSX host a part renders as* is a static, per-descriptor **structural**
fact, so it lives in the anatomy — not derived from the behaviour channel (the old RN sniff) or the
`interactive` flags (the old web sniff). Both renderers are now a pure switch over `el`: RN
`el:'pressable'` → `<Pressable>` ([renderer.tsx](packages/rn/runtime/renderer.tsx)), web
`el:'pressable'` → `<nuri-pressable>` ([factory.js](packages/prototype/factory/factory.js)). The
`interactive` opt-in ([schema.ts](packages/spec/components/schema.ts) `InteractiveNS`) still chooses
only the **effects**; the behaviour channel carries only runtime handlers. The coherence guard
([component-api.test.js](scripts/component-api.test.js) Channel 2) pins the three legs together as
a true equivalence (four checked directions, each a named failure — including review §9's "onPress
must not exist independent of interactivity", restored as direction 4):
`el:'pressable'` ≡ the declared `behaviour.pressable.target` ≡ the `interactive`-flagged parts.

So: **4 `El` cases, 4 parity primitives** — View, Text, Icon, Pressable. 1:1.

---

## 1. The primitive registry

Every `packages/prototype/primitives/*` element + the relevant generated namespace CSS, each in
**exactly one** bucket. "Web impl" = the live custom element; "RN impl" = a **hand-authorable**
exported component (the factory's *internal* `el`-render does not count — it is not a primitive a
consumer can write).

### 1.A — CONTRACTED (must have web + RN parallel impls)

| Primitive | Web element / file | Web? | RN hand-authorable? | Namespace / prop surface (schema SoT) |
|---|---|---|---|---|
| **View** | `<nuri-view>` · [view.js](packages/prototype/primitives/view.js) + [view.css](packages/prototype/primitives/view.css) | ✅ the merged box⊕stack⊕palette host | ✅ **`View`** ([primitives/View.tsx](packages/rn/primitives/View.tsx)) | `box` + `stack` + `palette` ([schema.ts:135,109,173](packages/spec/components/schema.ts:135)) |
| **Stack** | `<nuri-stack>` · [stack.js](packages/prototype/primitives/stack.js) + [styles/stack.css](packages/prototype/styles/stack.css) | ✅ | ✅ **`Stack`** ([primitives/Stack.tsx](packages/rn/primitives/Stack.tsx)) | `stack` (`StackNS`: direction·align·justify·gap·wrap·fill · [schema.ts:109-116](packages/spec/components/schema.ts:109)) |
| **Text** (Typography) | `<nuri-typography>` · [typography.js](packages/prototype/primitives/typography.js) + [styles/typography.css](packages/prototype/styles/typography.css) | ✅ | ✅ **`Text`** ([primitives/Text.tsx](packages/rn/primitives/Text.tsx)) | `typography` (`size`·`emphasis`·`align` · [schema.ts](packages/spec/components/schema.ts)) + colour via `palette` |
| **Icon** | `<nuri-icon>` · [icon.js](packages/prototype/primitives/icon.js) + [icon.css](packages/prototype/primitives/icon.css) | ✅ | ✅ **`NuriIcon`** ([primitives/NuriIcon.tsx](packages/rn/primitives/NuriIcon.tsx), exported on the public barrel [index.ts](packages/rn/index.ts)) | typed `IconName` + `dimension` (shared `size` axis) + `color` (scope fg) |
| **Pressable** | `<nuri-pressable>` · [pressable.js](packages/prototype/primitives/pressable.js) + [pressable.css](packages/prototype/primitives/pressable.css) | ✅ | ✅ **`Pressable`** ([primitives/Pressable.tsx](packages/rn/primitives/Pressable.tsx)) | `interactive` (`pressColor`·`pressScale`·`disabledOpacity` · [schema.ts:191-195](packages/spec/components/schema.ts:191)) + box⊕stack⊕palette |
| **Screen** (structural) | `<nuri-screen>` · [screen.js](packages/prototype/primitives/screen.js) + [screen.css](packages/prototype/primitives/screen.css) | ✅ flex-column fill | ✅ **`Screen`** ([primitives/Screen.tsx](packages/rn/primitives/Screen.tsx)) | none — pure structural fill |
| **Scroll** (structural) | `<nuri-scroll>` · [scroll.js](packages/prototype/primitives/scroll.js) + [scroll.css](packages/prototype/primitives/scroll.css) | ✅ flex-fill + overflow | ✅ **`Scroll`** ([primitives/Scroll.tsx](packages/rn/primitives/Scroll.tsx)) | none — pure structural fill + overflow |
| **Separator** | `<nuri-separator>` · [separator.js](packages/prototype/primitives/separator.js) + [separator.css](packages/prototype/primitives/separator.css) | ✅ horizontal hairline | ✅ **`Separator`** ([primitives/Separator.tsx](packages/rn/primitives/Separator.tsx)) | local `ySpace: none \| xs \| sm \| md \| lg \| xl`; visible line uses `border.1` + scoped `border.subtle` |
| **ListSeparator** (preset) | `<nuri-list-separator>` · [list-separator.js](packages/prototype/primitives/list-separator.js) + [list-separator.css](packages/prototype/primitives/list-separator.css) | ✅ list-family inset wrapper over `<nuri-separator y-space="sm">` | ✅ **`ListSeparator`** ([primitives/ListSeparator.tsx](packages/rn/primitives/ListSeparator.tsx)) | none — no props; fixed `md` inset, hairline + vertical rhythm delegated to Separator |

All contracted primitives now have web + RN implementations. Separator is a parity primitive because
the hairline width and scoped border colour are part of the DS contract, even though its prop surface
stays intentionally local and small. ListSeparator is a preset beside it: it owns only the list-family
inset, so the hairline paint and vertical rhythm remain single-sourced in Separator.

**Screen / Scroll do NOT map to the descriptor factory.** They are structural containers with no
namespace composition. On RN they map to react-native directly, per their own headers:
- **Screen → "a thin component over `<View>` (flex:1)"** ([screen.js:9](packages/prototype/primitives/screen.js:9)).
- **Scroll → "a thin component over `<ScrollView>`"** ([scroll.js:8](packages/prototype/primitives/scroll.js:8));
  its content padding is a padded child (today documented as `<nuri-box padding>` ·
  [scroll.css:23](packages/prototype/primitives/scroll.css:23) → becomes a padded `<View>` post-Box-fold).

#### The namespace CSS (the style slices `View`/`Pressable` carry — NOT standalone primitives)

`packages/prototype/styles/*.css` is **generated** from the resolve-map Field tables
([box.css:1-15](packages/prototype/styles/box.css:1)). These are the five namespaces; `palette` and
`interactive` never had a standalone element — they ride `View`/`Pressable` as `.nuri-palette` /
`.nuri-interactive` classes.

| Namespace CSS | Schema NS | resolve-map SoT |
|---|---|---|
| [styles/box.css](packages/prototype/styles/box.css) | `BoxNS` | `BOX_FIELDS` ([resolve-map.ts:121-135](packages/spec/axes/resolve-map.ts:121)) |
| [styles/stack.css](packages/prototype/styles/stack.css) | `StackNS` | `STACK_FIELDS` ([resolve-map.ts:101-108](packages/spec/axes/resolve-map.ts:101)) |
| [styles/palette.css](packages/prototype/styles/palette.css) | `PaletteNS` | palette resolver (RN) / cascade (web) |
| [styles/interactive.css](packages/prototype/styles/interactive.css) | `InteractiveNS` | the interaction baseline |
| [styles/typography.css](packages/prototype/styles/typography.css) | `TypographyNS` | text wrapper dispatch (`muted` · `align`) + type-scale hooks |

### 1.B — FOLD / RETIRE

| Element | File | Verdict |
|---|---|---|
| **Box** (`<nuri-box>` standalone element) | [box.js](packages/prototype/primitives/box.js) | **FOLD → View.** Retire the standalone custom element; the **box *namespace* stays** (see below). |
| **Spacer** | [spacer.js](packages/prototype/primitives/spacer.js) | **Web helper + trivial RN.** Header: "grow → `<View style={{flex:1}} />`; size → a `<View>` with fixed width/height" ([spacer.js:15-16](packages/prototype/primitives/spacer.js:15)). Not a contracted parity primitive. |
| **Scope** | [scope.js](packages/prototype/primitives/scope.js) | **WEB-ONLY mechanism — keep, not a parity primitive.** It is a CSS-cascade scope (`display:contents`, mirrors props → `data-*`). Its own header: "web-only … In RN the same semantic is expressed via React Context (e.g. `<AccentProvider>`), not via Unistyles … the pipeline does NOT translate `<nuri-scope>` 1:1" ([scope.js:11-14,36-38](packages/prototype/primitives/scope.js:11)). The RN equivalent already exists — `NuriThemeProvider` / `NuriScope` ([theme.tsx](packages/rn/theme.tsx)). |

#### The Box fold — work-list (the namespace stays; only the standalone *element* retires)

The critical distinction: the **`.nuri-box` CLASS / box.css / `BOX_FIELDS`** is the box namespace —
**load-bearing, stays.** It is applied programmatically onto the merged painting node by the web
factory ([factory.js:160](packages/prototype/factory/factory.js:160)) and by the icon for glyph
sizing ([icon.js:72](packages/prototype/primitives/icon.js:72)), and `View` already declares it
([view.js:32](packages/prototype/primitives/view.js:32)). **The fold is a no-op at the namespace
level** — geometry already reaches `View`.

What retires is the **`<nuri-box>` standalone custom element** ([box.js](packages/prototype/primitives/box.js)
— the `display:contents` wrapper around an inner `<div>`). Its **live markup consumers are
effectively zero**: every `<nuri-box …>` *element* usage is in archived/frozen surfaces, not in any
active component or screen:
- `packages/doc/archive/components/*.html` — `box.html`, `scroll.html`, `separator.html`,
  `screen.html`, `icon-avatar.html` (archived doc pages).
- `packages/prototype/legacy/**` (frozen oracle).
- No active playground/demo screen uses `<nuri-box>` markup (the active screens compose with
  `<nuri-stack>` + page-local CSS · see §4 ④).

So the fold work-list = **(a)** delete `box.js` (the element) + its `nuri-box { display:contents }` /
`:not(:defined)` host rules in box.css (keep the `.nuri-box[...]` namespace rules); **(b)** update the
Scroll doc pattern (`<nuri-box padding>` → padded `<View>` ·
[scroll.css:23](packages/prototype/primitives/scroll.css:23)); **(c)** leave `doc/archive` + `legacy`
frozen. It is a small, low-risk fold precisely because the geometry already lives on `View`.

### 1.C — LEFTOVER (prune)

`packages/prototype/legacy/**` — the pre-axes hand recipes, a **quarantine, not a build input**:
not gated, not doc-genned, not a dependency, not live
([legacy/README.md:17-22](packages/prototype/legacy/README.md:17)). The coherence line: *active =
`{primitives + descriptor recipes}`; everything else = frozen, rebuilt as a descriptor on demand.*

| Legacy component | Rebuilt? | Verdict |
|---|---|---|
| `icon-button` | ✅ **#92** — `iconButtonDescriptor` ([contract.ts](packages/rn/contract.ts)) | **PRUNE candidate** — oracle spent |
| `tab-bar` | ✅ **#96** — `tabBarDescriptor` / `tabDescriptor` ([contract.ts](packages/rn/contract.ts)) | **PRUNE candidate** — oracle spent |
| `list` · `list-item` · `list-interactive-item` | ❌ | **KEEP** until rebuilt as descriptor |
| `nav-item` | ❌ | **KEEP** until rebuilt |
| `switch` | ❌ | **KEEP** until rebuilt |
| `tabs` (segmented control · defines `nuri-tab`) | ❌ | **KEEP** until rebuilt |
| `typography-stack` | ❌ | **KEEP** until rebuilt |

Also frozen alongside: `legacy/pages/*.html` (7 hand doc pages) and `legacy/playground/*.html`
(`my-vault.html` = the wallet-home rebuild spec; `composition-prototype.html`). These travel with
their components — prune the spent pairs (`icon-button`, `tab-bar`) only once their doc pages are
confirmed superseded by the playground; keep the rest as the rebuild oracle.

**Other dead/unreferenced sweep:** none found in the active tree. `doc/archive/**` and
`doc/assets/nuri/**` are an intentional archived snapshot of the doc surface (they carry their own
copy of `box.js` etc.); they are not the active projection and are out of scope for this prune.

---

## 2. The web↔RN parity gap (closed for the hand-authorable primitive layer)

The audit-era gap was: web had hand-authorable primitives, while RN exposed only
catalog components plus raw `react-native` hosts. That is no longer true. `@nuri/rn`
now exports the open primitive layer (`View`, `Stack`, `Text`, `Pressable`, `Screen`,
`Scroll`, `Separator`) alongside `NuriIcon` and the generated catalog components
([index.ts](packages/rn/index.ts); [primitives/index.ts](packages/rn/primitives/index.ts)).

| Primitive | Web | RN today |
|---|---|---|
| **View** | `<nuri-view>` | `View` — flat box ⊕ stack ⊕ palette props |
| **Stack** | `<nuri-stack>` | `Stack` — stack namespace props |
| **Text** | `<nuri-typography>` | `Text` — typography + palette colour |
| **Pressable** | `<nuri-pressable>` | `Pressable` — View + interactive opt-ins |
| **Screen** | `<nuri-screen>` | `Screen` — structural full-screen wrapper |
| **Scroll** | `<nuri-scroll>` | `Scroll` — structural scroll wrapper |
| **Separator** | `<nuri-separator>` | `Separator` — horizontal `border.1` hairline with scoped `border.subtle` |
| **ListSeparator** | `<nuri-list-separator>` | `ListSeparator` — fixed-md list inset over `Separator ySpace="sm"` |
| **Icon** | `<nuri-icon>` | `NuriIcon` |

The RN wrappers reuse the existing runtime appliers: `resolveNS` / `flattenInteractive`
drive the **same** `BOX_FIELDS` / `STACK_FIELDS` resolve-map the web CSS is generated
from ([resolve-map.ts](packages/spec/axes/resolve-map.ts)). **The wrappers call into
those appliers — never a second hand-written prop→style mapping** (the drift rule).

The Expo demo no longer demonstrates the old gap: the audit-era raw-RN
`src/screens/Demo.tsx` was superseded by the wallet/coin/cash screens, which compose
through the `src/components/ui` DS manifest and keep raw `react-native` usage in the
app harness only.

---

## 3. The contract mechanism (modelled on the existing descriptor contract)

Do **not** invent a new machine. The existing descriptor contract already is: **one schema SoT → two
projections → gates that assert agreement.** Extend it to the primitive APIs.

### 3.1 One schema SoT
The namespace types in [`schema.ts`](packages/spec/components/schema.ts) — `StackNS`, `BoxNS`,
`TypographyNS`, `PaletteNS`, `InteractiveNS`, and `El` / `Part` — pinned by **`FROZEN_SCHEMA`**
(Guard F · [docs-drift.test.js:438-517](scripts/docs-drift.test.js:438)). The resolve-map Field
tables (`STACK_FIELDS` / `BOX_FIELDS`) are the **machine-readable key list** per namespace
([resolve-map.ts:101,121](packages/spec/axes/resolve-map.ts:101)) — `Record<keyof StackNS, Field>`
is *total over the namespace by construction* (a new field is a compile error), so the schema keys
and the Field-table keys can never silently diverge.

### 3.2 Two projections
- **Web** = a custom element whose observed `ATTRS` are the namespace prop surface, **hand-listed
  today**: `box.js`'s `ATTRS` ([box.js:38-52](packages/prototype/primitives/box.js:38)),
  `stack.js`'s ([stack.js:34](packages/prototype/primitives/stack.js:34)), `pressable.js`'s
  ([pressable.js:53](packages/prototype/primitives/pressable.js:53)), `typography.js`'s
  ([typography.js:33](packages/prototype/primitives/typography.js:33)). **The contract should
  DERIVE/check these against the schema NS keys** instead of trusting the hand list.
- **RN** = a component whose props are the namespace prop surface, applied through `resolve.ts`.

### 3.3 The gates (three, mirroring the descriptor gates)

**(a) The per-primitive parity test** — assert, for each contracted primitive:
```
web element ATTRS  ==  RN component props  ==  schema namespace keys
```
Source the schema keys from `keyof StackNS` / `keyof BoxNS` (or the Field-table keys); fail if a web
`ATTRS` entry or an RN prop is missing or extra. This converts the hand-listed web `ATTRS` from a
*trusted* list into a *checked* one — the analogue of the descriptor's anatomy-vs-addressed-parts
agreement check ([docs-drift.test.js:293-312](scripts/docs-drift.test.js:293)).

**(b) The per-primitive RN render-smoke** — extend the existing
[render-smoke.test.tsx](packages/rn/__tests__/render-smoke.test.tsx) (today it mounts the
seven catalog descriptors headless via `react-test-renderer` and snapshots) with one mount per
primitive wrapper (`<View>`, `<Stack>`, `<Text>`, `<Pressable>`, `<Screen>`, `<Scroll>`): no-throw +
a committed snapshot. This is the standing consumability guard, primitive-side — the same construct
as the catalog render-smoke that backs the `rn` CI gate (README §"CI — 5 gates").

**(c) The `FROZEN_SCHEMA`-style versioned pin for the primitive APIs** — the primitive prop surfaces
are a frozen contract like the descriptor envelope. Extend the Guard-F pin (or add a sibling pin)
covering the per-primitive prop sets, so adding/removing/renaming a primitive prop is a **deliberate,
versioned** change (update the pin + log a 65-amendment), never an accident. The `El` / `Part` /
`NS` pins ([docs-drift.test.js:506-507,596](scripts/docs-drift.test.js:506)) already do this for the
schema vocab; the primitive-prop pin is the same mechanism one level out.

**No new machinery, no semver.** As the contract-bump note records, a frozen-schema change is cheap
in a monorepo: edit the type, move the Guard-F pin, regen, and the five gates *are* the
version-negotiation — there is no external consumer to negotiate with.

---

## 4. Recommended sequencing (current tail)

The original first step — build the RN primitive layer + parity/render gates — is
done. The remaining primitive-contract tail starts after that closed layer.

**① Fold Box → View + prune the spent legacy** — *small.*
Retire the `<nuri-box>` standalone element (box.js + its host rules) per the §1.B work-list; prune
the rebuilt `legacy/icon-button` + `legacy/tab-bar` pairs (#92 / #96).
> **Risk:** **keep the box *namespace*** (`.nuri-box[...]` rules / box.css / `BOX_FIELDS` / the
> `factory.js` + `icon.js` class application) — only the *element* drops. Confirm no live screen
> depends on `<nuri-box>` markup (audit: only `doc/archive` + `legacy`). Leave archived surfaces
> frozen.

**② The card as `<View>` composition** — *small–medium.*
A real `card.ts` surface built from the new `View` primitive (box⊕stack⊕palette), so a card is a DS
component, not a page-local mockup `<div>`.
> **Risk:** a card *surface* must be a genuine `View` composition, not a standalone box — the moment
> a layout can't be expressed in DS props it is a real gap, not a CSS patch.

**③ Keep playground/demo screens pure DS** — *ongoing.*
The Expo demo's wallet/coin/cash screens now demonstrate the target shape: screen
composition through DS primitives and generated catalog components, with raw RN
reserved for app harness responsibilities (safe-area, theme toggle, root surface).
> **Risk:** a layout that cannot be expressed in DS props is a real DS gap, not a
> page-local CSS/style patch.

---

## Appendix — load-bearing citations (the ones the audit turns on)

- **The `el`-type set is 4, frozen:** `El = 'view' | 'text' | 'icon' | 'pressable'`
  ([schema.ts](packages/spec/components/schema.ts)) · pinned `El: ['view','text','icon','pressable']`
  ([docs-drift.test.js](scripts/docs-drift.test.js)). Pressable is a first-class `El` host since
  amendment 65.13 (was the interactive-flagged view; §0.1).
- **RN hand-authorable primitives exist:** the public barrel exports
  `View`/`Stack`/`Text`/`Pressable`/`Screen`/`Scroll`/`Separator` from
  [primitives/index.ts](packages/rn/primitives/index.ts), and the Expo demo screens
  consume them through `src/components/ui`.
- **The Box-fold work-list:** the box *namespace* (`.nuri-box`) is applied by the factory
  ([factory.js:160](packages/prototype/factory/factory.js:160)) + the icon
  ([icon.js:72](packages/prototype/primitives/icon.js:72)) and already lives on `View`
  ([view.js:32](packages/prototype/primitives/view.js:32)); the standalone `<nuri-box>` *element*
  ([box.js](packages/prototype/primitives/box.js)) has live markup consumers only in `doc/archive`
  + `legacy`.
- **Web `ATTRS` are hand-listed (to be derived/checked):** [box.js:38](packages/prototype/primitives/box.js:38) ·
  [stack.js:34](packages/prototype/primitives/stack.js:34) ·
  [pressable.js:53](packages/prototype/primitives/pressable.js:53).
- **The contract is already a single-SoT, gated machine:** resolve-map Field tables
  ([resolve-map.ts:101,121](packages/spec/axes/resolve-map.ts:101)) · Guard-F `FROZEN_SCHEMA`
  ([docs-drift.test.js:438](scripts/docs-drift.test.js:438)) · the RN render-smoke
  ([render-smoke.test.tsx](packages/rn/__tests__/render-smoke.test.tsx)).
