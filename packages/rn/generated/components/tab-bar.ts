/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · TAB-BAR · EXACT PUBLIC SURFACE · GENERATED · DO NOT EDIT BY HAND
 *
 * The EXACT-typed public export for `tab-bar` (Path C · Phase 2). `{Name}Props`
 * is emitted from the descriptor's `api` (packages/spec/components/tab-bar.ts);
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
import { tabBarDescriptor } from '@nuri/spec/descriptors/tab-bar';
import { recipes } from '../recipes';
import type { Accent } from '../tokens';

export type TabBarProps = {
  accent?: Accent;
  children?: React.ReactNode;
};

export const TabBar: React.FC<TabBarProps> = createNuriComponent(
  tabBarDescriptor,
  nuriNames('tab-bar').rn,
  recipes['tab-bar'],
);
