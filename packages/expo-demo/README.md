# @nuri/expo-demo

The consumable **example app** — the canonical "how an app consumes the DS".
The app currently opens directly to the bottom-sheet demo: wallet tabs live
inside that screen, the list icon opens the sheet menu, and the menu launches
the Activity, Amount, Actions, and Form sheet examples.

```
src/
  screens/
    bottom-sheet-demo/ screen-local product/demo composition: wallet/status
                       home, internal wallet tabs, sheet menu, individual sheet
                       examples, and local sample form state. Files import the
                       design-system surface from the Metro/TS `@ds` alias.
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
