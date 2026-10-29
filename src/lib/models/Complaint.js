import mongoose from 'mongoose';

const ComplaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    userId: {
      type: String,
      default: null,
      index: true
    },
    reporterType: {
      type: String,
      enum: ['AUTHENTICATED', 'GUEST'],
      default: 'GUEST',
      required: true
    },
    source: {
      type: String,
      enum: ['ANDROID_BROWSER', 'WEB_SCANNER', 'EXTENSION'],
      default: 'ANDROID_BROWSER',
      required: true
    },
    originalUrl: {
      type: String,
      required: true,
      maxlength: 2048
    },
    normalizedUrl: {
      type: String,
      required: true,
      maxlength: 2048
    },
    hostname: {
      type: String,
      required: true,
      maxlength: 255,
      index: true
    },
    category: {
      type: String,
      enum: ['PHISHING', 'MALWARE', 'FAKE_LOGIN', 'SCAM', 'SUSPICIOUS_REDIRECT', 'OTHER'],
      default: 'PHISHING',
      required: true,
      index: true
    },
    description: {
      type: String,
      maxlength: 2000,
      default: ''
    },
    detectionVerdict: {
      type: String,
      enum: ['SAFE', 'SUSPICIOUS', 'DANGEROUS', 'UNKNOWN'],
      required: true,
      index: true
    },
    safetyScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    detectionReasons: {
      type: [String],
      default: []
    },
    engineVersion: {
      type: String,
      default: '1.0.0'
    },
    detectedAt: {
      type: Date,
      default: Date.now
    },
    userConfirmedAt: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['REGISTERED', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED'],
      default: 'REGISTERED',
      index: true
    },
    adminNotes: {
      type: String,
      maxlength: 3000,
      default: ''
    },
    clientIp: {
      type: String,
      default: null
    },
    idempotencyKey: {
      type: String,
      default: null,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Compound index for efficient dashboard querying
ComplaintSchema.index({ status: 1, createdAt: -1 });
ComplaintSchema.index({ hostname: 1, createdAt: -1 });

export default mongoose.models.Complaint || mongoose.model('Complaint', ComplaintSchema);

