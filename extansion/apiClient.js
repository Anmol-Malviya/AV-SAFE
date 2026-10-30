/**
 * AV-SAFE Extension API Client
 * Manages communication between the AV-SAFE Chrome Extension and the project/dashboard backend endpoints.
 */

export const DEFAULT_SERVER_URL = 'http://localhost:3000';

/**
 * Retrieve the configured server URL from chrome storage.
 * @returns {Promise<string>}
 */
export async function getServerUrl() {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['serverUrl'], (res) => {
        let url = res.serverUrl || DEFAULT_SERVER_URL;
        url = url.trim().replace(/\/+$/, '');
        resolve(url);
      });
    } else {
      resolve(DEFAULT_SERVER_URL);
    }
  });
}

/**
 * Save updated server URL in storage.
 * @param {string} url 
 * @returns {Promise<string>}
 */
export async function setServerUrl(url) {
  let cleanUrl = (url || DEFAULT_SERVER_URL).trim().replace(/\/+$/, '');
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = 'http://' + cleanUrl;
  }
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ serverUrl: cleanUrl }, () => resolve(cleanUrl));
    } else {
      resolve(cleanUrl);
    }
  });
}

/**
 * Check if the AV-SAFE backend server is reachable.
 * @param {string} [customUrl]
 * @returns {Promise<{ online: boolean, latencyMs: number, error?: string }>}
 */
export async function testServerConnection(customUrl) {
  const base = customUrl || (await getServerUrl());
  const start = performance.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  try {
    const res = await fetch(`${base}/api/history`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    const latencyMs = Math.round(performance.now() - start);

    if (res.ok) {
      return { online: true, latencyMs };
    } else {
      return { online: false, latencyMs, error: `HTTP ${res.status}` };
    }
  } catch (err) {
    clearTimeout(timeoutId);
    return {
      online: false,
      latencyMs: Math.round(performance.now() - start),
      error: err.name === 'AbortError' ? 'Connection timed out' : 'Server unreachable'
    };
  }
}

/**
 * Record a URL scan telemetry event to the project backend /api/history.
 * @param {Object} data 
 * @param {string} [customUrl]
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export async function logScanTelemetry(data, customUrl) {
  const base = customUrl || (await getServerUrl());
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  const reasons = Array.isArray(data.detectionReasons) 
    ? data.detectionReasons 
    : (Array.isArray(data.warnings) ? data.warnings.map(w => typeof w === 'string' ? w : `${w.title || 'Threat'}: ${w.desc || ''}`) : []);

  const payload = {
    url: data.url,
    rating: data.rating || 'SAFE',
    score: typeof data.score === 'number' ? data.score : 50,
    source: 'EXTENSION',
    detectionReasons: reasons
  };

  try {
    const res = await fetch(`${base}/api/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!res.ok) {
      return { success: false, error: `HTTP ${res.status}` };
    }
    const json = await res.json();
    return { success: true, data: json };
  } catch (err) {
    clearTimeout(timeoutId);
    return { success: false, error: err.message };
  }
}

/**
 * Perform server-side Deep Cloud Inspection (DNS resolution, SSL certificate & DOM audit).
 * @param {string} targetUrl 
 * @param {string} [customUrl]
 * @returns {Promise<{ success: boolean, data?: any, error?: string }>}
 */
export async function performDeepScan(targetUrl, customUrl) {
  const base = customUrl || (await getServerUrl());
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(`${base}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: targetUrl }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return { 
        success: false, 
        error: errJson.error || `Server responded with status ${res.status}` 
      };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    clearTimeout(timeoutId);
    return { 
      success: false, 
      error: err.name === 'AbortError' ? 'Scan timed out' : 'Backend analysis service unreachable' 
    };
  }
}

/**
 * Submit an incident report to SecOps through /api/complaints.
 * @param {Object} reportData 
 * @param {string} [customUrl]
 * @returns {Promise<{ success: boolean, complaintId?: string, status?: string, message?: string, error?: string }>}
 */
export async function submitIncidentComplaint(reportData, customUrl) {
  const base = customUrl || (await getServerUrl());
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  const reasons = Array.isArray(reportData.detectionReasons)
    ? reportData.detectionReasons
    : (Array.isArray(reportData.warnings) ? reportData.warnings.map(w => typeof w === 'string' ? w : `${w.title || 'Threat'}: ${w.desc || ''}`) : []);

  const idempotencyKey = reportData.idempotencyKey || 
    (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `ext-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`);

  const payload = {
    confirmed: true,
    originalUrl: reportData.url || reportData.originalUrl,
    category: reportData.category || 'PHISHING',
    description: reportData.description || 'Reported via AV-SAFE browser extension',
    detectionVerdict: reportData.detectionVerdict || reportData.rating || 'DANGEROUS',
    safetyScore: typeof reportData.safetyScore === 'number' ? reportData.safetyScore : (reportData.score ?? 10),
    detectionReasons: reasons,
    source: 'EXTENSION',
    idempotencyKey
  };

  try {
    const res = await fetch(`${base}/api/complaints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const json = await res.json();
    if (!res.ok) {
      return { success: false, error: json.error || `Submission failed (HTTP ${res.status})` };
    }

    return {
      success: true,
      complaintId: json.complaintId,
      status: json.status || 'REGISTERED',
      message: json.message || 'Report queued for security triage.'
    };
  } catch (err) {
    clearTimeout(timeoutId);
    return {
      success: false,
      error: err.name === 'AbortError' ? 'Submission timed out' : 'Could not contact AV-SAFE incident reporting endpoint'
    };
  }
}

/**
 * Fetch scan history records from the project backend.
 * @param {string} [customUrl]
 * @returns {Promise<Array<any>>}
 */
export async function fetchScanHistory(customUrl) {
  const base = customUrl || (await getServerUrl());
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  try {
    const res = await fetch(`${base}/api/history`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!res.ok) return [];
    const list = await res.json();
    return Array.isArray(list) ? list : [];
  } catch (err) {
    clearTimeout(timeoutId);
    return [];
  }
}

/**
 * Generate full dashboard URL for a specific tab or incident ID.
 * @param {string} [path] 
 * @param {string} [customUrl]
 * @returns {Promise<string>}
 */
export async function getDashboardUrl(path = '/system', customUrl) {
  const base = customUrl || (await getServerUrl());
  const cleanPath = path.startsWith('/') ? path : '/' + path;
  return `${base}${cleanPath}`;
}

