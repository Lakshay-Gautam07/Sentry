import { isDbConnected } from '../config/db.js';

/**
 * GET /api/health
 * Returns a simple success response to confirm the server and database status.
 */
export const getHealth = (_req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Sentry API is up and running 🛡️',
    database: isDbConnected() ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
};
