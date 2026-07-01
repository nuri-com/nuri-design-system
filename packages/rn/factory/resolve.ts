/* ══════════════════════════════════════════════════════════════════
 * NURI · FACTORY · THE GENERIC DESCRIPTOR ENGINE
 * ──────────────────────────────────────────────────────────────────
 * ONE engine, schema-driven (decision 65 · 65.3) — NOT per-component.
 * It interprets the frozen descriptor `{ structure:{anatomy,base}, variants }`
 * by resolving the FIVE disjoint SEMANTIC namespaces (65.3 §6) onto RN:
 *
 *   stack       → flex container       (matches the hand Stack primitive)
 *   box         → sizing · padding · radii   (matches the hand Box primitive)
 *   typography  → a type STEP ref the factory expands via typeStyle (54/55)
 *   palette     → colour via theme.surface / theme.chrome (build/palette.ts)
 *   interactive → press/disabled transients (the structured opt-in · 65.4)
 *
 * Behaviour stays the FACTORY's, the descriptor stays DATA (65): the
 * `interactive` opt-in says WHICH effects; HOW (Pressable, the pressed
 * render-prop) is in createNuriComponent. Colour flows by SCOPE (§12 ·
 * F-BOX-FG-1): a `palette` patch touches the node's bg + provides an fg;
 * descendant text/icon parts INHERIT that fg (never re-threaded as data).
 *
 * Two resolved views, one core (`resolveNS`):
 *   · flattenPart  — the concrete RN style for a (selection × state) cell;
 *     the render path + the parity/snapshot anchor consume this.
 *   · toUnistylesRecipe — the §11 `{ base, variants, compoundVariants }`
 *     form (+ a foreground / typeStep channel for §12), proving the frozen
 *     composition descriptor maps cleanly onto a Unistyles recipe.
 * ══════════════════════════════════════════════════════════════════ */

import type { ViewStyle } from 'react-native';
import {
  space,
  size,
  radius,
  ratio,
} from '../contract';
import type {
  NS,
  PaletteNS,
  InteractiveNS,
  Part,
  El,
  PartAnatomy,
  PartMap,
  Descriptor,
  Axes,
  Accent,
  Theme,
  TypeSize,
} from '../contract';
import type { NuriTheme } from './theme';
import { buildNuriTheme } from './theme';
// The agnostic namespace→style mapping is DATA, now homed in @nuri/spec
// (resolve-map.ts · N+39 · the decision-68 rn→spec DAG · decision 73 cl.2 / 74);
// this file holds the RN applier that consumes it + the per-target resolver
// registry (RN column). The per-target property NAME comes from the property-
// spelling registry (@nuri/spec/property-spelling · the `.rn` column).
import { STACK_FIELDS, BOX_FIELDS } from '@nuri/spec/resolve-map';
import type { Field, ScaleName } from '@nuri/spec/resolve-map';
import { PROPERTY_SPELLING } from '@nuri/spec/property-spelling';
import type { CanonicalId } from '@nuri/spec/property-spelling';
// The interactive opt-in mapping is DATA, single-sourced in @nuri/spec (N+44 · the
// one-SoT-two-projections invariant · decision 70/73): the SAME `opts` table the web
// CSS emit + the web factory gate project from. This RN applier projects it into the
// transient state patches (flattenPart) + the §11 compoundVariants (buildPartRecipe) —
// no hand-written third copy of which opt → which prop / trigger / value.
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
        Object.assign(out, f.cases[value as string]);
        break;
      default:
        // a new Field arm without a case is a COMPILE error here (f: never) —
        // the field-kind analogue of the namespace exhaustiveness below.
        return assertNever(f, 'field');
    }
  }
  return out;
}

// ── palette → colour (theme.surface / theme.chrome · §12 fg-by-scope) ──
export type ResolvedPalette = {
  bg?: string;
  fg?: string;
  fgMuted?: string;
  pressedBg?: string;
};

function resolvePalette(ns: PaletteNS, theme: NuriTheme): ResolvedPalette {
  // variant wins over chrome (schema: at most one; variant wins).
  if (ns.variant !== undefined) {
    // Read the pre-resolved surface from the payload — NO per-node theme rebuild
    // (the old `palette.accent` self-scope `buildNuriTheme(ns.accent, mode)` is
    // GONE · SEED-4: a per-node accent override is a NESTED SCOPE, the ONE
    // override mechanism, not a bespoke whole-theme rebuild · exercised by zero
    // catalog descriptors, so its removal is behaviour-preserving).
    const role = theme.surface[ns.variant];
    return {
      bg: role.bg,
      fg: ns.muted && role.fgMuted !== undefined ? role.fgMuted : role.fg,
      fgMuted: role.fgMuted,
      pressedBg: role.pressedBg,
    };
  }
  if (ns.chrome !== undefined) {
    const role = theme.chrome[ns.chrome];
    return { bg: role.bg, fg: ns.muted ? role.fgMuted : role.fg, fgMuted: role.fgMuted };
  }
  return {}; // palette present but neither variant nor chrome → no colour
}

// ── the resolved typography ref · two ORTHOGONAL inputs (decision 77 · the N+45
// de-fusion): the `size` step + the `emphasis` boolean. Was a single fused TypeKey
// (`mdEm`); createNuriComponent expands it via typeStyle(size, emphasis) at render. ──
export type TypeRef = { size: TypeSize; emphasis?: boolean };

// ── the core · resolve a merged NS into the structured node ──────
export type ResolvedNode = {
  view: ViewStyle; // stack + box + palette.bg (NO fg — fg flows by scope)
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
  // typography → the one agnostic identity that is NOT a ViewStyle prop: a type
  // ref ({size, emphasis} · decision 55/77 · the two orthogonal inputs); the
  // factory expands it via typeStyle at render (mapping = data · expansion =
  // behaviour · 65.2).
  typography: (v, { node }) => {
    if (v.size !== undefined) node.type = v.emphasis ? { size: v.size, emphasis: true } : { size: v.size };
  },
  // palette → BESPOKE (decision 65 · the platform-divergence point: web
  // currentColor / RN threads fg / CSS cascade vars). Logic VERBATIM from the old
  // `palette` case: bg lands on the view, fg/fgMuted/pressedBg are sibling
  // channels (fg flows by SCOPE · §12 · F-BOX-FG-1).
  palette: (v, { node, theme }) => {
    const p = resolvePalette(v, theme);
    if (p.bg !== undefined) node.view.backgroundColor = p.bg;
    if (p.fg !== undefined) node.fg = p.fg;
    if (p.fgMuted !== undefined) node.fgMuted = p.fgMuted;
    if (p.pressedBg !== undefined) node.pressedBg = p.pressedBg;
  },
  // interactive → BESPOKE (decision 65/65.4): the opt-in is config; HOW
  // (Pressable, the pressed render-prop) is createNuriComponent's. Carry the
  // opt-in onto the node; flattenPart/buildPartRecipe realise it as state.
  interactive: (v, { node }) => {
    node.interactive = v;
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
const NS_ORDER = ['stack', 'box', 'typography', 'palette', 'interactive'] as const;
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
  part: Part,
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
export type AnatomyNode = { name: Part; el: El; open: boolean; children: AnatomyNode[] };

export function resolveAnatomy<A extends Axes>(descriptor: Descriptor<A>): AnatomyNode {
  const walk = (name: Part, a: PartAnatomy): AnatomyNode => {
    const children: AnatomyNode[] = [];
    if (a.parts) {
      (Object.keys(a.parts) as Exclude<Part, 'root'>[]).forEach((childName) => {
        const childAnatomy = a.parts![childName];
        if (childAnatomy) children.push(walk(childName, childAnatomy));
      });
    }
    return { name, el: a.el, open: !!a.open, children };
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
// flattenPart applies it as a (selection × state) cell patch; buildPartRecipe lifts it
// into the §11 compoundVariants (pressColor's per-palette-variant loop preserved).
type OptKey = keyof typeof INTERACTIVE_OPTS;
type InteractiveOpt = (typeof INTERACTIVE_OPTS)[OptKey];

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
export function flattenInteractive(node: ResolvedNode, theme: NuriTheme, state: State): ViewStyle {
  const style: ViewStyle = { ...node.view };
  for (const key of Object.keys(INTERACTIVE_OPTS) as OptKey[]) {
    const opt = INTERACTIVE_OPTS[key];
    if (!state[opt.trigger]) continue;
    if (!node.interactive?.[key]) continue;
    const value =
      'from' in opt.rn ? (node as Record<string, unknown>)[opt.rn.from] : realizeToken(opt.rn, theme);
    if (value === undefined) continue;
    (style as Record<string, unknown>)[opt.rn.prop] = value;
  }
  return style;
}

// ── flattenPart · the concrete RN style for a (selection × state) cell ──
export type PartFlat = { style: ViewStyle; node: ResolvedNode };

export function flattenPart<A extends Axes>(
  descriptor: Descriptor<A>,
  theme: NuriTheme,
  part: Part,
  selection: Selection,
  state: State,
): PartFlat {
  const ns = mergedNSForPart(descriptor, selection, part);
  const node = resolveNS(ns, theme);
  return { style: flattenInteractive(node, theme, state), node };
}

// ══════════════════════════════════════════════════════════════════
// THE UNISTYLES-SHAPED RECIPE (resolver-model §11 · the compat proof)
// ══════════════════════════════════════════════════════════════════

export type CompoundVariant = {
  pressed?: boolean;
  disabled?: boolean;
  styles: ViewStyle;
  // axis conditions, e.g. `variant: 'solid'` (computed keys)
  [axis: string]: string | boolean | ViewStyle | undefined;
};

export type PartRecipe = {
  el: El;
  open?: boolean;
  base: ViewStyle;
  variants: Record<string, Record<string, ViewStyle>>;
  compoundVariants: CompoundVariant[];
  // §12 foreground — DELIVERED by surface scope, NOT a style patch (a
  // `palette` variant's fg drops out of the patch · F-BOX-FG-1). Surfaced
  // here as a parallel channel for the snapshot / report, never merged
  // into `variants`.
  foreground?: { base?: string; variants?: Record<string, Record<string, string>> };
  // the label/icon type ref ({size, emphasis} · decision 55/77 · the two
  // orthogonal inputs) the factory expands via typeStyle at render — mapping =
  // data, expansion = behaviour (65.2).
  typeStep?: { base?: TypeRef; variants?: Record<string, Record<string, TypeRef>> };
};

export type ComponentRecipe = Record<string, PartRecipe>;

function hasStyle(s: ViewStyle): boolean {
  return Object.keys(s).length > 0;
}

function buildPartRecipe<A extends Axes>(
  descriptor: Descriptor<A>,
  theme: NuriTheme,
  node: AnatomyNode,
): PartRecipe {
  const part = node.name;
  const baseNS = descriptor.structure.base?.[part] ?? {};
  const baseNode = resolveNS(baseNS, theme);

  const recipe: PartRecipe = {
    el: node.el,
    ...(node.open ? { open: true } : {}),
    base: baseNode.view,
    variants: {},
    compoundVariants: [],
  };

  const fgVariants: Record<string, Record<string, string>> = {};
  const typeVariants: Record<string, Record<string, TypeRef>> = {};
  const paletteAxes: string[] = [];

  if (descriptor.variants) {
    const axes = descriptor.variants as Record<string, Record<string, PartMap>>;
    for (const axis of Object.keys(axes)) {
      const valueMap = axes[axis];
      const axisStyles: Record<string, ViewStyle> = {};
      let axisHasPalette = false;
      for (const value of Object.keys(valueMap)) {
        const partNS = valueMap[value][part];
        if (!partNS) continue;
        const vNode = resolveNS(partNS, theme);
        if (hasStyle(vNode.view)) axisStyles[value] = vNode.view;
        if (vNode.fg !== undefined) {
          if (!fgVariants[axis]) fgVariants[axis] = {};
          fgVariants[axis][value] = vNode.fg;
        }
        if (vNode.type !== undefined) {
          if (!typeVariants[axis]) typeVariants[axis] = {};
          typeVariants[axis][value] = vNode.type;
        }
        if (partNS.palette?.variant !== undefined || partNS.palette?.chrome !== undefined) {
          axisHasPalette = true;
        }
      }
      if (Object.keys(axisStyles).length) recipe.variants[axis] = axisStyles;
      if (axisHasPalette) paletteAxes.push(axis);
    }
  }

  // §12 channels
  if (baseNode.fg !== undefined || Object.keys(fgVariants).length) {
    recipe.foreground = {
      ...(baseNode.fg !== undefined ? { base: baseNode.fg } : {}),
      ...(Object.keys(fgVariants).length ? { variants: fgVariants } : {}),
    };
  }
  if (baseNode.type !== undefined || Object.keys(typeVariants).length) {
    recipe.typeStep = {
      ...(baseNode.type !== undefined ? { base: baseNode.type } : {}),
      ...(Object.keys(typeVariants).length ? { variants: typeVariants } : {}),
    };
  }

  // compoundVariants — the `interactive` opt-in (on this part's base) realised as state
  // patches (65.4 · values engine-derived), projected from the single `opts` SoT (N+44)
  // in key order (pressColor → pressScale → disabledOpacity · byte-identical push order).
  // A `from` opt (pressColor) is node-derived: its pressedBg is variant-dependent → one
  // compound per palette-axis value (the §11 array · the per-variant flattenPart loop,
  // PRESERVED), or a single base compound when no palette axis carries it. A `token` opt
  // (pressScale · disabledOpacity) is one global compound. The trigger ('pressed' /
  // 'disabled') is the compound's condition key.
  const inter = baseNode.interactive;
  for (const key of Object.keys(INTERACTIVE_OPTS) as OptKey[]) {
    const opt = INTERACTIVE_OPTS[key];
    if (!inter?.[key]) continue;
    const cond = opt.trigger;
    if ('from' in opt.rn) {
      const { prop, from } = opt.rn;
      const pushCompound = (derived: unknown, axisCond?: { axis: string; value: string }): void => {
        if (derived === undefined) return;
        const styles: ViewStyle = {};
        (styles as Record<string, unknown>)[prop] = derived;
        const compound = (axisCond ? { [axisCond.axis]: axisCond.value, [cond]: true, styles } : { [cond]: true, styles }) as CompoundVariant;
        recipe.compoundVariants.push(compound);
      };
      if (paletteAxes.length && descriptor.variants) {
        const axes = descriptor.variants as Record<string, Record<string, PartMap>>;
        for (const axis of paletteAxes) {
          for (const value of Object.keys(axes[axis])) {
            const derived = (flattenPart(descriptor, theme, part, { [axis]: value }, {}).node as Record<string, unknown>)[from];
            pushCompound(derived, { axis, value });
          }
        }
      } else {
        pushCompound((baseNode as Record<string, unknown>)[from]);
      }
    } else {
      const styles: ViewStyle = {};
      (styles as Record<string, unknown>)[opt.rn.prop] = realizeToken(opt.rn, theme);
      recipe.compoundVariants.push({ [cond]: true, styles } as CompoundVariant);
    }
  }

  return recipe;
}

// toUnistylesRecipe · the whole component as a per-part Unistyles recipe.
// This IS the resolved style tree (the §11 form) — snapshotted + asserted.
export function toUnistylesRecipe<A extends Axes>(
  descriptor: Descriptor<A>,
  theme: NuriTheme,
): ComponentRecipe {
  const out: ComponentRecipe = {};
  const walk = (node: AnatomyNode) => {
    out[node.name] = buildPartRecipe(descriptor, theme, node);
    node.children.forEach(walk);
  };
  walk(resolveAnatomy(descriptor));
  return out;
}

// Convenience: the resolved theme for a (accent, mode) — the recipe references it.
export function recipeFor<A extends Axes>(
  descriptor: Descriptor<A>,
  accent: Accent,
  mode: Theme,
): ComponentRecipe {
  return toUnistylesRecipe(descriptor, buildNuriTheme(accent, mode));
}
