import React, {useMemo, useState} from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  FlatList,
} from 'react-native';
import Video from 'react-native-video';
import {useMedia} from '../context/MediaContext';
import {LiveChannelCard} from '../components/LiveChannelCard';
import {EmptyState} from '../components/EmptyState';

const LiveScreen: React.FC = () => {
  const {liveChannels} = useMedia();
  const [activeId, setActiveId] = useState<string | null>(
    liveChannels[0]?.id ?? null,
  );

  const activeChannel = useMemo(
    () => liveChannels.find(c => c.id === activeId),
    [activeId, liveChannels],
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.title}>直播</Text>
      {activeChannel ? (
        <View style={styles.player}>
          <Video
            source={{uri: activeChannel.url}}
            style={styles.video}
            resizeMode="contain"
            controls
          />
          <Text style={styles.channelTitle}>{activeChannel.title}</Text>
          <Text style={styles.channelDesc} numberOfLines={2}>
            {activeChannel.description}
          </Text>
        </View>
      ) : (
        <EmptyState title="暂无直播源" />
      )}
      <FlatList
        data={liveChannels}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({item}) => (
          <LiveChannelCard
            item={item}
            active={item.id === activeId}
            onPress={() => setActiveId(item.id)}
          />
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#0b0d14'},
  title: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 24,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  player: {
    padding: 16,
  },
  video: {height: 220, borderRadius: 12, backgroundColor: '#111625'},
  channelTitle: {color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 8},
  channelDesc: {color: '#cfd3dc', marginTop: 4},
  list: {paddingHorizontal: 16, paddingBottom: 24},
});

export default LiveScreen;
