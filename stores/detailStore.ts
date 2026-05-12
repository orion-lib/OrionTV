import { create } from "zustand";
import { SearchResult, api } from "@/services/api";
import { getResolutionFromM3U8 } from "@/services/m3u8";
import { useSettingsStore } from "@/stores/settingsStore";
import { FavoriteManager } from "@/services/storage";
import Logger from "@/utils/Logger";

const logger = Logger.withTag('DetailStore');

export type SearchResultWithResolution = SearchResult & { resolution?: string | null };

interface DetailState {
  q: string | null;
  searchResults: SearchResultWithResolution[];
  sources: { source: string; source_name: string; resolution: string | null | undefined }[];
  detail: SearchResultWithResolution | null;
  loading: boolean;
  error: string | null;
  allSourcesLoaded: boolean;
  controller: AbortController | null;
  isFavorited: boolean;
  failedSources: Set<string>; // 记录失败的source列表

  init: (q: string, preferredSource?: string, id?: string) => Promise<void>;
  setDetail: (detail: SearchResultWithResolution) => Promise<void>;
  abort: () => void;
  toggleFavorite: () => Promise<void>;
  markSourceAsFailed: (source: string, reason: string) => void;
  getNextAvailableSource: (currentSource: string, episodeIndex: number) => SearchResultWithResolution | null;
}

const useDetailStore = create<DetailState>((set, get) => ({
  q: null,
  searchResults: [],
  sources: [],
  detail: null,
  loading: true,
  error: null,
  allSourcesLoaded: false,
  controller: null,
  isFavorited: false,
  failedSources: new Set(),

  init: async (q, preferredSource, id) => {
    const perfStart = performance.now();
    logger.info(`[PERF] DetailStore.init START - q: ${q}, preferredSource: ${preferredSource}, id: ${id}`);
    
    const { controller: oldController } = get();
    if (oldController) {
      oldController.abort();
    }
    const newController = new AbortController();
    const signal = newController.signal;

    set({
      q,
      loading: true,
      searchResults: [],
      detail: null,
      error: null,
      allSourcesLoaded: false,
      controller: newController,
    });

    const { videoSource } = useSettingsStore.getState();

    const processAndSetResults = async (results: SearchResult[], merge = false) => {
      const resolutionStart = performance.now();
      logger.info(`[PERF] Resolution detection START - processing ${results.length} sources`);
      
      const resultsWithResolution = await Promise.all(
        results.map(async (searchResult) => {
          let resolution;
          const m3u8Start = performance.now();
          try {
            if (searchResult.episodes && searchResult.episodes.length > 0) {
              resolution = await getResolutionFromM3U8(searchResult.episodes[0], signal);
            }
          } catch (e) {
            if ((e as Error).name !== "AbortError") {
              logger.info(`Failed to get resolution for ${searchResult.source_name}`, e);
            }
          }
          const m3u8End = performance.now();
          logger.info(`[PERF] M3U8 resolution for ${searchResult.source_name}: ${(m3u8End - m3u8Start).toFixed(2)}ms (${resolution || 'failed'})`);
          return { ...searchResult, resolution };
        })
      );
      
      const resolutionEnd = performance.now();
      logger.info(`[PERF] Resolution detection COMPLETE - took ${(resolutionEnd - resolutionStart).toFixed(2)}ms`);

      if (signal.aborted) return;

      set((state) => {
        const existingSources = new Set(state.searchResults.map((r) => r.source));
        const newResults = resultsWithResolution.filter((r) => !existingSources.has(r.source));
        const finalResults = merge ? [...state.searchResults, ...newResults] : resultsWithResolution;

        return {
          searchResults: finalResults,
          sources: finalResults.map((r) => ({
            source: r.source,
            source_name: r.source_name,
            resolution: r.resolution,
          })),
          detail: state.detail ?? finalResults[0] ?? null,
        };
      });
    };

    try {
      // Optimization for favorite navigation
      if (preferredSource && id) {
        const searchPreferredStart = performance.now();
        logger.info(`[PERF] API searchVideo (preferred) START - source: ${preferredSource}, query: "${q}"`);
        
        let preferredResult: SearchResult[] = [];
        let preferredSearchError: any = null;
        
        try {
          const response = await api.searchVideo(q, preferredSource, signal);
          preferredResult = response.results;
        } catch (error) {
          preferredSearchError = error;
          logger.error(`[ERROR] API searchVideo (preferred) FAILED - source: ${preferredSource}, error:`, error);
        }
        
        const searchPreferredEnd = performance.now();
        logger.info(`[PERF] API searchVideo (preferred) END - took ${(searchPreferredEnd - searchPreferredStart).toFixed(2)}ms, results: ${preferredResult.length}, error: ${!!preferredSearchError}`);
        
        if (signal.aborted) return;
        
        // 检查preferred source结果
        if (preferredResult.length > 0) {
          logger.info(`[SUCCESS] Preferred source "${preferredSource}" found ${preferredResult.length} results for "${q}"`);
          await processAndSetResults(preferredResult, false);
          set({ loading: false });
        } else {
          // 降级策略：preferred source失败时立即尝试所有源
          if (preferredSearchError) {
            logger.warn(`[FALLBACK] Preferred source "${preferredSource}" failed with error, trying all sources immediately`);
          } else {
            logger.warn(`[FALLBACK] Preferred source "${preferredSource}" returned 0 results for "${q}", trying all sources immediately`);
          }
          
          // 立即尝试所有源，不再依赖后台搜索
          const fallbackStart = performance.now();
          logger.info(`[PERF] FALLBACK search (all sources) START - query: "${q}"`);
          
          try {
            const { results: allResults } = await api.searchVideos(q);
            const fallbackEnd = performance.now();
            logger.info(`[PERF] FALLBACK search END - took ${(fallbackEnd - fallbackStart).toFixed(2)}ms, total results: ${allResults.length}`);
            
            const filteredResults = allResults.filter(item => item.title === q);
            logger.info(`[FALLBACK] Filtered results: ${filteredResults.length} matches for "${q}"`);
            
            if (filteredResults.length > 0) {
              logger.info(`[SUCCESS] FALLBACK search found results, proceeding with ${filteredResults[0].source_name}`);
              await processAndSetResults(filteredResults, false);
              set({ loading: false });
            } else {
              logger.error(`[ERROR] FALLBACK search found no matching results for "${q}"`);
              set({ 
                error: `未找到 "${q}" 的播放源，请检查标题或稍后重试`,
                loading: false 
              });
            }
          } catch (fallbackError) {
            logger.error(`[ERROR] FALLBACK search FAILED:`, fallbackError);
            set({ 
              error: `搜索失败：${fallbackError instanceof Error ? fallbackError.message : '网络错误，请稍后重试'}`,
              loading: false 
            });
          }
        }
        
        // 后台搜索（如果preferred source成功的话）
        if (preferredResult.length > 0) {
          const searchAllStart = performance.now();
          logger.info(`[PERF] API searchVideos (background) START`);
          
          try {
            const { results: allResults } = await api.searchVideos(q);
            
            const searchAllEnd = performance.now();
            logger.info(`[PERF] API searchVideos (background) END - took ${(searchAllEnd - searchAllStart).toFixed(2)}ms, results: ${allResults.length}`);
            
            if (signal.aborted) return;
            await processAndSetResults(allResults.filter(item => item.title === q), true);
          } catch (backgroundError) {
            logger.warn(`[WARN] Background search failed, but preferred source already succeeded:`, backgroundError);
          }
        }
      } else {
        // 标准导航：先获取资源列表，然后逐个获取详情
        const resourcesStart = performance.now();
        logger.info(`[PERF] API getResources START - query: "${q}"`);
        
        try {
          const allResources = await api.getResources(signal);
          
          const resourcesEnd = performance.now();
          logger.info(`[PERF] API getResources END - took ${(resourcesEnd - resourcesStart).toFixed(2)}ms, resources: ${allResources.length}`);
          
          const enabledResources = videoSource.enabledAll
            ? allResources
            : allResources.filter((r) => videoSource.sources[r.key]);

          logger.info(`[PERF] Enabled resources: ${enabledResources.length}/${allResources.length}`);
          
          if (enabledResources.length === 0) {
            logger.error(`[ERROR] No enabled resources available for search`);
            set({ 
              error: "没有可用的视频源，请检查设置或联系管理员",
              loading: false 
            });
            return;
          }

          let firstResultFound = false;
          let totalResults = 0;
          const searchPromises = enabledResources.map(async (resource) => {
            try {
              const searchStart = performance.now();
              const { results } = await api.searchVideo(q, resource.key, signal);
              const searchEnd = performance.now();
              logger.info(`[PERF] API searchVideo (${resource.name}) took ${(searchEnd - searchStart).toFixed(2)}ms, results: ${results.length}`);
              
              if (results.length > 0) {
                totalResults += results.length;
                logger.info(`[SUCCESS] Source "${resource.name}" found ${results.length} results for "${q}"`);
                await processAndSetResults(results, true);
                if (!firstResultFound) {
                  set({ loading: false }); // Stop loading indicator on first result
                  firstResultFound = true;
                  logger.info(`[SUCCESS] First result found from "${resource.name}", stopping loading indicator`);
                }
              } else {
                logger.warn(`[WARN] Source "${resource.name}" returned 0 results for "${q}"`);
              }
            } catch (error) {
              logger.error(`[ERROR] Failed to fetch from ${resource.name}:`, error);
            }
          });

          await Promise.all(searchPromises);
          
          // 检查是否找到任何结果
          if (totalResults === 0) {
            logger.error(`[ERROR] All sources returned 0 results for "${q}"`);
            set({ 
              error: `未找到 "${q}" 的播放源，请尝试其他关键词或稍后重试`,
              loading: false 
            });
          } else {
            logger.info(`[SUCCESS] Standard search completed, total results: ${totalResults}`);
          }
        } catch (resourceError) {
          logger.error(`[ERROR] Failed to get resources:`, resourceError);
          set({ 
            error: `获取视频源失败：${resourceError instanceof Error ? resourceError.message : '网络错误，请稍后重试'}`,
            loading: false 
          });
          return;
        }
      }

      const favoriteCheckStart = performance.now();
      const finalState = get();
      
      // 最终检查：如果所有搜索都完成但仍然没有结果
      if (finalState.searchResults.length === 0 && !finalState.error) {
        logger.error(`[ERROR] All search attempts completed but no results found for "${q}"`);
        set({ error: `未找到 "${q}" 的播放源，请检查标题拼写或稍后重试` });
      } else if (finalState.searchResults.length > 0) {
        logger.info(`[SUCCESS] DetailStore.init completed successfully with ${finalState.searchResults.length} sources`);
      }

      if (finalState.detail) {
        const { source, id } = finalState.detail;
        logger.info(`[INFO] Checking favorite status for source: ${source}, id: ${id}`);
        try {
          const isFavorited = await FavoriteManager.isFavorited(source, id.toString());
          set({ isFavorited });
          logger.info(`[INFO] Favorite status: ${isFavorited}`);
        } catch (favoriteError) {
          logger.warn(`[WARN] Failed to check favorite status:`, favoriteError);
        }
      } else {
        logger.warn(`[WARN] No detail found after all search attempts for "${q}"`);
      }
      
      const favoriteCheckEnd = performance.now();
      logger.info(`[PERF] Favorite check took ${(favoriteCheckEnd - favoriteCheckStart).toFixed(2)}ms`);
      
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        logger.error(`[ERROR] DetailStore.init caught unexpected error:`, e);
        const errorMessage = e instanceof Error ? e.message : "获取数据失败";
        set({ error: `搜索失败：${errorMessage}` });
      } else {
        logger.info(`[INFO] DetailStore.init aborted by user`);
      }
    } finally {
      if (!signal.aborted) {
        set({ loading: false, allSourcesLoaded: true });
        logger.info(`[INFO] DetailStore.init cleanup completed`);
      }
      
      const perfEnd = performance.now();
      logger.info(`[PERF] DetailStore.init COMPLETE - total time: ${(perfEnd - perfStart).toFixed(2)}ms`);
    }
  },

  setDetail: async (detail) => {
    set({ detail });
    const { source, id } = detail;
    const isFavorited = await FavoriteManager.isFavorited(source, id.toString());
    set({ isFavorited });
  },

  abort: () => {
    get().controller?.abort();
  },

  toggleFavorite: async () => {
    const { detail } = get();
    if (!detail) return;

    const { source, id, title, poster, source_name, episodes, year } = detail;
    const favoriteItem = {
      cover: poster,
      title,
      poster,
      source_name,
      total_episodes: episodes.length,
      search_title: get().q!,
      year: year || "",
    };

    const newIsFavorited = await FavoriteManager.toggle(source, id.toString(), favoriteItem);
    set({ isFavorited: newIsFavorited });
  },

  markSourceAsFailed: (source: string, reason: string) => {
    const { failedSources } = get();
    const newFailedSources = new Set(failedSources);
    newFailedSources.add(source);
    
    logger.warn(`[SOURCE_FAILED] Marking source "${source}" as failed due to: ${reason}`);
    logger.info(`[SOURCE_FAILED] Total failed sources: ${newFailedSources.size}`);
    
    set({ failedSources: newFailedSources });
  },

  getNextAvailableSource: (currentSource: string, episodeIndex: number) => {
    const { searchResults, failedSources } = get();
    
    logger.info(`[SOURCE_SELECTION] Looking for alternative to "${currentSource}" for episode ${episodeIndex + 1}`);
    logger.info(`[SOURCE_SELECTION] Failed sources: [${Array.from(failedSources).join(', ')}]`);
    
    // 过滤掉当前source和已失败的sources
    const availableSources = searchResults.filter(result => 
      result.source !== currentSource && 
      !failedSources.has(result.source) &&
      result.episodes && 
      result.episodes.length > episodeIndex
    );
    
    logger.info(`[SOURCE_SELECTION] Available sources: ${availableSources.length}`);
    availableSources.forEach(source => {
      logger.info(`[SOURCE_SELECTION] - ${source.source} (${source.source_name}): ${source.episodes?.length || 0} episodes`);
    });
    
    if (availableSources.length === 0) {
      logger.error(`[SOURCE_SELECTION] No available sources for episode ${episodeIndex + 1}`);
      return null;
    }
    
    // 优先选择有高分辨率的source
    const sortedSources = availableSources.sort((a, b) => {
      const aResolution = a.resolution || '';
      const bResolution = b.resolution || '';
      
      // 优先级: 1080p > 720p > 其他 > 无分辨率
      const resolutionPriority = (res: string) => {
        if (res.includes('1080')) return 4;
        if (res.includes('720')) return 3;
        if (res.includes('480')) return 2;
        if (res.includes('360')) return 1;
        return 0;
      };
      
      return resolutionPriority(bResolution) - resolutionPriority(aResolution);
    });
    
    const selectedSource = sortedSources[0];
    logger.info(`[SOURCE_SELECTION] Selected fallback source: ${selectedSource.source} (${selectedSource.source_name}) with resolution: ${selectedSource.resolution || 'unknown'}`);
    
    return selectedSource;
  },
}));

export const sourcesSelector = (state: DetailState) => state.sources;
export default useDetailStore;
export const episodesSelectorBySource = (source: string) => (state: DetailState) =>
  state.searchResults.find((r) => r.source === source)?.episodes || [];
