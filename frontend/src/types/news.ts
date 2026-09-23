export interface NewsArticle {
  id: string;
  title: string;
  source: string;
  publishedAt: string | null;
  url: string;
  imageUrl: string | null;
  snippet: string | null;
  language: string | null;
  sourceCountry: string | null;
}

export interface NewsResponse {
  success: boolean;
  destination: string;
  count: number;
  articles: NewsArticle[];
  fromCache: boolean;
  rateLimited?: boolean;
  error?: string | null;
  message?: string;
}
