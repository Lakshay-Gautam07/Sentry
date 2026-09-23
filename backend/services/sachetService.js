import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';

const SACHET_URL = 'https://sachet.ndma.gov.in/cap_public_website/rss/rss_india.xml';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '_',
  parseTagValue: true,
  trimValues: true,
});

/**
 * Fetch and parse the SACHET India RSS feed.
 * Returns alerts relevant to the given state/region.
 * Only call this for Indian destinations.
 *
 * @param {string} region  - Destination state/region (e.g. "Himachal Pradesh")
 * @param {string} name    - Destination city name (e.g. "Manali")
 * @returns {Promise<Array>} Normalised alert objects
 */
export async function fetchSachetAlerts(region, name) {
  const response = await axios.get(SACHET_URL, {
    timeout: 8000,
    headers: { Accept: 'application/xml, text/xml, */*' },
    responseType: 'text',
  });

  const parsed = parser.parse(response.data);
  const items = parsed?.rss?.channel?.item;
  if (!items) return [];

  const itemList = Array.isArray(items) ? items : [items];

  // Search terms: region name words + city name
  const searchTerms = [];
  if (region) {
    // Split "Himachal Pradesh" → ["Himachal", "Pradesh"] and include full form
    searchTerms.push(...region.split(/\s+/));
    searchTerms.push(region);
  }
  if (name) {
    searchTerms.push(name);
  }

  const lowerTerms = searchTerms
    .map((t) => t.toLowerCase())
    .filter((t) => t.length > 2); // avoid matching single letters / short noise

  // Filter items whose title mentions the destination's region or city
  const relevant = itemList.filter((item) => {
    const title = (item.title ?? '').toLowerCase();
    return lowerTerms.some((term) => title.includes(term));
  });

  // If no location-specific alerts found, return empty (not global India noise)
  if (relevant.length === 0) return [];

  return relevant.slice(0, 10).map((item) => {
    const title = item.title ?? 'SACHET Alert';
    const pubDate = item.pubDate ? new Date(item.pubDate).toISOString() : null;
    const author = item.author ?? null;
    const issuer = author ? author.replace(/^[^(]*\(([^)]+)\)$/, '$1') : null;

    return {
      id: String(item.guid?.['#text'] ?? item.guid ?? Math.random()),
      title,
      type: item.category ?? 'Government Alert',
      severity: null, // SACHET RSS does not expose severity level
      severityScore: 0,
      description: null,
      location: 'India',
      latitude: null,
      longitude: null,
      fromDate: pubDate,
      toDate: null,
      source: issuer ? `SACHET / ${issuer}` : 'SACHET India',
      link: item.link ?? SACHET_URL,
    };
  });
}
