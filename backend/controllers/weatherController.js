import { fetchWeather } from '../services/weatherService.js';

/**
 * GET /api/weather?lat=<lat>&lon=<lon>
 * Returns normalised current + hourly + daily weather for a coordinate pair.
 */
export async function getWeatherController(req, res) {
  const lat = parseFloat(req.query.lat);
  const lon = parseFloat(req.query.lon);

  // Validate coordinates
  if (req.query.lat === undefined || req.query.lon === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Both "lat" and "lon" query parameters are required.',
    });
  }

  if (isNaN(lat) || isNaN(lon)) {
    return res.status(400).json({
      success: false,
      message: 'Latitude and longitude must be valid numbers.',
    });
  }

  if (lat < -90 || lat > 90) {
    return res.status(400).json({
      success: false,
      message: 'Latitude must be between -90 and 90.',
    });
  }

  if (lon < -180 || lon > 180) {
    return res.status(400).json({
      success: false,
      message: 'Longitude must be between -180 and 180.',
    });
  }

  try {
    const weather = await fetchWeather(lat, lon);

    return res.status(200).json({
      success: true,
      latitude: lat,
      longitude: lon,
      weather,
    });
  } catch (error) {
    console.error('[weather] Error:', error.message);

    return res.status(502).json({
      success: false,
      message: 'Failed to fetch weather data. Please try again later.',
    });
  }
}
