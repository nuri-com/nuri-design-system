import { Platform } from 'react-native';
import type { TextInput } from 'react-native';

type NativeTextInputCommands = {
  setTextAndSelection(
    ref: TextInput,
    eventCount: number,
    text: string,
    start: number,
    end: number,
  ): void;
};

// Private React Native boundary, verified against the vendored RN 0.81.5
// implementation. Keep every deep RN import in this file and keep the package's
// peer range pinned to that verified version.
function commandsForPlatform(): NativeTextInputCommands | null {
  if (Platform.OS === 'web') return null;
  if (Platform.OS === 'ios') {
    return (require('react-native/Libraries/Components/TextInput/RCTSingelineTextInputNativeComponent') as {
      Commands: NativeTextInputCommands;
    }).Commands;
  }
  if (Platform.OS === 'android') {
    return (require('react-native/Libraries/Components/TextInput/AndroidTextInputNativeComponent') as {
      Commands: NativeTextInputCommands;
    }).Commands;
  }
  throw new UnsupportedNativeTextInputPlatformError(String(Platform.OS));
}

export class UnsupportedNativeTextInputPlatformError extends Error {
  constructor(platform: string) {
    super(`Nuri TextField native text commands do not support platform '${platform}'`);
    this.name = 'UnsupportedNativeTextInputPlatformError';
  }
}

export function setTextAndSelection(
  ref: TextInput,
  eventCount: number,
  text: string,
  start: number,
  end: number,
): void {
  // React Native web stays controlled and must never cross the native command
  // boundary. The no-op also keeps accidental direct adapter calls inert.
  commandsForPlatform()?.setTextAndSelection(ref, eventCount, text, start, end);
}
