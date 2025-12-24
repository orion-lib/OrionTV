import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {TAB_ITEMS} from './tabConfig';

export const TopTabBar: React.FC<BottomTabBarProps> = ({state, navigation}) => {
  const [focusedName, setFocusedName] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>YOGURT</Text>
      <View style={styles.tabs}>
        {TAB_ITEMS.map(item => {
          const tabIndex = state.routes.findIndex(route => route.name === item.name);
          const focused = state.index === tabIndex;
          const isFocused = focusedName === item.name;

          return (
            <Pressable
              key={item.name}
              accessibilityRole="button"
              focusable
              onFocus={() => setFocusedName(item.name)}
              onBlur={() => setFocusedName(null)}
              onPress={() => navigation.navigate(item.name)}
              style={({pressed}) => [
                styles.tab,
                (focused || isFocused || pressed) && styles.tabActive,
              ]}>
              <Text style={[styles.label, (focused || isFocused) && styles.labelActive]}>
                {item.title}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.status}>
        <Icon name="notifications-outline" size={16} color="#cbd5e1" style={styles.statusIcon} />
        <Icon name="star-outline" size={16} color="#cbd5e1" style={styles.statusIcon} />
        <Icon name="search-outline" size={16} color="#cbd5e1" style={styles.statusIcon} />
        <Icon name="wifi-outline" size={16} color="#cbd5e1" style={styles.statusIcon} />
        <Text style={styles.time}>12:24</Text>
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
    flex: 1,
    justifyContent: 'center',
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabActive: {
    borderColor: '#5ac8fa',
    backgroundColor: '#131a27',
  },
  label: {
    color: '#cbd5e1',
    fontWeight: '700',
    fontSize: 14,
  },
  labelActive: {
    color: '#5ac8fa',
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
    marginLeft: 4,
  },
});
