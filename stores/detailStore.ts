import { create } from "zustand";
import { SearchResult, api } from "@/services/api";
import { getResolutionFromM3U8 } from "@/services/m3u8";
import { useSettingsStore } from "@/stores/settingsStore";
import { FavoriteManager } from "@/services/storage";

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

  init: (q: string, preferredSource?: string, id?: string) => Promise<void>;
  setDetail: (detail: SearchResultWithResolution) => void;
  abort: () => void;
  toggleFavorite: () => Promise<void>;
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

  init: async (q, preferredSource, id) => {
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
      const resultsWithResolution = await Promise.all(
        results.map(async (searchResult) => {
          let resolution;
          try {
            if (searchResult.episodes && searchResult.episodes.length > 0) {
              resolution = await getResolutionFromM3U8(searchResult.episodes[0], signal);
            }
          } catch (e) {
            if ((e as Error).name !== "AbortError") {
              console.info(`Failed to get resolution for ${searchResult.source_name}`, e);
            }
          }
          return { ...searchResult, resolution };
        })
      );

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
        const { results: preferredResult } = await api.searchVideo(q, preferredSource, signal);
        if (signal.aborted) return;
        if (preferredResult.length > 0) {
          await processAndSetResults(preferredResult, false);
          set({ loading: false });
        }
        // Then load all others in background
        const { results: allResults } = await api.searchVideos(q);
        if (signal.aborted) return;
        await processAndSetResults(allResults, true);
      } else {
        // Standard navigation: fetch resources, then fetch details one by one
        const allResources = await api.getResources(signal);
        const enabledResources = videoSource.enabledAll
          ? allResources
          : allResources.filter((r) => videoSource.sources[r.key]);

        let firstResultFound = false;
        const searchPromises = enabledResources.map(async (resource) => {
          try {
            const { results } = await api.searchVideo(q, resource.key, signal);
            if (results.length > 0) {
              await processAndSetResults(results, true);
              if (!firstResultFound) {
                set({ loading: false }); // Stop loading indicator on first result
                firstResultFound = true;
              }
            }
          } catch (error) {
            console.info(`Failed to fetch from ${resource.name}:`, error);
          }
        });

        await Promise.all(searchPromises);
      }

      if (get().searchResults.length === 0) {
        set({ error: "未找到任何播放源" });
      }

      if (get().detail) {
        const { source, id } = get().detail!;
        const isFavorited = await FavoriteManager.isFavorited(source, id.toString());
        set({ isFavorited });
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        set({ error: e instanceof Error ? e.message : "获取数据失败" });
      }
    } finally {
      if (!signal.aborted) {
        set({ loading: false, allSourcesLoaded: true });
      }
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
}));

export const sourcesSelector = (state: DetailState) => state.sources;
export default useDetailStore;
export const episodesSelectorBySource = (source: string) => (state: DetailState) =>
  state.searchResults.find((r) => r.source === source)?.episodes || [];
