/* ──────────────────────────────────────────────────────────────
 * NURI · BAKED GEOMETRY RECIPE · GENERATOR GUARD (Arc 2 · D11 + D5)
 *
 * The Node side of the Arc-2 equivalence proof. The RN jest oracle
 * (packages/rn/__tests__/geometry-bake.test.ts) binds the COMMITTED
 * recipes to the runtime resolver over the catalog; THIS pins the GENERATOR's
 * generality for the two schema-valid cases the catalog does not exercise, so a
 * regression in buildGeometryRecipe cannot silently ship them:
 *
 *   · SELECTION-DEPENDENT interactivity — an `interactive` opt-in in a VARIANT
 *     (not just base) is carried through the base/variant channel (the reviewer's
 *     blocking finding #1 · was base-only).
 *   · TYPOGRAPHY-ONLY partials — a variant that changes only `emphasis` or `align`
 *     over a base `size` is baked as a mergeable partial (finding #2 · was dropped).
 *
 * Bakes synthetic descriptors against the SAME single-sourced spec deps the build
 * uses (loadRecipeDeps · no divergent fixture). Sibling to tokens-parser.test.js —
 * picked up by the `node --test scripts/*.test.js` gate.
 * ────────────────────────────────────────────────────────────── */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildGeometryRecipe, loadRecipeDeps } from './parsers/recipes.js';
import { loadDimensions } from './parsers/dimension-css.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SPEC_ROOT = resolve(__dirname, '../packages/spec');

const deps = await loadRecipeDeps({
  resolveMapPath: resolve(SPEC_ROOT, 'axes/resolve-map.ts'),
  propertySpellingPath: resolve(SPEC_ROOT, 'axes/property-spelling.ts'),
  dims: await loadDimensions(resolve(SPEC_ROOT, 'tokens/dimensions.ts')),
});

test('the bake carries VARIANT-LEVEL interactive (not base-only · reviewer finding #1)', () => {
  const descriptor = {
    structure: { anatomy: { el: 'view' }, base: { root: { stack: { direction: 'row' } } } },
    variants: {
      state: {
        active: { root: { interactive: { pressScale: true } } },
        inactive: { root: {} },
      },
    },
  };
  const recipe = buildGeometryRecipe(descriptor, deps);
  // the opt-in rides the variant channel — NOT base (base has none).
  assert.deepEqual(recipe.root.interactive, {
    variants: { state: { active: { pressScale: true } } },
  });
  // geometry is still the base stack (unaffected).
  assert.deepEqual(recipe.root.geometry.base, { flexDirection: 'row' });
});

test('the bake carries EMPHASIS/ALIGN-ONLY typography variants as mergeable partials (finding #2)', () => {
  const descriptor = {
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
  };
  const recipe = buildGeometryRecipe(descriptor, deps);
  // the base `size` + the typography-only variant overrides survive as raw partials —
  // the runtime merges + resolves them (normal → { size:md }, loud → { size:md, emphasis };
  // align-only survives even when no size is present).
  assert.deepEqual(recipe.label.typography, {
    base: { size: 'md', emphasis: true },
    variants: { tone: { normal: { emphasis: false }, loud: { emphasis: true } } },
  });
  assert.deepEqual(recipe.value.typography, {
    variants: { tone: { normal: { align: 'start' }, loud: { align: 'end' } } },
  });
});

test('base-level interactive still rides the base channel (the Button shape)', () => {
  const descriptor = {
    structure: {
      anatomy: { el: 'view' },
      base: { root: { interactive: { pressColor: true, pressScale: true, disabledOpacity: true } } },
    },
  };
  const recipe = buildGeometryRecipe(descriptor, deps);
  assert.deepEqual(recipe.root.interactive, {
    base: { pressColor: true, pressScale: true, disabledOpacity: true },
  });
});
