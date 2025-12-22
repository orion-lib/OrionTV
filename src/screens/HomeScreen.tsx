import React, {useMemo, useState} from 'react';
import {
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import {CategoryChips} from '../components/CategoryChips';
import {VideoCard} from '../components/VideoCard';
import {SectionHeader} from '../components/SectionHeader';
import {useMedia} from '../context/MediaContext';
import {RootStackParamList} from '../navigation/RootNavigator';
import {EmptyState} from '../components/EmptyState';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const {categories, videos, isFavorite} = useMedia();
  const [activeCategory, setActiveCategory] = useState<string>('featured');

  const filteredVideos = useMemo(() => {
    if (activeCategory === 'featured') {
      return videos.slice(0, 4);
    }
    return videos.filter(v => v.categoryId === activeCategory);
  }, [activeCategory, videos]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.title}>RNTV</Text>
        <Text style={styles.subtitle}>原生 React Native 体验</Text>
      </View>
      <CategoryChips
        data={categories}
        activeId={activeCategory}
        onChange={setActiveCategory}
      />
      <View style={styles.content}>
        <SectionHeader
          title={
            activeCategory === 'featured'
              ? '精选内容'
              : categories.find(c => c.id === activeCategory)?.title || ''
          }
          description="流畅播放、收藏和搜索你喜欢的影视内容"
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
    paddingTop: 8,
    paddingBottom: 12,
  },
  content: {
    paddingHorizontal: 16,
    marginTop: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  subtitle: {
    marginTop: 4,
    color: '#9ca3af',
  },
});

export default HomeScreen;
