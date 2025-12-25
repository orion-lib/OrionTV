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
import Icon from 'react-native-vector-icons/Ionicons';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {CategoryChips} from '../components/CategoryChips';
import {ShowcaseCard} from '../components/ShowcaseCard';
import {SectionHeader} from '../components/SectionHeader';
import {useMedia} from '../context/MediaContext';
import {RootStackParamList} from '../navigation/RootNavigator';
import {EmptyState} from '../components/EmptyState';
import {NewReleaseCard} from '../components/NewReleaseCard';
import {TAB_ITEMS} from '../navigation/tabConfig';

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
  const [focusedAction, setFocusedAction] = useState<string | null>(null);
  const [focusedCategoryHandle, setFocusedCategoryHandle] = useState<
    number | undefined
  >(undefined);

  const categoryTabs = useMemo(() => categories, [categories]);

  const handleCategorySelect = (id: string) => {
    setActiveCategory(id);
  };

  const handleCategoryFocus = (id: string) => {
    setActiveCategory(id);
  };

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
          <View style={styles.headerTopRow}>
            <View style={styles.chipsRow}>
              <CategoryChips
                data={categoryTabs}
                activeId={activeCategory}
                onChange={handleCategorySelect}
                onFocusChange={handleCategoryFocus}
                onFocusHandleChange={setFocusedCategoryHandle}
              />
            </View>
            <View style={styles.quickActions}>
              {TAB_ITEMS.filter(
                item =>
                  item.name === 'Search' ||
                  item.name === 'Favorites' ||
                  item.name === 'Settings',
              ).map(item => (
                <Pressable
                  key={item.name}
                  focusable
                  onFocus={() => setFocusedAction(item.name)}
                  onBlur={() => setFocusedAction(null)}
                  onPress={() => navigation.navigate(item.name)}
                  style={[
                    styles.quickActionItem,
                    focusedAction === item.name && styles.quickActionFocused,
                  ]}>
                  <Icon name={item.icon as never} size={14} color="#e2e8f0" />
                  <Text style={styles.quickActionText}>{item.title}</Text>
                </Pressable>
              ))}
            </View>
          </View>
          <View style={styles.heroArea}>
            <View style={styles.heroRow}>
              {heroItems.slice(0, 2).map(item => (
                <ShowcaseCard
                  key={item.id}
                  item={item}
                  variant="hero"
                  nextFocusUp={focusedCategoryHandle}
                  onPress={() => navigation.navigate('Detail', {id: item.id})}
                />
              ))}
            </View>
          </View>
        </LinearGradient>
        <View style={styles.content}>
          <View style={styles.recommendHeader}>
            <View>
              <Text style={styles.recommendTitle}>为你推荐</Text>
              <Text style={styles.recommendDesc}>最新热门内容与精选片单</Text>
            </View>
          </View>
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
                      nextFocusUp={focusedCategoryHandle}
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
                <NewReleaseCard
                  key={`new-${item.id}`}
                  item={item}
                  isFavorite={isFavorite(item.id)}
                  nextFocusUp={focusedCategoryHandle}
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
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flex: 1,
    paddingRight: 12,
    paddingLeft: 0,
  },
  heroArea: {
    marginTop: 16,
  },
  heroRow: {
    flexDirection: 'row',
  },
  quickActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -20,
  },
  quickActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    height: 30,
    borderRadius: 15,
    marginLeft: 8,
    backgroundColor: '#151a2b',
    borderWidth: 1,
    borderColor: '#1f2430',
    justifyContent: 'center',
  },
  quickActionText: {
    marginLeft: 4,
    color: '#e2e8f0',
    fontWeight: '600',
    fontSize: 12,
    lineHeight: 16,
  },
  quickActionFocused: {
    borderColor: '#7cc0ff',
    shadowColor: '#7cc0ff',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 0},
    elevation: 6,
  },
  recommendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  recommendTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  recommendDesc: {
    marginTop: 4,
    color: '#cfd3dc',
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
