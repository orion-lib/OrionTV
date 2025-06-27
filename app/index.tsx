import React, { useState, useEffect } from "react";
import { View, StyleSheet, ActivityIndicator, FlatList } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import ScrollableRow from "@/components/ScrollableRow.tv";
import { MoonTVAPI, DoubanResponse } from "@/services/api";
import { RowItem } from "@/components/ScrollableRow.tv";

interface ContentRow {
  title: string;
  data: RowItem[];
}

const categories = [
  { title: "热门电影", type: "movie", tag: "热门" },
  { title: "热门剧集", type: "tv", tag: "热门" },
  { title: "豆瓣 Top250", type: "movie", tag: "top250" },
  { title: "综艺", type: "tv", tag: "综艺" },
  { title: "美剧", type: "tv", tag: "美剧" },
  { title: "韩剧", type: "tv", tag: "韩剧" },
  { title: "日剧", type: "tv", tag: "日剧" },
  { title: "日漫", type: "tv", tag: "日本动画" },
] as const;

// --- IMPORTANT ---
// Replace with your computer's LAN IP address to test on a real device or emulator.
// Find it by running `ifconfig` (macOS/Linux) or `ipconfig` (Windows).
const API_BASE_URL = "http://192.168.31.123:3001";
const api = new MoonTVAPI(API_BASE_URL);

export default function HomeScreen() {
  const [rows, setRows] = useState<ContentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        const promises = categories.map((category) =>
          api.getDoubanData(category.type, category.tag, 20)
        );
        const results = await Promise.all<DoubanResponse>(promises);

        const newRows: ContentRow[] = results.map((result, index) => {
          const category = categories[index];
          return {
            title: category.title,
            data: result.list.map((item) => ({
              ...item,
              id: item.title, // Use title as a temporary unique id
              source: "douban", // Static source for douban items
            })),
          };
        });

        setRows(newRows);
      } catch (err) {
        console.error("Failed to fetch data for home screen:", err);
        setError("无法加载内容，请稍后重试。");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  if (loading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText type="subtitle">{error}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={rows}
        renderItem={({ item }) => (
          <ScrollableRow title={item.title} data={item.data} api={api} />
        )}
        keyExtractor={(item) => item.title}
        contentContainerStyle={styles.listContent}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingTop: 40,
    paddingBottom: 40,
  },
});
