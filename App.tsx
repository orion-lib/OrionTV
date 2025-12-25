import React, {useEffect, useState} from 'react';
import 'react-native-gesture-handler';
import {
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import {enableScreens} from 'react-native-screens';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
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

const BOOT_BACKGROUND = '#0b0d14';

function App(): JSX.Element {
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsBooting(false);
    }, 350);

    return () => clearTimeout(timeout);
  }, []);

  if (isBooting) {
    return (
      <SafeAreaProvider>
        <StatusBar
          barStyle="light-content"
          backgroundColor={BOOT_BACKGROUND}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#7c8cff" size="large" />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

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

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: BOOT_BACKGROUND,
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: '#d6d8e5',
    fontSize: 14,
    marginTop: 12,
  },
});

export default App;
