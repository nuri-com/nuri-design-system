# Composition model · compound primitive vs recipe + naming convention

**Status**: **Canonical record is now [decision 64](../decisionlog.md) (operator sign-off
2026-06-04)** — read decision 64 first; this file is kept as the design narrative. **The final
model refines this doc on two points:** (1) primitives are **OPEN** (flexible / polymorphic —
invariants live in the *recipe*, not the primitive; so where this doc says a primitive
"encapsulates", read decision 64's open-primitive layer); (2) the content-pivot's real
justification is **RN-parity** (an explicit layout pivot translates 1:1 to RN; the web-only
`:not()` / `margin-auto` do not), not web tidiness. Decision 64 also adds the text-style
single-owner rule (Typography), the `as` = flexibility-not-identity line, the `layer` naming
taxonomy, and the agent-skill mapping. Sister to `decisionlog.md` / `docs/RISKS.md` /
`roadmap/index.md`.

**Further evolved — amendment 65.3 (N+19):** the model matured from *compound primitive vs recipe*
(§1–5) into **recipe = a pure composition of curated namespaces** (`stack` · `box` · `typography` ·
`palette` + the `interactive` flag · **§6–9 below**) — the schema *form* for R-EXPO-6, **superseding
amendment 65.2's raw-style patches** and `resolver-model.md` §11's sketch.

**Status: VALIDATED** by the B1.5 playground prototype (N+19 ·
[`roadmap/N+19-B1.5.md`](../roadmap/N+19-B1.5.md)) — the three recipes compose to pixel-parity with the
live components from the namespaces alone, with zero raw style (audited), proven in-browser (visual +
computed-style). The model held; two boundary points were resolved with the operator at the checkpoint:
(1) **box owns no colour** — `palette` owns *all* colour incl. the chrome slot, so decision 42's
`box.background` is superseded *for composition* (a Box-API deprecation is a separate follow-on · live
consumer Tabs · B2/P11); (2) **inline-vs-block dissolves** — RN is flex-only (no inline/block), so a
recipe root is a plain `flex` node blockified by its flex parent (no stack `inline` knob · measured: live
`inline-flex` ≡ composed `flex` at equal widths). B1.5 pins the exact B2 extension list + the
CSS→composition mapping (see the report).

Origin: the first real Expo render surfaced a Topbar `<Text>`/region cluster
(R-EXPO-2). Digging in showed the bug was not the `<Text>` wrap per se — it was that
the RN Topbar **reconstructs** its children. That generalised into a principle, then
into a naming clean-up.

---

## 1 · The principle

> **Primitives compose. Recipes configure.**
>
> - A **compound primitive** (ListItem, Topbar, TabBar) is composed from **real,
>   self-styling parts** placed in **document order**; the parent **arranges** them
>   (a flex container) and the **CSS / flex** does the layout. A controller may inject
>   **only shared state** into the parts (e.g. TabBar → `active`/`onSelect` via
>   `cloneElement`). The parts own their own structure + style.
> - A **recipe** (NavItem) is configured with **scalar props**; it composes the
>   primitives **internally**. No child-surgery.
> - **Colour resolves per-component** (RN has no inherited `color` · F-BOX-FG-1);
>   **`accent` comes from scope/context**, it is *not* threaded to each child.

**The anti-pattern (banned):**
1. **Reparenting** — JS that `querySelector`s authored children and rebuilds the DOM
   into new containers.
2. **Type-inspection routing** — `child.type === X` to sort children into regions.
3. **Type-constraining wrappers** — wrapping arbitrary children in a container that
   limits what they can be (e.g. a blanket `<Text>` that breaks non-text nodes).
4. **Unconditional region synthesis** — always building a region box whether or not
   the author supplied content (→ phantom gaps).

The bug-causing pattern is the parent **owning** its children's structure. The fix is
the children **owning themselves**, the parent only arranging.

### Heterogeneous regions → the content-pivot

When a compound's regions differ (leading ≠ content ≠ trailing) the layout needs a
pivot. **Wrap only the content** (the `flex:1` middle) as a named part; leading and
trailing are **positional** around it (before / after). This is cleaner than wrapping
the sides (see proof in §2) and it is identical on both platforms.

When the children are **homogeneous** (TabBar — all items equal) no pivot is needed:
direct children, controller injects state.

---

## 2 · Proofs (from the live code — this is grounded, not invented)

- **ListItem = the MODEL.** `lib/components/list-item/list-item.js:12` states it in
  the source: *"NO reparenting (unlike Topbar · decision 46): the wrappers and the
  unwrapped middle stay in document order; CSS flexes them."* Named markers, document
  order, zero JS manipulation. `list-item.css:122` selects the content as
  `:not(leading):not(trailing) { flex:1 }`.
  - **Why content-wrap beats side-wrap**: `list-item.css:106-115` documents the edge
    case — a **bare-text** content node is an anonymous flex item with **no flex:1**,
    so it can't push trailing; they bolt on `margin-inline-start:auto`. Wrapping the
    **content** (so the wrapper carries `flex:1` regardless of text-vs-element)
    dissolves this edge case. → content-pivot, not side-wrappers. **(Correction ·
    decision 64: the *deeper* reason is RN-parity — the unwrapped-middle `:not()`
    selector is web-CSS-only; an explicit content pivot translates 1:1 to RN and
    eliminates the R-EXPO-2c class — not just the web `margin-auto` nicety.)**
- **TabBar = composition + state injection (correct).** `tab-bar.tsx:127-132`:
  `React.Children.map` + `cloneElement` injects only `active`/`onSelect` into real
  `TabBarItem`s that own their Pressable/Icon/colours/a11y. Touching children to inject
  **state** is fine; re-styling them is not. **(Correction · decision 64: the WEB
  `tab-bar.js` DOES wholesale-wrap its items into a created `<nav>` landmark — benign,
  order-preserving, no type-routing — so the bright line is *type-routed region
  reconstruction* (old Topbar), not "reparenting yes/no".)**
- **Topbar = the VIOLATOR (self-acknowledged).** `topbar.js:41-61`: the
  `connectedCallback` does `querySelector` + `createElement` + `appendChild` —
  reparents authored children into rebuilt `__start`/`__center`/`__end` divs. This is
  the reconstruction the ListItem comment contrasts against.
- **IconAvatar variant gates accent.** `icon-avatar.css:21-27`: *"Solid carries accent
  identity; soft + ghost + subtle are chrome-only … the `accent` prop has no visual
  effect on them."* And `icon-avatar.js`: `accent` is **inherited from the cascade** by
  default; the prop is a Tier-2 **self-scope** (mirrored to `data-accent`). RN mirror
  matches: `accentProp ?? ambientAccent`. → don't thread accent; scope it.

---

## 3 · The four changes (the redesign this doctrine prescribes)

| Component | Change | Touches |
|---|---|---|
| **Topbar** | Drop JS reparenting + the `start`/`end` marker reconstruction → **content-pivot** (`TopbarContent`, font-bearing for the title) + **positional** actions; occupancy via CSS (`:not(:empty)`), not a JS data-attribute; no `display:none` collapse hack. | amends **46** |
| **ListItem** | Drop the `leading`/`trailing` wrappers → **content-pivot** (`ListItemContent`) + positional leading/trailing. (Already no reparenting — just collapse the wrappers; this also kills the bare-text `margin:auto` patch.) | amends **51/52** |
| **Button** | Open to **`children`** (a real slot) — today's `children: string` is too closed (the spec's own My-vault puts an icon in a Button). Expose the resolved **label colour** to a child icon explicitly (RN `<Text>` colour doesn't inherit into a child `<Icon>` · F-BOX-FG-1). | **R-EXPO-1** |
| **NavItem** | Pure **props recipe** — `text` / `icon` / `variant` / `accent` / `onPress` — composes the primitives internally (`InteractiveListItem ∘ IconAvatar ∘ ListItemContent ∘ caret`); **drop** the current children-distribution (`nav-item.js:79-88`). `variant`/`accent` forward to the leading **IconAvatar** (the only accent-bearing piece; label = chrome text, caret = chrome border-strong). | amends **52** |

NavItem internal shape (the recipe's private composition):

```
<NavItem text icon variant accent onPress/>
  → <InteractiveListItem onPress>            (accent from scope, not threaded)
       <IconAvatar icon variant/>            ← leading (positional) · IS-A icon → `icon`? NO — see §4
       <ListItemContent>{text}</ListItemContent>   ← the content-pivot (md emphasis · dec 53)
       <Icon name="caret-right" color={borderStrong}/>  ← trailing caret (explicit colour)
     </InteractiveListItem>
```

---

## 4 · Naming convention (LOCKED · 2026-06-03)

### A · text content

| prop | meaning | who |
|---|---|---|
| **`text`** | the visible text, as a **scalar** | recipes (NavItem) |
| **`children`** | the **composed** content | primitives (TopbarContent, ListItemContent, Button slot) |
| **`label`** | **RESERVED** — the **a11y accessible name** | icon-only controls (IconButton, TabBarItem) |

This unifies the old `title` (Topbar) / `label` (NavItem) split **and** resolves the
current overload where `label` meant both visible text (NavItem) *and* the a11y name
(TabBarItem `label?` → `accessibilityLabel`).

### B · glyph

The test is **IS-A vs HAS-A** (content cardinality):

| prop | rule | who |
|---|---|---|
| **`name`** | the glyph is the component's **sole content** — it **IS** an icon (specialised) | Icon, IconAvatar, IconButton, TabBarItem |
| **`icon`** | the glyph is **one part** among others — the component **HAS** an icon | NavItem, Button |

Matches the existing convention (the icon-only family already uses `name`) → **zero
renames**; `icon` is added only on the multi-part composites. `<IconButton name=>`
also dodges the `<IconButton icon=>` redundancy. (So in §3's NavItem sketch the leading
IconAvatar keeps **`name`**; NavItem's own `icon` prop forwards `icon → name`.)

---

## 5 · Scope & sequencing

- **Web-first** (the spec is the deliverable) → **RN mirrors** follow faithfully. The
  RN side stops using "same prop names, different mechanism" (the licence that let
  ListItem→props and Topbar→reconstruction diverge); it translates the **named-part /
  content-pivot anatomy** directly.
- **Reopens** decisions **46** (Topbar reparenting → content-pivot) and **51/52** (List
  family wrappers → content-pivot; NavItem recipe shape). The naming is a **family
  sweep**.
- Multi-session: this doc is the **foundation** the implementation session(s) derive
  from. Suggested order: ① land this as decision 64 → ② web pass (the four + naming) →
  ③ RN-mirror pass → ④ re-validate against the Expo consumer render.
- Supersedes the in-conversation detours (the "flat model", "conform Topbar to
  ListItem's wrappers") — the landing is **content-pivot everywhere heterogeneous,
  direct children where homogeneous, recipes by props**.

---

## 6 · The namespace-composition model (amendment 65.3 · N+19)

The model above matured: **a recipe is 100% a composition of curated primitive namespaces — zero raw
style** (prototypable in the playground · the litmus). Origin: B1 emitted descriptors as *raw RN
style* (`flexDirection` / `paddingHorizontal`), which duplicates the primitives' vocabulary — the
§1–2 anti-pattern, one layer up. The fix: the descriptor speaks the **primitive vocabularies**.

**Five disjoint namespaces** (own-by-domain · no two output the same property):
- **`stack`** — flexbox: `direction · gap · align · justify · wrap · fill('grow' | 'grow-shrink')`.
- **`box`** — the element's own visual box: sizing (`width · height · minHeight · maxWidth*`) ·
  `padding*` · `radii` · `border`* width/style · `transform(scale) · opacity`.
- **`typography`** — font (`size` / step · decision 54/55) · **no color**.
- **`palette`** — **all** color, from semantic inputs `{ variant: solid|soft|ghost|outline|subtle,
  accent?, muted?, interactive? }` → bg · fg · fgMuted · border · pressed. `muted` = the muted
  *foreground* (`chrome.textMuted`; `onSolid.muted`*). Color flows by **scope** (resolver-model §12 ·
  F-BOX-FG-1) — text/icon inherit the role's fg, so a `variant` patch touches **root only**. **chrome**
  (`canvas | subtle | strong` · theme-only) is a **separate slot** (the `subtle` *role* name is taken).
- **`interactive`** — a cross-cutting **flag**, not a style: pressed-**color** → `palette`,
  press-**scale** + disabled-**opacity** → `box` (the recipe decides *when* · value from the
  interaction baseline), **`Pressable`** → factory. `pressScale` never touches `palette`.

The three overlaps, resolved: `backgroundColor` → palette (not box) · `flexGrow/shrink` → stack (not
box) · text/border **color** → palette (border *geometry* → box).

(`*` `maxWidth` / `border` / `outline` / `onSolid.muted` = **mapped, not built** — no current
consumer · decision 30.)

## 7 · Two layers + the data model
- **Composition primitive** (`composition-button` … · 64.1 prefix) — fixes the **anatomy** (parts /
  slots + load-bearing structural styling like the Topbar pivot's `flex:1`); the rest is **overridable
  defaults**. Maximally open — "centered" is *not* identity.
- **Recipe** (`button` …) — **locks the design** (per-variant/size compositions). Closed.

```ts
type PartAnatomy = { el: 'view' | 'text' | 'icon'; open?: boolean; parts?: Record<string, PartAnatomy> };
type NS = { stack?; box?; typography?; palette?; interactive? };
type Descriptor<Axes> = {
  structure: { anatomy: PartAnatomy; base?: NS };                  // anatomy (invariant) + base (defaults / locked)
  variants?: { [A in keyof Axes]: Record<Axes[A], Record<string /*part*/, NS>> };  // the recipe's per-axis decisions
};
```
Same data serves both layers; only *openness* differs (the primitive exposes `base` for override; the
recipe locks it).

## 8 · The three, worked (zero raw style)
- **Button** — `structure`: `view · stack{row, center, center} · interactive`; part `label{text}`.
  `variants.variant` → `root.palette.variant`; `variants.size` → `root.box{minHeight, paddingX,
  radius}` + `label.typography.size` (sm→smEm, md/lg→mdEm · 55; lg→radius.md, md/sm→radius.sm · 41).
  Pressed-color + scale follow from `interactive` — **no compound**.
- **IconAvatar** — `structure`: `view · stack{center, center} · box{width:lg, height:lg,
  radius:full}` (the fixed circle · invariant); part `icon{icon}`. `variants.variant` →
  `root.palette.variant` (incl. `subtle`). Static — no `interactive`, no compound.
- **Topbar** — `structure`: `view · stack{row, center, gap:sm} · box{height:lg, paddingStart:lg,
  paddingEnd:lg} · palette{chrome:'canvas'} · open`; part `content{ view · stack{fill:'grow-shrink'} }`
  (the pivot · `flex:1` is **anatomy**). `variants.center` → `content.stack{center, center}`.

## 9 · P11 · source · validation
- **Built** (live consumers): `stack` grow-shrink · `box` sizing (width/height/minHeight) + scale +
  opacity · `palette` variant/accent + the existing muted fg. **Mapped, not built** (decision 30):
  `box` maxWidth/border · `palette` outline · the `onSolid.muted` token — each lands with its first
  real consumer.
- **Source**: CSS stays the SoT; the composition is *derived* from the `@layer` blocks + the
  decision-24.1 page anatomy (the 65.1 bootstrap). **Authoring** compositions directly + *generating*
  web CSS from them (§9 source-inversion · revisits decision 2) stays **deferred** — path-2
  (Expo-compose → DS promotion) needs the language authorable + the factory to consume it (RN ·
  decision 65), not web generation.
- **Validated by B1.5** (playground prototype · the three composed purely from the web primitives),
  which pins the exact **primitive extensions** + the **CSS→composition mapping**, the
  anatomy-vs-default line, web **merge-vs-nest**, and the **chrome/`canvas`** slot. On validation: the
  locked schema → **B2** re-emits in this form + the factory composes + the mirrors derive → **B3**
  freezes (the schema-shape guard).
