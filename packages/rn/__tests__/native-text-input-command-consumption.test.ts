describe('vendored RN 0.81.5 private TextInput modules', () => {
  test('Jest can consume both platform codegen Commands objects', () => {
    const ios = require('react-native/Libraries/Components/TextInput/RCTSingelineTextInputNativeComponent') as {
      Commands: { setTextAndSelection: unknown };
    };
    const android = require('react-native/Libraries/Components/TextInput/AndroidTextInputNativeComponent') as {
      Commands: { setTextAndSelection: unknown };
    };

    expect(typeof ios.Commands.setTextAndSelection).toBe('function');
    expect(typeof android.Commands.setTextAndSelection).toBe('function');
  });
});
