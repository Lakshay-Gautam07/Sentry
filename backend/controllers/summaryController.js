import { generateAiSummary } from '../services/geminiService.js';
import { Summary } from '../models/Summary.js';
import { isDbConnected } from '../config/db.js';

function getDestinationKey(destination, country = '') {
  return `${(destination || '').trim()}_${(country || '').trim()}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

/**
 * Handle AI summary generation or retrieval.
 * Checks MongoDB cache first, then invokes Gemini service if needed.
 */
export async function getSummaryController(req, res) {
  const method = req.method;
  const destination = (
    method === 'POST'
      ? req.body?.destination
      : req.query?.destination || req.query?.name
  )?.trim();

  const country = (
    method === 'POST' ? req.body?.country : req.query?.country
  )?.trim() || '';

  const forceRefresh =
    method === 'POST'
      ? Boolean(req.body?.forceRefresh)
      : req.query?.forceRefresh === 'true';

  const weather = method === 'POST' ? req.body?.weather : null;
  const alerts = method === 'POST' ? req.body?.alerts : null;
  const news = method === 'POST' ? req.body?.news : null;

  if (!destination) {
    return res.status(400).json({
      success: false,
      message: 'Destination name is required to generate an AI summary.',
    });
  }

  const destKey = getDestinationKey(destination, country);

  // 1. Check MongoDB cache (if database is connected and not forcing refresh)
  if (!forceRefresh && isDbConnected()) {
    try {
      const cached = await Summary.findOne({ destinationKey: destKey });
      if (cached) {
        return res.status(200).json({
          success: true,
          destination,
          country,
          summary: {
            overview: cached.overview,
            safetyAssessment: cached.safetyAssessment,
            weatherOutlook: cached.weatherOutlook,
            recentDevelopments: cached.recentDevelopments,
            travelAdvice: cached.travelAdvice,
            sourcesUsed: cached.sourcesUsed,
            generatedAt: cached.generatedAt,
          },
          fromDatabase: true,
        });
      }
    } catch (dbErr) {
      console.warn('[summaryController] Error reading from MongoDB cache:', dbErr.message);
    }
  }

  // 2. Generate summary via Gemini AI service
  try {
    const generated = await generateAiSummary({
      destination,
      country,
      weather,
      alerts,
      news,
    });

    // 3. Save to MongoDB (if database is connected)
    if (isDbConnected()) {
      try {
        await Summary.findOneAndUpdate(
          { destinationKey: destKey },
          {
            destinationKey: destKey,
            destination,
            country,
            overview: generated.overview,
            safetyAssessment: generated.safetyAssessment,
            weatherOutlook: generated.weatherOutlook,
            recentDevelopments: generated.recentDevelopments,
            travelAdvice: generated.travelAdvice,
            sourcesUsed: generated.sourcesUsed,
            generatedAt: new Date(),
          },
          { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
        );
      } catch (saveErr) {
        console.warn('[summaryController] Error saving summary to MongoDB:', saveErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      destination,
      country,
      summary: {
        ...generated,
        generatedAt: new Date(),
      },
      fromDatabase: false,
    });
  } catch (err) {
    console.error('[summaryController] Error generating summary:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate AI travel summary.',
    });
  }
}
