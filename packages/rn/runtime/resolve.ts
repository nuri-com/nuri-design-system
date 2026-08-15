/* ══════════════════════════════════════════════════════════════════
 * NURI · RUNTIME · THE GENERIC DESCRIPTOR ENGINE
 * ──────────────────────────────────────────────────────────────────
 * ONE engine, schema-driven (decision 65 · 65.3) — NOT per-component.
 * It interprets the frozen descriptor `{ structure:{anatomy,base}, variants }`
 * by resolving the FIVE disjoint SEMANTIC namespaces (65.3 §6) onto RN:
 *
 *   stack       → flex-container vocabulary carried by View
 *   box         → sizing · padding · radii carried by View
 *   typography  → a type STEP ref the factory expands via typeStyle (54/55)
 *   palette     → colour via theme.surface / theme.chrome (packages/rn/generated/data/palette.ts)
 *   interactive → press/disabled transients (the structured opt-in · 65.4)
 *
 * Behaviour stays the FACTORY's, the descriptor stays DATA (65): the
 * `interactive` opt-in says WHICH effects; HOW (Pressable, the pressed
 * render-prop) is in the renderer (renderer.tsx). Colour flows by SCOPE (§12 ·
 * F-BOX-FG-1): a `palette` patch touches the node's bg + provides an fg;
 * descendant text/icon parts INHERIT that fg (never re-threaded as data).
 *
 * Two resolved views, one core (`resolveNS`):
 *   · flattenPart      — the concrete RN style for a (selection × state) cell;
 *     the OPEN primitives + the Arc-2 oracle guard consume it. NO LONGER the
 *     closed-component render path (Arc 2 · D11 · that now LOADS the bake).
 *   · flattenBakedPart — the Arc-2 render path: the same concrete cell, but the
 *     STATIC geometry is LOADED from the build-time bake (generated/data/recipes.ts ·
 *     box/stack/typography/interactive resolved at build · D11+D5) and only the
 *     runtime pieces — colour (theme · Arc 1) + typeStyle expansion + the
 *     interactive state patch — are merged on. See `BakedPartRecipe` below.
 * ══════════════════════════════════════════════════════════════════ */

import type { TextStyle, ViewStyle } from 'react-native';
import {
  space,
  size,
  radius,
  ratio,
  border,
} from '../contract';
import type {
  NS,
  PaletteNS,
  InteractiveNS,
  TypographyNS,
  EffectNS,
  BleedNS,
  PartId,
  El,
  PartAnatomy,
  PartMap,
  Descriptor,
  Axes,
  TypeSize,
} from '../contract';
import type { NuriTheme } from './theme-payload';
// The agnostic namespace→style mapping is DATA, now homed in @nuri/spec
// (resolve-map.ts · N+39 · the decision-68 rn→spec DAG · decision 73 cl.2 / 74);
// this file holds the RN applier that consumes it + the per-target resolver
// registry (RN column). The per-target property NAME comes from the property-
// spelling registry (@nuri/spec/property-spelling · the `.rn` column).
import { STACK_FIELDS, BOX_FIELDS, BLEED_FIELDS } from '@nuri/spec/resolve-map';
import type { Field, FillCase, ScaleName } from '@nuri/spec/resolve-map';
import type { StackNS } from '@nuri/spec/descriptors/schema';
import { PROPERTY_SPELLING } from '@nuri/spec/property-spelling';
import type { CanonicalId } from '@nuri/spec/property-spelling';
// The interactive opt-in mapping is DATA, single-sourced in @nuri/spec (N+44 · the
// one-SoT-two-projections invariant · decision 70/73): the SAME `opts` table the web
// CSS emit + the web factory gate project from. This RN applier projects it into the
// transient state patches (flattenPart · the test oracle · flattenBakedPart · the
// render path) + the baked opt-in partials (buildGeometryRecipe ·
// scripts/parsers/recipes.js) — no hand-written third copy of which opt → which
// prop / trigger / value.
import { opts as INTERACTIVE_OPTS } from '@nuri/spec/interactive-effects';

// Exhaustiveness guard — a new schema namespace / element / fill value that
// the factory does not handle becomes a COMPILE error here, and a runtime
// throw if it ever slips through. This is how the factory proves it consumes
// the WHOLE frozen vocabulary (the consumability the seam must show · R7).
export function assertNever(x: never, what: string): never {
  throw new Error(`nuri-factory: unhandled ${what}: ${JSON.stringify(x)}`);
}

export type Selection = Record<string, string>;
export type State = { pressed?: boolean; disabled?: boolean };

// ── the RN binding of the neutral scale tags (resolve-map.ts) — the per-target
// half of the agnostic emit (web/CSS bind the same tags to their own scale
// repr). The shared table says `from the space scale`; THIS says `space` = the
// numeric scale object. ──
const SCALES: Record<ScaleName, Record<string, number>> = { space, size, radius, ratio };

// Web emits palette strokes as `var(--nuri-border-1) solid <colour>`.
// RN consumes the numeric projection of that same dimension token.
export const PALETTE_BORDER_WIDTH = border[1];

function fillCaseToRn(fill: FillCase): ViewStyle {
  const out: ViewStyle = {
    flexGrow: fill.grow,
    flexShrink: fill.shrink,
  };
  if (fill.basis !== undefined) out.flexBasis = fill.basis;
  if (fill.minInline !== undefined) out.minWidth = fill.minInline;
  if (fill.fitContent) {
    out.alignSelf = 'flex-start';
    out.maxWidth = '100%';
  }
  return out;
}

// childFillStyle · the per-child ViewStyle for a stack `distribute` value — the RN
// twin of the web `.nuri-stack[data-distribute] > *` combinator. The View primitive
// wraps each direct child in a View carrying this. Single-sourced from the same
// DISTRIBUTE table (via STACK_FIELDS) the web CSS emits from, so the two never drift.
export function childFillStyle(distribute: NonNullable<StackNS['distribute']>): ViewStyle {
  const f = STACK_FIELDS.distribute;
  if (f.via !== 'childFill') return {}; // unreachable — the table pins childFill
  return fillCaseToRn(f.cases[distribute]);
}

// applyFields · the GENERIC RN APPLIER for the agnostic namespaces (box · stack).
// Walks the shared mapping table (resolve-map.ts) and emits an RN ViewStyle —
// the per-target EMIT that S3's web resolver replaces while reusing the SAME
// table. ⚠ Iterate the TABLE's keys (its fixed declaration order), NOT the
// input's, so the emit order reproduces the old `resolveStack`/`resolveBox`
// if-walls byte-for-byte (pretty-format keeps key order · the snapshot anchor).
function applyFields(fields: Record<string, Field>, ns: Record<string, unknown>): ViewStyle {
  const out: ViewStyle = {};
  const set = (prop: keyof ViewStyle, value: unknown): void => {
    (out as Record<string, unknown>)[prop] = value;
  };
  // The RN property NAME for a field's canonical id — the property-spelling
  // registry's `.rn` column (single-sourced spelling · decision 73 cl.2). @nuri/spec
  // is RN-free, so `.rn` is a plain string; THIS is the rn boundary that asserts it
  // back to a ViewStyle key (the registry's rn values are real ViewStyle props by
  // construction · the RN snapshots are the oracle that keeps them honest).
  const rnProp = (id: CanonicalId): keyof ViewStyle => PROPERTY_SPELLING[id].rn as keyof ViewStyle;
  for (const key of Object.keys(fields)) {
    const value = ns[key];
    if (value === undefined) continue; // mirrors the old `if (ns.x !== undefined)`
    const f = fields[key];
    switch (f.via) {
      case 'scale':
        set(rnProp(f.prop), SCALES[f.scale][value as string]);
        break;
      case 'negativeScale':
        set(rnProp(f.prop), -SCALES[f.scale][value as string]);
        break;
      case 'scaleMulti':
        for (const prop of f.props) set(rnProp(prop), SCALES[f.scale][value as string]);
        break;
      case 'keyword':
        set(rnProp(f.prop), f.map[value as string]);
        break;
      case 'literal':
        set(rnProp(f.prop), value);
        break;
      case 'flag':
        set(rnProp(f.prop), value ? f.on : f.off);
        break;
      case 'expand':
        Object.assign(out, fillCaseToRn(f.cases[value as string]));
        break;
      case 'childFill':
        // child-affecting (distribute) — NO node style; the per-child flex is
        // injected by the View primitive (childFillStyle), not here.
        // SCOPE (latent): `distribute` is a View-primitive prop today — the
        // hand-authorable <View> (RN) / <nuri-view> (web) wrap their
        // children. NO descriptor sets it, and it is NOT wired through the
        // descriptor→projection paths: the web factory's mergeAttrs would emit
        // data-distribute, but the RN renderer (renderer.tsx) has no distribute
        // branch and would DROP it (this node applier is a no-op). Using it in a
        // descriptor is therefore a deliberate, wired change (renderer child-wrap +
        // factory child-wrap), not a free consequence of adding it to a descriptor.
        break;
      default:
        // a new Field arm without a case is a COMPILE error here (f: never) —
        // the field-kind analogue of the namespace exhaustiveness below.
        return assertNever(f, 'field');
    }
  }
  return out;
}

// Bleed is a standalone layout element, not a descriptor namespace. It still
// rides the same generic Field applier as box/stack so the spec table remains
// the sole attr→style mapping on RN.
export function resolveBleed(ns: BleedNS): ViewStyle {
  return applyFields(BLEED_FIELDS, ns as Record<string, unknown>);
}

// ── palette → colour (theme.surface / theme.chrome · §12 fg-by-scope) ──
export type ResolvedPalette = {
  bg?: string;
  fg?: string;
  fgMuted?: string;
  pressedBg?: string;
  border?: string;
};

function resolvePalette(ns: PaletteNS, theme: NuriTheme): ResolvedPalette {
  // variant wins over chrome (schema: at most one; variant wins).
  if (ns.variant !== undefined) {
    // Read the pre-resolved surface from the payload — NO per-node theme rebuild.
    // A `palette.accent` override (open primitives · <View accent=…>) is honoured
    // UPSTREAM as a NESTED SCOPE (the factory prop-accent + primitives' scopedByAccent
    // establish a NuriScope), so `theme` here is ALREADY the scoped payload. The old
    // `buildNuriTheme(ns.accent, mode)` self-scope rebuild is GONE · SEED-4: one
    // override mechanism (root · scope · prop), never a bespoke per-node rebuild.
    const role = theme.surface[ns.variant];
    return {
      bg: role.bg,
      fg: ns.muted && role.fgMuted !== undefined ? role.fgMuted : role.fg,
      fgMuted: role.fgMuted,
      pressedBg: role.pressedBg,
      border: role.border,
    };
  }
  if (ns.chrome !== undefined) {
    const role = theme.chrome[ns.chrome];
    return { bg: role.bg, fg: ns.muted ? role.fgMuted : role.fg, fgMuted: role.fgMuted };
  }
  if (ns.muted) return { fg: theme.chrome.canvas.fgMuted, fgMuted: theme.chrome.canvas.fgMuted };
  return {}; // palette present but neither variant nor chrome → no colour
}

// ── the resolved typography ref · orthogonal inputs (decision 77 · the N+45
// de-fusion): the `size` step + the `emphasis` boolean become a type ref. `align`
// is text-axis style, mapped explicitly for the current LTR RN runtime. `flow` +
// `lines` stay structured because they map to Text props, not TextStyle. Was a
// single fused TypeKey (`mdEm`); the renderer expands type via typeStyle(size,
// emphasis). ──
export type TypeRef = { size?: TypeSize; emphasis?: boolean; mono?: boolean };
export type TextFlowRef = { flow: 'wrap' } | { flow: 'truncate'; lines: 1 | 2 | 3 };
export type ResolvedStyle = ViewStyle & TextStyle;

const TEXT_ALIGN = {
  center: 'center',
  start: 'left',
  end: 'right',
} satisfies Record<NonNullable<TypographyNS['align']>, NonNullable<TextStyle['textAlign']>>;

const RN_ELEVATION_STYLE = {
  none: {},
  raised: {
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 16,
  },
} satisfies Record<NonNullable<EffectNS['elevation']>, ViewStyle>;

function resolveTypography(typography: TypographyNS | undefined): {
  type?: TypeRef;
  text?: TextStyle;
  textFlow?: TextFlowRef;
} {
  if (!typography) return {};
  const type = typography.size === undefined && !typography.emphasis && !typography.mono
    ? undefined
    : {
        ...(typography.size !== undefined ? { size: typography.size } : {}),
        ...(typography.emphasis ? { emphasis: true } : {}),
        ...(typography.mono ? { mono: true } : {}),
      };
  const text = typography.align === undefined ? undefined : { textAlign: TEXT_ALIGN[typography.align] };
  const textFlow = typography.flow === undefined
    ? undefined
    : typography.flow === 'truncate' && typography.lines !== undefined
      ? { flow: 'truncate' as const, lines: typography.lines }
      : { flow: 'wrap' as const };
  return {
    ...(type !== undefined ? { type } : {}),
    ...(text !== undefined ? { text } : {}),
    ...(textFlow !== undefined ? { textFlow } : {}),
  };
}

// ── the core · resolve a merged NS into the structured node ──────
export type ResolvedNode = {
  view: ViewStyle; // stack + box + palette.bg (NO fg — fg flows by scope)
  text?: TextStyle;
  textFlow?: TextFlowRef;
  fg?: string;
  fgMuted?: string;
  pressedBg?: string;
  type?: TypeRef;
  interactive?: InteractiveNS;
};

// ── the per-target resolver registry (target §6.1 · roadmap §1 · decision 67) ──
// One resolver per namespace, per target. The AGNOSTIC namespaces (stack · box)
// delegate to the shared mapping table via `applyFields`; `typography` ·
// `palette` · `interactive` are BESPOKE RN mechanism (behaviour is the factory's,
// never data · decision 65). Typed TOTAL over `keyof NS`, so a sixth namespace
// without a resolver is a COMPILE error — the `assertNever` exhaustiveness of
// old, now per target (the consumability proof · R7).
type ResolveCtx = { node: ResolvedNode; theme: NuriTheme };
type NSResolver<K extends keyof NS> = (value: NonNullable<NS[K]>, ctx: ResolveCtx) => void;
// `-?` STRIPS the optional modifier NS's keys carry (the mapped type is
// homomorphic — without `-?` every resolver would be optional and the totality
// would NOT bite). With it, a namespace missing from a target column is a
// compile error (verified · S1).
type TargetResolvers = { [K in keyof NS]-?: NSResolver<K> };

const RN_RESOLVERS: TargetResolvers = {
  // agnostic → the shared table + the generic RN emit.
  stack: (v, { node }) => {
    Object.assign(node.view, applyFields(STACK_FIELDS, v));
  },
  box: (v, { node }) => {
    Object.assign(node.view, applyFields(BOX_FIELDS, v));
  },
  // typography → bespoke text style: a type ref ({size, emphasis} · decision
  // 55/77 · the two orthogonal type inputs) plus optional text alignment. The
  // factory expands typeStyle at render; align resolves here to RN TextStyle.
  typography: (v, { node }) => {
    Object.assign(node, resolveTypography(v));
  },
  // palette → BESPOKE (decision 65 · the platform-divergence point: web
  // currentColor / RN threads fg / CSS cascade vars). Logic VERBATIM from the old
  // `palette` case: bg lands on the view, fg/fgMuted/pressedBg are sibling
  // channels (fg flows by SCOPE · §12 · F-BOX-FG-1).
  palette: (v, { node, theme }) => {
    const p = resolvePalette(v, theme);
    if (p.bg !== undefined) node.view.backgroundColor = p.bg;
    if (p.border !== undefined) {
      node.view.borderColor = p.border;
      node.view.borderWidth = PALETTE_BORDER_WIDTH;
    }
    if (p.fg !== undefined) node.fg = p.fg;
    if (p.fgMuted !== undefined) node.fgMuted = p.fgMuted;
    if (p.pressedBg !== undefined) node.pressedBg = p.pressedBg;
  },
  // interactive → BESPOKE (decision 65/65.4): the opt-in is config; HOW
  // (Pressable, the pressed render-prop) is the renderer's. Carry the
  // opt-in onto the node; flattenPart (the test oracle) / flattenBakedPart (the
  // render path) realise it as state.
  interactive: (v, { node }) => {
    node.interactive = v;
  },
  effect: (v, { node }) => {
    if (v.elevation !== undefined) Object.assign(node.view, RN_ELEVATION_STYLE[v.elevation]);
  },
};

// The registry, shaped for the per-target columns S2/S3/§9 add (web runtime ·
// css build-time · §9). S1 populates RN ONLY (roadmap §1/§3 · no speculative
// emit). `satisfies` keeps `.rn` precisely typed (always present) while the
// `Partial<Record<Target, …>>` documents the second-column shape.
type Target = 'rn' | 'web' | 'css';
const RESOLVERS = { rn: RN_RESOLVERS } satisfies Partial<Record<Target, TargetResolvers>>;

export function resolveNS(ns: NS, theme: NuriTheme): ResolvedNode {
  const node: ResolvedNode = { view: {} };
  const ctx: ResolveCtx = { node, theme };
  // Dispatch each PRESENT namespace through the RN column (authored key order ·
  // unchanged from the old forEach, so node.view's key order is byte-identical).
  // The registry is a total map → every schema key has a resolver; a key OUTSIDE
  // the schema (a malformed runtime descriptor) still hits assertNever — the
  // runtime backstop the type cannot see.
  (Object.keys(ns) as (keyof NS)[]).forEach((key) => {
    const resolver = RESOLVERS.rn[key];
    if (!resolver) return assertNever(key as never, 'namespace');
    (resolver as (value: unknown, c: ResolveCtx) => void)(ns[key], ctx);
  });
  return node;
}

// ── merge: base ⊕ each selected axis patch, per part (later wins) ──
// The canonical namespace order the factory merges in. ⚠ ORDER IS LOAD-BEARING:
// mergeNS inserts keys in THIS order, fixing node.view's key order downstream
// (the old 5 hardcoded merges checked stack→box→typography→palette→interactive
// in sequence). The type-level check keeps NS_ORDER TOTAL over keyof NS — a
// sixth namespace must be added here too, else its patch silently skips the
// merge (now a COMPILE error, not a runtime gap).
const NS_ORDER = ['stack', 'box', 'typography', 'palette', 'interactive', 'effect'] as const;
type _NSOrderComplete = Exclude<keyof NS, (typeof NS_ORDER)[number]> extends never ? true : never;
const _nsOrderComplete: _NSOrderComplete = true;
void _nsOrderComplete;

function mergeNS(list: NS[]): NS {
  const out: NS = {};
  for (const ns of list) {
    for (const key of NS_ORDER) {
      const patch = ns[key];
      if (patch) {
        (out as Record<string, object>)[key] = { ...(out as Record<string, object>)[key], ...patch };
      }
    }
  }
  return out;
}

function mergedNSForPart<A extends Axes>(
  descriptor: Descriptor<A>,
  selection: Selection,
  part: PartId,
): NS {
  const maps: NS[] = [];
  const baseNS = descriptor.structure.base?.[part];
  if (baseNS) maps.push(baseNS);
  if (descriptor.variants) {
    for (const axis of Object.keys(descriptor.variants)) {
      const value = selection[axis];
      if (value === undefined) continue;
      const valueMap = (descriptor.variants as Record<string, Record<string, PartMap>>)[axis][value];
      const partNS = valueMap?.[part];
      if (partNS) maps.push(partNS);
    }
  }
  return mergeNS(maps);
}

// ── anatomy → a render tree (structure · un-derivable from CSS · 65.2) ──
export type AnatomyNode<P extends PartId = PartId> = {
  name: P;
  el?: El;
  component?: string;
  props?: Record<string, string | boolean | number | null>;
  open: boolean;
  children: AnatomyNode<P>[];
};

export function resolveAnatomy<A extends Axes>(descriptor: Descriptor<A>): AnatomyNode {
  const walk = (name: PartId, a: PartAnatomy): AnatomyNode => {
    const children: AnatomyNode[] = [];
    if (a.parts) {
      Object.keys(a.parts).forEach((childName) => {
        const childAnatomy = a.parts![childName];
        if (childAnatomy) children.push(walk(childName, childAnatomy));
      });
    }
    return { name, el: a.el, component: a.component, props: a.props, open: !!a.open, children };
  };
  return walk('root', descriptor.structure.anatomy);
}

// ══════════════════════════════════════════════════════════════════
// THE INTERACTIVE OPT-IN APPLIER (the RN projection of the `opts` SoT · N+44)
// ══════════════════════════════════════════════════════════════════
// Walk `opts` (@nuri/spec/interactive-effects) in key order — pressColor → pressScale
// → disabledOpacity, byte-identical to the old hardcoded sequence. Each opt's `rn`
// realization is pure data the appliers interpret (no closures in the SoT):
//   · { prop, from }          → node-derived (pressColor → node.pressedBg · per-variant)
//   · { prop, token, shape? } → the theme constant (decision 45 · scale-wrapped if asked)
// flattenPart (the test oracle) and flattenBakedPart (the render path) apply it as a
// (selection × state) cell patch; the bake (buildGeometryRecipe ·
// scripts/parsers/recipes.js) carries the raw opt-ins through, colour-free.
type OptKey = keyof typeof INTERACTIVE_OPTS;

// OptKey must align with the schema's InteractiveNS — an opt without a schema flag (or
// a schema flag with no opt) is a COMPILE error here (the NS_ORDER-completeness pattern):
// the appliers index node.interactive by an OptKey, so the two must be the same key set.
type _OptKeysMatchSchema =
  [OptKey] extends [keyof InteractiveNS] ? ([keyof InteractiveNS] extends [OptKey] ? true : never) : never;
const _optKeysMatchSchema: _OptKeysMatchSchema = true;
void _optKeysMatchSchema;

// Read a dotted theme path (the opt's `token` · e.g. 'interaction.pressScale').
const readThemePath = (theme: NuriTheme, path: string): unknown =>
  path.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown>)[k], theme);

// Realize a token-arm rn → its RN value: the theme constant, scale-wrapped if asked
// (pressScale → RN's [{ scale: v }] transform · decision 45). The from-arm (pressColor)
// is node-derived → resolved at the call sites (it needs the resolved node / per-variant).
function realizeToken(rn: { token: string; shape?: 'scale' }, theme: NuriTheme): unknown {
  const raw = readThemePath(theme, rn.token);
  return rn.shape === 'scale' ? [{ scale: raw as number }] : raw;
}

// ── flattenInteractive · apply the interactive transients of a RESOLVED node ──
// The (selection × state) → ViewStyle tail of flattenPart, EXTRACTED so the open
// primitive layer (the hand-authorable `Pressable` wrapper · primitives.tsx) reuses
// the SAME opt-in applier the descriptor factory does — one interactive mapping, not
// a second hand-written copy (the single-SoT drift rule · N+44). Both callers pass a
// node from `resolveNS`; the transients realize from the single `opts` SoT.
//
// For each opted-in effect whose trigger fires, realize its rn onto a copy of
// `node.view`: `from` reads the resolved node (pressColor → node.pressedBg · skipped
// when absent, the old `pressedBg !== undefined` guard), `token` reads the theme
// baseline. opts key order (pressColor → pressScale → disabledOpacity) reproduces the
// old if-sequence → byte-identical style key order (the snapshot anchor).
export function flattenInteractive(node: ResolvedNode, theme: NuriTheme, state: State): ResolvedStyle {
  const style: ResolvedStyle = { ...node.view, ...node.text };
  for (const key of Object.keys(INTERACTIVE_OPTS) as OptKey[]) {
    const opt = INTERACTIVE_OPTS[key];
    if (!state[opt.trigger]) continue;
    // A disabled control never shows a PRESSED effect: suppress the press-triggered
    // opts (pressColor · pressScale) when disabled. RN's Pressable already withholds
    // `pressed` while disabled, so this is belt-and-suspenders — but it makes the
    // invariant EXPLICIT + testable, and mirrors the web factory dropping the
    // data-press-* gates on a disabled host (factory C2). disabledOpacity (trigger
    // 'disabled') is unaffected.
    if (opt.trigger === 'pressed' && state.disabled) continue;
    if (!node.interactive?.[key]) continue;
    const value =
      'from' in opt.rn ? (node as Record<string, unknown>)[opt.rn.from] : realizeToken(opt.rn, theme);
    if (value === undefined) continue;
    (style as Record<string, unknown>)[opt.rn.prop] = value;
  }
  return style;
}

// ── flattenPart · the concrete RN style for a (selection × state) cell ──
export type PartFlat = { style: ResolvedStyle; node: ResolvedNode };

export function flattenPart<A extends Axes>(
  descriptor: Descriptor<A>,
  theme: NuriTheme,
  part: PartId,
  selection: Selection,
  state: State,
): PartFlat {
  const ns = mergedNSForPart(descriptor, selection, part);
  const node = resolveNS(ns, theme);
  return { style: flattenInteractive(node, theme, state), node };
}

// ══════════════════════════════════════════════════════════════════
// THE BAKED GEOMETRY RECIPE (Arc 2 · D11 + D5 · the build-time-static slice)
// ══════════════════════════════════════════════════════════════════
// box/stack/typography/interactive are STATIC — a pure function of the descriptor
// + selection, with ZERO theme/state input. Arc 2 BAKES them at build (the codegen
// `scripts/parsers/recipes.js` emits `generated/data/recipes.ts`) so the runtime LOADS
// concrete geometry instead of re-resolving it every render + every press (D11).
// This PROMOTES the old test-only `toUnistylesRecipe` precompute (D5), reshaped
// COLOUR-FREE: the artifact carries NO backgroundColor / fg / pressedBg / hex / any
// accent·mode variant — colour stays the Arc-1 runtime path (`resolvePalette`
// against the theme context), merged on at render (`flattenBakedPart`).
//
// box/stack are baked to CONCRETE ViewStyle; typography + interactive are baked as
// the RAW mergeable namespace PARTIALS (base + per-axis/value), so the runtime merges
// them (mergeNS semantics · later wins) and realizes them through the SAME appliers
// the runtime resolver uses (typeStyle · flattenInteractive). That keeps selection-
// dependent interactivity + emphasis-only typography variants faithful — the bake is
// a rename of WHEN geometry resolves, not a re-encoding of the descriptor semantics.
export type BakedPartRecipe = {
  el: El;
  open?: boolean;
  // box ⊕ stack resolved to concrete ViewStyle (geometry ONLY · no colour). `base`
  // + the per-axis geometry patches; the runtime composes `base ⊕ variants[axis][value]`.
  geometry: { base: ViewStyle; variants: Record<string, Record<string, ViewStyle>> };
  // the RAW typography namespace partial ({ size?, emphasis?, align? }) · base +
  // per-axis/value. Merged at runtime (field-level · later wins) THEN resolved to
  // type/text style (via typeStyle + textAlign · the `× fontScale` seam stays runtime
  // · P11) — so a variant that changes ONLY `emphasis` or `align` over a base `size`
  // composes correctly (not dropped).
  typography?: { base?: TypographyNS; variants?: Record<string, Record<string, TypographyNS>> };
  // the RAW interactive opt-in ({ pressColor?, pressScale?, disabledOpacity? } booleans ·
  // colour-free) · base + per-axis/value. Merged at runtime then realized by the SHARED
  // flattenInteractive — so a variant that opts a node into an effect is honoured (the
  // opt-in is not base-only). NO realized colour here (pressColor's bg is Arc-1 runtime).
  interactive?: { base?: InteractiveNS; variants?: Record<string, Record<string, InteractiveNS>> };
};
export type BakedComponentRecipe = Record<string, BakedPartRecipe>;

// mergedPaletteNSForPart · the part's merged palette NS (base ⊕ each selected axis's
// palette patch · later wins). Colour is the ONE namespace still resolved at runtime
// (Arc 1 · theme context), so the baked render path re-merges JUST palette — a tiny
// object merge, NO geometry re-resolution. Mirrors mergeNS's later-wins semantics.
function mergedPaletteNSForPart<A extends Axes>(
  descriptor: Descriptor<A>,
  selection: Selection,
  part: PartId,
): PaletteNS | undefined {
  let out: PaletteNS | undefined;
  const add = (p?: PaletteNS): void => {
    if (p) out = { ...(out ?? {}), ...p };
  };
  add(descriptor.structure.base?.[part]?.palette);
  if (descriptor.variants) {
    for (const axis of Object.keys(descriptor.variants)) {
      const value = selection[axis];
      if (value === undefined) continue;
      const valueMap = (descriptor.variants as Record<string, Record<string, PartMap>>)[axis][value];
      add(valueMap?.[part]?.palette);
    }
  }
  return out;
}

// composeGeometry · base ⊕ each selected axis's geometry patch (in geometry.variants
// key order · later wins). base + variant geometry touch DISJOINT keys (base = stack ·
// a variant patch = one namespace), and the emitter (recipes.js) ORDERS geometry.variants
// by namespace (NS_ORDER: stack before box), so a stack-contributing variant (button's
// `fill`) lands before a box-contributing one (`size`) — the in-order spread reproduces
// the resolver's namespace key order. Pinned by the key-order guard (geometry-bake test).
function composeGeometry(geometry: BakedPartRecipe['geometry'], selection: Selection): ViewStyle {
  let out: ViewStyle = { ...geometry.base };
  for (const axis of Object.keys(geometry.variants)) {
    const value = selection[axis];
    const patch = value !== undefined ? geometry.variants[axis][value] : undefined;
    if (patch) out = { ...out, ...patch };
  }
  return out;
}

// composeChannel · base ⊕ each selected axis's partial patch (field-level merge ·
// later wins · the mergeNS semantics for a single namespace). Shared by typography +
// interactive, which are both baked as raw mergeable partials.
function composeChannel<T extends Record<string, unknown>>(
  channel: { base?: T; variants?: Record<string, Record<string, T>> } | undefined,
  selection: Selection,
): T | undefined {
  if (!channel) return undefined;
  let ns: T = { ...(channel.base ?? ({} as T)) };
  if (channel.variants) {
    for (const axis of Object.keys(channel.variants)) {
      const value = selection[axis];
      const patch = value !== undefined ? channel.variants[axis][value] : undefined;
      if (patch) ns = { ...ns, ...patch };
    }
  }
  return Object.keys(ns).length ? ns : undefined;
}

// ── flattenBakedPart · the Arc-2 render cell (LOAD the bake · merge colour + state) ──
// The closed-component render path. Composes the baked STATIC geometry, resolves ONLY
// colour at runtime (the Arc-1 theme path · resolvePalette), merges the typography +
// interactive PARTIALS then realizes them through the SAME appliers the runtime
// resolver uses (typeStyle at render · flattenInteractive here). Byte-identical to
// flattenPart's { style, node } (the oracle guard proves it over the full node), but
// WITHOUT re-resolving box/stack/typography every render (D11 retired for closed parts).
export function flattenBakedPart<A extends Axes>(
  recipePart: BakedPartRecipe,
  descriptor: Descriptor<A>,
  theme: NuriTheme,
  part: PartId,
  selection: Selection,
  state: State,
): PartFlat {
  const geometry = composeGeometry(recipePart.geometry, selection);
  const paletteNS = mergedPaletteNSForPart(descriptor, selection, part);
  const p = paletteNS ? resolvePalette(paletteNS, theme) : {};
  const view: ViewStyle = { ...geometry };
  if (p.bg !== undefined) view.backgroundColor = p.bg;
  if (p.border !== undefined) {
    view.borderColor = p.border;
    view.borderWidth = PALETTE_BORDER_WIDTH;
  }
  const typography = resolveTypography(composeChannel<TypographyNS>(recipePart.typography, selection));
  const interactive = composeChannel<InteractiveNS>(recipePart.interactive, selection);
  const node: ResolvedNode = {
    view,
    ...(p.fg !== undefined ? { fg: p.fg } : {}),
    ...(p.fgMuted !== undefined ? { fgMuted: p.fgMuted } : {}),
    ...(p.pressedBg !== undefined ? { pressedBg: p.pressedBg } : {}),
    ...typography,
    ...(interactive !== undefined ? { interactive } : {}),
  };
  // Realize the interactive state patch through the SHARED runtime applier (single
  // source · reads theme.interaction for the token arm + node.pressedBg for pressColor).
  return { style: flattenInteractive(node, theme, state), node };
}
