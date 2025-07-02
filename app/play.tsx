import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Video, ResizeMode } from "expo-av";
import { useKeepAwake } from "expo-keep-awake";
import { ThemedView } from "@/components/ThemedView";
import { PlayerControls } from "@/components/PlayerControls";
import { EpisodeSelectionModal } from "@/components/EpisodeSelectionModal";
import { NextEpisodeOverlay } from "@/components/NextEpisodeOverlay";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { usePlaybackManager } from "@/hooks/usePlaybackManager";
import { useTVRemoteHandler } from "@/hooks/useTVRemoteHandler";

export default function PlayScreen() {
  const router = useRouter();
  const videoRef = useRef<Video>(null);
  useKeepAwake();

  const {
    detail,
    episodes,
    currentEpisodeIndex,
    status,
    isLoading,
    setIsLoading,
    showNextEpisodeOverlay,
    playEpisode,
    togglePlayPause,
    seek,
    handlePlaybackStatusUpdate,
    setShowNextEpisodeOverlay,
  } = usePlaybackManager(videoRef);

  const [showControls, setShowControls] = useState(true);
  const [showEpisodeModal, setShowEpisodeModal] = useState(false);
  const [episodeGroupSize] = useState(30);
  const [selectedEpisodeGroup, setSelectedEpisodeGroup] = useState(
    Math.floor(currentEpisodeIndex / episodeGroupSize)
  );

  const { currentFocus, setCurrentFocus } = useTVRemoteHandler({
    showControls,
    setShowControls,
    showEpisodeModal,
    onPlayPause: togglePlayPause,
    onSeek: seek,
    onShowEpisodes: () => setShowEpisodeModal(true),
    onPlayNextEpisode: () => {
      if (currentEpisodeIndex < episodes.length - 1) {
        playEpisode(currentEpisodeIndex + 1);
      }
    },
  });

  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPosition, setSeekPosition] = useState(0);
  const [progressPosition, setProgressPosition] = useState(0);

  const formatTime = (milliseconds: number) => {
    if (!milliseconds) return "00:00";
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleSeekStart = () => setIsSeeking(true);

  const handleSeekMove = (event: { nativeEvent: { locationX: number } }) => {
    if (!status?.isLoaded || !status.durationMillis) return;
    const { locationX } = event.nativeEvent;
    const progressBarWidth = 300;
    const progress = Math.max(0, Math.min(locationX / progressBarWidth, 1));
    setSeekPosition(progress);
  };

  const handleSeekRelease = (event: { nativeEvent: { locationX: number } }) => {
    if (!videoRef.current || !status?.isLoaded || !status.durationMillis)
      return;
    const wasPlaying = status.isPlaying;
    const { locationX } = event.nativeEvent;
    const progressBarWidth = 300;
    const progress = Math.max(0, Math.min(locationX / progressBarWidth, 1));
    const newPosition = progress * status.durationMillis;
    videoRef.current.setPositionAsync(newPosition).then(() => {
      if (wasPlaying) {
        videoRef.current?.playAsync();
      }
    });
    setIsSeeking(false);
  };

  if (!detail && isLoading) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#fff" />
      </ThemedView>
    );
  }

  const currentEpisode = episodes[currentEpisodeIndex];
  const videoTitle = detail?.videoInfo?.title || "";
  const hasNextEpisode = currentEpisodeIndex < episodes.length - 1;

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity
        activeOpacity={1}
        style={styles.videoContainer}
        onPress={() => {
          setShowControls(!showControls);
          setCurrentFocus(null);
        }}
      >
        <Video
          ref={videoRef}
          style={styles.videoPlayer}
          source={{ uri: currentEpisode?.url }}
          resizeMode={ResizeMode.CONTAIN}
          onPlaybackStatusUpdate={(s) => {
            handlePlaybackStatusUpdate(s);
            if (s.isLoaded && !isSeeking) {
              setProgressPosition(s.positionMillis / (s.durationMillis || 1));
            }
          }}
          onLoad={() => setIsLoading(false)}
          onLoadStart={() => setIsLoading(true)}
          useNativeControls={false}
          shouldPlay
        />

        {showControls && (
          <PlayerControls
            videoTitle={videoTitle}
            currentEpisodeTitle={currentEpisode?.title}
            status={status}
            isSeeking={isSeeking}
            seekPosition={seekPosition}
            progressPosition={progressPosition}
            currentFocus={currentFocus}
            hasNextEpisode={hasNextEpisode}
            onSeekStart={handleSeekStart}
            onSeekMove={handleSeekMove}
            onSeekRelease={handleSeekRelease}
            onSeek={seek}
            onTogglePlayPause={togglePlayPause}
            onPlayNextEpisode={() => playEpisode(currentEpisodeIndex + 1)}
            onShowEpisodes={() => setShowEpisodeModal(true)}
            formatTime={formatTime}
          />
        )}

        <LoadingOverlay visible={isLoading} />

        <NextEpisodeOverlay
          visible={showNextEpisodeOverlay}
          onCancel={() => setShowNextEpisodeOverlay(false)}
        />
      </TouchableOpacity>

      <EpisodeSelectionModal
        visible={showEpisodeModal}
        episodes={episodes}
        currentEpisodeIndex={currentEpisodeIndex}
        episodeGroupSize={episodeGroupSize}
        selectedEpisodeGroup={selectedEpisodeGroup}
        setSelectedEpisodeGroup={setSelectedEpisodeGroup}
        onSelectEpisode={(index) => {
          playEpisode(index);
          setShowEpisodeModal(false);
        }}
        onClose={() => setShowEpisodeModal(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  videoContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  videoPlayer: {
    ...StyleSheet.absoluteFillObject,
  },
});
