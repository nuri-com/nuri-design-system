# Target design — the component-API layer (the descriptor declares its public API · codegen makes it exact · the renderer just renders)

> **Status: IN PROGRESS · Phase 1 DONE (the `api` DATA layer + guard · ZERO runtime · shipped) · Phase 2
> DONE (codegen exact `*Props` types + typed exports · render byte-identical · shipped) · Phase 3 DONE
> (generated RN adapters normalize props; renderer consumes normalized descriptor instances · render
> byte-identical) · Phase 4 DONE (composition renderer + Button lockup + translator script) · Phase 5
> DONE (descriptor-local parts).** This is
> the design SoT for Path C, mirroring [`theme-engine-target.md`](./theme-engine-target.md)'s role for the
> theme rework. It DISTILLS + RECONCILES the external architecture review
> ([`consumer-feedback/COMPONENT-API-REVIEW-2026-07-01.md`](./consumer-feedback/COMPONENT-API-REVIEW-2026-07-01.md)),
> which is the raw artifact — read the reconciliations (§Overrides) as the binding deltas where Nuri's
> model overrides the review. The Phase-1 brief starts from THIS note, not the raw review.

## The diagnosis (the review's executive summary · confirmed against the code)

The RN factory has crossed from "generic" into **policy soup**. The visible smell is the global
`NuriBaseProps` bag — `prefix`/`suffix`/`icon`/`label`/`content`/`onPress`/`disabled`/`accessibilityLabel`
on EVERY factory-built component (`createNuriComponent.tsx:46`). The type system allows nonsense
(`<Topbar onPress disabled>`, `<IconAvatar prefix suffix>`, `<Button icon prefix suffix label>`), and some
of it silently routes into parts when the anatomy happens to contain a same-named leaf.

The root cause is a **missing schema layer**: the descriptor declares **anatomy + style composition**
(`structure`/`variants`/`defaults`), but NOT the **public API** — slots, allowed props, behaviour
affordances, prop→axis maps. Because that layer is absent, `createNuriComponent` BECAME the missing schema
and accreted global heuristics (grep-proven in the renderer):
- lone child part receives `children` (`primaryPart` guess · `:352`);
- **same-named props route into same-named parts** — "if a part name exists, maybe it is a prop" (`:371`);
- the `state` axis magically becomes a public `selected` boolean (`'state' extends keyof A` · `:83`, `:324`);
- any component accepts `onPress`/`disabled`/`accessibilityLabel`;
- `content?: Partial<Record<Part, ReactNode>>` can target any global `Part`;
- compound-slot regions are harvested from every non-root `view` child.

This is the **deferred SEED-3 part-half seen deeper** ([[seed3-part-half-blocked-by-strip]]): the
prefix/suffix/icon/label per-descriptor derivation that collided with the type-strip. Path C's codegen
adapters sidestep the strip wall that blocked TS inference.

## The north star (handoff PHILOSOPHY §3)

**The DS gives DUMB presentation; the consumer owns state/behaviour/sizing** — and **the descriptor owns
the public-API contract, not the renderer.** Anatomy alone is NOT a public API. The three jobs anatomy does
today (internal render tree · style-target graph · public content API) must SPLIT: the first two stay in
`structure`; the third moves to a new `api` section. Then:

> **Path C = descriptor declares its `api` → codegen emits exact per-component adapters/types → a small
> shared renderer consumes a NORMALIZED instance and just renders.**

`createNuriComponent` shrinks to `renderDescriptorInstance({ descriptor, selection, content, behaviour,
themeScope })`. It stops being the place where the component API is invented; the codegen makes it exact;
the renderer renders. This shares the Arc-2 codegen pass (`scripts/parsers/` → `packages/rn/generated/`) —
one pass emits both the baked geometry recipe AND the public adapter/types.

## The canonical `api` shape (v1 · reconciled — the review is inconsistent between its §3.2 and §13)

The review gives two different shapes (nested maps in §3.2 · flat arrays in §13). The binding v1 for Nuri:

```ts
api: {
  // which VARIANT axes surface as public style props (the default already lives in `defaults`)
  axes: string[];                                    // e.g. ['variant', 'size']

  // accent theme-scope (Option 1 · universal-but-DECLARED · see Overrides)
  themeScope?: { accent: true };

  // behaviour props — ONLY where declared; target part must be `interactive`
  behaviour?: { pressable?: { target: PartId; props: ('onPress'|'disabled'|'accessibilityLabel')[] } };

  // the `selected`→state bridge as DATA (kills the `'state' extends keyof A` magic)
  propMaps?: { selected?: { axis: string; true: string; false: string } };

  // content entry points. RICH content (text runs · mixed icon+text · regions · repeated children) is
  // COMPOSITION-only — never a named prop (Overrides §1). The ONE exception: a SCALAR ref — an `icon-name`
  // is a string token like `variant`, not a subtree — MAY declare a `prop` shorthand (Overrides §1a).
  slots: {
    [name: string]: {
      part: PartId;
      kind: 'text' | 'icon-name' | 'node' | 'region' | 'children';
      prop?: string;          // ONLY legal on a singular `icon-name` slot (the scalar shorthand · e.g. 'icon')
      default?: true;         // the untagged-children sink (Option A · §1c) — bare children route here; ⊥ `prop`; never on `icon-name`
      component?: true;       // emit a generated marker/component for ordered composition (e.g. ButtonText/ButtonIcon)
      required?: boolean;
      multiple?: boolean;     // repeated children (e.g. tab-bar's items or repeatable generated component slots)
    };
  };
}
```

`PartId` is descriptor-local: the descriptor's anatomy declares the valid part ids, with `root` as the
required host convention. Codegen/drift guards validate every authored part reference against that local
anatomy (NOT TS inference · the strip wall), so new private parts do not require a frozen global roster bump.

## Target catalog design (SETTLED 2026-07-01 · the operator's redesign)

The icon-anchored icon-button is **retired** (it had no live-screen consumer — the only usage was already
icon-only). The lockup capability RELOCATES to a composable **Button**. The two roles split clean:
- **IconButton = conventional icon-ONLY** — `<IconButton variant="soft" accessibilityLabel="Apple Pay"
  icon="apple" />`. `icon` is a SCALAR icon-name shorthand prop (Overrides §1a), not rich content.
- **Button = text OR composed lockup.** Bare text is the default slot: `<Button>Buy</Button>`. The mid-text
  icon lockup is ORDERED composition over FLAT slot components: `<Button><ButtonText>Buy Bitcoin</ButtonText>
  <ButtonIcon name="apple"/><ButtonText>Pay</ButtonText></Button>` → renders `Buy Bitcoin 🍎 Pay`.

**The compound-slot naming rule (already shipped for Topbar · the determinism guarantee).** RN exposes flat
`${Component}${Slot}` sub-components (`ButtonText`, `TopbarLeading`) — NO dot-notation ([[ds-boundary-and-naming]])
— which map **1:1** to web custom elements `nuri-<component>-<slot>` (`nuri-button-text`, `nuri-topbar-leading`),
a pure kebab↔Pascal pass (`createNuriComponent.tsx:418`). So the **web→RN screen translation stays a
deterministic AST transform** (rename element · attrs→props · recurse children IN ORDER) and can become a
script — Topbar's `nuri-topbar-leading`↔`TopbarLeading` is the existing proof. Ordered children translate
position-for-position, so a `[text, icon, text]` lockup carries over verbatim. (Button's ordered-hetero-
geneous children are a RICHER render than Topbar's one-shot region routing — new renderer work · Phase 4.)

### The `api` table (the settled shapes · Phase-1 declares over these)
| descriptor | axes | themeScope | behaviour.pressable | propMaps | slots |
|---|---|---|---|---|---|
| **button** | variant, size | accent | root · onPress/disabled/a11yLabel | — | default→label·text *(+ Phase-4: repeatable `text`/`icon` composed children)* |
| **icon-button** | variant, size | accent | root · onPress/disabled/a11yLabel | — | icon→icon·icon-name·**prop `icon`**·required (icon-ONLY · NO `default` — the icon is a prop, not a children-sink · §1c) |
| **icon-avatar** | variant | accent | — (NOT interactive) | — | icon→icon·icon-name·**prop `icon`**·required (NO `default`) |
| **topbar** | — | accent | — | — | leading→leading·region · center→center·region · trailing→trailing·region(default) |
| **tab-bar** | — | accent | — | — | default→(container)·children (repeated tab-bar-items · `multiple`) |
| **tab-bar-item** | — | accent | root · onPress/(disabled?)/a11yLabel | selected→state (true→selected · false→unselected) | icon→icon·icon-name · label→label·text |

## Overrides — where Nuri's model OVERRIDES the raw review (binding)

1. **RICH content is composition, never a named prop** (operator, 2026-07-01 · reverses the earlier
   icon-anchored-as-props stance in [[icon-button-is-anchored]]). The operator originally pushed
   `<IconButton icon="apple" prefix="Buy" suffix="Pay">`; they retired it: *"the composition rule vs
   content-in-prop wins · solving the debt is more urgent than saving the old API."* Content-as-named-prop
   for SUBTREES (text runs · mixed icon+text · regions) IS the "part name implies prop" pattern the arc
   exists to kill. The mid-text lockup is NOT lost — it relocates from a doomed icon-button carve-out to
   **Button composition** (ordered flat `ButtonText`/`ButtonIcon` children · Target-catalog-design above),
   which is MORE flexible than the old fixed prefix/icon/suffix AND the most deterministically-translatable
   content model (ordered children ↔ ordered children · no per-prop mapping table). This DELETES the
   `delivery` discriminator: all rich content is composition.
1a. **A SCALAR ref MAY be a prop** (the ONE narrow exception · the operator's icon-only IconButton). An
   `icon-name` is a string token like `variant="soft"`, not a React subtree — so a SINGULAR `icon-name` slot
   may declare a `prop` shorthand (`icon="apple"`). This is NOT the soup: it's DECLARED in `api`, singular,
   and kind-gated (only `icon-name`; never text/node/region/children). The guard enforces `prop` appears
   only on a singular `icon-name` slot. Keeps `<IconButton icon="apple"/>` and `<IconAvatar icon="user"/>`
   ergonomic without a slot-component ceremony for the single-glyph case.
1c. **`default: true` means exactly "the untagged-children sink"** (operator, 2026-07-01 · Option A · the
   Phase-2 codegen contract). NOT "the primary slot." The rule codegen implements is one line: *if the
   consumer passes bare React `children`, route them to the `default` slot's part.* So `<Button>Buy</Button>`
   → the default `label` slot; `<TabBar>{items}</TabBar>` → the default children slot; `<Topbar>{actions}</Topbar>`
   → the default `trailing` region. A `default` slot is therefore CHILDREN-delivered — **mutually exclusive
   with `prop`** (which is prop-delivered · §1a) and never on `kind:'icon-name'`. IconButton/IconAvatar have
   NO `default` (their glyph is the scalar `icon` prop, not children) — a component with no `default` slot
   generates `children?: never`. Rejecting "default = primary" now avoids the Phase-4 ambiguity where a
   composed `<Button icon="…">Send</Button>` would have two plausible "primaries" (text sink vs icon anchor).
   Guard (Phase 2): `default` ⊥ `prop` · `default` only on `text`/`node`/`region`/`children`.
2. **accent = Option 1 (universal), but DECLARED** (`api.themeScope.accent: true` on every descriptor). The
   review prefers Option 2 (per-descriptor opt-in) for purity but calls Option 1 acceptable. Nuri's colour
   model already treats accent as a uniform scope on every component ([[rn-colour-provider-model]]) — so
   universal is the honest shape. Declaring it (rather than a hard-coded global `ThemeScopeProps`) keeps
   "no magic · the descriptor owns the API" intact. Minimal option; still declared-not-magic.
3. **NO shadcn-style eject as default.** Generated components stay canonical inside `@nuri/rn` (the review
   agrees · §6.2). `@nuri/rn` has no external consumer, so BREAK directly — no deprecation bridge, no shim
   (handoff PHILOSOPHY §5). Optional eject is a FUTURE product decision, out of this arc.
4. **`content` escape hatch → internal/test only.** Drop the public `content?: Partial<Record<Part, …>>`;
   keep an internal `renderDescriptorForTest` (or `__content`) if the render-smoke needs it.

## The migration (sequenced · the review's §13 + the operator's "B" reorder · one seam per PR · CLOSE each)

- **Phase 0 (B0) — icon-button → icon-ONLY · render-changing · FIRST · ✅ DONE** (the operator's "B": settle
  the anatomy before declaring API over it, so Phase 1 never declares doomed prefix/suffix slots). Dropped the
  `prefix`/`suffix` parts from the icon-button descriptor (RN + web twin) + their size-variant entries;
  icon-button is now the bare glyph circle (`icon` part only · sizing squares via `minWidth=minHeight`). RN
  snapshots changed (deliberate · regenerated + visually confirmed the circle geometry is unchanged: 48²
  md · radius full · 24px glyph); every other component's snapshot stayed identical. The old global part
  roster was retired in Phase 5, so those retired names no longer pressure the schema.
  **Web-attr generalization (operator directive, 2026-07-01):** a component with an `icon` PART exposes the
  glyph via the `icon` attribute/prop on **both** RN and web — only the primitive `<nuri-icon>` leaf uses
  `name`. Reducing icon-button to a lone `icon` primary made the web factory (which routed a lone icon
  primary via `name`, the icon-avatar convention) surface it as `name`; the operator ruled `icon` should be
  uniform, so `defineNuriComponent` now addresses a lone `icon`-el primary by its part name (`icon`). This
  is generic, so **icon-avatar also flips** `name`→`icon` on web (its live consumers + tests migrated). The
  unification the review assigned to Phase 2 codegen thus lands early for the singular-icon case. Its own small PR.
- **Phase 1 — declare `api` as DATA + a guard · ZERO runtime change · ✅ DONE.** Added the `api` section to
  all six (now-settled) descriptors (the table above) + the validation guard `scripts/component-api.test.js`:
  every slot/behaviour target is a real anatomy part · `prop` only on a singular `icon-name` slot · every
  `api.axes` member exists in `variants` · every propMap axis/value exists · every `pressable.target` part is
  `interactive`. Seven channels, each its own test, each PROVEN to bind by a per-channel mutation. The
  renderer STILL ignores `api` — all 5 gates + the 8 RN render snapshots stayed byte-identical (the
  green-means-safe proof); a grep confirmed no runtime reads `descriptor.api`. **Contract bump:** `api`
  (REQUIRED) joined the FROZEN Descriptor schema — the Guard-F `FROZEN_SCHEMA.Descriptor` pin moved + gained
  `ComponentApi`/`SlotSpec` field-map pins (the 3rd deliberate post-freeze envelope add · cheap ·
  [[contract-bump-mechanism]]). **Two open seams resolved:** (1) *web passthrough* — the additive `api`
  breaks NO web gate: the doc IR + web factory read specific descriptor fields (`structure`/`variants`/
  `defaults`), never iterate top-level keys, so the emitted twins carry `api` verbatim and `npm run build`
  stays clean. (2) *pin encoding* — `ComponentApi`/`SlotSpec` are pinned as full **field-maps** (via
  `typeFields`, like `NS`/`PartAnatomy`), NOT `aliasForms` whole-RHS strings — object types with fields read
  cleanly field-for-field that way. The synthetic RN test-fixture descriptors gained a minimal
  `api: { axes: [], slots: {} }` to satisfy the now-required field (factory-ignored · no behaviour change).
- **Phase 2 — codegen exact `*Props` types + typed exports · render byte-identical · ✅ DONE.** (a) *Option-A data
  prereq* — dropped `default` from IconButton/IconAvatar's icon slot (→ `icon:{part,kind:'icon-name',prop:'icon',
  required:true}`) + guard rules `default` ⊥ `prop`, `default` only on `text|node|region|children` (§1c ·
  Channels 9/10 · mutation-proven). (b)
  *Codegen* emits `packages/rn/generated/components/*` from each `api`: `ButtonProps` (children + axes +
  declared behaviour + accent · **no** `icon`/`prefix`/`suffix`), `IconButtonProps` (required scalar `icon` ·
  **`children?: never`**), etc. The exports become EXACT-typed bindings over the EXISTING factory instance —
  `FC<Wide>` is assignable to `FC<Narrow>` (props contravariant), so this NARROWS the type with ZERO runtime
  change (same `createNuriComponent` instance · same recipe): render snapshots stay byte-identical, only the
  TYPE surface tightens. The factory internals (heuristics) stay until Phase 3. Shares the Arc-2 codegen pass;
  output committed + drift-gated. **The load-bearing proof is a TYPE test** (`@ts-expect-error`): `<Button
  icon="x"/>` errors · `<IconButton icon="x"/>` compiles · `<IconButton>child</IconButton>` errors — tsc IS
  the gate (the type surface is the deliverable · the render-smoke can't see it). **SHIPPED as:** the emitter
  `scripts/parsers/components-api.js` (wired into the orchestrator's Slice 8c) reads each descriptor's
  `api`+`variants` off the authored source via the SAME browser-ESM strip the recipe emit uses; it writes
  `packages/rn/generated/components/<name>.ts` (per-component `{Name}Props` + the narrowed `React.FC<{Name}Props>`
  binding · NO cast) + an `index.ts` barrel, which `factory/index.ts` re-exports. The load-bearing proof is
  `packages/rn/type-tests/component-types.test-d.tsx` (7 `@ts-expect-error` fixtures · checked by
  `npm run typecheck -w @nuri/rn` · removing a directive → tsc fails, VERIFIED). Three open seams resolved:
  (1) *compound slots* — the generated Topbar re-attaches + re-exports `TopbarLeading/Center/Trailing` via the
  unchanged `compoundSlots(instance)` mechanism (derived from the api's `kind:'region'` slots). (2)
  *TabBarItem icon/label* — emitted as `icon?: IconName` + `label?: string` (TODAY's same-name delivery ·
  byte-identical · Phase 4 converts them to composed children). (3) *codegen source* — the authored `.ts`
  (the Arc-2 recipe-emit path · node can't import `.ts`), stated in the emitter header. The naming guard's RN
  `nuriNames(...)` site moved from `factory/index.ts` to the generated per-component files. All gates green ·
  8 RN snapshots byte-identical · the 2 twins (icon-avatar/icon-button) re-emitted from the Option-A slot.
- **Phase 3 — shrink `createNuriComponent` → `renderDescriptorInstance` · ✅ DONE.** Generated RN
  components are now exact runtime adapters: they build concrete `selection` from descriptor defaults +
  first-value fallback, apply `propMaps.selected`, route declared slots into the content map, harvest
  declared region markers, pass only declared pressable behaviour, and wrap `accent` in `NuriScope`.
  The renderer now receives the normalized descriptor instance and keeps only anatomy render, baked-recipe
  apply, foreground scope, decorative a11y, Pressable mechanics for the declared target, and
  `Text`/`View`/`NuriIcon`. Render snapshots stayed byte-identical.
- **Phase 4 — composition renderer + Button lockup + the translator script · ✅ DONE.** The renderer gains
  ORDERED heterogeneous child composition (richer than Topbar's region routing); Button's anatomy gains
  repeatable `text`/`icon` composed children (`ButtonText`/`ButtonIcon`); the mid-text lockup lands HERE.
  Formalize the deterministic web↔RN screen transform (`nuri-<c>-<slot>` ↔ `<C><Slot>` · attrs→props ·
  ordered children) as a SCRIPT. Break directly (no external consumer · no deprecation bridge).
- **Phase 5 — descriptor-local parts · ✅ DONE.** Retired the global `Part` union pressure: schema part ids
  are descriptor-local strings (`PartId`), `root` remains the required host convention, and codegen/drift
  guards validate every `structure.base`, variant part map, slot target, pressable target, and generated
  composition target against the descriptor's own anatomy (NOT TS inference · the strip wall). Generated RN
  adapters now emit per-component part aliases for their `content`/`composition` maps instead of importing a
  global part roster.

## Scope discipline (mirror theme-rework)

Path C is an **architecture + type-honesty** change (make the descriptor own the API · make each
component's surface exact), NOT a behaviour/correctness change — the RENDERED output stays identical
through Phase 3 (the render-smoke snapshots are the byte-identical proof; only the TYPE surface and the
prop-delivery names change). The invariant it moves toward: **the gates + register catch behaviour + drift,
never type-honesty / API-shape** (handoff PHILOSOPHY §4) — so this arc's whole value is gate-INVISIBLE and
lives on the guard (Phase 1's api-validation) + the reviewers. One seam per PR; CLOSE each phase, don't
split ([[close-dont-split]]).
