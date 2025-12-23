import React, {useMemo, useState} from 'react';
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {CategoryChips} from '../components/CategoryChips';
import {VideoCard} from '../components/VideoCard';
import {SectionHeader} from '../components/SectionHeader';
import {ShowcaseCard} from '../components/ShowcaseCard';
import {useMedia} from '../context/MediaContext';
import {RootStackParamList} from '../navigation/RootNavigator';
import {EmptyState} from '../components/EmptyState';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const MoreCard: React.FC = () => {
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      focusable
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={[
        styles.moreWrapper,
        focused && styles.moreFocused,
      ]}>
      <Text style={styles.moreLabel}>更多</Text>
    </Pressable>
  );
};

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const {categories, videos, isFavorite} = useMedia();
  const [activeCategory, setActiveCategory] = useState<string>('featured');

  const heroItems = useMemo(() => {
    if (!videos.length) {
      return [];
    }
    const pool = [...videos];
    while (pool.length < 6) {
      pool.push(videos[pool.length % videos.length]);
    }
    return pool.slice(0, 6);
  }, [videos]);

  const filteredVideos = useMemo(() => {
    if (activeCategory === 'featured') {
      return videos;
    }
    return videos.filter(v => v.categoryId === activeCategory);
  }, [activeCategory, videos]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#0c0f1b', '#0a0b13', '#0e1223']}
        style={styles.header}>
        <View style={styles.brandRow}>
          <Text style={styles.logo}>YOGURT</Text>
          <CategoryChips
            data={categories}
            activeId={activeCategory}
            onChange={setActiveCategory}
          />
        </View>
        <View style={styles.heroArea}>
          <View style={styles.heroRow}>
            {heroItems.slice(0, 2).map((item, idx) => (
              <ShowcaseCard
                key={item.id + idx}
                item={item}
                variant="hero"
                hasTVPreferredFocus={idx === 0}
                onPress={() => navigation.navigate('Detail', {id: item.id})}
              />
            ))}
          </View>
          <View style={styles.gridRow}>
            {heroItems.slice(2, 5).map(item => (
              <ShowcaseCard
                key={item.id + '-mid'}
                item={item}
                variant="wide"
                onPress={() => navigation.navigate('Detail', {id: item.id})}
              />
            ))}
            <MoreCard />
          </View>
        </View>
      </LinearGradient>
      <View style={styles.content}>
        <SectionHeader
          title="新上映"
          description="为你推荐最新上线的电影与剧集"
        />
        <FlatList
          data={filteredVideos}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState title="暂无内容" description="稍后再来看看吧" />
          }
          renderItem={({item}) => (
            <VideoCard
              item={item}
              isFavorite={isFavorite(item.id)}
              onPress={() => navigation.navigate('Detail', {id: item.id})}
            />
          )}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0d14',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    fontSize: 28,
    fontWeight: '900',
    color: '#e9f2ff',
    letterSpacing: 1.2,
  },
  heroArea: {
    marginTop: 16,
  },
  heroRow: {
    flexDirection: 'row',
  },
  content: {
    paddingHorizontal: 16,
    marginTop: 12,
  },
  gridRow: {
    flexDirection: 'row',
    marginTop: 14,
  },
  moreWrapper: {
    flex: 1,
    height: 120,
    marginHorizontal: 6,
    borderRadius: 16,
    backgroundColor: '#15192b',
    borderWidth: 1,
    borderColor: '#1f2430',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreLabel: {
    color: '#cdd6f4',
    fontWeight: '700',
    fontSize: 14,
  },
  moreFocused: {
    borderColor: '#6ac2ff',
    shadowColor: '#6ac2ff',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 0},
    transform: [{scale: 1.03}],
  },
});

export default HomeScreen;
