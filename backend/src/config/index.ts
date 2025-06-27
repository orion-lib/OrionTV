import fs from "fs";
import path from "path";

export interface ApiSite {
  key: string;
  api: string;
  name: string;
  detail?: string;
}

export interface StorageConfig {
  type: "localstorage" | "database";
  database?: {
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    database?: string;
  };
}

export interface Config {
  cache_time?: number;
  api_site: {
    [key: string]: ApiSite;
  };
  storage?: StorageConfig;
}

export const API_CONFIG = {
  search: {
    path: "?ac=videolist&wd=",
    pagePath: "?ac=videolist&wd={query}&pg={page}",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      Accept: "application/json",
    },
  },
  detail: {
    path: "?ac=videolist&ids=",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      Accept: "application/json",
    },
  },
};

// Adjust path to read from project root, not from `backend/`
const configPath = path.join(process.cwd(), "config.json");
let cachedConfig: Config;

try {
  cachedConfig = JSON.parse(fs.readFileSync(configPath, "utf-8")) as Config;
} catch (error) {
  console.error(`Error reading or parsing config.json at ${configPath}`, error);
  // Provide a default fallback config to prevent crashes
  cachedConfig = {
    api_site: {},
    cache_time: 300,
  };
}

export function getConfig(): Config {
  return cachedConfig;
}

export function getCacheTime(): number {
  const config = getConfig();
  return config.cache_time || 300; // 默认5分钟缓存
}

export function getApiSites(): ApiSite[] {
  const config = getConfig();
  return Object.entries(config.api_site).map(([key, site]) => ({
    ...site,
    key,
  }));
}
