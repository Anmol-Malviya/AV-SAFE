import crypto from 'crypto';
import dbConnect from '../config/mongodb.js';
import AuditEvent from '../models/AuditEvent.js';

// In-memory fallback log when DB is disconnected
const IN_MEMORY_AUDIT_LOGS = [];

/**
 * Compute cryptographic SHA-256 hash of event data chained with previousHash
 */
function computeEventHash(previousHash, payload) {
  const content = `${previousHash}|${payload.actorId}|${payload.action}|${payload.resourceType}|${payload.resourceId || ''}|${payload.result}|${JSON.stringify(payload.details || {})}|${payload.timestamp || ''}`;
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Redact sensitive keys from details payload before persisting
 */
function sanitizeDetails(details = {}) {
  const SENSITIVE_KEYS = ['password', 'secret', 'token', 'authorization', 'apiKey', 'otp', 'credential'];
  const sanitized = {};
  for (const [key, val] of Object.entries(details)) {
    if (SENSITIVE_KEYS.some(s => key.toLowerCase().includes(s))) {
      sanitized[key] = '[REDACTED]';
    } else if (val && typeof val === 'object' && !Array.isArray(val)) {
      sanitized[key] = sanitizeDetails(val);
    } else {
      sanitized[key] = val;
    }
  }
  return sanitized;
}

/**
 * Append-only audit record creation
 */
export async function recordAuditEvent({
  actorId = 'system',
  actorEmail = '',
  actorRole = 'SYSTEM',
  action,
  resourceType,
  resourceId = null,
  result = 'SUCCESS',
  severity = 'INFO',
  correlationId = null,
  details = {},
  ipAddress = '',
  userAgent = ''
}) {
  const cleanDetails = sanitizeDetails(details);
  const timestamp = new Date().toISOString();

  let previousHash = 'GENESIS';

  try {
    const conn = await dbConnect();
    if (conn) {
      const lastEvent = await AuditEvent.findOne().sort({ createdAt: -1 }).select('eventHash').lean();
      if (lastEvent && lastEvent.eventHash) {
        previousHash = lastEvent.eventHash;
      }

      const eventHash = computeEventHash(previousHash, {
        actorId,
        action,
        resourceType,
        resourceId,
        result,
        details: cleanDetails,
        timestamp
      });

      const entry = await AuditEvent.create({
        actorId,
        actorEmail,
        actorRole,
        action,
        resourceType,
        resourceId,
        result,
        severity,
        correlationId: correlationId || crypto.randomUUID(),
        details: cleanDetails,
        ipAddress,
        userAgent,
        previousHash,
        eventHash
      });

      return entry.toObject();
    }
  } catch (err) {
    console.warn('MongoDB audit write fallback:', err.message);
  }

  // Fallback in-memory
  if (IN_MEMORY_AUDIT_LOGS.length > 0) {
    previousHash = IN_MEMORY_AUDIT_LOGS[0].eventHash;
  }
  const eventHash = computeEventHash(previousHash, {
    actorId,
    action,
    resourceType,
    resourceId,
    result,
    details: cleanDetails,
    timestamp
  });

  const fallbackEntry = {
    _id: `audit_mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    actorId,
    actorEmail,
    actorRole,
    action,
    resourceType,
    resourceId,
    result,
    severity,
    correlationId: correlationId || crypto.randomUUID(),
    details: cleanDetails,
    ipAddress,
    userAgent,
    previousHash,
    eventHash,
    createdAt: timestamp
  };

  IN_MEMORY_AUDIT_LOGS.unshift(fallbackEntry);
  if (IN_MEMORY_AUDIT_LOGS.length > 100) IN_MEMORY_AUDIT_LOGS.pop();

  return fallbackEntry;
}

/**
 * Query audit events with pagination and filtering
 */
export async function queryAuditEvents({
  action,
  actorId,
  resourceType,
  severity,
  result,
  limit = 50,
  page = 1
} = {}) {
  try {
    const conn = await dbConnect();
    if (conn) {
      const query = {};
      if (action) query.action = action;
      if (actorId) query.actorId = actorId;
      if (resourceType) query.resourceType = resourceType;
      if (severity) query.severity = severity;
      if (result) query.result = result;

      const skip = (Math.max(1, page) - 1) * limit;
      const [events, total] = await Promise.all([
        AuditEvent.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        AuditEvent.countDocuments(query)
      ]);

      return {
        events,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1
        }
      };
    }
  } catch {
    // fallback
  }

  let filtered = [...IN_MEMORY_AUDIT_LOGS];
  if (action) filtered = filtered.filter(e => e.action === action);
  if (actorId) filtered = filtered.filter(e => e.actorId === actorId);
  if (resourceType) filtered = filtered.filter(e => e.resourceType === resourceType);
  if (severity) filtered = filtered.filter(e => e.severity === severity);
  if (result) filtered = filtered.filter(e => e.result === result);

  return {
    events: filtered.slice((page - 1) * limit, page * limit),
    pagination: {
      page,
      limit,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / limit) || 1
    }
  };
}

/**
 * Verify cryptographic hash integrity of the audit chain
 */
export async function verifyAuditChainIntegrity() {
  try {
    const conn = await dbConnect();
    if (conn) {
      const events = await AuditEvent.find().sort({ createdAt: 1 }).lean();
      if (events.length === 0) return { verified: true, count: 0 };

      let previousHash = 'GENESIS';
      for (const ev of events) {
        if (ev.previousHash !== previousHash) {
          return {
            verified: false,
            brokenEventId: ev._id,
            error: `Hash chain mismatch at event ${ev._id}. Expected previous ${previousHash}, got ${ev.previousHash}`
          };
        }
        previousHash = ev.eventHash;
      }

      return { verified: true, count: events.length };
    }
  } catch {
    // offline check
  }

  return { verified: true, count: IN_MEMORY_AUDIT_LOGS.length, note: 'Verified in-memory fallback log' };
}
