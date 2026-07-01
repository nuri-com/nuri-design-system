/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · TOPBAR · EXACT PUBLIC SURFACE · GENERATED · DO NOT EDIT BY HAND
 *
 * The EXACT-typed public export for `topbar` (Path C · Phase 2). `{Name}Props`
 * is emitted from the descriptor's `api` (packages/spec/components/topbar.ts);
 * the export binds the EXISTING createNuriComponent instance to it — a TYPE
 * NARROWING over the wide `NuriComponentProps` bag (FC<Wide> ⊑ FC<Narrow> · props
 * contravariant · NO cast · same instance · same recipe · render byte-identical).
 *
 * Source · the authored descriptor `api`+`variants`. Emitter · scripts/parsers/
 * components-api.js — run `npm run build`. Committed (decision 35) · the re-emit
 * `git diff --exit-code` gate covers it. NEVER hand-edit — edit the descriptor's `api`.
 * ────────────────────────────────────────────────────────────── */

import * as React from 'react';
import { createNuriComponent, nuriNames, compoundSlots } from '../../factory/createNuriComponent';
import { topbarDescriptor } from '@nuri/spec/descriptors/topbar';
import { recipes } from '../recipes';
import type { Accent } from '../tokens';

export type TopbarProps = {
  accent?: Accent;
  children?: React.ReactNode;
};

export const Topbar: React.FC<TopbarProps> = createNuriComponent(
  topbarDescriptor,
  nuriNames('topbar').rn,
  recipes['topbar'],
);

const topbarSlots = compoundSlots(Topbar);
export const TopbarLeading = topbarSlots.TopbarLeading;
export const TopbarCenter = topbarSlots.TopbarCenter;
export const TopbarTrailing = topbarSlots.TopbarTrailing;
