# @nuri/expo-demo

The consumable **example app** (N+19 · R1.5) — a small Expo screen built _only_
on [`@nuri/factory`](../factory)'s ergonomic, 1:1-with-web components
(`Button` / `IconAvatar` / `Topbar`), the RN team's reference for how the spec
is consumed. Run it from the repo root:

```sh
npm install                  # workspace-aware (wires @nuri/spec ← factory ← expo-demo)
npm run web -w @nuri/expo-demo   # expo start --web
```

The factory's headless render-smoke + resolution tests (the gated proof) live
in [`@nuri/factory`](../factory), not here.
