import {Category, LiveChannel, VideoItem} from '../types';

export const categories: Category[] = [
  {id: 'featured', title: '推荐'},
  {id: 'movie', title: '电影'},
  {id: 'tv', title: '剧集'},
  {id: 'animation', title: '动漫'},
  {id: 'live', title: '直播'},
];

export const videos: VideoItem[] = [
  {
    id: '1',
    title: '行星猎人',
    year: '2024',
    poster:
      'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?auto=format&fit=crop&w=800&q=80',
    description:
      '硬核科幻大片，讲述探索者号船员在未知星系遭遇危机的故事。',
    duration: '132 min',
    categoryId: 'movie',
    tags: ['科幻', '冒险'],
    source: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  },
  {
    id: '2',
    title: '无垠地平线',
    year: '2023',
    poster:
      'https://images.unsplash.com/photo-1525182008055-f88b95ff7980?auto=format&fit=crop&w=800&q=80',
    description: '极简悬疑剧集，聚焦太空站内的心理博弈与权力游戏。',
    duration: '46 min/集',
    categoryId: 'tv',
    tags: ['悬疑', '太空'],
    source: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  },
  {
    id: '3',
    title: '霓虹追光',
    year: '2022',
    poster:
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
    description: '赛博朋克题材动作片，重磅打斗与城市追逐场面。',
    duration: '118 min',
    categoryId: 'movie',
    tags: ['动作', '赛博朋克'],
    source: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  },
  {
    id: '4',
    title: '夏日纸飞机',
    year: '2023',
    poster:
      'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80',
    description: '温情向日常动画，讲述青春与梦想的轻松故事。',
    duration: '24 min/集',
    categoryId: 'animation',
    tags: ['日常', '治愈'],
    source: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  },
  {
    id: '5',
    title: '夜航者',
    year: '2024',
    poster:
      'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=800&q=80',
    description: '以新闻采访为主线的纪录片风格剧集，真实记录灾难现场。',
    duration: '52 min/集',
    categoryId: 'tv',
    tags: ['纪录', '现实'],
    source: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  },
];

export const liveChannels: LiveChannel[] = [
  {
    id: 'live-1',
    title: '探索地球 HD',
    category: '纪录',
    poster:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    description: '全天候自然与地理探索频道。',
  },
  {
    id: 'live-2',
    title: '科幻频道 4K',
    category: '电影',
    poster:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    description: '连续播出经典与新番科幻影片。',
  },
];
