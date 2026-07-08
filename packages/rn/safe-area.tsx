/* ══════════════════════════════════════════════════════════════════
 * NURI · SAFE-AREA ENVIRONMENT
 * ──────────────────────────────────────────────────────────────────
 * Consumers read native insets in their app shell, then pass the resolved
 * numbers here. Nuri primitives express authoring intent with booleans
 * (`safeArea`, `safeAreaTop`, `safeAreaBottom`) and never import a native
 * safe-area reader.
 * ══════════════════════════════════════════════════════════════════ */

import * as React from 'react';

export type NuriSafeAreaInsets = {
  top: number;
  bottom: number;
};

export type NuriSafeAreaProviderProps = Partial<NuriSafeAreaInsets> & {
  children?: React.ReactNode;
};

const DEFAULT_INSETS: NuriSafeAreaInsets = {
  top: 0,
  bottom: 0,
};

const NuriSafeAreaContext = React.createContext<NuriSafeAreaInsets>(DEFAULT_INSETS);

const normalizeInset = (value: number | undefined): number =>
  Number.isFinite(value) ? Math.max(0, Math.round(value ?? 0)) : 0;

export const NuriSafeAreaProvider: React.FC<NuriSafeAreaProviderProps> = ({
  top,
  bottom,
  children,
}) => {
  const value = React.useMemo<NuriSafeAreaInsets>(
    () => ({
      top: normalizeInset(top),
      bottom: normalizeInset(bottom),
    }),
    [top, bottom],
  );

  return (
    <NuriSafeAreaContext.Provider value={value}>
      {children}
    </NuriSafeAreaContext.Provider>
  );
};
NuriSafeAreaProvider.displayName = 'NuriSafeAreaProvider';

export function useNuriSafeAreaInsets(): NuriSafeAreaInsets {
  return React.useContext(NuriSafeAreaContext);
}
