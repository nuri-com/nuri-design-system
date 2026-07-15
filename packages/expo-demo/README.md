# @nuri/expo-demo

The consumable **example app** — the canonical "how an app consumes the DS".
The app opens directly to the playground screens surface. Wallet tabs switch
between static mockup files inside the same `Screen` / `Scroll` scaffold as
the playground screens page, the list icon opens the sheet menu, and the menu
launches the Activity, Amount, Actions, and Form sheet examples.

```
src/
  screens/
    index.tsx          the route surface. Owns ROUTING state only: the visible
                       page and the selected wallet tab. Sheets and their
                       state live with the screen that launches them.
    Home.tsx           wallet/status home surface. Owns the Screen, Topbar,
                       Scroll body, and WalletTabs composition.
    Bitcoin.tsx        static tab mockups — file ≡ component ≡ the WalletTab
    Bank.tsx           value that renders it ('bitcoin' | 'bank' | 'euro').
    Euro.tsx
    Menu.tsx           the sheet launcher screen. Mounts each sheet NEXT TO
                       its button (a <Modal> registers into the
                       OverlayProvider outlet from anywhere — nothing needs
                       hoisting to the root) and owns the sample form values.
  components/
    WalletTabs.tsx     app-owned wrapper over stateless DS TabBar/TabBarItem,
                       mapping selected/onSelect into selected/onPress.
  hooks/
    useSheet.ts        DEMO-local prototype (deliberately NOT @ds): the
                       open/show/onClose triple every declarative sheet
                       consumer repeats. DS adoption is a separate decision,
                       to be made on evidence from this usage.
  sheets/
    ActivitySheet.tsx
    AmountSheet.tsx
    ActionsSheet.tsx
    FormSheet.tsx
App.tsx                the navigator role — exactly the seams the DS
                       deliberately does not own: the native safe-area lib
                       root + the ONE useSafeAreaInsets() read (decision 58 ·
                       passed to NuriRoot as plain numbers), the Expo
                       StatusBar, and the mode state. Everything else —
                       theme, overlay, canvas paint, safe-area environment,
                       toast runtime, and their load-bearing ORDER — is composed by the DS's
                       <NuriRoot>. Dark mode remains wired as an internal
                       affordance for future proofing, not an exposed product
                       feature.
```

Run it from the repo root:

```sh
npm install                  # workspace-aware (wires @nuri/spec ← @nuri/rn ← expo-demo)
npm run web -w @nuri/expo-demo   # expo start --web
```

The DS's headless render-smoke + resolution tests (the gated proof) live in
[`@nuri/rn`](../rn), not here; this package's gate is `npm run typecheck`.
