// Metro config · monorepo (N+19 · M2 · decision 65.7/65.8). expo-demo resolves
// the symlink chain expo-demo → @nuri/factory → @nuri/spec across the npm
// workspaces. Two things the single-package default does not do:
//   1. WATCH the repo root, so Metro sees the sibling packages/* (the symlinked
//      @nuri/* live above this app's dir).
//   2. Resolve modules from BOTH this app's node_modules and the hoisted root
//      node_modules (npm hoists most deps to the root in a workspace install).
// @nuri/spec ships RAW .ts (no dist · §65.8); Metro transforms it (and
// @nuri/factory's .ts) via babel-preset-expo like any in-tree source, and
// resolves @nuri/spec's `exports` subpaths via Metro's package-exports support
// (on by default in Expo 54).
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// ── Single React instance (M2 monorepo integration · decision 65.8/65.11) ──
// @nuri/factory is symlinked, and the workspace install nests its OWN
// react@19.1.0 under packages/factory while the app carries its own copy under
// packages/expo-demo. Metro would then bundle TWO react instances — the factory
// components' hooks would run against a dispatcher the app's react-dom never
// set, so `useContext` reads null and the first render throws (empty #root /
// blank screen). Redirect every `react`/`react-dom` request — including those
// originating inside the symlinked factory — to resolve from the app root, so
// the whole bundle shares ONE react. (This touches only the app's bundler, not
// @nuri/spec's resolution. M4 [§65.11] removed @nuri/spec's button-matrix
// react@19.2.6 pin, but npm's conservative re-dedupe leaves the orphaned root
// hoist in place and the workspaces still nest their own react, so the
// multi-instance hazard this guards against persists — the redirect STAYS.)
// `react-native` is left to Metro's platform-aware resolution (web aliases it
// to the single react-native-web).
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName === 'react' ||
    moduleName === 'react-dom' ||
    moduleName.startsWith('react/') ||
    moduleName.startsWith('react-dom/')
  ) {
    return context.resolveRequest(
      { ...context, originModulePath: path.join(projectRoot, 'index.ts') },
      moduleName,
      platform,
    );
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
