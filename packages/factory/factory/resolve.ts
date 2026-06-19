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
} from '../contract';
import type {
  NS,
  StackNS,
  BoxNS,
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
} from '../contract';
import type { TypeKey } from '../theme';
import type { NuriTheme } from './theme';
import { buildNuriTheme } from './theme';

// Exhaustiveness guard — a new schema namespace / element / fill value that
// the factory does not handle becomes a COMPILE error here, and a runtime
// throw if it ever slips through. This is how the factory proves it consumes
// the WHOLE frozen vocabulary (the consumability the seam must show · R7).
export function assertNever(x: never, what: string): never {
  throw new Error(`nuri-factory: unhandled ${what}: ${JSON.stringify(x)}`);
}

export type Selection = Record<string, string>;
export type State = { pressed?: boolean; disabled?: boolean };

// ── stack → flex (the canonical mappings · mirrors the hand Stack) ──
const ALIGN: Record<NonNullable<StackNS['align']>, ViewStyle['alignItems']> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
  baseline: 'baseline',
};
const JUSTIFY: Record<NonNullable<StackNS['justify']>, ViewStyle['justifyContent']> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
};

function resolveFill(fill: NonNullable<StackNS['fill']>): ViewStyle {
  switch (fill) {
    // `grow` = grow to fill, do NOT shrink below content (web flex:1 0 auto ·
    // the hand Stack's boolean `fill`).
    case 'grow':
      return { flexGrow: 1, flexShrink: 0 };
    // `grow-shrink` = the Topbar content-pivot (web flex:1 1 auto +
    // min-inline-size:0 · schema §6 / B1.5 §3) — grow AND shrink past content.
    case 'grow-shrink':
      return { flexGrow: 1, flexShrink: 1, minWidth: 0 };
    default:
      return assertNever(fill, 'stack.fill');
  }
}

function resolveStack(ns: StackNS): ViewStyle {
  const s: ViewStyle = {};
  if (ns.direction !== undefined) s.flexDirection = ns.direction;
  if (ns.align !== undefined) s.alignItems = ALIGN[ns.align];
  if (ns.justify !== undefined) s.justifyContent = JUSTIFY[ns.justify];
  if (ns.gap !== undefined) s.gap = space[ns.gap];
  if (ns.wrap !== undefined) s.flexWrap = ns.wrap ? 'wrap' : 'nowrap';
  if (ns.fill !== undefined) Object.assign(s, resolveFill(ns.fill));
  return s;
}

// ── box → sizing · padding · radii (geometry only · 65.3 §6 · no colour) ──
function resolveBox(ns: BoxNS): ViewStyle {
  const s: ViewStyle = {};
  if (ns.width !== undefined) s.width = size[ns.width];
  if (ns.height !== undefined) s.height = size[ns.height];
  if (ns.minHeight !== undefined) s.minHeight = size[ns.minHeight];
  if (ns.padding !== undefined) s.padding = space[ns.padding];
  if (ns.paddingX !== undefined) s.paddingHorizontal = space[ns.paddingX];
  if (ns.paddingY !== undefined) s.paddingVertical = space[ns.paddingY];
  if (ns.paddingStart !== undefined) s.paddingStart = space[ns.paddingStart];
  if (ns.paddingEnd !== undefined) s.paddingEnd = space[ns.paddingEnd];
  if (ns.paddingTop !== undefined) s.paddingTop = space[ns.paddingTop];
  if (ns.paddingBottom !== undefined) s.paddingBottom = space[ns.paddingBottom];
  if (ns.radius !== undefined) s.borderRadius = radius[ns.radius];
  return s;
}

// ── palette → colour (theme.surface / theme.chrome · §12 fg-by-scope) ──
export type ResolvedPalette = {
  bg?: string;
  fg?: string;
  fgMuted?: string;
  pressedBg?: string;
};

function resolvePalette(ns: PaletteNS, theme: NuriTheme, mode: Theme): ResolvedPalette {
  // variant wins over chrome (schema: at most one; variant wins).
  if (ns.variant !== undefined) {
    // `palette.accent` is a per-node self-scope (re-resolve the surface under
    // that accent · decision 27/62). None of the three frozen descriptors use
    // it, but the engine handles it for completeness.
    const t = ns.accent !== undefined ? buildNuriTheme(ns.accent, mode) : theme;
    const role = t.surface[ns.variant];
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

// ── the core · resolve a merged NS into the structured node ──────
export type ResolvedNode = {
  view: ViewStyle; // stack + box + palette.bg (NO fg — fg flows by scope)
  fg?: string;
  fgMuted?: string;
  pressedBg?: string;
  typeKey?: TypeKey;
  interactive?: InteractiveNS;
};

export function resolveNS(ns: NS, theme: NuriTheme, mode: Theme): ResolvedNode {
  const node: ResolvedNode = { view: {} };
  // Iterate the present namespace keys and dispatch EXHAUSTIVELY — a sixth
  // namespace added to the frozen schema would hit assertNever (65.3 §6 says
  // the five are disjoint; this is where the factory consumes exactly them).
  (Object.keys(ns) as (keyof NS)[]).forEach((key) => {
    switch (key) {
      case 'stack':
        Object.assign(node.view, resolveStack(ns.stack as StackNS));
        break;
      case 'box':
        Object.assign(node.view, resolveBox(ns.box as BoxNS));
        break;
      case 'typography':
        if (ns.typography!.size !== undefined) node.typeKey = ns.typography!.size;
        break;
      case 'palette': {
        const p = resolvePalette(ns.palette as PaletteNS, theme, mode);
        if (p.bg !== undefined) node.view.backgroundColor = p.bg;
        if (p.fg !== undefined) node.fg = p.fg;
        if (p.fgMuted !== undefined) node.fgMuted = p.fgMuted;
        if (p.pressedBg !== undefined) node.pressedBg = p.pressedBg;
        break;
      }
      case 'interactive':
        node.interactive = ns.interactive;
        break;
      default:
        return assertNever(key, 'namespace');
    }
  });
  return node;
}

// ── merge: base ⊕ each selected axis patch, per part (later wins) ──
function mergeNS(list: NS[]): NS {
  const out: NS = {};
  for (const ns of list) {
    if (ns.stack) out.stack = { ...out.stack, ...ns.stack };
    if (ns.box) out.box = { ...out.box, ...ns.box };
    if (ns.typography) out.typography = { ...out.typography, ...ns.typography };
    if (ns.palette) out.palette = { ...out.palette, ...ns.palette };
    if (ns.interactive) out.interactive = { ...out.interactive, ...ns.interactive };
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

// ── flattenPart · the concrete RN style for a (selection × state) cell ──
export type PartFlat = { style: ViewStyle; node: ResolvedNode };

export function flattenPart<A extends Axes>(
  descriptor: Descriptor<A>,
  theme: NuriTheme,
  mode: Theme,
  part: Part,
  selection: Selection,
  state: State,
): PartFlat {
  const ns = mergedNSForPart(descriptor, selection, part);
  const node = resolveNS(ns, theme, mode);
  const style: ViewStyle = { ...node.view };
  // Interactive transients — the factory's, gated by the opt-in (65.4):
  //   pressColor → swap to the node's own variant pressedBg
  //   pressScale → transform scale (the interaction baseline)
  //   disabledOpacity → opacity (the interaction baseline)
  if (state.pressed && node.interactive?.pressColor && node.pressedBg !== undefined) {
    style.backgroundColor = node.pressedBg;
  }
  if (state.pressed && node.interactive?.pressScale) {
    style.transform = [{ scale: theme.interaction.pressScale }];
  }
  if (state.disabled && node.interactive?.disabledOpacity) {
    style.opacity = theme.interaction.disabledOpacity;
  }
  return { style, node };
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
  // the label/icon type STEP (a named ref · decision 55) the factory expands
  // via typeStyle at render — mapping = data, expansion = behaviour (65.2).
  typeStep?: { base?: TypeKey; variants?: Record<string, Record<string, TypeKey>> };
};

export type ComponentRecipe = Record<string, PartRecipe>;

function hasStyle(s: ViewStyle): boolean {
  return Object.keys(s).length > 0;
}

function buildPartRecipe<A extends Axes>(
  descriptor: Descriptor<A>,
  theme: NuriTheme,
  mode: Theme,
  node: AnatomyNode,
): PartRecipe {
  const part = node.name;
  const baseNS = descriptor.structure.base?.[part] ?? {};
  const baseNode = resolveNS(baseNS, theme, mode);

  const recipe: PartRecipe = {
    el: node.el,
    ...(node.open ? { open: true } : {}),
    base: baseNode.view,
    variants: {},
    compoundVariants: [],
  };

  const fgVariants: Record<string, Record<string, string>> = {};
  const typeVariants: Record<string, Record<string, TypeKey>> = {};
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
        const vNode = resolveNS(partNS, theme, mode);
        if (hasStyle(vNode.view)) axisStyles[value] = vNode.view;
        if (vNode.fg !== undefined) {
          if (!fgVariants[axis]) fgVariants[axis] = {};
          fgVariants[axis][value] = vNode.fg;
        }
        if (vNode.typeKey !== undefined) {
          if (!typeVariants[axis]) typeVariants[axis] = {};
          typeVariants[axis][value] = vNode.typeKey;
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
  if (baseNode.typeKey !== undefined || Object.keys(typeVariants).length) {
    recipe.typeStep = {
      ...(baseNode.typeKey !== undefined ? { base: baseNode.typeKey } : {}),
      ...(Object.keys(typeVariants).length ? { variants: typeVariants } : {}),
    };
  }

  // compoundVariants — the `interactive` opt-in (on this part's base) realised
  // as state patches (65.4 · the values engine-derived). pressColor's pressedBg
  // is variant-dependent → one compound per palette-axis value (the §11 array).
  const inter = baseNode.interactive;
  if (inter?.pressColor) {
    if (paletteAxes.length && descriptor.variants) {
      const axes = descriptor.variants as Record<string, Record<string, PartMap>>;
      for (const axis of paletteAxes) {
        for (const value of Object.keys(axes[axis])) {
          const pressedBg = flattenPart(descriptor, theme, mode, part, { [axis]: value }, {}).node.pressedBg;
          if (pressedBg !== undefined) {
            recipe.compoundVariants.push({ [axis]: value, pressed: true, styles: { backgroundColor: pressedBg } });
          }
        }
      }
    } else if (baseNode.pressedBg !== undefined) {
      recipe.compoundVariants.push({ pressed: true, styles: { backgroundColor: baseNode.pressedBg } });
    }
  }
  if (inter?.pressScale) {
    recipe.compoundVariants.push({ pressed: true, styles: { transform: [{ scale: theme.interaction.pressScale }] } });
  }
  if (inter?.disabledOpacity) {
    recipe.compoundVariants.push({ disabled: true, styles: { opacity: theme.interaction.disabledOpacity } });
  }

  return recipe;
}

// toUnistylesRecipe · the whole component as a per-part Unistyles recipe.
// This IS the resolved style tree (the §11 form) — snapshotted + asserted.
export function toUnistylesRecipe<A extends Axes>(
  descriptor: Descriptor<A>,
  theme: NuriTheme,
  mode: Theme,
): ComponentRecipe {
  const out: ComponentRecipe = {};
  const walk = (node: AnatomyNode) => {
    out[node.name] = buildPartRecipe(descriptor, theme, mode, node);
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
  return toUnistylesRecipe(descriptor, buildNuriTheme(accent, mode), mode);
}
