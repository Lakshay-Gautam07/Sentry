import { fetchGdacsAlerts } from '../services/gdacsService.js';
import { fetchSachetAlerts } from '../services/sachetService.js';

/**
 * GET /api/alerts?lat=&lon=&country=&countryCode=&region=&name=
 *
 * Fetches relevant safety alerts for a destination from GDACS (global) and,
 * for Indian destinations only, from SACHET India.
 *
 * Query params:
 *   lat         (required) - latitude
 *   lon         (required) - longitude
 *   country     (optional) - country name, e.g. "India"
 *   countryCode (optional) - ISO3 country code, e.g. "IND"
 *   region      (optional) - state/region name, e.g. "Himachal Pradesh"
 *   name        (optional) - city/place name, e.g. "Manali"
 */
export async function getAlertsController(req, res) {
  if (req.query.lat === undefined || req.query.lon === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Both "lat" and "lon" query parameters are required.',
    });
  }

  const lat = parseFloat(req.query.lat);
  const lon = parseFloat(req.query.lon);

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

  const country = typeof req.query.country === 'string' ? req.query.country.trim() : '';
  const countryCode = typeof req.query.countryCode === 'string' ? req.query.countryCode.trim() : '';
  const region = typeof req.query.region === 'string' ? req.query.region.trim() : '';
  const name = typeof req.query.name === 'string' ? req.query.name.trim() : '';

  const isIndia =
    country.toLowerCase() === 'india' || countryCode.toUpperCase() === 'IND';

  // Run GDACS always; run SACHET only for India — both in parallel
  const promises = [
    fetchGdacsAlerts(lat, lon, countryCode).catch((err) => {
      console.error('[alerts/gdacs] Error:', err.message);
      return { error: 'GDACS data temporarily unavailable.' };
    }),
    isIndia
      ? fetchSachetAlerts(region, name).catch((err) => {
          console.error('[alerts/sachet] Error:', err.message);
          return { error: 'SACHET data temporarily unavailable.' };
        })
      : Promise.resolve([]),
  ];

  const [gdacsResult, sachetResult] = await Promise.all(promises);

  const gdacsAlerts = Array.isArray(gdacsResult) ? gdacsResult : [];
  const sachetAlerts = Array.isArray(sachetResult) ? sachetResult : [];
  const gdacsError = !Array.isArray(gdacsResult) ? gdacsResult.error : null;
  const sachetError = !Array.isArray(sachetResult) ? sachetResult.error : null;

  const allAlerts = [...gdacsAlerts, ...sachetAlerts];

  return res.status(200).json({
    success: true,
    country,
    isIndia,
    count: allAlerts.length,
    alerts: allAlerts,
    sources: {
      gdacs: { count: gdacsAlerts.length, error: gdacsError ?? null },
      sachet: {
        used: isIndia,
        count: sachetAlerts.length,
        error: sachetError ?? null,
      },
    },
  });
}
