import React from 'react';
import 'react-native-gesture-handler';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import {enableScreens} from 'react-native-screens';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {StatusBar} from 'react-native';
import Toast from 'react-native-toast-message';
import {RootNavigator} from './src/navigation/RootNavigator';
import {MediaProvider} from './src/context/MediaContext';

enableScreens();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#0b0d14',
  },
};

function App(): JSX.Element {
  return (
    <SafeAreaProvider>
      <MediaProvider>
        <NavigationContainer theme={navTheme}>
          <StatusBar barStyle="light-content" />
          <RootNavigator />
          <Toast />
        </NavigationContainer>
      </MediaProvider>
    </SafeAreaProvider>
  );
}

export default App;
