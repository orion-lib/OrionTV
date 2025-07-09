import React, { useEffect, useRef } from "react";
import { View, StyleSheet, ActivityIndicator, BackHandler, Platform, SafeAreaView, Dimensions } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Video, ResizeMode } from "expo-av";
import * as ScreenOrientation from "expo-screen-orientation";
import { useKeepAwake } from "expo-keep-awake";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { ThemedView } from "@/components/ThemedView";
import { PlayerControls } from "@/components/PlayerControls";
import { PlayerControlsMobile } from "@/components/PlayerControls.mobile";
import { EpisodeSelectionModal } from "@/components/EpisodeSelectionModal";
import { SourceSelectionModal } from "@/components/SourceSelectionModal";
import { SeekingBar } from "@/components/SeekingBar";
import { NextEpisodeOverlay } from "@/components/NextEpisodeOverlay";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import usePlayerStore from "@/stores/playerStore";
import { useTVRemoteHandler } from "@/hooks/useTVRemoteHandler";
import { useResponsive } from "@/hooks/useResponsive";

export default function PlayScreen() {
  const videoRef = useRef<Video>(null);
  const router = useRouter();
  useKeepAwake();
  const { isMobile } = useResponsive();
  const { source, id, episodeIndex, position } = useLocalSearchParams<{
    source: string;
    id: string;
    episodeIndex: string;
    position: string;
  }>();

  const {
    detail,
    episodes,
    currentEpisodeIndex,
    isLoading,
    showControls,
    showEpisodeModal,
    showSourceModal,
    showNextEpisodeOverlay,
    initialPosition,
    introEndTime,
    setVideoRef,
    loadVideo,
    playEpisode,
    togglePlayPause,
    seek,
    handlePlaybackStatusUpdate,
    setShowControls,
    setShowEpisodeModal,
    setShowSourceModal,
    setShowNextEpisodeOverlay,
    reset,
  } = usePlayerStore();

  useEffect(() => {
    async function lockOrientation() {
      if (isMobile) {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);
      }
    }
    lockOrientation();

    return () => {
      if (isMobile) {
        ScreenOrientation.unlockAsync();
      }
    };
  }, [isMobile]);

  useEffect(() => {
    setVideoRef(videoRef);
    if (source && id) {
      loadVideo(source, id, parseInt(episodeIndex || "0", 10), parseInt(position || "0", 10));
    }
    return () => {
      reset(); // Reset state when component unmounts
    };
  }, [source, id, episodeIndex, position, setVideoRef, loadVideo, reset]);

  const { onScreenPress: onTVScreenPress } = useTVRemoteHandler();

  const handleScreenPress = () => {
    if (isMobile) {
      setShowControls(!showControls);
    } else {
      onTVScreenPress();
    }
  };

  const singleTap = Gesture.Tap()
    .onEnd(() => {
      handleScreenPress();
    })
    .runOnJS(true);

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd((e) => {
      if (!isMobile) return;
      const tapPositionX = e.x;
      const screenWidth = Dimensions.get("window").width;
      if (tapPositionX < screenWidth / 2) {
        seek(-10); // Seek back
      } else {
        seek(10); // Seek forward
      }
    })
    .runOnJS(true);

  const composedGesture = Gesture.Exclusive(doubleTap, singleTap);

  useEffect(() => {
    const backAction = () => {
      if (showControls) {
        setShowControls(false);
        return true;
      }
      router.back();
      return true;
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

    return () => backHandler.remove();
  }, [
    showControls,
    showEpisodeModal,
    showSourceModal,
    setShowControls,
    setShowEpisodeModal,
    setShowSourceModal,
    router,
  ]);

  if (!detail && isLoading) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#fff" />
      </ThemedView>
    );
  }

  const currentEpisode = episodes[currentEpisodeIndex];

  const PlayerComponent = isMobile ? PlayerControlsMobile : PlayerControls;

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView focusable style={styles.container}>
        <GestureDetector gesture={composedGesture}>
          <View style={styles.videoContainer}>
            <Video
              ref={videoRef}
              style={styles.videoPlayer}
              source={{ uri: currentEpisode?.url }}
              resizeMode={ResizeMode.CONTAIN}
              onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
              onLoad={() => {
                const jumpPosition = introEndTime || initialPosition;
                if (jumpPosition > 0) {
                  videoRef.current?.setPositionAsync(jumpPosition);
                }
                usePlayerStore.setState({ isLoading: false });
              }}
              onLoadStart={() => usePlayerStore.setState({ isLoading: true })}
              useNativeControls={false}
              shouldPlay
            />

            {showControls && <PlayerComponent showControls={showControls} setShowControls={setShowControls} />}

            <SeekingBar />

            <LoadingOverlay visible={isLoading} />

            <NextEpisodeOverlay visible={showNextEpisodeOverlay} onCancel={() => setShowNextEpisodeOverlay(false)} />
          </View>
        </GestureDetector>

        <EpisodeSelectionModal />
        <SourceSelectionModal />
      </ThemedView>
    </SafeAreaView>
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
