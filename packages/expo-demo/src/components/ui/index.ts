/* ──────────────────────────────────────────────────────────────
 * UI · the DS MANIFEST — the one file that answers "what @nuri/rn
 * surface does this app consume". Import-and-re-export ONLY: no
 * wrapping, no default-filling, no styling here — a wrapper that owns
 * behaviour lives in components/ (BottomBar). Screens and App import
 * every DS piece from this manifest, never from '@nuri/rn' directly.
 * ────────────────────────────────────────────────────────────── */

export {
  BottomSheet,
  BottomSheetFooter,
  BottomSheetPanel,
  BottomSheetScroll,
  BottomSheetTopbar,
  Button,
  ButtonIcon,
  IconButton,
  List,
  ListAction,
  ListActionLeadingAvatar,
  ListActionText,
  ListActionTextMuted,
  ListActionTrailingText,
  ListActionTrailingTextMuted,
  ListActionTrailIcon,
  ListSeparator,
  NuriIcon,
  NuriThemeProvider,
  OverlayProvider,
  Stack,
  TabBar,
  TabBarItem,
  Text,
  TextField,
  TextFieldButton,
  TextFieldLabel,
  Topbar,
  TopbarCenter,
  TopbarLeading,
  TopbarTrailing,
  useNuriTheme,
  View,
} from '@nuri/rn';
export type { IconName, Theme } from '@nuri/rn';
