# Migration test briefing

<!-- VARIABLE FILL -->

# Migration test pair · <name>

<!-- 1-2 sentences: what surface(s) the pair exercises, what new
     dimension over the canonical button-matrix pair (if any). -->

## Web side scope

- Path: `docs/migration-tests/<name>/index.html`
- HTML + page-local CSS only. **No shell, no NAV, no `<nuri-page>`** —
  this is not a docs page; it's evidence for
  [RISKS R5](../docs/RISKS.md#r5--thesis-not-validated-end-to-end-the-meta-risk).
- Load tokens / components from the same paths the docs site uses
  (`../../../styles/`, `../../../lib/components/`).
- Canvas: 390px viewport mock for mobile fidelity.

## RN side contract

- Path: `docs/migration-tests/<name>/index.tsx`
- Must typecheck under
  `npx tsc -p docs/migration-tests/<name>/tsconfig.json` with
  `--jsx react-native --strict`.
- **No Expo runtime.** The typecheck IS the deliverable. No bundler,
  no native build.
- Imports semantic tokens from `'../../../build/tokens'` (machine-
  generated since N+5; shape: `{ Accent, Theme, chrome, accent }`).
  Per-component numerics live at
  `'../../../build/components/<name>'` since N+6.0.3 (decision 34) ·
  for Button: `import { button } from '../../../build/components/button'`.
  TokenPath references resolve through a consumer-side
  `resolveToken(tokens, path)` helper against
  `'../../../build/token-paths'`.
- Mirror the web-side cross-product 1:1 in row order and instance count
  so the diff is reviewable side-by-side.

## tsconfig

```jsonc
{
  "compilerOptions": {
    "jsx": "react-native",
    "strict": true,
    "noEmit": true,
    "isolatedModules": true,
    "target": "es2020",
    "module": "esnext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["index.tsx"]
}
```

## FRICTIONS capture protocol

- New file: `docs/migration-tests/<name>/FRICTIONS.md`
- One entry per friction. Format:
  `**F-<TAG>-N** · gap · where · workaround · proposed · target`
- Examples of TAGs in use: `LAYOUT`, `SCOPE`, `PRESSED`, `FOCUS`,
  `TOKEN`, `FONT`, `DISABLED`. Re-use existing TAGs if the friction
  is the same class as a previous pair's finding; new TAGs only for
  genuinely new gap classes.
- After capture, fold into
  [`docs/RISKS.md`](../docs/RISKS.md) R1 with locations + workarounds.
- Positive controls (1:1 surfaces that survived translation
  cleanly) are valuable signal too — record them so the catalogue
  doesn't skew pessimistic.

<!-- FIXED -->

## Anti-goals

- **No smoothing over gaps with hand-rolled infrastructure.** If the
  RN side needs a Stack primitive, hand-roll a `View` with `flex` and
  capture the friction — don't build a reusable `<Stack>` here. The
  pair exists to surface gaps, not paper over them.
- **No production-quality polish on the RN side.** First-draft RN,
  intentionally unpolished. The point is to see how mechanical the
  translation actually is.
- **No new component on either side.** If the pair needs a component
  Nuri doesn't ship, capture it as a friction and either stub it (with
  a comment naming what's missing) or skip the row that needs it.
- **No edits to `lib/components/` or `styles/`.** This session is
  about translation, not DS extension. Frictions go in
  FRICTIONS.md and then in RISKS; locked decisions only happen
  through a main session, not a migration test.
- **No new top-level surfaces.** The pair lives under
  `docs/migration-tests/` — not `playground/`, not `pages/`.

## Context (for the agent reading cold)

You are testing Nuri's thesis: agent-composed web prototypes
translate to RN by mechanical translation. The thesis is **n=1
validated** at this stage (button-matrix pair, N+4). Each new
translation pair raises n and either confirms or breaks the thesis.

Locked decisions live in [`decisionlog.md`](../decisionlog.md);
[decision 27](../decisionlog.md#27-theme-provider--custom-orthogonal-not-cross-product-registry--n55)
specifies the RN-side Context shape (orthogonal merge-on-override,
not cross-product). For the wiring spec see
[`pages/implementation-guide.html`](../pages/implementation-guide.html).
The canonical reference pair is
[`docs/migration-tests/button-matrix/`](../docs/migration-tests/button-matrix/)
— mirror its directory shape (`index.html`, `index.tsx`,
`tsconfig.json`, `FRICTIONS.md`).

At session close, run [`skills/close-out-session.md`](../skills/close-out-session.md):
spawn the audit subagent (see [`prompts/closeout-audit.md`](./closeout-audit.md)),
fold FRICTIONS into RISKS, refresh `roadmap/N+X.md`.
