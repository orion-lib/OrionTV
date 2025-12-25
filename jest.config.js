module.exports = {
  preset: 'react-native',
  setupFiles: ['./jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-native-tvos|@react-navigation|react-native-vector-icons|react-native-reanimated|react-native-gesture-handler|react-native-safe-area-context|react-native-toast-message|react-native-linear-gradient|react-native-keep-awake)/)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
