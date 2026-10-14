/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT DESCRIPTOR · SWITCH · AUTHORED SOURCE (hand-maintained)
 *
 * The binary SETTING TOGGLE (Switch · web nuri-switch · prompts/admission-switch.md):
 * one pressable track with one private `thumb`. Presentation only — the DS is
 * DUMB: it renders a pill that LOOKS on or off and fires `onPress`; the consumer
 * owns the value (`checked={on}` · `onPress={() => setOn(v => !v)}`), the
 * TabBarItem `selected`+`onPress` grammar. No `value`/`onValueChange`, no
 * uncontrolled mode, no indeterminate state.
 *
 * GEOMETRY — all on-scale, no new leaf: the track is `xl`×`md` (60×36) with the
 * `xs` (3px) inset and a `full` radius; the thumb is a `square`-ratio box that
 * STRETCHES to the track's inner height (36 − 2·3 = 30) and derives its width from
 * that (web `aspect-ratio` on a stretched flex item · Yoga `aspectRatio`). The
 * track carries NO `fill`: a `view`/pressable node keeps Yoga's flex-shrink 0 on
 * both targets (view.css mirrors it), and `hug` would pin `alignSelf: flex-start`
 * on RN (misaligning the pill in a two-line row).
 *
 * STATE — the internal 2-value `state` axis (`on` | `off`) is NEVER a public
 * attribute; the consumer's `checked` boolean bridges onto it in both factories
 * (`propMaps.checked` · true→'on' · false→'off' · the `selected` bridge's sibling).
 * `on` paints the track `solid` (accent-solid · lilac under the default accent)
 * and parks the thumb at the END; `off` paints the accent-INVARIANT
 * `chrome.inverse-muted` (bg-inverse-muted · the neutral-11 fill decision 44
 * created for this) and parks the thumb at the START. The thumb is always
 * `chrome.canvas`, so it lifts off either track. The move is an instant
 * re-layout (`stack.justify`) — a slide is a separate motion request.
 *
 * INTERACTION — `disabledOpacity` ONLY. No `pressScale`, no `pressColor` (operator
 * ruling 2026-10-13): a switch's native press feedback lives on the THUMB (iOS
 * widens it · Material grows it), which the engine cannot express yet (press
 * effects live only on the pressable root · Channel 2); a whole-pill scale is a
 * Button feel transplanted and near-invisible at 0.97 on 60px. The control's
 * feedback is the thumb snap on release; cursor + focus ring stay automatic.
 *
 * A11Y — role `switch` (RN `accessibilityRole="switch"` + `accessibilityState.
 * checked` · web `<button role="switch" aria-checked>` · decision 44: a switch,
 * never a checkbox). The control has no visible text — give it an
 * `accessibilityLabel`, or prefer `ListSwitch` where a label row IS the control.
 *
 * PURE DATA (no theme thunk · 65.3 §7): structure { anatomy, base } + variants in
 * SEMANTIC names; the platform-native engine resolves them (factory on RN · CSS on
 * web · 65.1). The LOOK (track + thumb · base + state) is COPIED verbatim into
 * list-switch.ts (its trailing pill) and pinned by scripts/switch-contract.test.js —
 * a visual change edits BOTH files, and the guard fails until both move.
 * ────────────────────────────────────────────────────────────── */

import type { Descriptor } from './schema';

type SwitchAxes = {
  state: 'on' | 'off';
};

export const switchDescriptor: Descriptor<SwitchAxes> = {
  structure: {
    anatomy: {
      el: 'pressable',
      // ONE private part: the thumb (a static view · HOSTS always render).
      parts: {
        thumb: { el: 'view' },
      },
    },
    base: {
      // The track: a 60×36 full-radius pill with a 3px inset, a row stack whose
      // single child stretches to the inner height. disabledOpacity ONLY.
      root: {
        stack: { direction: 'row', align: 'stretch' },
        box: { width: 'xl', height: 'md', padding: 'xs', radius: 'full' },
        interactive: { disabledOpacity: true },
      },
      // The thumb: a square-ratio full-radius disc on the canvas chrome (lifts off
      // either track · decision 44); its height is the stretched inner height.
      thumb: {
        box: { aspectRatio: 'square', radius: 'full' },
        palette: { chrome: 'canvas' },
      },
    },
  },
  variants: {
    // The on/off treatment: colour (variant vs the accent-invariant chrome) + the
    // thumb's park position (justify). The consumer's `checked` bridges onto this.
    state: {
      on: { root: { stack: { justify: 'end' }, palette: { variant: 'solid' } } },
      off: { root: { stack: { justify: 'start' }, palette: { chrome: 'inverse-muted' } } },
    },
  },
  // An unconfigured switch reads as OFF (the safe default · the consumer always
  // passes `checked`). Both projections read this; neither hand-knows a default.
  defaults: { state: 'off' },
  // The PUBLIC API. NO public style axes (one pill, one size · the `state` axis is
  // the target of the `checked` bridge, never an attribute). The root is a
  // `switch`-role pressable (onPress · disabled · the a11y name). NO slots: the
  // control is content-free (`children?: never`), a label belongs to ListSwitch.
  api: {
    axes: [],
    themeScope: { accent: true },
    behaviour: { pressable: { target: 'root', role: 'switch', props: ['onPress', 'disabled', 'accessibilityLabel'] } },
    propMaps: { checked: { axis: 'state', true: 'on', false: 'off' } },
    slots: {},
  },
};
