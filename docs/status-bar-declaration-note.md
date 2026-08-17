# Note · status-bar style for dark surfaces (deferred design)

> **Status: NOTE, not a commitment.** No admission record, no brief, nothing implemented.
> Written 2026-08-17 during the Scan exploration so the analysis is not re-derived from
> scratch. Whoever picks this up: this is a hypothesis with two verified facts and one
> verified refutation — re-check everything against the tree.

## The need (observed, not hypothetical)

A screen whose top edge paints dark — the Scan recipient screen's camera region — gets the
app's light-theme status-bar glyphs (dark icons on a dark camera, unreadable). Operator
observed it on an Android device, 2026-08-17, running the `Scan` story in expo-demo.

The production consumer this generalizes to is the shared QR-scanner step
(`QrScannerModal`, used by the Bitcoin-send and Wallet-send flows — see
[flow-inventory.md](flow-inventory.md) §6), plus any future full-bleed dark surface.

## Why the DS does not cover it today (deliberate, documented)

There is **no** status-bar surface anywhere in `@nuri/rn`, `@nuri/spec`, or
`@nuri/prototype` — verified by grep for `StatusBar` / `barStyle` / `SystemUI`. The position
is written down in [modal-migration.md](modal-migration.md) (the `Modal mode` arc, PR #193):
status-bar icon style is owned by the consumer's app-shell `StatusBar`; Modal does not
change it.

Note the observed screen is **not** a Modal at all — it is a `Screen` with a nested dark
scope. What drives the glyphs is the app shell's own `StatusBar`
(`packages/expo-demo/App.tsx`), whose style follows the app's global theme state and knows
nothing about a screen-local scope.

## The workaround that works today (one line, reliable)

Mount `<StatusBar style="light" />` (expo-status-bar) inside the dark screen's subtree.
Instances stack, the innermost wins while mounted, and it restores on unmount.

This is reliable here for a non-obvious reason worth recording: the DS `Modal` is **not**
React Native's native `Modal` — it is an in-tree absolutely-positioned overlay through the
OverlayProvider outlet (`packages/rn/primitives/Modal.tsx` imports `Animated`/`Pressable`/
`View`, never RN `Modal`). So the usual Android trap — a `StatusBar` inside a native modal
window silently doing nothing, because the dialog is a separate window — **does not apply**
to Nuri surfaces. A commented example sits in `packages/expo-demo/src/screens/Scan.tsx`.

Android specifics at time of writing: Expo SDK 54, `expo-status-bar` ~3.0.9, RN 0.81.5, no
`androidStatusBar` config in `app.json`. Under edge-to-edge the background-colour knob is a
no-op; `style` (icon colour) is the working lever.

## The proposed design, if it is ever picked up: **declare, don't apply**

The DS never calls a native API and never imports `expo-status-bar`. It only publishes what
mode the surface owning the top edge is painted in; the app shell — which already owns the
`StatusBar`, in the navigator role — applies it.

This is the mirror of decision 58: safe-area = the app reads native and passes numbers
**in**; status bar = the DS resolves composition and passes a mode **out**. The native call
stays in the app shell either way.

```tsx
// consumer, once, inside NuriRoot — replaces the app-theme-driven expression
function AppStatusBar() {
  const mode = useNuriTopEdgeMode();            // 'light' | 'dark' — the SURFACE
  return <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />;
}
```

Mechanism: a module-level registry, an exact copy of the shape already proven in
`packages/rn/primitives/modal-stack.ts` (module array + listener `Set` +
`useSyncExternalStore` + an `/** @internal */` test-reset helper — module registrations leak
across Jest cases without it). Surfaces that actually own the top edge register while
mounted: `Screen` and `Modal mode="full"`. Sheets must **not** register — they never reach
the top edge. Resolution mirrors `useIsTopmostFullModal`: the last registered full modal
wins, else the last registered screen.

## ⚠ The refutation — read this before designing anything

The obvious version of the above — *"the surface registers the theme mode resolved at its
own position"* — **does not work**, and the reason is structural, not incidental:

`NuriScope` sits **inside** `Screen`, not around it. Verified in both prototypes:
`packages/expo-demo/src/screens/Scan.tsx` (`Screen` at line 40, `NuriScope mode="dark"` at
line 46) and `packages/expo-demo/src/screens/Move.tsx` (scope nested inside
`Screen` > `Scroll` > `View`). Scoping inside is the house idiom: scopes re-scope *parts*.

So a `Screen` reading `useNuriTheme()` reads the **ambient** mode — `light` on a screen that
paints black edge to edge — and would confidently declare the wrong value. The failure is
silent: the author writes the natural composition and simply gets no effect.

Consequence for the trade study: **derive-from-scope is eliminated.** The surviving option is
an explicit optional declaration on the two top-edge surfaces (working spelling
`<Screen topEdge="dark">` / `<Modal mode="full" topEdge="dark">`; name unratified). Its
failure mode is strictly better — a wrong declaration is visible on first run and is a
one-line fix, versus a silently ignored one. It is also *less* code, not more: no convention
to teach, no dependence on where the author put the scope.

An earlier claim made in conversation — that deriving from the scope "cannot drift by
construction" — was wrong, and was made before tracing the nesting. Do not resurrect it.

## Compatibility (assessed, favourable)

Purely additive → admission class **Extension**. Specifically:

- New public export (a hook) + one optional prop on two hand-written primitives. Nothing
  removed, renamed, or narrowed; existing consumer code compiles unchanged.
- `Screen` and `Modal` are hand primitives, not descriptors: no `contract.ts` edit, no
  frozen-schema/Guard-F pin move, no codegen, no generated-file movement (prove by regen,
  do not assume).
- **Non-adopters get nothing, by construction**: surfaces write to a registry that is never
  read unless the app mounts the reader. No render output changes. Assert this with a test,
  in the shape of the Bleed acceptance criterion ("compositions without Bleed are
  byte-identical") — an architect condition on #212, and the right precedent here.
- No new hidden ancestor requirement: `NuriThemeContext` carries a real default
  (`buildNuriTheme('lilac', 'light')`, `packages/rn/theme.tsx`), so a bare `<Screen>` with no
  provider still resolves. This was the main silent-break risk and it is neutralized.
- Expected deliberate pin move: the export list in
  `packages/rn/__tests__/public-surface.test.ts`.
- For the vendored consumer, a pin bump is safe: additive, nothing to migrate; adopting means
  *deleting* their per-screen `StatusBar` lines, not adding any.

## Open items to rule on, when and if this is picked up

1. Explicit declaration vs. any better third option (the trade study must be re-opened
   honestly; the refutation above only removes one branch).
2. The prop and hook names — mechanical, house-consistent (`useNuriTheme` /
   `useNuriSafeAreaInsets` are the family).
3. Which surfaces may declare: `Screen` and `Modal mode="full"` only, presumed.
4. The `scrim="dim"` case: a sheet's 7% black over a light screen darkens the top edge
   slightly — presumed not enough to flip glyphs, but it should be an explicit rule rather
   than an accident.
5. Web projection: the hook is RN-only (the web twin is custom elements and has no hook API;
   `useNuriTheme` is already RN-only). The loose future analogue is
   `<meta name="theme-color">`. **This is the weakest point against the two-projection
   invariant and needs the architect's eye**; if a parity or naming guard trips, that is a
   stop-and-surface finding, not a guard to weaken.
6. Stable-doc updates are part of the public surface here: the
   [modal-migration.md](modal-migration.md) sentence stays true (the DS still does not
   *change* the status bar) but should point at the declaration; check whether
   [primitives-contract.md](primitives-contract.md) needs rows for `Screen`/`Modal`.

## Why it was deferred (2026-08-17)

Not because the problem above is hard — it is a resolved design detail that makes the
feature cheaper. The cost is dominated by process rather than code: new public surface pulls
the full admission sequence (record → independent architect verdict → Ready → brief →
session) plus the unresolved RN-only parity question, while a reliable one-line consumer
workaround already exists. The queue ahead of it (List gutter admission, #197 policy
amendment, the #200 root correction, the consumer pin bump, the device pass) is worth more.

Revisit when a real dark surface ships in the production app, or when a second consumer
names the same need — that is the point at which the generality argument writes itself.
