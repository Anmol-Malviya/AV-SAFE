import mongoose from 'mongoose';

export const INDICATOR_TYPES = [
  'DOMAIN',
  'URL',
  'IP',
  'FILE_HASH',
  'EMAIL',
  'CERTIFICATE_FINGERPRINT'
];

export const INDICATOR_SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
export const LIST_TYPES = ['BLACKLIST', 'WHITELIST', 'WATCHLIST'];

const ThreatIndicatorSchema = new mongoose.Schema(
  {
    indicatorId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    type: {
      type: String,
      enum: INDICATOR_TYPES,
      required: true,
      index: true
    },
    value: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    normalizedValue: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true
    },
    listType: {
      type: String,
      enum: LIST_TYPES,
      default: 'BLACKLIST',
      index: true
    },
    confidenceScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 85
    },
    severity: {
      type: String,
      enum: INDICATOR_SEVERITIES,
      default: 'HIGH'
    },
    source: {
      type: String,
      default: 'SECOPS_INTERNAL',
      index: true
    },
    tags: {
      type: [String],
      default: []
    },
    threatActor: {
      type: String,
      default: 'UNKNOWN'
    },
    firstSeen: {
      type: Date,
      default: Date.now
    },
    lastSeen: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      default: null
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    createdBy: {
      type: String,
      default: 'system'
    }
  },
  {
    timestamps: true
  }
);

ThreatIndicatorSchema.index({ normalizedValue: 1, type: 1 }, { unique: true });
ThreatIndicatorSchema.index({ createdAt: -1 });

export default mongoose.models.ThreatIndicator || mongoose.model('ThreatIndicator', ThreatIndicatorSchema);
