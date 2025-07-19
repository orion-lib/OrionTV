import React, { useState, useRef, useEffect } from "react";
import { View, TextInput, StyleSheet, FlatList, Alert, Keyboard } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import VideoCard from "@/components/VideoCard.tv";
import VideoLoadingAnimation from "@/components/VideoLoadingAnimation";
import { api, SearchResult } from "@/services/api";
import { Search, QrCode } from "lucide-react-native";
import { StyledButton } from "@/components/StyledButton";
import { useRemoteControlStore } from "@/stores/remoteControlStore";
import { RemoteControlModal } from "@/components/RemoteControlModal";
import { useSettingsStore } from "@/stores/settingsStore";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";

export default function SearchScreen() {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textInputRef = useRef<TextInput>(null);
  const colorScheme = "dark"; // Replace with useColorScheme() if needed
  const [isInputFocused, setIsInputFocused] = useState(false);
  const { showModal: showRemoteModal, lastMessage } = useRemoteControlStore();
  const { remoteInputEnabled } = useSettingsStore();
  const router = useRouter();

  useEffect(() => {
    if (lastMessage) {
      console.log("Received remote input:", lastMessage);
      const realMessage = lastMessage.split("_")[0];
      setKeyword(realMessage);
      handleSearch(realMessage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastMessage]);

  useEffect(() => {
    // Focus the text input when the screen loads
    const timer = setTimeout(() => {
      textInputRef.current?.focus();
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = async (searchText?: string) => {
    const term = typeof searchText === "string" ? searchText : keyword;
    if (!term.trim()) {
      Keyboard.dismiss();
      return;
    }
    Keyboard.dismiss();
    setLoading(true);
    setError(null);
    try {
      const response = await api.searchVideos(term);
      if (response.results.length > 0) {
        setResults(response.results);
      } else {
        setError("没有找到相关内容");
      }
    } catch (err) {
      setError("搜索失败，请稍后重试。");
      console.info("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const onSearchPress = () => handleSearch();

  const handleQrPress = () => {
    if (!remoteInputEnabled) {
      Alert.alert("远程输入未启用", "请先在设置页面中启用远程输入功能", [
        { text: "取消", style: "cancel" },
        { text: "去设置", onPress: () => router.push("/settings") },
      ]);
      return;
    }
    showRemoteModal();
  };

  const renderItem = ({ item }: { item: SearchResult }) => (
    <VideoCard
      id={item.id.toString()}
      source={item.source}
      title={item.title}
      poster={item.poster}
      year={item.year}
      sourceName={item.source_name}
      api={api}
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
              borderColor: isInputFocused ? Colors.dark.primary : "transparent",
            },
          ]}
          placeholder="搜索电影、剧集..."
          placeholderTextColor={colorScheme === "dark" ? "#888" : "#555"}
          value={keyword}
          onChangeText={setKeyword}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
          onSubmitEditing={onSearchPress}
          returnKeyType="search"
        />
        <StyledButton style={styles.searchButton} onPress={onSearchPress}>
          <Search size={24} color={colorScheme === "dark" ? "white" : "black"} />
        </StyledButton>
        <StyledButton style={styles.qrButton} onPress={handleQrPress}>
          <QrCode size={24} color={colorScheme === "dark" ? "white" : "black"} />
        </StyledButton>
      </View>

      {loading ? (
        <VideoLoadingAnimation showProgressBar={false} />
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
      <RemoteControlModal />
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
  qrButton: {
    padding: 12,
    borderRadius: 8,
    marginLeft: 10,
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
