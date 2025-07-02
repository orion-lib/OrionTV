import { useState, useRef, useEffect } from "react";
import { useLocalSearchParams } from "expo-router";
import { Video, AVPlaybackStatus } from "expo-av";
import { moonTVApi, VideoDetail } from "@/services/api";
import { PlayRecordManager } from "@/services/storage";
import { getResolutionFromM3U8 } from "@/services/m3u8";

interface Episode {
  title?: string;
  url: string;
}

interface Source {
  name?: string;
  url: string;
}

export const usePlaybackManager = (videoRef: React.RefObject<Video>) => {
  const params = useLocalSearchParams();
  const [detail, setDetail] = useState<VideoDetail | null>(null);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(
    params.episodeIndex ? parseInt(params.episodeIndex as string) : 0
  );
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [resolution, setResolution] = useState<string | null>(null);
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialSeekApplied, setInitialSeekApplied] = useState(false);
  const [showNextEpisodeOverlay, setShowNextEpisodeOverlay] = useState(false);
  const autoPlayTimer = useRef<NodeJS.Timeout | null>(null);
  const saveRecordTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchVideoDetail();

    saveRecordTimer.current = setInterval(() => {
      saveCurrentPlayRecord();
    }, 30000);

    return () => {
      saveCurrentPlayRecord();
      if (saveRecordTimer.current) {
        clearInterval(saveRecordTimer.current);
      }
      if (autoPlayTimer.current) {
        clearTimeout(autoPlayTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (status?.isLoaded && "isPlaying" in status && !status.isPlaying) {
      saveCurrentPlayRecord();
    }
  }, [status]);

  useEffect(() => {
    if (!detail || !videoRef.current || initialSeekApplied) return;
    loadPlayRecord();
  }, [detail, currentEpisodeIndex, videoRef.current]);

  const fetchVideoDetail = async () => {
    try {
      setIsLoading(true);
      const source = (params.source as string) || "1";
      const id = (params.id as string) || "1";

      const data = await moonTVApi.getVideoDetail(source, id);
      setDetail(data);

      const processedEpisodes = data.episodes.map((url, index) => ({
        title: `第${index + 1}集`,
        url,
      }));
      setEpisodes(processedEpisodes);

      if (data.episodes.length > 0) {
        const demoSources = [
          { name: "默认线路", url: data.episodes[0] },
          { name: "备用线路", url: data.episodes[0] },
        ];
        setSources(demoSources);
      }
    } catch (error) {
      console.error("Error fetching video detail:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPlayRecord = async () => {
    if (typeof params.source !== "string" || typeof params.id !== "string")
      return;

    try {
      const record = await PlayRecordManager.get(params.source, params.id);
      if (record && videoRef.current && record.index === currentEpisodeIndex) {
        setTimeout(async () => {
          if (videoRef.current) {
            await videoRef.current.setPositionAsync(record.play_time * 1000);
            setInitialSeekApplied(true);
          }
        }, 2000);
      }
    } catch (error) {
      console.error("Error loading play record:", error);
    }
  };

  const saveCurrentPlayRecord = async () => {
    if (!status?.isLoaded || !detail?.videoInfo) return;
    const { source, id } = params;
    if (typeof source !== "string" || typeof id !== "string") return;

    try {
      await PlayRecordManager.save(source, id, {
        title: detail.videoInfo.title,
        source_name: detail.videoInfo.source_name,
        cover: detail.videoInfo.cover || "",
        index: currentEpisodeIndex,
        total_episodes: episodes.length,
        play_time: Math.floor(status.positionMillis / 1000),
        total_time: Math.floor((status.durationMillis || 0) / 1000),
      });
    } catch (error) {
      console.error("Failed to save play record:", error);
    }
  };

  const playEpisode = async (episodeIndex: number) => {
    if (autoPlayTimer.current) {
      clearTimeout(autoPlayTimer.current);
      autoPlayTimer.current = null;
    }

    setShowNextEpisodeOverlay(false);
    setCurrentEpisodeIndex(episodeIndex);
    setIsLoading(true);
    setInitialSeekApplied(false);
    setResolution(null); // Reset resolution

    if (videoRef.current && episodes[episodeIndex]) {
      const episodeUrl = episodes[episodeIndex].url;
      getResolutionFromM3U8(episodeUrl).then(setResolution);

      await videoRef.current.unloadAsync();
      setTimeout(async () => {
        try {
          await videoRef.current?.loadAsync(
            { uri: episodeUrl },
            { shouldPlay: true }
          );
        } catch (error) {
          console.error("Error loading video:", error);
        } finally {
          setIsLoading(false);
        }
      }, 200);
    }
  };

  const playNextEpisode = () => {
    if (currentEpisodeIndex < episodes.length - 1) {
      playEpisode(currentEpisodeIndex + 1);
    }
  };

  const togglePlayPause = async () => {
    if (!videoRef.current) return;
    if (status?.isLoaded && status.isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
    }
  };

  const seek = async (forward: boolean) => {
    if (!videoRef.current || !status?.isLoaded) return;
    const wasPlaying = status.isPlaying;
    const seekTime = forward ? 10000 : -10000;
    const position = status.positionMillis + seekTime;
    await videoRef.current.setPositionAsync(Math.max(0, position));
    if (wasPlaying) {
      await videoRef.current.playAsync();
    }
  };

  const handlePlaybackStatusUpdate = (newStatus: AVPlaybackStatus) => {
    setStatus(newStatus);
    if (newStatus.isLoaded) {
      if (
        newStatus.durationMillis &&
        newStatus.positionMillis &&
        newStatus.durationMillis - newStatus.positionMillis < 2000 &&
        currentEpisodeIndex < episodes.length - 1 &&
        !showNextEpisodeOverlay
      ) {
        setShowNextEpisodeOverlay(true);
        if (autoPlayTimer.current) clearTimeout(autoPlayTimer.current);
        autoPlayTimer.current = setTimeout(() => {
          playNextEpisode();
        }, 2000);
      }
    }
  };

  return {
    detail,
    episodes,
    sources,
    currentEpisodeIndex,
    currentSourceIndex,
    status,
    isLoading,
    showNextEpisodeOverlay,
    resolution,
    setCurrentSourceIndex,
    setStatus,
    setShowNextEpisodeOverlay,
    setIsLoading,
    playEpisode,
    playNextEpisode,
    togglePlayPause,
    seek,
    handlePlaybackStatusUpdate,
  };
};
