import * as React from 'react';
import { AccessibilityInfo } from 'react-native';

export function useReducedMotion(): boolean | null {
  const [reduceMotion, setReduceMotion] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted) setReduceMotion(enabled);
      })
      .catch(() => {
        if (mounted) setReduceMotion(false);
      });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return reduceMotion;
}
