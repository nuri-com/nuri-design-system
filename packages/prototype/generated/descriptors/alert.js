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
      // AlertButton element) with one leading `icon` part and a `message` text part.
      // v1 is a compact inline notice — flat, no icon band, no baseline tricks.
      // `message` is a STYLE-DONOR part: no api slot targets it, so the renderer's
      // prose rule routes the flat string children THROUGH it (rendered as its normal
      // `text` leaf · §1.3); it never renders as its own empty node, and element
      // children (AlertButton) flow in the root row unchanged. v1 line truncation
      // is descriptor-owned typography data on this donor part; richer multiline
      // Alert behavior/action layout remains deferred.
      el: 'view',
      open: true,
      parts: {
        icon: { el: 'icon' },
        message: { el: 'text' },
        action: {
          component: 'button',
          props: {
            variant: 'solid',
            size: 'sm',
            // HUG (flex 0 0 auto): the action never shrinks, so ALL row shrink lands
            // on the `grow-shrink` message (it truncates) and the button always shows
            // its full label. Passed as a button PROP — the parent can't style a
            // nested component's part directly ("the referenced component owns its
            // contract"); its fill axis is the sanctioned channel.
            fill: 'hug',
            children: '$slot.children',
            disabled: '$slot.disabled',
            onPress: '$slot.onPress',
            accessibilityLabel: '$slot.accessibilityLabel',
          },
        },
      },
    },
    base: {
      root: {
        // A simple CENTRED row — glyph, message, and (optional) action sit on one
        // vertical centre. No baseline alignment (v1 tradeoff).
        stack: { direction: 'row', align: 'center', gap: 'sm' },
      },
      // The glyph is the SMALL (xs) icon box, MUTED to the same tone as the message
      // (palette muted → the text-muted token · not the paler `subtle` glyph) so the
      // icon and text read as one subtle unit.
      icon: { box: { width: 'xs', height: 'xs' }, palette: { muted: true } },
      // The message: sm, EMPHASIS (semibold), MUTED (the subtle notice tone),
      // left-aligned. It GROWS + shrinks so the icon and the trailing action hug
      // their content. v1 is a compact one-line notice: max-line tail ellipsis is
      // declared as typography data, not as an Alert-local renderer/CSS hack.
      message: {
        stack: { fill: 'grow-shrink' },
        box: { paddingEnd: 'lg' },
        typography: { size: 'sm', emphasis: true, align: 'start', flow: 'truncate', lines: 1 },
        palette: { muted: true },
      },
    },
  },
  variants: {
    // soft = the raised pill bar (the mock's balance/insufficient surface): a
    // neutral soft surface (bg-strong · DESIGN-REVIEW flag: chrome vs the `soft`
    // surface variant — the closest existing token is picked, no new token minted),
    // sm vertical padding, md start / sm end padding, a size-lg min height,
    // and a FULL (pill) radius.
    // ghost = the bare error line: transparent, no padding, no radius — icon +
    // text only.
    variant: {
      soft: { root: { box: { minHeight: 'lg', paddingY: 'sm', paddingStart: 'md', paddingEnd: 'sm', radius: 'full' }, palette: { variant: 'soft' } } },
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
      button: { part: 'action', kind: 'children', component: true },
      default: { part: 'root', kind: 'children', default: true, multiple: true },
    },
  },
};
