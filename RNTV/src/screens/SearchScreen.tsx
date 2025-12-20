import React, {useMemo, useState} from 'react';
import {
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {VideoCard} from '../components/VideoCard';
import {useMedia} from '../context/MediaContext';
import {RootStackParamList} from '../navigation/RootNavigator';
import {EmptyState} from '../components/EmptyState';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const SearchScreen: React.FC = () => {
  const {videos, isFavorite} = useMedia();
  const navigation = useNavigation<Nav>();
  const [keyword, setKeyword] = useState('');

  const results = useMemo(() => {
    if (!keyword.trim()) return [];
    const lower = keyword.toLowerCase();
    return videos.filter(
      v =>
        v.title.toLowerCase().includes(lower) ||
        v.tags.some(tag => tag.toLowerCase().includes(lower)),
    );
  }, [keyword, videos]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.searchBar}>
        <TextInput
          placeholder="搜索片名、标签..."
          placeholderTextColor="#6b7280"
          style={styles.input}
          value={keyword}
          onChangeText={setKeyword}
          autoCapitalize="none"
        />
        <Text style={styles.counter}>{results.length} 条结果</Text>
      </View>
      <FlatList
        contentContainerStyle={styles.list}
        data={results}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          keyword ? (
            <EmptyState
              title="未找到内容"
              description="尝试换个关键词吧"
            />
          ) : (
            <EmptyState
              title="开始搜索"
              description="输入关键词即可快速检索"
            />
          )
        }
        renderItem={({item}) => (
          <VideoCard
            item={item}
            isFavorite={isFavorite(item.id)}
            onPress={() => navigation.navigate('Detail', {id: item.id})}
          />
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#0b0d14'},
  searchBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  input: {
    backgroundColor: '#111625',
    borderRadius: 12,
    padding: 12,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#1f2430',
  },
  counter: {
    color: '#9ca3af',
    marginTop: 6,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
});

export default SearchScreen;
