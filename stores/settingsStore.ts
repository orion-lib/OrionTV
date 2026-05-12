import { create } from "zustand";
import { SettingsManager } from "@/services/storage";
import { api, ServerConfig } from "@/services/api";
import { storageConfig } from "@/services/storageConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Logger from "@/utils/Logger";
import useAuthStore from "./authStore";
import { adFilterCache } from "@/services/adFilterCache";
import { clearFilterCache } from "@/services/adFilter";

const logger = Logger.withTag('SettingsStore');

interface SettingsState {
  apiBaseUrl: string;
  m3uUrl: string;
  remoteInputEnabled: boolean;
  removeAds: boolean;
  customAdRules: string;
  videoSource: {
    enabledAll: boolean;
    sources: {
      [key: string]: boolean;
    };
  };
  isModalVisible: boolean;
  serverConfig: ServerConfig | null;
  serverConfigError: string | null;
  isLoadingServerConfig: boolean;
  username: string;
  password: string;
  loadSettings: () => Promise<void>;
  fetchServerConfig: () => Promise<void>;
  setApiBaseUrl: (url: string) => void;
  setM3uUrl: (url: string) => void;
  setUsername: (username: string) => void;
  setPassword: (password: string) => void;
  setRemoteInputEnabled: (enabled: boolean) => void;
  setRemoveAds: (enabled: boolean) => void;
  setCustomAdRules: (rules: string) => void;
  saveSettings: () => Promise<void>;
  setVideoSource: (config: { enabledAll: boolean; sources: { [key: string]: boolean } }) => void;  
  showModal: () => void;
  hideModal: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  apiBaseUrl: "",
  m3uUrl: "",
  remoteInputEnabled: false,
  removeAds: true,
  customAdRules: "",
  isModalVisible: false,
  serverConfig: null,
  serverConfigError: null,
  isLoadingServerConfig: false,
  username: "",
  password: "",
  videoSource: {
    enabledAll: true,
    sources: {},
  },
  loadSettings: async () => {
    const settings = await SettingsManager.get();
    set({
      apiBaseUrl: settings.apiBaseUrl,
      m3uUrl: settings.m3uUrl,
      remoteInputEnabled: settings.remoteInputEnabled || false,
      removeAds: settings.removeAds !== undefined ? settings.removeAds : true,
      customAdRules: settings.customAdRules || "",
      username: settings.username || "",
      password: settings.password || "",
      videoSource: settings.videoSource || {
        enabledAll: true,
        sources: {},
      },
      serverConfig: null,
      serverConfigError: null,
    });
    if (settings.apiBaseUrl) {
      api.setBaseUrl(settings.apiBaseUrl);
      await get().fetchServerConfig();
    }
  },
  fetchServerConfig: async () => {
    set({ isLoadingServerConfig: true, serverConfigError: null });
    try {
      const config = await api.getServerConfig();
      if (config && config.SiteName) {
        storageConfig.setStorageType(config.StorageType);
        set({ serverConfig: config, serverConfigError: null });
      } else {
        set({ serverConfig: null, serverConfigError: '服务器返回了无效的配置信息' });
      }
    } catch (error: any) {
      let errorMessage = '无法获取服务器配置';
      if (error instanceof Error) {
        switch (error.message) {
          case 'API_URL_NOT_SET':
            errorMessage = 'API地址未设置';
            break;
          case 'UNAUTHORIZED':
            errorMessage = '服务器认证失败';
            break;
          default:
            if (error.message.includes('Network')) {
              errorMessage = '网络连接失败，请检查网络或服务器地址';
            } else if (error.message.includes('timeout')) {
              errorMessage = '连接超时，请检查服务器地址';
            } else if (error.message.includes('404')) {
              errorMessage = '服务器配置接口不存在，请检查服务器版本';
            } else if (error.message.includes('500')) {
              errorMessage = '服务器内部错误';
            }
            break;
        }
      }
      set({ serverConfig: null, serverConfigError: errorMessage });
      logger.error("Failed to fetch server config:", error);
    } finally {
      set({ isLoadingServerConfig: false });
    }
  },
  setApiBaseUrl: (url) => set({ apiBaseUrl: url }),
  setM3uUrl: (url) => set({ m3uUrl: url }),
  setUsername: (username) => set({ username }),
  setPassword: (password) => set({ password }),
  setRemoteInputEnabled: (enabled) => set({ remoteInputEnabled: enabled }),
  setRemoveAds: (enabled) => {
    logger.info(`[AD_FILTER] 去广告设置已更改: ${enabled}`);
    adFilterCache.clear();
    clearFilterCache();
    set({ removeAds: enabled });
  },
  setCustomAdRules: (rules) => {
    logger.info(`[AD_FILTER] 自定义广告规则已更改，正在清除缓存`);
    adFilterCache.clear();
    clearFilterCache();
    set({ customAdRules: rules });
  },
  setVideoSource: (config) => set({ videoSource: config }),
  saveSettings: async () => {
    const { apiBaseUrl, m3uUrl, remoteInputEnabled, removeAds, customAdRules, videoSource, username, password } = get();
    const currentSettings = await SettingsManager.get()
    const currentApiBaseUrl = currentSettings.apiBaseUrl;
    let processedApiBaseUrl = apiBaseUrl.trim();
    if (processedApiBaseUrl.endsWith("/")) {
      processedApiBaseUrl = processedApiBaseUrl.slice(0, -1);
    }

    if (!/^https?:\/\//i.test(processedApiBaseUrl)) {
      const hostPart = processedApiBaseUrl.split("/")[0];
      // 简单检查是否为 IP 地址格式
      const isIpAddress = /^((\d{1,3}\.){3}\d{1,3})(:\d+)?$/.test(hostPart);
      // 检查域名是否包含端口
      const hasPort = /:\d+/.test(hostPart);

      if (isIpAddress || hasPort) {
        processedApiBaseUrl = "http://" + processedApiBaseUrl;
      } else {
        processedApiBaseUrl = "https://" + processedApiBaseUrl;
      }
    }

    await SettingsManager.save({
      apiBaseUrl: processedApiBaseUrl,
      m3uUrl,
      remoteInputEnabled,
      removeAds,
      customAdRules,
      videoSource,
      username,
      password,
    });
    if ( currentApiBaseUrl !== processedApiBaseUrl) {
      await AsyncStorage.setItem('authCookies', '');
    }
    api.setBaseUrl(processedApiBaseUrl);
    // 同时更新状态中的 URL，使输入框显示处理后的 URL
    set({ isModalVisible: false, apiBaseUrl: processedApiBaseUrl, serverConfigError: null });
    
    try {
      await get().fetchServerConfig();
    } catch (configError) {
      logger.warn("获取服务器配置失败，继续执行:", configError);
    }

    // 保存设置后立即触发登录状态检查，确保登录框能正确弹出
    if (processedApiBaseUrl) {
      const { username, password } = get();
      // 如果有用户名和密码，执行完整登录检查
      if (username && password) {
        useAuthStore.getState().checkLoginStatus(processedApiBaseUrl);
      } else {
        // 没有凭据时，直接显示登录框让用户输入
        useAuthStore.getState().showLoginModal();
      }
    }
  },
  showModal: () => set({ isModalVisible: true }),
  hideModal: () => set({ isModalVisible: false }),
}));
