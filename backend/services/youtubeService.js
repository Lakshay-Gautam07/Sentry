import axios from 'axios';
import { config } from '../config/index.js';

const YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';

// In-memory cache for videos: query -> { data: Array, timestamp: number }
const cache = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour cache to strictly conserve API quota

/**
 * Clean HTML entities commonly present in YouTube video titles.
 */
function decodeHtmlEntities(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .trim();
}

/**
 * Fetch relevant travel videos for a destination using YouTube Data API v3.
 * Includes in-memory caching to avoid burning YouTube quota on repeat requests.
 *
 * @param {string} destination - Destination name (e.g. "Manali", "Paris")
 * @param {string} country - Country name (e.g. "India", "France")
 * @returns {Promise<{ videos: Array, count: number, fromCache: boolean, quotaExceeded?: boolean, missingKey?: boolean, error?: string }>}
 */
export async function fetchDestinationVideos(destination, country = '') {
  const apiKey = config.youtubeApiKey;

  if (!apiKey) {
    console.warn('[youtubeService] YOUTUBE_API_KEY is not configured in environment.');
    return {
      videos: [],
      count: 0,
      missingKey: true,
      fromCache: false,
      message: 'YouTube API key is not configured.'
    };
  }

  const cleanDest = (destination || '').replace(/["']/g, '').trim();
  const cleanCountry = (country || '').replace(/["']/g, '').trim();

  if (!cleanDest) {
    return { videos: [], count: 0, fromCache: false };
  }

  // Construct search query: e.g. "Manali India travel guide" or "Paris France travel guide"
  const searchQuery = cleanCountry && cleanCountry.toLowerCase() !== cleanDest.toLowerCase()
    ? `${cleanDest} ${cleanCountry} travel guide`
    : `${cleanDest} travel guide`;

  const cacheKey = searchQuery.toLowerCase();

  // 1. Check in-memory cache
  const cached = cache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    return { videos: cached.data, count: cached.data.length, fromCache: true };
  }

  // 2. Query YouTube Data API v3
  try {
    const response = await axios.get(YOUTUBE_SEARCH_URL, {
      params: {
        part: 'snippet',
        q: searchQuery,
        type: 'video',
        maxResults: 6,
        relevanceLanguage: 'en',
        key: apiKey
      },
      timeout: 10000,
      validateStatus: () => true
    });

    // Check for quota exceeded or other YouTube API errors
    if (response.status === 403) {
      const errorReason = response.data?.error?.errors?.[0]?.reason || '';
      console.warn('[youtubeService] YouTube API 403 response:', errorReason || response.data?.error?.message);
      if (errorReason === 'quotaExceeded' || errorReason === 'dailyLimitExceeded') {
        return {
          videos: cached?.data || [],
          count: cached?.data?.length || 0,
          fromCache: !!cached,
          quotaExceeded: true,
          message: 'YouTube daily API quota reached. Please check back later.'
        };
      }
      return {
        videos: cached?.data || [],
        count: cached?.data?.length || 0,
        fromCache: !!cached,
        error: response.data?.error?.message || 'YouTube service permission error.'
      };
    }

    if (response.status !== 200) {
      console.error(`[youtubeService] Unexpected status ${response.status} from YouTube:`, response.data?.error?.message);
      if (cached) return { videos: cached.data, count: cached.data.length, fromCache: true };
      return {
        videos: [],
        count: 0,
        fromCache: false,
        error: response.data?.error?.message || 'Failed to fetch videos from YouTube.'
      };
    }

    const items = response.data?.items || [];
    const normalized = [];

    for (const item of items) {
      const videoId = item.id?.videoId;
      if (!videoId) continue;

      const snippet = item.snippet || {};
      const thumbnails = snippet.thumbnails || {};
      const thumbUrl = thumbnails.high?.url || thumbnails.medium?.url || thumbnails.default?.url || '';

      normalized.push({
        id: videoId,
        title: decodeHtmlEntities(snippet.title),
        thumbnail: thumbUrl,
        channelName: decodeHtmlEntities(snippet.channelTitle),
        publishedAt: snippet.publishedAt || null,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        description: snippet.description || null
      });
    }

    // Cache the result
    cache.set(cacheKey, { data: normalized, timestamp: Date.now() });

    return {
      videos: normalized,
      count: normalized.length,
      fromCache: false
    };
  } catch (err) {
    console.error(`[youtubeService] Network error fetching videos for "${searchQuery}":`, err.message);
    if (cached) {
      return { videos: cached.data, count: cached.data.length, fromCache: true };
    }
    return {
      videos: [],
      count: 0,
      fromCache: false,
      error: 'Unable to connect to YouTube service.'
    };
  }
}
