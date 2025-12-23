import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {TAB_ITEMS} from './tabConfig';

export const TopTabBar: React.FC<BottomTabBarProps> = ({state, navigation}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>YOGURT</Text>
      <View style={styles.tabs}>
        {TAB_ITEMS.map((item, idx) => {
          const tabIndex = state.routes.findIndex(route => route.name === item.name);
          const focused = state.index === tabIndex;

          return (
            <Pressable
              key={item.name}
              accessibilityRole="button"
              focusable
              onPress={() => navigation.navigate(item.name)}
              style={({pressed}) => [
                styles.tab,
                (focused || pressed) && styles.tabActive,
              ]}>
              <Icon
                name={item.icon as never}
                size={18}
                color={focused ? '#5ac8fa' : '#cbd5e1'}
                style={styles.icon}
              />
              <Text style={[styles.label, focused && styles.labelActive]}>
                {item.title}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    backgroundColor: '#0b0d14',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#1f2430',
  },
  logo: {
    fontSize: 22,
    fontWeight: '900',
    color: '#e9f2ff',
    letterSpacing: 1.1,
  },
  tabs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1f2430',
    backgroundColor: '#121624',
  },
  tabActive: {
    borderColor: '#5ac8fa',
    backgroundColor: '#1b2332',
  },
  label: {
    color: '#cbd5e1',
    fontWeight: '700',
    fontSize: 13,
  },
  labelActive: {
    color: '#5ac8fa',
  },
  icon: {
    marginRight: 6,
  },
});
