/**
 * GET /api/health
 * Returns a simple success response to confirm the server is alive.
 */
export const getHealth = (_req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Sentry API is up and running 🛡️',
    timestamp: new Date().toISOString(),
  });
};
