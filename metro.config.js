// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

// Find the project and workspace directories
// eslint-disable-next-line no-undef
const projectRoot = __dirname;

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot);

// When enabled, the optional code below will allow Metro to resolve
// and bundle source files with TV-specific extensions
// (e.g., *.ios.tv.tsx, *.android.tv.tsx, *.tv.tsx)
//
// Metro will still resolve source files with standard extensions
// as usual if TV-specific files are not found for a module.
//
// if (process.env?.EXPO_TV === '1') {
//   const originalSourceExts = config.resolver.sourceExts;
//   const tvSourceExts = [
//     ...originalSourceExts.map((e) => `tv.${e}`),
//     ...originalSourceExts,
//   ];
//   config.resolver.sourceExts = tvSourceExts;
// }

// This can be replaced with `find-yarn-workspace-root`
const monorepoRoot = path.resolve(projectRoot, "../..");

// 1. Watch all files within the monorepo
config.watchFolders = [monorepoRoot];
// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];
config.resolver.disableHierarchicalLookup = true;

// 3. Let Metro know to use 'react-native-quick-crypto' when 'crypto' is imported, and '@craftzdog/react-native-buffer' when 'Buffer' is imported
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'crypto') {
    // when importing crypto, resolve to react-native-quick-crypto
    return context.resolveRequest(
      context,
      'react-native-quick-crypto',
      platform,
    )
  }
  if (moduleName === 'buffer') {
    // when importing Buffer, resolve to @craftzdog/react-native-buffer
    return context.resolveRequest(
      context,
      '@craftzdog/react-native-buffer',
      platform,
    )
  }

  // otherwise chain to the standard Metro resolver.
  return context.resolveRequest(context, moduleName, platform)
}

module.exports = config;
