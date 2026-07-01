/* ══════════════════════════════════════════════════════════════════
 * NURI · FACTORY · THE GEOMETRY-BAKE GUARDS (Arc 2 · D11 + D5)
 * ──────────────────────────────────────────────────────────────────
 * The load-bearing proof that the build-time geometry bake (generated/recipes.ts,
 * consumed by flattenBakedPart) is a FAITHFUL rename of WHEN geometry resolves —
 * byte-identical to the runtime resolver (flattenPart). Three of the brief's five
 * guards live here (the other two — re-emit drift + render snapshots — are the
 * `spec` git-diff gate + render-smoke.test.tsx):
 *
 *   1. ORACLE EQUIVALENCE — for EVERY component × part × axis-selection × state,
 *      the baked path ≡ the runtime resolver (full style · and geometry key-order).
 *      PROVEN TO BIND by mutation (a mutated descriptor cell breaks the equality).
 *   2. NO-COLOUR INVARIANT — the baked artifact contains NO colour key anywhere.
 *   3. KEY-ORDER FIDELITY — Object.keys(bakedGeometry) === Object.keys(runtimeGeometry),
 *      in order (snapshots pretty-format-SORT keys, so this is the ONLY order check).
 *
 * The baked recipes are emitted by a Node applier (scripts/parsers/recipes.js); this
 * guard binds that emit to the TS runtime resolver, so the two appliers cannot drift.
 * ══════════════════════════════════════════════════════════════════ */

import { buildNuriTheme } from '../theme';
import { flattenPart, flattenBakedPart } from '../resolve';
import { recipes } from '../../generated/recipes';
import {
  buttonDescriptor,
  iconAvatarDescriptor,
  topbarDescriptor,
  iconButtonDescriptor,
  tabBarItemDescriptor,
  tabBarDescriptor,
} from '../../contract';
import type { Descriptor, Axes, Part } from '../../contract';

// The roster, paired with its baked recipe (mirrors the factory bindings). The
// oracle iterates this — every catalog component, incl. the COMPOUND (Topbar
// regions) + the open-positional (TabBar) shells.
const CATALOG: { name: string; descriptor: Descriptor<Axes> }[] = [
  { name: 'button', descriptor: buttonDescriptor as Descriptor<Axes> },
  { name: 'icon-avatar', descriptor: iconAvatarDescriptor as Descriptor<Axes> },
  { name: 'topbar', descriptor: topbarDescriptor as Descriptor<Axes> },
  { name: 'icon-button', descriptor: iconButtonDescriptor as Descriptor<Axes> },
  { name: 'tab-bar-item', descriptor: tabBarItemDescriptor as Descriptor<Axes> },
  { name: 'tab-bar', descriptor: tabBarDescriptor as Descriptor<Axes> },
];

// The colour keys the baked artifact must NEVER carry (guard #2) — also the keys
// stripped to isolate GEOMETRY for the key-order check (guard #3).
const COLOUR_KEYS = new Set([
  'backgroundColor',
  'color',
  'borderColor',
  'borderTopColor',
  'borderBottomColor',
  'borderLeftColor',
  'borderRightColor',
  'borderStartColor',
  'borderEndColor',
  'shadowColor',
  'textDecorationColor',
]);

const stripColour = (style: Record<string, unknown>): Record<string, unknown> => {
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(style)) if (!COLOUR_KEYS.has(k)) out[k] = style[k];
  return out;
};

// The full axis-value product for a descriptor (axes are small — the brief warns
// NOT to assume independence, so this is the CROSS-PRODUCT, not a per-axis sweep).
function selections(descriptor: Descriptor<Axes>): Record<string, string>[] {
  const axes = descriptor.variants ? Object.keys(descriptor.variants) : [];
  let acc: Record<string, string>[] = [{}];
  for (const axis of axes) {
    const values = Object.keys((descriptor.variants as Record<string, Record<string, unknown>>)[axis]);
    const next: Record<string, string>[] = [];
    for (const sel of acc) for (const value of values) next.push({ ...sel, [axis]: value });
    acc = next;
  }
  return acc;
}

const STATES = [{}, { pressed: true }, { disabled: true }] as const;
// Two orthogonal addresses — proves the geometry is theme-INVARIANT (identical
// across accent × mode) while colour is not (the merge still resolves per theme).
const THEMES = [buildNuriTheme('lilac', 'light'), buildNuriTheme('neutral', 'dark')] as const;

describe('geometry bake · guard 1 — ORACLE EQUIVALENCE (baked ≡ runtime resolver · full product)', () => {
  for (const { name, descriptor } of CATALOG) {
    const recipe = recipes[name];
    test(`${name} · baked flattenBakedPart ≡ runtime flattenPart, every part × selection × state × theme`, () => {
      const parts = Object.keys(recipe);
      let cells = 0;
      for (const theme of THEMES) {
        for (const part of parts) {
          for (const selection of selections(descriptor)) {
            for (const state of STATES) {
              const runtime = flattenPart(descriptor, theme, part as Part, selection, state).style as Record<string, unknown>;
              const baked = flattenBakedPart(recipe[part], descriptor, theme, part as Part, selection, state).style as Record<string, unknown>;
              // full equivalence (values · colour merge included · order-insensitive)
              expect(baked).toEqual(runtime);
              // GEOMETRY key-order fidelity (guard #3) — palette stripped, order-SENSITIVE
              expect(Object.keys(stripColour(baked))).toEqual(Object.keys(stripColour(runtime)));
              cells++;
            }
          }
        }
      }
      expect(cells).toBeGreaterThan(0);
    });
  }
});

describe('geometry bake · guard 1 BINDS — mutation proof (a stale bake WOULD fail)', () => {
  test('mutating one descriptor box cell breaks the baked ≡ runtime equality', () => {
    const theme = buildNuriTheme('lilac', 'light');
    const selection = { variant: 'solid', size: 'md' };
    // The baked path for Button root at md — the shipped artifact.
    const baked = flattenBakedPart(recipes['button'].root, buttonDescriptor, theme, 'root', selection, {}).style;

    // A MUTATED descriptor: change size.md.box.minHeight 'lg' → 'xl'. The runtime
    // resolver now diverges from the (unmutated) bake — proving the oracle is
    // sensitive to the actual descriptor geometry, not vacuously equal.
    const mutated = JSON.parse(JSON.stringify(buttonDescriptor)) as typeof buttonDescriptor;
    (mutated.variants as { size: Record<string, { root: { box: { minHeight: string } } }> }).size.md.root.box.minHeight = 'xl';
    const mutatedRuntime = flattenPart(mutated, theme, 'root', selection, {}).style;

    expect(mutatedRuntime).not.toEqual(baked);
    // and the unmutated runtime still matches (control) — the divergence is the mutation's.
    expect(flattenPart(buttonDescriptor, theme, 'root', selection, {}).style).toEqual(baked);
  });
});

describe('geometry bake · guard 2 — NO-COLOUR INVARIANT (the artifact is colour-free)', () => {
  test('no colour key appears anywhere in generated/recipes.ts', () => {
    const offenders: string[] = [];
    const walk = (value: unknown, path: string): void => {
      if (Array.isArray(value)) {
        value.forEach((v, i) => walk(v, `${path}[${i}]`));
      } else if (value && typeof value === 'object') {
        for (const key of Object.keys(value as Record<string, unknown>)) {
          if (COLOUR_KEYS.has(key)) offenders.push(`${path}.${key}`);
          walk((value as Record<string, unknown>)[key], `${path}.${key}`);
        }
      }
    };
    walk(recipes, 'recipes');
    expect(offenders).toEqual([]);
  });

  test('no hex / rgb colour literal appears as a value anywhere', () => {
    const hexish: string[] = [];
    const walk = (value: unknown, path: string): void => {
      if (typeof value === 'string' && /^#|rgba?\(/.test(value)) hexish.push(`${path} = ${value}`);
      else if (Array.isArray(value)) value.forEach((v, i) => walk(v, `${path}[${i}]`));
      else if (value && typeof value === 'object') {
        for (const key of Object.keys(value as Record<string, unknown>)) walk((value as Record<string, unknown>)[key], `${path}.${key}`);
      }
    };
    walk(recipes, 'recipes');
    expect(hexish).toEqual([]);
  });
});

describe('geometry bake · coverage — every roster component has a baked recipe', () => {
  test('recipes covers the full catalog (no silent gap)', () => {
    for (const { name } of CATALOG) {
      expect(recipes[name]).toBeDefined();
      expect(Object.keys(recipes[name]).length).toBeGreaterThan(0);
    }
  });
});
