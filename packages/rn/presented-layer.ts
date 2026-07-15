/* ════════════════════════════════════════════════════════════════
 * NURI · PRESENTED-LAYER ENGINE · internal overlay-tenant lifecycle
 * ─────────────────────────────────────────────────────────────────
 * Shared registration, mount-latch, and animation orchestration for blocking
 * presented surfaces. Presentation stays with each tenant; this hook only
 * owns when its rendered layer enters, exits, and occupies the overlay stack.
 * ════════════════════════════════════════════════════════════════ */

import * as React from 'react';
import { Animated } from 'react-native';

import { useOverlay } from './overlay';

type PresentedLayerTiming = Omit<Animated.TimingAnimationConfig, 'toValue'>;

type PresentedLayerRenderContext = {
  progress: Animated.Value;
  requestClose: () => void;
};

type UsePresentedLayerOptions = {
  open: boolean;
  ready?: boolean;
  blocking?: boolean;
  dismissible?: boolean;
  onRequestClose?: () => void;
  onEnterComplete?: () => void;
  onExitComplete?: () => void;
  enterTiming: PresentedLayerTiming;
  exitTiming: PresentedLayerTiming;
  renderLayer: (context: PresentedLayerRenderContext) => React.ReactNode;
};

export function usePresentedLayer({
  open,
  ready = true,
  blocking,
  dismissible,
  onRequestClose,
  onEnterComplete,
  onExitComplete,
  enterTiming,
  exitTiming,
  renderLayer,
}: UsePresentedLayerOptions): void {
  const overlay = useOverlay();
  const layerId = React.useId();
  const progress = React.useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = React.useState(open);
  const openNotified = React.useRef(false);

  // Latest-callback refs keep consumer callbacks out of the animation effects'
  // deps so a parent's inline lambda can't restart a running animation.
  const onRequestCloseRef = React.useRef(onRequestClose);
  onRequestCloseRef.current = onRequestClose;
  const onEnterCompleteRef = React.useRef(onEnterComplete);
  onEnterCompleteRef.current = onEnterComplete;
  const onExitCompleteRef = React.useRef(onExitComplete);
  onExitCompleteRef.current = onExitComplete;

  // Stable close handler for tenant interaction AND hardware-back routing (the
  // overlay layer calls it on the topmost dismissible layer). Reads the latest
  // callback via the ref so its identity never changes.
  const requestClose = React.useCallback(() => {
    onRequestCloseRef.current?.();
  }, []);

  React.useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    openNotified.current = false;
    if (!mounted) return;
    Animated.timing(progress, { ...exitTiming, toValue: 0 }).start(({ finished }) => {
      if (!finished) return;
      onExitCompleteRef.current?.();
      setMounted(false);
    });
  }, [open, mounted, progress, exitTiming]);

  React.useEffect(() => {
    if (!open || !mounted || !ready) return;
    Animated.timing(progress, { ...enterTiming, toValue: 1 }).start(({ finished }) => {
      if (finished && !openNotified.current) {
        openNotified.current = true;
        onEnterCompleteRef.current?.();
      }
    });
  }, [open, mounted, ready, progress, enterTiming]);

  // The tenant subtree is rebuilt each render so the outlet always receives
  // the current presentation; its progress Animated.Value remains a stable ref.
  // Only build it while mounted.
  const layerNode = mounted ? renderLayer({ progress, requestClose }) : null;

  // Register the subtree into the overlay layer while mounted (the <Layer>
  // pattern): the outlet renders it full-window, above the safe-area padding.
  // TWO effects, NOT one (mirrors LayerHost.tsx) — this split is load-bearing
  // for stacking order. A single register-with-cleanup effect would, on every
  // re-render, run cleanup (unregister) then body (register), and register
  // re-APPENDS a fresh id to the TOP — so a lower layer that re-renders (keyboard,
  // content, height, any parent re-render) would jump above an upper layer,
  // inverting the mount-order guarantee. Splitting fixes it:
  //   A · upsert the fresh node WITHOUT cleanup — register upserts in place, so
  //       a re-render refreshes the node and keeps its slot in the stack.
  React.useLayoutEffect(() => {
    if (!mounted) return;
    overlay.register(layerId, layerNode, {
      blocking,
      dismissible,
      onRequestClose: onRequestClose ? requestClose : undefined,
    });
  }, [mounted, layerNode, blocking, dismissible, onRequestClose, requestClose, overlay, layerId]);
  //   B · the ONLY place the layer leaves the stack — on close (!mounted) or
  //       unmount. Never runs on a node/dismissible change, so order is stable.
  React.useLayoutEffect(() => {
    if (!mounted) overlay.unregister(layerId);
    return () => overlay.unregister(layerId);
  }, [mounted, layerId, overlay]);
}
