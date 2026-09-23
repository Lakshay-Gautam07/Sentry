import axios from 'axios';
import https from 'https';

const GDELT_DOC_URL = 'https://api.gdeltproject.org/api/v2/doc/doc';

// Dedicated HTTPS agent with keepAlive disabled to avoid socket hang-ups from GDELT closing connections
const httpsAgent = new https.Agent({
  keepAlive: false,
  timeout: 30000
});

// In-memory cache for news results: query -> { data: Array, timestamp: number }
const cache = new Map();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes cache

// Serialization queue & timestamp to enforce GDELT's 1-request-every-5-seconds rule
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL_MS = 6500; // 6.5 seconds safely exceeds the 5-second limit
let requestQueue = Promise.resolve();

/**
 * Helper to parse GDELT's seendate (e.g. "20260711T153000Z" or "20260711153000")
 * into a standard ISO 8601 string.
 */
function parseGdeltDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const match = dateStr.match(/^(\d{4})(\d{2})(\d{2})T?(\d{2})?(\d{2})?(\d{2})?Z?$/);
  if (match) {
    const [, year, month, day, hour = '00', min = '00', sec = '00'] = match;
    const iso = `${year}-${month}-${day}T${hour}:${min}:${sec}Z`;
    const d = new Date(iso);
    if (!isNaN(d.getTime())) return d.toISOString();
  }
  const d = new Date(dateStr);
  return !isNaN(d.getTime()) ? d.toISOString() : null;
}

/**
 * Schedule a call through the sequential 6.5-second rate limit queue.
 */
function scheduleRequest(fn) {
  const execute = async () => {
    const now = Date.now();
    const elapsed = now - lastRequestTime;
    if (elapsed < MIN_REQUEST_INTERVAL_MS) {
      const waitTime = MIN_REQUEST_INTERVAL_MS - elapsed;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
    lastRequestTime = Date.now();
    return fn();
  };

  requestQueue = requestQueue.then(execute, execute);
  return requestQueue;
}

/**
 * Clean and normalise an array of raw GDELT article objects.
 */
function normalizeArticles(rawArticles = []) {
  if (!Array.isArray(rawArticles)) return [];

  const seenUrls = new Set();
  const normalized = [];

  for (const item of rawArticles) {
    if (!item || !item.url || !item.title) continue;

    // Deduplicate by URL
    if (seenUrls.has(item.url)) continue;
    seenUrls.add(item.url);

    normalized.push({
      id: Buffer.from(item.url).toString('base64').slice(0, 32),
      title: item.title.trim(),
      source: item.domain || item.sourcecountry || 'News Source',
      publishedAt: parseGdeltDate(item.seendate),
      url: item.url,
      imageUrl: (item.socialimage && item.socialimage.startsWith('http')) ? item.socialimage : null,
      snippet: null,
      language: item.language || null,
      sourceCountry: item.sourcecountry || null
    });
  }

  return normalized;
}

/**
 * Internal worker to call GDELT API once with proper parameters and no socket reuse.
 */
async function callGdeltApi(query) {
  const response = await axios.get(GDELT_DOC_URL, {
    params: {
      query,
      mode: 'artlist',
      maxrecords: 10,
      format: 'json',
      sort: 'datedesc',
      timespan: '1month'
    },
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'User-Agent': 'Sentry-Travel-Intelligence/1.0',
      'Connection': 'close'
    },
    httpsAgent,
    timeout: 25000,
    validateStatus: () => true
  });

  return response;
}

/**
 * Fetch recent news articles for a destination from GDELT DOC 2.0 API.
 * Respects the 5-second rate limit, uses in-memory caching, and handles errors.
 *
 * @param {string} destination - Destination name (e.g. "Paris", "Manali")
 * @param {string} country - Country name (e.g. "France", "India")
 * @returns {Promise<{ articles: Array, fromCache: boolean, rateLimited?: boolean, error?: string }>}
 */
export async function fetchDestinationNews(destination, country = '') {
  const cleanDest = (destination || '').replace(/["']/g, '').trim();
  const cleanCountry = (country || '').replace(/["']/g, '').trim();

  if (!cleanDest) {
    return { articles: [], fromCache: false };
  }

  // Construct search query: e.g. '"Paris" France' or '"Manali" India'
  const query = cleanCountry && cleanCountry.toLowerCase() !== cleanDest.toLowerCase()
    ? `"${cleanDest}" ${cleanCountry}`
    : `"${cleanDest}"`;

  const cacheKey = query.toLowerCase();

  // 1. Check in-memory cache
  const cached = cache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    return { articles: cached.data, fromCache: true };
  }

  // 2. Schedule request through rate-limit queue
  try {
    const result = await scheduleRequest(async () => {
      let response;
      try {
        response = await callGdeltApi(query);
      } catch (reqErr) {
        console.warn(`[gdelt] Network error calling GDELT for "${query}":`, reqErr.message);
        if (cached) return { articles: cached.data, fromCache: true };
        return { articles: [], fromCache: false, error: reqErr.message };
      }

      // Check if GDELT returned rate limit
      const isRateLimited = response.status === 429 || (typeof response.data === 'string' && response.data.includes('Please limit requests'));
      if (isRateLimited) {
        console.warn(`[gdelt] Rate limit message for "${query}". Waiting 6.5s to retry once...`);
        await new Promise((resolve) => setTimeout(resolve, 6500));
        lastRequestTime = Date.now();
        try {
          response = await callGdeltApi(query);
        } catch (retryErr) {
          console.warn(`[gdelt] Retry failed for "${query}":`, retryErr.message);
        }
      }

      // If still rate limited after retry
      if (response && (response.status === 429 || (typeof response.data === 'string' && response.data.includes('Please limit requests')))) {
        console.warn(`[gdelt] Still rate limited after retry for query: ${query}`);
        if (cached) {
          return { articles: cached.data, fromCache: true, rateLimited: true };
        }
        return { articles: [], fromCache: false, rateLimited: true };
      }

      // Check for other non-200 responses
      if (!response || response.status !== 200) {
        const status = response ? response.status : 'NO_RESPONSE';
        console.error(`[gdelt] Non-200 status (${status}) from GDELT for query: ${query}`);
        if (cached) return { articles: cached.data, fromCache: true };
        return { articles: [], fromCache: false, error: `Provider returned status ${status}` };
      }

      let articles = [];
      if (response.data && Array.isArray(response.data.articles)) {
        articles = normalizeArticles(response.data.articles);
      } else if (typeof response.data === 'string') {
        try {
          const parsed = JSON.parse(response.data);
          if (Array.isArray(parsed.articles)) {
            articles = normalizeArticles(parsed.articles);
          }
        } catch {
          console.warn('[gdelt] Received non-JSON string response from GDELT');
        }
      }

      // Cache successful response (including empty results)
      cache.set(cacheKey, { data: articles, timestamp: Date.now() });

      return { articles, fromCache: false };
    });

    return result;
  } catch (error) {
    console.error(`[gdelt] Error fetching news for "${query}":`, error.message);
    if (cached) {
      return { articles: cached.data, fromCache: true };
    }
    return { articles: [], fromCache: false, error: error.message };
  }
}
