import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Pressable,
  Text,
  Keyboard,
  useColorScheme,
} from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import VideoCard from "@/components/VideoCard.tv";
import { moonTVApi, SearchResult } from "@/services/api";
import { Search } from "lucide-react-native";

export default function SearchScreen() {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textInputRef = useRef<TextInput>(null);
  const colorScheme = useColorScheme();
  const [isInputFocused, setIsInputFocused] = useState(false);

  useEffect(() => {
    // Focus the text input when the screen loads
    const timer = setTimeout(() => {
      textInputRef.current?.focus();
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = async () => {
    if (!keyword.trim()) {
      Keyboard.dismiss();
      return;
    }
    Keyboard.dismiss();
    setLoading(true);
    setError(null);
    try {
      const response = await moonTVApi.searchVideos(keyword);
      if (response.results.length > 0) {
        setResults(response.results);
      } else {
        setError("没有找到相关内容");
      }
    } catch (err) {
      setError("搜索失败，请稍后重试。");
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: SearchResult }) => (
    <VideoCard
      id={item.id.toString()}
      source={item.source}
      title={item.title}
      poster={item.poster}
      year={item.year}
      sourceName={item.source_name}
      api={moonTVApi}
    />
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          ref={textInputRef}
          style={[
            styles.input,
            {
              backgroundColor: colorScheme === "dark" ? "#2c2c2e" : "#f0f0f0",
              color: colorScheme === "dark" ? "white" : "black",
              borderColor: isInputFocused ? "#007bff" : "transparent",
            },
          ]}
          placeholder="搜索电影、剧集..."
          placeholderTextColor={colorScheme === "dark" ? "#888" : "#555"}
          value={keyword}
          onChangeText={setKeyword}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
          onSubmitEditing={handleSearch} // Allow searching with remote 'enter' button
          returnKeyType="search"
        />
        <Pressable
          style={({ focused }) => [
            styles.searchButton,
            {
              backgroundColor: colorScheme === "dark" ? "#3a3a3c" : "#e0e0e0",
            },
            focused && styles.focusedButton,
          ]}
          onPress={handleSearch}
        >
          <Search
            size={24}
            color={colorScheme === "dark" ? "white" : "black"}
          />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${item.id}-${item.source}-${index}`}
          numColumns={5} // Adjust based on your card size and desired layout
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <ThemedText>输入关键词开始搜索</ThemedText>
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
    paddingTop: 50,
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 50,
    backgroundColor: "#2c2c2e", // Default for dark mode, overridden inline
    borderRadius: 8,
    paddingHorizontal: 15,
    color: "white", // Default for dark mode, overridden inline
    fontSize: 18,
    marginRight: 10,
    borderWidth: 2,
    borderColor: "transparent", // Default, overridden for focus
  },
  searchButton: {
    padding: 12,
    // backgroundColor is now set dynamically
    borderRadius: 8,
  },
  focusedButton: {
    backgroundColor: "#007bff",
    transform: [{ scale: 1.1 }],
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
  },
  listContent: {
    paddingHorizontal: 10,
  },
});
