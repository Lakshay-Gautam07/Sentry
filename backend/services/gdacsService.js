import axios from 'axios';

const GDACS_URL = 'https://www.gdacs.org/gdacsapi/api/Events/geteventlist/search';

// Radius in degrees (~111 km per degree) used for proximity matching
const PROXIMITY_DEGREES = 5; // ~550 km — wide enough for regional events

const EVENT_TYPE_LABELS = {
  EQ: 'Earthquake',
  TC: 'Tropical Cyclone',
  FL: 'Flood',
  VO: 'Volcano',
  DR: 'Drought',
  WF: 'Wildfire',
  TS: 'Tsunami',
};

const ALERT_LEVEL_ORDER = { Red: 3, Orange: 2, Green: 1 };

/**
 * Calculate great-circle distance between two lat/lon points (Haversine).
 * Returns distance in kilometres.
 */
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Fetch GDACS events for all major categories and filter those near the destination.
 * @param {number} lat - Destination latitude
 * @param {number} lon - Destination longitude
 * @param {string} countryCode - ISO3 country code for country-level matching
 * @returns {Promise<Array>} Normalised alert objects
 */
export async function fetchGdacsAlerts(lat, lon, countryCode) {
  // Build a date range: last 30 days
  const toDate = new Date();
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - 30);
  const fmt = (d) => d.toISOString().split('T')[0];

  const eventTypes = ['EQ', 'TC', 'FL', 'VO', 'DR', 'WF'];
  const alertLevels = ['Green', 'Orange', 'Red'];

  // Build all requests but run them concurrently
  const requests = eventTypes.flatMap((eventtype) =>
    alertLevels.map((alertlevel) =>
      axios
        .get(GDACS_URL, {
          params: {
            eventtype,
            alertlevel,
            fromdate: fmt(fromDate),
            todate: fmt(toDate),
            pagesize: 50,
          },
          timeout: 8000,
          headers: { Accept: 'application/json' },
        })
        .then((r) => r.data?.features ?? [])
        .catch(() => []) // silently drop failed sub-requests
    )
  );

  const allFeatureArrays = await Promise.all(requests);
  const allFeatures = allFeatureArrays.flat();

  if (allFeatures.length === 0) return [];

  // Filter: keep events that are geographically close OR in the same country
  const relevant = allFeatures.filter((f) => {
    const props = f.properties ?? {};
    const coords = f.geometry?.coordinates;

    // Country-level match
    if (
      countryCode &&
      props.iso3 &&
      props.iso3.toUpperCase() === countryCode.toUpperCase()
    ) {
      return true;
    }

    // Check affected countries
    if (
      countryCode &&
      Array.isArray(props.affectedcountries) &&
      props.affectedcountries.some(
        (c) => c.iso3?.toUpperCase() === countryCode.toUpperCase()
      )
    ) {
      return true;
    }

    // Proximity match (when coordinates available)
    if (Array.isArray(coords) && coords.length >= 2) {
      const [evLon, evLat] = coords;
      const distKm = haversineKm(lat, lon, evLat, evLon);
      if (distKm <= 550) return true; // ~5 degree radius
    }

    return false;
  });

  // Normalise and deduplicate by eventid
  const seen = new Set();
  const normalised = [];

  for (const f of relevant) {
    const props = f.properties ?? {};
    const key = `${props.eventid}-${props.episodeid}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const coords = f.geometry?.coordinates;
    normalised.push({
      id: key,
      title: props.name ?? props.description ?? 'GDACS Alert',
      type: EVENT_TYPE_LABELS[props.eventtype] ?? props.eventtype ?? 'Disaster',
      severity: props.alertlevel ?? null,
      severityScore: ALERT_LEVEL_ORDER[props.alertlevel] ?? 0,
      description: props.htmldescription?.replace(/<[^>]+>/g, '').trim() ?? null,
      location: props.country || null,
      latitude: coords?.[1] ?? null,
      longitude: coords?.[0] ?? null,
      fromDate: props.fromdate ?? null,
      toDate: props.todate ?? null,
      source: 'GDACS',
      link: props.url?.report ?? `https://www.gdacs.org/report.aspx?eventid=${props.eventid}&eventtype=${props.eventtype}`,
    });
  }

  // Sort: Red > Orange > Green, then by most recent
  normalised.sort((a, b) => {
    if (b.severityScore !== a.severityScore) return b.severityScore - a.severityScore;
    return new Date(b.fromDate ?? 0) - new Date(a.fromDate ?? 0);
  });

  return normalised.slice(0, 10); // cap at 10 results
}
