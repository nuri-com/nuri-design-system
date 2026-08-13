// Jest harness for the descriptor-factory render-smoke (N+19 · R1/R1.5, now
// intra-repo · M2). jest-expo provides the RN transform + native-module mocks;
// react-test-renderer mounts the factory output headless (no UI · R1).
const path = require('path');

// ── Single React + single React Native (M2 monorepo integration · 65.8) ──
// Keep react-test-renderer, jest-expo, and this package's components bound to
// the same physical React / React Native instances. Package-local: this affects
// only @nuri/rn's Jest harness and leaves @nuri/spec resolution untouched.
const react = require.resolve('react');
const reactNativeDir = path.dirname(require.resolve('react-native/package.json'));

/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  // The render/resolution suite is self-contained under ./__tests__ (the tests
  // span runtime/ + primitives/, so they live at the package root); scope Jest
  // to it so the suite stays the descriptor-consumption proof (not the whole package).
  roots: ['<rootDir>/__tests__'],
  setupFilesAfterEnv: ['<rootDir>/test/modal-stack-test-setup.ts'],
  moduleNameMapper: {
    '^react$': react,
    '^react/jsx-runtime$': require.resolve('react/jsx-runtime'),
    '^react/jsx-dev-runtime$': require.resolve('react/jsx-dev-runtime'),
    '^react-native$': path.join(reactNativeDir, 'index.js'),
    '^react-native/(.*)$': path.join(reactNativeDir, '$1'),
  },
  // Don't let this package's Jest scan the sibling @nuri/expo-demo workspace —
  // it nests a duplicate react-native@0.81.5 that collides in jest-expo's haste
  // map. This package's tests never import from expo-demo. (@nuri/spec is NOT
  // ignored — the render-smoke imports the frozen contract from it.)
  modulePathIgnorePatterns: ['/packages/expo-demo/'],
  // @nuri/spec ships RAW .ts (no dist · §65.8) and now resolves UNDER
  // node_modules via the workspace symlink. jest-expo's default
  // transformIgnorePatterns excludes node_modules (with an RN allowlist); ADD
  // @nuri/spec so its .ts (the frozen contract the smoke imports) gets
  // transformed. The pattern below is jest-expo's default with @nuri/spec
  // appended to the negative-lookahead allowlist (M2 integration · decision 65.8).
  transformIgnorePatterns: [
    '/node_modules/(?!(.pnpm|react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry/react-native|native-base|@nuri/spec))',
  ],
};
