import mongoose from 'mongoose';
import crypto from 'crypto';

const AuditEventSchema = new mongoose.Schema(
  {
    actorId: {
      type: String,
      required: true,
      index: true
    },
    actorEmail: {
      type: String,
      default: ''
    },
    actorRole: {
      type: String,
      required: true,
      index: true
    },
    action: {
      type: String,
      required: true,
      index: true
    },
    resourceType: {
      type: String,
      required: true,
      index: true
    },
    resourceId: {
      type: String,
      default: null,
      index: true
    },
    result: {
      type: String,
      enum: ['SUCCESS', 'FAILURE', 'DENIED'],
      default: 'SUCCESS',
      index: true
    },
    severity: {
      type: String,
      enum: ['INFO', 'WARNING', 'CRITICAL'],
      default: 'INFO',
      index: true
    },
    correlationId: {
      type: String,
      default: () => crypto.randomUUID(),
      index: true
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    ipAddress: {
      type: String,
      default: ''
    },
    userAgent: {
      type: String,
      default: ''
    },
    previousHash: {
      type: String,
      default: 'GENESIS'
    },
    eventHash: {
      type: String,
      required: true
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

// Prevent modifications and deletion on schema level
AuditEventSchema.pre('save', function (next) {
  if (!this.isNew) {
    return next(new Error('AuditEvent is strictly append-only. Updates are prohibited.'));
  }
  next();
});

AuditEventSchema.index({ createdAt: -1 });
AuditEventSchema.index({ actorId: 1, createdAt: -1 });
AuditEventSchema.index({ resourceType: 1, resourceId: 1 });

export default mongoose.models.AuditEvent || mongoose.model('AuditEvent', AuditEventSchema);
