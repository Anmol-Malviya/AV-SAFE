import mongoose from 'mongoose';

const WebhookDeliverySchema = new mongoose.Schema(
  {
    deliveryId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    endpointUrl: {
      type: String,
      required: true
    },
    event: {
      type: String,
      required: true,
      index: true
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILED', 'PENDING', 'RETRYING'],
      default: 'PENDING',
      index: true
    },
    responseCode: {
      type: Number,
      default: null
    },
    attempts: {
      type: Number,
      default: 0
    },
    maxAttempts: {
      type: Number,
      default: 3
    },
    nextRetryAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.models.WebhookDelivery || mongoose.model('WebhookDelivery', WebhookDeliverySchema);
