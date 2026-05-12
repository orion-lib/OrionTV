import { useCallback, RefObject, useMemo } from 'react';
import { Video, ResizeMode } from 'expo-av';
import Toast from 'react-native-toast-message';
import usePlayerStore from '@/stores/playerStore';
import { isAdSegment } from '@/services/adFilter';
import { useSettingsStore } from '@/stores/settingsStore';

/**
 * 视频处理器 Hook 属性
 */
interface UseVideoHandlersProps {
  videoRef: RefObject<Video>;
  /** 当前剧集信息 */
  currentEpisode: { url: string; title: string; isAd?: boolean; adReason?: string } | undefined;
  /** 初始播放位置（毫秒） */
  initialPosition: number;
  /** 片头结束时间 */
  introEndTime?: number;
  /** 播放速率 */
  playbackRate: number;
  /** 播放状态更新回调 */
  handlePlaybackStatusUpdate: (status: any) => void;
  /** 设备类型 */
  deviceType: string;
  /** 详情信息 */
  detail?: { poster?: string };
}

/**
 * 视频处理器 Hook
 * 管理视频播放的各种回调和事件处理
 */
export const useVideoHandlers = ({
  videoRef,
  currentEpisode,
  initialPosition,
  introEndTime,
  playbackRate,
  handlePlaybackStatusUpdate,
  deviceType,
  detail,
}: UseVideoHandlersProps) => {
  
  /**
   * 视频加载完成回调
   */
  const onLoad = useCallback(async () => {
    console.info(`[PERF] 视频已加载 - 准备播放`);
    
    const { removeAds, checkCurrentEpisodeAd } = usePlayerStore.getState();
    const url = currentEpisode?.url;
    
    // 检测广告
    if (removeAds && url) {
      const adInfo = checkCurrentEpisodeAd(url);
      if (adInfo) {
        console.warn(`[AD_FILTER] 当前剧集被检测为广告: ${adInfo.reason}`);
        Toast.show({
          type: "error",
          text1: "广告警告",
          text2: `检测到广告片段: ${adInfo.reason}`,
          visibilityTime: 3000,
        });
      }
    }
    
    try {
      // 设置初始播放位置
      const jumpPosition = initialPosition || introEndTime || 0;
      if (jumpPosition > 0) {
        console.info(`[PERF] 设置初始播放位置: ${jumpPosition}毫秒`);
        await videoRef.current?.setPositionAsync(jumpPosition);
      }
      
      // 开始自动播放
      console.info(`[AUTOPLAY] 尝试在加载完成后开始播放`);
      await videoRef.current?.playAsync();
      console.info(`[AUTOPLAY] 加载后自动播放成功`);
      
      usePlayerStore.setState({ isLoading: false });
      console.info(`[PERF] 视频加载完成 - isLoading 设置为 false`);
    } catch (error) {
      console.warn(`[AUTOPLAY] 加载后自动播放失败:`, error);
      usePlayerStore.setState({ isLoading: false });
    }
  }, [videoRef, initialPosition, introEndTime, currentEpisode?.url]);

  /**
   * 视频开始加载回调
   */
  const onLoadStart = useCallback(() => {
    if (!currentEpisode?.url) return;
    
    console.info(`[PERF] 视频开始加载: ${currentEpisode.url.substring(0, 100)}...`);
    
    const removeAds = useSettingsStore.getState().removeAds;
    if (removeAds) {
      const adCheckResult = isAdSegment(currentEpisode.url);
      if (adCheckResult.isAd) {
        console.warn(`[AD_FILTER] 加载开始 - 检测到广告: ${adCheckResult.reason}`);
        Toast.show({
          type: "warn",
          text1: "广告片段检测",
          text2: `即将播放广告: ${adCheckResult.reason || '未知原因'}`,
          visibilityTime: 2500,
        });
      }
    }
    
    usePlayerStore.setState({ isLoading: true });
  }, [currentEpisode?.url]);

  /**
   * 视频播放错误回调
   */
  const onError = useCallback((error: any) => {
    if (!currentEpisode?.url) return;
    
    console.error(`[ERROR] 视频播放错误:`, error);
    
    const errorString = (error as any)?.error?.toString() || error?.toString() || '';
    const isSSLError = errorString.includes('SSLHandshakeException') || 
                      errorString.includes('CertPathValidatorException') ||
                      errorString.includes('Trust anchor for certification path not found');
    const isNetworkError = errorString.includes('HttpDataSourceException') ||
                         errorString.includes('IOException') ||
                         errorString.includes('SocketTimeoutException');
    
    if (isSSLError) {
      console.error(`[SSL_ERROR] SSL 证书验证失败: ${currentEpisode.url}`);
      Toast.show({ 
        type: "error", 
        text1: "SSL证书错误，正在尝试其他播放源...",
        text2: "请稍候"
      });
      usePlayerStore.getState().handleVideoError('ssl', currentEpisode.url);
    } else if (isNetworkError) {
      console.error(`[NETWORK_ERROR] 网络连接失败: ${currentEpisode.url}`);
      Toast.show({ 
        type: "error", 
        text1: "网络连接失败，正在尝试其他播放源...",
        text2: "请稍候"
      });
      usePlayerStore.getState().handleVideoError('network', currentEpisode.url);
    } else {
      console.error(`[VIDEO_ERROR] 其他视频错误: ${currentEpisode.url}`);
      Toast.show({ 
        type: "error", 
        text1: "视频播放失败，正在尝试其他播放源...",
        text2: "请稍候"
      });
      usePlayerStore.getState().handleVideoError('other', currentEpisode.url);
    }
  }, [currentEpisode?.url]);

  /**
   * 视频组件属性
   */
  const videoProps = useMemo(() => ({
    source: { uri: currentEpisode?.url || '' },
    posterSource: { uri: detail?.poster ?? "" },
    resizeMode: ResizeMode.CONTAIN,
    rate: playbackRate,
    onPlaybackStatusUpdate: handlePlaybackStatusUpdate,
    onLoad,
    onLoadStart,
    onError,
    useNativeControls: deviceType !== 'tv',
    shouldPlay: true,
    progressiveRenderingEnabled: true,
  }), [
    currentEpisode?.url,
    detail?.poster,
    playbackRate,
    handlePlaybackStatusUpdate,
    onLoad,
    onLoadStart,
    onError,
    deviceType,
  ]);

  return {
    onLoad,
    onLoadStart,
    onError,
    videoProps,
  };
};
