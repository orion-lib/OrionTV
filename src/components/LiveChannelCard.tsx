import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {LiveChannel} from '../types';

interface Props {
  item: LiveChannel;
  active: boolean;
  onPress: () => void;
}

export const LiveChannelCard: React.FC<Props> = ({item, active, onPress}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.card, active && styles.active]}>
      <Image source={{uri: item.poster}} style={styles.poster} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.meta}>{item.category}</Text>
        {item.description ? (
          <Text style={styles.desc} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2f3544',
    marginBottom: 10,
    backgroundColor: '#1e2331',
  },
  active: {
    borderColor: '#5ac8fa',
    backgroundColor: '#252b3a',
  },
  poster: {
    width: 96,
    height: 72,
    borderRadius: 10,
  },
  info: {
    marginLeft: 10,
    flex: 1,
  },
  title: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  meta: {
    color: '#9aa0aa',
    marginTop: 2,
  },
  desc: {
    color: '#cfd3dc',
    marginTop: 6,
    fontSize: 12,
  },
});
