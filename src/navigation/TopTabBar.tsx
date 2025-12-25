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
  const statusTabs = TAB_ITEMS.filter(item =>
    ['Search', 'Favorites', 'Settings'].includes(item.name),
  );
  const categoryTabs = TAB_ITEMS.filter(
    item => !['Search', 'Favorites', 'Settings'].includes(item.name),
  );

  const handleNavigate = (routeName: string) => {
    const routeIndex = state.routes.findIndex(route => route.name === routeName);
    const isFocused = routeIndex === state.index;
    const event = navigation.emit({
      type: 'tabPress',
      target: state.routes[routeIndex]?.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(routeName as never);
    }
  };

  useEffect(() => {
    const formatTime = (date: Date) => {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
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
          <View style={styles.statusGroup}>
            <View style={styles.status}>
              {statusTabs.map(item => (
                <Pressable
                  key={item.name}
                  onPress={() => handleNavigate(item.name)}
                  style={({pressed}) => [
                    styles.statusButton,
                    pressed && styles.statusButtonPressed,
                  ]}>
                  <Icon name={item.icon as never} size={12} color="#e2e8f0" />
                </Pressable>
              ))}
            </View>
          </View>
          <View style={styles.statusDivider} />
          <View style={styles.timePill} focusable={false}>
            <Text style={styles.time}>{currentTime}</Text>
          </View>
        </View>
      </View>
      <View style={styles.tabsRow}>
        {categoryTabs.map(item => {
          const routeIndex = state.routes.findIndex(
            route => route.name === item.name,
          );
          const isFocused = routeIndex === state.index;
          return (
            <Pressable
              key={item.name}
              onPress={() => {
                handleNavigate(item.name);
              }}
              style={[styles.tabItem, isFocused && styles.tabItemActive]}>
              <Text style={[styles.tabText, isFocused && styles.tabTextActive]}>
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
    backgroundColor: '#0b0f1a',
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 14,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    fontSize: 16,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: 1.4,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusGroup: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 14,
    backgroundColor: 'rgba(148, 163, 184, 0.12)',
  },
  statusDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(148, 163, 184, 0.35)',
    marginHorizontal: 16,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusButton: {
    marginLeft: 10,
    padding: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(148, 163, 184, 0.12)',
  },
  statusButtonPressed: {
    backgroundColor: 'rgba(226, 232, 240, 0.2)',
  },
  timePill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  time: {
    color: '#e2e8f0',
    fontWeight: '600',
    fontSize: 12,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  tabItem: {
    marginRight: 22,
    paddingVertical: 2,
  },
  tabItemActive: {
    transform: [{scale: 1.04}],
  },
  tabText: {
    color: '#cbd5e1',
    fontSize: 17,
    fontWeight: '500',
    letterSpacing: 0.6,
  },
  tabTextActive: {
    color: '#f8fafc',
    fontWeight: '700',
    textShadowColor: 'rgba(148, 197, 255, 0.75)',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 10,
  },
});
