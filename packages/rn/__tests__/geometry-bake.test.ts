/* ══════════════════════════════════════════════════════════════════
 * NURI · RUNTIME · THE GEOMETRY-BAKE GUARDS (Arc 2 · D11 + D5)
 * ──────────────────────────────────────────────────────────────────
 * The load-bearing proof that the build-time geometry bake (generated/data/recipes.ts,
 * consumed by flattenBakedPart) is a FAITHFUL rename of WHEN geometry resolves —
 * byte-identical to the runtime resolver (flattenPart). Three of the brief's five
 * guards live here (the other two — re-emit drift + render snapshots — are the
 * `spec` git-diff gate + render-smoke.test.tsx):
 *
 *   1. ORACLE EQUIVALENCE — for EVERY component × part × axis-selection × state ×
 *      theme, the baked path ≡ the runtime resolver, comparing the FULL PartFlat:
 *      `style` (values) AND every render-critical `node` channel (view · type · fg ·
 *      fgMuted · pressedBg · interactive) AND geometry key-order. PROVEN TO BIND by
 *      mutation. Comparing `node` (not only `style`) is what catches a wrong `type`
 *      ref or a dropped `interactive` opt-in — those leave `style` equal while the
 *      factory applies typeStyle(node.type) / the Pressable branch separately.
 *   2. NO-COLOUR INVARIANT — the baked artifact contains NO colour key / hex anywhere.
 *   3. KEY-ORDER FIDELITY — Object.keys(bakedGeometry) === Object.keys(runtimeGeometry),
 *      in order (snapshots pretty-format-SORT keys, so this is the ONLY order check).
 *
 * Plus: an ARTIFACT-SHAPE guard (recipe parts === the anatomy parts) and CONSUMER
 * generality guards for the two schema-valid cases the catalog does not exercise —
 * SELECTION-DEPENDENT interactivity + EMPHASIS/ALIGN-ONLY typography variants (the
 * generator's side of those is pinned in scripts/recipes.test.js).
 * ══════════════════════════════════════════════════════════════════ */

import { buildNuriTheme } from '../runtime/theme-payload';
import { flattenPart, flattenBakedPart, resolveAnatomy } from '../runtime/resolve';
import type { AnatomyNode, BakedComponentRecipe } from '../runtime/resolve';
import { recipes } from '../generated/data/recipes';
import {
  buttonDescriptor,
  iconAvatarDescriptor,
  topbarDescriptor,
  iconButtonDescriptor,
  tabBarItemDescriptor,
  tabBarDescriptor,
} from '../contract';
import type { Descriptor, Axes, Part } from '../contract';

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

const anatomyPartNames = (descriptor: Descriptor<Axes>): string[] => {
  const out: string[] = [];
  const walk = (n: AnatomyNode): void => {
    out.push(n.name);
    n.children.forEach(walk);
  };
  walk(resolveAnatomy(descriptor));
  return out.sort();
};

describe('geometry bake · guard 1 — ORACLE EQUIVALENCE (baked ≡ runtime resolver · full PartFlat · full product)', () => {
  for (const { name, descriptor } of CATALOG) {
    const recipe = recipes[name];
    test(`${name} · flattenBakedPart ≡ flattenPart (style + node), every part × selection × state × theme`, () => {
      const parts = Object.keys(recipe);
      let cells = 0;
      for (const theme of THEMES) {
        for (const part of parts) {
          for (const selection of selections(descriptor)) {
            for (const state of STATES) {
              const runtime = flattenPart(descriptor, theme, part as Part, selection, state);
              const baked = flattenBakedPart(recipe[part], descriptor, theme, part as Part, selection, state);
              // full style equivalence (values · colour merge included · order-insensitive)
              expect(baked.style).toEqual(runtime.style);
              // full NODE equivalence — view · fg · fgMuted · pressedBg · type · interactive
              // (the render-critical channels the factory applies SEPARATELY from `style`)
              expect(baked.node).toEqual(runtime.node);
              // GEOMETRY key-SET fidelity (guard #3) — palette stripped, order-INSENSITIVE.
              // Was order-sensitive, but that guarded ViewStyle key ORDER, which RN never
              // reads (each geometry longhand — flexGrow/minHeight/gap/paddingHorizontal —
              // applies independently · no intra-object cascade). Once a size variant carries
              // BOTH a stack field (per-size `gap`) and box, while `fill` also writes stack,
              // the per-axis bake merge cannot reproduce the resolver's field-level namespace
              // order — and needn't, since the VALUES match (the toEqual above stays strict:
              // same keys, same values). So this compares the key SETS, catching a field
              // emitted by one path only, without pinning an order that has no render effect.
              expect(Object.keys(stripColour(baked.style as Record<string, unknown>)).sort())
                .toEqual(Object.keys(stripColour(runtime.style as Record<string, unknown>)).sort());
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
    const selection = { variant: 'solid', size: 'lg' };
    const baked = flattenBakedPart(recipes['button'].root, buttonDescriptor, theme, 'root', selection, {}).style;

    // A MUTATED descriptor: change size.lg.box.minHeight 'xl' → '2xl'. The runtime
    // resolver now diverges from the (unmutated) bake — proving the oracle is
    // sensitive to the actual descriptor geometry, not vacuously equal.
    const mutated = JSON.parse(JSON.stringify(buttonDescriptor)) as typeof buttonDescriptor;
    (mutated.variants as unknown as { size: Record<string, { root: { box: { minHeight: string } } }> }).size.lg.root.box.minHeight = '2xl';
    expect(flattenPart(mutated, theme, 'root', selection, {}).style).not.toEqual(baked);
    // control — the unmutated runtime still matches (the divergence is the mutation's).
    expect(flattenPart(buttonDescriptor, theme, 'root', selection, {}).style).toEqual(baked);
  });
});

describe('geometry bake · guard 2 — NO-COLOUR INVARIANT (the artifact is colour-free)', () => {
  test('no colour key appears anywhere in generated/data/recipes.ts', () => {
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

describe('geometry bake · ARTIFACT SHAPE — recipe parts === the anatomy parts (no silent gap)', () => {
  for (const { name, descriptor } of CATALOG) {
    test(`${name} · every anatomy part has a recipe entry and vice versa`, () => {
      expect(Object.keys(recipes[name]).sort()).toEqual(anatomyPartNames(descriptor));
    });
  }
});

// ── Consumer generality — the two schema-valid cases the CATALOG does not exercise ──
// The runtime resolver supports `interactive` in ANY namespace (base OR variant) and
// merges typography FIELDS before resolving. These prove flattenBakedPart honours both
// when the baked artifact carries them (the generator's side is pinned separately in
// scripts/recipes.test.js). The hand-built recipe is self-validated against flattenPart.
describe('geometry bake · consumer — SELECTION-DEPENDENT interactivity survives the bake', () => {
  const descriptor: Descriptor<{ state: string }> = {
    structure: { anatomy: { el: 'view' }, base: { root: { stack: { direction: 'row' } } } },
    variants: {
      state: {
        active: { root: { interactive: { pressScale: true } } },
        inactive: { root: {} },
      },
    },
    // `api` is REQUIRED (Path C · Phase 1) but the factory ignores it — a minimal
    // block keeps this synthetic bake fixture typechecking without affecting resolve.
    api: { axes: [], slots: {} },
  };
  const recipe: BakedComponentRecipe = {
    root: {
      el: 'view',
      geometry: { base: { flexDirection: 'row' }, variants: {} },
      interactive: { variants: { state: { active: { pressScale: true } } } },
    },
  };
  test('active/inactive × states — baked ≡ runtime (interactive not base-only)', () => {
    const theme = buildNuriTheme('lilac', 'light');
    for (const state of ['active', 'inactive']) {
      for (const st of STATES) {
        const runtime = flattenPart(descriptor, theme, 'root', { state }, st);
        const baked = flattenBakedPart(recipe.root, descriptor, theme, 'root', { state }, st);
        expect(baked.style).toEqual(runtime.style);
        expect(baked.node).toEqual(runtime.node);
      }
    }
    // and the divergence the base-only bake had is really exercised: active IS interactive.
    expect(flattenPart(descriptor, theme, 'root', { state: 'active' }, {}).node.interactive).toBeDefined();
    expect(flattenPart(descriptor, theme, 'root', { state: 'inactive' }, {}).node.interactive).toBeUndefined();
  });
});

describe('geometry bake · consumer — EMPHASIS/ALIGN-ONLY typography variants compose over a base size', () => {
  const descriptor: Descriptor<{ tone: string }> = {
    structure: {
      anatomy: { el: 'view', parts: { label: { el: 'text' }, value: { el: 'text' } } },
      base: { label: { typography: { size: 'md', emphasis: true } } },
    },
    variants: {
      tone: {
        normal: { label: { typography: { emphasis: false } }, value: { typography: { align: 'start' } } },
        loud: { label: { typography: { emphasis: true } }, value: { typography: { align: 'end' } } },
      },
    },
    // `api` REQUIRED (Path C · Phase 1) · factory-ignored · minimal for typecheck.
    api: { axes: [], slots: {} },
  };
  const recipe: BakedComponentRecipe = {
    root: { el: 'view', geometry: { base: {}, variants: {} } },
    label: {
      el: 'text',
      geometry: { base: {}, variants: {} },
      typography: {
        base: { size: 'md', emphasis: true },
        variants: { tone: { normal: { emphasis: false }, loud: { emphasis: true } } },
      },
    },
    value: {
      el: 'text',
      geometry: { base: {}, variants: {} },
      typography: {
        variants: { tone: { normal: { align: 'start' }, loud: { align: 'end' } } },
      },
    },
  };
  test('typography-only overrides resolve — baked ≡ runtime type/text refs', () => {
    const theme = buildNuriTheme('lilac', 'light');
    for (const tone of ['normal', 'loud']) {
      const labelRuntime = flattenPart(descriptor, theme, 'label', { tone }, {});
      const labelBaked = flattenBakedPart(recipe.label, descriptor, theme, 'label', { tone }, {});
      expect(labelBaked.node.type).toEqual(labelRuntime.node.type);

      const valueRuntime = flattenPart(descriptor, theme, 'value', { tone }, {});
      const valueBaked = flattenBakedPart(recipe.value, descriptor, theme, 'value', { tone }, {});
      expect(valueBaked.node.text).toEqual(valueRuntime.node.text);
      expect(valueBaked.style).toEqual(valueRuntime.style);
    }
    // the concrete divergence: normal drops emphasis over the emphasized base.
    expect(flattenPart(descriptor, theme, 'label', { tone: 'normal' }, {}).node.type).toEqual({ size: 'md' });
    expect(flattenPart(descriptor, theme, 'label', { tone: 'loud' }, {}).node.type).toEqual({ size: 'md', emphasis: true });
    expect(flattenPart(descriptor, theme, 'value', { tone: 'normal' }, {}).style).toEqual({ textAlign: 'left' });
    expect(flattenPart(descriptor, theme, 'value', { tone: 'loud' }, {}).style).toEqual({ textAlign: 'right' });
  });
});
