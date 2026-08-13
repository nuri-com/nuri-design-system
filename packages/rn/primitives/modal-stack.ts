import * as React from 'react';

export type ModalStackMode = 'sheet' | 'full';

type ModalStackEntry = {
  id: string;
  mode: ModalStackMode;
};

let openModals: ModalStackEntry[] = [];
const listeners = new Set<() => void>();

function emitChange(): void {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function upsertOpenModal(id: string, mode: ModalStackMode): void {
  const index = openModals.findIndex((entry) => entry.id === id);
  if (index < 0) {
    openModals = [...openModals, { id, mode }];
    emitChange();
    return;
  }
  if (openModals[index].mode === mode) return;
  const next = openModals.slice();
  next[index] = { id, mode };
  openModals = next;
  emitChange();
}

export function removeOpenModal(id: string): void {
  const index = openModals.findIndex((entry) => entry.id === id);
  if (index < 0) return;
  openModals = [...openModals.slice(0, index), ...openModals.slice(index + 1)];
  emitChange();
}

export function isTopmostOpenModal(id: string, mode: ModalStackMode): boolean {
  const top = openModals[openModals.length - 1];
  return top?.id === id && top.mode === mode;
}

export function useIsTopmostFullModal(id: string): boolean {
  const getSnapshot = React.useCallback(() => {
    const topFull = [...openModals].reverse().find((entry) => entry.mode === 'full');
    return topFull?.id === id;
  }, [id]);
  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useHasOpenFullModal(): boolean {
  const getSnapshot = React.useCallback(
    () => openModals.some((entry) => entry.mode === 'full'),
    [],
  );
  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

// Raw react-test-renderer roots are not auto-unmounted between Jest cases.
// Keep their intentionally module-level registrations from leaking across
// cases without adding test behavior to the public package surface.
export function resetModalStackForTests(): void {
  openModals = [];
  listeners.clear();
}
