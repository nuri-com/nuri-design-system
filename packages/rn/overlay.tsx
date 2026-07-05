/* ══════════════════════════════════════════════════════════════════
 * NURI · OVERLAY RUNTIME · the DS overlay layer (route B · design lock
 * 2026-07-05 · docs/bottom-sheet-improvements.md "Overlay layer architecture")
 * ──────────────────────────────────────────────────────────────────
 * A root provider, the SAME shape as theme.tsx (createContext + Provider +
 * use* hook). It owns the overlay RUNTIME: a registry of active layers,
 * z-stacking by mount order (later = on top), and back/dismiss routing to
 * the TOPMOST layer. It is the shared substrate every overlay tenant needs —
 * BottomSheet today, a toast/flow sheet later — so the sheet's scrim can
 * render ABOVE the consumer's safe-area padding (covering the status bar)
 * and overlays can STACK (a toast on top of a sheet).
 *
 *   OverlayContext    the single overlay-runtime context · the registrar API.
 *   OverlayProvider   the ROOT provider — holds the layer list in state and
 *                     renders {children} PLUS an OUTLET: a full-window
 *                     absoluteFill View (pointerEvents box-none, high zIndex)
 *                     that maps the layers stacked in mount order.
 *   useOverlay()      one useContext lookup → the registrar API. The declarative
 *                     <BottomSheet> registrar consumes it; a future imperative
 *                     toast API will too.
 *
 * ── THE ZERO-NATIVE-DEP INSET CONTRACT (the sharp constraint) ──
 * OverlayProvider does NOT depend on react-native-safe-area-context (or any
 * native dep beyond react-native). It is INSET-AGNOSTIC: it covers the status
 * bar because the CONSUMER mounts it ABOVE their own safe-area padding, so the
 * outlet's absoluteFill fills the whole window (exactly how nuri-expo's
 * LayerHost works — it consumes no insets). If a bottom inset is ever needed
 * for a panel it comes via an optional prop, never a hard safe-area dependency.
 * The provider is RN-only runtime behaviour; web is a static device-frame
 * layer with no provider runtime (behavior ≠ data · web is static).
 * ══════════════════════════════════════════════════════════════════ */

import * as React from 'react';
import { BackHandler, StyleSheet, View as RNView } from 'react-native';

// ── OverlayLayerOptions · the per-layer metadata a tenant registers with.
// `dismissible` gates whether hardware-back closes the layer; `onRequestClose`
// is the layer's close handler (the LayerHost onRequestClose contract), routed
// by back to the topmost layer. A blocking (non-dismissible) top layer still
// SWALLOWS back so it never falls through to the content behind it. ──
export type OverlayLayerOptions = {
  dismissible?: boolean;
  onRequestClose?: () => void;
};

// ── OverlayApi · the registrar surface. `register` upserts a layer (the
// <Layer> pattern: a re-rendering registrar re-registers its fresh node);
// `update` refreshes only the node (the imperative-tenant path); `unregister`
// removes it. Kept minimal + general so the toast/flow tenants mount into the
// same layer with no rewrite. ──
export type OverlayApi = {
  register: (id: string, node: React.ReactNode, options?: OverlayLayerOptions) => void;
  update: (id: string, node: React.ReactNode) => void;
  unregister: (id: string) => void;
};

type OverlayEntry = {
  id: string;
  node: React.ReactNode;
  dismissible: boolean;
  onRequestClose?: () => void;
};

// Default context = inert no-ops. A BottomSheet used without an OverlayProvider
// registers into the void and renders nothing; we warn once in dev so the
// missing root is obvious (silent no-show would be a puzzling failure).
let warnedNoProvider = false;
function warnNoProvider(): void {
  if (warnedNoProvider) return;
  warnedNoProvider = true;
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.warn(
      '[nuri] An overlay (e.g. <BottomSheet open>) was mounted without an <OverlayProvider>. ' +
        'Mount <OverlayProvider> once at the app root, above your safe-area padding.',
    );
  }
}

export const OverlayContext = React.createContext<OverlayApi>({
  register: warnNoProvider,
  update: warnNoProvider,
  unregister: () => undefined,
});

// ── OverlayProvider · the ROOT. Mount once at the app root, above the
// consumer's safe-area padding (like NuriThemeProvider). Holds the layer list
// in state and renders the outlet as a sibling of {children}. ──
export const OverlayProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [layers, setLayers] = React.useState<OverlayEntry[]>([]);

  // Stable-identity registrar (functional setState) so a tenant's register/
  // unregister in a layout effect can't restart on a new function reference.
  const register = React.useCallback(
    (id: string, node: React.ReactNode, options?: OverlayLayerOptions) => {
      setLayers((prev) => {
        const entry: OverlayEntry = {
          id,
          node,
          dismissible: options?.dismissible ?? true,
          onRequestClose: options?.onRequestClose,
        };
        const idx = prev.findIndex((l) => l.id === id);
        // Upsert: keep mount order (existing keeps its slot; new appends on top).
        if (idx === -1) return [...prev, entry];
        const next = prev.slice();
        next[idx] = entry;
        return next;
      });
    },
    [],
  );

  const update = React.useCallback((id: string, node: React.ReactNode) => {
    setLayers((prev) => {
      const idx = prev.findIndex((l) => l.id === id);
      if (idx === -1) return prev;
      const next = prev.slice();
      next[idx] = { ...next[idx], node };
      return next;
    });
  }, []);

  const unregister = React.useCallback((id: string) => {
    setLayers((prev) => (prev.some((l) => l.id === id) ? prev.filter((l) => l.id !== id) : prev));
  }, []);

  const api = React.useMemo<OverlayApi>(
    () => ({ register, update, unregister }),
    [register, update, unregister],
  );

  // Route Android hardware back to the TOPMOST layer (LayerHost.tsx:88-101
  // semantics). A visible top layer stands in for a native <Modal>, which
  // always swallowed back: run its close handler if it is dismissible, but
  // CONSUME the event either way so back never falls through a blocking layer.
  const layersRef = React.useRef(layers);
  layersRef.current = layers;
  React.useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      const stack = layersRef.current;
      const top = stack[stack.length - 1];
      if (!top) return false; // no layer → let back propagate to the app/screen.
      if (top.dismissible) top.onRequestClose?.();
      return true;
    });
    return () => sub.remove();
  }, []);

  return (
    <OverlayContext.Provider value={api}>
      {children}
      {layers.length > 0 ? (
        <RNView pointerEvents="box-none" style={styles.outlet}>
          {layers.map((layer, index) => (
            <RNView
              key={layer.id}
              pointerEvents="box-none"
              style={[StyleSheet.absoluteFill, { zIndex: index }]}
            >
              {layer.node}
            </RNView>
          ))}
        </RNView>
      ) : null}
    </OverlayContext.Provider>
  );
};
OverlayProvider.displayName = 'OverlayProvider';

// ── useOverlay · the one useContext lookup → the registrar API ──
export function useOverlay(): OverlayApi {
  return React.useContext(OverlayContext);
}

const styles = StyleSheet.create({
  // Sit above every screen view. absoluteFill fills the whole window BECAUSE
  // the consumer mounts the provider above their safe-area padding (the outlet
  // is a sibling of the padded root, not inside it) — the inset-agnostic stance.
  outlet: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100000,
    elevation: 100000,
  },
});
