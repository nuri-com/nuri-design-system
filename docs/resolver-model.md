# Component model — transversal baseline → primitives → recipes · refines decision 65

**Status**: DESIGN BASE · matured across the N+19 session **+ an adversarial audit** (task-logged) ·
refines [decision 65](../decisionlog.md) and amendments **64.1 / 65.1** · **firm vs open marked in
§10**. The precise variants-model *schema* and the §9 source-inversion go to the **detailed plan**,
not decided here. Captured the way `composition-model.md` / `emit-model.md` based decisions 64 / 65.
(Formerly "resolver model" — the concept matured past resolvers into the full component model; the
filename is kept for the 64.1/65.1 references.) Sister to `decisionlog.md` / `docs/RISKS.md` /
`roadmap/index.md`.

Origin: the Button-API pass (open it to `children` · route the label through Typography · R-EXPO-1)
surfaced that the heaviest, most-repeated machinery — colour-by-variant and type-by-size — is one
pattern, and belongs in a **shared transversal baseline**, not re-maintained in each component. An
adversarial audit then corrected the model's overclaims (§10).

## 1 · The transversal baseline — the theme / factory owns it

ONE baseline, owned by the theme / factory, **transversal** (ambient, like accent / colour-mode).
It is **four small, fixed, centralised vocabularies**:

- **Colour** — surface roles (`solid · soft · ghost` today · `subtle` for IconAvatar · `outline`/… added
  only when a real component needs one), each with a **rest and a pressed** value; + text · border ·
  accent · chrome.
- **Type** — `size · emphasis · weight · line-height · tracking` (the type steps · decision 54).
- **Geometry** — `space · size · radius` (the existing primitive scales).
- **Interaction** — `press-scale · disabled-opacity · duration` (the non-colour effects · already
  `--nuri-interaction-*`).

**The baseline does NOT grow per-consumer.** Like space/size/radius it stays small *on purpose* —
centralising is what keeps it small and consistency high. Components *reuse* the small set; adding a
role is a **rare, deliberate primitive-layer** decision, never per-component growth. (This **subsumes
decision 64's two single-owners** — Typography for type, the variant×accent funnel for colour — into
one concept. "accentSurface" was just the surface-colour *slice*, mis-named because accent is an
*input*, not the axis.)

## 2 · Components consume a subset — across all four, independently

A component declares the **subset** of each vocabulary it uses (or the full set) — the curated-subset
pattern (`SpaceLeaf ⊂ space`) generalised, picked **independently per vocabulary**:

- IconAvatar — surface `{solid soft ghost subtle}`, **rest-only**, no interaction effects.
- Button / IconButton — surface `{solid soft ghost}` + pressed, + interaction effects.
- InteractiveListItem — surface `ghost` + pressed, **but NOT** press-scale (proof the axes are independent).

## 3 · Three kinds of component — leaf · primitive · recipe

- **Leaf / atom** — a single thing, nothing beneath to compose (plain `Icon`, the text primitive).
  Consumes the baseline directly.
- **Primitive (OPEN)** — a *mechanical window* onto a baseline subset, and it **exposes its
  substrate's interface directly** (a layout primitive exposes Stack's `gap/align/justify`).
- **Recipe (CLOSED)** — configures a primitive with scalar props; **may remap a subset to a
  *semantic* vocabulary**.

**The one remap rule** (unifies "don't remap Stack props" + "recipes remap"):
- Remap is **good when it adds meaning** — a recipe's `variant="primary"` → `{surface: solid,
  accent: brand}` is a design decision.
- Remap is **bad when it's a mechanical relabel** — `inset` secretly forwarding to Stack `gap` adds
  nothing.
- → **Remap only to add semantics; expose mechanically otherwise.** Layout (gap/align) = mechanical →
  expose. Surface/type *intent* (primary/danger/title) = semantic → recipes remap. (The semantic
  vocabulary itself is **parked**.)

## 4 · The surface primitive — one themeable surface, many recipes

The colour funnel lives **once**, in a shared themeable **surface** primitive. It carries:
- **surface variant** — a subset of the colour baseline's surface roles.
- **shape** — `circle | square` (a genuine variant modifier → a legit custom prop).
- **interactive | static** + opt-in **interaction effects** (§5).
- **composed children** + layout via the substrate.

Recipes over it: **Button** (rect · interactive · scale · text) · **IconButton** (circle ·
interactive · scale · icon · a11y) · **IconAvatar** (circle · static · icon) · **Card** (future).
Plain **`Icon` stays a leaf**.

## 5 · Interaction decomposes — pressed-colour vs the opt-in effects

| | renders | pressed-colour | press-scale |
|---|---|---|---|
| IconAvatar | `View` (static) | — | — |
| InteractiveListItem | `Pressable` | ghost wash | **no** |
| Button / IconButton | `Pressable` | solid/soft/ghost | **yes** |

- **Pressed-colour is variant-dependent** (`solid→solidPressed`) → it lives **in the surface
  vocabulary** (each role has rest + pressed). Interactive components read the pressed value; static
  ones read only rest.
- **Press-scale + disabled-opacity are variant-independent** → the **interaction baseline**, parallel
  to colour/type — **independent opt-in effects**, not colour.
- So **static vs interactive** = `View` vs `Pressable`; the not-colour effects are **independent
  opt-ins**. In the variants-model they're compound entries (`{pressed}→scale`, `{disabled}→opacity`)
  a component *includes or omits*.

## 6 · Layout primitives — expose the substrate, stratify (Topbar)

A layout primitive exposes its substrate's interface; it does not remap (§3). Topbar stratifies:
- **`topbar-composition`** — open: *is* a Stack (row) with topbar identity, exposing Stack's full
  interface (`gap/align/justify/direction`).
- **`topbar-center`** — the content-pivot part (`flex:1` · `<View>`).
- **`topbar`** — the recipe: the common arrangement, closed, scalar.

## 7 · The descriptor / factory split (refines decision 65)

- **Baseline** (the four vocabularies) → theme / factory · transversal · **NOT in the descriptor**.
- **Descriptor** (thin · the frozen contract) → per-component: which **subset** of each vocabulary it
  consumes + **structure** (slots/parts) + (recipes) the **semantic remap** + which **substrate
  interface** it exposes. Expressed as the `variants` / `compoundVariants` shape (CVA-like · §9).
- **Engine** → native per platform (RN factory · web CSS), applies the baseline + the variants-model.
  **Behaviour** (pressed-source · focus · a11y) is factory code, never data.
- **Source-agnostic shape** (65.1): the frozen contract is the descriptor *shape*; derive-from-CSS is
  the bootstrap; the §9 source-flip swaps the *producer* behind the unchanged shape.

## 8 · Naming

- `composition-` convention (64.1): an open primitive whose common case is a recipe takes the prefix;
  the bare name is the recipe.
- **Settle prefix vs suffix** (`composition-button` vs `topbar-composition`) — pick one ordering.
- The shared surface primitive serves Button / IconButton / Card → name it **`surface`** (not
  button-specific).
- Family renames (`composition-list-item`, …) **deferred · P11**.

## 9 · OPEN — invert the source of truth? (revisits decision 2)

Make a `variants` / `compoundVariants` data structure (CVA / Stitches shape) the **source of truth**
and *generate* both web CSS and the component docs from it (today CSS is the source · decision 2). The
shape is the concrete form of the descriptor (§7); it is also what an authored source would carry.

```
variants:        { surface:{solid:{…},soft:{…},ghost:{…}}, shape:{circle:{…},square:{…}}, size:{…} }
compoundVariants: [ { pressed:true, styles:{ transform:'scale(0.97)' } }, … ]
```

- Known, proven cross-platform (Tamagui / Unistyles / react-strict-dom).
- **Web rendering** via inline-CSS-vars (thin class + values set per instance · avoids a class per
  combination).
- **Boundary** (decision 65): the *schema* is OURS (the frozen contract); the *engine* is the factory
  = Expo's (adopt vs build is their call); the web + docs *generation* is OURS — the genuinely new
  piece.
- **Status: OPEN · deferred** — revisits decision 2. Gated by the audit (§10 · M2/M5): does inline-CSS-var
  rendering preserve the decision-63 cascade fix; does an off-the-shelf compiler already do the
  "novel" generation. Sequence *after* the shape is proven & frozen.

## 10 · Audit outcome + firm / open

An adversarial audit stress-tested §1–9. Corrections (applied above):
- **Dropped "kills duplication" as the resolver justification (C1).** The RN funnel is *already
  shared* (`icon-avatar.tsx` reuses `icon-button.tsx`'s functions, which read `button.*`); the
  byte-identical emitted files are free, generated data. The shared surface owner is justified by
  **forward reuse** (Card/alert/toast/outline can't each re-define it) and the thin descriptor by
  **clean-freeze** — NOT by current dedup. It is *one source read per platform* (decision 48), not two
  hand-written resolvers.
- **Stripped Button's speculative scalars (m6).** No icon/`loading`/`align`/`trailingIcon` consumer
  exists (every `<Button>` in the mirrors is text-only). Ship `Button` = `children: string` + the
  recipe/primitive split; defer all scalars to a real screen (P11). R-EXPO-1 resolves as "use the
  surface primitive when an icon-button screen lands."
- **Softened over-claims**: `composition-button` doesn't reproduce inline-text-flow (m7); the
  Typography wrapper can't *dissolve* on RN — `<Text>` is mandatory (m8); don't generalise the
  `composition-` prefix until a 2nd case (m9).
- **Spike before any freeze (M3/M4)**: encode the hard components (Topbar `center` layout-repartition ·
  Button asymmetric size×radius · IconAvatar `subtle`) into the variants-model, and prove the
  CSS-derived shape equals an authored shape, *before* freezing.

**Firm** (operator-driven): the transversal baseline (4 fixed vocabularies) · subset-consumption ·
leaf/primitive/recipe · expose-don't-remap + the one remap rule · the surface primitive + `shape` ·
the interaction decomposition (independent opt-in) · the source-agnostic-shape foundation (65.1).

**Open → the detailed plan**: the precise variants-model schema (spike M3/M4 first) · the semantic
vocabulary (parked) · Typography-transversal mechanics (web-class + an RN `<Text>` helper) · the §9
source-inversion · prefix-vs-suffix naming.
