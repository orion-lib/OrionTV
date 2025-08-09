import React, { useEffect, useCallback, useRef, useState } from "react";
import { View, StyleSheet, ActivityIndicator, FlatList, Pressable, Dimensions, Animated } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { api } from "@/services/api";
import VideoCard from "@/components/VideoCard.tv";
import { useFocusEffect, useRouter } from "expo-router";
import { Search, Settings, LogOut, Heart } from "lucide-react-native";
import { StyledButton } from "@/components/StyledButton";
import useHomeStore, { RowItem, Category } from "@/stores/homeStore";
import useAuthStore from "@/stores/authStore";
import CustomScrollView from "@/components/CustomScrollView";

const { width } = Dimensions.get("window");

// 根据屏幕宽度动态计算列数 - 与CustomScrollView保持一致
const getNumColumns = () => {
  const minCardWidth = 120; // 与VideoCard保持一致
  const containerPadding = 32; // 容器左右内边距
  const itemMargin = 16; // 每个item的总margin
  
  const availableWidth = width - containerPadding;
  const cardWithMargin = minCardWidth + itemMargin;
  
  const maxPossibleColumns = Math.floor(availableWidth / cardWithMargin);
  
  // 根据屏幕宽度设置不同的列数范围
  if (width < 500) {
    // 小屏手机：固定2列
    return 2;
  } else if (width < 700) {
    // 大屏手机：2-3列
    return Math.max(2, Math.min(maxPossibleColumns, 3));
  } else if (width < 1024) {
    // 平板：3-4列
    return Math.max(3, Math.min(maxPossibleColumns, 4));
  } else {
    // 电视/桌面：4-6列
    return Math.max(4, Math.min(maxPossibleColumns, 6));
  }
};

const NUM_COLUMNS = getNumColumns();

// Threshold for triggering load more data (in pixels)
const LOAD_MORE_THRESHOLD = 200;

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = "dark";
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

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
    }
  }, [fetchInitialData, selectedCategory, selectedCategory.tag]);

  useEffect(() => {
    if (!loading && contentData.length > 0) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else if (loading) {
      fadeAnim.setValue(0);
    }
  }, [loading, contentData.length, fadeAnim]);

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

  const renderContentItem = ({ item, index }: { item: RowItem; index: number }) => (
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
        <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
          <CustomScrollView
            data={contentData}
            renderItem={renderContentItem}
            numColumns={NUM_COLUMNS}
            loading={loading}
            loadingMore={loadingMore}
            error={error}
            onEndReached={loadMoreData}
            loadMoreThreshold={LOAD_MORE_THRESHOLD}
            emptyMessage={selectedCategory?.tags ? "请选择一个子分类" : "该分类下暂无内容"}
            ListFooterComponent={renderFooter}
          />
        </Animated.View>
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
  contentContainer: {
    flex: 1,
  },
  itemContainer: {
    margin: 8,
    alignItems: "center",
  },
});
