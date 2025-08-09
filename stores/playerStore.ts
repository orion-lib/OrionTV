import { create } from "zustand";
import Toast from "react-native-toast-message";
import { AVPlaybackStatus, Video } from "expo-av";
import { RefObject } from "react";
import { PlayRecord, PlayRecordManager } from "@/services/storage";
import useDetailStore, { episodesSelectorBySource } from "./detailStore";

interface Episode {
  url: string;
  title: string;
}

interface PlayerState {
  videoRef: RefObject<Video> | null;
  currentEpisodeIndex: number;
  episodes: Episode[];
  status: AVPlaybackStatus | null;
  isLoading: boolean;
  showControls: boolean;
  showEpisodeModal: boolean;
  showSourceModal: boolean;
  showNextEpisodeOverlay: boolean;
  isSeeking: boolean;
  seekPosition: number;
  progressPosition: number;
  initialPosition: number;
  introEndTime?: number;
  outroStartTime?: number;
  // 新增：播放速度相关
  playbackRate: number;
  showSpeedModal: boolean;
  // 新增：拖动相关
  isDragging: boolean;
  dragPosition: number;
  setVideoRef: (ref: RefObject<Video>) => void;
  loadVideo: (options: {
    source: string;
    id: string;
    title: string;
    episodeIndex: number;
    position?: number;
  }) => Promise<void>;
  playEpisode: (index: number) => void;
  togglePlayPause: () => void;
  seek: (duration: number) => void;
  handlePlaybackStatusUpdate: (newStatus: AVPlaybackStatus) => void;
  setLoading: (loading: boolean) => void;
  setShowControls: (show: boolean) => void;
  setShowEpisodeModal: (show: boolean) => void;
  setShowSourceModal: (show: boolean) => void;
  setShowNextEpisodeOverlay: (show: boolean) => void;
  setIntroEndTime: () => void;
  setOutroStartTime: () => void;
  reset: () => void;
  // 新增：快进/快退方法
  fastForward: (seconds?: number) => void;
  rewind: (seconds?: number) => void;
  // 新增：播放速度方法
  setPlaybackRate: (rate: number) => void;
  setShowSpeedModal: (show: boolean) => void;
  // 新增：拖动相关方法
  seekToPosition: (position: number) => void;
  startDragging: (position: number) => void;
  updateDragging: (position: number) => void;
  endDragging: () => void;
  _seekTimeout?: any;
  _isRecordSaveThrottled: boolean;
  // Internal helper
  _savePlayRecord: (updates?: Partial<PlayRecord>, options?: { immediate?: boolean }) => void;
}

const usePlayerStore = create<PlayerState>((set, get) => ({
  videoRef: null,
  episodes: [],
  currentEpisodeIndex: -1,
  status: null,
  isLoading: true,
  showControls: false,
  showEpisodeModal: false,
  showSourceModal: false,
  showNextEpisodeOverlay: false,
  isSeeking: false,
  seekPosition: 0,
  progressPosition: 0,
  initialPosition: 0,
  introEndTime: undefined,
  outroStartTime: undefined,
  // 新增初始状态
  playbackRate: 1.0,
  showSpeedModal: false,
  isDragging: false,
  dragPosition: 0,
  _seekTimeout: undefined,
  _isRecordSaveThrottled: false,

  setVideoRef: (ref: RefObject<Video>) => set({ videoRef: ref }),

  loadVideo: async ({ source, id, episodeIndex, position, title }: {
    source: string;
    id: string;
    title: string;
    episodeIndex: number;
    position?: number;
  }) => {
    let detail = useDetailStore.getState().detail;
    let episodes = episodesSelectorBySource(source)(useDetailStore.getState());

    set({
      isLoading: true,
    });

    if (!detail || !episodes || episodes.length === 0 || detail.title !== title) {
      await useDetailStore.getState().init(title, source, id);
      detail = useDetailStore.getState().detail;
      episodes = episodesSelectorBySource(source)(useDetailStore.getState());
      if (!detail) {
        console.info("Detail not found after initialization");
        return;
      }
    }

    try {
      const playRecord = await PlayRecordManager.get(detail.source, detail.id.toString());
      const initialPositionFromRecord = playRecord?.play_time ? playRecord.play_time * 1000 : 0;
      set({
        isLoading: false,
        currentEpisodeIndex: episodeIndex,
        initialPosition: position || initialPositionFromRecord,
        episodes: episodes.map((ep: string, index: number) => ({
          url: ep,
          title: `第 ${index + 1} 集`,
        })),
        introEndTime: playRecord?.introEndTime,
        outroStartTime: playRecord?.outroStartTime,
      });
    } catch (error) {
      console.info("Failed to load play record", error);
      set({ isLoading: false });
    }
  },

  playEpisode: async (index: number) => {
    const { episodes, videoRef } = get();
    if (index >= 0 && index < episodes.length) {
      set({
        currentEpisodeIndex: index,
        showNextEpisodeOverlay: false,
        initialPosition: 0,
        progressPosition: 0,
        seekPosition: 0,
      });
      try {
        await videoRef?.current?.replayAsync();
      } catch (error) {
        console.error("Failed to replay video:", error);
        Toast.show({ type: "error", text1: "播放失败" });
      }
    }
  },

  togglePlayPause: async () => {
    const { status, videoRef } = get();
    if (status?.isLoaded) {
      try {
        if (status.isPlaying) {
          await videoRef?.current?.pauseAsync();
        } else {
          await videoRef?.current?.playAsync();
        }
      } catch (error) {
        console.error("Failed to toggle play/pause:", error);
        Toast.show({ type: "error", text1: "操作失败" });
      }
    }
  },

  seek: async (duration: number) => {
    const { status, videoRef } = get();
    if (!status?.isLoaded || !status.durationMillis) return;

    const newPosition = Math.max(0, Math.min(status.positionMillis + duration, status.durationMillis));
    try {
      await videoRef?.current?.setPositionAsync(newPosition);
    } catch (error) {
      console.error("Failed to seek video:", error);
      Toast.show({ type: "error", text1: "快进/快退失败" });
    }

    set({
      isSeeking: true,
      seekPosition: newPosition / status.durationMillis,
    });

    if (get()._seekTimeout) {
      clearTimeout(get()._seekTimeout);
    }
    const timeoutId = setTimeout(() => set({ isSeeking: false }), 1000);
    set({ _seekTimeout: timeoutId });
  },

  // 新增：快进功能
  fastForward: (seconds = 10) => {
    get().seek(seconds * 1000);
  },

  // 新增：快退功能
  rewind: (seconds = 10) => {
    get().seek(-seconds * 1000);
  },

  // 新增：设置播放速度
  setPlaybackRate: async (rate: number) => {
    const { videoRef, status } = get();
    if (status?.isLoaded && videoRef?.current) {
      try {
        await videoRef.current.setRateAsync(rate, true); // shouldCorrectPitch = true
        set({ playbackRate: rate });
        Toast.show({
          type: "success",
          text1: "播放速度已调整",
          text2: `${rate}x`,
        });
      } catch (error) {
        console.error("Failed to set playback rate:", error);
        Toast.show({ type: "error", text1: "调整播放速度失败" });
      }
    }
  },

  // 新增：显示/隐藏速度选择模态
  setShowSpeedModal: (show: boolean) => set({ showSpeedModal: show }),

  // 新增：跳转到指定位置
  seekToPosition: async (position: number) => {
    const { status, videoRef } = get();
    if (!status?.isLoaded || !status.durationMillis) return;

    const targetPosition = Math.max(0, Math.min(position * status.durationMillis, status.durationMillis));
    try {
      await videoRef?.current?.setPositionAsync(targetPosition);
    } catch (error) {
      console.error("Failed to seek to position:", error);
      Toast.show({ type: "error", text1: "跳转失败" });
    }
  },

  // 新增：开始拖动
  startDragging: (position: number) => {
    set({
      isDragging: true,
      dragPosition: position,
      isSeeking: true,
      seekPosition: position,
    });
  },

  // 新增：更新拖动位置
  updateDragging: (position: number) => {
    if (get().isDragging) {
      set({
        dragPosition: position,
        seekPosition: position,
      });
    }
  },

  // 新增：结束拖动
  endDragging: () => {
    const { dragPosition } = get();
    set({ isDragging: false });
    get().seekToPosition(dragPosition);
    
    // 延时隐藏seeking状态
    if (get()._seekTimeout) {
      clearTimeout(get()._seekTimeout);
    }
    const timeoutId = setTimeout(() => set({ isSeeking: false }), 1000);
    set({ _seekTimeout: timeoutId });
  },

  setIntroEndTime: () => {
    const { status, introEndTime: existingIntroEndTime } = get();
    const detail = useDetailStore.getState().detail;
    if (!status?.isLoaded || !detail) return;

    if (existingIntroEndTime) {
      // Clear the time
      set({ introEndTime: undefined });
      get()._savePlayRecord({ introEndTime: undefined }, { immediate: true });
      Toast.show({
        type: "info",
        text1: "已清除片头时间",
      });
    } else {
      // Set the time
      const newIntroEndTime = status.positionMillis;
      set({ introEndTime: newIntroEndTime });
      get()._savePlayRecord({ introEndTime: newIntroEndTime }, { immediate: true });
      Toast.show({
        type: "success",
        text1: "设置成功",
        text2: "片头时间已记录。",
      });
    }
  },

  setOutroStartTime: () => {
    const { status, outroStartTime: existingOutroStartTime } = get();
    const detail = useDetailStore.getState().detail;
    if (!status?.isLoaded || !detail) return;

    if (existingOutroStartTime) {
      // Clear the time
      set({ outroStartTime: undefined });
      get()._savePlayRecord({ outroStartTime: undefined }, { immediate: true });
      Toast.show({
        type: "info",
        text1: "已清除片尾时间",
      });
    } else {
      // Set the time
      if (!status.durationMillis) return;
      const newOutroStartTime = status.durationMillis - status.positionMillis;
      set({ outroStartTime: newOutroStartTime });
      get()._savePlayRecord({ outroStartTime: newOutroStartTime }, { immediate: true });
      Toast.show({
        type: "success",
        text1: "设置成功",
        text2: "片尾时间已记录。",
      });
    }
  },

  _savePlayRecord: (updates: Partial<PlayRecord> = {}, options: { immediate?: boolean } = {}) => {
    const { immediate = false } = options;
    if (!immediate) {
      if (get()._isRecordSaveThrottled) {
        return;
      }
      set({ _isRecordSaveThrottled: true });
      setTimeout(() => {
        set({ _isRecordSaveThrottled: false });
      }, 10000); // 10 seconds
    }

    const { detail } = useDetailStore.getState();
    const { currentEpisodeIndex, episodes, status, introEndTime, outroStartTime } = get();
    if (detail && status?.isLoaded) {
      const existingRecord = {
        introEndTime,
        outroStartTime,
      };
      PlayRecordManager.save(detail.source, detail.id.toString(), {
        title: detail.title,
        cover: detail.poster || "",
        index: currentEpisodeIndex + 1,
        total_episodes: episodes.length,
        play_time: Math.floor(status.positionMillis / 1000),
        total_time: status.durationMillis ? Math.floor(status.durationMillis / 1000) : 0,
        source_name: detail.source_name,
        year: detail.year || "",
        ...existingRecord,
        ...updates,
      });
    }
  },

  handlePlaybackStatusUpdate: (newStatus: AVPlaybackStatus) => {
    if (!newStatus.isLoaded) {
      if (newStatus.error) {
        console.info(`Playback Error: ${newStatus.error}`);
      }
      set({ status: newStatus });
      return;
    }

    const { currentEpisodeIndex, episodes, outroStartTime, playEpisode } = get();
    const detail = useDetailStore.getState().detail;

    if (
      outroStartTime &&
      newStatus.durationMillis &&
      newStatus.positionMillis >= newStatus.durationMillis - outroStartTime
    ) {
      if (currentEpisodeIndex < episodes.length - 1) {
        playEpisode(currentEpisodeIndex + 1);
        return; // Stop further processing for this update
      }
    }

    if (detail && newStatus.durationMillis) {
      get()._savePlayRecord();

      const isNearEnd = newStatus.positionMillis / newStatus.durationMillis > 0.95;
      if (isNearEnd && currentEpisodeIndex < episodes.length - 1 && !outroStartTime) {
        set({ showNextEpisodeOverlay: true });
      } else {
        set({ showNextEpisodeOverlay: false });
      }
    }

    if (newStatus.didJustFinish) {
      if (currentEpisodeIndex < episodes.length - 1) {
        playEpisode(currentEpisodeIndex + 1);
      }
    }

    const progressPosition = newStatus.durationMillis ? newStatus.positionMillis / newStatus.durationMillis : 0;
    set({ status: newStatus, progressPosition });
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setShowControls: (show: boolean) => set({ showControls: show }),
  setShowEpisodeModal: (show: boolean) => set({ showEpisodeModal: show }),
  setShowSourceModal: (show: boolean) => set({ showSourceModal: show }),
  setShowNextEpisodeOverlay: (show: boolean) => set({ showNextEpisodeOverlay: show }),

  reset: () => {
    set({
      episodes: [],
      currentEpisodeIndex: 0,
      status: null,
      isLoading: true,
      showControls: false,
      showEpisodeModal: false,
      showSourceModal: false,
      showNextEpisodeOverlay: false,
      showSpeedModal: false,
      initialPosition: 0,
      introEndTime: undefined,
      outroStartTime: undefined,
      playbackRate: 1.0,
      isDragging: false,
      dragPosition: 0,
    });
  },
}));

export default usePlayerStore;

export const selectCurrentEpisode = (state: PlayerState) => {
  if (state.episodes.length > state.currentEpisodeIndex) {
    return state.episodes[state.currentEpisodeIndex];
  }
};
