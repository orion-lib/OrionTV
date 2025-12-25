import React, {useEffect, useRef, useState} from 'react';
import 'react-native-gesture-handler';
import {
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import {enableScreens} from 'react-native-screens';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {
  Animated,
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
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: 900,
      useNativeDriver: false,
    });

    animation.start(() => {
      setIsBooting(false);
    });

    return () => {
      animation.stop();
    };
  }, [progress]);

  if (isBooting) {
    return (
      <SafeAreaProvider>
        <StatusBar
          barStyle="light-content"
          backgroundColor={BOOT_BACKGROUND}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>加载中...</Text>
          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressIndicator,
                {
                  width: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['12%', '100%'],
                  }),
                },
              ]}
            />
          </View>
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
    marginBottom: 16,
  },
  progressTrack: {
    width: 220,
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(124, 140, 255, 0.2)',
    overflow: 'hidden',
  },
  progressIndicator: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#7c8cff',
  },
});

export default App;
