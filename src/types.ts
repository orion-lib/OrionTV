export type DeviceType = 'tv' | 'mobile' | 'tablet';

export interface Category {
  id: string;
  title: string;
  description?: string;
}

export interface VideoItem {
  id: string;
  title: string;
  year: string;
  poster: string;
  description: string;
  duration: string;
  categoryId: string;
  tags: string[];
  source: string;
}

export interface LiveChannel {
  id: string;
  title: string;
  poster: string;
  url: string;
  category: string;
  description?: string;
}

export interface AppPreferences {
  autoplayNext: boolean;
  keepScreenOn: boolean;
}
