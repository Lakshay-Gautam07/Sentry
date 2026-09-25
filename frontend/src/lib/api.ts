import axios from 'axios';

// All backend calls go through this base URL — never call external APIs directly from the frontend
const rawBaseUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
const baseURL = rawBaseUrl && rawBaseUrl.length > 0
  ? rawBaseUrl.replace(/\/+$/, '')
  : (import.meta.env.PROD ? 'https://sentry-6af5.onrender.com' : 'http://localhost:5000');

const api = axios.create({
  baseURL,
  timeout: 20000,
});

export default api;
