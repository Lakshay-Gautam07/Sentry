import { fetchDestinationVideos } from '../services/youtubeService.js';

/**
 * GET /api/videos?destination=<name>&country=<country>
 * Returns relevant YouTube travel videos and guides for the destination.
 */
export async function getVideosController(req, res) {
  const destination = (req.query.destination || req.query.name || req.query.q || '').trim();
  const country = (req.query.country || '').trim();

  if (!destination) {
    return res.status(400).json({
      success: false,
      message: 'A destination name is required (e.g. ?destination=Paris).'
    });
  }

  try {
    const result = await fetchDestinationVideos(destination, country);

    return res.status(200).json({
      success: true,
      destination,
      count: result.count,
      videos: result.videos,
      fromCache: !!result.fromCache,
      quotaExceeded: !!result.quotaExceeded,
      missingKey: !!result.missingKey,
      message: result.message || result.error || undefined
    });
  } catch (err) {
    console.error('[youtubeController] Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching destination videos.'
    });
  }
}
