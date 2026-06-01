---
name: pipeline-dtcg-export
description: Use this skill when extending the CSS → DTCG → RN pipeline (`pipeline/parsers/{primitive,semantic,components}.js`) — adding a new cascade dimension, debugging classify-by-cascade, or wiring a remaining slice (Style Dictionary conditional, Unistyles, typography). Pipeline sources live in `pipeline/`; outputs in `build/` are 100% generated, never hand-edited (decision 35 · N+6.0.4).
---

# Skill · Pipeline / DTCG export

**Thin slice landed in N+3.5** (colour primitive → DTCG JSON);
**semantic-cascade slice landed in N+5** (semantic tokens →
per-(accent × theme) literals in `build/tokens.ts`). Style Dictionary
+ Unistyles consumption slices still pending. See
[`roadmap/index.md`](../roadmap/index.md) "Pipeline" workstream and
[`docs/RISKS.md`](../docs/RISKS.md) R2.

## Slices that exist today

Source → output:

```
styles/tokens-primitive.css   (every --nuri-color-* declaration)
            │  postcss AST walk · ignores var(...) aliases
            │  pipeline/parsers/primitive.js · readPrimitives + buildDtcg
            ▼
build/tokens.json             (DTCG-nested · 216 colour tokens)

styles/tokens-primitive.css + styles/tokens-semantic.css
            │  pipeline/parsers/semantic.js · cascade walker +
            │  var()-chain resolver · (accent × theme) cross-product
            │  · classifySemantic groups vars by their [data-*]
            │    dimensionality signature · emitTokensTs derives
            │    nested-export shape from each group's dims
            ▼
build/tokens.ts               (18 semantic tokens grouped into
                               nested exports · machine-generated ·
                               shape = which [data-*] blocks
                               declare each var · N+5.5 decision 28)
```

`pipeline/tokens-parser.js` is the orchestrator — it runs both slices
on `npm run build` and re-exports the parser helpers for the
test file. The cascade matcher in `pipeline/parsers/semantic.js#selectorMatches`
is a port of `lib/docs/tokens.js#selectorMatches`; keep them in sync.

Tests at [`pipeline/tokens-parser.test.js`](../pipeline/tokens-parser.test.js)
cover both slices:
- **Primitive round-trip** · regex-scans `tokens-primitive.css`
  independently of the parser; asserts every `--nuri-color-*` value
  survives unchanged into `build/tokens.json`.
- **Semantic cross-product** · hand-derived oracle table maps every
  semantic token to its expected literal per (accent × theme);
  asserts the parser's `resolveSemanticCrossProduct` agrees. Includes
  an explicit P4 asymmetry check (lilac frozen on solid/solid-pressed/
  on-solid; saturated swap on neutral; partial-redeclare in block 6
  for accent-bg-subtle).

Commands:

```
npm install          # postcss is the only runtime dep
npm run build        # writes build/tokens.json AND build/tokens.ts
npm test             # node:test · primitive + semantic assertions
```

## Build parameters

`node pipeline/tokens-parser.js --neutral=<scale>` — selects which
neutral scale resolves the `--nuri-color-neutral-N-*` aliases at
build time. Allowed: `gray`, `mauve`, `slate`, `sage`, `olive`,
`sand`, `cream`. Default: `cream`
([decision 31](../decisionlog.md#31-default-neutral-scale--cream--cli-parameter---neutral=scale--n58)).

The exploration page
([`pages/foundations/colour/exploration.html`](../pages/foundations/colour/exploration.html))
exposes the same dimension as `data-neutral` for web-side preview
without rebuilding.

Invalid scales error cleanly with the allowed-list message; no
env-var fallback (CLI-only by decision 31).

Drop-in contract (**N+6.0.3 shape**, decision 34): the migration
pair at `docs/migration-tests/button-matrix/index.tsx` imports the
runtime sets `{ Accent, Theme, chrome, accent }` from
`'../../../build/tokens'`, the per-component numerics
`{ button }` from `'../../../build/components/button'`, and the
`TokenPath` discriminated union from `'../../../build/token-paths'`.
`chrome` is `Record<Theme, { bgCanvas, bgSubtle, bgStrong, bgPressed,
bgInverse, textPrimary, textMuted, textOnInverse, borderSubtle,
borderDefault, borderStrong, focusRing }>`; `accent` is
`Record<Accent, Record<Theme, { fg, solid, solidPressed, onSolid,
bgSubtle, bgSubtlePressed }>>`. Each export's nesting depth equals
the dimensions its source CSS vars span across `[data-<dim>=…]`
selectors — `classifySemantic` derives the signature, `GROUP_NAMES`
maps it to a group name, the emitter iterates groups. Adding a new
dimension cascade block (font / density / neutral …) auto-extends
the discovered groups; unmapped signatures fail the build until
`GROUP_NAMES` gets the new entry. The completeness test in
`pipeline/tokens-parser.test.js` enforces that every declared semantic
var classifies to a known signature AND renders into `tokens.ts`
under its expected group + leaf — no hardcoded export list to drift.

**Per-component files** (`build/components/<name>.ts` — today:
`button.ts`) carry the component-token numerics. References to
pipeline-inlined primitive sets resolve to literal numerics at
build (e.g. `--nuri-button-min-height: var(--nuri-px-60)` →
`minHeight: 60`); references to runtime sets emit as
`'<group>.<leaf>' as const satisfies TokenPath` (e.g.
`--nuri-button-solid-bg: var(--nuri-accent-solid)` → `solidBg:
'accent.solid' as const satisfies TokenPath`). The consumer
dereferences the TokenPath strings against the live (accent × theme)
slice of the runtime tokens via a `resolveToken(tokens, path)`
helper (sketch in the migration pair; production implementations
live in the consuming app per decision 34's "consumer-side
boundary" framing). The pre-N+6.0.3 `buttonBase` constants block is
gone — the emitter reads from live CSS on every build, so
primitive renames flow through mechanically.

**Pre-N+5.5 shape** (no longer current): six flat `accentX` exports
(`accentSolid`, `accentFg`, …). The N+5.5 refactor collapsed these
into the single nested `accent` export. If a consumer reads
`accentSolid[a][t]`, the migration is `accent[a][t].solid`.

**Pre-N+6.0.3 shape** (no longer current): `buttonBase` was a
constant-held export inside `tokens.ts` (numerics manually copied
from `lib/components/button/button.css` @layer tokens — drift class
F-FONT-1). The N+6.0.3 per-component emitter walks the CSS source
directly; the `BUTTON_BASE` block and the `buttonBase` export are
gone. Migration: `buttonBase.minHeight` → `button.minHeight` (with
the import path change above); the value flips from `56` (stale at
the time of removal) to `60` (live CSS source).

DTCG shape (`build/tokens.json`):

```jsonc
{
  "color": {
    "gray": {
      "1": {
        "light": { "$type": "color", "$value": "#fcfcfc" },
        "dark":  { "$type": "color", "$value": "#111111" }
      }
    },
    "black": {
      "alpha": {
        "1": { "$type": "color", "$value": "rgba(0, 0, 0, 0.05)" }
      }
    }
  }
}
```

Path comes from the CSS var name minus the `--nuri-` prefix, split on
dashes. Themed scales nest 4-deep (`scale.step.theme`); alpha tokens
are 3-deep with no theme leaf (AGENTS.md hard-rule 3 — theme-invariant).
Status colour primitives do NOT ship today — they land as full Radix
scales (Jade / Amber / Red / Blue) with the first status-using
component (N+5.7 cleanup); the path shape (3-deep or 4-deep) is
decided at that point.

## Order of remaining slices

1. **Style Dictionary · conditional** — gated on a second target
   platform (iOS / Android / Figma sync) per
   [decision 2's N+5.5 amendment](../decisionlog.md#21-amendment--n55).
   For RN-only, the custom emitter at `pipeline/parsers/semantic.js` is
   terminal; classify-by-cascade already derives the shape from the
   source CSS. SD re-enters scope if a second target lands.
2. **Unistyles consumption** — adaptive themes for `mode`, runtime
   `updateTheme()` for accent, React Context for Tier 3 (per
   [decision 27](../decisionlog.md#27-theme-provider--custom-orthogonal-not-cross-product-registry--n55)
   the Tier-3 RN side is a single orthogonal `NuriThemeContext`, not
   Unistyles' theme registry). The consumer also ships a
   `resolveToken(tokens, path)` implementation against the
   `TokenPath` union per [decision 34](../decisionlog.md#34-per-component-files--tokenpath-union--set-policy--pipeline-emit-shape--n603)
   — Unistyles' theme function and a custom Context selector consume
   `button.ts` identically. A real Expo render closes the second
   half of [RISKS R5](../docs/RISKS.md#r5--thesis-not-validated-end-to-end-the-meta-risk).
3. **Component-token CSS walk** — landed at N+6.0.3 (decision 34).
   `pipeline/parsers/components.js` walks `lib/components/<name>/
   <name>.css` @layer tokens and emits `build/components/<name>.ts`
   with literal numerics for pipeline-inlined references + TokenPath
   strings for runtime references. F-FONT-1 retired as a structural
   class (component numerics now flow from live CSS, not a
   hand-maintained constants block). Extending to a new component is
   one line — add the component name to the `COMPONENTS` array in
   `pipeline/tokens-parser.js`.
4. **Full pipeline** at 3–4 components, with per-component
   `<name>.spec.json` extracted from the page DOM (`data-part`,
   `data-token`, etc. per AGENTS.md hard-rule 18).

## Constraints

- The browser parser at [`lib/docs/tokens.js`](../lib/docs/tokens.js)
  stays alive for the docs site (reads from `document.styleSheets`).
  Node parser is a separate file — don't try to share the same
  source; the two read environments are too different.
- Inferred-type table in `pipeline/parsers/primitive.js` `TYPE_PREFIXES`
  mirrors the browser parser's. Keep them in sync when extending.
  Same for `selectorMatches` between the Node and browser semantic
  walkers — they're independent ports of the same cascade rules.
  Both tables ship `--nuri-px-*` → `dimension` (direct-pixel
  primitive · [decision 32](../decisionlog.md#32-primitive-scale-uses-direct-pixel-naming---nuri-px-n--n60))
  alongside the defensive `--nuri-size-*` → `dimension` entry held
  for the semantic sizing layer arriving in N+6.1.
- DO NOT bake schema decisions into doc pages before the
  matching slice runs — DTCG `$type` for typography composite
  tokens is still spec-evolving.
- The semantic walker emits per the `--neutral=<scale>` CLI flag
  ([decision 31](../decisionlog.md#31-default-neutral-scale--cream--cli-parameter---neutral=scale--n58)),
  default `cream`. When a neutral choice locks, drop the alias
  blocks and have the semantic CSS reference the chosen scale
  directly — `pipeline/parsers/semantic.js` already handles literal chains.
- The emitter is **classify-by-cascade**
  ([decision 28](../decisionlog.md#28-emitter-shape-derives-from-cascade-structure-not-from-a-hardcoded-list--n55)).
  Each semantic var's tokens.ts shape is derived from which
  `[data-<dim>=…]` blocks declare it. Don't reintroduce hardcoded
  export lists — adding a new dimension is "register an
  `AXIS_REGISTRY` entry + a `GROUP_NAMES` signature, done." Don't
  rename `chrome` or `accent` — group names are stable consumer API.
  Don't rename a CSS var to make the classifier happy; fix the
  classifier (or the cascade) instead.
