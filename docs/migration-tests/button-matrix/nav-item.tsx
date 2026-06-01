/* ══════════════════════════════════════════════════════════════════
 * NAV-ITEM · the RN side of <nuri-nav-item> · N+8 · decision 52
 * ──────────────────────────────────────────────────────────────────
 * API contract mirrors nav-item.js:
 *   onPress?:  () => void
 *   leading?:  React.ReactNode   optional leading book-end
 *   children:  the row label
 *
 * RECIPE (decision 52) — a named composition over the primitives:
 * InteractiveListItem ∘ ListItem ∘ auto-filled muted caret. NO recipe
 * tokens of its own (web nav-item is skip-emit); every value comes from
 * the primitives it composes. The caret is muted via the chrome
 * border-strong semantic (the RN analogue of the web trailing's
 * `color: var(--nuri-border-strong)` → Icon inherits currentColor · NO
 * `muted` prop on Icon · decision 38). Label composes <Typography
 * size="md" emphasis> (decision 53 · the RN analogue of the web recipe
 * composing <nuri-typography size="md" emphasis>).
 *
 * OPTIONAL LEADING: forwarded straight to the composed row's leading
 * book-end (the RN analogue of the web's hoisted <nuri-list-item-leading>
 * child) — e.g. a leading IconAvatar on a settings row.
 * ══════════════════════════════════════════════════════════════════ */

import * as React from 'react';
import { InteractiveListItem } from './list';
import { Icon } from './icon';
import { Typography } from './typography';
import { useRuntimeTokens, resolveToken, type TokenPath } from './_shared';

export type NavItemProps = {
  onPress?: () => void;
  leading?: React.ReactNode;
  children?: React.ReactNode;
};

export const NavItem: React.FC<NavItemProps> = ({ onPress, leading, children }) => {
  const tokens = useRuntimeTokens();
  const caretColor = resolveToken(
    tokens, 'chrome.borderStrong' as const satisfies TokenPath,
  ) as string;

  return (
    <InteractiveListItem
      onPress={onPress}
      leading={leading}
      trailing={<Icon name="caret-right" size="md" color={caretColor} />}
    >
      <Typography size="md" emphasis>{children}</Typography>
    </InteractiveListItem>
  );
};
