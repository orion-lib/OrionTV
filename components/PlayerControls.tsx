import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import {
  Pause,
  Play,
  SkipForward,
  FastForward,
  Rewind,
  Gauge,
  Maximize2,
  List,
  Tv,
  ArrowDownToDot,
  ArrowUpFromDot
} from "lucide-react-native";
import { ThemedText } from "@/components/ThemedText";
import { MediaButton } from "@/components/MediaButton";
import { PlaybackSpeedModal } from "@/components/PlaybackSpeedModal";
import { DraggableProgressBar } from "@/components/DraggableProgressBar";

import usePlayerStore from "@/stores/playerStore";
import useDetailStore from "@/stores/detailStore";
import { useSources } from "@/stores/sourceStore";

interface PlayerControlsProps {
  showControls: boolean;
  setShowControls: (show: boolean) => void;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({ showControls, setShowControls }) => {
  const {
    currentEpisodeIndex,
    episodes,
    status,
    isSeeking,
    seekPosition,
    progressPosition,
    togglePlayPause,
    playEpisode,
    setShowEpisodeModal,
    setShowSourceModal,
    setIntroEndTime,
    setOutroStartTime,
    introEndTime,
    outroStartTime,
    // 新增：快进/快退方法
    fastForward,
    rewind,
    // 新增：播放速度相关
    playbackRate,
    showSpeedModal,
    setPlaybackRate,
    setShowSpeedModal,
    // 新增：拖动相关
    isDragging,
    dragPosition,
    seekToPosition,
    startDragging,
    updateDragging,
    endDragging,
    // 新增：视频缩放模式
    videoResizeMode,
    toggleVideoResizeMode,
  } = usePlayerStore();

  const { detail } = useDetailStore();
  const resources = useSources();

  const videoTitle = detail?.title || "";
  const currentEpisode = episodes[currentEpisodeIndex];
  const currentEpisodeTitle = currentEpisode?.title;
  const currentSource = resources.find((r) => r.source === detail?.source);
  const currentSourceName = currentSource?.source_name;
  const hasNextEpisode = currentEpisodeIndex < (episodes.length || 0) - 1;

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

  // 处理进度条点击
  const handleProgressBarPress = (event: any) => {
    const { locationX } = event.nativeEvent;
    const containerWidth = event.currentTarget.offsetWidth || 300; // 估计值
    const position = Math.max(0, Math.min(1, locationX / containerWidth));
    seekToPosition(position);
  };

  // 处理快进按钮（10秒）
  const handleFastForward = () => {
    fastForward(10);
  };

  // 处理快退按钮（10秒）
  const handleRewind = () => {
    rewind(10);
  };

  // 处理倍速按钮
  const handleSpeedPress = () => {
    setShowSpeedModal(true);
  };

  // 处理缩放模式按钮
  const handleResizeModePress = () => {
    toggleVideoResizeMode();
  };

  return (
    <View style={styles.controlsOverlay}>
      <View style={styles.topControls}>
        <Text style={styles.controlTitle}>
          {videoTitle} {currentEpisodeTitle ? `- ${currentEpisodeTitle}` : ""}{" "}
          {currentSourceName ? `(${currentSourceName})` : ""}
        </Text>
      </View>

      <View style={styles.bottomControlsContainer}>
        <DraggableProgressBar style={styles.progressBarContainer} />

        <ThemedText style={{ color: "white", marginTop: 5 }}>
          {status?.isLoaded
            ? `${formatTime(status.positionMillis)} / ${formatTime(status.durationMillis || 0)}`
            : "00:00 / 00:00"}
        </ThemedText>

        <View style={styles.bottomControls}>
          <MediaButton onPress={setIntroEndTime} timeLabel={introEndTime ? formatTime(introEndTime) : undefined}>
            <ArrowDownToDot color="white" size={24} />
          </MediaButton>

          <MediaButton onPress={handleRewind}>
            <Rewind color="white" size={24} />
          </MediaButton>

          <MediaButton onPress={togglePlayPause} hasTVPreferredFocus={showControls}>
            {status?.isLoaded && status.isPlaying ? (
              <Pause color="white" size={24} />
            ) : (
              <Play color="white" size={24} />
            )}
          </MediaButton>

          <MediaButton onPress={handleFastForward}>
            <FastForward color="white" size={24} />
          </MediaButton>

          <MediaButton onPress={onPlayNextEpisode} disabled={!hasNextEpisode}>
            <SkipForward color={hasNextEpisode ? "white" : "#666"} size={24} />
          </MediaButton>

          <MediaButton
            onPress={handleSpeedPress}
            timeLabel={playbackRate !== 1.0 ? `${playbackRate}x` : undefined}
          >
            <Gauge color={playbackRate !== 1.0 ? "#4CAF50" : "white"} size={24} />
          </MediaButton>

          <MediaButton
            onPress={handleResizeModePress}
            timeLabel={videoResizeMode !== "cover" ? videoResizeMode : undefined}
          >
            <Maximize2 color={videoResizeMode !== "cover" ? "#4CAF50" : "white"} size={24} />
          </MediaButton>

          <MediaButton onPress={setOutroStartTime} timeLabel={outroStartTime ? formatTime(outroStartTime) : undefined}>
            <ArrowUpFromDot color="white" size={24} />
          </MediaButton>

          <MediaButton onPress={() => setShowEpisodeModal(true)}>
            <List color="white" size={24} />
          </MediaButton>

          <MediaButton onPress={() => setShowSourceModal(true)}>
            <Tv color="white" size={24} />
          </MediaButton>
        </View>

        {/* 播放速度选择模态框 */}
        <PlaybackSpeedModal
          visible={showSpeedModal}
          currentRate={playbackRate}
          onSelectRate={setPlaybackRate}
          onClose={() => setShowSpeedModal(false)}
        />
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
    backgroundColor: "#fff",
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
