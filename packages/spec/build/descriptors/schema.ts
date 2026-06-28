/* ──────────────────────────────────────────────────────────────
 * NURI · DESCRIPTOR SCHEMA · GENERATED · DO NOT EDIT BY HAND
 *
 * Source · pipeline/descriptors/schema.ts (the canonical contract · hand-maintained)
 * Emitter · pipeline/tokens-parser.js — run `npm run build`
 *
 * The FROZEN cross-repo contract type (decision 65 · the composition
 * model · amendments 65.3 · 65.4 · 65.5 · ratified): a descriptor is PURE
 * DATA — `{ structure: { anatomy, base }, variants? }` — a composition of
 * the five disjoint primitive namespaces (stack · box · typography ·
 * palette · interactive · 65.3 §6) in SEMANTIC names, ZERO raw style. The
 * platform-native engine resolves them (factory on RN · CSS on web · 65.1);
 * behaviour is the factory's, never data. Reuses the emitted scale types
 * from ./tokens verbatim (decision 48). Validated by the B1.5 playground
 * prototype (roadmap/N+19-B1.5.md).
 *
 * FROZEN as of B3 (N+19 · decision 65 step 5 · "an enforced freeze, not
 * honorary"): the schema SHAPE is locked — guarded by Guard F in
 * pipeline/docs-drift.test.js (the FROZEN_SCHEMA pin). A post-freeze shape
 * change is DELIBERATE + VERSIONED (update the pin + a 65 amendment · the
 * version-negotiation machinery lands with the first real bump · P11). The
 * RN factory relocates to the CI-wired Expo consumer (X-wired · 65.5); this
 * repo emits + freezes the contract — engine + behaviour are the factory's.
 * ────────────────────────────────────────────────────────────── */
import type { TypeSize, Accent } from '../tokens';

// ══════════════════════════════════════════════════════════════════
// LEAF VOCABULARIES · reuse the emitted scales (decision 48)
// ══════════════════════════════════════════════════════════════════

// box sizing (width · height · minHeight) takes the FULL 7-leaf `size`
// scale — `keyof typeof size`, reused from the emit (box.css dispatches
// xs…3xl). Distinct from SpaceLeaf's between-elements rhythm.
export type SizeLeaf = keyof typeof import('../tokens').size;

// padding + gap take the curated 5-leaf semantic space subset the layout
// primitives dispatch (stack.css gap · box.css padding* · the Stack/Box
// SpaceLeaf). NOT the full `space` scale — none/2xs/2xl have no primitive
// dispatch, so the contract does not over-promise them.
export type SpaceLeaf = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// corner geometry (box radii · box.css data-radius · the Box BoxRadius).
export type RadiusLeaf = 'sm' | 'md' | 'lg' | 'full';

// TypeKey · a type-scale step (decision 54/55 · the 6 sizes). DE-FUSED at
// N+45 (decision 77): the fused `${TypeSize}Em` arm is GONE — emphasis is an
// orthogonal `boolean` sibling on TypographyNS now, not baked into the key
// (P11). A `typography.size` value references one named step; the factory
// expands it via typeStyle (relative→absolute · 54 · 55).
export type TypeKey = TypeSize;

// ══════════════════════════════════════════════════════════════════
// THE FIVE NAMESPACES · disjoint by domain (65.3 §6 · no two emit the
// same property) · semantic-name value vocab the engine resolves
// ══════════════════════════════════════════════════════════════════

// `stack` — flexbox (mirrors the Stack primitive · stack.css). `fill` is
// stack-only (decision 60.1); its `grow | grow-shrink` enum is B2a (65.3
// §6 names it · the Topbar pivot's flex:1 1 auto + min-inline-size:0 is
// `grow-shrink` · B1.5 §3).
export type StackNS = {
  direction?: 'row' | 'column';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  gap?: SpaceLeaf;
  wrap?: boolean;
  fill?: 'grow' | 'grow-shrink';
};

// `box` — the element's own visual box: GEOMETRY ONLY, no colour
// (decision 42.1 · 60.1 · 65.3 §6 · box.background removed → palette).
// Sizing = the `size` scale; padding = the space subset; radii = RadiusLeaf.
// `maxWidth` / `border` stay mapped-not-built (decision 30 · no member);
// press-scale `transform` + disabled `opacity` are realized by the
// `interactive` opt-in (the recipe decides WHEN · value from the
// interaction baseline · 65.3 §6), not authored as box props here.
export type BoxNS = {
  width?: SizeLeaf;
  height?: SizeLeaf;
  minHeight?: SizeLeaf;
  padding?: SpaceLeaf;
  paddingX?: SpaceLeaf;
  paddingY?: SpaceLeaf;
  paddingStart?: SpaceLeaf;
  paddingEnd?: SpaceLeaf;
  paddingTop?: SpaceLeaf;
  paddingBottom?: SpaceLeaf;
  radius?: RadiusLeaf;
};

// `typography` — font only, NO colour (decision 64 · the single text-style
// owner; colour is palette's). TWO orthogonal inputs (decision 77 · the N+45
// de-fusion · P11): `size` is the type-scale step; `emphasis` is the regular→
// semibold weight override (a uniform 400→600 across every size · the box/stack
// `flag` precedent). The factory expands the step via typeStyle (54/55); the
// engine applies the weight override when `emphasis` (web `[data-type-emphasis]`
// · RN typeStyle's 2nd arg). Was a single fused `TypeKey` (`mdEm`) — de-fused.
export type TypographyNS = {
  size?: TypeSize;
  emphasis?: boolean;
};

// `palette` — ALL colour, from the semantic inputs (65.3 §6 · mirrors the
// PaletteNS the RN resolver consumes · build/palette.ts is the mapping).
// `variant` is the accent/chrome-funnel role; `chrome` is the separate
// theme-only surface slot (the `subtle` ROLE name is taken). At most one
// of variant|chrome per node (variant wins · not encoded in the type). The
// label/icon FG drops out of a variant patch — it follows by SCOPE
// (F-BOX-FG-1 · the factory threads the role-fg · B2c·3). `outline` /
// `border` / the onSolid.muted token = mapped-not-built (decision 30).
export type PaletteVariant = 'solid' | 'soft' | 'ghost' | 'subtle';
export type PaletteChrome = 'canvas' | 'subtle' | 'strong';
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

// A node's namespace composition — any subset of the five. On RN this is
// one merged `<View style>`; on web one painting node carrying the merged
// namespace classes/`data-*` (B1.5 §4.2 · the merged-node model).
export type NS = {
  stack?: StackNS;
  box?: BoxNS;
  typography?: TypographyNS;
  palette?: PaletteNS;
  interactive?: InteractiveNS;
};

// ══════════════════════════════════════════════════════════════════
// THE PARTS · anatomy (structure) + the per-part namespace maps
// ══════════════════════════════════════════════════════════════════

// The named parts a composition addresses. The structure half (the
// decision-24.1 page anatomy) declares which a component has; base +
// variants compose them by name. `root` is the host. leading/trailing
// are POSITIONAL slots of an `open` primitive (the author places them ·
// decision 64) — not styled parts, so not enumerated here.
export type Part = 'root' | 'label' | 'icon' | 'content';

// The structural elements a part renders as — view-ish, text-ish, or the
// glyph leaf. Drives the factory's JSX (and the web painting node);
// un-derivable from CSS (web is one node · 65.2) → structure knowledge.
export type El = 'view' | 'text' | 'icon';

// A part's anatomy: its element, whether it is OPEN (accepts positional
// children · the §7 open-primitive layer), and any nested named parts.
export type PartAnatomy = {
  el: El;
  open?: boolean;
  parts?: Partial<Record<Exclude<Part, 'root'>, PartAnatomy>>;
};

// A per-part namespace map — `{ root: NS, label: NS, … }`. The SAME shape
// serves `structure.base` (invariant / locked defaults · incl. the Topbar
// content-pivot's `stack{fill}` which is a PART's base) and each variant
// value (the recipe's per-axis decision). base is per-part, not root-only,
// so a part's invariant base (the pivot) has a home.
export type PartMap = Partial<Record<Part, NS>>;

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
export type Variants<A extends Axes> = {
  [Axis in keyof A]: { [Value in A[Axis]]: PartMap };
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
// unset axis resolves to; BOTH factories read it (createNuriComponent's
// defaultByAxis · the web buildComponent fallback), so neither binding
// hand-knows a default. Absent a `defaults[axis]` the factory falls back to
// the axis's FIRST value (the prior behaviour · the first-value heuristic).
// Closes the web↔RN parity gap the recipes patched at the binding (Button
// soft · not solid). `decorative` — the component is hidden from AT
// (aria-hidden · decision 50 · IconAvatar): honest descriptor data the web
// factory reads instead of a hand `aria-hidden` at the binding.
export type Descriptor<A extends Axes> = {
  structure: { anatomy: PartAnatomy; base?: PartMap };
  variants?: Variants<A>;
  defaults?: Partial<Record<string, string>>;
  decorative?: boolean;
};
