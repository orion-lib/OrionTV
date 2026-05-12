import { useCallback, useMemo } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import {
  isAdSegment,
  filterAdsFromM3U8,
  filterAdsFromM3U8WithCustomCode,
  getSmartFilterStats,
  clearFilterCache,
} from '@/services/adFilter';

/**
 * 广告过滤 Hook
 * 提供广告过滤相关的状态和操作方法
 */
export const useAdFilter = () => {
  const { removeAds, customAdRules } = useSettingsStore();

  /**
   * 是否为代码模式
   */
  const isCodeMode = useMemo(() => {
    return customAdRules && customAdRules.includes('function');
  }, [customAdRules]);

  /**
   * 过滤 M3U8 内容
   */
  const filterM3U8 = useCallback(
    (m3u8Content: string): string => {
      if (!removeAds) {
        return m3u8Content;
      }
      return filterAdsFromM3U8WithCustomCode(m3u8Content);
    },
    [removeAds]
  );

  /**
   * 检测单个片段
   */
  const checkSegment = useCallback(
    (url: string, duration?: number) => {
      if (!removeAds) {
        return { isAd: false, confidence: 0 };
      }
      return isAdSegment(url, duration);
    },
    [removeAds]
  );

  /**
   * 获取统计信息
   */
  const getStats = useCallback(
    (m3u8Content: string) => {
      if (!removeAds) {
        return {
          totalSegments: 0,
          adSegments: 0,
          normalSegments: 0,
          estimatedAdDuration: 0,
          filteringEnabled: false,
        };
      }
      const stats = getSmartFilterStats(m3u8Content);
      return {
        ...stats,
        filteringEnabled: true,
      };
    },
    [removeAds]
  );

  /**
   * 刷新缓存
   */
  const refreshCache = useCallback(() => {
    clearFilterCache();
  }, []);

  return {
    removeAds,
    isCodeMode,
    filterM3U8,
    checkSegment,
    getStats,
    refreshCache,
  };
};
