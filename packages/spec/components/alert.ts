/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT DESCRIPTOR · ALERT · AUTHORED SOURCE (hand-maintained)
 *
 * The composition-only inline notice — an icon, a growing message, and (soft
 * only) a trailing action, laid out in one centred row. Authored like `topbar`
 * (the multi-part reference) with `bottom-sheet-panel` as the default-children-
 * slot reference. PURE DATA (no theme thunk · 65.3 §7): structure { anatomy,
 * base } + variants composed from the five primitive namespaces in SEMANTIC
 * names; the platform-native engine resolves them (factory on RN · CSS on web ·
 * 65.1). NO behaviour — no dismiss, no auto-hide, no severity logic. Composition
 * only (form-kit-spec §1).
 *
 * ── TWO PIECES OF ANATOMY ──
 *   · root    — the row (view · align center · gap sm). `soft` raises a neutral
 *               surface with padding + radius lg (the mock's balance bar);
 *               `ghost` is transparent with no padding (the bare error line under
 *               a field). The root's `typography` is the MESSAGE text style: the
 *               renderer wraps the flat string children through it (see below).
 *   · icon    — the leading glyph (AlertIcon · a required, typed IconName ·
 *               the IconButton pattern · no default glyph).
 *
 * ── THE FLAT CHILDREN SLOT (§1.1 · settled) ──
 * `default` is a `kind:'children'` sink on the OPEN root (the bottom-sheet-panel
 * slot shape · multiple). The message is BARE STRING children; a trailing
 * `AlertButton` (the ONLY sanctioned action — there is NO raw-Button escape
 * hatch) is a bare ELEMENT child. Both flow into the row in authored order.
 *   · The STRING message renders through the root's authored text style + a
 *     grow/shrink fill so the icon and action HUG their content — the generic
 *     renderer "prose children" rule (renderer.tsx · a children-slot host that
 *     authors `typography` wraps its bare string children in a <Text>; RN would
 *     otherwise crash on a bare string inside a <View>, web tolerates text
 *     nodes · form-kit-spec §1.3). NOT alert-specific.
 * NO AlertTitle/AlertDescription/AlertAction parts in v1 — the compound parts
 * are a purely additive later step (flat usage must keep working).
 *
 * ── ACCENT ──
 * `themeScope:{accent:true}` — the standard generated-component scope. It tints
 * the whole alert AND the nested AlertButton (which inherits the scope) for free.
 *
 * FROZEN schema shape (decision 65 step 5 · Guard F); the AXES + VALUES are the
 * editable surface. No new tokens — palette/geometry from existing leaves only.
 * ────────────────────────────────────────────────────────────── */

import type { Descriptor } from './schema';

type AlertAxes = { variant: 'soft' | 'ghost' };

export const alertDescriptor: Descriptor<AlertAxes> = {
  structure: {
    anatomy: {
      // OPEN root (accepts the flat children slot — the message string + the
      // AlertButton element) with a leading `icon` part and a `message` text part.
      // `message` is a STYLE-DONOR part: no api slot targets it, so the renderer's
      // prose rule routes the flat string children through its authored style
      // (typography + muted palette + fill · §1.2/§1.3) and it never renders as its
      // own node — element children (AlertButton) flow in the root row unchanged.
      el: 'view',
      open: true,
      parts: {
        icon: { el: 'icon' },
        message: { el: 'text' },
      },
    },
    base: {
      root: {
        // Baseline alignment sits the small glyph on the message's text baseline.
        stack: { direction: 'row', align: 'baseline', gap: 'sm' },
      },
      // The leading glyph is the SMALL (xs) icon box.
      icon: { box: { width: 'xs', height: 'xs' } },
      // The message: sm, MUTED (the subtle notice tone), left-aligned, and it
      // GROWS + wraps so the icon and the trailing action hug their content.
      message: {
        stack: { fill: 'grow-shrink' },
        typography: { size: 'sm', align: 'start' },
        palette: { muted: true },
      },
    },
  },
  variants: {
    // soft = the raised pill bar (the mock's balance/insufficient surface): a
    // neutral soft surface (bg-strong · DESIGN-REVIEW flag: chrome vs the `soft`
    // surface variant — the closest existing token is picked, no new token minted),
    // padding, a size-xl min height, and a FULL (pill) radius. ghost = the bare
    // error line: transparent, no padding, no radius — icon + text only.
    variant: {
      soft: { root: { box: { minHeight: 'xl', padding: 'md', radius: 'full' }, palette: { variant: 'soft' } } },
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
