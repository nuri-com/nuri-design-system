/* ──────────────────────────────────────────────────────────────
 * NURI · DESCRIPTOR SCHEMA · CANONICAL SOURCE (hand-maintained)
 *
 * The frozen cross-repo contract type (decision 65 · 65.2). This is
 * the pipeline SOURCE; `pipeline/tokens-parser.js` emits it verbatim
 * (rewriting the one `../../build/tokens` import to the build-local
 * `./tokens`) to build/descriptors/schema.ts on `npm run build`. Edit
 * HERE, never the emitted copy (decision 35 · build/ is generated).
 *
 * Authored as a real .ts (not a JS template string) so the editor
 * typechecks it AND the TS template-literal type `${TypeSize}Em`
 * survives — a JS template literal would mangle the backtick / ${…}.
 * ────────────────────────────────────────────────────────────── */

import type { ViewStyle, TextStyle } from 'react-native';
import type { TypeSize, TypeStep } from '../../build/tokens';

// ── TypeKey · the type-step namespace (decision 54 · 6 steps × {·,Em}) ──
// Mirrors docs/migration-tests/button-matrix/_shared.tsx. A `typeStep`
// patch references one of these named steps; the factory (B2 · native)
// expands it via typeStyle (relative→absolute · decision 54 · 55).
export type TypeKey = TypeSize | `${TypeSize}Em`;

// ══════════════════════════════════════════════════════════════════
// THE BASELINE THEME · resolver-model §11 · surface-as-data (65.2)
// ──────────────────────────────────────────────────────────────────
// The transversal vocabularies resolved per (accent × mode), shaped as
// a Unistyles-compatible theme the variants reference (`theme.surface.*`
// · `theme.size.*` · …). Reuses the emitted scale types verbatim
// (decision 48 · one source, two readers); the `surface` role grouping
// is the resolver-model §11 baseline layered on top. ONE owner —
// nothing per-component redefines it (resolver-model §1).
// ══════════════════════════════════════════════════════════════════

// surface roles · each INTERACTIVE role carries rest {bg,fg} + pressedBg;
// `subtle` is STATIC-only (IconAvatar · decision 50) → NO pressedBg.
// Encoding that absence in the TYPE is deliberate (resolver-model §5): a
// static role exposes only rest, so a pressed value it lacks is not even
// reachable (65.2 · a `subtle`-pressed compound is inexpressible).
export type InteractiveSurface = { bg: string; fg: string; pressedBg: string };
export type StaticSurface = { bg: string; fg: string };

export type Surface = {
  solid: InteractiveSurface;
  soft: InteractiveSurface;
  ghost: InteractiveSurface;
  subtle: StaticSurface; // avatar-only · transparent bg · fg = chrome.borderStrong
};

export type Theme = {
  // COLOUR — surface roles (rest + pressed) · the variant×accent funnel as data.
  surface: Surface;
  // TYPE — each step = {fontSize, lineHeight, fontWeight, letterSpacing} · decision 54.
  // Reuse the emitted table type verbatim; the factory applies typeStyle (relative→absolute).
  type: Record<TypeKey, TypeStep>;
  // GEOMETRY — theme-invariant primitive scales (reuse the emitted shapes · decision 48).
  space: typeof import('../../build/tokens').space;
  size: typeof import('../../build/tokens').size;
  radius: typeof import('../../build/tokens').radius;
  // INTERACTION — the not-colour effects (independent opt-ins · resolver-model §5).
  interaction: { pressScale: number; disabledOpacity: number };
};

// ══════════════════════════════════════════════════════════════════
// THE STYLE PATCH · host (root) + the `$parts` overlay (65.2)
// ══════════════════════════════════════════════════════════════════

// Named parts a patch may target. The structure half (decision 65 · the
// decision-24.1 page anatomy) declares which parts a component has; the
// variants (mapping) half patches them by name. `root` is the host (the
// §11 default · implicit when `$parts` is absent · the bare-ViewStyle 90%).
export type Part = 'root' | 'label' | 'icon' | 'content';

// A label/icon may carry a SEMANTIC type-step reference (decision 55:
// sm→smEm, md/lg→mdEm) rather than a frozen absolute TextStyle — the
// factory expands it via typeStyle (relative→absolute · decision 54 ·
// future OS fontScale). This `typeStep` is the ONE non-literal in the
// patch vocabulary (65.2 · mapping = data, expansion = factory behaviour).
export type TypeRef = { typeStep: TypeKey };

// The style for a non-root part. label/icon render text-ish
// (TextStyle | TypeRef); content / root render view-ish (ViewStyle). The
// union is intentionally loose — a per-part-typed schema would bind each
// part to its element's style set, but that is gold-plating (P11).
export type PartStyle = ViewStyle | TextStyle | TypeRef;

// A patch IS a bare ViewStyle on the host (root) + an OPTIONAL `$parts`
// overlay for the non-root parts (65.2 · the spike's single shape change:
// Topbar `center` lands 100% on `content`, inexpressible host-only).
export type StyleValue = ViewStyle & {
  $parts?: Partial<Record<Exclude<Part, 'root'>, PartStyle>>;
};

// ══════════════════════════════════════════════════════════════════
// THE DESCRIPTOR · CVA `variants` / `compoundVariants` · theme thunk
// ══════════════════════════════════════════════════════════════════

// An axis map: axis name → the union of its string values
// (e.g. { variant: 'solid'|'soft'|'ghost'; size: 'sm'|'md'|'lg' }).
export type Axes = Record<string, string>;

// variants: every value of every axis maps to a patch.
export type Variants<A extends Axes> = {
  [Axis in keyof A]: { [Value in A[Axis]]: StyleValue };
};

// A compound CONDITION = a partial selection over the axes PLUS the
// interaction flags. pressed/disabled are NOT axes — they are independent
// opt-in states (resolver-model §5), modelled as compound conditions only.
export type Condition<A extends Axes> = Partial<{ [Axis in keyof A]: A[Axis] }> & {
  pressed?: boolean;
  disabled?: boolean;
};
export type CompoundVariant<A extends Axes> = Condition<A> & { styles: StyleValue };

// The per-component descriptor. A theme thunk (resolver-model §11) — the
// baseline IS the theme; variants reference `theme.*`. `compoundVariants`
// is OPTIONAL → "no interaction" is expressed by ABSENCE, not a
// forced-empty `[]` (the static-component story · IconAvatar · 65.2).
export type Descriptor<A extends Axes> = (theme: Theme) => {
  variants: Variants<A>;
  compoundVariants?: CompoundVariant<A>[];
};
