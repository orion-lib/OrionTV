import React, { useEffect, useCallback, useRef, useState } from "react";
import { View, StyleSheet, ActivityIndicator, FlatList, Pressable, Dimensions } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { api } from "@/services/api";
import VideoCard from "@/components/VideoCard.tv";
import { useFocusEffect, useRouter } from "expo-router";
import { Search, Settings, LogOut, Heart } from "lucide-react-native";
import { StyledButton } from "@/components/StyledButton";
import useHomeStore, { RowItem, Category } from "@/stores/homeStore";
import useAuthStore from "@/stores/authStore";

const NUM_COLUMNS = 5;
const { width } = Dimensions.get("window");
const ITEM_WIDTH = width / NUM_COLUMNS - 24;

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = "dark";
  const flatListRef = useRef<FlatList>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

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
  const { isLoggedIn, logout } = useAuthStore();

  useFocusEffect(
    useCallback(() => {
      refreshPlayRecords();
    }, [refreshPlayRecords])
  );

  useEffect(() => {
    if (selectedCategory && !selectedCategory.tags) {
      fetchInitialData();
      flatListRef.current?.scrollToOffset({ animated: false, offset: 0 });
    } else if (selectedCategory?.tags && !selectedCategory.tag) {
      // Category with tags selected, but no specific tag yet. Select the first one.
      const defaultTag = selectedCategory.tags[0];
      setSelectedTag(defaultTag);
      selectCategory({ ...selectedCategory, tag: defaultTag });
    }
  }, [selectedCategory, fetchInitialData, selectCategory]);

  useEffect(() => {
    if (selectedCategory && selectedCategory.tag) {
      fetchInitialData();
      flatListRef.current?.scrollToOffset({ animated: false, offset: 0 });
    }
  }, [fetchInitialData, selectedCategory, selectedCategory.tag]);

  const handleCategorySelect = (category: Category) => {
    setSelectedTag(null);
    selectCategory(category);
  };

  const handleTagSelect = (tag: string) => {
    setSelectedTag(tag);
    if (selectedCategory) {
      // Create a new category object with the selected tag
      const categoryWithTag = { ...selectedCategory, tag: tag };
      selectCategory(categoryWithTag);
    }
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
    <View style={styles.itemContainer}>
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
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <ThemedText style={styles.headerTitle}>首页</ThemedText>
          <Pressable style={{ marginLeft: 20 }} onPress={() => router.push("/live")}>
            {({ focused }) => (
              <ThemedText style={[styles.headerTitle, { color: focused ? "white" : "grey" }]}>直播</ThemedText>
            )}
          </Pressable>
        </View>
        <View style={styles.rightHeaderButtons}>
          <StyledButton style={styles.searchButton} onPress={() => router.push("/favorites")} variant="ghost">
            <Heart color={colorScheme === "dark" ? "white" : "black"} size={24} />
          </StyledButton>
          <StyledButton
            style={styles.searchButton}
            onPress={() => router.push({ pathname: "/search" })}
            variant="ghost"
          >
            <Search color={colorScheme === "dark" ? "white" : "black"} size={24} />
          </StyledButton>
          <StyledButton style={styles.searchButton} onPress={() => router.push("/settings")} variant="ghost">
            <Settings color={colorScheme === "dark" ? "white" : "black"} size={24} />
          </StyledButton>
          {isLoggedIn && (
            <StyledButton style={styles.searchButton} onPress={logout} variant="ghost">
              <LogOut color={colorScheme === "dark" ? "white" : "black"} size={24} />
            </StyledButton>
          )}
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

      {/* Sub-category Tags */}
      {selectedCategory && selectedCategory.tags && (
        <View style={styles.categoryContainer}>
          <FlatList
            data={selectedCategory.tags}
            renderItem={({ item, index }) => {
              const isSelected = selectedTag === item;
              return (
                <StyledButton
                  hasTVPreferredFocus={index === 0} // Focus the first tag by default
                  text={item}
                  onPress={() => handleTagSelect(item)}
                  isSelected={isSelected}
                  style={styles.categoryButton}
                  textStyle={styles.categoryText}
                  variant="ghost"
                />
              );
            }}
            keyExtractor={(item) => item}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryListContent}
          />
        </View>
      )}

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
          numColumns={NUM_COLUMNS}
          contentContainerStyle={styles.listContent}
          onEndReached={loadMoreData}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <ThemedText>{selectedCategory?.tags ? "请选择一个子分类" : "该分类下暂无内容"}</ThemedText>
            </View>
          }
        />
      )}
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
    borderRadius: 30,
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
    width: ITEM_WIDTH,
    alignItems: "center",
  },
});
