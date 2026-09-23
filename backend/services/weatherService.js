import axios from 'axios';

const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';

/**
 * WMO Weather Code → human-readable description + emoji
 * Based on: https://open-meteo.com/en/docs#weathervariables
 */
function describeWeatherCode(code) {
  const codes = {
    0:  { label: 'Clear sky',              emoji: '☀️' },
    1:  { label: 'Mainly clear',           emoji: '🌤️' },
    2:  { label: 'Partly cloudy',          emoji: '⛅' },
    3:  { label: 'Overcast',               emoji: '☁️' },
    45: { label: 'Fog',                    emoji: '🌫️' },
    48: { label: 'Icy fog',                emoji: '🌫️' },
    51: { label: 'Light drizzle',          emoji: '🌦️' },
    53: { label: 'Drizzle',                emoji: '🌦️' },
    55: { label: 'Heavy drizzle',          emoji: '🌧️' },
    61: { label: 'Light rain',             emoji: '🌧️' },
    63: { label: 'Rain',                   emoji: '🌧️' },
    65: { label: 'Heavy rain',             emoji: '🌧️' },
    71: { label: 'Light snow',             emoji: '🌨️' },
    73: { label: 'Snow',                   emoji: '❄️' },
    75: { label: 'Heavy snow',             emoji: '❄️' },
    77: { label: 'Snow grains',            emoji: '🌨️' },
    80: { label: 'Light showers',          emoji: '🌦️' },
    81: { label: 'Showers',               emoji: '🌧️' },
    82: { label: 'Violent showers',        emoji: '⛈️' },
    85: { label: 'Snow showers',           emoji: '🌨️' },
    86: { label: 'Heavy snow showers',     emoji: '❄️' },
    95: { label: 'Thunderstorm',           emoji: '⛈️' },
    96: { label: 'Thunderstorm w/ hail',   emoji: '⛈️' },
    99: { label: 'Thunderstorm w/ heavy hail', emoji: '⛈️' },
  };
  return codes[code] ?? { label: 'Unknown', emoji: '🌡️' };
}

/**
 * Wind direction degrees → compass label
 */
function windDirection(deg) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

/**
 * Fetch and normalise weather for a coordinate pair.
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<Object>} Normalised weather object.
 */
export async function fetchWeather(lat, lon) {
  const response = await axios.get(WEATHER_URL, {
    params: {
      latitude: lat,
      longitude: lon,
      current: [
        'temperature_2m',
        'relative_humidity_2m',
        'apparent_temperature',
        'weather_code',
        'wind_speed_10m',
        'wind_direction_10m',
      ].join(','),
      hourly: [
        'temperature_2m',
        'weather_code',
        'precipitation_probability',
      ].join(','),
      daily: [
        'weather_code',
        'temperature_2m_max',
        'temperature_2m_min',
        'sunrise',
        'sunset',
        'precipitation_probability_max',
      ].join(','),
      timezone: 'auto',
      forecast_days: 5,
    },
    timeout: 8000,
  });

  const d = response.data;
  const cur = d.current;
  const currentCondition = describeWeatherCode(cur.weather_code);

  // Build next 24 hours of hourly data (starting from current hour index)
  const now = new Date();
  const currentHourISO = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:00`;
  const hourlyTimes = d.hourly.time;
  const startIdx = Math.max(0, hourlyTimes.findIndex((t) => t >= currentHourISO));
  const next24 = hourlyTimes.slice(startIdx, startIdx + 24).map((time, i) => {
    const idx = startIdx + i;
    const cond = describeWeatherCode(d.hourly.weather_code[idx]);
    return {
      time,
      temperature: d.hourly.temperature_2m[idx],
      weatherCode: d.hourly.weather_code[idx],
      condition: cond.label,
      emoji: cond.emoji,
      precipitationProbability: d.hourly.precipitation_probability[idx],
    };
  });

  // 5-day daily forecast
  const daily = d.daily.time.map((date, i) => {
    const cond = describeWeatherCode(d.daily.weather_code[i]);
    return {
      date,
      weatherCode: d.daily.weather_code[i],
      condition: cond.label,
      emoji: cond.emoji,
      tempMax: d.daily.temperature_2m_max[i],
      tempMin: d.daily.temperature_2m_min[i],
      sunrise: d.daily.sunrise[i],
      sunset: d.daily.sunset[i],
      precipitationProbabilityMax: d.daily.precipitation_probability_max[i],
    };
  });

  return {
    timezone: d.timezone,
    timezoneAbbreviation: d.timezone_abbreviation,
    elevation: d.elevation,
    current: {
      time: cur.time,
      temperature: cur.temperature_2m,
      apparentTemperature: cur.apparent_temperature,
      humidity: cur.relative_humidity_2m,
      weatherCode: cur.weather_code,
      condition: currentCondition.label,
      emoji: currentCondition.emoji,
      windSpeed: cur.wind_speed_10m,
      windDirection: windDirection(cur.wind_direction_10m),
      windDegrees: cur.wind_direction_10m,
    },
    hourly: next24,
    daily,
  };
}
