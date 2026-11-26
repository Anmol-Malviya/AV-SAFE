import mongoose from 'mongoose';

export const INCIDENT_SEVERITY = ['P1', 'P2', 'P3', 'P4'];
export const INCIDENT_STATUS = [
  'OPEN',
  'ASSIGNED',
  'INVESTIGATING',
  'MITIGATED',
  'RESOLVED',
  'CLOSED',
  'FALSE_POSITIVE'
];

const IncidentTimelineEventSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      default: Date.now
    },
    actorId: {
      type: String,
      required: true
    },
    actorEmail: {
      type: String,
      default: ''
    },
    action: {
      type: String,
      required: true
    },
    note: {
      type: String,
      default: ''
    },
    previousStatus: String,
    newStatus: String
  },
  { _id: true }
);

const SecurityIncidentSchema = new mongoose.Schema(
  {
    incidentId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      maxlength: 255
    },
    severity: {
      type: String,
      enum: INCIDENT_SEVERITY,
      default: 'P3',
      index: true
    },
    status: {
      type: String,
      enum: INCIDENT_STATUS,
      default: 'OPEN',
      index: true
    },
    relatedComplaintId: {
      type: String,
      default: null,
      index: true
    },
    targetUrl: {
      type: String,
      default: ''
    },
    targetHostname: {
      type: String,
      default: '',
      index: true
    },
    assignedToId: {
      type: String,
      default: null,
      index: true
    },
    assignedToEmail: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    investigationNotes: {
      type: String,
      default: ''
    },
    evidenceUrls: {
      type: [String],
      default: []
    },
    slaBreached: {
      type: Boolean,
      default: false
    },
    slaDeadline: {
      type: Date
    },
    timeline: {
      type: [IncidentTimelineEventSchema],
      default: []
    },
    resolutionSummary: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

SecurityIncidentSchema.index({ createdAt: -1 });
SecurityIncidentSchema.index({ severity: 1, status: 1 });

export default mongoose.models.SecurityIncident || mongoose.model('SecurityIncident', SecurityIncidentSchema);
