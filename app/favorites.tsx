import React, { useEffect } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import useFavoritesStore from "@/stores/favoritesStore";
import { Favorite } from "@/services/storage";
import VideoCard from "@/components/VideoCard.tv";
import { api } from "@/services/api";
import CustomScrollView from "@/components/CustomScrollView";

export default function FavoritesScreen() {
  const { favorites, loading, error, fetchFavorites } = useFavoritesStore();

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const renderItem = ({ item }: { item: Favorite & { key: string }; index: number }) => {
    const [source, id] = item.key.split("+");
    return (
      <VideoCard
        id={id}
        source={source}
        title={item.title}
        sourceName={item.source_name}
        poster={item.cover}
        year={item.year}
        api={api}
        episodeIndex={1}
        progress={0}
      />
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerContainer}>
        <ThemedText style={styles.headerTitle}>我的收藏</ThemedText>
      </View>
      <CustomScrollView
        data={favorites}
        renderItem={renderItem}
        numColumns={5}
        loading={loading}
        error={error}
        emptyMessage="暂无收藏"
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    paddingTop: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    padding: 10,
  },
});
