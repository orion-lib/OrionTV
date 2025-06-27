import fs from 'fs';
import path from 'path';

export interface ApiSite {
  key: string;
  api: string;
  name: string;
  detail?: string;
}

export interface StorageConfig {
  type: 'localstorage' | 'database';
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
    path: '?ac=videolist&wd=',
    pagePath: '?ac=videolist&wd={query}&pg={page}',
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      Accept: 'application/json',
    },
  },
  detail: {
    path: '?ac=videolist&ids=',
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      Accept: 'application/json',
    },
  },
};

// 在模块加载时立即读取配置文件并缓存到内存，后续调用直接返回缓存内容，避免重复文件 I/O
const configPath = path.join(process.cwd(), 'config.json');
const cachedConfig: Config = JSON.parse(
  fs.readFileSync(configPath, 'utf-8')
) as Config;

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
