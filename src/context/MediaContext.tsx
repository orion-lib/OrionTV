import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AppPreferences, LiveChannel, VideoItem} from '../types';
import {categories, liveChannels, videos} from '../data/mockData';

const FAVORITES_KEY = '@rntv/favorites';
const PREFERENCES_KEY = '@rntv/preferences';

interface MediaContextValue {
  categories: typeof categories;
  videos: VideoItem[];
  liveChannels: LiveChannel[];
  favorites: string[];
  preferences: AppPreferences;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  getVideoById: (id: string) => VideoItem | undefined;
  updatePreferences: (value: Partial<AppPreferences>) => void;
  clearFavorites: () => void;
}

const defaultPreferences: AppPreferences = {
  autoplayNext: true,
  keepScreenOn: true,
  player: 'media3',
};

const MediaContext = createContext<MediaContextValue | undefined>(undefined);

export const MediaProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [preferences, setPreferences] =
    useState<AppPreferences>(defaultPreferences);

  useEffect(() => {
    const load = async () => {
      const storedFavorites = await AsyncStorage.getItem(FAVORITES_KEY);
      const storedPrefs = await AsyncStorage.getItem(PREFERENCES_KEY);
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
      if (storedPrefs) {
        setPreferences({...defaultPreferences, ...JSON.parse(storedPrefs)});
      }
    };
    load();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  }, [preferences]);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    );
  }, []);

  const isFavorite = useCallback(
    (id: string) => favorites.includes(id),
    [favorites],
  );

  const getVideoById = useCallback(
    (id: string) => videos.find(v => v.id === id),
    [],
  );

  const updatePreferences = useCallback((value: Partial<AppPreferences>) => {
    setPreferences(prev => ({...prev, ...value}));
  }, []);

  const clearFavorites = useCallback(() => setFavorites([]), []);

  const value = useMemo(
    () => ({
      categories,
      videos,
      liveChannels,
      favorites,
      preferences,
      toggleFavorite,
      isFavorite,
      getVideoById,
      updatePreferences,
      clearFavorites,
    }),
    [
      favorites,
      preferences,
      toggleFavorite,
      isFavorite,
      getVideoById,
      updatePreferences,
      clearFavorites,
    ],
  );

  return (
    <MediaContext.Provider value={value}>{children}</MediaContext.Provider>
  );
};

export const useMedia = () => {
  const ctx = useContext(MediaContext);
  if (!ctx) {
    throw new Error('useMedia must be used inside MediaProvider');
  }
  return ctx;
};
