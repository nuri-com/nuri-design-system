/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · ICON-AVATAR · EXACT PUBLIC SURFACE · GENERATED · DO NOT EDIT BY HAND
 *
 * The EXACT-typed public export for `icon-avatar` (Path C · Phase 2). `{Name}Props`
 * is emitted from the descriptor's `api` (packages/spec/components/icon-avatar.ts);
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
import { iconAvatarDescriptor } from '@nuri/spec/descriptors/icon-avatar';
import { recipes } from '../recipes';
import type { Accent } from '../tokens';
import type { IconName } from '../icons';

export type IconAvatarProps = {
  variant?: 'solid' | 'soft' | 'ghost' | 'subtle';
  accent?: Accent;
  icon: IconName;
  children?: never;
};

export const IconAvatar: React.FC<IconAvatarProps> = createNuriComponent(
  iconAvatarDescriptor,
  nuriNames('icon-avatar').rn,
  recipes['icon-avatar'],
);
