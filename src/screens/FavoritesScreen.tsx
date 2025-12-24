import React, {useMemo} from 'react';
import {
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useMedia} from '../context/MediaContext';
import {RootStackParamList} from '../navigation/RootNavigator';
import {VideoCard} from '../components/VideoCard';
import {EmptyState} from '../components/EmptyState';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const FavoritesScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const {favorites, videos, isFavorite} = useMedia();
  const {width} = useWindowDimensions();

  const columnCount = 5;
  const columnGap = 12;
  const rowGap = 16;
  const horizontalPadding = 16;

  const cardWidth = useMemo(() => {
    const availableWidth =
      width - horizontalPadding * 2 - columnGap * (columnCount - 1);
    return Math.max(140, availableWidth / columnCount);
  }, [columnCount, columnGap, horizontalPadding, width]);

  const cardHeight = Math.round(cardWidth * 1.4);

  const data = useMemo(
    () => videos.filter(v => favorites.includes(v.id)),
    [favorites, videos],
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.title}>我的收藏</Text>
        <Text style={styles.subtitle}>快速回看喜欢的内容</Text>
      </View>
      <FlatList
        contentContainerStyle={styles.list}
        data={data}
        keyExtractor={item => item.id}
        numColumns={columnCount}
        columnWrapperStyle={[styles.columnWrapper, {columnGap}]}
        removeClippedSubviews={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        ListEmptyComponent={
          <EmptyState title="暂无收藏" description="在详情页点击收藏即可保存" />
        }
        renderItem={({item}) => (
          <VideoCard
            item={item}
            isFavorite={isFavorite(item.id)}
            cardStyle={{
              width: cardWidth,
              height: cardHeight,
              marginRight: 0,
              marginBottom: rowGap,
            }}
            onPress={() => navigation.navigate('Detail', {id: item.id})}
          />
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#0b0d14'},
  header: {paddingHorizontal: 16, paddingVertical: 12},
  title: {color: '#fff', fontWeight: '800', fontSize: 24},
  subtitle: {color: '#9ca3af', marginTop: 4},
  list: {paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16},
  columnWrapper: {
    justifyContent: 'space-between',
  },
});

export default FavoritesScreen;
