import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Pause, Play, SkipForward, List, Tv } from "lucide-react-native";
import { ThemedText } from "@/components/ThemedText";
import { MediaButton } from "@/components/MediaButton";
import usePlayerStore from "@/stores/playerStore";

interface PlayerControlsProps {
  showControls: boolean;
}

export const PlayerControlsMobile: React.FC<PlayerControlsProps> = ({ showControls }) => {
  const {
    detail,
    currentEpisodeIndex,
    currentSourceIndex,
    status,
    isSeeking,
    seekPosition,
    progressPosition,
    togglePlayPause,
    playEpisode,
    setShowEpisodeModal,
    setShowSourceModal,
  } = usePlayerStore();

  const videoTitle = detail?.videoInfo?.title || "";
  const currentEpisode = detail?.episodes[currentEpisodeIndex];
  const currentEpisodeTitle = currentEpisode?.title;
  const hasNextEpisode = currentEpisodeIndex < (detail?.episodes.length || 0) - 1;

  const formatTime = (milliseconds: number) => {
    if (!milliseconds) return "00:00";
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const onPlayNextEpisode = () => {
    if (hasNextEpisode) {
      playEpisode(currentEpisodeIndex + 1);
    }
  };

  return (
    <View style={styles.controlsOverlay}>
      <View style={styles.topControls}>
        <Text style={styles.controlTitle} numberOfLines={2}>
          {videoTitle} {currentEpisodeTitle ? `- ${currentEpisodeTitle}` : ""}
        </Text>
      </View>

      <View style={styles.middleControls}>
        {/* This area can be used for gesture-based seeking indicators in the future */}
      </View>

      <View style={styles.bottomControlsContainer}>
        <View style={styles.timeAndActions}>
          <ThemedText style={styles.timeText}>
            {status?.isLoaded
              ? `${formatTime(status.positionMillis)} / ${formatTime(status.durationMillis || 0)}`
              : "00:00 / 00:00"}
          </ThemedText>
          <View style={styles.actions}>
            <MediaButton onPress={() => setShowEpisodeModal(true)}>
              <List color="white" size={22} />
            </MediaButton>
            <MediaButton onPress={() => setShowSourceModal(true)}>
              <Tv color="white" size={22} />
            </MediaButton>
          </View>
        </View>

        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground} />
          <View
            style={[
              styles.progressBarFilled,
              {
                width: `${(isSeeking ? seekPosition : progressPosition) * 100}%`,
              },
            ]}
          />
          <Pressable style={styles.progressBarTouchable} />
        </View>

        <View style={styles.mainControls}>
          <View style={styles.placeholder} />
          <MediaButton onPress={togglePlayPause}>
            {status?.isLoaded && status.isPlaying ? (
              <Pause color="white" size={36} />
            ) : (
              <Play color="white" size={36} />
            )}
          </MediaButton>
          <MediaButton onPress={onPlayNextEpisode} disabled={!hasNextEpisode}>
            <SkipForward color={hasNextEpisode ? "white" : "#666"} size={28} />
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
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  topControls: {
    flexDirection: "row",
    justifyContent: "center",
  },
  controlTitle: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  middleControls: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomControlsContainer: {
    width: "100%",
  },
  timeAndActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  timeText: {
    color: "white",
    fontSize: 12,
  },
  actions: {
    flexDirection: "row",
    gap: 15,
  },
  progressBarContainer: {
    width: "100%",
    height: 4,
    position: "relative",
    marginVertical: 10,
  },
  progressBarBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
  },
  progressBarFilled: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#ff0000",
    borderRadius: 2,
  },
  progressBarTouchable: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 20,
    top: -8,
    zIndex: 10,
  },
  mainControls: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 5,
  },
  placeholder: {
    width: 28, // to balance the skip forward button
  },
});
