// Jest harness for the descriptor-factory render-smoke (N+19 · R1/R1.5, now
// intra-repo · M2). jest-expo provides the RN transform + native-module mocks;
// react-test-renderer mounts the factory output headless (no UI · R1).
const path = require('path');

// ── Single React + single React Native (M2 monorepo integration · 65.8/65.11) ──
// The workspace install nests this package's react@19.1.0 + react-native@0.81.5
// (the Expo-54 runtime) UNDER packages/factory, while the repo ROOT still carries
// react@19.2.6 + react-native@0.80.3. With several physical copies in the tree,
// the toolchain binds the WRONG ones:
//   · react-test-renderer's peer is `^19.1.0`, so npm hoists it to the root,
//     where its internal `require('react')` finds the root's 19.2.6 — a
//     different instance than the components' 19.1.0, so `useContext` reads null.
//   · jest-expo resolves `react-native` from the root's 0.80.3 — which its
//     0.81-shaped native-module mock doesn't fit (`__fbBatchedBridgeConfig is
//     not set`).
// Redirect every react / react-native specifier (incl. the ones inside
// react-test-renderer and the jest-expo setup) to THIS package's copies so the
// whole run shares ONE react and ONE react-native. Factory-LOCAL — it leaves
// @nuri/spec's resolution untouched.
//
// WHY THIS SURVIVES M4 (§65.11): the root's react@19.2.6 / react-native@0.80.3
// were ORIGINALLY @nuri/spec's button-matrix migration-tsc devDeps. M4 removed
// them from @nuri/spec — but `npm install`'s conservative re-dedupe does NOT
// prune the now-orphaned root hoists (the Expo ecosystem's `react@"*"` /
// `react-native@"*"` floating peers still dedupe against them, so npm sees no
// reason to move them). The dual-version tree this redirect guards against thus
// PERSISTS, so the workaround STAYS (VERIFIED: removing it at M4 reproduced the
// `__fbBatchedBridgeConfig` failure). Two clean collapses to a single
// 19.1.0/0.81.5 exist as FUTURE options (neither taken — out of M4's CI-only
// scope · the conservative tree is green · don't-force-it): a from-scratch
// lockfile regen, or — now that the migration tsc no longer needs RN 0.80.3 —
// the M2-rejected global dedupe `override` (its rejection reason is void). §65.11.
const react = require.resolve('react');
const reactNativeDir = path.dirname(require.resolve('react-native/package.json'));

/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  // The factory smoke is self-contained under ./factory; scope Jest to it so
  // the suite stays the descriptor-consumption proof (not the whole package).
  roots: ['<rootDir>/factory'],
  moduleNameMapper: {
    '^react$': react,
    '^react/jsx-runtime$': require.resolve('react/jsx-runtime'),
    '^react/jsx-dev-runtime$': require.resolve('react/jsx-dev-runtime'),
    '^react-native$': path.join(reactNativeDir, 'index.js'),
    '^react-native/(.*)$': path.join(reactNativeDir, '$1'),
  },
  // Don't let this package's Jest scan the sibling @nuri/expo-demo workspace —
  // it nests a duplicate react-native@0.81.5 that collides in jest-expo's haste
  // map. The factory's tests never import from expo-demo. (@nuri/spec is NOT
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
    '/node_modules/react-native-reanimated/plugin/',
  ],
};
