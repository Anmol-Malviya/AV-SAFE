import net from 'net';

/**
 * Checks if an IP string is a private, loopback, link-local, multicast, or reserved range.
 * Helps prevent SSRF.
 */
export function isPrivateOrReservedIP(ip) {
  if (!ip) return true;

  // IPv4 checks
  if (net.isIPv4(ip)) {
    const parts = ip.split('.').map((p) => parseInt(p, 10));
    if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
      return true;
    }

    // 0.0.0.0/8
    if (parts[0] === 0) return true;
    // 10.0.0.0/8
    if (parts[0] === 10) return true;
    // 127.0.0.0/8 (loopback)
    if (parts[0] === 127) return true;
    // 169.254.0.0/16 (link-local & AWS/GCP cloud metadata)
    if (parts[0] === 169 && parts[1] === 254) return true;
    // 172.16.0.0/12
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    // 192.168.0.0/16
    if (parts[0] === 192 && parts[1] === 168) return true;
    // 100.64.0.0/10 (Carrier-grade NAT)
    if (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) return true;
    // 192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24 (TEST-NET)
    if (parts[0] === 192 && parts[1] === 0 && parts[2] === 2) return true;
    if (parts[0] === 198 && parts[1] === 51 && parts[2] === 100) return true;
    if (parts[0] === 203 && parts[1] === 0 && parts[2] === 113) return true;
    // 224.0.0.0/4 (Multicast)
    if (parts[0] >= 224 && parts[0] <= 239) return true;
    // 240.0.0.0/4 (Reserved)
    if (parts[0] >= 240) return true;
    // 255.255.255.255 (Broadcast)
    if (ip === '255.255.255.255') return true;

    return false;
  }

  // IPv6 checks
  if (net.isIPv6(ip)) {
    const normalized = ip.toLowerCase();
    // ::1 loopback
    if (normalized === '::1' || normalized === '0:0:0:0:0:0:0:1') return true;
    // :: unspecified
    if (normalized === '::' || normalized === '0:0:0:0:0:0:0:0') return true;
    // Link-local fe80::/10
    if (normalized.startsWith('fe8') || normalized.startsWith('fe9') || normalized.startsWith('fea') || normalized.startsWith('feb')) return true;
    // Unique local fc00::/7
    if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true;
    // IPv4-mapped IPv6 (::ffff:x.x.x.x)
    if (normalized.includes('::ffff:')) {
      const v4Part = normalized.split('::ffff:')[1];
      if (v4Part && net.isIPv4(v4Part)) {
        return isPrivateOrReservedIP(v4Part);
      }
    }
    return false;
  }

  return true;
}

/**
 * Validates and normalizes an HTTP or HTTPS URL.
 * Rejects javascript:, file:, data:, blob:, ftp:, and invalid formats.
 */
export function validateAndNormalizeUrl(rawInput) {
  if (!rawInput || typeof rawInput !== 'string') {
    return { valid: false, error: 'URL is required and must be a string' };
  }

  const trimmed = rawInput.trim();
  if (trimmed.length > 2048) {
    return { valid: false, error: 'URL exceeds maximum length of 2048 characters' };
  }

  let urlToParse = trimmed;
  if (!/^https?:\/\//i.test(urlToParse)) {
    urlToParse = 'https://' + urlToParse;
  }

  let parsed;
  try {
    parsed = new URL(urlToParse);
  } catch {
    return { valid: false, error: 'Malformed URL' };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { valid: false, error: 'Only HTTP and HTTPS protocols are permitted' };
  }

  const hostname = parsed.hostname.toLowerCase();
  if (!hostname || hostname.length > 255) {
    return { valid: false, error: 'Invalid hostname in URL' };
  }

  // Block obvious internal hosts directly
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname === 'metadata.google.internal' ||
    hostname === '169.254.169.254'
  ) {
    return { valid: false, error: 'Access to local or internal metadata addresses is prohibited' };
  }

  return {
    valid: true,
    originalUrl: trimmed,
    normalizedUrl: parsed.toString(),
    hostname,
    protocol: parsed.protocol.replace(':', '')
  };
}

