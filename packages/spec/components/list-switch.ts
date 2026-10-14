/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT DESCRIPTOR · LIST-SWITCH · AUTHORED SOURCE (hand-maintained)
 *
 * The list ROW whose WHOLE ROW is a switch (ListSwitch · web nuri-list-switch ·
 * prompts/admission-switch.md §B): the `list-action` row geometry with the same
 * `content` column (`text` · `textMuted` composition slots) and a trailing pill —
 * the setting toggle's row form ("Bitcoin payments ● on"). A `list-action`
 * sibling, NOT a variant: the root's role (`switch` + the `checked` state) and its
 * trailing anatomy differ, and the DS keeps one semantic per control.
 *
 * THE ROOT IS THE ONE CONTROL. Role `switch`, `checked` bridged onto the internal
 * `state` axis, `onPress` + `disabled`; the row text names the control (no
 * duplicated label), the FULL ROW is the tap target (the Android/Material model ·
 * a strict superset of iOS Settings' pill-only target · VoiceOver treats an iOS
 * settings row as one switch either way), and the row WASH (`pressColor`) is the
 * press feedback — the control acknowledges, not the pill. Both targets' pressables
 * cancel on scroll, so rows never flip on a swipe-through.
 *
 * THE TRAILING PILL IS A STATIC COPY, NOT AN EMBEDDED SWITCH. `track` + `thumb`
 * restate switch.ts's root + thumb VERBATIM (base + the `state` values), minus
 * `interactive` (press feedback belongs to the control · the row root) and the
 * host element (`view`, not `pressable`). Embedding `component: 'switch'` was
 * refused for v1 (the admission trade study): a root prop cannot reach a
 * component-ref part, a pressable inside a pressable steals the pill tap on RN
 * and nests <button> in <button> on web, and there is no per-instance passive
 * render. The copy is ~6 lines of data under scripts/switch-contract.test.js
 * (list-switch.{track,thumb} ≡ switch.{root,thumb}) — a visual change edits BOTH
 * files, and the guard fails until both move. A THIRD consumer of the look
 * reopens the embed mechanism; until then this is the honest construction.
 *
 * NO leading avatar, no trailing text in v1 (anti-scope). The gutter/bleed
 * construction and any list-family contraction apply to this row exactly as to
 * list-action (same `padding: 'md'` · `radius: 'lg'`).
 *
 * PURE DATA (no theme thunk · 65.3 §7): structure { anatomy, base } + variants in
 * SEMANTIC names; the platform-native engine resolves them.
 * ────────────────────────────────────────────────────────────── */

import type { Descriptor } from './schema';

type ListSwitchAxes = {
  state: 'on' | 'off';
};

export const listSwitchDescriptor: Descriptor<ListSwitchAxes> = {
  structure: {
    anatomy: {
      el: 'pressable',
      parts: {
        // The content column (the list-action twin): title over the muted line.
        content: { el: 'view', parts: { text: { el: 'text' }, textMuted: { el: 'text' } } },
        // The trailing pill: a STATIC track hosting the thumb (the switch.ts copy).
        track: { el: 'view', parts: { thumb: { el: 'view' } } },
      },
    },
    base: {
      // The row (≡ list-action root): the ghost wash + disabled dim on the ONE control.
      root: {
        stack: { direction: 'row', align: 'center', gap: 'md' },
        // The 72px row floor (`2xl` · ≡ list-action · operator ruling 2026-10-14): the
        // 36px track alone would make a 60px row; the floor keeps every list row on
        // one rhythm, the pill centred.
        box: { padding: 'md', minHeight: '2xl', radius: 'lg' },
        palette: { variant: 'ghost' },
        interactive: { pressColor: true, disabledOpacity: true },
      },
      content: {
        stack: { direction: 'column', align: 'stretch', justify: 'center', fill: 'grow-shrink' },
      },
      text: { typography: { size: 'md', emphasis: true, align: 'start', flow: 'truncate', lines: 1 } },
      textMuted: { typography: { size: 'sm', align: 'start', flow: 'truncate', lines: 1 }, palette: { muted: true } },
      // ── The switch look · VERBATIM switch.ts root/thumb minus `interactive` ──
      track: {
        stack: { direction: 'row', align: 'stretch' },
        box: { width: 'xl', height: 'md', padding: 'xs', radius: 'full' },
      },
      thumb: {
        box: { aspectRatio: 'square', radius: 'full' },
        palette: { chrome: 'canvas' },
      },
    },
  },
  variants: {
    // ≡ switch.ts `state`, re-targeted from `root` to `track` (the guard pins it).
    state: {
      on: { track: { stack: { justify: 'end' }, palette: { variant: 'solid' } } },
      off: { track: { stack: { justify: 'start' }, palette: { chrome: 'inverse-muted' } } },
    },
  },
  defaults: { state: 'off' },
  // The PUBLIC API: no style axes; the `switch`-role pressable root (onPress ·
  // disabled · an OPTIONAL a11y label — the row text names the control); the
  // `checked` bridge; TWO text composition slots (the list-action content twins).
  api: {
    axes: [],
    themeScope: { accent: true },
    behaviour: { pressable: { target: 'root', role: 'switch', props: ['onPress', 'disabled', 'accessibilityLabel'] } },
    propMaps: { checked: { axis: 'state', true: 'on', false: 'off' } },
    slots: {
      text: { part: 'text', kind: 'text', component: true, multiple: true },
      textMuted: { part: 'textMuted', kind: 'text', component: true, multiple: true },
    },
  },
};
