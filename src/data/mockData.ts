import {Category, LiveChannel, VideoItem} from '../types';
import rawData from './mockData.json';

interface MockDataPayload {
  categories: Category[];
  videos: VideoItem[];
  liveChannels: LiveChannel[];
}

const data = rawData as MockDataPayload;

export const categories = data.categories;
export const videos = data.videos;
export const liveChannels = data.liveChannels;
