import axios from 'axios';
import { config } from '../config/index.js';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const CANDIDATE_MODELS = ['gemini-3.8-flash', 'gemini-3.6-flash', 'gemini-flash-latest', 'gemini-pro-latest'];

/**
 * Build a fallback structured summary when Gemini API is unavailable or unconfigured.
 */
function buildDeterministicSummary(destination, country, weather, alerts, news) {
  const alertsCount = Array.isArray(alerts) ? alerts.length : (alerts?.count || 0);
  const newsCount = Array.isArray(news) ? news.length : 0;

  const currentTemp = weather?.current?.temperature !== undefined ? `${weather.current.temperature}°C` : null;
  const currentCond = weather?.current?.condition || null;

  let safetyLevel = 'Normal';
  let safetyNote = `No active disaster or safety alerts are reported for ${destination}.`;

  if (alertsCount > 0) {
    safetyLevel = 'Caution';
    const alertTitles = Array.isArray(alerts)
      ? alerts.map(a => a.title).slice(0, 2).join('; ')
      : (alerts?.alerts?.map(a => a.title).slice(0, 2).join('; ') || '');
    safetyNote = `Active alerts noted: ${alertTitles}`;
  }

  const weatherText = currentTemp && currentCond
    ? `Current conditions are ${currentCond.toLowerCase()} with a temperature of ${currentTemp}.`
    : 'Live weather updates are currently unavailable.';

  const newsText = newsCount > 0
    ? `Recent news includes: "${news[0]?.title || 'Recent reports'}" from ${news[0]?.source || 'local media'}.`
    : `No breaking or disruptive news events are reported for ${destination}.`;

  return {
    overview: `${destination}${country ? `, ${country}` : ''} currently reports ${safetyLevel.toLowerCase()} travel conditions. ${weatherText}`,
    safetyAssessment: {
      level: safetyLevel,
      note: safetyNote,
    },
    weatherOutlook: weatherText,
    recentDevelopments: newsText,
    travelAdvice: [
      `Pack appropriate clothing for ${currentCond || 'current seasonal weather'}.`,
      'Always keep local emergency contacts and travel insurance handy.',
      'Check local transportation schedules and venue timings in advance.'
    ],
    sourcesUsed: {
      weather: !!currentTemp,
      alerts: alertsCount > 0,
      news: newsCount > 0,
    }
  };
}

/**
 * Safely extract and parse JSON from model output.
 */
function extractJson(text) {
  if (!text) return null;
  const clean = text.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
  try {
    return JSON.parse(clean);
  } catch {
    const match = clean.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {}
    }
    return null;
  }
}

/**
 * Generate an AI Travel Summary using Google Gemini API.
 * Uses real gathered data: weather, alerts, news, and destination info.
 *
 * @param {Object} params
 * @param {string} params.destination
 * @param {string} params.country
 * @param {Object} [params.weather]
 * @param {Object|Array} [params.alerts]
 * @param {Array} [params.news]
 * @returns {Promise<Object>}
 */
export async function generateAiSummary({ destination, country, weather, alerts, news }) {
  const apiKey = config.geminiApiKey;

  if (!apiKey) {
    console.warn('[geminiService] GEMINI_API_KEY is not configured. Using deterministic summary.');
    return buildDeterministicSummary(destination, country, weather, alerts, news);
  }

  const cleanDest = (destination || '').trim();
  const cleanCountry = (country || '').trim();

  // Prepare concise context summary
  const alertsList = Array.isArray(alerts) ? alerts : (alerts?.alerts || []);
  const newsList = Array.isArray(news) ? news : [];

  const contextPayload = {
    destination: cleanDest,
    country: cleanCountry,
    currentWeather: weather?.current ? {
      temperature: weather.current.temperature,
      condition: weather.current.condition,
      humidity: weather.current.humidity,
      windSpeed: weather.current.windSpeed,
    } : 'Unavailable',
    forecast: weather?.daily ? weather.daily.slice(0, 3).map(d => ({
      date: d.date,
      maxTemp: d.maxTemp,
      minTemp: d.minTemp,
      condition: d.condition
    })) : 'Unavailable',
    activeAlerts: alertsList.length > 0 ? alertsList.map(a => ({
      title: a.title,
      type: a.type,
      severity: a.severity,
      source: a.source
    })) : 'No active alerts recorded',
    recentNews: newsList.length > 0 ? newsList.slice(0, 4).map(n => ({
      title: n.title,
      source: n.source,
      date: n.publishedAt
    })) : 'No recent news recorded'
  };

  const prompt = `You are Sentry AI, an intelligent travel safety and destination intelligence advisor.
Analyze the following real-time data for ${cleanDest}${cleanCountry ? `, ${cleanCountry}` : ''}:

${JSON.stringify(contextPayload, null, 2)}

Produce a concise, professional, structured AI Travel Summary adhering strictly to these rules:
1. Highlight important recent information (weather conditions, safety alerts, notable news).
2. Clearly distinguish sourced facts from general travel advice.
3. Never invent alerts, news, weather, or facts.
4. If information is unavailable or empty (e.g. no alerts, or no recent news), explicitly state that conditions are normal or that no alerts/news were reported.
5. Return ONLY a valid JSON object matching this schema (no markdown fences, no extra text):
{
  "overview": "2-3 sentences executive summary of travel feasibility and current situation.",
  "safetyAssessment": {
    "level": "Normal" | "Caution" | "Warning",
    "note": "Brief explanation based on the active alerts data."
  },
  "weatherOutlook": "Brief summary of current temperature, conditions, and upcoming forecast for travelers.",
  "recentDevelopments": "Brief summary of recent news, local developments, or confirmation that no disruptive events are active.",
  "travelAdvice": [
    "General practical travel tip 1 (labeled or framed as general advice)",
    "General practical travel tip 2",
    "General practical travel tip 3"
  ]
}`;

  let lastError = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const url = `${GEMINI_API_URL}/${model}:generateContent?key=${apiKey}`;
      const response = await axios.post(
        url,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            topP: 0.8,
            maxOutputTokens: 2048,
            responseMimeType: 'application/json',
          },
        },
        {
          timeout: 15000,
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) continue;

      const parsed = extractJson(rawText);
      if (!parsed) continue;

      return {
        overview: parsed.overview || `${cleanDest} travel overview.`,
        safetyAssessment: {
          level: ['Normal', 'Caution', 'Warning'].includes(parsed.safetyAssessment?.level)
            ? parsed.safetyAssessment.level
            : (alertsList.length > 0 ? 'Caution' : 'Normal'),
          note: parsed.safetyAssessment?.note || 'Safety conditions evaluated.',
        },
        weatherOutlook: parsed.weatherOutlook || 'Weather conditions assessed.',
        recentDevelopments: parsed.recentDevelopments || 'No significant developments.',
        travelAdvice: Array.isArray(parsed.travelAdvice) ? parsed.travelAdvice : [],
        sourcesUsed: {
          weather: weather?.current !== undefined,
          alerts: alertsList.length > 0,
          news: newsList.length > 0,
        },
      };
    } catch (err) {
      lastError = err;
      console.warn(`[geminiService] Model ${model} attempt error:`, err.response?.status || err.message);
      // Wait 500ms before trying the next model
      await new Promise(r => setTimeout(r, 500));
    }
  }

  console.warn('[geminiService] All Gemini candidate models failed. Falling back to deterministic summary. Last error:', lastError?.message);
  return buildDeterministicSummary(cleanDest, cleanCountry, weather, alerts, news);
}
