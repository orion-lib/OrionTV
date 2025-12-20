import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import SettingsScreen from '../screens/SettingsScreen';
import DetailScreen from '../screens/DetailScreen';
import PlayScreen from '../screens/PlayScreen';
import LiveScreen from '../screens/LiveScreen';

export type RootStackParamList = {
  Tabs: undefined;
  Detail: {id: string};
  Play: {id: string};
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#5ac8fa',
      tabBarStyle: {backgroundColor: '#0f111a', borderTopColor: '#1f2430'},
    }}>
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        title: '首页',
        tabBarIcon: ({color, size}) => (
          <Icon name="home-outline" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Search"
      component={SearchScreen}
      options={{
        title: '搜索',
        tabBarIcon: ({color, size}) => (
          <Icon name="search-outline" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Live"
      component={LiveScreen}
      options={{
        title: '直播',
        tabBarIcon: ({color, size}) => (
          <Icon name="tv-outline" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Favorites"
      component={FavoritesScreen}
      options={{
        title: '收藏',
        tabBarIcon: ({color, size}) => (
          <Icon name="heart-outline" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Settings"
      component={SettingsScreen}
      options={{
        title: '设置',
        tabBarIcon: ({color, size}) => (
          <Icon name="settings-outline" size={size} color={color} />
        ),
      }}
    />
  </Tab.Navigator>
);

export const RootNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      contentStyle: {backgroundColor: '#0b0d14'},
    }}>
    <Stack.Screen name="Tabs" component={TabNavigator} />
    <Stack.Screen name="Detail" component={DetailScreen} />
    <Stack.Screen name="Play" component={PlayScreen} />
  </Stack.Navigator>
);
