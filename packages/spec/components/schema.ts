/* ──────────────────────────────────────────────────────────────
 * NURI · DESCRIPTOR SCHEMA · CANONICAL SOURCE (hand-maintained)
 *
 * The FROZEN cross-repo contract type (decision 65 · the composition
 * model · amendments 65.3 · 65.4 · 65.5 · ratified). This is the SoT;
 * @nuri/rn imports it directly via the `./descriptors/schema` exports
 * subpath (the verbatim build/descriptors/schema.ts copy was dropped at
 * N+61 · Slice 3b·2b·i · projection-model §4 · decision 80). The three
 * scale-derived leaf types (SizeLeaf · Accent · TypeSize) derive STRAIGHT
 * from the TS SoTs (../dimensions · ../colours · ../typography) via
 * `keyof typeof import(...)`, so this file imports NOTHING from build/ —
 * spec has zero build/ dependency, the precondition for the RN contract's
 * relocation out of spec (3b·2b·ii · @nuri/rn depends on @nuri/spec, so
 * spec must never import from a build/ that relocates with it).
 *
 * FROZEN as of B3 (N+19 · decision 65 step 5 · "an enforced freeze, not
 * honorary"). The schema SHAPE — the five namespace field vocabularies
 * (Stack/Box/Typography/Palette/Interactive NS), the leaf vocabs (SizeLeaf/
 * SpaceLeaf/RadiusLeaf/TypeKey), and the Descriptor/PartAnatomy/PartMap/
 * PartId/El envelope — is locked by Guard F (pipeline/docs-drift.test.js · the
 * FROZEN_SCHEMA pin); a field added/removed/renamed/retyped breaks the build.
 * A post-freeze shape change is DELIBERATE + VERSIONED: update the freeze pin
 * AND log it as a contract change in the decisionlog (a 65 amendment) — the
 * version-negotiation machinery lands with the first real bump (P11). The
 * per-component AXES + instance VALUES are NOT frozen here (Guard D · they
 * re-derive from the live CSS). The RN factory relocates to the CI-wired Expo
 * consumer (X-wired · 65.5); this repo emits + freezes the contract.
 *
 * THE SHAPE — pure data, no theme thunk (65.3 · supersedes 65.2's
 * raw-style `(theme) => ({ variants, compoundVariants? })`):
 *
 *   Descriptor = { structure: { anatomy, base }, variants? }
 *
 * A recipe is 100% a composition of five disjoint primitive namespaces
 * (65.3 §6 · `stack` · `box` · `typography` · `palette` · `interactive`),
 * ZERO raw style. Every value is a SEMANTIC name (`palette:{variant}` ·
 * `box:{minHeight:'lg'}` · `typography:{size:'md',emphasis:true}`) the platform-native
 * ENGINE resolves (factory on RN · CSS on web · 65.1) — no ViewStyle /
 * TextStyle here, no `(theme) =>`. The descriptor is DATA; behaviour
 * (press handlers / press transition / focus / a11y) is the factory's,
 * never data (decision 65 · 65.3 · "behaviour ≠ data") — but WHICH host a
 * part renders as (el:'pressable' vs 'view') is STRUCTURE, declared in the
 * anatomy (amendment 65.13 · the behaviour channel carries only runtime
 * handlers).
 *
 * Authored as a real .ts (not a JS template string) so the editor
 * typechecks the contract directly.
 *
 * Derives its scale leaf types straight from the TS SoTs (decision 48 ·
 * one source, two readers): box sizing = the `size` scale leaf,
 * typography = the type-step (size + emphasis · decision 77). The namespace value vocabularies mirror
 * the live primitives (stack.css · box.css · palette.tsx) — the shared
 * authoring language B2c·3's factory + mirrors consume.
 * ────────────────────────────────────────────────────────────── */

// ══════════════════════════════════════════════════════════════════
// LEAF VOCABULARIES · derived STRAIGHT from the TS SoTs (decision 48 ·
// N+61 · re-homed off build/tokens so spec has no build/ dependency)
// ══════════════════════════════════════════════════════════════════

// box sizing (width · height · minHeight) takes the FULL 7-leaf `size`
// scale — `keyof typeof size`, derived from the dimensions SoT (box.css
// dispatches xs…3xl). Distinct from SpaceLeaf's between-elements rhythm.
export type SizeLeaf = keyof typeof import('../tokens/dimensions').size;

// Accent — the accent set, derived from the colours SoT `accent` table
// (neutral · lilac · orange). The PaletteNS `accent` value vocab. Was
// imported from build/tokens (re-homed N+61 · identical union).
export type Accent = keyof typeof import('../tokens/colours').accent;

// TypeSize — the type-scale steps, derived from the typography SoT `type`
// table (xs · sm · md · lg · xl · 3xl). The TypographyNS `size` value vocab
// (+ TypeKey below). Was imported from build/tokens (re-homed N+61 · identical union).
export type TypeSize = keyof typeof import('../tokens/typography').type;

// padding + gap take the curated 5-leaf semantic space subset the layout
// primitives dispatch (stack.css gap · box.css padding* · the Stack/Box
// SpaceLeaf). NOT the full `space` scale — none/2xs/2xl have no primitive
// dispatch, so the contract does not over-promise them.
export type SpaceLeaf = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// corner geometry (box radii · box.css data-radius · the Box BoxRadius).
export type RadiusLeaf = 'sm' | 'md' | 'lg' | 'full';

// surface elevation (projection-owned effect realization). The spec carries only
// the semantic level; RN/web own the concrete shadow/elevation payloads.
export type Elevation = 'none' | 'raised';

// aspect-ratio (box aspectRatio · box.css data-aspect-ratio). Derived STRAIGHT
// from the dimensions SoT `ratio` table (square · card) — like SizeLeaf, the FULL
// scale IS the vocab (no curated subset · adding a ratio token extends this union).
export type RatioLeaf = keyof typeof import('../tokens/dimensions').ratio;

// TypeKey · a type-scale step (decision 54/55 · the 6 sizes). DE-FUSED at
// N+45 (decision 77): the fused `${TypeSize}Em` arm is GONE — emphasis is an
// orthogonal `boolean` sibling on TypographyNS now, not baked into the key
// (P11). A `typography.size` value references one named step; the factory
// expands it via typeStyle (relative→absolute · 54 · 55).
export type TypeKey = TypeSize;

// ══════════════════════════════════════════════════════════════════
// THE SEMANTIC NAMESPACES · disjoint by domain (65.3 §6 · no two emit the
// same property) · semantic-name value vocab the engine resolves
// ══════════════════════════════════════════════════════════════════

// `stack` — flexbox (mirrors the Stack primitive · stack.css). `fill` is
// stack-only (decision 60.1); its `grow | grow-shrink` enum is B2a (65.3
// §6 names it · the Topbar pivot's flex:1 1 auto + min-inline-size:0 is
// `grow-shrink` · B1.5 §3). `even` (the topbar-slots slice · the 2nd
// deliberate post-freeze StackNS add · decision 65 "post-freeze changes
// are versioned") = the EQUAL-flex-basis-0 edge (flex 1 1 0 + min-size 0):
// two `even` regions take an identical share of the leftover row, so a
// `flex:none` centre region lands at the bar's TRUE centre regardless of
// edge-content asymmetry (the TopbarLeading/Trailing edges · the centring
// forcing function). Distinct from `grow-shrink` (basis auto · the old pivot).
// `hug` (flex 0 0 auto · the 3rd versioned fill add) = the no-shrink content floor.
// `distribute` (a versioned add) is the PARENT-side even split — every DIRECT CHILD
// takes an equal share (flex 1 1 0), the concise "N equal buttons/chips in a row"
// without a per-child `fill`. The FIRST stack property whose effect lands on CHILDREN,
// not the node (web `> *` combinator · RN per-child inject · a node no-op in the appliers).
export type StackNS = {
  direction?: 'row' | 'column';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  gap?: SpaceLeaf;
  wrap?: boolean;
  fill?: 'grow' | 'grow-shrink' | 'even' | 'hug';
  distribute?: 'even';
};

// `box` — the element's own visual box: GEOMETRY ONLY, no colour
// (decision 42.1 · 60.1 · 65.3 §6 · box.background removed → palette).
// Sizing = the `size` scale; padding = the space subset; radii = RadiusLeaf.
// `maxWidth` / `border` stay mapped-not-built (decision 30 · no member);
// press-scale `transform` + disabled `opacity` are realized by the
// `interactive` opt-in (the recipe decides WHEN · value from the
// interaction baseline · 65.3 §6), not authored as box props here.
// `minWidth` (P11 · the icon-button slice · the 2nd deliberate post-freeze BoxNS
// add) is a min-inline-size FLOOR: the icon-anchored control sets minWidth =
// minHeight so the BARE form floors to a square (the glyph centres, a small
// paddingX absorbed by the border-box floor) while the FLANKED form grows past
// it — the standard icon-button primitive (a real first consumer · decision 30).
// `aspectRatio` (the box-aspect-ratio slice · the 3rd deliberate post-freeze BoxNS
// add) is the box's width:height ratio — a `ratio`-scale leaf (square · card), the
// FIRST box field backed by a non-px scale. UNITLESS on both targets (web
// `aspect-ratio: var(--nuri-ratio-card)` · RN `{ aspectRatio: 1.586 }`); the `card`
// payment-card surface is its first consumer (decision 30).
export type BoxNS = {
  width?: SizeLeaf;
  height?: SizeLeaf;
  minHeight?: SizeLeaf;
  minWidth?: SizeLeaf;
  padding?: SpaceLeaf;
  paddingX?: SpaceLeaf;
  paddingY?: SpaceLeaf;
  paddingStart?: SpaceLeaf;
  paddingEnd?: SpaceLeaf;
  paddingTop?: SpaceLeaf;
  paddingBottom?: SpaceLeaf;
  radius?: RadiusLeaf;
  radiusTop?: RadiusLeaf;
  aspectRatio?: RatioLeaf;
};

// `typography` — text presentation only, NO colour (decision 64 · the single text-style
// owner; colour is palette's). TWO orthogonal inputs (decision 77 · the N+45
// de-fusion · P11): `size` is the type-scale step; `emphasis` is the regular→
// semibold weight override (a uniform 400→600 across every size · the box/stack
// `flag` precedent). The factory expands the step via typeStyle (54/55); the
// engine applies the weight override when `emphasis` (web `[data-type-emphasis]`
// · RN typeStyle's 2nd arg). `align` is TEXT alignment (start/center/end), not
// StackNS layout alignment; web had the raw wrapper dispatch, and RN maps it to
// TextStyle.textAlign at the resolver boundary. `flow`/`lines` are the first
// shared text-flow model: wrap = natural wrapping (no clamp), truncate = max-line
// tail ellipsis, with `lines` required only for truncate. Was a single fused
// `TypeKey` (`mdEm`) — de-fused.
export type TypographyNS = {
  size?: TypeSize;
  emphasis?: boolean;
  align?: 'start' | 'center' | 'end';
  flow?: 'wrap' | 'truncate';
  lines?: 1 | 2 | 3;
};

// `palette` — ALL colour, from the semantic inputs (65.3 §6 · mirrors the
// PaletteNS the RN resolver consumes · packages/rn/generated/data/palette.ts is the mapping).
// `variant` is the accent/chrome-funnel role; `chrome` is the separate
// theme-only surface slot (the `subtle` ROLE name is taken). At most one
// of variant|chrome per node (variant wins · not encoded in the type). The
// label/icon FG drops out of a variant patch — it follows by SCOPE
// (F-BOX-FG-1 · the factory threads the role-fg · B2c·3). `outline`
// adds the first border-colour channel; solid.fgMuted stays mapped-not-built
// (decision 30).
export type PaletteVariant = 'solid' | 'soft' | 'ghost' | 'subtle' | 'outline';
export type PaletteChrome = 'canvas' | 'subtle' | 'strong' | 'transparent';
export type PaletteNS = {
  variant?: PaletteVariant;
  accent?: Accent;
  muted?: boolean;
  chrome?: PaletteChrome;
};

// `interactive` — a STRUCTURED per-part opt-in, not a style (65.3 §6 ·
// the B2c·1 channels · 65.4). Each flag opts the node into one independent
// effect; the VALUE is derived by the engine (pressColor → the node's
// variant pressedBg · pressScale/disabledOpacity → the interaction
// baseline · decision 45). A static surface carries no `interactive` →
// never reacts. The effects are proven independent on main (Button =
// all three · TabBar = pressScale-only · list-interactive-item =
// pressColor-only · Switch = pressScale + disabledOpacity). Affordance
// (cursor · transition · focus ring) is automatic with interactivity,
// not an opt-in. The per-channel value-override (Switch's 0.92 knob
// scale) + the pressed-fg-muted stay mapped-not-built (decision 30).
export type InteractiveNS = {
  pressColor?: boolean;
  pressScale?: boolean;
  disabledOpacity?: boolean;
};

// `effect` — static visual effects. The value is semantic; each projection owns
// its realization (web box-shadow; RN shadow/elevation style).
export type EffectNS = {
  elevation?: Elevation;
};

// A node's namespace composition — any subset of the namespaces. On RN this is
// one merged `<View style>`; on web one painting node carrying the merged
// namespace classes/`data-*` (B1.5 §4.2 · the merged-node model).
export type NS = {
  stack?: StackNS;
  box?: BoxNS;
  typography?: TypographyNS;
  palette?: PaletteNS;
  interactive?: InteractiveNS;
  effect?: EffectNS;
};

// ── The RUNTIME namespace-key lists for the two BESPOKE namespaces ──────
// The primitive layer (the hand-authorable wrappers · @nuri/rn) and its parity
// gate need each namespace's key set AT RUNTIME (to bucket flat props · to assert
// web-ATTRS ≡ RN-props ≡ schema keys). box/stack get theirs from the shared Field
// tables (`Object.keys(STACK_FIELDS/BOX_FIELDS)` · @nuri/spec/resolve-map) and
// interactive from the opts table (@nuri/spec/interactive-effects) — one runtime
// SoT each. palette/typography are NOT in the agnostic Field table (bespoke ·
// decision 67/73), and their own axis SoTs (palette-surface.ts · typography-axis.ts)
// are type-stripped + data-URL imported by node, so they may carry NO imports —
// they cannot host a `keyof …NS` totality pin. So the list lives HERE, beside the
// type it is pinned to: `satisfies Record<keyof …NS, 0>` keeps it TOTAL over the
// namespace by construction (a field added/removed/renamed on PaletteNS/TypographyNS
// is a COMPILE error on this line · the same totality trick that keeps STACK_FIELDS
// honest), so the runtime list can never silently diverge from the frozen schema.
export const PALETTE_KEYS = Object.keys(
  { variant: 0, accent: 0, muted: 0, chrome: 0 } satisfies Record<keyof PaletteNS, 0>,
);
export const TYPOGRAPHY_KEYS = Object.keys(
  { size: 0, emphasis: 0, align: 0, flow: 0, lines: 0 } satisfies Record<keyof TypographyNS, 0>,
);
export const EFFECT_KEYS = Object.keys(
  { elevation: 0 } satisfies Record<keyof EffectNS, 0>,
);

// ══════════════════════════════════════════════════════════════════
// THE PART IDS · anatomy (structure) + the per-part namespace maps
// ══════════════════════════════════════════════════════════════════

// The named parts a descriptor composition addresses. The structure half declares
// which part ids a component has; base + variants + api targets compose them by
// name. `root` remains the required host convention, but non-root ids are
// descriptor-local: adding a private part to one descriptor must not bump a
// frozen global roster. The codegen/drift guards validate every reference against
// the descriptor's own anatomy because TS inference cannot survive the strip
// pipeline. `Part` remains a compatibility alias for internal consumers; it is no
// longer a closed public vocabulary.
export type PartId = string;
export type Part = PartId;

// The structural elements a part renders as — the static view host, the
// PRESSABLE host (RN <Pressable> · web <nuri-pressable> · the el:'pressable'
// bump: WHICH JSX host a part renders as is a per-descriptor STRUCTURAL fact,
// so it lives here — not derived from the behaviour channel or the
// `interactive` flags), text, or the glyph leaf. Drives the factory's JSX
// (and the web painting node); un-derivable from CSS (web is one node ·
// 65.2) → structure knowledge. `pressable` is the 1st deliberate post-freeze
// `El` add (decision 65 · versioned · amendment 65.13); the coherence guard
// (scripts/component-api.test.js Channel 2) pins el:'pressable' ≡ the
// declared `behaviour.pressable.target` ≡ the `interactive`-flagged parts.
export type El = 'view' | 'text' | 'icon' | 'pressable' | 'input';

// ── The RUNTIME host/leaf partition of `El` (the PR-#132 review pass) ────────
// The renderers and guards need the classification AT RUNTIME: HOSTS (view ·
// pressable) render children and always render; LEAVES (text · icon) are
// content-gated. The switches over `el` are compile-safe (assertNever); the
// value-level PREDICATES (`el === …` chains) are not — so they consume THIS
// partition instead of hand-enumerating members. The `satisfies Record<El, …>`
// keeps the classification TOTAL by construction (the PALETTE_KEYS totality
// precedent): a new `El` member is a COMPILE error on this line until it is
// classified host-or-leaf. Script-side mirror: scripts/parsers/components-api.js
// HOST_ELS (node cannot import this .ts); web-factory floor: one annotated hand
// site (factory.js · browser runtime).
const EL_CLASS = {
  view: 'host',
  pressable: 'host',
  text: 'leaf',
  icon: 'leaf',
  input: 'control',
} satisfies Record<El, 'host' | 'leaf' | 'control'>;
export const HOST_ELS = (Object.keys(EL_CLASS) as El[]).filter((el) => EL_CLASS[el] === 'host');
export const LEAF_ELS = (Object.keys(EL_CLASS) as El[]).filter((el) => EL_CLASS[el] === 'leaf');
export const CONTROL_ELS = (Object.keys(EL_CLASS) as El[]).filter((el) => EL_CLASS[el] === 'control');

// A part's anatomy: its element, whether it is OPEN (accepts positional
// children · the §7 open-primitive layer), and any nested named parts.
export type ComponentRef = {
  component: string;
  props?: Record<string, string | boolean | number | null>;
};

export type PartAnatomy<P extends PartId = PartId> = {
  el?: El;
  component?: string;
  props?: ComponentRef['props'];
  open?: boolean;
  parts?: Partial<Record<Exclude<P, 'root'>, PartAnatomy<P>>>;
};

// A per-part namespace map — `{ root: NS, label: NS, … }`. The SAME shape
// serves `structure.base` (invariant / locked defaults · incl. the Topbar
// content-pivot's `stack{fill}` which is a PART's base) and each variant
// value (the recipe's per-axis decision). base is per-part, not root-only,
// so a part's invariant base (the pivot) has a home.
export type PartMap<P extends PartId = PartId> = Partial<Record<P, NS>>;

// ══════════════════════════════════════════════════════════════════
// THE DESCRIPTOR · pure data (65.3 §7) · structure + variants
// ══════════════════════════════════════════════════════════════════

// An axis map: axis name → the union of its string values
// (e.g. { variant: 'solid'|'soft'|'ghost'; size: 'sm'|'md'|'lg' }).
export type Axes = Record<string, string>;

// variants: every value of every axis maps to a per-part composition.
// No `compoundVariants` — the press transition is no longer data
// (decision 65 · behaviour ≠ data); interaction is the `interactive`
// opt-in in `structure.base` (Button is interactive across all variants).
export type Variants<A extends Axes, P extends PartId = PartId> = {
  [Axis in keyof A]: { [Value in A[Axis]]: PartMap<P> };
};

// ══════════════════════════════════════════════════════════════════
// THE PUBLIC API · the missing schema layer (Path C · Phase 1 · the
// component-API arc · docs/archive/component-api-target.md · the 3rd post-freeze
// contract bump). The descriptor already owns anatomy + style
// (`structure`/`variants`); it did NOT own its PUBLIC API — so the RN
// factory INVENTED each component's surface from anatomy guesses (the
// `NuriBaseProps` policy soup). `api` closes that gap as pure DATA: which
// style axes surface, the theme scope, the behaviour affordances, the
// `selected`→axis bridge, and the content slots. It is REQUIRED on every
// descriptor (no half-migrated schema · an `api?` would let a descriptor
// skip it silently). ZERO runtime this phase — the factory keeps ignoring
// `api`, so every render stays byte-identical; the api-validation guard
// (scripts/component-api.test.js) is its only defence. Codegen (Phase 2) +
// the renderer shrink (Phase 3) CONSUME it later.

// A content entry point — where a value/subtree lands in the anatomy. RICH
// content (text runs · mixed icon+text · regions · repeated children) is
// COMPOSITION-only (a flat sub-component per slot · never a named prop · the
// operator's 2026-07-01 rule). The ONE exception: a SCALAR ref — an
// `icon-name` is a string token like `variant`, not a subtree — MAY declare a
// `prop` shorthand (`icon="apple"`). `part` is a descriptor-local `PartId`,
// validated against that descriptor's anatomy by the codegen/drift guards (not TS
// inference · the strip wall).
// `prop` = the scalar icon-name shorthand (ONLY legal on a singular `icon-name`
// slot); `default: true` = the untagged-children sink (bare positional children
// route here; mutually exclusive with `prop`; never on `icon-name`);
// `component: true` = emit a generated marker/component for ordered composition
// (RN `ButtonText` / web `<nuri-button-text>`); `multiple: true` = repeated
// children, either an open `children` host or a component-declared slot sequence.
export type SlotSpec<P extends PartId = PartId> = {
  part: P;
  kind: 'text' | 'icon-name' | 'node' | 'region' | 'children';
  prop?: string;
  default?: true;
  component?: true;
  required?: boolean;
  multiple?: boolean;
};

// The component's declared public API (v1 · docs/archive/component-api-target.md
// §"The canonical `api` shape"). `axes` = which VARIANT axes surface as public
// style props (the default already lives in `defaults`); `themeScope.accent` =
// the component-local accent scope when a component exposes one;
// `behaviour.pressable` =
// the press affordance, ONLY where declared and the target part is `interactive`;
// `propMaps.selected` = the `selected`→state-axis bridge as DATA (kills the
// `'state' extends keyof A` factory magic); `slots` = the content entry points.
export type InputBehaviourProp = 'value'
  | 'onChangeText'
  | 'placeholder'
  | 'inputMode'
  | 'secureTextEntry'
  | 'disabled'
  | 'onFocus'
  | 'onBlur'
  | 'accessibilityLabel';

export type ComponentApi<P extends PartId = PartId> = {
  axes: string[];
  role?: 'tablist';
  themeScope?: { accent: true };
  behaviour?: {
    pressable?: { target: P; role?: 'button' | 'tab'; props: ('onPress' | 'disabled' | 'accessibilityLabel')[] };
    input?: { target: P; focusTarget?: P; labelPart?: P; props: InputBehaviourProp[] };
  };
  propMaps?: { selected?: { axis: string; true: string; false: string } };
  slots: Record<string, SlotSpec<P>>;
};

// The per-component descriptor — PURE DATA (no theme thunk). `structure`
// = the anatomy (invariant parts/slots + the open flag) + `base` (the
// per-part invariant / locked-default composition); `variants` = the
// recipe's per-axis decisions. The SAME data serves both composition
// layers (decision 64 · 65.3 §7); only OPENNESS differs — the open
// `composition-` primitive exposes `base` for override, the recipe locks
// it (the anatomy-vs-base load-bearing marker is deferred · B1.5 §4.1 · P11).
//
// `defaults` — the per-axis PUBLIC default (R1.5 · N+50). The value an
// unset axis resolves to; BOTH projections read it (the RN component-API
// codegen's default bake · the web buildComponent fallback), so neither binding
// hand-knows a default. Absent a `defaults[axis]` the factory falls back to
// the axis's FIRST value (the prior behaviour · the first-value heuristic).
// Closes the web↔RN parity gap the recipes patched at the binding (Button
// soft · not solid). `decorative` — the component is hidden from AT
// (aria-hidden · decision 50 · IconAvatar): honest descriptor data the web
// factory reads instead of a hand `aria-hidden` at the binding. `api` — the
// PUBLIC-API contract (Path C · Phase 1 · above): REQUIRED, pure data, ignored
// by the renderer this phase (codegen consumes it later). A deliberate,
// versioned post-freeze envelope add (the Guard-F pin moves with it).
export type Descriptor<A extends Axes, P extends PartId = PartId> = {
  structure: { anatomy: PartAnatomy<P>; base?: PartMap<P> };
  variants?: Variants<A, P>;
  defaults?: { [Axis in keyof A]?: A[Axis] };
  decorative?: boolean;
  api: ComponentApi<P>;
};
