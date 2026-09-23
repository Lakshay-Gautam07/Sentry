import axios from 'axios';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';

/**
 * Fetch destination results from Open-Meteo Geocoding API.
 * @param {string} query - The destination name to search for.
 * @returns {Promise<Array>} Normalised destination objects.
 */
export async function searchDestinations(query) {
  const response = await axios.get(GEOCODING_URL, {
    params: {
      name: query,
      count: 10,
      language: 'en',
      format: 'json',
    },
    timeout: 8000,
  });

  const results = response.data?.results;

  if (!results || results.length === 0) {
    return [];
  }

  // Normalise — only expose what the app needs now and in future phases
  return results.map((place) => ({
    id: place.id,
    name: place.name,
    country: place.country ?? null,
    countryCode: place.country_code ?? null,
    region: place.admin1 ?? null,       // state / region / province
    latitude: place.latitude,
    longitude: place.longitude,
    timezone: place.timezone ?? null,
    elevation: place.elevation ?? null,
  }));
}
