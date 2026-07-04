/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT DESCRIPTOR · ALERT · BROWSER ESM · GENERATED · DO NOT EDIT BY HAND
 *
 * The browser-ESM twin of packages/spec/components/alert.ts — IDENTICAL data,
 * the authored source type-stripped (no `import type`, no axes type, no
 * `: Descriptor<…>` annotation). A browser can `import { alertDescriptor }`
 * from it at runtime with NO build step — the prototype web factory
 * (packages/prototype/factory/factory.js · decision 67) consumes it to render a de-collapsed
 * nuri-* tree, preserving the zero-build composition property (decision 66 ·
 * what Nuri IS #3).
 *
 * Source · packages/spec/components/alert.ts (the AUTHORED SoT · §9 step 1 ·
 * decision 69 · N+29 B1). Emitter · scripts/tokens-parser.js — `npm run build`.
 * Committed (decision 35) · the re-emit gate covers packages/prototype/generated/.
 * NEVER hand-edit generated/ — edit the authored source above.
 * ────────────────────────────────────────────────────────────── */

export const alertDescriptor = {
  structure: {
    anatomy: {
      // OPEN root (accepts the flat children slot — the message string + the
      // AlertButton element) with a single leading `icon` part.
      el: 'view',
      open: true,
      parts: {
        icon: { el: 'icon' },
      },
    },
    base: {
      root: {
        stack: { direction: 'row', align: 'center', gap: 'sm' },
        // The MESSAGE text style. Read by the renderer's prose-children rule to
        // style the wrapping <Text> for the bare string children (a container
        // authoring `typography` opts its string children into prose wrapping).
        typography: { size: 'md' },
      },
      // The leading glyph sizes to the standard sm icon box (coherent with the
      // Button/list leading-icon scale).
      icon: { box: { width: 'sm', height: 'sm' } },
    },
  },
  variants: {
    // soft = the raised bar (the mock's balance/insufficient surface): a neutral
    // soft surface (bg-strong · text-primary · DESIGN-REVIEW flag: chrome vs the
    // `soft` surface variant — the closest existing token is picked, no new token
    // minted), padding, and radius lg. ghost = the bare error line: transparent,
    // no padding, no radius — icon + text only.
    variant: {
      soft: { root: { box: { padding: 'md', radius: 'lg' }, palette: { variant: 'soft' } } },
      ghost: { root: { palette: { variant: 'ghost' } } },
    },
  },
  // The PUBLIC default (R1.5) — soft (the raised bar), NOT the variant-order
  // first value. Both factories read this; neither binding hand-passes a default.
  defaults: { variant: 'soft' },
  // The PUBLIC API (Path C). variant surfaces as a style prop; accent scopes the
  // subtree (incl. AlertButton). Slots: the leading `icon` is a generated
  // component slot (AlertIcon · required typed IconName · the ButtonIcon marker
  // pattern), and the flat `default` children sink routes the message string +
  // the AlertButton element into the open root. NO behaviour (no pressable root).
  api: {
    axes: ['variant'],
    themeScope: { accent: true },
    slots: {
      icon: { part: 'icon', kind: 'icon-name', component: true },
      default: { part: 'root', kind: 'children', default: true, multiple: true },
    },
  },
};
