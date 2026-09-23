import axios from 'axios';

const WIKIMEDIA_COMMONS_API = 'https://commons.wikimedia.org/w/api.php';

// In-memory cache for images: query -> { data: Array, timestamp: number }
const cache = new Map();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes cache

/**
 * Strip HTML tags and entities from string.
 */
function stripHtml(html) {
  if (!html || typeof html !== 'string') return null;
  const stripped = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim();
  return stripped || null;
}

/**
 * Clean a Wikimedia file title (e.g. "File:Paris - Eiffelturm und Marsfeld2.jpg" -> "Paris - Eiffelturm und Marsfeld2")
 */
function cleanTitle(rawTitle) {
  if (!rawTitle) return 'Untitled Photo';
  let title = rawTitle.replace(/^File:/i, '');
  // Remove file extension
  title = title.replace(/\.[a-zA-Z0-9]+$/, '');
  // Replace underscores with spaces
  title = title.replace(/_/g, ' ').trim();
  return title || 'Untitled Photo';
}

/**
 * Fetch destination images from Wikimedia Commons Action API.
 * Returns clean, normalised image objects with thumbnail, full URL, creator, license, and source.
 *
 * @param {string} destination - City/place name (e.g. "Paris", "Manali")
 * @param {string} country - Country name (e.g. "France", "India")
 * @returns {Promise<Array>}
 */
export async function fetchDestinationImages(destination, country = '') {
  const cleanDest = (destination || '').replace(/["']/g, '').trim();
  const cleanCountry = (country || '').replace(/["']/g, '').trim();

  if (!cleanDest) return [];

  // Search query prioritizing photos of the destination
  const searchTerm = cleanCountry && cleanCountry.toLowerCase() !== cleanDest.toLowerCase()
    ? `${cleanDest} ${cleanCountry}`
    : cleanDest;

  const cacheKey = searchTerm.toLowerCase();
  const cached = cache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    return cached.data;
  }

  try {
    const response = await axios.get(WIKIMEDIA_COMMONS_API, {
      params: {
        action: 'query',
        generator: 'search',
        gsrsearch: `filetype:bitmap ${searchTerm}`,
        gsrnamespace: 6, // File namespace
        gsrlimit: 12,
        prop: 'imageinfo',
        iiprop: 'url|size|extmetadata|mime',
        iiurlwidth: 800, // scaled web-friendly thumbnail
        format: 'json'
      },
      headers: {
        'User-Agent': 'Sentry-Travel-Intelligence/1.0 (https://github.com/Lakshay-Gautam07/Sentry)'
      },
      timeout: 12000
    });

    const pages = response.data?.query?.pages;
    if (!pages) {
      cache.set(cacheKey, { data: [], timestamp: Date.now() });
      return [];
    }

    const items = Object.values(pages);
    // Sort by search index order
    items.sort((a, b) => (a.index || 0) - (b.index || 0));

    const normalized = [];
    const seenUrls = new Set();

    for (const page of items) {
      const info = page.imageinfo?.[0];
      if (!info || !info.url) continue;

      // Filter for standard image types (exclude pdfs, audio, etc.)
      const mime = info.mime || '';
      if (!mime.startsWith('image/')) continue;
      // Skip svg / icons / tiny flags if they slipped through
      if (mime === 'image/svg+xml' || (info.width && info.width < 300)) continue;

      const imageUrl = info.url;
      if (seenUrls.has(imageUrl)) continue;
      seenUrls.add(imageUrl);

      const meta = info.extmetadata || {};
      const creator = stripHtml(meta.Artist?.value || meta.Credit?.value);
      const license = meta.LicenseShortName?.value || meta.UsageTerms?.value || (meta.Copyrighted?.value === 'False' ? 'Public domain' : null);
      const licenseUrl = meta.LicenseUrl?.value || null;
      const description = stripHtml(meta.ImageDescription?.value);
      const objectName = stripHtml(meta.ObjectName?.value);

      normalized.push({
        id: String(page.pageid || normalized.length),
        title: objectName || cleanTitle(page.title),
        url: info.url,
        thumbUrl: info.thumburl || info.url,
        width: info.width || 0,
        height: info.height || 0,
        creator: creator || null,
        license: license || null,
        licenseUrl,
        sourceUrl: info.descriptionurl || `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title)}`,
        description: description || null
      });

      if (normalized.length >= 8) break;
    }

    cache.set(cacheKey, { data: normalized, timestamp: Date.now() });
    return normalized;
  } catch (error) {
    console.error(`[wikimediaService] Error fetching images for "${searchTerm}":`, error.message);
    if (cached) return cached.data;
    return [];
  }
}
