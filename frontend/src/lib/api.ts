import axios from 'axios';

// All backend calls go through this base URL — never call external APIs directly from the frontend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000',
  timeout: 10000,
});

export default api;
