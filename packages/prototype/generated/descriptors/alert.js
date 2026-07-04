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
      // AlertButton element) with a leading icon BAND and a `message` text part.
      // `iconWrap` is a short, line-height-tall band that vertically CENTRES the
      // glyph (align center); the row aligns items on the message's FIRST baseline,
      // so the band — and the glyph inside it — stay level with line one even when
      // the message wraps to two lines. `message` is a STYLE-DONOR part: no api slot
      // targets it, so the renderer's prose rule routes the flat string children
      // through its authored style (typography + muted palette + fill · §1.2/§1.3)
      // and it never renders as its own node — element children (AlertButton) flow
      // in the root row unchanged.
      el: 'view',
      open: true,
      parts: {
        iconWrap: { el: 'view', parts: { icon: { el: 'icon' } } },
        message: { el: 'text' },
      },
    },
    base: {
      root: {
        // Items align on the message's FIRST baseline — the icon band and (when
        // present) the trailing AlertButton stay level with line one of a wrapping
        // message.
        stack: { direction: 'row', align: 'baseline', gap: 'sm' },
      },
      // The icon BAND — a line-height-tall (sm) box that centres the glyph, so the
      // glyph sits ON the message's first line rather than hanging from the baseline.
      // A view baselines at its bottom edge, so the band's bottom lands on the
      // message baseline and the centred glyph reads level with the text.
      iconWrap: { stack: { direction: 'row', align: 'center', justify: 'center' }, box: { height: 'sm' } },
      // The glyph is the SMALL (xs) icon box, MUTED to the same tone as the message
      // (palette muted → the text-muted token · not the paler `subtle` glyph) so the
      // icon and text read as one subtle unit.
      icon: { box: { width: 'xs', height: 'xs' }, palette: { muted: true } },
      // The message: sm, EMPHASIS (semibold), MUTED (the subtle notice tone),
      // left-aligned, and it GROWS + wraps so the icon band and the trailing action
      // hug their content.
      message: {
        stack: { fill: 'grow-shrink' },
        typography: { size: 'sm', emphasis: true, align: 'start' },
        palette: { muted: true },
      },
    },
  },
  variants: {
    // soft = the raised pill bar (the mock's balance/insufficient surface): a
    // neutral soft surface (bg-strong · DESIGN-REVIEW flag: chrome vs the `soft`
    // surface variant — the closest existing token is picked, no new token minted),
    // a larger (lg) start padding for the pill's rounded left edge, a size-xl min
    // height, and a FULL (pill) radius. ghost = the bare error line: transparent,
    // no padding, no radius — icon + text only.
    variant: {
      soft: { root: { box: { minHeight: 'xl', padding: 'md', paddingStart: 'lg', radius: 'full' }, palette: { variant: 'soft' } } },
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
