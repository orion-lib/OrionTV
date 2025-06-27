import AsyncStorage from "@react-native-async-storage/async-storage";
import { PlayRecord as ApiPlayRecord } from "./api"; // Use a consistent type

// --- Storage Keys ---
const STORAGE_KEYS = {
  FAVORITES: "mytv_favorites",
  PLAY_RECORDS: "mytv_play_records",
  SEARCH_HISTORY: "mytv_search_history",
  SETTINGS: "mytv_settings",
} as const;

// --- Type Definitions (aligned with api.ts) ---
export type PlayRecord = ApiPlayRecord;

export interface FavoriteItem {
  id: string;
  source: string;
  title: string;
  poster: string;
  source_name: string;
  save_time: number;
}

export interface AppSettings {
  theme: "light" | "dark" | "auto";
  autoPlay: boolean;
  playbackSpeed: number;
}

// --- Helper ---
const generateKey = (source: string, id: string) => `${source}+${id}`;

// --- FavoriteManager ---
export class FavoriteManager {
  static async getAll(): Promise<Record<string, FavoriteItem>> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error("Failed to get favorites:", error);
      return {};
    }
  }

  static async save(
    source: string,
    id: string,
    item: Omit<FavoriteItem, "id" | "source" | "save_time">
  ): Promise<void> {
    const favorites = await this.getAll();
    const key = generateKey(source, id);
    favorites[key] = { ...item, id, source, save_time: Date.now() };
    await AsyncStorage.setItem(
      STORAGE_KEYS.FAVORITES,
      JSON.stringify(favorites)
    );
  }

  static async remove(source: string, id: string): Promise<void> {
    const favorites = await this.getAll();
    const key = generateKey(source, id);
    delete favorites[key];
    await AsyncStorage.setItem(
      STORAGE_KEYS.FAVORITES,
      JSON.stringify(favorites)
    );
  }

  static async isFavorited(source: string, id: string): Promise<boolean> {
    const favorites = await this.getAll();
    return generateKey(source, id) in favorites;
  }

  static async toggle(
    source: string,
    id: string,
    item: Omit<FavoriteItem, "id" | "source" | "save_time">
  ): Promise<boolean> {
    const isFav = await this.isFavorited(source, id);
    if (isFav) {
      await this.remove(source, id);
      return false;
    } else {
      await this.save(source, id, item);
      return true;
    }
  }

  static async clearAll(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.FAVORITES);
  }
}

// --- PlayRecordManager ---
export class PlayRecordManager {
  static async getAll(): Promise<Record<string, PlayRecord>> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PLAY_RECORDS);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error("Failed to get play records:", error);
      return {};
    }
  }

  static async save(
    source: string,
    id: string,
    record: Omit<PlayRecord, "user_id" | "save_time">
  ): Promise<void> {
    const records = await this.getAll();
    const key = generateKey(source, id);
    records[key] = { ...record, user_id: 0, save_time: Date.now() };
    await AsyncStorage.setItem(
      STORAGE_KEYS.PLAY_RECORDS,
      JSON.stringify(records)
    );
  }

  static async get(source: string, id: string): Promise<PlayRecord | null> {
    const records = await this.getAll();
    return records[generateKey(source, id)] || null;
  }

  static async remove(source: string, id: string): Promise<void> {
    const records = await this.getAll();
    delete records[generateKey(source, id)];
    await AsyncStorage.setItem(
      STORAGE_KEYS.PLAY_RECORDS,
      JSON.stringify(records)
    );
  }

  static async clearAll(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.PLAY_RECORDS);
  }
}

// --- SearchHistoryManager ---
const SEARCH_HISTORY_LIMIT = 20;

export class SearchHistoryManager {
  static async get(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Failed to get search history:", error);
      return [];
    }
  }

  static async add(keyword: string): Promise<void> {
    const trimmed = keyword.trim();
    if (!trimmed) return;

    const history = await this.get();
    const newHistory = [trimmed, ...history.filter((k) => k !== trimmed)];
    if (newHistory.length > SEARCH_HISTORY_LIMIT) {
      newHistory.length = SEARCH_HISTORY_LIMIT;
    }
    await AsyncStorage.setItem(
      STORAGE_KEYS.SEARCH_HISTORY,
      JSON.stringify(newHistory)
    );
  }

  static async clear(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.SEARCH_HISTORY);
  }
}

// --- SettingsManager ---
export class SettingsManager {
  static async get(): Promise<AppSettings> {
    const defaultSettings: AppSettings = {
      theme: "auto",
      autoPlay: true,
      playbackSpeed: 1.0,
    };
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data
        ? { ...defaultSettings, ...JSON.parse(data) }
        : defaultSettings;
    } catch (error) {
      console.error("Failed to get settings:", error);
      return defaultSettings;
    }
  }

  static async save(settings: Partial<AppSettings>): Promise<void> {
    const currentSettings = await this.get();
    const updatedSettings = { ...currentSettings, ...settings };
    await AsyncStorage.setItem(
      STORAGE_KEYS.SETTINGS,
      JSON.stringify(updatedSettings)
    );
  }

  static async reset(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.SETTINGS);
  }
}
