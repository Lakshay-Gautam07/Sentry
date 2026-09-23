import { fetchDestinationNews } from '../services/gdeltService.js';

/**
 * GET /api/news?destination=<name>&country=<country>
 * Fetches recent news and articles for the selected destination from GDELT.
 */
export async function getNewsController(req, res) {
  const destination = (req.query.destination || req.query.name || req.query.q || '').trim();
  const country = (req.query.country || '').trim();

  if (!destination) {
    return res.status(400).json({
      success: false,
      message: 'A destination name is required (e.g. ?destination=Paris).'
    });
  }

  try {
    const result = await fetchDestinationNews(destination, country);

    return res.status(200).json({
      success: true,
      destination,
      count: result.articles ? result.articles.length : 0,
      articles: result.articles || [],
      fromCache: !!result.fromCache,
      rateLimited: !!result.rateLimited,
      error: result.error || null,
      message: result.rateLimited
        ? 'Provider rate limited; please refresh in a moment.'
        : result.error
        ? 'Could not reach news provider at this time.'
        : undefined
    });
  } catch (err) {
    console.error('[newsController] Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching destination news.'
    });
  }
}
