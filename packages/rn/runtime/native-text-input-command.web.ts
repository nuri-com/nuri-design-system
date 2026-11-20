import type { TextInput } from 'react-native';

export class UnsupportedNativeTextInputPlatformError extends Error {
  constructor(platform: string) {
    super(`Nuri TextField native text commands do not support platform '${platform}'`);
    this.name = 'UnsupportedNativeTextInputPlatformError';
  }
}

export function setTextAndSelection(
  _ref: TextInput,
  _eventCount: number,
  _text: string,
  _start: number,
  _end: number,
): void {
  // React Native Web stays controlled. Keeping the web adapter in a separate
  // module prevents Metro from adding the native-only TextInput command
  // implementations to the web dependency graph.
}
