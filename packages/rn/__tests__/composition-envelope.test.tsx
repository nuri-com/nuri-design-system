/* ══════════════════════════════════════════════════════════════════
 * NURI · RN · COMPOSITION-ENVELOPE (react-test-renderer · headless)
 * ──────────────────────────────────────────────────────────────────
 * The PERMANENT synthetic matrix for the nested-composition contract
 * (decision 83) — {view root · pressable root} ×
 * {depth-1 typed slots · depth-2 typed slots · region + bare mixed content ·
 *  repeated `multiple` slot · repeated singular slot · region/loose mixed
 *  targeting · foreign component's marker · wrong-region marker · bare
 *  children with no default sink}.
 *
 * SYNTHETIC descriptors on purpose — the catalog is a subset, and catalog-only
 * coverage reads as proof it isn't (the verify-guard-completeness lesson).
 * MIRRORED cell-for-cell by packages/prototype/factory/composition-envelope
 * .test.js: every cell asserts the SAME structure or the SAME named error
 * (matched by message body) on both engines. The machinery under test is the
 * renderer's grouping walker (renderHostBody#appendCompositionEntries) + the
 * owner-scoped harvestNuriComposition — edit in lockstep with
 * factory.js#appendComposition/#harvestComposition.
 * ══════════════════════════════════════════════════════════════════ */

import * as React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';
import { NuriThemeProvider } from '../theme';
import { NuriIcon } from '../primitives/NuriIcon';
import { createNuriSlot, harvestNuriComposition, renderDescriptorInstance } from '../runtime/renderer';
import type { NuriCompositionEntry } from '../runtime/renderer';
import type { Descriptor, Axes, IconName } from '../contract';
import type { BakedComponentRecipe } from '../runtime/resolve';

function render(node: React.ReactElement): TestRenderer.ReactTestRenderer {
  let tr!: TestRenderer.ReactTestRenderer;
  act(() => {
    tr = TestRenderer.create(node);
  });
  return tr;
}

// Assert a render throws the NAMED contract error, with React's render-phase
// console.error noise silenced (the render-smoke trust-boundary pattern).
function expectRenderToThrow(node: React.ReactElement, pattern: RegExp | string): void {
  const quiet = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  try {
    expect(() => render(node)).toThrow(pattern);
  } finally {
    quiet.mockRestore();
  }
}

// ── The synthetic envelope descriptor: depth-1 typed leaves (`leaf` multiple ·
// `badge` singular icon) + a depth-2 region subtree (`panel` region carrying
// `label` multiple · `note` singular). No default:true sink on purpose (the
// bare-children cell). Parameterized on the ROOT host element — the web mirror
// builds the IDENTICAL shape.
const envelopeDescriptor = (rootEl: 'view' | 'pressable'): Descriptor<Axes> => ({
  structure: {
    anatomy: {
      el: rootEl,
      parts: {
        leaf: { el: 'text' },
        badge: { el: 'icon' },
        panel: { el: 'view', parts: { label: { el: 'text' }, note: { el: 'text' } } },
      },
    },
    base: {
      root: {
        stack: { direction: 'row', gap: 'md' },
        ...(rootEl === 'pressable' ? { interactive: { pressColor: true } } : {}),
      },
      panel: { stack: { direction: 'column' } },
      leaf: { typography: { size: 'md' } },
      label: { typography: { size: 'md' } },
      note: { typography: { size: 'sm' } },
    },
  },
  api: {
    axes: [],
    themeScope: { accent: true },
    ...(rootEl === 'pressable' ? { behaviour: { pressable: { target: 'root', props: ['onPress'] as ('onPress')[] } } } : {}),
    slots: {
      leaf: { part: 'leaf', kind: 'text', component: true, multiple: true },
      badge: { part: 'badge', kind: 'icon-name', component: true },
      panel: { part: 'panel', kind: 'region' },
      label: { part: 'label', kind: 'text', component: true, multiple: true },
      note: { part: 'note', kind: 'text', component: true },
    },
  },
});

const envelopeRecipe = (rootEl: 'view' | 'pressable'): BakedComponentRecipe => ({
  root: {
    el: rootEl,
    geometry: { base: { flexDirection: 'row', gap: 12 }, variants: {} },
    ...(rootEl === 'pressable' ? { interactive: { base: { pressColor: true } } } : {}),
  },
  leaf: { el: 'text', geometry: { base: {}, variants: {} }, typography: { base: { size: 'md' } } },
  badge: { el: 'icon', geometry: { base: {}, variants: {} } },
  panel: { el: 'view', geometry: { base: { flexDirection: 'column' }, variants: {} } },
  label: { el: 'text', geometry: { base: {}, variants: {} }, typography: { base: { size: 'md' } } },
  note: { el: 'text', geometry: { base: {}, variants: {} }, typography: { base: { size: 'sm' } } },
});

// One envelope "component" per root — the generated-adapter shape exactly:
// owner-carrying markers + the owner-scoped root harvest → composition.root.
function makeEnvelope(rootEl: 'view' | 'pressable', name: string) {
  const descriptor = envelopeDescriptor(rootEl);
  const recipe = envelopeRecipe(rootEl);
  const Leaf = createNuriSlot('leaf', `${name}Leaf`, 'children', name);
  const Badge = createNuriSlot<{ name: IconName; children?: never }>('badge', `${name}Badge`, 'name', name);
  const Panel = createNuriSlot('panel', `${name}Panel`, 'children', name);
  const Label = createNuriSlot('label', `${name}Label`, 'children', name);
  const Note = createNuriSlot('note', `${name}Note`, 'children', name);
  const Component: React.FC<{ children?: React.ReactNode }> = (props) => {
    const composition: Partial<Record<string, NuriCompositionEntry<string>[]>> = {};
    const harvested = harvestNuriComposition<string>(props.children, undefined, name);
    if (harvested.hasSlots) composition.root = harvested.items;
    return renderDescriptorInstance({
      descriptor,
      recipe,
      displayName: name,
      selection: {},
      content: {},
      composition,
      behaviour: rootEl === 'pressable' ? { pressable: { target: 'root', onPress: () => undefined } } : {},
    });
  };
  Component.displayName = name;
  return { Component, Leaf, Badge, Panel, Label, Note };
}

// The FOREIGN component's marker (its `label` PART NAME collides with the
// envelope's on purpose — owner scoping, not part-name luck, must reject it).
const ForeignLabel = createNuriSlot('label', 'EnvForeignLabel', 'children', 'EnvForeign');

const ROOTS = [
  { title: 'view root', ...makeEnvelope('view', 'EnvView') },
  { title: 'pressable root', ...makeEnvelope('pressable', 'EnvPress') },
];

describe.each(ROOTS)('composition-envelope · $title', ({ Component, Leaf, Badge, Panel, Label, Note }) => {
  test('depth-1 typed slots render in authored order', () => {
    const tr = render(
      <NuriThemeProvider>
        <Component>
          <Leaf>Alpha</Leaf>
          <Badge name="apple" />
        </Component>
      </NuriThemeProvider>,
    );
    const texts = tr.root.findAllByType(Text);
    expect(texts.map((t) => t.props.children)).toEqual(['Alpha']);
    expect(tr.root.findAllByType(NuriIcon).map((icon) => icon.props.name)).toEqual(['apple']);
  });

  test('depth-2 typed slot routes through its ancestor region', () => {
    const tr = render(
      <NuriThemeProvider>
        <Component>
          <Label>Deep</Label>
        </Component>
      </NuriThemeProvider>,
    );
    const text = tr.root.findByType(Text);
    expect(text.props.children).toBe('Deep');
    // the panel ancestor renders ONCE, wrapping the leaf
    const panel = text.parent as NonNullable<typeof text.parent>;
    expect(panel.type).toBe('View');
    expect(panel.children).toHaveLength(1);
  });

  test('region + bare mixed content keeps order, bare stays region content', () => {
    const tr = render(
      <NuriThemeProvider>
        <Component>
          <Panel>
            before
            <Label>Deep</Label>
            after
          </Panel>
        </Component>
      </NuriThemeProvider>,
    );
    const text = tr.root.findByType(Text);
    const panel = text.parent as NonNullable<typeof text.parent>;
    expect(panel.type).toBe('View');
    expect(panel.children).toHaveLength(3);
    expect(panel.children[0]).toBe('before');
    expect((panel.children[1] as { type: unknown }).type).toBe(Text);
    expect(panel.children[2]).toBe('after');
  });

  test('a multiple:true slot repeats as a SEQUENCE at both depths', () => {
    const tr = render(
      <NuriThemeProvider>
        <Component>
          <Leaf>One</Leaf>
          <Leaf>Two</Leaf>
          <Label>L1</Label>
          <Label>L2</Label>
        </Component>
      </NuriThemeProvider>,
    );
    const texts = tr.root.findAllByType(Text);
    // FOUR leaf instances — never a concatenated leaf.
    expect(texts.map((t) => t.props.children)).toEqual(['One', 'Two', 'L1', 'L2']);
    // the two labels share ONE panel instance
    expect(texts[2].parent).toBe(texts[3].parent);
    // the two root-level leaves are siblings outside the panel
    expect(texts[0].parent).toBe(texts[1].parent);
    expect(texts[0].parent).not.toBe(texts[2].parent);
  });

  test('a repeated SINGULAR slot fails named (nested text)', () => {
    expectRenderToThrow(
      <NuriThemeProvider>
        <Component>
          <Note>N1</Note>
          <Note>N2</Note>
        </Component>
      </NuriThemeProvider>,
      "nuri-factory: slot targeting part 'note' is singular — it appears 2 times under 'panel'",
    );
  });

  test('a repeated SINGULAR slot fails named (depth-1 icon)', () => {
    expectRenderToThrow(
      <NuriThemeProvider>
        <Component>
          <Badge name="apple" />
          <Badge name="card" />
        </Component>
      </NuriThemeProvider>,
      "nuri-factory: slot targeting part 'badge' is singular — it appears 2 times under 'root'",
    );
  });

  test('a region marker mixed with a loose slot for the same region fails named', () => {
    expectRenderToThrow(
      <NuriThemeProvider>
        <Component>
          <Panel>
            <Label>A</Label>
          </Panel>
          <Label>B</Label>
        </Component>
      </NuriThemeProvider>,
      "nuri-factory: slot targeting part 'panel' is singular — it appears 2 times under 'root'",
    );
  });

  test("a FOREIGN component's marker fails named", () => {
    expectRenderToThrow(
      <NuriThemeProvider>
        <Component>
          <Panel>
            <ForeignLabel>X</ForeignLabel>
          </Panel>
        </Component>
      </NuriThemeProvider>,
      /foreign slot marker 'EnvForeignLabel'/,
    );
  });

  test('a FOREIGN marker with no local marker present still fails named', () => {
    expectRenderToThrow(
      <NuriThemeProvider>
        <Component>
          <ForeignLabel>X</ForeignLabel>
        </Component>
      </NuriThemeProvider>,
      /foreign slot marker 'EnvForeignLabel'/,
    );
  });

  test('a typed slot targeting a part OUTSIDE its region fails named', () => {
    expectRenderToThrow(
      <NuriThemeProvider>
        <Component>
          <Panel>
            <Leaf>X</Leaf>
          </Panel>
        </Component>
      </NuriThemeProvider>,
      "nuri-factory: composition entry targets 'leaf', which is not under 'panel'",
    );
  });

  test('bare children with NO default sink fail named', () => {
    expectRenderToThrow(
      <NuriThemeProvider>
        <Component>plain</Component>
      </NuriThemeProvider>,
      /has no default content slot/,
    );
  });
});
