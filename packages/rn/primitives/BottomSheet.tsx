// ════════════════════════════════════════════════════════════════
// BottomSheet family — public Nuri API over the hidden gorhom engine.
// ════════════════════════════════════════════════════════════════
import * as React from 'react';
import { Pressable as RNPressable, StyleSheet, View as RNView, useWindowDimensions } from 'react-native';
import type { ViewStyle } from 'react-native';
import GorhomBottomSheet, { BottomSheetScrollView as GorhomBottomSheetScrollView } from '@gorhom/bottom-sheet';
import type { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { blackAlpha } from '@nuri/spec/colours';
import { bottomSheetChrome } from '@nuri/spec/bottom-sheet-chrome';

import { BottomSheetPanel as GeneratedBottomSheetPanel } from '../generated/components/bottom-sheet-panel';

export type BottomSheetDetent = 'content' | 'large' | 'full';
export type BottomSheetScrim = 'none' | 'dim';

export type BottomSheetProps = {
  open?: boolean;
  detent?: BottomSheetDetent;
  scrim?: BottomSheetScrim;
  dismissible?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
};

export type BottomSheetPanelProps = {
  children?: React.ReactNode;
};

export type BottomSheetScrollProps = {
  children?: React.ReactNode;
};

const SNAP_POINTS: Record<Exclude<BottomSheetDetent, 'content'>, string> = {
  large: '80%',
  full: '96%',
};

const RN_SCRIM = {
  transparent: 'transparent',
  'blackAlpha.7': blackAlpha[7].value,
} as const;

export const BottomSheet: React.FC<BottomSheetProps> = ({
  open = false,
  detent = 'content',
  scrim = 'dim',
  dismissible = true,
  onOpenChange,
  children,
}) => {
  const { height } = useWindowDimensions();
  const sheetRef = React.useRef<BottomSheetMethods | null>(null);
  const dynamic = detent === 'content';
  const snapPoints = React.useMemo(
    () => (dynamic ? undefined : [SNAP_POINTS[detent]]),
    [detent, dynamic],
  );
  const maxDynamicContentSize = Math.round(height * 0.82);

  React.useEffect(() => {
    if (open) sheetRef.current?.snapToIndex(0);
    else sheetRef.current?.close();
  }, [open]);

  const handleChange = React.useCallback(
    (index: number) => {
      if (index < 0) onOpenChange?.(false);
      else onOpenChange?.(true);
    },
    [onOpenChange],
  );

  if (!open) return null;

  const scrimNode =
    scrim === 'dim' ? (
      <RNPressable
        accessibilityRole={dismissible ? 'button' : undefined}
        disabled={!dismissible}
        onPress={dismissible ? () => onOpenChange?.(false) : undefined}
        style={styles.scrim}
      />
    ) : null;

  return (
    <RNView pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      {scrimNode}
      <GorhomBottomSheet
        ref={sheetRef}
        index={0}
        snapPoints={snapPoints}
        enableDynamicSizing={dynamic}
        maxDynamicContentSize={dynamic ? maxDynamicContentSize : undefined}
        enablePanDownToClose={dismissible}
        enableContentPanningGesture={dismissible}
        enableHandlePanningGesture={dismissible}
        onChange={handleChange}
        handleComponent={null}
        backgroundStyle={styles.transparent}
        style={styles.sheet}
      >
        {children}
      </GorhomBottomSheet>
    </RNView>
  );
};
BottomSheet.displayName = 'BottomSheet';

export const BottomSheetPanel: React.FC<BottomSheetPanelProps> = ({ children }) => (
  <GeneratedBottomSheetPanel>{children}</GeneratedBottomSheetPanel>
);
BottomSheetPanel.displayName = 'BottomSheetPanel';

export const BottomSheetScroll: React.FC<BottomSheetScrollProps> = ({ children }) => (
  <GorhomBottomSheetScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
    {children}
  </GorhomBottomSheetScrollView>
);
BottomSheetScroll.displayName = 'BottomSheetScroll';

const styles = StyleSheet.create({
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: RN_SCRIM[bottomSheetChrome.scrim.dim],
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  sheet: {
    shadowColor: 'transparent',
  },
  scrollContent: {
    flexGrow: 1,
  } satisfies ViewStyle,
});
