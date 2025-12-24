import React, {useState} from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import {VideoItem} from '../types';

interface Props {
  item: VideoItem;
  onPress: () => void;
  isFavorite: boolean;
}

export const VideoCard: React.FC<Props> = ({item, onPress, isFavorite}) => {
  const [focused, setFocused] = useState(false);

  return (
    <Pressable
      focusable
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({pressed}) => [
        styles.card,
        (focused || pressed) && styles.focused,
      ]}
      onPress={onPress}>
      <Image source={{uri: item.poster}} style={styles.poster} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.75)']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>{item.year}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.meta}>{item.duration}</Text>
          {isFavorite ? (
            <Icon name="heart" size={16} color="#ff6b6b" style={styles.icon} />
          ) : null}
        </View>
        <Text style={styles.desc} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 200,
    height: 280,
    marginRight: 12,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#1b1e28',
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  title: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  meta: {
    color: '#cfd3dc',
    fontSize: 12,
  },
  dot: {
    color: '#cfd3dc',
    marginHorizontal: 6,
  },
  desc: {
    color: '#d8dee9',
    fontSize: 12,
  },
  icon: {
    marginLeft: 6,
  },
  focused: {
    borderColor: '#6ac2ff',
    borderWidth: 2,
    transform: [{scale: 1.03}],
    shadowColor: '#6ac2ff',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 0},
    elevation: 6,
  },
});
