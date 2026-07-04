import * as React from 'react';
import { ScrollView } from 'react-native';

type BottomSheetHandle = {
  snapToIndex: (index: number) => void;
  close: () => void;
};

const noop = () => undefined;

const BottomSheet = React.forwardRef<BottomSheetHandle, { children?: React.ReactNode }>(
  ({ children }, ref) => {
    React.useImperativeHandle(ref, () => ({ snapToIndex: noop, close: noop }), []);
    return <>{children}</>;
  },
);
BottomSheet.displayName = 'MockGorhomBottomSheet';

const BottomSheetScrollView: React.FC<React.ComponentProps<typeof ScrollView>> = (props) => (
  <ScrollView {...props} />
);
BottomSheetScrollView.displayName = 'MockGorhomBottomSheetScrollView';

export { BottomSheetScrollView };
export default BottomSheet;
