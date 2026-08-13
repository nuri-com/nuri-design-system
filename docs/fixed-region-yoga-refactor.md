# Fixed-region Yoga refactor

> **Status:** landed and physically accepted (2026-07-17). Header, Scroll, and Footer use one-pass structural
> layout in both projections. Modal can explicitly opt a transparent Topbar into overlay presentation while
> keeping the safe-area strip structural. Automated, browser, Android Expo Go, and iOS Expo Go evidence is complete.

## 1. Decision summary

Structural `Header`, `Scroll`, and `Footer` are laid out by one Yoga column instead of
negotiating geometry through asynchronous measurements. Header and Footer remain fixed because only the
middle Scroll scrolls. `Dock` remains the explicit overlay primitive and may continue to publish an
opt-in measured inset.

Modal defaults to the same structural Header contract as Screen. List compositions that deliberately want
content visible through a transparent Topbar opt in with `scrollUnderTopbar`; only then does Header reserve
its safe-area inset while its token-sized Topbar block overlays Scroll. The offset is derived from the
generated `size['2xl']` contract and does not introduce a measurement handshake.

The public composition grammar stays unchanged:

```tsx
<Screen>
  <Header safeAreaTop chrome="transparent" safeAreaChrome="canvas">
    <Topbar surface="transparent">…</Topbar>
  </Header>
  <Scroll>…</Scroll>
  <Footer safeAreaBottom>…</Footer>
</Screen>
```

The target geometry is:

```text
Screen — column, fill
├─ Header — intrinsic block size, structural
├─ Scroll — grow 1, shrink 1, minimum block size 0
└─ Footer — intrinsic block size, structural

ModalPanel — column, fill or capped content
├─ Header — intrinsic and structural by default
├─ optional scrollUnderTopbar — safe-area structural; 2xl Topbar overlays Scroll
├─ Scroll — begins after Header, or after only the safe-area strip when opted in
└─ Footer — intrinsic block size, structural

Dock — separately positioned overlay; never part of the structural column
```

## 2. Problem removed

The previous runtime had two layout owners:

1. Header/Footer use absolute positioning and report their heights through `onLayout`.
2. Scroll reads those heights later and turns them into content padding.

The first render begins with `headerHeight = 0` and `footerHeight = 0`. A Header can already be visible
while Scroll still has no corresponding top reserve. When the measurement update commits, the content
moves. Android `adjustResize`, safe-area updates, image mounting, and autofocus can change the timing and
make the movement easier to see, but none of them creates the underlying zero-to-measured handoff.

The removed implementation points were:

- `packages/rn/primitives/Header.tsx` and `Footer.tsx`: absolute fixed-region hosts;
- `packages/rn/primitives/FixedRegionLayout.tsx`: measured height registry and keyboard geometry;
- `packages/rn/primitives/Scroll.tsx`: measured Header/Footer values become content padding;
- `packages/prototype/primitives/header.js` and `footer.js`: ResizeObserver publishes CSS variables;
- `packages/prototype/primitives/scroll.css`: those variables become content padding.

## 3. Invariants

The refactor is acceptable only if all of these remain true:

1. Structural content is correctly positioned on its first rendered layout; no `onLayout` callback is
   required to clear Header or Footer. An opted-in Modal Scroll viewport begins after the safe-area strip,
   while its first content begins below the transparent Topbar on that same first layout.
2. Header and Footer remain visible while the middle content scrolls.
3. Screen and `Modal mode="full"` fill the available window.
4. `Modal mode="sheet"` stays content-sized and capped by its existing maximum height; a short sheet must
   not expand merely because it contains Scroll.
5. Android consumes `adjustResize` first and applies only any keyboard occlusion the resized window did
   not consume; it never double-counts the same height.
6. On iOS, keyboard geometry reduces the structural middle region and keeps Footer above the keyboard.
7. Safe-area paint belongs to the visual edge owner and is counted exactly once.
8. Dock remains an overlay. Content passes behind it unless Scroll explicitly requests its inset.
9. The authored child tree stays mounted across modal presentation and mode changes.
10. RN and web retain the same public composition and geometry semantics.

## 4. Paint contract shipped before geometry

Header paint and Header geometry are separate contracts.

```tsx
<Header safeAreaTop chrome="transparent" safeAreaChrome="canvas">
  <Topbar surface="transparent">…</Topbar>
</Header>
```

- `chrome` resolves the Header body's existing chrome palette channel.
- `safeAreaChrome` resolves only the top safe-area strip through the existing semantic chrome channel.
- `safeAreaChrome` has no effect without both `safeAreaTop` and a positive host inset.
- The strip is decorative and carries no accessibility node.
- Omitting `safeAreaChrome` preserves the existing behavior: the Header body's chrome shows through its
  safe-area padding.

With the Yoga refactor landed, Screen and default Modal Headers clear their sibling Scroll on the first
structural layout. In a `scrollUnderTopbar` Modal, only the Header's safe-area strip clears the Scroll
viewport; Scroll reserves the generated 2xl Topbar as initial content padding. Content starts below the
Topbar, then can scroll behind it without entering the safe area. `safeAreaChrome` remains paint-only.

## 5. Target layout ownership

### 5.1 Structural frame

The nearest structural host—Screen or ModalPanel—owns a column frame. Header and Footer participate fully
in normal Yoga flow by default. An explicitly opted-in Modal Header uses a token-derived negative end
margin equal to its 2xl Topbar block, leaving only its safe-area inset in the structural column. Scroll
remains the only flexible middle child.

The implementation must not parse, reorder, clone, or classify React children. Authored order remains the
layout order. The primitives realize their structural roles through styles and the existing context, not
through component-specific routing.

### 5.2 Scroll

For filling hosts, Scroll must grow into and shrink within the remaining middle region. It must not add
Header/Footer measurements to `contentContainerStyle`. Its content padding remains limited to:

- an explicitly requested safe-area reserve when no painted edge region owns that edge;
- an explicitly requested Dock inset;
- the token-derived initial Topbar reserve in an explicitly opted-in overlay Modal;
- focused-input keyboard clearance owned by that Scroll.

Focus-scroll calculations use Scroll-local coordinates and never add a measured `headerHeight`. A
structural host uses the ordinary local focus margin. A `scrollUnderTopbar` Modal adds the known 2xl
overlay depth to that focus-safe line so a focused control is not left beneath Topbar actions; this is
derived from the same token as the initial overlay content padding, not from runtime measurement.

### 5.3 Sheet sizing

Sheet mode is the highest migration risk. A blanket `flex: 1` would turn content-sized sheets into
maximum-height sheets. The structural frame therefore needs two internal geometry modes:

| Host geometry | Structural frame | Scroll behavior |
| --- | --- | --- |
| Screen / full modal | fills available block size | grows and shrinks through remaining space |
| Content sheet | intrinsic size capped by sheet maximum | content-sized until capped, then scrolls |

This distinction is internal presentation context, not a new consumer prop and not a forked component
tree.

## 6. Keyboard behavior

### Android

The app contract remains `softwareKeyboardLayoutMode: "resize"`. The structural frame consumes any window
shrink naturally, then compares the residual keyboard-event height with the keyboard top edge derived from
`screenY`. Only the larger residual occlusion is applied at the frame level. Ordinary `adjustResize` therefore
produces zero extra inset, while translucent system chrome and Expo Go paths that leave the host unresized
still pin Footer above the keyboard. The geometry comparison matters on edge-to-edge Android: React Native's
event height excludes the bottom system-bar strip, but `windowHeight - screenY` includes it. Keyboard visibility
remains independent from that residual inset: requested bottom safe-area padding stays suppressed until
`keyboardDidHide`, including when `adjustResize` has reduced the residual inset to zero.

### iOS

iOS keyboard occlusion must reduce the column's available bottom edge at the structural-frame level. That
single adjustment simultaneously shrinks Scroll and positions Footer above the keyboard. Moving Footer
with a transform while leaving Scroll at its old height is forbidden because it recreates overlapping
geometry and focus-scroll compensation. Appearance and genuine on-screen frame changes use the native
keyboard layout animation. Dismissal is intentionally asymmetric: the off-screen `willChangeFrame` event is
ignored and `willHide` releases the structural inset immediately, allowing Footer to pass behind the departing
keyboard instead of trailing its animation.

Keyboard padding belongs only to a Scroll that owns the focused input. A TextField inside Header must not
mutate the sibling list Scroll's content padding.

## 7. Safe area and surfaces

Top and bottom inset numbers remain consumer-resolved and enter Nuri through `NuriRoot`. Ownership is:

| Composition | Top inset owner | Bottom inset owner |
| --- | --- | --- |
| Header + Scroll + Footer | Header | Footer |
| Header + Scroll | Header | Scroll only when `safeAreaBottom` is requested |
| Scroll + Footer | Scroll only when `safeAreaTop` is requested | Footer |
| Scroll only | Scroll only for explicitly requested edges | Scroll only for explicitly requested edges |

`safeAreaChrome` changes paint, never inset arithmetic. The safe-area strip may use a different semantic
surface from the Header body without adding a second inset.

## 8. Dock remains overlay geometry

Dock is intentionally different from Header and Footer:

- it stays positioned over the structural frame;
- it may report its measured size;
- Scroll applies that size only through `insetTop="dock"` or `insetBottom="dock"`;
- keyboard avoidance does not silently convert Dock into a structural Footer.

Keeping Dock's measured channel does not justify retaining measurements for structural Header/Footer.

## 9. Migration sequence

1. Add characterization tests for every current host/region combination before changing styles.
2. Introduce the internal structural-frame geometry modes without changing public props or authored trees.
3. Move Header into flow and remove `headerHeight` from Scroll padding/focus calculations.
4. Move Footer into flow and relocate iOS keyboard avoidance to the structural frame.
5. Give Scroll filling-host and content-sheet sizing behavior explicitly.
6. Remove obsolete Header/Footer measurement channels only after no runtime consumer remains.
7. Apply the equivalent flow model to the prototype projection and delete its fixed Header/Footer CSS
   variables and ResizeObserver publishing.
8. Re-run generated docs, drift guards, type gates, render tests, and device verification.

Header and Footer may be migrated in separate commits only if each intermediate commit has coherent
geometry and tests. Do not leave Scroll compensating both flow space and a measured inset.

## 10. Required regression matrix

### Composition

- Header + Scroll + Footer;
- Header + Scroll;
- Scroll + Footer;
- Scroll only;
- Header with dynamic one-line content;
- Footer with dynamic validation content;
- top and bottom Dock with and without requested Scroll insets;
- stacked full modals;
- mode change on a mounted Modal subtree.

### Host geometry

- Screen;
- full Modal;
- short content sheet;
- capped/overflowing content sheet.

### Insets and paint

- zero and non-zero top inset;
- zero and non-zero bottom inset;
- `chrome="transparent"` with `safeAreaChrome="canvas"`;
- omitted `safeAreaChrome` inheritance;
- light/dark mode and each supported accent scope.

### Keyboard and focus

- Android keyboard event before and after window resize;
- iOS keyboard show, grow, hide, and hardware keyboard;
- focused input near the bottom of Scroll;
- focused search input inside Header with a sibling list Scroll;
- selection/close while the keyboard is open;
- focus return to the invoking SelectField.

### Physical acceptance record · 2026-07-17

| Target | Recorded host geometry | Accepted behavior |
|---|---|---|
| Android · Expo Go | 411.43 × 914.29dp window; 24dp bottom system inset; keyboard top 549.33dp; reported keyboard height 340.95dp | Form Sheet autofocus and subsequent field focus keep Footer fully pinned above the keyboard; `screenY` includes the system strip omitted from event height; dismissal restores bottom safe-area ownership; transparent Topbar and structural picker footers remain non-overlapping. |
| iOS · Expo Go | 375 × 812dp window; keyboard top 484dp; keyboard height 328dp; native show/hide duration 383.3ms | Appearance pins Footer with the native transition; focused fields remain reachable; dismissal releases Footer immediately behind the departing keyboard without a trailing animation; safe-area paint remains structural and content scrolls behind the transparent Topbar only when opted in. |

The zero-size iOS hardware-keyboard frame and Android resize/event ordering remain covered by the automated
regression matrix. Physical acceptance was performed by the consumer on both devices against the same Expo
demo bundle used for the implementation review.

### Stacked hosts and presentation persistence follow-up · 2026-08-13

A consumer report exposed a keyboard-ownership slice that the single-host matrix above did not exercise.
Repro-first Jest coverage on `main` confirmed that two open full modals both consumed the same iOS
`keyboardWillShow` frame. It also confirmed that an unmatched show frame survived close/reopen when the
exit animation remained unfinished and the presented-layer subtree stayed mounted. A completed exit did
not reproduce persistence because it unmounted the provider and a later presentation mounted fresh state.

The follow-up makes keyboard ownership presentation-derived: the topmost open full modal is the only modal
provider subscribed to keyboard events, Screen stands down while any full modal is open, and sheets remain
transparent to full-modal ownership. Removing an open-modal registry entry immediately disables that
provider even while its exit layer remains mounted, which clears the frame before a re-presentation; every
fresh enable also starts from a zero frame as defense in depth. Jest now proves stacked topmost-only padding
and Footer safe-area retention, close-time reset and ownership transfer, interrupted and completed
close/reopen paths, consecutive show refires, Screen handoff, sheet-warning migration, and stable ordering
when a lower modal re-renders. The existing Android show/hide and residual-inset tests remain unchanged.

Simulator acceptance was recorded by the coordinator on 2026-08-13 (iPhone 16 Pro simulator, iOS 18.4,
Expo Go 54.0.7, branch head `75e9b14`): a temporary in-app driver ran the real DS surfaces with
programmatic focus — so the genuine iOS software keyboard and willShow/willHide events — while per-step
screenshots were captured headlessly. All twelve frames pass: Receive (ShareAddressSheet) open/close/reopen
with a pixel-identical resting footer; the driver form's footer riding the keyboard, then resting after a
close-with-keyboard-up and reopen; the stacked pair padding only the topmost modal and leaving the lower
footer untouched after the upper closed keyboard-up; a second late-session keyboard cycle; and a real
background/foreground round-trip with consistent geometry. Android emulator tooling was not available —
the Android path is engine-untouched and jest-pinned — so Android acceptance and physical consumer
verification of Receive remain release residue for the next RN tag.

### First-layout assertions

The decisive regression test must inspect the initial rendered geometry before manually firing any Header
or Footer `onLayout`: structural Scroll begins after Header; an opted-in Modal Scroll viewport begins after
the safe-area strip while its first content begins below the transparent Topbar; and the last reachable
content is not covered by Footer. A later layout callback must not change those positions.

## 11. Forbidden fixes

- delaying autofocus with timers, animation callbacks, or extra animation frames;
- hardcoded Header/Footer heights or duplicate spacer views;
- page-specific padding for country picker or form flows;
- clipping or opaque masks presented as geometry fixes;
- parsing/reordering children to manufacture slots;
- a second Android keyboard offset on top of `adjustResize`;
- retaining measured Header/Footer padding after they enter normal flow;
- claiming `safeAreaChrome` prevents content underlap.

## 12. Completion gates

The refactor is complete only when:

- no structural Header/Footer geometry depends on post-render measurement;
- the complete regression matrix passes on RN and the prototype projection;
- physical Android and iOS tests confirm stable first layout and keyboard transitions;
- the old measurement channels and web CSS variables have no consumers and are removed;
- component docs describe the one-pass layout rather than the deferred state;
- R7 in `docs/RISKS.md` closes only after the landed automated evidence and physical iOS/Android matrix
  are recorded in the same change.

## 13. Landed implementation and evidence (2026-07-16)

- `FixedRegionLayoutProvider` now carries internal `fill | content` host geometry, one frame keyboard
  inset, raw safe-area values, and Dock measurements. Header/Footer measurement channels were deleted.
- Screen and full Modal reuse their native frame hosts for keyboard occlusion. iOS uses the keyboard frame;
  Android takes the larger of event-height-minus-window-shrink and `windowHeight - screenY`, preserving
  `adjustResize` while including edge-to-edge system chrome omitted from the event height.
- Header and Footer are intrinsic, non-shrinking flow siblings. Filling Scroll uses explicit grow, shrink,
  and minimum-height styles; sheet Scroll is intrinsic and shrinkable under the existing 82% cap.
- Modal Header is structural by default. `scrollUnderTopbar` removes exactly the generated 2xl Topbar
  block from its flow footprint, retains the safe-area reserve, restores that 2xl block as initial Scroll
  content padding, and keeps Header above Scroll for painting and hit testing. Activity starts below the
  Topbar and scrolls behind it; the form sheets use the same transparent Topbar presentation, while picker
  compositions remain structural.
- The modal-panel descriptor keeps sheet mode intrinsic and applies `fill: 'grow-shrink'` only in full mode;
  both projections were regenerated from that authored source.
- Focus keyboard clearance is now conditional on the focused input belonging to that Scroll. Header search
  focus leaves the sibling list Scroll unchanged, focus-safe calculations are Scroll-local, and an
  opted-in Modal's safe line clears the known overlaid Topbar block without measuring Header.
- Web Header/Footer observers, fixed-region variables, and Modal refresh hooks were removed. Dock remains
  the only measured web fixed-region path.
- RN regression coverage asserts initial structural styles, consumer `onLayout` stability, safe-area paint
  and ownership, Dock measurement, iOS show/change/hide plus zero-size hardware-keyboard geometry, Android
  event ordering, focus ownership, local focus coordinates, sheet/full geometry, and mounted-subtree
  identity. Web coverage uses strict DOM-node identity and source guards without claiming jsdom layout.
- Browser acceptance rendered the Modal playground with the tall iPhone 17e and compact iPhone SE
  harnesses. Full panels filled the stage, overflowing content stayed inside Scroll, and the compact short
  sheet remained intrinsic at 61.8% of its stage (below the 82% cap). Follow-up acceptance after the Modal
  explicit Activity presentation measured the iPhone 17e safe-area strip at 38px: the Scroll viewport began
  exactly at the strip's 138px bottom, while 72px initial content padding placed the first content at the
  Topbar's 210px bottom. After a 260px scroll, a row occupied y=159–232 behind the transparent Topbar while
  the Scroll clip prevented content entering the safe-area strip. Structural Verify Phone measured
  Header bottom = Scroll top and Scroll bottom = strong Footer top; Country Picker retained the same
  non-overlapping boundaries. Expo web matched both structural and opted-in models. Playground's console
  was clean; Expo reported only its existing RN-web native-animation and deprecated `pointerEvents`
  warnings, with no Modal-layout error.

Physical Android and iOS Expo Go verification completed on 2026-07-17 and is recorded in §10. The accepted
matrix covers first autofocus, subsequent focus movement, pinned Footer geometry, keyboard dismissal,
safe-area restoration, transparent Topbar under-scroll, and structural picker footers. Together with the
automated and browser evidence above, this closes R7.
