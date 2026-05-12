import Logger from '@/utils/Logger';
import { useSettingsStore } from '@/stores/settingsStore';

const logger = Logger.withTag('AdFilter');

/**
 * 默认广告关键词列表
 */
const DEFAULT_AD_KEYWORDS = [
  'sponsor',
  '/ad/',
  '/ads/',
  'advert',
  'advertisement',
  '/adjump',
  'redtraffic',
  'click',
  'vast',
  'ima.',
  'doubleclick',
  'googlesyndication',
  'googleadservices',
  'adnxs',
  'adsrvr',
  'adsystem',
  'adform',
  'criteo',
  'taboola',
  'outbrain',
  'mgid',
  'propeller',
  'revcontent',
];

/**
 * 默认广告域名列表
 */
const DEFAULT_AD_HOSTS = [
  'doubleclick.net',
  'googlesyndication.com',
  'googleadservices.com',
  'adnxs.com',
  'adsrvr.org',
  'adform.net',
  'criteo.com',
  'criteo.net',
  'taboola.com',
  'outbrain.com',
  'mgid.com',
  'propellerads.com',
  'revcontent.com',
  'moatads.com',
  'adsafeprotected.com',
  'adblade.com',
  'bidswitch.net',
  'casalemedia.com',
  'contextweb.com',
  'amazon-adsystem.com',
];

/**
 * 广告时长范围配置（秒）
 */
const AD_DURATION_RANGES = {
  min: 5,
  max: 60,
};

/**
 * 广告规则类型
 */
interface AdRule {
  type: 'keyword' | 'host' | 'duration' | 'regex';
  pattern: string;
  weight: number;
}

/**
 * 广告检测结果
 */
interface FilterResult {
  isAd: boolean;
  reason?: string;
  confidence: number;
}

/**
 * M3U8 解析后的片段信息
 */
interface ParsedM3U8Segment {
  url: string;
  duration: number;
  lineIndex: number;
}

/**
 * 缓存变量
 */
let cachedKeywords: string[] | null = null;
let cachedHosts: string[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 60000;

/**
 * 获取广告关键词列表（带缓存）
 */
const getAdKeywords = (): string[] => {
  if (cachedKeywords && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return cachedKeywords;
  }

  const customRules = useSettingsStore.getState().customAdRules;
  if (customRules && customRules.trim()) {
    if (customRules.includes('function')) {
      cachedKeywords = DEFAULT_AD_KEYWORDS;
      cacheTimestamp = Date.now();
      return cachedKeywords;
    }
    const lines = customRules.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    if (lines.length > 0) {
      cachedKeywords = lines;
      cacheTimestamp = Date.now();
      logger.info(`使用自定义广告关键词: ${lines.length} 条规则`);
      return cachedKeywords;
    }
  }
  cachedKeywords = DEFAULT_AD_KEYWORDS;
  cacheTimestamp = Date.now();
  return cachedKeywords;
};

/**
 * 获取广告域名列表（带缓存）
 */
const getAdHosts = (): string[] => {
  if (cachedHosts && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return cachedHosts;
  }
  cachedHosts = DEFAULT_AD_HOSTS;
  cacheTimestamp = Date.now();
  return cachedHosts;
};

/**
 * 解析 M3U8 内容，提取所有片段信息
 * @param m3u8Content M3U8 内容
 * @returns 片段数组
 */
export const parseM3U8Segments = (m3u8Content: string): ParsedM3U8Segment[] => {
  const segments: ParsedM3U8Segment[] = [];
  const lines = m3u8Content.split('\n');
  let currentDuration = 0;
  let currentUrl = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('#EXTINF:')) {
      const durationMatch = line.match(/#EXTINF:(\d+\.?\d*)/);
      if (durationMatch) {
        currentDuration = parseFloat(durationMatch[1]) || 0;
      }
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        if (nextLine && !nextLine.startsWith('#')) {
          currentUrl = nextLine;
          segments.push({
            url: currentUrl,
            duration: currentDuration,
            lineIndex: i,
          });
        }
      }
    }
  }

  return segments;
};

/**
 * 通过关键词检测 URL 是否为广告
 * @param url 待检测的 URL
 * @param keywords 可选的关键词列表
 * @returns 检测结果
 */
export const isAdByKeyword = (url: string, keywords?: string[]): FilterResult => {
  const searchKeywords = keywords || getAdKeywords();
  const lowerUrl = url.toLowerCase();

  for (const keyword of searchKeywords) {
    if (lowerUrl.includes(keyword.toLowerCase())) {
      return {
        isAd: true,
        reason: `关键词匹配: ${keyword}`,
        confidence: 0.9,
      };
    }
  }

  return { isAd: false, confidence: 0 };
};

/**
 * 通过域名检测 URL 是否为广告
 * @param url 待检测的 URL
 * @param hosts 可选的域名列表
 * @returns 检测结果
 */
export const isAdByHost = (url: string, hosts?: string[]): FilterResult => {
  const searchHosts = hosts || getAdHosts();

  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    for (const host of searchHosts) {
      if (hostname === host || hostname.endsWith('.' + host)) {
        return {
          isAd: true,
          reason: `广告域名: ${host}`,
          confidence: 0.95,
        };
      }
    }
  } catch {
    return { isAd: false, confidence: 0 };
  }

  return { isAd: false, confidence: 0 };
};

/**
 * 通过时长检测是否为可疑广告片段
 * @param duration 片段时长（秒）
 * @returns 检测结果
 */
export const isAdByDuration = (duration: number): FilterResult => {
  if (duration >= AD_DURATION_RANGES.min && duration <= AD_DURATION_RANGES.max) {
    return {
      isAd: true,
      reason: `可疑时长: ${duration}秒`,
      confidence: 0.5,
    };
  }
  return { isAd: false, confidence: 0 };
};

/**
 * 综合检测 URL 是否为广告（关键词 + 域名 + 时长）
 * @param url 待检测的 URL
 * @param duration 可选的片段时长
 * @returns 检测结果
 */
export const isAdSegment = (url: string, duration?: number): FilterResult => {
  const keywordResult = isAdByKeyword(url);
  if (keywordResult.isAd) {
    return keywordResult;
  }

  const hostResult = isAdByHost(url);
  if (hostResult.isAd) {
    return hostResult;
  }

  if (duration !== undefined) {
    const durationResult = isAdByDuration(duration);
    if (durationResult.isAd) {
      return durationResult;
    }
  }

  return { isAd: false, confidence: 0 };
};

/**
 * 批量检测多个 URL
 * @param urls URL 数组
 * @returns URL 到检测结果的 Map
 */
export const checkAdBatch = (urls: string[]): Map<string, FilterResult> => {
  const results = new Map<string, FilterResult>();
  const adKeywords = getAdKeywords();
  const adHosts = getAdHosts();

  for (const url of urls) {
    if (results.has(url)) continue;

    let isAd = false;
    let reason = '';
    let confidence = 0;

    const lowerUrl = url.toLowerCase();
    for (const keyword of adKeywords) {
      if (lowerUrl.includes(keyword.toLowerCase())) {
        isAd = true;
        reason = `关键词: ${keyword}`;
        confidence = 0.9;
        break;
      }
    }

    if (!isAd) {
      try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname.toLowerCase();
        for (const host of adHosts) {
          if (hostname === host || hostname.endsWith('.' + host)) {
            isAd = true;
            reason = `域名: ${host}`;
            confidence = 0.95;
            break;
          }
        }
      } catch {}
    }

    results.set(url, { isAd, reason, confidence });
  }

  return results;
};

/**
 * 获取所有广告集数的索引
 * @param episodes 剧集 URL 数组
 * @returns 广告集数的索引数组
 */
export const getAdEpisodeIndices = (episodes: string[]): number[] => {
  const adIndices: number[] = [];
  const batchResults = checkAdBatch(episodes);

  episodes.forEach((url, index) => {
    const result = batchResults.get(url);
    if (result?.isAd) {
      adIndices.push(index);
    }
  });

  return adIndices;
};

/**
 * 过滤掉广告剧集
 * @param episodes 剧集 URL 数组
 * @returns 过滤后的 URL 数组
 */
export const filterAdEpisodes = (episodes: string[]): string[] => {
  const batchResults = checkAdBatch(episodes);
  return episodes.filter(url => {
    const result = batchResults.get(url);
    return !result?.isAd;
  });
};

/**
 * 从 M3U8 内容中过滤广告片段
 * @param m3u8Content M3U8 内容
 * @param useAdvancedDetection 是否使用高级检测（综合多种策略）
 * @returns 过滤后的 M3U8 内容
 */
export const filterAdsFromM3U8 = (m3u8Content: string, useAdvancedDetection = false): string => {
  if (!m3u8Content) return '';

  const lines = m3u8Content.split('\n');
  const filteredLines: string[] = [];
  const adKeywords = getAdKeywords();
  const adHosts = getAdHosts();

  let i = 0;
  let totalFiltered = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.includes('#EXT-X-DISCONTINUITY')) {
      i++;
      continue;
    }

    if (line.includes('#EXTINF:')) {
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1];
        const durationMatch = line.match(/#EXTINF:(\d+\.?\d*)/);
        const duration = durationMatch ? parseFloat(durationMatch[1]) || 0 : 0;

        let isAd = false;
        let reason = '';

        if (useAdvancedDetection) {
          const result = isAdSegment(nextLine, duration);
          isAd = result.isAd;
          reason = result.reason || '';
        } else {
          const containsKeyword = adKeywords.some(keyword =>
            nextLine.toLowerCase().includes(keyword.toLowerCase())
          );
          if (containsKeyword) {
            isAd = true;
            reason = '关键词';
          }
        }

        if (!isAd && useAdvancedDetection) {
          try {
            const urlObj = new URL(nextLine);
            const hostname = urlObj.hostname.toLowerCase();
            const adHostMatch = adHosts.some(host =>
              hostname === host || hostname.endsWith('.' + host)
            );
            if (adHostMatch) {
              isAd = true;
              reason = '广告域名';
            }
          } catch {}
        }

        if (isAd) {
          totalFiltered++;
          logger.debug(`过滤广告片段: ${nextLine.substring(0, 80)}... (${reason})`);
          i += 2;
          continue;
        }
      }
    }

    filteredLines.push(line);
    i++;
  }

  if (totalFiltered > 0) {
    logger.info(`从 M3U8 中过滤了 ${totalFiltered} 个广告片段`);
  }

  return filteredLines.join('\n');
};

/**
 * 使用自定义代码过滤 M3U8 广告
 * @param m3u8Content M3U8 内容
 * @returns 过滤后的 M3U8 内容
 */
export const filterAdsFromM3U8WithCustomCode = (m3u8Content: string): string => {
  if (!m3u8Content) return '';

  const customRules = useSettingsStore.getState().customAdRules;
  if (!customRules || !customRules.includes('function')) {
    return filterAdsFromM3U8(m3u8Content, true);
  }

  try {
    const func = new Function('m3u8Content', customRules + '\nif (typeof filterAdsFromM3U8 === "function") { return filterAdsFromM3U8(m3u8Content); } else { throw new Error("Function filterAdsFromM3U8 not found"); }');
    const result = func(m3u8Content);
    logger.info('自定义广告过滤代码执行成功');
    return result;
  } catch (error) {
    logger.error('执行自定义广告过滤代码失败:', error);
    logger.info('降级使用默认过滤');
    return filterAdsFromM3U8(m3u8Content, true);
  }
};

/**
 * 获取智能过滤统计信息
 * @param m3u8Content M3U8 内容
 * @returns 统计信息
 */
export const getSmartFilterStats = (m3u8Content: string): {
  totalSegments: number;
  adSegments: number;
  normalSegments: number;
  estimatedAdDuration: number;
} => {
  if (!m3u8Content) return { totalSegments: 0, adSegments: 0, normalSegments: 0, estimatedAdDuration: 0 };

  const segments = parseM3U8Segments(m3u8Content);
  let adSegments = 0;
  let adDuration = 0;

  for (const segment of segments) {
    const result = isAdSegment(segment.url, segment.duration);
    if (result.isAd) {
      adSegments++;
      adDuration += segment.duration;
    }
  }

  return {
    totalSegments: segments.length,
    adSegments,
    normalSegments: segments.length - adSegments,
    estimatedAdDuration: adDuration,
  };
};

/**
 * 提取默认广告模式列表
 * @returns 广告关键词数组
 */
export const extractAdPatterns = (): string[] => {
  return [...DEFAULT_AD_KEYWORDS];
};

/**
 * 获取所有广告域名列表
 * @returns 广告域名数组
 */
export const getAllAdHosts = (): string[] => {
  return [...DEFAULT_AD_HOSTS];
};

/**
 * 添加自定义广告模式
 * @param pattern 广告关键词
 */
export const addCustomAdPattern = (pattern: string): void => {
  if (pattern && !DEFAULT_AD_KEYWORDS.includes(pattern)) {
    DEFAULT_AD_KEYWORDS.push(pattern);
    cachedKeywords = null;
    logger.info(`添加自定义广告模式: ${pattern}`);
  }
};

/**
 * 移除自定义广告模式
 * @param pattern 广告关键词
 */
export const removeCustomAdPattern = (pattern: string): void => {
  const index = DEFAULT_AD_KEYWORDS.indexOf(pattern);
  if (index > -1) {
    DEFAULT_AD_KEYWORDS.splice(index, 1);
    cachedKeywords = null;
    logger.info(`移除自定义广告模式: ${pattern}`);
  }
};

/**
 * 获取所有广告模式
 * @returns 广告关键词数组
 */
export const getAllAdPatterns = (): string[] => {
  return [...DEFAULT_AD_KEYWORDS];
};

/**
 * 重置广告模式为默认值
 */
export const resetAdPatterns = (): void => {
  DEFAULT_AD_KEYWORDS.length = 0;
  DEFAULT_AD_KEYWORDS.push(
    'sponsor',
    '/ad/',
    '/ads/',
    'advert',
    'advertisement',
    '/adjump',
    'redtraffic',
    'click',
    'vast',
    'ima.',
    'doubleclick',
    'googlesyndication',
    'googleadservices',
    'adnxs',
    'adsrvr',
    'adsystem',
    'adform',
    'criteo',
    'taboola',
    'outbrain',
    'mgid',
    'propeller',
    'revcontent'
  );
  cachedKeywords = null;
  logger.info('广告模式已重置为默认值');
};

/**
 * 清除过滤缓存
 */
export const clearFilterCache = (): void => {
  cachedKeywords = null;
  cachedHosts = null;
  cacheTimestamp = 0;
  logger.info('过滤缓存已清除');
};

/**
 * 获取默认广告规则（文本格式）
 * @returns 关键词列表（每行一个）
 */
export const getDefaultAdRules = (): string => {
  return DEFAULT_AD_KEYWORDS.join('\n');
};

/**
 * 获取默认广告域名列表（文本格式）
 * @returns 域名列表（每行一个）
 */
export const getDefaultAdHosts = (): string => {
  return DEFAULT_AD_HOSTS.join('\n');
};
