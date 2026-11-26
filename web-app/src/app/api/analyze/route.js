import { NextResponse } from 'next/server';
import dns from 'dns';
import https from 'https';
import { validateAndNormalizeUrl, isPrivateOrReservedIP } from '@/lib/security/urlValidation';

// Helper to resolve DNS hostname with SSRF validation
function resolveDNS(hostname) {
  return new Promise((resolve) => {
    dns.lookup(hostname, { all: true }, (err, addresses) => {
      if (err || !addresses || addresses.length === 0) {
        resolve({
          active: false,
          ip: null,
          error: err ? err.code : 'NO_RECORDS',
          isPrivate: false
        });
      } else {
        const primary = addresses[0];
        const isPrivate = addresses.some((a) => isPrivateOrReservedIP(a.address));
        resolve({
          active: true,
          ip: primary.address,
          family: primary.family,
          allAddresses: addresses.map((a) => a.address),
          isPrivate
        });
      }
    });
  });
}

// Helper to get SSL Certificate details
function getSSLCertDetails(hostname, targetIp) {
  return new Promise((resolve) => {
    // If resolved IP is private/reserved, refuse SSL probe
    if (targetIp && isPrivateOrReservedIP(targetIp)) {
      return resolve({
        hasCert: false,
        error: 'Target host resolves to restricted/internal IP address. SSL inspection aborted for security.'
      });
    }

    let completed = false;

    const req = https.request({
      hostname,
      port: 443,
      method: 'GET',
      path: '/',
      rejectUnauthorized: true, // Validate TLS certificates properly
      timeout: 3500,
      agent: false
    }, (res) => {
      if (completed) return;
      completed = true;
      const cert = res.socket.getPeerCertificate(true);

      if (cert && Object.keys(cert).length > 0) {
        resolve({
          hasCert: true,
          issuer: cert.issuer?.O || cert.issuer?.CN || 'Unknown Issuer',
          subject: cert.subject?.CN || hostname,
          validFrom: cert.valid_from,
          validTo: cert.valid_to,
          fingerprint: cert.fingerprint,
          serialNumber: cert.serialNumber,
          isExpired: new Date() > new Date(cert.valid_to),
          isSelfSigned: cert.issuer?.CN === cert.subject?.CN
        });
      } else {
        resolve({ hasCert: false, error: 'No certificate details returned' });
      }
      req.destroy();
    });

    req.on('error', (err) => {
      if (completed) return;
      completed = true;
      // Distinguish TLS validation failures from general network errors
      resolve({
        hasCert: false,
        error: 'TLS verification failed: ' + (err.code || err.message)
      });
    });

    req.on('timeout', () => {
      if (completed) return;
      completed = true;
      resolve({ hasCert: false, error: 'Connection timeout' });
      req.destroy();
    });

    req.end();
  });
}

// Helper to analyze Page HTML for password fields / suspicious forms with SSRF protection
async function fetchAndAnalyzeHTML(validatedUrl, targetIp) {
  try {
    // If the resolved IP is private or restricted, abort remote fetch to prevent SSRF
    if (targetIp && isPrivateOrReservedIP(targetIp)) {
      return { success: false, error: 'Remote inspection blocked: target resolves to restricted/private IP' };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 sec timeout

    const response = await fetch(validatedUrl, {
      signal: controller.signal,
      redirect: 'manual', // do not blindly follow redirects to avoid SSRF hop to internal metadata
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 PhishGuard/1.0'
      }
    });

    clearTimeout(timeoutId);

    // If redirect, inspect redirect header safely
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      return {
        success: true,
        isRedirect: true,
        redirectLocation: location ? location.slice(0, 500) : null,
        title: 'Redirect Response',
        hasPasswordInput: false,
        loginFormsCount: 0,
        hasMetaRedirect: false,
        hasScriptRedirect: false,
        hasExternalForm: false
      };
    }

    if (!response.ok) {
      return { success: false, status: response.status };
    }

    // Limit read size to 512KB to prevent memory exhaustion
    const text = await response.text();
    const html = text.slice(0, 524288);

    // Extract Title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim().slice(0, 200) : 'No Title Found';

    // Count Forms and Password Inputs
    const hasPasswordInput = /<input[^>]*type=["']password["']/i.test(html);

    // Count login forms
    const loginFormsCount = (html.match(/<form[^>]*>/gi) || []).length;

    // Check for suspicious redirects in meta or script
    const hasMetaRedirect = /http-equiv=["']refresh["']/i.test(html);
    const hasScriptRedirect = /window\.location|document\.location|location\.replace/i.test(html);

    // Look for external form submission
    const hasExternalForm = /<form[^>]*action=["']https?:\/\/(?![^"'>]*\.?self\.domain)[^"'>]+["']/i.test(html);

    return {
      success: true,
      title,
      hasPasswordInput,
      loginFormsCount,
      hasMetaRedirect,
      hasScriptRedirect,
      hasExternalForm
    };
  } catch (e) {
    return { success: false, error: e.name === 'AbortError' ? 'Inspection timed out' : 'Unable to inspect page' };
  }
}

export async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
    }

    const { url } = body;
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const validation = validateAndNormalizeUrl(url);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { hostname, normalizedUrl } = validation;

    // First resolve DNS to obtain IP and verify SSRF safety
    const dnsResult = await resolveDNS(hostname);

    if (dnsResult.isPrivate) {
      return NextResponse.json(
        {
          hostname,
          error: 'Access to private or reserved IP address is forbidden for security reasons',
          dns: dnsResult,
          ssl: { hasCert: false, error: 'Restricted target' },
          page: { success: false, error: 'Restricted target' }
        },
        { status: 403 }
      );
    }

    // Run SSL and Page analysis safely
    const [sslResult, pageAnalysis] = await Promise.all([
      getSSLCertDetails(hostname, dnsResult.ip),
      fetchAndAnalyzeHTML(normalizedUrl, dnsResult.ip)
    ]);

    return NextResponse.json({
      hostname,
      dns: dnsResult,
      ssl: sslResult,
      page: pageAnalysis
    });
  } catch (err) {
    console.error('Error in deep scan API:', err);
    return NextResponse.json({ error: 'Internal server error processing analysis' }, { status: 500 });
  }
}
