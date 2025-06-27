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

// You can add other shared types here
export interface VideoDetail {
  code: number;
  episodes: string[];
  detailUrl: string;
  videoInfo: {
    title: string;
    cover: string;
    desc: string;
    source_name: string;
    source: string;
    id: string;
    type?: string;
    year?: string;
    area?: string;
    director?: string;
    actor?: string;
    remarks?: string;
  };
}
