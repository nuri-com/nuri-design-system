# @nuri/expo-demo

The consumable **example app** — the canonical "how an app consumes the DS".
The app opens directly to the playground screens surface. Wallet tabs switch
between static mockup files inside the same `Screen` / `Scroll` scaffold as
the playground screens page, the list icon opens the sheet menu, and the menu
launches the Activity, Amount, Actions, and Form sheet examples.

```
src/
  screens/
    index.tsx          route/controller for the demo. Owns the
                       app state: page, selected wallet tab, open sheet, and
                       sample form values.
    Home.tsx           wallet/status home surface. Owns the Screen, Topbar,
                       Scroll body, and WalletTabs composition.
    Coin.tsx           static bitcoin tab mockup.
    Wallet.tsx         static bank tab mockup.
    Cash.tsx           static euro tab mockup.
    Menu.tsx           button stack that opens each sheet example.
  components/
    WalletTabs.tsx     app-owned wrapper over stateless DS TabBar/TabBarItem,
                       mapping selected/onSelect into selected/onPress.
  sheets/
    ActivitySheet.tsx
    AmountSheet.tsx
    ActionsSheet.tsx
    FormSheet.tsx
App.tsx                the navigator role: native safe-area reading
                       (decision 58), the NuriThemeProvider root, and
                       OverlayProvider placement. Route screens apply safe-area
                       through the DS Screen primitive. Dark mode remains wired
                       as an internal affordance for future proofing, not an
                       exposed product feature.
```

Run it from the repo root:

```sh
npm install                  # workspace-aware (wires @nuri/spec ← @nuri/rn ← expo-demo)
npm run web -w @nuri/expo-demo   # expo start --web
```

The DS's headless render-smoke + resolution tests (the gated proof) live in
[`@nuri/rn`](../rn), not here; this package's gate is `npm run typecheck`.
