import * as React from 'react';

/* ──────────────────────────────────────────────────────────────
 * useSheet · DEMO-LOCAL prototype (deliberately NOT @ds).
 *
 * The open/show/onClose triple every declarative <BottomSheet> consumer
 * repeats. Sheets register into the OverlayProvider from ANYWHERE in the
 * tree, so each sheet and its state co-locate with the screen that launches
 * it — no root-hoisted sheet enum (that pattern was a pre-OverlayProvider
 * requirement, not a recommendation).
 *
 * If this shape proves itself here, DS adoption is a separate, deliberate
 * decision — prototype in the consumer first, promote on evidence.
 * ────────────────────────────────────────────────────────────── */
export function useSheet(): {
  open: boolean;
  show: () => void;
  onClose: () => void;
} {
  const [open, setOpen] = React.useState(false);
  const show = React.useCallback(() => setOpen(true), []);
  const onClose = React.useCallback(() => setOpen(false), []);
  return { open, show, onClose };
}
