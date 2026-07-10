# The primitive layer — web↔RN parity contract

> **Status:** current operational contract. When in doubt, code wins, then `README.md`, then this
> document.

## The settled model

`View` is the single hand-authorable layout primitive. It carries the disjoint `box ⊕ stack ⊕
palette ⊕ effect` namespaces on both projections:

- Web: `<nuri-view>` derives `.nuri-box`, `.nuri-stack`, `.nuri-palette`, and `.nuri-effect`
  classes plus their `data-*` vocabulary.
- RN: `<View>` resolves the same namespace props through the shared mapping tables and renders a
  React Native `View`.

The `stack` namespace remains engine vocabulary. `StackNS`, `STACK_FIELDS`, `STACK_KEYS`, generated
`.nuri-stack` CSS, factory-composed `.nuri-stack` classes, and distribute wrappers all remain. The
standalone RN `Stack` and web `<nuri-stack>` elements are retired because they were strict
capability-subsets of `View` with no unique behavior.

Column layout uses `<View>` with the schema-default direction. Rows use `direction="row"`.
`distribute="even"` performs equal child splits on either direction.

## Contracted primitives

| Intent | Web | RN | Surface |
|---|---|---|---|
| Layout and surface | `<nuri-view>` | `View` | box ⊕ stack ⊕ palette ⊕ effect |
| Text | `<nuri-typography>` | `Text` | typography ⊕ palette |
| Interaction | `<nuri-pressable>` | `Pressable` | box ⊕ stack ⊕ palette ⊕ interactive |
| Icon | `<nuri-icon>` | `NuriIcon` | typed `IconName`, dimension, colour |
| Screen | `<nuri-screen>` | `Screen` | safe-area structure |
| Header | `<nuri-header>` | `Header` | fixed top region |
| Scroll | `<nuri-scroll>` | `Scroll` | scroll structure and dock insets |
| Footer | `<nuri-footer>` | `Footer` | fixed bottom region |
| Dock | `<nuri-dock>` | `Dock` | screen-local fixed placement |
| Separator | `<nuri-separator>` | `Separator` | semantic hairline and vertical rhythm |
| List separator | `<nuri-list-separator>` | `ListSeparator` | fixed list inset preset |

`NuriScope` is the RN theme-context mechanism; `<nuri-scope>` is its web cascade counterpart.
`Spacer` remains a small web helper rather than a contracted public RN primitive.

## Namespace CSS is not an element registry

The generated files in `packages/prototype/styles/` project namespace data from `@nuri/spec`:

| CSS class | Schema namespace | Source table |
|---|---|---|
| `.nuri-stack` | `StackNS` | `STACK_FIELDS` |
| `.nuri-box` | `BoxNS` | `BOX_FIELDS` |
| `.nuri-palette` | `PaletteNS` | palette surface data |
| `.nuri-interactive` | `InteractiveNS` | interactive effects data |
| `.nuri-type-*` | `TypographyNS` | typography axis data |

These classes are applied to merged painting nodes by `<nuri-view>` and the factory. Their names do
not imply corresponding standalone custom elements.

## Parity and drift gates

The primitive contract follows the same one-SoT/two-projection model as descriptor components:

1. Namespace types and mapping tables live in `@nuri/spec`.
2. Web custom-element attribute lists and RN `propKeys` are checked against those shared keys.
3. RN render-smoke tests mount every public primitive.
4. The web distribute test keeps DOM wrapping coverage on `view.js`; the RN distribute test keeps
   the corresponding child-fill behavior on `View.tsx`.
5. The RN public-barrel pin makes additions and removals deliberate contract edits.

No primitive may introduce a second hand-written prop-to-style mapping. RN resolves through
`runtime/resolve.ts`; web styling is generated from the same namespace data.

## Open versus closed composition

Primitives are open authoring surfaces. Generated catalog components are closed descriptor
adapters rendered by `runtime/renderer.tsx`. Both share the namespace vocabulary, colour scope,
and generated token projections, but only catalog components route through descriptor anatomy.

Raw React Native hosts belong in app harness code when the design system does not own the behavior.
Screen composition should otherwise use the public primitives and generated components; an
unexpressible layout is a design-system gap, not a page-local style escape hatch.
