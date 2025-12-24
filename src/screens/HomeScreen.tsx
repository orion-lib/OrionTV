import React, {useMemo, useState} from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
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

const GRID_COLUMNS = 4;

type Nav = NativeStackNavigationProp<RootStackParamList>;

const MoreCard: React.FC = () => {
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      focusable
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onPress={() => {}}
      style={[styles.moreWrapper, focused && styles.moreFocused]}>
      <Text style={styles.moreLabel}>更多</Text>
    </Pressable>
  );
};

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const {categories, videos, isFavorite} = useMedia();
  const [activeCategory, setActiveCategory] = useState<string>('featured');

  const filteredVideos = useMemo(() => {
    if (activeCategory === 'featured') {
      return videos;
    }
    return videos.filter(v => v.categoryId === activeCategory);
  }, [activeCategory, videos]);

  const heroItems = useMemo(() => {
    if (!filteredVideos.length) {
      return [];
    }
    const pool = [...filteredVideos];
    while (pool.length < 6) {
      pool.push(filteredVideos[pool.length % filteredVideos.length]);
    }
    return pool.slice(0, 6);
  }, [filteredVideos]);

  const gridRows = useMemo(() => {
    const heroIds = new Set(heroItems.slice(0, 2).map(item => item.id));
    const remaining = filteredVideos.filter(item => !heroIds.has(item.id));
    const rows: typeof remaining[] = [];
    for (let i = 0; i < remaining.length; i += GRID_COLUMNS) {
      rows.push(remaining.slice(i, i + GRID_COLUMNS));
    }
    return rows;
  }, [filteredVideos, heroItems]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <LinearGradient
          colors={['#0c0f1b', '#0a0b13', '#0e1223']}
          style={styles.header}>
          <View style={styles.chipsRow}>
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
          </View>
        </LinearGradient>
        <View style={styles.content}>
          <SectionHeader
            title="为你推荐"
            description="最新热门内容与精选片单"
          />
          {filteredVideos.length === 0 ? (
            <EmptyState title="暂无内容" description="稍后再来看看吧" />
          ) : (
            <>
              {gridRows.map((row, rowIndex) => (
                <View key={`row-${rowIndex}`} style={styles.gridRow}>
                  {row.map(item => (
                    <ShowcaseCard
                      key={item.id}
                      item={item}
                      variant="tile"
                      onPress={() => navigation.navigate('Detail', {id: item.id})}
                    />
                  ))}
                  {rowIndex === 0 && row.length < GRID_COLUMNS ? (
                    <MoreCard />
                  ) : null}
                </View>
              ))}
            </>
          )}
        </View>
        <View style={styles.content}>
          <SectionHeader title="新上映" description="上新电影与剧集" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.horizontalList}>
              {videos.map(item => (
                <VideoCard
                  key={`new-${item.id}`}
                  item={item}
                  isFavorite={isFavorite(item.id)}
                  onPress={() => navigation.navigate('Detail', {id: item.id})}
                />
              ))}
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0d14',
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  chipsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
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
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 0},
    transform: [{scale: 1.03}],
    elevation: 6,
  },
  horizontalList: {
    flexDirection: 'row',
  },
});

export default HomeScreen;
