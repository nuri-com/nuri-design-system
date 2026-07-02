/* ──────────────────────────────────────────────────────────────
 * BottomBar · the APP-owned stateful wrapper over the dumb DS bar.
 * The DS boundary demonstrated: ui.TabBar lays out equal columns and
 * ui.TabBarItem only LOOKS selected and fires its press — no value, no
 * state, no routing in the DS. This wrapper owns the mapping from the
 * app's items config + selected key to that presentation; App owns the
 * route state and the items DATA.
 * ────────────────────────────────────────────────────────────── */

import * as React from 'react';
import { TabBar, TabBarItem } from './ui';
import type { IconName } from './ui';

export type BottomBarItem<K extends string> = {
  key: K;
  icon: IconName;
  label: string;
};

export type BottomBarProps<K extends string> = {
  items: readonly BottomBarItem<K>[];
  selected: K;
  onSelect: (key: K) => void;
};

export function BottomBar<K extends string>({ items, selected, onSelect }: BottomBarProps<K>) {
  return (
    <TabBar>
      {items.map((item) => (
        <TabBarItem
          key={item.key}
          icon={item.icon}
          label={item.label}
          selected={item.key === selected}
          onPress={() => onSelect(item.key)}
        />
      ))}
    </TabBar>
  );
}
