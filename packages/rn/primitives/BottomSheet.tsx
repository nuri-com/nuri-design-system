import * as React from 'react';

import {
  Modal,
  ModalPanel,
  type ModalPanelProps,
  type ModalScrim,
} from './Modal';

/** @deprecated Use `Modal mode="sheet" | "full"` instead. */
export type BottomSheetDetent = 'content' | 'full';
/** @deprecated Use `ModalScrim` on `Modal mode="sheet"` instead. */
export type BottomSheetScrim = ModalScrim;
/** @deprecated Use `ModalProps` instead. */
export type BottomSheetProps = {
  open?: boolean;
  detent?: BottomSheetDetent;
  scrim?: BottomSheetScrim;
  dismissible?: boolean;
  onOpenChange?: (open: boolean) => void;
  onOpenComplete?: () => void;
  children?: React.ReactNode;
};
/** @deprecated Use `ModalPanelProps` instead. */
export type BottomSheetPanelProps = ModalPanelProps;

let warnedBottomSheet = false;

/** @deprecated Use `Modal mode="sheet" | "full"` instead. */
export const BottomSheet: React.FC<BottomSheetProps> = ({ detent = 'content', ...props }) => {
  React.useEffect(() => {
    if (warnedBottomSheet || typeof __DEV__ === 'undefined' || !__DEV__) return;
    warnedBottomSheet = true;
    console.warn('[nuri] <BottomSheet> is deprecated. Use <Modal mode="sheet" | "full">.');
  }, []);
  return <Modal {...props} mode={detent === 'full' ? 'full' : 'sheet'} />;
};
BottomSheet.displayName = 'BottomSheet';

/** @deprecated Use `ModalPanel` instead. */
export const BottomSheetPanel = ModalPanel;
