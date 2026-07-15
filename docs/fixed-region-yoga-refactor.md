# Fixed-region Yoga refactor

> **Status:** deferred implementation design. The current release ships only the Header paint split
> (`chrome="transparent"` with an independent `safeAreaChrome="canvas"`). It does **not** change fixed-region
> geometry. This document is the implementation boundary for the later layout-engine change.

## 1. Decision summary

Structural `Header`, `Scroll`, and `Footer` must eventually be laid out by one Yoga column instead of
negotiating geometry through asynchronous measurements. Header and Footer remain fixed because only the
middle Scroll scrolls. `Dock` remains the explicit overlay primitive and may continue to publish an
opt-in measured inset.

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
Screen or full ModalPanel — column, fill
├─ Header — intrinsic block size, structural
├─ Scroll — grow 1, shrink 1, minimum block size 0
└─ Footer — intrinsic block size, structural

Dock — separately positioned overlay; never part of the structural column
```

## 2. Problem being removed

The current runtime has two layout owners:

1. Header/Footer use absolute positioning and report their heights through `onLayout`.
2. Scroll reads those heights later and turns them into content padding.

The first render begins with `headerHeight = 0` and `footerHeight = 0`. A Header can already be visible
while Scroll still has no corresponding top reserve. When the measurement update commits, the content
moves. Android `adjustResize`, safe-area updates, image mounting, and autofocus can change the timing and
make the movement easier to see, but none of them creates the underlying zero-to-measured handoff.

The current implementation points are:

- `packages/rn/primitives/Header.tsx` and `Footer.tsx`: absolute fixed-region hosts;
- `packages/rn/primitives/FixedRegionLayout.tsx`: measured height registry and keyboard geometry;
- `packages/rn/primitives/Scroll.tsx`: measured Header/Footer values become content padding;
- `packages/prototype/primitives/header.js` and `footer.js`: ResizeObserver publishes CSS variables;
- `packages/prototype/primitives/scroll.css`: those variables become content padding.

## 3. Invariants

The refactor is acceptable only if all of these remain true:

1. Structural content is correctly positioned on its first rendered layout; no `onLayout` callback is
   required to clear Header or Footer.
2. Header and Footer remain visible while the middle content scrolls.
3. Screen and `Modal mode="full"` fill the available window.
4. `Modal mode="sheet"` stays content-sized and capped by its existing maximum height; a short sheet must
   not expand merely because it contains Scroll.
5. Android continues to rely on `adjustResize` and never applies a second keyboard offset.
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

Until the Yoga refactor lands, a transparent structural Header can still reveal scrolling content during
the measurement race. Consumers must not treat the cosmetic prop as an underlap or occlusion guarantee.

## 5. Target layout ownership

### 5.1 Structural frame

The nearest structural host—Screen or ModalPanel—owns a column frame. Header and Footer participate in
normal Yoga flow. Scroll is the only flexible middle child.

The implementation must not parse, reorder, clone, or classify React children. Authored order remains the
layout order. The primitives realize their structural roles through styles and the existing context, not
through component-specific routing.

### 5.2 Scroll

For filling hosts, Scroll must grow into and shrink within the remaining middle region. It must not add
Header/Footer measurements to `contentContainerStyle`. Its content padding remains limited to:

- an explicitly requested safe-area reserve when no painted edge region owns that edge;
- an explicitly requested Dock inset;
- focused-input keyboard clearance owned by that Scroll.

Once Header is outside the Scroll viewport, focus-scroll calculations must use Scroll-local coordinates;
they must not add `headerHeight` to the safe top line.

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

The app contract remains `softwareKeyboardLayoutMode: "resize"`. The operating system reduces the window;
the structural frame consumes that smaller window naturally. Engine keyboard offset remains zero so
Footer and Scroll are not shifted twice.

### iOS

iOS keyboard occlusion must reduce the column's available bottom edge at the structural-frame level. That
single adjustment simultaneously shrinks Scroll and positions Footer above the keyboard. Moving Footer
with a transform while leaving Scroll at its old height is forbidden because it recreates overlapping
geometry and focus-scroll compensation.

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

### First-layout assertions

The decisive regression test must inspect the initial rendered geometry before manually firing any Header
or Footer `onLayout`: the first Scroll row already begins after Header, and the last reachable content is
not covered by Footer. A later layout callback must not change those positions.

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
- R7 in `docs/RISKS.md` is closed with the landed test evidence in the same change.
