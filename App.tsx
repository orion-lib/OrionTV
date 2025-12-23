import React, {useEffect} from 'react';
import 'react-native-gesture-handler';
import {
  NavigationContainer,
  DefaultTheme,
  createNavigationContainerRef,
  NavigationState,
} from '@react-navigation/native';
import {enableScreens} from 'react-native-screens';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {BackHandler, DeviceEventEmitter, Platform, StatusBar} from 'react-native';
import Toast from 'react-native-toast-message';
import {RootNavigator} from './src/navigation/RootNavigator';
import {MediaProvider} from './src/context/MediaContext';

enableScreens();

type TabRouteName = 'Home' | 'Search' | 'Live' | 'Favorites' | 'Settings';

const tabOrder: TabRouteName[] = ['Home', 'Search', 'Live', 'Favorites', 'Settings'];

const navigationRef = createNavigationContainerRef();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#0b0d14',
  },
};

function App(): JSX.Element {
  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    const moveTabFocus = (direction: number) => {
      if (!navigationRef.isReady()) {
        return;
      }

      const rootState = navigationRef.getRootState();
      const tabsState = rootState?.routes.find(route => route.name === 'Tabs')
        ?.state as NavigationState | undefined;

      if (!tabsState?.routeNames || tabsState.index == null) {
        return;
      }

      const currentTab = tabsState.routeNames[tabsState.index] as TabRouteName;
      const currentIndex = tabOrder.indexOf(currentTab);

      if (currentIndex === -1) {
        return;
      }

      const nextIndex =
        (currentIndex + direction + tabOrder.length) % tabOrder.length;
      navigationRef.navigate(tabOrder[nextIndex]);
    };

    const subscription = DeviceEventEmitter.addListener(
      'hardwareKeyEvent',
      event => {
        if (event.action !== 'down' || !navigationRef.isReady()) {
          return;
        }

        switch (event.keyCode) {
          case 21: // KEYCODE_DPAD_LEFT
            moveTabFocus(-1);
            break;
          case 22: // KEYCODE_DPAD_RIGHT
            moveTabFocus(1);
            break;
          case 4: // KEYCODE_BACK
            if (navigationRef.canGoBack()) {
              navigationRef.goBack();
            } else {
              BackHandler.exitApp();
            }
            break;
          default:
            break;
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <MediaProvider>
        <NavigationContainer ref={navigationRef} theme={navTheme}>
          <StatusBar barStyle="light-content" />
          <RootNavigator />
          <Toast />
        </NavigationContainer>
      </MediaProvider>
    </SafeAreaProvider>
  );
}

export default App;
