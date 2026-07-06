/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · TAB-BAR-ITEM · GENERATED RN API ADAPTER · DO NOT EDIT BY HAND
 *
 * The exact public export for `tab-bar-item` (Path C component-API). `{Name}Props`
 * is emitted from the descriptor's `api` (packages/spec/components/tab-bar-item.ts);
 * the component adapter normalizes public props into selection, content,
 * behaviour, and optional accent scope before calling the shared descriptor renderer.
 *
 * Source · the authored descriptor `api`+`variants`. Emitter · scripts/parsers/
 * components-api.js — run `npm run build`. Committed (decision 35) · the re-emit
 * `git diff --exit-code` gate covers it. NEVER hand-edit — edit the descriptor's `api`.
 * ────────────────────────────────────────────────────────────── */

import * as React from 'react';
import { nuriNames, renderDescriptorInstance } from '../../runtime/renderer';
import type { NuriBehaviour } from '../../runtime/renderer';
import { tabBarItemDescriptor } from '@nuri/spec/descriptors/tab-bar-item';
import { recipes } from '../data/recipes';
import { NuriScope } from '../../theme';
import type { Accent } from '../data/tokens';
import type { IconName } from '../data/icons';

export type TabBarItemProps = {
  accent?: Accent;
  onPress?: () => void;
  accessibilityLabel?: string;
  selected?: boolean;
  icon?: IconName;
  label?: string;
  children?: never;
};

type TabBarItemPart = 'root' | 'icon' | 'label';

const tabBarItemDisplayName = nuriNames('tab-bar-item').rn;

const TabBarItemInner: React.FC<TabBarItemProps> = (props) => {
  const selection: Record<string, string> = {
    "state": "unselected",
  };
  if (typeof props.selected === 'boolean') {
    selection["state"] = props.selected ? "selected" : "unselected";
  }
  const content: Partial<Record<TabBarItemPart, React.ReactNode>> = {};
  if (props.icon !== undefined) content["icon"] = props.icon;
  if (props.label !== undefined) content["label"] = props.label;
  const behaviour: NuriBehaviour<TabBarItemPart> = {};
  behaviour.pressable = {
    target: "root",
    onPress: props.onPress,
    accessibilityLabel: props.accessibilityLabel,
  };

  return renderDescriptorInstance({
    descriptor: tabBarItemDescriptor,
    recipe: recipes["tab-bar-item"],
    displayName: tabBarItemDisplayName,
    selection,
    content,
    behaviour,
  });
};
TabBarItemInner.displayName = `${tabBarItemDisplayName}Inner`;

export const TabBarItem: React.FC<TabBarItemProps> = (props) =>
  props.accent !== undefined
    ? React.createElement(NuriScope, { accent: props.accent, children: React.createElement(TabBarItemInner, props) })
    : React.createElement(TabBarItemInner, props);
TabBarItem.displayName = tabBarItemDisplayName;
