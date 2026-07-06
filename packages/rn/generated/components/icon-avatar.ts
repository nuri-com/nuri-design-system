/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · ICON-AVATAR · GENERATED RN API ADAPTER · DO NOT EDIT BY HAND
 *
 * The exact public export for `icon-avatar` (Path C component-API). `{Name}Props`
 * is emitted from the descriptor's `api` (packages/spec/components/icon-avatar.ts);
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
import { iconAvatarDescriptor } from '@nuri/spec/descriptors/icon-avatar';
import { recipes } from '../data/recipes';
import { NuriScope } from '../../theme';
import type { Accent } from '../data/tokens';
import type { IconName } from '../data/icons';

export type IconAvatarProps = {
  variant?: 'solid' | 'soft' | 'ghost' | 'subtle' | 'outline';
  accent?: Accent;
  icon: IconName;
  children?: never;
};

type IconAvatarPart = 'root' | 'icon';

const iconAvatarDisplayName = nuriNames('icon-avatar').rn;

const IconAvatarInner: React.FC<IconAvatarProps> = (props) => {
  const selection: Record<string, string> = {
    "variant": props.variant ?? "soft",
  };
  const content: Partial<Record<IconAvatarPart, React.ReactNode>> = {};
  if (props.icon !== undefined) content["icon"] = props.icon;
  const behaviour: NuriBehaviour<IconAvatarPart> = {};

  return renderDescriptorInstance({
    descriptor: iconAvatarDescriptor,
    recipe: recipes["icon-avatar"],
    displayName: iconAvatarDisplayName,
    selection,
    content,
    behaviour,
  });
};
IconAvatarInner.displayName = `${iconAvatarDisplayName}Inner`;

export const IconAvatar: React.FC<IconAvatarProps> = (props) =>
  props.accent !== undefined
    ? React.createElement(NuriScope, { accent: props.accent, children: React.createElement(IconAvatarInner, props) })
    : React.createElement(IconAvatarInner, props);
IconAvatar.displayName = iconAvatarDisplayName;
