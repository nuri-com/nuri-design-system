import { Platform } from 'react-native';
import type { TextInput } from 'react-native';

const mockIosSetTextAndSelection = jest.fn();
const mockAndroidSetTextAndSelection = jest.fn();

jest.mock('react-native/Libraries/Components/TextInput/RCTSingelineTextInputNativeComponent', () => ({
  Commands: { setTextAndSelection: mockIosSetTextAndSelection },
}));
jest.mock('react-native/Libraries/Components/TextInput/AndroidTextInputNativeComponent', () => ({
  Commands: { setTextAndSelection: mockAndroidSetTextAndSelection },
}));

import {
  setTextAndSelection,
  UnsupportedNativeTextInputPlatformError,
} from '../runtime/native-text-input-command';

describe('native TextInput command boundary (RN 0.81.5)', () => {
  const originalPlatformOS = Platform.OS;
  const ref = {} as TextInput;

  afterEach(() => {
    mockIosSetTextAndSelection.mockClear();
    mockAndroidSetTextAndSelection.mockClear();
    Object.defineProperty(Platform, 'OS', { configurable: true, get: () => originalPlatformOS });
  });

  test('selects the iOS single-line codegen Commands object', () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, get: () => 'ios' });
    setTextAndSelection(ref, 4, 'Ada', 3, 3);
    expect(mockIosSetTextAndSelection).toHaveBeenCalledWith(ref, 4, 'Ada', 3, 3);
    expect(mockAndroidSetTextAndSelection).not.toHaveBeenCalled();
  });

  test('selects the Android codegen Commands object', () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, get: () => 'android' });
    setTextAndSelection(ref, 5, 'Lennard', 7, 7);
    expect(mockAndroidSetTextAndSelection).toHaveBeenCalledWith(ref, 5, 'Lennard', 7, 7);
    expect(mockIosSetTextAndSelection).not.toHaveBeenCalled();
  });

  test('is inert on web and fails by name on unsupported native platforms', () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, get: () => 'web' });
    setTextAndSelection(ref, 1, 'web', 3, 3);
    expect(mockIosSetTextAndSelection).not.toHaveBeenCalled();
    expect(mockAndroidSetTextAndSelection).not.toHaveBeenCalled();

    Object.defineProperty(Platform, 'OS', { configurable: true, get: () => 'windows' });
    expect(() => setTextAndSelection(ref, 1, 'native', 6, 6)).toThrow(UnsupportedNativeTextInputPlatformError);
  });
});
