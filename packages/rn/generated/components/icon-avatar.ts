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
import type { NuriBehaviour, NuriContent } from '../../runtime/renderer';
import { iconAvatarDescriptor } from '@nuri/spec/descriptors/icon-avatar';
import { recipes } from '../data/recipes';
import type { ImageSourcePropType } from 'react-native';
import { scopedByAccent } from '../../primitives/shared';
import type { Accent } from '../data/tokens';
import type { IconName } from '../data/icons';

export type IconAvatarProps = {
  variant?: 'solid' | 'soft' | 'ghost' | 'subtle' | 'outline';
  size?: 'sm' | 'md';
  accessorySurface?: 'canvas' | 'inverse';
  accent?: Accent;
  icon?: IconName;
  source?: ImageSourcePropType;
  initials?: string;
  accessory?: IconName;
  children?: never;
};

type IconAvatarPart = 'root' | 'icon' | 'image' | 'initials' | 'accessory' | 'accessoryIcon';

const iconAvatarDisplayName = nuriNames('icon-avatar').rn;
let warnedIconAvatarContent = false;

const IconAvatarInner: React.FC<IconAvatarProps> = (props) => {
  if (!warnedIconAvatarContent && typeof __DEV__ !== 'undefined' && __DEV__ && [props.source != null, props.initials != null && props.initials !== '', props.icon != null].filter(Boolean).length !== 1) {
    warnedIconAvatarContent = true;
    console.warn('[nuri] <' + iconAvatarDisplayName + '> expects exactly one of "icon", "source" or "initials"; when several are provided, source > initials > icon.');
  }
  const selection: Record<string, string> = {
    "variant": props.variant ?? "soft",
    "size": props.size ?? "md",
    "accessorySurface": props.accessorySurface ?? "canvas",
    "mode": "glyph",
  };
  selection["mode"] = props.source != null ? "image" : props.initials != null && props.initials !== '' ? "initials" : "glyph";
  const content: Partial<Record<IconAvatarPart, NuriContent>> = {};
  if (props.source != null) content["image"] = props.source;
  else if (props.initials != null && props.initials !== '') content["initials"] = props.initials;
  else if (props.icon != null) content["icon"] = props.icon;
  if (props.accessory !== undefined) content["accessoryIcon"] = props.accessory;
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

export const IconAvatar = scopedByAccent(IconAvatarInner);
IconAvatar.displayName = iconAvatarDisplayName;
