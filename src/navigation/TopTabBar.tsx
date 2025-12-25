import React, {useEffect, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {TAB_ITEMS} from './tabConfig';

export const TopTabBar: React.FC<BottomTabBarProps> = ({
  state,
  navigation,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const formatTime = (date: Date) => {
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    };
    const updateTime = () => setCurrentTime(formatTime(new Date()));
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.logo}>YOGURT</Text>
        <View style={styles.rightSection}>
          <View style={styles.status}>
            <Icon
              name="search-outline"
              size={11}
              color="#cbd5e1"
              style={styles.statusIcon}
            />
            <Icon
              name="heart-outline"
              size={11}
              color="#cbd5e1"
              style={styles.statusIcon}
            />
            <Icon
              name="settings-outline"
              size={11}
              color="#cbd5e1"
              style={styles.statusIcon}
            />
            <Text style={styles.time}>{currentTime}</Text>
          </View>
        </View>
      </View>
      <View style={styles.tabsRow}>
        {TAB_ITEMS.map(item => {
          const routeIndex = state.routes.findIndex(route => route.name === item.name);
          const isFocused = routeIndex === state.index;
          return (
            <Pressable
              key={item.name}
              onPress={() => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: state.routes[routeIndex]?.key,
                  canPreventDefault: true,
                });
                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(item.name);
                }
              }}
              style={[styles.tabItem, isFocused && styles.tabItemActive]}>
              {item.name === 'Search' ||
              item.name === 'Favorites' ||
              item.name === 'Settings' ? (
                <View style={styles.iconTab}>
                  <Icon
                    name={item.icon as never}
                    size={12}
                    color={isFocused ? '#eef4ff' : '#cbd5e1'}
                  />
                  {item.name === 'Settings' ? (
                    <Text
                      style={[
                        styles.settingsTime,
                        isFocused && styles.settingsTimeActive,
                      ]}>
                      {currentTime}
                    </Text>
                  ) : null}
                </View>
              ) : (
                <Text style={[styles.tabText, isFocused && styles.tabTextActive]}>
                  {item.title}
                </Text>
              )}
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
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2430',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    fontSize: 22,
    fontWeight: '900',
    color: '#e9f2ff',
    letterSpacing: 1.1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    marginLeft: 10,
  },
  time: {
    color: '#cbd5e1',
    fontWeight: '700',
    fontSize: 10,
    marginLeft: 10,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  tabItem: {
    marginRight: 18,
    paddingBottom: 6,
  },
  tabItemActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#7cc0ff',
  },
  tabText: {
    color: '#cbd5e1',
    fontSize: 16,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#eef4ff',
    textShadowColor: 'rgba(118, 190, 255, 0.6)',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 8,
  },
  iconTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingsTime: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '600',
  },
  settingsTimeActive: {
    color: '#eef4ff',
  },
});
