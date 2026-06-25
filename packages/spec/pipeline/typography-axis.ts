/* ══════════════════════════════════════════════════════════════════
 * NURI · TYPOGRAPHY AXIS · SOURCE OF TRUTH (TS) · N+35 · L3.1b · decision 70 / 67 / 73
 * ──────────────────────────────────────────────────────────────────
 * The `typography` axis of the cascade (docs/cascade.md · L3 · the THIRD and LAST
 * bespoke axis · decision 73 corrected dec 70: typography is bespoke, not agnostic),
 * authored ONCE in TS. typography is the prose funnel: a thin <nuri-typography>
 * custom-element WRAPPER that carries declarative, prop-based authoring (muted tone +
 * block alignment) over the foundation type scale. It is BESPOKE-but-single-sourced
 * (decision 67 / 73): NOT a member of the agnostic Field table (resolve-map.ts ·
 * box/stack), and deliberately NOT forced into that generic shape — resolve.ts treats
 * typography as a type-STEP ref, not a ViewStyle prop ("single-sourcing is the rule,
 * not uniformity" · the palette/interactive precedent).
 *
 * ── THE SCOPE LINE · this SoT is the WRAPPER ONLY (the critical sub-decision · §5) ──
 * The typography axis (decision 73's {size, emphasis, muted, align}) splits on web:
 *   · {muted, align}    → THIS wrapper (lib/components/typography/typography.css ·
 *                          the shell + the muted/align dispatch · authored here).
 *   · {size, emphasis}  → the foundation type SCALE (styles/typography.css · the 12
 *                          .nuri-type-{step} / --em utilities → --nuri-type-* primitives)
 *                          + typography.js / the factory at runtime. That is an L1/L2
 *                          TOKEN layer (decision 71/72 left it untouched · CSS-SoT) — a
 *                          separate later token flip, NOT this slice. This SoT authors
 *                          NO --nuri-type-* and NO .nuri-type-{step}.
 *
 * REVERSIBLE SHADOW (the L3.1 / palette / interactive discipline · roadmap/N+33 /
 * N+34): this SoT feeds pipeline/parsers/typography-css.js, which generates the SHADOW
 * web namespace CSS (build/css-preview/typography.css) PROVEN ≡ the hand
 * lib/components/typography/typography.css (the parity oracle). decision 2 (CSS is the
 * SoT) STANDS for the namespace layer — the hand typography.css is still the live
 * source. NOTHING flips here: the RN factory (typeKey via typeStyle · resolve.ts),
 * typography.js, the recipe layer, the pages are untouched. The SoT flip (the
 * decision-2 reversal for the namespace layer) is L3c, not this slice. No decision opened.
 *
 * ── The wrapper rule set, exactly (lib/components/typography/typography.css) ─────
 *   part           selector                              declaration(s)                 owner
 *   ──────────────────────────────────────────────────────────────────────────────────────────
 *   shell base     nuri-typography                       display: inline                EMITTER
 *   shell skeleton nuri-typography:not(:defined)         display: inline                EMITTER
 *   muted          nuri-typography[data-muted]           color: var(--nuri-text-muted)  this SoT
 *   align·start    nuri-typography[align="start"]        display: block; text-align: …  this SoT
 *   align·center   nuri-typography[align="center"]       display: block; text-align: …  this SoT
 *   align·end      nuri-typography[align="end"]          display: block; text-align: …  this SoT
 *
 * ── The SoT-vs-shell line (the surfaced sub-decision · like palette/interactive) ──
 * The element BASE + the :not(:defined) SKELETON are the SHELL — the emitter owns them
 * (mirrored from the hand CSS · the box/stack precedent · parsers/namespace-css.js
 * SHELLS), NOT the SoT. This SoT carries the DISPATCH only: `element` (the host name,
 * shared with the shell) + `dispatch` (muted + align). Unlike palette/interactive
 * (MERGED-NODE · no element · the class lands on the node), typography is a real
 * <nuri-typography> ELEMENT with a shell — so the SHELL lives here, like box/stack.
 *
 * ── THE LOAD-BEARING ORDER (the order-sensitivity RECURS on `display` · §6) ──
 * `display` is set by the base (inline · (0,0,1)), :not(:defined) (inline · (0,1,1)),
 * and the 3 align rules (block · (0,1,1)). The base loses to align by SPECIFICITY
 * (fine). But :not(:defined) and [align] are EQUAL specificity (0,1,1) — a pre-upgrade
 * aligned node (<nuri-typography align="start"> before the element upgrades) matches
 * BOTH, so `display` resolves by SOURCE ORDER. The emitter emits the :not(:defined)
 * shell BEFORE this dispatch (shell-first · the hand order), so align's `block` wins →
 * a pre-upgrade aligned node is already block (text-align takes effect even before
 * typography.js runs). This is the interactive Guard-D order-sensitivity, here on
 * `display`; the harness proves it (pipeline/typography-css.test.js · the order guard).
 *
 * ── The two attr FORMS differ (the SoT must spell each · decision 53 / 59) ──
 *   · muted → `[data-muted]` · a REFLECTED boolean attr (decision 53 · typography.js
 *     writes data-muted from the `muted` prop, CSS owns the colour) · a PRESENCE gate
 *     (no value). Paints the theme-cascaded chrome token --nuri-text-muted (re-resolves
 *     under a [data-theme] scope · scope-dependent · the palette posture).
 *   · align → `[align="<v>"]` · a PLAIN prop-driven HTML attr (decision 59 · NO JS
 *     reflection · survives #sync, which only rewrites className + data-muted) · an
 *     EQUALITY gate. Flips the inline host to `display: block` so text-align applies
 *     (the host then fills its container's inline size) + sets the logical, RTL-aware
 *     text-align. RN maps align → Text style={{ textAlign }} (decision 59 · N+11).
 *
 * Consumed by the pipeline via a type-strip + data:-URL import (loadAxis ·
 * pipeline/parsers/typography-css.js · reusing dimension-css.js#stripTypes · one strip
 * impl · decision 48): node 20 cannot import a .ts. Authored — like dimensions.ts /
 * palette-surface.ts / interactive-effects.ts — to keep the strip trivial: the only TS
 * apparatus is single-line `type` aliases and the trailing `as const satisfies` suffix,
 * with no imports. Base: decision 2 (reversed at L3c, not here) · 37 · 42 · 53 · 59 ·
 * 65.3 §6 · 67 · 70 · 73 · the L3.1 reversible-shadow discipline.
 * ══════════════════════════════════════════════════════════════════ */

// A declaration — a literal `[property, value]` pair (the value verbatim, incl. the
// `var(--nuri-text-muted)` token inline · no value transform · the interactive precedent).
type Decl = readonly [string, string];

// A dispatch rule = ONE CSS rule on the nuri-typography ELEMENT: a `name` (the channel ·
// for self-doc + emit errors), an attribute GATE appended to the element (the spelling
// is load-bearing — `[data-muted]` presence vs `[align="<v>"]` equality · see header),
// and its declarations. The emitter assembles the full selector = `${element}${attr}`.
type Rule = { name: string; attr: string; decls: readonly Decl[] };

// The axis = the custom-element host name (shared by the emitter's SHELL and the
// dispatch below) + the DISPATCH (muted + align). The shell itself is NOT here — the
// emitter owns it (the box/stack precedent · see header).
type TypographyAxis = { element: string; dispatch: readonly Rule[] };

// ── The typography AXIS (the bespoke single source · dispatch array order = the emit /
// hand-CSS order: muted, then align start→center→end · the order is shell-relative
// LOAD-BEARING for `display` · see header) ──
export const axis = {
  // The wrapper host (decision 53/59) — a real custom element (NOT a .nuri- merged
  // class · the one place typography diverges from palette/interactive). The emitter's
  // shell + every dispatch selector prefix with it.
  element: 'nuri-typography',
  dispatch: [
    // muted · the reflected boolean attr (decision 53 · JS reports data-muted, CSS owns
    // appearance). Presence gate → the theme-cascaded chrome text-muted token.
    { name: 'muted', attr: '[data-muted]', decls: [['color', 'var(--nuri-text-muted)']] },
    // align · the plain prop-driven HTML attr (decision 59 · no JS reflection). Each
    // value flips display:block (so text-align takes effect on the inline host) + sets
    // the logical, RTL-aware text-align. Enumerated (not a template) to keep the SoT
    // pure data — the emitter is a serializer, not an evaluator (the interactive precedent).
    { name: 'alignStart',  attr: '[align="start"]',  decls: [['display', 'block'], ['text-align', 'start']] },
    { name: 'alignCenter', attr: '[align="center"]', decls: [['display', 'block'], ['text-align', 'center']] },
    { name: 'alignEnd',    attr: '[align="end"]',    decls: [['display', 'block'], ['text-align', 'end']] },
  ],
} as const satisfies TypographyAxis;
