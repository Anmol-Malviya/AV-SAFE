import { validateAndNormalizeUrl } from '../security/urlValidation.js';

export const ALLOWED_CATEGORIES = [
  'PHISHING',
  'MALWARE',
  'FAKE_LOGIN',
  'SCAM',
  'SUSPICIOUS_REDIRECT',
  'OTHER'
];

export const ALLOWED_VERDICTS = ['SAFE', 'SUSPICIOUS', 'DANGEROUS', 'UNKNOWN'];

export const ALLOWED_STATUSES = ['REGISTERED', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED'];

/**
 * Validates the payload for a new complaint submission.
 */
export function validateComplaintInput(body) {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid JSON request body' };
  }

  // Require explicit confirmation
  if (body.confirmed !== true && body.isConfirmed !== true) {
    return { valid: false, error: 'Explicit user confirmation is required to submit a complaint report' };
  }

  const { url, originalUrl } = body;
  const inputUrl = originalUrl || url;
  if (!inputUrl) {
    return { valid: false, error: 'Target URL is required' };
  }

  const urlCheck = validateAndNormalizeUrl(inputUrl);
  if (!urlCheck.valid) {
    return { valid: false, error: urlCheck.error };
  }

  // Category
  const category = (body.category || 'PHISHING').toUpperCase();
  if (!ALLOWED_CATEGORIES.includes(category)) {
    return { valid: false, error: `Invalid category. Allowed: ${ALLOWED_CATEGORIES.join(', ')}` };
  }

  // Description
  let description = '';
  if (body.description) {
    if (typeof body.description !== 'string') {
      return { valid: false, error: 'Description must be a string' };
    }
    description = body.description.trim().slice(0, 2000);
  }

  // Detection verdict
  let detectionVerdict = (body.detectionVerdict || body.rating || 'UNKNOWN').toUpperCase();
  if (!ALLOWED_VERDICTS.includes(detectionVerdict)) {
    detectionVerdict = 'UNKNOWN';
  }

  // Safety score: integer 0-100
  let safetyScore = 50;
  if (body.safetyScore !== undefined || body.score !== undefined) {
    const rawScore = body.safetyScore !== undefined ? body.safetyScore : body.score;
    const parsed = parseInt(rawScore, 10);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
      safetyScore = parsed;
    }
  }

  // Detection reasons: bounded array of sanitized strings
  let detectionReasons = [];
  if (Array.isArray(body.detectionReasons) || Array.isArray(body.warnings)) {
    const rawList = Array.isArray(body.detectionReasons) ? body.detectionReasons : body.warnings;
    detectionReasons = rawList
      .filter((r) => typeof r === 'string' && r.trim().length > 0)
      .map((r) => r.trim().slice(0, 300))
      .slice(0, 20); // at most 20 reasons
  }

  // Source
  const source = body.source === 'WEB_SCANNER' || body.source === 'EXTENSION' ? body.source : 'ANDROID_BROWSER';

  // Idempotency key
  const idempotencyKey = typeof body.idempotencyKey === 'string' ? body.idempotencyKey.trim().slice(0, 128) : null;

  return {
    valid: true,
    data: {
      originalUrl: urlCheck.originalUrl,
      normalizedUrl: urlCheck.normalizedUrl,
      hostname: urlCheck.hostname,
      category,
      description,
      detectionVerdict,
      safetyScore,
      detectionReasons,
      source,
      idempotencyKey,
      reporterType: 'GUEST',
      userId: null,
      userConfirmedAt: new Date()
    }
  };
}
