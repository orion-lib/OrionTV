import React, {useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Video, {OnLoadData} from 'react-native-video';
import Icon from 'react-native-vector-icons/Ionicons';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {useKeepAwake} from 'react-native-keep-awake';
import {useMedia} from '../context/MediaContext';
import {RootStackParamList} from '../navigation/RootNavigator';
import {EmptyState} from '../components/EmptyState';

type PlayRoute = RouteProp<RootStackParamList, 'Play'>;

const PlayScreen: React.FC = () => {
  const route = useRoute<PlayRoute>();
  const navigation = useNavigation();
  const {getVideoById, toggleFavorite, isFavorite, preferences} = useMedia();
  const video = useMemo(
    () => getVideoById(route.params.id),
    [getVideoById, route.params.id],
  );
  const playerRef = useRef<Video>(null);
  const [loading, setLoading] = useState(true);

  useKeepAwake(preferences.keepScreenOn);

  if (!video) {
    return (
      <SafeAreaView style={{flex: 1, backgroundColor: '#0b0d14'}}>
        <EmptyState title="视频不存在" />
      </SafeAreaView>
    );
  }

  const favorite = isFavorite(video.id);

  const handleLoad = (_: OnLoadData) => setLoading(false);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.playerWrapper}>
        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator color="#5ac8fa" />
            <Text style={styles.loaderText}>加载中...</Text>
          </View>
        ) : null}
        <Video
          ref={playerRef}
          style={styles.video}
          source={{uri: video.source}}
          resizeMode="contain"
          controls
          onLoad={handleLoad}
          onError={e => console.warn(e)}
        />
      </View>
      <View style={styles.meta}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={24} color="#e5e7eb" />
        </TouchableOpacity>
        <Text style={styles.title}>{video.title}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, favorite && styles.active]}
          onPress={() => toggleFavorite(video.id)}>
          <Icon
            name={favorite ? 'heart' : 'heart-outline'}
            size={18}
            color={favorite ? '#ff6b6b' : '#e5e7eb'}
          />
          <Text
            style={[
              styles.buttonText,
              {color: favorite ? '#ff6b6b' : '#e5e7eb'},
            ]}>
            {favorite ? '已收藏' : '收藏'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigation.navigate('Detail', {
              id: video.id,
            })
          }>
          <Icon name="information-circle-outline" size={18} color="#e5e7eb" />
          <Text style={[styles.buttonText, {color: '#e5e7eb'}]}>
            查看详情
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.desc} numberOfLines={3}>
        {video.description}
      </Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#0b0d14'},
  playerWrapper: {
    height: 260,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {width: '100%', height: '100%'},
  loader: {position: 'absolute', alignItems: 'center'},
  loaderText: {color: '#cfd3dc', marginTop: 8},
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {color: '#fff', fontSize: 18, fontWeight: '700', marginLeft: 8},
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2f3544',
    marginRight: 10,
  },
  active: {
    borderColor: '#ff6b6b',
    backgroundColor: '#1f1a1d',
  },
  buttonText: {
    marginLeft: 8,
    fontWeight: '700',
  },
  desc: {
    color: '#d8dee9',
    paddingHorizontal: 16,
    marginTop: 12,
    lineHeight: 20,
  },
});

export default PlayScreen;
