# @nuri/expo-demo

The consumable **example app** — the canonical "how an app consumes the DS".
The app currently opens directly to the bottom-sheet demo: wallet tabs live
inside that screen, the list icon opens the sheet menu, and the menu launches
the Activity, Amount, Actions, and Form sheet examples.

```
src/
  screens/
    index.tsx          route/controller for the bottom-sheet demo. Owns the
                       app state: page, selected wallet tab, open sheet, and
                       sample form values.
    Home.tsx           wallet/status home surface.
    Menu.tsx           button stack that opens each sheet example.
  components/
    WalletTabs.tsx     app-owned wrapper over stateless DS TabBar/TabBarItem,
                       mapping selected/onSelect into selected/onPress.
  sheets/
    ActivitySheet.tsx
    AmountSheet.tsx
    ActionsSheet.tsx
    FormSheet.tsx
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
