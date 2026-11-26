import mongoose from 'mongoose';

const ApiCredentialSchema = new mongoose.Schema(
  {
    keyId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: true
    },
    keyPrefix: {
      type: String,
      required: true
    },
    hashedSecret: {
      type: String,
      required: true
    },
    ownerId: {
      type: String,
      required: true,
      index: true
    },
    scopes: {
      type: [String],
      default: ['scan:read', 'telemetry:read']
    },
    rateLimitPerMin: {
      type: Number,
      default: 120
    },
    totalRequests: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    expiresAt: {
      type: Date,
      default: null
    },
    lastUsedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.models.ApiCredential || mongoose.model('ApiCredential', ApiCredentialSchema);
