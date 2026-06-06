# Variants-model spike · FINDINGS (preserved design base · R-EXPO-6)

> **Provenance.** This is the preserved report of the **variants-model spike**
> (`spike/variants-model` · throwaway · **not merged**), copied here at **N+19 / B1**
> as the durable design base for [decision 65.2](../decisionlog.md) (the frozen descriptor
> schema). The spike's throwaway `.ts` did **not** land; the validated shapes are now
> **emitted** at [`build/descriptors/schema.ts`](../build/descriptors/schema.ts) +
> [`composition-button`](../build/descriptors/composition-button.ts) /
> [`icon-avatar`](../build/descriptors/icon-avatar.ts) /
> [`topbar`](../build/descriptors/topbar.ts), with the CSS→descriptor emitter at
> [`pipeline/parsers/descriptors.js`](../pipeline/parsers/descriptors.js) (the real
> realization of the spike's `derive-button.ts`). Links below were rewritten to resolve
> from `docs/`. The report text itself is otherwise verbatim.

---

# Spike · variants-model freeze-gates (M3 / M4) · FINDINGS

**Status**: SPIKE COMPLETE · typecheck-only · throwaway-grade encodings · **no freeze, no
factory, no emit** (anti-goals honoured). Feeds the **N+19 detailed plan** + decision 65's
freeze. Branch `spike/variants-model` (worktree) · **not merged** · value = the reviewable
encodings + this report.

Validates the shape in [`docs/resolver-model.md`](resolver-model.md) §9/§11 against the
three hard components + one CSS→descriptor derivation. Cites decisions 65 / 65.1 / 64.1 / 54 /
55 / 48 / 34 / 37 / 46 / 41 / 50 by # — does not re-litigate.

Artifacts — the throwaway spike `.ts` did NOT land; the links below point to the LANDED equivalents (`build/descriptors/` + the emitter `pipeline/parsers/descriptors.js`): [`schema.ts`](../build/descriptors/schema.ts) ·
[`button.descriptor.ts`](../build/descriptors/composition-button.ts) ·
[`icon-avatar.descriptor.ts`](../build/descriptors/icon-avatar.ts) ·
[`topbar.descriptor.ts`](../build/descriptors/topbar.ts) · [`derive-button.ts`](../pipeline/parsers/descriptors.js) ·
`tsconfig.json`.

**Gates** · `npx tsc -p docs/spikes/variants-model/tsconfig.json` → **exit 0** ·
`git diff --exit-code build/` → **empty** · baseline button-matrix tsc → **still exit 0**.

---

## 1 · Verdict (TL;DR)

**The `variants` / `compoundVariants` shape is freeze-ready in its CORE — but NOT as the
host-only shape §11 sketches. Exactly ONE shape change is REQUIRED before freeze: style patches
must be PART-ADDRESSABLE (a `$parts` overlay; `root` = the host default).**

All three components place a variant- or state-driven patch on a **non-host part**, so a
host-only patch cannot express them:

| case | host (root) patch | non-host patch that forced `$parts` |
|---|---|---|
| Button (M3a) | variant→bg · size→geometry · 5 compounds | label **type** (size→typeStep) + label **colour** (variant→fg) |
| IconAvatar (M3b) | variant→bg | glyph **colour** (variant→fg) |
| Topbar (M3c) | *(none)* | `center`→ content **alignment** (100 % of the effect) |

`center` is the clincher: its **entire** effect is on the `content` pivot, with **no** host
effect to mask the gap. Freezing the host-only shape would make `center` inexpressible.

**Two smaller findings need an operator call (they do not block the core freeze):**
1. The label **type** is a *semantic type-step reference* (`smEm`/`mdEm` → `typeStyle`), **not a
   literal style** — the one non-literal in the patch vocabulary (decision 54/55).
2. **variant→fg**: descriptor data, or delivered by the §12 surface context? `button.css`
   carries it; the spike encodes it as data and treats §12 as *delivery*.

**Freeze-ready: YES, conditionally** — freeze the CVA core **with** part-addressing in the
frozen shape. See §6 for the surviving schema and §7 for the decisions this forces.

---

## 2 · M3a · Button — FIT (host) + STRAIN (parts) · [`button.descriptor.ts`](../build/descriptors/composition-button.ts)

**Fits the §11 host-only shape CLEANLY:**
- `variants.variant.{solid,soft,ghost}` → `root.backgroundColor` (rest).
- `variants.size.{sm,md,lg}` → `root.{minHeight, paddingHorizontal, borderRadius}`, **asymmetric**
  (decision 41): `lg = radius.md`, `md/sm = radius.sm`.
- `compoundVariants` (all 5): 3× `{variant, pressed} → pressedBg` (pressed-colour is
  variant-dependent · §5 surface vocab), `{pressed} → transform:[{scale}]` (pressScale opt-in),
  `{disabled} → opacity` (disabledOpacity opt-in). pressed/disabled are **compound conditions,
  not axes** — faithful to §11/§5 (independent opt-ins).

**Strains the host-only shape (two things land on the `label` part):**
- **label colour** — `variant → fg` (solid→onSolid; soft/ghost→textPrimary; rest-only, since
  `:active` does not change colour in `button.css`). §11 routes fg through the **§12 surface
  context** (runtime), i.e. *out* of the descriptor. It is a real variant→colour mapping that the
  CSS carries (`--nuri-button-<v>-fg`); the spike encodes it as `$parts.label.color` and treats
  §12 as *delivery*, not as a reason to drop it from the contract.
- **label type** — `size → typeStep` (decision 55: sm→`smEm`, md/lg→`mdEm`). This is **not a
  literal `TextStyle`** but a *semantic type-step reference* the engine expands via `typeStyle`
  (relative→absolute · decision 54 · future OS fontScale). §11 keeps it as a sibling comment-map
  *outside* variants. The spike encodes it as `$parts.label.typeStep` — surfacing that the patch
  vocabulary needs **one non-literal** (a named type-step), distinct from raw style props.

**F-DEMO-5 / the live drift (decision 65):** this descriptor's `variant` axis is
**`{solid, soft, ghost}`**. The RN mirror
[`button.tsx`](migration-tests/button-matrix/button.tsx) unions **only `{solid, soft}`**,
while the emitted [`build/components/button.ts`](../build/components/button.ts) **already
carries** `ghostBg/ghostBgPressed/ghostFg` and `icon-button.tsx` consumes ghost — unlinked, no
compile error either way. **Freezing this descriptor forces the RN union to add `ghost`** (the
drift the hand-typed union let slip).

---

## 3 · M3b · IconAvatar `subtle` — the CLEANEST case · [`icon-avatar.descriptor.ts`](../build/descriptors/icon-avatar.ts)

**"No interaction" is expressed CLEANLY — by ABSENCE, not forced empties.** `compoundVariants`
is **optional** in the schema, so a static component simply **omits it**. There is no `[]`, no
dummy rows. A static component is exactly *the variants subset, minus every compound* — which is
precisely the §2 independent-subset claim and the §5 interaction-decomposition, demonstrated:

- The **surface** subset is chosen freely (incl. the avatar-only `subtle` · decision 50).
- The **interaction** subset is chosen to be **empty**, *independently*.

Stronger still: `subtle` is typed `StaticSurface` (**no `pressedBg`**), so a `subtle`-pressed
compound is **not even expressible** — the type *enforces* "a static role reads only rest" (§5).
This is the rest-only-by-construction property the freeze wants.

**The only strain is the SHARED one** (M3a/M3c): the glyph **colour** (`variant → fg`) lands on
the `icon` part → `$parts`. No interaction-specific awkwardness. M3b is the case that **validates**
§2/§5 against the shape.

---

## 4 · M3c · Topbar `center` — the hard case · [`topbar.descriptor.ts`](../build/descriptors/topbar.ts)

**First, what `center` actually is (post amendment-46.4).** The task's "layout re-partition"
framing describes the **OLD** Topbar — the equal-flex side *wrappers* that reparented children to
balance asymmetric sides. **Those are deleted** (amendment 46.4). In the current content-pivot
model ([`topbar.tsx`](migration-tests/button-matrix/topbar.tsx) ·
[`topbar.css`](../lib/components/topbar/topbar.css)) the pivot exists **unconditionally**
(`flex:1; minWidth:0` — that is **structure**, invariant to `center`). `center` does exactly one
thing: toggles `alignItems:'center'` (RN; + `justify-content`/`text-align` on web) **on the
already-existing pivot**.

**Q1 — does the effect land on a named part (content/pivot), not the host?** → **YES, 100 %.**
The host (root) gets **nothing** from `center`. So the variants shape **needs part-scoped
targeting**: `variants.center.true → { $parts: { content: { alignItems, justifyContent } } }`.
§11's host-only variants **cannot express `center` at all**. Because there is **no host effect to
mask it**, `center` is the clean proof that part-addressing is **unavoidable** — not a Button-only
nicety.

**Q2 — or is `center` structure config (the descriptor's structure half)?** → **NO.** Structure =
which parts exist + their **invariant** config (the pivot, its `flex:1`/`minWidth:0`). `center` is
a **prop-conditional** style on that existing part = **mapping** (a variant), part-scoped. It only
*feels* structural because it is a *layout* property on a *layout* part. **Resolution: the
structure half NAMES the parts; the variants half PATCHES them by name; both share one part
vocabulary.** `center` is a part-scoped variant whose target is a structure-declared part.

**Recommendation for layout-repartition props.** The frozen shape **must support part-scoped style
patches** (a patch addressed to a structure-named part; `root` = host default). With that one
axis, `center` is a normal boolean variant. **No deeper "re-partition operator" is needed** for
the current Topbar — the content-pivot already converted the old reparenting into a permanent
structural part, leaving `center` a plain part-scoped alignment toggle.
**Flag (out of scope, future boundary):** a future recipe wanting *true optical centring for
asymmetric sides* (the ~7px gap shipped as-is at N+18) would need **measured side-balancing =
engine/behaviour**, never data — that is the real "re-partition," and it belongs in the factory,
not the descriptor.

**Minor strain:** a boolean variant forces **both** `true`/`false` keys, so the no-op default
needs an explicit `false: {}` entry (cosmetic · see §7.5).

---

## 5 · M4 · derive-from-CSS == authored — the 65.1 bootstrap verdict · [`derive-button.ts`](../pipeline/parsers/descriptors.js)

A focused parser mechanically reconstructs Button's descriptor from
[`lib/components/button/button.css`](../lib/components/button/button.css) (`@layer tokens`
aliases + `@layer rules` structure) and deep-compares it to the authored M3a descriptor, applying
both to a **collision-free sentinel theme** (each leaf = its own dotted path) so the comparison is
at the **theme-path level**. Run in two layers:

**Layer A — MAPPING VALUES (root-projected): CLEAN EQUAL ✓.** Every token value derives
faithfully from `button.css`:
- `variant.{solid,soft,ghost}`: `backgroundColor` (rest) + `color` (fg) + `pressedBg` (compound).
- `size.{sm,md,lg}`: `minHeight` + `paddingHorizontal` + `borderRadius` — **including both
  asymmetries**: geometry `lg=radius.md` vs `md/sm=radius.sm` (decision 41) **and** type
  `sm=smEm` vs `md/lg=mdEm` (decision 55), read straight from the per-size font blocks.
- compounds: `{pressed}→scale` and `{disabled}→opacity`.

A **negative control** (perturbing the authored `lg` radius to `radius.sm`) was confirmed to flip
Layer A to **MISMATCH** with a visible diff — the harness genuinely detects a single-token error,
so the CLEAN-EQUAL is meaningful, not trivial.

**Layer B — PART TARGETING: 6 gaps, un-derivable from CSS.**
```
✗ variants.variant.{solid,soft,ghost} → $parts.label.color   (×3)
✗ variants.size.{sm,md,lg}            → $parts.label.typeStep (×3)
```
`button.css` is **one node** (`.nuri-button`): `background`, `color`, geometry and `font` all sit
on the same selector, because on the web there is a single element. The deriver therefore **cannot
know** which declarations belong to the RN `label` part. **Those part targets come from the
decision-24.1 page anatomy (`data-part`/`data-element` wiring-spec) — a SECOND source**, exactly
as [`emit-model.md`](emit-model.md) §3 says (parts live in the page wiring-spec, not the
component CSS).

**Also outside the variants shape** (structure half · not compared): the host **base style**
(`.nuri-button { display:inline-flex; … }` → RN `{flexDirection:'row', …}`, the *no-`flex:1` leaf*
decision · R-EXPO-3) — a web→RN translation, not a token value.

**Bootstrap verdict (decision 65.1): CONFIRMED for the MAPPING half, with a precise caveat.**
Derive-from-CSS is a **faithful bootstrap of every variant→style VALUE** (the §9 mapping content)
— proven on a real component, asymmetries and all. It does **NOT** carry the **STRUCTURE half**
(part targeting + base layout); that needs the page wiring-spec. So the bootstrap proves the
shape's **mapping** content from CSS; the **structure/parts** content requires the second emitted
source. The eventual freeze's schema-guard must cover **both halves** — CSS alone underfills the
structure half by design.

---

## 6 · The surviving schema (the input to the real schema session)

The minimal descriptor type that all three cases satisfied and M4 derived against. Verbatim core
of [`schema.ts`](../build/descriptors/schema.ts) (full file has the cited comments). **The one change vs §11 is the
`$parts` overlay** (flagged inline).

```ts
// THEME · resolver-model §11 · surface-as-data · reuses the emitted scale types (decision 48)
type Surface = {
  solid: { bg: string; fg: string; pressedBg: string };
  soft:  { bg: string; fg: string; pressedBg: string };
  ghost: { bg: string; fg: string; pressedBg: string };
  subtle:{ bg: string; fg: string };                 // STATIC-only · no pressedBg (§5 · decision 50)
};
type Theme = {
  surface: Surface;
  type: Record<TypeKey, TypeStep>;                   // decision 54 · engine applies typeStyle
  space: SpaceScale; size: SizeScale; radius: RadiusScale;
  interaction: { pressScale: number; disabledOpacity: number };
};

// PARTS · structure NAMES them; variants PATCH them by name. root = host default.
type Part = 'root' | 'label' | 'icon' | 'content';
type TypeRef = { typeStep: TypeKey };                // the ONE non-literal (decision 55 · M3a)
type PartStyle = ViewStyle | TextStyle | TypeRef;

// THE PATCH · §11-faithful host (root) ViewStyle + the REQUIRED `$parts` overlay (the spike's
// single shape change · forced by M3a label, M3b glyph, M3c center).
type StyleValue = ViewStyle & {
  $parts?: Partial<Record<Exclude<Part, 'root'>, PartStyle>>;
};

// DESCRIPTOR · CVA variants / compoundVariants · theme thunk (§9 · §11)
type Axes = Record<string, string>;
type Variants<A extends Axes> = { [Axis in keyof A]: { [Value in A[Axis]]: StyleValue } };
type Condition<A extends Axes> =
  Partial<{ [Axis in keyof A]: A[Axis] }> & { pressed?: boolean; disabled?: boolean };
type CompoundVariant<A extends Axes> = Condition<A> & { styles: StyleValue };

type Descriptor<A extends Axes> = (theme: Theme) => {
  variants: Variants<A>;
  compoundVariants?: CompoundVariant<A>[];           // OPTIONAL → "no interaction" = absent (M3b)
};
```

**What held across all three (de-risks the freeze):** the CVA core (axis→value→patch +
condition→patch), the **theme-thunk + surface-as-data** form, pressed/disabled **as conditions**
(not axes), and **`compoundVariants` optional** (the clean static-component story). None of these
strained.

---

## 7 · Recommendation to the coordinator

**Freeze-ready: YES — freeze the CVA core, WITH part-addressing baked into the frozen shape.**
The core (variants/compoundVariants/theme-thunk/optional-compounds) is proven on the three hard
components and the CSS bootstrap. Do **not** freeze the §11 host-only patch — it cannot express
`center`.

**Required shape change (1):**
1. **Part-addressable patches** — a `$parts` overlay (`root` = host default). **Not optional:**
   `center` is inexpressible without it, and Button/IconAvatar both need it for label/glyph. This
   is the spike's single mandated change to §11.

**Operator decisions the findings force (do not block the core, but the freeze should pin them):**
2. **Label TYPE = semantic type-step reference (`typeStep`) vs literal `TextStyle`.** Recommend
   **keep the semantic ref** — it preserves `typeStyle`'s relative→absolute conversion and the
   future OS-fontScale multiply (decision 54); a frozen absolute `TextStyle` would lose both. This
   makes the patch vocabulary **"style props + one named type-step"** — pin it explicitly.
3. **variant→fg: descriptor data vs §12 surface-context delivery.** `button.css` carries it
   (`--nuri-button-<v>-fg`); the spike encodes it as `$parts.{label,icon}.color`. Recommend
   **descriptor OWNS the mapping** (structure+mapping = data · decision 65); §12 is one *delivery*
   mechanism (context vs inline prop), a factory/behaviour detail — not a reason to drop the
   mapping from the contract.
4. **Two emitted sources, confirmed by M4.** The descriptor's **mapping** half derives from CSS
   (bootstrap ✓); its **structure/parts** half must come from the **decision-24.1 page anatomy**.
   The freeze's schema-guard must cover **both halves**. Sequence the structure-emit (the parts
   vocabulary) alongside the mapping-emit — a CSS-only bootstrap underfills the contract.
5. **Cosmetic (operator may ignore):** boolean variants force a no-op `false: {}` entry. If
   undesired, allow omitting an axis's default value in the frozen shape (a small affordance).

**No new locked decisions were taken here.** The part-addressing requirement, the `typeStep`
question, and the fg-delivery question are **reported findings** for the coordinator → operator —
not redesigns. The shape *core* fits; the three strains converge on one extension (`$parts`) plus
two vocabulary clarifications.

---

## 8 · Anti-goals · honoured

No freeze (no schema-guard test) · no RN factory/engine · nothing written under `build/`
(byte-identical ✓) · no `lib/` / `styles/` / `pipeline/` edits (only `button.css` **read**) · no
react-native runtime (type-only imports · the migration-mirror posture · decision 48) · exactly
the three cases + one derive-proof (no 4th component, no semantic-remap vocab, no engine · P11) ·
stayed on the confirmed leans (prefix naming, variant pass-through, surface-as-data). Open choices
(the schema's final form, the §8 source-inversion, prefix-vs-suffix) left to the detailed plan.
