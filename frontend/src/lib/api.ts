import axios from 'axios';

const PRODUCTION_API_URL = 'https://sentry-6af5.onrender.com';

/**
 * Resolves the backend base URL safely.
 * - On deployed production hosts (e.g. Vercel, Render), NEVER allows localhost:5000.
 * - On local development (localhost / 127.0.0.1), allows local backend fallback.
 */
function resolveBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocalhost =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '[::1]' ||
      hostname.endsWith('.local');

    if (!isLocalhost) {
      const configured = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
      if (
        configured &&
        configured.length > 0 &&
        !configured.includes('localhost') &&
        !configured.includes('127.0.0.1')
      ) {
        return configured.replace(/\/+$/, '');
      }
      return PRODUCTION_API_URL;
    }

    const localConfigured = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
    if (localConfigured && localConfigured.length > 0) {
      return localConfigured.replace(/\/+$/, '');
    }
    return 'http://localhost:5000';
  }

  if (import.meta.env.DEV) {
    return 'http://localhost:5000';
  }
  return PRODUCTION_API_URL;
}

const baseURL = resolveBaseUrl();

const api = axios.create({
  baseURL,
  timeout: 20000,
});

export default api;
