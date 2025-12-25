import React, {useMemo} from 'react';
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useMedia} from '../context/MediaContext';
import {RootStackParamList} from '../navigation/RootNavigator';
import {EmptyState} from '../components/EmptyState';

type DetailRoute = RouteProp<RootStackParamList, 'Detail'>;

const DetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<DetailRoute>();
  const {getVideoById, toggleFavorite, isFavorite} = useMedia();
  const video = useMemo(
    () => getVideoById(route.params.id),
    [getVideoById, route.params.id],
  );

  if (!video) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState title="未找到该视频" />
      </SafeAreaView>
    );
  }

  const favorite = isFavorite(video.id);
  const favoriteColor = favorite ? '#ff6b6b' : '#e5e7eb';
  const favoriteTextStyle = favorite ? styles.favoriteText : styles.neutralText;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView>
        <Image source={{uri: video.poster}} style={styles.poster} />
        <View style={styles.content}>
          <Text style={styles.title}>{video.title}</Text>
          <Text style={styles.meta}>
            {video.year} · {video.duration}
          </Text>
          <View style={styles.tagRow}>
            {video.tags.map(tag => (
              <View style={styles.tag} key={tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.desc}>{video.description}</Text>
          <View style={styles.actions}>
            <Pressable
              focusable
              style={({pressed, focused}) => [
                styles.button,
                styles.primary,
                (pressed || focused) && styles.buttonFocused,
              ]}
              onPress={() => navigation.navigate('Play', {id: video.id})}>
              <Icon name="play" size={18} color="#0b0d14" />
              <Text style={[styles.buttonText, styles.primaryText]}>
                立即播放
              </Text>
            </Pressable>
            <Pressable
              focusable
              style={({pressed, focused}) => [
                styles.button,
                styles.outline,
                (pressed || focused) && styles.buttonFocused,
              ]}
              onPress={() => toggleFavorite(video.id)}>
              <Icon
                name={favorite ? 'heart' : 'heart-outline'}
                size={18}
                color={favoriteColor}
              />
              <Text style={[styles.buttonText, favoriteTextStyle]}>
                {favorite ? '已收藏' : '收藏'}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#0b0d14'},
  poster: {width: '100%', height: 280},
  content: {padding: 16},
  title: {color: '#fff', fontSize: 26, fontWeight: '800'},
  meta: {color: '#9ca3af', marginTop: 6},
  tagRow: {flexDirection: 'row', flexWrap: 'wrap', marginTop: 12},
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#1f2430',
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {color: '#cfd3dc'},
  desc: {color: '#d8dee9', marginTop: 14, lineHeight: 20},
  actions: {flexDirection: 'row', marginTop: 18},
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 10,
  },
  buttonFocused: {
    borderWidth: 2,
    borderColor: '#7dd3fc',
    shadowColor: '#38bdf8',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  primary: {backgroundColor: '#5ac8fa'},
  primaryText: {color: '#0b0d14'},
  outline: {
    borderWidth: 1,
    borderColor: '#2f3544',
  },
  buttonText: {marginLeft: 8, fontWeight: '700'},
  favoriteText: {color: '#ff6b6b'},
  neutralText: {color: '#e5e7eb'},
});

export default DetailScreen;
