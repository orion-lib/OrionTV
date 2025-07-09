import React, { useEffect, useCallback, useRef } from "react";
import { View, StyleSheet, ActivityIndicator, FlatList, Pressable } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { api } from "@/services/api";
import VideoCard from "@/components/VideoCard.tv";
import { useFocusEffect, useRouter } from "expo-router";
import { Search, Settings } from "lucide-react-native";
import { SettingsModal } from "@/components/SettingsModal";
import { StyledButton } from "@/components/StyledButton";
import useHomeStore, { RowItem, Category } from "@/stores/homeStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useResponsive } from "@/hooks/useResponsive";

export default function HomeScreen() {
  const router = useRouter();
  const { isMobile, screenWidth, numColumns } = useResponsive();
  const colorScheme = "dark";
  const flatListRef = useRef<FlatList>(null);

  // Calculate item width based on screen size and number of columns
  const itemWidth = isMobile ? screenWidth / numColumns(150, 16) - 24 : screenWidth / 5 - 24;
  const calculatedNumColumns = numColumns(150, 16);

  const {
    categories,
    selectedCategory,
    contentData,
    loading,
    loadingMore,
    error,
    fetchInitialData,
    loadMoreData,
    selectCategory,
    refreshPlayRecords,
  } = useHomeStore();

  const showSettingsModal = useSettingsStore((state) => state.showModal);

  useFocusEffect(
    useCallback(() => {
      refreshPlayRecords();
    }, [refreshPlayRecords])
  );

  useEffect(() => {
    fetchInitialData();
    flatListRef.current?.scrollToOffset({ animated: false, offset: 0 });
  }, [selectedCategory, fetchInitialData]);

  const handleCategorySelect = (category: Category) => {
    selectCategory(category);
  };

  const renderCategory = ({ item }: { item: Category }) => {
    const isSelected = selectedCategory?.title === item.title;
    return (
      <StyledButton
        text={item.title}
        onPress={() => handleCategorySelect(item)}
        isSelected={isSelected}
        style={styles.categoryButton}
        textStyle={styles.categoryText}
      />
    );
  };

  const renderContentItem = ({ item }: { item: RowItem }) => (
    <View style={[styles.itemContainer, { width: itemWidth }]}>
      <VideoCard
        id={item.id}
        source={item.source}
        title={item.title}
        poster={item.poster}
        year={item.year}
        rate={item.rate}
        progress={item.progress}
        playTime={item.play_time}
        episodeIndex={item.episodeIndex}
        sourceName={item.sourceName}
        totalEpisodes={item.totalEpisodes}
        api={api}
        onRecordDeleted={fetchInitialData} // For "Recent Plays"
      />
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return <ActivityIndicator style={{ marginVertical: 20 }} size="large" />;
  };

  return (
    <ThemedView style={styles.container}>
      {/* 顶部导航 */}
      <View style={styles.headerContainer}>
        <ThemedText style={styles.headerTitle}>首页</ThemedText>
        <View style={styles.rightHeaderButtons}>
          <StyledButton
            style={styles.searchButton}
            onPress={() => router.push({ pathname: "/search" })}
            variant="ghost"
          >
            <Search color={colorScheme === "dark" ? "white" : "black"} size={24} />
          </StyledButton>
          <StyledButton style={styles.searchButton} onPress={showSettingsModal} variant="ghost">
            <Settings color={colorScheme === "dark" ? "white" : "black"} size={24} />
          </StyledButton>
        </View>
      </View>

      {/* 分类选择器 */}
      <View style={styles.categoryContainer}>
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item.title}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryListContent}
        />
      </View>

      {/* 内容网格 */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <ThemedText type="subtitle" style={{ padding: 10 }}>
            {error}
          </ThemedText>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={contentData}
          renderItem={renderContentItem}
          keyExtractor={(item, index) => `${item.source}-${item.id}-${index}`}
          numColumns={calculatedNumColumns}
          key={calculatedNumColumns} // Re-render FlatList when numColumns changes
          contentContainerStyle={styles.listContent}
          onEndReached={loadMoreData}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <ThemedText>该分类下暂无内容</ThemedText>
            </View>
          }
        />
      )}
      <SettingsModal />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },
  centerContainer: {
    flex: 1,
    paddingTop: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  // Header
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
  rightHeaderButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchButton: {
    padding: 10,
    borderRadius: 30,
    marginLeft: 10,
  },
  // Category Selector
  categoryContainer: {
    paddingBottom: 6,
  },
  categoryListContent: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    paddingHorizontal: 2,
    paddingVertical: 6,
    borderRadius: 8,
    marginHorizontal: 6,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: "500",
  },
  // Content Grid
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  itemContainer: {
    margin: 8,
    // width is now set dynamically in renderContentItem
    alignItems: "center",
  },
});
