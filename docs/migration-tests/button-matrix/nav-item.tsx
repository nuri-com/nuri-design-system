/* ══════════════════════════════════════════════════════════════════
 * NAV-ITEM · the RN side of <nuri-nav-item> · closed scalar recipe · N+8/N+17 · decision 52 · 64
 * ──────────────────────────────────────────────────────────────────
 * API contract mirrors nav-item.js — SCALAR props only (amendment 52.2 ·
 * was a `leading: ReactNode` / children hybrid that diverged web↔RN):
 *   text     (required)  the row label
 *   icon?    IconName     → a leading IconAvatar
 *   variant? / accent?    forwarded to that leading IconAvatar (NO-OP without `icon`)
 *   onPress  (required)   forwarded to the interactive wrapper
 *
 * RECIPE (decision 52), CLOSED scalar (decision 64) — a named composition
 * over the primitives: InteractiveListItem ∘ ListItem ∘ [IconAvatar
 * leading] ∘ ListItemContent ∘ always-on muted caret. NO recipe tokens of
 * its own (web nav-item is skip-emit); every value comes from the
 * primitives it composes. The caret is muted via the chrome border-strong
 * semantic (the RN analogue of the web caret's `color:
 * var(--nuri-border-strong)` → Icon inherits currentColor · NO `muted`
 * prop on Icon · decision 38). The label composes <Typography size="md"
 * emphasis> (decision 53) inside the content PIVOT (a layout part ·
 * decision 64), mirroring the web recipe.
 *
 * Arbitrary leading / rich content is NOT a NavItem concern — drop to the
 * ListItem primitive and compose <ListItemContent> + positional siblings
 * directly (the escalation rule · decision 64).
 * ══════════════════════════════════════════════════════════════════ */

import * as React from 'react';
import { InteractiveListItem, ListItemContent } from './list';
import { Icon } from './icon';
import { IconAvatar, type IconAvatarVariant } from './icon-avatar';
import { Typography } from './typography';
import {
  useRuntimeTokens,
  resolveToken,
  type Accent,
  type IconName,
  type TokenPath,
} from './_shared';

export type NavItemProps = {
  text: string;
  icon?: IconName;
  variant?: IconAvatarVariant;
  accent?: Accent;
  onPress: () => void;
};

export const NavItem: React.FC<NavItemProps> = ({ text, icon, variant, accent, onPress }) => {
  const tokens = useRuntimeTokens();
  const caretColor = resolveToken(
    tokens, 'chrome.borderStrong' as const satisfies TokenPath,
  ) as string;

  return (
    <InteractiveListItem onPress={onPress}>
      {icon != null ? <IconAvatar name={icon} variant={variant} accent={accent} /> : null}
      <ListItemContent>
        <Typography size="md" emphasis>{text}</Typography>
      </ListItemContent>
      <Icon name="caret-right" size="md" color={caretColor} />
    </InteractiveListItem>
  );
};
