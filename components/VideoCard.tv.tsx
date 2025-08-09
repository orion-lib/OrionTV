import React, { useState, useEffect, useCallback, useRef, forwardRef } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, Animated } from "react-native";
import { useRouter } from "expo-router";
import { Star, Play } from "lucide-react-native";
import { PlayRecordManager } from "@/services/storage";
import { API } from "@/services/api";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";

interface VideoCardProps extends React.ComponentProps<typeof TouchableOpacity> {
  id: string;
  source: string;
  title: string;
  poster: string;
  year?: string;
  rate?: string;
  sourceName?: string;
  progress?: number; // 播放进度，0-1之间的小数
  playTime?: number; // 播放时间 in ms
  episodeIndex?: number; // 剧集索引
  totalEpisodes?: number; // 总集数
  onFocus?: () => void;
  onRecordDeleted?: () => void; // 添加回调属性
  api: API;
}

const VideoCard = forwardRef<View, VideoCardProps>(
  (
    {
      id,
      source,
      title,
      poster,
      year,
      rate,
      sourceName,
      progress,
      episodeIndex,
      onFocus,
      onRecordDeleted,
      api,
      playTime = 0,
    }: VideoCardProps,
    ref
  ) => {
    const router = useRouter();
    const [isFocused, setIsFocused] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(0));

    const longPressTriggered = useRef(false);

    const scale = useRef(new Animated.Value(1)).current;

    const animatedStyle = {
      transform: [{ scale }],
    };

    const handlePress = () => {
      if (longPressTriggered.current) {
        longPressTriggered.current = false;
        return;
      }
      // 如果有播放进度，直接转到播放页面
      if (progress !== undefined && episodeIndex !== undefined) {
        router.push({
          pathname: "/play",
          params: { source, id, episodeIndex: episodeIndex - 1, title, position: playTime * 1000 },
        });
      } else {
        router.push({
          pathname: "/detail",
          params: { source, q: title },
        });
      }
    };

    const handleFocus = useCallback(() => {
      setIsFocused(true);
      Animated.spring(scale, {
        toValue: 1.05,
        damping: 15,
        stiffness: 200,
        useNativeDriver: true,
      }).start();
      onFocus?.();
    }, [scale, onFocus]);

    const handleBlur = useCallback(() => {
      setIsFocused(false);
      Animated.spring(scale, {
        toValue: 1.0,
        useNativeDriver: true,
      }).start();
    }, [scale]);

    useEffect(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: Math.random() * 200, // 随机延迟创造交错效果
        useNativeDriver: true,
      }).start();
    }, [fadeAnim]);

    const handleLongPress = () => {
      // Only allow long press for items with progress (play records)
      if (progress === undefined) return;

      longPressTriggered.current = true;

      // Show confirmation dialog to delete play record
      Alert.alert("删除观看记录", `确定要删除"${title}"的观看记录吗？`, [
        {
          text: "取消",
          style: "cancel",
        },
        {
          text: "删除",
          style: "destructive",
          onPress: async () => {
            try {
              // Delete from local storage
              await PlayRecordManager.remove(source, id);

              // Call the onRecordDeleted callback
              if (onRecordDeleted) {
                onRecordDeleted();
              }
              // 如果没有回调函数，则使用导航刷新作为备选方案
              else if (router.canGoBack()) {
                router.replace("/");
              }
            } catch (error) {
              console.info("Failed to delete play record:", error);
              Alert.alert("错误", "删除观看记录失败，请重试");
            }
          },
        },
      ]);
    };

    // 是否是继续观看的视频
    const isContinueWatching = progress !== undefined && progress > 0 && progress < 1;

    return (
      <Animated.View style={[styles.wrapper, animatedStyle, { opacity: fadeAnim }]}>
        <TouchableOpacity
          onPress={handlePress}
          onLongPress={handleLongPress}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={styles.pressable}
          activeOpacity={1}
          delayLongPress={1000}
        >
          <View style={styles.card}>
            <Image source={{ uri: api.getImageProxyUrl(poster) }} style={styles.poster} />
            {isFocused && (
              <View style={styles.overlay}>
                {isContinueWatching && (
                  <View style={styles.continueWatchingBadge}>
                    <Play size={16} color="#ffffff" fill="#ffffff" />
                    <ThemedText style={styles.continueWatchingText}>继续观看</ThemedText>
                  </View>
                )}
              </View>
            )}

            {/* 进度条 */}
            {isContinueWatching && (
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: `${(progress || 0) * 100}%` }]} />
              </View>
            )}

            {rate && (
              <View style={styles.ratingContainer}>
                <Star size={12} color="#FFD700" fill="#FFD700" />
                <ThemedText style={styles.ratingText}>{rate}</ThemedText>
              </View>
            )}
            {year && (
              <View style={styles.yearBadge}>
                <Text style={styles.badgeText}>{year}</Text>
              </View>
            )}
            {sourceName && (
              <View style={styles.sourceNameBadge}>
                <Text style={styles.badgeText}>{sourceName}</Text>
              </View>
            )}
          </View>
          <View style={styles.infoContainer}>
            <ThemedText numberOfLines={1}>{title}</ThemedText>
            {isContinueWatching && (
              <View style={styles.infoRow}>
                <ThemedText style={styles.continueLabel}>
                  第{episodeIndex! + 1}集 已观看 {Math.round((progress || 0) * 100)}%
                </ThemedText>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }
);

VideoCard.displayName = "VideoCard";

export default VideoCard;

// 移除固定宽度，改为响应式
const ASPECT_RATIO = 2/3; // 宽高比例 (宽:高 = 2:3)
const MIN_CARD_WIDTH = 120;
const MAX_CARD_WIDTH = 200;

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 8,
    flex: 1,
    maxWidth: MAX_CARD_WIDTH,
  },
  pressable: {
    alignItems: "center",
    flex: 1,
  },
  card: {
    flex: 1,
    aspectRatio: ASPECT_RATIO,
    minWidth: MIN_CARD_WIDTH,
    borderRadius: 8,
    backgroundColor: "#222",
    overflow: "hidden",
  },
  poster: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderColor: Colors.dark.primary,
    borderWidth: 2,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonRow: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    padding: 4,
  },
  favButton: {
    position: "absolute",
    top: 8,
    left: 8,
  },
  ratingContainer: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  ratingText: {
    color: "#FFD700",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 4,
  },
  infoContainer: {
    flex: 1,
    marginTop: 8,
    alignItems: "flex-start",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  title: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  yearBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  sourceNameBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  progressContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.dark.primary,
  },
  continueWatchingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  continueWatchingText: {
    color: "white",
    marginLeft: 5,
    fontSize: 12,
    fontWeight: "bold",
  },
  continueLabel: {
    color: Colors.dark.primary,
    fontSize: 12,
  },
});