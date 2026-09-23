/**
 * Centralised config — reads environment variables and exports them.
 * Import from here instead of using process.env directly throughout the app.
 */
export const config = {
  port: process.env.PORT || 5000,
  youtubeApiKey: process.env.YOUTUBE_API_KEY || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  mongodbUri: process.env.MONGODB_URI || '',
};
