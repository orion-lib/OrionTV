import React, {ComponentType} from 'react';
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
import {TopTabBar} from './TopTabBar';
import {TAB_ITEMS, TabRouteName} from './tabConfig';

export type RootStackParamList = {
  Tabs: undefined;
  Detail: {id: string};
  Play: {id: string};
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const TAB_COMPONENTS: Record<TabRouteName, ComponentType<any>> = {
  Home: HomeScreen,
  Search: SearchScreen,
  Live: LiveScreen,
  Favorites: FavoritesScreen,
  Settings: SettingsScreen,
};

const TabNavigator = () => (
  <Tab.Navigator
    tabBar={props => <TopTabBar {...props} />}
    sceneContainerStyle={{paddingTop: 70}}
    screenOptions={{
      headerShown: false,
      tabBarStyle: {display: 'none'},
    }}>
    {TAB_ITEMS.map(item => (
      <Tab.Screen
        key={item.name}
        name={item.name}
        component={TAB_COMPONENTS[item.name]}
        options={{
          title: item.title,
          tabBarIcon: ({color, size}) => (
            <Icon name={item.icon as never} size={size} color={color} />
          ),
        }}
      />
    ))}
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
