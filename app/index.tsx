import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Pressable,
  Dimensions,
} from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { moonTVApi } from "@/services/api";
import { SearchResult } from "@/services/api";
import { PlayRecord } from "@/services/storage";

export type RowItem = (SearchResult | PlayRecord) & {
  id: string;
  source: string;
  title: string;
  poster: string;
  progress?: number;
  lastPlayed?: number;
  episodeIndex?: number;
  sourceName?: string;
  totalEpisodes?: number;
  year?: string;
  rate?: string;
};
import VideoCard from "@/components/VideoCard.tv";
import { PlayRecordManager } from "@/services/storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useColorScheme } from "react-native";
import { Search, Settings } from "lucide-react-native";
import { SettingsModal } from "@/components/SettingsModal";

// --- 类别定义 ---
interface Category {
  title: string;
  type?: "movie" | "tv" | "record";
  tag?: string;
}

const initialCategories: Category[] = [
  { title: "最近播放", type: "record" },
  { title: "综艺", type: "tv", tag: "综艺" },
  { title: "热门剧集", type: "tv", tag: "热门" },
  { title: "热门电影", type: "movie", tag: "热门" },
  { title: "豆瓣 Top250", type: "movie", tag: "top250" },
  { title: "美剧", type: "tv", tag: "美剧" },
  { title: "韩剧", type: "tv", tag: "韩剧" },
  { title: "日剧", type: "tv", tag: "日剧" },
  { title: "日漫", type: "tv", tag: "日本动画" },
];

const NUM_COLUMNS = 5;
const { width } = Dimensions.get("window");
const ITEM_WIDTH = width / NUM_COLUMNS - 24;

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();

  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [selectedCategory, setSelectedCategory] = useState<Category>(
    categories[0]
  );
  const [contentData, setContentData] = useState<RowItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsVisible, setSettingsVisible] = useState(false);

  const [pageStart, setPageStart] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const flatListRef = useRef<FlatList>(null);

  // --- 数据获取逻辑 ---
  const fetchPlayRecords = async () => {
    const records = await PlayRecordManager.getAll();
    return Object.entries(records)
      .map(([key, record]) => {
        const [source, id] = key.split("+");
        return {
          id,
          source,
          title: record.title,
          poster: record.cover,
          progress: record.play_time / record.total_time,
          lastPlayed: record.save_time,
          episodeIndex: record.index,
          sourceName: record.source_name,
          totalEpisodes: record.total_episodes,
        } as RowItem;
      })
      .filter(
        (record) =>
          record.progress !== undefined &&
          record.progress > 0 &&
          record.progress < 1
      )
      .sort((a, b) => (b.lastPlayed || 0) - (a.lastPlayed || 0));
  };

  const fetchData = async (category: Category, start: number) => {
    if (category.type === "record") {
      const records = await fetchPlayRecords();
      if (records.length === 0 && categories[0].type === "record") {
        // 如果没有播放记录，则移除"最近播放"分类并选择第一个真实分类
        const newCategories = categories.slice(1);
        setCategories(newCategories);
        handleCategorySelect(newCategories[0]);
      } else {
        setContentData(records);
        setHasMore(false);
      }
      setLoading(false);
      return;
    }

    if (!category.type || !category.tag) return;

    setLoadingMore(start > 0);
    setError(null);

    try {
      const result = await moonTVApi.getDoubanData(
        category.type,
        category.tag,
        20,
        start
      );

      if (result.list.length === 0) {
        setHasMore(false);
      } else {
        const newItems = result.list.map((item) => ({
          ...item,
          id: item.title, // 临时ID
          source: "douban",
        })) as RowItem[];

        setContentData((prev) =>
          start === 0 ? newItems : [...prev, ...newItems]
        );
        setPageStart((prev) => prev + result.list.length);
        setHasMore(true);
      }
    } catch (err: any) {
      if (err.message === "API_URL_NOT_SET") {
        setError("请点击右上角设置按钮，配置您的 API 地址");
      } else {
        setError("加载失败，请重试");
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // --- Effects ---
  useFocusEffect(
    useCallback(() => {
      if (selectedCategory.type === "record") {
        loadInitialData();
      }
    }, [selectedCategory])
  );

  useEffect(() => {
    loadInitialData();
  }, [selectedCategory]);

  const loadInitialData = () => {
    setLoading(true);
    setContentData([]);
    setPageStart(0);
    setHasMore(true);
    flatListRef.current?.scrollToOffset({ animated: false, offset: 0 });
    fetchData(selectedCategory, 0);
  };

  const loadMoreData = () => {
    if (
      loading ||
      loadingMore ||
      !hasMore ||
      selectedCategory.type === "record"
    )
      return;
    fetchData(selectedCategory, pageStart);
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
  };

  // --- 渲染组件 ---
  const renderCategory = ({ item }: { item: Category }) => {
    const isSelected = selectedCategory.title === item.title;
    return (
      <Pressable
        style={({ focused }) => [
          styles.categoryButton,
          isSelected && styles.categoryButtonSelected,
          focused && styles.categoryButtonFocused,
        ]}
        onPress={() => handleCategorySelect(item)}
      >
        <ThemedText
          style={[
            styles.categoryText,
            isSelected && styles.categoryTextSelected,
          ]}
        >
          {item.title}
        </ThemedText>
      </Pressable>
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
        episodeIndex={item.episodeIndex}
        sourceName={item.sourceName}
        totalEpisodes={item.totalEpisodes}
        api={moonTVApi}
        onRecordDeleted={loadInitialData} // For "Recent Plays"
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
          <Pressable
            style={({ focused }) => [
              styles.searchButton,
              focused && styles.searchButtonFocused,
            ]}
            onPress={() => router.push({ pathname: "/search" })}
          >
            <Search
              color={colorScheme === "dark" ? "white" : "black"}
              size={24}
            />
          </Pressable>
          <Pressable
            style={({ focused }) => [
              styles.searchButton,
              focused && styles.searchButtonFocused,
            ]}
            onPress={() => setSettingsVisible(true)}
          >
            <Settings
              color={colorScheme === "dark" ? "white" : "black"}
              size={24}
            />
          </Pressable>
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
          numColumns={NUM_COLUMNS}
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
      <SettingsModal
        visible={isSettingsVisible}
        onCancel={() => setSettingsVisible(false)}
        onSave={() => {
          setSettingsVisible(false);
          loadInitialData();
        }}
      />
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
  searchButtonFocused: {
    backgroundColor: "#007AFF",
    transform: [{ scale: 1.1 }],
  },
  // Category Selector
  categoryContainer: {
    paddingBottom: 10,
  },
  categoryListContent: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  categoryButtonSelected: {
    backgroundColor: "#007AFF", // A bright blue for selected state
  },
  categoryButtonFocused: {
    backgroundColor: "#0056b3", // A darker blue for focused state
    elevation: 5,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: "500",
  },
  categoryTextSelected: {
    color: "#FFFFFF",
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
