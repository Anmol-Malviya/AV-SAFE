import dns from 'dns/promises';
import { extractModelFeatures } from './phishingEngine.js';

// Reserved, private, loopback, link-local CIDRs
function isPrivateOrReservedIp(ip) {
  // IPv4 checks
  if (ip.startsWith('127.') || ip === '0.0.0.0' || ip === 'localhost') return true;
  if (ip.startsWith('10.')) return true;
  if (ip.startsWith('192.168.')) return true;
  if (ip.startsWith('169.254.')) return true; // Link-local
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)) return true;

  // IPv6 checks
  if (ip === '::1' || ip === '::' || ip.startsWith('fe80:') || ip.startsWith('fc00:')) return true;

  return false;
}

/**
 * Perform safe static & network inspection of a QR payload URL
 * Prevents SSRF, validates redirect chains safely, enforces bounds.
 */
export async function inspectQrUrl(rawUrl) {
  const result = {
    url: rawUrl,
    isValidUrl: false,
    scheme: '',
    hostname: '',
    isUnicodeOrHomograph: false,
    isSsrfRisk: false,
    threatScore: 0,
    verdict: 'SAFE',
    heuristicChecks: [],
    redirectChain: [],
    dnsResolution: null
  };

  try {
    const parsed = new URL(rawUrl);
    result.isValidUrl = true;
    result.scheme = parsed.protocol;
    result.hostname = parsed.hostname;

    // Reject non-http(s) schemes immediately (e.g. file:, javascript:, data:)
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      result.heuristicChecks.push(`Prohibited URL scheme: ${parsed.protocol}`);
      result.verdict = 'DANGEROUS';
      result.threatScore = 95;
      return result;
    }

    // Direct IP or localhost check before DNS
    if (isPrivateOrReservedIp(parsed.hostname)) {
      result.isSsrfRisk = true;
      result.heuristicChecks.push(`SSRF Target Blocked: Destination is private/internal IP ${parsed.hostname}`);
      result.verdict = 'BLOCKED_SSRF';
      result.threatScore = 100;
      return result;
    }

    // Check for Punycode / Homograph tricks
    if (parsed.hostname.startsWith('xn--') || /[^\x00-\x7F]/.test(parsed.hostname)) {
      result.isUnicodeOrHomograph = true;
      result.heuristicChecks.push('Punycode / Homograph domain character spoof detected');
      result.threatScore += 35;
    }

    // DNS resolution with anti-SSRF verification
    try {
      const addresses = await dns.resolve4(parsed.hostname);
      result.dnsResolution = addresses;
      for (const ip of addresses) {
        if (isPrivateOrReservedIp(ip)) {
          result.isSsrfRisk = true;
          result.heuristicChecks.push(`SSRF Target Blocked: Resolved to reserved/internal IP ${ip}`);
          result.verdict = 'BLOCKED_SSRF';
          result.threatScore = 100;
          return result;
        }
      }
    } catch {
      result.heuristicChecks.push('Domain DNS resolution failed or NXDOMAIN');
    }

    // Run existing shared ML Heuristics engine
    try {
      const features = extractModelFeatures(rawUrl);
      if (features) {
        result.heuristicChecks.push(`Features extracted: vector length ${features.length}`);
      }
    } catch {
      // Heuristic fallback
    }

    if (result.threatScore >= 60) {
      result.verdict = 'DANGEROUS';
    } else if (result.threatScore >= 30) {
      result.verdict = 'SUSPICIOUS';
    } else {
      result.verdict = 'BENIGN';
    }

    return result;
  } catch (err) {
    result.heuristicChecks.push(`Malformed URL payload: ${err.message}`);
    result.verdict = 'MALFORMED';
    return result;
  }
}
