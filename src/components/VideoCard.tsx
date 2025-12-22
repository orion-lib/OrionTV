import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import {VideoItem} from '../types';

interface Props {
  item: VideoItem;
  onPress: () => void;
  isFavorite: boolean;
}

export const VideoCard: React.FC<Props> = ({item, onPress, isFavorite}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
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
    </TouchableOpacity>
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
});
