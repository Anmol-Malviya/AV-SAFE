import mongoose from 'mongoose';

export const MODEL_LIFECYCLE_STATES = [
  'DRAFT',
  'VALIDATING',
  'EVALUATED',
  'PENDING_APPROVAL',
  'APPROVED',
  'STAGING',
  'PRODUCTION',
  'ROLLED_BACK',
  'REJECTED'
];

const MLModelRegistrySchema = new mongoose.Schema(
  {
    modelId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    version: {
      type: String,
      required: true,
      index: true
    },
    algorithm: {
      type: String,
      default: 'SGDClassifier'
    },
    status: {
      type: String,
      enum: MODEL_LIFECYCLE_STATES,
      default: 'DRAFT',
      index: true
    },
    datasetVersion: {
      type: String,
      default: 'PhiUSIIL_235k_v1'
    },
    trainingSampleSize: {
      type: Number,
      default: 235795
    },
    featureCount: {
      type: Number,
      default: 24
    },
    artifactChecksum: {
      type: String,
      required: true
    },
    artifactPath: {
      type: String,
      default: 'ml/weights/phishing_model_weights.json'
    },
    metrics: {
      accuracy: { type: Number, default: 0.9943 },
      precision: { type: Number, default: 0.9991 },
      recall: { type: Number, default: 0.9876 },
      f1Score: { type: Number, default: 0.9933 },
      fpr: { type: Number, default: 0.0006 },
      fnr: { type: Number, default: 0.0124 },
      rocAuc: { type: Number, default: 0.999 }
    },
    confusionMatrix: {
      tp: { type: Number, default: 14890 },
      fp: { type: Number, default: 9 },
      tn: { type: Number, default: 20230 },
      fn: { type: Number, default: 21 }
    },
    driftScore: {
      type: Number,
      default: 0.02
    },
    approvedBy: {
      type: String,
      default: null
    },
    approvedAt: {
      type: Date,
      default: null
    },
    deployedAt: {
      type: Date,
      default: null
    },
    evaluationTimestamp: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

MLModelRegistrySchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.MLModelRegistry || mongoose.model('MLModelRegistry', MLModelRegistrySchema);
