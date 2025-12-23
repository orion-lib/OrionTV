import React, {useState} from 'react';
import {
  ImageBackground,
  Pressable,
  PressableStateCallbackType,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {VideoItem} from '../types';

type Variant = 'hero' | 'wide' | 'tile';

interface Props {
  item: VideoItem;
  variant?: Variant;
  onPress: () => void;
  hasTVPreferredFocus?: boolean;
}

const variantStyles: Record<Variant, {height: number; flex: number}> = {
  hero: {height: 220, flex: 1},
  wide: {height: 120, flex: 1},
  tile: {height: 120, flex: 1},
};

export const ShowcaseCard: React.FC<Props> = ({
  item,
  onPress,
  variant = 'wide',
  hasTVPreferredFocus,
}) => {
  const [focused, setFocused] = useState(false);

  const computedStyle = ({pressed}: PressableStateCallbackType) => [
    styles.card,
    variantStyles[variant],
    focused && styles.focused,
    pressed && styles.pressed,
  ];

  return (
    <Pressable
      focusable
      hasTVPreferredFocus={hasTVPreferredFocus}
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={computedStyle}>
      <ImageBackground
        source={{uri: item.poster}}
        style={styles.background}
        imageStyle={styles.image}>
        <LinearGradient
          colors={['rgba(11,13,20,0.1)', 'rgba(11,13,20,0.85)']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.topRow}>
          {item.tags?.[0] ? (
            <View style={styles.tag}>
              <Text style={styles.tagText}>{item.tags[0]}</Text>
            </View>
          ) : null}
          <Text style={styles.rating}>{item.year}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {item.description}
          </Text>
        </View>
      </ImageBackground>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#161926',
    borderWidth: 1,
    borderColor: '#1f2430',
    marginHorizontal: 6,
    transform: [{scale: 1}],
  },
  focused: {
    borderColor: '#6ac2ff',
    shadowColor: '#6ac2ff',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 0},
    transform: [{scale: 1.03}],
  },
  pressed: {
    opacity: 0.9,
  },
  background: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  image: {
    borderRadius: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tag: {
    backgroundColor: 'rgba(102,153,255,0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  tagText: {
    color: '#e9f2ff',
    fontWeight: '700',
    fontSize: 12,
  },
  rating: {
    color: '#cdd6f4',
    fontWeight: '700',
    fontSize: 13,
  },
  info: {},
  title: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  meta: {
    color: '#cbd5e1',
    marginTop: 6,
    fontSize: 12,
  },
});
