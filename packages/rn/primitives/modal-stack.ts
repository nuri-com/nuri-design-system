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

function subscribeNoop(_listener: () => void): () => void {
  return () => undefined;
}

function getFalseSnapshot(): false {
  return false;
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

export function useIsTopmostFullModal(id: string | null): boolean {
  const getSnapshot = React.useCallback(() => {
    for (let index = openModals.length - 1; index >= 0; index -= 1) {
      const entry = openModals[index];
      if (entry.mode === 'full') return entry.id === id;
    }
    return false;
  }, [id]);
  return React.useSyncExternalStore(
    id === null ? subscribeNoop : subscribe,
    id === null ? getFalseSnapshot : getSnapshot,
    id === null ? getFalseSnapshot : getSnapshot,
  );
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
/** @internal */
export function resetModalStackForTests(): void {
  openModals = [];
  listeners.clear();
}
