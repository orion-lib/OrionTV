import React, {useEffect, useRef, useState} from 'react';
import {
  findNodeHandle,
  Image,
  Pressable,
  PressableStateCallbackType,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {VideoItem} from '../types';

interface Props {
  item: VideoItem;
  isFavorite: boolean;
  onPress: () => void;
  nextFocusUp?: number;
  nextFocusLeft?: number;
  nextFocusRight?: number;
  lockLeft?: boolean;
  lockRight?: boolean;
}

type PressableHandle = React.ElementRef<typeof Pressable>;

export const NewReleaseCard: React.FC<Props> = ({
  item,
  isFavorite,
  onPress,
  nextFocusUp,
  nextFocusLeft,
  nextFocusRight,
  lockLeft,
  lockRight,
}) => {
  const [focused, setFocused] = useState(false);
  const [selfHandle, setSelfHandle] = useState<number | undefined>();
  const pressableRef = useRef<PressableHandle>(null);

  useEffect(() => {
    const handle = pressableRef.current
      ? findNodeHandle(pressableRef.current)
      : null;
    if (handle) {
      setSelfHandle(handle);
    }
  }, []);

  const computedStyle = ({pressed}: PressableStateCallbackType) => [
    styles.card,
    focused && styles.focused,
    pressed && styles.pressed,
  ];

  return (
    <Pressable
      ref={pressableRef}
      focusable
      nextFocusUp={nextFocusUp}
      nextFocusLeft={lockLeft ? selfHandle : nextFocusLeft}
      nextFocusRight={lockRight ? selfHandle : nextFocusRight}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={computedStyle}
      onPress={onPress}>
      <Image source={{uri: item.poster}} style={styles.poster} />
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          {isFavorite ? <Icon name="heart" size={14} color="#ff6b6b" /> : null}
        </View>
        <Text style={styles.meta}>
          {item.year} · {item.duration}
        </Text>
        <Text style={styles.desc} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 220,
    marginRight: 14,
    borderRadius: 16,
    backgroundColor: '#141824',
    borderWidth: 1,
    borderColor: '#1f2430',
    overflow: 'hidden',
  },
  poster: {
    width: '100%',
    height: 130,
  },
  body: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  meta: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4,
  },
  desc: {
    color: '#cbd5e1',
    fontSize: 12,
    marginTop: 6,
  },
  focused: {
    borderColor: '#7cc0ff',
    shadowColor: '#7cc0ff',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 0},
    elevation: 6,
  },
  pressed: {
    opacity: 0.9,
  },
});
