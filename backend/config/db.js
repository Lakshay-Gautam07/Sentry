import mongoose from 'mongoose';
import { config } from './index.js';

let isConnected = false;

/**
 * Connect to MongoDB Atlas using MONGODB_URI.
 * Ensures the connection string is never logged or exposed.
 * Gracefully handles connection failures without terminating the server.
 */
export async function connectDB() {
  const uri = config.mongodbUri;

  if (!uri) {
    console.warn('[MongoDB] MONGODB_URI is not set. Database caching will be disabled.');
    return false;
  }

  if (isConnected) {
    return true;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = conn.connection.readyState === 1;
    console.log('[MongoDB] Connected successfully to Atlas cluster.');

    mongoose.connection.on('error', (err) => {
      console.error('[MongoDB] Connection error event:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      console.warn('[MongoDB] Disconnected from Atlas cluster.');
    });

    return true;
  } catch (err) {
    console.warn('[MongoDB] Failed to connect to Atlas cluster:', err.message);
    isConnected = false;
    return false;
  }
}

export function isDbConnected() {
  return mongoose.connection.readyState === 1;
}
