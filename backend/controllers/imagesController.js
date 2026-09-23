import { fetchDestinationImages } from '../services/wikimediaService.js';

/**
 * GET /api/images?destination=<name>&country=<country>
 * Returns relevant photographs of the destination from Wikimedia Commons with creator and license info.
 */
export async function getImagesController(req, res) {
  const destination = (req.query.destination || req.query.name || req.query.q || '').trim();
  const country = (req.query.country || '').trim();

  if (!destination) {
    return res.status(400).json({
      success: false,
      message: 'A destination name is required (e.g. ?destination=Paris).'
    });
  }

  try {
    const images = await fetchDestinationImages(destination, country);

    return res.status(200).json({
      success: true,
      destination,
      count: images.length,
      images
    });
  } catch (err) {
    console.error('[imagesController] Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching destination images.'
    });
  }
}
