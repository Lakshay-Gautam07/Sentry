export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  channelName: string;
  publishedAt: string | null;
  url: string;
  description: string | null;
}

export interface VideosResponse {
  success: boolean;
  destination: string;
  count: number;
  videos: YouTubeVideo[];
  quotaExceeded?: boolean;
  missingKey?: boolean;
  fromCache?: boolean;
  message?: string;
}
