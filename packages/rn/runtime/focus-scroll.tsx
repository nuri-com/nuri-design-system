import * as React from 'react';
import type { TextInput } from 'react-native';

export type FocusScrollApi = {
  onInputFocus: (input: TextInput | null) => void;
  onInputBlur: (input: TextInput | null) => void;
};

const FocusScrollContext = React.createContext<FocusScrollApi | null>(null);

export const FocusScrollProvider = FocusScrollContext.Provider;

export function useFocusScroll(): FocusScrollApi | null {
  return React.useContext(FocusScrollContext);
}

type FocusableCallbacks = {
  onFocus?: () => void;
  onBlur?: () => void;
};

export type Focusable = {
  focused: boolean;
  onFocus: () => void;
  onBlur: () => void;
};

// The named input-side contract for Form Kit: every future field type consumes
// this once and inherits local ring state plus host-agnostic focus registration.
export function useFocusable(
  ref: React.RefObject<TextInput | null>,
  { onFocus: consumerOnFocus, onBlur: consumerOnBlur }: FocusableCallbacks = {},
): Focusable {
  const focusScroll = useFocusScroll();
  const [focused, setFocused] = React.useState(false);

  const onFocus = React.useCallback(() => {
    setFocused(true);
    focusScroll?.onInputFocus(ref.current);
    consumerOnFocus?.();
  }, [consumerOnFocus, focusScroll, ref]);

  const onBlur = React.useCallback(() => {
    setFocused(false);
    focusScroll?.onInputBlur(ref.current);
    consumerOnBlur?.();
  }, [consumerOnBlur, focusScroll, ref]);

  return { focused, onFocus, onBlur };
}
