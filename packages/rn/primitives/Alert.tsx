// ════════════════════════════════════════════════════════════════
// Alert family — the GENERATED Alert + AlertIcon (from the descriptor `api`)
// beside the ONE hand-authored member the emitter cannot produce: AlertButton,
// which embeds a COMPONENT (the real Button), not an El. This mirrors the
// BottomSheet family file (a hand-authored member beside generated ones · the
// repo precedent). Alert/AlertIcon are re-exported unchanged; only AlertButton
// is authored here.
// ════════════════════════════════════════════════════════════════
import * as React from 'react';
import { Button } from '../generated/components/button';
import { Alert, AlertIcon } from '../generated/components/alert';

export { Alert, AlertIcon };
export type { AlertProps, AlertIconProps } from '../generated/components/alert';

export type AlertButtonProps = {
  children?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
};

// AlertButton — the ONLY sanctioned action inside an Alert (there is NO raw
// Button escape hatch · form-kit-spec §1.1). A thin DELEGATING wrapper: it
// renders the real Button with the PINNED look (size sm · variant solid), the
// accent INHERITED from the Alert's scope (never re-passed here — the Alert's
// NuriScope already tints the subtree), the label from string children, and
// onPress through the behaviour channel. It re-implements NO Button styling, so
// it CANNOT drift. Web mirror: <nuri-alert-button> wrapping <nuri-button>
// (packages/prototype/recipes/alert.js).
export const AlertButton: React.FC<AlertButtonProps> = ({ children, onPress, disabled, accessibilityLabel }) => (
  <Button size="sm" variant="solid" onPress={onPress} disabled={disabled} accessibilityLabel={accessibilityLabel}>
    {children}
  </Button>
);
AlertButton.displayName = 'AlertButton';
