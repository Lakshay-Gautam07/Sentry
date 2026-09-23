import { searchDestinations } from '../services/geocodingService.js';

/**
 * GET /api/destinations/search?q=<query>
 * Returns a list of matching destinations from Open-Meteo Geocoding.
 */
export async function searchDestinationsController(req, res) {
  const query = req.query.q?.trim();

  // Validate query param
  if (!query) {
    return res.status(400).json({
      success: false,
      message: 'Query parameter "q" is required.',
    });
  }

  if (query.length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Query must be at least 2 characters long.',
    });
  }

  try {
    const destinations = await searchDestinations(query);

    if (destinations.length === 0) {
      return res.status(200).json({
        success: true,
        query,
        count: 0,
        results: [],
        message: 'No destinations found for the given query.',
      });
    }

    return res.status(200).json({
      success: true,
      query,
      count: destinations.length,
      results: destinations,
    });
  } catch (error) {
    console.error('[destinations/search] Error:', error.message);

    return res.status(502).json({
      success: false,
      message: 'Failed to fetch destinations. Please try again later.',
    });
  }
}
