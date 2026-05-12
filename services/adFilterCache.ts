import Logger from '@/utils/Logger';
import { isAdSegment } from '@/services/adFilter';

const logger = Logger.withTag('AdFilterCache');

/**
 * 单个 URL 的广告检测结果
 */
interface AdCheckResult {
  url: string;
  isAd: boolean;
  reason?: string;
  confidence: number;
  timestamp: number;
}

/**
 * 单集的广告信息
 */
interface EpisodeAdInfo {
  episodeIndex: number;
  isAd: boolean;
  adSegments: { index: number; url: string; reason: string }[];
}

/**
 * 广告过滤缓存管理器
 */
class AdFilterCacheManager {
  /** URL 缓存 */
  private cache: Map<string, AdCheckResult> = new Map();
  /** 剧集缓存 */
  private episodeCache: Map<string, EpisodeAdInfo[]> = new Map();
  /** 缓存有效期（毫秒） */
  private cacheDuration = 300000;
  /** 最大缓存数量 */
  private maxCacheSize = 500;

  /**
   * 清除所有缓存
   */
  clear(): void {
    this.cache.clear();
    this.episodeCache.clear();
    logger.info('广告过滤缓存已清除');
  }

  /**
   * 生成 URL 缓存键
   */
  getCacheKey(source: string, id: string, url: string): string {
    return `${source}:${id}:${url}`;
  }

  /**
   * 生成剧集缓存键
   */
  getEpisodeCacheKey(source: string, id: string): string {
    return `${source}:${id}`;
  }

  /**
   * 检测单个 URL（带缓存）
   */
  checkUrl(url: string): AdCheckResult {
    const cached = this.cache.get(url);
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      logger.debug(`广告缓存命中: ${url.substring(0, 50)}...`);
      return cached;
    }

    logger.debug(`广告缓存未命中: ${url.substring(0, 50)}...`);
    const result = isAdSegment(url);
    const cacheEntry: AdCheckResult = {
      url,
      isAd: result.isAd,
      reason: result.reason,
      confidence: result.confidence,
      timestamp: Date.now(),
    };

    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }

    this.cache.set(url, cacheEntry);
    return cacheEntry;
  }

  /**
   * 批量检测剧集列表（带缓存）
   */
  checkEpisodeList(
    source: string,
    id: string,
    episodes: string[]
  ): EpisodeAdInfo[] {
    const cacheKey = this.getEpisodeCacheKey(source, id);
    const cached = this.episodeCache.get(cacheKey);
    
    if (cached) {
      logger.info(`剧集广告缓存命中 ${source}:${id}`);
      return cached;
    }

    logger.info(`剧集广告缓存未命中 - 正在检测 ${episodes.length} 个剧集`);
    const results: EpisodeAdInfo[] = [];

    for (let i = 0; i < episodes.length; i++) {
      const url = episodes[i];
      const checkResult = this.checkUrl(url);
      
      results.push({
        episodeIndex: i,
        isAd: checkResult.isAd,
        adSegments: checkResult.isAd ? [{
          index: i,
          url: url,
          reason: checkResult.reason || 'unknown',
        }] : [],
      });
    }

    this.episodeCache.set(cacheKey, results);
    logger.info(`剧集广告缓存已保存 ${source}:${id} - 发现 ${results.filter(r => r.isAd).length} 个广告剧集`);

    return results;
  }

  /**
   * 检查指定剧集是否为广告
   */
  isEpisodeAd(source: string, id: string, episodeIndex: number): boolean {
    const cacheKey = this.getEpisodeCacheKey(source, id);
    const cached = this.episodeCache.get(cacheKey);
    
    if (cached && cached[episodeIndex]) {
      return cached[episodeIndex].isAd;
    }

    return false;
  }

  /**
   * 获取广告统计信息
   */
  getAdStats(source: string, id: string): {
    total: number;
    adCount: number;
    adPercentage: number;
  } {
    const cacheKey = this.getEpisodeCacheKey(source, id);
    const cached = this.episodeCache.get(cacheKey);
    
    if (!cached) {
      return { total: 0, adCount: 0, adPercentage: 0 };
    }

    const adCount = cached.filter(e => e.isAd).length;
    return {
      total: cached.length,
      adCount,
      adPercentage: cached.length > 0 ? (adCount / cached.length) * 100 : 0,
    };
  }

  /**
   * 使缓存失效
   * @param source 可选的源名称
   * @param id 可选的资源 ID
   */
  invalidate(source?: string, id?: string): void {
    if (source && id) {
      const cacheKey = this.getEpisodeCacheKey(source, id);
      this.episodeCache.delete(cacheKey);
      logger.info(`剧集广告缓存已失效 ${source}:${id}`);
    } else {
      this.episodeCache.clear();
      logger.info('所有剧集广告缓存已失效');
    }
  }
}

/**
 * 广告过滤缓存管理器单例
 */
export const adFilterCache = new AdFilterCacheManager();
