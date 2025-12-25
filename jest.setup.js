/* eslint-env jest */
import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});
jest.mock('react-native-screens', () => ({
  enableScreens: jest.fn(),
  screensEnabled: jest.fn(),
  Screen: jest.fn(),
  ScreenContainer: jest.fn(({children}) => children),
}));
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock(
  'react-native-document-picker',
  () => ({
    pick: jest.fn(),
    pickSingle: jest.fn(),
    types: {video: 'video'},
    isCancel: jest.fn(() => false),
    isInProgress: jest.fn(() => false),
  }),
  {virtual: true},
);
