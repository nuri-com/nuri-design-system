# @nuri/expo-demo

The consumable **example app** — the canonical "how an app consumes the DS".
Three real screens (**wallet · coin · cash**, translated from the playground's
[`tab-bar` boards](../playground/pages/tab-bar.html)) built _only_ on
[`@nuri/rn`](../rn), wired by an app-owned bottom bar. The structure IS the
example:

```
src/
  components/
    ui/index.ts        the DS MANIFEST — import from '@nuri/rn', re-export,
                       NOTHING ELSE. One file = the consumed DS surface.
    BottomBar.tsx      the app-owned stateful wrapper over the dumb DS bar
                       (items config + selected key + onSelect — the DS
                       tab-bar carries no value/state/routing).
  screens/
    Wallet.tsx · Coin.tsx · Cash.tsx    pure DS composition — primitives +
                       generated components + their typed props ONLY (no
                       StyleSheet, no raw RN hosts, no magic numbers).
App.tsx                the navigator role: safe-area ownership (decision 58),
                       the NuriThemeProvider root, the route state + tab-items
                       DATA, and the theme-toggle HARNESS strip (the one
                       sanctioned non-DS spot).
```

Run it from the repo root:

```sh
npm install                  # workspace-aware (wires @nuri/spec ← @nuri/rn ← expo-demo)
npm run web -w @nuri/expo-demo   # expo start --web
```

The DS's headless render-smoke + resolution tests (the gated proof) live in
[`@nuri/rn`](../rn), not here; this package's gate is `npm run typecheck`.
