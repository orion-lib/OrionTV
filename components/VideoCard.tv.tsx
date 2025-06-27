import React, { useState, useEffect, useCallback } from "react";
import { View, Text, Image, StyleSheet, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useRouter } from "expo-router";
import { Heart, Star } from "lucide-react-native";
import { FavoriteManager } from "@/services/storage";
import { MoonTVAPI } from "@/services/api";

interface VideoCardProps {
  id: string;
  source: string;
  title: string;
  poster: string;
  year?: string;
  rate?: string;
  onFocus?: () => void;
  api: MoonTVAPI;
}

export default function VideoCard({
  id,
  source,
  title,
  poster,
  year,
  rate,
  onFocus,
  api,
}: VideoCardProps) {
  const router = useRouter();
  const [isFocused, setIsFocused] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  useEffect(() => {
    const checkFavorite = async () => {
      const fav = await FavoriteManager.isFavorited(source, id);
      setIsFavorited(fav);
    };
    checkFavorite();
  }, [source, id]);

  const handlePress = () => {
    router.push({
      pathname: "/detail",
      params: { source, id },
    });
  };

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    scale.value = withSpring(1.05, { damping: 15, stiffness: 200 });
    onFocus?.();
  }, [scale, onFocus]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    scale.value = withSpring(1.0);
  }, [scale]);

  const handleToggleFavorite = async () => {
    const newFavState = await FavoriteManager.toggle(source, id, {
      title,
      poster,
      source_name: source,
    });
    setIsFavorited(newFavState);
  };

  return (
    <Animated.View style={[styles.wrapper, animatedStyle]}>
      <Pressable
        onPress={handlePress}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={styles.pressable}
      >
        <View style={styles.card}>
          <Image
            source={{ uri: api.getImageProxyUrl(poster) }}
            style={styles.poster}
          />
          {isFocused && (
            <View style={styles.overlay}>
              <Pressable
                onPress={handleToggleFavorite}
                style={styles.favButton}
              >
                <Heart
                  size={24}
                  color={isFavorited ? "red" : "white"}
                  fill={isFavorited ? "red" : "transparent"}
                />
              </Pressable>
            </View>
          )}
          {rate && (
            <View style={styles.ratingContainer}>
              <Star size={12} color="#FFD700" fill="#FFD700" />
              <Text style={styles.ratingText}>{rate}</Text>
            </View>
          )}
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {year && <Text style={styles.year}>{year}</Text>}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const CARD_WIDTH = 160;
const CARD_HEIGHT = 240;

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 8,
  },
  pressable: {
    alignItems: "center",
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
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
    justifyContent: "center",
    alignItems: "center",
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
    width: CARD_WIDTH,
    marginTop: 8,
    alignItems: "center",
  },
  title: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  year: {
    color: "#aaa",
    fontSize: 12,
    textAlign: "center",
  },
});
