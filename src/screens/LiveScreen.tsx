import React, {useMemo, useState} from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  FlatList,
} from 'react-native';
import {useMedia} from '../context/MediaContext';
import {LiveChannelCard} from '../components/LiveChannelCard';
import {EmptyState} from '../components/EmptyState';
import {MediaPlayer} from '../components/MediaPlayer';
import {SectionHeader} from '../components/SectionHeader';

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
          <SectionHeader
            title="正在直播"
            description="热门频道与正在播出的节目"
          />
          <MediaPlayer
            source={{uri: activeChannel.url}}
            style={styles.video}
            resizeMode="contain"
            controls
          />
          <View style={styles.channelInfo}>
            <Text style={styles.channelTitle}>{activeChannel.title}</Text>
            <Text style={styles.channelMeta}>{activeChannel.category}</Text>
            {activeChannel.nowPlaying ? (
              <Text style={styles.channelNow} numberOfLines={1}>
                正在播出：{activeChannel.nowPlaying}
              </Text>
            ) : null}
            {activeChannel.nextUp ? (
              <Text style={styles.channelNext} numberOfLines={1}>
                即将播出：{activeChannel.nextUp}
              </Text>
            ) : null}
            <Text style={styles.channelDesc} numberOfLines={2}>
              {activeChannel.description}
            </Text>
          </View>
        </View>
      ) : (
        <EmptyState title="暂无直播源" />
      )}
      <FlatList
        data={liveChannels}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          liveChannels.length ? (
            <SectionHeader title="频道列表" description="精选频道一键切换" />
          ) : null
        }
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
  channelInfo: {
    marginTop: 12,
  },
  channelTitle: {color: '#fff', fontSize: 18, fontWeight: '700'},
  channelMeta: {color: '#9aa0aa', marginTop: 4},
  channelNow: {color: '#e2e8f0', marginTop: 6},
  channelNext: {color: '#cbd5f5', marginTop: 4, fontSize: 12},
  channelDesc: {color: '#cfd3dc', marginTop: 6},
  list: {paddingHorizontal: 16, paddingBottom: 24},
});

export default LiveScreen;
