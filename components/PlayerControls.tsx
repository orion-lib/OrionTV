import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { AVPlaybackStatus } from "expo-av";
import {
  ArrowLeft,
  Pause,
  Play,
  SkipForward,
  List,
  ChevronsRight,
  ChevronsLeft,
} from "lucide-react-native";
import { ThemedText } from "@/components/ThemedText";
import { MediaButton } from "@/components/MediaButton";

interface PlayerControlsProps {
  videoTitle: string;
  currentEpisodeTitle?: string;
  status: AVPlaybackStatus | null;
  isSeeking: boolean;
  seekPosition: number;
  progressPosition: number;
  currentFocus: string | null;
  hasNextEpisode: boolean;
  onSeekStart: () => void;
  onSeekMove: (event: { nativeEvent: { locationX: number } }) => void;
  onSeekRelease: (event: { nativeEvent: { locationX: number } }) => void;
  onSeek: (forward: boolean) => void;
  onTogglePlayPause: () => void;
  onPlayNextEpisode: () => void;
  onShowEpisodes: () => void;
  formatTime: (time: number) => string;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({
  videoTitle,
  currentEpisodeTitle,
  status,
  isSeeking,
  seekPosition,
  progressPosition,
  currentFocus,
  hasNextEpisode,
  onSeekStart,
  onSeekMove,
  onSeekRelease,
  onSeek,
  onTogglePlayPause,
  onPlayNextEpisode,
  onShowEpisodes,
  formatTime,
}) => {
  const router = useRouter();

  return (
    <View style={styles.controlsOverlay}>
      <View style={styles.topControls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => router.back()}
        >
          <ArrowLeft color="white" size={24} />
        </TouchableOpacity>

        <Text style={styles.controlTitle}>
          {videoTitle} {currentEpisodeTitle ? `- ${currentEpisodeTitle}` : ""}
        </Text>
      </View>

      <View style={styles.bottomControlsContainer}>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground} />
          <View
            style={[
              styles.progressBarFilled,
              {
                width: `${
                  (isSeeking ? seekPosition : progressPosition) * 100
                }%`,
              },
            ]}
          />
          <Pressable
            style={styles.progressBarTouchable}
            onPressIn={onSeekStart}
            onTouchMove={onSeekMove}
            onTouchEnd={onSeekRelease}
          />
        </View>

        <ThemedText style={{ color: "white", marginTop: 5 }}>
          {status?.isLoaded
            ? `${formatTime(status.positionMillis)} / ${formatTime(
                status.durationMillis || 0
              )}`
            : "00:00 / 00:00"}
        </ThemedText>

        <View style={styles.bottomControls}>
          <MediaButton
            onPress={() => onSeek(false)}
            isFocused={currentFocus === "skipBack"}
          >
            <ChevronsLeft color="white" size={24} />
          </MediaButton>

          <MediaButton
            onPress={onTogglePlayPause}
            isFocused={currentFocus === "playPause"}
          >
            {status?.isLoaded && status.isPlaying ? (
              <Pause color="white" size={24} />
            ) : (
              <Play color="white" size={24} />
            )}
          </MediaButton>

          <MediaButton
            onPress={onPlayNextEpisode}
            isFocused={currentFocus === "nextEpisode"}
            isDisabled={!hasNextEpisode}
          >
            <SkipForward color={hasNextEpisode ? "white" : "#666"} size={24} />
          </MediaButton>

          <MediaButton
            onPress={() => onSeek(true)}
            isFocused={currentFocus === "skipForward"}
          >
            <ChevronsRight color="white" size={24} />
          </MediaButton>

          <MediaButton
            onPress={onShowEpisodes}
            isFocused={currentFocus === "episodes"}
          >
            <List color="white" size={24} />
          </MediaButton>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "space-between",
    padding: 20,
  },
  topControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  controlTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 10,
  },
  bottomControlsContainer: {
    width: "100%",
    alignItems: "center",
  },
  bottomControls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 15,
  },
  progressBarContainer: {
    width: "100%",
    height: 8,
    position: "relative",
    marginTop: 10,
  },
  progressBarBackground: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 4,
  },
  progressBarFilled: {
    position: "absolute",
    left: 0,
    height: 8,
    backgroundColor: "#ff0000",
    borderRadius: 4,
  },
  progressBarTouchable: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 30,
    top: -10,
    zIndex: 10,
  },
  controlButton: {
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  topRightContainer: {
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 44, // Match TouchableOpacity default size for alignment
  },
  resolutionText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
});
