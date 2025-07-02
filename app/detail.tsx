import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { moonTVApi, SearchResult } from "@/services/api";
import { getResolutionFromM3U8 } from "@/services/m3u8";
import { DetailButton } from "@/components/DetailButton";

export default function DetailScreen() {
  const { source, q } = useLocalSearchParams();
  const router = useRouter();
  const [searchResults, setSearchResults] = useState<
    (SearchResult & { resolution?: string | null })[]
  >([]);
  const [detail, setDetail] = useState<
    (SearchResult & { resolution?: string | null }) | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof source === "string" && typeof q === "string") {
      const fetchDetailData = async () => {
        try {
          setLoading(true);
          const { results } = await moonTVApi.searchVideos(q as string);
          if (results && results.length > 0) {
            const initialDetail =
              results.find((r) => r.source === source) || results[0];
            setDetail(initialDetail);
            setSearchResults(results); // Set initial results first

            // Asynchronously fetch resolutions
            const resultsWithResolutions = await Promise.all(
              results.map(async (searchResult) => {
                try {
                  if (
                    searchResult.episodes &&
                    searchResult.episodes.length > 0
                  ) {
                    const resolution = await getResolutionFromM3U8(
                      searchResult.episodes[0]
                    );
                    return { ...searchResult, resolution };
                  }
                } catch (e) {
                  console.error("Failed to get resolution for source", e);
                }
                return searchResult; // Return original if fails
              })
            );
            setSearchResults(resultsWithResolutions);
          } else {
            setError("未找到播放源");
          }
        } catch (e) {
          setError(e instanceof Error ? e.message : "获取详情失败");
        } finally {
          setLoading(false);
        }
      };
      fetchDetailData();
    }
  }, [source, q]);

  const handlePlay = (episodeName: string, episodeIndex: number) => {
    if (!detail) return;
    router.push({
      pathname: "/play",
      params: {
        source: detail.source,
        id: detail.id.toString(),
        episodeUrl: episodeName, // The "episode" is actually the URL
        episodeIndex: episodeIndex.toString(),
        title: detail.title,
        poster: detail.poster,
      },
    });
  };

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="subtitle">Error: {error}</ThemedText>
      </ThemedView>
    );
  }

  if (!detail) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="subtitle">未找到详情信息</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView>
        <View style={styles.topContainer}>
          <Image source={{ uri: detail.poster }} style={styles.poster} />
          <View style={styles.infoContainer}>
            <ThemedText style={styles.title} numberOfLines={1}>
              {detail.title}
            </ThemedText>
            <View style={styles.metaContainer}>
              <ThemedText style={styles.metaText}>{detail.year}</ThemedText>
              <ThemedText style={styles.metaText}>
                {detail.type_name}
              </ThemedText>
            </View>
            <ScrollView style={styles.descriptionScrollView}>
              <ThemedText style={styles.description}>{detail.desc}</ThemedText>
            </ScrollView>
          </View>
        </View>

        <View style={styles.bottomContainer}>
          <View style={styles.sourcesContainer}>
            <ThemedText style={styles.sourcesTitle}>
              选择播放源 共 {searchResults.length} 个
            </ThemedText>
            <View style={styles.sourceList}>
              {searchResults.map((item, index) => (
                <DetailButton
                  key={index}
                  onPress={() => setDetail(item)}
                  hasTVPreferredFocus={index === 0}
                  style={[
                    styles.sourceButton,
                    detail?.source === item.source &&
                      styles.sourceButtonSelected,
                  ]}
                >
                  <ThemedText style={styles.sourceButtonText}>
                    {item.source_name}
                  </ThemedText>
                  {item.episodes.length > 1 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {item.episodes.length > 99
                          ? "99+"
                          : `${item.episodes.length}`}
                      </Text>
                    </View>
                  )}
                  {item.resolution && (
                    <View
                      style={[styles.badge, { backgroundColor: "#28a745" }]}
                    >
                      <Text style={styles.badgeText}>{item.resolution}</Text>
                    </View>
                  )}
                </DetailButton>
              ))}
            </View>
          </View>
          <View style={styles.episodesContainer}>
            <ThemedText style={styles.episodesTitle}>播放列表</ThemedText>
            <ScrollView contentContainerStyle={styles.episodeList}>
              {detail.episodes.map((episode, index) => (
                <DetailButton
                  key={index}
                  style={styles.episodeButton}
                  onPress={() => handlePlay(episode, index)}
                >
                  <ThemedText style={styles.episodeButtonText}>{`第 ${
                    index + 1
                  } 集`}</ThemedText>
                </DetailButton>
              ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  topContainer: {
    flexDirection: "row",
    padding: 20,
  },
  poster: {
    width: 200,
    height: 300,
    borderRadius: 8,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 20,
    justifyContent: "flex-start",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    paddingTop: 20,
  },
  metaContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  metaText: {
    color: "#aaa",
    marginRight: 10,
    fontSize: 14,
  },
  descriptionScrollView: {
    height: 150, // Constrain height to make it scrollable
  },
  description: {
    fontSize: 14,
    color: "#ccc",
    lineHeight: 22,
  },
  bottomContainer: {
    paddingHorizontal: 20,
  },
  sourcesContainer: {
    marginTop: 20,
  },
  sourcesTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  sourceList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  sourceButton: {
    backgroundColor: "#333",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    margin: 5,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  sourceButtonSelected: {
    backgroundColor: "#007bff",
  },
  sourceButtonText: {
    color: "white",
    fontSize: 16,
  },
  badge: {
    backgroundColor: "red",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  episodesContainer: {
    marginTop: 20,
  },
  episodesTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  episodeList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  episodeButton: {
    backgroundColor: "#333",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    margin: 5,
    borderWidth: 2,
    borderColor: "transparent",
  },
  episodeButtonText: {
    color: "white",
  },
});
