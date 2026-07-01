/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · TAB-BAR-ITEM · EXACT PUBLIC SURFACE · GENERATED · DO NOT EDIT BY HAND
 *
 * The EXACT-typed public export for `tab-bar-item` (Path C · Phase 2). `{Name}Props`
 * is emitted from the descriptor's `api` (packages/spec/components/tab-bar-item.ts);
 * the export binds the EXISTING createNuriComponent instance to it — a TYPE
 * NARROWING over the wide `NuriComponentProps` bag (FC<Wide> ⊑ FC<Narrow> · props
 * contravariant · NO cast · same instance · same recipe · render byte-identical).
 *
 * Source · the authored descriptor `api`+`variants`. Emitter · scripts/parsers/
 * components-api.js — run `npm run build`. Committed (decision 35) · the re-emit
 * `git diff --exit-code` gate covers it. NEVER hand-edit — edit the descriptor's `api`.
 * ────────────────────────────────────────────────────────────── */

import * as React from 'react';
import { createNuriComponent, nuriNames } from '../../factory/createNuriComponent';
import { tabBarItemDescriptor } from '@nuri/spec/descriptors/tab-bar-item';
import { recipes } from '../recipes';
import type { Accent } from '../tokens';
import type { IconName } from '../icons';

export type TabBarItemProps = {
  accent?: Accent;
  onPress?: () => void;
  accessibilityLabel?: string;
  selected?: boolean;
  icon?: IconName;
  label?: string;
  children?: never;
};

export const TabBarItem: React.FC<TabBarItemProps> = createNuriComponent(
  tabBarItemDescriptor,
  nuriNames('tab-bar-item').rn,
  recipes['tab-bar-item'],
);
