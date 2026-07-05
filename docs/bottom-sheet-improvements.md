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
