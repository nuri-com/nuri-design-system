import * as React from 'react';
import type { TextInput } from 'react-native';

export type FocusScrollApi = {
  requestScrollToFocusedInput: (input: TextInput | null) => void;
};

const FocusScrollContext = React.createContext<FocusScrollApi | null>(null);

export const FocusScrollProvider = FocusScrollContext.Provider;

export function useFocusScroll(): FocusScrollApi | null {
  return React.useContext(FocusScrollContext);
}
