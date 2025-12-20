import React, {useMemo} from 'react';
import {FlatList, SafeAreaView, StatusBar, StyleSheet, Text, View} from 'react-native';
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
        horizontal
        contentContainerStyle={styles.list}
        data={data}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <EmptyState title="暂无收藏" description="在详情页点击收藏即可保存" />
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
  header: {paddingHorizontal: 16, paddingVertical: 12},
  title: {color: '#fff', fontWeight: '800', fontSize: 24},
  subtitle: {color: '#9ca3af', marginTop: 4},
  list: {paddingHorizontal: 16, paddingTop: 12},
});

export default FavoritesScreen;
