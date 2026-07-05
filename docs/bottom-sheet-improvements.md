# BottomSheet primitive — improvement deltas

> **Status:** working design record · improvements to `packages/rn/primitives/BottomSheet.tsx`
> **Origin:** "Improvement Doc 1 — BottomSheet primitive: flow-readiness deltas" (external proposal,
> 2026-07-04), re-scoped 2026-07-05 against the current arc.
> **Context:** gorhom was removed to ship zero consumer dependencies; the sheet is a hand-rolled
> zero-dep RN primitive (`Animated` + `KeyboardAvoidingView` + `LayoutAnimation`).
> **Principle unchanged:** no gestures, no native deps beyond react-native.

## Scoping decision (2026-07-05)

The current arc is **playground screens (static compositions only)**; the flow engine is **postponed**.
The near-term BottomSheet goal is **polish the examples + simplify the API** — not flow-readiness. The
original doc's five deltas were verified against the source (line refs held) but its frame and suggested
order optimize for the postponed flow engine. Re-scoped against the actual goal:

| Delta | Disposition | Reason |
|---|---|---|
| **D1** two detents (`content` \| `full`) | **LANDED (PR #152)** | Real API simplification; also fixes a genuine ordering bug (`large` 0.80 < content cap 0.82). Stands alone, no flow dependency. |
| **D3** off-by-one `LayoutAnimation` | **LANDED (PR #152) — as correctness cleanup** | The off-by-one is real, but the *robust* fix is the D2 Animated-height engine (deferred). Current swap animation animates nothing. Scope reduced to **removing the misleading arming** + documenting that morph lands with D2. No fragile band-aid, no new API. |
| **D2** `content ↔ full` morph | **DEFER** to flow/motion arc | Pure flow feature ("only needed if a flow morphs mid-step"). Adds JS-thread `Animated` height machinery to a primitive we are trying to simplify. |
| **D4** keyboard avoidance | **DEFER** | Pieces already exist; "done when a 2-field form step stays reachable" has no consumer to validate against (sheet not in expo-demo; screens are static). |
| **D5** step transition container | **DEFER** to flow/motion arc | Pure step push/pop motion engineering; presumes the flow engine. |

**D1 + D3-cleanup LANDED (PR #152).** Brief: `prompts/brief-bottom-sheet-d1-d3.md`. D2/D4/D5 remain DEFERRED.

---

## D1 · Collapse to two detents: `content` and `full`

**Change.** Drop `large` from `BottomSheetDetent` and from `DETENT_FRACTION`.

```
content → maxHeight: 82% (intrinsic, grows to content)
full    → height:    96% (fixed tall)
```

**Why (not just fewer — safer).** Today `large` (0.80) is *smaller* than the content cap (0.82), so a
tall `content` sheet is taller than `large` — the names misrepresent the ordering. Two detents are
**monotonic**: `content` (≤82%) is always smaller than `full` (96%). That ordering guarantee is what
would later make a D2 morph well-defined (always grows content→full, shrinks full→content).

**Blast radius (verified 2026-07-05).** Near-zero. No live consumer uses `large`:
- `packages/rn/primitives/BottomSheet.tsx:32` — the `BottomSheetDetent` union (the change).
- `packages/rn/primitives/BottomSheet.tsx:52-55` — `DETENT_FRACTION` (`large: 0.8` removed).
- `packages/prototype/recipes/bottom-sheet.css:48-51,65-66` — **hand-authored source** (NOT the
  descriptor; the original doc misattributed this to `bottom-sheet-panel`). The `[detent="large"]`
  panel rule + its share of the scroll selector are removed here, then regenerated.
- `docs/flow-spec.md:86` — detent type line (hygiene; flow is postponed).
- All `generated/` + `_site/` copies of `playground.css` / `bottom-sheet.css` follow from `npm run build`
  — never hand-edited.

Every demo/test already uses only `content`/`full` (`bottom-sheet.html`, `component-types.test-d.tsx`,
`render-smoke.test.tsx`); nuri-expo uses no detent.

**Done (PR #152):** `BottomSheetDetent = 'content' | 'full'`; recipe edited + regen diff dropped every
`[detent="large"]` rule and nothing else; a `@ts-expect-error` type-test proves `detent="large"` is now
rejected.

## D2 · `content ↔ full` morph via a driven `Animated` height — DEFERRED

Drive one `Animated` height value between the measured content height and `0.96 × windowHeight` on
`detent` change (monotonic by D1). Runs on the JS thread (RN can't native-drive `height`); enter/exit
slide stays on `translateY` + native driver. **Deferred:** only needed if a flow morphs mid-step, which
the current static-composition arc does not exercise.

## D3 · Fix the `LayoutAnimation` off-by-one on content-swap height — NOW, as correctness cleanup

**Problem (verified).** `handleSheetLayout` calls `LayoutAnimation.configureNext(...)` **inside**
`onLayout` (`BottomSheet.tsx:126-128`) — i.e. after the layout that fired it. `configureNext` arms the
*next* commit, so the height change that just happened isn't the one animated. Tracing a content swap:
the new children commit and lay out with nothing armed (no animation), then `onLayout` arms an animation
that the following no-delta `setSheetHeight` commit consumes without a height change. **Net: content
swaps don't actually animate today** — consistent with the `:125` "buttery swaps deferred" comment.

**The robust fix is D2.** Making swaps genuinely animate requires arming `configureNext` in the same
commit the consumer swaps content — which needs a content-change signal the primitive doesn't have, or
the measured-`Animated`-height engine (D2). A LayoutAnimation-only "minimal" fix has finicky
cross-platform (Android) timing and no content-swapping consumer to validate against under static-only
scope.

**Scoped change (NOW).** Remove the misleading arming rather than add fragile motion:
- Delete the `LayoutAnimation.configureNext(...)` call from `handleSheetLayout` (the off-by-one source).
- Keep `handleSheetLayout` measuring height for the enter-slide latch (unchanged behaviour there).
- Replace the `:125` comment with an honest note: content-swap / morph animation lands with **D2**.
- The `LayoutAnimation` / `UIManager.setLayoutAnimationEnabledExperimental` import + Android enable may
  be removed **only if** no other call site uses them after this change; otherwise leave them.

**Done (PR #152):** the `configureNext` arming was removed from `handleSheetLayout` (the `LayoutAnimation`
+ `UIManager.setLayoutAnimationEnabledExperimental` import + Android-enable block went with it — no other
call site used them); enter/exit slide + measurement unchanged; a unit test
(`__tests__/bottom-sheet-layout.test.tsx`) asserts `configureNext` is not called on a content/height
change; morph deferral to D2 documented in the `handleSheetLayout` comment.

## D4 · Keyboard avoidance for form steps — DEFERRED

`KeyboardAvoidingView` already wraps the sheet (`BottomSheet.tsx:162-166`); `BottomSheetScroll` exists
with `keyboardShouldPersistTaps="handled"` (`:181-186`). The pieces exist but aren't composed/tested
together, and there is no form-step consumer to validate against yet. **Deferred** until a consuming
screen exists.

## D5 · Content transition container for step motion — DEFERRED

Step push/pop motion (cross-fade v1, horizontal slide fast-follow) for the flow engine. Real motion
engineering, interacts with D2/D3. **Deferred** to the flow/motion arc.

## Non-goals (explicit)

- No pan-down / swipe-dismiss gesture (scrim tap is the only dismissal). No native spring physics for
  height. No new native dependency.

## Suggested order

**Now:** D1 (simplification + ordering bug) → D3-cleanup (remove dead arming).
**Flow/motion arc (later):** D4 (foundations exist) → D2 + D5 (morph + step motion, together).

---

# Overlay layer architecture — route B via `OverlayProvider` (LANDED)

> **Status:** **LANDED** (`feat/overlay-provider`) · design lock 2026-07-05.
> **Subsumes D4.** The status-bar-dim fidelity gap and keyboard avoidance are two faces of one problem —
> the sheet's relationship to the window insets (top edge: status bar; bottom edge: keyboard). Both are
> solved by relocating the overlay *above* the safe-area padding. Design locked with the operator; this
> is the backbone of `prompts/brief-overlay-provider.md`.
>
> **What shipped:** `packages/rn/overlay.tsx` — `OverlayProvider` / `useOverlay` (a root provider mirroring
> `theme.tsx`: a state-held layer registry, mount-order z-stacking, and hardware-back routing to the
> topmost dismissible layer). `BottomSheet` became a REGISTRAR (registers its unchanged scrim + KAV +
> `translateY` subtree into the provider outlet, returns `null`); the enter/exit slide + the sheet-height
> measurement latch are byte-for-byte unchanged. Zero new native deps — the outlet is inset-agnostic and
> covers the status bar because the consumer mounts the provider above their own safe-area padding
> (expo-demo `App.tsx`). Web: a `data-overlay` device-frame mode (`demo.js`/`demo.css`) pins the status
> bar + home affordance above the sheet so the static scrim dims the full screen. Validation: the
> `packages/expo-demo` **Overlay** screen (a choice-list sheet + a `TextField` form sheet) and
> `packages/rn/__tests__/overlay-provider.test.tsx` (registry · two-layer stacking · back routing ·
> registrar · keyboard-reachable composition). **Native residue (operator-owned):** the true status-bar
> dim + the keyboard push on a real iOS/Android device are not verifiable in the web/expo-web harness.
>
> **Follow-up fixes (coordinator review + operator device test):** (1) **Stacking order** — the registrar
> now uses TWO layout effects (mirroring `LayerHost`): one upserts the fresh node WITHOUT cleanup, one
> unregisters only on close/unmount. A single register-with-cleanup effect re-appended a re-rendering
> lower layer to the top (latent with one sheet; the imminent toast trips it). Locked by an effect-level
> re-render-in-isolation test. (2) **Keyboard** — the Android `KeyboardAvoidingView` arm was a no-op
> (`undefined`); it is now `'height'` (the `ModalSheet` reference), the demo's form sheet is `detent="full"`
> (the real full-screen keyboard case, operator's call), and the fields + Save stay reachable via
> `BottomSheetScroll`. Expo default `windowSoftInputMode=adjustResize` is compatible — no global window
> mode needed. Keyboard reachability on a real device is **operator-verified residue** (the harness can't
> prove the keyboard push — that's how it first slipped through). TextField focus parity is tracked in a
> separate brief.

## The decision: a general overlay layer, not a sheet patch

The sheet's inline overlay is bounded by the safe-area-padded root, so its dim can't cover the status
bar. The fix is route B — hoist the overlay above the padding. But the operator foresees **overlays that
stack** (a toast on top of a sheet; later, flow-engine `pushFlow` interrupts). Inline-extend (option B
in the review) can't stack; a native `<Modal>` (option A) forks web/RN and was rejected in production.
So we introduce the DS **overlay layer**: one host that stacks tenants in mount order.

- **Tenants:** BottomSheet (now · tenant #1) → toast (soon · tenant #2, imperative) → flow-engine sheet
  (postponed · tenant #3). We build the *layer*, not the tenants beyond the sheet.

## RN — `OverlayProvider` (mirrors the theme provider)

- A root provider, same shape as `packages/rn/theme.tsx` (`createContext` + `Provider` + `use*` hook).
  Named **`OverlayProvider`** (no `Nuri` prefix — that convention is web-only). Consumer mounts it once
  at the app root, like `NuriThemeProvider`.
- It owns the overlay **runtime**: the registry of active layers, z-stacking (mount order), the scrim,
  and back/dismiss routing to the **topmost** dismissible layer.
- `<BottomSheet open>` stays the authored, **declarative** API — but instead of drawing its `absoluteFill`
  inline, it **registers into the provider via context** and renders in the provider's outlet at the top
  of the tree (above the padding, stackable). Today's inline overlay logic (scrim, `absoluteFill`,
  `KeyboardAvoidingView`, `translateY` enter/exit) **migrates into the provider's outlet**; `BottomSheet`
  becomes a thin registrar.

## Zero-native-dep preserved (the sharp constraint)

The provider must **NOT** depend on `react-native-safe-area-context` (it is not a `packages/rn` dep, and
the sheet's founding principle is *no native deps beyond react-native*). It doesn't need to: like
nuri-expo's `LayerHost`, the overlay is **inset-agnostic** — it covers the status bar *because* the
consumer mounts the provider **above their own safe-area padding**, so the outlet's `absoluteFill` fills
the whole window. The consumer owns insets (decision 58 relocated: the provider outlet becomes the one
place above the padding). If a bottom inset is ever needed for the panel, it comes via an optional prop,
never a hard safe-area dependency.

## Web — a static device-frame layer

Web is static mockup (no interaction), so there is **no provider runtime on web**. The static playground
renders the **panel descriptor** (`bottom-sheet-panel`) in the device-frame overlay layer; stacking is
z-index in static HTML. Ensuring the scrim covers the simulated status-bar strip is a **harness-level**
adjustment (device-frame territory), not page-local CSS faking a component.

## Behavior/data split (why this is on-architecture, not a special case)

| Layer | Kind | Home | Platforms |
|---|---|---|---|
| `OverlayProvider` | runtime **behavior** (portal, stacking, inset, dismiss) | RN provider (like theme) | RN only |
| panel | static **presentation** = data | `bottom-sheet-panel` descriptor | shared (web + RN) |

Parity lives at the **descriptor** (the panel looks identical); the provider is RN-only behavior with no
web equivalent required (behavior ≠ data; web is static). The consumer still owns `open`/`onClose`
(business state); the provider owns only presentation infrastructure — exactly like the theme provider
owns theme, not your data. Inside the DS boundary.

## Forward-compat (design for, don't build)

The host API is **general** — `register / update / unregister` a layer with `{ kind, dismissible }`,
z-order by mount, topmost-owns-back. Prove generality with a test that a **second layer stacks above a
sheet** (the toast case), but do NOT build the toast or the flow engine here. When the flow engine is
un-postponed, its persistent sheet + `pushFlow` interrupts mount into this same layer with no rewrite —
this overlay layer is the shared substrate all three tenants need.

## Validation split

- **Web**: static playground shows the composition (sheet open + dim over the status-bar strip in the
  device frame; a stacked second layer).
- **RN**: a new **sheet-bearing demo screen in `expo-demo`** (the sheet isn't mounted there yet) exercises
  open/close, a form input (keyboard), and a stacked second layer. Expo web preview verifies layout;
  **the status-bar dim + keyboard on a real iOS/Android device is operator-owned residue** (the web
  harness can't prove native status-bar behavior).

## Reference implementation

nuri-expo `components/LayerHost.tsx` (the registry + host) + `components/ModalSheet.tsx` (the in-tree
overlay, hoisted via LayerHost, `KeyboardAvoidingView`, `applyTopInset={false}`). Port the pattern; the
new work is the web/RN-parity framing (descriptor panel + RN provider) and the zero-dep inset stance.
