/* ══════════════════════════════════════════════════════════════════
 * NURI · PRIMITIVES · shared internals of the primitive layer
 * ──────────────────────────────────────────────────────────────────
 * The ns bucketing + the one resolution hook + the scope helpers every
 * primitive file composes. The layer contract (what a primitive IS, the
 * drift rule, colour by scope) is documented on ./index.ts.
 * ══════════════════════════════════════════════════════════════════ */

import * as React from 'react';
import { View as RNView } from 'react-native';
import type { ViewStyle } from 'react-native';
import type { NS, Accent, StackNS } from '../contract';
import { useNuriTheme, NuriScope } from '../theme';
import type { NuriTheme } from '../runtime/theme-payload';
import { childFillStyle, resolveNS } from '../runtime/resolve';
import type { ResolvedNode } from '../runtime/resolve';
import { NuriSurfaceContext } from '../runtime/renderer';
import { STACK_FIELDS, BOX_FIELDS } from '@nuri/spec/resolve-map';
import { opts as INTERACTIVE_OPTS } from '@nuri/spec/interactive-effects';
import { PALETTE_KEYS, TYPOGRAPHY_KEYS, EFFECT_KEYS } from '@nuri/spec/descriptors/schema';

// ── the per-namespace RUNTIME key tables (the schema-derived SoT · ONE per ns) ──
// box/stack/interactive come STRAIGHT from the shared mapping tables (the same
// the appliers walk); palette/typography from the schema's own runtime key lists
// (PALETTE_KEYS/TYPOGRAPHY_KEYS · totality-pinned at the source · @nuri/spec). No
// key set is hand-listed here. ⚠ The grab order below matches NS_ORDER (stack →
// box → typography → palette → interactive) so a merged node's style key order is
// identical to the factory's.
export const STACK_KEYS = Object.keys(STACK_FIELDS);
export const BOX_KEYS = Object.keys(BOX_FIELDS);
export const INTERACTIVE_KEYS = Object.keys(INTERACTIVE_OPTS);

// pickNS · bucket flat props into the merged NS by key membership. A
// classification (which namespace owns a key), NOT a style mapping — the style
// resolution stays entirely in resolveNS. The namespace input keys are disjoint
// across the five (schema §6 · verified), so a flat prop lands in exactly one
// bucket. Insertion order = NS_ORDER (the factory's merge order).
function pickNS(props: Record<string, unknown>): NS {
  const ns: NS = {};
  const grab = (keys: string[], slot: keyof NS): void => {
    let obj: Record<string, unknown> | undefined;
    for (const k of keys) if (props[k] !== undefined) (obj ??= {})[k] = props[k];
    if (obj) (ns as Record<string, unknown>)[slot] = obj;
  };
  grab(STACK_KEYS, 'stack');
  grab(BOX_KEYS, 'box');
  grab(TYPOGRAPHY_KEYS, 'typography');
  grab(PALETTE_KEYS, 'palette');
  grab(INTERACTIVE_KEYS, 'interactive');
  grab(EFFECT_KEYS, 'effect');
  return ns;
}

// useResolvedNode · the one resolution path every painting primitive shares.
// Reads the RESOLVED payload from context (Option B · SEED-4 · no per-primitive
// `buildNuriTheme` rebuild) + the ambient surface fg, and resolves the bucketed
// namespaces through resolveNS. An `accent` palette prop is handled OUTSIDE, by
// scopedByAccent (a NuriScope wrapper), so the payload read here is ALREADY the
// correctly-scoped theme — resolvePalette never re-resolves an accent.
export function useResolvedNode(nsProps: Record<string, unknown>): {
  node: ResolvedNode;
  fg: string | undefined;
  theme: NuriTheme;
} {
  const theme = useNuriTheme();
  const ambient = React.useContext(NuriSurfaceContext);
  const node = resolveNS(pickNS(nsProps), theme);
  return { node, fg: node.fg ?? ambient.foreground, theme };
}

// A primitive carries its NAMESPACE prop-key list as a runtime array — the
// parity gate (contract §3.3a) reads it to assert web-ATTRS ≡ RN-props ≡
// schema-NS-keys without trusting a hand list.
type Primitive<P> = React.FC<P> & { propKeys: readonly string[] };

export const withKeys = <P,>(component: React.FC<P>, propKeys: readonly string[]): Primitive<P> => {
  const c = component as Primitive<P>;
  c.propKeys = propKeys;
  return c;
};

// scopedByAccent · a painting primitive whose palette carries an `accent`
// establishes a NuriScope for it — the SAME "accent = nested scope" mechanism the
// factory prop-accent uses (runtime/renderer.tsx) — so the SCOPED payload reaches
// resolvePalette. Without it, the dropped `resolvePalette` self-scope would
// silently paint the AMBIENT accent (the ns.accent field is now honoured by the
// scope, never a per-node buildNuriTheme rebuild). No accent → no wrapper (the
// Impl reads the ambient payload · snapshots for accent-less primitives unchanged).
export function scopedByAccent<P extends { accent?: Accent }>(Impl: React.FC<P>): React.FC<P> {
  const Scoped: React.FC<P> = (props) =>
    props.accent !== undefined ? (
      <NuriScope accent={props.accent}>
        <Impl {...props} />
      </NuriScope>
    ) : (
      <Impl {...props} />
    );
  Scoped.displayName = Impl.displayName;
  return Scoped;
}

// §12 — wrap children in the surface-fg provider when this node resolves an fg,
// so descendant Text/Icon inherit it (the factory's colour-by-scope · reused).
export function withSurface(fg: string | undefined, children: React.ReactNode): React.ReactNode {
  return fg !== undefined ? (
    <NuriSurfaceContext.Provider value={{ foreground: fg }}>{children}</NuriSurfaceContext.Provider>
  ) : (
    children
  );
}

// `distribute` is child-affecting (no node style · the childFill no-op). RN has no
// `> *` combinator, so wrap each DIRECT child in a flex View carrying the per-child
// style — the projection of the web child combinator (equal shares of the axis).
// PARITY EDGE (latent): React.Children.map wraps each ELEMENT, so a Fragment child
// (`<>…</>`) becomes ONE even cell — unlike web `> *`, where a fragment has no DOM
// node and its members are the direct children (each its own cell). Author FLAT
// children under a distribute container (no fragment grouping) to keep the two aligned.
export function wrapDistributedChildren(
  distribute: StackNS['distribute'],
  children: React.ReactNode,
): React.ReactNode {
  if (distribute === undefined) return children;
  const childStyle = childFillStyle(distribute);
  return React.Children.map(children, (child) =>
    child === null || child === undefined || child === false || child === true
      ? child
      : <RNView style={childStyle}>{child}</RNView>,
  );
}

// The structural flex-column fill Screen + Scroll share.
export const SCREEN_STYLE: ViewStyle = { flex: 1 };

export const FIXED_REGION_STYLE_KEYS = [
  'chrome',
  'direction',
  'align',
  'justify',
  'gap',
  'paddingX',
  'paddingY',
  'paddingTop',
  'paddingBottom',
] as const;

export function numericPadding(
  style: ViewStyle,
  key: 'paddingTop' | 'paddingBottom' | 'paddingVertical',
): number {
  const value = style[key];
  return typeof value === 'number' ? value : 0;
}
