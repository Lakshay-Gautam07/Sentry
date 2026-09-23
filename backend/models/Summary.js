import mongoose from 'mongoose';

const summarySchema = new mongoose.Schema(
  {
    destinationKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    destination: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      default: '',
      trim: true,
    },
    overview: {
      type: String,
      required: true,
    },
    safetyAssessment: {
      level: {
        type: String,
        enum: ['Normal', 'Caution', 'Warning'],
        default: 'Normal',
      },
      note: {
        type: String,
        default: '',
      },
    },
    weatherOutlook: {
      type: String,
      default: '',
    },
    recentDevelopments: {
      type: String,
      default: '',
    },
    travelAdvice: {
      type: [String],
      default: [],
    },
    sourcesUsed: {
      weather: { type: Boolean, default: false },
      alerts: { type: Boolean, default: false },
      news: { type: Boolean, default: false },
    },
    generatedAt: {
      type: Date,
      default: Date.now,
      expires: 86400, // 24-hour TTL in MongoDB
    },
  },
  {
    timestamps: true,
  }
);

export const Summary = mongoose.model('Summary', summarySchema);
