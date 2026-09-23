import dotenv from 'dotenv';

dotenv.config();

/**
 * Centralised config — reads environment variables and exports them.
 * Import from here instead of using process.env directly throughout the app.
 */
export const config = {
  get port() {
    return process.env.PORT || 5000;
  },
  get youtubeApiKey() {
    return process.env.YOUTUBE_API_KEY || '';
  },
  get geminiApiKey() {
    return process.env.GEMINI_API_KEY || '';
  },
  get mongodbUri() {
    return process.env.MONGODB_URI || '';
  },
};
