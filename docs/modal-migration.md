# Migrate from BottomSheet to Modal

`Modal` is Nuri's single blocking presented surface. Its required `mode` selects presentation; it does not change the identity of the surface or its content.

| Previous API | Replacement | Geometry | Enter/exit | Scrim | Keyboard |
|---|---|---|---|---|---|
| `<BottomSheet>` or `<BottomSheet detent="content">` | `<Modal mode="sheet">` | Content-height, bottom-anchored | Measured vertical slide | `scrim` is honored; default is `dim` | Inputs are forbidden |
| `<BottomSheet detent="full">` | `<Modal mode="full">` | Full page, edge to edge | Fade with subtle scale | No scrim; the prop is ignored with a development warning | Focus-scroll and keyboard accommodation are enabled |
| `<BottomSheetPanel>` | `<ModalPanel>` | Reads `mode` from its parent `Modal` | — | — | — |

Compose both modes with the existing `Header`, `Topbar`, `Scroll`, and `Footer` regions. Do not pass `mode` to `ModalPanel`; the panel inherits it without remounting the authored subtree.

Sheets are content surfaces, not form surfaces. A keyboard opening while the topmost blocking surface is `mode="sheet"` emits a one-time development warning. Move every input flow, including autofocus flows, to `mode="full"`.

Full modals paint behind the status bar because the panel fills the overlay outlet. Content clears device insets through safe-area-aware regions. Status-bar icon style remains owned by the consumer's app-shell `StatusBar`; Modal does not change it.

Changing `mode` on an open Modal preserves the child tree. In this release its geometry may visually snap; animated mode morphing is reserved for a future flow host.

`BottomSheet`, `BottomSheetPanel`, `BottomSheetProps`, `BottomSheetDetent`, and `BottomSheetScrim` remain deprecated compatibility exports for one migration cycle.
