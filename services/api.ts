// MoonTV API 服务
export interface DoubanItem {
  title: string;
  poster: string;
  rate?: string;
}

export interface DoubanResponse {
  code: number;
  message: string;
  list: DoubanItem[];
}

export interface VideoDetail {
  code: number;
  episodes: string[];
  detailUrl: string;
  videoInfo: {
    title: string;
    cover?: string;
    desc?: string;
    type?: string;
    year?: string;
    area?: string;
    director?: string;
    actor?: string;
    remarks?: string;
    source_name: string;
    source: string;
    id: string;
  };
}

export interface SearchResult {
  id: string;
  title: string;
  poster: string;
  episodes: string[];
  source: string;
  source_name: string;
  class?: string;
  year: string;
  desc?: string;
  type_name?: string;
}

// Data structure for play records
export interface PlayRecord {
  title: string;
  source_name: string;
  cover: string;
  index: number; // Episode number
  total_episodes: number; // Total number of episodes
  play_time: number; // Play progress in seconds
  total_time: number; // Total duration in seconds
  save_time: number; // Timestamp of when the record was saved
  user_id: number; // User ID, always 0 in this version
}

export class MoonTVAPI {
  private baseURL: string;

  constructor(baseURL: string) {
    if (!baseURL) {
      console.warn(
        "MoonTVAPI base URL not set. Please configure it for your network."
      );
    }
    this.baseURL = baseURL;
  }

  /**
   * 生成图片代理 URL
   */
  getImageProxyUrl(imageUrl: string): string {
    return `${this.baseURL}/api/image-proxy?url=${encodeURIComponent(
      imageUrl
    )}`;
  }

  /**
   * 获取豆瓣数据
   */
  async getDoubanData(
    type: "movie" | "tv",
    tag: string,
    pageSize: number = 16,
    pageStart: number = 0
  ): Promise<DoubanResponse> {
    const url = `${
      this.baseURL
    }/api/douban?type=${type}&tag=${encodeURIComponent(
      tag
    )}&pageSize=${pageSize}&pageStart=${pageStart}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }

  /**
   * 搜索视频
   */
  async searchVideos(query: string): Promise<{ results: SearchResult[] }> {
    const url = `${this.baseURL}/api/search?q=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }

  /**
   * 获取视频详情
   */
  async getVideoDetail(source: string, id: string): Promise<VideoDetail> {
    const url = `${this.baseURL}/api/detail?source=${source}&id=${id}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }

  /**
   * 登录
   */
  async login(password: string): Promise<{ ok: boolean; error?: string }> {
    const url = `${this.baseURL}/api/login`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    return response.json();
  }

  /**
   * 获取所有播放记录
   */
  async getPlayRecords(): Promise<Record<string, PlayRecord>> {
    const url = `${this.baseURL}/api/playrecords`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }

  /**
   * 保存播放记录
   */
  async savePlayRecord(
    key: string,
    record: PlayRecord
  ): Promise<{ success: boolean }> {
    const url = `${this.baseURL}/api/playrecords`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, record }),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }
}

// 默认实例
export const moonTVApi = new MoonTVAPI();

// 生成模拟数据的辅助函数
export const generateMockDoubanData = (count: number = 20): DoubanItem[] => {
  const movieTitles = [
    "肖申克的救赎",
    "霸王别姬",
    "阿甘正传",
    "泰坦尼克号",
    "这个杀手不太冷",
    "千与千寻",
    "美丽人生",
    "辛德勒的名单",
    "星际穿越",
    "盗梦空间",
    "忠犬八公的故事",
    "教父",
    "龙猫",
    "当幸福来敲门",
    "三傻大闹宝莱坞",
    "机器人总动员",
    "放牛班的春天",
    "无间道",
    "楚门的世界",
    "大话西游之大圣娶亲",
  ];

  return Array.from(
    { length: Math.min(count, movieTitles.length) },
    (_, index) => ({
      title: movieTitles[index] || `影片 ${index + 1}`,
      poster: `https://picsum.photos/160/240?random=${index}`,
      rate: (Math.random() * 3 + 7).toFixed(1),
    })
  );
};

export const generateMockSearchResults = (
  query: string,
  count: number = 20
): SearchResult[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: `${index + 1}`,
    title: `搜索结果：${query} ${index + 1}`,
    poster: `https://picsum.photos/160/240?random=${index + 100}`,
    episodes: [`第1集`, `第2集`, `第3集`],
    source: "mock",
    source_name: "模拟源",
    year: (2020 + Math.floor(Math.random() * 4)).toString(),
    desc: `这是关于 ${query} 的搜索结果 ${index + 1}`,
    type_name: Math.random() > 0.5 ? "电影" : "电视剧",
  }));
};
