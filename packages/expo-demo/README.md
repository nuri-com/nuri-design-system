# @nuri/expo-demo

The consumable **example app** — the canonical "how an app consumes the DS".
The app currently opens directly to the sheet-gallery wallet/status surface:
wallet tabs live inside that screen, the list icon opens the sheet menu, and
the menu launches the Activity, Amount, Actions, and Form sheet examples. The
older `Wallet` / `Coin` / `Cash` screen files remain in the package for now,
but they are not the routed home surface in the current demo pass.

```
src/
  components/
    ui/index.ts        the DS MANIFEST — import from '@nuri/rn', re-export,
                       NOTHING ELSE. One file = the consumed DS surface.
    BottomBar.tsx      the app-owned stateful wrapper over the dumb DS bar
                       (items config + selected key + onSelect — the DS
                       tab-bar carries no value/state/routing). Not currently
                       routed by App.tsx.
  screens/
    Sheet.tsx          compatibility export for the current home surface.
    sheet-gallery/     screen-local product/demo composition: wallet/status
                       home, internal wallet tabs, sheet menu, individual sheet
                       examples, and local sample data.
    Wallet.tsx · Coin.tsx · Cash.tsx    older pure DS composition screens kept
                       for reference, not currently routed.
App.tsx                the navigator role: safe-area ownership (decision 58),
                       the NuriThemeProvider root, OverlayProvider placement,
                       and the app-owned demo state. Dark mode remains wired as
                       an internal affordance for future proofing, not an
                       exposed product feature.
```

Run it from the repo root:

```sh
npm install                  # workspace-aware (wires @nuri/spec ← @nuri/rn ← expo-demo)
npm run web -w @nuri/expo-demo   # expo start --web
```

The DS's headless render-smoke + resolution tests (the gated proof) live in
[`@nuri/rn`](../rn), not here; this package's gate is `npm run typecheck`.
