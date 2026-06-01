# `<nuri-scope>` · per-component notes

Tier 3 primitive · web entry point [`scope.js`](./scope.js).

`<nuri-scope>` mirrors its `mode` / `accent` / `font` / `density` /
`neutral` props onto `data-*` attributes (only translation: `mode` →
`data-theme`) so that any semantic / component token nested inside it
re-resolves through the new cascade scope. `display: contents` keeps
it invisible in layout.

The `font` prop is **web-only** — an emulation overlay so designers
can preview iOS / Android / Pixel system fonts in the docs. On RN
the platform supplies its own system font stack natively; no
`font` prop migrates, no `Font` type ships. See
[decision 27.1 amendment](../../../decisionlog.md#271-amendment--n57).

The web side is the canonical implementation. The RN counterpart is
spec-locked but **not implemented in this directory** — the working
component file lands in the migration-test pair that first exercises
multi-dimensional scope (see [decisions 27 + 28 (N+5.5)](../../../decisionlog.md)
and [RISKS R1 F-SCOPE-1](../../../docs/RISKS.md#r1--webrn-api-11--props-parity--behavioural-parity)).

## RN counterpart · `NuriScope` spec (decision 27 · N+5.5)

The RN side is **orthogonal**, not a cross-product theme registry.
Each dimension is one entry in a single `NuriThemeContext` with
merge-on-override semantics; consumers spread additional dimensions
onto a child `<NuriScope>` without enumerating themes. Pre-computed
(∏ dimensions) theme tuples are explicitly rejected — they scale
O(∏ dims) and break the composability decisions 1, 6, 9 and P5 are
predicated on (8 accent × 3 font × 2 density × 7 neutral = 672
themes is the roadmap reductio; even though `font` itself does not
migrate per amendment 27.1, the math still holds for the web side
and motivates rejection of cross-product registries).

### Locked shape

- **Single React Context** · `NuriThemeContext` carries one entry per
  dimension (`mode`, `accent`, `density`, `neutral`). Default values
  mirror the web `<html data-*>` defaults: `mode: 'light'`,
  `accent: 'lilac'`, others undefined until their CSS counterparts
  exist. `font` is web-only (amendment 27.1) and is NOT a context
  entry.
- **Merge-on-override** · `<NuriScope accent="neutral">` reads the
  ambient context and emits a new value `{ ...ambient, accent:
  'neutral' }`. Unspecified dimensions inherit; specified ones win.
  No dimension is "all-or-nothing" — `accent` can flip without
  redeclaring `mode`.
- **Props 1:1 with web (minus `font`)** · `mode`, `accent`,
  `density`, `neutral` — same names, same value sets. `font` exists
  on the web `<nuri-scope>` for emulation overlay only; it has no RN
  counterpart. The web→RN translation is attribute → prop, no
  per-dimension synonym list.
- **One `useContext` lookup** · Component-side consumption is a
  single `const { accent, mode, ... } = useContext(NuriThemeContext)`,
  then destructure. No per-dimension Provider chain.
- **Unistyles is consumed for stylesheet ergonomics only** if used
  at all · its theme registry is bypassed. The runtime values come
  from `NuriThemeContext`, not from `UnistylesRuntime.setTheme(...)`,
  because the registry would have to enumerate every (∏ dims) tuple.

### Sketch (NOT working code — for orientation only)

```ts
// Locked shape. Implementation lands in the first multi-dim
// migration test (N+6 Path A/B or later).
type NuriThemeValue = {
  mode: Theme;
  accent: Accent;
  density?: Density;
  neutral?: Neutral;
  // No `font` — web-only per amendment 27.1.
};

const NuriThemeContext = React.createContext<NuriThemeValue>({
  mode: 'light',
  accent: 'lilac',
});

const NuriScope: React.FC<Partial<NuriThemeValue> & { children: React.ReactNode }> = ({
  children,
  ...overrides
}) => {
  const ambient = React.useContext(NuriThemeContext);
  const merged = { ...ambient, ...overrides };
  return <NuriThemeContext.Provider value={merged}>{children}</NuriThemeContext.Provider>;
};
```

### Open at next migration pair (N+6+)

- Whether `NuriScope` ships as one composite Provider (this spec) or
  as N per-dimension Providers nested by a tiny helper. The composite
  matches the web `<nuri-scope>` ergonomics 1:1; per-dimension is
  what F-SCOPE-1 originally surfaced. Decision N+5.5 picks composite.
- Whether the per-dim type literals (`Accent`, `Theme`, future
  `Density` / `Neutral`) come from `build/tokens.ts` (emitter
  already exports `Accent` + `Theme` for any axis surfaced by a
  discovered group) or from a hand-curated type file. Today only
  `Accent` + `Theme` exist; the question reactivates when the second
  migrated dimension lands.
- Whether `mode` keeps its name on RN or aligns with `theme` (the web
  internal name). Today `mode` survives as the public API — the
  attribute → `data-theme` translation is web-implementation, not a
  consumer concern.

### Why this section is here, not in `lib/components/button/`

Decision 26 separates DS surfaces from docs chrome. `lib/components/`
holds DS surfaces; per-component READMEs live next to the surface they
describe. This is the per-component RN spec for `<nuri-scope>` — it
belongs here, not in a top-level docs surface.
