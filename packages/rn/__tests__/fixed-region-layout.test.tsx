import * as React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { View } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
import {
  FixedRegionLayoutProvider,
  useFixedRegionLayout,
  useRegisterRegion,
} from '../primitives/FixedRegionLayout';

type RegionKind = Parameters<typeof useRegisterRegion>[0];
type RegionChannel = 'headerHeight' | 'footerHeight' | 'dockTopInset' | 'dockBottomInset';

const CHANNEL_BY_KIND: Record<RegionKind, RegionChannel> = {
  header: 'headerHeight',
  footer: 'footerHeight',
  dockTop: 'dockTopInset',
  dockBottom: 'dockBottomInset',
};

function Region({
  kind,
  onLayout,
}: {
  kind: RegionKind;
  onLayout?: (event: LayoutChangeEvent) => void;
}): React.ReactElement {
  return <View onLayout={useRegisterRegion(kind, onLayout)} />;
}

function LayoutProbe({
  onValue,
}: {
  onValue: (value: ReturnType<typeof useFixedRegionLayout>) => void;
}): null {
  const value = useFixedRegionLayout();
  React.useEffect(() => {
    onValue(value);
  }, [onValue, value]);
  return null;
}

function Harness({
  kind,
  mounted,
  consumerOnLayout,
  onValue,
}: {
  kind: RegionKind;
  mounted: boolean;
  consumerOnLayout: (event: LayoutChangeEvent) => void;
  onValue: (value: ReturnType<typeof useFixedRegionLayout>) => void;
}): React.ReactElement {
  return (
    <FixedRegionLayoutProvider>
      {mounted ? <Region kind={kind} onLayout={consumerOnLayout} /> : null}
      <LayoutProbe onValue={onValue} />
    </FixedRegionLayoutProvider>
  );
}

describe('useRegisterRegion', () => {
  test.each<RegionKind>(['header', 'footer', 'dockTop', 'dockBottom'])(
    '%s rounds, reports, composes consumer layout, and cleans up to zero',
    (kind) => {
      const consumerOnLayout = jest.fn();
      let current!: ReturnType<typeof useFixedRegionLayout>;
      let tr!: TestRenderer.ReactTestRenderer;
      act(() => {
        tr = TestRenderer.create(
          <Harness
            kind={kind}
            mounted
            consumerOnLayout={consumerOnLayout}
            onValue={(value) => (current = value)}
          />,
        );
      });

      const event = { nativeEvent: { layout: { height: 42.6 } } } as LayoutChangeEvent;
      act(() => tr.root.findByType(View).props.onLayout(event));

      expect(current[CHANNEL_BY_KIND[kind]]).toBe(43);
      expect(consumerOnLayout).toHaveBeenCalledTimes(1);
      expect(consumerOnLayout).toHaveBeenCalledWith(event);

      act(() => tr.root.findByType(View).props.onLayout(event));
      expect(current[CHANNEL_BY_KIND[kind]]).toBe(43);
      expect(consumerOnLayout).toHaveBeenCalledTimes(2);

      act(() => {
        tr.update(
          <Harness
            kind={kind}
            mounted={false}
            consumerOnLayout={consumerOnLayout}
            onValue={(value) => (current = value)}
          />,
        );
      });
      expect(current[CHANNEL_BY_KIND[kind]]).toBe(0);
    },
  );
});
