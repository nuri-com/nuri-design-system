/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · ICON-BUTTON · EXACT PUBLIC SURFACE · GENERATED · DO NOT EDIT BY HAND
 *
 * The EXACT-typed public export for `icon-button` (Path C · Phase 2). `{Name}Props`
 * is emitted from the descriptor's `api` (packages/spec/components/icon-button.ts);
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
import { iconButtonDescriptor } from '@nuri/spec/descriptors/icon-button';
import { recipes } from '../recipes';
import type { Accent } from '../tokens';
import type { IconName } from '../icons';

export type IconButtonProps = {
  variant?: 'solid' | 'soft' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  accent?: Accent;
  onPress?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  icon: IconName;
  children?: never;
};

export const IconButton: React.FC<IconButtonProps> = createNuriComponent(
  iconButtonDescriptor,
  nuriNames('icon-button').rn,
  recipes['icon-button'],
);
